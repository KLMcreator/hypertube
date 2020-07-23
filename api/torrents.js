const pool = require("./../pool.js");

const buildFilter = (filter) => {
  let query = {};
  for (let keys in filter) {
    if (filter[keys].constructor === Array && filter[keys].length > 0) {
      query[keys] = filter[keys];
    }
  }
  return query;
};

const getQueryTorrents = (request, response) => {
  const { req } = request;
  return new Promise(function (resolve, reject) {
    let likeQuery = req.query ? "%" + req.query + "%" : "%%";
    pool.pool.query(
      "SELECT query.id, query.yts_id, query.torrent9_id, query.title, query.production_year, query.rating, query.yts_url, query.torrent9_url, query.cover_url, query.categories, query.languages, query.torrents, query.large_cover_url, query.production_year, query.summary, query.imdb_code, query.yt_trailer, query.subtitles, query.duration, l.liked as isLiked FROM ((SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration FROM (SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration, ts_rank_cd(search_vector, ts_query, 1) AS score FROM torrents, plainto_tsquery($1) ts_query) query WHERE score > 0 ORDER BY score DESC) UNION ALL (SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration FROM torrents WHERE title ILIKE $2)) query LEFT JOIN likes l ON l.movie_id = query.id AND l.user_id = $3 WHERE query.rating BETWEEN $4 AND $5 AND query.production_year BETWEEN $6 AND $7 GROUP BY query.id, query.yts_id, query.torrent9_id, query.title, query.production_year, query.rating, query.yts_url, query.torrent9_url, query.cover_url, query.categories, query.languages, query.torrents, query.large_cover_url, query.summary, query.imdb_code, query.yt_trailer, query.subtitles, query.duration, l.liked;",
      [
        req.query,
        likeQuery,
        req.loggedId,
        req.selectedRating[0],
        req.selectedRating[1],
        req.selectedYear[0],
        req.selectedYear[1],
      ],
      (error, results) => {
        if (error) {
          resolve({ msg: error });
        }
        if (!results) {
          resolve({ msg: "Error while fetching torrent query" });
        } else {
          if (
            (req.selectedCategories && req.selectedCategories.length) ||
            (req.selectedLanguage && req.selectedLanguage.length) ||
            (req.selectedSubs && req.selectedSubs.length)
          ) {
            req.selectedLanguage = req.selectedLanguage.map((e) => e.value);
            req.selectedCategories = req.selectedCategories.map((e) => e.value);
            req.selectedSubs = req.selectedSubs.map((e) => e.value);
            let torrents = [];
            let i = 0;
            let query = buildFilter({
              languages: req.selectedLanguage,
              categories: req.selectedCategories,
              subtitles: req.selectedSubs,
            });
            while (torrents.length < req.limit && i < results.rowCount) {
              let isAble = true;
              for (let key in query) {
                let item = [];
                if (key === "subtitles") {
                  item = JSON.parse(results.rows[i][key]).map(
                    (e) => e.language
                  );
                } else {
                  item = JSON.parse(results.rows[i][key]);
                }
                if (
                  item === null ||
                  item === undefined ||
                  !query[key].some((i) => item.indexOf(i) >= 0)
                ) {
                  isAble = false;
                }
              }
              if (isAble) {
                torrents.push(results.rows[i]);
              }
              i++;
            }
            resolve({ torrents: torrents });
          } else {
            let torrents = [];
            let i = 0;
            while (torrents.length < req.limit && i < results.rowCount) {
              torrents.push(results.rows[i]);
              i++;
            }
            resolve({ torrents: torrents });
          }
        }
      }
    );
  });
};

