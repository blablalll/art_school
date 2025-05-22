// controllers/auth.js
const userModel = require('../models/user');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

module.exports = {
  // Авторизация
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Все поля обязательны' });
      }

      const user = await userModel.findByUsername(username);
      if (!user) {
        return res.status(401).json({ error: 'Неверные данные' });
      }

      const isValidPassword = await userModel.verifyPassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Неверные данные' });
      }

      req.session.isAuthenticated = true;
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        type: user.type || 'main_admin' // <-- поле типа пользователя
      };

      res.json({ message: 'Вход выполнен' });
    } catch (error) {
      next(error);
    }
  },

  // Выход
  logout: (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка выхода' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Выход выполнен' });
    });
  },

  // Статус авторизации
  checkStatus: (req, res) => {
    if (req.session.isAuthenticated) {
      res.json({ isAuthenticated: true, user: req.session.user });
    } else {
      res.status(401).json({ isAuthenticated: false });
    }
  },

  // Регистрация (добавлено)
  register: async (req, res, next) => {
    try {
      const { username, password, role } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Логин и пароль обязательны' });
      }

      const existingUser = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Пользователь уже существует' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
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
  }
};