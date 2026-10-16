import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { discSvg } from '../utils/tasteDisc';
import { Art, Wave, hasArt } from '../components/TasteArt';
import { VolumeInput, TapInput, MoodPad } from '../components/TasteInputs';
import GiftCard from '../components/GiftCard';
import ProductSheet from '../components/ProductSheet';
import Haze from '../components/Haze';
import TasteBg from '../components/TasteBg';
import Reveal from '../components/Reveal';
import { saveDisc, slimRec, getDiscs, takeOpen, updateDisc, defaultCard } from '../utils/discs';
import { useCart } from '../context/CartContext';
import { tasteAPI } from '../api/taste';
import '../styles/pages/Taste.css';

export const TASTE_STORE_KEY = 'solco.taste';

function Disc({ values, seed, label, className = '' }) {
  const key = JSON.stringify(values || {});
  const html = useMemo(() => discSvg(values, { seed, label }), [key, seed, label]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className={`tz-disc ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Cover({ item }) {
  const [broken, setBroken] = useState(false);
  if (!item.image || item.coverMissing || broken) {
    return <Disc values={item.taste} label={item.title} className="tz-disc-static" />;
  }
  return <img className="tz-cover" src={item.image} alt={item.title} onError={() => setBroken(true)} />;
}

export function downloadDisc(values, name) {
  const svg = discSvg(values, { size: 1200, seed: name });
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = c.height = 1400;
    const g = c.getContext('2d');
    g.fillStyle = '#120503';
    g.fillRect(0, 0, 1400, 1400);
    g.drawImage(img, 100, 100, 1200, 1200);
    URL.revokeObjectURL(url);
    c.toBlob(b => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'solco-disc.png';
      a.click();
    });
  };
  img.src = url;
}

const Taste = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [step, setStep] = useState(0);            // 0 вступление, 1..n вопросы, n+1 результат
  const [answers, setAnswers] = useState({});
  const [live, setLive] = useState(null);       // последний подсчёт по ответам
  const [shown, setShown] = useState(null);     // диск на экране: меняется только при смене вопроса
  const [result, setResult] = useState(null);
  const [pulse, setPulse] = useState(false);
  const [mode, setMode] = useState('self');       // self | gift
  const [giftRec, setGiftRec] = useState(null);
  const [card, setCard] = useState(defaultCard);
  const [addedId, setAddedId] = useState(null);
  const [discId, setDiscId] = useState(null);
  const [sheetId, setSheetId] = useState(null);
  const [dir, setDir] = useState('f');
  const [ripple, setRipple] = useState(0);
  const [axisOn, setAxisOn] = useState(false);
  const stageRef = useRef(null);
  const { addToCart } = useCart();
  const timer = useRef(null);
  const stepRef = useRef(0);
  const liveRef = useRef(null);
  stepRef.current = step;
  liveRef.current = live;

  useEffect(() => { window.scrollTo({ top: 0 }); }, [step]);
  // диск обновляется только при переходе к другому вопросу
  useEffect(() => {
    if (liveRef.current) setShown(liveRef.current);
    if (step < 1) return undefined;
    setPulse(true);
    setRipple(r => r + 1);
    const t = setTimeout(() => setPulse(false), 600);
    return () => clearTimeout(t);
  }, [step]);
  useEffect(() => {
    setAxisOn(false);
    const t = setTimeout(() => setAxisOn(true), 500);
    return () => clearTimeout(t);
  }, [step]);
  useEffect(() => {
    tasteAPI.questions().then(setData).catch(() => setError(true));
    tasteAPI.result({}, 1).then(r => { setLive(r.profile); setShown(r.profile); }).catch(() => {});
    return () => clearTimeout(timer.current);
  }, []);

  // открыть сохранённый диск из профиля
  useEffect(() => {
    if (!data) return;
    const o = takeOpen();
    if (!o) return;
    const d = getDiscs().find(x => x.id === o.id);
    if (!d) return;
    setResult({ profile: d.profile, recommendations: d.recs });
    setLive(d.profile);
    setShown(d.profile);
    setMode(d.mode || 'self');
    setCard({ ...defaultCard(), ...(d.card || {}) });
    setDiscId(d.id);
    setStep(data.questions.length + 1);
    if (o.gift) setTimeout(() => { const el = document.getElementById('gift-card'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 400);
  }, [data]);

  // открытка сохраняется вместе с диском, чтобы её можно было открыть из профиля
  useEffect(() => { if (discId) updateDisc(discId, { card, mode }); }, [card, mode, discId]);

  const questions = data ? data.questions : [];
  const n = questions.length;
  const q = step >= 1 && step <= n ? questions[step - 1] : null;

  const refresh = useCallback((next) => {
    const at = stepRef.current;
    tasteAPI.result(next, 1).then(r => {
      setLive(r.profile);
      // ответ пришёл уже после перехода к другому вопросу
      if (stepRef.current !== at) setShown(r.profile);
    }).catch(() => {});
  }, []);

  const finish = async (final) => {
    try {
      const r = await tasteAPI.result(final, 12);
      setResult(r);
      setLive(r.profile);
      try { localStorage.setItem(TASTE_STORE_KEY, JSON.stringify({ answers: final, ...r, date: new Date().toISOString() })); } catch (e) { /* без хранилища тоже работает */ }
      const id = Date.now();
      setDiscId(id);
      saveDisc({ id, date: new Date().toISOString(), mode, profile: r.profile, recs: r.recommendations.map(slimRec), card: defaultCard() });
      setStep(n + 1);
    } catch (e) { setError(true); }
  };

  const go = (to) => { setDir(to >= step ? 'f' : 'b'); setStep(to); };
  const advance = (final) => {
    if (step >= n) finish(final); else go(step + 1);
  };
  // «Пропустить»: вопрос остаётся без ответа, диск считается по остальным
  const skip = () => {
    clearTimeout(timer.current);
    const next = { ...answers };
    delete next[q.id];
    setAnswers(next);
    refresh(next);
    advance(next);
  };

  // наклон диска за курсором
  const tilt = (e) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(x * 14).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(-y * 14).toFixed(2)}deg`);
    el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const untilt = () => {
    const el = stageRef.current;
    if (!el) return;
    ['--rx', '--ry'].forEach(k => el.style.setProperty(k, '0deg'));
  };

  const pick = (value) => {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    refresh(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => advance(next), 520);
  };

  const toggle = (id) => {
    const cur = answers[q.id] || [];
    let nextList;
    if (cur.includes(id)) nextList = cur.filter(x => x !== id);
    else if (q.max && cur.length >= q.max) return;
    else nextList = [...cur, id];
    const next = { ...answers, [q.id]: nextList };
    setAnswers(next);
    refresh(next);
  };

  const debounce = useRef(null);
  const setVal = (value) => {
    const next = { ...answers };
    if (value === undefined) delete next[q.id]; else next[q.id] = value;
    setAnswers(next);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => refresh(next), 220);
  };
  const beat = () => { setPulse(true); setTimeout(() => setPulse(false), 160); };

  const restart = () => { setAnswers({}); setResult(null); setStep(0); setAddedId(null); setGiftRec(null); setCard(defaultCard()); setDiscId(null); setDir('b'); refresh({}); };
  const start = (m) => { setMode(m); setDir('f'); setStep(1); };
  const buy = (r, withCard) => {
    const item = { id: r.id, title: r.title, description: r.artist, image: r.image, coverMissing: r.coverMissing, taste: r.taste, price: r.price };
    if (withCard) {
      const gift = mode === 'gift';
      item.lineId = `card-${r.id}-${Date.now()}`;
      item.card = { to: gift ? card.to.trim() : '', from: gift ? card.from.trim() : '', text: card.text.trim(), taste: result.profile.title, seed: `gift-${result.profile.title}`, theme: card.theme, layout: card.layout, mode };
    }
    addToCart(item);
    setAddedId(`${r.id}${withCard ? ':c' : ''}`);
  };
  const toCard = () => { const el = document.getElementById('gift-card'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const giftTest = () => { restart(); start('gift'); };

  if (error) {
    return (
      <div className="tz"><div className="tz-wrap tz-single">
        <h1 className="tz-h">Не получилось загрузить тест</h1>
        <p className="tz-lead">Проверь, что сервер запущен, и попробуй ещё раз.</p>
        <button className="tz-btn" onClick={() => window.location.reload()}>Обновить</button>
      </div></div>
    );
  }
  if (!data) return <div className="tz"><div className="tz-wrap tz-single"><div className="tz-spinner" /></div></div>;

  /* ---------- результат ---------- */
  if (step === n + 1 && result) {
    const vals = result.profile.values;
    return (
      <div className="tz tz-res">
        <div className="tz-wrap tz-result">
          <div className="tz-hero">
            <Disc values={vals} className="tz-disc-big tz-spin" label="Твой диск" />
            <div className="tz-hero-text">
              <p className="tz-eyebrow">{mode === 'gift' ? 'ДИСК ВКУСА В ПОДАРОК' : 'ТВОЙ ДИСК'}</p>
              <h1 className="tz-h">{String(result.profile.title).split(' · ').map((w, i) => <span key={i} className="tz-word">{w}</span>)}</h1>
              <p className="tz-lead">{result.profile.text}</p>
              <ul className="tz-axes">
                {data.axes.map(a => (
                  <li key={a.key}>
                    <span className="tz-axis-l">{a.low}</span>
                    <span className="tz-axis-bar"><i style={{ left: `${axisOn ? Math.min(96, Math.max(4, vals[a.key] * 10)) : 50}%` }} /></span>
                    <span className="tz-axis-r">{a.high}</span>
                  </li>
                ))}
              </ul>
              <div className="tz-actions">
                <button className="tz-btn" onClick={toCard}>Открытка к заказу</button>
                <button className="tz-btn tz-btn-ghost" onClick={() => onNavigate('profile')}>Мои открытки</button>
                <button className="tz-btn tz-btn-ghost" onClick={restart}>Пройти заново</button>
              </div>
            </div>
          </div>
          <h2 className="tz-h2">Тебе подойдёт</h2>
          <div className="tz-recs">
            {result.recommendations.slice(0, 9).map((r, i) => (
              <Reveal as="article" className="tz-rec" key={r.id} delay={(i % 3) * 90}>
                <button className="tz-rec-open" onClick={() => setSheetId(r.id)} aria-label={`Открыть: ${r.title}`}>
                  <div className="tz-rec-pic"><Cover item={r} /><span className="tz-match">{r.match}%</span></div>
                </button>
                <h3><button className="tz-rec-open tz-rec-name" onClick={() => setSheetId(r.id)}>{r.title}</button></h3>
                <p className="tz-rec-meta">{r.artist} · {r.year}</p>
                <p className="tz-rec-why">{r.why}</p>
                <div className="tz-rec-btns">
                  <button className="tz-link" onClick={() => buy(r)}>{addedId === String(r.id) ? 'В корзине ✓' : `В корзину · ${r.price.toLocaleString()} ₽`}</button>
                  <button className="tz-link" onClick={() => buy(r, true)}>{addedId === `${r.id}:c` ? 'С открыткой ✓' : '+ с открыткой · 100 ₽'}</button>
                </div>
              </Reveal>
            ))}
          </div>
          <ProductSheet ids={result.recommendations.slice(0, 9).map(x => x.id)} openId={sheetId} onClose={() => setSheetId(null)} />
          <div className="tz-giftzone">
          <Haze scope=".tz-giftzone" />
          <GiftCard
            values={vals}
            title={result.profile.title}
            recs={result.recommendations.slice(0, 9)}
            selectedId={giftRec}
            onSelect={setGiftRec}
            mode={mode}
            card={card}
            onChange={setCard}
            onGiftTest={giftTest}
          />
          </div>
        </div>
      </div>
    );
  }

  /* ---------- вступление и вопросы ---------- */
  const values = shown ? shown.values : undefined;
  const answered = q ? answers[q.id] !== undefined && (!Array.isArray(answers[q.id]) || answers[q.id].length > 0) : false;

  return (
    <div className="tz">
      <TasteBg pulse={ripple} progress={n ? Math.max(0, step - 1) / n : 0} />
      <div className="tz-wrap">
        <div className="tz-stage">
          <div className="tz-tilt" ref={stageRef} onPointerMove={tilt} onPointerLeave={untilt}>
            <Disc values={values} className={`tz-disc-big tz-spin ${pulse ? 'tz-pulse' : ''}`} label="Твой диск вкуса" />
            <i className="tz-glare" aria-hidden="true" />
            {ripple > 0 && <i className="tz-ripple" key={ripple} aria-hidden="true" />}
          </div>
          <p className="tz-live" key={shown ? shown.title : 'empty'}>{step === 0 ? 'Пока диск пустой' : (shown ? shown.title : '')}</p>
        </div>

        <div className={`tz-card tz-d-${dir}`} key={step}>
          {step === 0 && (
            <>
              <p className="tz-eyebrow">ТЕСТ ВКУСА</p>
              <h1 className="tz-h">Нарисуем твой диск</h1>
              <p className="tz-lead">{n} коротких вопросов. С каждым ответом диск справа меняется, а в конце ты получишь диск вкуса, пластинки, которые под него подходят, и открытку в подарок к заказу.</p>
              <p className="tz-hint">Для кого выбираем?</p>
              <div className="tz-actions tz-who">
                <button className="tz-btn" onClick={() => start('self')}>Для себя</button>
                <button className="tz-btn tz-btn-ghost" onClick={() => start('gift')}>В подарок</button>
              </div>
              <p className="tz-hint tz-gift-warn"><b>Если выбираешь «В подарок»</b>, отвечай так, как ответил бы человек, которому дарим. Тогда диск, подборка и открытка будут про него: в открытке появятся поля «Кому», «От кого» и текст.</p>
            </>
          )}

          {q && (
            <>
              <div className="tz-progress" aria-label={`Вопрос ${step} из ${n}`}>
                {questions.map((x, i) => (
                  <button key={x.id} type="button" className={i < step ? 'on' : ''} disabled={i >= step - 1} aria-label={`Вернуться к вопросу ${i + 1}`} onClick={() => go(i + 1)} />
                ))}
              </div>
              <p className="tz-count"><b>{String(step).padStart(2, '0')}</b> / {String(n).padStart(2, '0')}</p>
              {mode === 'gift' && step === 1 && <p className="tz-hint tz-gift-note"><b>Подарок.</b> Отвечай так, как ответил бы тот, кому дарим, а не как ты сама.</p>}
              <p className="tz-eyebrow">{q.title.toUpperCase()}</p>
              <h2 className="tz-h tz-q">{q.question}</h2>

              {q.kind === 'scene' && (q.id === 'sound' || q.options.every(o => hasArt(`${q.id}.${o.id}`))) && (
                <div className="tz-vgrid">
                  {q.options.map(o => (
                    <button key={o.id} className={`tz-vcard ${answers[q.id] === o.id ? 'sel' : ''}`} onClick={() => pick(o.id)}>
                      {q.id === 'sound' ? <Wave kind={o.id} /> : <Art id={`${q.id}.${o.id}`} />}
                      <span>{o.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {q.kind === 'scene' && !(q.id === 'sound' || q.options.every(o => hasArt(`${q.id}.${o.id}`))) && (
                <div className="tz-opts">
                  {q.options.map(o => (
                    <button key={o.id} className={`tz-opt ${answers[q.id] === o.id ? 'sel' : ''}`} onClick={() => pick(o.id)}>{o.label}</button>
                  ))}
                </div>
              )}

              {q.kind === 'slider' && <VolumeInput value={answers[q.id]} onChange={setVal} ui={q.ui} />}
              {q.kind === 'tap' && <TapInput value={answers[q.id]} onResult={setVal} onBeat={beat} ui={q.ui} />}
              {q.kind === 'pad' && <MoodPad value={answers[q.id]} onChange={setVal} ui={q.ui} />}

              {(q.kind === 'slider' || q.kind === 'tap' || q.kind === 'pad') && (
                <div className="tz-actions">
                  <button className="tz-btn" disabled={!answered} onClick={() => advance(answers)}>{step >= n ? 'Показать мой диск' : 'Дальше'}</button>
                </div>
              )}

              {q.kind === 'duel' && (
                <>
                  <div className="tz-duel">
                    {['a', 'b'].map(side => (
                      <button key={side} className={`tz-duel-card ${answers[q.id] === side ? 'sel' : ''}`} onClick={() => pick(side)}>
                        <div className="tz-duel-pic"><Cover item={q[side]} /></div>
                        <strong>{q[side].title}</strong>
                        <span>{q[side].artist} · {q[side].year}</span>
                      </button>
                    ))}
                  </div>
                  <button className="tz-link" onClick={() => pick('both')}>Не могу выбрать</button>
                </>
              )}

              {(q.kind === 'multi' || q.kind === 'mix') && (
                <>
                  <div className="tz-chips">
                    {q.options.map(o => {
                      const on = (answers[q.id] || []).includes(o.id);
                      return <button key={o.id} className={`tz-chip ${on ? 'sel' : ''}`} onClick={() => toggle(o.id)} aria-pressed={on}>{o.label}</button>;
                    })}
                  </div>
                  {q.max && <p className="tz-hint">Можно выбрать до {q.max}</p>}
                  <div className="tz-actions">
                    <button className="tz-btn" disabled={!answered} onClick={() => advance(answers)}>{step >= n ? 'Показать мой диск' : 'Дальше'}</button>
                  </div>
                </>
              )}

              <div className="tz-foot">
                {step > 1 ? <button type="button" className="tz-foot-b" onClick={() => go(step - 1)}>← Назад</button> : <span />}
                <button type="button" className="tz-foot-b tz-skip" onClick={skip}>{(q.ui && q.ui.skip) || 'Пропустить'} →</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Taste;
