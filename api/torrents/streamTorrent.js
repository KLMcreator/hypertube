const rp = require("request-promise");
const cheerio = require("cheerio");
const _ = require("lodash");
const dbService = require("./database/database.service");
const debug = require("debug")("hypertube:torrent.service");
const schedule = require("node-schedule");

// Delete old videos every day at midnight
schedule.scheduleJob({ hour: 0, minute: 0 }, async () => {
  await deleteStaleVideos();
});

// options = {
//   search: 'keyword',
//   sort: {
//     type: 'type', 'time' 'title' 'seeds' 'peers' 'year' 'rating'
//     type2: 'type2',
//     type3: 'type3',
//     order: 1 || 0, 1 = ascendant 0 = descendant
//     order2: 1 || 0,
//     order3: 1 || 0
//   },
//   filter: {
//     year_min: 2000,
//     year_max: 2000,
//     rating_min: 10,
//     rating_max: 10,
//     genre: 'name'
//   }
// };

function formatLodashSortType(sortType) {
  if (sortType === "title") sortType = "name";
  if (sortType === "seeds") sortType = "seeders";
  if (sortType === "peers") sortType = "leechers";
  return sortType;
}

async function sortVideoList(list, sort, userId) {
  const sortType = formatLodashSortType(sort.type);
  const sortOrder = sort.order;
  let sortType2 = null;
  let sortType3 = null;
  let sortOrder2 = null;
  let sortOrder3 = null;
  let result;

  if (!list) return;
  if (sort.type2) {
    sortType2 = formatLodashSortType(sort.type2);
    sortOrder2 = sort.order2 === 1 ? "asc" : "desc";
  }
  if (sort.type3) {
    sortType3 = formatLodashSortType(sort.type3);
    sortOrder3 = sort.order3 === 1 ? "asc" : "desc";
  }
  if (sortType2) {
    sortType === "seeders" || sortType === "leechers"
      ? (sortOrder2 = "asc")
      : 0;
    sortOrder3 ? (sortOrder3 = "asc") : 0;
    result = _.orderBy(
      list,
      [sortType, sortType2, sortType3],
      [sortOrder, sortOrder2, sortOrder3]
    );
    return checkIfVideosSeen(result, userId);
  }
  result = _.orderBy(list, [sortType], [sortOrder]);
  return await checkIfVideosSeen(result, userId);
}

async function checkIfVideosSeen(result, userId) {
  let videosSeen = await getVideosViewedByUser(userId);

  videosSeen.forEach((video) => {
    let seenVid = _.find(result, {
      source: video.source,
      identifier: video.identifier,
    });

    if (seenVid) {
      seenVid.seen = true;
    }
  });
  return result;
}

function filterYear(list, min, max) {
  if (!min) min = 0;
  if (!max) max = 3000;
  return _.filter(list, function (o) {
    return o.year >= min && o.year <= max;
  });
}

function filterRate(list, min, max) {
  if (!min) min = 0;
  if (!max) max = 10;
  return _.filter(list, function (o) {
    return o.rating >= min && o.rating <= max;
  });
}

function filterVideoList(list, filter) {
  // if (filter.genre)
  //   list = filterGenre(list, filter.genre);
  if (filter.year_min || filter.year_max)
    list = filterYear(
      list,
      parseInt(filter.year_min),
      parseInt(filter.year_max)
    );
  if (filter.rating_min || filter.rating_max)
    list = filterRate(
      list,
      parseInt(filter.rating_min),
      parseInt(filter.rating_max)
    );
  return list;
}

