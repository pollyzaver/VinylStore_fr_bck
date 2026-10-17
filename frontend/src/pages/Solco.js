import React from 'react';
import { discSvg } from '../utils/tasteDisc';
import { useI18n } from '../i18n/I18nContext';

const STEPS = ['ab.s1', 'ab.s2', 'ab.s3'];

const DISC = discSvg({ energy: 4, tempo: 4, dark: 6, organic: 8, density: 5, vocal: 6, melodic: 7, raw: 4 }, { seed: 'about' });

const Solco = ({ onNavigate }) => {
  const { t } = useI18n();
  return (
  <main className="sl">
    <div className="sl-wrap">
      <section className="sl-intro">
        <div>
          <p className="sl-eyebrow">{t('ab.eyebrow')}</p>
          <h1 className="sl-h">{t('ab.title')}</h1>
          <p className="sl-lead">{t('ab.lead')}</p>
          <div className="sl-actions">
            <button className="sl-btn" onClick={() => onNavigate('test')}>{t('ab.draw')}</button>
            <button className="sl-btn sl-btn-ghost" onClick={() => onNavigate('catalog')}>{t('ab.browse')}</button>
          </div>
        </div>
        <div className="sl-disc" aria-hidden="true" dangerouslySetInnerHTML={{ __html: DISC }} />
      </section>

      <section className="sl-how" aria-labelledby="sl-how-h">
        <h2 id="sl-how-h" className="sl-h2">{t('ab.how')}</h2>
        <ol className="sl-steps">
          {STEPS.map((k, i) => (
            <li key={k}>
              <span className="sl-num">0{i + 1}</span>
              <h3>{t(`${k}.t`)}</h3>
              <p>{t(`${k}.p`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="sl-contacts" aria-labelledby="sl-c-h">
        <h2 id="sl-c-h" className="sl-h2">{t('ab.contacts')}</h2>
        <dl className="sl-list">
          <div><dt>{t('ab.phone')}</dt><dd><a href="tel:+79501893557">+7 (950) 189-35-57</a></dd></div>
          <div><dt>{t('ab.mail')}</dt><dd><a href="mailto:pollzyaver777@gmail.com">pollzyaver777@gmail.com</a></dd></div>
          <div><dt>{t('ab.address')}</dt><dd>{t('ab.addressV')}</dd></div>
          <div><dt>{t('ab.social')}</dt><dd>
            <a href="https://t.me/meinewelllt">Telegram</a>
            <a href="https://vk.com/p.zavershinskaya">VK</a>
            <a href="https://wa.me/79501893557">WhatsApp</a>
          </dd></div>
        </dl>
      </section>
    </div>
  </main>
  );
};

export default Solco;
