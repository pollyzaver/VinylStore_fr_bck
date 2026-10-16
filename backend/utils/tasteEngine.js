// Solco: движок вкуса. Ответы теста -> вектор вкуса по 8 осям -> совпадение с пластинками.
const model = require('../data/taste_model.json');
const questionsFile = require('../data/taste_questions.json');

const AXES = model.axes.map(a => a.key);
const AXIS = Object.fromEntries(model.axes.map(a => [a.key, a]));
const QUESTIONS = questionsFile.questions;

// настройки, которые подбираются на персонах (см. scripts/taste_validate.js)
const CFG = {
  stretch: 0.45,         // растяжение от середины: чем увереннее ось, тем сильнее
  prior: 0.4,            // вес «середины» для неизмеренной оси
  confK: 1.5,            // насколько быстро растёт уверенность в оси
  sharp: 8,              // резкость падения процента с расстоянием
  anchorPenalty: 0.03,  // опора на любимого артиста чуть строже общего профиля
  sameArtistBonus: 10,
  excludeFactor: 0.4,
  dealbreaker: { minOpinion: 2.5, minConf: 0.6, gap: 4, factor: 0.85 },
  eraFactor: { exact: 1, near: 0.9, far: 0.8 },
  maxPerArtist: 2,
};

const artistOf = p => String(p.description || '').replace(/\s*\(.*?\)\s*/g, '').trim();
const vecOf = p => AXES.map(a => (p.taste ? p.taste[a] : 5));
const toObj = arr => Object.fromEntries(AXES.map((a, i) => [a, arr[i]]));
const findByTitle = (products, title) => products.find(p => p.title === title);

function buildProfile(answers, products) {
  const sumW = Object.fromEntries(AXES.map(a => [a, 0]));
  const sumWT = Object.fromEntries(AXES.map(a => [a, 0]));
  const add = (axis, target, w) => { sumW[axis] += w; sumWT[axis] += w * target; };

  const anchors = [];      // центры любимых артистов
  const likedArtists = [];
  const excluded = new Set();
  let decades = null;

  for (const q of QUESTIONS) {
    const ans = answers[q.id];
    if (ans === undefined || ans === null || ans === 'skip' || (Array.isArray(ans) && !ans.length)) continue;

    if (q.kind === 'scene') {
      const opt = q.options.find(o => o.id === ans);
      if (opt) opt.signals.forEach(([axis, t, w]) => add(axis, t, w));
    } else if (q.kind === 'mix') {
      const ids = Array.isArray(ans) ? ans.slice(0, q.max || 6) : [];
      const opts = q.options.filter(o => ids.includes(o.id));
      if (!opts.length) continue;
      const sum = {}, cnt = {};
      opts.forEach(o => Object.entries(o.vals).forEach(([a, v]) => { sum[a] = (sum[a] || 0) + v; cnt[a] = (cnt[a] || 0) + 1; }));
      ['organic', 'melodic', 'raw', 'energy'].forEach(a => { if (cnt[a]) add(a, sum[a] / cnt[a], q.w[a]); });
      add('density', Math.min(10, 1 + opts.length * 1.2), q.w.density);
      if (cnt.vocal) add('vocal', 9, q.w.vocal); else if (opts.length >= 2) add('vocal', 2.5, q.w.vocal);
    } else if (q.kind === 'slider' || q.kind === 'tap' || q.kind === 'pad') {
      const clamp01 = x => Math.min(1, Math.max(0, x));
      const apply = (list, t) => (list || []).forEach(m => add(m.axis, m.lo + (m.hi - m.lo) * t, m.w));
      if (q.kind === 'slider') {
        const t = clamp01(Number(ans) / 10);
        if (!Number.isNaN(t)) apply(q.map, t);
      } else if (q.kind === 'tap') {
        const bpm = Number(ans);
        if (bpm > 0) apply(q.map, clamp01((bpm - q.bpm[0]) / (q.bpm[1] - q.bpm[0])));
      } else if (ans && typeof ans === 'object') {
        if (Number.isFinite(ans.x)) apply(q.x, clamp01(ans.x));
        if (Number.isFinite(ans.y)) apply(q.y, clamp01(ans.y));
      }
    } else if (q.kind === 'duel') {
      if (ans === 'both' || ans === 'none') continue;
      const win = findByTitle(products, ans === 'a' ? q.a : q.b);
      const lose = findByTitle(products, ans === 'a' ? q.b : q.a);
      if (!win || !lose) continue;
      AXES.forEach(axis => {
        const diff = Math.abs(win.taste[axis] - lose.taste[axis]);
        if (diff >= 3) add(axis, win.taste[axis], Math.min(1.6, diff / 10 * 2));
      });
    } else if (q.kind === 'multi') {
      const ids = Array.isArray(ans) ? ans : [ans];
      const opts = q.options.filter(o => ids.includes(o.id));
      if (q.id === 'era') {
        decades = new Set(opts.flatMap(o => o.decades));
      } else if (q.id === 'exclude') {
        opts.forEach(o => o.categories.forEach(c => excluded.add(c)));
      } else if (q.id === 'likes') {
        opts.slice(0, q.max || 4).forEach(o => {
          o.artists.forEach(name => {
            const recs = products.filter(p => artistOf(p) === name);
            if (!recs.length) return;
            likedArtists.push(name);
            const mean = AXES.map(a => recs.reduce((s, p) => s + p.taste[a], 0) / recs.length);
            anchors.push({ name, vec: mean });
            AXES.forEach((axis, i) => add(axis, mean[i], 0.7));
          });
        });
      }
    }
  }

  const values = {}, conf = {};
  AXES.forEach(a => {
    const raw = (sumWT[a] + 5 * CFG.prior) / (sumW[a] + CFG.prior);
    conf[a] = sumW[a] / (sumW[a] + CFG.confK);
    values[a] = Math.min(10, Math.max(0, 5 + (raw - 5) * (1 + CFG.stretch * conf[a])));
  });
  return { values, conf, anchors, likedArtists, excluded: [...excluded], decades: decades ? [...decades] : null };
}

