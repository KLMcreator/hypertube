// react
import moment from "moment";
import { useHistory } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
// framework
import Input from "@material-ui/core/Input";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
// icon
import SendIcon from "@material-ui/icons/Send";
import StarRateIcon from "@material-ui/icons/StarRate";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";

const WatchStyles = (theme) => ({
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
  rootSend: {
    width: "100%",
    marginBottom: 5,
  },
  borderBottom: {
    "&.MuiInput-underline:before": {
      borderBottom: "1px solid #9A1300",
    },
    "&.MuiInput-underline:after": {
      borderBottom: "1px solid #9A1300",
    },
    "&.MuiInput-underline:hover::before": {
      borderBottom: "2px solid #9A1300",
    },
    "&.MuiInput-underline:hover::after": {
      borderBottom: "1px solid #9A1300",
    },
  },
  sendIcon: {
    color: "#9A1300",
  },
  inputColor: {
    color: "#fff",
  },
  titleContainer: {
    flex: 3,
    alignSelf: "center",
    fontWeight: "bold",
  },
  titleYear: {
    fontSize: 20,
    color: "#D0D0D0",
  },
  titleName: {
    fontSize: 20,
    color: "#EFF1F3",
  },
  starIcon: {
    fontSize: 30,
    color: "#FBBA72",
    verticalAlign: "middle",
  },
});

const commentStyle = (theme) => ({
  root: {
    display: "flex",
    border: "0.5px solid rgba(41, 41, 41, .5)",
    padding: 5,
  },
  icons: {
    flex: 1,
    textAlign: "-webkit-center",
    alignSelf: "center",
  },
  main: {
    flex: 10,
  },
  content: {
    padding: 5,
  },
});

const RenderComment = (props) => {
  const { auth, loggedId, comment, classes } = props;

  const handleDeleteComment = () => {
    props.handleDeleteComment(loggedId, comment.id, comment.video_id);
  };

  return (
    <div className={classes.root}>
      <div className={classes.icons}>
        <Avatar
          alt={comment.username}
          src={
            comment.photos.startsWith("https://")
              ? comment.photos
              : "./src/assets/photos/" + comment.photos
          }
        />
      </div>
      <div className={classes.main}>
        <div className={classes.content}>
          From <b>{comment.username}</b>,{" "}
          {moment(comment.created_at).format("DD/MM/YYYY HH:mm:ss ")}
        </div>
        <div className={classes.content}>{comment.comment}</div>
      </div>
      {auth.isLogged && loggedId === comment.user_id ? (
        <IconButton className={classes.icons} onClick={handleDeleteComment}>
          <DeleteForeverIcon style={{ color: "#9A1300" }}></DeleteForeverIcon>
        </IconButton>
      ) : undefined}
    </div>
  );
};

