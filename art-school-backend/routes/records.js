// routes/records.js

const express = require('express');
const router = express.Router();
const recordsController = require('../controllers/records');
const { checkAuth } = require('../middleware/auth');

// Получить все записи
router.get('/', checkAuth, recordsController.getAllRecords);

// Получить запись по ID
router.get('/:id', checkAuth, recordsController.getRecordById);

// Создать запись
router.post('/', checkAuth, recordsController.createRecord);

// Удалить запись
router.delete('/:id', checkAuth, recordsController.deleteRecord);

module.exports = router;