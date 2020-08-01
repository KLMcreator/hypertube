// react
import { useHistory } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
// framework
import withStyles from "@material-ui/core/styles/withStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
// icon
import StarIcon from "@material-ui/icons/Star";
import ThumbUpAltIcon from "@material-ui/icons/ThumbUpAlt";
import ThumbDownAltIcon from "@material-ui/icons/ThumbDownAlt";

const UserStyles = (theme) => ({
  root: {
    height: "100%",
    padding: 30,
  },
  loading: {
    display: "flex",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  //display flex items
  userInfos: {
    display: "flex",
    [theme.breakpoints.down("xs")]: {
      display: "block",
    },
    border: "1px solid rgba(41, 41, 41, .5)",
    padding: 10,
    borderRadius: 4,
  },
  userPhoto: {
    flex: 2,
    [theme.breakpoints.down("xs")]: {
      marginLeft: "70px",
    },
  },
  userDetails: {
    flex: 6,
  },
  userDetailsContainer: {
    display: "flex",
    [theme.breakpoints.down("xs")]: {
      display: "block",
      marginRight: 0,
    },
    marginRight: 120,
  },
  userDetailsChild: {
    flex: 1,
    padding: 10,
  },
  // Profile picture and uploading button
  containerImg: {
    display: "inline-block",
    position: "absolute",
    height: "100%",
  },
  userImage: {
    border: "1px solid #D0D0D0",
    borderRadius: "4px",
    padding: "5px",
    height: "auto",
    width: "150px",
    display: "block",
  },
  positioner: {
    width: "15%",
    height: "15%",
    top: 7,
    left: 7,
    position: "absolute",
  },
  changeImgIcon: {
    width: 20,
    padding: "2%",
    height: 20,
    color: "#D0D0D0",
    border: "1px solid #D0D0D0",
    position: "absolute",
    borderRadius: "50%",
    backgroundColor: "#1a1a1a",
  },

  // Error popup message
  errorCheck: {
    color: "#E63946",
    fontSize: 12,
    marginBottom: 3,
    marginTop: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconsMessage: {
    marginRight: 4,
  },

  // Loading logo
  loadingLogo: {
    color: "#E63946",
  },

  // Inputs classes
  rootSend: {
    width: "100%",
    marginBottom: 5,
  },
  borderBottom: {
    "&.MuiInput-underline:before": {
      borderBottom: "1px solid #373737",
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
    color: "rgba(90, 90, 91)",
  },
  inputColor: {
    backgroundColor: "#373737",
    color: "#fff",
  },
  switchAccount: {
    color: "#D0D0D0",
  },
  toggleAccount: {
    justifyContent: "center",
  },
  submitBtn: {
    color: "#D0D0D0",
  },
  submitSpecialFormBtn: {
    margin: 0,
    padding: 0,
    textAlign: "center",
    color: "#D0D0D0",
  },
  select: {
    width: "100%",
    fontSize: 13,
    "&:after": {
      borderBottomColor: "#e63946",
    },
  },
  formControl: {
    width: "100%",
  },

  // Render torrent
  torrentsContainerList: {
    paddingTop: 15,
  },
  torrentsContainer: {
    [theme.breakpoints.down("xs")]: {
      display: "block",
    },
    display: "flex",
    borderBottom: "1px solid rgba(41, 41, 41, 1)",
    borderRadius: "4px",
    margin: 5,
  },
  torrentsCategories: {
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
    display: "flex",
    textAlign: "center",
    borderBottom: "0.5px solid #f50057",
    fontSize: "18px",
  },
  torrentTitle_cate: {
    flex: 1,
    alignSelf: "center",
    color: "#A3A3A3",
  },
  torrentDetails_cate: {
    display: "flex",
    flex: 1,
    color: "#A3A3A3",
  },
  torrentInfos_cate: {
    flex: 1,
    padding: 10,
  },
  torrentDescr: {
    display: "flex",
    color: "#D0D0D0",
  },
  torrentImg: {
    maxWidth: "-webkit-fill-available",
    flex: "2",
    [theme.breakpoints.down("xs")]: {
      alignSelf: "center",
    },
  },
  torrentTitle: {
    flex: 1,
    display: "flex",
  },
  ratingIcon: {
    verticalAlign: "middle",
    color: "#FBBA72",
    marginBottom: "6px",
  },
  titleDetails: {
    flex: "10",
    alignSelf: "center",
    [theme.breakpoints.down("xs")]: {
      textAlign: "center",
    },
    verticalAlign: "middle",
  },
  torrentDetails: {
    display: "flex",
    flex: 1,
    alignSelf: "center",
    textAlign: "center",
  },
  torrentInfos: {
    flex: 1,
    padding: 10,
    alignSelf: "center",
    textAlign: "center",
  },
  likedIcon: {
    color: "rgba(154, 19, 0)",
  },
  userInfo: {
    marginLeft: "auto",
    marginRight: "auto",
    color: "#E63946",
    justifyContent: "center",
    fontWeight: "bold",
  },
  headerView: {
    justifyContent: "center",
    fontWeight: "bold",
    alignSelf: "center",
    color: "#A3A3A3",
    fontSize: "32px",
  },
});

const User = (props) => {
  const ref = useRef(false);
  const history = useHistory();
  const { classes } = props;
  const [user, setUser] = useState([]);
  const [torrents, setTorrents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getUserInfos = () => {
    fetch("/api/users/get", {
      method: "POST",
      body: JSON.stringify({
        id: props.props.location.state.user,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.users) {
          setUser({
            id: res.users[0].id,
            firstname: res.users[0].firstname,
            lastname: res.users[0].lastname,
            language: res.users[0].language,
            photo: res.users[0].photos,
            username: res.users[0].username,
            last_connection: res.users[0].last_connection,
            connected: res.users[0].connected,
          });
        }
        setIsLoading(false);
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  const getTorrentsUser = () => {
    fetch("/api/users/get/torrentscom", {
      method: "POST",
      body: JSON.stringify({
        id: props.props.location.state.user,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.torrents) {
          setTorrents(res.torrents);
          setIsLoading(false);
        } else if (res.torrents.msg) {
          props.auth.errorMessage(res.torrents.msg);
        } else {
          props.auth.errorMessage("Error while fetching database.");
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  useEffect(() => {
    ref.current = true;
    if (!props.props.location.state) {
      props.auth.errorMessage("Missing arguments, action not allowed.");
      history.push({
        pathname: "/",
      });
    } else {
      getUserInfos();
      getTorrentsUser();
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
      <div className={classes.userInfos}>
        <div
          className={classes.userPhoto}
          style={{ height: "260px", marginLeft: "30%", marginTop: "2%" }}
        >
          <img
            alt={user.photo}
            className={classes.userImage}
            src={user.photo}
          ></img>
        </div>

        <div className={classes.userDetails} style={{ marginTop: "2%" }}>
          <div className={classes.userDetailsContainer}>
            <div>
              <span className={classes.userInfo}>
                {user.language === "English" ? "Username:" : "Utilisateur :"}
              </span>{" "}
              {user.username} <br /> <br />
              <span className={classes.userInfo}>
                {" "}
                {user.language === "English" ? "First Name:" : "Prénom :"}
              </span>{" "}
              {user.firstname} <br /> <br />
              <span className={classes.userInfo}>
                {user.language === "English" ? "Last Name:" : "Nom :"}
              </span>{" "}
              {user.lastname} <br /> <br />
              <span className={classes.userInfo}>
                {user.language === "English" ? "Language:" : "Langue :"}
              </span>{" "}
              <span>
                {" "}
                {user.language === "English" ? " English" : "Français"}
              </span>{" "}
              <br /> <br />
              <span className={classes.userInfo}>
                {user.language === "English" ? "Last Connected:" : "Connecté :"}
              </span>{" "}
              {user.connected
                ? user.language === "English"
                  ? "Online"
                  : "En Ligne"
                : user.last_connection}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div>
          <br />
          <span className={classes.headerView}>
            {" "}
            {user.language === "English" ? "Viewed Movies" : "Films vus"}
          </span>{" "}
        </div>

        <div className={classes.torrentsContainerList}>
          <div className={classes.torrentsCategories}>
            <div className={classes.torrentTitle_cate}>
              <span>
                {" "}
                {user.language === "English" ? "Title" : "Titre du Film"}
              </span>{" "}
            </div>
            <div className={classes.torrentDetails_cate}>
              <div className={classes.torrentInfos_cate}>
                <span>
                  {" "}
                  {user.language === "English" ? " Watched at" : "Visionné le"}
                </span>{" "}
              </div>
              <div className={classes.torrentInfos_cate}>
                <span>
                  {" "}
                  {user.language === "English"
                    ? " Liked or not liked?"
                    : "Apprécié ou non ? "}
                </span>{" "}
              </div>
              <div className={classes.torrentInfos_cate}>
                <span>
                  {" "}
                  {user.language === "English" ? " Comments" : "Commentaires"}
                </span>{" "}
              </div>
            </div>
          </div>
          {torrents && torrents.length ? (
            <div>
              {torrents.map((el) => (
                <div key={el.id} className={classes.torrentsContainer}>
                  <div className={classes.torrentTitle}>
                    <div className={classes.torrentImg}>
                      <img
                        alt={el.cover_url}
                        style={{ width: "50px" }}
                        src={el.cover_url}
                      ></img>
                    </div>

                    <div className={classes.titleDetails}>
                      {el.title} - {"(" + el.production_year + ")"} -{" "}
                      {el.rating} <StarIcon className={classes.ratingIcon} />
                    </div>
                  </div>
                  <div className={classes.torrentDetails}>
                    <div className={classes.torrentInfos}>
                      {el.viewed_at
                        ? moment(el.viewed_at).format("DD MMM, YYYY")
                        : undefined}
                    </div>
                    <div className={classes.torrentInfos}>
                      {el.liked ? (
                        <div className={classes.likedIcon}>
                          <ThumbUpAltIcon />
                        </div>
                      ) : el.liked === false ? (
                        <div className={classes.likedIcon}>
                          <ThumbDownAltIcon />
                        </div>
                      ) : undefined}
                    </div>
                    <div className={classes.torrentInfos}>
                      {el.comment
                        ? el.comment.substring(0, 50) + "..."
                        : undefined}{" "}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : undefined}
        </div>
      </div>
    </div>
  );
};

export default withStyles(UserStyles)(User);
