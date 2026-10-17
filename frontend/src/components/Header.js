import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { useI18n, LANGS } from '../i18n/I18nContext';
import '../styles/components/Header.css';
import '../styles/components/LangSwitch.css';

// Иконки: один набор, линия 1.5, скруглённые концы, сетка 24×24
const Svg = ({ children }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
       strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {children}
  </svg>
);

// «Мои диски»: пластинка
const DiscIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M18 12a6 6 0 0 0-6-6" />
  </Svg>
);

// Корзина: бумажный пакет из магазина
const BagIcon = () => (
  <Svg>
    <path d="M5.5 8.5h13l-.9 11h-11.2z" />
    <path d="M9 8.5V7.4a3 3 0 0 1 6 0v1.1" />
  </Svg>
);

const NAV = [
  { id: 'catalog', key: 'nav.catalog', match: ['catalog'] },
  { id: 'test', key: 'nav.test', match: ['test'] },
  { id: 'events', key: 'nav.events', match: ['events', 'about', 'contacts'] },
];

// Переключатель языка: две кнопки RU / EN. Выбор запоминается и меняет все тексты сайта
const LangSwitch = ({ lang, setLang, t, tabIndex }) => (
  <div className="hd-lang" role="group" aria-label={t('hd.lang')}>
    {LANGS.map((l) => (
      <button
        key={l.code}
        type="button"
        className={lang === l.code ? 'on' : ''}
        aria-pressed={lang === l.code}
        aria-label={t('hd.langPick', { name: l.name })}
        lang={l.code}
        tabIndex={tabIndex}
        onClick={() => setLang(l.code)}
      >
        {l.label}
      </button>
    ))}
  </div>
);

const Header = ({ onCartClick, onNavigate, currentPage }) => {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const { getCartItemsCount } = useCart();
  const { user } = useAuth();
  const { t, lang, setLang } = useI18n();
  const count = getCartItemsCount();

  const go = (page) => {
    onNavigate(page);
    setOpen(false);
  };

  // тень и плотность фона появляются после прокрутки
  useEffect(() => {
    const on = () => setStuck(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // мобильное меню: Esc закрывает, страница под ним не прокручивается
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onResize = () => { if (window.innerWidth > 768) setOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const profileActive = currentPage === 'profile' || currentPage === 'favorites';

  return (
    <header className={`hd ${stuck ? 'is-stuck' : ''} ${open ? 'is-open' : ''}`} role="banner">
      <div className="hd-in">
        <button type="button" className="hd-logo" onClick={() => go('home')} aria-label={t('hd.home')}>
          <Logo size={34} />
        </button>

        <nav className="hd-nav" aria-label={t('nav.main')}>
          {NAV.map((n) => {
            const on = n.match.includes(currentPage);
            return (
              <button
                key={n.id}
                type="button"
                className={`hd-link ${on ? 'on' : ''}`}
                aria-current={on ? 'page' : undefined}
                onClick={() => go(n.id)}
              >
                {t(n.key)}
              </button>
            );
          })}
        </nav>

        <div className="hd-tools">
          <LangSwitch lang={lang} setLang={setLang} t={t} />
          {user ? (
            <button type="button" className={`hd-ib hd-avatar ${profileActive ? 'on' : ''}`} onClick={() => go('profile')} aria-label={t('hd.profile')} title={t('hd.profile')}>
              {user.name[0].toUpperCase()}
            </button>
          ) : (
            <button type="button" className={`hd-ib ${profileActive ? 'on' : ''}`} onClick={() => go('profile')} aria-label={t('hd.cards')} title={t('hd.cards')}>
              <DiscIcon />
            </button>
          )}

          <button type="button" className="hd-ib" onClick={() => { setOpen(false); onCartClick(); }} aria-label={count ? t('hd.cartCount', { n: count }) : t('hd.cart')} title={t('hd.cart')}>
            <BagIcon />
            {count > 0 && <span className="hd-count">{count}</span>}
          </button>

          <button
            type="button"
            className="hd-burger"
            aria-label={open ? t('hd.menuClose') : t('hd.menuOpen')}
            aria-expanded={open}
            aria-controls="hd-menu"
            onClick={() => setOpen(!open)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="hd-menu" className="hd-menu" aria-hidden={!open}>
        <nav aria-label={t('nav.menu')}>
          <ol>
            {NAV.map((n, i) => (
              <li key={n.id} style={{ '--i': i }}>
                <button type="button" className={n.match.includes(currentPage) ? 'on' : ''} tabIndex={open ? 0 : -1} onClick={() => go(n.id)}>
                  <span>{t(n.key)}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="hd-menu-foot">
          <LangSwitch lang={lang} setLang={setLang} t={t} tabIndex={open ? 0 : -1} />
          <button type="button" tabIndex={open ? 0 : -1} onClick={() => go('profile')}><DiscIcon />{user ? t('hd.profile') : t('hd.cards')}</button>
          <button type="button" tabIndex={open ? 0 : -1} onClick={() => { setOpen(false); onCartClick(); }}><BagIcon />{t('hd.cart')}{count > 0 ? ` · ${count}` : ''}</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
