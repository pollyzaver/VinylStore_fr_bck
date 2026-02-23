const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');

const router = express.Router();
const USERS_FILE = path.join(__dirname, '../data/users.json');
const QUESTIONS_FILE = path.join(__dirname, '../data/test_questions.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware для проверки токена
async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Токен недействителен' });
  }
}

// Вспомогательные функции
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

async function writeUsers(users) {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing users:', error);
    return false;
  }
}

// ===== ПОЛУЧИТЬ ВОПРОСЫ ТЕСТА =====
router.get('/test/questions', async (req, res) => {
  try {
    const data = await fs.readFile(QUESTIONS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error loading questions:', error);
    res.status(500).json({ error: 'Ошибка загрузки вопросов' });
  }
});

// ===== ОТПРАВИТЬ ОТВЕТЫ ТЕСТА =====
router.post('/test/submit', authMiddleware, async (req, res) => {
  try {
    console.log('📝 Получены ответы на тест:', req.body);
    const { answers } = req.body;
    
    if (!answers) {
      return res.status(400).json({ error: 'Нет данных ответов' });
    }

    const users = await readUsers();
    console.log(`👤 Найдено пользователей: ${users.length}`);
    
    const userIndex = users.findIndex(u => u.id === req.userId);
    console.log(`🔍 Индекс пользователя: ${userIndex}`);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Создаём профиль из ответов
    const profile = generateProfileFromAnswers(answers);
    console.log('📊 Сгенерированный профиль:', profile);

    // Обновляем пользователя
    users[userIndex].testCompleted = true;
    users[userIndex].testDate = new Date().toISOString();
    users[userIndex].profile = profile;

    // Сохраняем изменения
    const saved = await writeUsers(users);
    console.log('💾 Сохранение:', saved ? 'успешно' : 'ошибка');

    if (!saved) {
      throw new Error('Не удалось сохранить данные');
    }

    res.json({
      message: 'Тест успешно завершён',
      profile
    });

  } catch (error) {
    console.error('❌ Test submit error:', error);
    res.status(500).json({ error: 'Ошибка сохранения теста: ' + error.message });
  }
});

// ===== ПОЛУЧИТЬ ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ =====
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === req.userId);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({
      profile: user.profile,
      testCompleted: user.testCompleted,
      testDate: user.testDate
    });

  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вспомогательная функция для генерации профиля
function generateProfileFromAnswers(answers) {
  // Убеждаемся, что colors - это массив
  let colors = answers[3];
  if (!colors) {
    colors = ['red', 'black'];
  } else if (!Array.isArray(colors)) {
    colors = [colors];
  }
  
  const profile = {
    visualStyle: answers[1] || 'cyberpunk',
    movie: answers[2] || 'blade_runner',
    colors: colors,
    timeOfDay: answers[4] || 'night',
    primaryGenre: answers[5] || 'electronic',
    aesthetic: answers[6] || 'gothic',
    
    vector: generateVector(answers),
    
    genre: mapToGenre(answers),
    mood: mapToMood(answers),
    era: mapToEra(answers),
    listening_context: 'focused',
    lyrics_importance: 7,
    instrumental_complexity: 8
  };

  return profile;
}

function generateVector(answers) {
  const vector = [];
  
  if (answers[1]) vector.push(getHashValue(answers[1], 10));
  if (answers[2]) vector.push(getHashValue(answers[2], 10));
  if (answers[3] && Array.isArray(answers[3])) {
    answers[3].forEach(color => vector.push(getHashValue(color, 5)));
  }
  if (answers[4]) vector.push(getHashValue(answers[4], 10));
  if (answers[5]) vector.push(getHashValue(answers[5], 10));
  if (answers[6]) vector.push(getHashValue(answers[6], 10));
  
  return vector;
}

function getHashValue(str, max) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % max) / max;
}

function mapToGenre(answers) {
  const genreMap = {
    'cyberpunk': ['electronic', 'industrial'],
    'gothic': ['rock', 'metal'],
    'vaporwave': ['electronic', 'pop'],
    'dreamy': ['ambient', 'indie'],
    'blade_runner': ['electronic', 'ambient'],
    'pulp_fiction': ['rock', 'pop'],
    'interstellar': ['classical', 'ambient'],
    'la_la_land': ['jazz', 'pop']
  };
  
  const mainStyle = answers[1] || 'cyberpunk';
  const movie = answers[2] || 'blade_runner';
  
  return genreMap[mainStyle] || genreMap[movie] || ['electronic', 'rock'];
}

function mapToMood(answers) {
  const moodMap = {
    'cyberpunk': ['energy', 'melancholy'],
    'nature': ['calm', 'inspiration'],
    'retro': ['nostalgia', 'calm'],
    'gothic': ['melancholy', 'aggression'],
    'vaporwave': ['nostalgia', 'calm'],
    'dreamy': ['calm', 'inspiration']
  };
  
  return moodMap[answers[1]] || ['energy', 'melancholy'];
}

function mapToEra(answers) {
  const eraMap = {
    'cyberpunk': '2010s',
    'retro': '1980s',
    'gothic': '1990s',
    'vaporwave': '1980s',
    'pulp_fiction': '1990s',
    'interstellar': '2010s',
    'la_la_land': '2010s'
  };
  
  return eraMap[answers[2]] || eraMap[answers[1]] || 'all';
}

module.exports = router;