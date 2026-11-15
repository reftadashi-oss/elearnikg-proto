// 詰将棋（駒の動かし方・成る／打てない場所・詰みの見分け・1手詰）。単元の分け方と合格ライン8割は仮。3手詰は tsume3_data.js、5手詰は tsume5_data.js。
// 問題は本や過去問から写さない（仕様書 4-8）。プログラムが盤を作り、本当に詰むか・答えが1つかをプログラムが確かめる。
// 盤は右上の5×5だけ表示する。玉方は残りの駒を全部持っている決まり。離れた所からの王手は、無駄合しかできないときだけ詰み（isMate の上の説明）。
const Tsume = (() => {
  const ORTH = [[0, -1], [0, 1], [-1, 0], [1, 0]], DIAG = [[-1, -1], [1, -1], [-1, 1], [1, 1]], KING = [...ORTH, ...DIAG];
  const GOLD = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]];
  const SL = { 香: [[0, -1]], 飛: ORTH, 角: DIAG, 竜: ORTH, 馬: DIAG };
  const ST = { 歩: [[0, -1]], 桂: [[-1, -2], [1, -2]], 銀: [[-1, -1], [0, -1], [1, -1], [-1, 1], [1, 1]], 金: GOLD, と: GOLD, 成香: GOLD, 成桂: GOLD, 成銀: GOLD, 玉: KING, 竜: DIAG, 馬: ORTH };
  const PR = { 歩: 'と', 香: '成香', 桂: '成桂', 銀: '成銀', 飛: '竜', 角: '馬' };
  const sq = (f, r) => f * 10 + r, F = s => Math.floor(s / 10), Rk = s => s % 10, on = (f, r) => f >= 1 && f <= 9 && r >= 1 && r <= 9;

  function targets(b, s) {
    const p = b.get(s), out = [], f = F(s), r = Rk(s);
    (ST[p.t] || []).forEach(([x, y]) => { const a = f + x * p.s, c = r + y * p.s; if (on(a, c)) { const q = b.get(sq(a, c)); if (!q || q.s !== p.s) out.push(sq(a, c)); } });
    (SL[p.t] || []).forEach(([x, y]) => { for (let a = f + x * p.s, c = r + y * p.s; on(a, c); a += x * p.s, c += y * p.s) { const q = b.get(sq(a, c)); if (q && q.s === p.s) break; out.push(sq(a, c)); if (q) break; } });
    return out;
  }
  const kingOf = b => [...b].find(([, p]) => p.t === '玉' && p.s === -1)[0];
  const attackers = (b, t) => [...b].filter(([s, p]) => p.s === 1 && targets(b, s).includes(t)).map(x => x[0]);
  const move = (b, from, to, t) => { const n = new Map(b), p = from ? n.get(from) : { s: 1 }; if (from) n.delete(from); n.set(to, { t: t || p.t, s: p.s }); return n; };
  const far = (s, k) => Math.max(Math.abs(F(s) - F(k)), Math.abs(Rk(s) - Rk(k))) > 1;
  // ---- 合駒（2026年11月13日 社長回答 1-3 B：一般的な 詰将棋の 決まりに 合わせる） ----
  // 玉方の 持ち駒は「残り駒 全部」。盤の 駒と 攻め方の 持ち駒で 使いきった 種類は 打てない（売り切れ）。
  // 無駄合（取られるだけで 詰む 手順が かわらない 合駒）は 手数に 数えない。ROOT では「攻め方が その合駒を 取って、
  // その手で 詰む」合駒を 無駄合と する。盤の 駒を 動かす 合駒（移動合）は いつも 有効な 応手と する（どちらも 仮）。
  const TOTAL = { 歩: 18, 香: 4, 桂: 4, 銀: 4, 金: 4, 角: 2, 飛: 2 }, BASE = { と: '歩', 成香: '香', 成桂: '桂', 成銀: '銀', 竜: '飛', 馬: '角' };
  function spare(b, hand) {
    const c = { ...TOTAL };
    for (const [, p] of b) { const t = BASE[p.t] || p.t; if (t in c) c[t]--; }
    hand.forEach(t => { if (t in c) c[t]--; });
    return Object.keys(c).filter(t => c[t] > 0);
  }
  const between = (a, k) => { const df = Math.sign(F(k) - F(a)), dr = Math.sign(Rk(k) - Rk(a)), out = []; for (let f = F(a) + df, r = Rk(a) + dr; sq(f, r) !== k; f += df, r += dr) out.push(sq(f, r)); return out; };
  const pawnIn = (b, f, side) => [...b].some(([s, p]) => p.t === '歩' && p.s === side && F(s) === f);
  // 攻め方の駒が from から to へ 動くときの 駒の形（成る・成らない。成らないと 動けない 場所は 成るだけ）
  const shapes = (t, from, to) => [...(validAt(t, Rk(to)) ? [t] : []), ...(PR[t] && (Rk(to) <= 3 || Rk(from) <= 3) ? [PR[t]] : [])];
  // 合駒を 打つ 応手：［マス, 駒］の 一覧（遠くからの 王手が 1つの ときだけ）
  function dropBlocks(b, hand) {
    const k = kingOf(b), at = attackers(b, k);
    if (at.length !== 1 || !SL[b.get(at[0]).t] || !far(at[0], k)) return [];
    const types = spare(b, hand), out = [];
    for (const x of between(at[0], k)) for (const t of types) if (!(t === '歩' && pawnIn(b, F(x), -1))) out.push([x, t]);
    return out;
  }
  // 攻め方が m と 指した あとの 持ち駒（とった駒は 成る前の 形で 持ち駒に なる）
  const handAfter = (b, hand, m) => { const h = [...hand]; if (m.from === 0) h.splice(h.indexOf(m.t), 1); const c = b.get(m.to); if (c && c.s === -1) h.push(BASE[c.t] || c.t); return h; };
  // 王手への 玉方の 応手：盤の駒を 動かす（玉が 逃げる・とる・移動合）＋ 合駒を 打つ（from＝0）
  const repliesOf = (n, hand = []) => {
    const reps = [];
    for (const [s, p] of n) if (p.s === -1) for (const to of targets(n, s)) { const r = move(n, s, to); if (!attackers(r, kingOf(r)).length) reps.push({ from: s, to, r }); }
    for (const [x, t] of dropBlocks(n, hand)) { const r = new Map(n); r.set(x, { t, s: -1 }); reps.push({ from: 0, to: x, t, r }); }
    return reps;
  };
  // hand＝いまの 攻め方の 持ち駒（残り駒を 数えるため）
  function isMate(b, hand = [], depth = 0) {
    const k = kingOf(b), at = attackers(b, k);
    if (!at.length) return false;
    for (const [s, p] of b) if (p.s === -1) for (const to of targets(b, s)) { const n = move(b, s, to), nk = kingOf(n); if (!attackers(n, nk).length) return false; }
    // 合駒：1つでも 無駄合で ないものが あれば 詰みではない
    for (const [x, t] of dropBlocks(b, hand)) {
      const n = new Map(b); n.set(x, { t, s: -1 });
      const h2 = [...hand, t];
      const muda = depth < 6 && [...n].some(([s, p]) => p.s === 1 && targets(n, s).includes(x) && shapes(p.t, s, x).some(nt => isMate(move(n, s, x, nt), h2, depth + 1)));
      if (!muda) return false;
    }
    return true;
  }
  // 攻め方の手を全部（from=0 は持ち駒を打つ。盤は表示の5×5の中だけ）
  function allMoves(b, hand) {
    const m = [];
    for (const [s, p] of b) if (p.s === 1) for (const to of targets(b, s)) {
      const r = Rk(to), must = (p.t === '歩' || p.t === '香') ? r === 1 : p.t === '桂' ? r <= 2 : false;
      if (!must) m.push({ from: s, to, t: p.t });
      if (PR[p.t] && (r <= 3 || Rk(s) <= 3)) m.push({ from: s, to, t: PR[p.t] });
    }
    [...new Set(hand)].forEach(t => { for (let f = 1; f <= 5; f++) for (let r = 1; r <= 5; r++) { if (b.has(sq(f, r)) || (t === '香' && r < 2) || (t === '桂' && r < 3)) continue; m.push({ from: 0, to: sq(f, r), t }); } });
    return m;
  }
  const mates = (b, hand) => allMoves(b, hand).filter(m => isMate(move(b, m.from, m.to, m.t), handAfter(b, hand, m)));
  const pick = a => a[rand(0, a.length - 1)];
  const validAt = (t, r) => !((t === '歩' || t === '香') && r === 1) && !(t === '桂' && r <= 2);
  // 二歩（同じ人の歩が、同じ たての列に 2枚）の盤は、本当の将棋では できないので 問題にしない
  const nifu = b => { const seen = new Set(); for (const [s, p] of b) if (p.t === '歩') { const k = F(s) + '/' + p.s; if (seen.has(k)) return true; seen.add(k); } return false; };

  // 1手詰を1つ作る。hands＝持ち駒の候補（空なら盤の駒を動かす問題）、waste＝むだな駒を足す
  function puzzle({ hands, waste, at, corner, more }) {
    const SUP = ['金', '銀', '飛', '角', '歩', '桂', '香'];
    for (let n = 0; n < (more ? 40000 : 6000); n++) {
      const kf = corner ? 1 : more ? rand(1, 2) : rand(1, 4), kr = corner ? 1 : more ? 2 : rand(1, 2), b = new Map([[sq(kf, kr), { t: '玉', s: -1 }]]);
      const hand = hands.length ? [pick(hands)] : [], cnt = more ? rand(2, 4) : rand(1, 2);
      const put = (t, s) => { for (let i = 0; i < 30; i++) { const f = rand(Math.max(1, kf - 2), Math.min(5, kf + 2)), r = rand(1, Math.min(5, kr + 3)); if (!b.has(sq(f, r)) && validAt(t, r)) { b.set(sq(f, r), { t, s }); return sq(f, r); } } return 0; };
      const sup = []; for (let i = 0; i < cnt; i++) { const s = put(pick(SUP), 1); if (s) sup.push(s); }
      if (more) for (let i = rand(1, 3); i > 0; i--) put(pick(['歩', '金', '銀']), -1); else if (rand(0, 2) === 0) put(pick(['歩', '金', '銀']), -1);
      if (nifu(b) || attackers(b, kingOf(b)).length) continue;
      let sol = mates(b, hand);
      const tos = [...new Set(sol.map(m => m.to))];
      if (tos.length !== 1) continue;
      if (at && !at.some(([x, y]) => tos[0] === sq(kf + x, kr + y))) continue;   // 詰みの型：玉から見て決まった場所に打つ問題だけ
      if (hands.length ? !sol.every(m => m.from === 0) : !sol.every(m => m.from !== 0)) continue;
      if (new Set(sol.map(m => m.from)).size !== 1) continue;   // 詰ます手は1とおり（成・不成のちがいは同じ手と見る）
      // むだな駒がないこと：攻め方の駒を1つのぞくと詰まなくなる
      if (sup.some(s => { const c = new Map(b); c.delete(s); return !attackers(c, kingOf(c)).length && mates(c, hand).length; })) continue;
      if (waste) {
        const s = put(pick(SUP), 1); if (!s) continue;
        if (nifu(b) || attackers(b, kingOf(b)).length) continue;
        sol = mates(b, hand); const t2 = [...new Set(sol.map(m => m.to))];
        if (t2.length !== 1 || t2[0] !== tos[0] || new Set(sol.map(m => m.from)).size !== 1) continue;
      }
      return { b, hand, to: tos[0], mv: sol[0] };
    }
    return null;
  }

  // ---- 画面 ----
  const PROMOTED = new Set(['と', '成香', '成桂', '成銀', '竜', '馬']);
  const piece = (p, attr = '') => `<span class="km${p.s < 0 ? ' g' : ''}${PROMOTED.has(p.t) ? ' pr' : ''}${p.t.length > 1 ? ' two' : ''}"${attr}>[[${p.t}]]</span>`;
  const handHTML = (hand, live) => `<div class="hd"><span class="hl">{持|も}ち{駒|ごま}</span>${hand.length ? hand.map(t => piece({ t, s: 1 }, live ? ` data-h="${t}"` : '')).join('') : '<span class="hl">なし</span>'}</div>`;
  // marks：{マス:番号}。番号のマスは押せる。live＝駒をドラッグできる盤。last＝黄色にするマス
  function boardHTML(b, marks, live, last) {
    let h = '<table class="sg"><tr>' + [5, 4, 3, 2, 1].map(f => `<th>${f}</th>`).join('') + '<th></th></tr>';
    for (let r = 1; r <= 5; r++) {
      h += '<tr>';
      for (let f = 5; f >= 1; f--) {
        const s = sq(f, r), p = b.get(s), m = marks && marks[s];
        const a = m ? ` class="ck" onclick="Tsume.pickAns('${m}')"` : `${live ? ` data-s="${s}"` : ''}${s === last ? ' class="ls"' : ''}`;
        h += `<td${a}>${m ? `<b class="sgm">${m}</b>` : p ? piece(p, live && p.s === 1 ? ` data-f="${s}"` : '') : ''}</td>`;
      }
      h += `<th>${r}</th></tr>`;
    }
    return h + '</table>';
  }
  function pickAns(v) { const el = document.querySelector('.ans'); if (!el) return; el.dataset.raw = String(v); el.value = String(v); document.getElementById('ok').click(); }

  // ---- 3手詰 ----
  // 問題は tsume3_data.js（gen3 で作り、verify3 で全部確かめた問題集）。玉方の応手が1つだけで、1手目も3手目も1とおりの問題だけを使う。
  // 遠くからの 王手も 使える（1-3 B）。そのときは 玉方の 合駒（打つ）も 応手に 入れて 調べる。
  // 無駄合も 入れて 調べるが、無駄合は「取って 詰む」ので、勝ち負けは かわらない（応手の数が ふえて、問題に えらばれにくく なるだけ）。
  const noPawnDrop = l => l.filter(m => !(m.from === 0 && m.t === '歩'));   // 打ち歩詰めは反則
  function solve3(b, hand) {
    const wins = [];
    for (const m of allMoves(b, hand)) {
      const n = move(b, m.from, m.to, m.t), k = kingOf(n), at = attackers(n, k);
      if (!at.length) continue;
      const h2 = handAfter(b, hand, m);
      const reps = repliesOf(n, h2);
      if (!reps.length) continue;
      const lines = reps.map(r => noPawnDrop(mates(r.r, h2)));
      if (lines.every(l => l.length)) wins.push({ m, reps, lines });
    }
    return wins;
  }
  // 1手目・応手・3手目がそれぞれ1とおりなら答えを返す
  function unique3(b, hand) {
    if (attackers(b, kingOf(b)).length || noPawnDrop(mates(b, hand)).length) return null;
    const w = solve3(b, hand);
    if (!w.length || new Set(w.map(x => x.m.from + '/' + x.m.to + (x.m.from ? '' : x.m.t))).size !== 1) return null;
    if (w.some(x => x.reps.length !== 1)) return null;
    const l = w.flatMap(x => x.lines[0]);
    if (new Set(l.map(m => m.to)).size !== 1 || new Set(l.map(m => m.from)).size !== 1) return null;
    return { m: [w[0].m.from, w[0].m.to, w[0].m.t], r: [w[0].reps[0].from, w[0].reps[0].to], a: l[0].to };
  }
  const load3 = p => new Map(p.b.map(([s, t, d]) => [s, { t, s: d }]));
  const same3 = (x, y) => x && y && x.m.join() === y.m.join() && x.r.join() === y.r.join() && x.a === y.a;
  // むだな駒がない：盤の攻め方の駒、持ち駒のどれを1つのぞいても、同じ手順では詰まなくなる
  function noWaste(b, hand, ans) {
    for (const [s, p] of b) if (p.s === 1) { const c = new Map(b); c.delete(s); if (!attackers(c, kingOf(c)).length && solve3(c, hand).length) return false; }
    return hand.every((t, i) => !solve3(b, hand.filter((_, j) => j !== i)).length) && !!ans;
  }
  function gen3Once() {
    const SUP = ['金', '銀', '飛', '角', '桂', '香', '歩'], HD = ['金', '銀', '飛', '角', '桂', '香'];
    const kf = rand(1, 4), kr = rand(1, 2), b = new Map([[sq(kf, kr), { t: '玉', s: -1 }]]);
    const put = (t, s) => { for (let i = 0; i < 30; i++) { const f = rand(Math.max(1, kf - 2), Math.min(5, kf + 2)), r = rand(1, Math.min(5, kr + 3)); if (!b.has(sq(f, r)) && validAt(t, r)) { b.set(sq(f, r), { t, s }); return sq(f, r); } } return 0; };
    const hand = []; for (let i = rand(1, 2); i > 0; i--) hand.push(pick(HD));
    for (let i = rand(1, 3); i > 0; i--) put(pick(SUP), 1);
    for (let i = rand(0, 2); i > 0; i--) put(pick(['歩', '金', '銀']), -1);
    const ans = unique3(b, hand);
    if (!ans || !noWaste(b, hand, ans)) return null;
    return Object.assign({ b: [...b].map(([s, p]) => [s, p.t, p.s]), h: hand }, ans);
  }
  // 問題集に、使わない駒を1つ足す。足しても答えが1つのままか、そのつどプログラムで確かめる
  function addWaste(p) {
    const SUP = ['金', '銀', '飛', '角', '桂', '香', '歩'], b = load3(p);
    for (let n = 0; n < 40; n++) {
      const s = sq(rand(1, 5), rand(1, 5)), t = pick(SUP);
      if (b.has(s) || !validAt(t, Rk(s))) continue;
      const c = new Map(b); c.set(s, { t, s: 1 });
      if (nifu(c)) continue;
      if (same3(unique3(c, p.h), p)) return [s, t];
    }
    return null;
  }
  async function gen3(want, ms) {
    const out = new Map(), end = Date.now() + ms;
    while (out.size < want && Date.now() < end) { for (let i = 0; i < 300; i++) { const p = gen3Once(); if (p) out.set(JSON.stringify([p.b.sort((x, y) => x[0] - y[0]), p.h.sort()]), p); } await new Promise(r => setTimeout(r)); }
    return [...out.values()];
  }
  // 問題集を全部確かめる（まちがっている問題の数を返す）
  const verify3 = list => list.filter(p => !same3(unique3(load3(p), p.h), p)).length;

  // ---- 5手詰（3手詰と同じ考え方を1段ふやす） ----
  // 王手 → 相手の応手（どれでも）→ そのあと1手詰か3手詰になる手を、全部さがす
  function solve5(b, hand) {
    const wins = [];
    for (const m of allMoves(b, hand)) {
      const n = move(b, m.from, m.to, m.t), k = kingOf(n), at = attackers(n, k);
      if (!at.length) continue;
      const h2 = handAfter(b, hand, m);
      const reps = repliesOf(n, h2);
      if (!reps.length) continue;
      if (reps.every(r => noPawnDrop(mates(r.r, h2)).length || solve3(r.r, h2).length)) wins.push({ m, reps, h2 });
    }
    return wins;
  }
  // 5手詰で、1手目・応手・3手目・応手・5手目がそれぞれ1とおりなら答えを返す（3手目からは unique3 で確かめる）
  function unique5(b, hand) {
    if (attackers(b, kingOf(b)).length || noPawnDrop(mates(b, hand)).length || solve3(b, hand).length) return null;
    const w = solve5(b, hand);
    if (w.length !== 1 || w[0].reps.length !== 1) return null;
    const r = w[0].reps[0], rest = unique3(r.r, w[0].h2);
    if (!rest) return null;
    return { m: [w[0].m.from, w[0].m.to, w[0].m.t], r: [r.from, r.to], m3: rest.m, r2: rest.r, a: rest.a };
  }
  const same5 = (x, y) => x && y && ['m', 'r', 'm3', 'r2'].every(k => x[k].join() === y[k].join()) && x.a === y.a;
  function noWaste5(b, hand) {
    for (const [s, p] of b) if (p.s === 1) { const c = new Map(b); c.delete(s); if (!attackers(c, kingOf(c)).length && solve5(c, hand).length) return false; }
    return hand.every((t, i) => !solve5(b, hand.filter((_, j) => j !== i)).length);
  }
  function gen5Once() {
    const SUP = ['金', '銀', '飛', '角', '桂', '香', '歩'], HD = ['金', '銀', '飛', '角', '桂', '香'];
    const kf = rand(1, 4), kr = rand(1, 3), b = new Map([[sq(kf, kr), { t: '玉', s: -1 }]]);
    const put = (t, s) => { for (let i = 0; i < 30; i++) { const f = rand(Math.max(1, kf - 2), Math.min(5, kf + 2)), r = rand(1, Math.min(5, kr + 3)); if (!b.has(sq(f, r)) && validAt(t, r)) { b.set(sq(f, r), { t, s }); return sq(f, r); } } return 0; };
    const hand = []; for (let i = rand(1, 3); i > 0; i--) hand.push(pick(HD));
    for (let i = rand(1, 3); i > 0; i--) put(pick(SUP), 1);
    for (let i = rand(0, 3); i > 0; i--) put(pick(['歩', '金', '銀', '香']), -1);
    const ans = unique5(b, hand);
    if (!ans || !noWaste5(b, hand)) return null;
    return Object.assign({ b: [...b].map(([s, p]) => [s, p.t, p.s]), h: hand }, ans);
  }
  async function gen5(want, ms) {
    const out = new Map(), end = Date.now() + ms;
    while (out.size < want && Date.now() < end) { for (let i = 0; i < 100; i++) { const p = gen5Once(); if (p) out.set(JSON.stringify([p.b.sort((x, y) => x[0] - y[0]), p.h.sort()]), p); } await new Promise(r => setTimeout(r)); }
    return [...out.values()];
  }
  const verify5 = list => list.filter(p => !same5(unique5(load3(p), p.h), p)).length;
  // ---- 駒をドラッグして答える ----
  const keyOf = b => [...b].sort((a, c) => a[0] - c[0]).map(([s, x]) => s + x.t + x.s).join();
  const loadKey = k => new Map([...k.matchAll(/(\d\d)([^\d,-]+)(-?1)/g)].map(m => [+m[1], { t: m[2], s: +m[3] }]));
  const tbBody = (b, hand, msg, last) => `${boardHTML(b, null, true, last)}${handHTML(hand, true)}<p class="wp ms">${msg}</p>`;
  const stateOf = tb => ({ b: loadKey(tb.dataset.b), h: tb.dataset.h ? tb.dataset.h.split(',') : [] });
  function legalSquares(tb, from, t) {
    const { b } = stateOf(tb);
    if (from) return targets(b, from).filter(s => F(s) <= 5 && Rk(s) <= 5);
    const out = []; for (let f = 1; f <= 5; f++) for (let r = 1; r <= 5; r++) if (!b.has(sq(f, r)) && validAt(t, r)) out.push(sq(f, r));
    return out;
  }
  let drag = null, busy = false;
  const moveGhost = e => { drag.g.style.left = e.clientX + 'px'; drag.g.style.top = e.clientY + 'px'; };
  document.addEventListener('pointerdown', e => {
    const k = e.target.closest && e.target.closest('.q .tb .km[data-f], .q .tb .km[data-h]');
    if (!k || busy || !document.querySelector('.ans')) return;
    e.preventDefault();
    const tb = k.closest('.tb'), from = +(k.dataset.f || 0), t = k.dataset.h || stateOf(tb).b.get(from).t, ok = legalSquares(tb, from, t);
    tb.querySelectorAll('td[data-s]').forEach(c => { if (ok.includes(+c.dataset.s)) c.classList.add('ok'); });
    const g = k.cloneNode(true); g.classList.add('gh'); document.body.appendChild(g);
    k.style.opacity = '.3';
    drag = { k, g, tb, from, t, ok }; moveGhost(e);
  });
  window.addEventListener('pointermove', e => { if (drag) moveGhost(e); });
  function endDrag(e, cancel) {
    if (!drag) return;
    const d = drag; drag = null; d.g.remove(); d.k.style.opacity = '';
    d.tb.querySelectorAll('td.ok').forEach(c => c.classList.remove('ok'));
    if (cancel) return;
    const el = document.elementFromPoint(e.clientX, e.clientY), td = el && el.closest('td[data-s]');
    if (td && d.tb.contains(td) && d.ok.includes(+td.dataset.s)) play(d.tb, d.from, +td.dataset.s, d.t);
  }
  window.addEventListener('pointerup', e => endDrag(e));
  window.addEventListener('pointercancel', e => endDrag(e, true));
  const draw = (tb, b, h, msg, last) => { tb.innerHTML = R(tbBody(b, h, msg, last)); };
  // 正解は ○「詰み！」、まちがいは ×。盤の上に大きく出してから、つぎの問題へ
  const finish = (tb, b, h, right, last, value) => {
    busy = true; draw(tb, b, h, right ? '{詰|つ}み！' : 'ざんねん。{詰|つ}まなかったよ。', last);
    tb.insertAdjacentHTML('beforeend', `<div class="mk ${right ? 'mo' : 'mx'}">${right ? '○' : '×'}</div>`);
    setTimeout(() => { busy = false; pickAns(value); }, 1200);
  };
  // 成る・成らない：成れる場所なら、子どもがえらぶ。成らないと動けなくなる場所（歩・香の1段目、桂の1・2段目）は、かならず成る
  let pending = null;
  function play(tb, from, to, t) {
    if (!from || !PR[t] || !(Rk(to) <= 3 || Rk(from) <= 3)) return go(tb, from, to, t, t);
    if (((t === '歩' || t === '香') && Rk(to) === 1) || (t === '桂' && Rk(to) <= 2)) return go(tb, from, to, t, PR[t]);
    const { b, h } = stateOf(tb);
    busy = true; pending = { tb, from, to, t };
    draw(tb, move(b, from, to, t), h, '{成|な}る？ {成|な}らない？', to);
    tb.insertAdjacentHTML('beforeend', R(`<div class="pm"><button data-pm="1">${piece({ t: PR[t], s: 1 })}<br>{成|な}る</button><button data-pm="0">${piece({ t, s: 1 })}<br>{成|な}らない</button></div>`));
  }
  document.addEventListener('click', e => {
    const btn = e.target.closest && e.target.closest('.pm button'); if (!btn || !pending) return;
    const { tb, from, to, t } = pending; pending = null; busy = false;
    go(tb, from, to, t, btn.dataset.pm === '1' ? PR[t] : t);
  });
  // t：動かした駒（打つときは持ち駒）、nt：動かしたあとの駒
  function go(tb, from, to, t, nt) {
    const { b, h } = stateOf(tb), left = [...h]; if (!from) left.splice(left.indexOf(t), 1);
    const moved = move(b, from, to, nt), c = b.get(to); if (c) left.push(c.t);
    const same = m => m.from === from && m.to === to && m.t === nt;
    const five = tb.classList.contains('t5');
    if (!tb.classList.contains('t3') && !five) {
      const right = !(from === 0 && nt === '歩') && isMate(moved, left);   // 詰めば正解（打ち歩詰めは反則）
      return finish(tb, moved, left, right, to, right ? to : to * 100);
    }
    // 3手詰：stage 0→1。5手詰：stage 0→1→2。答えの数は 3手詰＝1手目×100＋3手目、5手詰＝1手目×10000＋3手目×100＋5手目
    const p = (five ? TSUME5 : TSUME3).plain[+tb.dataset.i], stage = +(tb.dataset.stage || 0), lastStage = five ? 2 : 1;
    const base = five ? p.m[1] * 10000 + p.m3[1] * 100 : p.m[1] * 100;
    if (stage === lastStage) {
      const right = noPawnDrop(mates(b, h)).some(same);
      return finish(tb, moved, left, right, to, base + (right ? p.a : to !== p.a ? to : 0));
    }
    // とちゅうの手：そのあと相手がどう動いても詰ませられる手なら正解
    const win = (five && stage === 0 ? solve5(b, h) : solve3(b, h)).find(w => same(w.m));
    if (!win) return finish(tb, moved, left, false, to, five ? (stage === 0 ? to * 10000 : p.m[1] * 10000 + to * 100) : to * 100);
    const rep = win.reps[0], next = stage + 1, nth = ['1', '3', '5'][next];
    busy = true; tb.dataset.stage = String(next);
    draw(tb, moved, left, '{相手|あいて}の {番|ばん}だよ…', to);
    setTimeout(() => {
      busy = false; tb.dataset.b = keyOf(rep.r); tb.dataset.h = left.join();
      draw(tb, rep.r, left, `{相手|あいて}が {黄色|きいろ}の マスに {動|うご}いたよ。${nth}{手|て}{目|め}${next === lastStage ? 'で {詰|つ}ませよう' : 'を さそう'}。`, rep.to);
    }, 900);
  }

  // ---- 問題 ----
  const q3 = waste => () => {
    let i, p, x = null;
    for (;;) { i = rand(0, TSUME3.plain.length - 1); p = TSUME3.plain[i]; if (!waste) break; x = addWaste(p); if (x) break; }
    const b = load3(p); if (x) b.set(x[0], { t: x[1], s: 1 });
    return { key: `${i}/${x || ''}`, text: `<div class="tb t3" data-i="${i}" data-b="${keyOf(b)}" data-h="${p.h}">${tbBody(b, p.h, '3{手|て}で {詰|つ}ませよう。まず 1{手|て}{目|め}。{駒|こま}を ドラッグして {動|うご}かそう。')}</div>`, boxes: ['マス'], answer: [p.m[1] * 100 + p.a] };
  };
  const q5 = () => {
    const i = rand(0, TSUME5.plain.length - 1), p = TSUME5.plain[i], b = load3(p);
    return { key: `5/${i}`, text: `<div class="tb t5" data-i="${i}" data-b="${keyOf(b)}" data-h="${p.h}">${tbBody(b, p.h, '5{手|て}で {詰|つ}ませよう。まず 1{手|て}{目|め}。{駒|こま}を ドラッグして {動|うご}かそう。')}</div>`, boxes: ['マス'], answer: [p.m[1] * 10000 + p.m3[1] * 100 + p.a] };
  };
  const oneQ = (b, hand, to, from) => {
    const key = keyOf(b) + hand;
    return { key, text: `<div class="tb" data-b="${keyOf(b)}" data-h="${hand}" data-sol="${from},${to}">${tbBody(b, hand, '1{手|て}で {詰|つ}ませよう。{駒|こま}を ドラッグして {動|うご}かそう。')}</div>`, boxes: ['マス'], answer: [to] };
  };
  // 作れた 問題は ためて おく（POOL）。作れない とき（合駒の 決まりで [[香]]などは 作りにくい）は、ためた 問題を 使う（2026年11月13日）
  const POOL = new Map();
  const tsumeQ = opt => () => {
    const k = JSON.stringify(opt), pool = POOL.get(k) || POOL.set(k, []).get(k);
    let p = puzzle(opt);
    for (let i = 0; !p && !pool.length && i < 20; i++) p = puzzle(opt);
    if (p) { if (pool.length < 60) pool.push(p); else pool[rand(0, 59)] = p; } else p = pick(pool);
    if (!p) throw new Error('問題を作れません');
    return oneQ(p.b, p.hand, p.to, p.mv.from);
  };
  const shiriQ = () => { const [k, to] = pick(TSUME_SHIRI); return oneQ(loadKey(k), ['金'], to, 0); };
  const checkShiri = () => TSUME_SHIRI.filter(([k, to]) => { const b = loadKey(k), l = mates(b, ['金']); return l.length !== 1 || l[0].to !== to || l[0].from !== 0; }).length;
  // 動かし方：3つの番号のうち、1回で行けるマスを1つ
  const moveQ = types => () => {
    for (;;) {
      const t = pick(types), from = sq(3, 4), b = new Map([[from, { t, s: 1 }]]), ok = targets(b, from).filter(s => F(s) <= 5 && Rk(s) <= 5);
      const ng = []; for (let f = 1; f <= 5; f++) for (let r = 1; r <= 5; r++) { const s = sq(f, r); if (s !== from && !ok.includes(s)) ng.push(s); }
      if (!ok.length || ng.length < 2) continue;
      const cand = shuffle([pick(ok), ...shuffle(ng).slice(0, 2)]), correct = cand.findIndex(s => ok.includes(s)) + 1, marks = {};
      cand.forEach((s, i) => marks[s] = i + 1);
      return { key: t + cand.join(), text: `${boardHTML(b, marks)}<span class="wp">[[${t}]]が 1{回|かい}で {行|い}ける マスは {何番|なんばん}？</span>`, boxes: ['{番号|ばんごう}'], answer: [correct] };
    }
  };
  // 詰みの見分け
  const mateQ = () => {
    const want = rand(0, 1) === 1, OPT = ['{詰|つ}んで いる', 'まだ {逃|に}げられる'];
    for (let n = 0; n < 8000; n++) {
      const kf = rand(1, 4), kr = rand(1, 2), b = new Map([[sq(kf, kr), { t: '玉', s: -1 }]]);
      for (let i = rand(2, 3); i > 0; i--) { const t = pick(['金', '銀', '飛', '角', '歩', '桂', '香']), f = rand(Math.max(1, kf - 2), Math.min(5, kf + 2)), r = rand(1, Math.min(5, kr + 3)); if (!b.has(sq(f, r)) && validAt(t, r)) b.set(sq(f, r), { t, s: 1 }); }
      if (nifu(b) || !attackers(b, kingOf(b)).length || isMate(b) !== want) continue;
      const o = shuffle(OPT);
      return { key: [...b].sort((a, c) => a[0] - c[0]).map(([s, x]) => s + x.t).join(), text: `${boardHTML(b)}<span class="wp">{王手|おうて}が かかって います。{玉|ぎょく}は どう？<br><span class="ch">${o.map((x, i) => `<b>${i + 1}</b> ${x}`).join('　')}</span></span>`, boxes: ['{番号|ばんごう}'], answer: [o.indexOf(OPT[want ? 0 : 1]) + 1] };
    }
    throw new Error('問題を作れません');
  };
  const ten = gen => () => {
    let arr = [];
    for (let t = 0; t < 30; t++) {
      const m = new Map();
      for (let i = 0; i < 60 && m.size < 10; i++) { const x = gen(); if (!m.has(x.key)) m.set(x.key, x); }
      arr = shuffle([...m.values()]).slice(0, 10);
      for (let i = 0; arr.length < 10; i++) arr.push(arr[i]);
      const c = {}; arr.forEach(x => c[x.answer[0]] = (c[x.answer[0]] || 0) + 1);
      if (Math.max(...Object.values(c)) <= 6) return arr;
    }
    return arr;
  };
  const C = (s, opts, c) => { const o = shuffle(opts); return { key: s, text: `${s}<br><span class="ch">${o.map((x, i) => `<b>${i + 1}</b> ${x}`).join('　')}</span>`, boxes: [''], answer: [o.indexOf(c) + 1] }; };
  const RULES = [
    ['[[飛]]が {成|な}ると {何|なに}に なる？', ['[[竜]]', '[[馬]]', '[[と]]'], '[[竜]]'],
    ['[[角]]が {成|な}ると {何|なに}に なる？', ['[[馬]]', '[[竜]]', '[[と]]'], '[[馬]]'],
    ['[[歩]]が {成|な}ると {何|なに}に なる？', ['[[と]]', '[[馬]]', '[[竜]]'], '[[と]]'],
    ['[[と]]の {動|うご}きは、どの {駒|こま}と {同|おな}じ？', ['[[金]]', '[[銀]]', '[[玉]]'], '[[金]]'],
    ['[[成銀]]の {動|うご}きは、どの {駒|こま}と {同|おな}じ？', ['[[金]]', '[[銀]]', '[[飛]]'], '[[金]]'],
    ['{成|な}ることが できない {駒|こま}は？', ['[[金]]', '[[銀]]', '[[桂]]'], '[[金]]'],
    ['{駒|こま}が {成|な}れるのは、{相手|あいて}の {陣地|じんち}の {何段|なんだん}？', ['3{段|だん}', '1{段|だん}', '5{段|だん}'], '3{段|だん}'],
    ['{同|おな}じ {縦|たて}の {列|れつ}に {自分|じぶん}の [[歩]]が ある とき、もう1{枚|まい} [[歩]]を {打|う}つのは？', ['{反則|はんそく}（{二歩|にふ}）', '{打|う}ってよい', '{成|な}れば よい'], '{反則|はんそく}（{二歩|にふ}）'],
    ['[[歩]]を {打|う}てない {段|だん}は？', ['いちばん {奥|おく}の {段|だん}', 'まん{中|なか}の {段|だん}', '{手前|てまえ}の {段|だん}'], 'いちばん {奥|おく}の {段|だん}'],
    ['[[桂]]を {打|う}てない {段|だん}は？', ['{奥|おく}の 2{段|だん}', '{奥|おく}の 1{段|だん}だけ', '{手前|てまえ}の 2{段|だん}'], '{奥|おく}の 2{段|だん}'],
    ['[[歩]]を {打|う}って すぐ {詰|つ}ませるのは？', ['{反則|はんそく}（{打|う}ち{歩|ふ}{詰|づ}め）', 'よい {手|て}', '{成|な}れば よい'], '{反則|はんそく}（{打|う}ち{歩|ふ}{詰|づ}め）'],
    ['とった {相手|あいて}の {駒|こま}は どう なる？', ['{持|も}ち{駒|ごま}に なる', 'なくなる', '{相手|あいて}に {返|かえ}す'], '{持|も}ち{駒|ごま}に なる'],
    ['[[銀]]が {成|な}ると {何|なに}に なる？', ['[[成銀]]', '[[金]]', '[[と]]'], '[[成銀]]'],
    ['[[桂]]が {成|な}ると {何|なに}に なる？', ['[[成桂]]', '[[馬]]', '[[と]]'], '[[成桂]]'],
    ['[[香]]が {成|な}ると {何|なに}に なる？', ['[[成香]]', '[[竜]]', '[[と]]'], '[[成香]]'],
    ['[[成桂]]の {動|うご}きは、どの {駒|こま}と {同|おな}じ？', ['[[金]]', '[[桂]]', '[[銀]]'], '[[金]]'],
    ['[[竜]]の {動|うご}きは？', ['[[飛]]の {動|うご}きと、ななめに 1マス', '[[角]]の {動|うご}きと、たてよこに 1マス', '[[金]]と {同|おな}じ'], '[[飛]]の {動|うご}きと、ななめに 1マス'],
    ['[[馬]]の {動|うご}きは？', ['[[角]]の {動|うご}きと、たてよこに 1マス', '[[飛]]の {動|うご}きと、ななめに 1マス', '[[金]]と {同|おな}じ'], '[[角]]の {動|うご}きと、たてよこに 1マス'],
    ['{成|な}ることが できない {駒|こま}は？', ['[[玉]]', '[[飛]]', '[[歩]]'], '[[玉]]'],
    ['{成|な}れる {場所|ばしょ}に {入|はい}った とき、{成|な}るか {成|な}らないかは？', ['えらべる', 'かならず {成|な}る', 'かならず {成|な}らない'], 'えらべる'],
    ['[[香]]を {打|う}てない {段|だん}は？', ['いちばん {奥|おく}の {段|だん}', '{奥|おく}の 3{段|だん}', '{手前|てまえ}の {段|だん}'], 'いちばん {奥|おく}の {段|だん}'],
    ['{成|な}った {駒|こま}を とったら、{持|も}ち{駒|ごま}では？', ['{成|な}る {前|まえ}の {駒|こま}に もどる', '{成|な}った まま', 'なくなる'], '{成|な}る {前|まえ}の {駒|こま}に もどる'],
    ['{持|も}ち{駒|ごま}を {打|う}つ ときは？', ['{成|な}っていない {形|かたち}で {打|う}つ', '{成|な}った {形|かたち}で {打|う}てる', '{打|う}てない'], '{成|な}っていない {形|かたち}で {打|う}つ'],
    ['{王手|おうて}を かけられたのに {防|ふせ}がないのは？', ['{反則|はんそく}', 'よい {手|て}', '{引|ひ}き{分|わ}け'], '{反則|はんそく}'],
    ['{将棋|しょうぎ}の {盤|ばん}の マスは ぜんぶで いくつ？', ['81', '64', '100'], '81'],
    ['はじめに 1{人|り}が {持|も}つ {駒|こま}は {何枚|なんまい}？', ['20{枚|まい}', '16{枚|まい}', '18{枚|まい}'], '20{枚|まい}'],
    ['{成|な}る {前|まえ}の {駒|こま}の {種類|しゅるい}は いくつ？', ['8{種類|しゅるい}', '6{種類|しゅるい}', '10{種類|しゅるい}'], '8{種類|しゅるい}'],
    ['{相手|あいて}の {玉|ぎょく}を {詰|つ}ませると？', ['{勝|か}ち', '{負|ま}け', '{引|ひ}き{分|わ}け'], '{勝|か}ち'],
    ['{先|さき}に {指|さ}す {人|ひと}を {何|なん}と いう？', ['{先手|せんて}', '{後手|ごて}', '{上手|うわて}'], '{先手|せんて}'],
    ['[[金]]が {動|うご}けない {方向|ほうこう}は？', ['ななめ うしろ', 'まえ', 'よこ'], 'ななめ うしろ'],
    ['{相手|あいて}の {陣地|じんち}から {外|そと}へ {出|で}る ときは？', ['{成|な}れる', '{成|な}れない', '{駒|こま}が なくなる'], '{成|な}れる'],
  ].map(x => C(...x));
  const DR = '{駒|こま}を おしたまま、{行|い}きたい マスまで {動|うご}かして はなそう。{行|い}ける マスは {緑|みどり}に なるよ。';
  const MK = '{盤|ばん}の マスを おすと こたえられるよ（テンキーでも いれられる）。';

  const s = SUBJECTS.find(x => x.id === 'x4'), se = { id: 'x4t', name: '{詰将棋|つめしょうぎ}', units: [] }; s.series.push(se);
  const add = (name, make, ...lecture) => { const id = 'x4t-' + (se.units.length + 1); UNITS[id] = { id, subject: 'x4', series: 'x4t', name, col: '詰将棋', pass: 0.8, make, lecture }; se.units.push(id); };
  const moveL = n => [`${n}の {動|うご}かし{方|かた}を おぼえよう。{番号|ばんごう}の マスから、1{回|かい}で {行|い}ける マスを えらんでね。`, MK];
  add('{駒|こま}の {動|うご}かし{方|かた}（[[玉]]・[[金]]・[[銀]]）', ten(moveQ(['玉', '金', '銀'])), ...moveL('[[玉]]・[[金]]・[[銀]]'));
  add('{駒|こま}の {動|うご}かし{方|かた}（[[飛]]・[[角]]・[[香]]）', ten(moveQ(['飛', '角', '香'])), ...moveL('[[飛]]・[[角]]・[[香]]'));
  add('{駒|こま}の {動|うご}かし{方|かた}（[[桂]]・[[歩]]）', ten(moveQ(['桂', '歩'])), ...moveL('[[桂]]・[[歩]]'));
  add('{成|な}る・{打|う}てない {場所|ばしょ}', () => { const a = shuffle(RULES).slice(0, 10); return a; }, '{相手|あいて}の {陣地|じんち}に {入|はい}ると {成|な}れるよ。[[金]]と [[玉]]は {成|な}れない。', '{同|おな}じ {列|れつ}に [[歩]]を 2{枚|まい} {置|お}く「{二歩|にふ}」は {反則|はんそく}。こたえの {番号|ばんごう}を テンキーで いれよう。');
  add('{王手|おうて}と {詰|つ}み', ten(mateQ), '{玉|ぎょく}が とられそうな ことを {王手|おうて}と いうよ。', '{逃|に}げても、{相手|あいて}の {駒|こま}を とっても、{間|あいだ}に {駒|こま}を {打|う}っても {防|ふせ}げないのが {詰|つ}み。',
    '{遠|とお}くからの {王手|おうて}で、{間|あいだ}に {駒|こま}を {打|う}っても すぐ とられて {詰|つ}む ときは、その {駒|こま}は「{無駄合|むだあい}」。{打|う}たないものと して、{詰|つ}みと {考|かんが}えるよ。');
  const oneL = ['1{手|て}で {玉|ぎょく}を {詰|つ}ませる {問題|もんだい}だよ。{相手|あいて}の {玉|ぎょく}は さかさまの {駒|こま}。', `{持|も}ち{駒|ごま}は どこにでも {打|う}てるよ。${DR}`];
  add('1{手|て}{詰|づ}め（[[金]]を {打|う}つ）', ten(tsumeQ({ hands: ['金'] })), ...oneL);
  add('1{手|て}{詰|づ}め（[[銀]]を {打|う}つ）', ten(tsumeQ({ hands: ['銀'] })), ...oneL);
  add('1{手|て}{詰|づ}め（[[飛]]・[[角]]を {打|う}つ）', ten(tsumeQ({ hands: ['飛', '角'] })), ...oneL);
  add('1{手|て}{詰|づ}め（[[桂]]・[[香]]を {打|う}つ）', ten(tsumeQ({ hands: ['桂', '香'] })), ...oneL);
  add('1{手|て}{詰|づ}め（{盤|ばん}の {駒|こま}を {動|うご}かす）', ten(tsumeQ({ hands: [] })), ...oneL);
  add('1{手|て}{詰|づ}め（まぜて）', ten(() => tsumeQ(pick([{ hands: ['金', '銀'] }, { hands: ['飛', '角', '桂', '香'] }, { hands: [] }]))()), ...oneL);
  add('1{手|て}{詰|づ}め（むだな {駒|こま}あり）', ten(() => tsumeQ(pick([{ hands: ['金', '銀', '飛', '角'], waste: true }, { hands: [], waste: true }]))()), ...oneL, '{使|つか}わない {駒|こま}も {盤|ばん}に {置|お}いて あるよ。よく {見|み}て えらぼう。');
  // 3手詰の説明は、問題集の1問を例にして、1手ずつ盤で見せる
  const staticBoard = (b, h, last) => `${boardHTML(b, null, false, last)}${handHTML(h, false)}`;
  const ex0 = load3(TSUME3.plain[14]), ex1 = move(ex0, 0, 22, '銀'), ex2 = move(ex1, 11, 12), ex3 = move(ex2, 24, 13);
  const threeL = [
    '3{手|て}{詰|づ}めは、{自分|じぶん}→{相手|あいて}→{自分|じぶん}の {順|じゅん}に {動|うご}かして、{玉|ぎょく}を {詰|つ}ませる {問題|もんだい}だよ。{相手|あいて}の {手|て}は コンピュータが {動|うご}かすよ。',
    `${staticBoard(ex0, ['銀'])}れいだいを {見|み}て みよう。さかさまの {駒|こま}が {相手|あいて}。{持|も}ち{駒|ごま}は [[銀]]だよ。`,
    `${staticBoard(ex1, [], 22)}1{手|て}{目|め}：{持|も}ち{駒|ごま}の [[銀]]を {黄色|きいろ}の マスに {打|う}って {王手|おうて}！`,
    `${staticBoard(ex2, [], 12)}2{手|て}{目|め}：{相手|あいて}の {玉|ぎょく}が {黄色|きいろ}の マスに {逃|に}げたよ。`,
    `${staticBoard(ex3, [], 13)}3{手|て}{目|め}：[[金]]を {動|うご}かして {王手|おうて}。もう {玉|ぎょく}は {逃|に}げられない。{詰|つ}み！`,
    `やって みよう。${DR}{成|な}れる ときは「{成|な}る」「{成|な}らない」を えらんでね。まちがえると ×が {出|で}て、つぎの {問題|もんだい}に {進|すす}むよ。`,
  ];
  if (typeof TSUME3 !== 'undefined') {
    add('3{手|て}{詰|づ}め（むだな {駒|こま}なし）', ten(q3(false)), ...threeL);
    add('3{手|て}{詰|づ}め（むだな {駒|こま}あり）', ten(q3(true)), ...threeL, '{使|つか}わない {駒|こま}も {盤|ばん}に {置|お}いて あるよ。よく {見|み}て えらぼう。');
  }
  if (typeof TSUME5 !== 'undefined' && TSUME5.plain.length) {
    add('5{手|て}{詰|づ}め', ten(q5),
      '5{手|て}{詰|づ}めは、{自分|じぶん}→{相手|あいて}→{自分|じぶん}→{相手|あいて}→{自分|じぶん}の {順|じゅん}に {動|うご}かして {詰|つ}ませる {問題|もんだい}だよ。{相手|あいて}の {手|て}は コンピュータが {動|うご}かすよ。',
      '1{手|て}{目|め}と 3{手|て}{目|め}は、かならず {王手|おうて}。{駒|こま}を {捨|す}てる（わざと とらせる）{手|て}が {正|ただ}しい ことも あるよ。',
      `${DR}まちがえると ×が {出|で}て、つぎの {問題|もんだい}に {進|すす}むよ。`);
  }

  // ---- 詰みの型・囲い・定跡（囲いと定跡の文は下書き。先生のOKが必要） ----
  const addSeries = (id, name) => { const ser = { id, name, units: [] }; s.series.push(ser); return (nm, make, ...lecture) => { const u = `${id}-${ser.units.length + 1}`; UNITS[u] = { id: u, subject: 'x4', series: id, name: nm, col: '詰将棋', pass: 0.8, make, lecture }; ser.units.push(u); }; };
  const addK = addSeries('x4k', '{詰|つ}みの{型|かた}');
  const kataL = (nm, where) => [`${nm}は、よく {出|で}る {詰|つ}みの {形|かたち}だよ。${where}`, `[[金]]は、ほかの {駒|こま}が {守|まも}って いないと {玉|ぎょく}に とられて しまうよ。${DR}`];
  const ATAMA = [[0, 1]], HARA = [[1, 0], [-1, 0]], SHIRI = [[0, -1]];
  addK('{頭金|あたまきん}', ten(tsumeQ({ hands: ['金'], at: ATAMA })), ...kataL('{頭金|あたまきん}', '{玉|ぎょく}の すぐ {前|まえ}（{玉|ぎょく}の {頭|あたま}）に [[金]]を {打|う}つよ。'));
  addK('{腹金|はらきん}', ten(tsumeQ({ hands: ['金'], at: HARA })), ...kataL('{腹金|はらきん}', '{玉|ぎょく}の すぐ {横|よこ}（{玉|ぎょく}の おなか）に [[金]]を {打|う}つよ。'));
  addK('{尻金|しりきん}', ten(shiriQ), ...kataL('{尻金|しりきん}', '{玉|ぎょく}の すぐ {後|うし}ろ（{玉|ぎょく}の おしり）に [[金]]を {打|う}つよ。'));
  addK('{雪隠詰|せっちんづ}め', ten(tsumeQ({ hands: ['金', '銀', '飛', '角', '桂', '香'], corner: true })), '{盤|ばん}の すみに {追|お}いこまれた {玉|ぎょく}を {詰|つ}ませる {形|かたち}を {雪隠詰|せっちんづ}めと いうよ。', `すみの {玉|ぎょく}は {逃|に}げる {場所|ばしょ}が {少|すく}ないよ。${DR}`);
  addK('{型|かた}を まぜて', ten(() => pick([tsumeQ({ hands: ['金'], at: ATAMA }), tsumeQ({ hands: ['金'], at: HARA }), shiriQ])()), `{頭金|あたまきん}・{腹金|はらきん}・{尻金|しりきん}が まざって {出|で}るよ。${DR}`);

  const FILES = [9, 8, 7, 6, 5, 4, 3, 2, 1], KAN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  function fig(ps, mark) {
    let h = `<table class="sg fg"><tr>${FILES.map(f => `<th>${f}</th>`).join('')}<th></th></tr>`;
    for (const r of [7, 8, 9]) { h += '<tr>' + FILES.map(f => { const v = sq(f, r), p = ps.find(x => x[0] === v); return `<td>${v === mark ? '<b class="sgm">？</b>' : p ? piece({ t: p[1], s: 1 }) : ''}</td>`; }).join('') + `<th>${r}</th></tr>`; }
    return h + '</table>';
  }
  const KAKOI = [
    ['{矢倉|やぐら}', [[88, '玉'], [78, '金'], [77, '銀'], [67, '金'], [89, '桂'], [99, '香']]],
    ['{美濃|みの}{囲|がこ}い', [[28, '玉'], [38, '銀'], [49, '金'], [58, '金'], [29, '桂'], [19, '香']]],
    ['{穴熊|あなぐま}', [[99, '玉'], [98, '香'], [88, '銀'], [89, '桂'], [79, '金']]],
  ];
  const KNAMES = KAKOI.map(k => k[0]), KPCS = ['玉', '金', '銀', '桂', '香'].map(t => `[[${t}]]`);
  const threeOf = (list, c) => [c, ...shuffle(list.filter(x => x !== c)).slice(0, 2)];
  const kakoiPool = () => [
    ...KAKOI.map(([n, ps]) => C(`${fig(ps)}<span class="wp">この {囲|かこ}いの {名前|なまえ}は？</span>`, KNAMES, n)),
    ...KAKOI.flatMap(([n, ps]) => ps.map(([q, t]) => C(`${fig(ps, q)}<span class="wp">${n}の ？の マスに ある {駒|こま}は？</span>`, threeOf(KPCS, `[[${t}]]`), `[[${t}]]`))),
  ];
  const HISHA = [[68, '{四間飛車|しけんびしゃ}'], [78, '{三間飛車|さんけんびしゃ}'], [58, '{中飛車|なかびしゃ}'], [88, '{向|む}かい{飛車|びしゃ}']];
  const HNAMES = HISHA.map(h => h[1]);
  const SEN = (t, a, ...ng) => [t, [a, ...ng], a];
  const sq3 = (f, r, t) => `${f}{${KAN[r]}|${['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'][r]}}[[${t}]]`;
  const josekiPool = () => [
    ...HISHA.map(([v, n]) => C(`${fig([[v, '飛']])}<span class="wp">[[飛]]を ここに {動|うご}かす {作戦|さくせん}の {名前|なまえ}は？</span>`, HNAMES.length > 3 ? threeOf(HNAMES, n) : HNAMES, n)),
    ...[
      SEN('[[角]]の {道|みち}を あける、はじめの {一手|いって}は？', sq3(7, 6, '歩'), sq3(2, 6, '歩'), sq3(9, 6, '歩')),
      SEN('[[飛]]の {前|まえ}の [[歩]]を {進|すす}める {手|て}は？', sq3(2, 6, '歩'), sq3(7, 6, '歩'), sq3(5, 6, '歩')),
      SEN('[[飛]]を {最初|さいしょ}の {場所|ばしょ}の まま {戦|たたか}う {作戦|さくせん}は？', '{居飛車|いびしゃ}', '{振|ふ}り{飛車|びしゃ}', '{棒銀|ぼうぎん}'),
      SEN('[[飛]]を {左|ひだり}に {動|うご}かして {戦|たたか}う {作戦|さくせん}は？', '{振|ふ}り{飛車|びしゃ}', '{居飛車|いびしゃ}', '{矢倉|やぐら}'),
      SEN('[[銀]]を [[飛]]の {前|まえ}まで {進|すす}めて {攻|せ}める {作戦|さくせん}は？', '{棒銀|ぼうぎん}', '{中飛車|なかびしゃ}', '{穴熊|あなぐま}'),
      SEN('{玉|ぎょく}を すみに {入|い}れて {固|かた}める {囲|かこ}いは？', '{穴熊|あなぐま}', '{矢倉|やぐら}', '{美濃|みの}{囲|がこ}い'),
      SEN('{振|ふ}り{飛車|びしゃ}で よく {使|つか}う {囲|かこ}いは？', '{美濃|みの}{囲|がこ}い', '{矢倉|やぐら}', '{棒銀|ぼうぎん}'),
      SEN('{居飛車|いびしゃ}どうしの {戦|たたか}いで よく {組|く}む {囲|かこ}いは？', '{矢倉|やぐら}', '{美濃|みの}{囲|がこ}い', '{中飛車|なかびしゃ}'),
      SEN('{中飛車|なかびしゃ}で [[飛]]を {動|うご}かす {筋|すじ}は？', '5{筋|すじ}', '3{筋|すじ}', '9{筋|すじ}'),
      SEN('{四間飛車|しけんびしゃ}で [[飛]]を {動|うご}かす {筋|すじ}は？', '6{筋|すじ}', '4{筋|すじ}', '2{筋|すじ}'),
      SEN('{三間飛車|さんけんびしゃ}で [[飛]]を {動|うご}かす {筋|すじ}は？', '7{筋|すじ}', '3{筋|すじ}', '5{筋|すじ}'),
      SEN('{向|む}かい{飛車|びしゃ}で [[飛]]を {動|うご}かす {筋|すじ}は？', '8{筋|すじ}', '2{筋|すじ}', '6{筋|すじ}'),
      SEN('{棒銀|ぼうぎん}で {前|まえ}に {進|すす}める {駒|こま}は？', '[[銀]]', '[[金]]', '[[桂]]'),
      SEN('{美濃|みの}{囲|がこ}いで [[玉]]が いる マスは？', '2{八|はち}', '8{八|はち}', '9{九|きゅう}'),
      SEN('{矢倉|やぐら}で [[玉]]が いる マスは？', '8{八|はち}', '2{八|はち}', '5{九|きゅう}'),
      SEN('{穴熊|あなぐま}で [[玉]]が いる マスは？', '9{九|きゅう}', '8{八|はち}', '2{八|はち}'),
      SEN('[[角]]どうしを はじめに {交換|こうかん}する {戦|たたか}い{方|かた}は？', '{角換|かくが}わり', '{中飛車|なかびしゃ}', '{穴熊|あなぐま}'),
    ].map(x => C(...x)),
  ];
  const addJ = addSeries('x4j', '{囲|かこ}いと{定跡|じょうせき}');
  addJ('{囲|かこ}いの {形|かたち}', () => shuffle(kakoiPool()).slice(0, 10), '{玉|ぎょく}を {守|まも}る {駒|こま}の {形|かたち}を {囲|かこ}いと いうよ。{図|ず}の [[歩]]は {省|はぶ}いて あるよ。', '{矢倉|やぐら}・{美濃|みの}{囲|がこ}い・{穴熊|あなぐま}の {形|かたち}を おぼえよう。こたえの {番号|ばんごう}を テンキーで いれよう。');
  addJ('{序盤|じょばん}の {定跡|じょうせき}', () => shuffle(josekiPool()).slice(0, 10), '{将棋|しょうぎ}の はじめの {進|すす}め{方|かた}で、よく {使|つか}われる {手順|てじゅん}を {定跡|じょうせき}と いうよ。', '{飛|ひ}{車|しゃ}の {場所|ばしょ}で {作戦|さくせん}の {名前|なまえ}が かわるよ。こたえの {番号|ばんごう}を テンキーで いれよう。');

  return { pickAns, isMate, mates, targets, move, kingOf, attackers, gen3, verify3, addWaste, checkShiri, gen5, verify5, unique5, play, nifu };
})();
