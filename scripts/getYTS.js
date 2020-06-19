const fetch = require("node-fetch");

let ytsInfos = { fetched_at: 0, number_of_pages: 0, movies: [] };

const getTotalPages = async (url) => {
  return fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "ok") {
        console.log(res.data.movie_count, "movies found");
        return Math.ceil(res.data.movie_count / 50);
      } else {
        throw new Error(
          "Error with status code, website might be down or your ip might be banned"
        );
      }
    })
    .catch((err) => console.log("Error while getting pages:", err));
};

const getMovieList = async (page, url) => {
  return fetch(url + "&page=" + page, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "ok") {
        if (res.data.movies) {
          res.data.movies.map((el) => {
            let infos = {
              id: el.id,
              title: el.title,
              production_year: el.year,
              rating: el.rating,
              url: el.url,
              language: el.language,
              cover_url: el.medium_cover_image,
              available: el.state,
              torrents: [],
            };
            if (el.torrents) {
              el.torrents.map((ele) => {
                infos.torrents.push({
                  source: "yts",
                  quality: ele.quality,
                  seeds: ele.seeds,
                  peers: ele.peers,
                  url: ele.url,
                  size: ele.size,
                });
              });
            }
            ytsInfos.movies.push(infos);
          });
        }
      } else {
        throw new Error(
          "Error with status code, website might be down or your ip might be banned"
        );
      }
    })
    .catch((err) => console.log("Error while getting pages:", err));
};

const fetchQueryTorrents = async (query) => {
  console.time("ytsScraping");
  const url =
    "https://yts.mx/api/v2/list_movies.json?query_term=" + query + "&limit=50";
  const fetchedAt = Date.now();
  console.log("Initializing YTS scrapping at:", fetchedAt);
  ytsInfos.fetched_at = fetchedAt;
  ytsInfos.number_of_pages = await getTotalPages(url);
  console.log(ytsInfos.number_of_pages, "pages found, starting scrapping...");
  // change ternary for `ytsInfos.number_of_pages` for production
  for (
    let i = 1;
    i <= ytsInfos.number_of_pages > 5 ? 5 : ytsInfos.number_of_pages;
    i++
  ) {
    await getMovieList(i, url);
  }
  console.log(ytsInfos);
  console.timeEnd("ytsScraping");
};

const fetchAllTorrents = async () => {
  console.time("ytsScraping");
  const url = "https://yts.mx/api/v2/list_movies.json?limit=50";
  const fetchedAt = Date.now();
  console.log("Initializing YTS scrapping at:", fetchedAt);
  ytsInfos.fetched_at = fetchedAt;
  ytsInfos.number_of_pages = await getTotalPages(url);
  console.log(ytsInfos.number_of_pages, "pages found, starting scrapping...");
  // change ternary for `ytsInfos.number_of_pages` for production
  const limit = ytsInfos.number_of_pages > 5 ? 1 : ytsInfos.number_of_pages;
  for (let i = 0; i < limit; i++) {
    await getMovieList(i, url);
  }
  console.log(ytsInfos.movies.length, "movies scrapped!");
  console.timeEnd("ytsScraping");
};

module.exports = { fetchAllTorrents, fetchQueryTorrents };
