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

const getMovieList = async (url) => {
  return axios
    .get(url)
    .then((res) => {
      let $ = cheerio.load(res.data);
      let movies = $("tbody > tr");
      movies.map((el) => {
        torrent9Infos.movies.push({
          source: "torrent9",
          id: getTitle(
            movies[el].children[0].next.children[1].next.children[0].data
          ),
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
              format: getFormat(
                movies[el].children[0].next.children[1].next.children[0].data
              ),
            },
          ],
        });
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
    "https://www.torrent9.ac/torrents/films/4400"
  );
  console.log(
    torrent9Infos.number_of_pages,
    "pages found, starting scrapping..."
  );
  for (let i = 0; i < torrent9Infos.number_of_pages; i++) {
    await getMovieList(
      "https://www.torrent9.ac/torrents/films/" + (50 * i + 1).toString()
    );
    if (i && i % 15 === 0) {
      console.log(i, "pages done, waiting for 2s to avoid being blacklisted");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  console.log(torrent9Infos.movies.length, "movies scrapped on Torrent9!");
  console.log("Starting purify list to avoid duplicates");
  await purifyAllTorrents();
  console.timeEnd("torrent9Scraping");
  return torrent9Infos;
};

module.exports = { fetchAllTorrents };
