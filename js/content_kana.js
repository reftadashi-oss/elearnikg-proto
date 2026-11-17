// ひらがな・カタカナ（2026年11月17日 社長）。年長・年少の 子も つかうので、もじが よめなくても できる 問題（おなじ かたち・え）から はじめる。
// 問題文は ぜんぶ ひらがな（かんじ なし）。え は 絵文字。ことばと 絵の くみあわせは Claude の 案（仮。先生が 確かめる）。
(() => {
  const pick = a => a[rand(0, a.length - 1)];
  const BIG = s => `<span style="font-size:2.4em;line-height:1.3">${s}</span>`;
  const MID = s => `<span style="font-size:1.5em">${s}</span>`;
  const CHOOSE = 'こたえの ばんごうを えらぼう。';
  const choice = (stem, opts, correct, key) => { const o = shuffle([...new Set(opts)]); return { key: key + '#' + correct, text: `${stem}<br><span class="ch">${o.map((x, i) => `<b>${i + 1}</b> ${MID(x)}`).join('　')}</span>`, boxes: [''], answer: [o.indexOf(correct) + 1] }; };
  const ten = pool => () => { const m = new Map(); for (let i = 0; i < 400 && m.size < 10; i++) { const x = pick(pool)(); if (x && !m.has(x.key)) m.set(x.key, x); } const a = [...m.values()]; for (let i = 0; a.length < 10; i++) a.push(a[i]); return shuffle(a); };
  const subj = { id: 'x7', name: 'ひらがな・カタカナ', series: [] };
  SUBJECTS.unshift(subj);
  REPORT_COLUMNS.push({ subject: 'ひらがな・カタカナ', cols: ['ひらがな', 'カタカナ'] });
  const sH = { id: 'x7h', name: 'ひらがな', units: [] }, sK = { id: 'x7k', name: 'カタカナ', units: [] };
  subj.series.push(sH, sK);
  const add = (se, col, name, pool, ...lecture) => { const id = `${se.id}-${se.units.length + 1}`; UNITS[id] = { id, subject: 'x7', series: se.id, name, col, pass: 0.8, make: ten(pool), lecture, grade: 1 }; se.units.push(id); };
  const kata = s => s.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));

  // ---- もじと え ----
  const ROWS = ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの', 'はひふへほ', 'まみむめも', 'やゆよ', 'らりるれろ', 'わをん'];
  const ALL = ROWS.join('');
  const EMO = { あ: ['あり', '🐜'], い: ['いぬ', '🐶'], う: ['うし', '🐄'], え: ['えび', '🦐'], お: ['おにぎり', '🍙'], か: ['かさ', '☂️'], き: ['きつね', '🦊'], く: ['くるま', '🚗'], け: ['けむし', '🐛'], こ: ['こあら', '🐨'],
    さ: ['さかな', '🐟'], し: ['しか', '🦌'], す: ['すいか', '🍉'], そ: ['そり', '🛷'], た: ['たまご', '🥚'], ち: ['ちょう', '🦋'], つ: ['つき', '🌙'], て: ['て', '✋'], と: ['とり', '🐦'], な: ['なす', '🍆'], に: ['にんじん', '🥕'], ね: ['ねこ', '🐱'],
    は: ['はな', '🌸'], ひ: ['ひこうき', '✈️'], ふ: ['ふね', '🚢'], へ: ['へび', '🐍'], ほ: ['ほし', '⭐'], み: ['みかん', '🍊'], め: ['めがね', '👓'], も: ['もも', '🍑'], や: ['やま', '⛰️'], ゆ: ['ゆきだるま', '⛄'], ら: ['らいおん', '🦁'], り: ['りんご', '🍎'], れ: ['れもん', '🍋'], わ: ['わに', '🐊'] };
  // かたちの にた もじ（おなじ もじを えらぶ 問題の まちがい）
  const NITA = { あ: 'おめ', い: 'りこ', う: 'つら', え: 'んる', お: 'あむ', か: 'やな', き: 'さち', く: 'へし', け: 'はほ', こ: 'いに', さ: 'きち', し: 'つく', す: 'むお', せ: 'まも', そ: 'てろ', た: 'なに', ち: 'さら', つ: 'しう', て: 'そこ', と: 'こし',
    な: 'たは', に: 'こた', ぬ: 'めね', ね: 'れわ', の: 'めあ', は: 'ほけ', ひ: 'いへ', ふ: 'うみ', へ: 'くひ', ほ: 'はま', ま: 'もほ', み: 'よろ', む: 'すお', め: 'ぬあ', も: 'まし', や: 'かせ', ゆ: 'よち', よ: 'ゆま', ら: 'ちう', り: 'いけ', る: 'ろえ', れ: 'わね', ろ: 'るそ', わ: 'れね', を: 'おと', ん: 'えそ' };
  const others = (list, x, n = 2) => shuffle(list.filter(y => y !== x)).slice(0, n);

  // ひらがなの 問題
  const same = c => () => choice(`${BIG(c)}<br>おなじ もじは どれ？`, [c, ...NITA[c]], c, 's' + c);
  const start = (c, cs) => EMO[c] && (() => { const ws = cs.filter(x => x !== c && EMO[x] && EMO[x][0][0] !== c); if (ws.length < 2) return null; return choice(`${BIG(c)}<br>「${c}」で はじまる ものは どれ？`, [EMO[c][1], ...others(ws, null).map(x => EMO[x][1])], EMO[c][1], 'b' + c); });
  const name = (c, cs) => EMO[c] && (() => { const ws = cs.filter(x => x !== c && EMO[x]); if (ws.length < 2) return null; return choice(`${BIG(EMO[c][1])}<br>これは なに？`, [EMO[c][0], ...others(ws, null).map(x => EMO[x][0])], EMO[c][0], 'n' + c); });
  const order = row => () => { const i = rand(0, row.length - 1), c = row[i]; const s = [...row].map((x, j) => j === i ? '（　）' : x).join(' '); return choice(`${MID(s)}<br>（　）に はいる もじは？`, [c, ...others([...ALL].filter(x => !row.includes(x)), null)], c, 'o' + c); };
  const pool = (cs, rows, near) => [...cs].flatMap(c => [same(c), start(c, near), name(c, near)]).filter(Boolean).concat(rows.map(order));
  const lec = cs => `${[...cs].map(c => `${MID(c)}${EMO[c] ? `（${EMO[c][1]} ${EMO[c][0]}）` : ''}`).join('　')}`;
  const HU = [['あ', 0], ['か', 1], ['さ', 2], ['た', 3], ['な', 4], ['は', 5], ['ま', 6]];
  HU.forEach(([h, r]) => { const near = [...ROWS[r], ...ROWS[(r + 1) % 7], ...ROWS[(r + 6) % 7]].filter(x => EMO[x]);
    add(sH, 'ひらがな', `ひらがな「${h}」の ぎょう`, pool(ROWS[r], [ROWS[r]], near), `「${h}」の ぎょうの もじを おぼえよう。<br>${lec(ROWS[r])}`, `① おなじ かたちの もじを さがそう。<br>② その もじで はじまる え を さがそう。<br>${CHOOSE}`); });
  const YRW = 'やゆよらりるれろわをん';
  add(sH, 'ひらがな', 'ひらがな「や」「ら」「わ」の ぎょう', pool(YRW, [ROWS[7], ROWS[8], ROWS[9]], [...YRW, ...ROWS[0], ...ROWS[6]].filter(x => EMO[x])),
    `${lec(ROWS[7])}<br>${lec(ROWS[8])}<br>${lec(ROWS[9])}`, `「を」は「おにぎり を たべる」の ように、ことばと ことばの あいだで つかうよ。<br>${CHOOSE}`);

  // てんてん・まる
  const DAKU = { か: 'が', き: 'ぎ', く: 'ぐ', け: 'げ', こ: 'ご', さ: 'ざ', し: 'じ', す: 'ず', せ: 'ぜ', そ: 'ぞ', た: 'だ', ち: 'ぢ', つ: 'づ', て: 'で', と: 'ど', は: 'ば', ひ: 'び', ふ: 'ぶ', へ: 'べ', ほ: 'ぼ' };
  const HANDAKU = { は: 'ぱ', ひ: 'ぴ', ふ: 'ぷ', へ: 'ぺ', ほ: 'ぽ' };
  const DW = [['ぶどう', '🍇', 'ふとう', 'ぷどう'], ['ぞう', '🐘', 'そう', 'ぞお'], ['じてんしゃ', '🚲', 'してんしゃ', 'じでんしゃ'], ['でんしゃ', '🚃', 'てんしゃ', 'でんじゃ'], ['どんぐり', '🌰', 'とんくり', 'どんくり'], ['ぼうし', '🧢', 'ほうし', 'ぽうし'], ['ごはん', '🍚', 'こはん', 'ごばん'], ['だんご', '🍡', 'たんこ', 'だんこ'], ['えんぴつ', '✏️', 'えんひつ', 'えんびつ'], ['がっこう', '🏫', 'かっこう', 'がっごう']];
  add(sH, 'ひらがな', 'てんてん（゛）と まる（゜）', [
    ...Object.entries(DAKU).map(([a, b]) => () => choice(`${BIG(a)}<br>「${a}」に てんてん（゛）を つけると？`, [b, a, HANDAKU[a] || DAKU[pick(Object.keys(DAKU).filter(x => x !== a))]], b, 'd' + a)),
    ...Object.entries(HANDAKU).map(([a, b]) => () => choice(`${BIG(a)}<br>「${a}」に まる（゜）を つけると？`, [b, DAKU[a], a], b, 'h' + a)),
    ...DW.map(([w, e, x, y]) => () => choice(`${BIG(e)}<br>ただしい ことばは どれ？`, [w, x, y], w, 'w' + w))],
    `もじの みぎうえに「てんてん（゛）」を つけると、おとが かわるよ。<br>${MID('か → が　さ → ざ　た → だ　は → ば')}`, `「は ひ ふ へ ほ」には「まる（゜）」も つくよ。<br>${MID('は → ぱ　ひ → ぴ　ふ → ぷ')}<br>${DW.slice(0, 5).map(([w, e]) => `${e} ${w}`).join('　')}<br>${CHOOSE}`);

  // ちいさい「ゃ ゅ ょ っ」
  const SW = [['でんしゃ', '🚃', 'でんしや'], ['じてんしゃ', '🚲', 'じてんしや'], ['ちょう', '🦋', 'ちよう'], ['きゅうきゅうしゃ', '🚑', 'きゆうきゆうしや'], ['しょうぼうしゃ', '🚒', 'しようぼうしや'], ['きょうりゅう', '🦕', 'きようりゆう'], ['おもちゃ', '🪀', 'おもちや'], ['しゃしん', '📷', 'しやしん'], ['きって', '✉️', 'きつて'], ['らっこ', '🦦', 'らつこ'], ['がっこう', '🏫', 'がつこう']];
  add(sH, 'ひらがな', 'ちいさい「ゃ ゅ ょ っ」', SW.map(([w, e, x]) => () => choice(`${BIG(e)}<br>ただしい かきかたは どれ？`, [w, x, w.replace(/[ゃゅょっ]/g, '')], w, 'y' + w)),
    `ちいさく かく もじが あるよ。<br>${MID('しゃ　しゅ　しょ')}（${'🚃'} でんしゃ）<br>${MID('っ')}（つまる おと：${'🦦'} らっこ）`, `ちいさい もじは、ますの みぎうえに かくよ。<br>${SW.slice(0, 6).map(([w, e]) => `${e} ${w}`).join('　')}<br>${CHOOSE}`);
  add(sH, 'ひらがな', 'ひらがな まとめ', [...[...ALL].map(same), ...Object.keys(EMO).map(c => name(c, Object.keys(EMO))), ...Object.keys(EMO).map(c => start(c, Object.keys(EMO))), ...ROWS.map(order)].filter(Boolean),
    `${ROWS.map(r => MID([...r].join(' '))).join('<br>')}`, `ぜんぶの ひらがなが でるよ。<br>${CHOOSE}`);

  // ================= カタカナ =================
  const KNITA = { シ: 'ツミ', ツ: 'シソ', ソ: 'ンリ', ン: 'ソノ', ク: 'ケタ', ケ: 'クナ', タ: 'クヌ', ウ: 'ワフ', ワ: 'ウフ', フ: 'ヲラ', ヌ: 'スメ', ス: 'ヌネ', マ: 'アム', ア: 'マヤ', ル: 'レノ', レ: 'ルノ', チ: 'テナ', テ: 'チラ', ナ: 'メチ', ノ: 'ソメ', コ: 'ユヨ', ユ: 'コヨ', ヨ: 'ユヲ', ロ: 'コヨ', ヲ: 'ヨフ', ラ: 'テフ' };
  const kn = (k, cs) => KNITA[k] ? [...KNITA[k]] : others([...cs].map(kata).filter(x => x !== k), null);
  const toK = (c, cs) => () => { const k = kata(c); return choice(`${BIG(c)}<br>「${c}」を カタカナで かくと？`, [k, ...kn(k, cs)], k, 'k' + c); };
  const toH = (c, cs) => () => { const k = kata(c); return choice(`${BIG(k)}<br>この カタカナの よみかたは？`, [c, ...others([...cs].filter(x => x !== c), null)], c, 'r' + c); };
  const KW = [['パン', '🍞'], ['バナナ', '🍌'], ['ケーキ', '🍰'], ['テレビ', '📺'], ['ピアノ', '🎹'], ['ピザ', '🍕'], ['バス', '🚌'], ['タクシー', '🚕'], ['トマト', '🍅'], ['メロン', '🍈'], ['ラーメン', '🍜'], ['ロケット', '🚀'], ['ヨット', '⛵'], ['ペンギン', '🐧'], ['ギター', '🎸'], ['カメラ', '📷'], ['キリン', '🦒'], ['クッキー', '🍪'], ['ハンバーガー', '🍔'], ['アイスクリーム', '🍦'], ['スプーン', '🥄'], ['シャツ', '👕'], ['ゴリラ', '🦍'], ['ノート', '📓']];
  const kword = ([w, e]) => () => choice(`${BIG(e)}<br>これは なに？`, [w, ...others(KW.map(x => x[0]).filter(x => x[0] !== w[0]), null)], w, 'q' + w);
  const KA = ROWS.slice(0, 5).join(''), KH = ROWS.slice(5).join('');
  add(sK, 'カタカナ', 'カタカナ①（ア〜ノ）', [...[...KA].map(c => toK(c, KA)), ...[...KA].map(c => toH(c, KA))],
    `ひらがなと カタカナを くらべよう。<br>${ROWS.slice(0, 5).map(r => `${MID([...r].join(' '))} → ${MID([...kata(r)].join(' '))}`).join('<br>')}`, `カタカナは、そとの くにから きた ことばなどに つかうよ（🍞 パン）。<br>${CHOOSE}`);
  add(sK, 'カタカナ', 'カタカナ②（ハ〜ン）', [...[...KH].map(c => toK(c, KH)), ...[...KH].map(c => toH(c, KH))],
    `${ROWS.slice(5).map(r => `${MID([...r].join(' '))} → ${MID([...kata(r)].join(' '))}`).join('<br>')}`, `${CHOOSE}`);
  const PAIRS = [['し', 'つ'], ['そ', 'ん'], ['く', 'け'], ['う', 'わ'], ['ぬ', 'す'], ['あ', 'ま'], ['る', 'れ'], ['ち', 'て'], ['こ', 'ゆ'], ['の', 'め']];
  add(sK, 'カタカナ', 'にて いる カタカナ', PAIRS.flatMap(([a, b]) => [() => choice(`${BIG(a)}<br>「${a}」の カタカナは どれ？`, [kata(a), kata(b), ...kn(kata(a), ALL).filter(x => x !== kata(b)).slice(0, 1)], kata(a), 'p' + a), () => choice(`${BIG(b)}<br>「${b}」の カタカナは どれ？`, [kata(b), kata(a), ...kn(kata(b), ALL).filter(x => x !== kata(a)).slice(0, 1)], kata(b), 'p' + b)]),
    `かたちの にて いる カタカナに きを つけよう。<br>${MID('シ（し）と ツ（つ）')}：シ は てんが ひだりに ならぶ、ツ は うえに ならぶ<br>${MID('ソ（そ）と ン（ん）')}：ソ は うえから、ン は ひだりから`, `${PAIRS.map(([a, b]) => `${kata(a)}（${a}）・${kata(b)}（${b}）`).join('　')}<br>${CHOOSE}`);
  const LW = [['ケーキ', '🍰', 'ケエキ', 'ケキ'], ['ラーメン', '🍜', 'ラアメン', 'ラメン'], ['タクシー', '🚕', 'タクシイ', 'タクシ'], ['ノート', '📓', 'ノオト', 'ノト'], ['クッキー', '🍪', 'クツキー', 'クキー'], ['ロケット', '🚀', 'ロケツト', 'ロケト'], ['シャツ', '👕', 'シヤツ', 'サツ'], ['ギター', '🎸', 'キター', 'ギタ'], ['バス', '🚌', 'ハス', 'パス'], ['ペンギン', '🐧', 'ヘンギン', 'ベンギン'], ['ピザ', '🍕', 'ヒサ', 'ビザ'], ['ハンバーガー', '🍔', 'ハンハーカー', 'ハンバガー']];
  add(sK, 'カタカナ', 'のばす おと（ー）・てんてん・ちいさい もじ', LW.map(([w, e, x, y]) => () => choice(`${BIG(e)}<br>ただしい かきかたは どれ？`, [w, x, y], w, 'l' + w)),
    `カタカナでは、のばす おとを「ー」で かくよ。<br>${MID('ケーキ　ラーメン　ノート')}`, `てんてん・まる・ちいさい もじは、ひらがなと おなじ。<br>${MID('バス　ピザ　シャツ　ロケット')}<br>${CHOOSE}`);
  add(sK, 'カタカナ', 'カタカナの ことば', KW.map(kword), `${KW.slice(0, 12).map(([w, e]) => `${e} ${w}`).join('　')}`, `${KW.slice(12).map(([w, e]) => `${e} ${w}`).join('　')}<br>${CHOOSE}`);
})();
