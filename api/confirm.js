const pool = require("./../pool.js");

const usrAccount = (request, response) => {
  const { req } = request;
  return new Promise(function (resolve, reject) {
    pool.pool.query(
      "UPDATE users SET verified = $1, verified_value = $2 WHERE verified_value = $3 AND verified = $4 AND username = $5 AND email = $6",
      [true, 1, req.r, false, req.u, req.e],
      (error, results) => {
        if (error) {
          reject(error);
        }
        if (!results.rowCount) {
          resolve({ msg: "Informations doesn't match." });
        } else {
          resolve({ confirm: true });
        }
      }
    );
  });
};

module.exports = {
  usrAccount,
};
