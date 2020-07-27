// react
import React, { useState, useEffect } from "react";
// framework
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

const ConfirmStyles = (theme) => ({
  loading: {
    display: "flex",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingLogo: {
    color: "#E63946",
  },
});

const Confirm = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const { classes } = props;

  const verifyAccount = () => {
    const params = new URLSearchParams(props.props.location.search);
    if (params.has("r") && params.has("u") && params.has("e")) {
      let r = params.get("r");
      let u = params.get("u");
      let e = params.get("e");
      fetch("/api/confirm/account", {
        method: "POST",
        body: JSON.stringify({
          r: r,
          u: u,
          e: e,
        }),
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.confirm.confirm === true) {
            props.auth.successMessage("Your account is now confirmed!");
            props.props.history.push("/");
          } else {
            props.auth.errorMessage(res.confirm.msg);
            props.props.history.push("/");
          }
        })
        .catch((err) => props.auth.errorMessage(err));
    } else {
      props.props.history.push("/");
    }
  };

  useEffect(() => {
    verifyAccount();
    setIsLoading(false);
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

  return <div className={classes.paperContainer}></div>;
};

export default withStyles(ConfirmStyles)(Confirm);
