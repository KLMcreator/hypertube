const moment = require("moment");
const chalk = require("chalk");
const request = require("request");
const crypto = require("crypto");
const jimp = require("jimp");
const glob = require("glob");

const Crawler = require("crawler");

const getYts = require("./getYTS");
const getTorrent9 = require("./getTorrent9");

const fs = require("fs");
let torrent9Infos = JSON.parse(fs.readFileSync("torrent9Torrents.json"));
let ytsInfos = JSON.parse(fs.readFileSync("ytsTorrents.json"));
let torrents = JSON.parse(fs.readFileSync("finalTorrents.json"));
let torrentsWithImagePath = JSON.parse(fs.readFileSync("torrents.json"));
// let finalTorrents = { fetched_at: 0, number_of_movies: 0, movies: [] };
let searched = [];

const searchInTorrent = async (q) => {
  torrents.movies.map((el) => {
    if (el.title.toLowerCase().includes(q.toLowerCase())) {
      console.log(el);
      searched.push(el);
    }
  });
};

const checkDuplicates = async (arr) => {
  let i = 0;
  while (i < arr.movies.length) {
    let j = i + 1;
    while (j < arr.movies.length) {
      let k = 0;
      if (arr.movies[i].title === arr.movies[j].title) {
        while (k < arr.movies[j].torrents.length) {
          arr.movies[i].torrents.push(arr.movies[j].torrents[k]);
          k++;
        }
        arr.movies.splice(j, 1);
        i = -1;
        break;
      } else {
        j++;
      }
    }
    i++;
  }
  return arr;
};

const purifyAllTorrents = async (t9, yts) => {
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
  ytsInfos = await getYts.fetchAllTorrents();
  console.log(
    ytsInfos.movies.length,
    "movies total found on",
    chalk.green("YTS"),
    "getting Torrent9 now"
  );
  torrent9Infos = await getTorrent9.fetchAllTorrents();
  console.log(
    torrent9Infos.movies.length,
    "movies total found on",
    chalk.green("Torrent9")
  );
};

const purifyBeforeGroup = async () => {
  ytsInfos = await checkDuplicates(ytsInfos);
  console.log(
    ytsInfos.movies.length,
    "movies found on",
    chalk.green("YTS"),
    "after purify, checking Torrent9 now"
  );
  torrent9Infos = await checkDuplicates(torrent9Infos);
  console.log(
    torrent9Infos.movies.length,
    "movies found on",
    chalk.green("Torrent9"),
    "after purify"
  );
};

const saveToFile = async () => {
  console.log(
    "Saving",
    chalk.green("ytsInfos"),
    "to",
    chalk.green("ytsTorrents.json")
  );
  fs.writeFile("ytsTorrents.json", JSON.stringify(ytsInfos), (err) => {
    if (err) throw err;
    console.log(chalk.green("ytsTorrents.json saved!"));
  });
  console.log(
    "Saving",
    chalk.green("torrent9Infos"),
    "to",
    chalk.green("torrent9Torrents.json")
  );
  fs.writeFile(
    "torrent9Torrents.json",
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
  fs.writeFile("finalTorrents.json", JSON.stringify(finalTorrents), (err) => {
    if (err) throw err;
    console.log(chalk.green("finalTorrents.json saved!"));
  });
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

const initScraping = async () => {
  console.time("initScraping");
  //   console.log("Starting new scrap at", chalk.yellow(moment().format()));
  //   await getMovies();
  //   console.log(
  //     torrent9Infos.movies.length + ytsInfos.movies.length,
  //     "total movies"
  //   );
  //   console.log(
  //     "Starting purify to check one last time if there's no duplicates"
  //   );
  //   await purifyBeforeGroup();
  //   await saveToFile();
  //   await groupAndSave();
  //   await getImages();
  console.log(
    "If the process isn't finished yet, there might be some images that are still being saved. Please don't quit either way you won't have the full image bank."
  );
  console.timeEnd("initScraping");
};

// searchInTorrent("da 5 bloods");
// fs.writeFile("searchResults.json", JSON.stringify(searched), (err) => {
//   if (err) throw err;
//   console.log(chalk.green("finalTorrents.json saved!"));
// });

initScraping();
