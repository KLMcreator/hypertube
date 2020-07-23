const pool = require("./../pool.js");

const setViewed = (request, response) => {
  const { req, token } = request;
  return new Promise(function (resolve, reject) {
    pool.pool.query(
      "DELETE FROM views WHERE movie_id = $1 AND user_id = (SELECT id FROM users WHERE connected_token = $2)",
      [req.movie, token],
      (error, resultDelete) => {
        if (error) {
          resolve({ msg: error });
        }
        pool.pool.query(
          "INSERT INTO views (user_id, movie_id, viewed_at) VALUES ((SELECT id FROM users WHERE connected_token = $1), $2, (SELECT NOW()))",
          [token, req.movie],
          (error, resultInsert) => {
            if (error) {
              reject(error);
            }
            if (resultInsert.rowCount) {
              resolve({ views: true });
            } else {
              resolve({ msg: "Unable to update your like" });
            }
          }
        );
      }
    );
  });
};

module.exports = {
  setViewed,
};
