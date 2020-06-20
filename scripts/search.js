const getYts = require("./getYTS");
const getTorrent9 = require("./getTorrent9");

const fs = require("fs");
// let torrent9Infos = JSON.parse(fs.readFileSync("torrent9Torrents.json"));
// let ytsInfos = JSON.parse(fs.readFileSync("ytsTorrents.json"));
let torrents = JSON.parse(fs.readFileSync("finalTorrents.json"));
let finalTorrents = { fetched_at: 0, number_of_movies: 0, movies: [] };

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
        if (finalTorrents.movies[j].source === "yts") {
          infos = {
            yts_id: finalTorrents.movies[j].id,
            torrent9_id: finalTorrents.movies[i].id,
            title: finalTorrents.movies[j].title,
            production_year: finalTorrents.movies[j].production_year,
            rating: finalTorrents.movies[j].rating,
            yts_url: finalTorrents.movies[j].url,
            torrent9_url: finalTorrents.movies[i].url,
            cover_url: finalTorrents.movies[j].cover_url,
            torrents: [],
          };
          if (finalTorrents.movies[j].torrents) {
            finalTorrents.movies[j].torrents.map((ele) => {
              infos.torrents.push({
                language: finalTorrents.movies[j].language,
                source: ele.source,
                quality: ele.quality,
                seeds: ele.seeds,
                peers: ele.peers,
                url: ele.url,
                size: ele.size,
                format: ele.format,
              });
            });
          }
          if (finalTorrents.movies[i].torrents) {
            finalTorrents.movies[i].torrents.map((ele) => {
              infos.torrents.push({
                language: finalTorrents.movies[i].language,
                source: ele.source,
                quality: ele.quality,
                seeds: ele.seeds,
                peers: ele.peers,
                url: ele.url,
                size: ele.size,
                format: ele.format,
              });
            });
          }
        } else {
          infos = {
            yts_id: finalTorrents.movies[i].id,
            torrent9_id: finalTorrents.movies[j].id,
            title: finalTorrents.movies[i].title,
            production_year: finalTorrents.movies[i].production_year,
            rating: finalTorrents.movies[i].rating,
            yts_url: finalTorrents.movies[i].url,
            torrent9_url: finalTorrents.movies[j].url,
            cover_url: finalTorrents.movies[i].cover_url,
            torrents: [],
          };
          if (finalTorrents.movies[i].torrents) {
            finalTorrents.movies[i].torrents.map((ele) => {
              infos.torrents.push({
                language: finalTorrents.movies[i].language,
                source: ele.source,
                quality: ele.quality,
                seeds: ele.seeds,
                peers: ele.peers,
                url: ele.url,
                size: ele.size,
                format: ele.format,
              });
            });
          }
          if (finalTorrents.movies[j].torrents) {
            finalTorrents.movies[j].torrents.map((ele) => {
              infos.torrents.push({
                language: finalTorrents.movies[j].language,
                source: ele.source,
                quality: ele.quality,
                seeds: ele.seeds,
                peers: ele.peers,
                url: ele.url,
                size: ele.size,
                format: ele.format,
              });
            });
          }
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
    }
  });
};

const initScraping = async () => {
  console.time("initScraping");
  let torrent9Infos = await getTorrent9.fetchAllTorrents();
  let ytsInfos = await getYts.fetchAllTorrents();
  console.log(ytsInfos.movies.length, "movies found on YTS");
  console.log(torrent9Infos.movies.length, "movies found on Torrent9");
  console.log("Re-purifying just to be sure there's no duplicates");
  ytsInfos = await checkDuplicates(ytsInfos);
  torrent9Infos = await checkDuplicates(torrent9Infos);
  console.log(ytsInfos.movies.length, "movies found on YTS after purify");
  console.log(
    torrent9Infos.movies.length,
    "movies found on Torrent9 after purify"
  );
  console.log(
    "Creating one big final list before storing it into the database"
  );
  fs.writeFile("ytsTorrents.json", JSON.stringify(ytsInfos), (err) => {
    if (err) throw err;
    console.log("ytsInfos saved!");
  });
  fs.writeFile(
    "torrent9Torrents.json",
    JSON.stringify(torrent9Infos),
    (err) => {
      if (err) throw err;
      console.log("torrent9Infos saved!");
    }
  );
  await purifyAllTorrents(ytsInfos, torrent9Infos);
  fs.writeFile("finalTorrents.json", JSON.stringify(finalTorrents), (err) => {
    if (err) throw err;
    console.log("torrent9Infos saved!");
  });
  console.log(
    finalTorrents.number_of_movies,
    "movies in total after last purify"
  );
  console.timeEnd("initScraping");
};

searchInTorrent("sex");
