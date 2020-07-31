// react
import React, { useState, useEffect, useRef } from "react";
// framework
import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/core/styles/withStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
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

const SignIn = (props) => {
  const ref = useRef(false);
  const { classes } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

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
        if (res.login && res.id) {
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

  const handleOauth = (e) => {
    if (e === "42") {
      window.location.href =
        "https://api.intra.42.fr/oauth/authorize?client_id=d62e491a861a0750d008775f37e08a1ed797d2158f32198039914f0dbddb9590&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Foauth%2F42&response_type=code";
    } else if (e === "Github") {
      window.location.href =
        "https://github.com/login/oauth/authorize?client_id=f8244955678d6fde727c&redirect_uri=http://localhost:5000/oauth/github&state=test&scope=user email";
    } else if (e === "Google") {
      window.location.href =
        "https://accounts.google.com/o/oauth2/v2/auth?client_id=1088737867239-ktmhvi9m7p8a54srikk2hl0n0qcn9cdn.apps.googleusercontent.com&response_type=code&redirect_uri=http://localhost:5000/oauth/google&scope=openid%20email%20profile&prompt=consent";
    }
  };

  const inputSelectedStyles = {
    WebkitBoxShadow: "0 0 0 1000px #1A1A1A inset",
    WebkitTextFillColor: "#EFF1F3",
    padding: 10,
  };

  useEffect(() => {
    ref.current = true;
    setIsLoading(false);
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
    <div id="unloggedRoot" className={classes.paperContainer}>
      <Paper className={classes.cardSection} elevation={0}>
        <form onSubmit={submitLogin}>
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
                placeholder="Username or Email"
                value={login}
                required
                onChange={(e) => setLogin(e.target.value)}
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
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                startAdornment={<VpnKey className={classes.sendIcon}></VpnKey>}
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
                Sign in
              </Button>
              <Button
                variant="outlined"
                style={{
                  color: "#D0D0D0",
                  border: "1px solid #D0D0D0",
                }}
                onClick={() => handleOauth("42")}
                className={classes.submitButton}
              >
                Sign in with 42
              </Button>
              <Button
                variant="outlined"
                style={{
                  color: "#474747",
                  border: "1px solid #474747",
                }}
                onClick={() => handleOauth("Github")}
                className={classes.submitButton}
              >
                Sign in with Github
              </Button>
              <Button
                variant="outlined"
                style={{
                  color: "#34A853",
                  border: "1px solid #34A853",
                }}
                onClick={() => handleOauth("Google")}
                className={classes.submitButton}
              >
                Sign in with Google
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
};

export default withStyles(SignInStyles)(SignIn);
