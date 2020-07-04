const Pool = require("pg").Pool;
const faker = require("faker");
const bcrypt = require("bcrypt");
const moment = require("moment");
const chalk = require("chalk");
const fs = require("fs");
const path = "./scripts/finalTorrents.json";
const scrap_machine = require("./scripts/search");

let torrents;
let totalUser = 42;

const rootPool = new Pool({
  user: "klm",
  host: "localhost",
  database: "postgres",
  password: "root",
  port: 5432,
});

const pool = new Pool({
  user: "me",
  host: "localhost",
  database: "hypertube",
  password: "root",
  port: 5432,
});

const randomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

const setupTorrents = async () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "CREATE TABLE IF NOT EXISTS torrents (id SERIAL, search_vector TSVECTOR, yts_id VARCHAR(255) DEFAULT NULL, torrent9_id VARCHAR(255) DEFAULT NULL, title VARCHAR(1000) DEFAULT NULL, production_year INTEGER DEFAULT NULL, duration INTEGER DEFAULT NULL, rating DOUBLE PRECISION DEFAULT NULL, yts_url VARCHAR(1000) DEFAULT NULL, torrent9_url VARCHAR(1000) DEFAULT NULL, cover_url VARCHAR(1000) DEFAULT NULL,large_cover_url VARCHAR(1000) DEFAULT NULL,summary VARCHAR DEFAULT NULL, imdb_code VARCHAR(100) DEFAULT NULL,yt_trailer VARCHAR(300) DEFAULT NULL,categories VARCHAR DEFAULT NULL,subtitles VARCHAR DEFAULT NULL, languages VARCHAR DEFAULT NULL, torrents VARCHAR DEFAULT NULL, downloaded_at TIMESTAMP DEFAULT NULL, lastviewed_at TIMESTAMP DEFAULT NULL, delete_at TIMESTAMP DEFAULT NULL, PRIMARY KEY (id));",
      (error, res) => {
        if (error) {
          resolve(error);
        } else {
          console.log("TABLE", chalk.green("torrents"), "HAS BEEN CREATED.");
          resolve(true);
        }
      }
    );
  });
};

const setupSettings = async () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "CREATE TABLE IF NOT EXISTS settings (id SERIAL, minProductionYear INTEGER DEFAULT NULL, maxProductionYear INTEGER DEFAULT NULL, categories VARCHAR DEFAULT NULL, languages VARCHAR DEFAULT NULL,subtitles VARCHAR DEFAULT NULL, PRIMARY KEY (id));",
      (error, res) => {
        if (error) {
          resolve(error);
        } else {
          console.log("TABLE", chalk.green("settings"), "HAS BEEN CREATED.");
          resolve(true);
        }
      }
    );
  });
};

const setupComments = async () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "CREATE TABLE IF NOT EXISTS comments (id SERIAL,user_id INTEGER NULL DEFAULT NULL,video_id INTEGER NULL DEFAULT NULL,created_at TIMESTAMP DEFAULT NULL,comment VARCHAR(1000) DEFAULT NULL, PRIMARY KEY (id));",
      (error, res) => {
        if (error) {
          resolve(error);
        } else {
          console.log("TABLE", chalk.green("comments"), "HAS BEEN CREATED.");
          resolve(true);
        }
      }
    );
  });
};

const setupViews = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "CREATE TABLE IF NOT EXISTS views (id SERIAL, user_id INTEGER NULL DEFAULT NULL, torrent_id VARCHAR(1000) NOT NULL, PRIMARY KEY (id));",
      (error, res) => {
        if (error) {
          resolve(error);
        } else {
          console.log("TABLE", chalk.green("views"), "HAS BEEN CREATED.");
          resolve(true);
        }
      }
    );
  });
};

const setupUsers = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "CREATE TABLE IF NOT EXISTS users (id SERIAL, username VARCHAR(64) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, firstname VARCHAR(255) NOT NULL, lastname VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, photos varchar(1000) NOT NULL DEFAULT NULL, connected BOOLEAN DEFAULT FALSE, connected_token VARCHAR(255) NULL DEFAULT NULL,last_connection VARCHAR NULL DEFAULT NULL, verified BOOLEAN DEFAULT FALSE, verified_value VARCHAR(255) NULL DEFAULT NULL,language VARCHAR(255) NULL DEFAULT 'English', PRIMARY KEY (id));",
      (error, res) => {
        if (error) {
          resolve(error);
        } else {
          console.log("TABLE", chalk.green("users"), "HAS BEEN CREATED.");
          resolve(true);
        }
      }
    );
  });
};

