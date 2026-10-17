import React, { useEffect, useMemo, useRef, useState } from 'react';
import { discSvg } from '../utils/tasteDisc';
import { useCart } from '../context/CartContext';
import { useI18n } from '../i18n/I18nContext';
import '../styles/components/GiftCard.css';

const W = 1800;
const H = 1200;
const MAX_TEXT = 240;

function wrap(g, text, maxW) {
  const lines = [];
  String(text).split('\n').forEach(par => {
    const words = par.split(/\s+/).filter(Boolean);
    if (!words.length) { lines.push(''); return; }
    let cur = '';
    words.forEach(w => {
      const t = cur ? `${cur} ${w}` : w;
      if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    });
    lines.push(cur);
  });
  return lines;
}

const SANS = '"Golos Text", "Inter", "Helvetica Neue", Arial, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';

// Тексты, которые рисуются прямо на открытке (canvas не умеет ходить в словарь сам)
const CARD_TEXT = {
  ru: {
    phGift: 'Здесь будет твоё послание. Напиши, почему именно эта музыка.',
    phSelf: 'Здесь можно оставить заметку себе: почему эта музыка и когда её слушать.',
    dear: 'Тебе,',
  },
  en: {
    phGift: 'Your message will be here. Write why exactly this music.',
    phSelf: 'Leave a note to yourself here: why this music and when to listen to it.',
    dear: 'For you,',
  },
};

const THEMES = {
  dark:  { bg: '#120503', ink: '#f3e9d2', body: '#e6dcc6', cap: '#cf8b3e', line: '#3a1d10', ghost: 'rgba(230,220,198,0.4)' },
  light: { bg: '#f3e9d2', ink: '#120503', body: '#2b1710', cap: '#a89a86', line: '#d8c9a9', ghost: 'rgba(43,23,16,0.4)' },
};

// mode: 'self' (только текст, заголовок — название вкуса) | 'gift' (кому, от кого, текст)
export function drawCard(canvas, { to, from, text, title, theme = 'dark', layout = 'edge', mode = 'self', lang = 'ru' }, discImg) {
  const words = CARD_TEXT[lang] || CARD_TEXT.ru;
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d');
  const t = THEMES[theme] || THEMES.dark;
  g.fillStyle = t.bg;
  g.fillRect(0, 0, W, H);
  g.textBaseline = 'alphabetic';

  const gift = mode === 'gift';
  const placeholder = gift ? words.phGift : words.phSelf;
  const body = text || placeholder;
  const caption = 'SOLCO';
  const heading = gift ? (to ? `${to},` : words.dear) : ''; // название вкуса на открытке не печатаем
  const signature = gift ? from : '';

  if (layout === 'center') {
    g.strokeStyle = t.line;
    g.lineWidth = 2;
    g.strokeRect(60, 60, W - 120, H - 120);
    if (discImg) g.drawImage(discImg, W / 2 - 210, 110, 420, 420);
    g.textAlign = 'center';
    g.fillStyle = t.ink;
    g.font = `600 ${gift ? 60 : 54}px ${SANS}`;
    if (heading) g.fillText(heading, W / 2, 650, 1400);
    const y0 = heading ? 722 : 680;
    g.font = `400 ${heading ? 40 : 44}px ${SANS}`;
    g.fillStyle = text ? t.body : t.ghost;
    const lines = wrap(g, body, 1100).slice(0, 5);
    lines.forEach((l, i) => g.fillText(l, W / 2, y0 + i * 56));
    if (signature) {
      g.fillStyle = t.ink;
      g.font = `400 36px ${SANS}`;
      g.fillText(`— ${signature}`, W / 2, y0 + lines.length * 56 + 44);
    }
    g.fillStyle = t.cap;
    g.font = `400 22px ${MONO}`;
    g.fillText(caption, W / 2, H - 100);
    g.textAlign = 'left';
    return;
  }

  if (discImg) {
    g.save();
    g.beginPath();
    g.rect(0, 0, W, H);
    g.clip();
    g.drawImage(discImg, W - 760, (H - 1200) / 2, 1200, 1200);
    g.restore();
  }
  const x = 120;
  g.fillStyle = t.ink;
  if (heading) {
    g.font = `600 76px ${SANS}`;
    g.fillText(heading, x, 250, 640);
  }
  g.font = `400 44px ${SANS}`;
  g.fillStyle = text ? t.body : t.ghost;
  const yb = heading ? 340 : 250;
  wrap(g, body, 640).slice(0, heading ? 9 : 10).forEach((l, i) => g.fillText(l, x, yb + i * 66));
  g.fillStyle = t.ink;
  g.font = `400 40px ${SANS}`;
  g.fillText(signature || '', x, H - 130);
  g.fillStyle = t.cap;
  g.font = `400 24px ${MONO}`;
  g.fillText(caption, x, H - 80);
}

function useDiscImage(values, seed) {
  const svg = useMemo(() => discSvg(values, { size: 1200, seed }), [values, seed]);
  const [img, setImg] = useState(null);
  useEffect(() => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = url;
    return () => URL.revokeObjectURL(url);
  }, [svg]);
  return img;
}

export const cardSeed = (title) => `gift-${title || 'solco'}`;

