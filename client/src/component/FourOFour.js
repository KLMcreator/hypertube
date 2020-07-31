// react
import React from "react";
// framework
import withStyles from "@material-ui/core/styles/withStyles";

const FourOFourStyles = (theme) => ({
  root: { flexGrow: 1 },
});

const FourOFour = (props) => {
  const { classes } = props;

  return (
    <div className={classes.root}>
      <img
        src={"./src/assets/img/404.png"}
        alt="404"
        style={{ width: "100%" }}
      ></img>
    </div>
  );
};

export default withStyles(FourOFourStyles)(FourOFour);
