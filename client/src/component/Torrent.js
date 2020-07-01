// react
import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
// framework
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Input from "@material-ui/core/Input";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
// icons
import StarRateIcon from "@material-ui/icons/StarRate";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
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
    [theme.breakpoints.down("xs")]: {
      display: "block",
    },
  },
  torrentImageContainer: {
    flexDirection: "column",
    flex: 2,
    padding: 20,
  },
  torrentImage: {
    width: "100%",
    borderRadius: 6,
  },
  torrentDetailsContainer: {
    flexDirection: "column",
    flex: 4,
    padding: 20,
    [theme.breakpoints.up("lg")]: {
      flex: 7,
    },
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
  titleSectionCenter: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  textSection: {
    fontSize: 18,
    color: "#D0D0D0",
  },
  summaryText: {
    fontSize: 18,
    color: "#D0D0D0",
    marginTop: 5,
  },
  directLink: {
    margin: 5,
  },
  torrentContainer: {
    marginTop: 10,
  },
  torrentListContainer: {
    display: "flex",
    flexWrap: "wrap",
  },
  torrentElContainer: {
    flexGrow: 1,
    width: "40%",
    backgroundColor: "#373737",
    borderRadius: 6,
    margin: 10,
    padding: 10,
    [theme.breakpoints.up("lg")]: {
      width: "20%",
    },
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
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
});

const CommentStyles = (theme) => ({
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
    padding: 3,
    width: "100%",
  },
  commentTextContainer: {
    padding: 3,
    flex: 9,
  },
  commentHeader: {
    color: "#D0D0D0",
  },
  commentText: {
    color: "#EFF1F3",
    fontSize: 16,
  },
  deleteIcon: {
    color: "#FBBA72",
  },
});

const YoutubeStyles = (theme) => ({
  titleSection: {
    fontWeight: "bold",
    fontSize: 18,
  },
  youtubePlayerContainer: {
    display: "flex",
  },
  youtubePlayer: {
    flex: 1,
  },
});

