// カードすいり（年長・年少の 子 むけ。2026年11月19日）。content_kazu.js の あとに 読む（科目 x7 に シリーズを 足す）。
// みっしょん！（ROOT の 思考力の 問題集）の「カードすいり」と おなじ ルールを、年長むけに やさしく した もの。
//   ルール：0・1・2 の すうじの カード。くろと しろの 2しゅるい。ひだりから ちいさい じゅんに ならべる。
//           すうじが おなじ ときは くろが さき（ひだり）。うらむきの カードは いろだけ わかる。
// 問題は プログラムで まいかい つくる（本や 過去問は つかわない）。Claude の 案（仮。先生が 確かめる）。
(() => {
  const subj = SUBJECTS.find(s => s.id === 'x7'); if (!subj) return;
  const rc = REPORT_COLUMNS.find(r => r.subject === subj.name); if (rc && !rc.cols.includes('カードすいり')) rc.cols.push('カードすいり');
  const se = { id: 'x7c', name: 'カードすいり', units: [] }; subj.series.push(se);
  const TAP = 'こたえの すうじを おそう。';
  // カード 1まい。c＝'k'（くろ）か 'w'（しろ）。down＝うらむき。mark＝きかれて いる カード（オレンジの わく）
  const CARD = (n, c, down, mark) => `<span style="display:inline-block;width:1.5em;height:2.1em;line-height:2.1em;margin:0 .12em;border:2px solid ${c === 'k' ? '#222' : '#555'};border-radius:.25em;text-align:center;font-weight:bold;vertical-align:middle;background:${c === 'k' ? '#222' : '#fff'};color:${c === 'k' ? '#fff' : '#222'};${mark ? 'outline:4px solid #f76707;outline-offset:2px;' : ''}">${down ? '？' : n}</span>`;
  const ROW = (cards, size = '1.3em') => `<div style="font-size:${size};margin:.3em 0">${cards}</div>`;
  const DECK = [0, 1, 2].flatMap(n => [[n, 'k'], [n, 'w']]);
  const order = (a, b) => a[0] - b[0] || (a[1] === 'k' ? -1 : 1) - (b[1] === 'k' ? -1 : 1);
  const ten = gen => () => { const m = new Map(); for (let i = 0; i < 300 && m.size < 10; i++) { const x = gen(); if (!m.has(x.key)) m.set(x.key, x); } const a = [...m.values()]; for (let i = 0; a.length < 10; i++) a.push(a[i]); return shuffle(a); };
  // cnt まいを つかい、downs まいを うらむきに する。うらむきの うち 1まいを きく
  const make = (cnt, downs) => () => {
    const used = shuffle([...DECK]).slice(0, cnt), line = [...used].sort(order);
    const dn = shuffle(line.map((_, i) => i)).slice(0, downs), ask = dn[0];
    const ans = line[ask][0];
    const text = `つかう カード${ROW(shuffle([...used]).map(([n, c]) => CARD(n, c)).join(''), '1.1em')}`
      + `ちいさい じゅんに ならべたよ。${ROW(line.map(([n, c], i) => CARD(n, c, dn.includes(i), i === ask)).join(''))}`
      + `<span style="color:#f76707">オレンジの わく</span>の カードの すうじは？`;
    return { key: line.map(x => x.join('')).join('.') + '#' + dn.join(''), text, boxes: [''], answer: [ans + 1], pick: ['0', '1', '2'].map(x => `<span style="font-size:1.6em">${x}</span>`), pickHTML: true };
  };
  const RULE = `<b>カードすいりの ルール</b><br>${ROW(CARD(0, 'k') + CARD(0, 'w') + CARD(1, 'k') + CARD(1, 'w') + CARD(2, 'k') + CARD(2, 'w'))}`
    + '・すうじは 0・1・2。くろい カードと しろい カードが あるよ。<br>・ひだりから、すうじの ちいさい じゅんに ならべるよ。<br>・すうじが おなじ ときは、<b>くろが ひだり</b>、しろが みぎ。<br>・うらむきの カードは、いろだけ わかるよ。';
  const EX = `<b>やって みよう</b><br>つかう カード${ROW(CARD(1, 'w') + CARD(0, 'k') + CARD(2, 'k'), '1.1em')}ならべると${ROW(CARD(0, 'k') + CARD(1, 'w', true, true) + CARD(2, 'k'))}`
    + 'つかう カードの なかで、しろい カードは「1」だけ。だから オレンジの わくの カードは <b>1</b>。<br>こまったら、つかう カードを じぶんで ちいさい じゅんに ならべて みよう。';
  const add = (name, gen, ...lecture) => { const id = `x7c-${se.units.length + 1}`; UNITS[id] = { id, subject: 'x7', series: 'x7c', name, col: 'カードすいり', pass: 0.8, make: ten(gen), lecture, grade: 1 }; se.units.push(id); };
  add('カードすいり①（3まい）', make(3, 1), RULE, EX, TAP);
  add('カードすいり②（4まい）', make(4, 1), RULE, `4まいでも おなじ。つかう カードを ちいさい じゅんに ならべて、オレンジの わくの ところを みよう。`, TAP);
  add('カードすいり③（うらむきが 2まい）', make(4, 2), RULE, `うらむきが 2まい あっても、ならべかたの ルールは おなじ。<br>おもての カードを ヒントに して、オレンジの わくの カードを かんがえよう。`, TAP);
})();
