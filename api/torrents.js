const pool = require("./../pool.js");
const router = require("express").Router();
const ts = require("torrent-stream");
// const path = require("path");
// const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
// const ffmpeg = require("fluent-ffmpeg");
// ffmpeg.setFfmpegPath(ffmpegPath);
// const pump = require("pump");
// const fs = require("fs");

// let currentDownloads = {
//   torrent9: {},
//   yts: {},
// };

// const config = {
//   connections: 100, // Max amount of peers to be connected to.
//   uploads: 10, // Number of upload slots.
//   tmp: "./torrents/tmp/", // Root folder for the files storage.
//   // Defaults to '/tmp' or temp folder specific to your OS.
//   // Each torrent will be placed into a separate folder under /tmp/torrent-stream/{infoHash}
//   path: "./torrents/downloads/", // Where to save the files. Overrides `tmp`.
//   verify: true, // Verify previously stored data before starting
//   // Defaults to true
//   dht: true, // Whether or not to use DHT to initialize the swarm.
//   // Defaults to true
//   tracker: true, // Whether or not to use trackers from torrent file or magnet link
//   // Defaults to true
//   // trackers: [
//   //     'udp://tracker.openbittorrent.com:80',
//   //     'udp://tracker.ccc.de:80'
//   // ],
//   // Allows to declare additional custom trackers to use
//   // Defaults to empty
//   // storage: myStorage()  // Use a custom storage backend rather than the default disk-backed one
// };

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

// const convertVideo = async (source, identifier, path) => {
//   let runningConvert = {};
//   let outputPath =
//     "./torrents/downloads/" + path.split("/").pop() + "_hypertube.webm";

//   if (!runningConvert[path]) {
//     console.log("convertVideo: starting running for ", path);
//     runningConvert[path] = true;
//   } else {
//     console.log("convertVideo: already running for ", path);
//     return Promise.resolve("ALREADY_DONE");
//   }

//   return new Promise((resolve, reject) => {
//     let output = new ffmpeg(path)
//       .videoCodec("libvpx")
//       .outputOptions(["-deadline realtime"])
//       .audioCodec("libvorbis")
//       .audioBitrate(128)
//       .output(outputPath);

//     output.on("stderr", (stderr) => {
//       console.log("ffmpeg stderr:", stderr);
//     });

//     output.on("error", (err) => {
//       console.log("Error while converting: ", err);
//       runningConvert[path] = null;
//       reject("err", err);
//     });

//     output.on("end", async () => {
//       console.log("Finished converting video");
//       runningConvert[path] = null;

//       // update db with new path and bool downloaded true
//       // await setVideoPath(source, identifier, outputPath);
//       // await setVideoComplete(source, identifier);

//       resolve("OK");
//     });

//     output.run();
//   });
// };

// const startDownload = async (torrent) => {
//   // If download has already started
//   if (currentDownloads[torrent.source][torrent.magnet]) {
//     console.log("Torrent download was already started, continuing..");
//     return Promise.resolve(currentDownloads[torrent.source][torrent.magnet]);
//   }

//   // Promise will be resolved when we start the download of the file
//   return new Promise((resolve) => {
//     console.log("Download started");
//     let engine = ts(torrent.magnet, config);
//     let dlFile = null;
//     //   let subs = [];
//     let resolved = false;
//     let res;

//     engine.on("ready", () => {
//       for (let file of engine.files) {
//         console.log(`Found file ${file.name}`);
//         let ext = file.name.split(".").pop();
//         let allowedExts = ["mp4", "mkv", "webm", "avi"];

//         if (ext.toLowerCase() === "srt") {
//           console.log("Engine downloading subtitle file:", file.__proto__.name);
//           subs.push(file);
//           file.select();
//           continue;
//         }

//         // if file doesn't have one of allowedExts, don't download it
//         if (allowedExts.indexOf(ext.toLowerCase()) === -1) {
//           console.log("wrong extension");
//           file.deselect();
//           continue;
//         }

//         // Only download 1 file (the first video found in the torrent)
//         if (!dlFile) {
//           console.log("!dlFile");
//           dlFile = { file, complete: false };
//           // file.select();

//           res = {
//             ext,
//             source: torrent.source,
//             identifier: torrent.magnet,
//             file,
//           };

//           // Save currentDownload to avoid starting 2 downloads if client refresh
//           currentDownloads[torrent.source][torrent.magnet] = res;
//         }
//       }
//       // start video dl now if no subs, otherwise dl will start after subs are downloaded
//       // if (!subs.length) {
//       dlFile.file.select();
//       resolved = true;
//       return resolve(res);
//       // }
//     });

//     engine.on("download", (info) => {
//       // debug('downloading subs: ', subs.map(sub => sub.__proto__));
//       // debug(`Engine on download (${torrent.source}:${torrent.magnet}) - ${info} (total: ${dlFile.file.length})`);
//       //
//       // debug('swarm dl', engine.swarm.downloaded);
//     });

//     engine.on("idle", async () => {
//       console.log("Engine idle");

//       // subs are finished
//       if (dlFile && !dlFile.complete && !resolved) {
//         //   await saveSubs(torrent.source, torrent.magnet, subs);

//         console.log("Engine starting download of", dlFile.file.__proto__);
//         dlFile.file.select();
//         resolved = true;
//         resolve(res);
//       }

//       // video is finished
//       else {
//         dlFile.complete = true;
//         await convertVideo(
//           torrent.source,
//           torrent.magnet,
//           "./torrents/downloads/" + dlFile.file.path
//         );
//       }
//     });
//   });
// };

// const handleReadTorrent = (request, response) => {
//   const { torrent } = request.req;
//   return new Promise(async function (resolve, reject) {
//     await startDownload(torrent);
//     resolve(true);

//     // let subs = await torrentService.getSubs(source, identifier);
//     // subs.forEach((sub) => {
//     //     if (sub.path) sub.path = sub.path.split("/app/src/public")[1];
//     // });
//     // torrentInfos.subs = subs;
//     // debug("subs = ", subs);

//     // return res.json(util.formatResponse(true, null, torrentInfos));
//   });
// };

module.exports = {
  getQueryTorrents,
  getRandomTorrents,
  getTorrentSettings,
  //   handleReadTorrent,
};
