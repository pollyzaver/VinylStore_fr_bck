// Проверка движка на «персонах»: node scripts/taste_validate.js [-v]
const e = require('../utils/tasteEngine');
const products = require('../data/products.json');
const verbose = process.argv.includes('-v');

const S = (rain, night, hook, sound, mood) => ({ rain, night, hook, sound, mood });
const P = [
  { name: 'Метал-фанат', a: { weather:'storm', volume:9, tempo:150, place:'party', hook:'drive', song:'epic', sound:'rough', band:['dist','bass','drums','voice'], mood:{x:.2,y:.9}, likes:['metallica','rammstein'] },
    want: ['Metallica','Pantera','Slipknot','Iron Maiden','Judas Priest','Rammstein','System Of A Down','Korn','Deftones','Emigrate','Limp Bizkit','Marilyn Manson'], min: 4, forbid: ['jazz','folk','ambient','soul'] },
  { name: 'Джазовый слушатель', a: { weather:'winter', volume:3, tempo:90, place:'home', hook:'players', song:'epic', sound:'film', band:['piano','bass','drums','brass'], mood:{x:.3,y:.2}, likes:['miles'] },
    want: ['Miles Davis','John Coltrane','Bill Evans Trio','The Dave Brubeck Quartet','Art Blakey & The Jazz Messengers','Chet Baker','Charles Mingus','Keith Jarrett'], min: 4, forbid: ['metal','pop'] },
  { name: 'Тёмный синти', a: { weather:'fog', volume:5, tempo:110, place:'home', hook:'atmos', song:'epic', sound:'future', band:['synth','machine','voice'], mood:{x:.2,y:.4}, likes:['dm','massive'] },
    want: ['Depeche Mode','Massive Attack','Portishead','Burial','Radiohead','The Cure','Nine Inch Nails','Joy Division'], min: 4, forbid: ['jazz','folk','soul'] },
  { name: 'Фолк-душа', a: { weather:'winter', volume:3, tempo:85, place:'kitchen', hook:'voice', song:'chorus', sound:'film', band:['guitar','voice','strings'], mood:{x:.4,y:.2}, likes:['bon'] },
    want: ['Nick Drake','Joni Mitchell','Bon Iver','Fleet Foxes','Sufjan Stevens','Neil Young','Carole King','Phoebe Bridgers','Cigarettes After Sex','Bruce Springsteen','Chet Baker','Nina Simone','Billie Holiday'], min: 3, forbid: ['metal','electronic'] },
  { name: 'Мелодичный поп-рок', a: { weather:'morning', volume:6, tempo:120, place:'road', hook:'voice', song:'chorus', sound:'clean', band:['guitar','bass','drums','voice'], mood:{x:.85,y:.6}, likes:['beatles','queen'] },
    want: ['The Beatles','Fleetwood Mac','Queen','Oasis','Michael Jackson','Carole King','Adele','The Killers','Pet Shop Boys','The Beach Boys','Bob Marley & The Wailers','David Bowie','The Smiths','Kiss','Stevie Wonder','Lauryn Hill','Marvin Gaye'], min: 3, forbid: ['metal','ambient'] },
  { name: 'Соул и R&B', a: { weather:'morning', volume:5, tempo:100, place:'kitchen', hook:'voice', song:'chorus', sound:'film', band:['bass','drums','voice','brass'], mood:{x:.8,y:.4}, likes:['marvin','nina'] },
    want: ['Marvin Gaye','Aretha Franklin','Stevie Wonder','Amy Winehouse','D\'Angelo','Lauryn Hill','Nina Simone','Curtis Mayfield','Adele'], min: 3, forbid: ['metal'] },
  { name: 'Хип-хоп', a: { weather:'storm', volume:6, tempo:100, place:'road', hook:'drive', song:'beat', sound:'future', band:['machine','bass','voice'], mood:{x:.3,y:.55}, likes:['kendrick'] },
    want: ['Kendrick Lamar','Nas','A Tribe Called Quest','Madvillain','J Dilla','Frank Ocean'], min: 2, forbid: ['metal'] },
  { name: 'Эмбиент', a: { weather:'fog', volume:2, place:'home', hook:'atmos', song:'epic', sound:'future', band:['synth','strings'], mood:{x:.4,y:.1}, likes:['aphex'] },
    want: ['Brian Eno','Biosphere','Aphex Twin','Burial','Massive Attack','Hans Zimmer','Radiohead'], min: 3, forbid: ['metal','pop','rock'] },
  { name: 'Классический рок', a: { weather:'storm', volume:7, tempo:125, place:'road', hook:'players', song:'epic', sound:'film', band:['dist','bass','drums','voice'], mood:{x:.7,y:.7}, era:['60_70'], likes:['floyd'] },
    want: ['Led Zeppelin','The Doors','Pink Floyd','The Jimi Hendrix Experience','The Beatles','David Bowie','Fleetwood Mac','The Velvet Underground','Kiss'], min: 4, forbid: ['hiphop','ambient'] },
  { name: 'Русский рок', a: { weather:'fog', volume:6, tempo:110, place:'road', hook:'voice', song:'chorus', sound:'rough', band:['guitar','bass','drums','voice'], mood:{x:.25,y:.45}, likes:['kino'] },
    want: ['Кино'], min: 1, top: 3 },
  { name: 'Инди-меланхолик 90–00', a: { weather:'fog', volume:4, tempo:100, place:'home', hook:'atmos', song:'epic', sound:'clean', band:['guitar','synth','voice'], mood:{x:.25,y:.3}, era:['90','00'], likes:['radiohead'] },
    want: ['Radiohead','Portishead','The Cure','Slowdive','Cigarettes After Sex','Cocteau Twins','Sigur Rós','Mogwai'], min: 3, forbid: ['metal'] },
  { name: 'Дискотека 80-х', a: { weather:'morning', volume:7, tempo:125, place:'party', hook:'drive', song:'chorus', sound:'clean', band:['synth','machine','bass','voice'], mood:{x:.9,y:.85}, era:['80'] },
    want: ['Pet Shop Boys','Modern Talking','Michael Jackson','Depeche Mode','Queen','And One','Kiss'], min: 3, forbid: ['metal','folk'] },
  { name: 'Без метала и рока', a: { weather:'winter', volume:5, tempo:105, place:'home', hook:'voice', song:'chorus', sound:'clean', band:['synth','voice','piano'], mood:{x:.3,y:.35}, exclude:['metal','rock'], likes:['lana'] },
    want: ['Lana Del Rey','The Weeknd','Billie Eilish','Adele','Amy Winehouse','Frank Ocean','Radiohead','The Neighbourhood','Phoebe Bridgers','D\'Angelo'], min: 3, forbid: ['metal','rock'] },
  { name: 'Смесь: Metallica + Miles', a: { likes:['metallica','miles'] },
    custom: top => (top.some(t=>t.artist==='Metallica') && top.some(t=>t.artist==='Miles Davis')) ? null : 'в топ-12 нет обоих любимых артистов' },
  { name: 'Всеядный (все пропуски)', a: {},
    custom: top => new Set(top.map(t=>t.category)).size >= 4 ? null : 'мало разнообразия в топ-12' },
];

