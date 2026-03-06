// backend/utils/aiRecommender.js
class AIRecommender {
  constructor() {
    console.log('🤖 AI Recommender 2.0 инициализирован');
    
    // Библиотека фраз для описаний (чтобы не повторяться)
    this.descriptionTemplates = {
      genre: [
        'ваша любовь к {genre} делает эту пластинку идеальным выбором',
        'вы явно цените {genre}, а это лучший представитель жанра',
        'ваш музыкальный вкус ({genre}) идеально сочетается с этим альбомом',
        'эта пластинка — жемчужина в мире {genre}',
        'поклонникам {genre} обычно нравится этот альбом'
      ],
      mood: [
        'её настроение идеально подходит под ваше состояние: {mood}',
        'эта музыка создана для моментов, когда вы чувствуете {mood}',
        'она передаёт именно те эмоции, которые вы ищете — {mood}',
        'в ней есть та самая атмосфера {mood}, которую вы любите'
      ],
      era: [
        'это звучание перенесёт вас в {era} — вашу любимую эпоху',
        'альбом, который идеально отражает дух {era}',
        'вы явно ностальгируете по {era}, и это лучший саундтрек'
      ],
      artist: [
        'от {artist} — для ценителей настоящего звука',
        'если вы любите {artist}, этот альбом станет открытием',
        'похоже на то, что вы слушаете {artist}, а это очень близко по духу'
      ],
      lyrics: [
        'глубокие тексты, которые заставят задуматься',
        'поэзия, переложенная на музыку — то, что вы цените',
        'слова здесь имеют значение, и вы это оцените'
      ],
      instrumental: [
        'инструментальное совершенство без лишних слов',
        'музыка говорит сама за себя — никаких отвлечений',
        'для тех, кто слышит душой, а не ушами'
      ],
      discovery: [
        'редкая находка для тех, кто ищет что-то новое',
        'эту пластинку почти никто не знает, но вы оцените',
        'идеально для вашей коллекции андеграундных открытий'
      ]
    };
  }

  /**
   * ГЛАВНАЯ ФУНКЦИЯ: собирает все источники и возвращает топ-10 рекомендаций
   */
  async getSmartRecommendations(userProfile, allProducts, allUsers, userHistory = {}) {
    console.log('🎯 Генерация комбинированных рекомендаций...');
    console.log('📊 Профиль пользователя:', JSON.stringify(userProfile, null, 2));
    
    const recommendationSources = [];
    
    // 1. На основе ТЕСТА (всегда)
    recommendationSources.push(...this.getTestBasedRecommendations(userProfile, allProducts));
    
    // 2. На основе ПОКУПОК
    if (userHistory.purchases?.length > 0) {
      recommendationSources.push(...this.getPurchaseBasedRecommendations(
        userHistory.purchases, allProducts
      ));
    }
    
    // 3. На основе ИЗБРАННОГО
    if (userHistory.favorites?.length > 0) {
      recommendationSources.push(...this.getFavoritesBasedRecommendations(
        userHistory.favorites, allProducts
      ));
    }
    
    // 4. На основе ПОХОЖИХ ПОЛЬЗОВАТЕЛЕЙ
    const similarUsers = this.findSimilarUsers(userProfile, allUsers);
    if (similarUsers.length > 0) {
      recommendationSources.push(...this.getCollaborativeRecommendations(
        similarUsers, allProducts
      ));
    }
    
    // 5. ПОПУЛЯРНОЕ (немного, для разнообразия)
    recommendationSources.push(...this.getPopularRecommendations(allProducts));
    
    // Взвешиваем, сортируем и добавляем описания
    return this.weightAndSortRecommendations(recommendationSources, userProfile, allProducts);
  }

