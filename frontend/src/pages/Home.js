import React, { useState, useEffect, useRef, useMemo } from 'react';
// Удаляем эту строку:
// import { products } from '../data/products';
import CrateShelf from '../components/CrateShelf';
import HeroDisc from '../components/HeroDisc';
import Reveal from '../components/Reveal';
import Haze from '../components/Haze';
import HowItWorks from '../components/HowItWorks';
import { shuffleByPopularity } from '../utils/popularity';
import { api } from '../api'; // Добавляем импорт API
import '../styles/pages/Catalog.css';

const FAQ = [
  { q: 'Как работает тест?', a: 'Это одиннадцать коротких вопросов: про погоду за окном, громкость, ритм, место, где ты слушаешь, и так далее. По ответам рисуется диск вкуса, а под него подбираются девять пластинок из каталога с процентом совпадения. Тест занимает около двух минут и не обязателен: пластинки можно просто заказать из каталога. Результат вместе с открыткой сохраняется в профиле, входить для этого не нужно.' },
  { q: 'Можно ли пройти тест для другого человека?', a: 'Да, в начале выбери «В подарок» и отвечай так, как ответил бы тот, кому дарим. Диск, подборка и открытка получатся его, а не твои.' },
  { q: 'Как добавить открытку к заказу?', a: 'Открытка появляется после теста: диск рисуется по твоим ответам, а ты можешь написать пару слов. Нажми «Добавить к заказу», и мы вложим её в коробку, это 100 ₽ к цене пластинки. В корзине открытку можно убрать. Можно и скачать открытку файлом, чтобы распечатать самой. Для подарка выбери в тесте «В подарок» и отвечай так, как ответил бы получатель: тогда в открытке появятся поля «Кому» и «От кого».' },
  { q: 'Доставка и оплата', a: 'Доставка бесплатная. По Москве привозим курьером в день заказа, если оформить его до 15:00. По России отправляем СДЭК или Почтой России, обычно это 2–7 дней. Оплатить можно картой на сайте или при получении.' },
  { q: 'В каком состоянии пластинки?', a: 'Новые отправляем запечатанными. Б/у пластинки мы прослушиваем перед отправкой и честно описываем состояние по шкале Goldmine: NM, VG+ или VG. Состояние и нюансы можно уточнить у нас до оплаты.' },
  { q: 'Можно ли вернуть пластинку?', a: 'Да, в течение 14 дней, если пластинка не была в использовании и сохранила упаковку. Если пришёл брак или помятая обложка, заменим пластинку или вернём деньги, достаточно написать нам и приложить фото.' },
  { q: 'Что делать, если нужной пластинки нет?', a: 'Напиши нам название и исполнителя, и мы привезём её под заказ за 7–14 дней или сообщим, как только она появится в наличии.' },
  { q: 'Как хранить и ухаживать за винилом?', a: 'Храни пластинки вертикально, подальше от батарей и прямого солнца. Пыль убирай антистатической щёткой, а конверты держи в защитных внутренних пакетах.' },
];

