import React, { useEffect, useMemo, useState } from 'react';
import Reveal from '../components/Reveal';
import Haze from '../components/Haze';
import { EVENTS, EVENT_TYPES, ARCHIVE, dayNum } from '../data/events';
import { useI18n } from '../i18n/I18nContext';
import '../styles/pages/Events.css';

const KEY = 'solco.tickets';
const img = (name) => `${process.env.PUBLIC_URL}/assets/events/${name}.jpg`;

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
  const { t, fmtMoney, longDate, monthShort, weekday } = useI18n();
  const rub = (n) => (n === 0 ? t('ev.free') : fmtMoney(n));
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

  const booked = (id) => tickets.filter(x => x.eventId === id).reduce((n, x) => n + x.seats, 0);
  const left = (e) => Math.max(0, e.left - booked(e.id));
  const list = useMemo(() => EVENTS.filter(e => type === 'all' || e.type === type), [type]);
  const next = EVENTS[0];

  const open = (e) => { setBooking(e); setDone(false); setForm(f => ({ ...f, seats: 1 })); };
  const close = () => setBooking(null);
  const phoneOk = form.phone.replace(/\D/g, '').length === 11;
  const submit = (ev) => {
    ev.preventDefault();
    if (!phoneOk || !form.name.trim()) return;
    setTickets(list => [...list, { eventId: booking.id, name: form.name.trim(), phone: form.phone, seats: form.seats, at: new Date().toISOString() }]);
    setDone(true);
  };

  return (
    <main className="ev">
      <Haze scope=".ev" />
      <section className="ev-hero">
        <div className="ev-hero-bg" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/contacts/vinylbg.jpg)` }} aria-hidden="true" />
        <div className="container ev-hero-in">
          <p className="ct-eyebrow">{t('ev.eyebrow')}</p>
          <h1 className="ev-h1">{t('ev.h1')}</h1>
          <p className="ev-lead">{t('ev.lead')}</p>
          <div className="ev-hero-a">
            <a className="btn btn-primary" href="#ev-list">{t('ev.see')}</a>
            <button className="btn btn-white" type="button" onClick={() => open(next)}>{t('ev.signUpFor', { date: longDate(next.date) })}</button>
          </div>
        </div>
      </section>

      <section className="container ev-sec" id="ev-list">
        <Reveal className="ev-head">
          <div>
            <p className="ct-eyebrow">{t('ev.poster')}</p>
            <h2 className="ct-title">{t('ev.upcoming')}</h2>
          </div>
          <div className="ct-filters ev-filters" role="group" aria-label={t('ev.typeLabel')}>
            {EVENT_TYPES.map(k => (
              <button key={k} type="button" className={`ct-filter ${type === k ? 'on' : ''}`} aria-pressed={type === k} onClick={() => setType(k)}>{t(`ev.type.${k}`)}</button>
            ))}
          </div>
        </Reveal>

        <div className="ev-list">
          {list.map((e, i) => {
            const l = left(e);
            const mine = tickets.some(x => x.eventId === e.id);
            return (
              <Reveal as="article" className="ev-card" key={e.id} delay={(i % 2) * 80}>
                <div className="ev-photo">
                  <img src={img(e.photo)} alt="" loading="lazy" />
                  <span className="ev-type">{t(`ev.kind.${e.type}`)}</span>
                </div>
                <div className="ev-stub" aria-label={`${longDate(e.date)}, ${e.time}`}>
                  <b>{dayNum(e.date)}</b>
                  <span>{monthShort(e.date)}</span>
                  <i>{weekday(e.date)} · {e.time}</i>
                </div>
                <div className="ev-body">
                  <h3>{t(`ev.${e.id}.title`)}</h3>
                  <p>{t(`ev.${e.id}.text`)}</p>
                  <ul className="ev-meta">
                    <li>{t('ev.place')}</li>
                    <li>{rub(e.price)}</li>
                    <li className={l <= 5 ? 'few' : ''}>{l === 0 ? t('ev.soldOut') : t('ev.left', { n: l })}</li>
                  </ul>
                  <button type="button" className="ev-btn" disabled={l === 0} onClick={() => open(e)}>{mine ? t('ev.mine') : l === 0 ? t('ev.soldOut') : t('ev.signUp')}</button>
                </div>
              </Reveal>
            );
          })}
          {list.length === 0 && <p className="ev-none">{t('ev.none')}</p>}
        </div>
      </section>

      <section className="container ev-sec ev-arch">
        <Reveal>
          <p className="ct-eyebrow">{t('ev.pastEyebrow')}</p>
          <h2 className="ct-title ev-title-s">{t('ev.past')}</h2>
        </Reveal>
        <Reveal className="ev-arch-row" delay={100}>
          {ARCHIVE.map(a => (
            <figure key={a.id} className="ev-shot">
              <img src={img(a.photo)} alt="" loading="lazy" />
              <figcaption><b>{t(`ev.${a.id}.title`)}</b><span>{longDate(a.date)}</span></figcaption>
            </figure>
          ))}
        </Reveal>
      </section>

      <section className="container ev-sec ev-host">
        <Reveal className="ev-host-in">
          <div>
            <p className="ct-eyebrow">{t('ev.hostEyebrow')}</p>
            <h2 className="ct-title ev-title-s">{t('ev.host')}</h2>
            <p className="ev-lead">{t('ev.hostText')}</p>
          </div>
          <div className="ev-host-a">
            <a className="btn btn-primary" href="https://t.me/pollinaver">{t('ev.tg')}</a>
            <button type="button" className="ev-link" onClick={() => onNavigate('about')}>{t('ev.about')}</button>
          </div>
        </Reveal>
      </section>

      {booking && (
        <div className="ev-modal" role="dialog" aria-modal="true" aria-label={t('ev.modalLabel', { title: t(`ev.${booking.id}.title`) })} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="ev-sheet">
            <button type="button" className="ev-x" onClick={close} aria-label={t('ev.close')}>✕</button>
            {done ? (
              <div className="ev-ok">
                <p className="ct-eyebrow">{t('ev.okEyebrow')}</p>
                <h3>{t('ev.okTitle', { name: form.name.trim().split(' ')[0] })}</h3>
                <p>{t('ev.okText', { title: t(`ev.${booking.id}.title`), date: longDate(booking.date), time: booking.time, seats: form.seats, phone: form.phone })}</p>
                <button type="button" className="ev-btn" onClick={close}>{t('ev.okBtn')}</button>
                <p className="ev-fine">{t('ev.fine')}</p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <p className="ct-eyebrow">{t('ev.formEyebrow', { date: longDate(booking.date).toUpperCase(), time: booking.time })}</p>
                <h3>{t(`ev.${booking.id}.title`)}</h3>
                <label className="ev-f"><span>{t('ev.name')}</span>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="given-name" required autoFocus />
                </label>
                <label className="ev-f"><span>{t('ev.phone')}</span>
                  <input value={form.phone} inputMode="tel" placeholder="+7 (900) 000-00-00" autoComplete="tel"
                    onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} />
                </label>
                <div className="ev-f"><span>{t('ev.seats')}</span>
                  <div className="ev-step">
                    <button type="button" onClick={() => setForm(f => ({ ...f, seats: Math.max(1, f.seats - 1) }))} aria-label={t('ev.less')}>−</button>
                    <b>{form.seats}</b>
                    <button type="button" onClick={() => setForm(f => ({ ...f, seats: Math.min(Math.min(4, left(booking)), f.seats + 1) }))} aria-label={t('ev.more')}>+</button>
                  </div>
                </div>
                <div className="ev-sum"><span>{t('ev.toPay')}</span><b>{booking.price === 0 ? t('ev.free') : fmtMoney(booking.price * form.seats)}</b></div>
                <button type="submit" className="ev-btn ev-wide" disabled={!phoneOk || !form.name.trim()}>{t('ev.signUp')}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default Events;
