// react
import React, { useState, useEffect, useRef } from "react";
// framework
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
// icons
import StarRateIcon from "@material-ui/icons/StarRate";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";

const TorrentStyles = (theme) => ({
  root: {
    flex: 1,
    height: "100%",
    padding: 10,
  },
  loading: {
    display: "flex",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingLogo: {
    color: "#9A1300",
  },
});

const Torrent = (props) => {
  const ref = useRef(false);
  const { classes, auth } = props;
  const { id } = props.props.location.state;
  const [torrent, setTorrent] = useState({});
  const [t9_torrents, setT9_torrents] = useState([]);
  const [yts_torrents, setYts_torrents] = useState([]);
  const [qualities, setQualities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState(false);

  const getTorrentInfos = () => {
    fetch("/api/torrents/info", {
      method: "POST",
      body: JSON.stringify({
        id: id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (ref.current) {
          if (
            res.torrents &&
            res.torrents.torrents &&
            res.torrents.torrents[0]
          ) {
            res = res.torrents.torrents[0];
            setTorrent({
              id: res.id ? res.id : null,
              yts_id: res.yts_id ? res.yts_id : null,
              torrent9_id: res.torrent9_id ? res.torrent9_id : null,
              title: res.title ? res.title : null,
              production_year: res.production_year ? res.production_year : null,
              rating: res.rating ? res.rating : null,
              yts_url: res.yts_url ? res.yts_url : null,
              torrent9_url: res.torrent9_url ? res.torrent9_url : null,
              cover_url: res.cover_url ? res.cover_url : null,
              large_image: res.large_image ? res.large_image : null,
              summary: res.summary ? JSON.parse(res.summary) : [],
              duration: res.duration ? res.duration : null,
              imdb_code: res.imdb_code ? res.imdb_code : null,
              yt_trailer: res.yt_trailer ? res.yt_trailer : null,
              categories: res.categories ? JSON.parse(res.categories) : [],
              languages: res.languages ? JSON.parse(res.languages) : [],
              subtitles: res.subtitles ? JSON.parse(res.subtitles) : [],
              torrents: res.torrents ? JSON.parse(res.torrents) : [],
            });
            if (res.torrents) {
              setT9_torrents(
                JSON.parse(res.torrents).filter(
                  (el) => el.source === "torrent9"
                )
              );
              setYts_torrents(
                JSON.parse(res.torrents).filter((el) => el.source === "yts")
              );
              setQualities(JSON.parse(res.torrents).map((el) => el.quality));
              setIsLoading(false);
            }
          } else if (res.torrents.msg) {
            props.auth.errorMessage(res.torrents.msg);
          } else {
            props.auth.errorMessage("Error while fetching database.");
          }
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  const watchTorrent = (child) => {
    setSource(
      `http://localhost:3000/stream?movie=${torrent.id}&torrent=${child.id}&magnet=${child.magnet}`
    );
  };

  useEffect(() => {
    ref.current = true;
    getTorrentInfos();
    return () => {
      ref.current = false;
      setIsLoading(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className={classes.loading}>
        <CircularProgress className={classes.loadingLogo} />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <img
        width={160}
        src={torrent.cover_url}
        alt={torrent.title}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "./src/assets/img/nophotos.png";
        }}
      ></img>
      <div>{torrent.title}</div>
      <div>({torrent.production_year})</div>
      <div>
        {torrent.rating}
        <StarRateIcon></StarRateIcon>
      </div>
      {torrent.summary.length ? (
        <div>
          Synopsis
          {torrent.summary.length
            ? torrent.summary.map((el, i) => (
                <div key={"summary" + i}>{el}</div>
              ))
            : "No informations"}
        </div>
      ) : undefined}
      <div>
        Categories:
        {torrent.categories.length
          ? torrent.categories.map((el, i) =>
              i < torrent.categories.length - 1 ? el + " / " : el
            )
          : "No informations"}
      </div>
      <div>
        Available languages:
        {torrent.languages.length
          ? torrent.languages.map((el, i) =>
              i < torrent.languages.length - 1 ? el + ", " : el
            )
          : "No informations"}
      </div>
      {torrent.subtitles && torrent.subtitles.length ? (
        <div>
          Available subtitles:
          {torrent.subtitles.length
            ? torrent.subtitles.map((el, i) =>
                i < torrent.subtitles.length - 1
                  ? el.language + ", "
                  : el.language
              )
            : "No informations"}
        </div>
      ) : undefined}
      <div>
        Available qualities:
        {qualities.length
          ? qualities.map((el, i) =>
              i < qualities.length - 1 ? el + ", " : el
            )
          : "No informations"}
      </div>
      {torrent.duration ? <div>Duration: {torrent.duration}mn</div> : undefined}
      <div>
        Last viewed: {torrent.downloaded_at ? torrent.downloaded_at : "Never"}
      </div>
      <div>
        Last download: {torrent.lastviewed_at ? torrent.lastviewed_at : "Never"}
      </div>
      <div>
        Direct links
        {torrent.imdb_code ? (
          <a
            href={"https://www.imdb.com/title/" + torrent.imdb_code}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt={torrent.imdb_code}
              width="64"
              height="32"
              src="./src/assets/img/imdb.png"
            ></img>
          </a>
        ) : undefined}
        {torrent.torrent9_url ? (
          <a
            href={torrent.torrent9_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt={torrent.torrent9_url}
              width="64"
              height="32"
              src="./src/assets/img/torrent9.png"
            ></img>
          </a>
        ) : undefined}
        {torrent.yts_url ? (
          <a href={torrent.yts_url} target="_blank" rel="noopener noreferrer">
            <img
              alt={torrent.yts_url}
              width="64"
              height="32"
              src="./src/assets/img/yts.png"
            ></img>
          </a>
        ) : undefined}
      </div>
      {source && source.length ? (
        <video
          id="videoPlayer"
          crossOrigin="anonymous"
          controls
          muted
          preload="auto"
          autoPlay
        >
          <source type="video/mp4" src={source} />
          {/* {track !== "" && (
            <track
              label="subtitles"
              kind="subtitles"
              srcLang="en"
              src={track}
            />
          )} */}
          <track kind="captions" default />
        </video>
      ) : undefined}
      {yts_torrents.length ? (
        <div>
          YTS
          <FiberManualRecordIcon
            style={{
              color: torrent.yts_url ? "#0CCA4A" : "#E63946",
              verticalAlign: "middle",
            }}
          ></FiberManualRecordIcon>
          {torrent.yts_url ? (
            <div>
              {yts_torrents.map((el, i) => (
                <div key={el.magnet + i}>
                  {el.language}
                  {el.quality}
                  {el.size}
                  {el.downloaded ? "Downloaded" : "Not downloaded"}
                  Seeds:{el.seeds}
                  Peers:{el.peers}
                  {auth.isLogged ? (
                    <a
                      href={el.torrent}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  ) : undefined}
                  {auth.isLogged ? (
                    <Button onClick={() => watchTorrent(el)}>Watch</Button>
                  ) : undefined}
                </div>
              ))}
            </div>
          ) : undefined}
        </div>
      ) : undefined}
      {t9_torrents.length ? (
        <div>
          Torrent9
          <FiberManualRecordIcon
            style={{
              color: torrent.torrent9_url ? "#0CCA4A" : "#E63946",
              verticalAlign: "middle",
            }}
          ></FiberManualRecordIcon>
          {torrent.torrent9_url ? (
            <div>
              {t9_torrents.map((el, i) => (
                <div key={el.magnet + i}>
                  {el.languages}
                  {el.quality}
                  {el.size}
                  {el.downloaded ? "Downloaded" : "Not downloaded"}
                  Seeds:{el.seeds}
                  Peers:{el.peers}
                  {auth.isLogged ? (
                    <a
                      href={el.torrent}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  ) : undefined}
                  {auth.isLogged ? (
                    <Button onClick={() => watchTorrent(el)}>Watch</Button>
                  ) : undefined}
                </div>
              ))}
            </div>
          ) : undefined}
        </div>
      ) : undefined}
    </div>
  );
};

export default withStyles(TorrentStyles)(Torrent);
