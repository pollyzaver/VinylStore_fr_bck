// Сохранённые диски вкуса: хранятся в браузере (localStorage), вход не нужен.
const KEY = 'solco.discs';
const MAX = 20;

export function getDiscs() {
  try {
    const a = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(a) ? a : [];
  } catch (e) { return []; }
}

function put(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); } catch (e) { /* без хранилища тоже работает */ }
}

export function saveDisc(entry) {
  put([entry, ...getDiscs().filter(x => x.id !== entry.id)]);
}

// Обновить поля сохранённого диска (например, открытку)
export function updateDisc(id, patch) {
  put(getDiscs().map(x => (x.id === id ? { ...x, ...patch } : x)));
}

export const defaultCard = () => ({ theme: 'dark', layout: 'edge', to: '', from: '', text: '' });

export function removeDisc(id) {
  put(getDiscs().filter(x => x.id !== id));
}

export function slimRec(r) {
  return {
    id: r.id, title: r.title, artist: r.artist, year: r.year, image: r.image,
    coverMissing: !!r.coverMissing, price: r.price, match: r.match, why: r.why, taste: r.taste,
  };
}

// «Открыть сохранённый диск на странице теста»
export function setOpen(id, gift) {
  try { sessionStorage.setItem('solco.open', JSON.stringify({ id, gift: !!gift })); } catch (e) { /* ок */ }
}

export function takeOpen() {
  try {
    const v = JSON.parse(sessionStorage.getItem('solco.open') || 'null');
    sessionStorage.removeItem('solco.open');
    return v;
  } catch (e) { return null; }
}
