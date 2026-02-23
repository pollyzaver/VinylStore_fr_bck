// backend/utils/aiRecommender.js
class AIRecommender {
  constructor() {
    console.log('🤖 AI Recommender 2.0 инициализирован');
  }

  // ============= ГЛАВНАЯ ФУНКЦИЯ =============
  async getSmartRecommendations(userProfile, allProducts, allUsers, userHistory = {}) {
    console.log('🎯 Генерация комбинированных рекомендаций...');
    
    // Собираем все возможные источники рекомендаций
    const recommendationSources = [];
    
    // 1. На основе ТЕСТА (всегда, даже без покупок)
    recommendationSources.push(...this.getTestBasedRecommendations(userProfile, allProducts));
    
    // 2. На основе ПОКУПОК (если есть)
    if (userHistory.purchases?.length > 0) {
      recommendationSources.push(...this.getPurchaseBasedRecommendations(
        userHistory.purchases, allProducts
      ));
    }
    
    // 3. На основе ЛАЙКОВ/ИЗБРАННОГО (если есть)
    if (userHistory.favorites?.length > 0) {
      recommendationSources.push(...this.getFavoritesBasedRecommendations(
        userHistory.favorites, allProducts
      ));
    }
    
    // 4. На основе ПОХОЖИХ ПОЛЬЗОВАТЕЛЕЙ (коллаборативная фильтрация)
    const similarUsers = this.findSimilarUsers(userProfile, allUsers);
    if (similarUsers.length > 0) {
      recommendationSources.push(...this.getCollaborativeRecommendations(
        similarUsers, allProducts
      ));
    }
    
    // 5. Добавляем ПОПУЛЯРНОЕ для разнообразия
    recommendationSources.push(...this.getPopularRecommendations(allProducts));
    
    // 6. Взвешиваем и сортируем
    return this.weightAndSortRecommendations(recommendationSources, userProfile);
  }

  // ============= 1. РЕКОМЕНДАЦИИ НА ОСНОВЕ ТЕСТА =============
  getTestBasedRecommendations(profile, allProducts) {
    console.log('📊 Генерация на основе теста');
    const recommendations = [];
    
    for (let product of allProducts) {
      let score = 0;
      
      // Совпадение по жанрам (самое важное)
      if (profile.genre?.includes(product.category)) {
        score += 0.8;
      }
      
      // Совпадение по настроению
      if (profile.mood?.includes('energy') && 
          ['rock', 'metal', 'electronic'].includes(product.category)) {
        score += 0.4;
      }
      if (profile.mood?.includes('melancholy') && 
          ['post-punk', 'ambient', 'indie'].includes(product.category)) {
        score += 0.4;
      }
      
      // Совпадение по визуальному стилю
      if (profile.visualStyle === 'gothic' && 
          ['metal', 'post-punk'].includes(product.category)) {
        score += 0.3;
      }
      if (profile.visualStyle === 'cyberpunk' && 
          product.category === 'electronic') {
        score += 0.3;
      }
      
      // Совпадение по фильму
      if (profile.movie === 'blade_runner' && product.category === 'electronic') {
        score += 0.2;
      }
      if (profile.movie === 'drive' && product.genre === 'электроника') {
        score += 0.2;
      }
      
      if (score > 0) {
        recommendations.push({
          productId: product.id,
          score: score,
          source: 'test',
          reason: this.getTestReason(profile, product)
        });
      }
    }
    
    return recommendations;
  }

  // ============= 2. РЕКОМЕНДАЦИИ НА ОСНОВЕ ПОКУПОК =============
  getPurchaseBasedRecommendations(purchases, allProducts) {
    console.log('🛒 Генерация на основе покупок');
    const recommendations = [];
    
    // Находим похожие товары по категориям купленных
    const purchasedCategories = new Set();
    const purchasedArtists = new Set();
    
    for (let purchaseId of purchases) {
      const product = allProducts.find(p => p.id == purchaseId);
      if (product) {
        purchasedCategories.add(product.category);
        if (product.description) {
          purchasedArtists.add(product.description.toLowerCase());
        }
      }
    }
    
    // Рекомендуем товары из тех же категорий
    for (let product of allProducts) {
      if (purchases.includes(product.id)) continue; // уже куплено
      
      let score = 0;
      
      // Тот же жанр
      if (purchasedCategories.has(product.category)) {
        score += 0.6;
      }
      
      // Тот же исполнитель
      if (product.description && 
          purchasedArtists.has(product.description.toLowerCase())) {
        score += 0.8;
      }
      
      if (score > 0) {
        recommendations.push({
          productId: product.id,
          score: score,
          source: 'purchase',
          reason: 'Похоже на то, что вы уже покупали'
        });
      }
    }
    
    return recommendations;
  }