let failed = 0;
const dump = [];
const outArg = process.argv.find(a => a.startsWith('--out='));
for (const p of P) {
  const r = e.run(p.a, products, { limit: 12 });
  const top = r.recommendations;
  const topN = top.slice(0, p.top || 5);
  dump.push({ name: p.name, title: r.profile.title, values: r.profile.values });
  const errs = [];
  if (p.want) {
    const hit = topN.filter(t => p.want.includes(t.artist));
    if (hit.length < p.min) errs.push(`в топ-${topN.length} только ${hit.length} из ожидаемых (нужно ${p.min})`);
  }
  if (p.forbid) {
    const bad = top.slice(0, 8).filter(t => p.forbid.includes(t.category));
    if (bad.length) errs.push('в топ-8 лишнее: ' + bad.map(b => `${b.artist}: ${b.title} [${b.category}]`).join('; '));
  }
  if (p.custom) { const m = p.custom(top); if (m) errs.push(m); }
  if (errs.length) failed++;
  console.log(`${errs.length ? '✗' : '✓'} ${p.name}  «${r.profile.title}»`);
  if (verbose || errs.length) {
    top.slice(0, 8).forEach(t => console.log(`     ${String(t.match).padStart(3)}%  ${t.artist} — ${t.title} (${t.year}, ${t.category})`));
    errs.forEach(m => console.log('     ! ' + m));
  }
}
if (outArg) require('fs').writeFileSync(outArg.slice(6), JSON.stringify(dump, null, 1));
console.log(`\nПерсон: ${P.length}, не прошло: ${failed}`);
process.exit(failed ? 1 : 0);
