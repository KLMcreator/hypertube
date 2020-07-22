// files
import "rc-slider/assets/index.css";
// react
import Range from "rc-slider/lib/Range";
import { useHistory } from "react-router-dom";
import Select, { createFilter } from "react-select";
import React, { useState, useEffect, useRef } from "react";
// framework
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import CircularProgress from "@material-ui/core/CircularProgress";
// icons
import CloseIcon from "@material-ui/icons/Close";
import SearchIcon from "@material-ui/icons/Search";
import StarRateIcon from "@material-ui/icons/StarRate";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";

import Slider from "react-slick";
import "../../node_modules/slick-carousel/slick/slick.css";
import "../../node_modules/slick-carousel/slick/slick-theme.css";
import "./../assets/css/home.css";

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
    marginTop: 20,
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
    bottom: 5,
    left: 5,
  },
  image: {
    borderRadius: 6,
    width: "100%",
  },
});

const showMoreStyles = (theme) => ({
  container: {
    backgroundColor: "#1a1a1a",
    boxShadow: "none",
    border: "0.5px solid rgba(41, 41, 41, .5)",
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 30,
  },
  titleAndLeftInfo: {
    display: "flex",
    textAlign: "left",
  },
  title: {
    paddingLeft: 5,
    flex: 3,
    alignSelf: "center",
    fontWeight: "bold",
  },
  titleText: {
    fontSize: 18,
    color: "#D0D0D0",
  },
  titleYear: {
    fontSize: 18,
    color: "#EFF1F3",
  },
  titleStar: {
    fontSize: 28,
    color: "#FBBA72",
    verticalAlign: "middle",
  },
  closeButton: {
    flex: 1,
    textAlign: "right",
  },
  titleClose: {
    fontSize: 25,
    color: "#fff",
    verticalAlign: "middle",
  },
  torrentInfos: {
    padding: 10,
  },
  torrentSummary: {
    flex: 2,
    color: "#D0D0D0",
    marginRight: 10,
  },
  rightInfo: {
    flex: 1,
    marginLeft: 10,
  },
  boldInfo: {
    color: "#EFF1F3",
    fontWeight: "bold",
  },
  contentInfo: {
    color: "#D0D0D0",
  },
  torrentTab: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingRight: 10,
    paddingLeft: 10,
  },
  torrentTabTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  sourceContainer: {
    display: "flex",
    flexWrap: "wrap",
  },
  source: {
    flex: "1 0 30%",
    padding: 5,
  },
  sourceSection: {
    display: "flex",
    justifyContent: "center",
  },
  sourceContent: {
    padding: 3,
  },
  sourceWatch: {
    color: "#FBBA72",
    border: "1px solid #FBBA72",
  },
});

const RenderTorrent = (props) => {
  const [hover, setHover] = useState(false);
  const { torrent, classes, isRandom } = props;
  const languages = JSON.parse(torrent.languages);
  const categories = JSON.parse(torrent.categories);
  const subtitles = JSON.parse(torrent.subtitles);

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
        if (isRandom) props.setShowMoreBis(false);
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
            <div>
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
            </div>
            <div>
              <span className={classes.torrentTitle}>{torrent.title}</span>
            </div>
          </div>
        </div>
      ) : undefined}
    </div>
  );
};

