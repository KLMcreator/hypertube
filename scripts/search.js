const moment = require("moment");
const chalk = require("chalk");

const getYts = require("./getYTS");
const getTorrent9 = require("./getTorrent9");

const fs = require("fs");
let torrent9Infos = JSON.parse(fs.readFileSync("torrent9Torrents.json"));
let ytsInfos = JSON.parse(fs.readFileSync("ytsTorrents.json"));
let torrents = JSON.parse(fs.readFileSync("finalTorrents.json"));
let finalTorrents = { fetched_at: 0, number_of_movies: 0, movies: [] };
let searched = [];

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
  while (i < t9.movies.length) {
    finalTorrents.movies.push(t9.movies[i]);
    i++;
  }
  i = 0;
  while (i < yts.movies.length) {
    finalTorrents.movies.push(yts.movies[i]);
    i++;
  }
  i = 0;
  while (i < finalTorrents.movies.length) {
    let j = i + 1;
    while (j < finalTorrents.movies.length) {
      if (finalTorrents.movies[i].title === finalTorrents.movies[j].title) {
        let infos = {};
        if (finalTorrents.movies[j].yts_id !== null) {
          infos = {
            yts_id: finalTorrents.movies[j].yts_id,
            torrent9_id: finalTorrents.movies[i].torrent9_id,
            title: finalTorrents.movies[j].title,
            production_year: finalTorrents.movies[j].production_year,
            rating: finalTorrents.movies[j].rating,
            yts_url: finalTorrents.movies[j].yts_url,
            torrent9_url: finalTorrents.movies[i].torrent9_url,
            cover_url: finalTorrents.movies[j].cover_url,
            large_image: finalTorrents.movies[j].large_cover_image,
            summary: finalTorrents.movies[j].summary,
            imdb_code: finalTorrents.movies[j].imdb_code,
            yt_trailer: finalTorrents.movies[j].yt_trailer_code,
            categories: [],
            languages: [],
            torrents: [],
          };
        } else {
          infos = {
            yts_id: finalTorrents.movies[i].yts_id,
            torrent9_id: finalTorrents.movies[j].torrent9_id,
            title: finalTorrents.movies[i].title,
            production_year: finalTorrents.movies[i].production_year,
            rating: finalTorrents.movies[i].rating,
            yts_url: finalTorrents.movies[i].yts_url,
            torrent9_url: finalTorrents.movies[j].torrent9_url,
            cover_url: finalTorrents.movies[i].cover_url,
            large_image: finalTorrents.movies[j].large_cover_image,
            summary: finalTorrents.movies[j].summary,
            imdb_code: finalTorrents.movies[j].imdb_code,
            yt_trailer: finalTorrents.movies[j].yt_trailer_code,
            categories: [],
            languages: [],
            torrents: [],
          };
        }
        if (finalTorrents.movies[j].languages) {
          finalTorrents.movies[j].languages.map((ele) => {
            infos.languages.push(ele);
          });
        }
        if (finalTorrents.movies[i].languages) {
          finalTorrents.movies[i].languages.map((ele) => {
            infos.languages.push(ele);
          });
        }
        if (finalTorrents.movies[j].categories) {
          finalTorrents.movies[j].categories.map((ele) => {
            infos.categories.push(ele);
          });
        }
        if (finalTorrents.movies[i].categories) {
          finalTorrents.movies[i].categories.map((ele) => {
            infos.categories.push(ele);
          });
        }
        if (finalTorrents.movies[j].torrents) {
          finalTorrents.movies[j].torrents.map((ele) => {
            infos.torrents.push(ele);
          });
        }
        if (finalTorrents.movies[i].torrents) {
          finalTorrents.movies[i].torrents.map((ele) => {
            infos.torrents.push(ele);
          });
        }
        finalTorrents.movies.push(infos);
        finalTorrents.movies.splice(i, 1);
        finalTorrents.movies.splice(j - 1, 1);
        i = -1;
        break;
      } else {
        j++;
      }
    }
    i++;
  }
  finalTorrents.number_of_movies = finalTorrents.movies.length;
};

const searchInTorrent = async (q) => {
  torrents.movies.map((el) => {
    if (el.title.toLowerCase().includes(q.toLowerCase())) {
      console.log(el);
      searched.push(el);
    }
  });
};

const initScraping = async () => {
  console.time("initScraping");
  console.log("Starting new scrap at", chalk.yellow(moment().format()));
  //   let ytsInfos = await getYts.fetchAllTorrents();
  //   let torrent9Infos = await getTorrent9.fetchAllTorrents();
  //   console.log(
  //     ytsInfos.movies.length,
  //     "movies total found on",
  //     chalk.green("YTS")
  //   );
  //   console.log(
  //     torrent9Infos.movies.length,
  //     "movies total found on",
  //     chalk.green("Torrent9")
  //   );
  //   console.log("Re-purifying just to be sure there's no duplicates");
  //   ytsInfos = await checkDuplicates(ytsInfos);
  //   torrent9Infos = await checkDuplicates(torrent9Infos);
  //   console.log(
  //     ytsInfos.movies.length,
  //     "movies found on",
  //     chalk.green("YTS"),
  //     "after purify"
  //   );
  //   console.log(
  //     torrent9Infos.movies.length,
  //     "movies found on",
  //     chalk.green("Torrent9"),
  //     "after purify"
  //   );
  //   console.log(
  //     "Saving",
  //     chalk.green("ytsInfos"),
  //     "to",
  //     chalk.green("ytsTorrents.json")
  //   );
  //   fs.writeFile("ytsTorrents.json", JSON.stringify(ytsInfos), (err) => {
  //     if (err) throw err;
  //     console.log(chalk.green("ytsTorrents.json saved!"));
  //   });
  //   console.log(
  //     "Saving",
  //     chalk.green("torrent9Infos"),
  //     "to",
  //     chalk.green("torrent9Torrents.json")
  //   );
  //   fs.writeFile(
  //     "torrent9Torrents.json",
  //     JSON.stringify(torrent9Infos),
  //     (err) => {
  //       if (err) throw err;
  //       console.log(chalk.green("torrent9Torrents.json saved!"));
  //     }
  //   );
  console.log(
    "Creating one big final list for every movies before storing it into the database"
  );
  await purifyAllTorrents(ytsInfos, torrent9Infos);
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
  console.timeEnd("initScraping");
};

searchInTorrent("da 5 bloods");
fs.writeFile("searchResults.json", JSON.stringify(searched), (err) => {
  if (err) throw err;
  console.log(chalk.green("finalTorrents.json saved!"));
});

// initScraping();
