const fs = require("fs");
const pump = require("pump");
const path = require("path");
const moment = require("moment");
// const AdmZip = require("adm-zip");
const request = require("request");
const yauzl = require("yauzl");
const express = require("express");
const socket = require("./sockets");
const pool = require("./../pool.js");
const srt2vtt = require("srt-to-vtt");
const ffmpeg = require("fluent-ffmpeg");
const torrentStream = require("torrent-stream");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

const router = express.Router();
ffmpeg.setFfmpegPath(ffmpegPath);

let currentDownloads = {};

let currentConvert = {};

const config = {
  connections: 100,
  uploads: 10,
  tmp: "./client/src/assets/torrents/tmp/",
  path: "./client/src/assets/torrents/downloads/",
  verify: true,
};

const emmitToFront = (success, msg) => {
  socket.sockets.emit("torrentDownloader", {
    success: success,
    msg: msg,
    downloads: currentDownloads,
    converts: currentConvert,
  });
};

const updateTorrent = (torrent) => {
  return new Promise(function (resolve, reject) {
    pool.pool.query(
      "SELECT torrents FROM torrents where id = $1;",
      [torrent.movie],
      (error, resultSelect) => {
        if (error) {
          reject(error);
        }
        if (resultSelect.rowCount) {
          let torrents = JSON.parse(resultSelect.rows[0].torrents);
          let i = 0;
          let found = false;
          while (i < torrents.length) {
            if (torrents[i].id === torrent.torrent) {
              torrents[i].downloaded = true;
              torrents[i].path = torrent.path;
              torrents[i].downloaded_at = torrent.downloaded_at;
              torrents[i].lastviewed_at = torrent.lastviewed_at;
              torrents[i].delete_at = torrent.delete_at;
              found = true;
              break;
            }
            i++;
          }
          if (!found) {
            emmitToFront(
              false,
              `Error while saving, torrent not found: ${torrent.name}`
            );
            resolve(false);
          } else {
            pool.pool.query(
              "UPDATE torrents SET torrents = $1 WHERE id = $2;",
              [JSON.stringify(torrents), torrent.movie],
              (error, results) => {
                if (error) {
                  reject(error);
                }
                if (results.rowCount) {
                  resolve(true);
                } else {
                  emmitToFront(
                    false,
                    `Error while saving, movie not found: ${torrent.name}`
                  );
                  resolve(false);
                }
              }
            );
          }
        } else {
          emmitToFront(
            false,
            `Error while saving, movie not found: ${torrent.name}`
          );
          resolve(false);
        }
      }
    );
  });
};

const getMovieInfos = (movie) => {
  return new Promise(function (resolve, reject) {
    pool.pool.query(
      "SELECT * FROM torrents where id = $1;",
      [movie],
      (error, resultSelect) => {
        if (error) {
          emmitToFront(false, `Error while getting movie`);
          resolve(false);
        }
        if (resultSelect.rowCount) {
          resolve({ movie: resultSelect.rows[0] });
        } else {
          emmitToFront(false, `Error while getting movie`);
          resolve(false);
        }
      }
    );
  });
};

const getDownloadPercent = (el) => {
  const sortedEl = [...el].sort((a, b) => a - b);
  let last = 0;

  for (let i = 0; i < sortedEl.length; i += 1) {
    const chunk = sortedEl[i];
    last = chunk;

    if (!sortedEl.includes(chunk + 1)) return last;
  }
  return last;
};

