const cheerio = require("cheerio");
const fetch = require("node-fetch");
const axios = require("axios");
const request = require("request");

const fetchHTML = async (q) => {
  console.log("Quering:", q, "on limetorrents.buzz");

  const body = JSON.stringify({
    q: q,
    category: "all",
    category: "movies",
  });

  axios
    .post("https://limetorrents.buzz/search-results/", body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Access-Control-Allow-Origin": "*",
      },
      crossdomain: true,
    })
    .then(function (res) {
      console.log(res.data);
    })
    .catch(function (err) {
      console.log("ERR");
    });
};

const fetchPirateBay = async (q) => {
  // 200 = videos
  // 99 = order by seed desc
  // p = page
  let p = 1;
  const url = "https://www1.thepiratebay3.to/search/" + q + "/" + p + "/7/200";

  const extractMagnetURIs = (body) => {
    const parsed = body.match(/\"magnet:\?\S+\"/g);
    let attr;
    return parsed.map((el) => {
      attr = el.split("");
      attr.pop();
      attr.shift();
      return attr.join("");
    });
  };

  const onResponse = (err, res, body) => {
    if (err) {
      return console.log("Error scraping " + res);
    }
    console.log(extractMagnetURIs(body));
  };

  request(url, onResponse);
};

// return torrent magnets from the pirate bay
// fetchPirateBay("star wars");
