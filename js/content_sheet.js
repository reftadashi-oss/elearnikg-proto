// パソコン「表計算を さわろう」（2026年11月26日 ユーザー「1から 作ろう」＝まねの 表計算）。content_html.js の あと、review.js の 前に 読む。
// 画面の 中の「にせの 表計算（Excel風）」。セルに 数字・文字・式（=A1+B1・=SUM(B2:B6) など）を 入れる、オートフィル、並べかえ、グラフ。
// 「やる こと」が できると ✅。おわったら「できた」。表の 中身を プログラムが 見て たしかめる。本物の ファイルには さわらない。
// 学年（5年）・1単元 3問・合格 0.6 は 仮。題材・数は ROOTの オリジナル（Claude の 案・仮。先生が 確かめる）。データは 架空。
(() => {
  const pick = a => a[rand(0, a.length - 1)];
  const F = s => typeof s !== 'string' ? s : s.replace(/([一-鿿々]+)\(([ぁ-ゟ]+)\)/g, '{$1|$2}');
  const T = s => (typeof R === 'function' ? R(F(s)) : F(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pc = SUBJECTS.find(s => s.id === 'x0');
  const se = { id: 'x0s', name: F('表計算(ひょうけいさん)を さわろう'), units: [], noSum: true };
  pc.series.push(se);

  // ---------- 表の しくみ ----------
  const COLS = 'ABCDEF', ROWS = 12;
  const ref = (c, r) => COLS[c] + (r + 1);
  const rc = a => { const m = /^([A-F])(\d+)$/.exec(a); return m ? [COLS.indexOf(m[1]), +m[2] - 1] : null; };
  const toHalf = s => String(s).replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/　/g, ' ');
  // 式を 計算する（+ − × ÷・かっこ・セル・SUM AVERAGE MAX MIN COUNT）
  function calc(cells, a, seen = new Set()) {
    const raw = cells[a]; if (raw === undefined || raw === '') return '';
    if (typeof raw !== 'string' || raw[0] !== '=') { const n = Number(toHalf(raw)); return raw !== '' && !isNaN(n) && /^\s*-?[\d.]+\s*$/.test(toHalf(raw)) ? n : raw; }
    if (seen.has(a)) return '#CIRC!';
    const s2 = new Set(seen); s2.add(a);
    const src = toHalf(raw.slice(1)).toUpperCase().replace(/\$/g, '').replace(/×/g, '*').replace(/÷/g, '/');
    let i = 0; const err = e => { throw e; };
    const val = x => { const v = calc(cells, x, s2); if (typeof v === 'string' && v[0] === '#') err(v); return v; };
    const num = v => v === '' ? 0 : typeof v === 'number' ? v : err('#VALUE!');
    const range = (a1, b1) => { const p = rc(a1), q = rc(b1); if (!p || !q) err('#REF!'); const out = [];
      for (let r = Math.min(p[1], q[1]); r <= Math.max(p[1], q[1]); r++) for (let c = Math.min(p[0], q[0]); c <= Math.max(p[0], q[0]); c++) out.push(val(ref(c, r))); return out; };
    const sp = () => { while (src[i] === ' ') i++; };
    const prim = () => { sp();
      if (src[i] === '(') { i++; const v = expr(); sp(); if (src[i] !== ')') err('#ERR!'); i++; return v; }
      if (src[i] === '-') { i++; return -num(prim()); }
      if (src[i] === '+') { i++; return num(prim()); }
      let m = /^\d+(\.\d+)?/.exec(src.slice(i)); if (m) { i += m[0].length; return Number(m[0]); }
      m = /^([A-Z]+)\(/.exec(src.slice(i));
      if (m) { const fn = m[1]; i += m[0].length; const args = [];
        while (true) { sp(); if (src[i] === ')') { i++; break; }
          const r2 = /^([A-Z]\d+):([A-Z]\d+)/.exec(src.slice(i));
          if (r2) { i += r2[0].length; args.push(...range(r2[1], r2[2])); } else args.push(expr());
          sp(); if (src[i] === ',') { i++; continue; } if (src[i] === ')') { i++; break; } err('#ERR!'); }
        const ns = args.filter(v => typeof v === 'number');
        if (fn === 'SUM') return ns.reduce((s, v) => s + v, 0);
        if (fn === 'AVERAGE') return ns.length ? ns.reduce((s, v) => s + v, 0) / ns.length : err('#DIV/0!');
        if (fn === 'MAX') return ns.length ? Math.max(...ns) : 0;
        if (fn === 'MIN') return ns.length ? Math.min(...ns) : 0;
        if (fn === 'COUNT') return ns.length;
        return err('#NAME?'); }
      m = /^[A-Z]+\d+/.exec(src.slice(i)); if (m) { i += m[0].length; if (!rc(m[0])) err('#REF!'); return val(m[0]); }
      err('#ERR!'); };
    const term = () => { let v = prim(); while (true) { sp(); const o = src[i]; if (o !== '*' && o !== '/') return v; i++; const w = num(prim()); v = num(v); if (o === '/' && w === 0) err('#DIV/0!'); v = o === '*' ? v * w : v / w; } };
    const expr = () => { let v = term(); while (true) { sp(); const o = src[i]; if (o !== '+' && o !== '-') return v; i++; const w = num(term()); v = o === '+' ? num(v) + w : num(v) - w; } };
    try { const v = expr(); sp(); if (i < src.length) return '#ERR!'; return typeof v === 'number' ? Math.round(v * 1e9) / 1e9 : v; } catch (e) { return typeof e === 'string' ? e : '#ERR!'; }
  }
  // 式を ずらす（コピー・オートフィル）。$ が ついた ところは ずらさない
  const shift = (raw, dc, dr) => typeof raw === 'string' && raw[0] === '=' ? raw.replace(/(\$?)([A-F])(\$?)(\d+)/g, (m, d1, c, d2, r) => { const nc = d1 ? COLS.indexOf(c) : COLS.indexOf(c) + dc, nr = d2 ? +r : +r + dr; return nc < 0 || nc >= COLS.length || nr < 1 ? '#REF!' : d1 + COLS[nc] + d2 + nr; }) : raw;
  const show = v => typeof v === 'number' ? String(v) : v;

  // ---------- 画面 ----------
  const css = document.createElement('style');
  css.textContent = `.sxed{max-width:760px;margin:8px auto;text-align:left;position:relative}
  .sxtask{font-size:.68em;background:#f3f8ee;border:1px solid #c5e1a5;border-radius:6px;padding:6px 10px;margin-bottom:6px;line-height:1.7}.sxtask .ok{color:#2e7d32}
  .sxwin{border:1px solid #9aa4b2;border-radius:8px;background:#fff;overflow:hidden;font-size:.6em;color:#222;box-shadow:0 2px 8px #0002}
  .sxtool{display:flex;gap:6px;align-items:center;background:#e8f5e9;padding:4px 8px;border-bottom:1px solid #c8e6c9;flex-wrap:wrap}.sxtool button{font-size:1em;padding:2px 9px;min-width:0;border-radius:5px;border:1px solid #a5d6a7;background:#fff;cursor:pointer}
  .sxbar{display:flex;gap:6px;align-items:center;padding:4px 8px;border-bottom:1px solid #e1e5ea}.sxname{width:3.6em;border:1px solid #b8c2cf;padding:2px 6px;text-align:center}.sxfx{flex:1;border:1px solid #b8c2cf;padding:2px 8px;min-height:1.3em;font-family:Consolas,"Yu Gothic UI",monospace;white-space:nowrap;overflow:hidden}
  .sxgrid{border-collapse:collapse;user-select:none;margin:0}.sxgrid td,.sxgrid th{border:1px solid #d5dbe3;height:1.75em;padding:0 5px;white-space:nowrap;overflow:hidden;max-width:7.5em;min-width:6.4em}
  .sxgrid th{background:#f1f3f6;color:#556;font-weight:normal;min-width:2.2em;text-align:center}.sxgrid td{position:relative;cursor:cell}.sxgrid td.num{text-align:right}.sxgrid td.in{background:#e3f2fd}
  .sxgrid td.act{outline:2px solid #1e7e34;outline-offset:-2px}.sxgrid td.fl{background:#fff3cd}.sxgrid td.er{color:#c62828}
  .sxh{position:absolute;right:-4px;bottom:-4px;width:7px;height:7px;background:#1e7e34;border:1px solid #fff;cursor:crosshair;z-index:2}
  .sxin{position:absolute;opacity:0;pointer-events:none;width:1px;height:1px}.sxin.on{opacity:1;pointer-events:auto;width:auto;height:auto;font:inherit;border:2px solid #1e7e34;padding:0 4px;background:#fff;z-index:3;box-sizing:border-box}
  .sxstat{border-top:1px solid #e1e5ea;padding:3px 8px;color:#556;background:#fafbfc;min-height:1.6em}.sxchart{padding:6px 8px;border-top:1px solid #e1e5ea}
  .sxdone{display:flex;gap:8px;justify-content:flex-end;margin-top:6px}.sxdone button{font-size:.7em;padding:4px 14px}
  table .sxed{display:none}.sxsum{display:none}table .sxsum{display:inline;font-size:.85em}table .sxins{display:none}.sxins{font-size:.72em;line-height:1.6}`;
  document.head.appendChild(css);
  const W = {}; let wid = 0; window.SX = { W, calc };

  function boot(el) {
    el.dataset.on = '1';
    const w = W[el.dataset.w]; if (!w) return;
    const demo = !!el.closest('.ex');
    const S = { cells: { ...(demo ? w.model : w.cells) }, chart: demo ? w.modelChart || null : null, act: [0, 0], anc: [0, 0], edit: false, msg: '', undo: [], clip: null };
    const sel = () => [Math.min(S.anc[0], S.act[0]), Math.min(S.anc[1], S.act[1]), Math.max(S.anc[0], S.act[0]), Math.max(S.anc[1], S.act[1])];
    const selRef = () => { const [c1, r1, c2, r2] = sel(); return c1 === c2 && r1 === r2 ? ref(c1, r1) : `${ref(c1, r1)}:${ref(c2, r2)}`; };
    const snap = () => { S.undo.push(JSON.stringify({ cells: S.cells, chart: S.chart })); if (S.undo.length > 50) S.undo.shift(); };
    const st = () => ({ cells: S.cells, chart: S.chart, v: a => calc(S.cells, a), raw: a => S.cells[a] || '' });
    el.innerHTML = `<div class="sxtask"></div><div class="sxwin">
      <div class="sxtool">${demo ? '' : `<button data-t="asc">${T('↑ 小(ちい)さい 順(じゅん)')}</button><button data-t="desc">${T('↓ 大(おお)きい 順(じゅん)')}</button><button data-t="chart">${T('📊 グラフ')}</button><button data-t="undo">${T('元(もと)に 戻(もど)す')}</button>`}</div>
      <div class="sxbar"><span class="sxname"></span><span>fx</span><span class="sxfx"></span></div>
      <div style="position:relative;overflow:auto"><table class="sxgrid"></table><input class="sxin" spellcheck="false" autocomplete="off"></div>
      <div class="sxchart"></div><div class="sxstat"></div></div>
      ${demo ? '' : `<div class="sxdone"><button data-b="reset">${T('はじめから')}</button><button class="primary" data-b="done">${T('できた')}</button></div>`}`;
    const grid = el.querySelector('.sxgrid'), inp = el.querySelector('.sxin'), task = el.querySelector('.sxtask'), wrap = grid.parentElement;
    const drawTask = () => { const s = st(); task.innerHTML = `${T('<b>やる こと</b>')}${w.steps.map(x => { let ok = false; try { ok = !!x.ok(s); } catch (_) {} return `<div class="${ok ? 'ok' : ''}">${ok ? '✅' : '⬜'} ${T(x.t)}</div>`; }).join('')}`; };
    const drawChart = () => { const box = el.querySelector('.sxchart'); if (!S.chart) { box.innerHTML = ''; return; }
      const p = S.chart.range.split(':'), a = rc(p[0]), b = rc(p[1]); const rows = [];
      for (let r = a[1]; r <= b[1]; r++) rows.push([show(calc(S.cells, ref(a[0], r))), calc(S.cells, ref(b[0], r))]);
      const mx = Math.max(1, ...rows.map(x => typeof x[1] === 'number' ? x[1] : 0)), bw = 46, H = 110;
      box.innerHTML = `<div>${T('グラフ')}（${esc(S.chart.range)}）</div><svg width="${rows.length * bw + 40}" height="${H + 34}" style="font-size:11px">${rows.map((x, k) => { const v = typeof x[1] === 'number' ? x[1] : 0, h = Math.round(v / mx * H);
        return `<rect x="${30 + k * bw}" y="${H - h + 6}" width="${bw - 14}" height="${h}" fill="#43a047"/><text x="${30 + k * bw + (bw - 14) / 2}" y="${H - h + 2}" text-anchor="middle">${v}</text><text x="${30 + k * bw + (bw - 14) / 2}" y="${H + 22}" text-anchor="middle">${esc(x[0])}</text>`; }).join('')}<line x1="26" y1="${H + 6}" x2="${rows.length * bw + 34}" y2="${H + 6}" stroke="#888"/></svg>`; };
    const draw = () => {
      const [c1, r1, c2, r2] = sel();
      let h = `<tr><th></th>${[...COLS].map(c => `<th>${c}</th>`).join('')}</tr>`;
      for (let r = 0; r < ROWS; r++) { h += `<tr><th>${r + 1}</th>`;
        for (let c = 0; c < COLS.length; c++) { const a = ref(c, r), v = calc(S.cells, a), inS = c >= c1 && c <= c2 && r >= r1 && r <= r2, act = c === S.act[0] && r === S.act[1];
          const cls = [typeof v === 'number' ? 'num' : '', inS && !act ? 'in' : '', act ? 'act' : '', typeof v === 'string' && v[0] === '#' ? 'er' : '', S.fill && c >= S.fill[0] && c <= S.fill[2] && r >= S.fill[1] && r <= S.fill[3] ? 'fl' : ''].join(' ');
          h += `<td class="${cls}" data-c="${c}" data-r="${r}">${esc(show(v))}${c === c2 && r === r2 && !demo ? '<i class="sxh"></i>' : ''}</td>`; }
        h += '</tr>'; }
      grid.innerHTML = h;
      el.querySelector('.sxname').textContent = selRef();
      el.querySelector('.sxfx').textContent = S.edit ? inp.value : (S.cells[ref(...S.act)] || '');
      el.querySelector('.sxstat').innerHTML = S.msg ? T(S.msg) : (() => { const ns = []; for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) { const v = calc(S.cells, ref(c, r)); if (typeof v === 'number') ns.push(v); } return ns.length > 1 ? `合計：${Math.round(ns.reduce((s, v) => s + v, 0) * 1e9) / 1e9}　データの 個数：${ns.length}` : ''; })();
      place(); drawChart(); drawTask();
    };
    const place = () => { const td = grid.querySelector(`td[data-c="${S.act[0]}"][data-r="${S.act[1]}"]`); if (!td) return;
      inp.style.left = td.offsetLeft + 'px'; inp.style.top = td.offsetTop + 'px'; if (S.edit) { inp.style.width = Math.max(td.offsetWidth, 120) + 'px'; inp.style.height = td.offsetHeight + 'px'; }
      inp.classList.toggle('on', S.edit); if (!demo && el.isConnected && document.activeElement !== inp) inp.focus({ preventScroll: true }); };
    const commit = () => { if (!S.edit) return; snap(); const a = ref(...S.act), v = inp.value; if (v === '') delete S.cells[a]; else S.cells[a] = /^[=＝]/.test(v) ? toHalf(v).replace(/（/g, '(').replace(/）/g, ')') : v; S.edit = false; inp.value = ''; S.msg = ''; };
    const move = (dc, dr, ext) => { S.act = [Math.max(0, Math.min(COLS.length - 1, S.act[0] + dc)), Math.max(0, Math.min(ROWS - 1, S.act[1] + dr))]; if (!ext) S.anc = [...S.act]; };
    const cellOf = t => { const td = t.closest && t.closest('td[data-c]'); return td ? [+td.dataset.c, +td.dataset.r] : null; };
    draw();
    if (demo) return;

    inp.addEventListener('input', () => { if (!S.edit) { S.edit = true; } el.querySelector('.sxfx').textContent = inp.value; place(); });
    inp.addEventListener('keydown', e => {
      e.stopPropagation(); if (typeof window.touch === 'function') window.touch();
      if (e.isComposing || e.keyCode === 229) return;
      const k = e.key, c = e.ctrlKey || e.metaKey;
      if (k === 'Enter') { e.preventDefault(); commit(); move(0, e.shiftKey ? -1 : 1); draw(); return; }
      if (k === 'Tab') { e.preventDefault(); commit(); move(e.shiftKey ? -1 : 1, 0); draw(); return; }
      if (k === 'Escape') { e.preventDefault(); S.edit = false; inp.value = ''; draw(); return; }
      if (S.edit) { if (k === 'F2') e.preventDefault(); return; }
      if (k.startsWith('Arrow')) { e.preventDefault(); move(k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : 0, k === 'ArrowUp' ? -1 : k === 'ArrowDown' ? 1 : 0, e.shiftKey); S.msg = ''; draw(); return; }
      if (k === 'Delete' || k === 'Backspace') { e.preventDefault(); snap(); const [c1, r1, c2, r2] = sel(); for (let r = r1; r <= r2; r++) for (let cc = c1; cc <= c2; cc++) delete S.cells[ref(cc, r)]; draw(); return; }
      if (k === 'F2') { e.preventDefault(); S.edit = true; inp.value = S.cells[ref(...S.act)] || ''; place(); return; }
      if (c && (k === 'c' || k === 'C' || k === 'x' || k === 'X')) { e.preventDefault(); const [c1, r1, c2, r2] = sel(), d = {}; for (let r = r1; r <= r2; r++) for (let cc = c1; cc <= c2; cc++) d[`${cc - c1},${r - r1}`] = S.cells[ref(cc, r)]; S.clip = { d, c1, r1, w: c2 - c1, h: r2 - r1, cut: /x/i.test(k) }; S.msg = 'コピーしたよ（はりつけたい セルで Ctrl+V）'; draw(); return; }
      if (c && (k === 'v' || k === 'V')) { e.preventDefault(); if (!S.clip) return; snap(); const [c1, r1] = sel(), dc = c1 - S.clip.c1, dr = r1 - S.clip.r1;
        if (S.clip.cut) for (const key in S.clip.d) { const [x, y] = key.split(',').map(Number); delete S.cells[ref(S.clip.c1 + x, S.clip.r1 + y)]; }
        for (const key in S.clip.d) { const [x, y] = key.split(',').map(Number), v = S.clip.d[key]; if (c1 + x < COLS.length && r1 + y < ROWS) { if (v === undefined) delete S.cells[ref(c1 + x, r1 + y)]; else S.cells[ref(c1 + x, r1 + y)] = S.clip.cut ? v : shift(v, dc, dr); } }
        if (S.clip.cut) S.clip = null; S.msg = ''; draw(); return; }
      if (c && (k === 'z' || k === 'Z')) { e.preventDefault(); undo(); return; }
    });
    const undo = () => { if (!S.undo.length) { S.msg = 'もう もどせないよ'; return draw(); } const o = JSON.parse(S.undo.pop()); S.cells = o.cells; S.chart = o.chart; S.msg = '元(もと)に 戻(もど)したよ'; draw(); };
    // マウス：クリックで えらぶ・ドラッグで はんい・右下の ■ を ドラッグで オートフィル。式を 入れて いる ときは クリックした セルの 名前が 入る
    let drag = null;
    wrap.addEventListener('mousedown', e => {
      if (typeof window.touch === 'function') window.touch();
      if (e.target.classList.contains('sxh')) { e.preventDefault(); drag = 'fill'; S.fill = null; return; }
      const p = cellOf(e.target); if (!p) return; e.preventDefault();
      if (S.edit && /^[=＝]/.test(inp.value) && /[=＝(,+\-*/:（、＋－＊／]$/.test(inp.value)) { inp.value += ref(...p); drag = { pt: p }; el.querySelector('.sxfx').textContent = inp.value; inp.focus(); return; }
      if (S.edit) commit();
      S.act = p; if (!e.shiftKey) S.anc = [...p]; drag = 'sel'; S.msg = ''; draw();
    });
    wrap.addEventListener('mousemove', e => {
      if (!drag) return; const p = cellOf(e.target); if (!p) return;
      if (drag === 'sel') { if (p[0] !== S.act[0] || p[1] !== S.act[1]) { S.act = p; draw(); } }
      else if (drag === 'fill') { const [c1, r1, c2, r2] = sel(); const down = p[1] > r2, right = p[0] > c2 && !down;
        S.fill = down ? [c1, r2 + 1, c2, p[1]] : right ? [c2 + 1, r1, p[0], r2] : null; draw(); }
      else if (drag.pt) { const a = ref(...drag.pt), b = ref(...p); inp.value = inp.value.replace(/[A-F]\d+(:[A-F]\d+)?$/, a === b ? a : `${a}:${b}`); el.querySelector('.sxfx').textContent = inp.value; }
    });
    document.addEventListener('mouseup', () => {
      if (drag === 'fill' && S.fill) { snap(); const [c1, r1, c2, r2] = sel(), [f1, g1, f2, g2] = S.fill;
        for (let r = g1; r <= g2; r++) for (let c = f1; c <= f2; c++) { const sc = c1 + ((c - c1) % (c2 - c1 + 1) + (c2 - c1 + 1)) % (c2 - c1 + 1), sr = r1 + ((r - r1) % (r2 - r1 + 1) + (r2 - r1 + 1)) % (r2 - r1 + 1), v = S.cells[ref(sc, sr)];
          if (v === undefined) delete S.cells[ref(c, r)]; else S.cells[ref(c, r)] = shift(v, c - sc, r - sr); }
        S.anc = [Math.min(c1, f1), Math.min(r1, g1)]; S.act = [Math.max(c2, f2), Math.max(r2, g2)]; S.fill = null; S.msg = 'オートフィルで コピーしたよ'; draw(); }
      else if (drag === 'fill') { S.fill = null; draw(); }
      drag = null;
    });
    wrap.addEventListener('dblclick', e => { const p = cellOf(e.target); if (!p) return; S.act = S.anc = p; S.edit = true; inp.value = S.cells[ref(...p)] || ''; draw(); });
    el.addEventListener('click', e => {
      const t = e.target.closest('button[data-t]'), b = e.target.closest('button[data-b]');
      if (t) { if (S.edit) commit(); const [c1, r1, c2, r2] = sel(), k = t.dataset.t;
        if (k === 'undo') return undo();
        if (k === 'chart') { if (c2 - c1 !== 1 || r2 <= r1) { S.msg = 'グラフ：名前(なまえ)の 列(れつ)と 数(かず)の 列(れつ)の 2列(れつ)を えらんでから おそう'; return draw(); } snap(); S.chart = { range: selRef() }; S.msg = 'グラフを 作(つく)ったよ'; return draw(); }
        if (r2 <= r1) { S.msg = '並(なら)べかえ：ならべたい 行(ぎょう)を ぜんぶ（2行(ぎょう) 以上(いじょう)）えらんでから おそう'; return draw(); }
        snap(); const key = S.act[0], rows = [];
        for (let r = r1; r <= r2; r++) { const row = []; for (let c = c1; c <= c2; c++) row.push(S.cells[ref(c, r)]); rows.push({ row, v: calc(S.cells, ref(key, r)) }); }
        const n = x => typeof x === 'number' ? x : Infinity;
        rows.sort((a, b2) => k === 'asc' ? n(a.v) - n(b2.v) || String(a.v).localeCompare(String(b2.v), 'ja') : (n(b2.v) === Infinity ? -Infinity : n(b2.v)) - (n(a.v) === Infinity ? -Infinity : n(a.v)));
        rows.forEach((x, i) => x.row.forEach((v, j) => { const a = ref(c1 + j, r1 + i); if (v === undefined) delete S.cells[a]; else S.cells[a] = v; }));
        S.msg = `${COLS[key]}列(れつ)で 並(なら)べかえたよ`; return draw(); }
      if (!b) return;
      if (b.dataset.b === 'reset') { if (!confirm('はじめの 形に もどしますか？')) return; S.cells = { ...w.cells }; S.chart = null; S.undo = []; S.msg = ''; return draw(); }
      if (b.dataset.b === 'done') { if (S.edit) commit(); draw(); const s = st(), bad = w.steps.find(x => { try { return !x.ok(s); } catch (_) { return true; } });
        const a = document.querySelector('.ans'); if (!a || !document.getElementById('ok')) return;
        a.dataset.raw = a.value = bad ? `まだ：${bad.t.replace(/<[^>]+>/g, '').replace(/\(([ぁ-ゟ]+)\)/g, '')}` : 'できた'; document.getElementById('ok').click(); }
    });
    setTimeout(() => el.isConnected && inp.focus({ preventScroll: true }), 0);
  }
  new MutationObserver(() => document.querySelectorAll('.sxed:not([data-on])').forEach(boot)).observe(document.documentElement, { childList: true, subtree: true });

  // ---------- 問題 ----------
  const editQ = gen => () => { const w = gen(); const id = 's' + (++wid); W[id] = w;
    return { key: `sx-${w.key}`, tap: { code: 0 }, boxes: [''], answer: ['できた'],
      exHint: F('セルを クリックして 打(う)つ → Enter。「やる こと」が ぜんぶ ✅ に なったら「できた」。'),
      text: `<div class="fxgoal"><span class="sxsum">${w.steps.map(s => F(s.t)).join('／')}</span><span class="sxins">${F('下(した)の 表(ひょう)で「やる こと」を やろう。セルを クリックして 打(う)って <b>Enter</b>。できたら <b>できた</b> を おそう。')}</span></div><div class="sxed" data-w="${id}"></div>` }; };
  const DATA = { 'くだもの': ['りんご', 'みかん', 'いちご', 'ぶどう', 'バナナ'], 'どうぶつ': ['ねこ', 'いぬ', 'うさぎ', 'ハムスター', 'インコ'], 'あそび': ['おにごっこ', 'なわとび', 'ドッジボール', 'かくれんぼ', 'てつぼう'] };
  const vote = () => { const k = pick(Object.keys(DATA)), names = shuffle(DATA[k]).slice(0, 5), mono = a => a.every((x, i) => !i || x >= a[i - 1]) || a.every((x, i) => !i || x <= a[i - 1]); let nums; do { nums = names.map(() => rand(2, 15)); } while (mono(nums)); const cells = { A1: k, B1: 'にんずう' }; names.forEach((n, i) => { cells['A' + (i + 2)] = n; cells['B' + (i + 2)] = String(nums[i]); }); return { k, names, nums, cells }; };
  const sorted = (v, d) => { const m = { A1: v.cells.A1, B1: 'にんずう' }; v.names.map((n, i) => [n, v.nums[i]]).sort((a, b) => d * (a[1] - b[1])).forEach((x, i) => { m['A' + (i + 2)] = x[0]; m['B' + (i + 2)] = String(x[1]); }); return m; };
  const isF = (s, a) => /^=/.test(s.raw(a));
  const fnIs = (s, a, fn) => new RegExp(`^=\\s*${fn}\\s*\\(`, 'i').test(toHalf(s.raw(a)));
  const G = {
    1: [   // 入力
      () => { const k = pick(Object.keys(DATA)), n = shuffle(DATA[k]).slice(0, 3);
        return { key: `in-${n.join()}`, cells: { A1: k }, model: { A1: k, A2: n[0], A3: n[1], A4: n[2] }, steps: [{ t: `A2・A3・A4 に「${n.join('」「')}」と 入(い)れる（打(う)って Enter で 下(した)の セルへ）`, ok: s => n.every((x, i) => s.v('A' + (i + 2)) === x) }] }; },
      () => { const v = vote(), m = { ...v.cells }; v.names.forEach((_, i) => delete v.cells['B' + (i + 2)]);
        return { key: `in2-${v.nums.join()}`, cells: v.cells, model: m, steps: [{ t: `B2〜B6 に 人数(にんずう) ${v.nums.join('・')} を 入(い)れる（数(かず)は 半角(はんかく)で）`, ok: s => v.nums.every((x, i) => s.v('B' + (i + 2)) === x) }] }; },
      () => { const D = ['げつ', 'か', 'すい', 'もく', 'きん'];
        return { key: 'in3', cells: { A1: 'ようび' }, model: { A1: 'ようび', B1: D[0], C1: D[1], D1: D[2], E1: D[3], F1: D[4] }, steps: [{ t: `B1〜F1 に「${D.join('」「')}」と 横(よこ)に 入(い)れる（Tab キーで 右(みぎ)の セルへ）`, ok: s => D.every((x, i) => s.v(COLS[i + 1] + '1') === x) }] }; },
    ],
    2: [   // 式
      () => { const a = rand(12, 90), b = rand(5, 60); const cells = { A1: 'まえ', B1: 'あと', C1: 'あわせて', A2: String(a), B2: String(b) };
        return { key: `f1-${a}-${b}`, cells, model: { ...cells, C2: '=A2+B2' }, steps: [{ t: 'C2 に、A2 と B2 を たす 式(しき)（<b>=A2+B2</b>）を 入(い)れる', ok: s => isF(s, 'C2') && s.v('C2') === a + b && /A2/i.test(s.raw('C2')) && /B2/i.test(s.raw('C2')) }] }; },
      () => { const p = rand(3, 12) * 10, n = rand(2, 9); const cells = { A1: 'ねだん', B1: 'こすう', C1: 'だい金', A2: String(p), B2: String(n) };
        return { key: `f2-${p}-${n}`, cells, model: { ...cells, C2: '=A2*B2' }, steps: [{ t: 'C2 に、ねだん × こすう の 式(しき)を 入(い)れる（かけ算(ざん)は <b>*</b>）', ok: s => isF(s, 'C2') && s.v('C2') === p * n && /A2/i.test(s.raw('C2')) }] }; },
      () => { const a = rand(300, 900), b = rand(50, 250); const cells = { A1: 'もって いた', B1: 'つかった', C1: 'のこり', A2: String(a), B2: String(b) };
        return { key: `f3-${a}-${b}`, cells, model: { ...cells, A2: '1000', C2: '=A2-B2' }, steps: [{ t: 'C2 に、のこりを 出(だ)す 式(しき)（A2 − B2）を 入(い)れる', ok: s => isF(s, 'C2') && s.v('C2') === s.v('A2') - b && /A2/i.test(s.raw('C2')) },
          { t: 'A2 を 1000 に 変(か)えて、C2 の 答(こた)えが かわるのを 見(み)る', ok: s => s.v('A2') === 1000 && s.v('C2') === 1000 - b }] }; },
    ],
    3: [   // 関数
      () => { const v = vote();
        return { key: `sum-${v.nums.join()}`, cells: { ...v.cells, A7: 'ごうけい' }, model: { ...v.cells, A7: 'ごうけい', B7: '=SUM(B2:B6)' }, steps: [{ t: 'B7 に、人数(にんずう)の 合計(ごうけい)を <b>SUM</b> で 出(だ)す（=SUM(B2:B6)）', ok: s => fnIs(s, 'B7', 'SUM') && s.v('B7') === v.nums.reduce((x, y) => x + y, 0) }] }; },
      () => { const v = vote();
        return { key: `avg-${v.nums.join()}`, cells: { ...v.cells, A7: 'へいきん' }, model: { ...v.cells, A7: 'へいきん', B7: '=AVERAGE(B2:B6)' }, steps: [{ t: 'B7 に、人数(にんずう)の 平均(へいきん)を <b>AVERAGE</b> で 出(だ)す', ok: s => fnIs(s, 'B7', 'AVERAGE') && Math.abs(s.v('B7') - v.nums.reduce((x, y) => x + y, 0) / 5) < 1e-6 }] }; },
      () => { const v = vote();
        return { key: `mx-${v.nums.join()}`, cells: { ...v.cells, A7: 'いちばん 多い', A8: 'いちばん 少ない' }, model: { ...v.cells, A7: 'いちばん 多い', A8: 'いちばん 少ない', B7: '=MAX(B2:B6)', B8: '=MIN(B2:B6)' },
          steps: [{ t: 'B7 に <b>MAX</b>（いちばん 大(おお)きい 数(かず)）', ok: s => fnIs(s, 'B7', 'MAX') && s.v('B7') === Math.max(...v.nums) }, { t: 'B8 に <b>MIN</b>（いちばん 小(ちい)さい 数(かず)）', ok: s => fnIs(s, 'B8', 'MIN') && s.v('B8') === Math.min(...v.nums) }] }; },
    ],
    4: [   // オートフィル・コピー
      () => { const k = pick(Object.keys(DATA)), n = shuffle(DATA[k]).slice(0, 4), p = n.map(() => rand(2, 9) * 10), q = n.map(() => rand(1, 6));
        const cells = { A1: k, B1: 'ねだん', C1: 'こすう', D1: 'だい金' }; n.forEach((x, i) => { cells['A' + (i + 2)] = x; cells['B' + (i + 2)] = String(p[i]); cells['C' + (i + 2)] = String(q[i]); }); cells.D2 = '=B2*C2';
        const m = { ...cells }; [3, 4, 5].forEach(r => { m['D' + r] = `=B${r}*C${r}`; });
        return { key: `af-${p.join()}`, cells, model: m, steps: [{ t: 'D2 の 式(しき)を、<b>オートフィル</b>（D2 を えらんで 右下(みぎした)の ■ を D5 まで ドラッグ）で D3〜D5 に コピーする', ok: s => [3, 4, 5].every(r => isF(s, 'D' + r) && s.v('D' + r) === p[r - 2] * q[r - 2]) }] }; },
      () => { const v = vote(), cells = { ...v.cells, C1: '2ばい' }; cells.C2 = '=B2*2'; const m = { ...cells }; [3, 4, 5, 6].forEach(r => { m['C' + r] = `=B${r}*2`; });
        return { key: `af2-${v.nums.join()}`, cells, model: m, steps: [{ t: 'C2 の 式(しき)を C3〜C6 に コピーする（オートフィル か Ctrl+C → Ctrl+V）', ok: s => [3, 4, 5, 6].every(r => isF(s, 'C' + r) && s.v('C' + r) === v.nums[r - 2] * 2) }] }; },
      () => { const cells = { A1: 'ばん', A2: '1', A3: '2' }; const m = { ...cells }; [4, 5, 6, 7, 8].forEach((r, i) => { m['A' + r] = '=A' + (r - 1) + '+1'; });
        return { key: 'af3', cells, model: m, steps: [{ t: 'A4〜A8 に 3・4・5・6・7 と 番号(ばんごう)を 入(い)れる（A4 に =A3+1 を 入(い)れて オートフィルが はやい）', ok: s => [4, 5, 6, 7, 8].every(r => s.v('A' + r) === r - 1) }] }; },
    ],
    5: [   // 並べかえ
      () => { const v = vote(), srt = v.names.map((n, i) => [n, v.nums[i]]).sort((a, b) => b[1] - a[1]); const m = { A1: v.cells.A1, B1: 'にんずう' }; srt.forEach((x, i) => { m['A' + (i + 2)] = x[0]; m['B' + (i + 2)] = String(x[1]); });
        return { key: `so-${v.nums.join()}`, cells: v.cells, model: m, steps: [{ t: '人数(にんずう)の <b>多(おお)い 順(じゅん)</b>に 並(なら)べかえる（A2:B6 を えらんで、B の セルを えらんだ まま「↓ 大(おお)きい 順(じゅん)」）', ok: s => { for (let r = 2; r < 6; r++) if (!(s.v('B' + r) >= s.v('B' + (r + 1)))) return false; return v.names.every((n, i) => { for (let r = 2; r <= 6; r++) if (s.v('A' + r) === n) return s.v('B' + r) === v.nums[i]; return false; }); } }] }; },
      () => { const v = vote();
        return { key: `so2-${v.nums.join()}`, cells: v.cells, model: sorted(v, 1), steps: [{ t: '人数(にんずう)の <b>少(すく)ない 順(じゅん)</b>に 並(なら)べかえる（名前(なまえ)と 人数(にんずう)が ずれない ように）', ok: s => { for (let r = 2; r < 6; r++) if (!(s.v('B' + r) <= s.v('B' + (r + 1)))) return false; return v.names.every((n, i) => { for (let r = 2; r <= 6; r++) if (s.v('A' + r) === n) return s.v('B' + r) === v.nums[i]; return false; }); } }] }; },
    ],
    6: [   // グラフ
      () => { const v = vote();
        return { key: `ch-${v.nums.join()}`, cells: v.cells, model: v.cells, modelChart: { range: 'A2:B6' }, steps: [{ t: 'A2:B6 を えらんで「📊 グラフ」で 棒(ぼう)グラフを 作(つく)る', ok: s => !!s.chart && s.chart.range === 'A2:B6' }] }; },
      () => { const v = vote();
        return { key: `ch2-${v.nums.join()}`, cells: v.cells, model: sorted(v, -1), modelChart: { range: 'A2:B6' }, steps: [{ t: '人数(にんずう)の 多(おお)い 順(じゅん)に 並(なら)べかえる', ok: s => { for (let r = 2; r < 6; r++) if (!(s.v('B' + r) >= s.v('B' + (r + 1)))) return false; return true; } }, { t: 'A2:B6 で 棒(ぼう)グラフを 作(つく)る', ok: s => !!s.chart && s.chart.range === 'A2:B6' }] }; },
    ],
    7: [   // まとめ：こづかい帳
      () => { const items = shuffle([['ノート', 120], ['おかし', 150], ['えんぴつ', 80], ['ジュース', 130], ['シール', 200]]).slice(0, 3), start = rand(5, 10) * 100;
        const cells = { A1: 'こづかいちょう', A2: 'もらった', B2: String(start), A3: items[0][0], A4: items[1][0], A5: items[2][0], A6: 'つかった ごうけい', A7: 'のこり' };
        const m = { ...cells, B3: String(items[0][1]), B4: String(items[1][1]), B5: String(items[2][1]), B6: '=SUM(B3:B5)', B7: '=B2-B6' };
        return { key: `kz-${start}-${items.map(x => x[1]).join()}`, cells, model: m, steps: [
          { t: `B3〜B5 に 使(つか)った お金(かね)（${items.map(x => `${x[0]} ${x[1]}`).join('・')}）を 入(い)れる`, ok: s => items.every((x, i) => s.v('B' + (i + 3)) === x[1]) },
          { t: 'B6 に、使(つか)った お金(かね)の 合計(ごうけい)を SUM で 出(だ)す', ok: s => fnIs(s, 'B6', 'SUM') && s.v('B6') === items.reduce((t, x) => t + x[1], 0) },
          { t: 'B7 に、のこりを 式(しき)で 出(だ)す（もらった − 使(つか)った ごうけい）', ok: s => isF(s, 'B7') && s.v('B7') === start - items.reduce((t, x) => t + x[1], 0) }] }; },
    ],
  };
  const three = list => () => [0, 1, 2].map(i => editQ(list.length >= 3 ? shuffle(list)[i % list.length] : list[i % list.length])());
  const three2 = list => { const L = list.length; return () => { const s = shuffle(list); return [0, 1, 2].map(i => editQ(s[i % L])()); }; };
  const add = (n, name, lecture) => { const id = `x0s-${n}`; UNITS[id] = { id, subject: 'x0', series: se.id, name: F(name), col: '表計算', pass: 0.6, grade: 5, make: three2(G[n]), lecture: lecture.map(F) }; se.units.push(id); };
  void three;
  const K = s => `<span style="font-family:Consolas,monospace;background:#eee;border:1px solid #bbb;border-radius:4px;padding:0 5px">${s}</span>`;
  add(1, 'セルに 入(い)れる', [
    `表計算(ひょうけいさん)（Excel など）は、<b>セル</b>（ます）に 数(かず)や 文字(もじ)を 入(い)れて 計算(けいさん)する ソフト。<br>セルの 名前(なまえ)は、列(れつ)の アルファベット ＋ 行(ぎょう)の 数(かず)。いちばん 左上(ひだりうえ)が <b>A1</b>、その 右(みぎ)が <b>B1</b>、下(した)が <b>A2</b>。`,
    `セルを クリックして 打(う)って ${K('Enter')}。Enter で <b>下(した)</b>の セル、${K('Tab')} で <b>右(みぎ)</b>の セルへ 動(うご)く。矢印(やじるし)キーでも 動(うご)ける。<br>まちがえたら、セルを えらんで ${K('Delete')} で 消(け)す。数(かず)は 半角(はんかく)で 打(う)とう。`]);
  add(2, '式(しき)を 入(い)れる', [
    `<b>=</b>（イコール）から はじめると <b>式(しき)</b>に なる。${K('=A2+B2')} は「A2 と B2 を たす」。<br>たし算(ざん) <b>+</b>、ひき算(ざん) <b>-</b>、かけ算(ざん) <b>*</b>、わり算(ざん) <b>/</b>。`,
    `式(しき)には 数(かず)では なく <b>セルの 名前(なまえ)</b>を 書(か)く。すると、A2 の 数(かず)を 変(か)えた とき、答(こた)えも 自動(じどう)で かわる（これが 表計算(ひょうけいさん)の いい ところ）。<br>= を 打(う)った あとに セルを クリックすると、その セルの 名前(なまえ)が 入(はい)るよ。`]);
  add(3, '関数(かんすう)（SUM・AVERAGE・MAX・MIN）', [
    `<b>関数(かんすう)</b>は 計算(けいさん)の 道具(どうぐ)。${K('=SUM(B2:B6)')} は「B2 から B6 まで ぜんぶ たす」。<b>:</b>（コロン）で はんいを あらわす。`,
    `${K('AVERAGE')}＝平均(へいきん)、${K('MAX')}＝いちばん 大(おお)きい 数(かず)、${K('MIN')}＝いちばん 小(ちい)さい 数(かず)、${K('COUNT')}＝数(かず)の 入(はい)った セルの 数(かず)。<br>はんいは、= SUM( まで 打(う)ってから マウスで ドラッグしても 入(い)れられる。`]);
  add(4, 'オートフィル・コピー', [
    `同(おな)じ 形(かたち)の 式(しき)を 下(した)の 行(ぎょう)にも 入(い)れたい ときは <b>オートフィル</b>。セルを えらぶと 右下(みぎした)に 小(ちい)さい ■ が 出(で)る。■ を 下(した)へ ドラッグすると コピーできる。`,
    `式(しき)を コピーすると、セルの 名前(なまえ)が 1行(ぎょう)ずつ ずれる（D2 の ${K('=B2*C2')} → D3 は ${K('=B3*C3')}）。だから 1つ 作(つく)れば ぜんぶの 行(ぎょう)が 計算(けいさん)できる。${K('Ctrl')}＋${K('C')} → ${K('Ctrl')}＋${K('V')} でも 同(おな)じ。<br>ずらしたく ない ときは ${K('$')} を つける（$B$2）。`]);
  add(5, '並(なら)べかえ', [
    `並(なら)べかえたい 行(ぎょう)を ぜんぶ えらぶ（名前(なまえ)と 数(かず)の 両方(りょうほう)）。そして、どの 列(れつ)で 並(なら)べるか、その 列(れつ)の セルを えらんだ まま「↑ 小(ちい)さい 順(じゅん)」か「↓ 大(おお)きい 順(じゅん)」。`,
    `数(かず)の 列(れつ)だけ えらんで 並(なら)べかえると、名前(なまえ)と 数(かず)が <b>ずれて しまう</b>。かならず 横(よこ)の 行(ぎょう)ぜんぶを えらぼう。まちがえたら ${K('Ctrl')}＋${K('Z')}。`]);
  add(6, 'グラフ', [
    `名前(なまえ)の 列(れつ)と 数(かず)の 列(れつ)を いっしょに えらんで「📊 グラフ」を おすと、<b>棒(ぼう)グラフ</b>が できる。<br>数(かず)を かえると グラフも かわるよ。`,
    `大(おお)きい 順(じゅん)に 並(なら)べかえてから グラフに すると、どれが いちばん 多(おお)いか ひと目(め)で わかる。<br>グラフの えらび方(かた)（棒(ぼう)・折(お)れ線(せん)・円(えん)）は、Excelの 単元(たんげん)「グラフの えらび方(かた)」で 学(まな)ぼう。`]);
  add(7, 'まとめ（こづかいちょう）', [
    'これまでの まとめ。こづかいちょうを 作(つく)ろう。数(かず)を 入(い)れる → SUM で 合計(ごうけい) → 式(しき)で のこり。',
    `お金(かね)の 計算(けいさん)は、まちがえない ように <b>式(しき)</b>で する。使(つか)った お金(かね)を 1つ 足(た)しても、合計(ごうけい)と のこりが 自動(じどう)で かわる。<br>マネーラボの ルトの 計算(けいさん)にも 使(つか)えるよ。`]);
})();
