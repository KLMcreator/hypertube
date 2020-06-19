const getYts = require("./getYTS");
const getTorrent9 = require("./getTorrent9");

const initScraping = async () => {
  console.time("initScraping");
  //   const ytsInfos = await getYts.fetchAllTorrents();
  //   console.log(
  //     ytsInfos.fetched_at,
  //     ytsInfos.number_of_pages,
  //     ytsInfos.movies.length
  //   );
  //   console.log(ytsInfos.movies[0]);
  const torrent9Infos = await getTorrent9.fetchAllTorrents();
  console.log(torrent9Infos.movies[0]);
  console.log(torrent9Infos.movies[1]);
  console.timeEnd("initScraping");
};

initScraping();