const hydrateSeed = async (totalUser) => {
  let hash = await bcrypt.hash("Hypertube42", 10);
  let i = 0;
  let users = [];
  while (i < totalUser) {
    let username = faker.internet.userName();
    let email = faker.internet.email();
    if (
      users.map((e) => e.username).indexOf(username) === -1 &&
      users.map((e) => e.email).indexOf(email) === -1
    ) {
      users.push({
        username: username,
        password: hash,
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName().toUpperCase(),
        email: email,
        photos: faker.internet.avatar(),
        last_connection: moment(
          randomDate(new Date(2018, 0, 1), new Date())
        ).format("DD/MM/YYYY hh:mm:ss"),
        verified: 1,
        verified_value: 1,
        language: "English",
      });
      i++;
    }
  }
  return users;
};

const insertIntoUsers = (user) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO users (username, password, firstname, lastname, email, photos, last_connection, verified, verified_value, language) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
      [
        user.username,
        user.password,
        user.firstname,
        user.lastname,
        user.email,
        user.photos,
        user.last_connection,
        user.verified,
        user.verified_value,
        user.language,
      ],
      (error, results) => {
        if (error) {
          resolve(error);
        } else {
          resolve(0);
        }
      }
    );
  });
};

const insertIntoTorrents = (torrent) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO torrents (search_vector, yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, categories, languages, torrents, downloaded_at, lastviewed_at, delete_at, large_cover_url, summary, imdb_code, yt_trailer, subtitles, duration) VALUES(to_tsvector($1), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)",
      [
        torrent.title ? torrent.title : null,
        torrent.yts_id ? torrent.yts_id : null,
        torrent.torrent9_id ? torrent.torrent9_id : null,
        torrent.title ? torrent.title : null,
        torrent.production_year ? torrent.production_year : null,
        torrent.rating ? torrent.rating : 0,
        torrent.yts_url ? torrent.yts_url : null,
        torrent.torrent9_url ? torrent.torrent9_url : null,
        torrent.cover_url ? torrent.cover_url : null,
        torrent.categories ? JSON.stringify(torrent.categories) : null,
        torrent.languages ? JSON.stringify(torrent.languages) : null,
        torrent.torrents ? JSON.stringify(torrent.torrents) : null,
        null,
        null,
        null,
        torrent.large_image ? torrent.large_image : null,
        torrent.summary ? JSON.stringify(torrent.summary) : null,
        torrent.imdb_code ? torrent.imdb_code : null,
        torrent.yt_trailer ? torrent.yt_trailer : null,
        torrent.subtitles ? JSON.stringify(torrent.subtitles) : null,
        torrent.duration ? torrent.duration : null,
      ],
      (error, results) => {
        if (error) {
          resolve(error);
        } else {
          resolve(0);
        }
      }
    );
  });
};

const populateUsers = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      chalk.yellow(totalUser),
      "USERS WILL BE ADDED TO THE TABLE users."
    );
    const users = await hydrateSeed(totalUser);
    Promise.all(users.map((e) => insertIntoUsers(e)))
      .then((res) => {
        console.log(
          chalk.yellow(totalUser),
          "UNIQUE USERS HAVE BEEN ADDED TO TABLE users, their password is Hypertube42."
        );
        resolve(0);
      })
      .catch((e) => {
        console.log(e);
      });
  });
};

const populateTorrents = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      chalk.yellow(torrents.number_of_movies),
      "TORRENTS WILL BE ADDED TO THE DATABASE. THEY WERE FETCHED THE",
      chalk.yellow(moment(torrents.fetched_at).format("MM/DD/YYYY : HH:mm:ss")),
      "FROM YTS AND TORRENT9"
    );
    Promise.all(torrents.movies.map((e) => insertIntoTorrents(e)))
      .then((res) => {
        console.log(
          chalk.yellow(torrents.number_of_movies),
          "TORRENTS HAVE BEEN ADDED TO TABLE torrents."
        );
        resolve(0);
      })
      .catch((e) => {
        console.log(e);
      });
  });
};

