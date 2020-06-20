const fetch = require("node-fetch");
const e = require("express");

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
      if (res.status === "ok") {
        if (res.data.movies) {
          res.data.movies.map((el) => {
            let infos = {
              source: "yts",
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
                  format: getFormat(ele.type),
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

const fetchAllTorrents = async () => {
  console.time("ytsScraping");
  const url = "https://yts.mx/api/v2/list_movies.json?limit=50";
  const fetchedAt = Date.now();
  console.log("Initializing YTS scrapping at:", fetchedAt);
  ytsInfos.fetched_at = fetchedAt;
  ytsInfos.number_of_pages = await getTotalPages(url);
  console.log(ytsInfos.number_of_pages, "pages found, starting scrapping...");
  for (let i = 0; i < ytsInfos.number_of_pages; i++) {
    await getMovieList(i, url);
    if (i && i % 15 === 0) {
      console.log(i, "pages done, waiting for 1.5s to avoid being blacklisted");
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  console.log(ytsInfos.movies.length, "movies scrapped on YTS!");
  console.timeEnd("ytsScraping");
  return ytsInfos;
};

module.exports = { fetchAllTorrents };