const TorrentSlider = React.memo((props) => {
  const { torrents, isRandom, category } = props;
  const [sortBy, setSortBy] = useState({
    label: "ASC. NAME",
    value: "ascname",
  });

  const sliderSettings = {
    arrows: false,
    className: "center",
    centerMode: true,
    infinite: torrents.length < 7 ? false : true,
    centerPadding: "60px",
    slidesToShow: 7,
    speed: 500,
    swipeToSlide: true,
    focusOnSelect: true,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          infinite: torrents.length < 5 ? false : true,
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          infinite: torrents.length < 4 ? false : true,
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          infinite: torrents.length < 3 ? false : true,
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          infinite: torrents.length < 1 ? false : true,
          slidesToShow: 1,
        },
      },
    ],
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

  const Torrent = withStyles(TorrentStyles)(RenderTorrent);

  return (
    <div>
      {!isRandom ? (
        <div
          style={{
            display: "flex",
            marginLeft: 70,
            marginRight: 70,
            marginBottom: 10,
          }}
        >
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
              className="react-select-container"
              classNamePrefix="react-select"
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: "#EFF1F3",
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
              options={sortOptions}
              key={"sortList"}
              onChange={handleSortList}
              placeholder={"SORT BY: " + sortBy.label}
            />
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            marginLeft: 70,
            marginRight: 70,
            marginTop: 20,
          }}
        >
          <div
            style={{
              flex: 3,
              textAlign: "left",
              alignSelf: "center",
              fontWeight: "bold",
              fontSize: 20,
            }}
          >
            {category.toUpperCase()}
          </div>
        </div>
      )}
      <Slider {...sliderSettings}>
        {torrents.map((el) => (
          <Torrent
            key={el.id}
            torrent={el}
            isRandom={isRandom}
            setShowMore={props.setShowMore}
            setShowMoreBis={props.setShowMoreBis}
          />
        ))}
      </Slider>
    </div>
  );
});

