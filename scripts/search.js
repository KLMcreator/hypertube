// init search get torrents from every websites
// get yts main page
// get torrent9 main page
// get 1337x main page

const getYts = require("./getYTS");

const initScraping = async () => {
  console.time("initScraping");
  await getYts.fetchAllTorrents();
  //   await getYts.fetchQueryTorrents("star wars");
  console.timeEnd("initScraping");
};

initScraping();
