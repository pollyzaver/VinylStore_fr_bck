import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import common from './dict/common';
import home from './dict/home';
import cart from './dict/cart';
import shop from './dict/shop';
import gift from './dict/gift';
import taste from './dict/taste';
import events from './dict/events';
import account from './dict/account';

// Языки сайта. Чтобы добавить новый, достаточно положить его строки в словари
// (dict/*.js) и дописать код сюда.
export const LANGS = [
  { code: 'ru', label: 'RU', name: 'Русский', locale: 'ru-RU' },
  { code: 'en', label: 'EN', name: 'English', locale: 'en-GB' },
];

const DICTS = [common, home, cart, shop, gift, taste, events, account];
const STORAGE_KEY = 'solco.lang';

const build = (code) => DICTS.reduce((acc, d) => Object.assign(acc, d[code] || {}), {});
const TABLES = Object.fromEntries(LANGS.map((l) => [l.code, build(l.code)]));

const detect = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && TABLES[saved]) return saved;
  } catch (e) { /* хранилище недоступно */ }
  const nav = (typeof navigator !== 'undefined' && navigator.language || 'ru').slice(0, 2).toLowerCase();
  return TABLES[nav] ? nav : 'ru';
};

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(detect);

  const setLang = useCallback((code) => {
    if (!TABLES[code]) return;
    setLangState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* ничего страшного */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    const table = TABLES[lang];
    document.title = table['meta.title'];
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', table['meta.description']);
  }, [lang]);

  const value = useMemo(() => {
    const table = TABLES[lang];
    const fallback = TABLES.ru;
    const locale = LANGS.find((l) => l.code === lang).locale;
    const rules = new Intl.PluralRules(locale);

    // t('key', { n: 3 }): подставляет {n}; если есть ключи key_one / key_few / key_many / key_other,
    // выбирает форму по числу n.
    const t = (key, vars) => {
      let str;
      if (vars && typeof vars.n === 'number') {
        const form = `${key}_${rules.select(vars.n)}`;
        str = table[form] ?? table[`${key}_other`];
      }
      if (str === undefined) str = table[key] ?? fallback[key] ?? key;
      if (vars) str = str.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
      return str;
    };

    // Данные товаров лежат в базе по-русски. Здесь они переводятся по словарям: жанр, значок, страна, формат, имена.
    const part = (prefix, s) => (s == null ? s : s.split(/(, | \/ |\/)/).map((p) => table[prefix + p] ?? p).join(''));
    const tr = {
      genre: (g) => part('g:', g),
      badge: (b) => (b == null ? b : table[`b:${b}`] ?? b),
      country: (c) => part('c:', c),
      format: (f) => (f == null ? f : table[`f:${f}`] ?? f),
      name: (n) => (n == null ? n : table[`n:${n}`] ?? n),
      server: (m) => (m == null ? m : table[`srv:${m}`] ?? m),   // сообщения об ошибках с сервера
    };

    const fmtDate = (iso, opts) => new Date(`${iso}T12:00:00`).toLocaleDateString(locale, opts);
    const longDate = (iso) => fmtDate(iso, { day: 'numeric', month: 'long' });
    const monthShort = (iso) => fmtDate(iso, { month: 'short' }).replace('.', '');
    const weekday = (iso) => fmtDate(iso, { weekday: 'short' });
    const fmtMoney = (n) => `${Number(n).toLocaleString(locale)} ${t('cur')}`;

    return { lang, setLang, t, tr, locale, fmtDate, longDate, monthShort, weekday, fmtMoney };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n нужно вызывать внутри I18nProvider');
  return ctx;
};
