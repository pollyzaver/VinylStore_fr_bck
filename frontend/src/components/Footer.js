import React from 'react';
import Logo from './Logo';
import { useI18n } from '../i18n/I18nContext';

const Footer = () => {
  const { t } = useI18n();
  return (
  <footer className="site-footer site-footer--line">
    <div className="container footer-line">
      <Logo size={26} />
      <p className="footer-line__links">
        <a href="https://t.me/meinewelllt">Telegram</a>
        <a href="https://vk.com/p.zavershinskaya">VK</a>
        <a href="https://wa.me/79501893557">WhatsApp</a>
        <a href="mailto:pollzyaver777@gmail.com">pollzyaver777@gmail.com</a>
      </p>
      <p className="footer-line__copy">{t('ft.copy')}</p>
    </div>
  </footer>
  );
};

export default Footer;
