// react
import React, { useState, useEffect } from "react";
// framework
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
// files

let searchWaiting = 0;

const HomeStyles = (theme) => ({
  root: {
    flex: 1,
    height: "100%",
    textAlign: "center",
  },
  torrentContainer: {
    justifyContent: "center",
    display: "flex",
    flexWrap: "wrap",
    padding: 10,
    margin: 20,
  },
});

const TorrentStyles = (theme) => ({
  torrent: {
    flex: "0 0 16%",
    margin: 5,
    [theme.breakpoints.down("md")]: {
      flex: "0 0 30%",
    },
    [theme.breakpoints.down("sm")]: {
      flex: "0 0 45%",
    },
    [theme.breakpoints.down("xs")]: {
      flex: "0 0 100%",
    },
  },
});

const RenderTorrent = (props) => {
  const { torrent, classes } = props;
  const languages = JSON.parse(torrent.languages);
  const categories = JSON.parse(torrent.categories);
  console.log(torrent);

  return (
    <Card className={classes.torrent}>
      <CardActionArea>
        <CardMedia
          image={torrent.cover_url}
          style={{ height: 300 }}
          title={torrent.title}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {torrent.title}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Year: {torrent.production_year}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Rating: {torrent.rating ? torrent.rating : 0} / 10
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Languages:{" "}
            {languages.length
              ? languages.map((el, i) =>
                  i < languages.length - 1 ? el + ", " : el
                )
              : "No informations"}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Categories:{" "}
            {categories.length
              ? categories.map((el, i) =>
                  i < categories.length - 1 ? el + ", " : el
                )
              : "No informations"}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Available on: YTS: {torrent.yts_url ? "Yes" : "No"} | Torrent9:{" "}
            {torrent.torrent9_url ? "Yes" : "No"}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const Home = (props) => {
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState("");
  const [torrents, setTorrents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const Torrent = withStyles(TorrentStyles)(RenderTorrent);
  const { classes } = props;

  const getQueryTorrents = async (query, loadMore) => {
    fetch("/api/torrents/query", {
      method: "POST",
      body: JSON.stringify({
        query: query,
        limit: loadMore ? loadMore : limit,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.torrents.torrents) {
          if (loadMore) {
            setLimit(limit + 15);
          }
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
    let query = e.target.value;
    setSearch(query);
    if (searchWaiting) {
      clearTimeout(searchWaiting);
    }
    searchWaiting = setTimeout(async () => {
      searchWaiting = null;
      if (query) {
        await getQueryTorrents(query);
      } else {
        getRandomTorrents();
        setLimit(15);
      }
    }, 500);
  };

  const RenderTorrents = () => {
    if (torrents.torrents && torrents.torrents.length) {
      return (
        <div className={classes.torrentContainer}>
          {torrents.torrents.map((el) => (
            <Torrent key={el.id} torrent={el} />
          ))}
        </div>
      );
    }
    return <></>;
  };

  const RenderLoadMore = () => {
    if (search && torrents.torrents && torrents.torrents.length > limit - 1) {
      return (
        <Button
          variant="outlined"
          color="secondary"
          type="submit"
          onClick={() => {
            getQueryTorrents(search, limit + 15);
          }}
        >
          LOAD MORE
        </Button>
      );
    }
    return <></>;
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
      <RenderTorrents />
      <RenderLoadMore />
    </div>
  );
};

export default withStyles(HomeStyles)(Home);
