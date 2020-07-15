const cheerio = require("cheerio");
const got = require("got");
const moment = require("moment");
const chalk = require("chalk");

let torrent9Infos = { fetched_at: 0, number_of_pages: 0, movies: [] };

const getTitle = (title) => {
  const purify = [
    "bluray",
    "dvdrip",
    "hdlight",
    "webrip",
    "720p",
    "1080p",
    "french",
    "english",
    "german",
    "japanese",
    "spanish",
    "russian",
    "vostfr",
    "MULTi",
    "4K",
    "ULTRA HD",
    "x265",
    "dvdscr",
    "(trilogie)",
    "(integrale)",
    "truefrench",
    "1CD",
    "2CD",
    "3CD",
    "4CD",
    "5CD",
  ];

  purify.map((el) => {
    if (title.toLowerCase().indexOf(el) > -1) {
      title = title
        .replace(new RegExp(el, "i"), "")
        .replace(/\s+/g, " ")
        .split(" ")
        .slice(0, -1)
        .join(" ");
    }
  });
  return title;
};

const getFormat = (title) => {
  const format = [
    "bluray",
    "dvdrip",
    "dvdscr",
    "hdlight",
    "webrip",
    "truefrench",
  ];
  let type = "Undefined";

  format.map((el) => {
    if (title.toLowerCase().indexOf(el) > -1)
      type = el.charAt(0).toUpperCase() + el.slice(1);
  });
  return type;
};

const getQuality = (title) => {
  const quality = ["720p", "1080p", "4K", "ULTRA HD"];
  let type = "Default";

  quality.map((el) => {
    if (title.toLowerCase().indexOf(el) > -1)
      type = el.charAt(0).toUpperCase() + el.slice(1);
  });
  return type;
};

const getProductionYear = (title) => {
  return parseInt(title.split(" ").splice(-1)[0], 10);
};

const getLanguage = (title) => {
  const language = [
    "french",
    "english",
    "german",
    "japanese",
    "spanish",
    "russian",
  ];
  let type = "English";

  language.map((el) => {
    if (title.toLowerCase().indexOf(el) > -1)
      type = el.charAt(0).toUpperCase() + el.slice(1);
  });
  return type;
};

const getCategoriesTranslated = (categories) => {
  if (categories === "action") return "Action";
  if (categories === "animation") return "Animation";
  if (categories === "aventure") return "Adventure";
  if (categories === "biopic") return "Biopic";
  if (categories === "comedie" || categories === "comédie") return "Comedy";
  if (categories === "documentaire") return "Documentary";
  if (
    categories === "drama" ||
    categories === "drame" ||
    categories === "comédie dramatique" ||
    categories === "dramatique" ||
    categories === "romance"
  )
    return "Drama";
  if (
    categories === "epouvante-horreur" ||
    categories === "epouvante" ||
    categories === "horreur"
  )
    return "Horror";
  if (categories === "historique") return "Historical";
  if (categories === "thriller") return "Thriller";
  if (categories === "policier") return "Crime";
  if (
    categories === "fantastique" ||
    categories === "science fiction" ||
    categories === "science-fiction" ||
    categories === "science" ||
    categories === "fiction"
  )
    return "Sci-Fi";
  if (categories === "music" || categories === "musicale") return "Music";
  if (categories === "spectacle" || categories === "spectacles") return "Show";
  if (categories === "western") return "Western";
  return categories;
};

const getSubtitles = (title) => {
  let type = "";

  if (title.toLowerCase().indexOf("vostfr") > -1)
    type = { language: "French", url: false };
  return type;
};

