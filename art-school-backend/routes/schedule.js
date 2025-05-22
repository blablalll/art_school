// routes/schedule.js

const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule'); // ✅ Только один раз
const { checkAuth } = require('../middleware/auth');

// Получить всё расписание
router.get('/', checkAuth, scheduleController.getSchedule);

// Получить запись по ID
router.get('/:id', checkAuth, scheduleController.getScheduleById);

// Получить клиентов по расписанию (для просмотра)
router.get('/:scheduleId/clients', checkAuth, scheduleController.getClientsBySchedule);

// Проверить конфликт
router.post('/check', checkAuth, scheduleController.checkScheduleConflict);

// Добавить запись
router.post('/', checkAuth, scheduleController.createSchedule);

// Обновить запись
router.put('/:id', checkAuth, scheduleController.updateSchedule);

// Удалить запись
router.delete('/:id', checkAuth, scheduleController.deleteSchedule);

module.exports = router;
