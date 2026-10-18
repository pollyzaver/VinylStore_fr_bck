import React, { useId, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import AuthShell, { AuthField, AuthError } from '../components/AuthShell';

const Register = ({ onNavigate }) => {
  const { t, tr } = useI18n();
  const uid = useId();
  const errId = `${uid}-error`;
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
      setError(t('au.fillAll'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('au.mismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('au.short'));
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
      
      // через две секунды переходим к тесту
      setTimeout(() => {
        onNavigate('test');
      }, 2000);
      
    } catch (err) {
      console.error('Register error:', err);
      setError(tr.server(
        err.response?.data?.error ||
        err.response?.data?.message
      ) || t('au.registerFail'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell eyebrow={t('au.eyebrowUp')} title={t('au.regOk')} lead={t('au.regRedirect')}>
        <div className="au-ok" role="status"><span className="au-spin au-spin--big" aria-hidden="true" /></div>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow={t('au.eyebrowUp')} title={t('au.create')} lead={t('au.join')}>
      {error && <AuthError id={errId}>{error}</AuthError>}

      <form className="au-form" onSubmit={handleSubmit}>
        <AuthField
          id={`${uid}-name`} label={t('au.name')} errId={errId} hasError={!!error}
          type="text" name="name" autoComplete="name"
          value={formData.name} onChange={handleChange}
          placeholder={t('au.namePh')} disabled={loading} autoFocus
        />
        <AuthField
          id={`${uid}-email`} label="Email" errId={errId} hasError={!!error}
          type="email" name="email" autoComplete="email"
          value={formData.email} onChange={handleChange}
          placeholder="your@email.com" disabled={loading}
        />
        <AuthField
          id={`${uid}-password`} label={t('au.passwordMin')} errId={errId} hasError={!!error}
          type="password" name="password" autoComplete="new-password"
          value={formData.password} onChange={handleChange}
          placeholder="••••••••" disabled={loading}
        />
        <AuthField
          id={`${uid}-confirm`} label={t('au.confirm')} errId={errId} hasError={!!error}
          type="password" name="confirmPassword" autoComplete="new-password"
          value={formData.confirmPassword} onChange={handleChange}
          placeholder="••••••••" disabled={loading}
        />

        <button type="submit" className="au-btn" disabled={loading}>
          {loading && <span className="au-spin" aria-hidden="true" />}
          {loading ? t('au.registering') : t('au.register')}
        </button>

        <div className="au-links au-links--center">
          <span>{t('au.haveAccount')}</span>
          <button type="button" className="au-link au-link--accent" onClick={() => onNavigate('login')}>{t('au.signIn')}</button>
        </div>
      </form>
    </AuthShell>
  );
};

export default Register;
