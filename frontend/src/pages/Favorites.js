import React, { useEffect, useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

const Favorites = ({ onNavigate }) => {
  const { favoritesProducts, loading, refreshFavorites } = useFavorites();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    refreshFavorites();
  }, []);

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
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px',
          marginBottom: '40px',
          marginTop: '40px'
        }}>
          <h1 className="section-title" style={{ marginBottom: 0 }}>
            ❤️ Моё избранное
          </h1>
          {favoritesProducts.length > 0 && (
            <span style={{
              background: 'var(--vinyl-red)',
              padding: '5px 15px',
              borderRadius: '20px',
              fontSize: '1rem'
            }}>
              {favoritesProducts.length} {favoritesProducts.length === 1 ? 'товар' : 'товаров'}
            </span>
          )}
        </div>

        {/* Контент */}
        {favoritesProducts.length === 0 ? (
          <div className="empty-favorites" style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'var(--vinyl-card)',
            borderRadius: '20px',
            border: '2px dashed var(--vinyl-border)'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '20px' }}>❤️</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>
              Здесь пока пусто
            </h2>
            <p style={{ color: 'var(--vinyl-muted)', marginBottom: '30px', maxWidth: '400px', marginInline: 'auto' }}>
              Добавляйте понравившиеся пластинки в избранное, чтобы не потерять их
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('home')}
              style={{ padding: '12px 40px', fontSize: '1.1rem' }}
            >
              Перейти в каталог
            </button>
          </div>
        ) : (
          <div className="favorites-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '30px',
            marginBottom: '60px'
          }}>
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