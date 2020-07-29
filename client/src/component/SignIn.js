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

  //   const get42Infos = async (token) => {
  //     console.log(token);
  //     return fetch(`https://api.intra.42.fr/v2/me?access_token=${token}`, {
  //       headers: {
  //         "Content-Type": "application/x-www-form-urlencoded",
  //         "cache-control": "no-cache",
  //       },
  //     })
  //       .then((res) => res.json())
  //       .then((res) => {
  //         console.log("inside res", res);
  //         return res;
  //       })
  //       .catch((err) => props.auth.errorMessage(err));
  //   };

  //   const register42 = (code) => {
  //     fetch("https://api.intra.42.fr/oauth/token", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/x-www-form-urlencoded",
  //         "cache-control": "no-cache",
  //       },
  //       body: new URLSearchParams({
  //         code,
  //         client_id:
  //           "d62e491a861a0750d008775f37e08a1ed797d2158f32198039914f0dbddb9590",
  //         client_secret:
  //           "6139c30558a59688cdd9c816721841625bf3298377dad7383ae5654921fb7874",
  //         grant_type: "authorization_code",
  //         redirect_uri: "http://localhost:3000/SignIn",
  //       }).toString(),
  //     })
  //       .then((res) => res.json())
  //       .then(async (res) => {
  //         console.log(res);
  //         if (res.access_token) {
  //           const user = await get42Infos(res.access_token);
  //           console.log(user);
  //           setIsLoading(false);
  //         } else {
  //           setIsLoading(false);
  //           props.auth.errorMessage(
  //             "Error with your token, it might be revoked. Check your authorization on 42's website."
  //           );
  //         }
  //         //   if (res.login && res.id) {
  //         //     props.auth.setLogged(res);
  //         //     props.props.history.push("/");
  //         //   } else if (res.login === false) {
  //         //     props.auth.errorMessage("Invalid credentials");
  //         //   } else {
  //         //     props.auth.errorMessage(res.login.msg);
  //         //   }
  //       })
  //       .catch((err) => props.auth.errorMessage(err));
  //   };

  //   const registerGithub = (code) => {};
  //   const registerGoogle = (code) => {};
  //   const registerFacebook = (code) => {};

  //   const checkOauthCode = () => {
  //     const site = props.props.location.search
  //       .split("?site=")[1]
  //       .split("&code=")[0];
  //     const code = props.props.location.search.split("&code=")[1];
  //     if (site === "42") {
  //       register42(code);
  //     } else if (site === "Github") {
  //       registerGithub(code);
  //     } else if (site === "Google") {
  //       registerGoogle(code);
  //     } else if (site === "Facebook") {
  //       registerFacebook(code);
  //     }
  //   };

  const handleOauth = (e) => {
    if (e === "42") {
      window.location.href =
        "https://api.intra.42.fr/oauth/authorize?client_id=d62e491a861a0750d008775f37e08a1ed797d2158f32198039914f0dbddb9590&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth%2F42&response_type=code";
    } else if (e === "Github") {
      window.location.href =
        "https://github.com/login/oauth/authorize?client_id=fe47f59188aa4d142c6a&redirect_uri=http://localhost:3000/oauth/callback/github&state=test&scope=user email";
    } else if (e === "Google") {
      window.location.href =
        "https://accounts.google.com/o/oauth2/v2/auth?client_id=742615774585-e4ruhgb9mse90a5cjvc20mgue7pgamsa.apps.googleusercontent.com&response_type=code&redirect_uri=http://127.0.0.1:3000/oauth/callback/google&scope=openid%20email%20profile&prompt=consent";
    } else if (e === "Facebook") {
      window.location.href =
        "https://www.facebook.com/v3.2/dialog/oauth?client_id=776061746097569&redirect_uri=http://localhost:3000/oauth/callback/facebook&scope=email%2Cpublic_profile";
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
              <Button
                variant="outlined"
                style={{
                  color: "#3B5998",
                  border: "1px solid #3B5998",
                }}
                onClick={() => handleOauth("Facebook")}
                className={classes.submitButton}
              >
                Sign in with Facebook
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
};

export default withStyles(SignInStyles)(SignIn);
