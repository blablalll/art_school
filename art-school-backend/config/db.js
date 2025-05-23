// config/db.js
const { Pool } = require('pg');

const useSSL = process.env.NODE_ENV === 'production'; // Только для Render

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'art_school',
  password: process.env.DB_PASSWORD || '1405',
  port: process.env.DB_PORT || 5432,
  ssl: useSSL ? { mode: 'require', rejectUnauthorized: false } : false
});

module.exports = pool;