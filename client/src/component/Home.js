// react
import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
// framework
import { withStyles } from "@material-ui/core/styles";
import Input from "@material-ui/core/Input";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
// icons
import SearchIcon from "@material-ui/icons/Search";
import StarRateIcon from "@material-ui/icons/StarRate";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";

let searchWaiting = 0;

const HomeStyles = (theme) => ({
  root: {
    flex: 1,
    height: "100%",
    textAlign: "center",
  },
  loading: {
    display: "flex",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingLogo: {
    color: "#9A1300",
  },
});

const SearchBarStyles = (theme) => ({
  container: {
    borderWidth: 1,
    fontSize: 13,
    marginTop: 30,
    marginBottom: 30,
    marginRight: 40,
    marginLeft: 40,
  },
  halfWidth: {
    width: "50%",
  },
  rootSend: {
    width: "100%",
  },
  borderBottom: {
    "&.MuiInput-underline:before": {
      borderBottom: "1px solid #9A1300",
    },
    "&.MuiInput-underline:after": {
      borderBottom: "1px solid #FA7B38",
    },
    "&.MuiInput-underline:hover::before": {
      borderBottom: "2px solid #FBBA72",
    },
    "&.MuiInput-underline:hover::after": {
      borderBottom: "1px solid #FBBA72",
    },
  },
  sendIcon: {
    color: "#9A1300",
  },
  inputColor: {
    color: "#fff",
  },
});

const TorrentContainerStyles = (theme) => ({
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
    position: "relative",
    flex: "0 0 16%",
    margin: 5,
    [theme.breakpoints.down("md")]: {
      flex: "0 0 31%",
    },
    [theme.breakpoints.down("xs")]: {
      flex: "0 0 90%",
    },
  },
  torrentTitle: {
    fontWeight: "bold",
    textAlign: "left",
    marginRight: 2,
    fontSize: 14,
    color: "#EFF1F3",
  },
  torrentInfoContainer: {
    display: "flex",
    marginTop: 2,
  },
  torrentYear: {
    flex: 1,
    textAlign: "left",
    marginRight: 2,
    fontSize: 13,
    color: "#D0D0D0",
    alignSelf: "center",
  },
  torrentRating: {
    flex: 1,
    textAlign: "right",
    marginRight: 2,
    fontSize: 13,
    color: "#D0D0D0",
    alignSelf: "center",
  },
  hover: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(26, 26, 26, 0.6)",
    cursor: "pointer",
  },
  hoverContent: {
    position: "absolute",
    top: 100,
    left: 3,
    width: "100%",
    height: "100%",
  },
  hoverContentParent: {
    display: "flex",
    marginTop: 10,
  },
  hoverContentTitle: {
    fontWeight: "bold",
    alignSelf: "center",
    marginRight: 2,
    fontSize: 15,
  },
  image: {
    borderRadius: 6,
    width: "100%",
  },
});

