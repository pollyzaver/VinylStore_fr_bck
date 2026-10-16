import React from 'react';

// Иллюстрации к вариантам ответов теста. Плоские, в палитре «Погреб» + «Бумага».
const BG = { storm: ['#1b0a10', '#3a1d28'], fog: ['#2a1c18', '#6b5547'], morning: ['#cf8b3e', '#f3e9d2'], winter: ['#16101a', '#2c2038'],
  synth: ['#120503', '#3a0f2a'], heavy: ['#120503', '#3a0d10'], pop: ['#3a1d10', '#8c141d'], silence: ['#0b0d1c', '#1c2140'],
  chorus: ['#2a0b0f', '#8c141d'], epic: ['#0b0d1c', '#2a1630'], beat: ['#0b1418', '#10303a'], noise: ['#1a1a1a', '#3a1d10'],
  home: ['#1b0a06', '#3a1d10'], party: ['#120503', '#3a0f2a'], road: ['#1b0a06', '#4a2418'], kitchen: ['#2a1608', '#5c3515'] };

const SCENES = {
  'weather.storm': (
    <>
      <ellipse cx="50" cy="26" rx="34" ry="14" fill="#2b1620" /><ellipse cx="96" cy="22" rx="40" ry="16" fill="#35192a" /><ellipse cx="128" cy="30" rx="26" ry="11" fill="#2b1620" />
      <polygon points="88,34 74,62 86,62 78,90 104,54 92,54 100,34" fill="#f3e9d2" />
      {[20, 38, 56, 118, 134, 148].map(x => <line key={x} x1={x} y1="52" x2={x - 6} y2="72" stroke="#a89a86" strokeOpacity=".5" strokeWidth="1.2" />)}
    </>),
  'weather.fog': (
    <>
      <circle cx="108" cy="36" r="14" fill="#f3e9d2" fillOpacity=".65" />
      <path d="M0 62 Q30 44 56 58 T112 54 T160 60 V100 H0Z" fill="#1b0f0c" />
      {[44, 56, 68, 80].map((y, i) => <rect key={y} x="0" y={y} width="160" height="9" fill="#f3e9d2" fillOpacity={0.1 + i * 0.05} />)}
      <path d="M0 86 Q40 80 80 86 T160 84 V100 H0Z" fill="#120503" fillOpacity=".7" />
    </>),
  'weather.morning': (
    <>
      <circle cx="80" cy="56" r="22" fill="#f3e9d2" />
      <path d="M0 68 H24 V54 H40 V68 H58 V46 H76 V68 H100 V58 H120 V68 H140 V50 H160 V100 H0Z" fill="#3a1d10" />
      <rect x="0" y="82" width="160" height="18" fill="#6a0d12" fillOpacity=".35" />
      <path d="M52 90 H108 M62 95 H98" stroke="#f3e9d2" strokeOpacity=".6" strokeWidth="1.4" />
    </>),
  'weather.winter': (
    <>
      <rect x="40" y="14" width="80" height="72" rx="2" fill="#3a2a14" stroke="#f3e9d2" strokeWidth="3" />
      <line x1="80" y1="14" x2="80" y2="86" stroke="#f3e9d2" strokeWidth="2" /><line x1="40" y1="50" x2="120" y2="50" stroke="#f3e9d2" strokeWidth="2" />
      <circle cx="100" cy="68" r="12" fill="#cf8b3e" fillOpacity=".55" /><circle cx="100" cy="68" r="5" fill="#f3e9d2" />
      {[[52, 28], [66, 38], [92, 24], [110, 34], [58, 62], [74, 70], [30, 40], [138, 52], [20, 74], [146, 20]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" fill="#f3e9d2" fillOpacity=".8" />)}
    </>),
  'night.synth': (
    <>
      <path d="M52 56 A28 28 0 0 1 108 56Z" fill="#cf8b3e" />
      {[58, 64, 70].map(y => <rect key={y} x="40" y={y - 4} width="80" height="1.6" fill="#120503" />)}
      <rect x="0" y="56" width="160" height="44" fill="#120503" />
      {[0, 1, 2, 3, 4].map(i => <line key={i} x1="80" y1="56" x2={-40 + i * 60} y2="100" stroke="#b3262d" strokeWidth="1.2" />)}
      {[62, 70, 80, 92].map(y => <line key={y} x1="0" y1={y} x2="160" y2={y} stroke="#b3262d" strokeWidth="1" />)}
    </>),
  'night.heavy': (
    <>
      {[10, 22, 34, 46, 58, 70, 82, 94, 106, 118, 130, 142].map((x, i) => {
        const h = [40, 62, 34, 78, 52, 84, 46, 70, 38, 66, 44, 56][i];
        return <rect key={x} x={x} y={100 - h} width="8" height={h} fill={i % 3 === 0 ? '#cf8b3e' : '#b3262d'} />;
      })}
    </>),
  'night.pop': (
    <>
      <ellipse cx="62" cy="68" rx="11" ry="8" fill="#f3e9d2" transform="rotate(-18 62 68)" /><rect x="71" y="26" width="3.2" height="42" fill="#f3e9d2" />
      <ellipse cx="102" cy="62" rx="11" ry="8" fill="#f3e9d2" transform="rotate(-18 102 62)" /><rect x="111" y="22" width="3.2" height="40" fill="#f3e9d2" />
      <path d="M71 26 L114 20 V30 L71 36Z" fill="#f3e9d2" />
    </>),
  'night.silence': (
    <>
      <circle cx="120" cy="24" r="10" fill="#f3e9d2" fillOpacity=".9" />
      {[[20, 14], [44, 30], [70, 12], [96, 36], [140, 48], [30, 52]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.1" fill="#f3e9d2" />)}
      <path d="M0 54 H160 V100 H0Z" fill="#0a0b16" />
      <path d="M70 54 L10 100 H150 L90 54Z" fill="#1a1c33" />
      <path d="M80 56 V62 M80 70 V80 M80 88 V100" stroke="#cf8b3e" strokeWidth="2" />
    </>),
  'song.chorus': (
    <>
      {[0, 1, 2].map(i => <path key={i} d={`M${14 + i * 48} 70 Q${38 + i * 48} 14 ${62 + i * 48} 70`} fill="none" stroke="#f3e9d2" strokeWidth="3.2" strokeLinecap="round" />)}
      {[0, 1, 2].map(i => <circle key={i} cx={38 + i * 48} cy="82" r="3" fill="#cf8b3e" />)}
    </>),
  'song.epic': (
    <>
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={10 + i * 10.5} y={86 - (6 + i * 4.8)} width="6" height={6 + i * 4.8} fill={i > 9 ? '#f3e9d2' : '#cf8b3e'} fillOpacity={0.4 + i * 0.045} />)}
    </>),
  'song.beat': (
    <>
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 8 }, (_, c) => <circle key={r + '-' + c} cx={22 + c * 17} cy={22 + r * 18} r={(c + r * 3) % 4 === 0 ? 6 : 3} fill={(c + r * 3) % 4 === 0 ? '#5fb3c9' : '#f3e9d2'} fillOpacity={(c + r * 3) % 4 === 0 ? 1 : 0.35} />))}
    </>),
  'song.noise': (
    <>
      <path d="M8 60 L20 24 L28 78 L40 18 L52 70 L60 30 L74 82 L86 22 L98 66 L108 36 L122 74 L134 28 L152 60" fill="none" stroke="#f3e9d2" strokeWidth="1.8" strokeLinejoin="miter" />
      <path d="M8 40 L24 70 L36 30 L50 62 L66 20 L80 72 L96 34 L112 80 L128 26 L152 52" fill="none" stroke="#b3262d" strokeWidth="1.4" />
    </>),
  'place.home': (
    <>
      <path d="M44 62 V48 A36 36 0 0 1 116 48 V62" fill="none" stroke="#f3e9d2" strokeWidth="5" strokeLinecap="round" />
      <rect x="36" y="56" width="16" height="26" rx="6" fill="#cf8b3e" /><rect x="108" y="56" width="16" height="26" rx="6" fill="#cf8b3e" />
    </>),
  'place.party': (
    <>
      <circle cx="80" cy="46" r="24" fill="#c9bfae" />
      {[-16, -8, 0, 8, 16].map(d => <line key={'h' + d} x1="56" y1={46 + d} x2="104" y2={46 + d} stroke="#120503" strokeOpacity=".35" />)}
      {[-16, -8, 0, 8, 16].map(d => <line key={'v' + d} x1={80 + d} y1="22" x2={80 + d} y2="70" stroke="#120503" strokeOpacity=".35" />)}
      <line x1="80" y1="0" x2="80" y2="22" stroke="#f3e9d2" />
      {[[16, 80], [40, 90], [120, 90], [144, 80], [20, 28], [140, 26]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={i % 2 ? '#cf8b3e' : '#b3262d'} />)}
    </>),
  'place.road': (
    <>
      <path d="M0 52 H14 V40 H28 V52 H46 V34 H62 V52 H84 V44 H100 V52 H122 V38 H140 V52 H160 V100 H0Z" fill="#120503" />
      <rect x="0" y="68" width="160" height="32" fill="#2a1410" />
      {[10, 46, 82, 118].map(x => <rect key={x} x={x} y="82" width="24" height="3" fill="#cf8b3e" />)}
      <circle cx="136" cy="22" r="9" fill="#f3e9d2" fillOpacity=".85" />
    </>),
  'place.kitchen': (
    <>
      <rect x="48" y="52" width="64" height="30" rx="4" fill="#f3e9d2" /><rect x="40" y="50" width="80" height="6" rx="3" fill="#cf8b3e" />
      <rect x="112" y="60" width="26" height="5" rx="2.5" fill="#f3e9d2" />
      {[64, 80, 96].map((x, i) => <path key={x} d={`M${x} 44 q-8 -8 0 -16 q8 -8 0 -16`} fill="none" stroke="#f3e9d2" strokeOpacity=".7" strokeWidth="2.2" strokeLinecap="round" transform={`translate(0 ${i % 2 ? 4 : 0})`} />)}
    </>),
};

