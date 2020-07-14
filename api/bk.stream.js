let currentDownloads = {
  torrent9: {},
  yts: {},
};

let formattedDownloads = {};

let currentConvert = {};

const config = {
  connections: 100,
  uploads: 10,
  tmp: "./torrents/tmp/",
  path: "./torrents/downloads/",
  verify: true,
  trackers: [
    "udp://open.demonii.com:1337/announce",
    "udp://tracker.openbittorrent.com:80",
    "udp://tracker.coppersurfer.tk:6969",
    "udp://glotorrents.pw:6969/announce",
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://torrent.gresille.org:80/announce",
    "udp://p4p.arenabg.com:1337",
    "udp://tracker.leechers-paradise.org:6969",
  ],
};

const updateTorrent = (id, torrent, path) => {
  return new Promise(function (resolve, reject) {
    let torrents;
    pool.pool.query(
      "SELECT torrents FROM torrents where id = $1;",
      [id],
      (error, resultSelect) => {
        if (error) {
          reject(error);
        }
        if (resultSelect.rowCount) {
          torrents = JSON.parse(resultSelect.rows[0].torrents);
          let i = 0;
          let found = false;
          while (i < torrents.length) {
            if (torrents[i].id === torrent.id) {
              torrents[i].downloaded = true;
              torrents[i].path = path;
              torrents[i].downloaded_at = moment().toString();
              torrents[i].lastviewed_at = moment().toString();
              torrents[i].delete_at = moment(moment()).add(1, "M").toString();
              found = true;
              break;
            }
            i++;
          }
          if (!found) {
            resolve(false);
          } else {
            pool.pool.query(
              "UPDATE torrents SET torrents = $1 WHERE id = $2;",
              [JSON.stringify(torrents), id],
              (error, results) => {
                if (error) {
                  reject(error);
                }
                if (results.rowCount) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              }
            );
          }
        } else {
          resolve(false);
        }
      }
    );
  });
};

const convertVideo = async (path, torrent) => {
  let outputPath = config.path + path.split("/").pop() + "_hypertube.webm";

  if (!currentConvert[path]) {
    currentConvert[path] = true;
  } else {
    return Promise.resolve(false);
  }

  return new Promise((resolve, reject) => {
    getVideoDurationInSeconds(path).then((duration) => {
      let output = new ffmpeg(path)
        .videoCodec("libvpx")
        .outputOptions(["-deadline realtime"])
        .audioCodec("libvorbis")
        .audioBitrate(128)
        .output(outputPath);

      output.on("start", () => {
        formattedDownloads[torrent.hash].success = true;
        formattedDownloads[torrent.hash].failure = false;
        formattedDownloads[torrent.hash].progress = false;
        formattedDownloads[torrent.hash].type = "convert";
        formattedDownloads[torrent.hash].msg = "Starting conversion process";

        socket.sockets.emit("torrentDownloader", formattedDownloads);
      });

      output.on("progress", (prog) => {
        const splittedprog = prog.timemark.split(":");
        let seconds = 0;
        if (typeof splittedprog == "undefined") {
          seconds = prog.timemark;
        } else {
          if (typeof splittedprog[3] != "undefined") {
            seconds =
              parseInt(splittedprog[0]) * 24 * 60 * 60 +
              parseInt(splittedprog[1]) * 60 * 60 +
              parseInt(splittedprog[2]) * 60 +
              parseInt(splittedprog[3]);
          } else if (typeof splittedprog[2] != "undefined") {
            seconds =
              parseInt(splittedprog[0]) * 60 * 60 +
              parseInt(splittedprog[1]) * 60 +
              parseInt(splittedprog[2]);
          } else if (typeof splittedprog[1] != "undefined") {
            seconds =
              parseInt(splittedprog[0]) * 60 + parseInt(splittedprog[1]);
          } else if (typeof splittedprog[0] != "undefined") {
            seconds = parseInt(splittedprog[0]);
          }
        }

        formattedDownloads[torrent.hash].success = false;
        formattedDownloads[torrent.hash].failure = false;
        formattedDownloads[torrent.hash].progress = true;
        formattedDownloads[torrent.hash].type = "convert";
        formattedDownloads[torrent.hash].msg =
          (seconds / duration).toFixed(2) + "%";

        socket.sockets.emit("torrentDownloader", formattedDownloads);
      });

      output.on("error", (err) => {
        formattedDownloads[torrent.hash].success = false;
        formattedDownloads[torrent.hash].failure = true;
        formattedDownloads[torrent.hash].progress = false;
        formattedDownloads[torrent.hash].type = "convert";
        formattedDownloads[torrent.hash].msg = "Error while converting:" + err;

        socket.sockets.emit("torrentDownloader", formattedDownloads);
        delete formattedDownloads[torrent.hash];
        delete currentConvert[path];
        resolve(false);
      });

      output.on("end", async () => {
        formattedDownloads[torrent.hash].success = true;
        formattedDownloads[torrent.hash].failure = false;
        formattedDownloads[torrent.hash].progress = false;
        formattedDownloads[torrent.hash].type = "convert";
        formattedDownloads[torrent.hash].msg =
          "Your file is now converted, you can watch it!";

        socket.sockets.emit("torrentDownloader", formattedDownloads);
        delete formattedDownloads[torrent.hash];
        delete currentConvert[path];

        if (fs.existsSync(path)) {
          fs.unlink(path);
        }
        resolve(outputPath);
      });

      output.run();
    });
  });
};

