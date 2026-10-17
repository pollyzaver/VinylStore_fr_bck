import React, { useId, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';

const Login = ({ onNavigate }) => {
  const { t, tr } = useI18n();
  const uid = useId();
  const errId = `${uid}-error`;
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError(t('au.fillAll'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await login(formData);
      
      // Функция для перенаправления
      const goTo = (page) => {
        if (onNavigate) {
          onNavigate(page);
        } else {
          window.location.href = `/${page}`;
        }
      };
      
      if (response.user && response.user.testCompleted) {
        goTo('profile');
      } else {
        goTo('test');
      }
      
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(tr.server(
        err.response?.data?.error ||
        err.response?.data?.message
      ) || t('au.loginFail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container" style={{ maxWidth: '400px', margin: '50px auto' }}>
          
          {/* Виниловая пластинка для настроения */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '30px',
            position: 'relative'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2a140b, #120503)',
              margin: '0 auto 20px',
              border: '3px solid var(--vinyl-red)',
              boxShadow: '0 0 30px rgba(255,0,0,0.3)',
              animation: 'rotate 10s linear infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'var(--vinyl-red)'
              }} />
            </div>
            <h1 className="section-title" style={{ marginBottom: '10px' }}>
              {t('au.welcome')}
            </h1>
            <p className="section-subtitle" style={{ marginBottom: '30px' }}>
              {t('au.signInTo')}
            </p>
          </div>

          {/* Форма входа */}
          <div className="vinyl-card" style={{ 
            padding: '40px 30px',
            background: 'var(--vinyl-card)',
            border: '1px solid var(--vinyl-border)',
            borderRadius: '20px'
          }}>
            
            {error && (
              <div id={errId} role="alert" style={{
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid var(--vinyl-red)',
                color: '#e0545a',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor={`${uid}-email`} style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: 'var(--vinyl-muted)',
                  fontSize: '0.9rem'
                }}>
                  Email
                </label>
                <input
                  id={`${uid}-email`}
                  type="email"
                  name="email"
                  autoComplete="username"
                  aria-required="true"
                  aria-describedby={error ? errId : undefined}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="vinyl-input"
                  style={{ width: '100%' }}
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Пароль */}
              <div style={{ marginBottom: '30px' }}>
                <label htmlFor={`${uid}-password`} style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: 'var(--vinyl-muted)',
                  fontSize: '0.9rem'
                }}>
                  {t('au.password')}
                </label>
                <input
                  id={`${uid}-password`}
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  aria-required="true"
                  aria-describedby={error ? errId : undefined}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="vinyl-input"
                  style={{ width: '100%' }}
                  disabled={loading}
                />
              </div>

              {/* Кнопка входа */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '1.1rem',
                  marginBottom: '15px',
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
                    {t('au.signingIn')}
                  </>
                ) : t('au.signIn')}
              </button>

              {/* Ссылки */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.9rem'
              }}>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--vinyl-muted)',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    minHeight: '44px',
                    padding: '0 4px'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--vinyl-red)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--vinyl-muted)'}
                >
                  {t('au.noAccount')}
                </button>
                
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--vinyl-muted)',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    minHeight: '44px',
                    padding: '0 4px'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--vinyl-red)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--vinyl-muted)'}
                >
                  {t('au.forgot')}
                </button>
              </div>
            </form>
          </div>

          {/* Вдохновляющая цитата */}
          <div style={{
            textAlign: 'center',
            marginTop: '30px',
            color: 'var(--vinyl-muted)',
            fontSize: '0.9rem',
            fontStyle: 'italic'
          }}>
            {t('au.quote')}
          </div>
        </div>
      </div>

      {/* Стили для анимаций */}
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;