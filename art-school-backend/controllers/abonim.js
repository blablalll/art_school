
// controllers/abonim.js
const Abonim = require('../models/abonim');
const { checkAuth } = require('../middleware/auth');

/**
 * === Контроллер для работы с абонементами ===
 */
const abonimController = {
  /**
   * Получить все абонементы (с пагинацией, фильтрацией и сортировкой)
   */
getAllAbonims: async (req, res, next) => {
  try {
    let { 
      page = 1, 
      limit = 10, 
      sort = 'startDate', 
      order = 'asc', 
      status,
      clientId,
      startDate
    } = req.query;

    // Добавляем передачу параметров фильтрации в модель
    const result = await Abonim.findAll({ 
      page, 
      limit, 
      sort, 
      order, 
      status,
      clientId,
      startDate
    });
    
    res.json({ ...result, success: true });
  } catch (error) {
    next(error);
  }
},
  /**
   * Добавить новый абонемент
   */
  createAbonim: async (req, res, next) => {
    try {
      const { clientId, startDate, visitCount } = req.body;

      if (!clientId || !startDate || !visitCount) {
        return res.status(400).json({ success: false, message: 'Все поля обязательны' });
      }

      const newAbonim = await Abonim.create({ clientId, startDate, visitCount });
      res.status(201).json({ success: true, data: newAbonim });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получить абонемент по ID
   */
 getAbonimById: async (req, res, next) => {
  try {
    const { id } = req.params;
    const abonim = await Abonim.findById(id);
    if (!abonim) {
      return res.status(404).json({ success: false, message: 'Абонемент не найден' });
    }
    res.json({ success: true, data: abonim });
  } catch (error) {
    next(error);
  }
},

  /**
   * Обновить данные абонемента
   */
  updateAbonim: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { clientId, startDate, visitCount } = req.body;

      const updatedAbonim = await Abonim.update(id, { clientId, startDate, visitCount });

      if (!updatedAbonim) {
        return res.status(404).json({ success: false, message: 'Абонемент не найден' });
      }

      res.json({ success: true, data: updatedAbonim });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удалить абонемент
   */
  deleteAbonim: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await Abonim.delete(id);

      if (!result) {
        return res.status(404).json({ success: false, message: 'Абонемент не найден' });
      }

      res.json({ success: true, message: 'Абонемент успешно удален' });
    } catch (error) {
      next(error);
    }
  }
};


module.exports = abonimController;