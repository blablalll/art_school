// routes/clients.js

const express = require('express');
const router = express.Router(); // ✅ Добавлено
const clientsController = require('../controllers/clients');
const { checkAuth } = require('../middleware/auth');

// Маршруты для работы с клиентами
router.get('/', checkAuth, clientsController.getClients);
router.get('/:id', checkAuth, clientsController.getClientById);
router.post('/', checkAuth, clientsController.createClient);
router.put('/:id', checkAuth, clientsController.updateClient);
router.delete('/:id', checkAuth, clientsController.deleteClient);
router.get('/search/email', checkAuth, clientsController.searchClientsByEmail);


module.exports = router;