const getRandomTorrents = (request, response) => {
  const { req } = request;
  return new Promise(function (resolve, reject) {
    pool.pool.query(
      "SELECT * FROM (SELECT json_array_elements(categories::json)->>'label' as category FROM settings) as parseCategories ORDER BY random() LIMIT 2;",
      (error, resRandomCategories) => {
        if (error) {
          resolve({
            msg: error,
          });
        }
        if (resRandomCategories.rowCount === 2) {
          let query = `%${resRandomCategories.rows[0].category}%`;
          pool.pool.query(
            "SELECT t.id, t.yts_id, t.torrent9_id, t.title, t.production_year, t.rating, t.yts_url, t.torrent9_url, t.cover_url, t.categories, t.languages, t.torrents, t.large_cover_url, t.production_year, t.summary, t.imdb_code, t.yt_trailer, t.subtitles, t.duration, l.liked as isLiked FROM torrents t LEFT JOIN likes l ON l.movie_id = t.id AND l.user_id = $1 WHERE categories::text ILIKE $2 ORDER BY l.id LIMIT 15;",
            [req.loggedId, query],
            (error, resultsFirstList) => {
              if (error) {
                resolve({
                  msg: error,
                });
              }
              if (resultsFirstList.rowCount) {
                query = `%${resRandomCategories.rows[1].category}%`;
                pool.pool.query(
                  "SELECT t.id, t.yts_id, t.torrent9_id, t.title, t.production_year, t.rating, t.yts_url, t.torrent9_url, t.cover_url, t.categories, t.languages, t.torrents, t.large_cover_url, t.production_year, t.summary, t.imdb_code, t.yt_trailer, t.subtitles, t.duration, l.liked as isLiked FROM torrents t LEFT JOIN likes l ON l.movie_id = t.id AND l.user_id = $1 WHERE categories::text ILIKE $2 ORDER BY l.id LIMIT 15;",
                  [req.loggedId, query],
                  (error, resultsSecondList) => {
                    if (error) {
                      resolve({
                        msg: error,
                      });
                    }
                    if (resultsSecondList.rowCount) {
                      resolve({
                        torrents: resultsFirstList.rows,
                        randomTorrents: resultsSecondList.rows,
                        categories: [
                          resRandomCategories.rows[0].category,
                          resRandomCategories.rows[1].category,
                        ],
                      });
                    } else {
                      resolve({
                        msg:
                          "Error while fetching torrents from second random category",
                      });
                    }
                  }
                );
              } else {
                resolve({
                  msg:
                    "Error while fetching torrents from first random category",
                });
              }
            }
          );
        } else {
          resolve({ msg: "Error while fetching random categories" });
        }
      }
    );
  });

  //   return new Promise(function (resolve, reject) {
  //     pool.pool.query("SELECT COUNT (id) FROM torrents;", (error, results) => {
  //       if (error) {
  //         reject(error);
  //       }
  //       if (results.rowCount) {
  //         pool.pool.query(
  //           "SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, large_cover_url, summary, imdb_code, yt_trailer, duration, subtitles FROM torrents OFFSET (SELECT floor(random() * (SELECT count(id) FROM torrents) + 1)::int) LIMIT 15;",
  //           (error, results) => {
  //             if (error) {
  //               reject(error);
  //             }
  //             if (results.rowCount) {
  //               resolve({
  //                 torrents: results.rows,
  //                 randomTorrents: results.rows,
  //               });
  //             } else {
  //               resolve({ msg: "Error while fetching total torrents" });
  //             }
  //           }
  //         );
  //       } else {
  //         resolve({ msg: "Error while fetching total torrents" });
  //       }
  //     });
  //   });
};

const getTorrentSettings = (request, response) => {
  return new Promise(function (resolve, reject) {
    pool.pool.query(
      "SELECT minProductionYear, maxProductionYear, categories, languages, subtitles FROM settings;",
      (error, results) => {
        if (error) {
          reject(error);
        }
        if (results.rowCount) {
          resolve({ settings: results.rows });
        } else {
          resolve({ msg: "Error while fetching torrents settings" });
        }
      }
    );
  });
};

const getTorrentInfos = (request, response) => {
  const { req } = request;
  return new Promise(function (resolve, reject) {
    pool.pool.query(
      "SELECT * FROM torrents where id = $1;",
      [req.id],
      (error, results) => {
        if (error) {
          reject(error);
        }
        if (results.rowCount) {
          resolve({ torrents: results.rows });
        } else {
          resolve({ msg: "Unable to get torrent infos" });
        }
      }
    );
  });
};

const likeTorrent = (request, response) => {
  const { req, token } = request;
  return new Promise(function (resolve, reject) {
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
              if (plusWhat < 10) {
                if (req.isLiked) {
                  plusWhat =
                    parseFloat(req.rating) < 3
                      ? (parseFloat(req.rating) + 0.5).toFixed(1)
                      : parseFloat(req.rating) < 6
                      ? (parseFloat(req.rating) + 0.3).toFixed(1)
                      : parseFloat(req.rating) < 8
                      ? (parseFloat(req.rating) + 0.2).toFixed(1)
                      : (parseFloat(req.rating) + 0.1).toFixed(1);
                } else {
                  plusWhat =
                    parseFloat(req.rating) < 3
                      ? (parseFloat(req.rating) - 0.5).toFixed(1)
                      : parseFloat(req.rating) < 6
                      ? (parseFloat(req.rating) - 0.3).toFixed(1)
                      : parseFloat(req.rating) < 8
                      ? (parseFloat(req.rating) - 0.2).toFixed(1)
                      : (parseFloat(req.rating) - 0.1).toFixed(1);
                }
              }
              pool.pool.query(
                "UPDATE torrents SET rating = $1 WHERE id = $2",
                [plusWhat <= 10 ? plusWhat : 10, req.movie],
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

module.exports = {
  getQueryTorrents,
  getTorrentInfos,
  getRandomTorrents,
  getTorrentSettings,
  likeTorrent,
};
