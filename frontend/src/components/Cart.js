import React, { useEffect, useRef, useState } from 'react';
import { useCart, CARD_PRICE } from '../context/CartContext';
import CoverImg from './CoverImg';
import '../styles/components/Cart.css';

const rub = (n) => `${Number(n).toLocaleString('ru-RU')} ₽`;
const plural = (n) => { const a = n % 100, b = n % 10; return a > 10 && a < 20 ? 'пластинок' : b === 1 ? 'пластинка' : b > 1 && b < 5 ? 'пластинки' : 'пластинок'; };
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
    const t = setTimeout(() => { const b = panel.current && panel.current.querySelector('.cd-x'); if (b) b.focus(); }, 60);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); clearTimeout(t); };
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

  const title = step === 'form' ? 'Оформление' : step === 'done' ? 'Заказ принят' : 'Корзина';

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
            <button type="button" className="cd-ib" onClick={() => setStep('cart')} aria-label="Назад в корзину"><Back /></button>
          ) : null}
          <h2 id="cd-title">{title}{step === 'cart' && count > 0 && <em>{count}</em>}</h2>
          <button type="button" className="cd-ib cd-x" onClick={step === 'done' ? finish : onClose} aria-label="Закрыть"><Close /></button>
        </header>

        {step === 'cart' && (
          items.length === 0 ? (
            <div className="cd-empty">
              <div className="cd-empty-disc" aria-hidden="true">
                <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" /><circle cx="50" cy="50" r="36" /><circle cx="50" cy="50" r="26" /><circle cx="50" cy="50" r="15" className="lab" /><circle cx="50" cy="50" r="2.2" className="hole" /></svg>
              </div>
              <p className="cd-empty-h">Здесь пока тихо</p>
              <p className="cd-empty-t">Пройди тест, и мы нарисуем диск твоего вкуса и подберём под него пластинки. Или просто загляни в каталог.</p>
              <div className="cd-empty-a">
                <button type="button" className="cd-btn" onClick={() => goTo('test')}>Пройти тест</button>
                <button type="button" className="cd-btn cd-btn-ghost" onClick={() => goTo('catalog')}>В каталог</button>
              </div>
            </div>
          ) : (
            <>
              <ul className="cd-list">
                {items.map((item) => (
                  <li key={lineKey(item)} className="cd-line">
                    <div className="cd-cover"><CoverImg product={item} alt={`Обложка: ${item.title}`} /></div>
                    <div className="cd-info">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      {item.card && (
                        <p className="cd-card">
                          <b>Открытка · +{rub(CARD_PRICE)}</b>
                          <button type="button" className="cd-card-rm" onClick={() => removeCard(lineKey(item))}>Убрать открытку</button>
                        </p>
                      )}
                      <div className="cd-row">
                        <div className="cd-qty" role="group" aria-label={`Количество: ${item.title}`}>
                          <button type="button" onClick={() => updateQuantity(lineKey(item), item.quantity - 1)} aria-label="Меньше">−</button>
                          <span aria-live="polite">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(lineKey(item), item.quantity + 1)} aria-label="Больше">+</button>
                        </div>
                        <span className="cd-price">{rub(lineSum(item))}</span>
                      </div>
                    </div>
                    <button type="button" className="cd-rm" onClick={() => removeFromCart(lineKey(item))} aria-label={`Убрать: ${item.title}`}><Trash /></button>
                  </li>
                ))}
              </ul>

              <footer className="cd-foot">
                <dl className="cd-sum">
                  <div><dt>Пластинки</dt><dd>{rub(total - cardsCount * CARD_PRICE)}</dd></div>
                  {cardsCount > 0 && <div><dt>Открытки · {cardsCount} × {rub(CARD_PRICE)}</dt><dd>{rub(cardsCount * CARD_PRICE)}</dd></div>}
                  <div><dt>Доставка по Москве</dt><dd>бесплатно</dd></div>
                  <div className="t"><dt>Итого</dt><dd>{rub(total)}</dd></div>
                </dl>
                <button type="button" className="cd-btn cd-wide" onClick={() => setStep('form')}>Оформить заказ</button>
                {confirmClear ? (
                  <p className="cd-clear">
                    Убрать всё из корзины?
                    <button type="button" onClick={() => { clearCart(); setConfirmClear(false); }}>Да, очистить</button>
                    <button type="button" onClick={() => setConfirmClear(false)}>Нет</button>
                  </p>
                ) : (
                  <button type="button" className="cd-link" onClick={() => setConfirmClear(true)}>Очистить корзину</button>
                )}
              </footer>
            </>
          )
        )}

        {step === 'form' && (
          <form className="cd-form" onSubmit={submit}>
            <p className="cd-eyebrow">КОНТАКТЫ</p>
            <label className="cd-f"><span>Как к вам обращаться</span>
              <input value={form.name} onChange={set('name')} required autoComplete="name" placeholder="Полина" />
            </label>
            <label className="cd-f"><span>Телефон</span>
              <input value={form.phone} onChange={set('phone')} required type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (999) 123-45-67" aria-invalid={form.phone.length > 3 && !phoneOk} />
              {form.phone.length > 3 && !phoneOk && <em className="cd-err">Нужно 11 цифр</em>}
            </label>

            <p className="cd-eyebrow">ПОЛУЧЕНИЕ</p>
            <div className="cd-seg" role="radiogroup" aria-label="Способ получения">
              {[['courier', 'Курьер по Москве'], ['pickup', 'Самовывоз']].map(([v, l]) => (
                <button key={v} type="button" role="radio" aria-checked={form.delivery === v} className={form.delivery === v ? 'on' : ''} onClick={() => setForm((f) => ({ ...f, delivery: v }))}>{l}</button>
              ))}
            </div>
            {form.delivery === 'courier' ? (
              <label className="cd-f"><span>Адрес</span>
                <input value={form.address} onChange={set('address')} required autoComplete="street-address" placeholder="Улица, дом, квартира" />
              </label>
            ) : (
              <p className="cd-note">Заберёшь в магазине в Москве. Адрес и время пришлём сообщением, когда соберём заказ.</p>
            )}

            <p className="cd-eyebrow">ОПЛАТА</p>
            <div className="cd-seg" role="radiogroup" aria-label="Способ оплаты">
              {[['cash', 'При получении'], ['card', 'Картой онлайн']].map(([v, l]) => (
                <button key={v} type="button" role="radio" aria-checked={form.payment === v} className={form.payment === v ? 'on' : ''} onClick={() => setForm((f) => ({ ...f, payment: v }))}>{l}</button>
              ))}
            </div>
            {form.payment === 'card' && <p className="cd-note">Ссылку для оплаты пришлём после подтверждения.</p>}

            <label className="cd-f"><span>Комментарий <small>необязательно</small></span>
              <textarea value={form.comment} onChange={set('comment')} rows={3} placeholder="Позвонить за час, оставить у консьержа…" />
            </label>

            <div className="cd-recap">
              <p className="cd-eyebrow">В ЗАКАЗЕ · {count}</p>
              <ul>
                {items.map((i) => (
                  <li key={lineKey(i)}><span>{i.title}{i.quantity > 1 ? ` × ${i.quantity}` : ''}{i.card ? ' · открытка' : ''}</span><b>{rub(lineSum(i))}</b></li>
                ))}
              </ul>
              <div className="cd-recap-t"><span>Итого к оплате</span><b>{rub(total)}</b></div>
            </div>

            <button type="submit" className="cd-btn cd-wide" disabled={!phoneOk}>Подтвердить заказ · {rub(total)}</button>
            <p className="cd-fine">Это учебный проект: заказ не отправляется и деньги не списываются.</p>
          </form>
        )}

        {step === 'done' && order && (
          <div className="cd-done">
            <div className="cd-done-disc" aria-hidden="true">
              <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" /><circle cx="50" cy="50" r="36" /><circle cx="50" cy="50" r="26" /><circle cx="50" cy="50" r="15" className="lab" /><circle cx="50" cy="50" r="2.2" className="hole" /></svg>
            </div>
            <p className="cd-eyebrow">ЗАКАЗ № {order.num}</p>
            <p className="cd-done-h">{order.name ? `${order.name}, спасибо!` : 'Спасибо!'}</p>
            <p className="cd-done-t">
              {order.count} {plural(order.count)} на {rub(order.total)}. Позвоним в течение часа, чтобы подтвердить{order.delivery === 'courier' ? ' время доставки' : ' самовывоз'}.
              {order.hasCard ? ' Открытку вложим в коробку.' : ''}
            </p>
            <div className="cd-empty-a">
              <button type="button" className="cd-btn" onClick={() => goTo('catalog')}>Продолжить выбор</button>
              <button type="button" className="cd-btn cd-btn-ghost" onClick={finish}>Закрыть</button>
            </div>
            <p className="cd-fine">Это учебный проект: заказ не отправляется и деньги не списываются.</p>
          </div>
        )}
      </aside>
    </div>
  );
};

export default Cart;