const Home = ({ onNavigate, focusCatalog }) => {
  const [openFaq, setOpenFaq] = useState(-1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeFilter, setActiveFilter] = useState('all');
  // Новое состояние для поиска
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Ref для секции каталога
  const catalogRef = useRef(null);
  const searchInputRef = useRef(null);

  // Загружаем данные с бэкенда при монтировании компонента
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      const ordered = shuffleByPopularity(data);
      setProducts(ordered);
      setFilteredProducts(ordered); // Изначально показываем все товары
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить товары. Проверьте, запущен ли бэкенд.');
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const filters = useMemo(() => {
    const LABELS = { rock: 'Рок', metal: 'Метал', alternative: 'Альтернатива', electronic: 'Электроника', pop: 'Поп', jazz: 'Джаз', soul: 'Соул', hiphop: 'Хип-хоп', folk: 'Фолк', blues: 'Блюз', reggae: 'Регги', ambient: 'Эмбиент', world: 'Мир', other: 'Разное' };
    const count = {};
    products.forEach(p => { count[p.category] = (count[p.category] || 0) + 1; });
    return [{ key: 'all', label: 'Все', count: products.length }, ...Object.keys(LABELS).filter(k => count[k]).map(k => ({ key: k, label: LABELS[k], count: count[k] }))];
  }, [products]);
  
  const resetAll = () => { setSearchQuery(''); setActiveFilter('all'); };

  // Функция поиска по всем полям
  const performSearch = (query, productsToSearch = products) => {
    if (!query.trim()) {
      return productsToSearch;
    }

    const searchTerms = query.toLowerCase().trim().split(' ');
    
    return productsToSearch.filter(product => {
      const searchableText = `
        ${product.title.toLowerCase()}
        ${product.description.toLowerCase()}
        ${product.genre.toLowerCase()}
        ${product.category.toLowerCase()}
        ${product.year.toString()}
        ${product.format.toLowerCase()}
        ${product.detailedInfo?.tags?.join(' ').toLowerCase() || ''}
        ${product.detailedInfo?.label?.toLowerCase() || ''}
        ${product.detailedInfo?.country?.toLowerCase() || ''}
        ${product.detailedInfo?.tracklist?.a?.join(' ').toLowerCase() || ''}
        ${product.detailedInfo?.tracklist?.b?.join(' ').toLowerCase() || ''}
      `;
      
      return searchTerms.every(term => searchableText.includes(term));
    });
  };

  // Фильтрация и поиск товаров
  useEffect(() => {
    if (products.length > 0) {
      let results = products;
      
      // Сначала применяем фильтр по категории
      if (activeFilter !== 'all') {
        results = results.filter(p => p.category === activeFilter);
      }
      
      // Затем применяем поиск по запросу
      results = performSearch(searchQuery, results);
      
      setFilteredProducts(results);
    }
  }, [activeFilter, searchQuery, products]);

  // Обработчик поиска с debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  // Очистка поиска
  const clearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  useEffect(() => {
    if (focusCatalog && !loading && catalogRef.current) catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focusCatalog, loading]);

  return (
    <main id="main-content" className="main-content">
      {/* Hero: Solco */}
      <section className="solco-hero solco-pattern" aria-labelledby="hero-title">
        <div className="container solco-hero__inner">
          <div className="solco-hero__text">
            <p className="solco-hero__eyebrow">Магазин винила · Москва</p>
            <h1 id="hero-title" className="hero-title">Винил, который угадывает твой вкус</h1>
            <p className="hero-subtitle">
              Выбирай пластинки сам или пройди короткий тест: он нарисует диск твоего вкуса, подберёт пластинки и сделает открытку, которую можно добавить к заказу.
            </p>
            <div className="hero-actions">
              <a href="#catalog" className="btn btn-primary">Смотреть пластинки</a>
              <button className="btn btn-white" onClick={() => onNavigate('test')}>
                Подобрать по вкусу
              </button>
            </div>
          </div>
          <HeroDisc />
        </div>
      </section>

      <HowItWorks products={products.filter(p => p.image).slice(0, 5)} onStart={() => onNavigate('test')} />

      {/* Каталог */}
      <section id="catalog" className="catalog-section" ref={catalogRef}>
        <div className="container">
          <div className="ct">
            <Reveal as="header" className="ct-head">
              <div>
                <p className="ct-eyebrow">КАТАЛОГ{loading ? '' : ` · ${products.length}`}</p>
                <h2 className="ct-title">Пластинки</h2>
              </div>
              <label className="ct-search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <path d="M15.5 15.5L21 21" strokeLinecap="round" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Название, исполнитель, жанр"
                  aria-label="Поиск по каталогу"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <button type="button" className="ct-clear" onClick={clearSearch} aria-label="Очистить поиск">✕</button>
                )}
              </label>
            </Reveal>

            {loading ? (
              <div className="ct-loading" role="status">
                <div className="vinyl-spinner"></div>
                <p>Загружаем пластинки…</p>
              </div>
            ) : error ? (
              <div className="ct-empty">
                <h3>Не получилось загрузить пластинки</h3>
                <p>{error}</p>
                <button onClick={loadProducts}>Попробовать снова</button>
              </div>
            ) : (
              <>
            <div className="ct-filters" role="group" aria-label="Жанры">
              {filters.map(filter => (
                <button
                  key={filter.key}
                  className={`ct-filter ${activeFilter === filter.key ? 'on' : ''}`}
                  aria-pressed={activeFilter === filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.label}<i>{filter.count}</i>
                </button>
              ))}
            </div>

            {(searchQuery || activeFilter !== 'all') && filteredProducts.length > 0 && (
              <p className="ct-found">Найдено: {filteredProducts.length}</p>
            )}

            {filteredProducts.length === 0 ? (
              <div className="ct-empty">
                <h3>Ничего не нашлось</h3>
                <p>Попробуй другое слово или выбери другой жанр.</p>
                <button onClick={resetAll}>Показать все</button>
              </div>
            ) : (
              <CrateShelf products={filteredProducts} />
            )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Перед покупкой */}
      <section className="faq-section" id="faq">
        <Haze scope=".faq-section" />
        <div className="container">
          <div className="fq">
            <Reveal className="fq-side">
              <p className="ct-eyebrow">ВОПРОСЫ И ОТВЕТЫ</p>
              <h2 className="ct-title">Перед покупкой</h2>
              <p className="fq-lead">Нет ответа на свой вопрос? Напиши нам в <a href="https://t.me/meinewelllt">Telegram</a>, отвечаем в течение дня.</p>
            </Reveal>
            <Reveal className="fq-list" delay={120}>
              {FAQ.map((item, i) => (
                <div key={item.q} className={`fq-item ${openFaq === i ? 'open' : ''}`}>
                  <button className="fq-q" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                    <span className="fq-n">{String(i + 1).padStart(2, '0')}</span>
                    <span>{item.q}</span>
                    <span className="fq-plus" aria-hidden="true" />
                  </button>
                  <div className="fq-a"><div><p>{item.a}</p></div></div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;