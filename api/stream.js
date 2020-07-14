const fs = require("fs");
const pump = require("pump");
const path = require("path");
const moment = require("moment");
const express = require("express");
const socket = require("./sockets");
const pool = require("./../pool.js");
const srt2vtt = require("srt-to-vtt");
const ffmpeg = require("fluent-ffmpeg");
const torrentStream = require("torrent-stream");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const { getVideoDurationInSeconds } = require("get-video-duration");

const router = express.Router();
ffmpeg.setFfmpegPath(ffmpegPath);

let currentDownloads = {};

let currentConvert = {};

const config = {
  connections: 100,
  uploads: 10,
  tmp: "./torrents/tmp/",
  path: "./torrents/downloads/",
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
  console.log(hash);
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

        currentDownloads[hash] = {
          name: file.name,
          identifier: hash,
          ext: ext,
        };
      }

      emmitToFront(true, `Download started: ${file.name}`);

      dlFile.file.select();
      ext = file.name.split(".").pop();
      const stream = file.createReadStream();

      if (ext === "mp4" || ext === "mkv") {
        emmitToFront(true, `Your stream will start shortly: ${file.name}`);
        pump(stream, res);
      } else {
        emmitToFront(
          true,
          `Your file need to be converted first, the stream will start shortly: ${file.name}`
        );
        ffmpeg()
          .input(stream)
          .outputOptions("-movflags frag_keyframe+empty_moov")
          .outputFormat("mp4")
          .on("end", () => {
            emmitToFront(true, `Your file has been converted: ${file.name}`);
          })
          .on("error", (err) => {
            emmitToFront(
              false,
              `Error while converting file: ${file.name} - ${err.message}`
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
        currentDownloads[hash] = null;
      } else {
        emmitToFront("progress", percent.toFixed(2));
      }
    });
  } catch (e) {
    emmitToFront(false, `Error while streaming: ${e.message}`);
    res.status(200);
  }
});

module.exports = router;