  // ============= 3. РЕКОМЕНДАЦИИ НА ОСНОВЕ ЛАЙКОВ =============
  getFavoritesBasedRecommendations(favorites, allProducts) {
    console.log('❤️ Генерация на основе избранного');
    // Аналогично покупкам, но с меньшим весом
    const recommendations = this.getPurchaseBasedRecommendations(favorites, allProducts);
    
    // Уменьшаем вес для лайков
    return recommendations.map(r => ({
      ...r,
      score: r.score * 0.7,
      source: 'favorite',
      reason: 'Вы отмечали похожие пластинки'
    }));
  }

  // ============= 4. КОЛЛАБОРАТИВНАЯ ФИЛЬТРАЦИЯ =============
  getCollaborativeRecommendations(similarUsers, allProducts) {
    console.log('👥 Генерация на основе похожих пользователей');
    const recommendations = [];
    const userPurchases = new Map();
    
    // Собираем все покупки похожих пользователей
    for (let {user, similarity} of similarUsers) {
      for (let purchase of user.purchases || []) {
        if (!userPurchases.has(purchase)) {
          userPurchases.set(purchase, []);
        }
        userPurchases.get(purchase).push(similarity);
      }
    }
    
    // Преобразуем в рекомендации
    for (let [productId, similarities] of userPurchases) {
      const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
      recommendations.push({
        productId: productId,
        score: avgSimilarity * 0.8,
        source: 'collaborative',
        reason: 'Люди с вашим вкусом это покупают'
      });
    }
    
    return recommendations;
  }

  // ============= 5. ПОПУЛЯРНОЕ (для разнообразия) =============
  getPopularRecommendations(allProducts) {
    console.log('🔥 Добавляем популярное');
    // Просто берём случайные товары с маленьким весом
    return allProducts
      .filter(() => Math.random() > 0.7) // 30% товаров
      .map(product => ({
        productId: product.id,
        score: 0.2,
        source: 'popular',
        reason: 'Популярная пластинка'
      }));
  }

  // ============= ПОИСК ПОХОЖИХ ПОЛЬЗОВАТЕЛЕЙ =============
  findSimilarUsers(userProfile, allUsers) {
    console.log('🔍 Поиск похожих пользователей...');
    const similarUsers = [];
    
    for (let otherUser of allUsers) {
      if (!otherUser.profile) continue;
      
      let similarity = 0;
      
      // Сравниваем жанры (40%)
      const commonGenres = userProfile.genre?.filter(g => 
        otherUser.profile?.genre?.includes(g)
      ) || [];
      similarity += (commonGenres.length / 3) * 0.4;
      
      // Сравниваем настроение (30%)
      const commonMoods = userProfile.mood?.filter(m => 
        otherUser.profile?.mood?.includes(m)
      ) || [];
      similarity += (commonMoods.length / 2) * 0.3;
      
      // Сравниваем эстетику/фильмы (20%)
      if (userProfile.movie && userProfile.movie === otherUser.profile?.movie) {
        similarity += 0.2;
      }
      
      if (similarity > 0.15) {
        similarUsers.push({
          user: otherUser,
          similarity: Math.min(similarity, 1)
        });
      }
    }
    
    return similarUsers.sort((a, b) => b.similarity - a.similarity);
  }

  // ============= ВЗВЕШИВАНИЕ И СОРТИРОВКА =============
  weightAndSortRecommendations(sources, profile) {
    console.log('⚖️ Взвешивание рекомендаций...');
    
    // Объединяем все рекомендации
    const combined = new Map();
    
    for (let rec of sources) {
      const existing = combined.get(rec.productId);
      if (existing) {
        // Если товар уже есть, суммируем веса
        existing.score += rec.score;
        existing.sources.push(rec.source);
        // Выбираем лучшую причину
        if (rec.score > existing.bestScore) {
          existing.reason = rec.reason;
          existing.bestScore = rec.score;
        }
      } else {
        combined.set(rec.productId, {
          productId: rec.productId,
          score: rec.score,
          sources: [rec.source],
          reason: rec.reason,
          bestScore: rec.score
        });
      }
    }
    
    // Преобразуем в массив и сортируем
    const sorted = Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Топ-10
    
    console.log(`✅ Итоговых рекомендаций: ${sorted.length}`);
    return sorted;
  }

