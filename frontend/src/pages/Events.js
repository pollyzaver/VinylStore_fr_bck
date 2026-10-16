import React, { useEffect, useMemo, useState } from 'react';
import Reveal from '../components/Reveal';
import Haze from '../components/Haze';
import { EVENTS, EVENT_TYPES, ARCHIVE, dayNum, monthShort, weekday, longDate } from '../data/events';
import '../styles/pages/Events.css';

const KEY = 'solco.tickets';
const img = (name) => `${process.env.PUBLIC_URL}/assets/events/${name}.jpg`;
const rub = (n) => (n === 0 ? 'Бесплатно' : `${n.toLocaleString('ru-RU')} ₽`);
const seatWord = (n) => { const a = n % 100, b = n % 10; return a > 10 && a < 20 ? 'мест' : b === 1 ? 'место' : b > 1 && b < 5 ? 'места' : 'мест'; };

function readTickets() {
  try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}

const maskPhone = (v) => {
  const d = v.replace(/\D/g, '').replace(/^[78]/, '').slice(0, 10);
  let out = '+7';
  if (d.length) out += ` (${d.slice(0, 3)}`;
  if (d.length >= 3) out += ')';
  if (d.length > 3) out += ` ${d.slice(3, 6)}`;
  if (d.length > 6) out += `-${d.slice(6, 8)}`;
  if (d.length > 8) out += `-${d.slice(8, 10)}`;
  return out;
};

