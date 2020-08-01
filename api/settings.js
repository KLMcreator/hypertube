const bcrypt = require("bcrypt");
const pool = require("./../pool.js");

const editUserPhoto = (request, response) => {
  const { photo, token } = request;
  return new Promise(function (resolve, reject) {
    if (photo && token) {
      pool.pool.query(
        "UPDATE users SET photos = $1 WHERE connected_token = $2",
        [photo, token],
        (error, results) => {
          if (error) {
            reject(error);
          }
          if (!results.rowCount) {
            resolve({
              msg: "Unable to change you profile picture.",
            });
          } else {
            resolve({ edit: true, photo: photo });
          }
        }
      );
    } else {
      resolve({ msg: "Unable to edit your photos." });
    }
  });
};

const editUsername = (request, response) => {
  const { req, token } = request;
  return new Promise(function (resolve, reject) {
    if (req.username && token) {
      let accentedCharacters =
        "àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ";
      let checkSpecChar = new RegExp(
        "^[-'A-Z" + accentedCharacters + "a-z ]+$"
      );
      if (
        req.username &&
        req.username.length === req.username.replace(/\s/g, "").length &&
        checkSpecChar.test(req.username) &&
        req.username.length < 256
      ) {
        pool.pool.query(
          "UPDATE users SET username = $1 WHERE connected_token = $2",
          [req.username, token],
          (error, results) => {
            if (error) {
              reject(error);
            }
            if (!results.rowCount) {
              resolve({
                msg: "Unable to update your username.",
              });
            } else {
              resolve({ edit: true });
            }
          }
        );
      } else {
        resolve({
          msg:
            "Username can't be null or too long and must only contain letters.",
        });
      }
    } else {
      resolve({ msg: "Unable to edit your username." });
    }
  });
};

const editUserLanguage = (request, response) => {
  const { req, token } = request;
  return new Promise(function (resolve, reject) {
    if (req.language && token) {
      pool.pool.query(
        "UPDATE users SET language = $1 WHERE connected_token = $2",
        [req.language, token],
        (error, results) => {
          if (error) {
            reject(error);
          }
          if (!results.rowCount) {
            resolve({
              msg: "Unable to update your prefered language.",
            });
          } else {
            resolve({ edit: true });
          }
        }
      );
    } else {
      resolve({ msg: "Unable to edit your prefered language" });
    }
  });
};

