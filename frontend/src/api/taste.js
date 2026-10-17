import axios from 'axios';
import { API_URL, REQUEST_TIMEOUT, withRetry } from './http';

// Оба запроса ничего не меняют на сервере (результат только считается), поэтому их можно повторять
export const tasteAPI = {
  questions: async (lang = 'ru') => (await withRetry(() => axios.get(`${API_URL}/taste/questions`, { params: { lang }, timeout: REQUEST_TIMEOUT }))).data,
  result: async (answers, limit = 12, lang = 'ru') => (await withRetry(() => axios.post(`${API_URL}/taste/result`, { answers, limit, lang }, { timeout: REQUEST_TIMEOUT }))).data,
};
