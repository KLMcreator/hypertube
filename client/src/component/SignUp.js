// react
import React, { useState, useEffect } from "react";
// framework
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/core/styles/withStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
// icons
import VpnKey from "@material-ui/icons/VpnKey";
import ErrorIcon from "@material-ui/icons/Error";
import AccountCircle from "@material-ui/icons/AccountCircle";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import AlternateEmailIcon from "@material-ui/icons/AlternateEmail";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";

const SignUpStyles = (theme) => ({
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
    [theme.breakpoints.down("sm")]: {
      display: "block",
      padding: "20px 0px 20px 0px",
      textAlign: "-webkit-center",
    },
  },
  cardSection: {
    backgroundColor: "#1A1A1A",
    border: "0.5px solid rgba(41, 41, 41, 1)",
    borderRadius: "4px",
    borderStyle: "solid",
    borderWidth: 1,
    width: "60%",
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
  },
  inputColor: {
    backgroundColor: "#373737",
    color: "#fff",
  },
  submitButton: {
    width: "100%",
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
});

const SignUp = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [lastname, setLastname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pwdRegLet, setPwdRegLet] = useState(false);
  const [pwdRegCap, setPwdRegCap] = useState(false);
  const [pwdRegDig, setPwdRegDig] = useState(false);
  const [pwdRegLen, setPwdRegLen] = useState(false);
  const [pwdMatches, setPwdMatches] = useState(true);
  const [queryLoading, setQueryLoading] = useState(false);
  const [usernameRegex, setUsernameRegex] = useState(true);
  const [lastNameRegExp, setLastnameRegExp] = useState(true);
  const [newFilePicture, setNewFilePicture] = useState(null);
  const [pwdWhiteSpaces, setPwdWhiteSpaces] = useState(true);
  const [firstNameRegExp, setFirstnameRegExp] = useState(true);
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [emailWhiteSpaces, setEmailWhiteSpaces] = useState(true);
  const [usernameWhiteSpaces, setUsernameWhiteSpaces] = useState(true);
  const [lastNameWhiteSpaces, setLastNameWhiteSpaces] = useState(true);
  const [firstNameWhiteSpaces, setFirstNameWhiteSpaces] = useState(true);
  const inputSelectedStyles = {
    WebkitBoxShadow: "0 0 0 1000px #1A1A1A inset",
    WebkitTextFillColor: "#EFF1F3",
    padding: 10,
  };
  const inputPropsFileStyles = {
    WebkitBoxShadow: "0 0 0 1000px #1A1A1A inset",
    WebkitTextFillColor: "#1A1A1A",
    padding: 10,
    width: "100%",
  };

  const { classes } = props;

  const checkRegexUsername = (str) => {
    var accentedCharacters =
      "àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ";
    const checkSpecChar = new RegExp(
      "^[-'A-Z" + accentedCharacters + "a-z0-9 ]+$"
    );
    if (checkSpecChar.test(str) === true) {
      setUsernameRegex(true);
    } else {
      setUsernameRegex(false);
    }
  };

  const checkRegexLastname = (str) => {
    var accentedCharacters =
      "àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ";
    const checkSpecChar = new RegExp(
      "^[-'A-Z" + accentedCharacters + "a-z0-9 ]+$"
    );
    if (checkSpecChar.test(str) === true) {
      setLastnameRegExp(true);
    } else {
      setLastnameRegExp(false);
    }
  };

  const checkRegexFirstname = (str) => {
    var accentedCharacters =
      "àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ";
    const checkSpecChar = new RegExp(
      "^[-'A-Z" + accentedCharacters + "a-z0-9 ]+$"
    );
    if (checkSpecChar.test(str) === true) {
      setFirstnameRegExp(true);
    } else {
      setFirstnameRegExp(false);
    }
  };

  const checkPasswordMatch = (str1, str2) => {
    if (str1 !== str2) {
      setPwdMatches(false);
      return false;
    } else {
      setPwdMatches(true);
      return true;
    }
  };

  const checkEmailLength = (str) => {
    if (str.length === str.replace(/\s/g, "").length) {
      setEmailWhiteSpaces(true);
    } else {
      setEmailWhiteSpaces(false);
    }
  };

  const checkUsernameLength = (str) => {
    if (str.length === str.replace(/\s/g, "").length && str.length > 2) {
      setUsernameWhiteSpaces(true);
    } else {
      setUsernameWhiteSpaces(false);
    }
  };

  const checkFirstnameLength = (str) => {
    if (str.length === str.replace(/\s/g, "").length) {
      setFirstNameWhiteSpaces(true);
    } else {
      setFirstNameWhiteSpaces(false);
    }
  };

  const checkLastnameLength = (str) => {
    if (str.length === str.replace(/\s/g, "").length) {
      setLastNameWhiteSpaces(true);
    } else {
      setLastNameWhiteSpaces(false);
    }
  };

  const checkPasswordLength = (str) => {
    if (str.length === str.replace(/\s/g, "").length) {
      setPwdWhiteSpaces(true);
    } else {
      setPwdWhiteSpaces(false);
    }
  };

  const createUser = (e) => {
    e.preventDefault();
    setQueryLoading(true);
    let formData = new FormData();
    formData.append("file", newFilePicture);
    formData.append("username", username);
    formData.append("firstName", firstname);
    formData.append("lastName", lastname);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirmedPassword", confirmedPassword);
    fetch("/api/signUp", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.signup.signup) {
          props.auth.successMessage("Account created! Check your mails.");
          props.props.history.push("/SignIn");
        } else {
          props.auth.errorMessage(res.signup.msg);
          setQueryLoading(false);
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  const handleChangeUsername = (e) => {
    setUsername(e.target.value);
    checkUsernameLength(e.target.value);
    checkRegexUsername(e.target.value);
  };

  const handleChangeLastname = (e) => {
    setLastname(e.target.value);
    checkLastnameLength(e.target.value);
    checkRegexLastname(e.target.value);
  };

  const handleChangeFirstname = (e) => {
    setFirstname(e.target.value);
    checkRegexFirstname(e.target.value);
    checkFirstnameLength(e.target.value);
  };

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
    checkEmailLength(e.target.value);
  };

  const handleChangePassword = (e) => {
    const letters = new RegExp("^(?=.*[a-z])");
    const capitals = new RegExp("^(?=.*[A-Z])");
    const digit = new RegExp("^(?=.*[0-9])");
    const length = new RegExp("^(?=.{8,})");
    setPwdRegCap(capitals.test(e.target.value));
    setPwdRegLet(letters.test(e.target.value));
    setPwdRegDig(digit.test(e.target.value));
    setPwdRegLen(length.test(e.target.value));
    setPassword(e.target.value);
    checkPasswordMatch(e.target.value, confirmedPassword);
    checkPasswordLength(e.target.value);
  };

  const handleChangeConfirmedPassword = (e) => {
    setConfirmedPassword(e.target.value);
    checkPasswordMatch(password, e.target.value);
  };

  const handleUploadPic = (e) => {
    if (e.target.files) {
      setNewFilePicture(e.target.files[0]);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "auto";
    setIsLoading(false);
    return () => {
      setIsLoading(true);
    };
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
        <form encType="multipart/form-data" onSubmit={createUser}>
          <Grid container spacing={1} className={classes.mainGrid}>
            <Grid item xs={12} sm={6} className={classes.elGrid}>
              <Input
                classes={{
                  root: classes.rootSend,
                  input: classes.inputColor,
                  underline: classes.borderBottom,
                }}
                inputProps={{
                  style: inputPropsFileStyles,
                }}
                style={{
                  width: "100%",
                }}
                id="file"
                type="file"
                placeholder="Username"
                accept="image/png, image/jpeg"
                required
                onChange={handleUploadPic}
                startAdornment={
                  <PhotoCameraIcon
                    className={classes.sendIcon}
                  ></PhotoCameraIcon>
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.elGrid}>
              <Input
                classes={{
                  root: classes.rootSend,
                  input: classes.inputColor,
                  underline: classes.borderBottom,
                }}
                inputProps={{
                  style: inputSelectedStyles,
                }}
                id="usernameTextfield"
                type="text"
                placeholder="Username"
                value={username}
                required
                onChange={handleChangeUsername}
                startAdornment={
                  <AccountCircle className={classes.sendIcon}></AccountCircle>
                }
              />
              {!usernameWhiteSpaces ? (
                <p className={classes.errorCheck}>
                  <ErrorIcon className={classes.iconsMessage} />
                  Username must not contain white space and be at least 3 char
                  long.
                </p>
              ) : undefined}
              {!usernameRegex ? (
                <p className={classes.errorCheck}>
                  <ErrorIcon className={classes.iconsMessage} />
                  Username must only contain letters.
                </p>
              ) : undefined}
            </Grid>
            <Grid item xs={12} sm={4} className={classes.elGrid}>
              <Input
                classes={{
                  root: classes.rootSend,
                  input: classes.inputColor,
                  underline: classes.borderBottom,
                }}
                inputProps={{
                  style: inputSelectedStyles,
                }}
                id="lastnameTextfield"
                type="text"
                placeholder="Last Name"
                value={lastname}
                required
                onChange={handleChangeLastname}
                startAdornment={
                  <AccountCircle className={classes.sendIcon}></AccountCircle>
                }
              />
              {lastNameWhiteSpaces === false ? (
                <p className={classes.errorCheck}>
                  <ErrorIcon className={classes.iconsMessage} />
                  Last name must not contain white space.
                </p>
              ) : undefined}
              {lastNameRegExp === false ? (
                <p className={classes.errorCheck}>
                  <ErrorIcon className={classes.iconsMessage} />
                  Only letters are allowed for last name.
                </p>
              ) : undefined}
            </Grid>
            <Grid item xs={12} sm={4} className={classes.elGrid}>
              <Input
                classes={{
                  root: classes.rootSend,
                  input: classes.inputColor,
                  underline: classes.borderBottom,
                }}
                inputProps={{
                  style: inputSelectedStyles,
                }}
                id="firstnameTextfield"
                type="text"
                placeholder="First Name"
                value={firstname}
                required
                onChange={handleChangeFirstname}
                startAdornment={
                  <AccountCircle className={classes.sendIcon}></AccountCircle>
                }
              />
              {firstNameWhiteSpaces === false ? (
                <p className={classes.errorCheck}>
                  <ErrorIcon className={classes.iconsMessage} />
                  First name must not contain white space.
                </p>
              ) : undefined}
              {firstNameRegExp === false ? (
                <p className={classes.errorCheck}>
                  <ErrorIcon className={classes.iconsMessage} />
                  Only letters are allowed for first name.
                </p>
              ) : undefined}
            </Grid>

            <Grid item xs={12} sm={4} className={classes.elGrid}>
              <Input
                classes={{
                  root: classes.rootSend,
                  input: classes.inputColor,
                  underline: classes.borderBottom,
                }}
                inputProps={{
                  style: inputSelectedStyles,
                }}
                id="emailTextfield"
                type="email"
                placeholder="Email"
                value={email}
                required
                onChange={handleChangeEmail}
                startAdornment={
                  <AlternateEmailIcon
                    className={classes.sendIcon}
                  ></AlternateEmailIcon>
                }
              />
              {emailWhiteSpaces === false ? (
                <p className={classes.errorCheck}>
                  <ErrorIcon className={classes.iconsMessage} />
                  Email must not contain white space
                </p>
              ) : undefined}
            </Grid>
            <Grid item xs={12} sm={6} className={classes.elGrid}>
              <Input
                classes={{
                  root: classes.rootSend,
                  input: classes.inputColor,
                  underline: classes.borderBottom,
                }}
                inputProps={{
                  style: inputSelectedStyles,
                }}
                id="passwordTextfield"
                type="password"
                placeholder="Password"
                value={password}
                required
                onChange={handleChangePassword}
                startAdornment={<VpnKey className={classes.sendIcon}></VpnKey>}
              />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.elGrid}>
              <Input
                classes={{
                  root: classes.rootSend,
                  input: classes.inputColor,
                  underline: classes.borderBottom,
                }}
                inputProps={{
                  style: inputSelectedStyles,
                }}
                id="confirmedPasswordTextfield"
                type="password"
                placeholder="Confirmed Password"
                value={confirmedPassword}
                required
                onChange={handleChangeConfirmedPassword}
                startAdornment={<VpnKey className={classes.sendIcon}></VpnKey>}
              />
            </Grid>
            <Grid item xs={12} className={classes.elGrid}>
              {pwdMatches === false ? (
                <p className={classes.errorCheck}>
                  <ErrorIcon className={classes.iconsMessage} />
                  Passwords don't match
                </p>
              ) : undefined}
              {pwdWhiteSpaces === false ? (
                <p className={classes.errorCheck}>
                  <ErrorIcon className={classes.iconsMessage} />
                  Password must not contain white space
                </p>
              ) : undefined}
              {pwdRegLet === false ? (
                <p className={classes.errorCheck}>
                  <RadioButtonUncheckedIcon className={classes.iconsMessage} />
                  Password must contain at least one letter
                </p>
              ) : undefined}
              {pwdRegCap === false ? (
                <p className={classes.errorCheck}>
                  <RadioButtonUncheckedIcon className={classes.iconsMessage} />
                  Password must contain at least one Capital Letter
                </p>
              ) : undefined}{" "}
              {pwdRegLen === false ? (
                <p className={classes.errorCheck}>
                  <RadioButtonUncheckedIcon className={classes.iconsMessage} />
                  Password must contain at least 8 characters
                </p>
              ) : undefined}{" "}
              {pwdRegDig === false ? (
                <p className={classes.errorCheck}>
                  <RadioButtonUncheckedIcon className={classes.iconsMessage} />
                  Password must contain at least one digit
                </p>
              ) : undefined}
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                disabled={queryLoading}
                style={{
                  color: "#FBBA72",
                  border: "1px solid #FBBA72",
                }}
                type="submit"
                className={classes.submitButton}
              >
                {queryLoading ? (
                  <CircularProgress className={classes.loadingLogo} />
                ) : (
                  "Register"
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <div style={{ textAlign: "center", padding: 30 }}>
        Hypertube made by cvannica, eozimek and mmany.
      </div>
    </div>
  );
};

export default withStyles(SignUpStyles)(SignUp);
