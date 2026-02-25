import React, { useState } from 'react';
import '../styles/pages/Contacts.css';

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

  // Формируем путь к изображению
  const backgroundImageUrl = process.env.PUBLIC_URL + '/assets/contacts/vinylbg.jpg';

  return (
    <main className="main">
      {/* Hero секция - на всю ширину */}
      <section 
        className="contacts-hero"
        style={{
          backgroundImage: `linear-gradient(
            rgba(0, 0, 0, 0.7), 
            rgba(0, 0, 0, 0.8)
          ), url('${backgroundImageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '600px',
          position: 'relative',
          padding: '140px 0 100px',
          overflow: 'hidden',
          zIndex: 1
        }}
      >

        <div className="container" style={{ position: 'relative', zIndex: 5 }}>
          <div className="contacts-hero-content">
            <h1 className="contacts-hero-title">Свяжитесь с нами</h1>
            <p className="contacts-hero-subtitle">
              Готовы помочь с выбором пластинок, ответить на вопросы и просто поговорить о музыке
            </p>

            {/* Контактные метрики */}
            <div className="contacts-metrics">
              <div className="metric-item">
                <div className="metric-number">2</div>
                <div className="metric-label">часа</div>
                <div className="metric-description">Среднее время ответа</div>
              </div>
              <div className="metric-item">
                <div className="metric-number">24/7</div>
                <div className="metric-label">поддержка</div>
                <div className="metric-description">Техническая помощь</div>
              </div>
              <div className="metric-item">
                <div className="metric-number">100%</div>
                <div className="metric-label">отзывов</div>
                <div className="metric-description">Положительные отклики</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Красная бегущая строка - на всю ширину */}
      <div className="running-line">
        <div className="running-line-content">
          <span>VINYL STORE</span>
          <span className="separator">✦</span>
          <span>VINYL STORE</span>
          <span className="separator">✦</span>
          <span>VINYL STORE</span>
          <span className="separator">✦</span>
          <span>VINYL STORE</span>
          <span className="separator">✦</span>
          <span>VINYL STORE</span>
          <span className="separator">✦</span>
          <span>VINYL STORE</span>
          <span className="separator">✦</span>
          <span>VINYL STORE</span>
          <span className="separator">✦</span>
          <span>VINYL STORE</span>
          <span className="separator">✦</span>
          <span>VINYL STORE</span>
          <span className="separator">✦</span>
          <span>VINYL STORE</span>
          <span className="separator">✦</span>
          <span>VINYL STORE</span>
          <span className="separator">✦</span>
          <span>VINYL STORE</span>
          <span className="separator">✦</span>
          <span>VINYL STORE</span>
          <span className="separator">✦</span>
          <span>VINYL STORE</span>
          <span className="separator">✦</span>
          <span>VINYL STORE</span>
          <span className="separator">✦</span>
        </div>
      </div>

      {/* Форма обратной связи и карта - внутри container */}
      <div className="container">
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