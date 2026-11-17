// かず（年長・年少の 子 むけ。2026年11月17日 社長）。content_kana.js の あとに 読む（科目 x7 に シリーズを 足す）。
// 10までの かずを、え（絵文字）を かぞえて こたえる。問題文は ぜんぶ ひらがな。Claude の 案（仮。先生が 確かめる）。
(() => {
  const subj = SUBJECTS.find(s => s.id === 'x7'); if (!subj) return;
  subj.name = 'ひらがな・カタカナ・かず';
  const rc = REPORT_COLUMNS.find(r => r.subject === 'ひらがな・カタカナ'); if (rc) { rc.subject = 'ひらがな・カタカナ・かず'; rc.cols.push('かず'); }
  const se = { id: 'x7n', name: 'かず', units: [] }; subj.series.unshift(se);
  const pick = a => a[rand(0, a.length - 1)];
  const MID = s => `<span style="font-size:1.5em">${s}</span>`;
  // こたえが かずの 問題は、かずを そのまま 入れる。えを えらぶ 問題は、えを おす（ばんごうは つかわない：ばんごうと かずが まざって まちがえるため。2026年11月17日）
  const TYPE = 'こたえの かずを いれよう。', TAP = 'こたえの えを おそう。';
  const num = (stem, n, key) => ({ key: key + '#' + n, text: stem, boxes: [''], answer: [n] });
  const tapc = (stem, opts, correct, key) => { const o = shuffle([...new Set(opts)]); return { key: key + '#' + correct, text: stem, boxes: [''], answer: [o.indexOf(correct) + 1], pick: o.map(x => `<span style="font-size:1.6em">${x.replace(/(\p{Extended_Pictographic}{5})(?=\p{Extended_Pictographic})/gu, '$1　')}</span>`) }; };
  const EM = ['🍎', '🐶', '🚗', '⭐', '🐟', '🌸', '🍙', '🎈', '🐱', '🍓'];
  const row = (e, n) => `<div style="font-size:2em;line-height:1.4;letter-spacing:.1em">${(e + ' ').repeat(n).trim().replace(/((?:\S+\s){5})/, '$1<br>')}</div>`;
  const choice = (stem, opts, correct, key) => { const o = shuffle([...new Set(opts)]); return { key: key + '#' + correct, text: `${stem}<br><span class="ch">${o.map((x, i) => `<b>${i + 1}</b> ${MID(x)}`).join(o.some(x => [...x].length > 4) ? '<br>' : '　')}</span>`, boxes: [''], answer: [o.indexOf(correct) + 1] }; };
  const near = (n, lo, hi) => { const s = new Set([n]); while (s.size < 3) { const x = n + pick([-2, -1, 1, 2]); if (x >= lo && x <= hi) s.add(x); } return [...s]; };
  const ten = gen => () => { const m = new Map(); for (let i = 0; i < 300 && m.size < 10; i++) { const x = gen(); if (!m.has(x.key)) m.set(x.key, x); } const a = [...m.values()]; for (let i = 0; a.length < 10; i++) a.push(a[i]); return shuffle(a); };
  const add = (name, gen, ...lecture) => { const id = `x7n-${se.units.length + 1}`; UNITS[id] = { id, subject: 'x7', series: 'x7n', name, col: 'かず', pass: 0.8, make: ten(gen), lecture, grade: 1 }; se.units.push(id); };
  const count = hi => () => { const n = rand(1, hi), e = pick(EM); return num(`${row(e, n)}いくつ あるかな？`, n, `c${n}${e}`); };
  add('かずを かぞえよう（1〜5）', count(5), `ひとつずつ ゆびで さしながら かぞえよう。<br>${MID('1 いち　2 に　3 さん　4 よん　5 ご')}<br>${row('🍎', 3)}　これは 3`, TYPE);
  add('かずを かぞえよう（1〜10）', count(10), `${MID('6 ろく　7 なな　8 はち　9 きゅう　10 じゅう')}<br>5こ ずつに わけて かぞえると わかりやすいよ。<br>${row('⭐', 7)}　これは 7`, TYPE);
  add('すうじと かず', () => { const n = rand(1, 10), e = pick(EM); const ws = near(n, 1, 10); return tapc(`${MID(`<b style="font-size:1.6em">${n}</b>`)}<br>おなじ かずの えは どれ？`, ws.map(x => (e).repeat(x)), e.repeat(n), `s${n}${e}`); },
    `すうじと、ものの かずを むすびつけよう。<br>${MID('3')} → ${row('🐟', 3)}`, TAP);
  add('どっちが おおい？', () => { let a = rand(1, 9), b = rand(1, 9); while (a === b) b = rand(1, 9); const e = pick(EM), f = pick(EM.filter(x => x !== e)); return tapc(`<div style="font-size:1.6em">${e.repeat(a)}</div><div style="font-size:1.6em">${f.repeat(b)}</div>おおいのは どっち？`, [e, f, 'おなじ'], a > b ? e : f, `m${a}.${b}${e}${f}`); },
    `かぞえて、かずが おおい ほうを えらぼう。<br>${row('🍎', 4)} と ${row('🍓', 2)} → 🍎 が おおい`, TAP);
  add('1つ おおい・1つ すくない', () => { const up = Math.random() < 0.5, n = up ? rand(1, 9) : rand(2, 10), e = pick(EM), ans = up ? n + 1 : n - 1; return num(`${row(e, n)}${up ? 'もう 1つ ふえると いくつ？' : '1つ へると いくつ？'}`, ans, `u${up ? 1 : 0}${n}${e}`); },
    `1つ ふえると、つぎの かずに なるよ（3 → 4）。<br>1つ へると、まえの かずに なるよ（3 → 2）。`, TYPE);
  add('かずの じゅんばん', () => { const s = rand(1, 7), i = rand(0, 3), seq = [s, s + 1, s + 2, s + 3]; const ans = seq[i]; return num(`${MID(seq.map((x, j) => j === i ? '（　）' : x).join('　'))}<br>（　）に はいる かずは？`, ans, `o${s}.${i}`); },
    `${MID('1 2 3 4 5 6 7 8 9 10')}<br>じゅんばんに いえるかな。`, TYPE);
})();
