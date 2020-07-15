// files
import "rc-slider/assets/index.css";
// react
import React, { useState, useEffect, useRef } from "react";
import Select, { createFilter } from "react-select";
import Range from "rc-slider/lib/Range";
// framework
import { withStyles } from "@material-ui/core/styles";
import Input from "@material-ui/core/Input";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
// icons
import SearchIcon from "@material-ui/icons/Search";
import StarRateIcon from "@material-ui/icons/StarRate";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";

import Slider from "react-slick";
import "../../node_modules/slick-carousel/slick/slick.css";
import "../../node_modules/slick-carousel/slick/slick-theme.css";

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
    marginBottom: 5,
  },
  borderBottom: {
    "&.MuiInput-underline:before": {
      borderBottom: "1px solid #9A1300",
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
    color: "#9A1300",
  },
  inputColor: {
    color: "#fff",
  },
  selectContainer: {
    display: "flex",
    marginTop: 5,
    [theme.breakpoints.down("xs")]: {
      display: "block",
    },
  },
  fullWidth: {
    width: "90%",
  },
  rangeContainer: {
    flex: 1,
    margin: 3,
    textAlign: "-webkit-center",
  },
  selectDivider: {
    flex: 1,
    margin: 3,
  },
});

const TorrentContainerStyles = (theme) => ({
  torrentContainer: {
    // justifyContent: "center",
    // display: "flex",
    // flexWrap: "wrap",
    marginTop: 40,
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
    bottom: 0,
    left: 0,
  },
  image: {
    borderRadius: 6,
    width: "100%",
  },
});

const RenderTorrent = (props) => {
  const [hover, setHover] = useState(false);
  const { torrent, classes } = props;
  const languages = JSON.parse(torrent.languages);
  const categories = JSON.parse(torrent.categories);
  const subtitles =
    JSON.parse(torrent.subtitles).length > 5
      ? JSON.parse(torrent.subtitles).slice(0, 5)
      : JSON.parse(torrent.subtitles);

  return (
    <div
      className={classes.torrent}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        props.setShowMore({
          torrent: torrent,
          languages: languages,
          categories: categories,
          subtitles: subtitles,
        });
      }}
    >
      <img
        className={classes.image}
        src={torrent.cover_url}
        alt={torrent.title}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "./src/assets/img/nophotos.png";
        }}
      ></img>
      {hover ? (
        <div className={classes.hover}>
          <div className={classes.hoverContent}>
            <span>
              {torrent.rating}
              <StarRateIcon
                style={{
                  fontSize: 25,
                  color: "#FBBA72",
                  verticalAlign: "middle",
                }}
              ></StarRateIcon>
            </span>
            <span className={classes.torrentYear}>
              ({torrent.production_year})
            </span>
            <span className={classes.torrentTitle}>{torrent.title}</span>
          </div>
        </div>
      ) : undefined}
    </div>
  );
};

