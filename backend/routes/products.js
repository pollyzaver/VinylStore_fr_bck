const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { nanoid } = require('nanoid');

const router = express.Router();
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор товара
 *         title:
 *           type: string
 *           description: Название альбома
 *         description:
 *           type: string
 *           description: Исполнитель
 *         year:
 *           type: integer
 *           description: Год выпуска
 *         genre:
 *           type: string
 *           description: Жанр
 *         format:
 *           type: string
 *           description: Формат (LP, Single и т.д.)
 *         price:
 *           type: integer
 *           description: Цена в рублях
 *         category:
 *           type: string
 *           description: Категория товара
 *         image:
 *           type: string
 *           description: Путь к изображению
 *         badge:
 *           type: string
 *           description: Бейдж (Хит, Новинка и т.д.)
 *       example:
 *         id: "1"
 *         title: "Violator"
 *         description: "Depeche Mode"
 *         year: 1990
 *         genre: "Электроника"
 *         format: "12\" LP"
 *         price: 5290
 *         category: "electronic"
 *         image: "/assets/violator.jpg"
 *         badge: "Хит"
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API для управления товарами
 */

async function readProducts() {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeProducts(products) {
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Возвращает список всех товаров
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Фильтр по категории
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: integer
 *         description: Минимальная цена
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: integer
 *         description: Максимальная цена
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', async (req, res) => {
  try {
    const products = await readProducts();
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

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Возвращает товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Товар найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res) => {
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

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Создает новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               year:
 *                 type: integer
 *               genre:
 *                 type: string
 *               format:
 *                 type: string
 *               price:
 *                 type: integer
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *               badge:
 *                 type: string
 *     responses:
 *       201:
 *         description: Товар создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Неверные данные
 */
router.post('/', async (req, res) => {
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

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Обновляет товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               year:
 *                 type: integer
 *               genre:
 *                 type: string
 *               format:
 *                 type: string
 *               price:
 *                 type: integer
 *               category:
 *                 type: string
 *               badge:
 *                 type: string
 *     responses:
 *       200:
 *         description: Товар обновлен
 *       404:
 *         description: Товар не найден
 *       400:
 *         description: Нет данных для обновления
 */
router.patch('/:id', async (req, res) => {
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

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Удаляет товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар удален
 *       404:
 *         description: Товар не найден
 */
router.delete('/:id', async (req, res) => {
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

module.exports = router;