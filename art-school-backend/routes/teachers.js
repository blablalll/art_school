// routes/teachers.js
const express = require('express');
const router = express.Router();
const teachersController = require('../controllers/teachers');
const { checkAuth } = require('../middleware/auth');

router.get('/', checkAuth, teachersController.getTeachers);
router.get('/:id', checkAuth, teachersController.getTeacherById);
// Добавляем новый эндпоинт для секций преподавателя
router.get('/:teacherId/sections', checkAuth, teachersController.getTeacherSections);
router.post('/', checkAuth, teachersController.createTeacher);
router.put('/:id', checkAuth, teachersController.updateTeacher);
router.delete('/:id', checkAuth, teachersController.deleteTeacher);

module.exports = router;