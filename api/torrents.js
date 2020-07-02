const pool = require("./../pool.js");

const getQueryTorrents = (request, response) => {
  const { req } = request;
  return new Promise(function (resolve, reject) {
    // if (req.query) {
    let likeQuery = req.query ? "%" + req.query + "%" : "%%";
    pool.pool.query(
      "SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, downloaded_at, lastviewed_at, delete_at, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration FROM ((SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, downloaded_at, lastviewed_at, delete_at, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration FROM (SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, downloaded_at, lastviewed_at, delete_at, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration, ts_rank_cd(search_vector, ts_query, 1) AS score FROM torrents, plainto_tsquery($1) ts_query) query WHERE score > 0 ORDER BY score DESC) UNION ALL (SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, downloaded_at, lastviewed_at, delete_at, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration FROM torrents WHERE title ILIKE $2)) query WHERE rating BETWEEN $3 AND $4 AND production_year BETWEEN $5 AND $6 GROUP BY id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, downloaded_at, lastviewed_at, delete_at, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration",
      [
        req.query,
        likeQuery,
        req.selectedRating[0].toString(),
        req.selectedRating[1].toString(),
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
            while (torrents.length < req.limit && i < results.rowCount) {
              let languages = JSON.parse(results.rows[i].languages);
              let categories = JSON.parse(results.rows[i].categories);
              let subtitles = JSON.parse(results.rows[i].subtitles);
              let found_language = languages.filter(
                (language) => req.selectedLanguage.indexOf(language) >= 0
              );
              let found_subtitles = subtitles.filter((subtitle) => {
                return req.selectedSubs.findIndex(
                  (subs) => subtitle.language === subs
                );
              });
              let found_category = categories.filter(
                (category) => req.selectedCategories.indexOf(category) >= 0
              );
              if (
                (req.selectedLanguage &&
                  req.selectedLanguage.length &&
                  found_language.length) ||
                (req.selectedCategories &&
                  req.selectedCategories.length &&
                  found_category.length) ||
                (req.selectedSubs &&
                  req.selectedSubs.length &&
                  found_subtitles.length)
              ) {
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
    // } else {
    //   resolve({ msg: "Missing arguments" });
    // }
  });
};

const getRandomTorrents = (request, response) => {
  return new Promise(function (resolve, reject) {
    pool.pool.query("SELECT COUNT (id) FROM torrents;", (error, results) => {
      if (error) {
        reject(error);
      }
      if (results.rowCount) {
        pool.pool.query(
          "SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, downloaded_at, lastviewed_at, delete_at, large_cover_url, summary, imdb_code, yt_trailer, duration, subtitles FROM torrents OFFSET (SELECT floor(random() * (SELECT count(id) FROM torrents) + 1)::int) LIMIT 15;",
          (error, results) => {
            if (error) {
              reject(error);
            }
            if (results.rowCount) {
              resolve({ torrents: results.rows });
            } else {
              resolve({ msg: "Error while fetching total torrents" });
            }
          }
        );
      } else {
        resolve({ msg: "Error while fetching total torrents" });
      }
    });
  });
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

module.exports = { getQueryTorrents, getRandomTorrents, getTorrentSettings };
