const fs = require("fs");
const pump = require("pump");
const https = require("https");
const moment = require("moment");
const express = require("express");
const socket = require("./sockets");
const pool = require("./../pool.js");
const srt2vtt = require("srt-to-vtt");
const ffmpeg = require("fluent-ffmpeg");
const StreamZip = require("node-stream-zip");
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
  if (
    socket.id &&
    socket.sockets.connected[socket.id] &&
    socket.sockets.connected[socket.id].connected &&
    (currentDownloads || currentConvert)
  )
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
          resolve({ msg: error });
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
                  resolve({ msg: error });
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

const updateTorrentSubtitle = (movie, lang, path) => {
  return new Promise(function (resolve, reject) {
    pool.pool.query(
      "SELECT subtitles FROM torrents where id = $1;",
      [movie],
      (error, resultSelect) => {
        if (error) {
          resolve({ msg: error });
        }
        if (resultSelect.rowCount) {
          let subtitles = JSON.parse(resultSelect.rows[0].subtitles);
          subtitles[lang].downloaded = true;
          subtitles[lang].path = path;
          pool.pool.query(
            "UPDATE torrents SET subtitles = $1 WHERE id = $2;",
            [JSON.stringify(subtitles), movie],
            (error, results) => {
              if (error) {
                resolve({ msg: error });
              }
              if (results.rowCount) {
                resolve(true);
              } else {
                emmitToFront(false, `Error while saving subs, movie not found`);
                resolve(false);
              }
            }
          );
        } else {
          emmitToFront(false, `Error while saving subs, movie not found`);
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
        res.sendStatus(200);
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
        parent_path:
          "/src/assets/torrents/downloads/" + stream._engine.torrent.name + "/",
        path:
          "/src/assets/torrents/downloads/" +
          (stream._engine.torrent.name === file.name
            ? file.name
            : stream._engine.torrent.name + "/" + file.name),
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
      if (currentDownloads[hash] && currentDownloads[hash].name) {
        emmitToFront(true, `Download finished: ${currentDownloads[hash].name}`);
        if (updateTorrent(currentDownloads[hash]))
          delete currentDownloads[hash];
      }
    });
  } catch (e) {
    emmitToFront(false, `Error while streaming: ${e.message}`);
    res.sendStatus(200);
  }
});

router.get("/pump", (req, res) => {
  const { path } = req.query;
  try {
    const ext = path.substring(path.lastIndexOf(".") + 1, path.length);
    const stream = fs.createReadStream("./client" + path);

    if (ext === "mp4" || ext === "mkv") {
      pump(stream, res);
    } else {
      ffmpeg()
        .input(stream)
        .outputOptions("-movflags frag_keyframe+empty_moov")
        .outputFormat("mp4")
        .on("error", (err) => {
          emmitToFront(false, `Error while converting file: ${err.message}`);
        })
        .inputFormat(ext)
        .audioCodec("aac")
        .videoCodec("libx264")
        .pipe(res);
      res.on("close", () => {
        stream.destroy();
      });
    }
  } catch (e) {
    emmitToFront(false, `Error while streaming: ${e.message}`);
    res.sendStatus(200);
  }
});

router.get("/subs", async (req, res) => {
  try {
    const { movie, torrent, lang } = req.query;
    let infos = await getMovieInfos(movie);
    infos.movie.torrents = JSON.parse(infos.movie.torrents);
    infos.movie.subtitles = JSON.parse(infos.movie.subtitles);

    const t = infos.movie.torrents.findIndex((e) => e.id === torrent);
    const s = infos.movie.subtitles.findIndex((e) => e.language === lang);

    if (t === -1 || s === -1) {
      emmitToFront(false, `Error while getting subs:`);
      res.sendStatus(200);
    }

    if (infos.movie.subtitles[s].downloaded) {
      if (infos.movie.subtitles[s].path) {
        res.contentType("text/vtt");
        return fs
          .createReadStream(infos.movie.subtitles[s].path)
          .pipe(srt2vtt())
          .pipe(res);
      } else {
        emmitToFront(false, `${lang} subtitles not found`);
        res.sendStatus(200);
      }
    } else {
      let path;
      if (infos.movie.torrents[t].downloaded) {
        path =
          "./client" +
          infos.movie.torrents[t].path.substring(
            0,
            infos.movie.torrents[t].path.lastIndexOf("/")
          ) +
          "/";
      } else {
        path = "./client" + currentDownloads[movie + "_" + torrent].parent_path;
      }

      let file_sub = null;

      let rq_subs = new Promise((resolve) => {
        https.get(infos.movie.subtitles[s].url, (response) => {
          const file = fs.createWriteStream(
            path + movie + "_" + torrent + "_" + lang + ".zip"
          );
          response.pipe(file);
          file.on("finish", () => {
            file.close();

            const zip = new StreamZip({
              file: path + movie + "_" + torrent + "_" + lang + ".zip",
              storeEntries: true,
            });

            zip.on("error", (err) => {
              emmitToFront(false, `Error while unzipping subs: ${err}`);
              res.sendStatus(200);
            });

            zip.on("ready", () => {
              if (file_sub) {
                zip.extract(file_sub.name, path + file_sub.name, (err) => {
                  if (err) {
                    emmitToFront(false, `Error while extracting subs: ${err}`);
                    res.sendStatus(200);
                  }
                  zip.close();
                  resolve(true);
                });
              } else {
                emmitToFront(false, `Subs format not working, sorry`);
                res.sendStatus(200);
              }
            });

            zip.on("entry", (entry) => {
              if (entry.name.endsWith(".srt")) {
                file_sub = entry;
              }
            });
          });

          response.on("error", (err) => {
            fs.unlinkSync(path + movie + "_" + torrent + "_" + lang + ".zip");
            emmitToFront(false, `Error while saving subs archive: ${err}`);
            res.sendStatus(200);
          });
        });
      });

      rq_subs
        .then((response) => {
          if (response) {
            fs.unlinkSync(path + movie + "_" + torrent + "_" + lang + ".zip");

            if (updateTorrentSubtitle(movie, s, path + file_sub.name)) {
              emmitToFront(true, `${lang} subtitles downloaded`);
              res.contentType("text/vtt");
              return fs
                .createReadStream(path + file_sub.name)
                .pipe(srt2vtt())
                .pipe(res);
            } else {
              emmitToFront(false, `Error while saving subs state`);
            }
          }
        })
        .catch((err) => {
          emmitToFront(false, `Error while unlinking archive: ${err}`);
          res.sendStatus(200);
        });
    }
  } catch (e) {
    emmitToFront(false, `Error while getting subs: ${e.message}`);
    res.sendStatus(200);
  }
});

module.exports = router;
