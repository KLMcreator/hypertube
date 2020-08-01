const bcrypt = require("bcrypt");
const pool = require("./../pool.js");

function random_password() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

const userRecover = (request, response) => {
  const { req } = request;
  return new Promise(function (resolve, reject) {
    if (req.login && req.email) {
      pool.pool.query(
        "SELECT email, isoauth FROM users WHERE email = $1 AND username = $2",
        [req.email, req.login],
        (error, results) => {
          if (error) {
            reject(error);
          }
          if (!results.rowCount) {
            resolve({ msg: "Given informations doesn't match any users" });
          } else {
            if (results.rows[0].isoauth === "true") {
              resolve({
                msg:
                  "You can't recover password from an oauth account, check the website concerned.",
              });
            } else {
              let tmp = random_password();
              bcrypt.hash(tmp, 10, function (err, hash) {
                if (hash) {
                  pool.pool.query(
                    "UPDATE users SET password = $1 WHERE email = $2 AND username = $3",
                    [hash, req.email, req.login],
                    (error, resUpdate) => {
                      if (error) {
                        resolve({ msg: error });
                      }
                      if (!resUpdate.rowCount) {
                        resolve({ msg: "Unable to find user." });
                      } else {
                        resolve({
                          recover: true,
                          pass: tmp,
                          email: results.rows[0].email,
                        });
                      }
                    }
                  );
                }
              });
            }
          }
        }
      );
    }
  });
};

module.exports = { userRecover };
