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

const getUserTorrents = (request, response) => {
  const { token } = request;
  return new Promise((resolve, reject) => {
    if (token) {
      pool.pool.query(
        "SELECT t.id, t.title, t.cover_url, t.rating, t.production_year, v.viewed_at as viewed_at, l.liked, c.comment FROM torrents t LEFT JOIN views v ON v.movie_id = t.id LEFT JOIN likes l ON l.movie_id = v.movie_id AND l.user_id = v.user_id LEFT JOIN comments c ON c.video_id = v.movie_id AND c.user_id = v.user_id WHERE v.user_id = (SELECT id FROM users WHERE connected_token = $1) ORDER BY v.viewed_at DESC;",
        [token],
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

const getCommentTorrents = (request, response) => {
  const token = request.token.id;
  return new Promise((resolve, reject) => {
    if (token) {
      pool.pool.query(
        "SELECT t.id, t.title, t.cover_url, t.rating, t.production_year, v.viewed_at as viewed_at, l.liked, c.comment FROM torrents t LEFT JOIN views v ON v.movie_id = t.id LEFT JOIN likes l ON l.movie_id = v.movie_id AND l.user_id = v.user_id LEFT JOIN comments c ON c.video_id = v.movie_id AND c.user_id = v.user_id WHERE v.user_id = $1 ORDER BY v.viewed_at DESC;",
        [token],
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

module.exports = {
  getLoggedUser,
  getUserInfos,
  getUserTorrents,
  getCommentTorrents,
};
