const pool = require("./../pool.js");

const ts = require("torrent-stream");
const path = require("path");

const config = {
  connections: 100, // Max amount of peers to be connected to.
  uploads: 10, // Number of upload slots.
  tmp: "./torrents/tmp/", // Root folder for the files storage.
  // Defaults to '/tmp' or temp folder specific to your OS.
  // Each torrent will be placed into a separate folder under /tmp/torrent-stream/{infoHash}
  path: "./torrents/downloads/", // Where to save the files. Overrides `tmp`.
  verify: true, // Verify previously stored data before starting
  // Defaults to true
  dht: true, // Whether or not to use DHT to initialize the swarm.
  // Defaults to true
  tracker: true, // Whether or not to use trackers from torrent file or magnet link
  // Defaults to true
  // trackers: [
  //     'udp://tracker.openbittorrent.com:80',
  //     'udp://tracker.ccc.de:80'
  // ],
  // Allows to declare additional custom trackers to use
  // Defaults to empty
  // storage: myStorage()  // Use a custom storage backend rather than the default disk-backed one
};

const types = {
  ".f4v": "video/mp4",
  ".f4p": "video/mp4",
  ".mp4": "video/mp4",
  ".ts": "video/mp2t",
  ".ogg": "video/ogg",
  ".mpa": "video/mpeg",
  ".mpe": "video/mpeg",
  ".mpg": "video/mpeg",
  ".mp2": "video/mpeg",
  ".webm": "video/webm",
  ".mpeg": "video/mpeg",
  ".mpv2": "video/mpeg",
  ".flv": "video/x-flv",
  ".qt": "video/quicktime",
  ".mkv": "video/matroska",
  ".asf": "video/x-ms-asf",
  ".asr": "video/x-ms-asf",
  ".asx": "video/x-ms-asf",
  ".avi": "video/x-msvideo",
  ".mov": "video/quicktime",
  ".movie": "video/x-sgi-movie",
};

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
      "SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, downloaded_at, lastviewed_at, delete_at, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration, production_year FROM ((SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, downloaded_at, lastviewed_at, delete_at, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration FROM (SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, downloaded_at, lastviewed_at, delete_at, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration, ts_rank_cd(search_vector, ts_query, 1) AS score FROM torrents, plainto_tsquery($1) ts_query) query WHERE score > 0 ORDER BY score DESC) UNION ALL (SELECT id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, downloaded_at, lastviewed_at, delete_at, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration FROM torrents WHERE title ILIKE $2)) query WHERE rating BETWEEN $3 AND $4 AND production_year BETWEEN $5 AND $6 GROUP BY id, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, downloaded_at, lastviewed_at, delete_at, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration",
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

const handleReadTorrent = (request, response) => {
  const { torrent } = request.req;
  return new Promise(function (resolve, reject) {
    const engine = ts(torrent.magnet, config);
    let files = [];

    engine.on("download", (piece) => {
      console.log(piece, "downloaded");
      console.log(engine.swarm.downloaded, "/", torrent.size);
    });

    engine.on("ready", () => {
      if (!engine.files.length) resolve({ msg: "Torrent is empty" });
      files = engine.files.sort((a, b) =>
        a.length > b.length ? -1 : a.length < b.length ? 1 : 0
      );
      //   console.log(files);
      //   engine.files.forEach((file) => {
      //     console.log(file.path);
      //     let ext = path.extname(file.path);
      //     if (types[ext]) {
      //       console.log([ext]);
      //       resolve({ file: file, ext: ext });
      //     }
      //   });
    });
  });
};

module.exports = {
  getQueryTorrents,
  getRandomTorrents,
  getTorrentSettings,
  handleReadTorrent,
};
