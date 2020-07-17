// files
import "react-toastify/dist/ReactToastify.css";
// react
import {
  BrowserRouter,
  Switch,
  Route,
  Link,
  Redirect,
  withRouter,
} from "react-router-dom";
import socketIOClient from "socket.io-client";
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
// framework
import Menu from "@material-ui/core/Menu";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import ListItemIcon from "@material-ui/core/ListItemIcon";
// icons
import HelpIcon from "@material-ui/icons/Help";
import HomeIcon from "@material-ui/icons/Home";
import MoreIcon from "@material-ui/icons/MoreVert";
import PersonIcon from "@material-ui/icons/Person";
import GetAppIcon from "@material-ui/icons/GetApp";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import MovieFilterIcon from "@material-ui/icons/MovieFilter";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
// components
import User from "./component/User";
import Home from "./component/Home";
import SignUp from "./component/SignUp";
import SignIn from "./component/SignIn";
import Watch from "./component/Watch";
import Recover from "./component/Recover";
import Profile from "./component/Profile";
import Confirm from "./component/Confirm";
import FourOFour from "./component/FourOFour";

import Dropdown from "rc-dropdown";
import DropdownMenu, { Item as DropdownMenuItem } from "rc-menu";
import "rc-dropdown/assets/index.css";

const appBarStyles = (theme) => ({
  loadMoreButton: {
    width: "100%",
  },
  grow: {
    flexGrow: 1,
  },
  appbar: {
    backgroundColor: "#1a1a1a",
    boxShadow: "none",
    borderBottom: "0.5px solid rgba(41, 41, 41, .5)",
  },
  title: {
    display: "block",
    padding: 10,
    margin: 5,
    textDecoration: "none",
    fontWeight: 500,
    fontSize: 25,
    color: "#EFF1F3",
    "&:hover": {
      color: "#9A1300",
      transition: "0.2s",
      textDecoration: "underline",
    },
  },
  titleIcon: {
    verticalAlign: "bottom",
    color: "#9A1300",
    fontSize: 25,
  },
  link: {
    padding: 10,
    margin: 5,
    textDecoration: "none",
    fontWeight: 500,
    fontSize: 15,
    color: "#EFF1F3",
    "&:hover": {
      color: "#9A1300",
      transition: "0.2s",
      textDecoration: "underline",
    },
  },
  linkActive: {
    padding: 10,
    margin: 5,
    textDecoration: "none",
    fontWeight: 500,
    fontSize: 15,
    color: "#9A1300",
    "&:hover": {
      color: "#FBBA72",
      transition: "0.2s",
      textDecoration: "underline",
    },
  },
  linkIcon: {
    padding: 8,
    verticalAlign: "middle",
    color: "#EFF1F3",
    fontSize: 25,
    "&:hover": {
      color: "#9A1300",
      transition: "0.2s",
    },
  },
  linkIconActive: {
    padding: 8,
    verticalAlign: "middle",
    color: "#9A1300",
    fontSize: 25,
    "&:hover": {
      color: "#FBBA72",
      transition: "0.2s",
    },
  },
  linkMobile: {
    textDecoration: "none",
    color: "#EFF1F3",
    "&:hover": {
      color: "#9A1300",
      transition: "0.2s",
      textDecoration: "underline",
    },
  },
  linkMobileActive: {
    textDecoration: "none",
    color: "#9A1300",
    "&:hover": {
      color: "#FBBA72",
      transition: "0.2s",
      textDecoration: "underline",
    },
  },
  showMore: {
    color: "#EFF1F3",
    "&:hover": {
      color: "#9A1300",
      transition: "0.2s",
    },
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  popOverRoot: {
    height: "100%",
  },
  popOverPaper: {
    width: 400,
    boxShadow: "none",
    border: "1px solid rgba(41, 41, 41, .2)",
  },
});

const auth = {
  isLogged: false,
  errorMessage(msg) {
    toast.error(msg, {
      position: "bottom-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progressStyle: {
        background: "#3B595D",
      },
    });
  },
  successMessage(msg) {
    toast.success(msg, {
      position: "bottom-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progressStyle: {
        background: "#3B595D",
      },
    });
  },
  setLogged() {
    auth.isLogged = true;
    this.successMessage("You are now logged in!");
  },
  setLoggedOut(cb) {
    auth.isLogged = false;
    this.successMessage("You are now logged out!");
    cb();
  },
};

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      auth.isLogged === true ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: "/SignIn",
            state: { from: props.location },
          }}
        />
      )
    }
  />
);

const PublicRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      auth.isLogged === false ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: "/",
            state: { from: props.location },
          }}
        />
      )
    }
  />
);

const AuthButton = (props) => {
  const [downloads, setDownloads] = useState(0);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const { classes, pathname } = props;

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const checkIfLogged = () => {
    fetch("/api/checkToken")
      .then((resLogged) => resLogged.json())
      .then((resLogged) => {
        auth.isLogged = resLogged.status === false ? false : true;
      });
  };

  const logoutUser = () => {
    fetch("/api/logout")
      .then((res) => res.json())
      .then((res) => {
        if (res.status === true) {
          auth.setLoggedOut(() => props.history.push("/"));
        } else {
          auth.errorMessage(res.msg);
        }
      });
  };

  const RenderMobileMenu = () => {
    return (
      <Menu
        anchorEl={mobileMoreAnchorEl}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        id={"primary-search-account-menu-mobile"}
        keepMounted
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={mobileMoreAnchorEl === null ? false : true}
        onClose={handleMobileMenuClose}
      >
        {auth.isLogged ? (
          <div>
            <MenuItem
              className={
                pathname === "/" ? classes.linkMobileActive : classes.linkMobile
              }
              component={Link}
              onClick={() => {
                checkIfLogged();
                setMobileMoreAnchorEl(null);
              }}
              to="/"
            >
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <Typography variant="inherit">HOME</Typography>
            </MenuItem>
            <MenuItem
              className={
                pathname === "/Profile"
                  ? classes.linkMobileActive
                  : classes.linkMobile
              }
              component={Link}
              onClick={() => {
                checkIfLogged();
                setMobileMoreAnchorEl(null);
              }}
              to="/Profile"
            >
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <Typography variant="inherit">PROFILE</Typography>
            </MenuItem>
            <MenuItem
              className={classes.linkMobile}
              component={Link}
              onClick={() => {
                logoutUser();
                setMobileMoreAnchorEl(null);
              }}
              to="/SignIn"
            >
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <Typography variant="inherit">LOGOUT</Typography>
            </MenuItem>
          </div>
        ) : (
          <div>
            <MenuItem
              className={classes.linkMobile}
              component={Link}
              onClick={() => setMobileMoreAnchorEl(null)}
              to="/SignUp"
            >
              <IconButton>
                <PersonAddIcon />
              </IconButton>
              <Typography variant="inherit">REGISTER</Typography>
            </MenuItem>
            <MenuItem
              className={classes.linkMobile}
              component={Link}
              onClick={() => setMobileMoreAnchorEl(null)}
              to="/SignIn"
            >
              <IconButton>
                <ArrowForwardIosIcon />
              </IconButton>
              <Typography variant="inherit">LOGIN</Typography>
            </MenuItem>
            <MenuItem
              className={classes.linkMobile}
              component={Link}
              onClick={() => setMobileMoreAnchorEl(null)}
              to="/Recover"
            >
              <IconButton>
                <HelpIcon />
              </IconButton>
              <Typography variant="inherit">FORGOT MY PASSWORD</Typography>
            </MenuItem>
          </div>
        )}
      </Menu>
    );
  };

  const DownloadMenu = () => {
    // let menuItems = [];

    if (downloads && downloads.length) {
      // find a cool way to display every running downloads
      for (const [key, value] of Object.entries(downloads)) {
        console.log(key, value);
        // menuItems.push(<DropdownMenuItem disabled>You have no downloads</DropdownMenuItem>);
      }
    }

    return (
      <DropdownMenu onSelect={(e) => console.log(e)}>
        {downloads ? (
          <div>downloads</div>
        ) : (
          <DropdownMenuItem disabled>You have no downloads</DropdownMenuItem>
        )}
      </DropdownMenu>
    );
  };

  const RenderLink = () => {
    return (
      <div className={classes.sectionDesktop}>
        {auth.isLogged ? (
          <div>
            <Link onClick={checkIfLogged} to={"/"}>
              <HomeIcon
                className={
                  pathname === "/" ? classes.linkIconActive : classes.linkIcon
                }
              />
            </Link>
            {auth.isLogged ? (
              <Dropdown
                trigger={["click"]}
                overlay={DownloadMenu}
                animation="slide-up"
                // onVisibleChange={onVisibleChange}
              >
                <IconButton style={{ color: "#fff" }}>
                  <GetAppIcon />
                </IconButton>
              </Dropdown>
            ) : undefined}
            <Link onClick={checkIfLogged} to={"/Profile"}>
              <PersonIcon
                className={
                  pathname === "/Profile"
                    ? classes.linkIconActive
                    : classes.linkIcon
                }
              />
            </Link>
            <Link onClick={logoutUser} to={"/SignIn"}>
              <ExitToAppIcon className={classes.linkIcon} />
            </Link>
          </div>
        ) : (
          <div>
            <Link
              className={
                pathname === "/SignUp" ? classes.linkActive : classes.link
              }
              to={"/SignUp"}
            >
              REGISTER
            </Link>
            <Link
              className={
                pathname === "/SignIn" ? classes.linkActive : classes.link
              }
              to={"/SignIn"}
            >
              LOGIN
            </Link>
            <Link
              className={
                pathname === "/Recover" ? classes.linkActive : classes.link
              }
              to={"/Recover"}
            >
              FORGOT MY PASSWORD
            </Link>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (auth.isLogged) {
      const socket = socketIOClient("http://127.0.0.1:5000");
      socket.on("torrentDownloader", (data) => {
        if (data) {
          console.log(data);
          setDownloads(data);
          if (data.msg) {
            if (data.success === "progress") {
              console.log(data.msg + "%");
            } else if (data.success) {
              auth.successMessage(data.msg);
            } else if (!data.success) {
              auth.errorMessage(data.msg);
            }
          }
        }
      });
    }
    return () => {
      console.log("unmount");
    };
  }, []);

  return (
    <div id={"headerMatcha"} className={classes.grow}>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            <Link
              onClick={checkIfLogged}
              to={auth.isLogged ? "/" : "/SignIn"}
              className={classes.title}
            >
              HYPERTUBE
              <MovieFilterIcon className={classes.titleIcon} />
            </Link>
          </Typography>
          <div className={classes.grow} />
          <RenderLink />
          <div className={classes.sectionMobile}>
            <IconButton
              className={classes.showMore}
              aria-controls={"primary-search-account-menu-mobile"}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <RenderMobileMenu />
    </div>
  );
};

const App = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const NavBar = withRouter(withStyles(appBarStyles)(AuthButton));

  useEffect(() => {
    fetch("/api/checkToken")
      .then((resLogged) => resLogged.json())
      .then((resLogged) => {
        auth.isLogged = resLogged.status === false ? false : true;
        setIsLoading(false);
      });
    return () => {
      console.log("unmount");
    };
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <BrowserRouter>
      <div>
        <ToastContainer />
        <NavBar></NavBar>
        <Switch>
          <PrivateRoute
            exact
            path="/"
            component={(props) => <Home props={props} auth={auth} />}
          />
          <PrivateRoute
            exact
            path="/Profile"
            component={(props) => <Profile props={props} auth={auth} />}
          />
          <PrivateRoute
            exact
            path="/User"
            component={(props) => <User props={props} auth={auth} />}
          />
          <PrivateRoute
            exact
            path="/Watch"
            component={(props) => <Watch props={props} auth={auth} />}
          />
          <PublicRoute
            exact
            path="/SignUp"
            component={(props) => <SignUp props={props} auth={auth} />}
          />
          <PublicRoute
            exact
            path="/SignIn"
            component={(props) => <SignIn props={props} auth={auth} />}
          />
          <PublicRoute
            exact
            path="/Recover"
            component={(props) => <Recover props={props} auth={auth} />}
          />
          <PublicRoute
            exact
            path="/Confirm"
            component={(props) => <Confirm props={props} auth={auth} />}
          />
          <PublicRoute component={FourOFour} />
        </Switch>
      </div>
    </BrowserRouter>
  );
};

export default App;
