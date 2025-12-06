/*
const pg = require("pg");
const env = require("../env.json");


const Pool = pg.Pool;
const pool = new Pool(env);

pool.connect()
  .then(() => console.log(`Connected to database: ${env.database}`))
  .catch(err => console.error("Database connection error:", err));

module.exports = pool;
*/
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log("Connected to Fly.io Postgres"))
  .catch(err => console.error("Database connection error:", err));

module.exports = pool;
