// react
import { useHistory } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
// framework
import withStyles from "@material-ui/core/styles/withStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
// icon

const UserStyles = (theme) => ({
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

const User = (props) => {
  const ref = useRef(false);
  const history = useHistory();
  const { classes } = props;
  const [user, setUser] = useState([]);
  const [views, setViews] = useState([]);
  const [likes, setLikes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getViewedMovies = () => {
    fetch("/api/views/get", {
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
        if (res.views) {
          setViews(res.views);
          setIsLoading(false);
        } else if (res.views.msg) {
          props.auth.errorMessage(res.views.msg);
        } else {
          props.auth.errorMessage("Error while fetching database.");
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  const getLikedMovies = () => {
    fetch("/api/likes/get", {
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
        if (res.likes) {
          setLikes(res.likes);
          getViewedMovies();
        } else if (res.likes.msg) {
          props.auth.errorMessage(res.likes.msg);
        } else {
          props.auth.errorMessage("Error while fetching database.");
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

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
        if (ref.current) {
          if (res.users) {
            setUser(res.users[0]);
            getLikedMovies();
          } else if (res.users.msg) {
            props.auth.errorMessage(res.users.msg);
          } else {
            props.auth.errorMessage("Error while fetching database.");
          }
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

  console.log(user, views, likes);

  return (
    <div className={classes.root}>
      <img
        alt={user.photos}
        className={classes.userImage}
        src={
          user.photos.startsWith("https://")
            ? user.photos
            : "./src/assets/photos/" + user.photos
        }
      ></img>
      <div>
        {user.firstname} "{user.username}" {user.lastname}
      </div>
      <div>{user.language}</div>
      <div>Connected? {user.connected ? "Yes" : user.last_connection}</div>
      {views && views.length ? (
        <div>
          <div>Viewed movies</div>
          {views.map((el) => (
            <div key={el.cover_url}>
              <img
                alt={el.cover_url}
                className={classes.userImage}
                src={el.cover_url}
              ></img>
              <div>
                {el.production_year} {el.title} - {el.rating}
              </div>
            </div>
          ))}
        </div>
      ) : undefined}
      {likes && likes.length ? (
        <div>
          <div>Liked movies</div>
          {likes.map((el) => (
            <div key={el.cover_url}>
              <img
                alt={el.cover_url}
                className={classes.userImage}
                src={el.cover_url}
              ></img>
              <div>
                {el.production_year} {el.title} - {el.rating}
              </div>
            </div>
          ))}
        </div>
      ) : undefined}
    </div>
  );
};

export default withStyles(UserStyles)(User);
