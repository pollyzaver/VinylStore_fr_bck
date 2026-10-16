import React from 'react';
import { discSvg } from '../utils/tasteDisc';

const STEPS = [
  ['Отвечаешь', 'Одиннадцать коротких вопросов: сцены, дуэли обложек, эпоха, исключения.'],
  ['Рисуем диск', 'Ответы превращаются в восемь осей вкуса: энергия, темп, свет и тень, живой звук, плотность, голос, мелодичность, сырость.'],
  ['Подбираем', 'По этим осям считаем совпадение с каждой пластинкой и объясняем, почему она подходит.'],
];

const DISC = discSvg({ energy: 4, tempo: 4, dark: 6, organic: 8, density: 5, vocal: 6, melodic: 7, raw: 4 }, { seed: 'about' });

const Solco = ({ onNavigate }) => (
  <main className="sl">
    <div className="sl-wrap">
      <section className="sl-intro">
        <div>
          <p className="sl-eyebrow">О SOLCO</p>
          <h1 className="sl-h">Магазин, где пластинку выбирает вкус, а не рейтинг</h1>
          <p className="sl-lead">
            По-итальянски solco значит «борозда», та самая дорожка на пластинке. У каждого человека
            есть свой рисунок вкуса. Мы его рисуем и по нему подбираем, что поставить.
          </p>
          <div className="sl-actions">
            <button className="sl-btn" onClick={() => onNavigate('test')}>Нарисовать мой диск</button>
            <button className="sl-btn sl-btn-ghost" onClick={() => onNavigate('catalog')}>Смотреть пластинки</button>
          </div>
        </div>
        <div className="sl-disc" aria-hidden="true" dangerouslySetInnerHTML={{ __html: DISC }} />
      </section>

      <section className="sl-how" aria-labelledby="sl-how-h">
        <h2 id="sl-how-h" className="sl-h2">Как это работает</h2>
        <ol className="sl-steps">
          {STEPS.map(([t, d], i) => (
            <li key={t}>
              <span className="sl-num">0{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="sl-contacts" aria-labelledby="sl-c-h">
        <h2 id="sl-c-h" className="sl-h2">Контакты</h2>
        <dl className="sl-list">
          <div><dt>Телефон</dt><dd><a href="tel:+79501893557">+7 (950) 189-35-57</a></dd></div>
          <div><dt>Почта</dt><dd><a href="mailto:pollzyaver777@gmail.com">pollzyaver777@gmail.com</a></dd></div>
          <div><dt>Адрес</dt><dd>Москва, ул. 11-я Парковая, 36</dd></div>
          <div><dt>Соцсети</dt><dd>
            <a href="https://t.me/meinewelllt">Telegram</a>
            <a href="https://vk.com/p.zavershinskaya">VK</a>
            <a href="https://wa.me/79501893557">WhatsApp</a>
          </dd></div>
        </dl>
      </section>
    </div>
  </main>
);

export default Solco;
