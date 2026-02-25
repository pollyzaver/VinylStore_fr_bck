import React, { useState, useEffect, useRef } from 'react';

const timelineData = [
  {
    year: '2023',
    title: 'Рождение VinylStore',
    description: `
      Идея создать VinylStore появилась не случайно — мы хотели вернуть культуре винила её подлинное очарование. То самое ощущение, когда музыка становится не просто фоном, а ритуалом: достать пластинку, аккуратно поставить иглу, услышать лёгкий шорох — и полностью погрузиться в звук.

      В 2023 году мы открыли наш первый магазин в Москве. В небольшом помещении на тихой улице мы собрали коллекцию, которая отражала нашу любовь к музыке: классику, редкие лимитки, культовые издания, которые невозможно найти в масс-маркете.
    `,
    image: process.env.PUBLIC_URL + '/assets/timeline1.jpg',
  },
  {
    year: '2024',
    title: 'Расширение каталога и первые мероприятия',
    description: `
      Уже через год мы заметили, что сообщество ценителей винила вокруг нас стремительно растёт. Мы расширили каталог до более чем 500 пластинок, добавили коллекционные релизы, а также начали работать с зарубежными поставщиками напрямую, чтобы привозить действительно редкие вещи.

      В этом же году мы организовали первые офлайн-встречи слушателей — уютные вечера с прослушиванием пластинок, обсуждениями, обменами, мини-лекциями и тестированием нового оборудования. VinylStore стал не просто магазином — а местом, куда приходят за атмосферой.
    `,
    image: process.env.PUBLIC_URL + '/assets/timeline2.jpg',
  },
  {
    year: '2025',
    title: 'Сообщество и клуб коллекционеров',
    description: `
      В 2025 году мы запустили клуб коллекционеров VinylStore. Это место, где можно делиться находками, менять пластинки, получать доступ к закрытым продажам и ранним релизам, узнавать о мероприятиях и специальных поставках.

      Мы также начали проводить мастер-классы по уходу за винилом, лекции о звучании аналоговой техники, встречи с артистами и тематические вечера по жанрам. Теперь VinylStore — полноценная культурная точка для всех, кто любит музыку так же, как любим её мы.
    `,
    image: process.env.PUBLIC_URL + '/assets/timeline3.jpg',
  },
];

