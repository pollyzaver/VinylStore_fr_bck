import axios from 'axios';
import { API_URL, REQUEST_TIMEOUT, withRetry } from './http';

export const authAPI = {
  // Регистрация и вход не повторяются сами: запрос, который мог дойти до сервера, нельзя слать дважды
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData, { timeout: REQUEST_TIMEOUT });
      return response.data;
    } catch (error) {
      console.error('API: register error', error.response?.data || error.message);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials, { timeout: REQUEST_TIMEOUT });
      return response.data;
    } catch (error) {
      console.error('API: login error', error.response?.data || error.message);
      throw error;
    }
  },

  getMe: async (token) => {
    try {
      const response = await withRetry(() => axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: REQUEST_TIMEOUT
      }));
      return response.data;
    } catch (error) {
      console.error('API: getMe error', error.response?.data || error.message);
      throw error;
    }
  }
};
