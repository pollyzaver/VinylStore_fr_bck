const authMiddleware = require('./auth');

// Запись в каталог (добавить и удалить пластинку) доступна только администраторам.
// Список почт задаётся в .env: ADMIN_EMAILS=me@example.com,other@example.com
// Если переменная пуста, менять каталог через API не может никто.
const isAdmin = (email) =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes(String(email || '').toLowerCase());

const requireAdmin = [
  authMiddleware,
  (req, res, next) => {
    if (isAdmin(req.userEmail)) return next();
    return res.status(403).json({ error: 'Недостаточно прав', message: 'Менять каталог могут только администраторы' });
  },
];

module.exports = requireAdmin;