function distance(userVec, conf, prodVec) {
  let num = 0, den = 0;
  AXES.forEach((a, i) => {
    const w = conf[a];
    const d = (userVec[i] - prodVec[i]) / 10;
    num += w * d * d; den += w;
  });
  return den ? num / den : 0.25;
}

function eraFactor(decades, year) {
  if (!decades || !decades.length) return 1;
  const dec = Math.floor(year / 10) * 10;
  if (decades.includes(dec)) return CFG.eraFactor.exact;
  if (decades.some(d => Math.abs(d - dec) === 10)) return CFG.eraFactor.near;
  return CFG.eraFactor.far;
}

function explain(profile, p) {
  const good = [], bad = [];
  AXES.forEach(a => {
    const u = profile.values[a], c = profile.conf[a], pv = p.taste[a];
    if (c < 0.45) return;
    const strong = Math.abs(u - 5) >= 1.8;
    const diff = Math.abs(u - pv);
    if (strong && diff <= 2) good.push({ a, score: (1 - diff / 10) * c * Math.abs(u - 5) });
    if (diff >= 3.5) bad.push({ a, diff, dir: pv > u ? 'highAdj' : 'lowAdj' });
  });
  good.sort((x, y) => y.score - x.score);
  bad.sort((x, y) => y.diff - x.diff);
  const adj = g => AXIS[g.a][p.taste[g.a] >= 5 ? 'highAdj' : 'lowAdj'];
  let text = '';
  if (good.length) text = 'Совпадает: ' + good.slice(0, 2).map(adj).join(', ') + '.';
  if (bad.length) text += (text ? ' ' : '') + `Отличие: у неё ${AXIS[bad[0].a][bad[0].dir]} подача.`;
  return text || 'Близка по общему ощущению.';
}

function rank(profile, products, { limit = 12 } = {}) {
  const user = AXES.map(a => profile.values[a]);
  const liked = new Set(profile.likedArtists);
  const scored = products.map(p => {
    const pv = vecOf(p);
    let d = distance(user, profile.conf, pv);
    profile.anchors.forEach(an => {
      const dd = distance(an.vec, Object.fromEntries(AXES.map(a => [a, 1])), pv) + CFG.anchorPenalty;
      if (dd < d) d = dd;
    });
    let pct = 100 * Math.exp(-CFG.sharp * d);
    // «неприемлемое»: по оси, в которой у человека ясное мнение, пластинка на другом полюсе
    AXES.forEach((a, i) => {
      const u = profile.values[a];
      if (profile.conf[a] >= CFG.dealbreaker.minConf && Math.abs(u - 5) >= CFG.dealbreaker.minOpinion
          && Math.abs(u - pv[i]) >= CFG.dealbreaker.gap) pct *= CFG.dealbreaker.factor;
    });
    pct *= eraFactor(profile.decades, p.year);
    const isLiked = liked.has(artistOf(p));
    if (!isLiked && profile.excluded.includes(p.category)) pct *= CFG.excludeFactor;
    if (isLiked) pct = Math.min(99, pct + CFG.sameArtistBonus);
    return { product: p, artist: artistOf(p), score: pct };
  }).sort((a, b) => b.score - a.score);

  const out = [], perArtist = {};
  for (const s of scored) {
    if ((perArtist[s.artist] || 0) >= CFG.maxPerArtist) continue;
    perArtist[s.artist] = (perArtist[s.artist] || 0) + 1;
    out.push({
      id: s.product.id, title: s.product.title, artist: s.artist, year: s.product.year,
      category: s.product.category, image: s.product.image, coverMissing: !!s.product.coverMissing,
      price: s.product.price, taste: s.product.taste, match: Math.round(Math.min(99, s.score)),
      why: explain(profile, s.product),
    });
    if (out.length >= limit) break;
  }
  return out;
}

const NOUN = {
  energy: ['тишина', 'мощь'], tempo: ['неспешность', 'драйв'], dark: ['свет', 'тень'],
  organic: ['синтетика', 'живой звук'], density: ['воздух', 'плотность'], vocal: ['инструментал', 'голос'],
  melodic: ['эксперимент', 'мелодия'], raw: ['глянец', 'шероховатость'],
};

function describe(profile) {
  const ranked = AXES.map(a => ({ a, s: Math.abs(profile.values[a] - 5) * profile.conf[a] }))
    .sort((x, y) => y.s - x.s).slice(0, 3).filter(x => x.s > 0.8);
  const hi = a => profile.values[a] >= 5 ? 1 : 0;
  const title = ranked.length ? ranked.map(x => NOUN[x.a][hi(x.a)]).join(' · ') : 'Всеядный слушатель';
  const adjs = ranked.map(x => AXIS[x.a][hi(x.a) ? 'highAdj' : 'lowAdj']);
  const text = adjs.length ? `Твоя музыка: ${adjs.join(', ')}.` : 'Тебе подходит самая разная музыка.';
  return { title, text, values: profile.values };
}

function run(answers, products, opts) {
  const profile = buildProfile(answers, products);
  return { profile: describe(profile), recommendations: rank(profile, products, opts) };
}

module.exports = { run, buildProfile, rank, describe, CFG, QUESTIONS, AXES, artistOf };
