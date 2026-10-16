import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Cart from './components/Cart';
import Home from './pages/Home';
import Solco from './pages/Solco';
import Register from './pages/Register';
import Login from './pages/Login';
import Taste from './pages/Taste';
import Events from './pages/Events';
import Profile from './pages/Profile';
import { FavoritesProvider } from './context/FavoritesContext';

import './styles/global/variables.css';
import './styles/global/reset.css';
import './styles/global/utilities.css';
import './styles/global/brand.css';
import './styles/components/Buttons.css';
import './styles/components/Header.css';
import './styles/components/Footer.css';
import './styles/components/Cards.css';
import './styles/components/ProductCard.css';
import './styles/components/ProductModal.css';
import './styles/components/Cart.css';
import './styles/components/Pagination.css';
import './styles/components/Accordion.css';
import './styles/components/Forms.css';
import './styles/pages/Home.css';
import './styles/pages/Hero.css';
import './styles/pages/Solco.css';
import './styles/pages/Auth.css';
import './styles/pages/Profile.css';
import './styles/global/brand-overrides.css';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => { if (currentPage !== 'catalog') window.scrollTo({ top: 0 }); }, [currentPage]);

  const renderPage = () => {
    
    switch (currentPage) {
      case 'about':
      case 'contacts':
        return <Solco onNavigate={setCurrentPage} />;
      case 'events':
        return <Events onNavigate={setCurrentPage} />;
      case 'catalog':
        return <Home onNavigate={setCurrentPage} focusCatalog />;
      case 'register':
        return <Register onNavigate={setCurrentPage} />;
      case 'login':
        return <Login onNavigate={setCurrentPage} />;
      case 'favorites':
        return <Profile onNavigate={setCurrentPage} />;
      case 'test':
        return <Taste onNavigate={setCurrentPage} />;
      case 'profile':
        return <Profile onNavigate={setCurrentPage} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <div className="App">
            <Header 
              onCartClick={() => setIsCartOpen(true)}
              onNavigate={setCurrentPage}
              currentPage={currentPage}
            />
            {renderPage()}
            <Footer />
            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onNavigate={setCurrentPage} />
          </div>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;