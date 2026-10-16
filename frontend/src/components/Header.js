import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import '../styles/components/Header.css';

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
  { id: 'catalog', label: 'Пластинки', match: ['catalog'] },
  { id: 'test', label: 'Тест', match: ['test'] },
  { id: 'events', label: 'Афиша', match: ['events', 'about', 'contacts'] },
];

const Header = ({ onCartClick, onNavigate, currentPage }) => {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const { getCartItemsCount } = useCart();
  const { user } = useAuth();
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
        <button type="button" className="hd-logo" onClick={() => go('home')} aria-label="Solco, на главную">
          <Logo size={34} />
        </button>

        <nav className="hd-nav" aria-label="Основная навигация">
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
                {n.label}
              </button>
            );
          })}
        </nav>

        <div className="hd-tools">
          {user ? (
            <button type="button" className={`hd-ib hd-avatar ${profileActive ? 'on' : ''}`} onClick={() => go('profile')} aria-label="Профиль" title="Профиль">
              {user.name[0].toUpperCase()}
            </button>
          ) : (
            <button type="button" className={`hd-ib ${profileActive ? 'on' : ''}`} onClick={() => go('profile')} aria-label="Мои открытки" title="Мои открытки">
              <DiscIcon />
            </button>
          )}

          <button type="button" className="hd-ib" onClick={() => { setOpen(false); onCartClick(); }} aria-label={count ? `Корзина, товаров: ${count}` : 'Корзина'} title="Корзина">
            <BagIcon />
            {count > 0 && <span className="hd-count">{count}</span>}
          </button>

          <button
            type="button"
            className="hd-burger"
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
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
        <nav aria-label="Меню">
          <ol>
            {NAV.map((n, i) => (
              <li key={n.id} style={{ '--i': i }}>
                <button type="button" className={n.match.includes(currentPage) ? 'on' : ''} tabIndex={open ? 0 : -1} onClick={() => go(n.id)}>
                  <span>{n.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="hd-menu-foot">
          <button type="button" tabIndex={open ? 0 : -1} onClick={() => go('profile')}><DiscIcon />{user ? 'Профиль' : 'Мои открытки'}</button>
          <button type="button" tabIndex={open ? 0 : -1} onClick={() => { setOpen(false); onCartClick(); }}><BagIcon />Корзина{count > 0 ? ` · ${count}` : ''}</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
