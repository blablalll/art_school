//index.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSessionStore = require('connect-pg-simple')(session);
const path = require('path');
const cors = require('cors');
const pool = require('./config/db');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Сессии
app.use(session({
  secret: 'simple-dev-secret-123', // Для учебного проекта сойдёт
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Для HTTP (не HTTPS) в development
}));

// Роуты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/sections', require('./routes/sections'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/records', require('./routes/records'));
app.use('/api/abonim', require('./routes/abonim'));

// Статика
app.use(express.static(path.join(__dirname, '../public')));

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Проверка БД
app.get('/api/pool-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'OK', dbTime: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/db-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS db_time, current_user');
    res.json({
      status: 'OK',
      db_time: result.rows[0].db_time,
      user: result.rows[0].current_user
    });
  } catch (err) {
    res.status(500).json({
      error: 'Database connection failed',
      details: err.message
    });
  }
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

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`🌍 Режим: ${process.env.NODE_ENV || 'development'}`);
});