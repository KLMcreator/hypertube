const got = require("got");
const chalk = require("chalk");
const moment = require("moment");
const cheerio = require("cheerio");

let leetxInfos = { fetched_at: 0, number_of_pages: 0, movies: [] };

const getTorrentInfos = (url, i) => {
  new Promise((resolve) => {
    return got(url, {
      retry: {
        limit: 0,
      },
    })
      .then((res) => cheerio.load(res.body))
      .then(($) => {
        let hash =
          $("div.infohash-box p")[0] &&
          $("div.infohash-box p")[0].children[3] &&
          $("div.infohash-box p")[0].children[3].children[0]
            ? $("div.infohash-box p")[0].children[3].children[0].data
            : null;

        let language =
          $(".list li:nth-child(3) span")[0] &&
          $(".list li:nth-child(3) span")[0].children[0]
            ? $(".list li:nth-child(3) span")[0].children[0].data
            : null;

        let quality =
          $(".list li:nth-child(2) span")[0] &&
          $(".list li:nth-child(2) span")[0].children[0]
            ? $(".list li:nth-child(2) span")[0].children[0].data.toUpperCase()
            : null;

        let size =
          $(".list li:nth-child(4) span")[0] &&
          $(".list li:nth-child(4) span")[0].children[0]
            ? $(".list li:nth-child(4) span")[0].children[0].data.toUpperCase()
            : null;

        let magnet =
          $("a:contains('Magnet Download')")[0] &&
          $("a:contains('Magnet Download')")[0].attribs &&
          $("a:contains('Magnet Download')")[0].attribs
            ? $("a:contains('Magnet Download')")[0].attribs.href
            : null;

        if (magnet) {
          resolve({
            id: `leetx_${i}`,
            source: "leetx",
            downloaded: false,
            path: null,
            downloaded_at: null,
            lastviewed_at: null,
            delete_at: null,
            hash: hash,
            duration: null,
            language: language,
            subtitles: [],
            quality: quality,
            seeds: parseInt(
              $(".list li:nth-child(4) span")[1].children[0].data,
              10
            ),
            peers: parseInt(
              $(".list li:nth-child(5) span")[1].children[0].data,
              10
            ),
            url: url,
            magnet: $("a:contains('Magnet Download')")[0].attribs.href,
            torrent: null,
            size: size,
            format: null,
          });
        } else {
          resolve(false);
        }
      })
      .catch((err) =>
        console.log(chalk.red("1337x: Error while getting pages:", err))
      );
  });
};

const getTorrentList = async (links, seeds) => {
  new Promise((resolve) => {
    const promises = [];
    Object.keys(links).forEach((key) => {
      if (
        key < seeds.length &&
        seeds[key] &&
        seeds[key].children[0] &&
        parseInt(seeds[key].children[0].data, 10) > 6 &&
        links[key] &&
        links[key].children[1] &&
        links[key].children[1].attribs &&
        links[key].children[1].attribs.href
      )
        promises.push(
          getTorrentInfos(
            `https://www.1337x.to${links[key].children[1].attribs.href}`,
            key
          )
        );
    });
    Promise.all(promises).then((res) => resolve(res));
  });
};

const getMoreInfos = async (url, i) => {
  return got(url, {
    retry: {
      limit: 0,
    },
  })
    .then((res) => cheerio.load(res.body))
    .then(async ($) => {
      if (
        $("h3.featured-heading strong")[0] &&
        $("h3.featured-heading strong")[0].children[0]
      )
        leetxInfos.movies[i].production_year = parseInt(
          $("h3.featured-heading strong")[0].children[0].data.slice(-14, -10),
          10
        );
      if (
        $("div.torrent-image img")[0] &&
        $("div.torrent-image img")[0].attribs &&
        $("div.torrent-image img")[0].attribs.src
      )
        leetxInfos.movies[i].cover_url = `https:${
          $("div.torrent-image img")[0].attribs.src
        }`;
      leetxInfos.movies[i].torrents = await getTorrentList(
        $("tr td.name"),
        $("tr td.seeds")
      );
    })
    .catch((err) =>
      console.log(chalk.red("1337x: Error while getting pages:", err))
    );
};