  // ============= ГЕНЕРАЦИЯ ПРИЧИН =============
  getTestReason(profile, product) {
    const reasons = [];
    
    if (profile.genre?.includes(product.category)) {
      reasons.push(`вы любите ${product.category}`);
    }
    
    if (profile.visualStyle === 'cyberpunk' && product.category === 'electronic') {
      reasons.push('это идеально подходит для киберпанк-эстетики');
    }
    
    if (profile.movie === 'blade_runner' && product.category === 'electronic') {
      reasons.push('это звучит как саундтрек к вашему любимому фильму');
    }
    
    if (reasons.length === 0) {
      return 'идеально подходит под ваше настроение';
    }
    
    return 'потому что ' + reasons.join(' и ');
  }

  // ============= ГЕНЕРАЦИЯ AI-ОПИСАНИЯ =============
  generatePersonalDescription(userProfile, product, sources = []) {
    try {
      // Защита от undefined
      if (!userProfile) userProfile = {};
      if (!product) product = {};
      if (!sources) sources = [];
      
      console.log('🎯 Генерация описания для:', product.title);
      
      const reasons = [];
      
      // Безопасная проверка жанров
      const userGenres = Array.isArray(userProfile.genre) ? userProfile.genre : [];
      if (userGenres.length > 0 && product.category && userGenres.includes(product.category)) {
        reasons.push(`вы любите ${product.category}`);
      }
      
      // Безопасная проверка настроения
      const userMoods = Array.isArray(userProfile.mood) ? userProfile.mood : [];
      if (userMoods.length > 0) {
        const moodMap = {
          'energy': 'энергичную музыку',
          'melancholy': 'меланхоличные мелодии',
          'calm': 'спокойную атмосферу',
          'aggression': 'мощное звучание',
          'nostalgia': 'ностальгические ноты',
          'inspiration': 'вдохновляющие треки'
        };
        const moodText = userMoods.map(m => moodMap[m] || m).join(' и ');
        reasons.push(`вы цените ${moodText}`);
      }
      
      // Проверка визуального стиля
      if (userProfile.visualStyle) {
        const styleMap = {
          'cyberpunk': 'киберпанк-эстетику',
          'gothic': 'готическую атмосферу',
          'vaporwave': 'вейпорвейв-стиль',
          'dreamy': 'мечтательное настроение',
          'industrial': 'индустриальное звучание',
          'minimal': 'минимализм',
          'nature': 'природные мотивы',
          'retro': 'ретро-стиль'
        };
        const styleText = styleMap[userProfile.visualStyle] || userProfile.visualStyle;
        reasons.push(`вам близка ${styleText}`);
      }
      
      // Проверка фильма
      if (userProfile.movie) {
        const movieMap = {
          'blade_runner': 'Бегущий по лезвию',
          'pulp_fiction': 'Криминальное чтиво',
          'interstellar': 'Интерстеллар',
          'drive': 'Драйв',
          'la_la_land': 'Ла-Ла Ленд'
        };
        const movieText = movieMap[userProfile.movie] || userProfile.movie;
        reasons.push(`вы любите фильм "${movieText}"`);
      }
      
      // Добавляем источники рекомендаций
      if (sources.length > 0) {
        const sourceMap = {
          'test': 'ваш тест',
          'purchase': 'ваши покупки',
          'favorite': 'избранное',
          'collaborative': 'похожие люди',
          'popular': 'популярное'
        };
        const sourceTexts = sources.map(s => sourceMap[s] || s).join(', ');
        reasons.push(`рекомендация основана на ${sourceTexts}`);
      }
      
      // Формируем описание
      let description = '';
      if (reasons.length > 0) {
        description = `Эта пластинка идеально подходит вам, потому что ${reasons.slice(0, 2).join(' и ')}.`;
      } else {
        description = 'Эта пластинка может стать отличным дополнением вашей коллекции!';
      }
      
      // Добавляем эмоциональную окраску
      const emotions = [
        '✨ Она создаст особенную атмосферу',
        '🎵 Этот альбом точно заслуживает вашего внимания',
        '💫 Многие с вашим вкусом уже оценили его',
        '⭐ Отличный выбор для вашей коллекции',
        '🌟 Вы точно не пожалеете о покупке'
      ];
      
      description += ' ' + emotions[Math.floor(Math.random() * emotions.length)];
      
      return description;
      
    } catch (error) {
      console.error('❌ Ошибка в generatePersonalDescription:', error);
      return 'Эта пластинка идеально подходит под ваше настроение! ✨';
    }
  }
}

module.exports = new AIRecommender();