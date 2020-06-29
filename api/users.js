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
            reject(error);
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

module.exports = { getLoggedUser };
