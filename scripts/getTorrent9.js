const cheerio = require("cheerio");
const axios = require("axios");

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
  let type = "Undefined";

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

const getMovieList = async (url) => {
  return axios
    .get(url)
    .then((res) => {
      let $ = cheerio.load(res.data);
      let movies = $("tbody > tr");
      movies.map((el) => {
        if (movies[el].children[0].next.children[1].next.attribs.href) {
          let infos = {
            id: movies[el].children[0].next.children[1].next.children[0].data,
            title: getTitle(
              movies[el].children[0].next.children[1].next.children[0].data
            ),
            production_year: getProductionYear(
              movies[el].children[0].next.children[1].next.children[0].data
            ),
            rating: null,
            url:
              "https://www.torrent9.ac" +
              movies[el].children[0].next.children[1].next.attribs.href,
            language: getLanguage(
              movies[el].children[0].next.children[1].next.children[0].data
            ),
            cover_url: null,
            available: null,
            format: getFormat(
              movies[el].children[0].next.children[1].next.children[0].data
            ),
            torrents: [
              {
                source: "torrent9",
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
                size: movies[el].children[3].children[0].data.toUpperCase(),
              },
            ],
          };
          torrent9Infos.movies.push(infos);
        }
      });
    })
    .catch((err) => console.log("Error while getting pages:", err));
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
        console.log("There's more than", total, "movies now");
      else console.log(total, "movies found");
      return Math.ceil(total / 50);
    })
    .catch((err) => console.log("Error while getting pages:", err));
};

const fetchAllTorrents = async () => {
  console.time("torrent9Scraping");
  const fetchedAt = Date.now();
  console.log("Initializing Torrent9 scrapping at:", fetchedAt);
  torrent9Infos.fetched_at = fetchedAt;
  torrent9Infos.number_of_pages = await getTotalPages(
    "https://www.torrent9.ac/torrents/films/4425"
  );
  console.log(
    torrent9Infos.number_of_pages,
    "pages found, starting scrapping..."
  );
  // change ternary for `torrent9Infos.number_of_pages` for production
  const limit =
    torrent9Infos.number_of_pages > 5 ? 1 : torrent9Infos.number_of_pages;
  for (let i = 0; i < limit; i++) {
    await getMovieList(
      "https://www.torrent9.ac/torrents/films/" + 50 * i + 1,
      i
    );
  }
  console.log(torrent9Infos.movies.length, "movies scrapped on Torrent9!");
  console.timeEnd("torrent9Scraping");
  return torrent9Infos;
};

module.exports = { fetchAllTorrents };
