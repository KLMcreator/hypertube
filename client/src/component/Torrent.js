// react
import React, { useState, useEffect, useRef } from "react";
// framework
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
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
  const [isLoading, setIsLoading] = useState(true);
  const { classes, auth } = props;
  const { torrent } = props.props.location.state;
  const languages = JSON.parse(torrent.languages);
  const categories = JSON.parse(torrent.categories);
  const t9_torrents = JSON.parse(torrent.torrents).filter(
    (el) => el.source === "torrent9"
  );
  const yts_torrents = JSON.parse(torrent.torrents).filter(
    (el) => el.source === "yts"
  );

  const getTorrentInformations = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    ref.current = true;
    getTorrentInformations();
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
      <div
        style={{
          display: "flex",
        }}
      >
        <div
          style={{
            flex: 2,
            padding: 10,
          }}
        >
          <img
            style={{
              width: "100%",
            }}
            src={torrent.cover_url}
            alt={torrent.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "./src/assets/img/nophotos.png";
            }}
          ></img>
        </div>
        <div
          style={{
            flex: 4,
            padding: 10,
          }}
        >
          <div>Title: {torrent.title}</div>
          <div>Year: {torrent.production_year}</div>
          {torrent.rating ? (
            <div>
              {torrent.rating}
              <StarRateIcon
                style={{
                  fontSize: 25,
                  color: "#FBBA72",
                  verticalAlign: "middle",
                }}
              ></StarRateIcon>
            </div>
          ) : undefined}
          <div>
            Language(s):{" "}
            {languages.length
              ? languages.map((el, i) =>
                  i < languages.length - 1 ? el + ", " : el
                )
              : "No informations"}
          </div>
          <div>
            Categorie(s):{" "}
            {categories.length
              ? categories.map((el, i) =>
                  i < categories.length - 1 ? el + ", " : el
                )
              : "No informations"}
          </div>
          <div>
            Last download:{" "}
            {torrent.downloaded_at ? torrent.downloaded_at : "Never"}
          </div>
          <div>
            Last viewed:{" "}
            {torrent.lastviewed_at ? torrent.lastviewed_at : "Never"}
          </div>
          <div
            style={{
              display: "flex",
            }}
          >
            <div
              style={{
                flex: 1,
                padding: 10,
              }}
            >
              YTS
              <FiberManualRecordIcon
                style={{
                  color: torrent.yts_url ? "#0CCA4A" : "#E63946",
                  verticalAlign: "middle",
                }}
              ></FiberManualRecordIcon>
              {torrent.yts_url ? (
                <div>
                  {yts_torrents.map((el) => (
                    <div
                      key={el.magnet}
                      style={{ marginTop: 10, marginBottom: 10 }}
                    >
                      <div>Language: {el.language}</div>
                      <div>quality: {el.quality}</div>
                      <div>Size: {el.size}</div>
                      <div>Peers: {el.peers}</div>
                      <div>Seeds: {el.seeds}</div>
                      <div>
                        url:{" "}
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={el.url}
                        >
                          yts website
                        </a>
                      </div>
                      <div>
                        {auth.isLogged ? (
                          <div>
                            Download torrent:{" "}
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href={el.torrent}
                            >
                              download via YTS
                            </a>
                          </div>
                        ) : (
                          <div>
                            Download torrent: You must be logged to download the
                            torrent
                          </div>
                        )}
                      </div>
                      <div>
                        {auth.isLogged ? (
                          <div>Watch movie: Click to watch</div>
                        ) : (
                          <div>
                            Watch movie: You must be logged to watch the movie
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : undefined}
            </div>
            <div
              style={{
                flex: 1,
                padding: 10,
              }}
            >
              Torrent9
              <FiberManualRecordIcon
                style={{
                  color: torrent.torrent9_url ? "#0CCA4A" : "#E63946",
                  verticalAlign: "middle",
                }}
              ></FiberManualRecordIcon>
              {torrent.torrent9_url ? (
                <div>
                  {t9_torrents.map((el) => (
                    <div
                      key={el.magnet}
                      style={{ marginTop: 10, marginBottom: 10 }}
                    >
                      <div>Language: {el.language}</div>
                      <div>quality: {el.quality}</div>
                      <div>Size: {el.size}</div>
                      <div>Peers: {el.peers}</div>
                      <div>Seeds: {el.seeds}</div>
                      <div>
                        url:{" "}
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={el.url}
                        >
                          yts website
                        </a>
                      </div>
                      <div>
                        {auth.isLogged ? (
                          <div>
                            Download torrent:{" "}
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href={el.torrent}
                            >
                              download via YTS
                            </a>
                          </div>
                        ) : (
                          <div>
                            Download torrent: You must be logged to download the
                            torrent
                          </div>
                        )}
                      </div>
                      <div>
                        {auth.isLogged ? (
                          <div>Watch movie: Click to watch</div>
                        ) : (
                          <div>
                            Watch movie: You must be logged to watch the movie
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : undefined}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withStyles(TorrentStyles)(Torrent);
