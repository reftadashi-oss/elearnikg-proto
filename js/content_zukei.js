// 算数 ⑱ 図形（2026年11月12日）。計算で 答えが 出る 図形の問題と、展開図。
// 問題は プログラムが 数を 変えて 作り、答えも プログラムが 計算する。本や 過去問からは 写していない。文と 学年は Claude の案（仮。先生が 確かめる）。
// 作図・補助線を ひらめく 問題は 紙の「ずけい」テキストで やる（ここには 入れない）。
// q.steps に 途中式を 入れておくと、講義の 例題に 出る（steps.js）。
(() => {
  const pick = a => a[rand(0, a.length - 1)];
  const dec = (n, p) => { const s = String(Math.abs(n)).padStart(p + 1, '0'), i = s.slice(0, s.length - p), f = s.slice(s.length - p).replace(/0+$/, ''); return (n < 0 ? '-' : '') + i + (f ? '.' + f : ''); };
  const q = (text, ans, steps, key) => ({ key: key || text, text, boxes: [''], answer: [ans], steps });
  const choiceQ = (stem, opts, correct, steps, key) => { const o = shuffle(opts); return { key: (key || stem) + '#' + correct, text: `${stem}<br><span class="ch">${o.map((x, i) => `<b>${i + 1}</b> ${x}`).join('　')}</span>`, boxes: [''], answer: [o.indexOf(correct) + 1], steps }; };
  const big = s => `<span class="big">${s}</span>`;
  const CM2 = 'cm<sup>2</sup>', CM3 = 'cm<sup>3</sup>';
  const ENTER = 'こたえを テンキーで いれて、Enterを おそう。';
  const CHOOSE = 'こたえの {番号|ばんごう}を テンキーで いれよう。';
  const DECI = '{小数点|しょうすうてん}は、テンキーの「.」で いれるよ。';
  // 10問を 作る（同じ 問題・同じ 答えが かたよらないように）
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

  // ================= 図（SVG）。図の 中には 漢字を 書かない =================
  const C = { line: '#2f6f4f', fill: '#e8f3ec', txt: '#1f3f2f', sub: '#c0392b' };
  // 点の 列を、W×H の わくに おさまるように 大きさを そろえる
  function fit(pts, W = 260, H = 170, pad = 30) {
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(...xs) - x0 || 1, h = Math.max(...ys) - y0 || 1;
    const k = Math.min((W - 2 * pad) / w, (H - 2 * pad) / h);
    const f = ([x, y]) => [+(pad + (x - x0) * k + ((W - 2 * pad) - w * k) / 2).toFixed(1), +(pad + (y - y0) * k + ((H - 2 * pad) - h * k) / 2).toFixed(1)];
    return { f, k };
  }
  const svg = (W, H, body) => `<svg viewBox="0 0 ${W} ${H}" width="${W}" style="display:block;margin:0 auto 6px;max-width:100%">${body}</svg>`;
  const poly = (P, fill = C.fill) => `<polygon points="${P.map(p => p.join(',')).join(' ')}" fill="${fill}" stroke="${C.line}" stroke-width="2.5"/>`;
  const text = (x, y, s, c = C.txt, size = 16) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" fill="${c}" font-weight="bold">${s}</text>`;
  const dash = (a, b, c = C.sub) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="2" stroke-dasharray="6 4"/>`;
  // 辺の 外がわに 長さを 書く（o＝図の まん中）
  const edgeLab = (a, b, s, o, c = C.txt) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = mx - o[0], dy = my - o[1], L = Math.hypot(dx, dy) || 1; return text(+(mx + dx / L * 16).toFixed(1), +(my + dy / L * 16 + 5).toFixed(1), s, c); };
  const center = P => [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];
  // 多角形と、辺ごとの ラベル（null は 書かない）
  function shape(pts, labels, extra = () => '') {
    const { f } = fit(pts), P = pts.map(f), o = center(P);
    return svg(260, 170, poly(P) + labels.map((s, i) => s ? edgeLab(P[i], P[(i + 1) % P.length], s, o) : '').join('') + extra(f, P, o));
  }
  const rectFig = (a, b, la = `${a}cm`, lb = `${b}cm`) => shape([[0, 0], [a, 0], [a, b], [0, b]], [la, lb, null, null]);
  const triFig = (b, h, off) => shape([[0, h], [b, h], [off, 0]], [`${b}cm`, null, null], (f, P) => { const top = f([off, 0]), foot = f([off, h]); const ext = off < 0 || off > b ? dash(f([0, h]), foot, '#888') : ''; return ext + dash(top, foot) + text(+(top[0] + 22 > 232 ? top[0] - 24 : top[0] + 22).toFixed(1), +((top[1] + foot[1]) / 2).toFixed(1), `${h}cm`, C.sub); });
  const paraFig = (b, h, s) => shape([[s, 0], [s + b, 0], [b, h], [0, h]], [null, null, `${b}cm`, null], (f) => { const t = f([s, 0]), ft = f([s, h]); return dash(t, ft) + text(+(t[0] + 22 > 232 ? t[0] - 24 : t[0] + 22).toFixed(1), +((t[1] + ft[1]) / 2).toFixed(1), `${h}cm`, C.sub); });
  const trapFig = (a, b, h, s) => shape([[s, 0], [s + a, 0], [b, h], [0, h]], [`${a}cm`, null, `${b}cm`, null], (f) => { const t = f([s, 0]), ft = f([s, h]); return dash(t, ft) + text(+(t[0] - 22 < 28 ? t[0] + 24 : t[0] - 22).toFixed(1), +((t[1] + ft[1]) / 2).toFixed(1), `${h}cm`, C.sub); });
  const rhombFig = (p, r) => shape([[p / 2, 0], [p, r / 2], [p / 2, r], [0, r / 2]], [null, null, null, null], (f) => { const A = f([p / 2, 0]), B = f([p, r / 2]), Cc = f([p / 2, r]), D = f([0, r / 2]); return dash(A, Cc) + dash(D, B) + text(+(A[0] + 26).toFixed(1), +((A[1] + Cc[1]) / 2 - 12).toFixed(1), `${r}cm`, C.sub) + text(+((D[0] + B[0]) / 2 - 30).toFixed(1), +(D[1] - 8).toFixed(1), `${p}cm`, C.sub); });
  // 角：三角形（2つの 角が わかる）。角度から 正しい 形で かく
  function triAngFig(A, B, labs) {
    const r = Math.PI / 180, Cx = Math.tan(B * r) / (Math.tan(A * r) + Math.tan(B * r)), Cy = Cx * Math.tan(A * r);
    const pts = [[0, 0], [1, 0], [Cx, Cy]].map(([x, y]) => [x, -y]);
    const { f } = fit(pts), P = pts.map(f), o = center(P);
    const lab = (p, s) => { const dx = o[0] - p[0], dy = o[1] - p[1], L = Math.hypot(dx, dy); return text(+(p[0] + dx / L * 30).toFixed(1), +(p[1] + dy / L * 30 + 5).toFixed(1), s, s === '?' ? C.sub : C.txt, 15); };
    return svg(260, 170, poly(P) + P.map((p, i) => lab(p, labs[i])).join(''));
  }
  // 角：一直線（x と となりの 角）
  function lineAngFig(x, lab1, lab2) {
    const r = x * Math.PI / 180, O = [130, 120], R = 95, E = [+(O[0] + R * Math.cos(Math.PI - r)).toFixed(1), +(O[1] - R * Math.sin(Math.PI - r)).toFixed(1)];
    return svg(260, 150, `<line x1="20" y1="120" x2="240" y2="120" stroke="${C.line}" stroke-width="3"/><line x1="${O[0]}" y1="${O[1]}" x2="${E[0]}" y2="${E[1]}" stroke="${C.line}" stroke-width="3"/>`
      + text(+(O[0] + 40 * Math.cos(Math.PI - r / 2)).toFixed(1), +(O[1] - 40 * Math.sin(Math.PI - r / 2)).toFixed(1), lab1, lab1 === '?' ? C.sub : C.txt, 15)
      + text(+(O[0] + 40 * Math.cos((Math.PI - r) / 2)).toFixed(1), +(O[1] - 40 * Math.sin((Math.PI - r) / 2)).toFixed(1), lab2, lab2 === '?' ? C.sub : C.txt, 15));
  }
  // 角：2本の 線が 交わる（向かい合う 角）
  function crossAngFig(x, labs) {
    const O = [130, 85], R = 100, a = x * Math.PI / 180, end = t => [+(O[0] + R * Math.cos(t)).toFixed(1), +(O[1] - R * Math.sin(t)).toFixed(1)];
    const l1 = [end(0), end(Math.PI)], l2 = [end(a), end(a + Math.PI)];
    const lab = (t, s) => text(+(O[0] + 38 * Math.cos(t)).toFixed(1), +(O[1] - 38 * Math.sin(t) + 5).toFixed(1), s, s === '?' ? C.sub : C.txt, 15);
    return svg(260, 170, [l1, l2].map(([p, q2]) => `<line x1="${p[0]}" y1="${p[1]}" x2="${q2[0]}" y2="${q2[1]}" stroke="${C.line}" stroke-width="3"/>`).join('')
      + lab(a / 2, labs[0]) + lab((a + Math.PI) / 2, labs[1]) + lab(a / 2 + Math.PI, labs[2]) + lab((a + Math.PI) / 2 + Math.PI, labs[3]));
  }
  // 四角形（角の ラベル）。形は めやす
  function quadFig(labs) {
    const P = [[40, 140], [225, 150], [205, 30], [70, 45]], o = center(P);
    const lab = (p, s) => { const dx = o[0] - p[0], dy = o[1] - p[1], L = Math.hypot(dx, dy); return text(+(p[0] + dx / L * 32).toFixed(1), +(p[1] + dy / L * 32 + 5).toFixed(1), s, s === '?' ? C.sub : C.txt, 15); };
    return svg(260, 170, poly(P) + P.map((p, i) => lab(p, labs[i])).join(''));
  }
  // 円（半径 か 直径）
  function circleFig(v, isR) {
    return svg(220, 170, `<circle cx="110" cy="85" r="70" fill="${C.fill}" stroke="${C.line}" stroke-width="2.5"/><circle cx="110" cy="85" r="3" fill="${C.txt}"/>`
      + (isR ? `<line x1="110" y1="85" x2="180" y2="85" stroke="${C.sub}" stroke-width="2.5"/>${text(145, 78, `${v}cm`, C.sub)}` : `<line x1="40" y1="85" x2="180" y2="85" stroke="${C.sub}" stroke-width="2.5"/>${text(110, 78, `${v}cm`, C.sub)}`));
  }
  // 直方体（見取図）
  function boxFig(a, b, c) {
    const k = 120 / Math.max(a + b * 0.5, c + b * 0.5), W = a * k, H = c * k, D = b * k * 0.5, x = 40, y = 20 + D;
    const F = [[x, y], [x + W, y], [x + W, y + H], [x, y + H]], T = [[x, y], [x + D, y - D], [x + W + D, y - D], [x + W, y]], S = [[x + W, y], [x + W + D, y - D], [x + W + D, y + H - D], [x + W, y + H]];
    const r = p => p.map(v => +v.toFixed(1));
    return svg(260, 190, poly(F.map(r)) + poly(T.map(r), '#d6eadc') + poly(S.map(r), '#c7e0cf')
      + text(+(x + W / 2).toFixed(1), +(y + H + 22).toFixed(1), `${a}cm`) + text(+(x - 22).toFixed(1), +(y + H / 2 + 5).toFixed(1), `${c}cm`) + text(+(x + W + D / 2 + 22).toFixed(1), +(y + H - D / 2 + 10).toFixed(1), `${b}cm`));
  }
  function cylFig(r, h, isR = true) {
    const W = 120, H = 110, x = 70, y = 30, e = 16;
    return svg(260, 180, `<rect x="${x}" y="${y}" width="${W}" height="${H}" fill="${C.fill}" stroke="none"/><line x1="${x}" y1="${y}" x2="${x}" y2="${y + H}" stroke="${C.line}" stroke-width="2.5"/><line x1="${x + W}" y1="${y}" x2="${x + W}" y2="${y + H}" stroke="${C.line}" stroke-width="2.5"/>`
      + `<ellipse cx="${x + W / 2}" cy="${y + H}" rx="${W / 2}" ry="${e}" fill="${C.fill}" stroke="${C.line}" stroke-width="2.5"/><ellipse cx="${x + W / 2}" cy="${y}" rx="${W / 2}" ry="${e}" fill="#d6eadc" stroke="${C.line}" stroke-width="2.5"/>`
      + `<line x1="${x + W / 2}" y1="${y}" x2="${x + W}" y2="${y}" stroke="${C.sub}" stroke-width="2.5"/>${text(x + W * 0.75, y - 6, `${r}cm`, C.sub)}${text(x + W + 30, y + H / 2 + 5, `${h}cm`)}`);
  }
  function prismFig(b, h, H) {   // 三角柱（底面は 底辺 b・高さ h の 三角形）
    const x = 50, y = 140, W = 110, T = 70, D = 60;
    const A = [x, y], B = [x + W, y], Cc = [x + W * 0.35, y - T], A2 = [x + D, y - D * 0.6], B2 = [x + W + D, y - D * 0.6], C2 = [x + W * 0.35 + D, y - T - D * 0.6];
    const r = p => p.map(v => +v.toFixed(1));
    return svg(260, 170, poly([A, B, Cc].map(r)) + `<polyline points="${[Cc, C2, B2, B].map(r).map(p => p.join(',')).join(' ')}" fill="none" stroke="${C.line}" stroke-width="2.5"/><line x1="${r(C2)[0]}" y1="${r(C2)[1]}" x2="${r(A2)[0]}" y2="${r(A2)[1]}" stroke="#999" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="${A[0]}" y1="${A[1]}" x2="${r(A2)[0]}" y2="${r(A2)[1]}" stroke="#999" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="${r(A2)[0]}" y1="${r(A2)[1]}" x2="${r(B2)[0]}" y2="${r(B2)[1]}" stroke="#999" stroke-width="1.5" stroke-dasharray="4 3"/>`
      + dash(r(Cc), [r(Cc)[0], y]) + text(x + W / 2, y + 20, `${b}cm`) + text(+(r(Cc)[0] - 22).toFixed(1), y - T / 2, `${h}cm`, C.sub) + text(+(x + W + D / 2 + 26).toFixed(1), +(y - D * 0.3 + 4).toFixed(1), `${H}cm`));
  }

  // ================= 展開図（立方体） =================
  // 方眼の 上で 立方体を ころがして、どの マスが どの 面に なるかを 調べる。6つの 面が ぜんぶ ちがえば 立方体の 展開図
  const ROLL = { E: o => ({ ...o, D: o.E, E: o.U, U: o.W, W: o.D }), W: o => ({ ...o, D: o.W, W: o.U, U: o.E, E: o.D }), S: o => ({ ...o, D: o.S, S: o.U, U: o.N, N: o.D }), N: o => ({ ...o, D: o.N, N: o.U, U: o.S, S: o.D }) };
  const DIR = { E: [1, 0], W: [-1, 0], S: [0, 1], N: [0, -1] };
  function fold(cells) {
    const key = c => c.join(','), set = new Set(cells.map(key)), face = new Map(), start = cells[0];
    const st = [[start, { D: 0, U: 1, N: 2, S: 3, E: 4, W: 5 }]]; face.set(key(start), 0);
    while (st.length) {
      const [c, o] = st.pop();
      for (const d of 'ESWN') { const n = [c[0] + DIR[d][0], c[1] + DIR[d][1]], k = key(n); if (!set.has(k) || face.has(k)) continue; const o2 = ROLL[d](o); face.set(k, o2.D); st.push([n, o2]); }
    }
    const fs = cells.map(c => face.get(key(c)));
    return { ok: new Set(fs).size === 6, faces: fs };   // 向かい合う 面は 0と1・2と3・4と5
  }
  const norm = cells => { const x0 = Math.min(...cells.map(c => c[0])), y0 = Math.min(...cells.map(c => c[1])); return cells.map(([x, y]) => [x - x0, y - y0]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); };
  const sym = cells => { const out = []; let c = cells; for (let r = 0; r < 4; r++) { c = c.map(([x, y]) => [y, -x]); out.push(norm(c), norm(c.map(([x, y]) => [-x, y]))); } return out; };
  const canon = cells => sym(cells).map(c => c.map(p => p.join(',')).join(';')).sort()[0];
  function randHex() { const cs = [[0, 0]]; while (cs.length < 6) { const c = pick(cs), d = DIR[pick('ESWN'.split(''))], n = [c[0] + d[0], c[1] + d[1]]; if (!cs.some(p => p[0] === n[0] && p[1] === n[1])) cs.push(n); } return norm(cs); }
  const GOOD = new Map(), BAD = new Map();
  for (let i = 0; i < 6000 && (GOOD.size < 11 || BAD.size < 30); i++) {
    const h = randHex(), k = canon(h), w = Math.max(...h.map(c => c[0])) + 1, ht = Math.max(...h.map(c => c[1])) + 1;
    if (w > 5 || ht > 4) continue;                         // 横長すぎる 形は 出さない
    (fold(h).ok ? GOOD : BAD).set(k, h);
  }
  const NETS = [...GOOD.values()], NOTNETS = [...BAD.values()].filter(h => !h.some((c, i) => h.some(d => d[0] === c[0] + 1 && d[1] === c[1]) && h.some(d => d[0] === c[0] && d[1] === c[1] + 1) && h.some(d => d[0] === c[0] + 1 && d[1] === c[1] + 1)));   // 2×2の かたまりは すぐ わかるので のぞく
  const turn = h => { let c = h; const n = rand(0, 3); for (let r = 0; r < n; r++) c = c.map(([x, y]) => [y, -x]); if (rand(0, 1)) c = c.map(([x, y]) => [-x, y]); return norm(c); };
  function netFig(cells, labs = [], s = 30, small = false) {
    const w = Math.max(...cells.map(c => c[0])) + 1, h = Math.max(...cells.map(c => c[1])) + 1, W = w * s + 8, H = h * s + 8;
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" style="display:${small ? 'inline-block;vertical-align:middle' : 'block;margin:0 auto 6px'}">${cells.map(([x, y], i) => `<rect x="${4 + x * s}" y="${4 + y * s}" width="${s}" height="${s}" fill="${C.fill}" stroke="${C.line}" stroke-width="2"/>${labs[i] !== undefined ? `<text x="${4 + x * s + s / 2}" y="${4 + y * s + s / 2 + 6}" font-size="${s * 0.55}" text-anchor="middle" font-weight="bold" fill="${labs[i] === '□' ? C.sub : C.txt}">${labs[i]}</text>` : ''}`).join('')}</svg>`;
  }
  const KANA = ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ'];

  // ================= 単元 =================
  const UN = [
    // 1 まわりの長さ
    ['まわりの {長|なが}さ', () => { const a = rand(2, 15), b = rand(2, 15), sq = rand(0, 3) === 0; if (sq) return q(`${rectFig(a, a)}{正方形|せいほうけい}の まわりの {長|なが}さは □cm`, 4 * a, [`{正方形|せいほうけい}は 4つの {辺|へん}が ぜんぶ おなじ {長|なが}さ`, `${a} × 4 ＝ ${4 * a}`]); if (a === b) return null; return q(`${rectFig(a, b)}{長方形|ちょうほうけい}の まわりの {長|なが}さは □cm`, 2 * (a + b), [`たてと よこを 1つずつ たす：${a} ＋ ${b} ＝ ${a + b}`, `まわりは その 2つ{分|ぶん}：${a + b} × 2 ＝ ${2 * (a + b)}`]); },
      `まわりの {長|なが}さは、{辺|へん}の {長|なが}さを ぜんぶ たした もの。<br>${rectFig(5, 3)}${big('5 ＋ 3 ＋ 5 ＋ 3 ＝ 16')}`, `{長方形|ちょうほうけい}は、むかいあう {辺|へん}が おなじ {長|なが}さ。<br>${big('（5 ＋ 3）× 2 ＝ 16')}<br>${ENTER}`],
    // 2 長方形・正方形の面積
    ['{長方形|ちょうほうけい}・{正方形|せいほうけい}の {面積|めんせき}', () => { const a = rand(2, 15), b = rand(2, 15); if (rand(0, 3) === 0) return q(`${rectFig(a, a)}{正方形|せいほうけい}の {面積|めんせき}は □${CM2}`, a * a, [`{正方形|せいほうけい}の {面積|めんせき} ＝ 1{辺|ぺん} × 1{辺|ぺん}`, `${a} × ${a} ＝ ${a * a}`]); return q(`${rectFig(a, b)}{長方形|ちょうほうけい}の {面積|めんせき}は □${CM2}`, a * b, [`{長方形|ちょうほうけい}の {面積|めんせき} ＝ たて × よこ`, `${b} × ${a} ＝ ${a * b}`]); },
      `1{辺|ぺん}が 1cmの {正方形|せいほうけい}が いくつ {分|ぶん}かが {面積|めんせき}。1こ{分|ぶん}を 1${CM2}（{平方|へいほう}センチメートル）と いうよ。`, `${big('{長方形|ちょうほうけい} ＝ たて × よこ')}<br>${big('{正方形|せいほうけい} ＝ 1{辺|ぺん} × 1{辺|ぺん}')}<br>${rectFig(4, 3)}3 × 4 ＝ 12 → 12${CM2}`],
    // 3 面積から辺の長さ
    ['{面積|めんせき}から {辺|へん}の {長|なが}さ', () => { const a = rand(2, 12), b = rand(2, 12), S = a * b; return pick([q(`{面積|めんせき}が ${S}${CM2}で、たてが ${b}cmの {長方形|ちょうほうけい}の よこは □cm`, a, [`たて × よこ ＝ {面積|めんせき} だから、よこ ＝ {面積|めんせき} ÷ たて`, `${S} ÷ ${b} ＝ ${a}`], `s${S}t${b}`), q(`{面積|めんせき}が ${a * a}${CM2}の {正方形|せいほうけい}の 1{辺|ぺん}は □cm`, a, [`おなじ {数|かず}を 2{回|かい} かけて ${a * a}に なる {数|かず}を さがす`, `${a} × ${a} ＝ ${a * a} → ${a}`], `q${a}`)]); },
      `{面積|めんせき} ＝ たて × よこ を ぎゃくに つかうよ。<br>${big('よこ ＝ {面積|めんせき} ÷ たて')}`, `{例|れい}：{面積|めんせき} 24${CM2}、たて 4cm → よこは 24 ÷ 4 ＝ 6cm<br>${ENTER}`],
    // 4 角の大きさ（一直線・向かい合う角）
    ['{角|かく}の {大|おお}きさ（{一直線|いっちょくせん}・{向|む}かい{合|あ}う {角|かく}）', () => { const x = rand(3, 16) * 10 + pick([0, 5]); if (x >= 175) return null; return pick([q(`${lineAngFig(x, '?', `${180 - x}°`)}? の {角|かく}は □°`, x, [`{一直線|いっちょくせん}の {角|かく}は 180°`, `180 − ${180 - x} ＝ ${x}`], `l${x}`), q(`${crossAngFig(x, [`${x}°`, '', '?', ''])}? の {角|かく}は □°`, x, [`{向|む}かい{合|あ}う {角|かく}は おなじ {大|おお}きさ`, `→ ${x}°`], `c${x}`), q(`${crossAngFig(x, [`${x}°`, '?', '', ''])}? の {角|かく}は □°`, 180 - x, [`となりどうしの {角|かく}は、あわせて {一直線|いっちょくせん}（180°）`, `180 − ${x} ＝ ${180 - x}`], `d${x}`)]); },
      `{一直線|いっちょくせん}の {角|かく}は 180°。<br>${lineAngFig(60, '60°', '120°')}${big('60° ＋ 120° ＝ 180°')}`, `2{本|ほん}の {線|せん}が {交|まじ}わると、{向|む}かい{合|あ}う {角|かく}は おなじ {大|おお}きさに なるよ。<br>${crossAngFig(50, ['50°', '130°', '50°', '130°'])}${ENTER}`],
    // 5 立方体の展開図（どれ？）
    ['{立方体|りっぽうたい}の {展開図|てんかいず}', () => { const g = turn(pick(NETS)), b = shuffle(NOTNETS).slice(0, 2).map(turn), opts = [netFig(g, [], 22, true), ...b.map(h => netFig(h, [], 22, true))]; return choiceQ('{組|く}み{立|た}てると {立方体|りっぽうたい}に なるのは どれ？', opts, opts[0], [`{面|めん}が 6つ あるか {数|かぞ}える`, `1つの {面|めん}を {下|した}に して、まわりの {面|めん}を おりまげて みる`, `{面|めん}が かさなったら {立方体|りっぽうたい}に ならない`], canon(g) + b.map(canon).join('|')); },
      `{立方体|りっぽうたい}を {辺|へん}で {切|き}り{開|ひら}いた {図|ず}を {展開図|てんかいず}と いうよ。{立方体|りっぽうたい}の {展開図|てんかいず}は 11{種類|しゅるい} ある。<br>${netFig([[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]])}`, `{見分|みわ}け{方|かた}：{頭|あたま}の {中|なか}で おりまげて、{面|めん}が かさならないか たしかめよう。<br>4つ ならんだ {列|れつ}の {上|うえ}と {下|した}に 1つずつ ある {形|かたち}は、{立方体|りっぽうたい}に なるよ。<br>${CHOOSE}`],
    // 6 向かい合う面
    ['{展開図|てんかいず}で {向|む}かい{合|あ}う {面|めん}', () => { const g = turn(pick(NETS)), lab = shuffle(KANA), fs = fold(g).faces, i = rand(0, 5), j = fs.indexOf(fs[i] ^ 1), others = shuffle([0, 1, 2, 3, 4, 5].filter(k => k !== i && k !== j)).slice(0, 2); return choiceQ(`${netFig(g, lab)}{組|く}み{立|た}てた とき、${lab[i]}と {向|む}かい{合|あ}う {面|めん}は？`, [lab[j], lab[others[0]], lab[others[1]]], lab[j], [`${lab[i]}の となりの {面|めん}は、${lab[i]}と {向|む}かい{合|あ}わない`, `となりでも なく、1つ とばした ところに ある {面|めん}が {向|む}かい{合|あ}う {面|めん}`, `→ ${lab[j]}`], canon(g) + lab.join('') + i); },
      `{立方体|りっぽうたい}では、{向|む}かい{合|あ}う {面|めん}が 3くみ あるよ。<br>${netFig([[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ'])}ア と カ、イ と エ、ウ と オ が {向|む}かい{合|あ}う。`, `まっすぐ ならんだ {面|めん}は、1つ とばすと {向|む}かい{合|あ}う {面|めん}に なるよ。<br>${CHOOSE}`],
    // 7 さいころの展開図
    ['さいころの {展開図|てんかいず}', () => { const g = turn(pick(NETS)), fs = fold(g).faces, pairs = shuffle([[1, 6], [2, 5], [3, 4]]).map(p => shuffle(p)), val = fs.map(f => pairs[f >> 1][f & 1]), k = rand(0, 5), lab = val.map((v, i) => i === k ? '□' : String(v)), o = fs.indexOf(fs[k] ^ 1); return q(`${netFig(g, lab)}{向|む}かい{合|あ}う {面|めん}の {目|め}を たすと 7に なる さいころです。□に はいる {数|かず}は`, val[k], [`□と {向|む}かい{合|あ}う {面|めん}は ${val[o]}`, `7 − ${val[o]} ＝ ${val[k]}`], canon(g) + val.join('') + k); },
      `さいころは、{向|む}かい{合|あ}う {面|めん}の {目|め}を たすと 7。<br>${big('1と6、2と5、3と4')}`, `まず □と {向|む}かい{合|あ}う {面|めん}を さがして、7から ひこう。<br>${ENTER}`],
    // 8 直方体の展開図（長さ）
    ['{直方体|ちょくほうたい}の {展開図|てんかいず}（{長|なが}さ）', () => { const a = rand(2, 9), b = rand(2, 9), c = rand(2, 9); if (a === b) return null; return pick([q(`${boxFig(a, b, c)}この {直方体|ちょくほうたい}の {展開図|てんかいず}で、{横|よこ}に 4つ ならんだ {面|めん}の {横|よこ}の {長|なが}さ（ぜんぶ）は □cm`, 2 * (a + b), [`まわりの 4つの {面|めん}の {横|よこ}は ${a}・${b}・${a}・${b}cm`, `（${a} ＋ ${b}）× 2 ＝ ${2 * (a + b)}`], `w${a}.${b}.${c}`), q(`${boxFig(a, b, c)}この {直方体|ちょくほうたい}の {辺|へん}の {長|なが}さを ぜんぶ たすと □cm`, 4 * (a + b + c), [`おなじ {長|なが}さの {辺|へん}が 4{本|ほん}ずつ ある`, `（${a} ＋ ${b} ＋ ${c}）× 4 ＝ ${4 * (a + b + c)}`], `e${a}.${b}.${c}`)]); },
      `{直方体|ちょくほうたい}の {面|めん}は 6つ、{辺|へん}は 12{本|ほん}。おなじ {長|なが}さの {辺|へん}が 4{本|ほん}ずつ あるよ。<br>${boxFig(4, 3, 2)}`, `{展開図|てんかいず}では、まわりの 4つの {面|めん}が {横|よこ}に つながる。{横|よこ}の {長|なが}さは（たて ＋ よこ）× 2。<br>${ENTER}`],
    // 9 三角形の角
    ['{三角形|さんかくけい}の {角|かく}', () => { const A = rand(3, 13) * 5 + 10, B = rand(3, 13) * 5 + 10, Cc = 180 - A - B; if (Cc < 20) return null; const k = rand(0, 2), angs = [A, B, Cc], labs = angs.map((x, i) => i === k ? '?' : `${x}°`), kn = angs.filter((_, i) => i !== k); return q(`${triAngFig(A, B, labs)}? の {角|かく}は □°`, angs[k], [`{三角形|さんかくけい}の 3つの {角|かく}を たすと 180°`, `180 − ${kn[0]} − ${kn[1]} ＝ ${angs[k]}`], `${A}.${B}.${k}`); },
      `{三角形|さんかくけい}の 3つの {角|かく}を たすと、かならず ${big('180°')}<br>${triAngFig(60, 70, ['60°', '70°', '50°'])}60 ＋ 70 ＋ 50 ＝ 180`, `わからない {角|かく} ＝ 180 − のこりの 2つ<br>（{図|ず}を {正|ただ}しい {大|おお}きさで かいて いるよ）<br>${ENTER}`],
    // 10 四角形・多角形の角
    ['{四角形|しかくけい}・{多角形|たかくけい}の {角|かく}', () => { if (rand(0, 2) === 0) { const n = rand(5, 10), nm = { 5: '{五角形|ごかくけい}', 6: '{六角形|ろっかくけい}', 7: '{七角形|ななかくけい}', 8: '{八角形|はっかくけい}', 9: '{九角形|きゅうかくけい}', 10: '{十角形|じっかくけい}' }[n]; return q(`${nm}の {角|かく}の {大|おお}きさを ぜんぶ たすと □°`, 180 * (n - 2), [`1つの {頂点|ちょうてん}から {対角線|たいかくせん}を ひくと、{三角形|さんかくけい}が ${n - 2}こ できる`, `180 × ${n - 2} ＝ ${180 * (n - 2)}`], `n${n}`); }
      const a = [rand(12, 24) * 5, rand(12, 24) * 5, rand(12, 24) * 5], d = 360 - a[0] - a[1] - a[2]; if (d < 40 || d > 160) return null; const all = [...a, d], k = rand(0, 3), labs = all.map((x, i) => i === k ? '?' : `${x}°`), kn = all.filter((_, i) => i !== k); return q(`${quadFig(labs)}? の {角|かく}は □°`, all[k], [`{四角形|しかくけい}の 4つの {角|かく}を たすと 360°`, `360 − ${kn.join(' − ')} ＝ ${all[k]}`], all.join('.') + k); },
      `{四角形|しかくけい}は {対角線|たいかくせん}で {三角形|さんかくけい} 2つに わけられる。だから 4つの {角|かく}の {和|わ}は ${big('180 × 2 ＝ 360°')}`, `{五角形|ごかくけい}は {三角形|さんかくけい} 3つ → 540°、{六角形|ろっかくけい}は 4つ → 720°。<br>${big('{和|わ} ＝ 180 ×（{頂点|ちょうてん}の {数|かず} − 2）')}<br>{四角形|しかくけい}の {図|ず}の {形|かたち}は めやすだよ。${ENTER}`],
    // 11 三角形の面積
    ['{三角形|さんかくけい}の {面積|めんせき}', () => { const b = rand(2, 14), h = rand(2, 12); if (b * h % 2) return null; const off = pick([rand(1, b - 1), rand(1, b - 1), -rand(1, 3), b + rand(1, 3)]); return q(`${triFig(b, h, off)}{三角形|さんかくけい}の {面積|めんせき}は □${CM2}`, b * h / 2, [`{三角形|さんかくけい} ＝ {底辺|ていへん} × {高|たか}さ ÷ 2`, `${b} × ${h} ＝ ${b * h}`, `${b * h} ÷ 2 ＝ ${b * h / 2}`], `${b}.${h}.${off > b ? 'o' : off < 0 ? 'u' : 'i'}`); },
      `{三角形|さんかくけい}を 2つ あわせると {平行四辺形|へいこうしへんけい}に なる。だから ${big('{底辺|ていへん} × {高|たか}さ ÷ 2')}`, `{高|たか}さは、{底辺|ていへん}に まっすぐ（{垂直|すいちょく}に）{測|はか}った {長|なが}さ（{赤|あか}い {点線|てんせん}）。{三角形|さんかくけい}の {外|そと}に {出|で}る ことも あるよ。<br>${triFig(6, 4, 8)}${ENTER}`],
    // 12 平行四辺形の面積
    ['{平行四辺形|へいこうしへんけい}の {面積|めんせき}', () => { const b = rand(3, 14), h = rand(2, 12), s = rand(1, 4); return q(`${paraFig(b, h, s)}{平行四辺形|へいこうしへんけい}の {面積|めんせき}は □${CM2}`, b * h, [`{平行四辺形|へいこうしへんけい} ＝ {底辺|ていへん} × {高|たか}さ`, `${b} × ${h} ＝ ${b * h}`], `${b}.${h}`); },
      `{平行四辺形|へいこうしへんけい}の はしを {切|き}って {反対|はんたい}に つけると {長方形|ちょうほうけい}に なる。<br>${big('{底辺|ていへん} × {高|たか}さ')}`, `ななめの {辺|へん}の {長|なが}さでは なく、{高|たか}さ（{点線|てんせん}）を つかうよ。<br>${ENTER}`],
    // 13 台形の面積
    ['{台形|だいけい}の {面積|めんせき}', () => { const a = rand(2, 10), b = rand(a + 2, 16), h = rand(2, 12); if ((a + b) * h % 2) return null; const s = rand(0, b - a); return q(`${trapFig(a, b, h, s)}{台形|だいけい}の {面積|めんせき}は □${CM2}`, (a + b) * h / 2, [`{台形|だいけい} ＝（{上底|じょうてい} ＋ {下底|かてい}）× {高|たか}さ ÷ 2`, `${a} ＋ ${b} ＝ ${a + b}`, `${a + b} × ${h} ＝ ${(a + b) * h}`, `${(a + b) * h} ÷ 2 ＝ ${(a + b) * h / 2}`], `${a}.${b}.${h}`); },
      `おなじ {台形|だいけい}を さかさに して 2つ ならべると {平行四辺形|へいこうしへんけい}。<br>${big('（{上底|じょうてい} ＋ {下底|かてい}）× {高|たか}さ ÷ 2')}`, `{上|うえ}の {辺|へん}が {上底|じょうてい}、{下|した}の {辺|へん}が {下底|かてい}。<br>${ENTER}`],
    // 14 ひし形の面積
    ['ひし{形|がた}の {面積|めんせき}', () => { const p = rand(2, 14), r = rand(2, 14); if (p * r % 2 || p === r) return null; return q(`${rhombFig(p, r)}ひし{形|がた}の {面積|めんせき}は □${CM2}（{点線|てんせん}は {対角線|たいかくせん}）`, p * r / 2, [`ひし{形|がた} ＝ {対角線|たいかくせん} × {対角線|たいかくせん} ÷ 2`, `${p} × ${r} ＝ ${p * r}`, `${p * r} ÷ 2 ＝ ${p * r / 2}`], `${p}.${r}`); },
      `ひし{形|がた}の まわりに {長方形|ちょうほうけい}を かくと、ひし{形|がた}は その はんぶん。<br>${big('{対角線|たいかくせん} × {対角線|たいかくせん} ÷ 2')}`, ENTER],
    // 15 直方体・立方体の体積
    ['{直方体|ちょくほうたい}・{立方体|りっぽうたい}の {体積|たいせき}', () => { const a = rand(2, 12), b = rand(2, 10), c = rand(2, 10); if (rand(0, 3) === 0) return q(`1{辺|ぺん}が ${a}cmの {立方体|りっぽうたい}の {体積|たいせき}は □${CM3}`, a ** 3, [`{立方体|りっぽうたい} ＝ 1{辺|ぺん} × 1{辺|ぺん} × 1{辺|ぺん}`, `${a} × ${a} ＝ ${a * a}`, `${a * a} × ${a} ＝ ${a ** 3}`], `k${a}`); return q(`${boxFig(a, b, c)}{直方体|ちょくほうたい}の {体積|たいせき}は □${CM3}`, a * b * c, [`{直方体|ちょくほうたい} ＝ たて × よこ × {高|たか}さ`, `${b} × ${a} ＝ ${a * b}`, `${a * b} × ${c} ＝ ${a * b * c}`], `${a}.${b}.${c}`); },
      `1{辺|ぺん} 1cmの {立方体|りっぽうたい}が いくつ {分|ぶん}かが {体積|たいせき}。1こ{分|ぶん}を 1${CM3}と いうよ。`, `${big('{直方体|ちょくほうたい} ＝ たて × よこ × {高|たか}さ')}<br>${big('{立方体|りっぽうたい} ＝ 1{辺|ぺん} × 1{辺|ぺん} × 1{辺|ぺん}')}<br>${boxFig(4, 3, 2)}3 × 4 × 2 ＝ 24${CM3}`],
    // 16 円周の長さ
    ['{円周|えんしゅう}の {長|なが}さ', () => { const v = rand(2, 20), isR = rand(0, 1) === 1, d = isR ? 2 * v : v; return q(`${circleFig(v, isR)}${isR ? '{半径|はんけい}' : '{直径|ちょっけい}'}が ${v}cmの {円|えん}の {円周|えんしゅう}は □cm（{円周率|えんしゅうりつ}は 3.14）`, dec(d * 314, 2), [isR ? `{直径|ちょっけい} ＝ {半径|はんけい} × 2：${v} × 2 ＝ ${d}` : `{直径|ちょっけい}は ${d}cm`, `{円周|えんしゅう} ＝ {直径|ちょっけい} × 3.14`, `${d} × 3.14 ＝ ${dec(d * 314, 2)}`], `${isR ? 'r' : 'd'}${v}`); },
      `{円周|えんしゅう}は、{直径|ちょっけい}の {約|やく} 3.14{倍|ばい}。この 3.14を {円周率|えんしゅうりつ}と いうよ。<br>${big('{円周|えんしゅう} ＝ {直径|ちょっけい} × 3.14')}`, `{半径|はんけい}が わかって いる ときは、2{倍|ばい}して {直径|ちょっけい}に してから かけよう。<br>${DECI}`],
    // 17 円の面積
    ['{円|えん}の {面積|めんせき}', () => { const r = rand(1, 12), isR = rand(0, 2) > 0, v = isR ? r : 2 * r; return q(`${circleFig(v, isR)}${isR ? '{半径|はんけい}' : '{直径|ちょっけい}'}が ${v}cmの {円|えん}の {面積|めんせき}は □${CM2}（{円周率|えんしゅうりつ}は 3.14）`, dec(r * r * 314, 2), [...(isR ? [] : [`{半径|はんけい} ＝ {直径|ちょっけい} ÷ 2：${v} ÷ 2 ＝ ${r}`]), `{円|えん}の {面積|めんせき} ＝ {半径|はんけい} × {半径|はんけい} × 3.14`, `${r} × ${r} ＝ ${r * r}`, `${r * r} × 3.14 ＝ ${dec(r * r * 314, 2)}`], `${isR ? 'r' : 'd'}${v}`); },
      `${big('{円|えん}の {面積|めんせき} ＝ {半径|はんけい} × {半径|はんけい} × 3.14')}<br>{円|えん}を こまかく {切|き}って ならべかえると、ほぼ {長方形|ちょうほうけい}（たて＝{半径|はんけい}、よこ＝{円周|えんしゅう}の はんぶん）に なるよ。`, `{直径|ちょっけい}が {書|か}いて ある ときは、まず 2で わって {半径|はんけい}に しよう。<br>${DECI}`],
    // 18 角柱・円柱の体積
    ['{角柱|かくちゅう}・{円柱|えんちゅう}の {体積|たいせき}', () => { if (rand(0, 1)) { const b = rand(2, 10), h = rand(2, 10), H = rand(2, 12); if (b * h % 2) return null; return q(`${prismFig(b, h, H)}{三角柱|さんかくちゅう}の {体積|たいせき}は □${CM3}`, b * h / 2 * H, [`{底面積|ていめんせき}（{三角形|さんかくけい}）：${b} × ${h} ÷ 2 ＝ ${b * h / 2}`, `{体積|たいせき} ＝ {底面積|ていめんせき} × {高|たか}さ`, `${b * h / 2} × ${H} ＝ ${b * h / 2 * H}`], `p${b}.${h}.${H}`); }
      const r = rand(1, 6), H = rand(2, 10); return q(`${cylFig(r, H)}{円柱|えんちゅう}の {体積|たいせき}は □${CM3}（{円周率|えんしゅうりつ}は 3.14）`, dec(r * r * 314 * H, 2), [`{底面積|ていめんせき}（{円|えん}）：${r} × ${r} × 3.14 ＝ ${dec(r * r * 314, 2)}`, `{体積|たいせき} ＝ {底面積|ていめんせき} × {高|たか}さ`, `${dec(r * r * 314, 2)} × ${H} ＝ ${dec(r * r * 314 * H, 2)}`], `c${r}.${H}`); },
      `{角柱|かくちゅう}も {円柱|えんちゅう}も、${big('{体積|たいせき} ＝ {底面積|ていめんせき} × {高|たか}さ')}`, `まず {底|そこ}の {面|めん}の {面積|めんせき}（{底面積|ていめんせき}）を {計算|けいさん}してから、{高|たか}さを かけよう。<br>${DECI}`],
  ];

  // 算数の シリーズに「⑱ 図形」を たす
  const math = SUBJECTS.find(s => s.id === 'math'), COL = '⑱ 図形';
  if (!REPORT_COLUMNS[1].cols.includes(COL)) REPORT_COLUMNS[1].cols.push(COL);
  const ids = UN.map((u, i) => {
    const id = `m18-${i + 1}`, [name, gen, ...lecture] = u;
    UNITS[id] = { id, subject: 'math', series: 'm18', name, col: COL, pass: 0.8, make: ten(gen), lecture };
    return id;
  });
  math.series.push({ id: 'm18', name: '⑱ {図形|ずけい}', units: ids });
  window.Zukei = { fold, NETS, NOTNETS, canon };   // テスト用
})();
