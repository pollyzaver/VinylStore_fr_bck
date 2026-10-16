const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { nanoid } = require('nanoid');

const router = express.Router();
const USERS_FILE = path.join(__dirname, '../data/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Вспомогательная функция для чтения пользователей
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка чтения users.json:', error);
    // Если файл не существует или пустой, возвращаем пустой массив
    return [];
  }
}

// Вспомогательная функция для записи пользователей
async function writeUsers(users) {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Ошибка записи users.json:', error);
    return false;
  }
}

router.post('/register', [
  body('email').isEmail().withMessage('Некорректный email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов'),
  body('name').notEmpty().withMessage('Имя обязательно').trim().escape()
], async (req, res) => {
  
  // Проверяем валидацию
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, name } = req.body;
    
    // Читаем пользователей
    const users = await readUsers();

    // Проверяем, не занят ли email
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email уже зарегистрирован' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём нового пользователя
    const newUser = {
      id: nanoid(10),
      email,
      password: hashedPassword,
      name,
      avatar: null,
      testCompleted: false,
      testDate: null,
      profile: null,
      favorites: [],
      purchases: [],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };


    // Добавляем в массив
    users.push(newUser);
    
    // Сохраняем в файл
    const saved = await writeUsers(users);
    
    if (!saved) {
      throw new Error('Не удалось сохранить пользователя');
    }
    

    // Создаём JWT токен
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Не отправляем пароль
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'Регистрация успешна',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
  }
});

// ===== ВХОД =====
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const users = await readUsers();

    // Ищем пользователя
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    // Проверяем пароль
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    // Обновляем lastLogin
    user.lastLogin = new Date().toISOString();
    await writeUsers(users);

    // Создаём токен
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Вход выполнен',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ===== ПОЛУЧИТЬ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ =====
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await readUsers();
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);

  } catch (error) {
    console.error('❌ /me error:', error);
    res.status(401).json({ error: 'Токен недействителен' });
  }
});

module.exports = router;