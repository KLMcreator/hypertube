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
});

const RenderComment = (props) => {
  const [isMouseIn, setIsMouseIn] = useState(false);
  const { auth, loggedId, comment } = props;

  const handleDeleteComment = () => {
    props.handleDeleteComment(loggedId, comment.id, comment.video_id);
  };

  return (
    <div
      onMouseEnter={() => setIsMouseIn(true)}
      onMouseLeave={() => setIsMouseIn(false)}
    >
      <div>
        <Avatar
          alt={comment.username}
          src={
            comment.photos.startsWith("https://")
              ? comment.photos
              : "./src/assets/photos/" + comment.photos
          }
        />
      </div>
      <div>
        <div>
          From <b>{comment.username}</b>,{" "}
          {moment(comment.created_at).format("DD/MM/YYYY HH:mm:ss ")}
        </div>
        <div>{comment.comment}</div>
      </div>
      {auth.isLogged && isMouseIn && loggedId === comment.user_id ? (
        <IconButton onClick={handleDeleteComment}>
          <DeleteForeverIcon></DeleteForeverIcon>
        </IconButton>
      ) : undefined}
    </div>
  );
};

const Watch = (props) => {
  const ref = useRef(false);
  const { classes } = props;
  const history = useHistory();
  const [sub, setSub] = useState(false);
  const [limit, setLimit] = useState(10);
  const [source, setSource] = useState(false);
  const [comments, setComments] = useState([]);
  const [loggedId, setLoggedId] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const { movie, torrent } = props.props.location.state;
  const subs = movie.subtitles ? JSON.parse(movie.subtitles) : [];

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
        id: movie.id,
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
              if (props.props.location.state.torrent.downloaded) {
                setSource(
                  `http://localhost:3000${props.props.location.state.torrent.path}`
                );
              } else {
                setSource(
                  `http://localhost:3000/stream?movie=${movie.id}&torrent=${torrent.id}&magnet=${torrent.magnet}`
                );
              }
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
            getComments();
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

  useEffect(() => {
    console.log(
      props.props.location.state.movie,
      props.props.location.state.torrent
    );
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
          {subs && subs.length
            ? subs.map((e) => (
                <track
                  key={e.language}
                  label={e.language}
                  kind="subtitles"
                  src={`http://localhost:3000/stream/subs?movie=${movie.id}&torrent=${torrent.id}&url=${e.url}`}
                />
              ))
            : undefined}
          <track kind="off" default />
        </video>
      ) : undefined}
      <div style={{ flex: 3, alignSelf: "center", fontWeight: "bold" }}>
        <span style={{ fontSize: 20, color: "#D0D0D0" }}>
          ({movie.production_year})
        </span>{" "}
        <span style={{ fontSize: 20, color: "#EFF1F3" }}>
          {movie.title} - {movie.rating}
        </span>{" "}
        <StarRateIcon
          style={{
            fontSize: 30,
            color: "#FBBA72",
            verticalAlign: "middle",
          }}
        ></StarRateIcon>
      </div>
      <div>
        <div>
          Comment section
          {props.auth.isLogged ? (
            <span>{newComment ? newComment.length + "/1000" : undefined}</span>
          ) : undefined}
        </div>
        <div>
          {props.auth.isLogged ? (
            <form onSubmit={handleSendComment}>
              <Input
                // classes={{
                //   root: classes.rootSend,
                //   input: classes.inputColor,
                //   underline: classes.borderBottom,
                // }}
                type="text"
                placeholder="Write a comment about the movie..."
                value={newComment}
                required
                onChange={(e) => setNewComment(e.target.value)}
                endAdornment={
                  <IconButton type="submit">
                    <SendIcon></SendIcon>
                  </IconButton>
                }
              />
            </form>
          ) : (
            <div>
              <div>You must be logged to post a new comment</div>
            </div>
          )}
        </div>
        <div>
          {comments.length ? (
            comments.map((el) => (
              <RenderComment
                key={el.id}
                auth={props.auth}
                loggedId={loggedId}
                handleDeleteComment={handleDeleteComment}
                comment={el}
              ></RenderComment>
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