const getMoreInfos = async (url, i, j) => {
  return got(url, {
    retry: {
      limit: 0,
    },
  })
    .then((res) => cheerio.load(res.body))
    .then(($) => {
      let cover = $("div.movie-detail > div > div > div > img");
      let buttons = $("div.download-btn > div");
      //   Sous-Catégories
      let categories = $("ul > li:contains('Sous-Catégories')");
      let summ = $("div.movie-information > p");
      if (categories) {
        torrent9Infos.movies[
          i
        ].categories = categories[0].parent.children[5].children[0].attribs.href
          .replace("/torrents/", "")
          .split("-");
      }
      if (
        torrent9Infos.movies[i].categories &&
        torrent9Infos.movies[i].categories.length
      ) {
        torrent9Infos.movies[i].categories = torrent9Infos.movies[
          i
        ].categories.map((el) => getCategoriesTranslated(el.toLowerCase()));
      }
      summ[1].children[0] && !torrent9Infos.movies[i].summary.length
        ? torrent9Infos.movies[i].summary.push(summ[1].children[0].data)
        : summ[0].children[0] && !torrent9Infos.movies[i].summary.length
        ? torrent9Infos.movies[i].summary.push(summ[0].children[0].data)
        : undefined;
      torrent9Infos.movies[i].cover_url =
        "https://www.torrent9.ac" + cover[0].attribs.src;
      torrent9Infos.movies[i].large_image =
        "https://www.torrent9.ac" + cover[0].attribs.src;
      torrent9Infos.movies[i].torrents[j].magnet =
        buttons[1].children[0].attribs.href;
      torrent9Infos.movies[i].torrents[
        j
      ].hash = buttons[0].children[0].attribs.href
        .split("urn:btih:")
        .pop()
        .split(";tr=")[0];
      torrent9Infos.movies[i].torrents[j].torrent =
        "https://www.torrent9.ac" + buttons[0].children[0].attribs.href;
    })
    .catch((err) =>
      console.log(chalk.red("Torrent9: Error while getting pages:", err))
    );
};

const getMovieList = async (url) => {
  return got(url, {
    retry: {
      limit: 0,
    },
  })
    .then((res) => cheerio.load(res.body))
    .then(($) => {
      let movies = $("tbody > tr");
      movies.map((el) => {
        let title = getTitle(
          movies[el].children[0].next.children[1].next.children[0].data
        );
        let language = getLanguage(
          movies[el].children[0].next.children[1].next.children[0].data
        );
        let year = getProductionYear(
          movies[el].children[0].next.children[1].next.children[0].data
        );
        let subtitles = getSubtitles(
          movies[el].children[0].next.children[1].next.children[0].data
        );
        let quality = getQuality(
          movies[el].children[0].next.children[1].next.children[0].data
        );
        let format = getFormat(
          movies[el].children[0].next.children[1].next.children[0].data
        );
        let isDuplicate = torrent9Infos.movies.findIndex(
          (dupli) => dupli.title === title
        );
        if (isDuplicate >= 0) {
          if (
            parseInt(
              movies[el].children[5].children[0].children[0].data.trim(),
              10
            ) > 0
          ) {
            torrent9Infos.movies[isDuplicate].torrents.push({
              id: "t9_" + torrent9Infos.movies[isDuplicate].torrents.length,
              source: "torrent9",
              downloaded: false,
              path: null,
              downloaded_at: null,
              lastviewed_at: null,
              delete_at: null,
              hash: null,
              duration: null,
              languages: language,
              subtitles: subtitles ? [subtitles] : [],
              quality: quality,
              seeds: parseInt(
                movies[el].children[5].children[0].children[0].data.trim(),
                10
              ),
              peers: parseInt(
                movies[el].children[7].children[0].data.trim(),
                10
              ),
              url:
                "https://www.torrent9.ac" +
                movies[el].children[0].next.children[1].next.attribs.href,
              magnet: null,
              torrent: null,
              size: movies[el].children[3].children[0].data.toUpperCase(),
              format: format,
            });
          }
        } else {
          if (
            parseInt(
              movies[el].children[5].children[0].children[0].data.trim(),
              10
            ) > 0
          ) {
            torrent9Infos.movies.push({
              yts_id: null,
              torrent9_id: title,
              title: title,
              production_year: year,
              rating: null,
              yts_url: null,
              torrent9_url:
                "https://www.torrent9.ac" +
                movies[el].children[0].next.children[1].next.attribs.href,
              cover_url: null,
              large_image: null,
              summary: [],
              duration: null,
              imdb_code: null,
              yt_trailer: null,
              categories: [],
              languages: [language],
              subtitles: subtitles ? [subtitles] : [],
              torrents: [
                {
                  id: "t9_0",
                  source: "torrent9",
                  downloaded: false,
                  path: null,
                  downloaded_at: null,
                  lastviewed_at: null,
                  delete_at: null,
                  hash: null,
                  duration: null,
                  languages: language,
                  subtitles: subtitles ? [subtitles] : [],
                  quality: quality,
                  seeds: parseInt(
                    movies[el].children[5].children[0].children[0].data.trim(),
                    10
                  ),
                  peers: parseInt(
                    movies[el].children[7].children[0].data.trim(),
                    10
                  ),
                  url:
                    "https://www.torrent9.ac" +
                    movies[el].children[0].next.children[1].next.attribs.href,
                  magnet: null,
                  torrent: null,
                  size: movies[el].children[3].children[0].data.toUpperCase(),
                  format: format,
                },
              ],
            });
          }
        }
      });
    })
    .catch((err) =>
      console.log(chalk.red("Torrent9: Error while getting pages:", err))
    );
};

