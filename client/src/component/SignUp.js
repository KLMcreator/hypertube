// react
import React, { useState, useEffect } from "react";

// framework
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
// icons
import ErrorIcon from "@material-ui/icons/Error";
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
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "hsl(0,0%,80%)",
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
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [lastname, setLastname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newFilePicture, setNewFilePicture] = useState(null);
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [pwdMatches, setPwdMatches] = useState(true);
  const [pwdWhiteSpaces, setPwdWhiteSpaces] = useState(true);
  const [lastNameWhiteSpaces, setLastNameWhiteSpaces] = useState(true);
  const [firstNameWhiteSpaces, setFirstNameWhiteSpaces] = useState(true);
  const [emailWhiteSpaces, setEmailWhiteSpaces] = useState(true);
  const [usernameWhiteSpaces, setUsernameWhiteSpaces] = useState(true);
  const [lastNameRegExp, setLastnameRegExp] = useState(true);
  const [firstNameRegExp, setFirstnameRegExp] = useState(true);
  const [usernameRegex, setUsernameRegex] = useState(true);
  const [pwdRegLet, setPwdRegLet] = useState(false);
  const [pwdRegCap, setPwdRegCap] = useState(false);
  const [pwdRegDig, setPwdRegDig] = useState(false);
  const [pwdRegLen, setPwdRegLen] = useState(false);

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
    if (str.length === str.replace(/\s/g, "").length) {
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
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <input
                    className={classes.fullWidth}
                    type="file"
                    id="file"
                    name="file"
                    accept="image/png, image/jpeg"
                    onChange={handleUploadPic}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6} className={classes.elGrid}>
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
                id="usernameTextfield"
                label="Username"
                type="text"
                name="username"
                value={username}
                onChange={handleChangeUsername}
              />
              {!usernameWhiteSpaces ? (
                <p className={classes.errorCheck}>
                  <ErrorIcon className={classes.iconsMessage} />
                  Username must not contain white space.
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
                id="lastnameTextfield"
                label="Last Name"
                type="text"
                name="lastname"
                value={lastname}
                onChange={handleChangeLastname}
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
                id="firstnameTextfield"
                label="First Name"
                type="text"
                name="firstname"
                value={firstname}
                onChange={handleChangeFirstname}
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
                id="emailTextfield"
                label="Email"
                type="email"
                name="email"
                value={email}
                onChange={handleChangeEmail}
              />
              {emailWhiteSpaces === false ? (
                <p className={classes.errorCheck}>
                  <ErrorIcon className={classes.iconsMessage} />
                  Email must not contain white space
                </p>
              ) : undefined}
            </Grid>
            <Grid item xs={12} sm={6} className={classes.elGrid}>
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
                id="passwordTextfield"
                label="Password"
                autoComplete="password"
                type="password"
                name="password"
                value={password}
                onChange={handleChangePassword}
              />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.elGrid}>
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
                id="confirmedPasswordTextfield"
                label="Confirmed password"
                type="password"
                autoComplete="password"
                name="confirmedPassword"
                value={confirmedPassword}
                onChange={handleChangeConfirmedPassword}
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
                color="secondary"
                type="submit"
                className={classes.submitButton}
              >
                Register
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
};

export default withStyles(SignUpStyles)(SignUp);
