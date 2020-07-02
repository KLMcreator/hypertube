const moment = require("moment");
const chalk = require("chalk");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const axios = require("axios");
const crypto = require("crypto");
const Crawler = require("crawler");
const got = require("got");
const fs = require("fs");
const path = "./ytsTorrents.json";
let torrents;

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
          torrents.movies[i].subtitles.push({
            language: el.language,
            url: " https://www.yifysubtitles.com" + el.url,
          });
        });
      }
    })
    .catch((err) => console.log(chalk.red("Error while getting subs:", err)));
};

const initScraping = async () => {
  console.time("initScrapingSubs");
  console.log("Starting subs scrap at", chalk.yellow(moment().format()));
  for (let i = 0; i < torrents.movies.length; i++) {
    await getSubs(
      "https://www.yifysubtitles.com/movie-imdb/" +
        torrents.movies[i].imdb_code,
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
  console.timeEnd("initScrapingSubs");
};

try {
  if (fs.existsSync(path)) {
    torrents = JSON.parse(fs.readFileSync(path));
    initScraping();
  } else {
    console.error("No file found... scrape first");
  }
} catch (err) {
  console.error(err);
}