  /**
   * РЕКОМЕНДАЦИИ НА ОСНОВЕ ТЕСТА
   * Анализирует профиль пользователя и ищет пластинки по:
   * - жанрам (genre)
   * - настроению (mood)
   * - эпохе (era)
   * - предпочтениям в вокале
   */
  getTestBasedRecommendations(profile, allProducts) {
    console.log('📊 Генерация на основе теста');
    const recommendations = [];
    
    for (let product of allProducts) {
      let score = 0;
      let matchReasons = [];
      
      // ===== 1. СОВПАДЕНИЕ ПО ЖАНРАМ (до 1.0 балла) =====
      if (profile.genre?.length > 0 && product.category) {
        const matchedGenres = profile.genre.filter(g => 
          this.matchGenre(g, product.category)
        );
        if (matchedGenres.length > 0) {
          score += Math.min(0.8 + (matchedGenres.length * 0.1), 1.0);
          matchReasons.push({
            type: 'genre',
            value: matchedGenres[0],
            weight: 0.8
          });
        }
      }
      
      // ===== 2. СОВПАДЕНИЕ ПО НАСТРОЕНИЮ (до 0.8 балла) =====
      if (profile.mood?.length > 0) {
        const moodScore = this.calculateMoodMatch(profile.mood, product);
        if (moodScore > 0) {
          score += moodScore;
          matchReasons.push({
            type: 'mood',
            value: profile.mood[0],
            weight: moodScore
          });
        }
      }
      
      // ===== 3. СОВПАДЕНИЕ ПО ЭПОХЕ (до 0.5 балла) =====
      if (profile.era && profile.era !== 'all') {
        const eraScore = this.calculateEraMatch(profile.era, product.year);
        if (eraScore > 0) {
          score += eraScore;
          matchReasons.push({
            type: 'era',
            value: profile.era,
            weight: eraScore
          });
        }
      }
      
      // ===== 4. ПРЕДПОЧТЕНИЯ ВОКАЛА (до 0.4 балла) =====
      if (profile.lyricsImportance) {
        const lyricsScore = this.calculateLyricsMatch(profile.lyricsImportance, product);
        if (lyricsScore > 0) {
          score += lyricsScore;
          matchReasons.push({
            type: 'lyrics',
            value: profile.lyricsImportance,
            weight: lyricsScore
          });
        }
      }
      
      // ===== 5. ВИЗУАЛЬНЫЙ СТИЛЬ (до 0.3 балла) =====
      if (profile.visualStyle) {
        const visualScore = this.calculateVisualMatch(profile.visualStyle, product);
        if (visualScore > 0) {
          score += visualScore;
          matchReasons.push({
            type: 'visual',
            value: profile.visualStyle,
            weight: visualScore
          });
        }
      }
      
      if (score > 0) {
        recommendations.push({
          productId: product.id,
          score: score,
          source: 'test',
          matchReasons: matchReasons,
          product: product
        });
      }
    }
    
    // Сортируем по убыванию и берём топ
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * РЕКОМЕНДАЦИИ НА ОСНОВЕ ПОКУПОК
   * Анализирует историю покупок и ищет похожие пластинки
   */
  getPurchaseBasedRecommendations(purchases, allProducts) {
    console.log('🛒 Генерация на основе покупок');
    
    // Анализируем купленные товары
    const purchasedProducts = purchases
      .map(id => allProducts.find(p => p.id == id))
      .filter(p => p);
    
    if (purchasedProducts.length === 0) return [];
    
    // Собираем профиль покупок
    const purchaseProfile = {
      categories: new Set(),
      artists: new Set(),
      averageYear: 0,
      moods: new Set()
    };
    
    purchasedProducts.forEach(p => {
      purchaseProfile.categories.add(p.category);
      if (p.description) purchaseProfile.artists.add(p.description.toLowerCase());
      purchaseProfile.averageYear += p.year || 2000;
      if (p.mood) p.mood.forEach(m => purchaseProfile.moods.add(m));
    });
    
    purchaseProfile.averageYear /= purchasedProducts.length;
    
    // Ищем похожие товары
    const recommendations = [];
    
    for (let product of allProducts) {
      if (purchases.includes(product.id)) continue;
      
      let score = 0;
      let matchReasons = [];
      
      // Тот же жанр (0.6)
      if (purchaseProfile.categories.has(product.category)) {
        score += 0.6;
        matchReasons.push({ type: 'purchase', value: 'genre', weight: 0.6 });
      }
      
      // Тот же исполнитель (0.8)
      if (product.description && 
          purchaseProfile.artists.has(product.description.toLowerCase())) {
        score += 0.8;
        matchReasons.push({ type: 'purchase', value: 'artist', weight: 0.8 });
      }
      
      // Похожий год выпуска (до 0.4)
      if (product.year) {
        const yearDiff = Math.abs(product.year - purchaseProfile.averageYear);
        if (yearDiff < 10) {
          score += 0.4;
          matchReasons.push({ type: 'purchase', value: 'era', weight: 0.4 });
        } else if (yearDiff < 20) {
          score += 0.2;
        }
      }
      
      if (score > 0) {
        recommendations.push({
          productId: product.id,
          score: score,
          source: 'purchase',
          matchReasons: matchReasons,
          product: product
        });
      }
    }
    
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * РЕКОМЕНДАЦИИ НА ОСНОВЕ ИЗБРАННОГО
   */
  getFavoritesBasedRecommendations(favorites, allProducts) {
    console.log('❤️ Генерация на основе избранного');
    const recommendations = this.getPurchaseBasedRecommendations(favorites, allProducts);
    
    return recommendations.map(r => ({
      ...r,
      score: r.score * 0.7,
      source: 'favorite'
    }));
  }

  /**
   * КОЛЛАБОРАТИВНАЯ ФИЛЬТРАЦИЯ
   * "Люди с вашим вкусом также купили..."
   */
  getCollaborativeRecommendations(similarUsers, allProducts) {
    console.log('👥 Генерация на основе похожих пользователей');
    const recommendations = [];
    const productScores = new Map();
    
    for (let {user, similarity} of similarUsers) {
      for (let purchase of user.purchases || []) {
        const currentScore = productScores.get(purchase) || 0;
        productScores.set(purchase, currentScore + similarity);
      }
    }
    
    for (let [productId, score] of productScores) {
      const product = allProducts.find(p => p.id == productId);
      if (product) {
        recommendations.push({
          productId: productId,
          score: score * 0.8,
          source: 'collaborative',
          matchReasons: [{ type: 'collaborative', value: 'similar-users', weight: score * 0.8 }],
          product: product
        });
      }
    }
    
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * ПОПУЛЯРНОЕ
   */
  getPopularRecommendations(allProducts) {
    console.log('🔥 Добавляем популярное');
    // Простой алгоритм: товары с бейджами "Хит" получают вес
    return allProducts
      .filter(p => p.badge === 'Хит' || p.badge === 'Популярное')
      .map(product => ({
        productId: product.id,
        score: 0.2,
        source: 'popular',
        matchReasons: [{ type: 'popular', value: 'hit', weight: 0.2 }],
        product: product
      }));
  }

  /**
   * ПОИСК ПОХОЖИХ ПОЛЬЗОВАТЕЛЕЙ
   */
  findSimilarUsers(userProfile, allUsers) {
    console.log('🔍 Поиск похожих пользователей...');
    const similarUsers = [];
    
    for (let otherUser of allUsers) {
      if (!otherUser.profile || !otherUser.purchases?.length) continue;
      
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
      similarity += (commonMoods.length / 3) * 0.3;
      
      // Сравниваем эпоху (20%)
      if (userProfile.era && userProfile.era === otherUser.profile?.era) {
        similarity += 0.2;
      }
      
      if (similarity > 0.2) {
        similarUsers.push({
          user: otherUser,
          similarity: Math.min(similarity, 1)
        });
      }
    }
    
    return similarUsers.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ПОДСЧЁТА СОВПАДЕНИЙ
   */
  
  matchGenre(userGenre, productCategory) {
    const genreMap = {
      'rock': ['rock', 'hard-rock', 'glam-rock'],
      'metal': ['metal', 'thrash-metal', 'industrial'],
      'electronic': ['electronic', 'synth-pop', 'house'],
      'pop': ['pop', 'indie-pop', 'dream-pop'],
      'alternative': ['alternative', 'indie', 'grunge'],
      'jazz': ['jazz', 'fusion'],
      'classical': ['classical'],
      'ambient': ['ambient']
    };
    
    return genreMap[userGenre]?.includes(productCategory) || userGenre === productCategory;
  }

  calculateMoodMatch(userMoods, product) {
    if (!product.mood) return 0;
    
    const moodMap = {
      'calm': 0.3,
      'peaceful': 0.3,
      'melancholy': 0.4,
      'contemplative': 0.3,
      'energetic': 0.4,
      'cozy': 0.3,
      'nostalgic': 0.4,
      'rebellious': 0.3,
      'hopeful': 0.3,
      'resilient': 0.3,
      'empowered': 0.3,
      'strong': 0.3,
      'introspective': 0.4,
      'dark': 0.3,
      'independent': 0.3,
      'confident': 0.3,
      'powerful': 0.4,
      'intense': 0.3,
      'angsty': 0.3,
      'authentic': 0.3
    };
    
    let score = 0;
    userMoods.forEach(m => {
      if (moodMap[m]) {
        score += moodMap[m];
      }
    });
    
    return Math.min(score, 0.8);
  }

  calculateEraMatch(userEra, productYear) {
    if (!productYear) return 0;
    
    const eraRanges = {
      '60s': [1960, 1969],
      '70s': [1970, 1979],
      '80s': [1980, 1989],
      '90s': [1990, 1999],
      '00s': [2000, 2009],
      '10s': [2010, 2019],
      '20s': [2020, 2030]
    };
    
    const range = eraRanges[userEra];
    if (!range) return 0;
    
    if (productYear >= range[0] && productYear <= range[1]) {
      return 0.5;
    }
    return 0;
  }

  calculateLyricsMatch(lyricsImportance, product) {
    if (lyricsImportance === 'instrumental') {
      return product.category === 'ambient' || product.category === 'classical' ? 0.4 : 0.1;
    }
    if (lyricsImportance === 'lyrics_english' || lyricsImportance === 'russian') {
      return product.category !== 'ambient' && product.category !== 'classical' ? 0.4 : 0.1;
    }
    return 0.2;
  }

  calculateVisualMatch(visualStyle, product) {
    const visualGenreMap = {
      'cyberpunk': ['electronic'],
      'gothic': ['metal', 'post-punk'],
      'vaporwave': ['electronic', 'pop'],
      'minimalism': ['ambient', 'classical'],
      'nature': ['folk', 'ambient']
    };
    
    const genres = visualGenreMap[visualStyle] || [];
    return genres.includes(product.category) ? 0.3 : 0;
  }

  /**
   * ВЗВЕШИВАНИЕ И СОРТИРОВКА + ГЕНЕРАЦИЯ ОПИСАНИЙ
   */
  weightAndSortRecommendations(sources, profile, allProducts) {
    console.log('⚖️ Взвешивание и сортировка рекомендаций...');
    
    const combined = new Map();
    
    for (let rec of sources) {
      const existing = combined.get(rec.productId);
      if (existing) {
        existing.score += rec.score;
        existing.sources.push(rec.source);
        existing.matchReasons.push(...(rec.matchReasons || []));
      } else {
        combined.set(rec.productId, {
          productId: rec.productId,
          score: rec.score,
          sources: [rec.source],
          matchReasons: rec.matchReasons || [],
          product: rec.product
        });
      }
    }
    
    // Сортируем и генерируем описания для топ-6
    const sorted = Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => {
        const product = allProducts.find(p => p.id == item.productId);
        return {
          ...product,
          matchScore: Math.min(Math.round(item.score * 100), 99),
          matchReasons: item.matchReasons,
          aiDescription: this.generatePersonalDescription(profile, product, item.matchReasons)
        };
      });
    
    console.log(`✅ Итоговых рекомендаций: ${sorted.length}`);
    return sorted;
  }

  /**
   * ГЕНЕРАЦИЯ ПЕРСОНАЛИЗИРОВАННОГО ОПИСАНИЯ
   * Выбирает случайные фразы из библиотеки, чтобы не повторяться
   */
  generatePersonalDescription(userProfile, product, matchReasons = []) {
    try {
      if (!userProfile || !product) return 'Эта пластинка идеально подходит вам! ✨';
      
      const reasons = [];
      
      // Анализируем причины совпадения и генерируем соответствующие описания
      matchReasons.forEach(reason => {
        if (reason.type === 'genre' && this.descriptionTemplates.genre.length > 0) {
          const template = this.getRandomTemplate('genre');
          reasons.push(template.replace('{genre}', this.translateGenre(reason.value)));
        }
        
        if (reason.type === 'mood' && this.descriptionTemplates.mood.length > 0) {
          const template = this.getRandomTemplate('mood');
          reasons.push(template.replace('{mood}', this.translateMood(reason.value)));
        }
        
        if (reason.type === 'era' && this.descriptionTemplates.era.length > 0) {
          const template = this.getRandomTemplate('era');
          reasons.push(template.replace('{era}', reason.value));
        }
        
        if (reason.type === 'purchase' && reason.value === 'artist' && product.description) {
          const template = this.getRandomTemplate('artist');
          reasons.push(template.replace('{artist}', product.description));
        }
        
        if (reason.type === 'lyrics') {
          const template = this.getRandomTemplate('lyrics');
          reasons.push(template);
        }
      });
      
      // Если не хватает причин, добавляем случайные
      if (reasons.length === 0) {
        if (product.badge === 'Хит') {
          reasons.push('Это настоящий хит, который нельзя пропустить');
        } else {
          reasons.push('Эта пластинка точно заслуживает вашего внимания');
        }
      }
      
      // Собираем описание из 1-2 причин
      const selectedReasons = reasons.slice(0, Math.min(2, reasons.length));
      let description = selectedReasons.join(' ');
      
      // Добавляем финальный акцент
      const finalPhrases = [
        ' Идеальный выбор для вашей коллекции! 🎵',
        ' Вы точно не пожалеете о покупке! ✨',
        ' Она создаст особенную атмосферу! 🌟',
        ' Отличное дополнение к вашей виниловой коллекции! 🎸'
      ];
      
      description += finalPhrases[Math.floor(Math.random() * finalPhrases.length)];
      
      return description;
      
    } catch (error) {
      console.error('❌ Ошибка в generatePersonalDescription:', error);
      return 'Эта пластинка идеально подходит под ваше настроение! ✨';
    }
  }

  /**
   * ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   */
  getRandomTemplate(type) {
    const templates = this.descriptionTemplates[type];
    if (!templates || templates.length === 0) return '';
    return templates[Math.floor(Math.random() * templates.length)];
  }

  translateGenre(genre) {
    const map = {
      'rock': 'рок',
      'metal': 'метал',
      'electronic': 'электронику',
      'jazz': 'джаз',
      'pop': 'поп',
      'alternative': 'альтернативу',
      'ambient': 'эмбиент'
    };
    return map[genre] || genre;
  }

  translateMood(mood) {
    const map = {
      'calm': 'спокойствие',
      'peaceful': 'умиротворение',
      'melancholy': 'меланхолию',
      'energetic': 'энергию',
      'cozy': 'уют',
      'nostalgic': 'ностальгию',
      'rebellious': 'бунтарский дух',
      'hopeful': 'надежду',
      'resilient': 'стойкость',
      'empowered': 'силу',
      'introspective': 'глубину',
      'dark': 'мрак',
      'independent': 'независимость',
      'confident': 'уверенность',
      'powerful': 'мощь',
      'intense': 'интенсивность',
      'angsty': 'искренность'
    };
    return map[mood] || mood;
  }
}

module.exports = new AIRecommender();