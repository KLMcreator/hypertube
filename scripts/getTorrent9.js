const cheerio = require("cheerio");
const fetch = require("node-fetch");
const axios = require("axios");
const request = require("request");

const getTorrent9pages = () => {
  return request("https://www.torrent9.ac/torrents/films", (err, res, body) => {
    if (err) return console.log("Error getting torrent 9 pages:", err);
    console.log(cheerio(".pagination li", body).eq(-2).text());
    return parseInt(cheerio(".pagination li", body).eq(-2).text(), 10);
  });
};

const fetchHomePageTorrent9 = (page) => {
  const getTotalPages = getTorrent9pages();
};

fetchHomePageTorrent9(1);

const scrapeTorrent9 = async () => {
  let currentPage = 1;
  const numberOfPages = await scrapeNumberOfPages();
  const movies = [];
  do {
    if (currentPage % 15 === 0) sleep(1000);
    const moviesList = await timeoutPromise(
      20000,
      scrapeTorrent9Page(currentPage),
      []
    ); // eslint-disable-line
    if (!isEmpty(moviesList)) {
      await Promise.all(
        moviesList.map((movie) =>
          timeoutPromise(20000, scrapeTorrent9Details(movie), {})
        )
      ); // eslint-disable-line
      movies.push(...moviesList);
    }
    currentPage += 1;
  } while (currentPage <= numberOfPages);
  return lineariseTorrent9Movies(movies);
};