async function searchVideo(page, options) {
  let list = [];
  let tmp;

  debug(`search video : ${page} - options = `, options);
  options.sort.order = options.sort.order === 1 ? "asc" : "desc";
  if (options.search) options.search = encodeURIComponent(options.search);
  try {
    // if only YTS can handle the request
    if (
      options.sort.type === "title" ||
      options.sort.type === "rating" ||
      options.sort.type === "year" ||
      (options.filter && options.filter.genre)
    ) {
      tmp = await searchVideoYTS(options.search, 200, page, options);
      if (tmp === 520 || tmp === 525) {
        console.log(`Trying to reach YTS one more time`);
        tmp = await searchVideoYTS(options.search, 200, page, options);
      }
      list.push.apply(list, tmp);
      if (list.length === 0 && options.search === "") {
        list.push.apply(
          list,
          await searchVideo1337x("", page, {
            sort: {
              type: "seeds",
              order: 0,
            },
          })
        );
      }
      if (options.filter) list = filterVideoList(list, options.filter);
      return await sortVideoList(list, options.sort, options.userId);
    }
    // get 1337x search list
    list.push.apply(
      list,
      await searchVideo1337x(options.search, page, options)
    );
    list.push.apply(
      list,
      await searchVideo1337x(options.search, page + 1, options)
    );
    list.push.apply(
      list,
      await searchVideo1337x(options.search, page + 2, options)
    );

    // get YTS search list
    tmp = await searchVideoYTS(options.search, 80, page, options);
    if (tmp === 520 || tmp === 525) {
      console.log(`Trying to reach YTS one more time`);
      tmp = await searchVideoYTS(options.search, 80, page, options);
    }
    if (tmp && typeof tmp === "object") list.push.apply(list, tmp);
    if (options.filter) list = filterVideoList(list, options.filter);

    // debug('now going to sort: ', list);
    return await sortVideoList(list, options.sort, options.userId);
  } catch (err) {
    debug("caught err during search video: ", err);

    if (err.statusCode === 520 || err.statusCode === 525) {
      console.log(`${err.statusCode} on searchVideo`);
      if (options.filter) list = filterVideoList(list, options.filter);
      return await sortVideoList(list, options.sort);
    }
    throw err;
  }
}

async function searchVideoYTS(to_search, limit, page, options) {
  const query = to_search ? `&query_term=${to_search}` : ``;
  const genre =
    options && options.filter && options.filter.genre
      ? `&genre=${options.filter.genre}`
      : ``;
  const sort = options && options.sort.type ? `&sort=${options.sort.type}` : ``;
  const order =
    sort && options && options.order && options.sort.order
      ? `&order=${options.sort.order}`
      : ``;

  debug(
    `searchVideoYTS - to_search: ${to_search} limit: ${limit} page: ${page} options: ${options}`
  );
  try {
    const response = await rp({
      uri: `https://yts.ag/api/v2/list_movies.json?limit=${limit}&page=${page}${query}${genre}${sort}${order}`,
      json: true,
      timeout: 10000,
    });
    const movies = response.data.movies;
    let videoList = [];

    for (let elem in movies) {
      videoList.push({
        cover: movies[elem].medium_cover_image,
        name: movies[elem].title,
        source: "yts.ag",
        // identifier: movies[elem].url.substr(21),
        identifier: movies[elem].id,
        seeders: movies[elem].torrents[0].seeds,
        leechers: movies[elem].torrents[0].peers,
        available: false,

        // optionals
        downloadCount: null,
        rating: movies[elem].rating,
        year: movies[elem].year,
        genres: movies[elem].genres,
        language: movies[elem].language,
      });
    }
    return videoList;
  } catch (err) {
    debug("caught error during searchVideoYTS: ", err.statusCode);
    if (err.statusCode === 525 || err.statusCode === 520) {
      console.log(`${err.statusCode} on YTS`);
      return err.statusCode;
    }
    return [];
  }
}

// sort {type: leechers || seeders OR TIME, order: asc || desc};
async function searchVideo1337x(to_search, page, options) {
  let sort =
    options && options.sort && options.sort.type
      ? `${options.sort.type}/`
      : `seeders/`;
  const order =
    options && options.sort.order ? `${options.sort.order}/` : `desc/`;
  let uri;

  debug(
    `searchVideo1337x - tosearch ${to_search} page: ${page} options: ${options}`
  );
  sort === `seeds/` ? (sort = `seeders/`) : 0;
  sort === `peers/` ? (sort = `leechers/`) : 0;
  if (!to_search)
    uri = `https://1337x.to/sort-cat/Movies/${sort}${order}${page}/`;
  else
    uri = `https://1337x.to/sort-category-search/${to_search}/Movies/${sort}${order}${page}/`;
  try {
    const response = await rp({
      uri,
      transform: function (body) {
        return cheerio.load(body);
      },
      timeout: 10000,
    });
    let videoList = [];

    response(".search-page tbody tr").each(function (index, elem) {
      videoList.push({
        cover: null,
        name: response(elem).find(".name").text(),
        source: "1337x.to",
        identifier: response(elem)
          .find(".name a:nth-of-type(2)")
          .attr("href")
          .substr(9),
        seeders: parseInt(response(elem).find("td.seeds").text()),
        leechers: parseInt(response(elem).find("td.leeches").text()),
        available: false,

        // optionals
        downloadCount: null,
        rating: null,
        year: null,
        genres: null,
        language: null,
      });
    });

    // debug('request to 1337x finished');
    return videoList;
  } catch (err) {
    debug("caught error during searchVideo1337x", err.statusCode);
    if (err.statusCode === 525 || err.statusCode === 520) {
      console.log(`${err.statusCode} on 1337x`);
      return err.statusCode;
    }
    return [];
  }
}