const Events = ({ onNavigate }) => {
  const [type, setType] = useState('all');
  const [tickets, setTickets] = useState(readTickets);
  const [booking, setBooking] = useState(null);       // событие, на которое записываемся
  const [form, setForm] = useState({ name: '', phone: '', seats: 1 });
  const [done, setDone] = useState(false);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(tickets)); } catch (e) { /* без хранилища тоже работает */ } }, [tickets]);
  useEffect(() => {
    if (!booking) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [booking]); // eslint-disable-line react-hooks/exhaustive-deps

  const booked = (id) => tickets.filter(t => t.eventId === id).reduce((n, t) => n + t.seats, 0);
  const left = (e) => Math.max(0, e.left - booked(e.id));
  const list = useMemo(() => EVENTS.filter(e => type === 'all' || e.type === type), [type]);
  const next = EVENTS[0];

  const open = (e) => { setBooking(e); setDone(false); setForm(f => ({ ...f, seats: 1 })); };
  const close = () => setBooking(null);
  const phoneOk = form.phone.replace(/\D/g, '').length === 11;
  const submit = (ev) => {
    ev.preventDefault();
    if (!phoneOk || !form.name.trim()) return;
    setTickets(t => [...t, { eventId: booking.id, name: form.name.trim(), phone: form.phone, seats: form.seats, at: new Date().toISOString() }]);
    setDone(true);
  };

  return (
    <main className="ev">
      <Haze scope=".ev" />
      <section className="ev-hero">
        <div className="ev-hero-bg" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/contacts/vinylbg.jpg)` }} aria-hidden="true" />
        <div className="container ev-hero-in">
          <p className="ct-eyebrow">SOLCO LIVE · ОСЕНЬ 2026</p>
          <h1 className="ev-h1">Вечера, где пластинки звучат вживую</h1>
          <p className="ev-lead">Прослушивания, диджей-сеты, обмен пластинками и мастер-классы. Небольшие вечера в приглушённом свете, на хорошем звуке и среди своих.</p>
          <div className="ev-hero-a">
            <a className="btn btn-primary" href="#ev-list">Смотреть афишу</a>
            <button className="btn btn-white" type="button" onClick={() => open(next)}>Записаться на {longDate(next.date)}</button>
          </div>
        </div>
      </section>

      <section className="container ev-sec" id="ev-list">
        <Reveal className="ev-head">
          <div>
            <p className="ct-eyebrow">АФИША</p>
            <h2 className="ct-title">Ближайшие вечера</h2>
          </div>
          <div className="ct-filters ev-filters" role="group" aria-label="Тип события">
            {EVENT_TYPES.map(t => (
              <button key={t.key} type="button" className={`ct-filter ${type === t.key ? 'on' : ''}`} aria-pressed={type === t.key} onClick={() => setType(t.key)}>{t.label}</button>
            ))}
          </div>
        </Reveal>

        <div className="ev-list">
          {list.map((e, i) => {
            const l = left(e);
            const mine = tickets.some(t => t.eventId === e.id);
            return (
              <Reveal as="article" className="ev-card" key={e.id} delay={(i % 2) * 80}>
                <div className="ev-photo">
                  <img src={img(e.photo)} alt="" loading="lazy" />
                  <span className="ev-type">{e.typeLabel}</span>
                </div>
                <div className="ev-stub" aria-label={`${longDate(e.date)}, ${e.time}`}>
                  <b>{dayNum(e.date)}</b>
                  <span>{monthShort(e.date)}</span>
                  <i>{weekday(e.date)} · {e.time}</i>
                </div>
                <div className="ev-body">
                  <h3>{e.title}</h3>
                  <p>{e.text}</p>
                  <ul className="ev-meta">
                    <li>{e.place}</li>
                    <li>{rub(e.price)}</li>
                    <li className={l <= 5 ? 'few' : ''}>{l === 0 ? 'Мест нет' : `Осталось ${l} ${seatWord(l)}`}</li>
                  </ul>
                  <button type="button" className="ev-btn" disabled={l === 0} onClick={() => open(e)}>{mine ? 'Вы записаны · ещё место' : l === 0 ? 'Мест нет' : 'Записаться'}</button>
                </div>
              </Reveal>
            );
          })}
          {list.length === 0 && <p className="ev-none">В этой категории пока ничего нет. Загляни позже.</p>}
        </div>
      </section>

      <section className="container ev-sec ev-arch">
        <Reveal>
          <p className="ct-eyebrow">КАК ЭТО БЫЛО</p>
          <h2 className="ct-title ev-title-s">Прошедшие вечера</h2>
        </Reveal>
        <Reveal className="ev-arch-row" delay={100}>
          {ARCHIVE.map(a => (
            <figure key={a.id} className="ev-shot">
              <img src={img(a.photo)} alt="" loading="lazy" />
              <figcaption><b>{a.title}</b><span>{longDate(a.date)}</span></figcaption>
            </figure>
          ))}
        </Reveal>
      </section>

      <section className="container ev-sec ev-host">
        <Reveal className="ev-host-in">
          <div>
            <p className="ct-eyebrow">СВОЙ ВЕЧЕР</p>
            <h2 className="ct-title ev-title-s">Хочешь провести вечер у нас?</h2>
            <p className="ev-lead">День рождения, прослушивание любимого альбома, встреча клуба. Дадим студию, аппаратуру и подборку пластинок под настроение.</p>
          </div>
          <div className="ev-host-a">
            <a className="btn btn-primary" href="https://t.me/meinewelllt">Написать в Telegram</a>
            <button type="button" className="ev-link" onClick={() => onNavigate('about')}>О магазине и контакты →</button>
          </div>
        </Reveal>
      </section>

      {booking && (
        <div className="ev-modal" role="dialog" aria-modal="true" aria-label={`Запись: ${booking.title}`} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="ev-sheet">
            <button type="button" className="ev-x" onClick={close} aria-label="Закрыть">✕</button>
            {done ? (
              <div className="ev-ok">
                <p className="ct-eyebrow">ВЫ В СПИСКЕ</p>
                <h3>Ждём тебя, {form.name.trim().split(' ')[0]}</h3>
                <p>{booking.title} · {longDate(booking.date)}, {booking.time}. Мест: {form.seats}. Адрес и детали пришлём сообщением на {form.phone}.</p>
                <button type="button" className="ev-btn" onClick={close}>Хорошо</button>
                <p className="ev-fine">Это учебный проект: запись хранится только в твоём браузере.</p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <p className="ct-eyebrow">ЗАПИСЬ · {longDate(booking.date).toUpperCase()}, {booking.time}</p>
                <h3>{booking.title}</h3>
                <label className="ev-f"><span>Как тебя зовут</span>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="given-name" required autoFocus />
                </label>
                <label className="ev-f"><span>Телефон</span>
                  <input value={form.phone} inputMode="tel" placeholder="+7 (900) 000-00-00" autoComplete="tel"
                    onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} />
                </label>
                <div className="ev-f"><span>Сколько мест</span>
                  <div className="ev-step">
                    <button type="button" onClick={() => setForm(f => ({ ...f, seats: Math.max(1, f.seats - 1) }))} aria-label="Меньше">−</button>
                    <b>{form.seats}</b>
                    <button type="button" onClick={() => setForm(f => ({ ...f, seats: Math.min(Math.min(4, left(booking)), f.seats + 1) }))} aria-label="Больше">+</button>
                  </div>
                </div>
                <div className="ev-sum"><span>К оплате на входе</span><b>{booking.price === 0 ? 'Бесплатно' : `${(booking.price * form.seats).toLocaleString('ru-RU')} ₽`}</b></div>
                <button type="submit" className="ev-btn ev-wide" disabled={!phoneOk || !form.name.trim()}>Записаться</button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default Events;
