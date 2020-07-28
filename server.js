// dependencies
const mime = require("mime");
const Jimp = require("jimp");
const multer = require("multer");
const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");
const CronJob = require("cron").CronJob;
const nodeMailer = require("nodemailer");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
// files
const users = require("./api/users");
const login = require("./api/login");
const views = require("./api/views");
const likes = require("./api/likes");
const signUp = require("./api/signUp");
const stream = require("./api/stream");
const confirm = require("./api/confirm");
const recover = require("./api/recover");
const sockets = require("./api/sockets");
const settings = require("./api/settings");
const comments = require("./api/comments");
const torrents = require("./api/torrents");
const scrap_machine = require("./scripts/search");

// const
const app = express();
const port = process.env.PORT || 5000;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./client/src/assets/photos/");
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(
        null,
        raw.toString("hex") +
          Date.now() +
          "." +
          mime.getExtension(file.mimetype)
      );
    });
  },
});
const sessionConfig = {
  secret: "mysecretsshhh",
  name: "hypertube",
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "none",
    secure: "true",
    domain: "localhost",
  },
};

// socket server to track download
const server = require("http")
  .createServer(app)
  .listen(port, () =>
    console.log(`Hypertube server + socket listening on port ${port}`)
  );

const io = require("socket.io").listen(server);
sockets.initSocket(io);

// allow to use static path for files
app.use(express.static("client"));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  next();
});

// config
app.use(session(sessionConfig));

// avoid xss
app.disable("x-powered-by");

// parsing cookie
app.use(cookieParser());

// needed to read and parse some responses
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));

// stream
app.use("/stream", stream);

const sendMail = (receiver, type, random) => {
  return new Promise(function (resolve, reject) {
    if (type && (type === 1 || type === 2) && receiver && random) {
      let subject;
      let text;
      subject = type === 1 ? "Welcome to Hypertube!" : "Recover your password!";
      text =
        type === 1
          ? "Please click the link below to confirm your account creation: " +
            random
          : "Please use the following password to login, don't forget to change it: " +
            random;
      const transporter = nodeMailer.createTransport({
        port: 25,
        host: "localhost",
        tls: {
          rejectUnauthorized: false,
        },
        service: "Gmail",
        auth: {
          user: "hypertube.no.reply42@gmail.com",
          pass: "Hypertube_42",
        },
      });
      var message = {
        from: "hypertube.no.reply42@gmail.com",
        to: receiver,
        subject: subject,
        text: text,
      };

      transporter.sendMail(message, (error, info) => {
        if (error) {
          resolve(error);
        } else {
          resolve(true);
        }
      });
    } else {
      resolve(false);
    }
  });
};

