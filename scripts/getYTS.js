const moment = require("moment");
const chalk = require("chalk");
const cheerio = require("cheerio");
const got = require("got");

let ytsInfos = {
  fetched_at: 0,
  number_of_pages: 0,
  movies: [],
};
let trackers = [
  "udp://glotorrents.pw:6969/announce",
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://torrent.gresille.org:80/announce",
  "udp://tracker.openbittorrent.com:80",
  "udp://tracker.coppersurfer.tk:6969",
  "udp://tracker.leechers-paradise.org:6969",
  "udp://p4p.arenabg.ch:1337",
  "udp://tracker.internetwarriors.net:1337",
];

const getTotalPages = async (url) => {
  return got(url, {
    retry: {
      limit: 1,
    },
    headers: { "Content-Type": "application/json" },
    responseType: "json",
    resolveBodyOnly: true,
  })
    .then((res) => {
      console.log(
        chalk.yellow(res.data.movie_count),
        "movies found on",
        chalk.green("YTS")
      );
      return Math.ceil(res.data.movie_count / 50);
    })
    .catch((err) =>
      console.log(chalk.red("YTS: Error while getting pages:", err))
    );
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

const getSubs = async (url) => {
  return got(url, {
    retry: {
      limit: 0,
    },
  })
    .then((res) => cheerio.load(res.body))
    .then(($) => {
      let subs = [];
      let finals = [];
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
      if (subs && subs.length) {
        subs.map((el) => {
          finals.push({
            language: el.language,
            url: " https://www.yifysubtitles.com" + el.url,
          });
        });
      }
      return finals && finals.length ? finals : [];
    })
    .catch(() => {});
};

const getMovieList = async (page, url) => {
  return got(url, {
    searchParams: { page: page, limit: 50 },
    retry: {
      limit: 0,
    },
    headers: { "Content-Type": "application/json" },
    responseType: "json",
    resolveBodyOnly: true,
  })
    .then(async (res) => {
      if (res.data.movies) {
        let i = 0;
        while (i < res.data.movies.length) {
          let isDuplicate = ytsInfos.movies.findIndex(
            (dupli) => dupli.title === res.data.movies[i].title
          );
          if (isDuplicate >= 0) {
            if (
              res.data.movies[i].torrents &&
              res.data.movies[i].torrents.length &&
              res.data.movies[i].torrents[0].seeds > 0
            ) {
              res.data.movies[i].torrents.map((ele) => {
                if (ele.seeds > 0) {
                  ytsInfos.movies[isDuplicate].torrents.push({
                    source: "yts",
                    duration: res.data.movies[i].runtime
                      ? res.data.movies[i].runtime
                      : null,
                    language: res.data.movies[i].language,
                    subtitles: [],
                    quality: ele.quality,
                    seeds: ele.seeds,
                    peers: ele.peers,
                    url: res.data.movies[i].url,
                    magnet:
                      "magnet:?xt=urn:btih:" +
                      ele.hash +
                      "&dn=" +
                      res.data.movies[i].title_long +
                      "&tr=" +
                      trackers.join("&tr="),
                    torrent: ele.url,
                    size: ele.size,
                    format: getFormat(ele.type),
                  });
                }
              });
            }
          } else if (
            (res.data.movies[i].year > 1980 ||
              (res.data.movies[i].year > 1950 &&
                parseInt(res.data.movies[i].rating) > 8 &&
                ytsInfos.movies.length < 5000)) &&
            res.data.movies[i].torrents &&
            res.data.movies[i].torrents.length &&
            res.data.movies[i].torrents[0].seeds > 0
          ) {
            let subs = [];
            if (
              res.data.movies[i].imdb_code &&
              ((res.data.movies[i].year > 2005 &&
                parseInt(res.data.movies[i].rating, 10) > 5) ||
                (res.data.movies[i].year > 1980 &&
                  parseInt(res.data.movies[i].rating, 10) > 8))
            ) {
              subs = await getSubs(
                "https://www.yifysubtitles.com/movie-imdb/" +
                  res.data.movies[i].imdb_code
              );
            }
            let infos = {
              yts_id: res.data.movies[i].id,
              torrent9_id: null,
              title: res.data.movies[i].title,
              production_year: res.data.movies[i].year,
              rating: parseFloat(res.data.movies[i].rating),
              yts_url: res.data.movies[i].url,
              torrent9_url: null,
              cover_url: res.data.movies[i].medium_cover_image,
              large_image: res.data.movies[i].large_cover_image,
              summary: res.data.movies[i].summary
                ? [res.data.movies[i].summary]
                : null,
              duration: res.data.movies[i].runtime
                ? res.data.movies[i].runtime
                : null,
              imdb_code: res.data.movies[i].imdb_code
                ? res.data.movies[i].imdb_code
                : null,
              yt_trailer: res.data.movies[i].yt_trailer_code
                ? "https://www.youtube.com/watch?v=" +
                  res.data.movies[i].yt_trailer_code
                : null,
              categories: res.data.movies[i].genres,
              languages: [res.data.movies[i].language],
              subtitles: subs && subs.length ? subs : [],
              torrents: [],
            };
            if (res.data.movies[i].torrents) {
              res.data.movies[i].torrents.map((ele) => {
                if (ele.seeds > 0) {
                  infos.torrents.push({
                    source: "yts",
                    hash: ele.hash,
                    duration: res.data.movies[i].runtime
                      ? res.data.movies[i].runtime
                      : null,
                    language: res.data.movies[i].language,
                    subtitles: [],
                    quality: ele.quality,
                    seeds: ele.seeds,
                    peers: ele.peers,
                    url: res.data.movies[i].url,
                    magnet:
                      "magnet:?xt=urn:btih:" +
                      ele.hash +
                      "&dn=" +
                      res.data.movies[i].title_long +
                      "&tr=" +
                      trackers.join("&tr="),
                    torrent: ele.url,
                    size: ele.size,
                    format: getFormat(ele.type),
                  });
                }
              });
            }
            if (infos.torrents.length) {
              ytsInfos.movies.push(infos);
            }
          }
          i++;
        }
      }
    })
    .catch((err) => {
      //   console.log(chalk.red("YTS: Error while getting pages:", err))
    });
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
    "starting the scrape machine... (getting movies and subs at the same time)."
  );
  for (let i = 0; i < ytsInfos.number_of_pages; i++) {
    await getMovieList(i, url);
    if (i && i % 10 === 0) {
      console.log(
        i,
        "pages done on",
        chalk.green("YTS,"),
        "waiting for 1.5s to avoid being blacklisted. Total movies:",
        ytsInfos.movies.length
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  console.log(
    ytsInfos.movies.length,
    "movies and subs scrapped scrapped!",
    chalk.green("YTS")
  );
  console.timeEnd("ytsScraping");
  return ytsInfos;
};

module.exports = { fetchAllTorrents };
