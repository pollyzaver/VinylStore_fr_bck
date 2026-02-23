import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Cart from './components/Cart';
import Home from './pages/Home';
import About from './pages/About';
import Contacts from './pages/Contacts';
import Register from './pages/Register';
import Login from './pages/Login';
import Test from './pages/Test';
import Profile from './pages/Profile';
import { FavoritesProvider } from './context/FavoritesContext';
import Favorites from './pages/Favorites';

import './styles/global/variables.css';
import './styles/global/reset.css';
import './styles/global/utilities.css';
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
import './styles/pages/About.css';
import './styles/pages/Contacts.css';
import './styles/pages/Auth.css';
import './styles/pages/Profile.css';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  console.log('Current page:', currentPage);

  const renderPage = () => {
    console.log('Rendering page:', currentPage);
    
    switch (currentPage) {
      case 'about':
        return <About onNavigate={setCurrentPage} />;
      case 'contacts':
        return <Contacts onNavigate={setCurrentPage} />;
      case 'register':
        return <Register onNavigate={setCurrentPage} />;
      case 'login':
        return <Login onNavigate={setCurrentPage} />;
      case 'favorites':
        return <Favorites onNavigate={setCurrentPage} />;
      case 'test':
        console.log('✅ Rendering Test component');
        return <Test onNavigate={setCurrentPage} />;
      case 'profile':
        console.log('✅ Rendering Profile component');
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
            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </div>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;