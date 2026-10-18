import React from 'react';
import Logo from './Logo';
import { useI18n } from '../i18n/I18nContext';

// Общая раскладка страниц входа и регистрации: слева фирменная панель (логотип, диск, узор), справа форма
export const AuthSide = () => {
  const { t } = useI18n();
  return (
    <aside className="au-side solco-pattern" aria-hidden="true">
      <Logo size={44} />
      <svg className="au-disc" viewBox="0 0 200 200" focusable="false">
        <circle cx="100" cy="100" r="97" fill="none" stroke="var(--oak)" strokeWidth="1" />
        <circle cx="100" cy="100" r="80" fill="none" stroke="var(--wine)" strokeWidth="1.4" />
        <circle cx="100" cy="100" r="63" fill="none" stroke="var(--amber)" strokeWidth="1.4" />
        <circle cx="100" cy="100" r="46" fill="none" stroke="var(--muted)" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="28" fill="var(--signal)" />
        <circle cx="100" cy="100" r="3.4" fill="var(--cellar)" />
      </svg>
      <p className="au-note">{t('au.side')}</p>
    </aside>
  );
};

const AuthShell = ({ eyebrow, title, lead, children }) => (
  <div className="au">
    <div className="au-in">
      <AuthSide />
      <section className="au-main">
        <p className="au-eyebrow">{eyebrow}</p>
        <h1 className="au-title">{title}</h1>
        {lead && <p className="au-lead">{lead}</p>}
        {children}
      </section>
    </div>
  </div>
);

export const AuthField = ({ id, label, errId, hasError, ...input }) => (
  <div className="au-f">
    <label htmlFor={id}>{label}</label>
    <input id={id} className="au-input" aria-required="true" aria-describedby={hasError ? errId : undefined} {...input} />
  </div>
);

export const AuthError = ({ id, children }) => (
  <div id={id} role="alert" className="au-err">{children}</div>
);

export default AuthShell;
