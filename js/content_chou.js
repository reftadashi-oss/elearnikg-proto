// 音楽：調（ちょう）の 単元（2026年11月19日）。content_more2.js の あとに 読む（音楽の シリーズに 足す）。
//   x2m-16 調号と 調（ハ・ト・ヘ長調）／x2m-17 主音／x2m-18 調号と 調（♯・♭ 2つまで）／x2l-6 長調・短調を 聞く
// 問題は プログラムが 作る。本や 過去問からは 写していない。文と 学年は Claude の案（仮。先生が 確かめる）。
// ふりがなは「漢字(よみ)」と 書いて、F で {漢字|よみ} に なおす。
(() => {
  const mus = SUBJECTS.find(s => s.id === 'x2'); if (!mus || typeof MSYM === 'undefined') return;
  const musS = mus.series.find(s => s.id === 'x2m'), lisS = mus.series.find(s => s.id === 'x2l');
  const pick = a => a[rand(0, a.length - 1)];
  const F = s => typeof s !== 'string' ? s : s.replace(/([一-鿿々]+)\(([ぁ-ゟ]+)\)/g, '{$1|$2}');
  const CHOOSE = 'こたえの 番号(ばんごう)を テンキーで いれよう。';
  const choice = (stem, opts, correct, key, extra) => { const o = shuffle(opts); return Object.assign({ key: (key || stem) + '#' + correct, text: F(`${stem}<br><span class="ch">${o.map((x, i) => `<b>${i + 1}</b> ${x}`).join('　')}</span>`), boxes: [''], answer: [o.indexOf(correct) + 1] }, extra || {}); };
  const ten = fns => () => {
    const m = new Map();
    for (let i = 0; i < 300 && m.size < 10; i++) { const x = pick(fns)(); if (x && !m.has(x.key)) m.set(x.key, x); }
    const a = [...m.values()]; for (let i = 0; a.length < 10; i++) a.push(a[i]);
    return shuffle(a);
  };
  const add = (se, id, name, grade, fns, lecture) => {
    UNITS[id] = { id, subject: 'x2', series: se.id, name: F(name), col: '音楽', pass: 0.8, grade, make: ten(fns), lecture: lecture.map(F) };
    let at = se.units.findIndex(u => /^(weak|all)-/.test(u)); if (at < 0) at = se.units.length;
    se.units.splice(at, 0, id);
  };

  // ---- 五線と 調号 ----
  // p＝ドから 上へ いくつめの 音か（0＝下の ド、2＝ミ（いちばん 下の 線）、10＝上の ファ（いちばん 上の 線））
  const Y = p => 112 - p * 8;
  const SH = [10, 7, 11, 8, 5, 9, 6], FL = [6, 9, 5, 8, 4, 7, 3];   // ♯は ファ・ド・ソ・レ…、♭は シ・ミ・ラ・レ…の じゅん
  // ♯と ♭は 線で かく（文字だと フォントで 高さが ずれる）。y＝その 音の 線（間）の まん中
  const SHARP = (x, y) => `<g stroke="currentColor" fill="none"><path d="M${x - 3} ${y - 12}V${y + 13}M${x + 3} ${y - 13}V${y + 12}" stroke-width="1.5"/><path d="M${x - 7} ${y - 2}L${x + 7} ${y - 6}M${x - 7} ${y + 6}L${x + 7} ${y + 2}" stroke-width="3.5"/></g>`;
  const FLAT = (x, y) => `<g stroke="currentColor" fill="none" stroke-width="1.6"><path d="M${x - 4} ${y - 22}V${y + 6}"/><path d="M${x - 4} ${y + 6}C${x + 6} ${y + 1} ${x + 8} ${y - 7} ${x - 4} ${y - 2}" stroke-width="2.4"/></g>`;
  // sig＝＋なら ♯の 数、−なら ♭の 数。note＝音符を 1つ かく 位置（なければ 調号だけ）
  const kStaff = (sig, note, w = 200) => {
    const lines = [0, 1, 2, 3, 4].map(i => `<line x1="10" x2="${w - 6}" y1="${32 + i * 16}" y2="${32 + i * 16}" stroke="currentColor" stroke-width="1.5"/>`).join('');
    const acc = [...Array(Math.abs(sig))].map((_, i) => sig > 0
      ? SHARP(66 + i * 14, Y(SH[i])) : FLAT(64 + i * 13, Y(FL[i]))).join('');
    let n = '';
    if (note !== undefined) {
      const y = Y(note), x = w - 50;
      n = (note <= 0 ? `<line x1="${x - 18}" x2="${x + 18}" y1="${Y(0)}" y2="${Y(0)}" stroke="currentColor" stroke-width="1.5"/>` : '')
        + `<ellipse cx="${x}" cy="${y}" rx="10" ry="7.5" fill="currentColor"/>`
        + (note >= 6 ? `<line x1="${x - 9}" x2="${x - 9}" y1="${y}" y2="${y + 40}" stroke="currentColor" stroke-width="2"/>` : `<line x1="${x + 9}" x2="${x + 9}" y1="${y}" y2="${y - 40}" stroke="currentColor" stroke-width="2"/>`);
    }
    return `<svg viewBox="0 0 ${w} 124" style="width:${w}px;max-width:100%;vertical-align:middle;display:inline-block" role="img" aria-label="五線">${lines}${MSYM.G('currentColor', 'translate(0 11) scale(1.4)')}${acc}${n}</svg>`;
  };

  // 調の データ：名前・調号・主音の 音名・主音の 位置
  const K = {
    ハ長調: { s: 0, t: 'ハ', p: 0 }, ト長調: { s: 1, t: 'ト', p: 4 }, ヘ長調: { s: -1, t: 'ヘ', p: 3 },
    ニ長調: { s: 2, t: 'ニ', p: 1 }, 変ロ長調: { s: -2, t: '変(へん)ロ', p: 6 }, イ短調: { s: 0, t: 'イ', p: 5 },
  };
  const sigName = s => s === 0 ? 'なし' : `${s > 0 ? '♯' : '♭'} ${Math.abs(s)}つ`;
  const yomi = { ハ長調: 'ハ長調(ちょうちょう)', ト長調: 'ト長調(ちょうちょう)', ヘ長調: 'ヘ長調(ちょうちょう)', ニ長調: 'ニ長調(ちょうちょう)', 変ロ長調: '変(へん)ロ長調(ちょうちょう)', イ短調: 'イ短調(たんちょう)' };
  const Q = keys => [
    // 調号を 見て 調を こたえる
    () => { const k = pick(keys), o = shuffle(keys.filter(x => x !== k)).slice(0, 2); return choice(`${kStaff(K[k].s)}<br>この 調号(ちょうごう)の 長調(ちょうちょう)は？`, [k, ...o].map(x => yomi[x]), yomi[k], 'a' + k); },
    // 調を 見て 調号を えらぶ（五線）
    () => { const k = pick(keys), o = shuffle(keys.filter(x => x !== k)).slice(0, 2); return choice(`${yomi[k]}の 調号(ちょうごう)は どれ？`, [k, ...o].map(x => kStaff(K[x].s, undefined, 130)), kStaff(K[k].s, undefined, 130), 'b' + k); },
    // 調を 見て 調号を ことばで
    () => { const k = pick(keys), all = [...new Set(keys.map(x => K[x].s).concat([1, -1, 0]))], o = shuffle(all.filter(s => s !== K[k].s)).slice(0, 2); return choice(`${yomi[k]}の 調号(ちょうごう)は？`, [K[k].s, ...o].map(sigName), sigName(K[k].s), 'c' + k); },
  ];
  const sigLec = `調号(ちょうごう)は、ト音記号(おんきごう)の すぐ 右(みぎ)に ある ♯や ♭。曲(きょく)の あいだ ずっと、その 高(たか)さの 音(おと)に ♯や ♭が つくよ。`;

  // ① 調号と 調（ハ・ト・ヘ長調）
  add(musS, 'x2m-16', '調(ちょう)と 調号(ちょうごう)（ハ・ト・ヘ長調(ちょうちょう)）', 5, Q(['ハ長調', 'ト長調', 'ヘ長調']), [
    `${sigLec}<br>${kStaff(0, undefined, 120)} ${kStaff(1, undefined, 120)} ${kStaff(-1, undefined, 120)}<br>左(ひだり)から ハ長調(ちょうちょう)（なし）、ト長調(ちょうちょう)（♯1つ）、ヘ長調(ちょうちょう)（♭1つ）。`,
    `ト長調(ちょうちょう)の ♯は ファの 高(たか)さ（いちばん 上(うえ)の 線(せん)）。ヘ長調(ちょうちょう)の ♭は シの 高(たか)さ（まん中(なか)の 線(せん)）。<br>${CHOOSE}`]);

  // ② 主音
  const TON = ['ハ長調', 'ト長調', 'ヘ長調', 'イ短調'], NM = ['ハ', 'ニ', 'ホ', 'ヘ', 'ト', 'イ', 'ロ'];
  add(musS, 'x2m-17', '主音(しゅおん)', 5, [
    () => { const k = pick(TON), o = shuffle(NM.filter(x => x !== K[k].t)).slice(0, 2); return choice(`${yomi[k]}の 主音(しゅおん)は？`, [K[k].t, ...o], K[k].t, 'a' + k); },
    () => { const k = pick(['ハ長調', 'ト長調', 'ヘ長調']), ps = shuffle([0, 1, 2, 3, 4, 5, 6].filter(p => p !== K[k].p)).slice(0, 2);
      return choice(`${yomi[k]}の 主音(しゅおん)は どれ？`, [K[k].p, ...ps].map(p => kStaff(K[k].s, p, 150)), kStaff(K[k].s, K[k].p, 150), 'b' + k + ps.join('')); },
    () => { const [s, c, w] = pick([['長調(ちょうちょう)', 'ド', ['ラ', 'ソ']], ['短調(たんちょう)', 'ラ', ['ド', 'ミ']]]); return choice(`${s}の 主音(しゅおん)を ドレミで いうと？`, [c, ...w], c, 'c' + s); },
    () => { const k = pick(TON), o = shuffle(TON.filter(x => x !== k)).slice(0, 2); return choice(`主音(しゅおん)が「${K[k].t}」の ${k.includes('短') ? '短調(たんちょう)' : '長調(ちょうちょう)'}は？`, [k, ...o].map(x => yomi[x]), yomi[k], 'd' + k); },
  ], [
    `主音(しゅおん)は、その 調(ちょう)の 中心(ちゅうしん)に なる 音(おと)。曲(きょく)は 主音(しゅおん)で おわる ことが 多(おお)いよ。<br>長調(ちょうちょう)の 主音(しゅおん)は「ド」、短調(たんちょう)の 主音(しゅおん)は「ラ」と 歌(うた)う 音(おと)。`,
    `調(ちょう)の 名前(なまえ)の はじめの 字(じ)が 主音(しゅおん)の 音名(おんめい)。<br>ハ長調(ちょうちょう)→ハ、ト長調(ちょうちょう)→ト、ヘ長調(ちょうちょう)→ヘ、イ短調(たんちょう)→イ。<br>${CHOOSE}`]);

  // ③ 調号と 調（♯・♭ 2つまで）
  const K5 = ['ハ長調', 'ト長調', 'ニ長調', 'ヘ長調', '変ロ長調'];
  add(musS, 'x2m-18', '調(ちょう)と 調号(ちょうごう)（♯・♭ 2つまで）', 7, [...Q(K5),
    () => { const k = pick(K5.slice(1)), o = shuffle(NM.filter(x => x !== K[k].t.replace(/変\(へん\)/, ''))).slice(0, 2).map(x => x === 'ロ' ? '変(へん)ロ' : x); return choice(`${kStaff(K[k].s)}<br>この 調号(ちょうごう)の 長調(ちょうちょう)の 主音(しゅおん)は？`, [K[k].t, ...o], K[k].t, 'e' + k); },
  ], [
    `${sigLec}<br>${kStaff(1, undefined, 120)} ${kStaff(2, undefined, 120)}<br>♯1つ：ト長調(ちょうちょう)、♯2つ：ニ長調(ちょうちょう)。`,
    `${kStaff(-1, undefined, 120)} ${kStaff(-2, undefined, 120)}<br>♭1つ：ヘ長調(ちょうちょう)、♭2つ：変(へん)ロ長調(ちょうちょう)。`,
    `主音(しゅおん)の 見(み)つけ方(かた)<br>・♯の 調(ちょう)：いちばん 右(みぎ)の ♯の すぐ 上(うえ)の 音(おと)。<br>・♭の 調(ちょう)：右(みぎ)から 2つめの ♭の 音(おと)（♭1つの ときは ヘ）。<br>${CHOOSE}`]);

  // ④ 長調・短調を 聞く（音は Snd。content_more.js）
  const MAJ = [0, 2, 4, 5, 7, 9, 11, 12], MIN = [0, 2, 3, 5, 7, 8, 11, 12];   // 短調は 和声的短音階
  const hz = s => 261.63 * Math.pow(2, s / 12);
  const MJ = '長調(ちょうちょう)（明(あか)るい）', MN = '短調(たんちょう)（暗(くら)い）';
  add(lisS, 'x2l-6', '長調(ちょうちょう)・短調(たんちょう)を 聞(き)く', 5, [
    () => {
      const minor = Math.random() < 0.5, root = rand(-3, 4), sc = minor ? MIN : MAJ, type = rand(0, 2);
      const pat = [[0, 1, 2, 3, 4, 5, 6, 7], [0, 2, 4, 7, 4, 2, 0], [0, 2, 1, 3, 2, 4, 0]][type];
      const seq = pat.map((d, i) => [hz(root + sc[d]), i === pat.length - 1 ? 1.5 : 0.5, 0.5]);
      return choice('音(おと)を 聞(き)こう。長調(ちょうちょう)かな、短調(たんちょう)かな？', [MJ, MN], minor ? MN : MJ, `m${type}.${root}.${minor}`, { sound: seq });
    },
  ], [
    `長調(ちょうちょう)は 明(あか)るい かんじ、短調(たんちょう)は 暗(くら)い・さびしい かんじに 聞(き)こえるよ。<br><button class="big" onclick='window.Snd&&Snd.play(${JSON.stringify(MAJ.map(s => [+hz(s).toFixed(2), 0.5, 0.5]))})'>▶ 長調(ちょうちょう)</button> <button class="big" onclick='window.Snd&&Snd.play(${JSON.stringify(MIN.map(s => [+hz(s).toFixed(2), 0.5, 0.5]))})'>▶ 短調(たんちょう)</button>`,
    `音(おと)が 出(で)るよ。もう一度(いちど) 聞(き)く ときは「きく」ボタン。<br>${CHOOSE}`]);
})();
