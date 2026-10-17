import React, { useEffect, useMemo, useState } from 'react';
import Reveal from './Reveal';
import { discSvg } from '../utils/tasteDisc';
import { useI18n } from '../i18n/I18nContext';
import '../styles/components/HowItWorks.css';

const QUESTION_KEYS = ['hw.q1', 'hw.q2', 'hw.q3', 'hw.q4'];
const AXES = ['energy', 'tempo', 'dark', 'organic', 'density', 'vocal', 'melodic', 'raw'];
const SAMPLES = [
  [3, 3, 9, 5, 5, 5, 7, 4],
  [9, 8, 3, 2, 7, 5, 6, 3],
  [3, 4, 3, 9, 3, 7, 7, 4],
  [8, 6, 8, 4, 8, 4, 3, 9],
  [5, 5, 5, 6, 4, 9, 9, 2],
];
const toValues = (arr) => Object.fromEntries(AXES.map((k, i) => [k, arr[i]]));

const cover = (p) => (p && p.image ? process.env.PUBLIC_URL + p.image : null);

// «Как это работает»: три шага, у каждого своя маленькая анимация. Запускается, когда блок попал в экран.
const HowItWorks = ({ products = [], onStart }) => {
  const { t } = useI18n();
  const covers = products.slice(0, 5);
  const discs = useMemo(() => SAMPLES.map((v, i) => discSvg(toValues(v), { size: 280, seed: `how-${i}`, label: '' })), []);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setTick(n => n + 1), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="hw" aria-labelledby="hw-title">
      <div className="container">
        <Reveal className="hw-head">
          <div>
            <p className="ct-eyebrow">{t('hw.eyebrow')}</p>
            <h2 id="hw-title" className="hw-title">{t('hw.title')}</h2>
          </div>
          <button type="button" className="hw-cta" onClick={onStart}>{t('hw.cta')} <span aria-hidden="true">→</span></button>
        </Reveal>

        <Reveal as="ol" className="hw-steps" delay={100}>
          <li className="hw-step">
            <div className="hw-art hw-art--q" aria-hidden="true">
              {QUESTION_KEYS.map((k, i) => <span key={k} style={{ '--i': i }}>{t(k)}</span>)}
            </div>
            <h3>{t('hw.s1.t')}</h3>
            <p>{t('hw.s1.p')}</p>
          </li>
          <li className="hw-step">
            <div className="hw-art hw-art--d" aria-hidden="true">
              {discs.map((svg, i) => (
                <span key={i} className={`hw-d ${tick % discs.length === i ? 'on' : ''}`} dangerouslySetInnerHTML={{ __html: svg }} />
              ))}
            </div>
            <h3>{t('hw.s2.t')}</h3>
            <p>{t('hw.s2.p')}</p>
          </li>
          <li className="hw-step">
            <div className="hw-art hw-art--c" aria-hidden="true">
              {covers.map((p, i) => (
                <span key={p.id} style={{ '--k': (i - tick % covers.length + covers.length) % covers.length }}>{cover(p) ? <img src={cover(p)} alt="" loading="lazy" /> : null}</span>
              ))}
            </div>
            <h3>{t('hw.s3.t')}</h3>
            <p>{t('hw.s3.p')}</p>
          </li>
        </Reveal>
      </div>
    </section>
  );
};

export default HowItWorks;
