const moment = require("moment");
const chalk = require("chalk");
const crypto = require("crypto");
const Crawler = require("crawler");
const fs = require("fs");
const getTorrent9 = require("./getTorrent9");
const getYTS = require("./getYTS");
let torrent9Infos = { fetched_at: 0, number_of_pages: 0, movies: [] };
let ytsInfos = { fetched_at: 0, number_of_pages: 0, movies: [] };
let finalTorrents = { fetched_at: 0, number_of_movies: 0, movies: [] };
let searched = [];

const searchInTorrent = async (q) => {
  try {
    if (fs.existsSync("finalTorrents.json")) {
      let torrents = JSON.parse(fs.readFileSync("finalTorrents.json"));
      torrents.movies.map((el) => {
        if (el.title.toLowerCase().includes(q.toLowerCase())) {
          console.log(el);
          searched.push(el);
        }
      });
      fs.writeFile("searchResults.json", JSON.stringify(searched), (err) => {
        if (err) throw err;
        console.log(chalk.green("finalTorrents.json saved!"));
      });
    } else {
      console.log("Search will be available after a full scrap");
    }
  } catch (err) {
    console.error(err);
  }
};

const getImages = async () => {
  console.log("Getting images for", torrents.number_of_movies, "movies");
  let missingImages = await hydrateImageBank();
  console.log(
    torrents.number_of_movies,
    "photos saved in folder",
    chalk.green("client/src/assets/torrents")
  );
  fs.writeFile("torrents.json", JSON.stringify(torrents), (err) => {
    if (err) throw err;
    console.log(chalk.green("finalTorrents.json saved!"));
  });
  if (missingImages.length) {
    console.log(
      "If you see this message, some images aren't saved to the bank. Saving the report to:",
      chalk.green("missingImages.json")
    );
    fs.writeFile("missingImages.json", JSON.stringify(missingImages), (err) => {
      if (err) throw err;
      console.log(chalk.green("missingImages.json saved!"));
    });
  }
};

const purifyAllTorrents = async () => {
  finalTorrents.fetched_at = Date.now();
  let i = 0;
  while (i < torrent9Infos.movies.length) {
    finalTorrents.movies.push(torrent9Infos.movies[i]);
    i++;
  }
  i = 0;
  while (i < ytsInfos.movies.length) {
    finalTorrents.movies.push(ytsInfos.movies[i]);
    i++;
  }
  torrent9Infos = null;
  ytsInfos = null;
  i = 0;
  while (i < finalTorrents.movies.length) {
    let j = i + 1;
    let occurences = [i];
    while (j < finalTorrents.movies.length) {
      if (finalTorrents.movies[i].title === finalTorrents.movies[j].title) {
        occurences.push(j);
      }
      j++;
    }
    if (occurences.length > 1) {
      let k = 0;
      let infos = {
        yts_id: null,
        torrent9_id: null,
        title: null,
        production_year: null,
        rating: null,
        yts_url: null,
        torrent9_url: null,
        cover_url: null,
        large_image: null,
        summary: [],
        imdb_code: null,
        yt_trailer: null,
        categories: [],
        languages: [],
        torrents: [],
      };
      while (k < occurences.length) {
        infos = {
          yts_id: finalTorrents.movies[occurences[k]].yts_id
            ? finalTorrents.movies[occurences[k]].yts_id
            : infos.yts_id,
          torrent9_id: finalTorrents.movies[occurences[k]].torrent9_id
            ? finalTorrents.movies[occurences[k]].torrent9_id
            : infos.torrent9_id,
          title: finalTorrents.movies[occurences[k]].title
            ? finalTorrents.movies[occurences[k]].title
            : infos.title,
          production_year: finalTorrents.movies[occurences[k]].production_year
            ? finalTorrents.movies[occurences[k]].production_year
            : infos.production_year,
          rating: finalTorrents.movies[occurences[k]].rating
            ? finalTorrents.movies[occurences[k]].rating
            : infos.rating,
          yts_url: finalTorrents.movies[occurences[k]].yts_url
            ? finalTorrents.movies[occurences[k]].yts_url
            : infos.yts_url,
          torrent9_url: finalTorrents.movies[occurences[k]].torrent9_url
            ? finalTorrents.movies[occurences[k]].torrent9_url
            : infos.torrent9_url,
          cover_url: finalTorrents.movies[occurences[k]].cover_url
            ? finalTorrents.movies[occurences[k]].cover_url
            : infos.cover_url,
          large_image: finalTorrents.movies[occurences[k]].large_image
            ? finalTorrents.movies[occurences[k]].large_image
            : infos.large_image,
          summary: infos.summary.length ? infos.summary : [],
          imdb_code: finalTorrents.movies[occurences[k]].imdb_code
            ? finalTorrents.movies[occurences[k]].imdb_code
            : infos.imdb_code,
          yt_trailer: finalTorrents.movies[occurences[k]].yt_trailer
            ? finalTorrents.movies[occurences[k]].yt_trailer
            : infos.yt_trailer,
          categories: infos.categories.length ? infos.categories : [],
          languages: infos.languages.length ? infos.languages : [],
          torrents: infos.torrents.length ? infos.torrents : [],
        };
        if (finalTorrents.movies[occurences[k]].summary) {
          infos.summary.push(finalTorrents.movies[occurences[k]].summary);
        }
        if (finalTorrents.movies[occurences[k]].languages) {
          finalTorrents.movies[occurences[k]].languages.map((ele) => {
            infos.languages.push(ele);
          });
        }
        if (finalTorrents.movies[occurences[k]].categories) {
          finalTorrents.movies[occurences[k]].categories.map((ele) => {
            infos.categories.push(ele);
          });
        }
        if (finalTorrents.movies[occurences[k]].torrents) {
          finalTorrents.movies[occurences[k]].torrents.map((ele) => {
            infos.torrents.push(ele);
          });
        }
        k++;
      }
      k = 0;
      while (k < occurences.length) {
        finalTorrents.movies.splice(occurences[k] - k, 1);
        k++;
      }
      finalTorrents.movies.push(infos);
      i = -1;
    }
    i++;
  }
  finalTorrents.number_of_movies = finalTorrents.movies.length;
};