const TorrentSlider = React.memo((props) => {
  const sliderSettings = {
    arrows: false,
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "60px",
    slidesToShow: 6,
    speed: 500,
    swipeToSlide: true,
    focusOnSelect: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const { torrents } = props;
  const Torrent = withStyles(TorrentStyles)(RenderTorrent);

  return (
    <Slider {...sliderSettings}>
      {torrents.map((el) => (
        <Torrent key={el.id} torrent={el} setShowMore={props.setShowMore} />
      ))}
    </Slider>
  );
});

const RenderShowMore = (props) => {
  if (!props.showMore) return <></>;

  const { torrent, subtitles, languages, categories } = props.showMore;
  const t9_torrents = JSON.parse(torrent.torrents).filter(
    (el) => el.source === "torrent9"
  );
  const yts_torrents = JSON.parse(torrent.torrents).filter(
    (el) => el.source === "yts"
  );
  const qualities = JSON.parse(torrent.torrents).map((el) => el.quality);
  const summaries = torrent.summary ? JSON.parse(torrent.summary) : [];

  return (
    <div style={{ border: "1px solid #fff" }}>
      <div>{torrent.title}</div>
      <div>({torrent.production_year})</div>
      <div>
        {torrent.rating}
        <StarRateIcon></StarRateIcon>
      </div>
      {summaries.length ? (
        <div>
          Synopsis
          {summaries.length
            ? summaries.map((el, i) => <div key={"summary" + i}>{el}</div>)
            : "No informations"}
        </div>
      ) : undefined}
      <div>
        Categories:
        {categories.length
          ? categories.map((el, i) =>
              i < categories.length - 1 ? el + " / " : el
            )
          : "No informations"}
      </div>
      <div>
        Available languages:
        {languages.length
          ? languages.map((el, i) =>
              i < languages.length - 1 ? el + ", " : el
            )
          : "No informations"}
      </div>
      {subtitles && subtitles.length ? (
        <div>
          Available subtitles:
          {subtitles.length
            ? subtitles.map((el, i) =>
                i < subtitles.length - 1 ? el.language + ", " : el.language
              )
            : "No informations"}
        </div>
      ) : undefined}
      <div>
        Available qualities:
        {qualities.length
          ? qualities.map((el, i) =>
              i < qualities.length - 1 ? el + ", " : el
            )
          : "No informations"}
      </div>
      {torrent.duration ? <div>Duration: {torrent.duration}mn</div> : undefined}
      <div>
        Last viewed: {torrent.downloaded_at ? torrent.downloaded_at : "Never"}
      </div>
      <div>
        Last download: {torrent.lastviewed_at ? torrent.lastviewed_at : "Never"}
      </div>
      <div>
        Direct links
        {torrent.imdb_code ? (
          <a
            href={"https://www.imdb.com/title/" + torrent.imdb_code}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt={torrent.imdb_code}
              width="64"
              height="32"
              src="./src/assets/img/imdb.png"
            ></img>
          </a>
        ) : undefined}
        {torrent.torrent9_url ? (
          <a
            href={torrent.torrent9_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt={torrent.torrent9_url}
              width="64"
              height="32"
              src="./src/assets/img/torrent9.png"
            ></img>
          </a>
        ) : undefined}
        {torrent.yts_url ? (
          <a href={torrent.yts_url} target="_blank" rel="noopener noreferrer">
            <img
              alt={torrent.yts_url}
              width="64"
              height="32"
              src="./src/assets/img/yts.png"
            ></img>
          </a>
        ) : undefined}
      </div>
      {/* {source && source.length ? (
        <video
          id="videoPlayer"
          crossOrigin="anonymous"
          controls
          muted
          preload="auto"
          autoPlay
        >
          <source type="video/mp4" src={source} />
          {track !== "" && (
          <track
            label="subtitles"
            kind="subtitles"
            srcLang="en"
            src={track}
          />
        )}
          <track kind="captions" default />
        </video>
      ) : undefined} */}
      {yts_torrents.length ? (
        <div>
          YTS
          <FiberManualRecordIcon
            style={{
              color: torrent.yts_url ? "#0CCA4A" : "#E63946",
              verticalAlign: "middle",
            }}
          ></FiberManualRecordIcon>
          {torrent.yts_url ? (
            <div>
              {yts_torrents.map((el, i) => (
                <div key={el.magnet + i}>
                  {el.language}
                  {el.quality}
                  {el.size}
                  {el.downloaded ? "Downloaded" : "Not downloaded"}
                  Seeds:{el.seeds}
                  Peers:{el.peers}
                  <a
                    href={el.torrent}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                  <Button
                    onClick={() =>
                      console.log("need to redirect to stream torrent page")
                    }
                  >
                    Watch
                  </Button>
                </div>
              ))}
            </div>
          ) : undefined}
        </div>
      ) : undefined}
      {t9_torrents.length ? (
        <div>
          Torrent9
          <FiberManualRecordIcon
            style={{
              color: torrent.torrent9_url ? "#0CCA4A" : "#E63946",
              verticalAlign: "middle",
            }}
          ></FiberManualRecordIcon>
          {torrent.torrent9_url ? (
            <div>
              {t9_torrents.map((el, i) => (
                <div key={el.magnet + i}>
                  {el.languages}
                  {el.quality}
                  {el.size}
                  {el.downloaded ? "Downloaded" : "Not downloaded"}
                  Seeds:{el.seeds}
                  Peers:{el.peers}
                  <a
                    href={el.torrent}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                  <Button
                    onClick={() =>
                      console.log("need to redirect to stream torrent page")
                    }
                  >
                    Watch
                  </Button>
                </div>
              ))}
            </div>
          ) : undefined}
        </div>
      ) : undefined}
    </div>
  );
};

const RenderTorrents = (props) => {
  const [sortBy, setSortBy] = useState({
    label: "ASC. NAME",
    value: "ascname",
  });
  const [showMore, setShowMore] = useState(false);

  let { torrents } = props;
  const { classes } = props;

  const selectStyles = {
    option: (provided) => ({
      ...provided,
      borderBottom: "1px solid #EFF1F3",
      color: "#111",
      padding: 10,
      "&:hover": {
        cursor: "pointer",
      },
    }),
  };

  const sortOptions = [
    { label: "ASC. NAME", value: "ascname" },
    { label: "DESC. NAME", value: "descname" },
    { label: "ASC. RATING", value: "ascrating" },
    { label: "DESC. RATING", value: "descrating" },
    { label: "ASC. YEAR", value: "ascyear" },
    { label: "DESC. YEAR", value: "descyear" },
  ];

  const handleSortList = (el) => {
    setSortBy(el);
    if (el.value === "ascname") {
      torrents.sort((a, b) =>
        a.title < b.title ? -1 : a.title > b.title ? 1 : 0
      );
    } else if (el.value === "descname") {
      torrents.sort((a, b) =>
        a.title > b.title ? -1 : a.title < b.title ? 1 : 0
      );
    } else if (el.value === "ascrating") {
      torrents.sort((a, b) =>
        a.rating < b.rating ? -1 : a.rating > b.rating ? 1 : 0
      );
    } else if (el.value === "descrating") {
      torrents.sort((a, b) =>
        a.rating > b.rating ? -1 : a.rating < b.rating ? 1 : 0
      );
    } else if (el.value === "ascyear") {
      torrents.sort((a, b) =>
        a.production_year < b.production_year
          ? -1
          : a.production_year > b.production_year
          ? 1
          : 0
      );
    } else if (el.value === "descyear") {
      torrents.sort((a, b) =>
        a.production_year > b.production_year
          ? -1
          : a.production_year < b.production_year
          ? 1
          : 0
      );
    }
  };

  const ShowMore = RenderShowMore;

  return (
    <div>
      <div style={{ display: "flex", marginLeft: 70, marginRight: 70 }}>
        <div
          style={{
            flex: 3,
            textAlign: "left",
            alignSelf: "center",
            fontWeight: "bold",
          }}
        >
          AVAILABLE TORRENTS
        </div>
        <div style={{ flex: 1, textAlign: "right" }}>
          <Select
            value={sortBy}
            styles={selectStyles}
            filterOption={createFilter({
              ignoreAccents: false,
            })}
            options={sortOptions}
            key={"sortList"}
            onChange={handleSortList}
            placeholder={"SORT BY: " + sortBy.label}
          />
        </div>
      </div>

      <div className={classes.torrentContainer}>
        <TorrentSlider torrents={torrents} setShowMore={setShowMore} />
        <ShowMore showMore={showMore} />
      </div>
    </div>
  );
};

const RenderSearchBar = (props) => {
  const [search, setSearch] = useState(props.search);
  const [selectedCategories, setSelectedCategories] = useState(
    props.filters.selectedCategories
  );
  const [selectedLanguage, setSelectedLanguage] = useState(
    props.filters.selectedLanguage
  );
  const [selectedSubs, setSelectedSubs] = useState(props.filters.selectedSubs);
  const [selectedYear, setSelectedYear] = useState(props.filters.selectedYear);
  const [selectedRating, setSelectedRating] = useState(
    props.filters.selectedRating
  );
  const { settings, classes } = props;
  const categories = props.settings.categories;
  const languages = props.settings.languages;
  const subtitles = props.settings.subtitles;
  const selectStyles = {
    option: (provided) => ({
      ...provided,
      borderBottom: "1px solid #EFF1F3",
      color: "#111",
      padding: 10,
      "&:hover": {
        cursor: "pointer",
      },
    }),
  };

  const handleSearchTorrent = (e) => {
    e.preventDefault();
    props.handleSearchTorrent(
      search,
      selectedCategories,
      selectedLanguage,
      selectedYear,
      selectedRating,
      selectedSubs
    );
  };

  const handleResetSearch = (e) => {
    e.preventDefault();
    props.handleResetSearch();
  };

  const handleAppendTags = (tagToAdd) => {
    setSelectedCategories(tagToAdd);
  };

  const handleAppendLanguage = (languageToAdd) => {
    setSelectedLanguage(languageToAdd);
  };

  const handleAppendSubs = (subsToAdd) => {
    setSelectedSubs(subsToAdd);
  };

  const handleFilterYear = (e) => {
    setSelectedYear(e);
  };

  const handleFilterRating = (e) => {
    setSelectedRating(e);
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
        placeholder="Search torrent"
        value={search}
        required
        onChange={(e) => setSearch(e.target.value)}
        endAdornment={<SearchIcon className={classes.sendIcon}></SearchIcon>}
      />
      <div className={classes.selectContainer}>
        <div className={classes.selectDivider}>
          <Select
            value={selectedCategories}
            styles={selectStyles}
            closeMenuOnSelect={false}
            isMulti
            filterOption={createFilter({
              ignoreAccents: false,
            })}
            isSearchable={true}
            options={categories}
            key={"changeCategories"}
            onChange={handleAppendTags}
            placeholder={"Movie categories: ALL"}
          />
        </div>
        <div className={classes.selectDivider}>
          <Select
            value={selectedLanguage}
            styles={selectStyles}
            closeMenuOnSelect={false}
            isMulti
            filterOption={createFilter({
              ignoreAccents: false,
            })}
            isSearchable={true}
            options={languages}
            key={"changeLanguage"}
            onChange={handleAppendLanguage}
            placeholder={"Language: ALL"}
          />
        </div>
        <div className={classes.selectDivider}>
          <Select
            value={selectedSubs}
            styles={selectStyles}
            closeMenuOnSelect={false}
            isMulti
            filterOption={createFilter({
              ignoreAccents: false,
            })}
            isSearchable={true}
            options={subtitles}
            key={"changeSubs"}
            onChange={handleAppendSubs}
            placeholder={"Subtitles: ALL"}
          />
        </div>
      </div>
      <div className={classes.selectContainer}>
        <div className={classes.rangeContainer}>
          Year: {selectedYear[0] + " - " + selectedYear[1]}
          <Range
            className={classes.fullWidth}
            trackStyle={[{ backgroundColor: "#9A1300" }]}
            handleStyle={[
              {
                borderColor: "#FBBA72",
                backgroundColor: "#9A1300",
              },
              {
                borderColor: "#FBBA72",
                backgroundColor: "#9A1300",
              },
            ]}
            min={settings.minProductionYear}
            max={settings.maxProductionYear}
            defaultValue={[selectedYear[0], selectedYear[1]]}
            onChange={handleFilterYear}
          />
        </div>
        <div className={classes.rangeContainer}>
          Rating: {selectedRating[0] + " - " + selectedRating[1]}
          <Range
            className={classes.fullWidth}
            trackStyle={[{ backgroundColor: "#9A1300" }]}
            handleStyle={[
              {
                borderColor: "#FBBA72",
                backgroundColor: "#9A1300",
              },
              {
                borderColor: "#FBBA72",
                backgroundColor: "#9A1300",
              },
            ]}
            min={0}
            max={10}
            defaultValue={[selectedRating[0], selectedRating[1]]}
            onChange={handleFilterRating}
          />
        </div>
      </div>
      <div className={classes.selectContainer}>
        <div className={classes.selectDivider}>
          <Button
            className={classes.fullWidth}
            variant="outlined"
            color="secondary"
            type="submit"
            onClick={handleResetSearch}
          >
            RESET SEARCH
          </Button>
        </div>
        <div className={classes.selectDivider}>
          <Button
            className={classes.fullWidth}
            variant="outlined"
            color="secondary"
            type="submit"
            onClick={handleSearchTorrent}
          >
            SEARCH TORRENTS
          </Button>
        </div>
      </div>
    </div>
  );
};

const Home = (props) => {
  const ref = useRef(false);
  const { classes } = props;
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [torrents, setTorrents] = useState([]);
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const Torrents = withStyles(TorrentContainerStyles)(RenderTorrents);
  const SearchBar = withStyles(SearchBarStyles)(RenderSearchBar);

  const getQueryTorrents = async (query, loadMore) => {
    setIsLoading(true);
    fetch("/api/torrents/query", {
      method: "POST",
      body: JSON.stringify({
        query: query.query,
        selectedCategories: query.selectedCategories
          ? query.selectedCategories
          : null,
        selectedLanguage: query.selectedLanguage
          ? query.selectedLanguage
          : null,
        selectedYear: query.selectedYear
          ? query.selectedYear
          : [settings.minProductionYear, settings.maxProductionYear],
        selectedRating: query.selectedRating ? query.selectedRating : [0, 10],
        selectedSubs: query.selectedSubs ? query.selectedSubs : null,
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
          setIsLoading(false);
        } else if (res.torrents.msg) {
          props.auth.errorMessage(res.torrents.msg);
        } else {
          props.auth.errorMessage("Error while fetching database.");
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  const getTorrentSettings = () => {
    fetch("/api/torrents/get/settings", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.settings.settings) {
          setSettings({
            minProductionYear: res.settings.settings[0].minproductionyear,
            maxProductionYear: res.settings.settings[0].maxproductionyear,
            categories: JSON.parse(res.settings.settings[0].categories),
            languages: JSON.parse(res.settings.settings[0].languages),
            subtitles: JSON.parse(res.settings.settings[0].subtitles),
          });
          setFilters({
            selectedCategories: [],
            selectedLanguage: [],
            selectedYear: [
              res.settings.settings[0].minproductionyear,
              res.settings.settings[0].maxproductionyear,
            ],
            selectedRating: [0, 10],
            selectedSubs: [],
          });
          setIsLoading(false);
        } else if (res.settings.msg) {
          props.auth.errorMessage(res.settings.msg);
        } else {
          props.auth.errorMessage("Error while fetching database.");
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  const getRandomTorrents = (reset) => {
    fetch("/api/torrents/random", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((res) => {
        if (ref.current) {
          if (res.torrents.torrents) {
            setTorrents(res.torrents);
            if (!reset) {
              getTorrentSettings();
            }
          } else if (res.torrents.msg) {
            props.auth.errorMessage(res.torrents.msg);
          } else {
            props.auth.errorMessage("Error while fetching database.");
          }
        }
      })
      .catch((err) => props.auth.errorMessage(err));
  };

  const handleResetSearch = () => {
    getRandomTorrents(true);
    setSearch("");
    setFilters({
      selectedCategories: [],
      selectedLanguage: [],
      selectedYear: [settings.minProductionYear, settings.maxProductionYear],
      selectedRating: [0, 10],
      selectedSubs: [],
    });
  };

  const handleSearchTorrent = async (
    query,
    selectedCategories,
    selectedLanguage,
    selectedYear,
    selectedRating,
    selectedSubs
  ) => {
    await getQueryTorrents({
      query: query,
      selectedCategories: selectedCategories,
      selectedLanguage: selectedLanguage,
      selectedYear: selectedYear,
      selectedRating: selectedRating,
      selectedSubs: selectedSubs,
    });
    setSearch(query);
    setFilters({
      selectedCategories: selectedCategories ? selectedCategories : null,
      selectedLanguage: selectedLanguage ? selectedLanguage : null,
      selectedYear: selectedYear ? selectedYear : null,
      selectedRating: selectedRating ? selectedRating : null,
      selectedSubs: selectedSubs ? selectedSubs : null,
    });
  };

  const RenderLoadMore = () => {
    if (torrents.torrents && torrents.torrents.length > limit - 1) {
      return (
        <Button
          style={{ marginBottom: 20 }}
          variant="outlined"
          color="secondary"
          type="submit"
          onClick={() => {
            getQueryTorrents(
              {
                query: search,
                selectedCategories: filters.selectedCategories,
                selectedLanguage: filters.selectedLanguage,
                selectedYear: filters.selectedYear,
                selectedRating: filters.selectedRating,
                selectedSubs: filters.selectedSubs,
              },
              limit + 15
            );
          }}
        >
          {search ? "LOAD MORE" : "GIMME MORE MOVIES"}
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
      <SearchBar
        settings={settings}
        search={search}
        filters={filters}
        handleResetSearch={handleResetSearch}
        handleSearchTorrent={handleSearchTorrent}
      />
      {torrents.torrents.length ? (
        <div>
          <Torrents torrents={torrents.torrents} />
        </div>
      ) : (
        <div className={classes.loading}>
          <div style={{ color: "#9A1300", fontSize: 30 }}>:(</div>
          <div style={{ fontSize: 15, color: "#D0D0D0" }}>
            Nothing match this query
          </div>
          <div style={{ color: "#9A1300", fontSize: 30 }}>:(</div>
        </div>
      )}
      {/* <RenderLoadMore /> */}
    </div>
  );
};

export default withStyles(HomeStyles)(Home);
