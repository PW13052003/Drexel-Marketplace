const pg = require("pg");
const env = require("../../../backend/env.json");

const Pool = pg.Pool;
const pool = new Pool(env);

pool.connect()
  .then(() => console.log(`Connected to database: ${env.database}`))
  .catch(err => console.error("Database connection error:", err));

module.exports = pool;