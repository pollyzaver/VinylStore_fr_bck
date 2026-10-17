import React from 'react';
import { useI18n } from '../i18n/I18nContext';

// Первая цель для Tab: позволяет с клавиатуры сразу попасть к содержимому, минуя шапку
const SkipLink = () => {
  const { t } = useI18n();
  const go = (e) => {
    e.preventDefault();
    const main = document.getElementById('main-content');
    if (main) { main.focus(); main.scrollIntoView(); }
  };
  return <a className="skip-link" href="#main-content" onClick={go}>{t('a11y.skip')}</a>;
};

export default SkipLink;
