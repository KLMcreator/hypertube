// init search get torrents from every websites
// get yts main page
// get torrent9 main page
// get 1337x main page

const getYts = require("./getYTS");
const getTorrent9 = require("./getTorrent9");

const initScraping = async () => {
  console.time("initScraping");
  await getYts.fetchAllTorrents();
  await getTorrent9.fetchAllTorrents();
  console.timeEnd("initScraping");
};

initScraping();
