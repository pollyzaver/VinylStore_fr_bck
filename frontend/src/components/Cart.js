import React, { useEffect, useRef, useState } from 'react';
import { useCart, CARD_PRICE } from '../context/CartContext';
import CoverImg from './CoverImg';
import { useI18n } from '../i18n/I18nContext';
import '../styles/components/Cart.css';

const lineKey = (i) => i.lineId || i.id;

const Svg = ({ children, size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{children}</svg>
);
const Close = () => <Svg size={18}><path d="M6 6l12 12M18 6L6 18" /></Svg>;
const Back = () => <Svg size={18}><path d="M15 5l-7 7 7 7" /></Svg>;
const Trash = () => <Svg size={17}><path d="M5 7h14M10 7V5h4v2M7 7l.8 12h8.4L17 7M10 11v5M14 11v5" /></Svg>;

// +7 (999) 123-45-67
const maskPhone = (raw) => {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;
  d = d.slice(0, 11);
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  let out = '+7';
  if (p[0]) out += ` (${p[0]}`;
  if (p[0].length === 3) out += ')';
  if (p[1]) out += ` ${p[1]}`;
  if (p[2]) out += `-${p[2]}`;
  if (p[3]) out += `-${p[3]}`;
  return out;
};

const EMPTY = { name: '', phone: '', delivery: 'courier', address: '', payment: 'cash', comment: '' };

const Cart = ({ isOpen, onClose, onNavigate }) => {
  const { t, tr, fmtMoney: rub } = useI18n();
  const { cart, removeFromCart, removeCard, updateQuantity, getCartTotal, clearCart } = useCart();
  const [step, setStep] = useState('cart'); // cart | form | done
  const [form, setForm] = useState(EMPTY);
  const [order, setOrder] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const panel = useRef(null);

  const items = cart.items;
  const total = getCartTotal();
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const hasCard = items.some((i) => i.card);
  const cardsCount = items.reduce((n, i) => n + (i.card ? i.quantity : 0), 0);
  const lineSum = (i) => (i.price + (i.card ? CARD_PRICE : 0)) * i.quantity;

  // при каждом открытии начинаем с корзины (если не показываем «заказ принят»)
  useEffect(() => {
    if (isOpen) { setConfirmClear(false); setStep((s) => (s === 'done' ? 'done' : 'cart')); }
  }, [isOpen]);

  // если корзина опустела посреди оформления — возвращаемся
  useEffect(() => {
    if (step !== 'done' && items.length === 0) setStep('cart');
  }, [items.length, step]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const tm = setTimeout(() => { const b = panel.current && panel.current.querySelector('.cd-x'); if (b) b.focus(); }, 60);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); clearTimeout(tm); };
  }, [isOpen, onClose]);

  useEffect(() => { if (panel.current) panel.current.scrollTop = 0; }, [step]);

  if (!isOpen) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === 'phone' ? maskPhone(e.target.value) : e.target.value }));
  const phoneOk = form.phone.replace(/\D/g, '').length === 11;

  const submit = (e) => {
    e.preventDefault();
    if (!phoneOk) return;
    const num = String(Math.floor(1000 + Math.random() * 9000));
    setOrder({ num, total, count, name: form.name.trim().split(' ')[0], delivery: form.delivery, hasCard });
    clearCart();
    setForm(EMPTY);
    setStep('done');
  };

  const finish = () => { setOrder(null); setStep('cart'); onClose(); };
  const goTo = (page) => { setOrder(null); setStep('cart'); onClose(); if (onNavigate) onNavigate(page); };

  const title = step === 'form' ? t('cart.checkout') : step === 'done' ? t('cart.done') : t('cart.title');

  return (
    <div className="cd-veil" onClick={step === 'done' ? finish : onClose}>
      <aside
        ref={panel}
        className="cd"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cd-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="cd-head">
          {step === 'form' ? (
            <button type="button" className="cd-ib" onClick={() => setStep('cart')} aria-label={t('cart.backToCart')}><Back /></button>
          ) : null}
          <h2 id="cd-title">{title}{step === 'cart' && count > 0 && <em>{count}</em>}</h2>
          <button type="button" className="cd-ib cd-x" onClick={step === 'done' ? finish : onClose} aria-label={t('cart.close')}><Close /></button>
        </header>

        {step === 'cart' && (
          items.length === 0 ? (
            <div className="cd-empty">
              <div className="cd-empty-disc" aria-hidden="true">
                <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" /><circle cx="50" cy="50" r="36" /><circle cx="50" cy="50" r="26" /><circle cx="50" cy="50" r="15" className="lab" /><circle cx="50" cy="50" r="2.2" className="hole" /></svg>
              </div>
              <p className="cd-empty-h">{t('cart.emptyH')}</p>
              <p className="cd-empty-t">{t('cart.emptyT')}</p>
              <div className="cd-empty-a">
                <button type="button" className="cd-btn" onClick={() => goTo('test')}>{t('cart.takeQuiz')}</button>
                <button type="button" className="cd-btn cd-btn-ghost" onClick={() => goTo('catalog')}>{t('cart.toCatalog')}</button>
              </div>
            </div>
          ) : (
            <>
              <ul className="cd-list">
                {items.map((item) => (
                  <li key={lineKey(item)} className="cd-line">
                    <div className="cd-cover"><CoverImg product={item} alt={t('cart.coverAlt', { title: tr.name(item.title) })} /></div>
                    <div className="cd-info">
                      <h3>{tr.name(item.title)}</h3>
                      <p>{tr.name(item.description)}</p>
                      {item.card && (
                        <p className="cd-card">
                          <b>{t('cart.card')} · +{rub(CARD_PRICE)}</b>
                          <button type="button" className="cd-card-rm" onClick={() => removeCard(lineKey(item))}>{t('cart.removeCard')}</button>
                        </p>
                      )}
                      <div className="cd-row">
                        <div className="cd-qty" role="group" aria-label={t('cart.qty', { title: tr.name(item.title) })}>
                          <button type="button" onClick={() => updateQuantity(lineKey(item), item.quantity - 1)} aria-label={t('cart.less')}>−</button>
                          <span aria-live="polite">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(lineKey(item), item.quantity + 1)} aria-label={t('cart.more')}>+</button>
                        </div>
                        <span className="cd-price">{rub(lineSum(item))}</span>
                      </div>
                    </div>
                    <button type="button" className="cd-rm" onClick={() => removeFromCart(lineKey(item))} aria-label={t('cart.removeItem', { title: tr.name(item.title) })}><Trash /></button>
                  </li>
                ))}
              </ul>

              <footer className="cd-foot">
                <dl className="cd-sum">
                  <div><dt>{t('cart.records')}</dt><dd>{rub(total - cardsCount * CARD_PRICE)}</dd></div>
                  {cardsCount > 0 && <div><dt>{t('cart.cards')} · {cardsCount} × {rub(CARD_PRICE)}</dt><dd>{rub(cardsCount * CARD_PRICE)}</dd></div>}
                  <div><dt>{t('cart.delivery')}</dt><dd>{t('cart.free')}</dd></div>
                  <div className="t"><dt>{t('cart.total')}</dt><dd>{rub(total)}</dd></div>
                </dl>
                <button type="button" className="cd-btn cd-wide" onClick={() => setStep('form')}>{t('cart.order')}</button>
                {confirmClear ? (
                  <p className="cd-clear">
                    {t('cart.clearAsk')}
                    <button type="button" onClick={() => { clearCart(); setConfirmClear(false); }}>{t('cart.clearYes')}</button>
                    <button type="button" onClick={() => setConfirmClear(false)}>{t('cart.clearNo')}</button>
                  </p>
                ) : (
                  <button type="button" className="cd-link" onClick={() => setConfirmClear(true)}>{t('cart.clear')}</button>
                )}
              </footer>
            </>
          )
        )}

        {step === 'form' && (
          <form className="cd-form" onSubmit={submit}>
            <p className="cd-eyebrow">{t('cart.contacts')}</p>
            <label className="cd-f"><span>{t('cart.name')}</span>
              <input value={form.name} onChange={set('name')} required autoComplete="name" placeholder={t('cart.namePh')} />
            </label>
            <label className="cd-f"><span>{t('cart.phone')}</span>
              <input value={form.phone} onChange={set('phone')} required type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (999) 123-45-67" aria-invalid={form.phone.length > 3 && !phoneOk} />
              {form.phone.length > 3 && !phoneOk && <em className="cd-err">{t('cart.phoneErr')}</em>}
            </label>

            <p className="cd-eyebrow">{t('cart.receiving')}</p>
            <div className="cd-seg" role="radiogroup" aria-label={t('cart.receivingLabel')}>
              {[['courier', t('cart.courier')], ['pickup', t('cart.pickup')]].map(([v, l]) => (
                <button key={v} type="button" role="radio" aria-checked={form.delivery === v} className={form.delivery === v ? 'on' : ''} onClick={() => setForm((f) => ({ ...f, delivery: v }))}>{l}</button>
              ))}
            </div>
            {form.delivery === 'courier' ? (
              <label className="cd-f"><span>{t('cart.address')}</span>
                <input value={form.address} onChange={set('address')} required autoComplete="street-address" placeholder={t('cart.addressPh')} />
              </label>
            ) : (
              <p className="cd-note">{t('cart.pickupNote')}</p>
            )}

            <p className="cd-eyebrow">{t('cart.payment')}</p>
            <div className="cd-seg" role="radiogroup" aria-label={t('cart.paymentLabel')}>
              {[['cash', t('cart.cash')], ['card', t('cart.online')]].map(([v, l]) => (
                <button key={v} type="button" role="radio" aria-checked={form.payment === v} className={form.payment === v ? 'on' : ''} onClick={() => setForm((f) => ({ ...f, payment: v }))}>{l}</button>
              ))}
            </div>
            {form.payment === 'card' && <p className="cd-note">{t('cart.payNote')}</p>}

            <label className="cd-f"><span>{t('cart.comment')} <small>{t('cart.optional')}</small></span>
              <textarea value={form.comment} onChange={set('comment')} rows={3} placeholder={t('cart.commentPh')} />
            </label>

            <div className="cd-recap">
              <p className="cd-eyebrow">{t('cart.inOrder')} · {count}</p>
              <ul>
                {items.map((i) => (
                  <li key={lineKey(i)}><span>{tr.name(i.title)}{i.quantity > 1 ? ` × ${i.quantity}` : ''}{i.card ? t('cart.withCard') : ''}</span><b>{rub(lineSum(i))}</b></li>
                ))}
              </ul>
              <div className="cd-recap-t"><span>{t('cart.payTotal')}</span><b>{rub(total)}</b></div>
            </div>

            <button type="submit" className="cd-btn cd-wide" disabled={!phoneOk}>{t('cart.confirm')} · {rub(total)}</button>
            <p className="cd-fine">{t('cart.fine')}</p>
          </form>
        )}

        {step === 'done' && order && (
          <div className="cd-done">
            <div className="cd-done-disc" aria-hidden="true">
              <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" /><circle cx="50" cy="50" r="36" /><circle cx="50" cy="50" r="26" /><circle cx="50" cy="50" r="15" className="lab" /><circle cx="50" cy="50" r="2.2" className="hole" /></svg>
            </div>
            <p className="cd-eyebrow">{t('cart.orderNo')} {order.num}</p>
            <p className="cd-done-h">{order.name ? t('cart.thanksName', { name: order.name }) : t('cart.thanks')}</p>
            <p className="cd-done-t">
              {t('cart.doneT', { count: t('cart.records', { n: order.count }), sum: rub(order.total), what: order.delivery === 'courier' ? t('cart.whatCourier') : t('cart.whatPickup') })}
              {order.hasCard ? t('cart.cardInBox') : ''}
            </p>
            <div className="cd-empty-a">
              <button type="button" className="cd-btn" onClick={() => goTo('catalog')}>{t('cart.keepShopping')}</button>
              <button type="button" className="cd-btn cd-btn-ghost" onClick={finish}>{t('cart.close')}</button>
            </div>
            <p className="cd-fine">{t('cart.fine')}</p>
          </div>
        )}
      </aside>
    </div>
  );
};

export default Cart;
