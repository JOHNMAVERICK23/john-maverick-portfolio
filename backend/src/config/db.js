require('dotenv').config();
const { Pool, types } = require('pg');

types.setTypeParser(1082, (v) => v); // keep DATE as YYYY-MM-DD

// DB_SSL=true verifies the server certificate; DB_SSL=no-verify skips verification
const mode = process.env.DB_SSL;
const ssl = mode === 'true' ? { rejectUnauthorized: true }
  : mode === 'no-verify' ? { rejectUnauthorized: false }
  : undefined;

const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || undefined,
      ssl,
    };

module.exports = new Pool(config);
