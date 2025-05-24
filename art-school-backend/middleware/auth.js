// middleware/auth.js
function checkAuth(req, res, next) {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ error: 'Неавторизован' });
  }
  next();
}

function checkAdmin(req, res, next) {
  const user = req.session.user;

  if (!user || !user.isAuthenticated || user.role !== 'admin') {
    return res.status(403).json({
      error: 'Доступ запрещен',
      message: 'Требуются права администратора'
    });
  }

  next();
}

// Упрощённая версия без NODE_ENV
function checkSubAdminRestricted(req, res, next) {
  const user = req.session.user;

  // Если пользователь не авторизован — ошибка
  if (!user || !user.isAuthenticated) {
    return res.status(401).json({ error: 'Неавторизован' });
  }

  // Пропускаем всех, кроме subadmin
  if (user.role !== 'admin' || user.type === 'subadmin') {
    return next(); // ✅ Все, кроме subadmin, проходят
  }

  // Для subadmin ограничиваем доступ
  const restrictedRoutes = ['/api/teachers', '/api/sections'];
  const currentRoute = req.baseUrl;
  const method = req.method;

  // Разрешаем только GET-запросы для subadmin
  if (method === 'GET' && restrictedRoutes.some(route => currentRoute.startsWith(route))) {
    return next(); // ✅ GET разрешён
  }

  // Остальные действия запрещены
  return res.status(403).json({
    error: 'Доступ запрещен',
    message: 'У вас нет прав на выполнение этого действия'
  });
}

module.exports = {
  checkAuth,
  checkAdmin,
  checkSubAdminRestricted
};