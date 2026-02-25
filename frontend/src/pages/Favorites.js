import React, { useEffect, useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import '../styles/pages/Favorites.css'; 

const Favorites = ({ onNavigate }) => {
  const { favoritesProducts, loading, refreshFavorites } = useFavorites();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="container">
          <div className="loading-container">
            <div className="vinyl-spinner"></div>
            <p>Загружаем избранное...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="container">
        
        {/* Заголовок */}
        <div className="favorites-header">
          <h1>Моё избранное</h1>
          {favoritesProducts.length > 0 && (
            <span className="favorites-count-badge">
              {favoritesProducts.length} {favoritesProducts.length === 1 ? 'товар' : 'товаров'}
            </span>
          )}
        </div>

        {/* Контент */}
        {favoritesProducts.length === 0 ? (
          <div className="empty-favorites">
            <div className="empty-favorites-icon">❤️</div>
            <h2>Здесь пока пусто</h2>
            <p>
              Добавляйте понравившиеся пластинки в избранное, чтобы не потерять их
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('home')}
            >
              Перейти в каталог
            </button>
          </div>
        ) : (
          <div className="favorites-grid">
            {favoritesProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно */}
      <ProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Favorites;