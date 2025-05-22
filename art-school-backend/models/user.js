// models/user.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

module.exports = {
findByUsername: async (username) => {
  const { rows } = await pool.query(
    'SELECT id, username, password, role, type FROM users WHERE username = $1',
    [username]
  );
  return rows[0];
},

  verifyPassword: async (user, password) => {
    return bcrypt.compare(password, user.password);
  },

  createUser: async ({ username, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    return rows[0];
  }
};