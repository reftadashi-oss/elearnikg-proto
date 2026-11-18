// えの すうどく・エリアパズル（年長・年少の 子 むけ。2026年11月19日）。content_card7.js の あとに 読む（科目 x7 に シリーズを 足す）。
// みっしょん！（ROOT の 思考力の 問題集）の ナンプレ・エリアパズルと おなじ ルールを、年長むけに やさしく した もの。
// 1問で 1つの マスを きく（えらぶ ボタンで こたえる）。問題は プログラムで まいかい つくり、こたえが 1つに きまる ことを たしかめる。
// Claude の 案（仮。先生が 確かめる）。
(() => {
  const subj = SUBJECTS.find(s => s.id === 'x7'); if (!subj) return;
  const rc = REPORT_COLUMNS.find(r => r.subject === subj.name);
  const ten = gen => () => { const m = new Map(); for (let i = 0; i < 400 && m.size < 10; i++) { const x = gen(); if (x && !m.has(x.key)) m.set(x.key, x); } const a = [...m.values()]; for (let i = 0; a.length < 10; i++) a.push(a[i]); return shuffle(a); };
  const series = (id, name, col) => { const se = { id, name, units: [] }; subj.series.push(se); if (rc && !rc.cols.includes(col)) rc.cols.push(col);
    return (uname, gen, ...lecture) => { const uid = `${id}-${se.units.length + 1}`; UNITS[uid] = { id: uid, subject: 'x7', series: id, name: uname, col, pass: 0.8, make: ten(gen), lecture, grade: 1 }; se.units.push(uid); }; };
  const BIG = s => `<span style="font-size:1.6em">${s}</span>`;
  const TD = 'width:1.7em;height:1.7em;text-align:center;vertical-align:middle;padding:0;';

  // ===== えの すうどく（4×4） =====
  const BASE = [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]];
  const sw = (a, i, j) => { [a[i], a[j]] = [a[j], a[i]]; };
  const solved = () => {
    let g = BASE.map(r => [...r]); const s = shuffle([0, 1, 2, 3]); g = g.map(r => r.map(v => s[v]));
    if (Math.random() < .5) sw(g, 0, 1); if (Math.random() < .5) sw(g, 2, 3); if (Math.random() < .5) { sw(g, 0, 2); sw(g, 1, 3); }
    const T = a => a[0].map((_, c) => a.map(r => r[c]));
    g = T(g); if (Math.random() < .5) sw(g, 0, 1); if (Math.random() < .5) sw(g, 2, 3); if (Math.random() < .5) { sw(g, 0, 2); sw(g, 1, 3); }
    return Math.random() < .5 ? T(g) : g;
  };
  const sGrid = (g, blank, ask, sym) => `<table style="border-collapse:collapse;margin:.3em auto;font-size:1.3em;border:3px solid #333">${g.map((r, i) => `<tr>${r.map((v, j) => {
    const k = i * 4 + j, b = `border:1px solid #999;${j === 1 ? 'border-right:3px solid #333;' : ''}${i === 1 ? 'border-bottom:3px solid #333;' : ''}`;
    return `<td style="${TD}${b}${k === ask ? 'background:#ffe3cc;' : 'background:#fff;'}">${k === ask ? '<b style="color:#f76707">★</b>' : blank.has(k) ? '' : sym[v]}</td>`; }).join('')}</tr>`).join('')}</table>`;
  // ★の マスが「たて・よこ・へやの ほかの マスを みれば きまる」ように、あける マスを えらぶ
  const sudoku = (blanks, sym) => () => {
    const g = solved(), ask = rand(0, 15), ar = ask >> 2, ac = ask & 3;
    const others = shuffle([...Array(16).keys()].filter(k => k !== ask)).slice(0, blanks - 1), blank = new Set([ask, ...others]);
    const seen = new Set(); for (let k = 0; k < 16; k++) { const r = k >> 2, c = k & 3; if (blank.has(k)) continue; if (r === ar || c === ac || ((r >> 1) === (ar >> 1) && (c >> 1) === (ac >> 1))) seen.add(g[r][c]); }
    if (seen.size < 3) return null;
    return { key: 's' + g.flat().join('') + '#' + [...blank].sort((a, b) => a - b).join('.'), text: `${sGrid(g, blank, ask, sym)}<span style="color:#f76707">★</span>の マスに はいるのは どれ？`,
      boxes: [''], answer: [g[ar][ac] + 1], pick: sym.map(x => BIG(x)), pickHTML: true };
  };
  const FR = ['🍎', '🍌', '🍇', '🍓'], NUM = ['1', '2', '3', '4'];
  const exG = [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]];
  const S_RULE = `<b>すうどくの ルール</b>${sGrid(exG, new Set(), -1, FR)}・たての れつに、おなじ えは 1つだけ。<br>・よこの れつにも、おなじ えは 1つだけ。<br>・ふとい せんで かこんだ 4つの マス（へや）にも、おなじ えは 1つだけ。`;
  const S_EX = `<b>やって みよう</b>${sGrid(exG, new Set([5, 6]), 5, FR)}★の よこの れつには 🍇 と 🍌、たての れつには 🍌・🍎・🍇 が ある。<br>のこって いるのは 🍓 だけ。だから ★は <b>🍓</b>。`;
  const addS = series('x7s', 'すうどく', 'すうどく');
  addS('えの すうどく①（あいて いる マスが 2つ）', sudoku(2, FR), S_RULE, S_EX, 'こたえの えを おそう。');
  addS('えの すうどく②（あいて いる マスが 5つ）', sudoku(5, FR), S_RULE, 'あいて いる マスが ふえても、★の たて・よこ・へやを みれば わかるよ。', 'こたえの えを おそう。');
  addS('すうじの すうどく（1〜4）', sudoku(6, NUM), S_RULE.replace(/<table[\s\S]*?<\/table>/, sGrid(exG, new Set(), -1, NUM)).replace(/えは/g, 'すうじは'), 'えの かわりに 1・2・3・4 を つかうよ。ルールは おなじ。', 'こたえの すうじを おそう。');

  // ===== エリアパズル（ねこ） =====
  const PAL = ['#ffd8a8', '#c3fae8', '#d0ebff', '#f3d9fa', '#fff3bf', '#d3f9d8'];
  const perms = n => n === 1 ? [[0]] : perms(n - 1).flatMap(p => [...Array(n).keys()].map(i => [...p.slice(0, i), n - 1, ...p.slice(i)]));
  const P = { 4: perms(4), 5: perms(5) };
  const ok = p => p.every((c, i) => i === 0 || Math.abs(c - p[i - 1]) > 1);
  const count = (room, n) => P[n].filter(p => ok(p) && new Set(p.map((c, r) => room[r][c])).size === n).length;
  const aGrid = (room, n, cats, labels) => `<table style="border-collapse:collapse;margin:.3em auto;font-size:1.3em;border:3px solid #333">${room.map((row, r) => `<tr>${row.map((id, c) => {
    const bd = (dr, dc) => { const rr = r + dr, cc = c + dc; return rr < 0 || cc < 0 || rr >= n || cc >= n || room[rr][cc] !== id ? '3px solid #333' : '1px solid #aaa'; };
    const lab = labels[r * n + c];
    return `<td style="${TD}background:${PAL[id]};border-top:${bd(-1, 0)};border-bottom:${bd(1, 0)};border-left:${bd(0, -1)};border-right:${bd(0, 1)}">${cats.has(r * n + c) ? '🐱' : lab ? `<b style="color:#c92a2a">${lab}</b>` : ''}</td>`; }).join('')}</tr>`).join('')}</table>`;
  const LAB = ['ア', 'イ', 'ウ'];
  const area = (n, hide) => () => {
    const p = shuffle(P[n].filter(ok))[0];
    const room = [...Array(n)].map(() => Array(n).fill(-1)); p.forEach((c, r) => { room[r][c] = r; });
    for (let left = n * n - n, t = 0; left > 0 && t < 5000; t++) { const r = rand(0, n - 1), c = rand(0, n - 1); if (room[r][c] < 0) continue;
      const [dr, dc] = [[1, 0], [-1, 0], [0, 1], [0, -1]][rand(0, 3)], rr = r + dr, cc = c + dc;
      if (rr >= 0 && cc >= 0 && rr < n && cc < n && room[rr][cc] < 0) { room[rr][cc] = room[r][c]; left--; } }
    if (room.flat().includes(-1) || count(room, n) !== 1) return null;
    const hid = shuffle([...Array(n).keys()]).slice(0, hide), cats = new Set(p.map((c, r) => r * n + c).filter((_, r) => !hid.includes(r)));
    const ar = hid[0], right = ar * n + p[ar], rid = room[ar][p[ar]];
    const hidCells = new Set(hid.map(r => r * n + p[r])), pool = [...Array(n * n).keys()].filter(k => !hidCells.has(k) && !cats.has(k));
    const same = shuffle(pool.filter(k => room[(k / n) | 0][k % n] === rid)), other = shuffle(pool.filter(k => room[(k / n) | 0][k % n] !== rid));
    const wrong = [...same, ...other].slice(0, 2); if (wrong.length < 2) return null;
    const cells = shuffle([right, ...wrong]), labels = {}; cells.forEach((k, i) => { labels[k] = LAB[i]; });
    return { key: 'a' + room.flat().join('') + '#' + hid.join('.') + '#' + cells.join('.'), text: `${aGrid(room, n, cats, labels)}ア・イ・ウの うち、🐱 が はいるのは どれ？`,
      boxes: [''], answer: [cells.indexOf(right) + 1], pick: LAB.map(x => BIG(x)), pickHTML: true };
  };
  const exRoom = [[0, 0, 1, 1], [0, 2, 2, 1], [3, 3, 2, 1], [3, 3, 2, 2]], exP = [1, 3, 0, 2];
  const A_RULE = `<b>エリアパズルの ルール</b>${aGrid(exRoom, 4, new Set(exP.map((c, r) => r * 4 + c)), {})}・ふとい せんで かこまれた いろの ところが「へや」。<br>・どの へやにも 🐱 が 1ぴき。<br>・よこの れつにも、たての れつにも 🐱 は 1ぴきだけ。<br>・🐱 と 🐱 は となりに ならない（ななめの となりも だめ）。`;
  const addA = series('x7a', 'エリアパズル', 'エリアパズル');
  addA('エリアパズル①（4×4・のこり 1ぴき）', area(4, 1), A_RULE, 'のこりの 🐱 は、まだ 🐱 が いない よこの れつと たての れつに はいるよ。', 'こたえの きごうを おそう。');
  addA('エリアパズル②（4×4・のこり 2ひき）', area(4, 2), A_RULE, '🐱 の となり（ななめも）には はいれないよ。はいれない マスを けして いこう。', 'こたえの きごうを おそう。');
  addA('エリアパズル③（5×5・のこり 2ひき）', area(5, 2), A_RULE, '5×5 でも ルールは おなじ。🐱 が いない れつと へやを さがそう。', 'こたえの きごうを おそう。');
})();
