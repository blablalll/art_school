// config/db.js
const { Pool } = require('pg');
module.exports = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'art_school',
  password: process.env.DB_PASSWORD || '1405',
  port: process.env.DB_PORT || 5432
});