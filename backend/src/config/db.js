const { Pool } = require('pg');
require('dotenv').config();

let dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.includes('?')) {
  dbUrl = dbUrl.split('?')[0];
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

module.exports = { pool };
