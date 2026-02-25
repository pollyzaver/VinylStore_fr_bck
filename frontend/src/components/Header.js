import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import '../styles/components/Header.css';

// Иконка корзины
const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1.5" />
    <circle cx="20" cy="21" r="1.5" />
    <path d="M1 2h3l2.5 12.5a2 2 0 0 0 2 1.5h10a2 2 0 0 0 2-1.5L23 6H5.5" strokeLinecap="round"/>
  </svg>
);

// Иконка входа
const LoginIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

// Иконка избранного
const HeartIcon = ({ filled = false }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const Header = ({ onCartClick, onNavigate, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getCartItemsCount } = useCart();
  const { user } = useAuth();
  const { getFavoritesCount } = useFavorites();

  const handleNavigation = (page) => {
    console.log('Navigating to:', page);
    onNavigate(page);
    setIsMenuOpen(false);
  };

  const cartItemsCount = getCartItemsCount();
  const favoritesCount = getFavoritesCount();

  return (
    <>
      <header className="site-header" role="banner">
        <div className="container">
          {/* Левая часть с логотипом */}
          <div className="logo-container">
            <button 
              className="logo"
              onClick={() => handleNavigation('home')}
              aria-label="На главную"
            >
              VinylStore
            </button>
          </div>

          {/* Центральная часть с навигацией */}
          <div className="nav-wrapper">
            <nav 
              id="primary-navigation" 
              className={`site-nav ${isMenuOpen ? 'active' : ''}`}
              aria-label="Основная навигация"
            >
              <ul className="nav-menu">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
                    onClick={() => handleNavigation('home')}
                  >
                    Главная
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
                    onClick={() => handleNavigation('about')}
                  >
                    О нас
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${currentPage === 'contacts' ? 'active' : ''}`}
                    onClick={() => handleNavigation('contacts')}
                  >
                    Контакты
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Правая часть с иконками */}
          <div className="right-container">
            {/* Избранное */}
            <button 
              className={`icon-button favorites-button ${favoritesCount > 0 ? 'has-items' : ''}`}
              onClick={() => handleNavigation('favorites')}
              aria-label="Избранное"
              title="Избранное"
            >
              <HeartIcon filled={favoritesCount > 0} />
              {favoritesCount > 0 && (
                <span className="favorites-count">{favoritesCount}</span>
              )}
            </button>

            {/* Профиль / Вход */}
            {user ? (
              <button 
                className="avatar-button"
                onClick={() => handleNavigation('profile')}
                aria-label="Профиль"
                title="Профиль"
              >
                {user.name[0].toUpperCase()}
              </button>
            ) : (
              <button 
                className="icon-button login-button"
                onClick={() => handleNavigation('login')}
                aria-label="Войти"
                title="Войти"
              >
                <LoginIcon />
              </button>
            )}

            {/* Корзина десктоп */}
            <button 
              className="icon-button cart-button-desktop"
              onClick={onCartClick}
              aria-label="Корзина"
              title="Корзина"
            >
              <CartIcon />
              {cartItemsCount > 0 && (
                <span className="icon-count">{cartItemsCount}</span>
              )}
            </button>

            {/* Корзина мобильная */}
            <button 
              className="icon-button cart-button-mobile"
              onClick={onCartClick}
              aria-label="Корзина"
              title="Корзина"
            >
              <CartIcon />
              {cartItemsCount > 0 && (
                <span className="icon-count">{cartItemsCount}</span>
              )}
            </button>

            {/* Бургер-меню */}
            <button 
              className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
              aria-label="Меню"
              aria-expanded={isMenuOpen}
              aria-controls="primary-navigation"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Оверлей для мобильного меню */}
      <div 
        className={`overlay ${isMenuOpen ? 'active' : ''}`} 
        tabIndex="-1" 
        aria-hidden="true"
        onClick={() => setIsMenuOpen(false)}
      />
    </>
  );
};

export default Header;