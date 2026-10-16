import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import CoverImg from './CoverImg';
import { useFavorites } from '../context/FavoritesContext';

const ProductModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  
  // Используем функцию из контекста для проверки
  const isFavorite = isInFavorites(product?.id);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 300);
  };

  const handleToggleFavorite = async () => {
    if (isFavorite) {
      await removeFromFavorites(product.id);
    } else {
      await addToFavorites(product);
    }
    // Не обновляем локальное состояние, полагаемся на контекст
  };

  if (!isOpen || !product) return null;

  // Получаем расширенную информацию о продукте
  const detailedInfo = getProductDetails(product);

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content product-modal" onClick={e => e.stopPropagation()}>
        <button 
          className="modal-close"
          onClick={onClose}
          aria-label="Закрыть окно"
        >
          ×
        </button>

        <div className="modal-header">
          <div className="modal-breadcrumb">
            <span>Каталог</span> 
            <span>›</span>
            <span>{detailedInfo.categoryName}</span>
            <span>›</span>
            <span>{product.title}</span>
          </div>
        </div>

        <div className="modal-body">
          {/* Левая колонка - изображение */}
          <div className="modal-left">
            <div className="modal-image-container">
              <CoverImg product={product} className="modal-main-image" alt={`Обложка альбома ${product.title}`} />
              {product.badge && (
                <div className={`product-badge badge-${product.badge.toLowerCase()}`}>
                  {product.badge}
                </div>
              )}
              
              {detailedInfo.highlights && detailedInfo.highlights.length > 0 && (
                <div className="special-features">
                  {detailedInfo.highlights.slice(0, 2).map((feature, index) => (
                    <span key={index} className="feature-tag">{feature}</span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="quick-info">
              <div className="info-item">
                <span className="info-label">Артикул:</span>
                <span className="info-value">VIN-{product.id.toString().padStart(3, '0')}</span>
              </div>
              <div className="info-item">
                <span className="info-label">В наличии:</span>
                <span className={`info-value ${detailedInfo.stock > 0 ? 'stock-available' : 'stock-unavailable'}`}>
                  {detailedInfo.stock > 0 ? `${detailedInfo.stock} шт.` : 'Нет в наличии'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Рейтинг:</span>
                <span className="info-value">
                  {detailedInfo.ratingStars}
                </span>
              </div>
            </div>
          </div>

          {/* Правая колонка - информация */}
          <div className="modal-right">
            <div className="product-header">
              <h1 id="modal-title" className="modal-title">{product.title}</h1>
              <p className="modal-artist">{product.description}</p>
              
              <div className="product-meta">
                <span className="meta-item">
                  <span className="meta-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                    </svg>
                  </span>
                  {product.year} год
                </span>
                <span className="meta-item">
                  <span className="meta-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </span>
                  {product.genre}
                </span>
                <span className="meta-item">
                  <span className="meta-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                    </svg>
                  </span>
                  {product.format}
                </span>
                {detailedInfo.label && (
                  <span className="meta-item">
                    <span className="meta-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/>
                      </svg>
                    </span>
                    {detailedInfo.label}
                  </span>
                )}
              </div>
            </div>

            {/* Цена и кнопка */}
            <div className="price-section">
              <div className="price-wrapper">
                <div className="current-price">{product.price.toLocaleString()} ₽</div>
                {detailedInfo.originalPrice && (
                  <>
                    <div className="original-price">{detailedInfo.originalPrice.toLocaleString()} ₽</div>
                    <div className="discount-badge">-{Math.round((1 - product.price/detailedInfo.originalPrice) * 100)}%</div>
                  </>
                )}
              </div>
              
              <div className="action-buttons">
                <button 
                  className={`btn btn-primary modal-add-btn ${isAdding ? 'adding' : ''}`}
                  onClick={handleAddToCart}
                  disabled={isAdding}
                >
                  <span className="btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                  </span>
                  {isAdding ? 'Добавляется...' : 'Добавить в корзину'}
                </button>

                <button 
                  className={`btn btn-secondary wishlist-btn ${isFavorite ? 'active' : ''}`}
                  onClick={handleToggleFavorite}
                  style={{
                    backgroundColor: isFavorite ? 'rgba(224, 84, 90, 0.2)' : '',
                    borderColor: isFavorite ? '#e0545a' : ''
                  }}
                >
                  <span className="btn-icon">
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill={isFavorite ? '#e0545a' : 'none'} 
                      stroke={isFavorite ? '#e0545a' : 'currentColor'} 
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </span>
                  {isFavorite ? 'В избранном' : 'В избранное'}
                </button>
              </div>

              <div className="delivery-info">
                <div className="delivery-item">
                  <span className="delivery-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="1" y="3" width="15" height="13"/>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                      <line x1="8" y1="8" x2="16" y2="8"/>
                      <line x1="23" y1="11" x2="16" y2="11" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <span className="delivery-text">
                    <span className="delivery-title">Доставка по Москве</span>
                    <span className="delivery-detail"><strong> 1-2 дня</strong></span>
                  </span>
                </div>
                <div className="delivery-item">
                  <span className="delivery-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="20 12 20 22 4 22 4 12"/>
                      <rect x="2" y="7" width="20" height="5"/>
                      <line x1="12" y1="22" x2="12" y2="7"/>
                      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                    </svg>
                  </span>
                  <span className="delivery-text">
                    <span className="delivery-title">Бесплатная упаковка</span>
                    <span className="delivery-detail">для подарка</span>
                  </span>
                </div>
              </div>
                
            </div>

            {/* Табы с дополнительной информацией */}
            <div className="product-tabs">
              <div className="tabs-header">
                <button 
                  className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  Об альбоме
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'tracks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tracks')}
                >
                  Треклист
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Детали
                </button>
              </div>
              
              <div className="tabs-content">
                {activeTab === 'about' && (
                  <div className="tab-pane about-pane">
                    <h3>О пластинке</h3>
                    <p className="album-description">{detailedInfo.description}</p>
                    
                    {detailedInfo.highlights && detailedInfo.highlights.length > 0 && (
                      <div className="highlights">
                        <h4>Особенности этого издания:</h4>
                        <ul>
                          {detailedInfo.highlights.map((highlight, index) => (
                            <li key={index}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {detailedInfo.awards && detailedInfo.awards.length > 0 && (
                      <div className="awards">
                        <h4>Награды и достижения:</h4>
                        <div className="awards-list">
                          {detailedInfo.awards.map((award, index) => (
                            <span key={index} className="award-badge">🏆 {award}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'tracks' && (
                  <div className="tab-pane tracks-pane">
                    <h3>Треклист</h3>
                    {detailedInfo.tracklist ? (
                      <div className="tracklist">
                        {Object.entries(detailedInfo.tracklist).map(([side, tracks]) => (
                          <div key={side} className="vinyl-side">
                            <h4>Сторона {side.toUpperCase()}</h4>
                            <ol className="tracks-list">
                              {tracks.map((track, index) => (
                                <li key={index} className="track-item">
                                  <span className="track-number">{index + 1}.</span>
                                  <span className="track-name">{track}</span>
                                  {detailedInfo.durations && detailedInfo.durations[side] && 
                                   detailedInfo.durations[side][index] && (
                                    <span className="track-duration">
                                      {detailedInfo.durations[side][index]}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ol>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-tracks">Информация о трек-листе временно недоступна</p>
                    )}
                  </div>
                )}
                
                {activeTab === 'details' && (
                  <div className="tab-pane details-pane">
                    <h3>Технические характеристики</h3>
                    <div className="specs-grid">
                      <div className="spec-item">
                        <span className="spec-label">Формат:</span>
                        <span className="spec-value">{product.format}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Вес винила:</span>
                        <span className="spec-value">{detailedInfo.weight || '180 грамм'}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Скорость:</span>
                        <span className="spec-value">{detailedInfo.speed || '33⅓ об/мин'}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Страна:</span>
                        <span className="spec-value">{detailedInfo.country || 'ЕС'}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Лейбл:</span>
                        <span className="spec-value">{detailedInfo.label || 'Не указан'}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Штрих-код:</span>
                        <span className="spec-value">{detailedInfo.barcode || 'Не указан'}</span>
                      </div>
                    </div>
                    
                    <div className="care-instructions">
                      <h4>Рекомендации по уходу:</h4>
                      <ul>
                        <li>Храните пластинку в вертикальном положении</li>
                        <li>Избегайте прямого солнечного света</li>
                        <li>Используйте антистатическую щетку перед проигрыванием</li>
                        <li>Оптимальная температура хранения: 18-22°C</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Теги */}
            {detailedInfo.tags && detailedInfo.tags.length > 0 && (
              <div className="product-tags">
                <h4>Теги:</h4>
                <div className="tags-list">
                  {detailedInfo.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Функция для получения детальной информации о продукте
const getProductDetails = (product) => {
  if (product.detailedInfo) {
    const details = {
      ...getDefaultDetails(product),
      ...product.detailedInfo,
      categoryName: getCategoryName(product.category),
      ratingStars: generateRatingStars(product.detailedInfo.rating || getDefaultDetails(product).rating),
      stock: product.detailedInfo.stock || getDefaultDetails(product).stock,
      rating: product.detailedInfo.rating || getDefaultDetails(product).rating
    };
    
    return details;
  }
  
  return getDefaultDetails(product);
};

const getDefaultDetails = (product) => {
  const isSingle = product.format.includes('Single');
  const isMetal = product.category === 'metal';
  const isClassic = product.year < 1990;
  
  const stock = Math.floor(Math.random() * 15) + 5;
  const rating = (Math.random() * (5 - 3.5) + 3.5).toFixed(1);
  
  return {
    categoryName: getCategoryName(product.category),
    stock: stock,
    rating: parseFloat(rating),
    description: `${product.title} — ${product.description ? `альбом группы ${product.description}` : 'музыкальный альбом'}, выпущенный в ${product.year} году. ${isSingle ? 'Редкий сингл' : 'Коллекционное издание'} на виниле с оригинальным звучанием.`,
    label: getRandomLabel(product.genre),
    tracklist: generateDefaultTracklist(product.title, isSingle),
    highlights: generateHighlights(product),
    awards: isClassic ? ['Классический альбом'] : [],
    tags: generateTags(product),
    weight: isMetal ? '180 грамм' : '140 грамм',
    speed: isSingle ? '45 об/мин' : '33⅓ об/мин',
    country: getRandomCountry(),
    edition: isClassic ? 'Винтажное издание' : 'Стандартное',
    ratingStars: generateRatingStars(rating),
    barcode: '8' + Math.floor(Math.random() * 99999999999).toString().padStart(11, '0'),
    features: ['Высокое качество звука', 'Заводская упаковка']
  };
};

// Вспомогательные функции
const getCategoryName = (category) => {
  const categories = {
    'rock': 'Рок',
    'electronic': 'Электроника',
    'alternative': 'Альтернатива',
    'metal': 'Метал',
    'pop': 'Поп',
    'other': 'Другое'
  };
  return categories[category] || 'Другое';
};

const getRandomLabel = (genre) => {
  const labels = {
    'rock': ['Sony Music', 'Universal Music', 'Warner Music'],
    'electronic': ['Mute Records', 'Warp Records', 'Ministry of Sound'],
    'metal': ['Nuclear Blast', 'Century Media', 'Metal Blade'],
    'pop': ['Epic Records', 'Columbia Records', 'RCA Records']
  };
  const genreLabels = labels[genre] || ['Sony Music', 'Universal Music'];
  return genreLabels[Math.floor(Math.random() * genreLabels.length)];
};

const generateDefaultTracklist = (title, isSingle) => {
  if (isSingle) {
    return {
      a: [title],
      b: ['B-side Track']
    };
  }
  
  return {
    a: ['Трек 1', 'Трек 2', 'Трек 3', 'Трек 4'],
    b: ['Трек 5', 'Трек 6', 'Трек 7', 'Трек 8', 'Трек 9']
  };
};

const generateHighlights = (product) => {
  const highlights = ['Высокое качество звука', 'Заводская упаковка'];
  
  if (product.badge === 'Хит') {
    highlights.push('Бестселлер');
  }
  if (product.year < 1990) {
    highlights.push('Винтажное издание');
  }
  if (product.format.includes('Single')) {
    highlights.push('Редкий сингл');
  }
  if (product.price > 8000) {
    highlights.push('Коллекционная ценность');
  }
  
  return highlights;
};

const generateTags = (product) => {
  const tags = [
    product.genre.toLowerCase(),
    product.year.toString(),
    product.category
  ];
  
  if (product.badge) {
    tags.push(product.badge.toLowerCase());
  }
  
  if (product.description.toLowerCase().includes('rammstein')) {
    tags.push('rammstein', 'немецкий');
  }
  if (product.description.toLowerCase().includes('depeche mode')) {
    tags.push('depeche-mode');
  }
  if (product.description.toLowerCase().includes('lana')) {
    tags.push('lana-del-rey');
  }
  
  return tags.filter((tag, index, self) => self.indexOf(tag) === index);
};

const getRandomCountry = () => {
  const countries = ['США', 'Великобритания', 'Германия', 'Франция', 'Япония', 'Россия'];
  return countries[Math.floor(Math.random() * countries.length)];
};

const generateRatingStars = (rating) => {
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  const fullStars = Math.floor(numRating);
  const emptyStars = 5 - fullStars;
  
  return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
};

export default ProductModal;