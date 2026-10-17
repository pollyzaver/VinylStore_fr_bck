import axios from 'axios';
import { API_URL, REQUEST_TIMEOUT, isTransient, withRetry } from './http';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: REQUEST_TIMEOUT
});

// Превращаем ошибки axios в понятные сообщения. Признак временной ошибки
// остаётся на новой ошибке, чтобы withRetry знал, стоит ли повторять запрос.
const fail = (message, source) => {
  const err = new Error(message);
  err.transient = isTransient(source);
  err.status = source.response && source.response.status;
  throw err;
};

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Сервер ответил с ошибкой
      console.error('API Error:', error.response.data);

      if (error.response.status === 404) {
        fail('Ресурс не найден', error);
      }

      fail((error.response.data && error.response.data.error) || 'Ошибка сервера', error);
    } else if (error.request) {
      // Запрос был отправлен, но ответа нет
      console.error('No response:', error.request);
      fail('Сервер не отвечает. Проверьте подключение.', error);
    } else {
      // Ошибка при настройке запроса
      console.error('Request error:', error.message);
      fail('Ошибка при отправке запроса', error);
    }
  }
);

// Чтение можно повторять, пока сервер просыпается
const get = (url) => withRetry(() => apiClient.get(url));

export const api = {
  // Товары
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.inStock) params.append('inStock', filters.inStock);
    
    const url = `/products${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await get(url);
    return response.data;
  },
  
  getProductById: async (id) => {
    const response = await get(`/products/${id}`);
    return response.data;
  },
  
  createProduct: async (product) => {
    const response = await apiClient.post('/products', product);
    return response.data;
  },
  
  updateProduct: async (id, product) => {
    const response = await apiClient.patch(`/products/${id}`, product);
    return response.data;
  },
  
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
  
  // Категории
  getCategories: async () => {
    const response = await get('/categories');
    return response.data;
  },
  
  // Статистика
  getStats: async () => {
    const response = await get('/stats');
    return response.data;
  },

  // 👇 НОВЫЕ МЕТОДЫ ДЛЯ ИЗБРАННОГО
  addToFavorites: async (productId) => {
    // TODO: Реализовать на бэкенде
    return { success: true };
  },

  removeFromFavorites: async (productId) => {
    // TODO: Реализовать на бэкенде
    return { success: true };
  },

  getFavorites: async () => {
    // TODO: Реализовать на бэкенде
    return [];
  }
};

export default api;