const Watch = (props) => {
  const ref = useRef(false);
  const { classes, auth } = props;
  const history = useHistory();
  const [subs, setSubs] = useState([]);
  const [limit, setLimit] = useState(10);
  const [movie, setMovie] = useState([]);
  const [source, setSource] = useState(false);
  const [comments, setComments] = useState([]);
  const [torrent, setTorrent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [canComment, setCanComment] = useState(true);

  const Comments = withStyles(commentStyle)(RenderComment);

  const getComments = (loadMore, mv, tr) => {
    fetch("/api/comments/torrent", {
      method: "POST",
      body: JSON.stringify({
        id: mv.id,
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
            } else {
              if (tr.downloaded) {
                if (tr.path.endsWith(".mp4") || tr.path.endsWith(".webm")) {
                  setSource(`http://localhost:3000${tr.path}`);
                } else {
                  setSource(
                    `http://localhost:3000/stream/pump?path=${tr.path}`
                  );
                }
              } else {
                setSource(
                  `http://localhost:3000/stream?movie=${mv.id}&torrent=${tr.id}&magnet=${tr.magnet}`
                );
              }
            }
            for (let i = 0; i < res.comments.comments.length; i++) {
              if (res.comments.comments[i].user_id === auth.loggedId) {
                setCanComment(false);
                break;
              }
            }
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

  const getTorrentsInfos = () => {
    fetch("/api/torrents/info", {
      method: "POST",
      body: JSON.stringify({
        id: props.props.location.state.movie.id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (ref.current) {
          if (
            res.torrents.torrents &&
            res.torrents.torrents.length &&
            res.torrents.torrents[0]
          ) {
            if (
              res.torrents.torrents[0].subtitles &&
              res.torrents.torrents[0].subtitles.length
            )
              setSubs(JSON.parse(res.torrents.torrents[0].subtitles));
            setMovie(res.torrents.torrents[0]);
            let selectedTorrent = JSON.parse(res.torrents.torrents[0].torrents);
            selectedTorrent =
              selectedTorrent[
                selectedTorrent.findIndex(
                  (e) => e.id === props.props.location.state.torrent.id
                )
              ];
            setTorrent(selectedTorrent);
            getComments(false, res.torrents.torrents[0], selectedTorrent);
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
    if (newComment && newComment.length < 1000) {
      fetch("/api/comments/send", {
        method: "POST",
        body: JSON.stringify({
          video_id: movie.id,
          comment: newComment,
        }),
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.comments.comments) {
            getComments(false, movie, torrent);
            setNewComment("");
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
      if (auth.loggedId && id && video_id) {
        fetch("/api/comments/delete", {
          method: "POST",
          body: JSON.stringify({
            user_id: auth.loggedId,
            video_id: video_id,
            comment_id: id,
          }),
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.comments.comments) {
              setCanComment(true);
              getComments(false, movie, torrent);
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

  useEffect(() => {
    ref.current = true;
    if (
      !props.props.location.state.movie ||
      !props.props.location.state.torrent
    ) {
      props.auth.errorMessage("Missing arguments, action not allowed.");
      history.push({
        pathname: "/",
      });
    }
    getTorrentsInfos();
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
      {source && source.length ? (
        <video
          style={{ width: "100%" }}
          id="videoPlayer"
          crossOrigin="anonymous"
          controls
          muted
          preload="auto"
          autoPlay
        >
          <source type="video/mp4" src={source} />
          <track kind="off" default />
          {subs && subs.length
            ? subs.map((e) => (
                <track
                  key={e.language}
                  label={e.language}
                  kind="subtitles"
                  src={`http://localhost:3000/stream/subs?movie=${movie.id}&torrent=${torrent.id}&lang=${e.language}`}
                />
              ))
            : undefined}
        </video>
      ) : undefined}
      <div className={classes.titleContainer}>
        <span className={classes.titleYear}>({movie.production_year})</span>{" "}
        <span className={classes.titleName}>
          {movie.title} - {torrent.quality} - {torrent.language} -{" "}
          {movie.rating}
        </span>{" "}
        <StarRateIcon className={classes.starIcon}></StarRateIcon>
      </div>
      <div>
        <div className={classes.titleContainer}>
          <span className={classes.titleName}>Comment section</span>{" "}
          {props.auth.isLogged && props.auth.loggedId ? (
            <span className={classes.titleYear}>
              {newComment ? newComment.length + "/1000" : undefined}
            </span>
          ) : undefined}
        </div>
        <div>
          {props.auth.isLogged && props.auth.loggedId && canComment ? (
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
                  <SendIcon className={classes.sendIcon}></SendIcon>
                }
              />
            </form>
          ) : !props.auth.isLogged && !props.auth.loggedId && !canComment ? (
            <div>
              <div>You must be logged to post a new comment</div>
            </div>
          ) : undefined}
        </div>
        <div>
          {comments.length ? (
            comments.map((el) => (
              <Comments
                key={el.id}
                auth={props.auth}
                loggedId={auth.loggedId}
                handleDeleteComment={handleDeleteComment}
                comment={el}
              ></Comments>
            ))
          ) : (
            <div>No comments, be the first to post one</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withStyles(WatchStyles)(Watch);
