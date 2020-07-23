const pool = require("./../pool.js");
const bcrypt = require("bcrypt");

// Check if mail is already existing AND if user did not put space in the field
const checkMail = (request, response) => {
  return new Promise(function (resolve, reject) {
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

// Check if password contain only letters and at least one cap, one min letter, one digit and at least 8 char AND if user did not put space in the field
const checkPassword = (request, response) => {
  return new Promise(function (resolve, reject) {
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

// Check if username is already existing AND if user did not put space in the field
const checkUsername = (request, response) => {
  return new Promise(function (resolve, reject) {
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

// Check if user did not put space in the field firstname
const checkFirstname = (request, response) => {
  let accentedCharacters =
    "àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ";
  let checkSpecChar = new RegExp("^[-'A-Z" + accentedCharacters + "a-z0-9 ]+$");
  return new Promise(function (resolve, reject) {
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

// Check if user did not put space in the field lastname
const checkLastname = (request, response) => {
  let accentedCharacters =
    "àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ";
  let checkSpecChar = new RegExp("^[-'A-Z" + accentedCharacters + "a-z0-9 ]+$");
  return new Promise(function (resolve, reject) {
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

// Sign up -> username, lastname, firstname, gender, mail, age and password in database
const userSignUp = (request, response) => {
  const { username, firstName, lastName, email, password, photo } = request;
  return new Promise(function (resolve, reject) {
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

module.exports = { userSignUp };
