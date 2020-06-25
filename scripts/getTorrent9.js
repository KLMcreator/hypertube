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

const getCoverUrl = (url) => {
  return new Promise(function (resolve, reject) {
    return axios
      .get(url)
      .then((res) => {
        let $ = cheerio.load(res.data);
        let cover = $("div.movie-detail > div > div > div > img");
        resolve(cover[0].attribs.src);
      })
      .catch((err) =>
        console.log(chalk.red("Error while getting cover url:", err))
      );
  });
};

const purifyAllTorrents = async () => {
  let i = 0;
  while (i < torrent9Infos.movies.length) {
    let j = i + 1;
    while (j < torrent9Infos.movies.length) {
      let k = 0;
      if (torrent9Infos.movies[i].title === torrent9Infos.movies[j].title) {
        while (k < torrent9Infos.movies[j].torrents.length) {
          torrent9Infos.movies[i].torrents.push(
            torrent9Infos.movies[j].torrents[k]
          );
          k++;
        }
        torrent9Infos.movies.splice(j, 1);
        i = -1;
        break;
      } else {
        j++;
      }
    }
    i++;
  }
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
      torrent9Infos.movies[i].summary = summ[1].children[0]
        ? summ[1].children[0].data
        : summ[0].children[0]
        ? summ[0].children[0].data
        : null;
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
        torrent9Infos.movies.push({
          yts_id: null,
          torrent9_id: getTitle(
            movies[el].children[0].next.children[1].next.children[0].data
          ),
          title: getTitle(
            movies[el].children[0].next.children[1].next.children[0].data
          ),
          production_year: getProductionYear(
            movies[el].children[0].next.children[1].next.children[0].data
          ),
          rating: null,
          yts_url: null,
          torrent9_url:
            "https://www.torrent9.ac" +
            movies[el].children[0].next.children[1].next.attribs.href,
          cover_url: null,
          large_image: null,
          summary: null,
          imdb_code: null,
          yt_trailer: null,
          categories: [],
          languages: [
            getLanguage(
              movies[el].children[0].next.children[1].next.children[0].data
            ),
          ],
          torrents: [
            {
              source: "torrent9",
              languages: getLanguage(
                movies[el].children[0].next.children[1].next.children[0].data
              ),

              quality: getQuality(
                movies[el].children[0].next.children[1].next.children[0].data
              ),
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
              format: getFormat(
                movies[el].children[0].next.children[1].next.children[0].data
              ),
            },
          ],
        });
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
    if (i && i % 15 === 0) {
      console.log(
        i,
        "pages done on",
        chalk.green("Torrent9,"),
        " waiting for 2s to avoid being blacklisted"
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
  await purifyAllTorrents();
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
    if (i && i % 13 === 0) {
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