const populateSettings = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      "Getting min/max production year, available languages/subtitles and every categories"
    );
    let settings = {
      minProductionYear: Number.POSITIVE_INFINITY,
      maxProductionYear: 0,
      categories: [],
      languages: [],
      subtitles: [],
    };
    torrents.movies.map((e) => {
      if (e.production_year && e.production_year > settings.maxProductionYear) {
        settings.maxProductionYear = e.production_year;
      }
      if (e.production_year && e.production_year < settings.minProductionYear) {
        settings.minProductionYear = e.production_year;
      }
      if (e.subtitles && e.subtitles.length) {
        e.subtitles.map((subtitle) => {
          let pos = settings.subtitles
            .map((e) => {
              return e.value;
            })
            .indexOf(subtitle.language);
          if (pos === -1) {
            settings.subtitles.push({
              value: subtitle.language,
              label: subtitle.language,
            });
          }
        });
      }
      if (e.categories && e.categories.length) {
        e.categories.map((category) => {
          let pos = settings.categories
            .map((e) => {
              return e.value;
            })
            .indexOf(category);
          if (pos === -1) {
            settings.categories.push({ value: category, label: category });
          }
        });
      }
      if (e.languages && e.languages.length) {
        e.languages.map((languages) => {
          let pos = settings.languages
            .map((e) => {
              return e.value;
            })
            .indexOf(languages);
          if (pos === -1) {
            settings.languages.push({ value: languages, label: languages });
          }
        });
      }
    });
    pool.query(
      "INSERT INTO settings (minProductionYear, maxProductionYear, categories, languages, subtitles) VALUES($1, $2, $3, $4, $5)",
      [
        settings.minProductionYear,
        settings.maxProductionYear,
        JSON.stringify(settings.categories),
        JSON.stringify(settings.languages),
        JSON.stringify(settings.subtitles),
      ],
      (error, results) => {
        if (error) {
          console.log(error);
          resolve(error);
        } else {
          console.log(
            "Settings saved! Oldest movies is from",
            settings.minProductionYear,
            "most recent is from",
            settings.maxProductionYear,
            ". With a total of",
            settings.categories.length,
            "categories,",
            settings.languages.length,
            "languages and",
            settings.subtitles.length,
            "subtitles"
          );
          resolve(0);
        }
      }
    );
  });
};

const setupDatabase = () => {
  return new Promise(function (resolve, reject) {
    rootPool.query(
      "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'me') THEN CREATE ROLE me WITH LOGIN PASSWORD 'root'; END IF; END $$ LANGUAGE plpgsql;",
      (error, resrole) => {
        if (error) {
          reject(error);
        } else {
          console.log(
            "ROLE",
            chalk.green("me"),
            "CREATED WITH PASSWORD 'root'."
          );
          rootPool.query("ALTER ROLE me WITH LOGIN;", (error, reslogin) => {
            if (error) {
              reject(error);
            } else {
              console.log("ROLE", chalk.green("me"), "CAN NOW LOGIN.");
              rootPool.query("ALTER ROLE me CREATEDB;", (error, rescreate) => {
                if (error) {
                  reject(error);
                } else {
                  console.log(
                    "ROLE",
                    chalk.green("me"),
                    "CAN NOW CREATE DATABASES."
                  );
                  rootPool.query(
                    "CREATE DATABASE hypertube;",
                    (error, resdatname) => {
                      if (!error || error.code === "42P04") {
                        console.log(
                          "DATABASE",
                          chalk.green("hypertube"),
                          "HAS BEEN CREATED."
                        );
                        Promise.all([
                          setupTorrents(),
                          setupComments(),
                          setupViews(),
                          setupUsers(),
                          setupSettings(),
                        ])
                          .then((res) => {
                            if (res[0] && res[1] && res[2] && res[3]) {
                              populateUsers()
                                .then((res) => {
                                  populateTorrents()
                                    .then((res) => {
                                      populateSettings()
                                        .then((res) => {
                                          resolve(res);
                                        })
                                        .catch((err) => reject(err));
                                    })
                                    .catch((err) => reject(err));
                                })
                                .catch((err) => reject(err));
                            } else {
                              resolve(1);
                            }
                          })
                          .catch((err) => {
                            reject(err);
                          });
                      } else {
                        reject(error);
                      }
                    }
                  );
                }
              });
            }
          });
        }
      }
    );
  });
};

try {
  if (fs.existsSync(path)) {
    torrents = JSON.parse(fs.readFileSync(path));
    setupDatabase()
      .then((res) => process.exit(res))
      .catch((err) => console.log(err));
  } else {
    (async () => {
      console.error("No file found... lets start the scrape machine!!");
      await scrap_machine.initScraping(false);
      torrents = scrap_machine.torrents;
      setupDatabase()
        .then((res) => process.exit(res))
        .catch((err) => console.log(err));
    })();
  }
} catch (err) {
  console.error(err);
}
