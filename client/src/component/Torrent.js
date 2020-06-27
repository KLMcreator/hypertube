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
  textAlignCenter: {
    textAlign: "center",
  },
  torrentInfoContainer: {
    display: "flex",
  },
  torrentImageContainer: {
    flex: 2,
    padding: 20,
  },
  torrentImage: {
    width: "100%",
    borderRadius: 6,
  },
  torrentDetailsContainer: {
    flex: 4,
    padding: 20,
  },
  torrentTitleContainer: {
    flex: 5,
  },
  torrentYear: {
    fontSize: 24,
    color: "#D0D0D0",
  },
  torrentTitle: {
    fontWeight: "bold",
    fontSize: 24,
  },
  torrentRatingContainer: {
    flex: 1,
    textAlign: "right",
    fontSize: 18,
    color: "#D0D0D0",
  },
  torrentRating: {
    fontWeight: "bold",
    fontSize: 24,
  },
  torrentRatingIcon: {
    fontSize: 40,
    color: "#FBBA72",
    verticalAlign: "middle",
  },
  divMargin: {
    marginTop: 30,
  },
  titleSection: {
    fontWeight: "bold",
    fontSize: 18,
  },
  textSection: {
    fontSize: 18,
    color: "#D0D0D0",
  },
  directLink: {
    margin: 5,
  },
  torrentListContainer: {
    display: "flex",
    flexWrap: "wrap",
  },
  torrentElContainer: {
    flex: 1,
    flexBasis: "1 0 30%",
    backgroundColor: "#373737",
    borderRadius: 6,
    margin: 10,
    padding: 10,
  },
  torrentElDetail: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
  },
  torrentSeedsContainer: {
    display: "flex",
    marginTop: 10,
  },
  torrentSeedPeers: {
    flex: 1,
    textAlign: "center",
  },
  peers: {
    fontSize: 18,
    color: "#9A1300",
  },
  seeds: {
    fontSize: 18,
    color: "#4DAA57",
  },
  soloFlex: { flex: 1 },
  commentSectionContainer: {
    padding: 10,
  },
  commentInputContainer: {
    paddingBottom: 20,
  },
  rootSend: {
    width: "100%",
  },
  borderBottom: {
    "&.MuiInput-underline:before": {
      borderBottom: "1px solid #9A1300",
    },
    "&.MuiInput-underline:after": {
      borderBottom: "1px solid #FA7B38",
    },
    "&.MuiInput-underline:hover::before": {
      borderBottom: "2px solid #FBBA72",
    },
    "&.MuiInput-underline:hover::after": {
      borderBottom: "1px solid #FBBA72",
    },
  },
  sendIcon: {
    color: "#9A1300",
  },
  inputColor: {
    color: "#fff",
  },
  commentElContainer: {
    display: "flex",
    borderRadius: 6,
    backgroundColor: "#373737",
    padding: 10,
    marginBottom: 10,
  },
  commentAvatarContainer: {
    flex: 1,
    justifyContent: "center",
    textAlign: "-webkit-center",
  },
  commentTextContainer: {
    flex: 9,
  },
  commentHeader: {
    color: "#D0D0D0",
  },
  commentText: {
    color: "#EFF1F3",
    fontSize: 16,
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
  const summary = JSON.parse(torrent.summary);
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
            setNewComment("");
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
      <div className={classes.torrentInfoContainer}>
        <div className={classes.torrentImageContainer}>
          <img
            className={classes.torrentImage}
            src={torrent.cover_url}
            alt={torrent.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "./src/assets/img/nophotos.png";
            }}
          ></img>
        </div>
        <div className={classes.torrentDetailsContainer}>
          <div className={classes.torrentInfoContainer}>
            <div className={classes.torrentTitleContainer}>
              <span className={classes.torrentYear}>
                ({torrent.production_year}){" "}
              </span>
              <span className={classes.torrentTitle}>{torrent.title}</span>
            </div>
            <div className={classes.torrentRatingContainer}>
              {torrent.rating ? (
                <div>
                  <span className={classes.torrentRating}>
                    {torrent.rating}
                  </span>
                  <StarRateIcon
                    className={classes.torrentRatingIcon}
                  ></StarRateIcon>
                </div>
              ) : undefined}
            </div>
          </div>
          {summary.length ? (
            <div className={classes.divMargin}>
              <div className={classes.titleSection}>Synopsis</div>
              {summary.length
                ? summary.map((el) => (
                    <div className={classes.textSection}>{el}</div>
                  ))
                : "No informations"}
            </div>
          ) : undefined}
          <div className={classes.divMargin}>
            <span className={classes.titleSection}>Categories: </span>
            <span className={classes.textSection}>
              {categories.length
                ? categories.map((el, i) =>
                    i < categories.length - 1 ? el + " / " : el
                  )
                : "No informations"}
            </span>
          </div>
          <div className={classes.divMargin}>
            <span className={classes.titleSection}>Available languages: </span>
            <span className={classes.textSection}>
              {languages.length
                ? languages.map((el, i) =>
                    i < languages.length - 1 ? el + ", " : el
                  )
                : "No informations"}
            </span>
          </div>
          <div className={classes.divMargin}>
            <span className={classes.titleSection}>Available qualities: </span>
            <span className={classes.textSection}>
              {qualities.length
                ? qualities.map((el, i) =>
                    i < qualities.length - 1 ? el + ", " : el
                  )
                : "No informations"}
            </span>
          </div>
          <div className={classes.divMargin}>
            <span className={classes.titleSection}>Last viewed: </span>
            <span className={classes.textSection}>
              {torrent.downloaded_at ? torrent.downloaded_at : "Never"}
            </span>
          </div>
          <div className={classes.divMargin}>
            <span className={classes.titleSection}>Last download: </span>
            <span className={classes.textSection}>
              {torrent.lastviewed_at ? torrent.lastviewed_at : "Never"}
            </span>
          </div>
          <div className={classes.divMargin}>
            <div className={classes.titleSection}>Direct links</div>
            <div className={classes.torrentInfoContainer}>
              {torrent.imdb_code ? (
                <div className={classes.directLink}>
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
                <div className={classes.directLink}>
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
                <div className={classes.directLink}>
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
      {torrent.yt_trailer ? (
        <div>
          <div className={classes.titleSection}>Youtube trailer</div>
          <div className={classes.textAlignCenter}>
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
        </div>
      ) : undefined}
      {yts_torrents.length ? (
        <div>
          <span className={classes.titleSection}>YTS</span>{" "}
          <FiberManualRecordIcon
            style={{
              color: torrent.yts_url ? "#0CCA4A" : "#E63946",
              verticalAlign: "middle",
            }}
          ></FiberManualRecordIcon>
          {torrent.yts_url ? (
            <div className={classes.torrentListContainer}>
              {yts_torrents.map((el, i) => (
                <div key={el.magnet + i} className={classes.torrentElContainer}>
                  <div className={classes.torrentInfoContainer}>
                    <div className={classes.torrentElDetail}>{el.language}</div>
                    <div className={classes.torrentElDetail}>{el.quality}</div>
                    <div className={classes.torrentElDetail}>{el.size}</div>
                  </div>
                  <div className={classes.torrentSeedsContainer}>
                    <div className={classes.torrentSeedPeers}>
                      <span className={classes.torrentElDetail}>Seeds: </span>
                      <span className={classes.seeds}>{el.seeds}</span>
                    </div>
                    <div className={classes.soloFlex}>
                      <span className={classes.torrentElDetail}>Peers: </span>
                      <span className={classes.peers}>{el.peers}</span>
                    </div>
                  </div>
                  <div className={classes.torrentSeedsContainer}>
                    <div className={classes.torrentSeedPeers}>
                      <div className={classes.torrentElDetail}>
                        <a
                          className={classes.peers}
                          href={el.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          YTS
                        </a>
                      </div>
                    </div>
                    <div className={classes.soloFlex}>
                      {auth.isLogged ? (
                        <div className={classes.titleSection}>
                          <a
                            className={classes.peers}
                            href={el.torrent}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download
                          </a>
                        </div>
                      ) : undefined}
                    </div>
                    <div className={classes.soloFlex}>
                      {auth.isLogged ? (
                        <div className={classes.titleSection}>
                          <a
                            className={classes.peers}
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
      ) : undefined}
      {t9_torrents.length ? (
        <div>
          <span className={classes.titleSection}>Torrent9</span>{" "}
          <FiberManualRecordIcon
            style={{
              color: torrent.torrent9_url ? "#0CCA4A" : "#E63946",
              verticalAlign: "middle",
            }}
          ></FiberManualRecordIcon>
          {torrent.torrent9_url ? (
            <div className={classes.torrentListContainer}>
              {t9_torrents.map((el, i) => (
                <div key={el.magnet + i} className={classes.torrentElContainer}>
                  <div className={classes.torrentInfoContainer}>
                    <div className={classes.torrentElDetail}>
                      {el.languages}
                    </div>
                    <div className={classes.torrentElDetail}>{el.quality}</div>
                    <div className={classes.torrentElDetail}>{el.size}</div>
                  </div>
                  <div className={classes.torrentSeedsContainer}>
                    <div className={classes.torrentSeedPeers}>
                      <span className={classes.torrentElDetail}>Seeds: </span>
                      <span className={classes.seeds}>{el.seeds}</span>
                    </div>
                    <div className={classes.soloFlex}>
                      <span className={classes.torrentElDetail}>Peers: </span>
                      <span className={classes.peers}>{el.peers}</span>
                    </div>
                  </div>
                  <div className={classes.torrentSeedsContainer}>
                    <div className={classes.torrentSeedPeers}>
                      <div className={classes.torrentElDetail}>
                        <a
                          className={classes.peers}
                          href={el.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Torrent9
                        </a>
                      </div>
                    </div>
                    <div className={classes.soloFlex}>
                      {auth.isLogged ? (
                        <div className={classes.titleSection}>
                          <a
                            className={classes.peers}
                            href={el.torrent}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download
                          </a>
                        </div>
                      ) : undefined}
                    </div>
                    <div className={classes.soloFlex}>
                      {auth.isLogged ? (
                        <div className={classes.titleSection}>
                          <a
                            className={classes.peers}
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
      ) : undefined}
      <div className={classes.commentSectionContainer}>
        <div className={classes.torrentTitle}>Comment section</div>
        <div className={classes.commentInputContainer}>
          {auth.isLogged ? (
            <form onSubmit={handleSendComment}>
              <Input
                classes={{
                  root: classes.rootSend,
                  input: classes.inputColor,
                  underline: classes.borderBottom,
                }}
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
                    <SendIcon className={classes.sendIcon}></SendIcon>
                  </IconButton>
                }
              />
            </form>
          ) : (
            <div>
              <div className={classes.titleSection}>
                You must be logged to post a new comment
              </div>
            </div>
          )}
        </div>
        <div>
          {comments.length ? (
            comments.map((el) => (
              <div key={el.id} className={classes.commentElContainer}>
                <div className={classes.commentAvatarContainer}>
                  <Avatar
                    alt={el.username}
                    src={"./src/assets/photos/" + el.photos}
                  />
                </div>
                <div className={classes.commentTextContainer}>
                  <div className={classes.commentHeader}>
                    From <b>{el.username}</b>,{" "}
                    {moment(el.created_at).format("DD/MM/YYYY HH:mm:ss ")}
                  </div>
                  <div className={classes.commentText}>{el.comment}</div>
                </div>
              </div>
            ))
          ) : (
            <div>
              <div className={classes.titleSection}>
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
