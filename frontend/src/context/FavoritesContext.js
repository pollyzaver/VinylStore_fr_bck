import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api } from '../api';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

const KEY = 'solco.fav';

function readIds() {
  try {
    const a = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(a) ? a : [];
  } catch (e) { return []; }
}

// Избранное хранится в браузере и не требует входа.
export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(readIds);
  const [favoritesProducts, setFavoritesProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(favorites)); } catch (e) { /* ок */ }
  }, [favorites]);

  const loadFavorites = useCallback(async () => {
    if (favorites.length === 0) { setFavoritesProducts([]); return; }
    try {
      setLoading(true);
      const all = await api.getProducts();
      const ids = favorites.map(String);
      setFavoritesProducts(all.filter(p => ids.includes(String(p.id))));
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [favorites]);

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  const addToFavorites = async (product) => {
    setFavorites(f => (f.map(String).includes(String(product.id)) ? f : [...f, product.id]));
    setFavoritesProducts(p => (p.some(x => String(x.id) === String(product.id)) ? p : [...p, product]));
    return true;
  };

  const removeFromFavorites = async (productId) => {
    setFavorites(f => f.filter(id => String(id) !== String(productId)));
    setFavoritesProducts(p => p.filter(x => String(x.id) !== String(productId)));
    return true;
  };

  const isInFavorites = (productId) => favorites.map(String).includes(String(productId));
  const getFavoritesCount = () => favorites.length;

  return (
    <FavoritesContext.Provider value={{
      favorites,
      favoritesProducts,
      loading,
      addToFavorites,
      removeFromFavorites,
      isInFavorites,
      getFavoritesCount,
      refreshFavorites: loadFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};
