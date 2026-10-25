import React, { useId, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import AuthShell, { AuthField, AuthError } from '../components/AuthShell';

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
    <AuthShell eyebrow={t('au.eyebrowIn')} title={t('au.welcome')} lead={t('au.signInTo')}>
      {error && <AuthError id={errId}>{error}</AuthError>}

      <form className="au-form" onSubmit={handleSubmit}>
        <AuthField
          id={`${uid}-email`} label="Email" errId={errId} hasError={!!error}
          type="email" name="email" autoComplete="username"
          value={formData.email} onChange={handleChange}
          placeholder="your@email.com" disabled={loading} autoFocus
        />
        <AuthField
          id={`${uid}-password`} label={t('au.password')} errId={errId} hasError={!!error}
          type="password" name="password" autoComplete="current-password"
          value={formData.password} onChange={handleChange}
          placeholder="••••••••" disabled={loading}
        />

        <button type="submit" className="au-btn" disabled={loading}>
          {loading && <span className="au-spin" aria-hidden="true" />}
          {loading ? t('au.signingIn') : t('au.signIn')}
        </button>

        <div className="au-links au-links--center">
          <button type="button" className="au-link" onClick={() => onNavigate('register')}>{t('au.noAccount')}</button>
        </div>
      </form>
    </AuthShell>
  );
};

export default Login;
