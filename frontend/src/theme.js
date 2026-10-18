import { useCallback, useEffect, useState } from 'react';

// Две темы: «Погреб» (dark, по умолчанию) и «Бумага» (light).
// Выбор хранится в localStorage; атрибут data-theme ставится на <html> ещё до отрисовки (см. public/index.html).
const KEY = 'solco-theme';
const COLORS = { dark: '#120503', light: '#f3e9d2' };

export const getTheme = () =>
  document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

export function applyTheme(theme) {
  const next = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', COLORS[next]);
  try { localStorage.setItem(KEY, next); } catch (e) { /* приватный режим: тема живёт до перезагрузки */ }
  return next;
}

export function useTheme() {
  const [theme, setThemeState] = useState(getTheme);
  const toggle = useCallback(() => setThemeState((cur) => applyTheme(cur === 'light' ? 'dark' : 'light')), []);
  // если тему сменили в другой вкладке, подхватываем
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        document.documentElement.setAttribute('data-theme', e.newValue);
        setThemeState(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return { theme, toggle };
}
