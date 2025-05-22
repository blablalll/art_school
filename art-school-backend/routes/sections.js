// routes/sections.js
const express = require('express');
const router = express.Router();
const sectionsController = require('../controllers/sections');
const { checkAuth } = require('../middleware/auth');

// Получить все секции
router.get('/', checkAuth, sectionsController.getAllSections);

// Поиск секций
router.get('/search', checkAuth, sectionsController.searchSections);

// Получить одну секцию
router.get('/:id', checkAuth, sectionsController.getSectionById);

// Создать новую секцию
router.post('/', checkAuth, sectionsController.createSection);

// Обновить секцию
router.put('/:id', checkAuth, sectionsController.updateSection);

// Удалить секцию
router.delete('/:id', checkAuth, sectionsController.deleteSection);

module.exports = router;