import React, { useState } from 'react';

const Contacts = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneInput = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('8')) value = '7' + value.slice(1);
    if (value.length > 11) value = value.slice(0, 11);

    let formatted = '+7';
    if (value.length > 1) formatted += ' (' + value.slice(1, 4);
    if (value.length >= 4) formatted += ') ' + value.slice(4, 7);
    if (value.length >= 7) formatted += '-' + value.slice(7, 9);
    if (value.length >= 9) formatted += '-' + value.slice(9, 11);

    setFormData(prev => ({
      ...prev,
      phone: formatted
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const phoneValue = formData.phone.replace(/\D/g, '');
    if (phoneValue.length !== 11) {
      alert('Введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX');
      return;
    }
    // Здесь будет отправка формы
    console.log('Form submitted:', formData);
    alert('Сообщение отправлено!');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <main className="main">
      <div className="container">
        {/* Hero с виниловой тематикой */}
        <section className="contacts-hero-simple">
          <div className="contacts-hero-wrapper">
            
            {/* Красная акцентная полоса */}
            <div className="contacts-red-stripe"></div>
            
            {/* Основное содержимое */}
            <div className="contacts-hero-main">
              
              {/* Заголовок с красным акцентом */}
              <div className="contacts-title-wrapper">
                <h1 className="contacts-title">
                  <span className="contacts-title-part1">Свяжитесь</span>
                  <span className="contacts-title-part2"> с нами</span>
                </h1>
                <div className="contacts-title-line"></div>
              </div>
              
              {/* Подзаголовок */}
              <p className="contacts-subtitle">
                Готовы помочь с выбором пластинок, ответить на вопросы 
                <span className="highlight-red"> и просто поговорить о музыке</span>
              </p>
              
              {/* Контактные метрики */}
              <div className="contact-metrics">
                <div className="metric-item">
                  <div className="metric-number">2</div>
                  <div className="metric-label">часа</div>
                  <div className="metric-description">Среднее время ответа</div>
                </div>
                <div className="metric-divider"></div>
                <div className="metric-item">
                  <div className="metric-number">24/7</div>
                  <div className="metric-label">поддержка</div>
                  <div className="metric-description">Техническая помощь</div>
                </div>
                <div className="metric-divider"></div>
                <div className="metric-item">
                  <div className="metric-number">100%</div>
                  <div className="metric-label">отзывов</div>
                  <div className="metric-description">Положительные отклики</div>
                </div>
              </div>
              
            </div>
            
            {/* Виниловая пластинка справа (упрощенная) */}
            <div className="contacts-vinyl-simple">
              <div className="simple-vinyl-disc">
                <div className="simple-vinyl-groove"></div>
                <div className="simple-vinyl-center">
                  <div className="simple-vinyl-hole"></div>
                </div>
              </div>
              <div className="simple-vinyl-red"></div>
            </div>
            
          </div>
        </section>

        {/* Контактная информация в сетке */}
        <div className="contact-grid-section">
          {/* Карточка с контактами */}
          <div className="contact-info-card vinyl-card">
            <div className="contact-card-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <h3 className="contact-card-title">Наш адрес</h3>
            <p className="contact-card-text vinyl-muted">
              г. Москва, ул. 11-я Парковая, 36<br />
              Метро: Первомайская
            </p>
            <div className="contact-card-badge">
              🏢 Магазин винила
            </div>
          </div>

          {/* Карточка с графиком */}
          <div className="contact-info-card vinyl-card">
            <div className="contact-card-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
            <h3 className="contact-card-title">Часы работы</h3>
            <ul className="schedule-list">
              <li className="schedule-item">
                <span className="schedule-day">Пн–Пт</span>
                <span className="schedule-time">9:00 – 18:00</span>
              </li>
              <li className="schedule-item">
                <span className="schedule-day">Суббота</span>
                <span className="schedule-time">10:00 – 16:00</span>
              </li>
              <li className="schedule-item">
                <span className="schedule-day">Воскресенье</span>
                <span className="schedule-time">выходной</span>
              </li>
              <li className="schedule-item highlight">
                <span className="schedule-day">Техподдержка</span>
                <span className="schedule-time">круглосуточно</span>
              </li>
            </ul>
            <div className="contact-card-badge">
              🎧 Слушаем музыку
            </div>
          </div>

          {/* Карточка с социальными сетями */}
          <div className="contact-info-card vinyl-card">
            <div className="contact-card-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
              </svg>
            </div>
            <h3 className="contact-card-title">Соцсети</h3>
            <p className="contact-card-text vinyl-muted">
              Следите за новыми поступлениями, акциями и мероприятиями
            </p>
            <div className="social-links">
              <a href="#" className="social-link vinyl-btn">Instagram</a>
              <a href="#" className="social-link vinyl-btn">Telegram</a>
              <a href="#" className="social-link vinyl-btn">VK</a>
            </div>
          </div>
        </div>

        {/* Форма обратной связи */}
        <section className="contact-form-section vinyl-card" style={{padding: '50px', marginBottom: '80px', borderRadius: '16px'}}>
          <div className="section-content" style={{maxWidth: '800px', marginInline: 'auto'}}>
            <h2 style={{textAlign: 'center', fontSize: '2.5rem', marginBottom: '20px'}}>Форма обратной связи</h2>
            <p style={{textAlign: 'center', color: 'var(--vinyl-muted)', marginBottom: '40px', fontSize: '1.1rem'}}>
              Заполните форму ниже, и мы свяжемся с вами в течение 2 часов
            </p>
            
            <form onSubmit={handleSubmit} style={{display: 'grid', gap: '25px'}}>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '25px'}}>
                <div style={{flex: '1 1 48%'}}>
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Ваше имя *" 
                    required 
                    value={formData.name}
                    onChange={handleInputChange}
                    className="vinyl-input"
                  />
                </div>
                <div style={{flex: '1 1 48%'}}>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Ваш email *" 
                    required 
                    value={formData.email}
                    onChange={handleInputChange}
                    className="vinyl-input"
                  />
                </div>
              </div>
              
              <div style={{position: 'relative'}}>
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="+7 (___) ___-__-__" 
                  required 
                  value={formData.phone}
                  onChange={handlePhoneInput}
                  className="vinyl-input"
                />
              </div>
              
              <div style={{position: 'relative'}}>
                <select 
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="vinyl-input"
                  style={{appearance: 'none', cursor: 'pointer'}}
                >
                  <option value="">Выберите тему</option>
                  <option value="consultation">Консультация по винилу</option>
                  <option value="order">Заказ пластинки</option>
                  <option value="support">Техническая поддержка</option>
                  <option value="partnership">Сотрудничество</option>
                  <option value="other">Другое</option>
                </select>
                <div style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--vinyl-muted)'
                }}>
                  ▼
                </div>
              </div>
              
              <div>
                <textarea 
                  name="message"
                  rows="6" 
                  placeholder="Сообщение *" 
                  required 
                  value={formData.message}
                  onChange={handleInputChange}
                  className="vinyl-input"
                  style={{resize: 'vertical', minHeight: '150px'}}
                />
              </div>
              
              <div style={{textAlign: 'center'}}>
                <button type="submit" className="btn btn-primary" style={{
                  padding: '15px 40px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
                }}>
                  Отправить сообщение
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Карта */}
        <section className="map-section" style={{marginBottom: '100px'}}>
          <div className="section-content" style={{maxWidth: '1000px', marginInline: 'auto'}}>
            <h2 style={{
              textAlign: 'center', 
              marginBottom: '40px',
              fontSize: '2.5rem'
            }}>
              📍 Как нас найти
            </h2>
            <div style={{
              width: '100%', 
              aspectRatio: '16/9',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <iframe 
                src="https://yandex.ru/map-widget/v1/?ll=37.805680%2C55.801121&mode=search&ol=geo&ouri=ymapsbm1%3A%2F%2Fgeo%3Fdata%3DCgg1Njc1MjQ1MRJB0KDQvtGB0YHQuNGPLCDQnNC-0YHQutCy0LAsIDExLdGPINCf0LDRgNC60L7QstCw0Y8g0YPQu9C40YbQsCwgMzYiCg0DORdCFVk0X0I%2C&z=16" 
                title="Карта офиса"
                allowFullScreen 
                loading="lazy"
                style={{width: '100%', height: '100%', border: 'none'}}
              />
            </div>
            <p style={{
              textAlign: 'center', 
              color: 'var(--vinyl-muted)', 
              marginTop: '20px',
              fontSize: '1rem'
            }}>
              Приходите в наш магазин, чтобы послушать пластинки и пообщаться с единомышленниками
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Contacts;