router.get("/", (req, res) => {
  const { movie, torrent } = req.query;
  const hash = movie + "_" + torrent;
  try {
    let magnet =
      req.query.magnet + "&dn=" + req.query.dn + "&tr=" + req.query.tr;
    magnet = magnet.includes("btih")
      ? magnet.split("btih:")[1].split("&dn")[0]
      : magnet;
    let ext;
    let nbPieces;
    let dlFile = null;
    const loadedChunks = new Map();
    const allowedExts = [".mp4", ".mkv", ".webm", ".avi"];
    const engine = torrentStream(magnet, config);
    engine.on("ready", async () => {
      const file = engine.files.find(({ name }) =>
        allowedExts.some((ext) => name.endsWith(ext))
      );

      if (!file) {
        emmitToFront(false, "This file format is not supported yet");
        res.status(200);
      }

      if (!dlFile) {
        dlFile = { file };
      }

      dlFile.file.select();
      ext = file.name.split(".").pop();
      const stream = file.createReadStream();

      currentDownloads[hash] = {
        movie: movie,
        torrent: torrent,
        name: stream._engine.torrent.name,
        identifier: hash,
        ext: ext,
        path:
          "/src/assets/torrents/downloads/" +
          stream._engine.torrent.name +
          "/" +
          file.name,
        downloaded_at: moment().toString(),
        lastviewed_at: moment().toString(),
        delete_at: moment(moment()).add(1, "M").toString(),
      };

      if (ext === "mp4" || ext === "mkv") {
        emmitToFront(
          true,
          `Download started, your stream will start shortly: ${currentDownloads[hash].name}`
        );
        pump(stream, res);
      } else {
        emmitToFront(
          true,
          `Downloading and converting the file as you watch it, the stream will start shortly: ${currentDownloads[hash].name}`
        );
        ffmpeg()
          .input(stream)
          .outputOptions("-movflags frag_keyframe+empty_moov")
          .outputFormat("mp4")
          .on("end", () => {
            emmitToFront(
              true,
              `Your file has been converted: ${currentDownloads[hash].name}`
            );
          })
          .on("error", (err) => {
            emmitToFront(
              false,
              `Error while converting file: ${currentDownloads[hash].name} - ${err.message}`
            );
          })
          .inputFormat(ext)
          .audioCodec("aac")
          .videoCodec("libx264")
          .pipe(res);
        res.on("close", () => {
          stream.destroy();
        });
      }
    });

    engine.on("torrent", ({ pieces }) => {
      nbPieces = pieces.length;
    });

    engine.on("download", (index, buffer) => {
      loadedChunks.set(index, buffer.length);

      const lastEl = getDownloadPercent([...loadedChunks.keys()]);
      const loadedBytes = [...loadedChunks.entries()]
        .sort(([a], [b]) => a - b)
        .reduce((bytesCount, [i, bytesLength]) => {
          if (i > lastEl) return bytesCount;

          return bytesCount + bytesLength;
        }, 0);

      const percent = (100 * lastEl) / nbPieces;

      const MIN_FILE_BYTES_DOWNLOADED_PERCENT = 2;

      if (
        loadedBytes >=
        (dlFile.file.size / 100) * MIN_FILE_BYTES_DOWNLOADED_PERCENT
      ) {
      } else {
        emmitToFront("progress", percent.toFixed(2));
      }
    });

    engine.on("idle", () => {
      emmitToFront(true, `Download finished: ${currentDownloads[hash].name}`);
      if (updateTorrent(currentDownloads[hash])) currentDownloads[hash] = null;
    });
  } catch (e) {
    emmitToFront(false, `Error while streaming: ${e.message}`);
    res.status(200);
  }
});

router.get("/subs", async (req, res) => {
  try {
    const { movie, torrent, url } = req.query;
    const infos = await getMovieInfos(movie);
    // check if this torrent is downloaded
    // check if this track is downloaded
    // get downloaded path or actual new path
    // do the job
    // console.log(infos);

    //     request(url)
    //   .pipe(fs.createWriteStream(''))
    //   .on('close', function () {
    //     console.log('File written!');
    //   });

    //     request.get({ url: url, encoding: null }, (err, res, body) => {
    //       yauzl.open(body, { lazyEntries: true }, (err, zipfile) => {
    //         if (err) throw err;
    //         zipfile.readEntry();
    //         zipfile.on("entry", (entry) => {
    //           const file = entry.find((el) =>
    //             allowedExts.some((ext) => el.entryName.endsWith(ext))
    //           );
    //           console.log(file);

    //           // if (/\/$/.test(entry.fileName)) {
    //           //   // Directory file names end with '/'.
    //           //   // Note that entires for directories themselves are optional.
    //           //   // An entry's fileName implicitly requires its parent directories to exist.
    //           //   zipfile.readEntry();
    //           // } else {
    //           //   // file entry
    //           //   zipfile.openReadStream(entry, (err, readStream) => {
    //           //     if (err) throw err;
    //           //     readStream.on("end", () => {
    //           //       zipfile.readEntry();
    //           //     });
    //           //     readStream.pipe(somewhere);
    //           //   });
    //           // }
    //         });
    //       });
    //     });

    // request.get({ url: url, encoding: null }, (err, res, body) => {
    //   const zip = new AdmZip(body);
    //   const zipEntries = zip.getEntries();
    //   const allowedExts = [".vtt", ".srt"];

    //   const file = zipEntries.find((el) =>
    //     allowedExts.some((ext) => el.entryName.endsWith(ext))
    //   );

    //   if (!file) {
    //     emmitToFront(false, `This subtitle file is corrupted`);
    //     res.status(200);
    //   }

    //       zipEntries.forEach((entry) => {
    //         if (entry.entryName.endsWith(ext))
    //           console.log(zip.readAsText(entry));
    //       }
    //     const { subfile } = req.query
    //     const files = status.torrents[0].name
    //     const { downloadDir } = status.torrents[0]
    //     const pathfile = path.join(downloadDir, files, subfile)
    //     await fileExist(pathfile)
    //     res.contentType('text/vtt')
    //     return fs.createReadStream(pathfile)
    //       .pipe(srt2vtt())
    //       .pipe(res)
    // });
  } catch (e) {
    emmitToFront(false, `Error while getting subs: ${e.message}`);
    res.status(200);
  }
});

module.exports = router;
