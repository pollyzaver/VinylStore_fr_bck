const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { nanoid } = require('nanoid');
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Swagger документация - доступна по /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Vinyl Store API Documentation'
}));

// Логирование
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${res.statusCode} ${req.path} - ${Date.now() - start}ms`);
  });
  next();
});

// Путь к файлу с данными
const DATA_FILE = path.join(__dirname, 'data', 'products.json');

// Чтение данных
async function readProducts() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка чтения:', error);
    return [];
  }
}

// Запись данных
async function writeProducts(products) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Ошибка записи:', error);
    return false;
  }
}

// ============= ПОДКЛЮЧЕНИЕ ВСЕХ МАРШРУТОВ =============
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes); // 👈 ПЕРЕНЕСЕНО СЮДА (ДО 404)

// GET /api/products - все товары
app.get('/api/products', async (req, res) => {
  try {
    const products = await readProducts();
    
    // Фильтрация
    const { category, minPrice, maxPrice } = req.query;
    let filtered = [...products];
    
    if (category) filtered = filtered.filter(p => p.category === category);
    if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));
    
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/products/:id - товар по ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const products = await readProducts();
    const product = products.find(p => p.id == req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/products - создание товара
app.post('/api/products', async (req, res) => {
  try {
    const products = await readProducts();
    const { title, description, year, genre, format, price, category, image, badge, detailedInfo } = req.body;
    
    if (!title || !description || !price) {
      return res.status(400).json({ error: 'Название, описание и цена обязательны' });
    }
    
    const newProduct = {
      id: nanoid(8),
      title: title.trim(),
      description: description.trim(),
      year: year || new Date().getFullYear(),
      genre: genre || 'Разное',
      format: format || '12" LP',
      price: Number(price),
      category: category || 'other',
      image: image || '/assets/default.jpg',
      badge: badge || null,
      detailedInfo: detailedInfo || {
        stock: Math.floor(Math.random() * 10) + 1,
        rating: 4.5
      }
    };
    
    products.push(newProduct);
    await writeProducts(products);
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PATCH /api/products/:id - обновление товара
app.patch('/api/products/:id', async (req, res) => {
  try {
    const products = await readProducts();
    const index = products.findIndex(p => p.id == req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }
    
    products[index] = { ...products[index], ...req.body };
    await writeProducts(products);
    
    res.json(products[index]);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/products/:id - удаление товара
app.delete('/api/products/:id', async (req, res) => {
  try {
    const products = await readProducts();
    const exists = products.some(p => p.id == req.params.id);
    
    if (!exists) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const filtered = products.filter(p => p.id != req.params.id);
    await writeProducts(filtered);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/categories - категории
app.get('/api/categories', async (req, res) => {
  try {
    const products = await readProducts();
    const categories = [...new Set(products.map(p => p.category))];
    
    const result = categories.map(cat => ({
      id: cat,
      name: getCategoryName(cat),
      count: products.filter(p => p.category === cat).length
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вспомогательная функция
function getCategoryName(category) {
  const names = {
    'rock': 'Рок',
    'electronic': 'Электроника',
    'alternative': 'Альтернатива',
    'metal': 'Метал',
    'pop': 'Поп',
    'other': 'Другое'
  };
  return names[category] || category;
}

// 👇 404 обработчик - ДОЛЖЕН БЫТЬ В САМОМ КОНЦЕ
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Обработчик ошибок - тоже в конце
app.use((err, req, res, next) => {
  console.error('Ошибка:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📦 API: http://localhost:${PORT}/api/products`);
  console.log(`📚 Swagger документация: http://localhost:${PORT}/api-docs`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`👤 Profile API: http://localhost:${PORT}/api/profile`);
  console.log(`🤖 AI API: http://localhost:${PORT}/api/ai`);
});