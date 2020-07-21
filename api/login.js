const pool = require("./../pool.js");
const bcrypt = require("bcrypt");
const moment = require("moment");

const setLoggedUser = (request, response) => {
  const { login, token, isLogged } = request;
  const type = login.includes("@") ? 0 : 1;
  return new Promise(function (resolve, reject) {
    if (token && login) {
      pool.pool.query(
        type === 1
          ? "UPDATE users SET connected = $1, last_connection = $2, connected_token = $3 WHERE username = $4"
          : "UPDATE users SET connected = $1, last_connection = $2, connected_token = $3 WHERE email = $4",
        [isLogged, moment().format("DD/MM/YYYY hh:mm:ss"), token, login],
        (error, results) => {
          if (error) {
            reject(error);
          }
          if (!results.rowCount) {
            resolve({ msg: "Unable to update user connected state" });
          } else {
            resolve({ login: true });
          }
        }
      );
    } else {
      resolve({
        msg: "Unable to set you as logged.",
      });
    }
  });
};

const unsetLoggedUser = (request, response) => {
  const { token, isLogged } = request;
  return new Promise(function (resolve, reject) {
    if (token) {
      pool.pool.query(
        "UPDATE users SET connected = $1, connected_token = $2 WHERE connected_token = $3",
        [isLogged, null, token],
        (error, results) => {
          if (error) {
            reject(error);
          }
          if (!results.rowCount) {
            resolve({ msg: "Unable to update user connected state" });
          } else {
            resolve({ logout: true });
          }
        }
      );
    } else {
      resolve({
        msg: "Unable to log you out.",
      });
    }
  });
};

const logUser = (request, response) => {
  const { login, password } = request;
  const type = login.includes("@") ? 0 : 1;
  return new Promise(function (resolve, reject) {
    if (login && password) {
      pool.pool.query(
        type === 1
          ? "SELECT id, password, verified FROM users WHERE username = $1"
          : "SELECT id, password, verified FROM users WHERE email = $1",
        [login],
        (error, results) => {
          if (error) {
            reject(error);
          }
          if (!results.rowCount) {
            resolve({ msg: "User not found" });
          } else {
            if (results.rows[0].verified === false) {
              resolve({
                msg:
                  "You must confirm your account before logging in, check your emails.",
              });
            } else {
              bcrypt.compare(
                password,
                results.rows[0].password,
                (err, result) => {
                  resolve({ logged: result, id: results.rows[0].id });
                }
              );
            }
          }
        }
      );
    } else {
      resolve({
        msg: "Unable to log you in.",
      });
    }
  });
};

const checkToken = (request, response) => {
  const { token } = request;
  return new Promise(function (resolve, reject) {
    if (token) {
      pool.pool.query(
        "SELECT id, connected_token FROM users WHERE connected_token = $1;",
        [token],
        (error, results) => {
          if (error) {
            reject(error);
          }
          if (!results.rowCount) {
            resolve({ token: false });
          } else {
            resolve({ token: true, id: results.rows[0].id });
          }
        }
      );
    } else {
      resolve({
        msg: "Unable to check your token.",
      });
    }
  });
};

module.exports = {
  logUser,
  setLoggedUser,
  unsetLoggedUser,
  checkToken,
};
