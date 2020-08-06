// dependencies
const fs = require("fs");
const cors = require("cors");
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
const oauth = require("./api/oauth");
const signUp = require("./api/signUp");
const stream = require("./api/stream");
const confirm = require("./api/confirm");
const recover = require("./api/recover");
const sockets = require("./api/sockets");
const settings = require("./api/settings");
const comments = require("./api/comments");
const torrents = require("./api/torrents");
const maintenance = require("./scripts/search");

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
  secret: process.env.SECRET_TOKEN,
  name: "hypertube",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "none",
    secure: true,
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

// config
app.use(session(sessionConfig));

// cors
app.use(cors());

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

// check for unused torrents (30 days no views) every 12 hours and delete them from the server
const cleanupJob = new CronJob("0 */12 * * *", () => {
  console.log("Starting cleanup maintenance...");
  torrents
    .doCleanUpMaintenance()
    .then((response) =>
      console.log(`${response.updated} torrents updated. ${response.msg}`)
    )
    .catch((error) => console.log(error));
});

// check every day at 4am if there's new movies and scrape them
const maintenanceJob = new CronJob("0 4 * * *", async () => {
  console.log("Starting update maintenance...");
  torrents
    .getMaintenanceTorrents()
    .then(async (response) => {
      if (response.state) {
        const status = await maintenance.doUpdateMaintenance(response.torrents);
        if (status.status) {
          console.log(
            "Updating movie database... I found",
            status.torrents.new.length,
            "new movies and",
            status.torrents.updated.length,
            "movies I have to update"
          );
          torrents
            .addMaintenanceTorrents(status.torrents)
            .then((response) => {
              if (response.status) {
                torrents
                  .updateMaintenceTorrents(status.torrents)
                  .then((response) => {
                    if (response.status) {
                      console.log("Maintenance finished, see you tomorrow");
                    } else {
                      console.log(response.msg);
                    }
                  })
                  .catch((error) => console.log(error));
              } else {
                console.log(response.msg);
              }
            })
            .catch((error) => console.log(error));
        }
      } else {
        console.log(response.msg);
      }
    })
    .catch((error) => console.log(error));
});

cleanupJob.start();
maintenanceJob.start();

// Get oauth (42, github, google)
app.get("/oauth/42", async (req, res) => {
  if (req.query.code) {
    const status = await oauth.oauth42(req.query.code);
    if (status.status) {
      jwt.sign(
        { login },
        sessionConfig.secret,
        {
          expiresIn: "24h",
        },
        (err, token) => {
          login
            .setLoggedUser({
              login: status.id.login,
              isLogged: true,
              token: token,
            })
            .then((setLogged) => {
              if (setLogged.login) {
                res.cookie("_hypertubeAuth", token, {
                  httpOnly: true,
                });
                return res.redirect(
                  `http://localhost:3000/SignIn?token=${token}`
                );
              } else {
                return res.redirect("http://localhost:3000/SignUp");
              }
            });
        }
      );
    } else {
      return res.redirect("http://localhost:3000/SignUp");
    }
  } else {
    return res.redirect("http://localhost:3000/SignUp");
  }
});

app.get("/oauth/github", async (req, res) => {
  if (req.query.code) {
    const status = await oauth.oauthGithub(req.query.code);
    if (status.status) {
      jwt.sign(
        { login },
        sessionConfig.secret,
        {
          expiresIn: "24h",
        },
        (err, token) => {
          login
            .setLoggedUser({
              login: status.id.login,
              isLogged: true,
              token: token,
            })
            .then((setLogged) => {
              if (setLogged.login) {
                res.cookie("_hypertubeAuth", token, {
                  httpOnly: true,
                });
                return res.redirect(
                  `http://localhost:3000/SignIn?token=${token}`
                );
              } else {
                return res.redirect("http://localhost:3000/SignUp");
              }
            });
        }
      );
    } else {
      return res.redirect("http://localhost:3000/SignUp");
    }
  } else {
    return res.redirect("http://localhost:3000/SignUp");
  }
});

