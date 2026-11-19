// 算数の 足りない 内容と、練習が 少ない ところを 足す（2026年11月19日）。content_tokushu.js の あとに 読む。
// 足りない 内容：1年 ひろさくらべ・えグラフ、2年 ひょうと グラフ、3年 そろばん・三角形と 角、4年 そろばん・分度器・180°より 大きい 角・簡単な 割合。
// 薄い ところ：3年 わり算、4年 わり算、5年 小数の かけ算・わり算、6年 分数の かけ算・わり算。
// どの 学年に 入れるかは、Claude が 覚えている 学習指導要領に もとづく 案（仮。先生が 確かめる）。
// 問題は プログラムが 作り、答えも プログラムが 計算する。本や 過去問からは 写していない。
(() => {
  const M = SUBJECTS.find(s => s.id === 'math'); if (!M) return;
  const pick = a => a[rand(0, a.length - 1)];
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const red = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
  const dec = (n, p) => { const s = String(Math.abs(n)).padStart(p + 1, '0'), i = s.slice(0, s.length - p), fr = s.slice(s.length - p).replace(/0+$/, ''); return (n < 0 ? '-' : '') + i + (fr ? '.' + fr : ''); };
  const retry = g => () => { for (let i = 0; i < 2000; i++) { const x = g(); if (x) return x; } return null; };
  // 漢字(よみ) → {漢字|よみ}
  const f = s => String(s).replace(/([一-鿿々]+)\(([ぁ-ゖー]+)\)/g, '{$1|$2}');
  const wp = s => `<span class="wp">${s}</span>`;
  const big = s => `<span class="big">${s}</span>`;
  const q = (text, ans) => ({ key: text, text: f(text), boxes: [''], answer: [ans] });
  const rem = (text, a, b) => ({ key: text, text: f(text), boxes: ['', 'あまり'], answer: [a, b] });
  const qf = (text, n, d) => ({ key: text, text: f(text), boxes: ['{分子|ぶんし}', '{分母|ぶんぼ}'], answer: [n, d] });
  const frA = (text, n, d) => { [n, d] = red(n, d); return d === 1 ? q(text, n) : qf(text, n, d); };
  const fr = (n, d) => `<span class="fr"><i>${n}</i><i>${d}</i></span>`;
  const mx = (w, n, d) => `${w}${fr(n, d)}`;
  const choice = (stem, opts, correct) => { const o = shuffle([...new Set(opts)]); return { key: stem + '#' + correct, text: f(`${stem}<br><span class="ch">${o.map((x, i) => `<b>${i + 1}</b> ${x}`).join('　')}</span>`), boxes: [''], answer: [o.indexOf(correct) + 1] }; };
  const ENTER = 'こたえを テンキーで いれて、Enterを おそう。';
  const CHOOSE = 'こたえの 番号(ばんごう)を テンキーで いれよう。';
  const REM = '商(しょう)を いれて Enter、あまりを いれて Enter。';
  const FRA = '分子(ぶんし)を いれて Enter、分母(ぶんぼ)を いれて Enter。答(こた)えが 整数(せいすう)の ときは、その 数(かず)だけ いれよう。';
  const ten = gen => () => {
    let arr = [];
    for (let t = 0; t < 40; t++) {
      const m = new Map();
      for (let i = 0; i < 400 && m.size < 30; i++) { const x = gen(); if (x && !m.has(x.key)) m.set(x.key, x); }
      const base = shuffle([...m.values()]);
      arr = base.slice(0, 10); for (let i = 0; arr.length < 10; i++) arr.push(base[i % base.length]);
      arr = shuffle(arr);
      const cnt = {}; arr.forEach(x => { const k = x.answer.join('/'); cnt[k] = (cnt[k] || 0) + 1; });
      if (Math.max(...Object.values(cnt)) <= 6) return arr;
    }
    return arr;
  };
  let seq = 0;
  // シリーズ sid の after の うしろに 足す（after が ない ときは さいご）
  const add = (sid, after, grade, list) => {
    const se = M.series.find(x => x.id === sid); if (!se) return;
    let at = se.units.indexOf(after) + 1; if (at === 0) at = se.units.length;
    const ids = list.map(([name, gen, ...lecture]) => {
      const id = `${sid}-h${++seq}`;
      UNITS[id] = { id, subject: 'math', series: sid, name: f(name), col: se.units[0] && UNITS[se.units[0]] ? UNITS[se.units[0]].col : '', pass: 0.8, make: ten(gen), lecture: lecture.map(f), grade };
      return id;
    });
    se.units.splice(at, 0, ...ids);
  };
  const SVG = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" style="display:block;margin:0 auto 6px;max-width:100%">${body}</svg>`;
  const T = (x, y, s, o = '') => `<text x="${x}" y="${y}" text-anchor="middle" font-size="13" ${o}>${s}</text>`;

  // ---------- 図の 部品 ----------
  // ますの 図（あ・い）
  const masu = (a, b) => {
    const C = 18, x2 = a[0] * C + 40, W = x2 + b[0] * C + 10, H = Math.max(a[1], b[1]) * C + 26;
    const cells = (w, h, x0, fill) => { let s = ''; for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) s += `<rect x="${x0 + i * C}" y="${20 + j * C}" width="${C}" height="${C}" fill="${fill}" stroke="#333"/>`; return s; };
    return SVG(W, H, T(10 + a[0] * C / 2, 14, 'あ', 'font-weight="bold"') + cells(a[0], a[1], 10, '#cfe0f6') + T(x2 + b[0] * C / 2, 14, 'い', 'font-weight="bold"') + cells(b[0], b[1], x2, '#f6e0b5'));
  };
  // えグラフ・○の グラフ
  const ICON = {
    ci: (x, y) => `<circle cx="${x}" cy="${y}" r="8" fill="#e57373" stroke="#333"/>`,
    sq: (x, y) => `<rect x="${x - 8}" y="${y - 8}" width="16" height="16" fill="#ffb74d" stroke="#333"/>`,
    tri: (x, y) => `<polygon points="${x},${y - 9} ${x + 9},${y + 8} ${x - 9},${y + 8}" fill="#9fc5e8" stroke="#333"/>`,
    di: (x, y) => `<polygon points="${x},${y - 9} ${x + 9},${y} ${x},${y + 9} ${x - 9},${y}" fill="#b7d7a8" stroke="#333"/>`,
    ma: (x, y) => `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="#333" stroke-width="2"/>`,
  };
  const graph = (items, mark) => {   // items：[なまえ, かず, 形]
    const CW = 70, W = items.length * CW + 20, top = 10, maxN = Math.max(...items.map(x => x[1])), H = top + maxN * 20 + 30;
    let s = `<line x1="10" y1="${H - 24}" x2="${W - 10}" y2="${H - 24}" stroke="#333" stroke-width="2"/>`;
    items.forEach(([nm, n, k], i) => { const cx = 10 + CW * i + CW / 2; for (let j = 0; j < n; j++) s += ICON[mark || k](cx, H - 36 - j * 20); s += T(cx, H - 8, nm); });
    return SVG(W, H, s);
  };
  // そろばん（digits：上の けたから。unit：一の位の けたの 番号）
  const abacus = (digits, unit) => {
    const n = digits.length, W = 36 * n + 24, B = '#6b4a2b';
    let s = `<rect x="4" y="4" width="${W - 8}" height="140" rx="4" fill="#f3e2c3" stroke="${B}" stroke-width="4"/>`;
    digits.forEach((d, i) => {
      const x = 24 + 36 * i, k = d % 5;
      s += `<line x1="${x}" y1="6" x2="${x}" y2="142" stroke="#8d6e4c" stroke-width="2"/>`;
      s += `<ellipse cx="${x}" cy="${d >= 5 ? 33 : 17}" rx="15" ry="8" fill="#7a4a24"/>`;
      for (let j = 0; j < 4; j++) s += `<ellipse cx="${x}" cy="${j < k ? 60 + 16 * j : 136 - 16 * (3 - j)}" rx="15" ry="7" fill="#7a4a24"/>`;
    });
    s += `<line x1="4" y1="46" x2="${W - 4}" y2="46" stroke="${B}" stroke-width="4"/>`;
    s += `<circle cx="${24 + 36 * unit}" cy="46" r="3.5" fill="#fff"/>` + T(24 + 36 * unit, 160, '▲', 'fill="#c0392b"');
    return SVG(W, 166, s);
  };
  const abDigits = (v, n) => String(v).padStart(n, '0').split('').map(Number);
  // 角（2本の 線）
  const P = (cx, cy, deg, r) => [cx + r * Math.cos(deg * Math.PI / 180), cy - r * Math.sin(deg * Math.PI / 180)].map(v => v.toFixed(1));
  const angleFig = (lab, deg, len, x0, rot) => {
    const cx = x0, cy = 120, [x1, y1] = P(cx, cy, rot, len), [x2, y2] = P(cx, cy, rot + deg, len), [a1, b1] = P(cx, cy, rot, 18), [a2, b2] = P(cx, cy, rot + deg, 18);
    return `<path d="M${x1} ${y1} L${cx} ${cy} L${x2} ${y2}" fill="none" stroke="#1f3f8f" stroke-width="3"/><path d="M${a1} ${b1} A18 18 0 0 0 ${a2} ${b2}" fill="none" stroke="#c0392b" stroke-width="2"/>` + T(cx, cy + 22, lab, 'font-weight="bold"');
  };
  // 分度器
  const prot = (a, fromLeft, reflex) => {
    const cx = 170, cy = 150, R = 130;
    let s = `<path d="M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy} Z" fill="#fdf6e3" stroke="#555"/>`;
    for (let k = 0; k <= 180; k += 5) { const [x1, y1] = P(cx, cy, k, R - (k % 10 ? 5 : 10)), [x2, y2] = P(cx, cy, k, R); s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#555"/>`; }
    for (let k = 0; k <= 180; k += 10) { const [x1, y1] = P(cx, cy, k, R - 19), [x2, y2] = P(cx, cy, k, R - 33); const e = k % 180 ? 3 : -4; if (k !== 180) s += `<text x="${x1}" y="${(+y1 + e).toFixed(1)}" text-anchor="middle" font-size="9" fill="#222">${k}</text>`; if (k !== 0) s += `<text x="${x2}" y="${(+y2 + e).toFixed(1)}" text-anchor="middle" font-size="9" fill="#1f4f8f">${180 - k}</text>`; }
    const base = fromLeft ? 180 : 0, phi = fromLeft ? 180 - a : a, [bx, by] = P(cx, cy, base, R + 12), [rx, ry] = P(cx, cy, phi, R + 12), [m1, n1] = P(cx, cy, base, 24), [m2, n2] = P(cx, cy, phi, 24);
    s += `<line x1="${cx}" y1="${cy}" x2="${bx}" y2="${by}" stroke="#c0392b" stroke-width="3"/><line x1="${cx}" y1="${cy}" x2="${rx}" y2="${ry}" stroke="#c0392b" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="3" fill="#333"/>`;
    const sweep = fromLeft ? (reflex ? 0 : 1) : (reflex ? 1 : 0);
    s += `<path d="M${m1} ${n1} A24 24 0 ${reflex ? 1 : 0} ${sweep} ${m2} ${n2}" fill="none" stroke="#2e7d32" stroke-width="2.5"/>`;
    return SVG(340, 180, s);
  };

  // ================= 1年 =================
  add('m13', 'm13-a96', 1, [
    ['ひろさくらべ（ますの かず）', retry(() => {
      const a = [rand(2, 6), rand(2, 4)], b = [rand(2, 6), rand(2, 4)], A = a[0] * a[1], B = b[0] * b[1]; if (A === B) return null;
      const fig = masu(a, b);
      return pick([
        () => q(`${fig}あは、ますが いくつ ぶん？`, A),
        () => q(`${fig}いは、ますが いくつ ぶん？`, B),
        () => choice(`${fig}ひろいのは どっち？`, ['あ', 'い'], A > B ? 'あ' : 'い'),
        () => q(`${fig}ひろい ほうは、ますが いくつ おおい？`, Math.abs(A - B)),
      ])();
    }), `ひろさは、${big('おなじ おおきさの ますが いくつ ぶん')}かで くらべるよ。`, `ますを ゆびで おさえながら かぞえよう。<br>${ENTER}`],
  ]);
  const KUDA = [['りんご', 'ci'], ['みかん', 'sq'], ['ぶどう', 'tri'], ['めろん', 'di']];
  add('m14', null, 1, [
    ['えグラフ（かずを くらべる）', retry(() => {
      const k = rand(3, 4), it = KUDA.slice(0, k).map(([nm, s]) => [nm, rand(1, 8), s]), fig = graph(it), ns = it.map(x => x[1]), mx0 = Math.max(...ns);
      const [x, y] = shuffle(it);
      return pick([
        () => q(`${fig}${x[0]}は いくつ？`, x[1]),
        () => ns.filter(n => n === mx0).length === 1 ? choice(`${fig}いちばん おおいのは どれ？`, it.map(i => i[0]), it.find(i => i[1] === mx0)[0]) : null,
        () => x[1] !== y[1] ? q(`${fig}${x[0]}と ${y[0]}の ちがいは いくつ？`, Math.abs(x[1] - y[1])) : null,
      ])();
    }), `おなじ ものを ${big('たてに ならべる')}と、どれが おおいか ひとめで わかるよ。これを えグラフと いうよ。`, `いちばん たかいのが いちばん おおい。<br>ちがいは、たかさの ちがいを かぞえよう。<br>${ENTER}`],
  ]);

  // ================= 2年 =================
  const ASOBI = [['おにごっこ', 'なわとび', 'ボール', 'ブランコ'], ['いぬ', 'ねこ', 'うさぎ', 'ハムスター'], ['あか', 'あお', 'きいろ', 'みどり']];
  const ASOBI_T = ['すきな あそび', 'すきな どうぶつ', 'すきな いろ'];
  add('m14', null, 2, [
    ['ひょうと グラフ', retry(() => {
      const t = rand(0, 2), it = ASOBI[t].map(nm => [nm, rand(1, 9)]), sum = it.reduce((s, x) => s + x[1], 0), ns = it.map(x => x[1]), mx0 = Math.max(...ns);
      const tbl = `<table style="border-collapse:collapse;margin:0 auto 6px;font-size:.8em"><tr><th style="border:1px solid #333;padding:2px 8px">${ASOBI_T[t]}</th>${it.map(x => `<th style="border:1px solid #333;padding:2px 8px">${x[0]}</th>`).join('')}</tr><tr><td style="border:1px solid #333;padding:2px 8px">人数(にんずう)（人(にん)）</td>${it.map(x => `<td style="border:1px solid #333;padding:2px 8px;text-align:center">${x[1]}</td>`).join('')}</tr></table>`;
      const fig = pick([tbl, graph(it.map(x => [x[0], x[1]]), 'ma')]), [x, y] = shuffle(it);
      return pick([
        () => q(`${fig}${ASOBI_T[t]}が 「${x[0]}」の 人(ひと)は 何人(なんにん)？`, x[1]),
        () => q(`${fig}ぜんぶで 何人(なんにん)？`, sum),
        () => x[1] !== y[1] ? q(`${fig}「${x[0]}」と 「${y[0]}」の ちがいは 何人(なんにん)？`, Math.abs(x[1] - y[1])) : null,
        () => ns.filter(n => n === mx0).length === 1 ? choice(`${fig}いちばん 多(おお)いのは どれ？`, it.map(i => i[0]), it.find(i => i[1] === mx0)[0]) : null,
      ])();
    }), `${big('ひょう')}は、数(かず)を 数字(すうじ)で まとめた もの。${big('グラフ')}は、○の たかさで 多(おお)さを あらわした もの。`, `ぜんぶの 数(かず)は ひょうの 数(かず)を たそう。<br>${ENTER}`],
  ]);

  // ================= 3年 =================
  add('m1', 'm1-a144', 3, [
    ['そろばん（数(かず)の あらわし方(かた)）', retry(() => {
      const p = pick([0, 0, 0, 1]), v = p ? rand(11, 999) : pick([rand(1, 99), rand(100, 9999)]), fig = abacus(abDigits(v, 5), 4 - p), s = dec(v, p);
      return pick([
        () => q(`${fig}▲の けたが 一(いち)の 位(くらい)です。そろばんの 数(かず)は いくつ？`, s),
        () => { const y = p ? rand(1, 9) : rand(1, 99); return q(`${fig}▲の けたが 一(いち)の 位(くらい)です。この 数(かず)に ${dec(y, p)}を たすと いくつ？`, dec(v + y, p)); },
        () => { const y = p ? rand(1, Math.min(9, v)) : rand(1, Math.min(99, v)); return q(`${fig}▲の けたが 一(いち)の 位(くらい)です。この 数(かず)から ${dec(y, p)}を ひくと いくつ？`, dec(v - y, p)); },
      ])();
    }), `そろばんの 上(うえ)の 玉(たま)は ${big('5')}、下(した)の 玉(たま)は 1つ ${big('1')}。<br>まん中(なか)の はりに くっついて いる 玉(たま)だけ 数(かぞ)えるよ。`,
      `▲の けたが 一(いち)の 位(くらい)。その 左(ひだり)が 十(じゅう)の 位(くらい)、右(みぎ)が 小数第一位(しょうすうだいいちい)。<br>${ENTER}`],
  ]);
  add('m18', 'm18-a157', 3, [
    ['三角形(さんかくけい)と 角(かく)', retry(() => {
      if (Math.random() < 0.25) return pick([
        () => q('二等辺三角形(にとうへんさんかくけい)には、同(おな)じ 大(おお)きさの 角(かく)が □つ ある', 2),
        () => q('正三角形(せいさんかくけい)には、同(おな)じ 大(おお)きさの 角(かく)が □つ ある', 3),
        () => q('三角形(さんかくけい)には、角(かく)が □つ ある', 3),
      ])();
      const a = rand(3, 15) * 10, b = rand(3, 15) * 10; if (Math.abs(a - b) < 20) return null;
      const la = a > b ? rand(40, 55) : rand(70, 90), lb = a > b ? rand(70, 90) : rand(40, 55);
      const fig = SVG(330, 150, angleFig('あ', a, la, 80, rand(0, 20)) + angleFig('い', b, lb, 245, rand(0, 20)));
      return choice(`${fig}角(かく)が 大(おお)きいのは どっち？`, ['あ', 'い'], a > b ? 'あ' : 'い');
    }), `1つの 点(てん)から 出(で)て いる 2本(ほん)の 辺(へん)が 作(つく)る 形(かたち)を ${big('角(かく)')}と いうよ。`,
      `角(かく)の 大(おお)きさは、${big('辺(へん)の ひらきぐあい')}で きまる。辺(へん)の 長(なが)さには 関係(かんけい)ないよ。<br>${CHOOSE}`],
  ]);
  add('m6', 'm6-a150', 3, [
    ['0や 1の わり算(ざん)', () => {
      const d = rand(1, 9), n = rand(2, 9);
      return pick([q(`0 ÷ ${d} ＝`, 0), q(`${d} ÷ ${d} ＝`, 1), q(`${n} ÷ 1 ＝`, n), q(`${d * n} ÷ ${d} ＝`, n)]);
    }, `${big('0 ÷ 3 ＝ 0')}　0を いくつに 分(わ)けても 0。<br>${big('3 ÷ 3 ＝ 1')}　${big('3 ÷ 1 ＝ 3')}`, ENTER],
    ['わり算(ざん)の 文章題(ぶんしょうだい)（同(おな)じ 数(かず)ずつ 分(わ)ける）', () => {
      const d = rand(2, 9), n = rand(2, 9), a = d * n;
      return pick([
        q(wp(`あめが ${a}こ あります。${d}人(にん)で 同(おな)じ 数(かず)ずつ 分(わ)けると、1人(ひとり) □こ`), n),
        q(wp(`あめが ${a}こ あります。1人(ひとり)に ${d}こずつ 分(わ)けると、□人(にん)に 分(わ)けられる`), n),
        q(wp(`${a}cmの テープを ${d}cmずつ 切(き)ると、□本(ほん) できる`), n),
        q(wp(`いすが ${a}こ あります。${d}れつに 同(おな)じ 数(かず)ずつ ならべると、1れつ □こ`), n),
      ]);
    }, `${big('ぜんぶの 数(かず) ÷ 分(わ)ける 数(かず)')}。<br>「1人(ひとり) 何(なん)こ」も「何人(なんにん)に 分(わ)けられる」も、どちらも わり算(ざん)。`, ENTER],
    ['わり算(ざん) カード（九九(くく)の ぎゃく）', () => { const d = rand(2, 9), n = rand(1, 9); return q(`${d * n} ÷ ${d} ＝`, n); },
      `${big('24 ÷ 4')}は「4 × □ ＝ 24」の □を さがす。`, `4の 段(だん)で 24に なるのは 4 × 6。こたえは ${big('6')}。<br>${ENTER}`],
    ['あまりの ある わり算(ざん) ドリル', () => { const d = rand(2, 9), n = rand(1, 9), r = rand(1, d - 1); return rem(`${d * n + r} ÷ ${d} ＝`, n, r); },
      `${big('23 ÷ 4 ＝ 5 あまり 3')}<br>4の 段(だん)で 23を こえない いちばん 大(おお)きい 数(かず)は 20（4×5）。`, `あまりは ${big('わる 数(かず)より 小(ちい)さい')}よ。<br>${REM}`],
  ]);

  // ================= 4年 =================
  add('m1', 'm1-b32', 4, [
    ['そろばん（大(おお)きな 数(かず)・小数(しょうすう)）', retry(() => {
      const p = rand(0, 2), v = p ? rand(101, 99999) : rand(10000, 9999999), fig = abacus(abDigits(v, 7), 6 - p), s = dec(v, p), y = p ? rand(11, 999) : rand(1000, 99999);
      return pick([
        () => q(`${fig}▲の けたが 一(いち)の 位(くらい)です。そろばんの 数(かず)は いくつ？`, s),
        () => q(`${fig}▲の けたが 一(いち)の 位(くらい)です。この 数(かず)に ${dec(y, p)}を たすと いくつ？`, dec(v + y, p)),
        () => v > y ? q(`${fig}▲の けたが 一(いち)の 位(くらい)です。この 数(かず)から ${dec(y, p)}を ひくと いくつ？`, dec(v - y, p)) : null,
      ])();
    }), `▲の けたが 一(いち)の 位(くらい)。左(ひだり)へ 十(じゅう)・百(ひゃく)・千(せん)・一万(いちまん)…、右(みぎ)へ 小数第一位(しょうすうだいいちい)・小数第二位(しょうすうだいにい)。`,
      `玉(たま)が ない けたは ${big('0')}。小数(しょうすう)の さいごの 0は 書(か)かないよ。<br>${ENTER}`],
  ]);
  add('m18', 'm18-4', 4, [
    ['分度器(ぶんどき)で 角(かく)を はかる', retry(() => {
      const a = rand(3, 35) * 5, L = Math.random() < 0.4;
      return q(`${prot(a, L, false)}みどりの しるしの 角(かく)は 何度(なんど)？`, a);
    }), `分度器(ぶんどき)の ${big('中心(ちゅうしん)')}を 角(かく)の 頂点(ちょうてん)に、${big('0°の 線(せん)')}を 1つの 辺(へん)に あわせるよ。`,
      `辺(へん)が ${big('右(みぎ)の 0°')}に かさなって いたら 外(そと)側(がわ)の 黒(くろ)い 数(かず)、${big('左(ひだり)の 0°')}なら 内(うち)側(がわ)の 青(あお)い 数(かず)を 読(よ)もう。<br>${ENTER}`],
    ['180°より 大(おお)きい 角(かく)', retry(() => {
      const a = rand(3, 34) * 5, b = rand(37, 71) * 5;
      return pick([
        () => q(`${prot(a, false, true)}みどりの しるしの 角(かく)（大(おお)きい ほう）は 何度(なんど)？`, 360 - a),
        () => q(`${b}°は、180°より □度(ど) 大(おお)きい`, b - 180),
        () => q(`1回転(かいてん)（360°）から ${a}°を ひいた 角(かく)は □度(ど)`, 360 - a),
        () => q(`半回転(はんかいてん)（180°）と ${a}°を あわせた 角(かく)は □度(ど)`, 180 + a),
      ])();
    }), `${big('半回転(はんかいてん) ＝ 180°')}　${big('1回転(かいてん) ＝ 360°')}`,
      `180°より 大(おお)きい 角(かく)は、${big('360° − 小(ちい)さい ほうの 角(かく)')}で 出(だ)せるよ。<br>${ENTER}`],
  ]);
  add('m14', 'm14-b33', 4, [
    ['簡単(かんたん)な 割合(わりあい)（何倍(なんばい)で くらべる）', retry(() => {
      const a = rand(2, 9) * 10, k = rand(2, 5), b = rand(2, 9) * 10, j = rand(2, 5); if (k === j || a === b) return null;
      const da = a * k - a, db = b * j - b;
      return pick([
        () => q(wp(`ゴムひもを のばすと、${a}cmが ${a * k}cmに なりました。もとの 長(なが)さの □倍(ばい)`), k),
        () => q(wp(`あめの ねだんが、${a}円(えん)から ${a * k}円(えん)に なりました。□倍(ばい)に なった`), k),
        () => da === db || (da > db) === (k > j) ? null : choice(wp(`ゴムひも あ：${a}cmが ${a * k}cmに のびた。<br>ゴムひも い：${b}cmが ${b * j}cmに のびた。<br>よく のびる ゴムひもは どっち？（何倍(なんばい)で くらべる）`), ['あ', 'い'], k > j ? 'あ' : 'い'),
      ])();
    }), `もとの 大(おお)きさが ちがう ときは、ふえた 長(なが)さ（ひき算(ざん)）ではなく、${big('何倍(なんばい)に なったか（わり算(ざん)）')}で くらべるよ。`,
      `${big('のびた あとの 長(なが)さ ÷ もとの 長(なが)さ ＝ 何倍(なんばい)')}<br>${ENTER}`],
  ]);
  add('m6', 'm6-b31', 4, [
    ['わり算(ざん)の 暗算(あんざん)（2けた÷1けた）', retry(() => {
      const d = rand(2, 9), n = rand(11, 49), a = d * n; if (a > 99) return null;
      return q(`${a} ÷ ${d} ＝`, n);
    }), `${big('84 ÷ 4')}は、80 ÷ 4 ＝ 20 と 4 ÷ 4 ＝ 1 に 分(わ)けて、20 ＋ 1 ＝ ${big('21')}。`, `${big('72 ÷ 3')}は、60 ÷ 3 ＝ 20 と 12 ÷ 3 ＝ 4 で ${big('24')}。<br>${ENTER}`],
    ['3けた÷1けたの 筆算(ひっさん)（商(しょう)に 0が たつ）', retry(() => {
      const d = rand(2, 9), n = pick([rand(101, 999), rand(10, 99)]), r = rand(0, d - 1), a = d * n + r;
      if (a > 999 || a < 100 || !String(n).includes('0')) return null;
      return rem(`${a} ÷ ${d} ＝`, n, r);
    }), `わられる 数(かず)の 位(くらい)で、${big('わる 数(かず)より 小(ちい)さい')}ときは、商(しょう)に ${big('0')}を たてるよ。`,
      `${big('624 ÷ 3')}：6÷3＝2 → 2÷3は できない → 0を たてる → 24÷3＝8。こたえは ${big('208')}。<br>あまりが ない ときは、あまりに 0を いれよう。<br>${REM}`],
    ['商(しょう)の 見当(けんとう)（÷2けた）', retry(() => {
      const d = rand(12, 39); if (d % 10 === 0) return null;
      const n = rand(2, 9), r = rand(0, d - 1), a = d * n + r; if (a > 999) return null;
      return rem(`${a} ÷ ${d} ＝`, n, r);
    }), `わる 数(かず)を ${big('何十(なんじゅう)と 見(み)て')} 商(しょう)の 見当(けんとう)を つけよう。<br>${big('196 ÷ 28')} → 200 ÷ 30 で 6か 7くらい。`,
      `28 × 7 ＝ 196 なので 7。<br>かけ算(ざん)して 大(おお)きすぎたら 商(しょう)を 1 小(ちい)さく、あまりが わる 数(かず)より 大(おお)きかったら 1 大(おお)きく する。<br>${REM}`],
    ['わり算(ざん)の たしかめと きまり', retry(() => {
      const d = rand(2, 9), n = rand(10, 99), r = rand(1, d - 1), a = d * n + r, k = rand(2, 9), m = rand(2, 9);
      return pick([
        () => q(`${a} ÷ ${d} ＝ ${n} あまり ${r} の たしかめ：${d} × ${n} ＋ ${r} ＝`, a),
        () => q(`${k * m}0 ÷ ${m}0 ＝`, k),
        () => q(`${k * m}00 ÷ ${m}00 ＝`, k),
        () => q(`${k * m} ÷ ${m} ＝ ${k} だから、${k * m * 10} ÷ ${m * 10} ＝`, k),
      ])();
    }), `たしかめ：${big('わる 数(かず) × 商(しょう) ＋ あまり ＝ わられる 数(かず)')}`,
      `わられる 数(かず)と わる 数(かず)を ${big('同(おな)じ 数(かず)で わっても')}、商(しょう)は かわらない。<br>${big('600 ÷ 30 ＝ 60 ÷ 3 ＝ 20')}<br>${ENTER}`],
    ['3けた÷2けたの 筆算(ひっさん) ドリル', retry(() => {
      const d = rand(11, 99), n = rand(2, 40), r = rand(0, d - 1), a = d * n + r; if (a > 999 || a < 100) return null;
      return rem(`${a} ÷ ${d} ＝`, n, r);
    }), `${big('たてる → かける → ひく → おろす')} を くりかえすよ。`, `商(しょう)が 2けたに なる ことも あるよ。<br>${REM}`],
  ]);

  // ================= 5年 =================
  add('m7', 'm7-7', 5, [
    ['整数(せいすう)×小数(しょうすう)・整数(せいすう)÷小数(しょうすう)', retry(() => {
      const B = rand(2, 45); if (B % 10 === 0) return null;
      if (Math.random() < 0.5) { const a = rand(2, 20); return q(`${a} × ${dec(B, 1)} ＝`, dec(a * B, 1)); }
      const n = rand(2, 20); if ((n * B) % 10) return null; return q(`${n * B / 10} ÷ ${dec(B, 1)} ＝`, n);
    }), `${big('6 × 2.5')}：6 × 25 ＝ 150 → 小数点(しょうすうてん)を 1つ うごかして ${big('15')}。`,
      `${big('9 ÷ 1.5')}：わる 数(かず)と わられる 数(かず)を 10倍(ばい)して 90 ÷ 15 ＝ ${big('6')}。<br>${ENTER}`],
    ['小数(しょうすう)の わり算(ざん)（あまり）', retry(() => {
      const B = pick([rand(2, 9) * 10, rand(3, 29)]), n = rand(2, 9), R = rand(1, B - 1), A = B * n + R; if (A > 999) return null;
      return rem(`${dec(A, 1)} ÷ ${dec(B, 1)} ＝（商(しょう)は 整数(せいすう)で）`, n, dec(R, 1));
    }), `商(しょう)を 整数(せいすう)で もとめて、あまりも 出(だ)すよ。<br>${big('7.5 ÷ 2 ＝ 3 あまり 1.5')}`,
      `あまりの 小数点(しょうすうてん)は、${big('わられる 数(かず)の もとの 小数点(しょうすうてん)')}に そろえる。<br>たしかめ：${big('わる 数(かず) × 商(しょう) ＋ あまり ＝ わられる 数(かず)')}<br>${REM}`],
    ['商(しょう)を がい数(すう)で もとめる', retry(() => {
      let A, B, r, text;
      if (Math.random() < 0.5) { A = rand(11, 99); B = pick([3, 6, 7, 9, 11, 12]); if (A % B === 0) return null; r = Math.floor((2 * A + B) / (2 * B)); text = `${dec(A, 1)} ÷ ${B}`; }
      else { A = rand(2, 50); B = rand(13, 49); if ((100 * A) % B === 0 || B % 10 === 0) return null; r = Math.floor((200 * A + B) / (2 * B)); text = `${A} ÷ ${dec(B, 1)}`; }
      if (r === 0) return null;
      return q(`${text} の 商(しょう)を、四捨五入(ししゃごにゅう)して 1/10の 位(くらい)までの がい数(すう)に すると`, dec(r, 1));
    }), `1/10の 位(くらい)までの がい数(すう)に する ときは、${big('1/100の 位(くらい)まで 計算(けいさん)して 四捨五入(ししゃごにゅう)')}。`,
      `${big('5 ÷ 3 ＝ 1.66…')} → 1/100の 位(くらい)が 6なので 切(き)り上(あ)げて ${big('1.7')}。<br>${ENTER}`],
    ['小数(しょうすう)の 倍(ばい)', retry(() => {
      const a = rand(12, 60), k = rand(4, 35); if (k % 10 === 0 || a % 10 === 0) return null;
      const b = a * k;   // b は 1/100 単位
      return pick([
        () => q(wp(`赤(あか)い テープは ${dec(a, 1)}m、青(あお)い テープは ${dec(b, 2)}m です。青(あお)は 赤(あか)の □倍(ばい)`), dec(k, 1)),
        () => q(wp(`${dec(b, 2)}mは、ある 長(なが)さの ${dec(k, 1)}倍(ばい)です。ある 長(なが)さは □m`), dec(a, 1)),
        () => q(wp(`${dec(a, 1)}mの ${dec(k, 1)}倍(ばい)は □m`), dec(b, 2)),
      ])();
    }), `${big('くらべる 量(りょう) ÷ もとに する 量(りょう) ＝ 何倍(なんばい)')}。倍(ばい)は 小数(しょうすう)に なる ことも あるよ。`,
      `${big('もとに する 量(りょう) ＝ くらべる 量(りょう) ÷ 何倍(なんばい)')}<br>${ENTER}`],
    ['小数(しょうすう)の かけ算(ざん)・わり算(ざん) ドリル', retry(() => {
      const a = rand(2, 99), b = rand(2, 49); if (a % 10 === 0 || b % 10 === 0) return null;
      return Math.random() < 0.5 ? q(`${dec(a, 1)} × ${dec(b, 1)} ＝`, dec(a * b, 2)) : q(`${dec(a * b, 2)} ÷ ${dec(b, 1)} ＝`, dec(a, 1));
    }), `かけ算(ざん)：${big('小数点(しょうすうてん)の 右(みぎ)の けたの 数(かず)を たす')}。<br>わり算(ざん)：${big('わる 数(かず)を 整数(せいすう)に する')}。`, ENTER],
  ]);

  // ================= 6年 =================
  const frac = () => { for (;;) { const d = rand(2, 9), n = rand(1, 12); if (gcd(n, d) === 1 && n !== d) return [n, d]; } };
  const mixed = () => { for (;;) { const d = rand(2, 9), n = rand(1, d - 1), w = rand(1, 3); if (gcd(n, d) === 1) return [w, n, d]; } };
  add('m10', 'm10-b42', 6, [
    ['分数(ぶんすう)の かけ算(ざん)（約分(やくぶん)・帯分数(たいぶんすう)）', () => {
      if (Math.random() < 0.5) { const [w, n, d] = mixed(), [p, r] = frac(); return frA(`${mx(w, n, d)} × ${fr(p, r)} ＝`, (w * d + n) * p, d * r); }
      const [a, b] = frac(), [c, e] = frac(); return frA(`${fr(a, b)} × ${fr(c, e)} ＝`, a * c, b * e);
    }, `${big('帯分数(たいぶんすう)は 仮分数(かぶんすう)に なおして')} かける。`, `${big('とちゅうで 約分(やくぶん)')}すると 計算(けいさん)が かんたん。答(こた)えは 仮分数(かぶんすう)の ままで いいよ。<br>${FRA}`],
    ['分数(ぶんすう)の わり算(ざん)（帯分数(たいぶんすう)・整数(せいすう)÷分数(ぶんすう)）', () => {
      const t = rand(0, 2);
      if (t === 0) { const [w, n, d] = mixed(), [p, r] = frac(); return frA(`${mx(w, n, d)} ÷ ${fr(p, r)} ＝`, (w * d + n) * r, d * p); }
      if (t === 1) { const k = rand(2, 12), [p, r] = frac(); return frA(`${k} ÷ ${fr(p, r)} ＝`, k * r, p); }
      const [a, b] = frac(), [w, n, d] = mixed(); return frA(`${fr(a, b)} ÷ ${mx(w, n, d)} ＝`, a * d, b * (w * d + n));
    }, `わり算(ざん)は ${big('わる 数(かず)の 逆数(ぎゃくすう)を かける')}。`, `整数(せいすう)は ${big('3 ＝ 3/1')}と 考(かんが)えよう。<br>${FRA}`],
    ['3つの 分数(ぶんすう)の かけ算(ざん)・わり算(ざん)', () => {
      const [a, b] = frac(), [c, d] = frac(), [e, g] = frac(), op1 = pick(['×', '÷']), op2 = pick(['×', '÷']);
      let N = a, D = b; [N, D] = op1 === '×' ? [N * c, D * d] : [N * d, D * c]; [N, D] = op2 === '×' ? [N * e, D * g] : [N * g, D * e];
      return frA(`${fr(a, b)} ${op1} ${fr(c, d)} ${op2} ${fr(e, g)} ＝`, N, D);
    }, `わり算(ざん)は 逆数(ぎゃくすう)の かけ算(ざん)に なおして、${big('1つの 分数(ぶんすう)に まとめて')} 約分(やくぶん)しよう。`, FRA],
    ['積(せき)や 商(しょう)の 大(おお)きさ', retry(() => {
      const N = rand(4, 20), lt = () => { const [n, d] = frac(); return n < d ? [n, d] : null; }, gt = () => { const [n, d] = frac(); return n > d ? [n, d] : null; };
      const L1 = lt(), L2 = lt(), G1 = gt(), G2 = gt(); if (!L1 || !L2 || !G1 || !G2) return null;
      const big1 = Math.random() < 0.5;
      const wantBig = [`${N} × ${fr(...G1)}`, `${N} ÷ ${fr(...L1)}`], wantSmall = [`${N} × ${fr(...L1)}`, `${N} ÷ ${fr(...G1)}`];
      const [good, bad] = big1 ? [wantBig, wantSmall] : [wantSmall, wantBig];
      const ans = pick(good), others = [...bad, big1 ? `${N} × ${fr(...L2)}` : `${N} × ${fr(...G2)}`];
      return choice(`答(こた)えが ${N}より ${big1 ? '大(おお)きく' : '小(ちい)さく'} なるのは どれ？`, [ans, ...others], ans);
    }), `${big('1より 小(ちい)さい 数(かず)を かける')} → 積(せき)は もとより 小(ちい)さい。<br>${big('1より 小(ちい)さい 数(かず)で わる')} → 商(しょう)は もとより 大(おお)きい。`,
      `1より 大(おお)きい 数(かず)の ときは、その ぎゃく。<br>${CHOOSE}`],
    ['分数(ぶんすう)の かけ算(ざん)・わり算(ざん) ドリル', () => {
      const [a, b] = frac(), [c, d] = frac();
      return Math.random() < 0.5 ? frA(`${fr(a, b)} × ${fr(c, d)} ＝`, a * c, b * d) : frA(`${fr(a, b)} ÷ ${fr(c, d)} ＝`, a * d, b * c);
    }, `かけ算(ざん)：${big('分母(ぶんぼ)どうし、分子(ぶんし)どうしを かける')}。<br>わり算(ざん)：${big('わる 数(かず)の 逆数(ぎゃくすう)を かける')}。`, FRA],
  ]);
})();
