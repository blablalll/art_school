// models/user.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

module.exports = {
  // Поиск пользователя по логину
  findByUsername: async (username) => {
    const { rows } = await pool.query(
      'SELECT id, username, password, role, type FROM users WHERE username = $1',
      [username]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  // Проверка пароля
  verifyPassword: async (user, password) => {
    if (!user || !user.password) {
      return false; // ❌ Нет пользователя → нет проверки
    }
    return bcrypt.compare(password, user.password);
  },

  // Создание пользователя
  createUser: async ({ username, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    return rows[0];
  }
};