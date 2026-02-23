import React, { useState} from 'react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

const ProductCard = ({ product, onProductClick }) => {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const [isAdding, setIsAdding] = useState(false);
  
  // Используем функцию из контекста для проверки, а не локальное состояние
  const isFavorite = isInFavorites(product.id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 300);
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    
    if (isFavorite) {
      await removeFromFavorites(product.id);
    } else {
      await addToFavorites(product);
    }
    // Не обновляем локальное состояние, полагаемся на контекст
  };

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  return (
    <article 
      className="product-card" 
      data-category={product.category}
      onClick={handleCardClick}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      <button 
        className={`favorite-button ${isFavorite ? 'active' : ''}`}
        onClick={handleToggleFavorite}
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