async function getVideoInformationsYTS(identifier) {
  debug("getVideoInformationsYTS", identifier);

  try {
    const response = await rp({
      uri: `https://yts.ag/api/v2/movie_details.json?movie_id=${identifier}&with_images=true`,
      json: true,
    });
    if (!response) return null;
    const movie = response.data.movie;
    const dn = movie.url.substr(21);
    const trackers =
      `&tr=udp://glotorrents.pw:6969/announce` +
      `&tr=udp://tracker.opentrackr.org:1337/announce` +
      `&tr=udp://torrent.gresille.org:80/announce` +
      `&tr=udp://tracker.openbittorrent.com:80` +
      `&tr=udp://tracker.coppersurfer.tk:6969` +
      `&tr=udp://tracker.leechers-paradise.org:6969` +
      `&tr=udp://p4p.arenabg.ch:1337` +
      `&tr=udp://tracker.internetwarriors.net:1337`;
    const magnet = `magnet:?xt=urn:btih:${movie.torrents[0].hash}&dn=${dn}${trackers}`;
    return {
      source: "yts.ag",
      identifier,
      magnet,
      description: movie.description_full,
    };
  } catch (err) {
    throw err;
  }
}

async function getVideoInformations1337x(identifier) {
  debug(`getVideoInformations ${identifier}`);
  try {
    const response = await rp({
      uri: `https://1337x.to/torrent/${identifier}`,
      transform: function (body) {
        return cheerio.load(body);
      },
    });
    return {
      source: "1337x.to",
      identifier,
      magnet: response(
        "ul.download-links-dontblock.btn-wrap-list li:nth-of-type(1) a"
      ).attr("href"),
      description: response("#description").text(),
    };
  } catch (err) {
    throw err;
  }
}

// CFZ: Check this version

// async function saveVideo1337x(identifier) {
//   const db = await dbService.getConnection();
//
//   try {
//     let videoData = await getVideoInformations1337x(identifier);
//
//     delete videoData.magnet;
//     await db.query('INSERT INTO `Video` SET ?', videoData);
//   }
//   catch (err) {
//     throw err;
//   }
//   finally {
//     db.release();
//   }
// }

async function saveVideoYTS(identifier, path) {
  const db = await dbService.getConnection();

  try {
    let videoData = await getVideoInformations("yts.ag", identifier);

    await db.query("INSERT INTO `Video` SET ?", {
      source: videoData.source,
      identifier: videoData.identifier,
      path,
      description: videoData.description,
    });
  } catch (err) {
    throw err;
  } finally {
    db.release();
  }
}

async function saveVideo1337x(identifier, path) {
  const db = await dbService.getConnection();

  try {
    let videoData = await getVideoInformations("1337x.to", identifier);

    // debug('video data = ', videoData);

    await db.query("INSERT INTO `Video` SET ?", {
      source: videoData.source,
      identifier: videoData.identifier,
      path,
      description: videoData.description,
    });
  } catch (err) {
    throw err;
  } finally {
    db.release();
  }
}

async function getVideoInformations(source, identifier) {
  const mapping = {
    "1337x.to": getVideoInformations1337x,
    "yts.ag": getVideoInformationsYTS,
  };

  return await mapping[source](identifier);
}

async function saveVideo(source, identifier, path) {
  const mapping = {
    "1337x.to": saveVideo1337x,
    "yts.ag": saveVideoYTS,
  };

  return await mapping[source](identifier, path);
}

async function setVideoPath(source, identifier, path) {
  debug(`setVideoPath: ${source} : ${identifier} , ${path}`);
  const sql = "UPDATE Video SET path = ? WHERE source = ? AND identifier = ?";
  const params = [path, source, identifier];
  const db = await dbService.getConnection();

  try {
    db.query(sql, params);
  } catch (err) {
    debug("setVideoPath errored:", err);
    throw err;
  } finally {
    db.release();
  }
}

