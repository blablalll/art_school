// middleware/auth.js
function checkAuth(req, res, next) {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ error: 'Неавторизован' });
  }
  next();
}

function checkAdmin(req, res, next) {
  if (!req.session.isAuthenticated || req.session.user?.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Доступ запрещен', 
      message: 'Требуются права администратора' 
    });
  }
  next();
}

module.exports = { checkAuth, checkAdmin };