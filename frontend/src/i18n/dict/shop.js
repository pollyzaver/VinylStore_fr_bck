// Каталог: полка, карточка пластинки, а также перевод данных товаров (жанр, значок, страна, формат)
const genres = {
  'R&B': 'R&B', 'Альтернатива': 'Alternative', 'Блюз': 'Blues', 'Вокальный джаз': 'Vocal jazz', 'Гаражный рок': 'Garage rock',
  'Глэм-рок': 'Glam rock', 'Джаз': 'Jazz', 'джаз': 'jazz', 'соул': 'soul', 'Джаз-фанк': 'Jazz-funk', 'Дрим-поп': 'Dream pop',
  'Индастриал-метал': 'Industrial metal', 'Инди-рок': 'Indie rock', 'Инди-фолк': 'Indie folk', 'Кантри': 'Country',
  'Метал': 'Metal', 'Мировая музыка': 'World music', 'Нео-соул': 'Neo-soul', 'Ню-метал': 'Nu metal', 'Панк-рок': 'Punk rock',
  'Поп': 'Pop', 'фанк': 'funk', 'Поп-рок': 'Pop rock', 'Поп-фолк': 'Pop folk', 'Пост-панк': 'Post-punk', 'Пост-рок': 'Post-rock',
  'Прогрессивный рок': 'Progressive rock', 'Психоделический рок': 'Psychedelic rock', 'Регги': 'Reggae', 'Рок': 'Rock',
  'Саундтрек': 'Soundtrack', 'Соул': 'Soul', 'Трэш-метал': 'Thrash metal', 'Фанк': 'Funk', 'Фанк-соул': 'Funk soul',
  'Фолк': 'Folk', 'Фолк-рок': 'Folk rock', 'Хард-рок': 'Hard rock', 'метал': 'metal', 'Хип-хоп': 'Hip-hop', 'инструментал': 'instrumental',
  'Хэви-метал': 'Heavy metal', 'Шугейз': 'Shoegaze', 'Электроника': 'Electronic', 'арт-рок': 'art rock', 'трип-хоп': 'trip-hop',
  'Эмбиент': 'Ambient',
};
const badges = {
  'Хит': 'Hit', 'Классика': 'Classic', 'Новинка': 'New', 'Редкий': 'Rare', 'Коллекционное': 'Collectible', 'Легенда': 'Legend',
  'Эксклюзив': 'Exclusive', 'Бестселлер': 'Bestseller', 'Саундтрек': 'Soundtrack', 'Культовый': 'Cult', 'Винтаж': 'Vintage',
  'Дебют': 'Debut', 'Раритет': 'Rarity',
};
const countries = {
  'Австралия': 'Australia', 'Великобритания': 'UK', 'Германия': 'Germany', 'Европа': 'Europe', 'Ирландия': 'Ireland',
  'Исландия': 'Iceland', 'Италия': 'Italy', 'Канада': 'Canada', 'Куба': 'Cuba', 'Норвегия': 'Norway', 'СССР': 'USSR',
  'США': 'USA', 'Финляндия': 'Finland', 'Франция': 'France', 'Ямайка': 'Jamaica', 'Россия': 'Russia', 'Япония': 'Japan',
};
const names = { 'Кино': 'Kino', 'Группа крови': 'Blood Type' };

const prefixed = (prefix, map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [prefix + k, v]));

export default {
  ru: {
    'cr.cover': 'Обложка: {title}, {artist}',
    'cr.record': 'Пластинка: {title}',
    'cr.prev': 'Предыдущая пластинка',
    'cr.next': 'Следующая пластинка',
    'cr.close': 'Закрыть',
    'cr.disc': 'Диск',
    'cr.year': 'Год', 'cr.label': 'Лейбл', 'cr.genre': 'Жанр', 'cr.country': 'Страна', 'cr.format': 'Формат',
    'cr.sideA': 'Сторона A', 'cr.sideB': 'Сторона B',
    'cr.playing': 'Играет', 'cr.pulling': 'Достаём',
    'cr.buy': 'В корзину', 'cr.added': 'Добавлено',
    'cr.fav': '♡ В избранное', 'cr.faved': '♥ В избранном',
    'cr.shelf': 'Полка с пластинками. Листай колесом, перетаскиванием или стрелками',
    'cr.prevShort': 'Предыдущая', 'cr.nextShort': 'Следующая',
    'pc.fav': 'Добавить в избранное', 'pc.unfav': 'Убрать из избранного',
    'pc.coverAlt': 'Обложка альбома {title} - {artist}',
    'pc.adding': 'Добавляется...', 'pc.add': 'Добавить в корзину',
    'pc.addAria': 'Добавить {title} в корзину за {price} рублей',
  },
  en: {
    'cr.cover': 'Cover: {title}, {artist}',
    'cr.record': 'Record: {title}',
    'cr.prev': 'Previous record',
    'cr.next': 'Next record',
    'cr.close': 'Close',
    'cr.disc': 'Disc',
    'cr.year': 'Year', 'cr.label': 'Label', 'cr.genre': 'Genre', 'cr.country': 'Country', 'cr.format': 'Format',
    'cr.sideA': 'Side A', 'cr.sideB': 'Side B',
    'cr.playing': 'Now playing', 'cr.pulling': 'Pulling it out',
    'cr.buy': 'Add to cart', 'cr.added': 'Added',
    'cr.fav': '♡ Favourite', 'cr.faved': '♥ Favourited',
    'cr.shelf': 'Shelf of records. Scroll with the wheel, drag or use the arrow keys',
    'cr.prevShort': 'Previous', 'cr.nextShort': 'Next',
    'pc.fav': 'Add to favourites', 'pc.unfav': 'Remove from favourites',
    'pc.coverAlt': 'Album cover: {title} - {artist}',
    'pc.adding': 'Adding...', 'pc.add': 'Add to cart',
    'pc.addAria': 'Add {title} to the cart for {price} roubles',
    ...prefixed('g:', genres),
    ...prefixed('b:', badges),
    ...prefixed('c:', countries),
    ...prefixed('n:', names),
    'f:12" LP Red Vinyl': '12" LP, red vinyl',
  },
};
