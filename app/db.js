const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Force search_path on every new connection
pool.on("connect", (client) => {
  client.query("SET search_path TO schema_admin, public");
});

module.exports = pool;