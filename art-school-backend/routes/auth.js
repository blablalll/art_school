// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Маршрут для входа в систему
router.post('/login', authController.login);

// Маршрут для выхода из системы
router.post('/logout', authController.logout);

// Маршрут для проверки текущего состояния авторизации
router.get('/check', (req, res) => {
  if (!req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.session.user });
});

// Маршрут для регистрации (если реализован)
if (authController.register) {
  router.post('/register', authController.register);
} else {
  console.warn("Маршрут /register не активирован: функция register отсутствует в authController");
}

module.exports = router;
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

exports.register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    // Проверка данных
    if (!username || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }

    // Проверка существования пользователя
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const newUser = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
      [username, hashedPassword, role || 'client']
    );

    res.status(201).json({
      message: 'Регистрация успешна',
      user: {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username,
        role: newUser.rows[0].role
      }
    });
  } catch (error) {
    next(error);
  }
};
