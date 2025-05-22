// controllers/clients.js
const clientModel = require('../models/client');

module.exports = {
  // Получение списка клиентов с пагинацией и фильтрацией
  getClients: async (req, res, next) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sort = 'id', 
        order = 'asc', 
        search = '' 
      } = req.query;
      
      const result = await clientModel.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        order,
        search
      });
      
      res.json({
        data: result.data,
        totalPages: result.totalPages,
        currentPage: result.currentPage
      });
      
    } catch (error) {
      next(error);
    }
  },

  // Получение одного клиента по ID
getClientById: async (req, res, next) => {
  try {
    const client = await clientModel.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }
    
    // Преобразование даты к строке
    const responseClient = {
      ...client,
      registrationDate: client.registrationDate || null
    };
    
    res.json(responseClient);
    
  } catch (error) {
    next(error);
  }
},
  // Создание нового клиента
  createClient: async (req, res, next) => {
    try {
      const { fullName, phone, email } = req.body;
      
      // Валидация данных
      if (!fullName || !phone) {
        return res.status(400).json({ error: 'ФИО и телефон обязательны' });
      }

      const newClient = await clientModel.create({
        fullName,
        phone,
        email: email || null
      });
      
      res.status(201).json(newClient);
      
    } catch (error) {
      next(error);
    }
  },

  // Обновление данных клиента
  updateClient: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { fullName, phone, email } = req.body;
      
      // Проверка существования клиента
      const existingClient = await clientModel.findById(id);
      if (!existingClient) {
        return res.status(404).json({ error: 'Клиент не найден' });
      }

      // Валидация данных
      if (!fullName) {
        return res.status(400).json({ error: 'ФИО обязательно' });
      }

      const updatedClient = await clientModel.update(id, {
        fullName,
        phone,
        email: email || null
      });
      
      res.json(updatedClient);
      
    } catch (error) {
      next(error);
    }
  },

  // Удаление клиента
  deleteClient: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const result = await clientModel.delete(id);
      
      if (!result) {
        return res.status(404).json({ error: 'Клиент не найден' });
      }
      
      res.json({ message: 'Клиент успешно удален' });
      
    } catch (error) {
      next(error);
    }
  },

  // Дополнительные методы при необходимости
  // Например, поиск клиентов по email
  searchClientsByEmail: async (req, res, next) => {
    try {
      const { email } = req.query;
      const clients = await clientModel.findByEmail(email);
      res.json(clients);
    } catch (error) {
      next(error);
    }
  }
};