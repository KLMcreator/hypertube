const getYts = require("./getYTS");
const getTorrent9 = require("./getTorrent9");

const initScraping = async () => {
  console.time("initScraping");
  const ytsInfos = await getYts.fetchAllTorrents();
  const torrent9Infos = await getTorrent9.fetchAllTorrents();
  console.log(
    ytsInfos.fetched_at,
    ytsInfos.number_of_pages,
    ytsInfos.movies.length
  );
  ytsInfos.movies.map((el) => console.log(el.title));
  console.log(
    torrent9Infos.fetched_at,
    torrent9Infos.number_of_pages,
    torrent9Infos.movies.length
  );
  torrent9Infos.movies.map((el) => console.log(el.title));
  console.timeEnd("initScraping");
};

initScraping();
