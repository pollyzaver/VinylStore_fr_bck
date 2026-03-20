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

// ===== CORS (универсальный для продакшена) =====
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// ===== Swagger =====
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// ===== Логирование =====
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${res.statusCode} ${req.url} - ${Date.now() - start}ms`);
  });
  next();
});

// ===== DATA =====
const DATA_FILE = path.join(__dirname, 'data', 'products.json');

async function readProducts() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeProducts(products) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
    return true;
  } catch {
    return false;
  }
}

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);

// ===== PRODUCTS =====

// GET all
app.get('/api/products', async (req, res) => {
  const products = await readProducts();

  const { category, minPrice, maxPrice } = req.query;
  let filtered = [...products];

  if (category) filtered = filtered.filter(p => p.category === category);
  if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));

  res.json(filtered);
});

// GET by id
app.get('/api/products/:id', async (req, res) => {
  const products = await readProducts();
  const product = products.find(p => p.id == req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json(product);
});

// CREATE
app.post('/api/products', async (req, res) => {
  const products = await readProducts();
  const { title, description, price } = req.body;

  if (!title || !description || !price) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const newProduct = {
    id: nanoid(8),
    title,
    description,
    price: Number(price),
    category: 'other'
  };

  products.push(newProduct);
  await writeProducts(products);

  res.status(201).json(newProduct);
});

// DELETE
app.delete('/api/products/:id', async (req, res) => {
  const products = await readProducts();
  const filtered = products.filter(p => p.id != req.params.id);

  await writeProducts(filtered);
  res.status(204).send();
});

// ===== 404 =====
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ===== ERROR =====
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});