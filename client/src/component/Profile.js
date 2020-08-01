// React
import moment from "moment";
import localization from "moment/locale/fr";
import Select, { createFilter } from "react-select";
import React, { useState, useEffect, useRef } from "react";
// Framework
import Input from "@material-ui/core/Input";
import withStyles from "@material-ui/core/styles/withStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
// Icons
import Button from "@material-ui/core/Button";
import VpnKey from "@material-ui/icons/VpnKey";
import StarIcon from "@material-ui/icons/Star";
import ErrorIcon from "@material-ui/icons/Error";
import IconButton from "@material-ui/core/IconButton";
import ThumbUpAltIcon from "@material-ui/icons/ThumbUpAlt";
import AccountCircle from "@material-ui/icons/AccountCircle";
import EditRoundedIcon from "@material-ui/icons/EditRounded";
import ThumbDownAltIcon from "@material-ui/icons/ThumbDownAlt";
import AlternateEmailIcon from "@material-ui/icons/AlternateEmail";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";

const profileStyles = (theme) => ({
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
  userDetailsSelect: {
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
});

const Profile = (props) => {
  const ref = useRef(false);
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [torrents, setTorrents] = useState([]);
  const [username, setUsername] = useState("");
  const [lastname, setLastname] = useState("");
  const [language, setLanguage] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pwdRegLet, setPwdRegLet] = useState(false);
  const [pwdRegCap, setPwdRegCap] = useState(false);
  const [pwdRegDig, setPwdRegDig] = useState(false);
  const [pwdRegLen, setPwdRegLen] = useState(false);
  const [pwdMatches, setPwdMatches] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newLastname, setNewLastname] = useState("");
  const [newFirstname, setNewFirstname] = useState("");
  const [emailMatches, setEmailMatches] = useState(true);
  const [newFilePhoto, setNewFilePhoto] = useState(null);
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [usernameRegExp, setUsernameRegExp] = useState(true);
  const [pwdWhiteSpaces, setPwdWhiteSpaces] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [lastNameRegExp, setLastnameRegExp] = useState(true);
  const [firstNameRegExp, setFirstnameRegExp] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState({});
  const [emailWhiteSpaces, setEmailWhiteSpaces] = useState(true);
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [usernameWhiteSpaces, setUsernameWhiteSpaces] = useState(true);
  const [lastNameWhiteSpaces, setLastNameWhiteSpaces] = useState(true);
  const [firstNameWhiteSpaces, setFirstNameWhiteSpaces] = useState(true);

  const { classes, auth } = props;
  const inputSelectedStyles = {
    WebkitBoxShadow: "0 0 0 1000px #1A1A1A inset",
    WebkitTextFillColor: "#EFF1F3",
    padding: 10,
  };

  const languagesOption = [
    {
      label: auth.language === "English" ? "English" : "Anglais",
      value: "English",
    },
    {
      label: auth.language === "English" ? "French" : "Français",
      value: "French",
    },
  ];

  // Render of torrents viewed / liked
  const getTorrentsUser = () => {
    fetch("/api/users/get/torrents", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((res) => {
        if (ref.current) {
          if (res.torrents) {
            setTorrents(res.torrents);
            setIsLoading(false);
          } else if (res.torrents.msg) {
            props.auth.errorMessage(res.torrents.msg);
          } else {
            props.auth.errorMessage("Error while fetching database.");
          }
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  const getLoggedUser = async () => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((res) => {
        if (ref.current) {
          setFirstname(res.user[0].firstname);
          setLastname(res.user[0].lastname);
          setEmail(res.user[0].email);
          setLanguage(res.user[0].language);
          setPhoto(res.user[0].photos);
          setUsername(res.user[0].username);
          auth.language === "English"
            ? setSelectedLanguage({
                label: res.user[0].language,
                value: res.user[0].language,
              })
            : setSelectedLanguage({
                label:
                  res.user[0].language === "English" ? "Anglais" : "Français",
                value: res.user[0].language,
              });
          getTorrentsUser();
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  // Username edit functions
  const editUsername = (e) => {
    e.preventDefault();
    fetch("/api/settings/username", {
      method: "POST",
      body: JSON.stringify({
        username: newUsername,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.edit.edit === true) {
          props.auth.successMessage("Username updated.");
        } else {
          props.auth.errorMessage(res.edit.msg);
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  const handleChangeUsername = (e) => {
    setNewUsername(e.target.value);
    checkUsernameLength(e.target.value);
    checkRegexUsername(e.target.value);
  };

  const checkUsernameLength = (str) => {
    if (str.length === str.replace(/\s/g, "").length) {
      setUsernameWhiteSpaces(true);
    } else {
      setUsernameWhiteSpaces(false);
    }
  };

  const checkRegexUsername = (str) => {
    var accentedCharacters =
      "àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ";
    const checkSpecChar = new RegExp(
      "^[-'A-Z" + accentedCharacters + "a-z0-9 ]+$"
    );
    if (checkSpecChar.test(str) === true) {
      setUsernameRegExp(true);
    } else {
      setUsernameRegExp(false);
    }
  };

  const RenderUsernameRegex = () => {
    return (
      <div>
        {usernameWhiteSpaces === false ? (
          <p className={classes.errorCheck}>
            <ErrorIcon className={classes.iconsMessage} />
            {auth.language === "English"
              ? "Username must not contain white space."
              : "Le nom d'utilisateur ne doit pas contenir d'espace(s)."}
          </p>
        ) : undefined}
        {usernameRegExp === false ? (
          <p className={classes.errorCheck}>
            <ErrorIcon className={classes.iconsMessage} />
            {auth.language === "English"
              ? "Only letters are allowed for username."
              : "Seules les lettres sont autorisées."}
          </p>
        ) : undefined}
      </div>
    );
  };

  // Photo edit function
  const handleUploadPic = (e) => {
    if (e.target.files) {
      setNewFilePhoto(e.target.files[0]);
    }
  };

  const addNewProfilePicture = (e) => {
    e.preventDefault();
    let formData = new FormData();
    formData.append("file", newFilePhoto);
    formData.append("oldFile", photo);
    fetch("/api/settings/edit/photo", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.edit.edit) {
          setPhoto(res.edit.photo);
          props.auth.successMessage("Profile picture updated.");
        } else {
          props.auth.errorMessage(res.edit.msg);
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  // Language edit function
  const handleChangeLanguage = (e) => {
    if (language !== e.label) {
      setSelectedLanguage(e);
      setLanguage({ label: e.label, value: e.value });
    }
  };

  const addNewLanguage = (e) => {
    e.preventDefault();
    fetch("/api/settings/edit/language", {
      method: "POST",
      body: JSON.stringify({
        language: language.value,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.edit.edit) {
          props.auth.successMessage("Prefered language updated.");
          window.location.reload();
        } else {
          props.auth.errorMessage(res.edit.msg);
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  // Email edit functions
  const handleChangeEmail = (e) => {
    setNewEmail(e.target.value);
    checkEmailLength(e.target.value);
  };

  const checkEmailLength = (str) => {
    if (str.length === str.replace(/\s/g, "").length) {
      setEmailWhiteSpaces(true);
    } else {
      setEmailWhiteSpaces(false);
    }
  };

  const checkEmailMatches = (str1, str2) => {
    if (str1 !== str2) {
      setEmailMatches(false);
      return false;
    } else {
      setEmailMatches(true);
      return true;
    }
  };

  const handleChangeConfirmedEmail = (e) => {
    setConfirmedEmail(e.target.value);
    checkEmailMatches(newEmail, e.target.value);
  };

  const editNewMail = (e) => {
    e.preventDefault();
    fetch("/api/settings/edit/mail", {
      method: "POST",
      body: JSON.stringify({
        username: username,
        currentMail: email,
        newMail: newEmail,
        confirmedMail: confirmedEmail,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.edit.edit) {
          props.auth.setLoggedOut(() => props.props.history.push("/"));
          props.props.history.push("/");
        } else {
          props.auth.errorMessage(res.edit.msg);
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  // Lastname edit functions
  const editLastname = (e) => {
    e.preventDefault();
    fetch("/api/settings/lastname", {
      method: "POST",
      body: JSON.stringify({
        lastname: newLastname,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.edit.edit === true) {
          props.auth.successMessage("Last name updated.");
        } else {
          props.auth.errorMessage(res.edit.msg);
        }
      })
      .catch((err) => props.auth.errorMessage(err));
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

  const checkLastnameLength = (str) => {
    if (str.length === str.replace(/\s/g, "").length) {
      setLastNameWhiteSpaces(true);
    } else {
      setLastNameWhiteSpaces(false);
    }
  };

  const handleChangeLastname = (e) => {
    setNewLastname(e.target.value);
    checkLastnameLength(e.target.value);
    checkRegexLastname(e.target.value);
  };

  const RenderLastnameRegex = () => {
    return (
      <div>
        {lastNameWhiteSpaces === false ? (
          <p className={classes.errorCheck}>
            <ErrorIcon className={classes.iconsMessage} />
            {auth.language === "English"
              ? "Last name must not contain white space."
              : "Le nom ne doit pas contenir d'espace(s)."}
          </p>
        ) : undefined}
        {lastNameRegExp === false ? (
          <p className={classes.errorCheck}>
            <ErrorIcon className={classes.iconsMessage} />
            {auth.language === "English"
              ? "Only letters are allowed for last name."
              : "Seules les lettres sont autorisées."}
          </p>
        ) : undefined}
      </div>
    );
  };

  // Firstname edit functions
  const editFirstname = (e) => {
    e.preventDefault();
    fetch("/api/settings/firstname", {
      method: "POST",
      body: JSON.stringify({
        firstname: newFirstname,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.edit.edit === true) {
          props.auth.successMessage("First name updated.");
        } else {
          props.auth.errorMessage(res.edit.msg);
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  const handleChangeFirstname = (e) => {
    setNewFirstname(e.target.value);
    checkRegexFirstname(e.target.value);
    checkFirstnameLength(e.target.value);
  };

  const checkFirstnameLength = (str) => {
    if (str.length === str.replace(/\s/g, "").length) {
      setFirstNameWhiteSpaces(true);
    } else {
      setFirstNameWhiteSpaces(false);
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

  const RenderFirstnameRegex = () => {
    return (
      <div>
        {firstNameWhiteSpaces === false ? (
          <p className={classes.errorCheck}>
            <ErrorIcon className={classes.iconsMessage} />
            {auth.language === "English"
              ? "First name must not contain white space."
              : "Le prénom ne doit pas contenir d'espace(s)."}
          </p>
        ) : undefined}
        {firstNameRegExp === false ? (
          <p className={classes.errorCheck}>
            <ErrorIcon className={classes.iconsMessage} />
            {auth.language === "English"
              ? "Only letters are allowed for first name."
              : "Seules les lettres sont autorisées."}
          </p>
        ) : undefined}
      </div>
    );
  };
  // Password edit functions

  const editPassword = (e) => {
    e.preventDefault();
    fetch("/api/settings/password", {
      method: "POST",
      body: JSON.stringify({
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmedPassword: confirmedPassword,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.edit.edit === true) {
          props.auth.setLoggedOut(() => props.props.history.push("/"));
          props.props.history.push("/");
        } else {
          props.auth.errorMessage(res.edit.msg);
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  const handleCurrentPassword = (e) => {
    setCurrentPassword(e.target.value);
  };

  const handleChangeConfirmedPassword = (e) => {
    setConfirmedPassword(e.target.value);
    checkPasswordMatch(newPassword, e.target.value);
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

  const checkPasswordLength = (str) => {
    if (str.length === str.replace(/\s/g, "").length) {
      setPwdWhiteSpaces(true);
    } else {
      setPwdWhiteSpaces(false);
    }
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
    setNewPassword(e.target.value);
    checkPasswordMatch(e.target.value, confirmedPassword);
    checkPasswordLength(e.target.value);
  };

  const RenderPasswordRegex = () => {
    return (
      <div>
        {pwdWhiteSpaces === false ? (
          <p className={classes.errorCheck}>
            <ErrorIcon className={classes.iconsMessage} />
            {auth.language === "English"
              ? "Password must not contain white space"
              : "Le mot de passe ne doit pas contenir d'espace"}
          </p>
        ) : undefined}
        {pwdRegLet === false ? (
          <p className={classes.errorCheck}>
            <RadioButtonUncheckedIcon className={classes.iconsMessage} />
            {auth.language === "English"
              ? "Password must contain at least one letter"
              : "Le mot de passe doit contenir au moins une lettre"}
          </p>
        ) : undefined}
        {pwdRegCap === false ? (
          <p className={classes.errorCheck}>
            <RadioButtonUncheckedIcon className={classes.iconsMessage} />
            {auth.language === "English"
              ? "Password must contain at least one Capital Letter"
              : "Le mot de passe doit contenir au moins une majuscule"}
          </p>
        ) : undefined}{" "}
        {pwdRegLen === false ? (
          <p className={classes.errorCheck}>
            <RadioButtonUncheckedIcon className={classes.iconsMessage} />
            {auth.language === "English"
              ? "Password must contain at least 8 characters"
              : "Le mot de passe doit contenir au moins 8 caractères"}
          </p>
        ) : undefined}{" "}
        {pwdRegDig === false ? (
          <p className={classes.errorCheck}>
            <RadioButtonUncheckedIcon className={classes.iconsMessage} />
            {auth.language === "English"
              ? "Password must contain at least one digit"
              : "Le mot de passe doit contenir au moins un chiffre"}
          </p>
        ) : undefined}
      </div>
    );
  };

  useEffect(() => {
    ref.current = true;
    document.body.style.overflow = "auto";
    getLoggedUser();
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
        <div className={classes.userPhoto} style={{ height: "260px" }}>
          <form
            encType="multipart/form-data"
            className={classes.containerImg}
            onSubmit={addNewProfilePicture}
          >
            <img
              alt={photo}
              className={classes.userImage}
              src={
                photo === "./src/assets/img/nophotos.png" ||
                photo.startsWith("https://")
                  ? photo
                  : "./src/assets/photos/" + photo
              }
            ></img>
            <div className={classes.positioner}>
              <label htmlFor="file">
                <EditRoundedIcon
                  className={classes.changeImgIcon}
                  src="https://icon-library.net/images/upload-photo-icon/upload-photo-icon-21.jpg"
                />
              </label>
              <Input
                style={{
                  display: "none",
                }}
                id="file"
                type="file"
                placeholder="Username"
                accept="image/png, image/jpeg"
                required
                onChange={handleUploadPic}
              />
            </div>
            {newFilePhoto ? (
              <Button
                className={classes.submitSpecialFormBtn}
                name="submitBtnPhoto"
                type="submit"
              >
                {auth.language === "English"
                  ? "Confirm new picture"
                  : "Modifier la photo"}
              </Button>
            ) : undefined}
          </form>
        </div>
        <div className={classes.userDetails}>
          <div className={classes.userDetailsContainer}>
            {!auth.isoauth ? (
              <div
                style={{ alignSelf: "center" }}
                className={classes.userDetailsChild}
              >
                <form encType="multipart/form-data" onSubmit={editUsername}>
                  <Input
                    classes={{
                      root: classes.rootSend,
                      input: classes.inputColor,
                      underline: classes.borderBottom,
                    }}
                    inputProps={{
                      style: inputSelectedStyles,
                    }}
                    id="newUsername"
                    type="text"
                    placeholder={
                      auth.language === "English"
                        ? "Actual username: " + username
                        : "Nom d'utilisateur actuel: " + username
                    }
                    value={newUsername}
                    required
                    onChange={handleChangeUsername}
                    startAdornment={
                      <AlternateEmailIcon
                        className={classes.sendIcon}
                      ></AlternateEmailIcon>
                    }
                    endAdornment={
                      <IconButton
                        type="submit"
                        aria-label="send"
                        className={classes.submitBtn}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    }
                  />
                  {newUsername.length ? (
                    <RenderUsernameRegex></RenderUsernameRegex>
                  ) : undefined}
                </form>
              </div>
            ) : undefined}
            <div className={classes.userDetailsChild}>
              <div
                className={classes.userDetailsSelect}
                style={{ textAlign: "right" }}
              >
                <form encType="multipart/form-data" onSubmit={addNewLanguage}>
                  <Select
                    value={selectedLanguage}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary: "#373737",
                        primary75: "red",
                        primary50: "#FBBA72",
                        primary25: "#9A1300",
                        danger: "yellow",
                        dangerLight: "#FBBA72",
                        neutral0: "#1A1A1A",
                        neutral5: "pink",
                        neutral10: "#9A1300",
                        neutral20: "#373737",
                        neutral30: "#9A1300",
                        neutral40: "#FBBA72",
                        neutral50: "#EFF1F3",
                        neutral60: "#FBBA72",
                        neutral70: "yellow",
                        neutral80: "#EFF1F3",
                        neutral90: "#EFF1F3",
                      },
                    })}
                    filterOption={createFilter({
                      ignoreAccents: false,
                    })}
                    options={languagesOption}
                    key={"changeLanguage"}
                    onChange={handleChangeLanguage}
                    placeholder={`LANGUAGE: ${language}`}
                  />
                  <Button
                    className={classes.submitSpecialFormBtn}
                    name="submitBtnLanguage"
                    type="submit"
                  >
                    {auth.language === "English"
                      ? "Confirm new language"
                      : "Modifier la langue préférée"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
          {!auth.isoauth ? (
            <div className={classes.userDetailsContainer}>
              <div className={classes.userDetailsChild}>
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
                  placeholder={
                    auth.language === "English"
                      ? "Current mail: " + email
                      : "Email actuel: " + email
                  }
                  value={newEmail}
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
                    {auth.language === "English"
                      ? "Email must not contain white space"
                      : "L'adresse mail ne doit pas contenir d'espace"}
                  </p>
                ) : undefined}
              </div>
              <div className={classes.userDetailsChild}>
                <form encType="multipart/form-data" onSubmit={editNewMail}>
                  <Input
                    classes={{
                      root: classes.rootSend,
                      input: classes.inputColor,
                      underline: classes.borderBottom,
                    }}
                    inputProps={{
                      style: inputSelectedStyles,
                    }}
                    id="confirmedMail"
                    type="email"
                    placeholder={
                      auth.language === "English"
                        ? "Confirmed new mail"
                        : "Confirmation de mail"
                    }
                    value={confirmedEmail}
                    required
                    onChange={handleChangeConfirmedEmail}
                    startAdornment={
                      <AlternateEmailIcon
                        className={classes.sendIcon}
                      ></AlternateEmailIcon>
                    }
                    endAdornment={
                      <IconButton
                        type="submit"
                        aria-label="send"
                        className={classes.submitBtn}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    }
                  />
                  {emailMatches === false ? (
                    <p className={classes.errorCheck}>
                      <ErrorIcon className={classes.iconsMessage} />
                      {auth.language === "English"
                        ? "Emails don't match"
                        : "Les adresses mails ne sont pas identiques"}
                    </p>
                  ) : undefined}
                </form>
              </div>
            </div>
          ) : undefined}
          <div className={classes.userDetailsContainer}>
            <div className={classes.userDetailsChild}>
              <form encType="multipart/form-data" onSubmit={editLastname}>
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
                  placeholder={
                    auth.language === "English"
                      ? "Actual Last name: " + lastname
                      : "Nom actuel: " + lastname
                  }
                  value={newLastname}
                  required
                  onChange={handleChangeLastname}
                  startAdornment={
                    <AccountCircle className={classes.sendIcon}></AccountCircle>
                  }
                  endAdornment={
                    <IconButton
                      type="submit"
                      aria-label="send"
                      className={classes.submitBtn}
                    >
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  }
                />
                {lastname.length ? (
                  <RenderLastnameRegex></RenderLastnameRegex>
                ) : undefined}
              </form>
            </div>
            <div className={classes.userDetailsChild}>
              <form encType="multipart/form-data" onSubmit={editFirstname}>
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
                  value={newFirstname}
                  required
                  placeholder={
                    auth.language === "English"
                      ? "Actual First name: " + firstname
                      : "Prénom actuel: " + firstname
                  }
                  onChange={handleChangeFirstname}
                  startAdornment={
                    <AccountCircle className={classes.sendIcon}></AccountCircle>
                  }
                  endAdornment={
                    <IconButton
                      type="submit"
                      aria-label="send"
                      className={classes.submitBtn}
                    >
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  }
                />
                {firstname.length ? (
                  <RenderFirstnameRegex></RenderFirstnameRegex>
                ) : undefined}
              </form>
            </div>
          </div>
          {!auth.isoauth ? (
            <div className={classes.userDetailsContainer}>
              <div className={classes.userDetailsChild}>
                <Input
                  classes={{
                    root: classes.rootSend,
                    input: classes.inputColor,
                    underline: classes.borderBottom,
                  }}
                  inputProps={{
                    style: inputSelectedStyles,
                  }}
                  id="currentPasswordTextfield"
                  type="password"
                  placeholder={
                    auth.language === "English"
                      ? "Current password"
                      : "Mot de passe actuel"
                  }
                  value={currentPassword}
                  required
                  onChange={handleCurrentPassword}
                  startAdornment={
                    <VpnKey className={classes.sendIcon}></VpnKey>
                  }
                />
              </div>
              <div className={classes.userDetailsChild}>
                <Input
                  classes={{
                    root: classes.rootSend,
                    input: classes.inputColor,
                    underline: classes.borderBottom,
                  }}
                  inputProps={{
                    style: inputSelectedStyles,
                  }}
                  id="newPasswordTextfield"
                  type="password"
                  placeholder={
                    auth.language === "English"
                      ? "New password"
                      : "Nouveau mot de passe"
                  }
                  value={newPassword}
                  required
                  onChange={handleChangePassword}
                  startAdornment={
                    <VpnKey className={classes.sendIcon}></VpnKey>
                  }
                />
                {newPassword.length ? (
                  <RenderPasswordRegex></RenderPasswordRegex>
                ) : undefined}
              </div>
              <div className={classes.userDetailsChild}>
                <form encType="multipart/form-data" onSubmit={editPassword}>
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
                    placeholder={
                      auth.language === "English"
                        ? "Confirmed password"
                        : "Confirmation de mot de passe"
                    }
                    value={confirmedPassword}
                    required
                    onChange={handleChangeConfirmedPassword}
                    startAdornment={
                      <VpnKey className={classes.sendIcon}></VpnKey>
                    }
                    endAdornment={
                      <IconButton
                        type="submit"
                        aria-label="send"
                        className={classes.submitBtn}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    }
                  />
                  {pwdMatches === false ? (
                    <p className={classes.errorCheck}>
                      <ErrorIcon className={classes.iconsMessage} />
                      {auth.language === "English"
                        ? "Passwords don't match"
                        : "Les mots de passe ne sont pas identiques"}
                    </p>
                  ) : undefined}
                </form>
              </div>
            </div>
          ) : undefined}
        </div>
      </div>
      <div className={classes.torrentsContainerList}>
        <div className={classes.torrentsCategories}>
          <div className={classes.torrentTitle_cate}>
            {auth.language === "English" ? "Film title" : "Titre du film"}
          </div>
          <div className={classes.torrentDetails_cate}>
            <div className={classes.torrentInfos_cate}>
              {auth.language === "English" ? "Watched at" : "Visionné le"}
            </div>
            <div className={classes.torrentInfos_cate}>
              {auth.language === "English"
                ? "Liked or not liked?"
                : "Apprécié ou non?"}
            </div>
            <div className={classes.torrentInfos_cate}>
              {auth.language === "English" ? "Comment" : "Commentaires"}
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
                    {el.title} - {"(" + el.production_year + ")"} - {el.rating}{" "}
                    <StarIcon className={classes.ratingIcon} />
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
  );
};

export default withStyles(profileStyles)(Profile);
