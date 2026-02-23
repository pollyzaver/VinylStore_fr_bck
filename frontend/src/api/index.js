import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 секунд таймаут
});

// Добавляем перехватчик для обработки ошибок
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Сервер ответил с ошибкой
      console.error('API Error:', error.response.data);
      
      // Специальная обработка для 404
      if (error.response.status === 404) {
        throw new Error('Ресурс не найден');
      }
      
      throw new Error(error.response.data.error || 'Ошибка сервера');
    } else if (error.request) {
      // Запрос был отправлен, но ответа нет
      console.error('No response:', error.request);
      throw new Error('Сервер не отвечает. Проверьте подключение.');
    } else {
      // Ошибка при настройке запроса
      console.error('Request error:', error.message);
      throw new Error('Ошибка при отправке запроса');
    }
  }
);

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
    const response = await apiClient.get(url);
    return response.data;
  },
  
  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
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
    const response = await apiClient.get('/categories');
    return response.data;
  },
  
  // Статистика
  getStats: async () => {
    const response = await apiClient.get('/stats');
    return response.data;
  },

  // 👇 НОВЫЕ МЕТОДЫ ДЛЯ ИЗБРАННОГО
  addToFavorites: async (productId) => {
    // TODO: Реализовать на бэкенде
    console.log('Add to favorites:', productId);
    return { success: true };
  },

  removeFromFavorites: async (productId) => {
    // TODO: Реализовать на бэкенде
    console.log('Remove from favorites:', productId);
    return { success: true };
  },

  getFavorites: async () => {
    // TODO: Реализовать на бэкенде
    console.log('Get favorites');
    return [];
  }
};

export default api;