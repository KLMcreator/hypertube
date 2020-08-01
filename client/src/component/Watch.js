// react
import moment from "moment";
import localization from "moment/locale/fr";
import { useHistory } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
// framework
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Input from "@material-ui/core/Input";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import withStyles from "@material-ui/core/styles/withStyles";
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
    padding: 10,
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
  container: {
    backgroundColor: "#1a1a1a",
    boxShadow: "none",
    border: "0.5px solid rgba(41, 41, 41, .5)",
  },
  titleAndLeftInfo: {
    display: "flex",
    textAlign: "left",
    marginBottom: 10,
    [theme.breakpoints.down("xs")]: {
      display: "block",
    },
  },
  torrentInfos: {
    padding: 5,
  },
  torrentSummary: {
    flex: 2,
    color: "#D0D0D0",
  },
  rightInfo: {
    flex: 1,
    textAlign: "left",
  },
  boldInfo: {
    color: "#EFF1F3",
    fontWeight: "bold",
  },
  contentInfo: {
    color: "#D0D0D0",
  },
  torrentTab: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingRight: 10,
    paddingLeft: 10,
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
    wordBreak: "break-word",
  },
});

const RenderComment = (props) => {
  const { auth, loggedId, comment, classes, history } = props;

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
          {auth.language === "English" ? " From: " : " De: "}
          <b
            style={{ cursor: "pointer" }}
            onClick={() => {
              history.push({
                pathname: "/User",
                state: {
                  user: comment.user_id,
                },
              });
            }}
          >
            {comment.username}
          </b>
          ,{" "}
          {auth.language === "English"
            ? moment(comment.created_at).locale("en").format("DD MMM, YYYY")
            : moment(comment.created_at)
                .locale("fr", localization)
                .format("DD/MM/YYYY HH:mm:ss ")}
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
  const [torrent, setTorrent] = useState([]);
  const [source, setSource] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [canComment, setCanComment] = useState(true);

  const Comments = withStyles(commentStyle)(RenderComment);

  const updateViews = (mv, tr) => {
    fetch("/api/views/set", {
      method: "POST",
      body: JSON.stringify({
        movie: mv.id,
        torrent: tr.id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.views.views) {
        } else if (res.comments.msg) {
          props.auth.errorMessage(res.comments.msg);
        } else {
          props.auth.errorMessage("Error while fetching database.");
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

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
                    `http://localhost:3000/stream/pump?path=${tr.path}&title=${mv.title}`
                  );
                }
              } else {
                setSource(
                  `http://localhost:3000/stream?movie=${mv.id}&torrent=${tr.id}&magnet=${tr.magnet}&cover=${mv.cover_url}&title=${mv.title}`
                );
              }
              updateViews(mv, tr);
            }
            for (let i = 0; i < res.comments.comments.length; i++) {
              if (res.comments.comments[i].user_id === auth.loggedId) {
                setCanComment(false);
                break;
              }
            }
            setIsLoading(false);
            setComments(res.comments.comments);
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
            const parsedTorrents = JSON.parse(
              res.torrents.torrents[0].torrents
            );
            const cast = res.torrents.torrents[0].casts
              ? JSON.parse(res.torrents.torrents[0].casts)
              : [];
            const actors = cast.filter(
              (el) => el.job.findIndex((e) => e === "actor") > -1
            );
            const crew = cast.filter(
              (el) => el.job.findIndex((e) => e !== "actor") > -1
            );
            let languages = [];
            let categories = [];
            if (res.torrents.torrents[0].languages) {
              JSON.parse(res.torrents.torrents[0].languages).map((lang) => {
                let pos = languages.map((e) => e).indexOf(lang);
                if (pos === -1) {
                  languages.push(lang);
                }
                return lang;
              });
            }
            if (res.torrents.torrents[0].categories) {
              JSON.parse(res.torrents.torrents[0].categories).map((cate) => {
                let pos = categories.map((e) => e).indexOf(cate);
                if (pos === -1) {
                  categories.push(cate);
                }
                return cate;
              });
            }
            setMovie({
              actors: actors,
              crew: crew,
              categories: categories,
              cover_url: res.torrents.torrents[0].cover_url,
              duration: res.torrents.torrents[0].duration,
              id: res.torrents.torrents[0].id,
              imdb_code: res.torrents.torrents[0].imdb_code,
              languages: languages,
              production_year: res.torrents.torrents[0].production_year,
              rating: res.torrents.torrents[0].rating,
              subtitles: res.torrents.torrents[0].subtitles
                ? JSON.parse(res.torrents.torrents[0].subtitles)
                : [],
              summary: res.torrents.torrents[0].summary,
              title: res.torrents.torrents[0].title,
              torrent9_id: res.torrents.torrents[0].torrent9_id,
              torrent9_url: res.torrents.torrents[0].torrent9_url,
              torrents: parsedTorrents,
              yt_trailer: res.torrents.torrents[0].yt_trailer,
              yts_id: res.torrents.torrents[0].yts_id,
              yts_url: res.torrents.torrents[0].yts_url,
            });
            let selectedTorrent = parsedTorrents;
            selectedTorrent =
              selectedTorrent[
                selectedTorrent.findIndex(
                  (e) => e.id === props.props.location.state.torrent.id
                )
              ];
            setTorrent(selectedTorrent);
            getComments(false, res.torrents.torrents[0], selectedTorrent);
          } else if (res.torrents.msg) {
            props.auth.errorMessage(res.torrents.msg);
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
      props.auth.errorMessage("Comment max length is 999 char.");
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
    if (!props.props.location.state) {
      props.auth.errorMessage("Missing arguments, action not allowed.");
      history.push({
        pathname: "/",
      });
    } else {
      getTorrentsInfos();
    }
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
          controlsList="nodownload"
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
      <div>
        <Tabs
          value={selectedTab}
          onChange={(e, v) => setSelectedTab(v)}
          variant="fullWidth"
        >
          <Tab label="INFORMATIONS" id="INFO_TAB" />
          <Tab
            label={auth.language === "English" ? "CAST" : "CASTING"}
            id="TORRENT_TAB"
          />
        </Tabs>
        <div className={classes.titleAndLeftInfo}>
          <div className={classes.titleContainer}>
            <span className={classes.titleYear}>({movie.production_year})</span>{" "}
            <span className={classes.titleName}>
              {movie.title} - {torrent.quality} -{" "}
              {torrent.language === "English"
                ? auth.language === "English"
                  ? "English"
                  : "Anglais"
                : auth.language === "English"
                ? "French"
                : "Français"}{" "}
              - {movie.rating}
            </span>{" "}
            <StarRateIcon className={classes.starIcon}></StarRateIcon>
          </div>
        </div>
        {selectedTab === 0 ? (
          <div className={classes.torrentInfos}>
            <div className={classes.titleAndLeftInfo}>
              {movie.summary ? (
                <div className={classes.torrentSummary}>{movie.summary}</div>
              ) : undefined}
              <div className={classes.rightInfo}>
                <div>
                  <span className={classes.boldInfo}>
                    {" "}
                    {auth.language === "English"
                      ? "Categories:"
                      : "Catégories:"}
                  </span>{" "}
                  <span className={classes.contentInfo}>
                    {movie.categories.length
                      ? movie.categories.map((el, i) =>
                          i < movie.categories.length - 1 ? el + " / " : el
                        )
                      : auth.language === "English"
                      ? "No informations"
                      : "Aucune information"}
                  </span>
                </div>
                <div>
                  <span className={classes.boldInfo}>
                    {" "}
                    {auth.language === "English" ? "Languages:" : "Langages:"}
                  </span>{" "}
                  <span className={classes.contentInfo}>
                    {movie.languages.length
                      ? movie.languages.map((el, i) =>
                          i < movie.languages.length - 1 ? el + " / " : el
                        )
                      : auth.language === "English"
                      ? "No informations"
                      : "Aucune information"}
                  </span>
                </div>
                {movie.subtitles && movie.subtitles.length ? (
                  <div>
                    <span className={classes.boldInfo}>
                      {" "}
                      {auth.language === "English"
                        ? "Subtitles:"
                        : "Sous-titres:"}
                    </span>{" "}
                    <span className={classes.contentInfo}>
                      {movie.subtitles.length
                        ? movie.subtitles.map((el, i) =>
                            i < movie.subtitles.length - 1
                              ? el.language + " / "
                              : el.language
                          )
                        : auth.language === "English"
                        ? "No informations"
                        : "Aucune information"}
                    </span>
                  </div>
                ) : undefined}
                {torrent.duration ? (
                  <div>
                    <span className={classes.boldInfo}>
                      {" "}
                      {auth.language === "English" ? "Duration:" : "Durée:"}
                    </span>{" "}
                    <span className={classes.contentInfo}>
                      {torrent.duration}mn
                    </span>
                  </div>
                ) : undefined}
                {torrent.lastviewed_at ? (
                  <div>
                    <span className={classes.boldInfo}>
                      {" "}
                      {auth.language === "English"
                        ? "Last viewed:"
                        : "Dernier visionnage:"}
                    </span>{" "}
                    <span className={classes.contentInfo}>
                      {moment(torrent.lastviewed_at).format("DD/MM/YYYY")}
                    </span>
                  </div>
                ) : undefined}
                {torrent.downloaded_at ? (
                  <div>
                    <span className={classes.boldInfo}>
                      {" "}
                      {auth.language === "English"
                        ? "Last download:"
                        : "Dernier téléchargement:"}
                    </span>{" "}
                    <span className={classes.contentInfo}>
                      {moment(torrent.lastviewed_at).format("DD/MM/YYYY")}
                    </span>
                  </div>
                ) : undefined}
              </div>
            </div>
          </div>
        ) : (
          <div className={classes.torrentTab}>
            {movie.actors && movie.actors.length ? (
              <div>
                <span className={classes.boldInfo}>
                  {" "}
                  {auth.language === "English" ? "Actors:" : "Acteurs:"}
                </span>{" "}
                <span className={classes.contentInfo}>
                  {movie.actors.length
                    ? movie.actors.map((el, i) =>
                        i < movie.actors.length - 1 ? el.name + " / " : el.name
                      )
                    : auth.language === "English"
                    ? "No informations"
                    : "Aucune information"}
                </span>
              </div>
            ) : undefined}
            {movie.crew && movie.crew.length ? (
              <div>
                <span className={classes.boldInfo}>
                  {auth.language === "English" ? "Crew:" : "Équipe:"}
                </span>{" "}
                <span className={classes.contentInfo}>
                  {movie.crew.length
                    ? movie.crew.map((el, i) =>
                        i < movie.crew.length - 1 ? el.name + " / " : el.name
                      )
                    : auth.language === "English"
                    ? "No informations"
                    : "Aucune information"}
                </span>
              </div>
            ) : undefined}
          </div>
        )}
      </div>
      <div>
        <div className={classes.titleContainer}>
          <span className={classes.titleName}>
            {auth.language === "English"
              ? "Comment section:"
              : "Section commentaires:"}
          </span>{" "}
          {props.auth.isLogged && props.auth.loggedId ? (
            <span className={classes.titleYear}>
              {newComment ? newComment.length + "/999" : undefined}
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
                placeholder={
                  auth.language === "English"
                    ? "Write a comment about the movie..."
                    : "Écrivez un commentaire au sujet de ce film..."
                }
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
              <div>
                {auth.language === "English"
                  ? "You must be logged to post a new comment"
                  : "Vous devez être identifié pour poster un nouveau commentaire."}
              </div>
            </div>
          ) : undefined}
        </div>
        <div>
          {comments.length ? (
            comments.map((el) => (
              <Comments
                key={el.id}
                auth={props.auth}
                history={history}
                loggedId={auth.loggedId}
                handleDeleteComment={handleDeleteComment}
                comment={el}
              ></Comments>
            ))
          ) : (
            <div>
              {" "}
              {auth.language === "English"
                ? "No comments, be the first to post one"
                : "Aucun commentaire, soyez le premier à en poster un"}
            </div>
          )}
        </div>
        <div style={{ textAlign: "center", padding: 30 }}>
          {auth.language === "English"
            ? "Hypertube made by cvannica, eozimek and mmany."
            : "Hypertube créé par cvannica, eozimek et mmany."}
        </div>
      </div>
    </div>
  );
};

export default withStyles(WatchStyles)(Watch);
