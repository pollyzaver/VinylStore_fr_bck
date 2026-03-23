import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

const ProductCard = ({ product, onProductClick }) => {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(isInFavorites(product.id));
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsAdding(true);
    addToCart(product);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 300);
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isFavorite) {
      const removed = await removeFromFavorites(product.id);
      if (removed) setIsFavorite(false);
    } else {
      const added = await addToFavorites(product);
      if (added) setIsFavorite(true);
    }
  };

  const handleCardClick = (e) => {
    // Не открываем модалку, если клик был по кнопке
    if (e.target.closest('.favorite-button') || e.target.closest('.add-to-cart-btn')) {
      return;
    }
    if (onProductClick) {
      onProductClick(product);
    }
  };

  // Обработка тач-событий для мобильных
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchEnd - touchStart;
    // Если свайп (скролл) - не открываем модалку
    if (Math.abs(distance) > 10) return;
    
    if (!e.target.closest('.favorite-button') && !e.target.closest('.add-to-cart-btn')) {
      if (onProductClick) {
        onProductClick(product);
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <article 
      className="product-card" 
      data-category={product.category}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      <button 
        className={`favorite-button ${isFavorite ? 'active' : ''}`}
        onClick={handleToggleFavorite}
        onTouchEnd={(e) => {
          e.stopPropagation();
          handleToggleFavorite(e);
        }}
        aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.5)',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          transition: 'all 0.3s ease'
        }}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill={isFavorite ? '#ff4444' : 'none'} 
          stroke={isFavorite ? '#ff4444' : 'white'} 
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      <div className="product-image">
        {product.badge && <div className="product-badge">{product.badge}</div>}
        <img 
          src={process.env.PUBLIC_URL + product.image} 
          alt={`Обложка альбома ${product.title} - ${product.description}`}
          loading="lazy"
        />
      </div>
      
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-meta">
          <span className="product-year">{product.year}</span>
          <span className="product-genre">{product.genre}</span>
          <span className="product-format">{product.format}</span>
        </div>
        
        <div className="product-footer">
          <div className="product-price">{product.price.toLocaleString()} ₽</div>
          <button 
            className={`add-to-cart-btn ${isAdding ? 'adding' : ''}`}
            onClick={handleAddToCart}
            onTouchEnd={(e) => {
              e.stopPropagation();
              handleAddToCart(e);
            }}
            aria-label={`Добавить ${product.title} в корзину за ${product.price} рублей`}
            disabled={isAdding}
          >
            {isAdding ? 'Добавляется...' : 'Добавить в корзину'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;