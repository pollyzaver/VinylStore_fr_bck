// Афиша Solco Live. Фото лежат в public/assets/events.
export const EVENT_TYPES = [
  { key: 'all', label: 'Все' },
  { key: 'listen', label: 'Прослушивания' },
  { key: 'night', label: 'Вечера' },
  { key: 'swap', label: 'Обмен' },
  { key: 'class', label: 'Мастер-классы' },
];

export const EVENTS = [
  { id: 'e1', date: '2026-10-24', time: '19:00', type: 'listen', typeLabel: 'Прослушивание', title: 'Тёмная меланхолия', photo: 'lamp-room', place: 'Студия Solco, Москва', price: 1200, seats: 20, left: 6,
    text: 'Два альбома целиком на хорошей аппаратуре: Massive Attack «Mezzanine» и The Cure «Disintegration». Свет приглушён, телефоны в сторону. В цену входит бокал.' },
  { id: 'e2', date: '2026-11-01', time: '16:00', type: 'swap', typeLabel: 'Обмен', title: 'Обмен пластинками', photo: 'shelf-tall', place: 'Студия Solco, Москва', price: 0, seats: 40, left: 23,
    text: 'Приноси ненужные пластинки и уходи с чужими. Каждую оценим по шкале Goldmine, а редкие подскажем, где продать.' },
  { id: 'e3', date: '2026-11-07', time: '20:00', type: 'night', typeLabel: 'Вечер', title: 'Танцпол на виниле', photo: 'disco-ball', place: 'Студия Solco, Москва', price: 800, seats: 60, left: 14,
    text: 'Диджей-сет только с пластинок: диско, хаус, синтипоп. Золотые блики по потолку, бар до последнего трека.' },
  { id: 'e4', date: '2026-11-14', time: '17:00', type: 'class', typeLabel: 'Мастер-класс', title: 'Как ухаживать за винилом', photo: 'gold-needle', place: 'Студия Solco, Москва', price: 1500, seats: 12, left: 4,
    text: 'Чистка, хранение, выбор иглы и звукоснимателя. Принеси свою пластинку, мы покажем всё на ней. Щётка в подарок.' },
  { id: 'e5', date: '2026-11-21', time: '19:00', type: 'night', typeLabel: 'Вечер', title: 'Диск вкуса вживую', photo: 'red-vinyl', place: 'Студия Solco, Москва', price: 600, seats: 24, left: 9,
    text: 'Проходим тест вместе, сравниваем диски и тут же печатаем открытки. Открытка к одной пластинке входит в билет.' },
  { id: 'e6', date: '2026-12-05', time: '19:30', type: 'listen', typeLabel: 'Прослушивание', title: 'Vinyl Night & Jazz', photo: 'shelf-warm', place: 'Студия Solco, Москва', price: 1800, seats: 30, left: 11,
    text: 'Джазовый вечер: Майлз Дэвис, Билл Эванс, Нина Симон. Пластинки выбирают гости, вино и сыры в цене.' },
];

export const ARCHIVE = [
  { id: 'a1', date: '2026-09-26', title: 'Презентация новой коллекции', photo: 'shelf-red' },
  { id: 'a2', date: '2026-09-12', title: 'Золотые блики', photo: 'dj-hands' },
  { id: 'a3', date: '2026-08-29', title: 'Открытие Solco', photo: 'vinyl-bar' },
];

const D = (iso) => new Date(`${iso}T12:00:00`);
export const dayNum = (iso) => D(iso).getDate();
export const monthShort = (iso) => D(iso).toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '');
export const weekday = (iso) => D(iso).toLocaleDateString('ru-RU', { weekday: 'short' });
export const longDate = (iso) => D(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
