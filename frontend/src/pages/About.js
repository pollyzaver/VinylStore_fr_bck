import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectCoverflow } from 'swiper/modules'; // Убираем Navigation отсюда

// Импорт стилей Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

// Импортируем Navigation отдельно
import 'swiper/css/navigation';

const timelineData = [
  {
    year: '2024',
    title: 'Рождение VinylStore',
    description: `
      Идея создать VinylStore появилась не случайно — мы хотели вернуть культуре винила её подлинное очарование. То самое ощущение, когда музыка становится не просто фоном, а ритуалом: достать пластинку, аккуратно поставить иглу, услышать лёгкий шорох — и полностью погрузиться в звук.

      В 2024 году мы открыли наш первый магазин в Москве. В небольшом помещении на тихой улице мы собрали коллекцию, которая отражала нашу любовь к музыке: классику, редкие лимитки, культовые издания, которые невозможно найти в масс-маркете.
    `,
    image: process.env.PUBLIC_URL + '/assets/timeline1.jpg',
  },
  {
    year: '2025',
    title: 'Расширение каталога и первые мероприятия',
    description: `
      Уже через год мы заметили, что сообщество ценителей винила вокруг нас стремительно растёт. Мы расширили каталог до более чем 500 пластинок, добавили коллекционные релизы, а также начали работать с зарубежными поставщиками напрямую, чтобы привозить действительно редкие вещи.

      В этом же году мы организовали первые офлайн-встречи слушателей — уютные вечера с прослушиванием пластинок, обсуждениями, обменами, мини-лекциями и тестированием нового оборудования. VinylStore стал не просто магазином — а местом, куда приходят за атмосферой.
    `,
    image: process.env.PUBLIC_URL + '/assets/timeline2.jpg',
  },
  {
    year: '2026',
    title: 'Сообщество и клуб коллекционеров',
    description: `
      В 2026 году мы запустили клуб коллекционеров VinylStore. Это место, где можно делиться находками, менять пластинки, получать доступ к закрытым продажам и ранним релизам, узнавать о мероприятиях и специальных поставках.

      Мы также начали проводить мастер-классы по уходу за винилом, лекции о звучании аналоговой техники, встречи с артистами и тематические вечера по жанрам. Теперь VinylStore — полноценная культурная точка для всех, кто любит музыку так же, как любим её мы.
    `,
    image: process.env.PUBLIC_URL + '/assets/timeline3.jpg',
  },
];

