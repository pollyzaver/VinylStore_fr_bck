// Общие настройки запросов к бэкенду.
// Бесплатный хостинг усыпляет сервер, и первый запрос после простоя идёт до минуты.
// Поэтому у одной попытки запас по времени, а безопасные запросы (чтение, подсчёт)
// повторяются, пока сервер просыпается.
export const API_URL = process.env.REACT_APP_API_URL || 'https://vinylstore-fr-bck.onrender.com/api';

export const REQUEST_TIMEOUT = 25000;
const RETRIES = 2;
const RETRY_DELAY = 1500;
const RETRY_STATUSES = [502, 503, 504];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Временная ошибка: нет ответа (обрыв, таймаут) или сервер сообщил, что он ещё не готов.
export const isTransient = (err) => {
  if (typeof err.transient === 'boolean') return err.transient;
  return !err.response || RETRY_STATUSES.includes(err.response.status);
};

// Повторяет только запросы, которые можно слать дважды без последствий.
// Вход и регистрация сюда не попадают.
export const withRetry = async (send) => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await send();
    } catch (err) {
      if (attempt >= RETRIES || !isTransient(err)) throw err;
      await wait(RETRY_DELAY * (attempt + 1));
    }
  }
};
