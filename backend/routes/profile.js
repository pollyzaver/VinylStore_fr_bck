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

// Вспомогательные функции для чтения/записи пользователей
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

// ===== ОСНОВНАЯ ФУНКЦИЯ ГЕНЕРАЦИИ ПРОФИЛЯ =====
/**
 * Преобразует ответы пользователя на тест в структурированный профиль
 * @param {Object} answers - Объект с ответами на вопросы (ключ - id вопроса)
 * @returns {Object} profile - Структурированный профиль пользователя
 */
function generateProfileFromAnswers(answers) {
  console.log('🎯 Генерируем профиль из ответов:', answers);
  
  // Инициализируем профиль с пустыми значениями
  const profile = {
    // === ВИЗУАЛЬНЫЕ И СИТУАТИВНЫЕ ПРЕДПОЧТЕНИЯ ===
    preferredPlaces: [],        // из вопроса 1: лес, горы, море...
    vinylPreference: null,      // из вопроса 4: vintage, new, underground
    eveningVibe: null,          // из вопроса 6: как проводит вечер с винилом
    
    // === МУЗЫКАЛЬНЫЕ ПРЕДПОЧТЕНИЯ ===
    favoriteArtists: [],        // из вопроса 3: выбранные группы
    lyricsImportance: null,     // из вопроса 5: отношение к текстам
    
    // === ЦЕННОСТИ И НАСТРОЕНИЕ ===
    lifeQuotes: [],             // из вопроса 7: выбранные цитаты
    colorPreferences: [],       // из вопроса 2: любимые цвета
    
    // === АГРЕГИРОВАННЫЕ ПАРАМЕТРЫ (для AI-рекомендаций) ===
    genre: [],                  // итоговые жанры (собираются из всех ответов)
    mood: [],                   // итоговое настроение (собирается из всех ответов)
    era: 'all',                  // предпочитаемая эпоха
    
    // === ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ (не удалять!) ===
    listening_context: 'focused',
    lyrics_importance: 5,
    instrumental_complexity: 5
  };

  // ===== ВОПРОС 1: Где бы вы хотели оказаться? =====
  // Влияет на настроение и атмосферу
  if (answers[1]) {
    // Преобразуем в массив (на случай, если пришёл не массив)
    profile.preferredPlaces = Array.isArray(answers[1]) ? answers[1] : [answers[1]];
    
    // Каждое место добавляет определённые настроения
    if (profile.preferredPlaces.includes('forest') || profile.preferredPlaces.includes('mountains')) {
      profile.mood.push('calm', 'peaceful');        // спокойствие
    }
    if (profile.preferredPlaces.includes('sea')) {
      profile.mood.push('melancholy', 'contemplative'); // меланхолия
    }
    if (profile.preferredPlaces.includes('city_night')) {
      profile.mood.push('energetic', 'modern');     // энергия, современность
    }
    if (profile.preferredPlaces.includes('book_store')) {
      profile.mood.push('cozy', 'intellectual');    // уют, интеллектуальность
    }
    if (profile.preferredPlaces.includes('concert')) {
      profile.mood.push('energetic', 'social');     // энергия, общение
    }
  }

  // ===== ВОПРОС 2: Цвет пластинки =====
  // Цвета связаны с музыкальными жанрами
  if (answers[2]) {
    profile.colorPreferences = Array.isArray(answers[2]) ? answers[2] : [answers[2]];
    
    // Маппинг цветов на жанры
    const colorGenreMap = {
      'black': ['rock', 'metal', 'post-punk'],      // чёрный - тяжёлые жанры
      'red': ['rock', 'metal', 'punk'],             // красный - энергичные
      'blue': ['jazz', 'blues', 'ambient'],         // синий - спокойные
      'white': ['classical', 'ambient', 'minimal'], // белый - минимализм
      'green': ['folk', 'indie', 'acoustic'],       // зелёный - природные
      'gold': ['pop', 'disco', 'glam']              // золотой - яркие
    };
    
    // Добавляем жанры для каждого выбранного цвета
    profile.colorPreferences.forEach(color => {
      const genres = colorGenreMap[color] || [];
      profile.genre.push(...genres);
    });
  }

  // ===== ВОПРОС 3: Любимые группы =====
  // Самый важный вопрос для определения музыкального вкуса
  if (answers[3] && Array.isArray(answers[3])) {
    profile.favoriteArtists = answers[3];
    
    // Маппинг групп на жанры (можно расширять)
    const artistGenreMap = {
      'depeche_mode': ['electronic', 'synth-pop', 'post-punk'],
      'the_beatles': ['rock', 'pop', 'psychedelic'],
      'nirvana': ['grunge', 'rock', 'alternative'],
      'radiohead': ['alternative', 'rock', 'experimental'],
      'metallica': ['metal', 'thrash-metal', 'rock'],
      'queen': ['rock', 'glam-rock', 'pop'],
      'kiss': ['rock', 'glam-rock', 'hard-rock'],
      'maneskin': ['rock', 'glam-rock', 'pop-rock'],
      'kino': ['russian-rock', 'post-punk', 'new-wave'],
      'rammstein': ['metal', 'industrial', 'german'],
      'daft_punk': ['electronic', 'house', 'french-touch'],
      'lana_del_rey': ['pop', 'indie-pop', 'dream-pop'],
      'twenty_one_pilots': ['alternative', 'electropop', 'rap-rock'],
      'kanye_west': ['hip-hop', 'rap', 'experimental'],
      'miles_davis': ['jazz', 'fusion', 'cool-jazz']
    };
    
    // Добавляем жанры выбранных групп
    answers[3].forEach(artist => {
      const genres = artistGenreMap[artist] || [];
      profile.genre.push(...genres);
      
      // Также определяем настроение по группам
      if (['depeche_mode', 'nirvana', 'radiohead', 'kino'].includes(artist)) {
        profile.mood.push('melancholy', 'deep');        // меланхоличные
      }
      if (['metallica', 'rammstein', 'kiss'].includes(artist)) {
        profile.mood.push('energetic', 'aggressive');   // энергичные
      }
      if (['the_beatles', 'queen', 'maneskin'].includes(artist)) {
        profile.mood.push('uplifting', 'joyful');       // радостные
      }
    });
  }

  // ===== ВОПРОС 4: Какую пластинку купите? =====
  // Определяет тип меломана и отношение к музыке
  if (answers[4]) {
    profile.vinylPreference = answers[4];
    
    if (answers[4] === 'vintage') {
      profile.era = '60s-70s';                          // любит старую музыку
      profile.mood.push('nostalgic');                    // ностальгичный
      profile.lyrics_importance = 7;                     // тексты важны
    } else if (answers[4] === 'new') {
      profile.era = 'modern';                             // любит современное
      profile.mood.push('refined');                       // требовательный
      profile.instrumental_complexity = 8;                 // ценит качество звука
    } else if (answers[4] === 'underground') {
      profile.genre.push('indie', 'experimental', 'underground'); // ищет новое
      profile.mood.push('curious', 'adventurous');        // любопытный
    }
  }

  // ===== ВОПРОС 5: Вокал важен? =====
  // Определяет важность текстов и язык
  if (answers[5]) {
    profile.lyricsImportance = answers[5];
    
    if (answers[5] === 'lyrics_english') {
      profile.lyrics_importance = 9;                      // тексты критичны
      profile.genre.push('singer-songwriter', 'indie-pop');
    } else if (answers[5] === 'russian') {
      profile.lyrics_importance = 9;
      profile.genre.push('russian-rock', 'russian-pop', 'bard'); // русскоязычное
    } else if (answers[5] === 'instrumental') {
      profile.lyrics_importance = 2;                      // тексты не важны
      profile.genre.push('ambient', 'classical', 'jazz', 'post-rock');
    } else if (answers[5] === 'mixed') {
      profile.lyrics_importance = 6;                      // среднее
      profile.genre.push('pop', 'rock');
    }
  }

  // ===== ВОПРОС 6: Как проведёте вечер? =====
  // Определяет контекст прослушивания и настроение
  if (answers[6]) {
    profile.eveningVibe = answers[6];
    
    // Маппинг типа вечера на настроение
    const vibeMoodMap = {
      'solo_deep': ['introspective', 'focused', 'deep'],
      'cozy_home': ['relaxed', 'cozy', 'comfortable'],
      'friends_party': ['social', 'energetic', 'fun'],
      'audiophile_session': ['analytical', 'perfectionist', 'detailed'],
      'romantic_dinner': ['romantic', 'tender', 'sensual'],
      'creative_inspiration': ['creative', 'inspired', 'productive']
    };
    
    const moods = vibeMoodMap[answers[6]] || [];
    profile.mood.push(...moods);
  }

  // ===== ВОПРОС 7: Жизненные цитаты =====
  // Определяет глубинные ценности и влияет на музыку
  if (answers[7] && Array.isArray(answers[7])) {
    profile.lifeQuotes = answers[7];
    
    // Каждая цитата добавляет свои жанры и настроения
    answers[7].forEach(quote => {
      if (quote === 'kino_change') {
        profile.genre.push('russian-rock');
        profile.mood.push('rebellious', 'hopeful');      // бунтарский, надеющийся
      } else if (quote === 'queen_show') {
        profile.mood.push('resilient', 'determined');    // стойкий
      } else if (quote === 'kelly_stronger' || quote === 'elton_standing') {
        profile.mood.push('empowered', 'strong');        // сильный
      } else if (quote === 'depeche_mode') {
        profile.genre.push('electronic');
        profile.mood.push('introspective', 'dark');      // мрачный, задумчивый
      } else if (quote === 'bonjovi_life') {
        profile.mood.push('independent', 'confident');   // независимый
      } else if (quote === 'rammstein_weh') {
        profile.genre.push('industrial');
        profile.mood.push('powerful', 'intense');        // мощный
      } else if (quote === 'nirvana_smells') {
        profile.genre.push('grunge');
        profile.mood.push('angsty', 'authentic');        // искренний, бунтующий
      }
    });
  }

  // ===== ФИНАЛЬНАЯ ОБРАБОТКА =====
  
  // Убираем дубликаты из genre и mood
  profile.genre = [...new Set(profile.genre)];
  profile.mood = [...new Set(profile.mood)];
  
  // Если жанров всё ещё нет, добавляем базовые
  if (profile.genre.length === 0) {
    profile.genre = ['rock', 'pop']; // дефолтные жанры
  }
  
  // Если настроения нет, добавляем базовое
  if (profile.mood.length === 0) {
    profile.mood = ['balanced']; // дефолтное настроение
  }

  console.log('📊 Итоговый профиль:', JSON.stringify(profile, null, 2));
  return profile;
}

module.exports = router;