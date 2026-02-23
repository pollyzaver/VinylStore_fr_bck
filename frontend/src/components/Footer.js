import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-column">
            <h3>О компании</h3>
            <p>Магазин винила в Москве с 2023 года. Мы предлагаем только качественные пластинки и оборудование.</p>
          </div>
          <div className="footer-column">
            <h3>Контакты</h3>
            <p>Телефон: +7 (950) 189-35-57</p>
            <p>Email: pollzyaver777@gmail.com</p>
            <p>Адрес: г. Москва, ул. 11-я Парковая, 36</p>
          </div>
          <div className="footer-column">
            <h3>Мы в соцсетях</h3>
            <div className="social-links">
              <a href="https://t.me/meinewelllt" className="social-link">Telegram</a>
              <a href="https://vk.com/p.zavershinskaya" className="social-link">VKontakte</a>
              <a href="https://wa.me/79501893557" className="social-link">WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 VinylStore. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;