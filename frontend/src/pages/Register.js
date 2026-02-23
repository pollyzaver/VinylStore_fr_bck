import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Register = ({ onNavigate }) => { // 👈 ДОБАВЛЯЕМ onNavigate
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Заполните все поля');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен быть минимум 6 символов');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      setSuccess(true);
      
      // 👇 ПЕРЕНОСИМ НА ТЕСТ ЧЕРЕЗ 2 СЕКУНДЫ
      setTimeout(() => {
        onNavigate('test'); // 👈 ИСПОЛЬЗУЕМ onNavigate
      }, 2000);
      
    } catch (err) {
      console.error('Register error:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Ошибка при регистрации'
      );
    } finally {
      setLoading(false);
    }
  };

  // Убираем navigateTo, используем onNavigate напрямую

  if (success) {
    return (
      <div className="auth-page">
        <div className="container">
          <div className="auth-container" style={{ maxWidth: '400px', margin: '50px auto' }}>
            <div className="vinyl-card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--vinyl-red)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
                ✓
              </div>
              <h2 style={{ marginBottom: '15px' }}>Регистрация успешна!</h2>
              <p style={{ color: 'var(--vinyl-muted)', marginBottom: '20px' }}>
                Сейчас вы будете перенаправлены на музыкальный тест...
              </p>
              <div className="vinyl-spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container" style={{ maxWidth: '400px', margin: '50px auto' }}>
          
          {/* Заголовок */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #222, #111)',
              margin: '0 auto 20px',
              border: '3px solid var(--vinyl-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '32px' }}>🎵</span>
            </div>
            <h1 className="section-title" style={{ marginBottom: '10px' }}>
              Создать Vinyl ID
            </h1>
            <p className="section-subtitle" style={{ marginBottom: '30px' }}>
              Присоединяйтесь к сообществу
            </p>
          </div>

          {/* Форма регистрации */}
          <div className="vinyl-card" style={{ 
            padding: '40px 30px',
            background: 'var(--vinyl-card)',
            border: '1px solid var(--vinyl-border)',
            borderRadius: '20px'
          }}>
            
            {error && (
              <div style={{
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid var(--vinyl-red)',
                color: '#ff4444',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* Имя */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: 'var(--vinyl-muted)',
                  fontSize: '0.9rem'
                }}>
                  Ваше имя
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Александр"
                  className="vinyl-input"
                  style={{ width: '100%' }}
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: 'var(--vinyl-muted)',
                  fontSize: '0.9rem'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="vinyl-input"
                  style={{ width: '100%' }}
                  disabled={loading}
                />
              </div>

              {/* Пароль */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: 'var(--vinyl-muted)',
                  fontSize: '0.9rem'
                }}>
                  Пароль (минимум 6 символов)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="vinyl-input"
                  style={{ width: '100%' }}
                  disabled={loading}
                />
              </div>

              {/* Подтверждение пароля */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: 'var(--vinyl-muted)',
                  fontSize: '0.9rem'
                }}>
                  Подтвердите пароль
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="vinyl-input"
                  style={{ width: '100%' }}
                  disabled={loading}
                />
              </div>

              {/* Кнопка регистрации */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '1.1rem',
                  marginBottom: '20px',
                  position: 'relative'
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span style={{
                      display: 'inline-block',
                      width: '20px',
                      height: '20px',
                      border: '2px solid transparent',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '10px'
                    }} />
                    Регистрация...
                  </>
                ) : 'Зарегистрироваться'}
              </button>

              {/* Ссылка на вход */}
              <div style={{
                textAlign: 'center',
                fontSize: '0.9rem'
              }}>
                <span style={{ color: 'var(--vinyl-muted)' }}>Уже есть аккаунт? </span>
                <button
                  type="button"
                  onClick={() => onNavigate('login')} // 👈 ИСПОЛЬЗУЕМ onNavigate
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--vinyl-red)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '0.9rem'
                  }}
                >
                  Войти
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Стили для анимации */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;