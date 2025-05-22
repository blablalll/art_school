// controllers/sections.js
const Section = require('../models/section');

/**
 * Контроллер для работы с секциями
 */
const sectionsController = {
  /**
   * Получить все секции с пагинацией, сортировкой и фильтрацией
   */
  getAllSections: async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'id', order = 'asc', search = '', id = null } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Валидация пагинации
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return res.status(400).json({ message: 'Неверные параметры пагинации' });
    }

    // Валидация id (должен быть числом)
    let validId = null;
    if (id) {
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
        validId = parsedId;
      } else {
        console.warn('Получен недопустимый ID для фильтрации:', id);
        return res.status(400).json({ message: 'Неверный ID секции' });
      }
    }

    // Вызов модели с валидированными параметрами
    const result = await Section.findAll({
      page: pageNum,
      limit: limitNum,
      sort,
      order,
      search,
      id: validId
    });

    res.json({
      data: result.data,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage
    });
  } catch (error) {
    console.error('Ошибка при получении секций:', error.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
},

  /**
   * Поиск секций по строке запроса
   */
  searchSections: async (req, res) => {
    try {
      const { query } = req.query;
      const result = await Section.findAll({
        page: 1,
        limit: 10,
        search: query
      });
      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Ошибка при поиске секций:', error.message);
      res.status(500).json({
        success: false,
        message: 'Ошибка сервера при поиске секций',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Получить одну секцию по ID
   */
  getSectionById: async (req, res) => {
    try {
      const { id } = req.params;
      const section = await Section.findById(id);
      if (!section) {
        return res.status(404).json({
          success: false,
          message: 'Секция не найдена'
        });
      }
      res.json({
        success: true,
        data: {
          id: section.id,
          name: section.name,
          description: section.description,
          maxParticipants: section.maxParticipants
        }
      });
    } catch (error) {
      console.error('Ошибка при получении секции по ID:', error.message);
      res.status(500).json({
        success: false,
        message: 'Ошибка сервера при получении секции',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Создать новую секцию
   */
  createSection: async (req, res) => {
    try {
      const { name, description = '', maxParticipants } = req.body;
      if (!name || !maxParticipants || maxParticipants < 1) {
        return res.status(400).json({
          success: false,
          message: 'Название и максимальное количество участников обязательны'
        });
      }
      const newSection = await Section.create({
        name,
        description,
        maxParticipants: parseInt(maxParticipants)
      });
      res.status(201).json({
        success: true,
        message: 'Секция успешно создана',
        data: newSection
      });
    } catch (error) {
      console.error('Ошибка при создании секции:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при создании секции',
        error: error.message
      });
    }
  },

  /**
   * Обновить существующую секцию
   */
  updateSection: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description = '', maxParticipants } = req.body;
      if (!name || !maxParticipants || maxParticipants < 1) {
        return res.status(400).json({
          success: false,
          message: 'Название и максимальное количество участников обязательны'
        });
      }
      const updatedSection = await Section.update(id, {
        name,
        description,
        maxParticipants: parseInt(maxParticipants)
      });
      if (!updatedSection) {
        return res.status(404).json({
          success: false,
          message: 'Секция не найдена'
        });
      }
      res.json({
        success: true,
        message: 'Секция успешно обновлена',
        data: updatedSection
      });
    } catch (error) {
      console.error('Ошибка при обновлении секции:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Ошибка при обновлении секции'
      });
    }
  },

  /**
   * Удалить секцию по ID
   */
  deleteSection: async (req, res) => {
    try {
      const { id } = req.params;
      const isDeleted = await Section.delete(id);
      if (!isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'Секция не найдена'
        });
      }
      res.json({
        success: true,
        message: 'Секция успешно удалена'
      });
    } catch (error) {
      console.error('Ошибка при удалении секции:', error.message);
      res.status(500).json({
        success: false,
        message: 'Ошибка сервера при удалении секции',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = sectionsController;