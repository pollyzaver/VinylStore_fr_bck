import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [favoritesProducts, setFavoritesProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // ОПРЕДЕЛЯЕМ loadFavorites ПЕРЕД useEffect
  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      // Загружаем избранное пользователя (из user.favorites)
      const userFavorites = user?.favorites || [];
      setFavorites(userFavorites);
      
      // Загружаем полные данные о товарах
      if (userFavorites.length > 0) {
        const allProducts = await api.getProducts();
        const favProducts = allProducts.filter(p => userFavorites.includes(p.id));
        setFavoritesProducts(favProducts);
      } else {
        setFavoritesProducts([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]); // Добавляем user как зависимость

  // Загружаем избранное при входе пользователя
  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
      setFavoritesProducts([]);
    }
  }, [user, loadFavorites]); // Добавляем loadFavorites в зависимости

  const addToFavorites = async (product) => {
    try {
      // TODO: Отправить запрос на сервер для добавления в избранное
      // const response = await api.addToFavorites(product.id);
      
      // Пока работаем локально
      const newFavorites = [...favorites, product.id];
      setFavorites(newFavorites);
      setFavoritesProducts([...favoritesProducts, product]);
      
      // Обновляем user.favorites (временное решение)
      if (user) {
        user.favorites = newFavorites;
      }
      
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  };

  const removeFromFavorites = async (productId) => {
    try {
      // TODO: Отправить запрос на сервер для удаления из избранного
      
      const newFavorites = favorites.filter(id => id !== productId);
      const newProducts = favoritesProducts.filter(p => p.id !== productId);
      
      setFavorites(newFavorites);
      setFavoritesProducts(newProducts);
      
      // Обновляем user.favorites (временное решение)
      if (user) {
        user.favorites = newFavorites;
      }
      
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  };

  const isInFavorites = (productId) => {
    return favorites.includes(productId);
  };

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