export function Art({ id }) {
  const key = id.split('.')[1];
  const [a, b] = BG[key] || ['#1b0a06', '#3a1d10'];
  const gid = 'tzg-' + id.replace('.', '-');
  return (
    <svg viewBox="0 0 160 100" className="tz-art" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
      <rect width="160" height="100" fill={`url(#${gid})`} />
      {SCENES[id]}
    </svg>
  );
}
export const hasArt = id => Boolean(SCENES[id]);

// форма волны для вопроса про звук
export function Wave({ kind }) {
  const pts = [];
  const N = 80;
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i <= N; i++) {
    const t = i / N * Math.PI * 4;
    let y = Math.sin(t);
    if (kind === 'clean') y = Math.sin(t) * 0.8;
    if (kind === 'rough') y = Math.sin(t) * 0.7 + (rnd() - 0.5) * 0.9;
    if (kind === 'future') y = Math.sign(Math.sin(t)) * 0.75;
    if (kind === 'film') y = Math.sin(t + Math.sin(t * 0.5) * 0.6) * 0.65 + (rnd() - 0.5) * 0.12;
    pts.push(`${(i / N * 160).toFixed(1)},${(50 - y * 34).toFixed(1)}`);
  }
  const grain = kind === 'film' ? Array.from({ length: 36 }, () => [rnd() * 160, rnd() * 100]) : [];
  return (
    <svg viewBox="0 0 160 100" className="tz-art" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="100" fill={kind === 'film' ? '#2a1608' : kind === 'future' ? '#0b1418' : '#1b0a06'} />
      <line x1="0" y1="50" x2="160" y2="50" stroke="#f3e9d2" strokeOpacity=".15" />
      <polyline points={pts.join(' ')} fill="none" stroke={kind === 'future' ? '#5fb3c9' : '#cf8b3e'} strokeWidth="2.4" strokeLinejoin={kind === 'future' ? 'miter' : 'round'} strokeLinecap="round" />
      {grain.map(([x, y], i) => <circle key={i} cx={x} cy={y} r=".7" fill="#f3e9d2" fillOpacity=".35" />)}
    </svg>
  );
}
