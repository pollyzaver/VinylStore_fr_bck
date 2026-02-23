const jwt = require('jsonwebtoken');

// Секретный ключ должен быть в .env
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

/**
 * Middleware для проверки авторизации
 * Проверяет наличие и валидность JWT токена в заголовке Authorization
 */
const authMiddleware = (req, res, next) => {
  try {
    // Получаем токен из заголовка Authorization
    // Ожидаем формат: "Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Не авторизован',
        message: 'Отсутствует заголовок Authorization'
      });
    }

    // Разбираем заголовок
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        error: 'Не авторизован',
        message: 'Неверный формат токена. Используйте Bearer <token>'
      });
    }

    const token = parts[1];

    // Проверяем токен
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Добавляем данные пользователя в запрос
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    
    // Переходим к следующему middleware или обработчику
    next();

  } catch (error) {
    // Обрабатываем разные типы ошибок JWT
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Токен истёк',
        message: 'Пожалуйста, войдите снова'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Недействительный токен',
        message: 'Токен повреждён или недействителен'
      });
    }

    // Другие ошибки
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Внутренняя ошибка сервера',
      message: 'Ошибка при проверке авторизации'
    });
  }
};

module.exports = authMiddleware;