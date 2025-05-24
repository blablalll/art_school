// config/db.js
const { Pool } = require('pg');

// Добавим логирование для отладки
console.log('Подключаемся к БД:', {
  host: 'dpg-d0ou20be5dus73d98mvg-a.oregon-postgres.render.com',
  database: 'art_school_um5r'
});

const pool = new Pool({
  user: 'artuser',
  host: 'dpg-d0ou20be5dus73d98mvg-a.oregon-postgres.render.com',
  database: 'art_school_um5r',
  password: 'PmdIFdxTTtwBNiSmOmX5Zpydog5Pb8Eu',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  },
  // Добавляем таймауты для стабильности
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});

// Улучшенная проверка подключения
pool.query('SELECT NOW() AS current_time')
  .then(res => {
    console.log('✅ Подключение к PostgreSQL успешно! Текущее время БД:', res.rows[0].current_time);
  })
  .catch(err => {
    console.error('❌ Ошибка подключения к БД:');
    console.error('Детали ошибки:', err);
    console.error('Проверьте:');
    console.error('1. Доступность БД в панели Render');
    console.error('2. Правильность хоста и учетных данных');
    console.error('3. Настройки SSL в Render PostgreSQL');
  });

// Обработка ошибок в пуле
pool.on('error', (err) => {
  console.error('⚠️ Неожиданная ошибка в пуле соединений:', err);
});

module.exports = pool;