const CommentHeaderStyles = (theme) => ({
  torrentTitle: {
    fontWeight: "bold",
    fontSize: 24,
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
  commentLength: {
    marginLeft: 10,
    color: "#474747",
    fontSize: 16,
  },
});

const RenderYoutube = (props) => {
  const { isTrailer, ytCode, classes } = props;

  if (isTrailer) {
    return (
      <div>
        <div className={classes.titleSection}>Youtube trailer</div>
        <div className={classes.youtubePlayerContainer}>
          <iframe
            className={classes.youtubePlayer}
            width="560"
            height="315"
            title="player"
            type="text/html"
            id="player"
            src={
              "https://www.youtube.com/embed/" +
              ytCode[1] +
              "?enablejsapi=1&origin=http://example.com"
            }
            frameBorder="0"
          ></iframe>
        </div>
      </div>
    );
  }
  return <></>;
};

const RenderComment = (props) => {
  const [isMouseIn, setIsMouseIn] = useState(false);
  const { auth, loggedId, comment, classes } = props;

  const handleDeleteComment = () => {
    props.handleDeleteComment(loggedId, comment.id, comment.video_id);
  };

  return (
    <div
      onMouseEnter={() => setIsMouseIn(true)}
      onMouseLeave={() => setIsMouseIn(false)}
      className={classes.commentElContainer}
    >
      <div className={classes.commentAvatarContainer}>
        <Avatar
          alt={comment.username}
          src={"./src/assets/photos/" + comment.photos}
        />
      </div>
      <div className={classes.commentTextContainer}>
        <div className={classes.commentHeader}>
          From <b>{comment.username}</b>,{" "}
          {moment(comment.created_at).format("DD/MM/YYYY HH:mm:ss ")}
        </div>
        <div className={classes.commentText}>{comment.comment}</div>
      </div>
      {auth.isLogged && isMouseIn && loggedId === comment.user_id ? (
        <IconButton onClick={handleDeleteComment}>
          <DeleteForeverIcon className={classes.deleteIcon}></DeleteForeverIcon>
        </IconButton>
      ) : undefined}
    </div>
  );
};

const RenderCommentHeader = (props) => {
  const { isLogged, classes, newComment } = props;
  const [comment, setComment] = useState("");

  const handleSendComment = (e) => {
    e.preventDefault();
    props.handleSendComment(comment);
  };

  return (
    <div>
      <div className={classes.torrentTitle}>
        Comment section
        <span className={classes.commentLength}>
          {newComment ? newComment.length + "/1000" : undefined}
        </span>
      </div>
      <div className={classes.commentInputContainer}>
        {isLogged ? (
          <form onSubmit={handleSendComment}>
            <Input
              classes={{
                root: classes.rootSend,
                input: classes.inputColor,
                underline: classes.borderBottom,
              }}
              type="text"
              placeholder="Write a comment about the movie..."
              value={comment}
              required
              onChange={(e) => setComment(e.target.value)}
              endAdornment={
                <IconButton type="submit">
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
    </div>
  );
};

const Torrent = (props) => {
  const ref = useRef(false);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [loggedId, setLoggedId] = useState(false);
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
  const Comment = withStyles(CommentStyles)(RenderComment);
  const Youtube = withStyles(YoutubeStyles)(RenderYoutube);
  const CommentHeader = withStyles(CommentHeaderStyles)(RenderCommentHeader);

  const checkIfLogged = () => {
    fetch("/api/checkToken")
      .then((resLogged) => resLogged.json())
      .then((resLogged) => {
        if (resLogged.status) {
          setLoggedId(resLogged.id);
        }
        setIsLoading(false);
      });
  };

  const getComments = (loadMore) => {
    fetch("/api/comments/torrent", {
      method: "POST",
      body: JSON.stringify({
        id: torrent.id,
        limit: loadMore ? loadMore : limit,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (ref.current) {
          if (res.comments.comments) {
            if (loadMore) {
              setLimit(limit + 10);
            }
            setComments(res.comments.comments);
            checkIfLogged();
          } else if (res.comments.msg) {
            props.auth.errorMessage(res.comments.msg);
          } else {
            props.auth.errorMessage("Error while fetching database.");
          }
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  const handleSendComment = (comment) => {
    if (comment && comment.length < 1000) {
      fetch("/api/comments/send", {
        method: "POST",
        body: JSON.stringify({
          video_id: torrent.id,
          comment: comment,
        }),
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.comments.comments) {
            getComments();
            props.auth.successMessage("Thanks for your comment!");
          } else {
            props.auth.errorMessage(res.comments.msg);
          }
        })
        .catch((err) => props.auth.errorMessage(err));
    } else {
      props.auth.errorMessage("Comment max length is 1000 char.");
    }
  };

  const handleDeleteComment = (loggedId, id, video_id) => {
    let confirmed = window.confirm("Would you like to delete your comment?");
    if (confirmed) {
      if (loggedId && id && video_id) {
        fetch("/api/comments/delete", {
          method: "POST",
          body: JSON.stringify({
            user_id: loggedId,
            video_id: video_id,
            comment_id: id,
          }),
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.comments.comments) {
              getComments();
              props.auth.successMessage("Your comment has been deleted");
            } else {
              props.auth.errorMessage(res.comments.msg);
            }
          })
          .catch((err) => props.auth.errorMessage(err));
      } else {
        props.auth.errorMessage("Invalid values.");
      }
    }
  };

  const RenderLoadMore = () => {
    if (comments && comments.length > limit - 1) {
      return (
        <Button
          variant="outlined"
          color="secondary"
          type="submit"
          onClick={() => {
            getComments(limit + 10);
          }}
        >
          LOAD MORE COMMENTS
        </Button>
      );
    }
    return <></>;
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
            // src={"./src/assets/torrents/" + torrent.cover_url}
            alt={torrent.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "./src/assets/img/nophotos.png";
            }}
          ></img>
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
                ? summary.map((el, i) => (
                    <div key={"summary" + i} className={classes.summaryText}>
                      {el}
                    </div>
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
        </div>
      </div>
      <Youtube ytCode={yt_code} isTrailer={torrent.yt_trailer ? true : false} />
      {yts_torrents.length ? (
        <div className={classes.torrentContainer}>
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
                      <div className={classes.titleSectionCenter}>
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
                        <div className={classes.titleSectionCenter}>
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
                        <div className={classes.titleSectionCenter}>
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
        <div className={classes.torrentContainer}>
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
                      <div className={classes.titleSectionCenter}>
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
                        <div className={classes.titleSectionCenter}>
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
                        <div className={classes.titleSectionCenter}>
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
        <CommentHeader
          isLogged={props.auth.isLogged}
          handleSendComment={handleSendComment}
        />
        <div>
          {comments.length ? (
            comments.map((el) => (
              <Comment
                key={el.id}
                auth={props.auth}
                loggedId={loggedId}
                handleDeleteComment={handleDeleteComment}
                comment={el}
              ></Comment>
            ))
          ) : (
            <div className={classes.titleSection}>
              No comments, be the first to post one
            </div>
          )}
        </div>
        <div className={classes.textAlignCenter}>
          <RenderLoadMore />
        </div>
      </div>
    </div>
  );
};

export default withStyles(TorrentStyles)(Torrent);
