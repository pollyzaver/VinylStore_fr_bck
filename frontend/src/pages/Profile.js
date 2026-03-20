import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import axios from 'axios';
import ProductModal from '../components/ProductModal'; // 👈 ИМПОРТ МОДАЛКИ

const Profile = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState(null);
  
  // Состояния для модалки
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const goToTest = () => {
    console.log('🚀 Navigating to test from profile');
    if (onNavigate) {
      onNavigate('test');
    }
  };

  const handleLogout = () => {
    logout();
    if (onNavigate) {
      onNavigate('home');
    }
  };

  // Обработчик клика по карточке
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  useEffect(() => {
    console.log('Profile page: user =', user);
    
    if (!user) {
      console.log('No user, redirecting to login');
      if (onNavigate) {
        onNavigate('login');
      }
      return;
    }
    
    if (user.testCompleted) {
      console.log('User test completed, loading AI recommendations');
      loadAIRecommendations();
    } else {
      console.log('User test not completed');
    }
  }, [user, onNavigate]);

  const loadAIRecommendations = async () => {
    if (!user?.testCompleted || !user?.id) return;
    
    setLoadingAI(true);
    setAiError(null);
    
    try {
      console.log('🤖 Запрашиваем AI-рекомендации для пользователя:', user.id);
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/ai/smart-recommendations`, {
        userId: user.id
      });
      
      console.log('✅ AI-рекомендации получены:', response.data);
      setAiRecommendations(response.data.recommendations || []);
      
    } catch (error) {
      console.error('❌ Ошибка загрузки AI-рекомендаций:', error);
      setAiError('Не удалось загрузить рекомендации. Попробуйте позже.');
    } finally {
      setLoadingAI(false);
    }
  };

  // Функции для перевода (оставляем без изменений)
  const translateGenre = (genre) => {
    const map = {
      'rock': 'Рок',
      'metal': 'Метал',
      'electronic': 'Электроника',
      'jazz': 'Джаз',
      'classical': 'Классика',
      'pop': 'Поп',
      'hiphop': 'Hip-Hop',
      'indie': 'Инди',
      'postpunk': 'Пост-панк',
      'ambient': 'Эмбиент',
      'industrial': 'Индастриал'
    };
    return map[genre] || genre;
  };

  const translateMood = (mood) => {
    const map = {
      'energy': { label: 'Энергия', emoji: '⚡' },
      'melancholy': { label: 'Меланхолия', emoji: '🌧️' },
      'calm': { label: 'Спокойствие', emoji: '😌' },
      'aggression': { label: 'Агрессия', emoji: '👿' },
      'nostalgia': { label: 'Ностальгия', emoji: '📼' },
      'inspiration': { label: 'Вдохновение', emoji: '✨' }
    };
    return map[mood] || { label: mood, emoji: '🎵' };
  };

  const translateEra = (era) => {
    const map = {
      '1960s': '1960-е (психоделика)',
      '1970s': '1970-е (прогрессив)',
      '1980s': '1980-е (пост-панк)',
      '1990s': '1990-е (гранж)',
      '2000s': '2000-е (инди)',
      '2010s': '2010+ (современная)',
      'all': 'Всё подряд'
    };
    return map[era] || era;
  };

  const translateContext = (context) => {
    const map = {
      'background': 'Фоном за делами',
      'headphones': 'В наушниках в транспорте',
      'focused': 'Специально, с хорошей аппаратурой',
      'party': 'На вечеринках с друзьями'
    };
    return map[context] || context;
  };

  const translateVisualStyle = (style) => {
    const map = {
      'cyberpunk': 'Киберпанк',
      'nature': 'Природа',
      'retro': 'Ретро 80-х',
      'minimal': 'Минимализм',
      'gothic': 'Готика',
      'vaporwave': 'Вейпорвейв',
      'industrial': 'Индастриал',
      'dreamy': 'Мечтательность'
    };
    return map[style] || style;
  };

  const translateMovie = (movie) => {
    const map = {
      'blade_runner': 'Бегущий по лезвию',
      'pulp_fiction': 'Криминальное чтиво',
      'interstellar': 'Интерстеллар',
      'drive': 'Драйв',
      'la_la_land': 'Ла-Ла Ленд'
    };
    return map[movie] || movie;
  };

  const translateTimeOfDay = (time) => {
    const map = {
      'morning': 'Утро',
      'day': 'День',
      'evening': 'Вечер',
      'night': 'Ночь'
    };
    return map[time] || time;
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="vinyl-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        
        {/* Шапка профиля */}
        <div className="profile-header vinyl-card" style={{ 
          padding: '40px', 
          marginBottom: '40px',
          background: 'linear-gradient(135deg, var(--vinyl-card) 0%, var(--vinyl-dark) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
            
            {/* Аватар */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'var(--vinyl-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
              fontWeight: 'bold',
              color: 'white',
              boxShadow: '0 0 30px rgba(255,0,0,0.3)'
            }}>
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                user.name[0].toUpperCase()
              )}
            </div>
            
            {/* Информация */}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '5px' }}>{user.name}</h1>
              <p style={{ color: 'var(--vinyl-muted)', marginBottom: '15px' }}>{user.email}</p>
              
              {user.testCompleted ? (
                <div style={{
                  background: 'rgba(255, 60, 60, 0.1)',
                  padding: '8px 20px',
                  borderRadius: '30px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: '1px solid var(--vinyl-red)'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>🧬</span>
                  <span style={{ fontWeight: '600' }}>Vinyl ID активирован</span>
                  <span style={{ color: 'var(--vinyl-muted)', fontSize: '0.9rem' }}>
                    {user.testDate ? `с ${new Date(user.testDate).toLocaleDateString()}` : ''}
                  </span>
                </div>
              ) : (
                <button 
                  className="btn btn-primary"
                  onClick={goToTest}
                  style={{
                    padding: '12px 30px',
                    fontSize: '1.1rem'
                  }}
                >
                  🧬 Пройти тест и получить Vinyl ID
                </button>
              )}
            </div>
          </div>
        </div>

        {user.testCompleted && user.profile ? (
          <>
            {/* Индикатор загрузки AI */}
            {loadingAI && (
              <div className="loading-container" style={{ padding: '40px' }}>
                <div className="vinyl-spinner"></div>
                <p>🎵 Нейросеть подбирает пластинки специально для вас...</p>
              </div>
            )}

            {/* Ошибка AI */}
            {aiError && !loadingAI && (
              <div className="ai-error" style={{
                background: 'rgba(255, 60, 60, 0.1)',
                border: '1px solid var(--vinyl-red)',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                <p style={{ color: 'var(--vinyl-muted)' }}>{aiError}</p>
              </div>
            )}

            {/* AI-рекомендации */}
            {aiRecommendations.length > 0 && (
              <>
                <h2 className="section-title" style={{ 
                  marginBottom: '30px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '2rem' }}>🤖</span>
                  Персональные рекомендации
                </h2>
                
                <div className="ai-recommendations-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '30px',
                  marginBottom: '50px'
                }}>
                  {aiRecommendations.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="product-card ai-card" 
                      onClick={() => handleProductClick(product)}
                      style={{
                        border: '2px solid var(--vinyl-red)',
                        position: 'relative',
                        animation: `fadeInUp 0.5s ease ${index * 0.1}s both`,
                        cursor: 'pointer'
                      }}
                    >
                      {/* Процент совпадения */}
                      {product.matchScore && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'var(--vinyl-red)',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          zIndex: 2,
                          boxShadow: '0 2px 10px rgba(255,0,0,0.3)'
                        }}>
                          Совпадение: {product.matchScore}%
                        </div>
                      )}
                      
                      <div className="product-image">
                        <img 
                          src={process.env.PUBLIC_URL + product.image} 
                          alt={product.title}
                        />
                      </div>
                      
                      <div className="product-info">
                        <h3 className="product-title">{product.title}</h3>
                        <p className="product-description">{product.description}</p>
                        
                        {/* AI-описание */}
                        {product.aiDescription && (
                          <div style={{
                            background: 'rgba(255, 60, 60, 0.05)',
                            padding: '15px',
                            borderRadius: '10px',
                            margin: '15px 0',
                            fontSize: '0.95rem',
                            fontStyle: 'italic',
                            borderLeft: '3px solid var(--vinyl-red)',
                            position: 'relative'
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: '-10px',
                              left: '15px',
                              background: 'var(--vinyl-red)',
                              padding: '2px 10px',
                              borderRadius: '15px',
                              fontSize: '0.8rem',
                              color: 'white'
                            }}>
                              Почему вам понравится
                            </div>
                            <p style={{ marginTop: '15px', color: 'var(--vinyl-text)', lineHeight: '1.6' }}>
                              {product.aiDescription}
                            </p>
                          </div>
                        )}
                        
                        <div className="product-footer">
                          <div className="product-price">{product.price.toLocaleString()} ₽</div>
                          <button 
                            className="add-to-cart-btn"
                            onClick={(e) => {
                              e.stopPropagation(); // Предотвращаем открытие модалки
                              // TODO: добавить в корзину
                              console.log('Добавить в корзину:', product);
                            }}
                          >
                            В корзину
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Если нет рекомендаций и не грузится */}
            {!loadingAI && aiRecommendations.length === 0 && !aiError && (
              <div className="vinyl-card" style={{ 
                padding: '60px', 
                textAlign: 'center',
                marginBottom: '50px'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎵</div>
                <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>Пока нет рекомендаций</h2>
                <p style={{ color: 'var(--vinyl-muted)' }}>
                  Скоро здесь появятся персонализированные подборки
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="test-prompt vinyl-card" style={{ 
            padding: '60px', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, var(--vinyl-card) 0%, var(--vinyl-dark) 100%)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🧬</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>У вас ещё нет Vinyl ID</h2>
            <p style={{ color: 'var(--vinyl-muted)', marginBottom: '30px', maxWidth: '500px', marginInline: 'auto' }}>
              Пройдите наш музыкальный тест, чтобы получить персональный профиль и рекомендации, 
              созданные специально для вас
            </p>
            <button 
              className="btn btn-primary" 
              style={{ padding: '15px 40px', fontSize: '1.2rem' }}
              onClick={goToTest}
            >
              Начать тест
            </button>
          </div>
        )}

        {/* Статистика */}
        <div className="profile-stats" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '30px',
          marginBottom: '40px'
        }}>
          <div className="stat-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div className="stat-number">{user.favorites?.length || 0}</div>
            <div className="stat-label">В избранном</div>
          </div>
          <div className="stat-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div className="stat-number">{user.purchases?.length || 0}</div>
            <div className="stat-label">Куплено пластинок</div>
          </div>
          <div className="stat-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div className="stat-number">
              {user.testCompleted && user.testDate ? new Date(user.testDate).toLocaleDateString() : '—'}
            </div>
            <div className="stat-label">Vinyl ID создан</div>
          </div>
        </div>

        {/* Кнопка выхода */}
        <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '40px' }}>
          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{
              padding: '12px 40px',
              borderColor: 'var(--vinyl-muted)',
              color: 'var(--vinyl-muted)'
            }}
          >
            Выйти из аккаунта
          </button>
        </div>

      </div>

      {/* Модальное окно товара */}
      <ProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Стили для анимаций */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;