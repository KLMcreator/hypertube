const fetch = require("node-fetch");
const moment = require("moment");
const chalk = require("chalk");
const cheerio = require("cheerio");
const got = require("got");

let ytsInfos = {
  fetched_at: 0,
  number_of_pages: 0,
  movies_before_purify: 0,
  movies_after_purify: 0,
  movies: [],
};
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
          let isDuplicate = ytsInfos.movies.findIndex(
            (dupli) => dupli.title === el.title
          );
          if (isDuplicate >= 0) {
            if (el.torrents) {
              el.torrents.map((ele) => {
                ytsInfos.movies[isDuplicate].torrents.push({
                  source: "yts",
                  duration: el.runtime ? el.runtime : null,
                  language: el.language,
                  subtitles: [],
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
          } else {
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
              summary: el.summary ? [el.summary] : null,
              duration: el.runtime ? el.runtime : null,
              imdb_code: el.imdb_code ? el.imdb_code : null,
              yt_trailer: el.yt_trailer_code
                ? "https://www.youtube.com/watch?v=" + el.yt_trailer_code
                : null,
              categories: el.genres,
              languages: [el.language],
              subtitles: [],
              torrents: [],
            };
            if (el.torrents) {
              el.torrents.map((ele) => {
                infos.torrents.push({
                  source: "yts",
                  duration: el.runtime ? el.runtime : null,
                  language: el.language,
                  subtitles: [],
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
          }
        });
      }
    })
    .catch((err) => console.log(chalk.red("Error while getting pages:", err)));
};

const getSubs = async (url, i) => {
  return got(url)
    .then((res) => cheerio.load(res.body))
    .then(($) => {
      let subs = [];
      $("tbody tr")
        .map((i, el) => {
          const $el = $(el);
          if ($el.find(".rating-cell").text() >= 0) {
            let rating = $el.find(".rating-cell").text();
            let language =
              $el
                .find(".flag-cell .sub-lang")
                .text()
                .toLowerCase()
                .charAt(0)
                .toUpperCase() +
              $el.find(".flag-cell .sub-lang").text().slice(1);
            let url =
              $el
                .find(".download-cell a")
                .attr("href")
                .replace("subtitles/", "subtitle/") + ".zip";
            let isDuplicate = subs.findIndex(
              (dupli) => dupli.language === language
            );
            if (isDuplicate >= 0) {
              if (rating > subs[isDuplicate]) {
                subs[isDuplicate].url = url;
              }
            } else {
              subs.push({
                rating: rating,
                language: language,
                url: url,
              });
            }
          }
        })
        .get();
      if (subs.length) {
        subs.map((el) => {
          ytsInfos.movies[i].subtitles.push({
            language: el.language,
            url: " https://www.yifysubtitles.com" + el.url,
          });
        });
      }
    })
    .catch((err) => console.log(chalk.red("Error while getting subs:", err)));
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
    if (i && i % 75 === 0) {
      console.log(
        i,
        "pages done on",
        chalk.green("YTS,"),
        "waiting for 2s to avoid being blacklisted"
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  console.log(ytsInfos.movies.length, "movies scrapped on", chalk.green("YTS"));
  console.log(
    "Now trying to getting subs for",
    ytsInfos.movies.length,
    "movies on",
    chalk.green("YTS")
  );
  for (let i = 0; i < ytsInfos.movies.length; i++) {
    await getSubs(
      "https://www.yifysubtitles.com/movie-imdb/" +
        ytsInfos.movies[i].imdb_code,
      i
    );
    if (i && i % 25 === 0) {
      console.log(
        i,
        "movies done on",
        chalk.green("YTS (subs),"),
        "waiting for 1.5s to avoid being blacklisted"
      );
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  console.log("movies and subs scrapped scrapped!", chalk.green("YTS"));
  console.timeEnd("ytsScraping");
  return ytsInfos;
};

module.exports = { fetchAllTorrents };
