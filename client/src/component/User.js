// react
import moment from "moment";
import localization from "moment/locale/fr";
import { useHistory } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
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
  userInformations: {
    padding: 10,
  },
  userImage: {
    border: "1px solid #D0D0D0",
    borderRadius: "4px",
    padding: "5px",
    height: "auto",
    width: "150px",
    display: "block",
  },
  errorCheck: {
    color: "#E63946",
    fontSize: 12,
    marginBottom: 3,
    marginTop: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingLogo: {
    color: "#E63946",
  },

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
  const { classes, auth } = props;
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
          getTorrentsUser();
        }
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
            src={
              user.photo === "./src/assets/img/nophotos.png" ||
              user.photo.startsWith("https://")
                ? user.photo
                : "./src/assets/photos/" + user.photo
            }
          ></img>
        </div>

        <div className={classes.userDetails} style={{ marginTop: "2%" }}>
          <div className={classes.userDetailsContainer}>
            <div className={classes.userInformations}>
              <span className={classes.userInfo}>
                {auth.language === "English" ? "Username:" : "Utilisateur:"}
              </span>{" "}
              {user.username} <br /> <br />
              <span className={classes.userInfo}>
                {" "}
                {auth.language === "English" ? "First Name:" : "Prénom:"}
              </span>{" "}
              {user.firstname} <br /> <br />
              <span className={classes.userInfo}>
                {auth.language === "English" ? "Last Name:" : "Nom:"}
              </span>{" "}
              {user.lastname} <br /> <br />
              <span className={classes.userInfo}>
                {auth.language === "English" ? "Language:" : "Langue:"}
              </span>{" "}
              <span>
                {" "}
                {auth.language === "English" ? " English" : "Français"}
              </span>{" "}
              <br /> <br />
              <span className={classes.userInfo}>
                {auth.language === "English" ? "Last Connected:" : "Connecté:"}
              </span>{" "}
              {user.connected
                ? auth.language === "English"
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
            {auth.language === "English" ? "Viewed Movies" : "Films vus"}
          </span>{" "}
        </div>

        <div className={classes.torrentsContainerList}>
          <div className={classes.torrentsCategories}>
            <div className={classes.torrentTitle_cate}>
              <span>
                {" "}
                {auth.language === "English" ? "Title" : "Titre du Film"}
              </span>{" "}
            </div>
            <div className={classes.torrentDetails_cate}>
              <div className={classes.torrentInfos_cate}>
                <span>
                  {" "}
                  {auth.language === "English" ? " Watched at" : "Visionné le"}
                </span>{" "}
              </div>
              <div className={classes.torrentInfos_cate}>
                <span>
                  {" "}
                  {auth.language === "English"
                    ? " Liked or not liked?"
                    : "Apprécié ou non ? "}
                </span>{" "}
              </div>
              <div className={classes.torrentInfos_cate}>
                <span>
                  {" "}
                  {auth.language === "English" ? " Comments" : "Commentaires"}
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
                        ? auth.language === "English"
                          ? moment(el.viewed_at)
                              .locale("en")
                              .format("DD MMM, YYYY")
                          : moment(el.viewed_at)
                              .locale("fr", localization)
                              .format("DD MMM, YYYY")
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
                        ? el.comment.length < 51
                          ? el.comment
                          : el.comment.substring(0, 50) + "..."
                        : undefined}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : undefined}
        </div>
      </div>
      <div style={{ textAlign: "center", padding: 30 }}>
        {auth.language === "English"
          ? "Hypertube made by cvannica, eozimek and mmany."
          : "Hypertube créé par cvannica, eozimek et mmany."}
      </div>
    </div>
  );
};

export default withStyles(UserStyles)(User);
