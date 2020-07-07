const express = require("express");
const router = express.Router();
const debug = require("debug")("hypertube:stream.router");
const tdl = require("../lib/torrentDownloader.service");
const dbService = require("../lib/database/database.service");
const torrentService = require("../lib/torrent.service");

const util = require("../lib/util.service");
const moment = require("moment");

const fs = require("fs");

// GET /stream?source=yts.ag&identifier=1779
router.get("/", async (req, res, next) => {
  debug(
    `GET /stream?source=${req.query.source}&identifier=${req.query.identifier}, user = `,
    req.user
  );
  const source = req.query.source;
  const identifier = req.query.identifier;
  let torrent = await torrentService.getBySourceIdentifier(source, identifier);

  if (!torrent) {
    await torrentService.saveVideo(source, identifier);
    torrent = await torrentService.getBySourceIdentifier(source, identifier);
  }

  try {
    let torrentInfos = await torrentService.getVideoInformations(
      source,
      identifier
    );

    await torrentService.setVideoLastView(
      torrent.id,
      moment().format("YYYY-MM-DD HH:mm:ss")
    );
    await torrentService.setVideoViewedByUser(
      torrent.source,
      torrent.identifier,
      req.user.id
    );
    torrentInfos.id = torrent.id;
    torrentInfos.url = `/stream/video?source=${source}&identifier=${identifier}`;

    if (!torrent.complete)
      await tdl.startDownload(torrentInfos.magnet, source, identifier);

    let subs = await torrentService.getSubs(source, identifier);
    subs.forEach((sub) => {
      if (sub.path) sub.path = sub.path.split("/app/src/public")[1];
    });
    torrentInfos.subs = subs;
    debug("subs = ", subs);

    return res.json(util.formatResponse(true, null, torrentInfos));
  } catch (err) {
    debug("Error during GET /stream : ", err);
  }
});

/**
 * /GET /stream/check-video?source=...&identifier=...
 */
router.get("/check-video", async (req, res, next) => {
  const source = req.query.source;
  const identifier = req.query.identifier;
  const torrent = await torrentService.getBySourceIdentifier(
    source,
    identifier
  );

  if (!torrent) return res.json(util.formatResponse(false));

  return res.json(util.formatResponse(torrent.complete));
});

router.get("/test", async (req, res, next) => {
  let rp = require("request-promise");
  debug("GET /stream/test");
  const identifier = req.query.identifier;
  const source = req.query.source;

  rp.get(
    `http://192.168.99.100:3000/stream?source=${source}&identifier=${identifier}`
  ).then(() => {
    return res.send(
      `<video id="ht-player" controls><source src="/stream/video?source=${source}&identifier=${identifier}"><track kind="subtitles" src="/The Big Sick 2017 [KiSS] 720p BluRay X264 English.srt.vtt" default></video>`
    );
  });
});

/**
 * POST /comment
 *   { videoId: <ID DE LA VIDEO>, text: <COMMENTAIRE UTILISATEUR> }
 */
router.post("/comment", async (req, res, next) => {
  debug("POST comment: req.body", req.body);
  if (!req.user)
    return res.json(
      util.formatResponse(false, "No user logged in for this session.")
    );
  if (!req.body.text)
    return res.json(
      util.formatResponse(false, "Write a comment before posting")
    );

  const me = req.user;
  const sql = "INSERT INTO `Comment` SET ?";
  let comment = {
    videoId: req.body.videoId,
    text: req.body.text,
    date: moment().format("YYYY-MM-DD HH:mm:ss"),
  };
  let db;

  comment.userId = me.id;

  try {
    db = await dbService.getConnection();

    let response = await db.query(sql, comment);
    res.json(util.formatResponse(true, null, response));
  } catch (err) {
    debug("Caught err during POST /stream/comment", err);
    res.json(util.formatResponse(false, err));
  } finally {
    db.release();
  }
});

/**
 *
 */
router.get("/comments", async (req, res, next) => {
  const videoId = req.query.videoId;
  const db = await dbService.getConnection();
  const sql = [
    "SELECT `User`.id AS userId,",
    "`User`.username AS username,",
    "`Comment`.date,",
    "`Comment`.text",
    "FROM `Comment`",
    "INNER JOIN `User` ON User.id = Comment.userId",
    "WHERE `Comment`.videoId = ?",
  ].join(" ");
  const params = [videoId];

  try {
    let response = await db.query(sql, params);

    return res.json(util.formatResponse(true, null, response));
  } catch (err) {
    debug("Caught error during GET /stream/comments", err);
    return res.json(util.formatResponse(false, err));
  } finally {
    db.release();
  }
});

module.exports = router;
