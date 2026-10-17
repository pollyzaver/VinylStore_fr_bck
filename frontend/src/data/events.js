// Афиша Solco Live. Здесь только то, что не зависит от языка; названия и тексты лежат в i18n/dict/events.js.
// Фото лежат в public/assets/events.
export const EVENT_TYPES = ['all', 'listen', 'night', 'swap', 'class'];

export const EVENTS = [
  { id: 'e1', date: '2026-10-24', time: '19:00', type: 'listen', photo: 'lamp-room', price: 1200, seats: 20, left: 6 },
  { id: 'e2', date: '2026-11-01', time: '16:00', type: 'swap', photo: 'shelf-tall', price: 0, seats: 40, left: 23 },
  { id: 'e3', date: '2026-11-07', time: '20:00', type: 'night', photo: 'disco-ball', price: 800, seats: 60, left: 14 },
  { id: 'e4', date: '2026-11-14', time: '17:00', type: 'class', photo: 'gold-needle', price: 1500, seats: 12, left: 4 },
  { id: 'e5', date: '2026-11-21', time: '19:00', type: 'night', photo: 'red-vinyl', price: 600, seats: 24, left: 9 },
  { id: 'e6', date: '2026-12-05', time: '19:30', type: 'listen', photo: 'shelf-warm', price: 1800, seats: 30, left: 11 },
];

export const ARCHIVE = [
  { id: 'a1', date: '2026-09-26', photo: 'shelf-red' },
  { id: 'a2', date: '2026-09-12', photo: 'dj-hands' },
  { id: 'a3', date: '2026-08-29', photo: 'vinyl-bar' },
];

// Даты форматируются по языку сайта: fmtDate из useI18n()
const D = (iso) => new Date(`${iso}T12:00:00`);
export const dayNum = (iso) => D(iso).getDate();
