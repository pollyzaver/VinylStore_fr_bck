import { useState, useEffect } from 'react';
import { api } from '../api';

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters.category, filters.minPrice, filters.maxPrice]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts(filters);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
    }
  };

  const getProduct = async (id) => {
    try {
      return await api.getProductById(id);
    } catch (err) {
      console.error('Ошибка загрузки товара:', err);
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    categories,
    getProduct,
    reload: loadProducts
  };
};