const About = ({ onNavigate }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef([]);
  const circleRef = useRef();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Оставляем оригинальную логику для десктопа
  useEffect(() => {
    if (isMobile) return;

    const handleScroll = () => {
      const centerY = window.innerHeight / 2;
      let newIndex = activeIndex;

      itemRefs.current.forEach((ref, index) => {
        const rect = ref.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - centerY);
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
  }, [activeIndex, isMobile]);

  // Логика появления sticky круга (только для десктопа)
  useEffect(() => {
    if (isMobile) return;

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

    if (section) observer.observe(section);
    return () => observer.disconnect();
  }, [isMobile]);

  return (
    <main className="main">
      <div className="container">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero-record">
            <div className="about-record-inner">
              <div className="about-record-label">
                <div className="about-record-text">Vinyl Store</div>
                <div className="about-record-hole"></div>
              </div>
            </div>
            <div className="about-record-glow"></div>
          </div>

          <div className="about-hero-side-left">
            <span>Vinyl</span>
          </div>
          <div className="about-hero-side-right">
            <span>Store</span>
          </div>

          <div className="container">
            <div className="about-hero-content">
              <h1 className="about-hero-title">О нашем магазине</h1>
              <p className="about-hero-subtitle">
                С 2024 года мы развиваем культуру винила, создавая место, где музыка
                становится ритуалом, а каждая пластинка — открытием.
              </p>
            </div>
          </div>

          <div className="about-hero-notes">
            <div className="note">♪</div>
            <div className="note">♫</div>
            <div className="note">♪</div>
            <div className="note">♫</div>
          </div>
        </section>

        {/* Features */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <h3>Аутентичность</h3>
            <p>Сохраняем оригинальное звучание и атмосферу классических записей</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path d="M12 6a6 6 0 0 0 0 12 6 6 0 0 0 0-12z"/>
              </svg>
            </div>
            <h3>Сообщество</h3>
            <p>Объединяем ценителей качественной музыки и виниловой культуры</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </div>
            <h3>Качество</h3>
            <p>Только оригинальные пластинки и профессиональное обслуживание</p>
          </div>
        </div>

        {/* ===== СЕКЦИЯ ИСТОРИИ ===== */}
        <section className="history-scroll-section">
          <h2 className="section-title">Наша история</h2>

          {/* ДЕСКТОПНАЯ ВЕРСИЯ */}
          {!isMobile && (
            <div className="timeline-container">
              <div className="timeline-center-line" />
              <div ref={circleRef} className="timeline-year-fixed">
                {timelineData[activeIndex].year}
              </div>
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
          )}

          {/* МОБИЛЬНАЯ ВЕРСИЯ — КАРУСЕЛЬ */}
          {isMobile && (
            <div className="timeline-carousel">
              <Swiper
                modules={[Autoplay, Pagination, EffectCoverflow]}
                effect="coverflow"
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={1}
                spaceBetween={20}
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 100,
                  modifier: 1.5,
                  slideShadows: false,
                }}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: false,
                }}
                loop={true}
                className="about-swiper"
              >
                {timelineData.map((item, index) => (
                  <SwiperSlide key={index}>
                    <div className="timeline-card">
                      <div className="timeline-card-year">
                        <span className="year-glow">{item.year}</span>
                      </div>
                      <div className="timeline-card-image">
                        <img src={item.image} alt={item.title} />
                      </div>
                      <div className="timeline-card-content">
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Кастомные стрелки (работают без модуля Navigation) */}
              <div className="swiper-button-prev-custom" onClick={() => {
                const swiper = document.querySelector('.about-swiper')?.swiper;
                if (swiper) swiper.slidePrev();
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="swiper-button-next-custom" onClick={() => {
                const swiper = document.querySelector('.about-swiper')?.swiper;
                if (swiper) swiper.slideNext();
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          )}
        </section>

        {/* Team Section */}
        <section className="team-section">
          <div className="section-content">
            <h2 className="section-title">Наша команда</h2>
            <div className="team-grid">
              <div className="team-card">
                <div className="team-photo">
                  <img 
                    src={process.env.PUBLIC_URL + "/assets/rich.jpg"} 
                    alt="Рихард Круспе"
                  />
                </div>
                <h4>Рихард Круспе</h4>
                <p className="team-role">Основатель</p>
                <p>15 лет в музыкальной индустрии, эксперт по виниловым изданиям</p>
              </div>
              <div className="team-card">
                <div className="team-photo">
                  <img 
                    src={process.env.PUBLIC_URL + "/assets/gore.jpg"} 
                    alt="Мартин Гор"
                  />
                </div>
                <h4>Мартин Гор</h4>
                <p className="team-role">Музыкальный эксперт</p>
                <p>Знаток классики рока и джаза, помогает с подбором коллекции</p>
              </div>
              <div className="team-card">
                <div className="team-photo">
                  <img 
                    src={process.env.PUBLIC_URL + "/assets/molko.jpg"} 
                    alt="Брайн Молко"
                  />
                </div>
                <h4>Брайн Молко</h4>
                <p className="team-role">Технический специалист</p>
                <p>Заботится о качестве звука и состоянии пластинок</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Готовы начать коллекцию?</h2>
              <p>
                Свяжитесь с нами сегодня и получите бесплатную консультацию по подбору винила.
              </p>
              <button 
                className="btn btn-white"
                onClick={() => onNavigate('contacts')}
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