const RenderShowMore = (props) => {
  const [selectedTab, setSelectedTab] = useState(0);

  if (!props.showMore) return <></>;

  const { history, classes } = props;
  const { torrent, subtitles, languages, categories } = props.showMore;
  const t9_torrents = JSON.parse(torrent.torrents).filter(
    (el) => el.source === "torrent9"
  );
  const yts_torrents = JSON.parse(torrent.torrents).filter(
    (el) => el.source === "yts"
  );
  const qualities = JSON.parse(torrent.torrents).map((el) => el.quality);
  const summaries = torrent.summary ? JSON.parse(torrent.summary)[0] : [];

  return (
    <div className={classes.container}>
      <Tabs
        value={selectedTab}
        onChange={(e, v) => setSelectedTab(v)}
        variant="fullWidth"
      >
        <Tab label="INFORMATIONS" id="INFO_TAB" />
        <Tab label="TORRENTS" id="TORRENT_TAB" />
      </Tabs>
      <div className={classes.titleAndLeftInfo}>
        <div className={classes.title}>
          <span className={classes.titleText}>({torrent.production_year})</span>{" "}
          <span className={classes.titleYear}>
            {torrent.title} - {torrent.rating}
          </span>
          <StarRateIcon className={classes.titleStar}></StarRateIcon>
        </div>
        <div className={classes.closeButton}>
          <IconButton onClick={() => props.setShowMore(false)}>
            <CloseIcon className={classes.titleClose} />
          </IconButton>
        </div>
      </div>
      {selectedTab === 0 ? (
        <div className={classes.torrentInfos}>
          <div className={classes.titleAndLeftInfo}>
            {summaries ? (
              <div className={classes.torrentSummary}>{summaries}</div>
            ) : undefined}
            <div className={classes.rightInfo}>
              <div>
                <span className={classes.boldInfo}>Categories:</span>{" "}
                <span className={classes.contentInfo}>
                  {categories.length
                    ? categories.map((el, i) =>
                        i < categories.length - 1 ? el + " / " : el
                      )
                    : "No informations"}
                </span>
              </div>
              <div>
                <span className={classes.boldInfo}>Languages:</span>{" "}
                <span className={classes.contentInfo}>
                  {languages.length
                    ? languages.map((el, i) =>
                        i < languages.length - 1 ? el + " / " : el
                      )
                    : "No informations"}
                </span>
              </div>
              {subtitles && subtitles.length ? (
                <div>
                  <span className={classes.boldInfo}>Subtitles:</span>{" "}
                  <span className={classes.contentInfo}>
                    {subtitles.length
                      ? subtitles.map((el, i) =>
                          i < subtitles.length - 1
                            ? el.language + " / "
                            : el.language
                        )
                      : "No informations"}
                  </span>
                </div>
              ) : undefined}
              <div>
                <span className={classes.boldInfo}>Qualities:</span>{" "}
                <span className={classes.contentInfo}>
                  {qualities.length
                    ? qualities.map((el, i) =>
                        i < qualities.length - 1 ? el + " / " : el
                      )
                    : "No informations"}
                </span>
              </div>
              {torrent.duration ? (
                <div>
                  <span className={classes.boldInfo}>Duration:</span>{" "}
                  <span className={classes.contentInfo}>
                    {torrent.duration}mn
                  </span>
                </div>
              ) : undefined}
              {torrent.lastviewed_at ? (
                <div>
                  <span className={classes.boldInfo}>Last viewed:</span>{" "}
                  <span className={classes.contentInfo}>
                    {torrent.lastviewed_at}
                  </span>
                </div>
              ) : undefined}
              {torrent.downloaded_at ? (
                <div>
                  <span className={classes.boldInfo}>Last download:</span>{" "}
                  <span className={classes.contentInfo}>
                    {torrent.downloaded_at}
                  </span>
                </div>
              ) : undefined}
            </div>
          </div>
        </div>
      ) : (
        <div className={classes.torrentTab}>
          {yts_torrents.length ? (
            <div>
              <div>
                <span className={classes.torrentTabTitle}>YTS</span>
                <FiberManualRecordIcon
                  style={{
                    color: torrent.yts_url ? "#0CCA4A" : "#E63946",
                    verticalAlign: "middle",
                  }}
                ></FiberManualRecordIcon>
              </div>
              <div className={classes.sourceContainer}>
                {yts_torrents.map((el, i) => (
                  <div key={el.magnet + i} className={classes.source}>
                    <div className={classes.sourceSection}>
                      <div className={classes.sourceContent}>{el.language}</div>
                      <div className={classes.sourceContent}>
                        <span className={classes.boldInfo}>Quality:</span>{" "}
                        <span className={classes.contentInfo}>
                          {el.quality}
                        </span>
                      </div>
                      <div className={classes.sourceContent}>
                        <span className={classes.boldInfo}>Size:</span>{" "}
                        <span className={classes.contentInfo}>{el.size}</span>
                      </div>
                    </div>
                    <div className={classes.sourceSection}>
                      <div className={classes.sourceContent}>
                        <span className={classes.boldInfo}>Downloaded:</span>{" "}
                        <span className={classes.contentInfo}>
                          {el.downloaded ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className={classes.sourceContent}>
                        <span className={classes.boldInfo}>Seeds:</span>{" "}
                        <span className={classes.contentInfo}>{el.seeds}</span>
                      </div>
                      <div className={classes.sourceContent}>
                        <span className={classes.boldInfo}>Peers:</span>{" "}
                        <span className={classes.contentInfo}>{el.peers}</span>
                      </div>
                    </div>
                    <div className={classes.sourceSection}>
                      <div className={classes.sourceContent}>
                        <Button
                          variant="outlined"
                          className={classes.sourceWatch}
                          onClick={() =>
                            history.push({
                              pathname: `/Watch`,
                              state: { movie: torrent, torrent: el },
                            })
                          }
                        >
                          WATCH
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : undefined}
          {t9_torrents.length ? (
            <div>
              <div>
                <span className={classes.torrentTabTitle}>Torrent9</span>
                <FiberManualRecordIcon
                  style={{
                    color: torrent.torrent9_url ? "#0CCA4A" : "#E63946",
                    verticalAlign: "middle",
                  }}
                ></FiberManualRecordIcon>
              </div>
              <div className={classes.sourceContainer}>
                {t9_torrents.map((el, i) => (
                  <div key={el.magnet + i} className={classes.source}>
                    <div className={classes.sourceSection}>
                      <div className={classes.sourceContent}>{el.language}</div>
                      <div className={classes.sourceContent}>
                        <span className={classes.boldInfo}>Quality:</span>{" "}
                        <span className={classes.contentInfo}>
                          {el.quality}
                        </span>
                      </div>
                      <div className={classes.sourceContent}>
                        <span className={classes.boldInfo}>Size:</span>{" "}
                        <span className={classes.contentInfo}>{el.size}</span>
                      </div>
                    </div>
                    <div className={classes.sourceSection}>
                      <div className={classes.sourceContent}>
                        <span className={classes.boldInfo}>Downloaded:</span>{" "}
                        <span className={classes.contentInfo}>
                          {el.downloaded ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className={classes.sourceContent}>
                        <span className={classes.boldInfo}>Seeds:</span>{" "}
                        <span className={classes.contentInfo}>{el.seeds}</span>
                      </div>
                      <div className={classes.sourceContent}>
                        <span className={classes.boldInfo}>Peers:</span>{" "}
                        <span className={classes.contentInfo}>{el.peers}</span>
                      </div>
                    </div>
                    <div className={classes.sourceSection}>
                      <div className={classes.sourceContent}>
                        <Button
                          variant="outlined"
                          className={classes.sourceWatch}
                          onClick={() =>
                            history.push({
                              pathname: `/Watch`,
                              state: { movie: torrent, torrent: el },
                            })
                          }
                        >
                          WATCH
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : undefined}
        </div>
      )}
    </div>
  );
};

const RenderTorrents = (props) => {
  const [showMore, setShowMore] = useState(false);
  const [showMoreBis, setShowMoreBis] = useState(false);

  const history = useHistory();
  const ShowMore = withStyles(showMoreStyles)(RenderShowMore);
  const {
    classes,
    isRandom,
    randomTorrents,
    randomCategories,
    torrents,
  } = props;

  return (
    <div>
      <div className={classes.torrentContainer}>
        {isRandom ? (
          <div>
            <TorrentSlider
              torrents={torrents}
              isRandom={isRandom}
              setShowMore={setShowMore}
              setShowMoreBis={setShowMoreBis}
              category={randomCategories[0]}
            />
            <ShowMore
              history={history}
              showMore={showMore}
              setShowMore={setShowMore}
            />
            <TorrentSlider
              isRandom={isRandom}
              torrents={randomTorrents}
              setShowMore={setShowMoreBis}
              setShowMoreBis={setShowMore}
              category={randomCategories[1]}
            />
            <ShowMore
              history={history}
              showMore={showMoreBis}
              setShowMore={setShowMoreBis}
            />
          </div>
        ) : torrents ? (
          Object.keys(torrents).map((key, index) => {
            return (
              <div key={key}>
                <TorrentSlider
                  torrents={torrents[key]}
                  isRandom={isRandom}
                  setShowMore={setShowMore}
                />
                <ShowMore
                  history={history}
                  showMore={showMore}
                  setShowMore={setShowMore}
                />
              </div>
            );
          })
        ) : undefined}
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

  const handleAppendCategories = (categoriesToAdd) => {
    setSelectedCategories(categoriesToAdd);
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
            closeMenuOnSelect={false}
            isMulti
            filterOption={createFilter({
              ignoreAccents: false,
            })}
            isSearchable={true}
            options={categories}
            key={"changeCategories"}
            onChange={handleAppendCategories}
            placeholder={"CATEGORIES: ALL"}
          />
        </div>
        <div className={classes.selectDivider}>
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
            closeMenuOnSelect={false}
            isMulti
            filterOption={createFilter({
              ignoreAccents: false,
            })}
            isSearchable={true}
            options={languages}
            key={"changeLanguage"}
            onChange={handleAppendLanguage}
            placeholder={"LANGUAGES: ALL"}
          />
        </div>
        <div className={classes.selectDivider}>
          <Select
            value={selectedSubs}
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
            closeMenuOnSelect={false}
            isMulti
            filterOption={createFilter({
              ignoreAccents: false,
            })}
            isSearchable={true}
            options={subtitles}
            key={"changeSubs"}
            onChange={handleAppendSubs}
            placeholder={"SUBTITLES: ALL"}
          />
        </div>
      </div>
      <div className={classes.selectContainer}>
        <div className={classes.rangeContainer}>
          Year: {selectedYear[0] + " - " + selectedYear[1]}
          <Range
            className={classes.fullWidth}
            trackStyle={[{ backgroundColor: "#9A1300" }]}
            railStyle={{ backgroundColor: "#373737" }}
            handleStyle={[
              {
                backgroundColor: "#FBBA72",
                border: 0,
              },
              {
                backgroundColor: "#FBBA72",
                border: 0,
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
            railStyle={{ backgroundColor: "#373737" }}
            handleStyle={[
              {
                backgroundColor: "#FBBA72",
                border: 0,
              },
              {
                backgroundColor: "#FBBA72",
                border: 0,
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
            style={{
              color: "#FBBA72",
              border: "1px solid #FBBA72",
            }}
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
  const [width, setWidth] = useState(0);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [torrents, setTorrents] = useState([]);
  const [settings, setSettings] = useState({});
  const [isRandom, setIsRandom] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [randomCategories, setRandomCategories] = useState([]);
  const [randomTorrents, setRandomTorrents] = useState([]);
  const Torrents = withStyles(TorrentContainerStyles)(RenderTorrents);
  const SearchBar = withStyles(SearchBarStyles)(RenderSearchBar);

  const getQueryTorrents = async (query, loadMore) => {
    setIsRandom(false);
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
          let torPerRows = 0;
          let torrents = {};
          if (width <= 600) {
            torPerRows = 1;
          } else if (width <= 1024) {
            torPerRows = 3;
          } else if (width <= 1200) {
            torPerRows = 4;
          } else if (width <= 1400) {
            torPerRows = 5;
          } else {
            torPerRows = 7;
          }

          let rowIndex = 1;
          let i = 1;
          torrents = res.torrents.torrents.reduce((r, o) => {
            let k = `row${rowIndex}`;
            if (i === torPerRows) {
              i = 0;
              rowIndex++;
            }
            if (r[k] || (r[k] = [])) r[k].push(o);
            i++;
            return r;
          }, {});

          setTorrents(torrents);
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
          if (res.torrents.torrents && res.torrents.randomTorrents) {
            setTorrents(res.torrents.torrents);
            setRandomTorrents(res.torrents.randomTorrents);
            setRandomCategories(res.torrents.categories);
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
    setIsRandom(true);
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

  const updateWindowDimensions = () => {
    setWidth(window.innerWidth);
  };

  const RenderLoadMore = () => {
    if (
      !isRandom &&
      torrents.torrents &&
      torrents.torrents.length > limit - 1
    ) {
      return (
        <Button
          style={{ marginTop: 20, marginBottom: 20 }}
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
          LOAD MORE
        </Button>
      );
    } else if (
      isRandom &&
      torrents.torrents &&
      torrents.torrents.length > limit - 1
    ) {
      return (
        <Button
          style={{ marginTop: 20, marginBottom: 20 }}
          variant="outlined"
          color="secondary"
          type="submit"
          onClick={() => {
            getRandomTorrents(true);
          }}
        >
          GIMME MORE RANDOM MOVIES
        </Button>
      );
    } else {
      return <></>;
    }
  };

  useEffect(() => {
    ref.current = true;
    updateWindowDimensions();
    window.addEventListener("resize", updateWindowDimensions);
    getRandomTorrents();
    return () => {
      ref.current = false;
      window.removeEventListener("resize", updateWindowDimensions);

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
      {torrents ? (
        <Torrents
          torrents={torrents}
          randomTorrents={randomTorrents}
          randomCategories={randomCategories}
          isRandom={isRandom}
        />
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
      <div style={{ textAlign: "center", padding: 30 }}>
        Hypertube made by cvannica, eozimek and mmany.
      </div>
    </div>
  );
};

export default withStyles(HomeStyles)(Home);
