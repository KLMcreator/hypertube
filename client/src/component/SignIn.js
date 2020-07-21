// react
import React, { useState } from "react";
// framework
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";
import InputAdornment from "@material-ui/core/InputAdornment";
// icons
import VpnKey from "@material-ui/icons/VpnKey";
import AccountCircle from "@material-ui/icons/AccountCircle";

const SignInStyles = (theme) => ({
  loading: {
    display: "flex",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingLogo: {
    color: "#E63946",
  },
  paperContainer: {
    height: "100%",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  cardSection: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "hsl(0,0%,80%)",
    borderRadius: "4px",
    borderStyle: "solid",
    borderWidth: 1,
    width: "30%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    [theme.breakpoints.down("sm")]: {
      width: "90%",
    },
  },
  mainGrid: {
    padding: 40,
  },
  elGrid: {
    marginBottom: 15,
  },
  rootInputText: {
    fontSize: 13,
  },
  rootInput: {
    width: "100%",
    "& .MuiInput-underline:after": {
      borderBottomColor: "#e63946",
    },
  },
  label: {
    "&$focusedLabel": {
      color: "#e63946",
    },
  },
  focusedLabel: {},
  submitButton: {
    width: "100%",
    marginTop: 25,
  },
});

const SignIn = (props) => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const { classes } = props;

  const submitLogin = (e) => {
    e.preventDefault();
    fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({
        login: login,
        password: password,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.login) {
          props.auth.setLogged(res);
          props.props.history.push("/");
        } else if (res.login === false) {
          props.auth.errorMessage("Invalid credentials");
        } else {
          props.auth.errorMessage(res.login.msg);
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  return (
    <div id="unloggedRoot" className={classes.paperContainer}>
      <Paper className={classes.cardSection} elevation={0}>
        <form onSubmit={submitLogin}>
          <Grid container className={classes.mainGrid}>
            <Grid item xs={12} className={classes.elGrid}>
              <TextField
                classes={{
                  root: classes.rootInput,
                }}
                inputProps={{
                  className: classes.rootInputText,
                }}
                InputLabelProps={{
                  classes: {
                    root: classes.label,
                    focused: classes.focusedLabel,
                  },
                }}
                required
                id="login"
                label="Username or Email"
                value={login}
                onChange={(e) => {
                  setLogin(e.target.value);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} className={classes.elGrid}>
              <TextField
                classes={{
                  root: classes.rootInput,
                }}
                InputLabelProps={{
                  classes: {
                    root: classes.label,
                    focused: classes.focusedLabel,
                  },
                }}
                required
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKey />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="secondary"
                type="submit"
                className={classes.submitButton}
              >
                Sign in
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
};

export default withStyles(SignInStyles)(SignIn);