const hydrateImageBank = async () => {
  let i = 0;
  let missingImages = [];
  const c = new Crawler({
    rateLimit: 100,
    encoding: null,
    jQuery: false,
    callback: function (err, res, done) {
      if (err) {
        console.error(err.stack);
        missingImages.push({ index: i, filename: res.options.filename });
      } else {
        let newStream = fs.createWriteStream(res.options.filename);
        newStream.write(res.body, () => {
          newStream.close();
        });
      }
      done();
    },
  });

  console.log(
    "delay set to",
    chalk.green("100ms"),
    "between images,",
    chalk.green("3000ms"),
    "every 15 images,",
    chalk.green("10000ms"),
    "every 1000 images"
  );

  while (i < torrents.number_of_movies) {
    let filename = crypto.randomBytes(16).toString("hex") + Date.now() + ".png";
    c.queue({
      uri: torrents.movies[i].cover_url,
      filename: "./../client/src/assets/torrents/" + filename,
      retries: 0,
    });
    torrents.movies[i].cover_url = filename;
    if (i && i % 15 === 0) {
      console.log(
        i,
        "/",
        torrents.number_of_movies,
        "photos done",
        "waiting for 3s to avoid being blacklisted or anything."
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    if (i && i % 1000 === 0) {
      console.log(
        i,
        "/",
        torrents.number_of_movies,
        "photos done",
        "waiting for 5s to avoid being blacklisted or anything."
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    i++;
  }
  return missingImages;
};

const getMovies = async () => {
  let movies = await Promise.all([
    getYTS.fetchAllTorrents(),
    getTorrent9.fetchAllTorrents(),
  ]);
  ytsInfos = movies[0];
  torrent9Infos = movies[1];
  console.log(
    ytsInfos.movies.length,
    "movies total found on",
    chalk.green("YTS"),
    torrent9Infos.movies.length,
    "movies total found on",
    chalk.green("Torrent9")
  );
};

const saveToFile = async () => {
  console.log(
    "Saving",
    chalk.green("ytsInfos"),
    "to",
    chalk.green("ytsTorrents.json")
  );
  fs.writeFile(
    "./scripts/ytsTorrents.json",
    JSON.stringify(ytsInfos),
    (err) => {
      if (err) throw err;
      console.log(chalk.green("ytsTorrents.json saved!"));
    }
  );
  console.log(
    "Saving",
    chalk.green("torrent9Infos"),
    "to",
    chalk.green("torrent9Torrents.json")
  );
  fs.writeFile(
    "./scripts/torrent9Torrents.json",
    JSON.stringify(torrent9Infos),
    (err) => {
      if (err) throw err;
      console.log(chalk.green("torrent9Torrents.json saved!"));
    }
  );
};

const groupAndSave = async () => {
  console.log(
    "Creating one big final list for every movies before storing it into the database"
  );
  console.log(
    torrent9Infos.movies.length + ytsInfos.movies.length,
    "movies in total before purify!"
  );
  await purifyAllTorrents();
  console.log(
    finalTorrents.number_of_movies,
    "movies in total after last purify!",
    "Saving it to",
    chalk.green("finalTorrents.json")
  );
  fs.writeFile(
    "./scripts/finalTorrents.json",
    JSON.stringify(finalTorrents),
    (err) => {
      if (err) throw err;
      console.log(chalk.green("finalTorrents.json saved!"));
    }
  );
};

const initScraping = async (withImages) => {
  console.time("initScraping");
  console.log("Starting new scrap at", chalk.yellow(moment().format()));
  await getMovies();
  console.log(
    torrent9Infos.movies.length + ytsInfos.movies.length,
    "total movies found before group"
  );
  await saveToFile();
  await groupAndSave();
  if (withImages) {
    await getImages();
  }
  console.timeEnd("initScraping");
};

module.exports = { initScraping, searchInTorrent };
