import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://vinylstore-fr-bck.onrender.com/api';

export const authAPI = {
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      console.error('API: register error', error.response?.data || error.message);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      console.error('API: login error', error.response?.data || error.message);
      throw error;
    }
  },

  getMe: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('API: getMe error', error.response?.data || error.message);
      throw error;
    }
  }
};