const getMovieList = async (url) => {
  return got(url, {
    retry: {
      limit: 0,
    },
  })
    .then((res) => cheerio.load(res.body))
    .then(($) => {
      let i = 0;
      const titles = $("h3");
      const descriptions = $(".content-row");
      const categories = $(".category");
      const ratings = $(".rating i");
      try {
        while (titles[i] !== undefined) {
          const genres = [];
          const rating =
            parseInt(
              ratings[i].attribs.style.replace("width: ", "").replace("%;", ""),
              10
            ) / 10;
          const title = titles[i].children[0].children[0].data;
          const link = `https://www.1337x.to${titles[i].children[0].attribs.href}`;
          const summary = descriptions[i].children[1].children[0].data.trim();
          let isDuplicate = leetxInfos.movies.findIndex(
            (dupli) => dupli.title === title
          );
          if (isDuplicate === -1) {
            Object.keys(categories[i].children).forEach((child) => {
              if (categories[i].children[child].name === "span") {
                genres.push(categories[i].children[child].children[0].data);
              }
            });
            if (title && link) {
              leetxInfos.movies.push({
                yts_id: null,
                torrent9_id: null,
                leetx_id: title,
                title: title,
                production_year: null,
                rating: rating,
                yts_url: null,
                torrent9_url: null,
                leetx_url: link,
                cover_url: null,
                large_image: null,
                summary: summary,
                duration: null,
                imdb_code: null,
                yt_trailer: null,
                categories: genres,
                languages: [],
                subtitles: [],
                torrents: [],
              });
            }
          }
          i++;
        }
      } catch (e) {
        console.log(
          `${whatTimeIsIt()} an error occured while parsing 1337x page ${page}: ${e}`
        );
      }
    })
    .catch((err) =>
      console.log(chalk.red("1337x: Error while getting pages:", err))
    );
};

const getTotalPages = async (url) => {
  return got(url, {
    retry: {
      limit: 0,
    },
  })
    .then((res) => cheerio.load(res.body))
    .then(($) => {
      let total = parseInt($(".last a").attr("href").split("/")[2], 10);
      console.log(
        chalk.yellow(total * 24),
        "movies found on",
        chalk.green("1337x")
      );
      return total;
    })
    .catch((err) =>
      console.log(chalk.red("1337x: Error while getting pages:", err))
    );
};

const fetchAllTorrents = async () => {
  console.time("1337xScrapping");
  const fetchedAt = Date.now();
  console.log(
    "Initializing",
    chalk.green("1337x"),
    "scrapping at:",
    chalk.yellow(moment(fetchedAt).format())
  );
  leetxInfos.fetched_at = fetchedAt;
  leetxInfos.number_of_pages = await getTotalPages(
    "https://www.1337x.to/movie-library/1/"
  );
  console.log(
    leetxInfos.number_of_pages,
    "pages found on",
    chalk.green("1337x,"),
    "starting the scrape machine..."
  );
  for (let i = 0; i < leetxInfos.number_of_pages; i++) {
    await getMovieList(
      "https://www.1337x.to/movie-library/" + parseInt(i + 1, 10) + "/"
    );
    if (i && i % 100 === 0) {
      console.log(
        i,
        "pages done on",
        chalk.green("1337x,"),
        "waiting for 1.5s to avoid being blacklisted. Total movies:",
        leetxInfos.movies.length
      );
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  console.log(
    leetxInfos.movies.length,
    "movies scrapped on",
    chalk.green("1337x")
  );
  console.log(
    "Getting more infos for",
    leetxInfos.movies.length,
    "movies on",
    chalk.green("1337x")
  );
  for (let i = 0; i < leetxInfos.movies.length; i++) {
    await getMoreInfos(leetxInfos.movies[i].leetx_url, i);
    if (i && i % 50 === 0) {
      console.log(
        i,
        "movies done on",
        chalk.green("1337x,"),
        "waiting for 1.5s to avoid being blacklisted"
      );
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  console.timeEnd("1337xScrapping");
  return leetxInfos;
};

module.exports = { fetchAllTorrents };
