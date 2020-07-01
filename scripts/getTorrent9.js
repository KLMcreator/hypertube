const cheerio = require("cheerio");
const axios = require("axios");
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
  const format = ["bluray", "dvdrip", "hdlight", "webrip"];
  let type = "Undefined";

  format.map((el) => {
    if (title.toLowerCase().indexOf(el) > -1)
      type = el.charAt(0).toUpperCase() + el.slice(1);
  });
  return type;
};

const getQuality = (title) => {
  const quality = ["720p", "1080p"];
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

const getSubtitles = (title) => {
  let type = "";

  if (title.toLowerCase().indexOf("vostfr") > -1) type = "VOSTFR";
  return type;
};

const getMoreInfos = async (url, i, j) => {
  return axios
    .get(url)
    .then((res) => {
      let $ = cheerio.load(res.data);
      let cover = $("div.movie-detail > div > div > div > img");
      let buttons = $("div.download-btn > div");
      let categories = $("ul > li:contains('Sous-Catégories')");
      let summ = $("div.movie-information > p");
      torrent9Infos.movies[
        i
      ].categories = categories[0].parent.children[5].children[0].attribs.href
        .replace("/torrents/", "")
        .split("-");
      if (torrent9Infos.movies[i].categories.length) {
        torrent9Infos.movies[i].categories = torrent9Infos.movies[
          i
        ].categories.map((el) => el.charAt(0).toUpperCase() + el.slice(1));
      }
      summ[1].children[0]
        ? torrent9Infos.movies[i].summary.push(summ[1].children[0].data)
        : summ[0].children[0]
        ? torrent9Infos.movies[i].summary.push(summ[0].children[0].data)
        : undefined;
      torrent9Infos.movies[i].cover_url =
        "https://www.torrent9.ac" + cover[0].attribs.src;
      torrent9Infos.movies[i].large_image =
        "https://www.torrent9.ac" + cover[0].attribs.src;
      torrent9Infos.movies[i].torrents[j].magnet =
        buttons[1].children[0].attribs.href;
      torrent9Infos.movies[i].torrents[j].torrent =
        "https://www.torrent9.ac" + buttons[0].children[0].attribs.href;
    })
    .catch((err) => console.log(chalk.red("Error while getting pages:", err)));
};

const getMovieList = async (url) => {
  return axios
    .get(url)
    .then((res) => {
      let $ = cheerio.load(res.data);
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
          torrent9Infos.movies[isDuplicate].torrents.push({
            source: "torrent9",
            languages: language,
            subtitles: subtitles ? [subtitles] : [],
            quality: quality,
            seeds: parseInt(
              movies[el].children[5].children[0].children[0].data.trim(),
              10
            ),
            peers: parseInt(movies[el].children[7].children[0].data.trim(), 10),
            url:
              "https://www.torrent9.ac" +
              movies[el].children[0].next.children[1].next.attribs.href,
            magnet: null,
            torrent: null,
            size: movies[el].children[3].children[0].data.toUpperCase(),
            format: format,
          });
        } else {
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
            imdb_code: null,
            yt_trailer: null,
            categories: [],
            languages: [language],
            subtitles: subtitles ? [subtitles] : [],
            torrents: [
              {
                source: "torrent9",
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
      });
    })
    .catch((err) => console.log(chalk.red("Error while getting pages:", err)));
};

const getTotalPages = async (url) => {
  return axios
    .get(url)
    .then((res) => {
      let $ = cheerio.load(res.data);
      let total = $(".pagination li").eq(-2).text();
      total = parseInt(
        total.substring(total.indexOf("-") + 1).slice(0, -1),
        10
      );
      if ($(".pagination li").eq(-1).text() === "Suivant â–º")
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
    .catch((err) => console.log(chalk.red("Error while getting pages:", err)));
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
    "https://www.torrent9.ac/torrents/films/4400"
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
    if (i && i % 30 === 0) {
      console.log(
        i,
        "pages done on",
        chalk.green("Torrent9,"),
        " waiting for 1.5s to avoid being blacklisted"
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
    "Starting purify list to avoid duplicates on",
    chalk.green("Torrent9")
  );
  console.log(
    torrent9Infos.movies.length,
    "movies after purify on",
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
    if (i && i % 30 === 0) {
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
