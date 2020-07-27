const moment = require("moment");
const pool = require("./../pool.js");

const setViewed = (request, response) => {
  const { req, token } = request;
  return new Promise((resolve, reject) => {
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
              resolve({ msg: error });
            }
            if (resultInsert.rowCount) {
              pool.pool.query(
                "SELECT torrents FROM torrents WHERE id = $1",
                [req.movie],
                (error, resultGetTorrents) => {
                  if (error) {
                    resolve({ msg: error });
                  }
                  if (resultGetTorrents.rowCount) {
                    let torrents = JSON.parse(
                      resultGetTorrents.rows[0].torrents
                    );
                    let id = torrents.findIndex((e) => e.id === req.torrent);
                    torrents[id].lastviewed_at = moment();
                    torrents[id].delete_at = moment(moment()).add(1, "M");
                    pool.pool.query(
                      "UPDATE torrents SET torrents = $1 WHERE id = $2",
                      [JSON.stringify(torrents), req.id],
                      (error, resultGetTorrents) => {
                        if (error) {
                          resolve({ msg: error });
                        }
                        if (resultGetTorrents.rowCount) {
                          resolve({ views: true });
                        } else {
                          resolve({ msg: "Unable to update torrent state" });
                        }
                      }
                    );
                  } else {
                    resolve({ msg: "Unable to get torrents from movie id" });
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

const getUserViews = (request, response) => {
  const { req } = request;
  return new Promise((resolve, reject) => {
    pool.pool.query(
      "SELECT v.*, t.* FROM views v INNER JOIN torrents t ON v.movie_id = t.id WHERE user_id = $1;",
      [req.id],
      (error, results) => {
        if (error) {
          resolve({ msg: error });
        }
        if (!results.rowCount) {
          resolve({ views: false });
        } else {
          resolve(results.rows);
        }
      }
    );
  });
};

module.exports = {
  setViewed,
  getUserViews,
};
