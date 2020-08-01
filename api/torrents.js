const fs = require("fs");
const chalk = require("chalk");
const moment = require("moment");
const pool = require("./../pool.js");

const buildFilter = (filter) => {
  let query = {};
  for (let keys in filter) {
    if (
      filter[keys] &&
      filter[keys].constructor === Array &&
      filter[keys].length > 0
    ) {
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
              (req.selectedSubs && req.selectedSubs.length) ||
              (req.selectedCasts && req.selectedCasts.length)
            ) {
              req.selectedLanguage =
                req.selectedLanguage && req.selectedLanguage.length
                  ? req.selectedLanguage.map((e) => e.value)
                  : req.selectedLanguage;
              req.selectedCategories =
                req.selectedCategories && req.selectedCategories.length
                  ? req.selectedCategories.map((e) => e.value)
                  : req.selectedCategories;
              req.selectedSubs =
                req.selectedSubs && req.selectedSubs.length
                  ? req.selectedSubs.map((e) => e.value)
                  : req.selectedSubs;
              req.selectedCasts =
                req.selectedCasts && req.selectedCasts.length
                  ? req.selectedCasts.map((e) => e.value)
                  : req.selectedCasts;
              let torrents = [];
              let i = 0;
              let query = buildFilter({
                languages: req.selectedLanguage,
                categories: req.selectedCategories,
                subtitles: req.selectedSubs,
                casts: req.selectedCasts,
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
                  } else if (
                    key === "casts" &&
                    results.rows[i] &&
                    results.rows[i][key]
                  ) {
                    item = JSON.parse(results.rows[i][key]).map((e) => e.name);
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
      "SELECT * FROM (SELECT json_array_elements(categoriesDetailed::json)->>'category' as category, json_array_elements(categoriesDetailed::json)->>'french' as french, json_array_elements(categoriesDetailed::json)->>'english' as english FROM settings) as parseCategories WHERE french::int > 0 AND english::int > 0 ORDER BY random() LIMIT 2;",
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
      "SELECT minProductionYear, maxProductionYear, categories, languages, subtitles, casts FROM settings;",
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

const getCasts = (request, response) => {
  const { req } = request;
  return new Promise((resolve, reject) => {
    pool.pool.query("SELECT casts FROM settings;", (error, results) => {
      if (error) {
        resolve({ msg: error });
      }
      if (!results) {
        resolve({ msg: "Error while fetching torrents settings" });
      } else {
        if (results.rowCount) {
          let casts = [];
          JSON.parse(results.rows[0].casts).map((el) => {
            if (el.toLowerCase().includes(req.name.toLowerCase())) {
              casts.push({ label: el, value: el });
            }
          });
          resolve({ casts: casts });
        } else {
          resolve({ casts: [] });
        }
      }
    });
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
    pool.pool.query(
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
    pool.pool.query(
      "SELECT id, torrents FROM torrents ORDER BY id;",
      (error, results) => {
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
              let path = "./client" + torrents[j].path;
              if (
                torrents[j].downloaded &&
                path &&
                fs.existsSync(path) &&
                moment(torrents[j].delete_at).isSame(moment(), "day")
              ) {
                updated++;
                torrents[j].downloaded = false;
                torrents[j].path = null;
                torrents[j].downloaded_at = null;
                torrents[j].lastviewed_at = null;
                torrents[j].delete_at = null;
                doCleanUpUpdate({
                  torrents: torrents,
                  id: results.rows[i].id,
                })
                  .then((resUpdate) => {
                    if (resUpdate) {
                      fs.unlinkSync(path);
                    } else {
                      resolve({
                        state: true,
                        updated: updated,
                        msg:
                          "Error while doing maintenance on torrent:" +
                          results.rows[i].id,
                      });
                    }
                  })
                  .catch((err) => {
                    resolve({
                      state: true,
                      updated: updated,
                      msg:
                        "Error while doing maintenance on torrent:" +
                        results.rows[i].id +
                        err,
                    });
                  });
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
      }
    );
  });
};

const getMaintenanceTorrents = () => {
  return new Promise((resolve, reject) => {
    pool.pool.query("SELECT * FROM torrents;", (error, results) => {
      if (error) {
        resolve({
          state: false,
          msg: "Error while getting torrents",
        });
      }
      if (results.rowCount) {
        let movies = [];
        let i = 0;
        while (i < results.rows.length) {
          movies.push({
            id: results.rows[i].id,
            yts_id: results.rows[i].yts_id,
            torrent9_id: results.rows[i].torrent9_id,
            title: results.rows[i].title,
            production_year: results.rows[i].production_year,
            rating: results.rows[i].rating,
            yts_url: results.rows[i].yts_url,
            torrent9_url: results.rows[i].torrent9_url,
            cover_url: results.rows[i].cover_url,
            summary: results.rows[i].summary,
            cast:
              results.rows[i].casts && results.rows[i].casts.length
                ? JSON.parse(results.rows[i].casts)
                : [],
            duration: results.rows[i].duration,
            imdb_code: results.rows[i].imdb_code,
            yt_trailer: results.rows[i].yt_trailer,
            categories:
              results.rows[i].categories && results.rows[i].categories.length
                ? JSON.parse(results.rows[i].categories)
                : [],
            languages:
              results.rows[i].languages && results.rows[i].languages.length
                ? JSON.parse(results.rows[i].languages)
                : [],
            subtitles:
              results.rows[i].subtitles && results.rows[i].subtitles.length
                ? JSON.parse(results.rows[i].subtitles)
                : [],
            torrents: JSON.parse(results.rows[i].torrents),
          });
          i++;
        }
        resolve({
          state: true,
          torrents: movies,
        });
      } else {
        resolve({ status: false, msg: "Unable to get torrent infos" });
      }
    });
  });
};

const insertIntoTorrents = (torrent) => {
  return new Promise((resolve, reject) => {
    pool.pool.query(
      "INSERT INTO torrents (search_vector, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, summary, imdb_code, yt_trailer, subtitles, duration, casts) VALUES(to_tsvector($1), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)",
      [
        torrent.title ? torrent.title : null,
        torrent.yts_id ? torrent.yts_id : null,
        torrent.torrent9_id ? torrent.torrent9_id : null,
        torrent.title ? torrent.title : null,
        torrent.production_year ? torrent.production_year : null,
        torrent.rating ? torrent.rating : 0,
        torrent.yts_url ? torrent.yts_url : null,
        torrent.torrent9_url ? torrent.torrent9_url : null,
        torrent.cover_url ? torrent.cover_url : null,
        torrent.categories ? JSON.stringify(torrent.categories) : null,
        torrent.languages ? JSON.stringify(torrent.languages) : null,
        torrent.torrents ? JSON.stringify(torrent.torrents) : null,
        torrent.summary ? torrent.summary : null,
        torrent.imdb_code ? torrent.imdb_code : null,
        torrent.yt_trailer ? torrent.yt_trailer : null,
        torrent.subtitles ? JSON.stringify(torrent.subtitles) : null,
        torrent.duration ? torrent.duration : null,
        torrent.cast ? JSON.stringify(torrent.cast) : null,
      ],
      (error, results) => {
        if (error) {
          resolve(error);
        } else {
          resolve(0);
        }
      }
    );
  });
};

const updateIntoTorrents = (torrent) => {
  return new Promise((resolve, reject) => {
    pool.pool.query(
      "UPDATE torrents SET subtitles = $1, languages = $2, torrents = $3 WHERE id = $4",
      [
        torrent.subtitles ? JSON.stringify(torrent.subtitles) : null,
        torrent.languages ? JSON.stringify(torrent.languages) : null,
        torrent.torrents ? JSON.stringify(torrent.torrents) : null,
        torrent.id,
      ],
      (error, results) => {
        if (error) {
          resolve(error);
        } else {
          resolve(0);
        }
      }
    );
  });
};

const addMaintenanceTorrents = (updatedTorrents) => {
  return new Promise((resolve, reject) => {
    Promise.all(updatedTorrents.new.map((e) => insertIntoTorrents(e)))
      .then((res) => {
        console.log(
          chalk.yellow(updatedTorrents.new.length),
          "TORRENTS HAVE BEEN ADDED TO TABLE torrents."
        );
        resolve({ status: true });
      })
      .catch((e) => {
        resolve({ status: false, msg: e });
      });
  });
};

const updateMaintenceTorrents = (updatedTorrents) => {
  return new Promise((resolve, reject) => {
    Promise.all(updatedTorrents.updated.map((e) => updateIntoTorrents(e)))
      .then((res) => {
        console.log(
          chalk.yellow(updatedTorrents.updated.length),
          "TORRENTS HAVE BEEN UPDATED IN TABLE torrents."
        );
        resolve({ status: true });
      })
      .catch((e) => {
        resolve({ status: false, msg: e });
      });
  });
};

module.exports = {
  addMaintenanceTorrents,
  updateMaintenceTorrents,
  getMaintenanceTorrents,
  getQueryTorrents,
  getTorrentInfos,
  getRandomTorrents,
  getTorrentSettings,
  doCleanUpMaintenance,
  getCasts,
};
