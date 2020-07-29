const pool = require("./../pool.js");

const getLoggedUser = (request, response) => {
  const { token } = request;
  return new Promise((resolve, reject) => {
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
  return new Promise((resolve, reject) => {
    pool.pool.query(
      "SELECT username, firstname, lastname, connected, last_connection, language, photos FROM users WHERE id = $1;",
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

// Get torrents for profile page
const getUserTorrents = (request, response) => {
  const { token } = request;
  return new Promise((resolve, reject) => {
    if (token) {
      pool.pool.query(
        "SELECT t.id, t.title, t.cover_url, t.rating, t.production_year, l.liked, v.viewed_at as viewed_at, c.comment FROM torrents t LEFT JOIN likes l ON l.movie_id = t.id LEFT JOIN views v ON v.movie_id = t.id LEFT JOIN comments c ON c.video_id = t.id WHERE ((l.user_id = (SELECT id FROM users WHERE connected_token = $1)) OR (v.user_id = (SELECT id FROM users WHERE connected_token = $2)) OR (c.user_id = (SELECT id FROM users WHERE connected_token = $3)));",
        [token, token, token],
        (error, results) => {
          if (error) {
            resolve({ msg: error });
          }
          if (!results.rowCount) {
            resolve({ torrents: false });
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

module.exports = { getLoggedUser, getUserInfos, getUserTorrents };
