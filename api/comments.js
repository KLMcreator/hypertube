const pool = require("./../pool.js");

const getComments = (request, response) => {
  const { req } = request;
  return new Promise(function (resolve, reject) {
    if (req.id) {
      pool.pool.query(
        "SELECT c.id, c.user_id, u.username, u.photos, c.video_id, c.created_at, c.comment FROM comments c INNER JOIN users u ON u.id = c.user_id WHERE c.video_id = $1 ORDER BY id DESC;",
        [req.id],
        (error, results) => {
          if (error) {
            reject(error);
          }
          if (!results) {
            resolve({ msg: "Error while fetching comments" });
          } else {
            resolve({ comments: results.rows });
          }
        }
      );
    } else {
      resolve({ msg: "Missing arguments" });
    }
  });
};

const sendComment = (request, response) => {
  const { req, token } = request;
  return new Promise(function (resolve, reject) {
    if (req.video_id && req.comment && token) {
      req.comment = req.comment.trim();
      if (req.comment && req.comment.length < 300) {
        pool.pool.query(
          "INSERT INTO comments (user_id, video_id, created_at, comment) VALUES ((SELECT id FROM users WHERE connected_token = $1), $2, (SELECT NOW()), $3);",
          [token, req.video_id, req.comment],
          (error, results) => {
            if (error) {
              reject(error);
            }
            if (!results.rowCount) {
              resolve({
                msg: "Unable to send your comment.",
              });
            } else {
              resolve({ comments: true });
            }
          }
        );
      } else {
        if (req.comment && req.comment.length > 300) {
          resolve({ msg: "You dirty boy, it's 300 char max, I SAID." });
        } else {
          resolve({ msg: "Unable to send empty comments." });
        }
      }
    } else {
      resolve({ msg: "Unable to send your comment." });
    }
  });
};

module.exports = { getComments, sendComment };