const job = new CronJob("0 */12 * * *", () => {
  console.log("Starting cleanup maintenance...");
  torrents
    .doCleanUpMaintenance()
    .then((response) => {
      if (response.updated) {
        console.log(`${response.updated} torrents updated. ${response.msg}`);
      } else {
        console.log(`${response.updated} torrents updated. ${response.msg}`);
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

job.start();

// Check if the token is valid, needed for react router
app.get("/api/checkToken", (req, res) => {
  const token = req.cookies._hypertubeAuth;
  if (!token) {
    res.send({ status: false });
  } else {
    jwt.verify(token, sessionConfig.secret, function (err, decoded) {
      if (err) {
        res.send({ status: false });
      } else {
        login
          .checkToken({
            token: req.cookies._hypertubeAuth,
          })
          .then((response) => {
            if (response.token === true) {
              res.send({ status: true, id: response.id });
            } else {
              res.send({ status: false });
            }
          })
          .catch((error) => {
            res.status(500).send(error);
          });
      }
    });
  }
});

// Clear token and set connected state to false
app.get("/api/logout", (req, res) => {
  login
    .unsetLoggedUser({
      isLogged: false,
      token: req.cookies._hypertubeAuth,
    })
    .then((result) => {
      if (result.logout === true) {
        res.status(200).clearCookie("_hypertubeAuth", {
          path: "/",
        });
        res.send({ status: true });
      } else {
        res.send(result);
      }
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Post login and return a token to save the session if it went through
app.post("/api/login", (req, res) => {
  login
    .logUser(req.body)
    .then((response) => {
      if (response.logged && res.statusCode === 200) {
        const token = jwt.sign({ login }, sessionConfig.secret, {
          expiresIn: "24h",
        });
        login
          .setLoggedUser({
            login: req.body.login,
            isLogged: true,
            token: token,
          })
          .then((setLogged) => {
            if (setLogged.login) {
              res.cookie("_hypertubeAuth", token, { httpOnly: true });
              res.send({
                login: true,
                id: response.id,
              });
            } else {
              res.send(setLogged);
            }
          });
      } else {
        res.send({ login: response });
      }
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Post create account user
app.post("/api/signUp", (req, res) => {
  const upload = multer({
    storage: storage,
  }).single("file");
  upload(req, res, function (err) {
    if (!req.file) {
      res.status(200).send({ edit: { msg: "No files uploaded." } });
    } else {
      signUp
        .userSignUp({
          photo: req.file.filename,
          username: req.body.username,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: req.body.password,
          confirmedPassword: req.body.confirmedPassword,
        })
        .then((response) => {
          if (response.signup) {
            sendMail(
              req.body.email,
              1,
              "http://localhost:3000/confirm?r=" +
                response.random +
                "&u=" +
                req.body.username +
                "&e=" +
                req.body.email
            )
              .then((result) => {
                if (result) {
                  let uploadedImg = req.file.path;
                  Jimp.read(uploadedImg)
                    .then(function (image) {
                      image
                        .resize(200, Jimp.AUTO)
                        .quality(80)
                        .write(uploadedImg);
                    })
                    .catch(function (err) {
                      console.error(err);
                    });
                  res.status(200).send({ signup: { signup: response.signup } });
                } else {
                  res
                    .status(200)
                    .send({ signup: { msg: "Unable to send email." } });
                }
              })
              .catch((error) => {
                res
                  .status(200)
                  .send({ signup: { msg: "Unable to send email." } });
              });
          } else {
            res
              .status(200)
              .send({ signup: { msg: "Unable to create account." } });
          }
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    }
  });
});

// Confirm user account
app.post("/api/confirm/account", (req, res) => {
  confirm
    .usrAccount({ req: req.body })
    .then((response) => {
      res.status(200).send({ confirm: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Get user infos
app.post("/api/users/get", (req, res) => {
  users
    .getUserInfos({ req: req.body })
    .then((response) => {
      res.status(200).send({ users: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Get torrents search query
app.post("/api/torrents/query", (req, res) => {
  torrents
    .getQueryTorrents({ req: req.body })
    .then((response) => {
      res.status(200).send({ torrents: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Get torrent infos
app.post("/api/torrents/info", (req, res) => {
  torrents
    .getTorrentInfos({ req: req.body })
    .then((response) => {
      res.status(200).send({ torrents: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Get torrents for search engine
app.post("/api/torrents/get/settings", (req, res) => {
  torrents
    .getTorrentSettings({ req: req.body })
    .then((response) => {
      res.status(200).send({ settings: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Get torrents for search engine
app.post("/api/torrents/get/casts", (req, res) => {
  torrents
    .getCasts({ req: req.body })
    .then((response) => {
      res.status(200).send({ casts: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Get home random torrent
app.post("/api/torrents/random", (req, res) => {
  torrents
    .getRandomTorrents({ req: req.body })
    .then((response) => {
      res.status(200).send({ torrents: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Like to dislike torrent
app.post("/api/torrents/like", (req, res) => {
  likes
    .likeTorrent({ req: req.body, token: req.cookies._hypertubeAuth })
    .then((response) => {
      res.status(200).send({ torrents: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Set torrent as viewed for logged user
app.post("/api/views/set", (req, res) => {
  views
    .setViewed({ req: req.body, token: req.cookies._hypertubeAuth })
    .then((response) => {
      res.status(200).send({ views: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Get user viewed movies
app.post("/api/views/get", (req, res) => {
  views
    .getUserViews({ req: req.body })
    .then((response) => {
      res.status(200).send({ views: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Get user liked movies
app.post("/api/likes/get", (req, res) => {
  likes
    .getUserLikes({ req: req.body })
    .then((response) => {
      res.status(200).send({ likes: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Get comments by torrent id
app.post("/api/comments/torrent", (req, res) => {
  comments
    .getComments({ req: req.body })
    .then((response) => {
      res.status(200).send({ comments: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Send comments to torrent check if logged before
app.post("/api/comments/send", (req, res) => {
  comments
    .sendComment({ req: req.body, token: req.cookies._hypertubeAuth })
    .then((response) => {
      res.status(200).send({ comments: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Delete comment
app.post("/api/comments/delete", (req, res) => {
  comments
    .deleteComment({ req: req.body, token: req.cookies._hypertubeAuth })
    .then((response) => {
      res.status(200).send({ comments: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Get profile information of the logged user
app.get("/api/profile", (req, res) => {
  users
    .getLoggedUser({
      token: req.cookies._hypertubeAuth,
    })
    .then((response) => {
      res.status(200).send({ user: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Recover user password
app.post("/api/recover", (req, res) => {
  recover
    .userRecover({ req: req.body })
    .then((response) => {
      if (response.recover) {
        sendMail(response.email, 2, response.pass)
          .then((result) => {
            if (result) {
              res.status(200).send({ recover: { recover: response.recover } });
            } else {
              res
                .status(200)
                .send({ recover: { msg: "Unable to send email." } });
            }
          })
          .catch((error) => {
            res.status(200).send({ recover: { msg: "Unable to send email." } });
          });
      } else {
        res.status(200).send({
          recover: { msg: "Given informations don't match any users." },
        });
      }
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});
