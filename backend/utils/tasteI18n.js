// Переводы теста вкуса. Русский текст лежит в data/taste_questions.json, data/taste_model.json и в tasteEngine.js,
// здесь только другие языки. Если перевода нет, отдаётся русский.

const en = {
  axes: {
    energy: { label: 'Energy', low: 'quiet and intimate', high: 'powerful and loud', lowAdj: 'quiet, intimate', highAdj: 'powerful, energetic' },
    tempo: { label: 'Tempo', low: 'slow', high: 'fast', lowAdj: 'unhurried', highAdj: 'fast, upbeat' },
    dark: { label: 'Light and shadow', low: 'bright', high: 'gloomy', lowAdj: 'bright', highAdj: 'dark, gloomy' },
    organic: { label: 'Sound', low: 'synthetic', high: 'live instruments', lowAdj: 'electronic', highAdj: 'live, with real instruments' },
    density: { label: 'Density', low: 'air and pauses', high: 'dense wall of sound', lowAdj: 'sparse, airy', highAdj: 'dense, layered' },
    vocal: { label: 'Voice', low: 'instrumental', high: 'voice up front', lowAdj: 'instrumental', highAdj: 'vocal-driven' },
    melodic: { label: 'Melody', low: 'experiment', high: 'songs that stick', lowAdj: 'experimental', highAdj: 'melodic, memorable' },
    raw: { label: 'Texture', low: 'polished', high: 'raw and rough', lowAdj: 'polished', highAdj: 'raw, gritty' },
  },
  noun: {
    energy: ['stillness', 'power'], tempo: ['unhurry', 'drive'], dark: ['light', 'shadow'],
    organic: ['synthetic', 'live sound'], density: ['air', 'density'], vocal: ['instrumental', 'voice'],
    melodic: ['experiment', 'melody'], raw: ['gloss', 'grit'],
  },
  text: {
    match: 'Matches: ',
    diff: 'Difference: it feels {adj}.',
    generic: 'Close in overall feel.',
    omni: 'Omnivorous listener',
    yours: 'Your music: {adjs}.',
    any: 'A wide range of music suits you.',
    needAnswers: 'An answers object is required',
  },
  questions: {
    weather: { title: 'First frame', question: 'Which frame looks most like your music?',
      options: { storm: 'Thunderstorm over the city', fog: 'Fog over the river', morning: 'Bright morning after rain', winter: 'Winter evening by the window' } },
    volume: { title: 'Volume knob', question: 'Where do you turn the knob when your favourite song plays?',
      ui: { left: 'Barely audible', right: 'Loud enough to rattle the windows' } },
    tempo: { title: 'Rhythm', question: 'Tap along to your favourite song',
      ui: { hint: 'Tap around the circle five times in a row', skip: 'Can’t catch the rhythm' } },
    place: { title: 'Where it plays', question: 'Where do you listen to music most often?',
      options: { home: 'At home, in headphones, so nobody disturbs me', party: 'With friends, so everyone moves', road: 'On the road: a window, the city, kilometres', kitchen: 'In the kitchen while I cook or clean' } },
    hook: { title: 'Voice', question: 'What matters most in music to you?',
      options: { voice: 'Voice and lyrics', atmos: 'Sound and atmosphere, lyrics don’t matter', drive: 'Rhythm and drive', players: 'Live playing by the musicians' } },
    song: { title: 'What you finish', question: 'Which track do you listen to until the end?',
      options: { chorus: 'A song with a catchy chorus', epic: 'A long piece that builds slowly', beat: 'Beat and rhythm, no melody needed', noise: 'Noise and experiment' } },
    sound: { title: 'Sound', question: 'Which sound is more pleasant?',
      options: { clean: 'Clean and polished', rough: 'Live, with rough edges', future: 'Synthetic, from the future', film: 'Warm, like old film' } },
    band: { title: 'Line-up', question: 'Build the line-up of your favourite song: what plays in it?',
      options: { guitar: 'Acoustic guitar', dist: 'Overdriven electric guitar', bass: 'Bass', drums: 'Live drums', machine: 'Drum machine', synth: 'Synthesizers', piano: 'Piano', strings: 'Strings', brass: 'Brass and woodwinds', voice: 'Voice' } },
    mood: { title: 'Mood', question: 'Place a dot: what is the mood of the music you listen to most?',
      ui: { xl: 'sad', xr: 'bright', yt: 'lively', yb: 'calm' } },
    era: { title: 'Era', question: 'Which era’s sound is closest to you?',
      options: { '60_70': '60s and 70s', '80': '80s', '90': '90s', '00': '2000s', '10_20': '2010s and now' } },
    exclude: { title: 'Exclusions', question: 'What is definitely not for you?',
      options: { metal: 'Metal', rock: 'Rock', electro: 'Electronic', hiphop: 'Hip-hop', jazz: 'Jazz', pop: 'Pop', folk: 'Folk' } },
    likes: { title: 'Anchors', question: 'Mark who you enjoy listening to (you can skip if you don’t recognise anyone)',
      options: { kino: 'Kino' } },
  },
};

const PACKS = { en };

// Язык из запроса: только известные, иначе русский
const normalize = (lang) => (PACKS[lang] ? lang : 'ru');
const pack = (lang) => PACKS[normalize(lang)] || null;

// Вопрос с подставленными переводами (русский оригинал, если перевода нет)
function localizeQuestion(q, lang) {
  const p = pack(lang);
  const tr = p && p.questions[q.id];
  if (!tr) return q;
  return {
    ...q,
    title: tr.title || q.title,
    question: tr.question || q.question,
    ui: q.ui ? { ...q.ui, ...(tr.ui || {}) } : q.ui,
    options: q.options ? q.options.map(o => ({ ...o, label: (tr.options && tr.options[o.id]) || o.label })) : q.options,
  };
}

const localizeAxes = (axes, lang) => {
  const p = pack(lang);
  return p ? axes.map(a => ({ ...a, ...(p.axes[a.key] || {}) })) : axes;
};

module.exports = { normalize, pack, localizeQuestion, localizeAxes };
