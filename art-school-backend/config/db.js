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
  const useSSL = false; // или true для продакшена
  pool = new Pool({
    user: process.env.DB_USER || 'artuser',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'art_school',
    password: process.env.DB_PASSWORD || '1234',
    port: process.env.DB_PORT || 5432,
    ssl: useSSL ? { mode: 'require', rejectUnauthorized: false } : false
  });
}

module.exports = pool;