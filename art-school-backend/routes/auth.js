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

module.exports = router;