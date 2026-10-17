import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useI18n } from '../i18n/I18nContext';
import '../styles/components/CrateShelf.css';

// Solco Crate: полка квадратных конвертов. Прокрутка колесом, перетаскиванием
// и стрелками. Клик по центральному конверту достаёт пластинку и ставит её играть.

const FALLBACK_LABELS = ['#cf8b3e', '#b3262d', '#f3e9d2'];
const HAS_RU = /[А-Яа-яЁё]/;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const coverSrc = (product) => (product.image && !product.coverMissing ? process.env.PUBLIC_URL + product.image : null);
const catNo = (product) => `[${String(product.id).padStart(3, '0')}]`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Средний цвет обложки для этикетки диска. Слишком тёмные обложки пропускаем.
const averageColor = (img) => {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 8;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0, 8, 8);
    const d = x.getImageData(0, 0, 8, 8).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let k = 0; k < d.length; k += 4) { r += d[k]; g += d[k + 1]; b += d[k + 2]; n++; }
    r /= n; g /= n; b /= n;
    if (0.3 * r + 0.59 * g + 0.11 * b < 70) return null;
    return `rgb(${Math.round(r * 0.9)},${Math.round(g * 0.9)},${Math.round(b * 0.9)})`;
  } catch (e) {
    return null;
  }
};