const RenderTorrent = (props) => {
  const [hover, setHover] = useState(false);
  const { torrent, classes } = props;
  const history = useHistory();
  const languages = JSON.parse(torrent.languages);
  const categories = JSON.parse(torrent.categories);

  return (
    <div
      className={classes.torrent}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() =>
        history.push({
          pathname: "/Torrent",
          state: { torrent: torrent },
        })
      }
    >
      <img
        className={classes.image}
        src={"./src/assets/torrents/" + torrent.cover_url}
        alt={torrent.title}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "./src/assets/img/nophotos.png";
        }}
      ></img>
      {hover ? (
        <div className={classes.hover}>
          <div className={classes.hoverContent}>
            <div className={classes.hoverContentParent}>
              <div className={classes.hoverContentTitle}>Language(s):</div>
              <div style={{ alignSelf: "center", fontSize: 13 }}>
                {languages.length
                  ? languages.map((el, i) =>
                      i < languages.length - 1 ? el + ", " : el
                    )
                  : "No informations"}
              </div>
            </div>
            <div className={classes.hoverContentParent}>
              <div className={classes.hoverContentTitle}>Categorie(s):</div>
              <div style={{ alignSelf: "center", fontSize: 13 }}>
                {categories.length
                  ? categories.map((el, i) =>
                      i < categories.length - 1 ? el + ", " : el
                    )
                  : "No informations"}
              </div>
            </div>
            <div className={classes.hoverContentParent}>
              <div className={classes.hoverContentTitle}>Available:</div>
              <div style={{ alignSelf: "center", fontSize: 13 }}>
                YTS{" "}
                <FiberManualRecordIcon
                  style={{
                    fontSize: 11,
                    color: torrent.yts_url ? "#0CCA4A" : "#E63946",
                    verticalAlign: "middle",
                  }}
                ></FiberManualRecordIcon>{" "}
                | Torrent9
                <FiberManualRecordIcon
                  style={{
                    fontSize: 11,
                    color: torrent.torrent9_url ? "#0CCA4A" : "#E63946",
                    verticalAlign: "middle",
                  }}
                ></FiberManualRecordIcon>
              </div>
            </div>
          </div>
        </div>
      ) : undefined}
      <div>
        <div className={classes.torrentTitle}>{torrent.title}</div>
        <div className={classes.torrentInfoContainer}>
          <div className={classes.torrentYear}>{torrent.production_year}</div>
          {torrent.rating ? (
            <div className={classes.torrentRating}>
              {torrent.rating}
              <StarRateIcon
                style={{
                  fontSize: 25,
                  color: "#FBBA72",
                  verticalAlign: "middle",
                }}
              ></StarRateIcon>
            </div>
          ) : undefined}
        </div>
      </div>
    </div>
  );
};

const RenderTorrents = (props) => {
  const { torrents, classes } = props;
  const Torrent = withStyles(TorrentStyles)(RenderTorrent);

  return (
    <div className={classes.torrentContainer}>
      {torrents.map((el) => (
        <Torrent key={el.id} torrent={el} />
      ))}
    </div>
  );
};

const RenderSearchBar = (props) => {
  const [search, setSearch] = useState("");
  const { classes } = props;

  const handleSearchTorrent = (e) => {
    props.handleSearchTorrent(e.target.value);
    setSearch(e.target.value);
  };

  return (
    <div className={classes.container}>
      <Input
        classes={{
          root: classes.rootSend,
          input: classes.inputColor,
          underline: classes.borderBottom,
        }}
        type="text"
        placeholder="Search for a torrent..."
        value={search}
        required
        onChange={handleSearchTorrent}
        endAdornment={<SearchIcon className={classes.sendIcon}></SearchIcon>}
      />
    </div>
  );
};

const Home = (props) => {
  const ref = useRef(false);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState("");
  const [torrents, setTorrents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { classes } = props;
  const Torrents = withStyles(TorrentContainerStyles)(RenderTorrents);
  const SearchBar = withStyles(SearchBarStyles)(RenderSearchBar);

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
    fetch("/api/torrents/random", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((res) => {
        if (ref.current) {
          if (res.torrents.torrents) {
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

  const handleSearchTorrent = (query) => {
    if (searchWaiting) {
      clearTimeout(searchWaiting);
    }
    searchWaiting = setTimeout(async () => {
      searchWaiting = null;
      if (query) {
        await getQueryTorrents(query);
        setSearch(query);
      } else {
        setSearch("");
        getRandomTorrents();
        setLimit(15);
      }
    }, 750);
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
    ref.current = true;
    getRandomTorrents();
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
      <SearchBar search={search} handleSearchTorrent={handleSearchTorrent} />
      {torrents.torrents.length ? (
        <Torrents torrents={torrents.torrents} />
      ) : (
        <div className={classes.loading}>
          <div style={{ color: "#9A1300", fontSize: 30 }}>:(</div>
          <div style={{ fontSize: 15, color: "#D0D0D0" }}>
            Nothing match this query
          </div>
          <div style={{ color: "#9A1300", fontSize: 30 }}>:(</div>
        </div>
      )}
      <RenderLoadMore />
    </div>
  );
};

export default withStyles(HomeStyles)(Home);
