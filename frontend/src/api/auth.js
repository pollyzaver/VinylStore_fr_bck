import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const authAPI = {
  register: async (userData) => {
    try {
      console.log('API: register request to', `${API_URL}/auth/register`);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      console.log('API: register response', response.data);
      return response.data;
    } catch (error) {
      console.error('API: register error', error.response?.data || error.message);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log('API: login request to', `${API_URL}/auth/login`);
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      console.log('API: login response', response.data);
      return response.data;
    } catch (error) {
      console.error('API: login error', error.response?.data || error.message);
      throw error;
    }
  },

  getMe: async (token) => {
    try {
      console.log('API: getMe request with token:', token);
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('API: getMe response', response.data);
      return response.data;
    } catch (error) {
      console.error('API: getMe error', error.response?.data || error.message);
      throw error;
    }
  },

  getTestQuestions: async () => {
    try {
      const response = await axios.get(`${API_URL}/profile/test/questions`);
      return response.data;
    } catch (error) {
      console.error('API: getTestQuestions error', error);
      throw error;
    }
  },

  submitTest: async (answers, token) => {
    try {
      console.log('API: submitTest with answers:', answers);
      const response = await axios.post(`${API_URL}/profile/test/submit`, 
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('API: submitTest response', response.data);
      return response.data;
    } catch (error) {
      console.error('API: submitTest error', error.response?.data || error.message);
      throw error;
    }
  },

  getProfile: async (token) => {
    try {
      console.log('API: getProfile request');
      const response = await axios.get(`${API_URL}/profile/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('API: getProfile response', response.data);
      return response.data;
    } catch (error) {
      console.error('API: getProfile error', error.response?.data || error.message);
      throw error;
    }
  }
};