// react
import React, { useState } from "react";
// framework
import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/core/styles/withStyles";
// icons
import AccountCircle from "@material-ui/icons/AccountCircle";
import AlternateEmailIcon from "@material-ui/icons/AlternateEmail";

const RecoverStyles = (theme) => ({
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
    backgroundColor: "#1A1A1A",
    border: "0.5px solid rgba(41, 41, 41, 1)",
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
  submitButton: {
    width: "100%",
    marginTop: 25,
  },
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
    color: "#9A1300",
    "&:focused": {
      color: "#373737",
    },
  },
  inputColor: {
    backgroundColor: "#373737",
    color: "#fff",
  },
});

const Recover = (props) => {
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const { classes } = props;

  const submitRecover = (e) => {
    e.preventDefault();
    fetch("/api/recover", {
      method: "POST",
      body: JSON.stringify({
        login: login,
        email: email,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.recover.recover) {
          props.props.history.push("/");
          props.auth.successMessage("An email has been sent to this address");
        } else {
          props.auth.errorMessage(res.recover.msg);
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  const inputSelectedStyles = {
    WebkitBoxShadow: "0 0 0 1000px #1A1A1A inset",
    WebkitTextFillColor: "#EFF1F3",
    padding: 10,
  };

  return (
    <div id="unloggedRoot" className={classes.paperContainer}>
      <Paper className={classes.cardSection} elevation={0}>
        <form onSubmit={submitRecover}>
          <Grid container className={classes.mainGrid}>
            <Grid item xs={12} className={classes.elGrid}>
              <Input
                classes={{
                  root: classes.rootSend,
                  input: classes.inputColor,
                  underline: classes.borderBottom,
                }}
                inputProps={{
                  style: inputSelectedStyles,
                }}
                id="login"
                type="text"
                placeholder="Username"
                value={login}
                required
                onChange={(e) => {
                  setLogin(e.target.value);
                }}
                startAdornment={
                  <AccountCircle className={classes.sendIcon}></AccountCircle>
                }
              />
            </Grid>
            <Grid item xs={12} className={classes.elGrid}>
              <Input
                classes={{
                  root: classes.rootSend,
                  input: classes.inputColor,
                  underline: classes.borderBottom,
                }}
                inputProps={{
                  style: inputSelectedStyles,
                }}
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                startAdornment={
                  <AlternateEmailIcon
                    className={classes.sendIcon}
                  ></AlternateEmailIcon>
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                style={{
                  color: "#FBBA72",
                  border: "1px solid #FBBA72",
                }}
                type="submit"
                className={classes.submitButton}
              >
                Recover
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
};

export default withStyles(RecoverStyles)(Recover);