const startDownload = async (id, torrent, parent) => {
  if (currentDownloads[torrent.source][torrent.hash]) {
    return Promise.resolve({
      isSuccess: false,
      msg: "Torrent download was already started, continuing..",
    });
  }

  return new Promise(async (resolve) => {
    let engine = torrentStream(torrent.magnet, config);
    const allowedExts = [".mp4", ".mkv", ".webm", ".avi"];
    const loadedChunks = new Map();
    let dlFile = null;
    let nbPieces = 0;
    let canDownload = true;
    let res;
    let ext;

    engine.on("ready", () => {
      const file = engine.files.find(({ name }) =>
        allowedExts.some((ext) => name.endsWith(ext))
      );

      if (!file) {
        delete formattedDownloads[torrent.hash];
        resolve({
          isSuccess: false,
          msg: ext + " files are not supported yet, sorry!",
        });
      }

      ext = file.name.split(".").pop();

      if (!dlFile) {
        dlFile = { file, complete: false };

        res = {
          ext,
          source: torrent.source,
          identifier: torrent.hash,
          file,
        };

        currentDownloads[torrent.source][torrent.hash] = res;
        formattedDownloads[torrent.hash] = {
          title: parent.title,
          cover: parent.cover_url,
          ext: ext,
          source: torrent.source,
          identifier: torrent.hash,
          start: Date.now(),
          success: false,
          failure: false,
          progress: false,
          type: null,
          msg: null,
        };
      }

      dlFile.file.select();
      resolved = true;
      resolve({
        isSuccess: true,
        msg: "Your movie is downloading...",
      });
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
          (dlFile.file.size / 100) * MIN_FILE_BYTES_DOWNLOADED_PERCENT &&
        !canDownload
      ) {
        formattedDownloads[torrent.hash].success = true;
        formattedDownloads[torrent.hash].failure = false;
        formattedDownloads[torrent.hash].progress = false;
        formattedDownloads[torrent.hash].type = "download";
        formattedDownloads[torrent.hash].msg = "Stream is up!";

        socket.sockets.emit("torrentDownloader", formattedDownloads);
        canDownload = true;
      } else {
        formattedDownloads[torrent.hash].success = false;
        formattedDownloads[torrent.hash].failure = false;
        formattedDownloads[torrent.hash].progress = true;
        formattedDownloads[torrent.hash].type = "download";
        formattedDownloads[torrent.hash].msg = percent.toFixed(2) + "%";

        socket.sockets.emit("torrentDownloader", formattedDownloads);
      }
    });

    engine.on("idle", async () => {
      dlFile.complete = true;
      let path = config.path + dlFile.file.path;
      if (ext !== "mp4" && ext !== "webm") {
        formattedDownloads[torrent.hash].success = true;
        formattedDownloads[torrent.hash].failure = false;
        formattedDownloads[torrent.hash].progress = false;
        formattedDownloads[torrent.hash].type = "download";
        formattedDownloads[torrent.hash].msg =
          "Your download is finished but it needs to be converted";

        socket.sockets.emit("torrentDownloader", formattedDownloads);
        path = await convertVideo(config.path + dlFile.file.path, torrent);
        if (!path) {
          formattedDownloads[torrent.hash].success = false;
          formattedDownloads[torrent.hash].failure = true;
          formattedDownloads[torrent.hash].progress = false;
          formattedDownloads[torrent.hash].type = "download";
          formattedDownloads[torrent.hash].msg =
            "A convert process is already started for this file.";

          socket.sockets.emit("torrentDownloader", formattedDownloads);
        }
      } else {
        formattedDownloads[torrent.hash].success = true;
        formattedDownloads[torrent.hash].failure = false;
        formattedDownloads[torrent.hash].progress = false;
        formattedDownloads[torrent.hash].type = "download";
        formattedDownloads[torrent.hash].msg =
          "Your download is finished, click watch to start it!";

        socket.sockets.emit("torrentDownloader", formattedDownloads);
        delete formattedDownloads[torrent.hash];
      }
      let status = await updateTorrent(id, torrent, path);
      if (!status) {
        formattedDownloads[torrent.hash].success = false;
        formattedDownloads[torrent.hash].failure = true;
        formattedDownloads[torrent.hash].progress = false;
        formattedDownloads[torrent.hash].type = "download";
        formattedDownloads[torrent.hash].msg = "Error while updating torrent.";

        socket.sockets.emit("torrentDownloader", formattedDownloads);
        delete formattedDownloads[torrent.hash];
      }
    });
  });
};