async function setVideoComplete(source, identifier) {
  const sql =
    "UPDATE Video SET complete = true WHERE source = ? AND identifier = ?";
  const params = [source, identifier];
  const db = await dbService.getConnection();

  try {
    db.query(sql, params);
  } catch (err) {
    debug("setVideoComplete errored:", err);
    throw err;
  } finally {
    db.release();
  }
}

/**
 *
 * @param source
 * @param identifier
 * @returns {Promise<*>}
 */
async function getBySourceIdentifier(source, identifier) {
  const sql = "SELECT * FROM Video WHERE source = ? AND identifier = ?";
  const params = [source, identifier];
  const db = await dbService.getConnection();

  try {
    const res = await db.query(sql, params);

    if (!res.length) return null;
    return res[0];
  } catch (err) {
    debug("Error caught in checkIfTorrentIsDownloaded");
    throw err;
  } finally {
    db.release();
  }
}

async function saveSub(sub) {
  let db = await dbService.getConnection();
  let sql = "INSERT INTO `Sub` SET ?";
  let params = sub;

  try {
    await db.query(sql, params);
  } catch (err) {
    if (err.sqlState === "23000") {
      debug("Tried to insert same subs twice, ignoring");
      return Promise.resolve();
    }
  } finally {
    db.release();
  }
}

async function getSubs(source, identifier) {
  let db = await dbService.getConnection();
  let sql =
    "SELECT `Sub`.id, `Sub`.path FROM `Sub` INNER JOIN `Video` ON `Sub`.`videoId` = `Video`.id WHERE `Video`.source = ? AND `Video`.identifier = ?";
  let params = [source, identifier];

  try {
    return db.query(sql, params);
  } catch (err) {
    debug("Caught err during getSubs", err);
  } finally {
    db.release();
  }
}

async function setVideoLastView(videoId, lastView) {
  const db = await dbService.getConnection();
  const sql = "UPDATE `Video` SET `Video`.lastView = ?";
  const params = [lastView];

  debug(`setVideoLastView ${videoId} : ${lastView}`);

  try {
    return db.query(sql, params);
  } catch (err) {
    debug("Caught err during setVideoLastView", err);
  } finally {
    db.release();
  }
}

async function deleteStaleVideos() {
  const db = await dbService.getConnection();
  const sql = "SELECT `Video`.id, `Video`.lastView FROM `Video`";
  const deleteSql = "DELETE FROM `Video` WHERE `Video`.id IN ?";

  debug("deleteStaleVideos");
  try {
    let videos = await db.query(sql);
    let toDelete = [];

    debug("videos = ", videos);
    videos.forEach((video) => {
      if (
        !video.lastView ||
        moment(video.lastView).diff(moment(), "months") < 1
      ) {
        toDelete.push(video.id);
      }
    });

    if (!toDelete.length) {
      debug("No stale videos to delete");
      return;
    }

    debug("videos to delete :", toDelete);
    let response = await db.query(deleteSql, [[toDelete]]);
    debug("videos delete returned: ", response);
  } catch (err) {
    debug("err caught during deleteStaleVideos: ", err);
  } finally {
    db.release();
  }
}

async function setVideoViewedByUser(source, identifier, userId) {
  const db = await dbService.getConnection();
  const sql = "INSERT INTO `SeenVideo` SET ?";
  const params = [{ userId, source, identifier }];

  try {
    await db.query(sql, params);
  } catch (err) {
    debug(`Err ${err.code} caught during setViewViewedByUser: `);
    if (err.sqlState === "23000") {
      debug("ignoring error, resolvin");
      return Promise.resolve();
    }
  } finally {
    db.release();
  }
}

async function getVideosViewedByUser(userId) {
  const db = await dbService.getConnection();
  const sql = "SELECT * FROM `SeenVideo` WHERE userId = ?";
  const params = [userId];

  try {
    return db.query(sql, params);
  } catch (err) {
    debug(`Err caught during getVideosViewedByUser ${userId}`);
  } finally {
    db.release();
  }
}

module.exports = {
  getVideoInformations,
  saveVideo,
  setVideoPath,
  setVideoComplete,
  searchVideo,
  getBySourceIdentifier,
  saveSub,
  getSubs,
  setVideoLastView,
  deleteStaleVideos,
  setVideoViewedByUser,
  getVideosViewedByUser,
};
