import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ProductCard';
import ProductSheet from '../components/ProductSheet';
import { CardThumb, downloadCard } from '../components/GiftCard';
import { getDiscs, removeDisc, setOpen, defaultCard } from '../utils/discs';
import { useI18n } from '../i18n/I18nContext';
import '../styles/pages/Favorites.css';
import '../styles/pages/MyDiscs.css';

const Profile = ({ onNavigate }) => {
  const { t, tr, lang, locale, fmtMoney } = useI18n();
  const fmt = iso => {
    try { return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; }
  };
  const { user, logout } = useAuth();
  const { addToCart } = useCart();
  const { favoritesProducts, favorites, loading } = useFavorites();
  const [discs, setDiscs] = useState(getDiscs);
  const [askDel, setAskDel] = useState(null);
  const [added, setAdded] = useState({});
  const [sheet, setSheet] = useState({ id: null, ids: [] });

  const open = (d, gift) => { setOpen(d.id, gift); onNavigate('test'); };
  const del = (id) => { removeDisc(id); setDiscs(getDiscs()); setAskDel(null); };
  const buy = (r, d, withCard) => {
    const item = { id: r.id, title: r.title, description: r.artist, image: r.image, coverMissing: r.coverMissing, taste: r.taste, price: r.price };
    if (withCard) {
      const c = { ...defaultCard(), ...(d.card || {}) };
      const gift = d.mode === 'gift';
      item.lineId = `card-${r.id}-${Date.now()}`;
      item.card = { to: gift ? (c.to || '').trim() : '', from: gift ? (c.from || '').trim() : '', text: (c.text || '').trim(), taste: d.profile.title, seed: `gift-${d.profile.title}`, theme: c.theme, layout: c.layout, mode: d.mode || 'self' };
    }
    addToCart(item);
    setAdded(a => ({ ...a, [`${d.id}:${r.id}${withCard ? ':c' : ''}`]: true }));
  };

  return (
    <div className="md">
      <div className="md-wrap">
        <header className="md-head">
          <div>
            <h1 className="tz-h">{user ? user.name : t('pf.mySolco')}</h1>
          </div>
          <div className="md-acc">
            {user ? (
              <>
                <span>{user.email}</span>
                <button className="tz-link" onClick={() => { logout(); onNavigate('home'); }}>{t('pf.logout')}</button>
              </>
            ) : (
              <>
                <button className="tz-link" onClick={() => onNavigate('login')}>{t('pf.login')}</button>
                <button className="tz-link" onClick={() => onNavigate('register')}>{t('pf.register')}</button>
              </>
            )}
          </div>
        </header>
        <p className="md-note">{t('pf.note')}</p>

        <section className="md-sec">
          <h2 className="md-h">{t('pf.cards')} <i>{discs.length}</i></h2>
        {(
          discs.length === 0 ? (
            <div className="md-empty">
              <h2>{t('pf.noCards')}</h2>
              <p>{t('pf.noCardsText')}</p>
              <button className="tz-btn" onClick={() => onNavigate('test')}>{t('pf.takeQuiz')}</button>
            </div>
          ) : (
            <div className="md-list">
              {discs.map(d => (
                <article className="md-card" key={d.id}>
                  <CardThumb className="md-thumb" values={d.profile.values} title={d.profile.title} card={{ ...defaultCard(), ...(d.card || {}) }} mode={d.mode || 'self'} />
                  <div className="md-body">
                    <p className="md-meta">{fmt(d.date)} · {d.mode === 'gift' ? `${t('pf.gift')}${d.card && d.card.to ? ` · ${d.card.to}` : ''}` : t('pf.self')}</p>
                    <h2>{String(d.profile.title).split(' · ').join(' · ')}</h2>
                    <p className="md-text">{d.profile.text}</p>
                    <ul className="md-recs">
                      {d.recs.slice(0, 3).map(r => (
                        <li key={r.id}>
                          <span><button className="md-open" onClick={() => setSheet({ id: r.id, ids: d.recs.slice(0, 3).map(x => x.id) })}><b>{tr.name(r.title)}</b></button> <em>{tr.name(r.artist)}</em></span>
                          <span className="md-buy">
                            <button className="tz-link" onClick={() => buy(r, d, false)}>{added[`${d.id}:${r.id}`] ? t('pf.inCart') : `${t('pf.toCart')} · ${fmtMoney(r.price)}`}</button>
                            <button className="tz-link" onClick={() => buy(r, d, true)}>{added[`${d.id}:${r.id}:c`] ? t('pf.withCardDone') : t('pf.withCard')}</button>
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="md-actions">
                      <button className="tz-btn" onClick={() => open(d, true)}>{t('pf.editCard')}</button>
                      <button className="tz-btn tz-btn-ghost" onClick={() => open(d, false)}>{t('pf.result')}</button>
                      <button className="tz-btn tz-btn-ghost" onClick={() => downloadCard(d.profile.values, d.profile.title, { ...defaultCard(), ...(d.card || {}) }, d.mode || 'self', lang)}>{t('pf.png')}</button>
                      {askDel === d.id ? (
                        <span className="md-del">{t('pf.delAsk')} <button className="tz-link" onClick={() => del(d.id)}>{t('pf.yes')}</button> <button className="tz-link" onClick={() => setAskDel(null)}>{t('pf.no')}</button></span>
                      ) : (
                        <button className="tz-link" onClick={() => setAskDel(d.id)}>{t('pf.del')}</button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
              <button className="tz-btn tz-btn-ghost md-more" onClick={() => onNavigate('test')}>{t('pf.again')}</button>
            </div>
          )
        )}

        </section>

        <section className="md-sec" id="favorites">
          <h2 className="md-h">{t('pf.favorites')} <i>{favorites.length}</i></h2>
        {(
          loading ? <div className="tz-spinner" /> :
          favoritesProducts.length === 0 ? (
            <div className="md-empty">
              <h2>{t('pf.noFav')}</h2>
              <p>{t('pf.noFavText')}</p>
              <button className="tz-btn" onClick={() => onNavigate('catalog')}>{t('pf.toCatalog')}</button>
            </div>
          ) : (
            <div className="favorites-grid md-fav">
              {favoritesProducts.map(p => <ProductCard key={p.id} product={p} onProductClick={(p) => setSheet({ id: p.id, ids: favoritesProducts.map(x => x.id) })} />)}
            </div>
          )
        )}
        </section>
      </div>

      <ProductSheet ids={sheet.ids} openId={sheet.id} onClose={() => setSheet({ id: null, ids: [] })} />
    </div>
  );
};

export default Profile;
