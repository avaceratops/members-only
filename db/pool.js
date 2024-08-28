const { Pool } = require('pg');
require('dotenv').config();

module.exports = new Pool({
  host: 'localhost',
  user: process.env.DATABASE_USER,
  database: 'members_only',
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});
