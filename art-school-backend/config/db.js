// config/db.js
const { Pool } = require('pg');

let pool;

if (process.env.DATABASE_URL) {
  // Для Render: используется DATABASE_URL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // Локальная разработка
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'art_school',
    password: process.env.DB_PASSWORD || '1405',
    port: process.env.DB_PORT || 5432,
    ssl: false
  });
}

module.exports = pool;