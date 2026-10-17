import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://vinylstore-fr-bck.onrender.com/api';

export const tasteAPI = {
  questions: async (lang = 'ru') => (await axios.get(`${API_URL}/taste/questions`, { params: { lang } })).data,
  result: async (answers, limit = 12, lang = 'ru') => (await axios.post(`${API_URL}/taste/result`, { answers, limit, lang })).data,
};
