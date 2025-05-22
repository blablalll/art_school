function checkSubAdminRestricted(req, res, next) {
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ error: 'Неавторизован' });
  }

  // Пропускаем всех, кроме младших админов (subadmin)
  if (user.role !== 'admin' || user.type === 'subadmin') {
    return next(); // ✅ Правильно: все, кроме subadmin, проходят дальше
  }

  // Теперь только для subadmin
  const restrictedRoutes = ['/api/teachers', '/api/sections'];
  const currentRoute = req.baseUrl;
  const method = req.method;

  // Разрешаем только GET-запросы
  if (method === 'GET' && restrictedRoutes.some(route => currentRoute.startsWith(route))) {
    return next(); // ✅ GET разрешён
  }

  // Остальные методы запрещены
  return res.status(403).json({
    error: 'Доступ запрещен',
    message: 'У вас нет прав на выполнение этого действия'
  });
}

module.exports = checkSubAdminRestricted;