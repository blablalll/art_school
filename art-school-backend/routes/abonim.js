// routes/abonim.js
const express = require('express');
const router = express.Router();
const abonimController = require('../controllers/abonim');
const { checkAuth } = require('../middleware/auth');

/**
 * === Маршруты для работы с абонементами ===
 */

// Получить все абонементы
router.get('/', checkAuth, abonimController.getAllAbonims);

// Добавить новый абонемент
router.post('/', checkAuth, abonimController.createAbonim);

// Получить абонемент по ID
router.get('/:id', checkAuth, abonimController.getAbonimById);

// Обновить абонемент
router.put('/:id', checkAuth, abonimController.updateAbonim);

// Удалить абонемент
router.delete('/:id', checkAuth, abonimController.deleteAbonim);

module.exports = router;