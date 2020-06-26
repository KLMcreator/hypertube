// react
import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
// framework
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Input from "@material-ui/core/Input";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
// icons
import StarRateIcon from "@material-ui/icons/StarRate";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import SendIcon from "@material-ui/icons/Send";

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
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const { classes, auth } = props;
  const { torrent } = props.props.location.state;
  const yt_code = torrent.yt_trailer
    ? torrent.yt_trailer.split("https://www.youtube.com/watch?v=")
    : null;
  const languages = JSON.parse(torrent.languages);
  const categories = JSON.parse(torrent.categories);
  const t9_torrents = JSON.parse(torrent.torrents).filter(
    (el) => el.source === "torrent9"
  );
  const yts_torrents = JSON.parse(torrent.torrents).filter(
    (el) => el.source === "yts"
  );
  const qualities = JSON.parse(torrent.torrents).map((el) => el.quality);

  const getComments = () => {
    fetch("/api/comments/torrent", {
      method: "POST",
      body: JSON.stringify({
        id: torrent.id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (ref.current) {
          if (res.comments.comments) {
            setComments(res.comments.comments);
            setIsLoading(false);
          } else if (res.comments.msg) {
            props.auth.errorMessage(res.comments.msg);
          } else {
            props.auth.errorMessage("Error while fetching database.");
          }
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (newComment.length < 300) {
      fetch("/api/comments/send", {
        method: "POST",
        body: JSON.stringify({
          video_id: torrent.id,
          comment: newComment,
        }),
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.comments.comments) {
            getComments();
            props.auth.successMessage("Thanks for your comment!");
          } else {
            props.auth.errorMessage(res.message.msg);
          }
        })
        .catch((err) => props.auth.errorMessage(err));
    } else {
      props.auth.errorMessage("Comment max length is 300 char.");
    }
  };

  useEffect(() => {
    ref.current = true;
    getComments();
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
            padding: 20,
          }}
        >
          <img
            style={{
              width: "100%",
              borderRadius: 6,
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
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
            }}
          >
            <div
              style={{
                flex: 5,
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  color: "#D0D0D0",
                }}
              >
                ({torrent.production_year}){" "}
              </span>
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: 24,
                }}
              >
                {torrent.title}
              </span>
            </div>
            <div
              style={{
                flex: 1,
                textAlign: "right",
                fontSize: 18,
                color: "#D0D0D0",
              }}
            >
              {torrent.rating ? (
                <div>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: 24,
                    }}
                  >
                    {torrent.rating}
                  </span>
                  <StarRateIcon
                    style={{
                      fontSize: 40,
                      color: "#FBBA72",
                      verticalAlign: "middle",
                    }}
                  ></StarRateIcon>
                </div>
              ) : undefined}
            </div>
          </div>
          {torrent.summary ? (
            <div style={{ marginTop: 30 }}>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: 20,
                }}
              >
                Synopsis
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: "#D0D0D0",
                }}
              >
                {torrent.summary}
              </div>
            </div>
          ) : undefined}
          <div style={{ marginTop: 30 }}>
            <span
              style={{
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              Categories:{" "}
            </span>
            <span
              style={{
                fontSize: 18,
                color: "#D0D0D0",
              }}
            >
              {categories.length
                ? categories.map((el, i) =>
                    i < categories.length - 1 ? el + " / " : el
                  )
                : "No informations"}
            </span>
          </div>
          <div style={{ marginTop: 30 }}>
            <span
              style={{
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              Available languages:{" "}
            </span>
            <span
              style={{
                fontSize: 18,
                color: "#D0D0D0",
              }}
            >
              {languages.length
                ? languages.map((el, i) =>
                    i < languages.length - 1 ? el + ", " : el
                  )
                : "No informations"}
            </span>
          </div>
          <div style={{ marginTop: 30 }}>
            <span
              style={{
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              Available qualities:{" "}
            </span>
            <span
              style={{
                fontSize: 18,
                color: "#D0D0D0",
              }}
            >
              {qualities.length
                ? qualities.map((el, i) =>
                    i < qualities.length - 1 ? el + ", " : el
                  )
                : "No informations"}
            </span>
          </div>
          <div style={{ marginTop: 30 }}>
            <span
              style={{
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              Last viewed:{" "}
            </span>
            <span
              style={{
                fontSize: 18,
                color: "#D0D0D0",
              }}
            >
              {torrent.downloaded_at ? torrent.downloaded_at : "Never"}
            </span>
          </div>
          <div style={{ marginTop: 30 }}>
            <span
              style={{
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              Last download:{" "}
            </span>
            <span
              style={{
                fontSize: 18,
                color: "#D0D0D0",
              }}
            >
              {torrent.lastviewed_at ? torrent.lastviewed_at : "Never"}
            </span>
          </div>
          <div style={{ marginTop: 30 }}>
            <div
              style={{
                fontWeight: "bold",
                fontSize: 20,
              }}
            >
              Direct links
            </div>
            <div
              style={{
                display: "flex",
              }}
            >
              {torrent.imdb_code ? (
                <div style={{ margin: 5 }}>
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
                </div>
              ) : undefined}
              {torrent.torrent9_url ? (
                <div style={{ margin: 5 }}>
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
                </div>
              ) : undefined}
              {torrent.yts_url ? (
                <div style={{ margin: 5 }}>
                  <a
                    href={torrent.yts_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      alt={torrent.yts_url}
                      width="64"
                      height="32"
                      src="./src/assets/img/yts.png"
                    ></img>
                  </a>
                </div>
              ) : undefined}
            </div>
          </div>
        </div>
      </div>
      <div>
        {" "}
        {torrent.yt_trailer ? (
          <div>
            {" "}
            <div
              style={{
                fontWeight: "bold",
                fontSize: 20,
              }}
            >
              Youtube trailer:
            </div>
            <iframe
              width="560"
              height="315"
              title="player"
              type="text/html"
              id="player"
              src={
                "https://www.youtube.com/embed/" +
                yt_code[1] +
                "?enablejsapi=1&origin=http://example.com"
              }
              frameBorder="0"
            ></iframe>
          </div>
        ) : undefined}
      </div>
      {yts_torrents.length ? (
        <div>
          <div
            style={{
              fontWeight: "bold",
              fontSize: 24,
            }}
          >
            YTS{" "}
            <FiberManualRecordIcon
              style={{
                color: torrent.yts_url ? "#0CCA4A" : "#E63946",
                verticalAlign: "middle",
              }}
            ></FiberManualRecordIcon>
            {torrent.yts_url ? (
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {yts_torrents.map((el, i) => (
                  <div
                    key={el.magnet + i}
                    style={{ flex: 1, flexBasis: "1 0 30%" }}
                  >
                    <div style={{ display: "flex" }}>
                      <div
                        style={{ flex: 1, fontWeight: "bold", fontSize: 18 }}
                      >
                        {el.language}
                      </div>
                      <div
                        style={{ flex: 1, fontWeight: "bold", fontSize: 18 }}
                      >
                        {el.quality}
                      </div>
                      <div
                        style={{ flex: 1, fontWeight: "bold", fontSize: 18 }}
                      >
                        {el.size}
                      </div>
                    </div>
                    <div style={{ display: "flex" }}>
                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontWeight: "bold",
                            fontSize: 18,
                          }}
                        >
                          Seeds:{" "}
                        </span>
                        <span
                          style={{
                            fontSize: 18,
                            color: "#D0D0D0",
                          }}
                        >
                          {el.seeds}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontWeight: "bold",
                            fontSize: 18,
                          }}
                        >
                          Peers:{" "}
                        </span>
                        <span
                          style={{
                            fontSize: 18,
                            color: "#D0D0D0",
                          }}
                        >
                          {el.peers}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex" }}>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: "bold",
                            fontSize: 18,
                          }}
                        >
                          <a
                            style={{
                              color: "#9A1300",
                            }}
                            href={el.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            YTS
                          </a>
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        {auth.isLogged ? (
                          <div
                            style={{
                              fontWeight: "bold",
                              fontSize: 18,
                            }}
                          >
                            <a
                              style={{
                                color: "#9A1300",
                              }}
                              href={el.torrent}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Download
                            </a>
                          </div>
                        ) : undefined}
                      </div>
                      <div style={{ flex: 1 }}>
                        {auth.isLogged ? (
                          <div
                            style={{
                              fontWeight: "bold",
                              fontSize: 18,
                            }}
                          >
                            <a
                              style={{
                                color: "#9A1300",
                              }}
                              href={el.torrent}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Watch
                            </a>
                          </div>
                        ) : undefined}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : undefined}
          </div>
        </div>
      ) : undefined}
      {t9_torrents.length ? (
        <div>
          <div
            style={{
              fontWeight: "bold",
              fontSize: 24,
            }}
          >
            Torrent9{" "}
            <FiberManualRecordIcon
              style={{
                color: torrent.torrent9_url ? "#0CCA4A" : "#E63946",
                verticalAlign: "middle",
              }}
            ></FiberManualRecordIcon>
          </div>
        </div>
      ) : undefined}
      <div style={{ padding: 10 }}>
        <div
          style={{
            fontWeight: "bold",
            fontSize: 24,
          }}
        >
          Comment section
        </div>
        <div style={{ paddingBottom: 20 }}>
          {auth.isLogged ? (
            <form onSubmit={handleSendComment}>
              <Input
                style={{ width: "100%" }}
                type="text"
                placeholder="Write a comment about the movie..."
                value={newComment}
                required
                onChange={(e) => setNewComment(e.target.value)}
                endAdornment={
                  <IconButton
                    disabled={
                      !newComment || newComment.length > 300 ? true : false
                    }
                    type="submit"
                  >
                    <SendIcon></SendIcon>
                  </IconButton>
                }
              />
            </form>
          ) : (
            <div>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                You must be logged to post a new comment
              </div>
            </div>
          )}
        </div>
        <div>
          {comments.length ? (
            comments.map((el) => (
              <div
                key={el.id}
                style={{
                  display: "flex",
                  borderRadius: 6,
                  backgroundColor: "#373737",
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    textAlign: "-webkit-center",
                  }}
                >
                  <Avatar
                    alt={el.username}
                    src={"./src/assets/photos/" + el.photos}
                  />
                </div>
                <div style={{ flex: 9 }}>
                  <div style={{ color: "#D0D0D0" }}>
                    From <b>{el.username}</b>,{" "}
                    {moment(el.created_at).format("DD/MM/YYYY HH:mm:ss ")}
                  </div>
                  <div style={{ color: "#EFF1F3", fontSize: 16 }}>
                    {el.comment}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                No comments, be the first to post one
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withStyles(TorrentStyles)(Torrent);