app.get("/oauth/google", async (req, res) => {
  if (req.query.code) {
    const status = await oauth.oauthGoogle(req.query.code);
    if (status.status) {
      jwt.sign(
        { login },
        sessionConfig.secret,
        {
          expiresIn: "24h",
        },
        (err, token) => {
          login
            .setLoggedUser({
              login: status.id.login,
              isLogged: true,
              token: token,
            })
            .then((setLogged) => {
              if (setLogged.login) {
                res.cookie("_hypertubeAuth", token, {
                  httpOnly: true,
                });
                return res.redirect(
                  `http://localhost:3000/SignIn?token=${token}`
                );
              } else {
                return res.redirect("http://localhost:3000/SignUp");
              }
            });
        }
      );
    } else {
      return res.redirect("http://localhost:3000/SignUp");
    }
  } else {
    return res.redirect("http://localhost:3000/SignUp");
  }
});

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
              res.send({
                status: true,
                id: response.id,
                language: response.language,
                isoauth: response.isoauth === "true" ? true : false,
              });
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
        jwt.sign(
          { login },
          sessionConfig.secret,
          {
            expiresIn: "24h",
          },
          (err, token) => {
            login
              .setLoggedUser({
                login: req.body.login,
                isLogged: true,
                token: token,
              })
              .then((setLogged) => {
                if (setLogged.login) {
                  res.cookie("_hypertubeAuth", token, {
                    httpOnly: true,
                  });
                  res.send({
                    login: true,
                    id: setLogged.id,
                    language: setLogged.language,
                    isoauth: setLogged.isoauth === "true" ? true : false,
                  });
                } else {
                  res.send(setLogged);
                }
              });
          }
        );
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
                    .catch((err) => {
                      res
                        .status(200)
                        .send({ signup: { msg: "Unable to send email." } });
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
            if (
              fs.existsSync(`./client/src/assets/photos/${req.file.filename}`)
            ) {
              fs.unlinkSync(`./client/src/assets/photos/${req.file.filename}`);
            }
            res.status(200).send({ signup: { msg: response.msg } });
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

// Edit photo in profile page
app.post("/api/settings/edit/photo", (req, res) => {
  const upload = multer({
    storage: storage,
  }).single("file");
  upload(req, res, function (err) {
    if (!req.file) {
      res.status(200).send({ edit: { msg: "No files uploaded." } });
    } else {
      settings
        .editUserPhoto({
          photo: req.file.filename,
          token: req.cookies._hypertubeAuth,
        })
        .then((response) => {
          let path = "./client/src/assets/photos/" + req.body.oldFile;
          if (!req.body.oldFile.startsWith("https://")) {
            if (fs.existsSync(path)) fs.unlinkSync(path);
          }
          res.status(200).send({ edit: response });
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    }
  });
});

// Edit username
app.post("/api/settings/username", (req, res) => {
  settings
    .editUsername({ req: req.body, token: req.cookies._hypertubeAuth })
    .then((response) => {
      res.status(200).send({ edit: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Edit language settings page
app.post("/api/settings/edit/language", (req, res) => {
  settings
    .editUserLanguage({ req: req.body, token: req.cookies._hypertubeAuth })
    .then((response) => {
      res.status(200).send({ edit: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Edit user email | with clear cookie and push to signin page
app.post("/api/settings/edit/mail", (req, res) => {
  settings
    .editUserEmail({ req: req.body, token: req.cookies._hypertubeAuth })
    .then((response) => {
      if (response.edit) {
        sendMail(
          req.body.confirmedMail,
          1,
          "http://localhost:3000/confirm?r=" +
            response.random +
            "&u=" +
            response.rows[0].username +
            "&e=" +
            req.body.confirmedMail
        )
          .then((result) => {
            if (result) {
              res.status(200).clearCookie("_hypertubeAuth", {
                path: "/",
              });
              res.status(200).send({ edit: { edit: response.edit } });
            } else {
              res.status(200).send({ edit: { msg: "Unable to send email." } });
            }
          })
          .catch((error) => {
            res.status(200).send({ edit: { msg: "Unable to send email." } });
          });
      } else {
        res.status(200).send({ edit: { msg: "Unable to edit mail." } });
      }
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Edit user lastname
app.post("/api/settings/lastname", (req, res) => {
  settings
    .editUserLastname({ req: req.body, token: req.cookies._hypertubeAuth })
    .then((response) => {
      res.status(200).send({ edit: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Edit user firstname
app.post("/api/settings/firstname", (req, res) => {
  settings
    .editUserFirstname({ req: req.body, token: req.cookies._hypertubeAuth })
    .then((response) => {
      res.status(200).send({ edit: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Edit user password | with clear cookie and push to signin page
app.post("/api/settings/password", (req, res) => {
  settings
    .editUserPassword({ req: req.body, token: req.cookies._hypertubeAuth })
    .then((response) => {
      if (response.edit === true) {
        res.status(200).clearCookie("_hypertubeAuth", {
          path: "/",
        });
      }
      res.status(200).send({ edit: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Get torrents infos for profile page
app.post("/api/users/get/torrents", (req, res) => {
  users
    .getUserTorrents({ token: req.cookies._hypertubeAuth })
    .then((response) => {
      res.status(200).send({ torrents: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Get torrents infos for user page
app.post("/api/users/get/torrentscom", (req, res) => {
  users
    .getCommentTorrents({ token: req.body })
    .then((response) => {
      res.status(200).send({ torrents: response });
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
          recover: { msg: response.msg },
        });
      }
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});
