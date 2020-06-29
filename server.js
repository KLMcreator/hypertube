// dependencies
const mime = require("mime");
const multer = require("multer");
const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// files
const users = require("./api/users");
const login = require("./api/login");
const signUp = require("./api/signUp");
const views = require("./api/views");
const confirm = require("./api/confirm");
const settings = require("./api/settings");
const comments = require("./api/comments");
const torrents = require("./api/torrents");
// const
const app = express();
const port = process.env.PORT || 5000;
const secret = "mysecretsshhh";
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

app.listen(port, () => console.log(`Listening on port ${port}`));

// allow to use static path for files
app.use(express.static("client"));
// avoid xss
app.disable("x-powered-by");
// parsing cookie
app.use(cookieParser());
// needed to read and parse some responses
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));

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

// Check if the token is valid, needed for react router
app.get("/api/checkToken", function (req, res) {
  const token = req.cookies._hypertubeAuth;
  if (!token) {
    res.send({ status: false });
  } else {
    jwt.verify(token, secret, function (err, decoded) {
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
      if (response === true && res.statusCode === 200) {
        const token = jwt.sign({ login }, secret, {
          expiresIn: "24h",
        });
        login
          .setLoggedUser({
            login: req.body.login,
            isLogged: true,
            token: token,
          })
          .then((setLogged) => {
            if (setLogged.login === true) {
              res.cookie("_hypertubeAuth", token, { httpOnly: true });
              res.send({
                login: true,
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
  const upload = multer({ storage: storage }).single("file");
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

// Get home random torrent
app.post("/api/torrents/random", (req, res) => {
  torrents
    .getRandomTorrents()
    .then((response) => {
      res.status(200).send({ torrents: response });
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

//                  not checked, from matcha
// Recover user password
app.post("/api/recover", (req, res) => {
  users
    .recoverPwd({ req: req.body })
    .then((response) => {
      if (response.recover) {
        sendMail(req.body.email, 2, response.random)
          .then((result) => {
            console.log(
              "Username: " +
                req.body.login +
                " email: " +
                req.body.email +
                " password: " +
                response.random
            );
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

// Get logged user message history with clicked user
app.post("/api/messages/get", (req, res) => {
  messages
    .getMessages({ req: req.body, token: req.cookies._hypertubeAuth })
    .then((response) => {
      res.status(200).send({ message: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Send message from logged user to matched user (clicked user)
app.post("/api/messages/send", (req, res) => {
  messages
    .sendMessage({ req: req.body, token: req.cookies._hypertubeAuth })
    .then((response) => {
      res.status(200).send({ message: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Delete message from logged user with matched user (clicked user) based on his id
app.post("/api/messages/delete", (req, res) => {
  messages
    .deleteMessage({ req: req.body, token: req.cookies._hypertubeAuth })
    .then((response) => {
      res.status(200).send({ delete: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Update visit history and user points
app.post("/api/visits/add", (req, res) => {
  visits
    .addVisits({ req: req.body, token: req.cookies._hypertubeAuth })
    .then((response) => {
      res.status(200).send({ visit: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Get logged user visit history
app.post("/api/visits/get", (req, res) => {
  visits
    .getLastVisits({ token: req.cookies._hypertubeAuth })
    .then((response) => {
      res.status(200).send({ visit: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Get logged user visit list
app.post("/api/visits/get/list", (req, res) => {
  visits
    .getVisitList({ token: req.cookies._hypertubeAuth })
    .then((response) => {
      res.status(200).send({ visit: response });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// Edit user email | with clear cookie and push to signin page
app.post("/api/settings/email", (req, res) => {
  settings
    .editUserEmail({ req: req.body, token: req.cookies._hypertubeAuth })
    .then((response) => {
      if (response.edit) {
        sendMail(
          req.body.verifEmail,
          1,
          "http://localhost:3000/confirm?r=" + response.random
        )
          .then((result) => {
            console.log(
              "http://localhost:3000/confirm?r=" +
                response.random +
                "&u=" +
                response.rows[0].username +
                "&e=" +
                req.body.verifEmail
            );
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
        res.status(200).send({ edit: { msg: "Unable to edit." } });
      }
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

// Delete user account and all the related datas
app.post("/api/settings/delete/user", (req, res) => {
  settings
    .deleteUser({ token: req.cookies._hypertubeAuth })
    .then((response) => {
      if (response.delete === true) {
        res.status(200).clearCookie("_hypertubeAuth", {
          path: "/",
        });
        res.send({ delete: true });
      } else {
        res.send(result);
      }
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});
