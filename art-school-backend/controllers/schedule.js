// controllers/schedule.js
const scheduleModel = require('../models/schedule');

// Получить всё расписание
exports.getSchedule = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'id', order = 'asc', date, teacherId, sectionId, status, search } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sort,
      order,
      date: date || null,
      teacherId: teacherId ? parseInt(teacherId) : undefined,
      sectionId: sectionId ? parseInt(sectionId) : undefined,
      status: status || null,
      search
    };

    const result = await scheduleModel.findAll(options);

    // Форматируем статус для фронтенда
    const formattedData = {
      ...result,
      data: result.data.map(item => ({
        ...item,
        status: `${item.clientCount}/${item.maxParticipants}`
      }))
    };

    res.json({ success: true, ...formattedData });
  } catch (error) {
    next(error);
  }
};

// Получить запись по ID
exports.getScheduleById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const item = await scheduleModel.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Запись не найдена" });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// Получить клиентов по расписанию
exports.getClientsBySchedule = async (req, res, next) => {
  try {
    const scheduleId = parseInt(req.params.scheduleId);
    const clients = await scheduleModel.getClientsBySchedule(scheduleId);
    res.json({ success: true, data: clients });
  } catch (error) {
    next(error);
  }
};

// Проверка конфликта расписания
exports.checkScheduleConflict = async (req, res, next) => {
  try {
    const { teacherId, dateTime, duration, excludeId } = req.body;

    if (!teacherId || !dateTime || !duration) {
      return res.status(400).json({
        success: false,
        message: "Не хватает обязательных параметров"
      });
    }

    const conflict = await scheduleModel.checkScheduleConflict(
      parseInt(teacherId),
      dateTime,
      parseFloat(duration),
      excludeId ? parseInt(excludeId) : undefined
    );

    res.json({ success: true, conflict });
  } catch (error) {
    next(error);
  }
};

// Добавление новой записи
exports.createSchedule = async (req, res, next) => {
  try {
    const { dateTime, duration, sectionId, teacherId } = req.body;

    if (!dateTime || !duration || !sectionId || !teacherId) {
      return res.status(400).json({
        success: false,
        message: "Заполните все обязательные поля"
      });
    }

    const parsedDate = new Date(dateTime);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ success: false, message: "Некорректная дата" });
    }

    if (parsedDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Нельзя выбрать прошедшее время"
      });
    }

    const conflict = await scheduleModel.checkScheduleConflict(
      parseInt(teacherId),
      dateTime,
      parseFloat(duration)
    );

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "Конфликт расписания",
        conflict: true
      });
    }

    const newItem = await scheduleModel.create({
      dateTime,
      duration: parseFloat(duration),
      sectionId: parseInt(sectionId),
      teacherId: parseInt(teacherId)
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};

// Обновление записи
exports.updateSchedule = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { dateTime, duration, sectionId, teacherId } = req.body;

    if (!dateTime || !duration || !sectionId || !teacherId) {
      return res.status(400).json({
        success: false,
        message: "Заполните все обязательные поля"
      });
    }

    const parsedDate = new Date(dateTime);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ success: false, message: "Некорректная дата" });
    }

    if (parsedDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Нельзя установить прошедшее время"
      });
    }

    const conflict = await scheduleModel.checkScheduleConflict(
      parseInt(teacherId),
      dateTime,
      parseFloat(duration),
      id
    );

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "Конфликт расписания",
        conflict: true
      });
    }

    const updatedItem = await scheduleModel.update(id, {
      dateTime,
      duration: parseFloat(duration),
      sectionId: parseInt(sectionId),
      teacherId: parseInt(teacherId)
    });

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: "Запись не найдена" });
    }

    res.json({ success: true, data: updatedItem });
  } catch (error) {
    next(error);
  }
};

// Удаление записи
exports.deleteSchedule = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await scheduleModel.delete(id);

    if (!result) {
      return res.status(404).json({ success: false, message: "Запись не найдена" });
    }

    res.json({ success: true, message: "Запись успешно удалена" });
  } catch (error) {
    next(error);
  }
};