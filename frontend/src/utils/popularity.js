// Порядок на полке: сначала самые популярные, внутри каждой группы порядок случайный
// и меняется при каждой загрузке. Оценок продаж в данных нет, поэтому популярность
// берётся из бейджа пластинки.
const TOP = ['Хит', 'Бестселлер', 'Культовый', 'Легенда'];
const MID = ['Классика', 'Новинка', 'Эксклюзив', 'Коллекционное', 'Редкий', 'Раритет', 'Дебют', 'Саундтрек', 'Винтаж'];

const tier = (p) => (TOP.includes(p.badge) ? 0 : MID.includes(p.badge) ? 1 : 2);

export const shuffleByPopularity = (list) => {
  const groups = [[], [], []];
  list.forEach(p => groups[tier(p)].push(p));
  groups.forEach(g => {
    for (let i = g.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [g[i], g[j]] = [g[j], g[i]];
    }
  });
  return groups.flat();
};
