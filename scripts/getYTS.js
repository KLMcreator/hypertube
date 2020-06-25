const fetch = require("node-fetch");
const moment = require("moment");
const chalk = require("chalk");

let ytsInfos = { fetched_at: 0, number_of_pages: 0, movies: [] };
let trackers = [
  "udp://open.demonii.com:1337",
  "udp://tracker.istole.it:80",
  "http://tracker.yify-torrents.com/announce",
  "udp://tracker.publicbt.com:80",
  "udp://tracker.openbittorrent.com:80",
  "udp://tracker.coppersurfer.tk:6969",
  "udp://exodus.desync.com:6969",
  "http://exodus.desync.com:6969/announce",
];

const getTotalPages = async (url) => {
  return fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(
        chalk.yellow(res.data.movie_count),
        "movies found on",
        chalk.green("YTS")
      );
      return Math.ceil(res.data.movie_count / 50);
    })
    .catch((err) => console.log(chalk.red("Error while getting pages:", err)));
};

const getFormat = (title) => {
  if (title.toLowerCase().indexOf("bluray") > -1) {
    return "Bluray";
  } else if (title.toLowerCase().indexOf("web") > -1) {
    return "Webrip";
  } else {
    return "Undefined";
  }
};

const getMovieList = async (page, url) => {
  return fetch(url + "&page=" + page, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.data.movies) {
        res.data.movies.map((el) => {
          let infos = {
            yts_id: el.id,
            torrent9_id: null,
            title: el.title,
            production_year: el.year,
            rating: el.rating,
            yts_url: el.url,
            torrent9_url: null,
            cover_url: el.medium_cover_image,
            large_image: el.large_cover_image,
            summary: el.summary ? el.summary : null,
            imdb_code: el.imdb_code ? el.imdb_code : null,
            yt_trailer: el.yt_trailer_code
              ? "https://www.youtube.com/watch?v=" + el.yt_trailer_code
              : null,
            categories: el.genres,
            languages: [el.language],
            torrents: [],
          };
          if (el.torrents) {
            el.torrents.map((ele) => {
              infos.torrents.push({
                source: "yts",
                language: el.language,
                quality: ele.quality,
                seeds: ele.seeds,
                peers: ele.peers,
                url: el.url,
                magnet:
                  "magnet:?xt=urn:btih:" +
                  ele.hash +
                  "&dn=" +
                  el.title_long +
                  "&tr=" +
                  trackers.join("&tr="),
                torrent: ele.url,
                size: ele.size,
                format: getFormat(ele.type),
              });
            });
          }
          ytsInfos.movies.push(infos);
        });
      }
    })
    .catch((err) => console.log(chalk.red("Error while getting pages:", err)));
};

const fetchAllTorrents = async () => {
  console.time("ytsScraping");
  const url = "https://yts.mx/api/v2/list_movies.json?limit=50";
  const fetchedAt = Date.now();
  console.log(
    "Initializing",
    chalk.green("YTS"),
    "scrapping at:",
    chalk.yellow(moment(fetchedAt).format())
  );
  ytsInfos.fetched_at = fetchedAt;
  ytsInfos.number_of_pages = await getTotalPages(url);

  console.log(
    ytsInfos.number_of_pages,
    "pages found on",
    chalk.green("YTS,"),
    "starting the scrape machine..."
  );
  for (let i = 0; i < ytsInfos.number_of_pages; i++) {
    await getMovieList(i, url);
    if (i && i % 15 === 0) {
      console.log(
        i,
        "pages done on",
        chalk.green("YTS,"),
        "waiting for 1.5s to avoid being blacklisted"
      );
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  console.log(ytsInfos.movies.length, "movies scrapped on", chalk.green("YTS"));
  console.timeEnd("ytsScraping");
  return ytsInfos;
};

module.exports = { fetchAllTorrents };
