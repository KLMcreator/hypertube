const fs = require("fs");
const moment = require("moment");
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
  return new Promise((resolve, reject) => {
    let likeQuery = req.query ? "%" + req.query + "%" : "%%";
    pool.pool.query(
      "SELECT query.id, query.yts_id, query.torrent9_id, query.title, query.production_year, query.rating, query.yts_url, query.torrent9_url, query.cover_url, query.categories, query.languages, query.torrents, query.production_year, query.summary, query.imdb_code, query.yt_trailer, query.subtitles, query.duration, query.casts, l.liked as isLiked, v.viewed_at as viewed_at FROM ((SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, summary, imdb_code, yt_trailer, subtitles, duration, casts FROM (SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, summary, imdb_code, yt_trailer, subtitles, duration, casts, ts_rank_cd(search_vector, ts_query, 1) AS score FROM torrents, plainto_tsquery($1) ts_query) query WHERE score > 0 ORDER BY score DESC) UNION ALL (SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, summary, imdb_code, yt_trailer, subtitles, duration, casts FROM torrents WHERE title ILIKE $2)) query LEFT JOIN likes l ON l.movie_id = query.id AND l.user_id = $3 LEFT JOIN views v ON v.movie_id = query.id AND v.user_id = $4 WHERE query.rating BETWEEN $5 AND $6 AND query.production_year BETWEEN $7 AND $8 GROUP BY query.id, query.yts_id, query.torrent9_id, query.title, query.production_year, query.rating, query.yts_url, query.torrent9_url, query.cover_url, query.categories, query.languages, query.torrents, query.summary, query.imdb_code, query.yt_trailer, query.subtitles, query.duration, query.casts, l.liked, v.viewed_at;",
      [
        req.query,
        likeQuery,
        req.loggedId,
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
          if (results.rowCount) {
            if (
              (req.selectedCategories && req.selectedCategories.length) ||
              (req.selectedLanguage && req.selectedLanguage.length) ||
              (req.selectedSubs && req.selectedSubs.length)
            ) {
              req.selectedLanguage = req.selectedLanguage.map((e) => e.value);
              req.selectedCategories = req.selectedCategories.map(
                (e) => e.value
              );
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
                  if (
                    key === "subtitles" &&
                    results.rows[i] &&
                    results.rows[i][key]
                  ) {
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
          } else {
            resolve({ torrents: [] });
          }
        }
      }
    );
  });
};

const getRandomTorrents = (request, response) => {
  const { req } = request;
  return new Promise((resolve, reject) => {
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
            "SELECT t.id, t.yts_id, t.torrent9_id, t.title, t.production_year, t.rating, t.yts_url, t.torrent9_url, t.cover_url, t.categories, t.languages, t.torrents, t.production_year, t.summary, t.imdb_code, t.yt_trailer, t.subtitles, t.duration, t.casts, l.liked as isLiked, v.viewed_at as viewed_at FROM torrents t LEFT JOIN likes l ON l.movie_id = t.id AND l.user_id = $1 LEFT JOIN views v ON v.movie_id = t.id AND v.user_id = $2 WHERE categories::text ILIKE $3 AND t.languages LIKE '%' || (SELECT language FROM users WHERE id = $4) || '%' ORDER BY l.id LIMIT 15;",
            [req.loggedId, req.loggedId, query, req.loggedId],
            (error, resultsFirstList) => {
              if (error) {
                resolve({
                  msg: error,
                });
              }
              if (resultsFirstList.rowCount) {
                query = `%${resRandomCategories.rows[1].category}%`;
                pool.pool.query(
                  "SELECT t.id, t.yts_id, t.torrent9_id, t.title, t.production_year, t.rating, t.yts_url, t.torrent9_url, t.cover_url, t.categories, t.languages, t.torrents, t.production_year, t.summary, t.imdb_code, t.yt_trailer, t.subtitles, t.duration, t.casts, l.liked as isLiked, v.viewed_at as viewed_at FROM torrents t LEFT JOIN likes l ON l.movie_id = t.id AND l.user_id = $1 LEFT JOIN views v ON v.movie_id = t.id AND v.user_id = $2 WHERE categories::text ILIKE $3 AND t.languages LIKE '%' || (SELECT language FROM users WHERE id = $4) || '%' ORDER BY l.id LIMIT 15;",
                  [req.loggedId, req.loggedId, query, req.loggedId],
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
};

const getTorrentSettings = (request, response) => {
  return new Promise((resolve, reject) => {
    pool.pool.query(
      "SELECT minProductionYear, maxProductionYear, categories, languages, subtitles FROM settings;",
      (error, results) => {
        if (error) {
          resolve({ msg: error });
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
  return new Promise((resolve, reject) => {
    pool.pool.query(
      "SELECT * FROM torrents where id = $1;",
      [req.id],
      (error, results) => {
        if (error) {
          resolve({ msg: error });
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

const doCleanUpUpdate = (torrent) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE torrents SET torrents = $1 WHERE id = $2",
      [JSON.stringify(torrent.torrents), torrent.id],
      (error, results) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      }
    );
  });
};

const doCleanUpMaintenance = (request, response) => {
  return new Promise((resolve, reject) => {
    pool.pool.query("SELECT id, torrents FROM torrents;", (error, results) => {
      if (error) {
        resolve({
          state: true,
          updated: 0,
          msg: "Error while getting torrents",
        });
      }
      if (results.rowCount) {
        let i = 0;
        let updated = 0;
        while (i < results.rows.length) {
          let torrents = JSON.parse(results.rows[i].torrents);
          let j = 0;
          while (j < torrents.length) {
            if (
              torrents[j].downloaded &&
              torrents[j].path &&
              fs.existsSync(torrents[j].path) &&
              torrents[j].delete_at.isSame(moment(), "day")
            ) {
              updated++;
              torrents[j].downloaded = false;
              torrents[j].path = null;
              torrents[j].downloaded_at = null;
              torrents[j].lastviewed_at = null;
              torrents[j].delete_at = null;
              if (
                !fs.unlinkSync(torrents[j].path) ||
                !doCleanUpUpdate({ torrents: torrents, id: results.rows[i].id })
              ) {
                resolve({
                  state: true,
                  updated: updated,
                  msg:
                    "Error while doing maintenance on torrent:" +
                    results.rows[i].id,
                });
              }
            }
            j++;
          }
          i++;
        }
        resolve({
          state: true,
          updated: updated,
          msg: "Maintenance finished, see you in 12 hours.",
        });
      } else {
        resolve({ msg: "Unable to get torrent infos" });
      }
    });
  });
};

module.exports = {
  getQueryTorrents,
  getTorrentInfos,
  getRandomTorrents,
  getTorrentSettings,
  doCleanUpMaintenance,
};
