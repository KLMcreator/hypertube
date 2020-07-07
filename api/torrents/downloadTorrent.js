const debug = require("debug")("hypertube:torrentDownloader.service");
const fs = require("fs");
const r = require("request");
const exec = require("child_process").exec;
const torrentStream = require("torrent-stream");
const torrentService = require("./torrent.service");
const srt2vtt = require("srt2vtt");
const _ = require("lodash");

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

// TODO: Move to config
const LIBRARY_PATH = "/app/library/";

let currentDownloads = {
  "1337x.to": {},
  "yts.ag": {},
};

/**
 *
 * @param magnet
 * @param source
 * @param identifier
 * @returns {Promise<any>}
 */
async function startDownload(magnet, source, identifier) {
  let engineOpts = {
    path: "/app/library",
  };

  debug(`startDownload ${source} ${identifier}`);

  // If download has already started
  if (currentDownloads[source][identifier]) {
    debug("Torrent download was already started, continuing..");
    return Promise.resolve(currentDownloads[source][identifier]);
  }

  // Promise will be resolved when we start the download of the file
  return new Promise((resolve) => {
    debug("Torrent download starting");
    let engine = torrentStream(magnet, engineOpts);
    let subs = [];
    let dlFile = null;
    let resolved = false;
    let res;

    engine.on("ready", () => {
      for (let file of engine.files) {
        debug(`Found file ${file.name}`);
        let ext = file.name.split(".").pop();
        let allowedExts = ["mp4", "mkv", "webm", "avi"];

        if (ext.toLowerCase() === "srt") {
          debug(`Engine downloading subtitle file: ${file.__proto__.name}`);
          subs.push(file);
          file.select();
          continue;
        }

        // if file doesn't have one of allowedExts, don't download it
        if (allowedExts.indexOf(ext.toLowerCase()) === -1) {
          file.deselect();
          continue;
        }

        // Only download 1 file (the first video found in the torrent)
        if (!dlFile) {
          dlFile = { file, complete: false };
          // file.select();

          res = {
            ext,
            source,
            identifier,
            file,
          };

          // Save currentDownload to avoid starting 2 downloads if client refresh
          currentDownloads[source][identifier] = res;
        }
      }
      // start video dl now if no subs, otherwise dl will start after subs are downloaded
      if (!subs.length) {
        dlFile.file.select();
        resolved = true;
        return resolve(res);
      }
    });

    engine.on("download", (info) => {
      // debug('downloading subs: ', subs.map(sub => sub.__proto__));
      // debug(`Engine on download (${source}:${identifier}) - ${info} (total: ${dlFile.file.length})`);
      //
      // debug('swarm dl', engine.swarm.downloaded);
    });

    engine.on("idle", async () => {
      debug("Engine idle");

      // subs are finished
      if (dlFile && !dlFile.complete && !resolved) {
        await saveSubs(source, identifier, subs);

        debug(`Engine starting download of `, dlFile.file.__proto__);
        dlFile.file.select();
        resolved = true;
        resolve(res);
      }

      // video is finished
      else {
        dlFile.complete = true;
        await convertVideo(source, identifier, LIBRARY_PATH + dlFile.file.path);
      }
    });
  });
}

let runningConvert = {};

async function convertVideo(source, identifier, path) {
  let outputPath = LIBRARY_PATH + path.split("/").pop() + "_hypertube.webm";

  if (!runningConvert[path]) {
    debug("convertVideo: starting running for ", path);
    runningConvert[path] = true;
  } else {
    debug("convertVideo: already running for ", path);
    return Promise.resolve("ALREADY_DONE");
  }

  return new Promise((resolve, reject) => {
    // let output = new ffmpeg(path)
    // 	.format('mp4')
    // 	.videoCodec('libx264')
    // 	.outputOptions(['-preset ultrafast', '-crf 0'])
    // 	.audioCodec('libvorbis')
    // 	.audioBitrate(128)
    // 	.output(outputPath);
    let output = new ffmpeg(path)
      .videoCodec("libvpx")
      .outputOptions(["-deadline realtime"])
      .audioCodec("libvorbis")
      .audioBitrate(128)
      .output(outputPath);

    output.on("stderr", (stderr) => {
      debug("ffmpeg stderr:", stderr);
    });

    output.on("error", (err) => {
      debug("Error while converting: ", err);
      runningConvert[path] = null;
      reject("err", err);
    });

    output.on("end", async () => {
      debug("Finished converting video");
      runningConvert[path] = null;

      await torrentService.setVideoPath(source, identifier, outputPath);
      await torrentService.setVideoComplete(source, identifier);

      resolve("OK");
    });

    output.run();
  });
}

async function getFile(source, identifier) {
  try {
    let file = currentDownloads[source][identifier].file;

    debug("found file in current downloads: ", file);
    return Promise.resolve(file);
  } catch (err) {
    let torrentInfos = await torrentService.getVideoInformations(
      source,
      identifier
    );

    debug("Err caught during torrentDownloader.getFile");
    if (torrentInfos) {
      debug(`Err ignored, starting download of ${source} : ${identifier}`);
      let download = await startDownload(
        torrentInfos.magnet,
        source,
        identifier
      );

      return download.file;
    } else {
      debug(`Couldn't get torrentInformations for ${source} : ${identifier}`);
      return Promise.reject();
    }
  }
}

async function saveSubs(source, identifier, subs) {
  const torrent = await torrentService.getBySourceIdentifier(
    source,
    identifier
  );
  let subsQueries = [];
  let existingSubs = await torrentService.getSubs(source, identifier);

  if (!torrent) throw new Error("Trying to save subs for unknown torrent");

  subs.forEach(async (sub) => {
    let subName = sub.path.split("/").pop();
    let subExists = _.find(existingSubs, {
      path: "/app/src/public/" + subName + ".vtt",
    });
    let subData = {
      videoId: torrent.id,
    };

    // If sub is already saved in database, ignore it (don't save it twice)
    if (subExists) return;

    debug("trying to read subpath ", LIBRARY_PATH + sub.path);
    let data = fs.readFileSync(LIBRARY_PATH + sub.path);
    srt2vtt(data, function (err, vttData) {
      debug("converted srt to vtt");
      if (err) throw new Error(err);
      fs.writeFileSync("/app/src/public/" + subName + ".vtt", vttData);
      subData.path = "/app/src/public/" + subName + ".vtt";
      subsQueries.push(torrentService.saveSub(subData));
    });
  });
  await Promise.all(subsQueries);
}

module.exports = {
  startDownload,
  getFile,
};
