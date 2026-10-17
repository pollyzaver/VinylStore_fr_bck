// Новый тест вкуса: вопросы и результат. Старый /api/ai не затронут.
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const engine = require('../utils/tasteEngine');
const i18n = require('../utils/tasteI18n');
const model = require('../data/taste_model.json');

const loadProducts = () => JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8'));

// GET /api/taste/questions?lang=en
router.get('/questions', (req, res) => {
  const lang = i18n.normalize(req.query.lang);
  const products = loadProducts();
  const card = t => {
    const p = products.find(x => x.title === t);
    return p ? { id: p.id, title: p.title, artist: engine.artistOf(p), year: p.year, image: p.image, coverMissing: !!p.coverMissing, taste: p.taste } : null;
  };
  const questions = engine.QUESTIONS.map(raw => i18n.localizeQuestion(raw, lang)).map(q => q.kind === 'duel'
    ? { id: q.id, kind: q.kind, required: q.required, title: q.title, question: q.question, a: card(q.a), b: card(q.b) }
    : { id: q.id, kind: q.kind, required: q.required, title: q.title, question: q.question, max: q.max, ui: q.ui,
        options: (q.options || []).map(o => ({ id: o.id, label: o.label })) });
  res.json({ axes: i18n.localizeAxes(model.axes, lang), questions });
});

// POST /api/taste/result  { answers: { rain: 'jazz', duel1: 'a', likes: ['miles'], ... }, limit, lang }
router.post('/result', (req, res) => {
  const answers = req.body && req.body.answers;
  const lang = i18n.normalize(req.body && req.body.lang);
  if (!answers || typeof answers !== 'object') return res.status(400).json({ error: lang === 'en' ? 'An answers object is required' : 'Нужен объект answers' });
  const limit = Math.min(Math.max(parseInt(req.body.limit, 10) || 12, 1), 30);
  res.json(engine.run(answers, loadProducts(), { limit, lang }));
});

module.exports = router;
