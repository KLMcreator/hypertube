// react
import React, { useState, useEffect } from "react";
// framework
import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";
// files
import { getTorrents } from "../../../scripts/search";

let searchWaiting = 0;

const HomeStyles = (theme) => ({
  root: {
    border: "1px solid white",
    flex: 1,
    height: "100%",
    textAlign: "center",
  },
});

const Home = (props) => {
  const [search, setSearch] = useState("");
  const { classes } = props;

  const handleSearchTorrent = (e) => {
    setSearch(e.target.value);
    if (searchWaiting) {
      clearTimeout(searchWaiting);
    }
    searchWaiting = setTimeout(async () => {
      searchWaiting = null;
      await getTorrents(search);
    }, 500);
  };

  useEffect(() => {
    console.log("focused");
    return () => {
      console.log("unfocused");
    };
  }, []);

  return (
    <div className={classes.root}>
      <div>
        <TextField
          style={{ width: "50%" }}
          inputProps={{
            style: { borderBottom: "1px solid #fff" },
          }}
          InputLabelProps={{
            style: { color: "#fff" },
          }}
          required
          id="search"
          label="Search for a torrent..."
          value={search}
          onChange={handleSearchTorrent}
          type="text"
        />
      </div>
    </div>
  );
};

export default withStyles(HomeStyles)(Home);