const Cover = ({ product, onColor }) => {
  const { t, tr } = useI18n();
  const [broken, setBroken] = useState(false);
  const src = coverSrc(product);
  // новая пластинка в том же окне: сбрасываем ошибку прошлой обложки
  useEffect(() => { setBroken(false); }, [src]);
  if (!src || broken) {
    return (
      <div className="cr-cover-fallback" role="img" aria-label={`${tr.name(product.title)}, ${tr.name(product.description)}`}>
        <span className={HAS_RU.test(tr.name(product.title)) ? '' : 'cr-display'}>{tr.name(product.title)}</span>
        <small>{tr.name(product.description)}</small>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={t('cr.cover', { title: tr.name(product.title), artist: tr.name(product.description) })}
      draggable="false"
      onError={() => setBroken(true)}
      onLoad={(e) => onColor && onColor(averageColor(e.currentTarget))}
    />
  );
};

/* ---------- карточка пластинки (достаём конверт) ---------- */

export const CrateSheet = ({ product, index, total, label, onClose, onStep }) => {
  const { t, tr, fmtMoney } = useI18n();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const [phase, setPhase] = useState('in'); // in -> out -> play
  const [added, setAdded] = useState(false);
  const [fav, setFav] = useState(isInFavorites(product.id));
  const closeRef = useRef(null);
  const info = product.detailedInfo || {};
  const tracks = info.tracklist || null;

  useEffect(() => {
    setPhase('in');
    setAdded(false);
    setFav(isInFavorites(product.id));
    const reduce = prefersReducedMotion();
    const t1 = setTimeout(() => setPhase('out'), reduce ? 0 : 350);
    const t2 = setTimeout(() => setPhase('play'), reduce ? 0 : 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  useEffect(() => {
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (closeRef.current) closeRef.current.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, onStep]);

  const handleBuy = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleFav = async () => {
    if (fav) {
      const ok = await removeFromFavorites(product.id);
      if (ok) setFav(false);
    } else {
      const ok = await addToFavorites(product);
      if (ok) setFav(true);
    }
  };

  const rows = [
    [t('cr.year'), product.year],
    [t('cr.label'), info.label],
    [t('cr.genre'), tr.genre(product.genre)],
    [t('cr.country'), tr.country(info.country)],
    [t('cr.format'), tr.format(product.format)],
  ].filter(([, v]) => v);

  const trackCol = (title, list) =>
    list && list.length ? (
      <div key={title}>
        <h3>{title}</h3>
        <ol>{list.map((name, i) => <li key={i}>{name}</li>)}</ol>
      </div>
    ) : null;

  return createPortal(
    <div
      className="cr-veil"
      role="dialog"
      aria-modal="true"
      aria-label={t('cr.record', { title: tr.name(product.title) })}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="cr-tools">
        {total > 1 && (
          <>
            <p className="cr-pos">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</p>
          <button type="button" className="cr-btn-ghost cr-ib" onClick={() => onStep(-1)} aria-label={t('cr.prev')}>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          <button type="button" className="cr-btn-ghost cr-ib" onClick={() => onStep(1)} aria-label={t('cr.next')}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          </>
        )}
        <button ref={closeRef} type="button" className="cr-btn-ghost cr-ib cr-close" onClick={onClose} aria-label={t('cr.close')}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div className={`cr-sheet ${phase !== 'in' ? 'on-out' : ''} ${phase === 'play' ? 'on-play' : ''}`}>
        <div className="cr-stage">
          <div className="cr-s-disc"><div className="cr-spin" style={{ '--lab': label }} /></div>
          <div className="cr-s-sleeve"><Cover key={product.id} product={product} /></div>
          <div className="cr-arm" />
        </div>
        <div className="cr-info">
          <div className="cr-cat">
            {t('cr.disc')} {catNo(product)}{product.badge && <em>{tr.badge(product.badge)}</em>}
          </div>
          <h2 className={HAS_RU.test(tr.name(product.title)) ? '' : 'cr-display'}>{tr.name(product.title)}</h2>
          <p className="cr-artist">{tr.name(product.description)}</p>
          <dl>
            {rows.map(([k, v]) => (
              <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>
            ))}
          </dl>
          {tracks && (
            <div className="cr-tl">
              {trackCol(t('cr.sideA'), tracks.a)}
              {trackCol(t('cr.sideB'), tracks.b)}
            </div>
          )}
          <div className="cr-now" aria-live="polite">
            <span className="cr-eq" aria-hidden="true"><i /><i /><i /><i /></span>
            <span>{phase === 'play' ? t('cr.playing') : t('cr.pulling')}</span>
          </div>
          <div className="cr-buy">
            <span className="cr-price">{fmtMoney(product.price)}</span>
            <button type="button" className="cr-btn" onClick={handleBuy}>
              {added ? t('cr.added') : t('cr.buy')}
            </button>
            <button type="button" className="cr-btn-ghost" onClick={handleFav} aria-pressed={fav}>
              {fav ? t('cr.faved') : t('cr.fav')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ---------- полка ---------- */

const CrateShelf = ({ products }) => {
  const { t, tr } = useI18n();
  const N = products.length;
  const shelfRef = useRef(null);
  const barRef = useRef(null);
  const cardRefs = useRef([]);
  const st = useRef({ pos: 0, target: 0, S: 300, moved: false, raf: 0, dragging: false, dragX: 0, dragT: 0, snap: 0, shown: -1 });
  const api = useRef({});
  const [shown, setShown] = useState(0);
  const [openIndex, setOpenIndex] = useState(-1);
  const [labels, setLabels] = useState({});

  // функции пересоздаются на каждом рендере и читают актуальные N и refs
  api.current.layout = () => {
    const s = st.current;
    for (let k = 0; k < N; k++) {
      const el = cardRefs.current[k];
      if (!el) continue;
      const d = k - s.pos;
      const a = Math.abs(d);
      const sg = d < 0 ? -1 : 1;
      const tx = sg * (Math.min(a, 1) * 0.66 + Math.max(a - 1, 0) * 0.3) * s.S;
      const ry = -Math.max(-1, Math.min(1, d)) * 52;
      const tz = -Math.min(a, 4) * 70;
      const sc = 1 + (1 - Math.min(a, 1)) * 0.08;
      el.style.transform = `translate3d(${tx.toFixed(1)}px,0,${tz.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
      el.style.zIndex = 100 - Math.round(a * 10);
      el.style.opacity = Math.max(0, Math.min(1, 1 - (a - 3.2) * 0.9));
      el.style.visibility = a > 4.5 ? 'hidden' : 'visible';
    }
    const kk = clamp(Math.round(s.pos), 0, Math.max(N - 1, 0));
    if (N && kk !== s.shown) { s.shown = kk; setShown(kk); }
    if (barRef.current) barRef.current.style.left = `${(clamp(s.pos, 0, Math.max(N - 1, 0)) / Math.max(N, 1)) * 100}%`;
  };
  api.current.tick = () => {
    const s = st.current;
    s.pos += (s.target - s.pos) * 0.13;
    if (Math.abs(s.target - s.pos) < 0.002) { s.pos = s.target; api.current.layout(); s.raf = 0; return; }
    api.current.layout();
    s.raf = requestAnimationFrame(() => api.current.tick());
  };
  api.current.kick = () => {
    const s = st.current;
    s.target = clamp(s.target, 0, Math.max(N - 1, 0));
    if (prefersReducedMotion()) { s.pos = s.target; api.current.layout(); return; }
    if (!s.raf) s.raf = requestAnimationFrame(() => api.current.tick());
  };
  api.current.size = () => {
    const el = shelfRef.current;
    if (!el) return;
    const s = st.current;
    s.S = Math.max(150, Math.min(el.clientWidth * 0.46, el.clientHeight * 0.6, 340));
    el.style.setProperty('--S', `${s.S}px`);
    api.current.layout();
  };

  // новый список (фильтр, поиск): возвращаемся к началу
  useEffect(() => {
    const s = st.current;
    s.pos = s.target = Math.min(2, Math.max(0, N - 1));
    s.shown = -1;
    setOpenIndex(-1);
    api.current.size();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  useEffect(() => {
    const onResize = () => api.current.size();
    window.addEventListener('resize', onResize);
    const s = st.current;
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(s.raf); clearTimeout(s.snap); };
  }, []);

  // колесо мыши: не пассивный слушатель, чтобы листать полку, а не страницу
  useEffect(() => {
    const el = shelfRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      const s = st.current;
      const dl = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if ((s.target <= 0 && dl < 0) || (s.target >= N - 1 && dl > 0)) return;
      e.preventDefault();
      s.target = clamp(s.target + dl / 170, 0, N - 1);
      api.current.kick();
      clearTimeout(s.snap);
      s.snap = setTimeout(() => { s.target = Math.round(s.target); api.current.kick(); }, 140);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [N]);

  // перетаскивание
  useEffect(() => {
    const move = (e) => {
      const s = st.current;
      if (!s.dragging) return;
      const dx = e.clientX - s.dragX;
      if (Math.abs(dx) > 6) { s.moved = true; shelfRef.current && shelfRef.current.classList.add('drag'); }
      if (s.moved) { s.target = clamp(s.dragT - dx / (s.S * 0.55), 0, N - 1); api.current.kick(); }
    };
    const up = () => {
      const s = st.current;
      if (!s.dragging) return;
      s.dragging = false;
      shelfRef.current && shelfRef.current.classList.remove('drag');
      if (s.moved) { s.target = Math.round(s.target); api.current.kick(); setTimeout(() => { s.moved = false; }, 0); }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [N]);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    const s = st.current;
    s.dragging = true; s.moved = false; s.dragX = e.clientX; s.dragT = s.target;
  };

  const onKeyDown = (e) => {
    const s = st.current;
    if (e.key === 'ArrowRight') { e.preventDefault(); s.target = Math.round(s.target) + 1; api.current.kick(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); s.target = Math.round(s.target) - 1; api.current.kick(); }
  };

  const onCardClick = (i) => {
    const s = st.current;
    if (s.moved) return;
    if (i === Math.round(s.target)) setOpenIndex(i);
    else { s.target = i; api.current.kick(); }
  };

  const go = (n) => { const s = st.current; s.target = Math.round(s.target) + n; api.current.kick(); };

  const closeSheet = useCallback(() => {
    setOpenIndex((i) => {
      if (i >= 0) { st.current.target = i; api.current.kick(); }
      return -1;
    });
  }, []);

  const stepSheet = useCallback((n) => {
    setOpenIndex((i) => (i < 0 || !N ? i : (i + n + N) % N));
  }, [N]);

  const current = products[shown] || null;
  const open = openIndex >= 0 ? products[openIndex] : null;

  const hazeRef = useRef(null);
  useEffect(() => {
    const h = hazeRef.current;
    if (!h) return undefined;
    const sec = h.closest('.catalog-section') || h.parentElement;
    const move = (e) => {
      h.style.setProperty('--mx', `${e.clientX}px`);
      h.style.setProperty('--my', `${e.clientY}px`);
    };
    const on = () => h.classList.add('on');
    const off = () => h.classList.remove('on');
    sec.addEventListener('pointermove', move, { passive: true });
    sec.addEventListener('pointerenter', on);
    sec.addEventListener('pointerleave', off);
    return () => {
      sec.removeEventListener('pointermove', move);
      sec.removeEventListener('pointerenter', on);
      sec.removeEventListener('pointerleave', off);
    };
  }, [N > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!N) return null;

  return (
    <div className="cr">
      <div ref={hazeRef} className="cr-haze" aria-hidden="true" />
      <div
        ref={shelfRef}
        className="cr-shelf"
        role="group"
        aria-label={t('cr.shelf')}
        tabIndex={-1}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
      >
        {products.map((p, i) => (
          <button
            key={p.id}
            ref={(el) => { cardRefs.current[i] = el; }}
            type="button"
            className="cr-card"
            aria-label={`${tr.name(p.title)}, ${tr.name(p.description)}`}
            onClick={() => onCardClick(i)}
          >
            <div className="cr-frame">
              <div className="cr-disc">
                <div className="cr-spin" style={{ '--lab': labels[p.id] || FALLBACK_LABELS[i % FALLBACK_LABELS.length] }} />
              </div>
              <div className="cr-cover">
                <Cover product={p} onColor={(c) => c && setLabels((m) => (m[p.id] === c ? m : { ...m, [p.id]: c }))} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {current && (
        <div className="cr-cap">
          <div>
            <div className={`cr-t ${HAS_RU.test(tr.name(current.title)) ? '' : 'cr-display'}`}>{tr.name(current.title)}</div>
            <div className="cr-a">{tr.name(current.description)} · {current.year}</div>
          </div>
          <div className="cr-ctl">
            <span className="cr-n">{String(shown + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</span>
            <button type="button" className="cr-btn-ghost" onClick={() => go(-1)} aria-label={t('cr.prevShort')}>←</button>
            <button type="button" className="cr-btn-ghost" onClick={() => go(1)} aria-label={t('cr.nextShort')}>→</button>
          </div>
        </div>
      )}
      <div className="cr-bar"><i ref={barRef} style={{ width: `${100 / Math.max(N, 1)}%` }} /></div>

      {open && (
        <CrateSheet
          product={open}
          index={openIndex}
          total={N}
          label={labels[open.id] || FALLBACK_LABELS[openIndex % FALLBACK_LABELS.length]}
          onClose={closeSheet}
          onStep={stepSheet}
        />
      )}
    </div>
  );
};

export default CrateShelf;
