// react
import React, { useState, useEffect } from "react";
// framework
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";

const profileStyles = (theme) => ({
  root: { flexGrow: 1 },
  loading: {
    display: "flex",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingLogo: {
    color: "#E63946",
  },
  container: {
    width: "80%",
    height: "80%",
    marginLeft: "auto",
    marginTop: "5%",
  },
  userImage: {
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: " 5px",
    width: "150px",
  },
});

const Profile = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({});
  const { classes } = props;

  const getLoggedUser = async () => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((res) => {
        setUser({
          id: res.user[0].id,
          username: res.user[0].username,
          firstname: res.user[0].firstname,
          lastname: res.user[0].lastname,
          email: res.user[0].email,
          photo: res.user[0].photos,
          language: res.user[0].language,
        });
        setIsLoading(false);
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  useEffect(() => {
    document.body.style.overflow = "auto";
    getLoggedUser();
    return () => {
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
      <Grid container className={classes.container} spacing={3}>
        <Grid item>
          <img
            alt={user.photo}
            className={classes.userImage}
            src={"./src/assets/photos/" + user.photo}
          ></img>
        </Grid>
        <Grid item className={classes.gridImage} xs={12} sm>
          <div> {user.username}</div>
          <div>
            <form></form> {user.language}
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default withStyles(profileStyles)(Profile);
