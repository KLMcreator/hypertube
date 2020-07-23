const pool = require("./../pool.js");

const getLoggedUser = (request, response) => {
  const { token } = request;
  return new Promise(function (resolve, reject) {
    if (token) {
      pool.pool.query(
        "SELECT id, username, firstname, lastname, email, photos, language FROM users WHERE connected_token = $1",
        [token],
        (error, results) => {
          if (error) {
            resolve({ msg: error });
          }
          if (!results.rowCount) {
            resolve({ user: false });
          } else {
            resolve(results.rows);
          }
        }
      );
    } else {
      resolve({ msg: "Unable to get logged user details." });
    }
  });
};

const getUserInfos = (request, response) => {
  const { req } = request;
  return new Promise(function (resolve, reject) {
    pool.pool.query(
      "SELECT id, username, firstname, lastname, connected, last_connection, language, photos FROM users WHERE id = $1;",
      [req.id],
      (error, results) => {
        if (error) {
          resolve({ msg: error });
        }
        if (!results.rowCount) {
          resolve({ users: false });
        } else {
          resolve(results.rows);
        }
      }
    );
  });
};

module.exports = { getLoggedUser, getUserInfos };
