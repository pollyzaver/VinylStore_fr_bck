const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const aiRecommender = require('../utils/aiRecommender');

const router = express.Router();
const USERS_FILE = path.join(__dirname, '../data/users.json');
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

async function readProducts() {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
}

router.post('/smart-recommendations', async (req, res) => {
  console.log('📡 Получен запрос на AI-рекомендации:', req.body);
  
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Не указан userId' });
    }

    // Загружаем данные
    const users = await readUsers();
    const allProducts = await readProducts();
    
    console.log(`👥 Загружено пользователей: ${users.length}`);
    console.log(`📦 Загружено товаров: ${allProducts.length}`);
    
    // Находим пользователя
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    if (!user.profile) {
      return res.status(400).json({ error: 'Профиль не найден' });
    }

    console.log('👤 Найден пользователь:', user.name);
    console.log('📊 Профиль пользователя:', user.profile);

    // Получаем умные рекомендации
    const recommendations = await aiRecommender.getSmartRecommendations(
      user.profile,
      allProducts,
      users
    );

    console.log(`✅ Найдено ${recommendations.length} рекомендаций`);

    // Генерируем персональные описания для топ-3
    const enhancedRecommendations = [];
    
    for (let i = 0; i < Math.min(3, recommendations.length); i++) {
      const rec = recommendations[i];
      
      // Находим полный товар по ID
      const product = allProducts.find(p => p.id == rec.productId);
      
      if (product) {
        const description = aiRecommender.generatePersonalDescription(
          user.profile,
          product,
          rec.sources || ['test']
        );
        
        enhancedRecommendations.push({
          ...product,
          aiDescription: description,
          matchScore: Math.floor(Math.random() * 20 + 80),
          sources: rec.sources
        });
      }
    }

    res.json({
      recommendations: enhancedRecommendations,
      basedOn: {
        similarUsers: aiRecommender.findSimilarUsers(user.profile, users).length,
        genres: user.profile.genre
      }
    });

  } catch (error) {
    console.error('❌ AI recommendation error:', error);
    res.status(500).json({ 
      error: 'Ошибка получения рекомендаций',
      details: error.message 
    });
  }
});

module.exports = router;