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
import { useI18n } from '../i18n/I18nContext';
import '../styles/pages/Catalog.css';


const FAQ_COUNT = 8;
const CATEGORY_KEYS = ['rock', 'metal', 'alternative', 'electronic', 'pop', 'jazz', 'soul', 'hiphop', 'folk', 'blues', 'reggae', 'ambient', 'world', 'other'];

const Home = ({ onNavigate, focusCatalog }) => {
  const { t } = useI18n();
  const [openFaq, setOpenFaq] = useState(-1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slow, setSlow] = useState(false);
  
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

  // Если сервер отвечает долго, говорим почему, чтобы пустой экран не выглядел поломкой
  useEffect(() => {
    if (!loading) { setSlow(false); return undefined; }
    const id = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(id);
  }, [loading]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      const ordered = shuffleByPopularity(data);
      setProducts(ordered);
      setFilteredProducts(ordered); // Изначально показываем все товары
      setError(null);
    } catch (err) {
      setError(true);
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const filters = useMemo(() => {
    const count = {};
    products.forEach(p => { count[p.category] = (count[p.category] || 0) + 1; });
    return [{ key: 'all', label: t('cat.all'), count: products.length }, ...CATEGORY_KEYS.filter(k => count[k]).map(k => ({ key: k, label: t(`cat.${k}`), count: count[k] }))];
  }, [products, t]);
  
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

  const lead = t('faq.lead', { link: '\u0000' }).split('\u0000');

  return (
    <div className="main-content">
      {/* Hero: Solco */}
      <section className="solco-hero solco-pattern" aria-labelledby="hero-title">
        <div className="container solco-hero__inner">
          <div className="solco-hero__text">
            <p className="solco-hero__eyebrow">{t('hero.eyebrow')}</p>
            <h1 id="hero-title" className="hero-title">{t('hero.title')}</h1>
            <p className="hero-subtitle">
              {t('hero.sub')}
            </p>
            <div className="hero-actions">
              <a href="#catalog" className="btn btn-primary">{t('hero.browse')}</a>
              <button className="btn btn-white" onClick={() => onNavigate('test')}>
                {t('hero.match')}
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
                <p className="ct-eyebrow">{t('ct.eyebrow')}{loading ? '' : ` · ${products.length}`}</p>
                <h2 className="ct-title">{t('ct.title')}</h2>
              </div>
              <label className="ct-search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <path d="M15.5 15.5L21 21" strokeLinecap="round" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('ct.searchPh')}
                  aria-label={t('ct.searchLabel')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <button type="button" className="ct-clear" onClick={clearSearch} aria-label={t('ct.clear')}>✕</button>
                )}
              </label>
            </Reveal>

            {loading ? (
              <div className="ct-loading" role="status">
                <div className="vinyl-spinner"></div>
                <p>{slow ? t('net.waking') : t('ct.loading')}</p>
              </div>
            ) : error ? (
              <div className="ct-empty">
                <h3>{t('ct.errTitle')}</h3>
                <p>{t('ct.err')}</p>
                <button onClick={loadProducts}>{t('ct.retry')}</button>
              </div>
            ) : (
              <>
            <div className="ct-filters" role="group" aria-label={t('ct.genres')}>
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
              <p className="ct-found">{t('ct.found', { n: filteredProducts.length })}</p>
            )}

            {filteredProducts.length === 0 ? (
              <div className="ct-empty">
                <h3>{t('ct.emptyTitle')}</h3>
                <p>{t('ct.empty')}</p>
                <button onClick={resetAll}>{t('ct.showAll')}</button>
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
              <p className="ct-eyebrow">{t('faq.eyebrow')}</p>
              <h2 className="ct-title">{t('faq.title')}</h2>
              <p className="fq-lead">{lead[0]}<a href="https://t.me/pollinaver">Telegram</a>{lead[1]}</p>
            </Reveal>
            <Reveal className="fq-list" delay={120}>
              {Array.from({ length: FAQ_COUNT }, (_, i) => ({ q: t(`faq.${i + 1}.q`), a: t(`faq.${i + 1}.a`) })).map((item, i) => (
                <div key={i} className={`fq-item ${openFaq === i ? 'open' : ''}`}>
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
    </div>
  );
};

export default Home;