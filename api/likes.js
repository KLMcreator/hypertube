const pool = require("./../pool.js");

const likeTorrent = (request, response) => {
  const { req, token } = request;
  return new Promise((resolve, reject) => {
    pool.pool.query(
      "DELETE FROM likes WHERE movie_id = $1 AND user_id = (SELECT id FROM users WHERE connected_token = $2)",
      [req.movie, token],
      (error, resultDelete) => {
        if (error) {
          resolve({ msg: error });
        }
        pool.pool.query(
          "INSERT INTO likes (user_id, movie_id, liked) VALUES ((SELECT id FROM users WHERE connected_token = $1), $2, $3)",
          [token, req.movie, req.isLiked],
          (error, resultInsert) => {
            if (error) {
              resolve({ msg: error });
            }
            if (resultInsert.rowCount) {
              let plusWhat = parseFloat(req.rating);
              if (plusWhat < 10 && req.isLiked) {
                plusWhat =
                  parseFloat(req.rating) < 3
                    ? (parseFloat(req.rating) + 0.5).toFixed(1)
                    : parseFloat(req.rating) < 6
                    ? (parseFloat(req.rating) + 0.3).toFixed(1)
                    : parseFloat(req.rating) < 8
                    ? (parseFloat(req.rating) + 0.2).toFixed(1)
                    : (parseFloat(req.rating) + 0.1).toFixed(1);
              } else if (plusWhat > 0 && !req.isLiked) {
                plusWhat =
                  parseFloat(req.rating) < 3
                    ? (parseFloat(req.rating) - 0.5).toFixed(1)
                    : parseFloat(req.rating) < 6
                    ? (parseFloat(req.rating) - 0.3).toFixed(1)
                    : parseFloat(req.rating) < 8
                    ? (parseFloat(req.rating) - 0.2).toFixed(1)
                    : (parseFloat(req.rating) - 0.1).toFixed(1);
              }
              pool.pool.query(
                "UPDATE torrents SET rating = $1 WHERE id = $2",
                [plusWhat <= 0 ? 0 : plusWhat >= 10 ? 10 : plusWhat, req.movie],
                (error, resultUpdate) => {
                  if (error) {
                    resolve({ msg: error });
                  }
                  if (resultUpdate.rowCount) {
                    resolve({ torrents: true });
                  } else {
                    resolve({ msg: "Unable to update your like" });
                  }
                }
              );
            } else {
              resolve({ msg: "Unable to update your like" });
            }
          }
        );
      }
    );
  });
};

const getUserLikes = (request, response) => {
  const { req } = request;
  return new Promise((resolve, reject) => {
    pool.pool.query(
      "SELECT l.*, t.* FROM likes l INNER JOIN torrents t ON l.movie_id = t.id WHERE user_id = $1;",
      [req.id],
      (error, results) => {
        if (error) {
          resolve({ msg: error });
        }
        if (!results.rowCount) {
          resolve({ likes: false });
        } else {
          resolve(results.rows);
        }
      }
    );
  });
};

module.exports = {
  likeTorrent,
  getUserLikes,
};
