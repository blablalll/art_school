//index.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const cors = require('cors');
const pool = require('./config/db');
const app = express();
const PORT = process.env.PORT || 3000;

// Подключение middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Конфигурация сессии
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'user_sessions',
    createTableIfMissing: true,
    pruneSessionInterval: 60 * 60
  }),
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-dev',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

// Маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/sections', require('./routes/sections'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/records', require('./routes/records'));
app.use('/api/abonim', require('./routes/abonim'));

// Статические файлы
app.use(express.static(path.join(__dirname, '../public')));

// Корневой маршрут
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Проверка работоспособности
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('[Ошибка сервера]:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message
  });
});
app.get('/api/pool-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'OK', dbTime: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
  console.log(`🌍 Режим: ${process.env.NODE_ENV || 'development'}`);
});