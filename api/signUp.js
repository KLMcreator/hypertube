const pool = require("./../pool.js");
const bcrypt = require("bcrypt");

const checkMail = (request, response) => {
  return new Promise((resolve, reject) => {
    if (
      request.email &&
      request.email.length === request.email.replace(/\s/g, "").length
    ) {
      pool.pool.query(
        "SELECT * FROM users where email = $1",
        [request.email],
        (error, results) => {
          if (error) {
            resolve(false);
          }
          if (!results.rowCount) {
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

const checkPassword = (request, response) => {
  return new Promise((resolve, reject) => {
    let checkPwd = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
    if (
      request.confirmedPassword &&
      request.password &&
      request.password.length === request.password.replace(/\s/g, "").length &&
      request.confirmedPassword === request.password &&
      checkPwd.test(request.password)
    ) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

const checkUsername = (request, response) => {
  return new Promise((resolve, reject) => {
    let accentedCharacters =
      "àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ";
    let checkSpecChar = new RegExp(
      "^[-'A-Z" + accentedCharacters + "a-z0-9 ]+$"
    );
    if (
      request.username &&
      request.username.length === request.username.replace(/\s/g, "").length &&
      checkSpecChar.test(request.username)
    ) {
      pool.pool.query(
        "SELECT * FROM users where username = $1",
        [request.username],
        (error, results) => {
          if (error) {
            resolve(false);
          }
          if (!results.rowCount) {
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

const checkFirstname = (request, response) => {
  let accentedCharacters =
    "àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ";
  let checkSpecChar = new RegExp("^[-'A-Z" + accentedCharacters + "a-z0-9 ]+$");
  return new Promise((resolve, reject) => {
    if (
      request.firstName &&
      request.firstName.length ===
        request.firstName.replace(/\s/g, "").length &&
      checkSpecChar.test(request.firstName)
    ) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

const checkLastname = (request, response) => {
  let accentedCharacters =
    "àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ";
  let checkSpecChar = new RegExp("^[-'A-Z" + accentedCharacters + "a-z0-9 ]+$");
  return new Promise((resolve, reject) => {
    if (
      request.lastName &&
      request.lastName.length === request.lastName.replace(/\s/g, "").length &&
      checkSpecChar.test(request.lastName)
    ) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

const userSignUp = (request, response) => {
  const { username, firstName, lastName, email, password, photo } = request;
  return new Promise((resolve, reject) => {
    checkUsername(request, response).then((usernameCheck) => {
      if (usernameCheck) {
        checkFirstname(request, response).then((firstnameCheck) => {
          if (firstnameCheck) {
            checkLastname(request, response).then((lastnameCheck) => {
              if (lastnameCheck) {
                lastNameUpper = lastName.toUpperCase();
                checkMail(request, response).then((result) => {
                  if (result) {
                    checkPassword(request, response).then((res) => {
                      if (res) {
                        bcrypt.hash(password, 10, function (err, hash) {
                          let random_value =
                            Math.floor(
                              Math.random() * (4242424242 - 2424242424 + 1)
                            ) +
                            2424242424 +
                            Date.now();
                          if (photo) {
                            pool.pool.query(
                              "INSERT INTO users (username, password, firstname, lastname, email, photos,verified_value) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                              [
                                username,
                                hash,
                                firstName,
                                lastNameUpper,
                                email,
                                photo,
                                random_value,
                              ],
                              (error, results) => {
                                if (error) {
                                  resolve({ msg: error });
                                }
                                if (!results.rowCount) {
                                  resolve({
                                    msg: "Unable to create user.",
                                  });
                                } else {
                                  resolve({
                                    signup: true,
                                    random: random_value,
                                  });
                                }
                              }
                            );
                          } else {
                            resolve({ msg: "Photo is missing" });
                          }
                        });
                      } else {
                        resolve({ msg: "Incorrect password." });
                      }
                    });
                  } else {
                    resolve({ msg: "Incorrect email." });
                  }
                });
              } else {
                resolve({ msg: "Incorrect lastname." });
              }
            });
          } else {
            resolve({ msg: "Incorrect firstname." });
          }
        });
      } else {
        resolve({ msg: "Incorrect username." });
      }
    });
  });
};

const oauthSignUp = async (user) => {
  return new Promise((resolve, reject) => {
    pool.pool.query(
      "SELECT id, isoauth, username, email FROM users WHERE username ILIKE $1 OR email ILIKE $2",
      [`%${user.username}%`, `%${user.username}%`],
      (error, results) => {
        if (error) {
          resolve({ status: false, msg: error });
        }
        if (!results.rowCount) {
          pool.pool.query(
            "INSERT INTO users (username, firstname, lastname, email, photos, verified, verified_value, isoauth) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning id",
            [
              user.username,
              user.firstname,
              user.lastname,
              user.email,
              user.photos,
              true,
              1,
              true,
            ],
            (error, resultsCreate) => {
              if (error) {
                resolve({ status: false, msg: error });
              }
              if (resultsCreate.rowCount) {
                resolve({
                  status: true,
                  id: {
                    login: user.email,
                    id: resultsCreate.rows[0].id,
                  },
                  msg: "User created",
                });
              } else {
                resolve({ status: false, msg: "Unable to create user" });
              }
            }
          );
        } else {
          if (results.rows[0].isoauth === "true") {
            resolve({
              status: true,
              id: {
                login:
                  user.username === results.rows[0].username
                    ? user.username
                    : user.email,
                id: results.rows[0].id,
              },
              msg: "User already exists",
            });
          } else {
            resolve({
              status: false,
              msg: "Username or email already in use",
            });
          }
        }
      }
    );
  });
};

module.exports = { userSignUp, oauthSignUp };
