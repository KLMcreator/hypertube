const Pool = require("pg").Pool;
const faker = require("faker");
const bcrypt = require("bcrypt");
const moment = require("moment");
const fs = require("fs");

let torrents = JSON.parse(fs.readFileSync("./scripts/finalTorrents.json"));
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
      "CREATE TABLE IF NOT EXISTS torrents (id SERIAL, yts_id VARCHAR(255) DEFAULT NULL, torrent9_id VARCHAR(255) DEFAULT NULL, title VARCHAR(255) DEFAULT NULL, production_year INTEGER DEFAULT NULL, rating VARCHAR(255) DEFAULT NULL, yts_url VARCHAR(255) DEFAULT NULL, torrent9_url VARCHAR(255) DEFAULT NULL, cover_url VARCHAR(255) DEFAULT NULL, torrents VARCHAR DEFAULT NULL, downloaded_at TIMESTAMP DEFAULT NULL, lastviewed_at TIMESTAMP DEFAULT NULL, delete_at TIMESTAMP DEFAULT NULL, PRIMARY KEY (id));",
      (error, res) => {
        if (error) {
          resolve(error);
        } else {
          console.log("TABLE torrents HAS BEEN CREATED.");
          resolve(true);
        }
      }
    );
  });
};

const setupComments = async () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "CREATE TABLE IF NOT EXISTS comments (id SERIAL,user_id INTEGER NULL DEFAULT NULL,video_id VARCHAR(1000) NULL DEFAULT NULL,created_at TIMESTAMP DEFAULT NULL,comment VARCHAR(300) DEFAULT NULL, PRIMARY KEY (id));",
      (error, res) => {
        if (error) {
          resolve(error);
        } else {
          console.log("TABLE comments HAS BEEN CREATED.");
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
          console.log("TABLE views HAS BEEN CREATED.");
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
          console.log("TABLE users HAS BEEN CREATED.");
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
      "INSERT INTO torrents (yts_id, torrent9_id, title, production_year, rating, yts_url, torrent9_url, cover_url, torrents, downloaded_at, lastviewed_at, delete_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
      [
        torrent.yts_id ? torrent.yts_id : null,
        torrent.torrent9_id ? torrent.torrent9_id : null,
        torrent.title ? torrent.title : null,
        torrent.production_year ? torrent.production_year : null,
        torrent.rating ? torrent.rating : null,
        torrent.yts_url ? torrent.yts_url : null,
        torrent.torrent9_url ? torrent.torrent9_url : null,
        torrent.cover_url ? torrent.cover_url : null,
        torrent.torrents ? torrent.torrents : null,
        null,
        null,
        null,
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
    console.log(totalUser + " USERS WILL BE ADDED TO THE TABLE users.");
    const users = await hydrateSeed(totalUser);
    Promise.all(users.map((e) => insertIntoUsers(e)))
      .then((res) => {
        console.log(
          totalUser +
            " UNIQUE USERS HAVE BEEN ADDED TO TABLE users, their password is Hypertube42."
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
      torrents.number_of_movies +
        " TORRENTS WILL BE ADDED TO THE DATABASE. THEY WERE FETCHED THE",
      moment(torrents.fetched_at).format("MM/DD/YYYY : HH:mm:ss"),
      "FROM YTS AND TORRENT9"
    );
    Promise.all(torrents.movies.map((e) => insertIntoTorrents(e)))
      .then((res) => {
        console.log(
          torrents.number_of_movies +
            " TORRENTS HAVE BEEN ADDED TO TABLE torrents."
        );
        resolve(0);
      })
      .catch((e) => {
        console.log(e);
      });
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
          console.log("ROLE me CREATED WITH PASSWORD 'root'.");
          rootPool.query("ALTER ROLE me WITH LOGIN;", (error, reslogin) => {
            if (error) {
              reject(error);
            } else {
              console.log("ROLE me CAN NOW LOGIN.");
              rootPool.query("ALTER ROLE me CREATEDB;", (error, rescreate) => {
                if (error) {
                  reject(error);
                } else {
                  console.log("ROLE me CAN NOW CREATE DATABASES.");
                  rootPool.query(
                    "CREATE DATABASE hypertube;",
                    (error, resdatname) => {
                      if (!error || error.code === "42P04") {
                        console.log("DATABASE hypertube HAS BEEN CREATED.");
                        Promise.all([
                          setupTorrents(),
                          setupComments(),
                          setupViews(),
                          setupUsers(),
                        ])
                          .then((res) => {
                            if (res[0] && res[1] && res[2] && res[3]) {
                              populateUsers()
                                .then((res) => {
                                  populateTorrents()
                                    .then((res) => {
                                      resolve(res);
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

setupDatabase()
  .then((res) => process.exit(res))
  .catch((err) => console.log(err));