const getTotalPages = async (url) => {
  return got(url, {
    retry: {
      limit: 0,
    },
  })
    .then((res) => cheerio.load(res.body))
    .then(($) => {
      let total = $(".pagination li").eq(-2).text();
      total = parseInt(
        total.substring(total.indexOf("-") + 1).slice(0, -1),
        10
      );
      //   Suivant ►
      if ($(".pagination li").eq(-1).text() === "Suivant ►")
        console.log(
          "There's more than",
          total,
          "movies now on",
          chalk.green("Torrent9")
        );
      else
        console.log(
          chalk.yellow(total),
          "movies found on",
          chalk.green("Torrent9")
        );
      return Math.ceil(total / 50);
    })
    .catch((err) =>
      console.log(chalk.red("Torrent9: Error while getting pages:", err))
    );
};

const fetchAllTorrents = async () => {
  console.time("torrent9Scraping");
  const fetchedAt = Date.now();
  console.log(
    "Initializing ",
    chalk.green("Torrent9"),
    "scrapping at:",
    chalk.yellow(moment(fetchedAt).format())
  );
  torrent9Infos.fetched_at = fetchedAt;
  torrent9Infos.number_of_pages = await getTotalPages(
    "https://www.torrent9.ac/torrents/films/4600"
  );
  console.log(
    torrent9Infos.number_of_pages,
    "pages found on",
    chalk.green("Torrent9,"),
    "starting the scrape machine..."
  );
  for (let i = 0; i < torrent9Infos.number_of_pages; i++) {
    await getMovieList(
      "https://www.torrent9.ac/torrents/films/" + (50 * i + 1).toString()
    );
    if (i && i % 25 === 0) {
      console.log(
        i,
        "pages done on",
        chalk.green("Torrent9,"),
        " waiting for 1.5s to avoid being blacklisted. Total movies:",
        torrent9Infos.movies.length
      );
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  console.log(
    torrent9Infos.movies.length,
    "movies scrapped on",
    chalk.green("Torrent9")
  );
  console.log(
    "Getting more infos for",
    torrent9Infos.movies.length,
    "movies on",
    chalk.green("Torrent9")
  );
  for (let i = 0; i < torrent9Infos.movies.length; i++) {
    for (let j = 0; j < torrent9Infos.movies[i].torrents.length; j++) {
      await getMoreInfos(torrent9Infos.movies[i].torrents[j].url, i, j);
    }
    if (i && i % 60 === 0) {
      console.log(
        i,
        "movies done on",
        chalk.green("Torrent9,"),
        "waiting for 1.5s to avoid being blacklisted"
      );
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  console.timeEnd("torrent9Scraping");
  return torrent9Infos;
};

module.exports = { fetchAllTorrents };