const checkEmail = (req, token) => {
  return new Promise(function (resolve, reject) {
    if (
      req.currentMail &&
      req.newMail &&
      req.confirmedMail &&
      req.currentMail !== req.newMail &&
      req.newMail.length === req.confirmedMail.replace(/\s/g, "").length
    ) {
      pool.pool.query(
        "SELECT COUNT(email) FROM users WHERE email = $1 AND connected_token = $2 AND (SELECT COUNT(email) FROM users WHERE email = $3) = $4",
        [req.currentMail, token, req.newMail, 0],
        (error, results) => {
          if (error) {
            resolve(false);
          }
          if (results.rows[0].count === "1") {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );
    } else {
      resolve(false);
    }
  });
};

const editUserEmail = (request, response) => {
  const { req, token } = request;
  return new Promise(function (resolve, reject) {
    if (req.confirmedMail && token) {
      checkEmail(req, token).then((res) => {
        if (res) {
          let random_value =
            Math.floor(Math.random() * (4242424242 - 2424242424 + 1)) +
            2424242424 +
            Date.now();
          pool.pool.query(
            "UPDATE users SET connected = $1, connected_token = $2, email = $3, verified = $4, verified_value = $5 WHERE email = $6 AND connected_token = $7 returning username",
            [
              false,
              null,
              req.confirmedMail,
              false,
              random_value,
              req.currentMail,
              token,
            ],
            (error, results) => {
              if (error) {
                reject(error);
              }
              if (!results.rowCount) {
                resolve({
                  msg: "Email does not correspond to the logged user.",
                });
              } else {
                resolve({
                  edit: true,
                  random: random_value,
                  rows: results.rows,
                });
              }
            }
          );
        } else {
          resolve({
            msg:
              "Email already in use or doesn't respect standard email format.",
          });
        }
      });
    } else {
      resolve({ msg: "Unable to update your email." });
    }
  });
};

const editUserLastname = (request, response) => {
  const { req, token } = request;
  return new Promise(function (resolve, reject) {
    if (token && req.lastname) {
      let accentedCharacters =
        "àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ";
      let checkSpecChar = new RegExp(
        "^[-'A-Z" + accentedCharacters + "a-z ]+$"
      );
      if (
        req.lastname &&
        req.lastname.length === req.lastname.replace(/\s/g, "").length &&
        checkSpecChar.test(req.lastname) &&
        req.lastname.length < 256
      ) {
        let lastName = req.lastname.toUpperCase();
        pool.pool.query(
          "UPDATE users SET lastname = $1 WHERE connected_token = $2",
          [lastName ? lastName : null, token],
          (error, results) => {
            if (error) {
              reject(error);
            }
            if (!results.rowCount) {
              resolve({
                msg: "Unable to update your last name.",
              });
            } else {
              resolve({ edit: true });
            }
          }
        );
      } else {
        resolve({
          msg:
            "Lastname can't be null or too long and must only contain letters.",
        });
      }
    } else {
      resolve({ msg: "Unable to edit your lastname." });
    }
  });
};

const editUserFirstname = (request, response) => {
  const { req, token } = request;
  return new Promise(function (resolve, reject) {
    if (req.firstname && token) {
      let accentedCharacters =
        "àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ";
      let checkSpecChar = new RegExp(
        "^[-'A-Z" + accentedCharacters + "a-z ]+$"
      );
      if (
        req.firstname &&
        req.firstname.length === req.firstname.replace(/\s/g, "").length &&
        checkSpecChar.test(req.firstname) &&
        req.firstname.length < 256
      ) {
        pool.pool.query(
          "UPDATE users SET firstname = $1 WHERE connected_token = $2",
          [req.firstname, token],
          (error, results) => {
            if (error) {
              reject(error);
            }
            if (!results.rowCount) {
              resolve({
                msg: "Unable to update your firstname.",
              });
            } else {
              resolve({ edit: true });
            }
          }
        );
      } else {
        resolve({
          msg:
            "First name can't be null or too long and must only contain letters.",
        });
      }
    } else {
      resolve({ msg: "Unable to edit your firstname." });
    }
  });
};

const checkPassword = (req, token) => {
  return new Promise(function (resolve, reject) {
    let checkNewPwd = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
    if (
      req.currentPassword &&
      req.newPassword &&
      req.confirmedPassword &&
      req.currentPassword !== req.newPassword &&
      req.newPassword.length === req.newPassword.replace(/\s/g, "").length &&
      req.newPassword === req.confirmedPassword &&
      checkNewPwd.test(req.newPassword)
    ) {
      pool.pool.query(
        "SELECT password FROM users WHERE connected_token = $1",
        [token],
        (error, results) => {
          if (error) {
            resolve(false);
          }
          if (results.rowCount === 1) {
            resolve(results.rows[0].password);
          } else {
            resolve(false);
          }
        }
      );
    } else {
      resolve(false);
    }
  });
};

const editUserPassword = (request, response) => {
  const { req, token } = request;
  return new Promise(function (resolve, reject) {
    if (req.currentPassword && req.newPassword && token) {
      checkPassword(req, token).then((res) => {
        if (res) {
          bcrypt.compare(req.currentPassword, res, function (err, result) {
            if (result) {
              bcrypt.hash(req.newPassword, 10, function (err, hash) {
                pool.pool.query(
                  "UPDATE users SET connected = $1, connected_token = $2, password = $3 WHERE password = $4 AND connected_token = $5",
                  [false, null, hash, res, token],
                  (error, results) => {
                    if (error) {
                      reject(error);
                    }
                    if (!results.rowCount) {
                      resolve({
                        msg:
                          "There's an error with your old password, double check.",
                      });
                    } else {
                      resolve({ edit: true });
                    }
                  }
                );
              });
            } else {
              resolve({
                msg: "Your password does not match the registered password",
              });
            }
          });
        } else {
          resolve({
            msg:
              "Password does not match the rules or is not different than your old one.",
          });
        }
      });
    } else {
      resolve({ msg: "Unable to update your password." });
    }
  });
};

module.exports = {
  editUserPhoto,
  editUsername,
  editUserLanguage,
  editUserEmail,
  editUserLastname,
  editUserFirstname,
  editUserPassword,
};
