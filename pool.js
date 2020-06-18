const Pool = require("pg").Pool;

module.exports = {
  pool: new Pool({
    user: "me",
    host: "localhost",
    database: "hypertube",
    password: "root",
    port: 5432,
  }),
};
