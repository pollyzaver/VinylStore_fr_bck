// Solco: генератор диска вкуса, версия 3 («чистый винил»).
// Те же входные данные, что у v2: values (8 осей 0..10), seed, size, label, contrast.
// Отличие: никаких дрожащих линий и ореолов. Только ровные тонкие канавки, чёткие дорожки и блик.
//   energy  : число и толщина цветных дорожек, высота зубцов по краю
//   tempo   : длина ярких дуг, частота зубцов, сдвиг оттенка
//   dark    : оттенок и яркость
//   organic : тёплое семейство цветов (живое) или холодное (синтетика); у живого лёгкий эксцентриситет
//   density : число канавок и дорожек
//   vocal   : размер этикетки
//   melodic : ровные ритмичные дорожки или рваные разной длины
//   raw     : количество царапин на поверхности
const TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const f = n => (Math.round(n * 100) / 100).toString();
function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hsl(h, s, l) { h = ((h % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l); const c = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return '#' + [c(0), c(8), c(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join(''); }
const PAL = {
  burgundy: { in: '#2e0b10', out: '#0b0305', groove: '#ead9c0', A: '#b3262d', B: '#e9d3b0', label: '#8c141d', ink: '#f1e2c8' },
  mono:     { in: '#161616', out: '#040404', groove: '#f4f4f4', A: '#f4f4f4', B: '#8c8c8c', label: '#f4f4f4', ink: '#0c0c0c' },
  amber:    { in: '#271608', out: '#0a0603', groove: '#f3e9d2', A: '#cf8b3e', B: '#f1d9a6', label: '#b8691f', ink: '#120503' },
  indigo:   { in: '#10122c', out: '#04050f', groove: '#dfe3fb', A: '#5f67e0', B: '#b8c0f5', label: '#8d95e6', ink: '#0a0b1f' },
  steel:    { in: '#0d1c22', out: '#040a0d', groove: '#e3f1f5', A: '#5fb3c9', B: '#d5e9ef', label: '#a9ccd8', ink: '#0a1a1d' },
  rose:     { in: '#2a0c19', out: '#0b0308', groove: '#f6dfe0', A: '#e0527a', B: '#f6b79a', label: '#d9456f', ink: '#2a0c19' },
  forest:   { in: '#0b2118', out: '#030a07', groove: '#e4efdf', A: '#3aa575', B: '#cfe8b8', label: '#2f8f62', ink: '#04140d' },
  ember:    { in: '#2a0e06', out: '#0a0302', groove: '#f3dfc9', A: '#ee4a28', B: '#f5c49a', label: '#c93a1c', ink: '#1a0603' },
};
const PALETTES = Object.keys(PAL);
const C = { cellar: '#120503', paper: '#f3e9d2' };
const pt = (r, a) => `${f(100 + r * Math.cos(a))} ${f(100 + r * Math.sin(a))}`;

function discSvg(values, opts = {}) {
  const contrast = opts.contrast != null ? opts.contrast : 2.0;
  const v = k => clamp(5 + ((values && values[k] != null ? values[k] : 5) - 5) * contrast, 0, 10) / 10;
  const energy = v('energy'), tempo = v('tempo'), dark = v('dark'), organic = v('organic'),
        density = v('density'), vocal = v('vocal'), melodic = v('melodic'), raw = v('raw');
  const key = ['energy', 'tempo', 'dark', 'organic', 'density', 'vocal', 'melodic', 'raw'].map(k => Math.round(v(k) * 10)).join('.') + '|' + (opts.seed || '');
  const kh = hashStr(key), rnd = rng(kh), gid = 'g' + kh.toString(36);

  // палитра: задана вручную (opts.palette) или выводится из вектора
  const mean = ['energy','tempo','dark','organic','density','vocal','melodic','raw'].reduce((m, k) => m + Math.abs(v(k) - 0.5), 0) / 8;
  let pal = opts.palette;
  if (!PAL[pal]) {
    if (mean < 0.12) pal = 'mono';
    else if (raw > 0.65 && energy > 0.65) pal = 'ember';
    else if (organic < 0.38) pal = dark > 0.55 ? 'indigo' : 'steel';
    else if (organic >= 0.62) pal = dark > 0.6 ? 'burgundy' : (dark < 0.35 && melodic > 0.6 && vocal > 0.55 ? 'rose' : (dark < 0.5 ? 'amber' : 'burgundy'));
    else pal = energy < 0.4 ? 'forest' : (dark > 0.5 ? 'indigo' : 'mono');
  }
  const Pl = PAL[pal];
  const A = Pl.A, B = Pl.B, labelC = Pl.label, labelInk = Pl.ink, groove = Pl.groove;
  const bodyIn = Pl.in, bodyOut = Pl.out;
  const warm = organic >= 0.5;

  const p = [];
  p.push(`<defs>` +
    `<radialGradient id="${gid}b" cx="50%" cy="50%" r="50%"><stop offset=".3" stop-color="${bodyIn}"/><stop offset="1" stop-color="${bodyOut}"/></radialGradient>` +
    `` +
    `</defs>`);
  p.push(`<g shape-rendering="geometricPrecision">`);
  p.push(`<circle cx="100" cy="100" r="97" fill="url(#${gid}b)"/>`);

  // дорожки: границы случайной ширины, у мелодичного выровнены
  const rIn = 36, rOut = 88;
  const T = 3 + Math.round(density * 5);
  const w = Array.from({ length: T }, () => lerp(1, 0.35 + rnd() * 1.3, 1 - melodic));
  const wSum = w.reduce((a, b) => a + b, 0);
  const bounds = [rIn]; w.reduce((acc, x) => { const nx = acc + x / wSum * (rOut - rIn); bounds.push(nx); return nx; }, rIn);

  // какие дорожки подсвечены цветом
  const lit = Math.min(T, 1 + Math.round(energy * 4));
  const order = [...Array(T).keys()].sort(() => rnd() - 0.5).slice(0, lit);
  const litSet = new Set(order);

  // канавки: тонкие правильные окружности, между дорожками щель
  const G = Math.round(lerp(28, 58, density));
  const gap = 1.4;
  const ecc = warm ? organic * 0.5 : 0;     // у «живого» лёгкий сдвиг центра, как у настоящей пластинки
  const ex = f(ecc * Math.cos(kh % 7)), ey = f(ecc * Math.sin(kh % 7));
  for (let t = 0; t < T; t++) {
    const a = bounds[t] + gap / 2, b = bounds[t + 1] - gap / 2;
    const n = Math.max(3, Math.round((b - a) / (rOut - rIn) * G));
    const lit1 = litSet.has(t);
    const col = lit1 ? (t % 2 ? B : A) : groove;
    if (lit1) p.push(`<circle cx="${f(100 + +ex)}" cy="${f(100 + +ey)}" r="${f((a + b) / 2)}" fill="none" stroke="${t % 2 ? B : A}" stroke-opacity="${f(pal === 'mono' ? 0.10 : 0.2)}" stroke-width="${f(b - a)}"/>`);
    for (let i = 0; i < n; i++) {
      const r = a + (i + 0.5) * (b - a) / n;
      const op = lit1 ? 0.55 + 0.25 * Math.sin(i * 0.5) : 0.11 + 0.05 * ((i % 3) / 2);
      p.push(`<circle cx="${f(100 + +ex)}" cy="${f(100 + +ey)}" r="${f(r)}" fill="none" stroke="${col}" stroke-opacity="${f(op)}" stroke-width="${lit1 ? 0.45 : 0.32}"/>`);
    }
  }

  // яркие дуги на границах дорожек
  const A_N = 1 + Math.round(energy * 5);
  const sweepBase = lerp(2.6, 0.7, tempo);
  const phase = rnd() * TAU;
  for (let k = 0; k < A_N; k++) {
    const r = lerp(rIn + 3, rOut - 3, ((k * 0.618 + rnd() * 0.15) % 1));
    const sweep = clamp(sweepBase * (0.75 + rnd() * 0.5), 0.35, 3);
    const a0 = phase + (melodic > 0.5 ? k * 2.39996 : rnd() * TAU), a1 = a0 + sweep;
    p.push(`<path d="M${pt(r, a0)} A${f(r)} ${f(r)} 0 ${sweep > Math.PI ? 1 : 0} 1 ${pt(r, a1)}" fill="none" stroke="${k % 2 ? B : A}" stroke-width="${f(1.1 + energy * 1.7)}" stroke-linecap="round"/>`);
  }

  // царапины: чем «сырее», тем больше
  const scr = Math.round(raw * raw * 16);
  for (let k = 0; k < scr; k++) {
    const r = lerp(rIn + 2, rOut + 4, rnd()), a0 = rnd() * TAU, sp = lerp(0.12, 0.6, rnd());
    p.push(`<path d="M${pt(r, a0)} A${f(r)} ${f(r)} 0 0 1 ${pt(r, a0 + sp)}" fill="none" stroke="${C.paper}" stroke-opacity="${f(0.25 + rnd() * 0.3)}" stroke-width="0.3" stroke-linecap="round"/>`);
  }

  // блик: два зеркальных сектора из тонких долей с колоколом прозрачности, края мягкие
  const sh = rnd() * TAU, SL = 14, span = 0.62;
  [0, Math.PI].forEach(off => {
    for (let i = 0; i < SL; i++) {
      const a0 = sh + off + i / SL * span, a1 = sh + off + (i + 1) / SL * span, ro = 95, ri = 36;
      const bell = Math.sin((i + 0.5) / SL * Math.PI);
      p.push(`<path d="M${pt(ri, a0)} L${pt(ro, a0)} A${ro} ${ro} 0 0 1 ${pt(ro, a1)} L${pt(ri, a1)} A${ri} ${ri} 0 0 0 ${pt(ri, a0)}Z" fill="${C.paper}" fill-opacity="${f(0.015 + bell * bell * 0.09 * (0.6 + 0.6 * (1 - dark)))}"/>`);
    }
  });

  // зубцы по краю
  const K = Math.round(lerp(40, 120, tempo)), hMax = lerp(2, 6.5, energy);
  const ph1 = rnd() * TAU, ph2 = rnd() * TAU, bars = [];
  for (let i = 0; i < K; i++) {
    const th = i / K * TAU + phase;
    const env = 0.55 + 0.3 * Math.sin(3 * th + ph1) + 0.15 * Math.sin(7 * th + ph2);
    const h = hMax * clamp(lerp(env, rnd(), (1 - melodic) * 0.8), 0.15, 1);
    bars.push(`M${pt(93.2, th)}L${pt(93.2 - h, th)}`);
  }
  p.push(`<path d="${bars.join('')}" fill="none" stroke="${B}" stroke-opacity=".8" stroke-width="${f(lerp(.9, .55, tempo))}" stroke-linecap="round"/>`);

  // кромка
  p.push(`<circle cx="100" cy="100" r="96.2" fill="none" stroke="${C.paper}" stroke-width="1.6"/>`);
  p.push(`<circle cx="100" cy="100" r="94.2" fill="none" stroke="${C.paper}" stroke-opacity=".18" stroke-width=".4"/>`);

  // этикетка
  const rl = 14 + vocal * 20;
  p.push(`<circle cx="100" cy="100" r="${f(rl + 1.2)}" fill="${C.cellar}" fill-opacity=".55"/>`);
  p.push(`<circle cx="100" cy="100" r="${f(rl)}" fill="${labelC}"/>`);
  p.push(`<circle cx="100" cy="100" r="${f(rl * 0.78)}" fill="none" stroke="${labelInk}" stroke-opacity=".35" stroke-width=".6"/>`);
  const ticks = [];
  for (let i = 0; i < 48; i++) { const th = i / 48 * TAU; ticks.push(`M${pt(rl - 1.2, th)}L${pt(rl - 3, th)}`); }
  p.push(`<path d="${ticks.join('')}" stroke="${labelInk}" stroke-opacity=".4" stroke-width=".5"/>`);
  p.push(`<circle cx="100" cy="100" r="2.6" fill="${C.cellar}"/>`);
  p.push(`</g>`);

  const size = opts.size ? ` width="${opts.size}" height="${opts.size}"` : '';
  const aria = opts.label ? ` role="img" aria-label="${opts.label}"` : ' aria-hidden="true"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"${size}${aria}>${p.join('')}</svg>`;
}
module.exports = { discSvg, PALETTES };
