// react
import React, { useEffect } from "react";
// framework
import withStyles from "@material-ui/core/styles/withStyles";

const FourOFourStyles = (theme) => ({
  root: { flexGrow: 1 },
});

const FourOFour = (props) => {
  const { classes } = props;

  useEffect(() => {
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className={classes.root}>There's nothing here</div>;
};

export default withStyles(FourOFourStyles)(FourOFour);