const About = ({ onNavigate }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef([]);
  const circleRef = useRef();

  useEffect(() => {

    // Наблюдаем за скроллом внутри секции
    const handleScroll = () => {
      const centerY = window.innerHeight / 2;

      let newIndex = activeIndex;

      itemRefs.current.forEach((ref, index) => {
        const rect = ref.getBoundingClientRect();

        // Идеальная логика: определяем, ближе ли элемент к центру
        const distance = Math.abs(rect.top + rect.height / 2 - centerY);

        // минимальная дистанция означает актуальный элемент
        if (index === 0 || distance < Math.abs(itemRefs.current[newIndex].getBoundingClientRect().top + rect.height / 2 - centerY)) {
          newIndex = index;
        }
      });

      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeIndex]);

  // Логика появления sticky круга
  useEffect(() => {
    const circle = circleRef.current;
    const section = document.querySelector('.history-scroll-section');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < 1) {
          circle.classList.add('sticky');
        } else {
          circle.classList.remove('sticky');
        }
      },
      {
        root: null,
        threshold: 1,
        rootMargin: '-300px 0px 0px 0px',
      }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="main">
      <div className="container">
        {/* Hero Section */}
        {/* ====== ABOUT PAGE HERO (в стилистике Home) ====== */}
        {/* ====== ABOUT HERO (изолированный, как на главной) ====== */}
        <section className="about-hero">
          {/* Винил */}
          <div className="about-hero-record">
            <div className="about-record-inner">
              <div className="about-record-label">
                <div className="about-record-text">Vinyl   ,   Store</div>
                <div className="about-record-hole"></div>
              </div>
            </div>
            <div className="about-record-glow"></div>
          </div>

          {/* Сides text */}
          <div className="about-hero-side-left">
            <span className="about-hero-side-word">Vinyl</span>
          </div>
          <div className="about-hero-side-right">
            <span className="about-hero-side-word">Store</span>
          </div>

          <div className="container">
            <div className="about-hero-content">
              <h1 className="about-hero-title">О нашем магазине</h1>

              <p className="about-hero-subtitle">
                С 2023 года мы развиваем культуру винила, создавая место, где музыка
                становится ритуалом, а каждая пластинка — открытием.
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="about-hero-notes">
            <div className="note">♪</div>
            <div className="note">♫</div>
            <div className="note">♪</div>
            <div className="note">♫</div>
          </div>
        </section>



        {/* Features */}
        <div className="features-grid" style={{ gap: 'var(--space-lg)', marginTop: 'var(--space-2xl)' }}>
          <div className="feature-card" style={{ padding: 'var(--space-lg)' }}>
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <h3>Аутентичность</h3>
            <p style={{ color: 'var(--vinyl-muted)', lineHeight: '1.6' }}>Сохраняем оригинальное звучание и атмосферу классических записей</p>
          </div>

          <div className="feature-card" style={{ padding: 'var(--space-lg)' }}>
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path d="M12 6a6 6 0 0 0 0 12 6 6 0 0 0 0-12z"/>
              </svg>
            </div>
            <h3>Сообщество</h3>
            <p style={{ color: 'var(--vinyl-muted)', lineHeight: '1.6' }}>Объединяем ценителей качественной музыки и виниловой культуры</p>
          </div>

          <div className="feature-card" style={{ padding: 'var(--space-lg)' }}>
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </div>
            <h3>Качество</h3>
            <p style={{ color: 'var(--vinyl-muted)', lineHeight: '1.6' }}>Только оригинальные пластинки и профессиональное обслуживание</p>
          </div>
        </div>

        {/* ===== НОВАЯ СЕКЦИЯ С ПРОКРУТКОЙ ИСТОРИИ ===== */}
        <section className="history-scroll-section">
          <h2 className="section-title">Наша история</h2>

          <div className="timeline-container">

            {/* Вертикальная линия */}
            <div className="timeline-center-line" />

            {/* КРУГ (стартует на 100px ниже начала) */}
            <div
              ref={circleRef}
              className="timeline-year-fixed"
            >
              {timelineData[activeIndex].year}
            </div>

            {/* Контент */}
            <div className="timeline-scroll-content">
              {timelineData.map((item, index) => (
                <div
                  key={index}
                  className="timeline-row"
                  ref={(ref) => (itemRefs.current[index] = ref)}
                >
                  <div className="timeline-text">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div className="timeline-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="team-section" style={{paddingBlock: 'var(--space-2xl)'}}>
          <div className="section-content">
            <h2 className="section-title">Наша команда</h2>
            <div className="team-grid" style={{gap: 'var(--space-xl)', marginTop: 'var(--space-xl)'}}>
              <div className="team-card" style={{padding: 'var(--space-lg)', background: 'var(--vinyl-card)', boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--radius-lg)', textAlign: 'center'}}>
                <div className="team-photo">
                  <img 
                    src={process.env.PUBLIC_URL + "/assets/rich.jpg"} 
                    alt="Рихард Круспе - основатель магазина VinylStore" 
                    style={{width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)'}}
                  />
                </div>
                <h4>Рихард Круспе</h4>
                <p className="team-role" style={{color: 'var(--vinyl-muted)', fontWeight: '600', marginBottom: 'var(--space-sm)'}}>Основатель</p>
                <p style={{color: 'var(--vinyl-muted)', lineHeight: '1.6'}}>15 лет в музыкальной индустрии, эксперт по виниловым изданиям</p>
              </div>
              <div className="team-card" style={{padding: 'var(--space-lg)', background: 'var(--vinyl-card)', boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--radius-lg)', textAlign: 'center'}}>
                <div className="team-photo">
                  <img 
                    src={process.env.PUBLIC_URL + "/assets/gore.jpg"} 
                    alt="Мартин Гор - музыкальный эксперт магазина VinylStore" 
                    style={{width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)'}}
                  />
                </div>
                <h4>Мартин Гор</h4>
                <p className="team-role" style={{color: 'var(--vinyl-muted)', fontWeight: '600', marginBottom: 'var(--space-sm)'}}>Музыкальный эксперт</p>
                <p style={{color: 'var(--vinyl-muted)', lineHeight: '1.6'}}>Знаток классики рока и джаза, помогает с подбором коллекции</p>
              </div>
              <div className="team-card" style={{padding: 'var(--space-lg)', background: 'var(--vinyl-card)', boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--radius-lg)', textAlign: 'center'}}>
                <div className="team-photo">
                  <img 
                    src={process.env.PUBLIC_URL + "/assets/molko.jpg"} 
                    alt="Брайн Молко - технический специалист магазина VinylStore" 
                    style={{width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)'}}
                  />
                </div>
                <h4>Брайн Молко</h4>
                <p className="team-role" style={{color: 'var(--vinyl-muted)', fontWeight: '600', marginBottom: 'var(--space-sm)'}}>Технический специалист</p>
                <p style={{color: 'var(--vinyl-muted)', lineHeight: '1.6'}}>Заботится о качестве звука и состоянии пластинок</p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section" style={{ paddingBlock: 'var(--space-2xl)' }}>
          <div className="container">
            <div className="cta-content" style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-lg)', fontWeight: '700' }}>Готовы начать коллекцию?</h2>
              <p style={{ color: 'var(--vinyl-text)', opacity: '0.9', marginBottom: 'var(--space-lg)', fontSize: 'var(--text-lg)' }}>
                Свяжитесь с нами сегодня и получите бесплатную консультацию по подбору винила.
              </p>
              <button 
                className="btn btn-white"
                onClick={() => onNavigate('contacts', '#contact-form')}
              >
                Связаться с нами
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default About;