// Миниатюра открытки для профиля
export const CardThumb = ({ values, title, card, mode, className = '' }) => {
  const { t, lang } = useI18n();
  const ref = useRef(null);
  const img = useDiscImage(values, cardSeed(title));
  useEffect(() => {
    if (ref.current) drawCard(ref.current, { ...card, title, mode, lang }, img);
  }, [card, title, mode, img, lang]);
  useEffect(() => {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ref.current && drawCard(ref.current, { ...card, title, mode, lang }, img));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <canvas ref={ref} className={`gc-canvas ${className}`} aria-label={t('gc.card')} />;
};

export function downloadCard(values, title, card, mode, lang = 'ru') {
  const svg = discSvg(values, { size: 1200, seed: cardSeed(title) });
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    drawCard(c, { ...card, title, mode, lang }, img);
    URL.revokeObjectURL(url);
    c.toBlob(b => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'solco-otkrytka.png';
      a.click();
    });
  };
  img.src = url;
}

// Конструктор открытки. Состояние (card) живёт выше, чтобы его можно было сохранить и положить в корзину.
const GiftCard = ({ values, title, recs, selectedId, onSelect, mode = 'self', card, onChange, onGiftTest }) => {
  const { addToCart } = useCart();
  const { t, tr, lang, fmtMoney } = useI18n();
  const canvas = useRef(null);
  const [added, setAdded] = useState(false);
  const img = useDiscImage(values, cardSeed(title));
  const gift = mode === 'gift';

  useEffect(() => {
    if (canvas.current) drawCard(canvas.current, { ...card, title, mode, lang }, img);
  }, [card, title, mode, img, lang]);

  useEffect(() => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => canvas.current && drawCard(canvas.current, { ...card, title, mode, lang }, img));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => { setAdded(false); onChange({ ...card, [k]: e.target.value }); };
  const pick = (k, v) => { setAdded(false); onChange({ ...card, [k]: v }); };
  const rec = recs.find(r => r.id === selectedId) || recs[0];

  const download = () => downloadCard(values, title, card, mode, lang);

  const add = () => {
    addToCart({
      id: rec.id,
      lineId: `card-${rec.id}-${Date.now()}`,
      title: rec.title,
      description: rec.artist,
      image: rec.image,
      coverMissing: rec.coverMissing,
      taste: rec.taste,
      price: rec.price,
      card: { to: gift ? card.to.trim() : '', from: gift ? card.from.trim() : '', text: card.text.trim(), taste: title, seed: cardSeed(title), theme: card.theme, layout: card.layout, mode },
    });
    setAdded(true);
  };

  return (
    <section className="gc" id="gift-card">
      <p className="tz-eyebrow">{gift ? t('gc.eyebrowGift') : t('gc.eyebrowSelf')}</p>
      <h2 className="tz-h2">{gift ? t('gc.titleGift') : t('gc.titleSelf')}</h2>
      <p className="tz-lead gc-lead">
        {gift ? t('gc.leadGift') : t('gc.leadSelf')}
      </p>

      <div className="gc-grid">
        <div className="gc-form">
          <div className="gc-f">
            <span>{t('gc.theme')}</span>
            <div className="gc-seg" role="radiogroup" aria-label={t('gc.themeLabel')}>
              {[['dark', t('gc.dark')], ['light', t('gc.light')]].map(([v, l]) => (
                <button key={v} type="button" role="radio" aria-checked={card.theme === v} className={card.theme === v ? 'on' : ''} onClick={() => pick('theme', v)}>{l}</button>
              ))}
            </div>
          </div>
          <div className="gc-f">
            <span>{t('gc.layout')}</span>
            <div className="gc-seg" role="radiogroup" aria-label={t('gc.layoutLabel')}>
              {[['edge', t('gc.edge')], ['center', t('gc.center')]].map(([v, l]) => (
                <button key={v} type="button" role="radio" aria-checked={card.layout === v} className={card.layout === v ? 'on' : ''} onClick={() => pick('layout', v)}>{l}</button>
              ))}
            </div>
          </div>

          {gift && (
            <label className="gc-f"><span>{t('gc.to')}</span>
              <input value={card.to} onChange={set('to')} maxLength={40} placeholder={t('gc.toPh')} />
            </label>
          )}
          <label className="gc-f"><span>{gift ? t('gc.writeGift') : t('gc.writeSelf')} <small>{t('gc.optional')}</small></span>
            <textarea value={card.text} onChange={set('text')} maxLength={MAX_TEXT} rows={5} placeholder={gift ? t('gc.phGift') : t('gc.phSelf')} />
            <em>{card.text.length}/{MAX_TEXT}</em>
          </label>
          {gift && (
            <label className="gc-f"><span>{t('gc.from')}</span>
              <input value={card.from} onChange={set('from')} maxLength={40} placeholder={t('gc.fromPh')} />
            </label>
          )}

          {!gift && onGiftTest && (
            <p className="gc-note">
              {t('gc.giftNote')}
              {' '}<button type="button" className="tz-link" onClick={onGiftTest}>{t('gc.giftTest')}</button>
            </p>
          )}

          <div className="gc-f">
            <span>{t('gc.which')}</span>
            <div className="gc-recs">
              {recs.map(r => (
                <button key={r.id} type="button" className={`tz-chip ${rec && rec.id === r.id ? 'sel' : ''}`} aria-pressed={!!rec && rec.id === r.id} onClick={() => { setAdded(false); onSelect(r.id); }}>
                  {tr.name(r.title)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="gc-preview">
          <canvas ref={canvas} className="gc-canvas" aria-label={t('gc.preview')} />
          <div className="tz-actions gc-actions">
            <button className="tz-btn" onClick={add}>{added ? t('gc.added') : `${t('gc.add')} · ${rec ? fmtMoney(rec.price) : ''}`}</button>
            <button className="tz-btn tz-btn-ghost" onClick={download}>{t('gc.download')}</button>
          </div>
          <p className="tz-hint">{t('gc.hint')}</p>
        </div>
      </div>
    </section>
  );
};

export default GiftCard;
