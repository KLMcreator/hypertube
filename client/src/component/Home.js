// react
import React, { useState, useEffect } from "react";
// framework
import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
// files

let searchWaiting = 0;

const HomeStyles = (theme) => ({
  root: {
    flex: 1,
    height: "100%",
    textAlign: "center",
  },
});

const RenderTorrents = (props) => {
  const { torrents } = props.torrents;
  return (
    <div>
      {torrents.map((el) => {
        return <h1 key={el.id}>{el.title}</h1>;
      })}
    </div>
  );
};

const Home = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [torrents, setTorrents] = useState([]);
  const { classes } = props;

  const getQueryTorrents = async () => {
    fetch("/api/torrents/query", {
      method: "POST",
      body: JSON.stringify({
        query: search,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.torrents.torrents) {
          setTorrents(res.torrents);
        } else if (res.torrents.msg) {
          props.auth.errorMessage(res.torrents.msg);
        } else {
          props.auth.errorMessage("Error while fetching database.");
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  const getRandomTorrents = () => {
    fetch("/api/torrents/random", { method: "POST" })
      .then((res) => res.json())
      .then((res) => {
        if (res.torrents.torrents) {
          setTorrents(res.torrents);
          setIsLoading(false);
        } else if (res.torrents.msg) {
          props.auth.errorMessage(res.torrents.msg);
        } else {
          props.auth.errorMessage("Error while fetching database.");
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  const handleSearchTorrent = (e) => {
    setSearch(e.target.value);
    if (searchWaiting) {
      clearTimeout(searchWaiting);
    }
    searchWaiting = setTimeout(async () => {
      searchWaiting = null;
      console.log(search);
      if (search) {
        await getQueryTorrents(search);
      }
    }, 500);
  };

  useEffect(() => {
    getRandomTorrents();
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

  return (
    <div className={classes.root}>
      <div style={{ borderWidth: 1, fontSize: 13 }}>
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
      <RenderTorrents torrents={torrents} />
    </div>
  );
};

export default withStyles(HomeStyles)(Home);
