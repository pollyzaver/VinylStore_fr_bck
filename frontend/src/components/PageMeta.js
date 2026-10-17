import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n/I18nContext';

// Какая страница какой заголовок получает. Главная берёт общий meta.title.
const TITLE_KEY = {
  catalog: 'title.catalog',
  test: 'title.test',
  events: 'title.events',
  about: 'title.about',
  contacts: 'title.about',
  login: 'title.login',
  register: 'title.register',
  profile: 'title.profile',
  favorites: 'title.profile',
};

// Страницы переключаются без перезагрузки, поэтому заголовок вкладки и фокус клавиатуры обновляем сами
const PageMeta = ({ page }) => {
  const { t, lang } = useI18n();
  const prev = useRef(page);

  useEffect(() => {
    document.title = t(TITLE_KEY[page] || 'meta.title');
  }, [page, lang, t]);

  // После перехода фокус уходит с нажатой кнопки на содержимое новой страницы
  useEffect(() => {
    if (prev.current === page) return;
    prev.current = page;
    const main = document.getElementById('main-content');
    if (main) main.focus({ preventScroll: true });
  }, [page]);

  return null;
};

export default PageMeta;
