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
      "SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration, production_year FROM ((SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration FROM (SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration, ts_rank_cd(search_vector, ts_query, 1) AS score FROM torrents, plainto_tsquery($1) ts_query) query WHERE score > 0 ORDER BY score DESC) UNION ALL (SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration FROM torrents WHERE title ILIKE $2)) query WHERE rating BETWEEN $3 AND $4 AND production_year BETWEEN $5 AND $6 GROUP BY id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration",
      [
        req.query,
        likeQuery,
        req.selectedRating[0],
        req.selectedRating[1],
        req.selectedYear[0],
        req.selectedYear[1],
      ],
      (error, results) => {
        if (error) {
          reject(error);
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
            "SELECT * FROM torrents WHERE categories::text ILIKE $1 ORDER BY random() LIMIT 15;",
            [query],
            (error, resultsFirstList) => {
              if (error) {
                resolve({
                  msg: error,
                });
              }
              if (resultsFirstList.rowCount) {
                query = `%${resRandomCategories.rows[1].category}%`;
                pool.pool.query(
                  "SELECT * FROM torrents WHERE categories::text ILIKE $1 ORDER BY random() LIMIT 15;",
                  [query],
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

module.exports = {
  getQueryTorrents,
  getTorrentInfos,
  getRandomTorrents,
  getTorrentSettings,
};
