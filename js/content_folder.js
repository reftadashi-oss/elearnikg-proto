// パソコン「フォルダの たんけん」（2026年11月26日 ユーザー「フォルダパスから、デスクトップの どこに その ファイルが あるか 探す」）。
// content_linux.js の あと、review.js の 前に 読む。
// 画面の 中の「にせの エクスプローラー」。本物の パソコンの ファイルには さわらない（ブラウザの 中だけで 動く）。
// パス（Desktop\えんそく\さくら.png など）を 見て、フォルダを ダブルクリックで ひらいて すすみ、目あての ファイルを ダブルクリックする。
// フォルダと ファイルの 名前・置き場所は 毎回 プログラムが 作る。名前・文は ROOTの オリジナル（Claude の 案・仮。先生が 確かめる）。
// 学年（3年）・1単元 5問・合格 5問中 4問（0.8）は 仮。ROOT PC検定の「4段（まとめられる）」の 練習。
(() => {
  const pick = a => a[rand(0, a.length - 1)];
  const F = s => typeof s !== 'string' ? s : s.replace(/([一-鿿々]+)\(([ぁ-ゟ]+)\)/g, '{$1|$2}');
  const pc = SUBJECTS.find(s => s.id === 'x0');
  const se = { id: 'x0f', name: F('フォルダの たんけん'), units: [], noSum: true };   // noSum：まとめテスト・苦手まとめを 作らない（1問が 画面の 操作のため）
  pc.series.push(se);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- 名前 ----------
  const FOLD = ['えんそく', 'うんどうかい', 'しゅくだい', 'なつやすみ', 'おんがく', 'がっこう', 'かぞく', 'どうぶつ', 'あそび', 'じゆうけんきゅう', 'ふゆやすみ', 'クラブ'];
  const SUB = ['しゃしん', 'さくぶん', 'え', 'メモ', 'どうが', 'プリント', 'はっぴょう'];
  const FILES = {
    png: ['さくら', 'ねこ', 'いぬ', 'うみ', 'やま', 'はなび', 'かぶとむし', 'ひまわり', 'ゆきだるま', 'ロケット', 'にじ', 'かめ'],
    docx: ['さくぶん', 'しょうかい', 'かんそう', 'しんぶん', 'おてがみ'],
    xlsx: ['けいさん', 'こづかいちょう', 'にんきとうひょう', 'じかんわり'],
    txt: ['メモ', 'にっき', 'やること', 'もちもの'],
    mp3: ['うた', 'ピアノ', 'たいこ'],
  };
  const ICON = { png: '🖼️', docx: '📄', xlsx: '📊', txt: '📝', mp3: '🎵' };
  const KANA = { Desktop: 'デスクトップ', Documents: 'ドキュメント', Downloads: 'ダウンロード', Pictures: 'ピクチャ', Music: 'ミュージック', Users: 'ユーザー', Public: 'パブリック' };
  const fileName = () => { const ext = pick(Object.keys(FILES)); return `${pick(FILES[ext])}.${ext}`; };

  // ---------- にせの フォルダ ----------
  let fid = 0;
  const Dir = (n, c = []) => ({ n, d: true, c });
  const File = n => ({ n, d: false, id: 'f' + (++fid) });
  // ちがう 名前の ファイルを k こ
  const files = (k, avoid = new Set()) => { const out = []; for (let t = 0; out.length < k && t < 60; t++) { const n = fileName(); if (!avoid.has(n) && !out.some(f => f.n === n)) out.push(File(n)); } return out; };
  const sortC = d => { d.c.sort((a, b) => (b.d - a.d) || a.n.localeCompare(b.n, 'ja')); d.c.forEach(x => x.d && sortC(x)); return d; };
  const count = (d, n) => d.c.reduce((s, x) => s + (x.d ? count(x, n) : x.n === n ? 1 : 0), 0);

  // 問題を 1つ 作る：{ root, base（アドレスの さいしょ）, start（さいしょに ひらく フォルダの 道）, path（目あての ファイルまでの 名前）, target }
  const levels = {
    // ① デスクトップに ある ファイル
    1: () => { const t = File(fileName()), desk = Dir('Desktop', [...shuffle(FOLD).slice(0, 3).map(n => Dir(n, files(2, new Set([t.n])))), ...files(rand(3, 4), new Set([t.n])), t]);
      return { root: desk, base: '', start: [], path: ['Desktop', t.n], target: t }; },
    // ② フォルダを 1つ ひらく
    2: () => { const fs = shuffle(FOLD).slice(0, 4), t = File(fileName()), at = rand(0, 3);
      const desk = Dir('Desktop', [...fs.map((n, i) => Dir(n, [...files(3, new Set([t.n])), ...(i === at ? [t] : [])])), ...files(2, new Set([t.n]))]);
      return { root: desk, base: '', start: [], path: ['Desktop', fs[at], t.n], target: t }; },
    // ③ フォルダを 2〜3つ。同じ 名前の ファイルが ほかの 場所にも ある（パスを よく 見ないと まちがえる）
    3: () => { const fs = shuffle(FOLD).slice(0, 4), name = fileName(), deep = Math.random() < 0.5;
      const desk = Dir('Desktop', fs.map(n => { const subs = shuffle(SUB).slice(0, rand(2, 3)); return Dir(n, [...subs.map(s => Dir(s, files(rand(2, 3), new Set([name])))), ...files(1, new Set([name]))]); }));
      // 目あて
      const A = pick(desk.c), B = pick(A.c.filter(x => x.d)); let home = B; const path = ['Desktop', A.n, B.n];
      if (deep) { const C = Dir(pick(['1がっき', '2がっき', '3がっき', 'ふるい']), files(2, new Set([name]))); B.c.push(C); home = C; path.push(C.n); }
      const t = File(name); home.c.push(t); path.push(name);
      // おなじ 名前の ファイルを ほかの 場所に 1〜2こ（にせもの）
      const others = desk.c.flatMap(a => a.c.filter(x => x.d && x !== B).map(x => x));
      shuffle(others).slice(0, rand(1, 2)).forEach(o => o.c.push(File(name)));
      if (Math.random() < 0.5) desk.c.push(File(name));   // デスクトップにも 同じ 名前
      return { root: desk, base: '', start: [], path, target: t }; },
    // ④ C:\ から はじまる 長い パス（Documents・Downloads・Pictures）
    4: () => { const name = fileName(), place = pick(['Documents', 'Downloads', 'Pictures', 'Desktop']);
      const lib = n => Dir(n, [...shuffle(FOLD).slice(0, 2).map(f => Dir(f, files(2, new Set([name])))), ...files(2, new Set([name]))]);
      const libs = ['Desktop', 'Documents', 'Downloads', 'Music', 'Pictures'].map(lib);
      const L = libs.find(x => x.n === place), A = Math.random() < 0.6 ? pick(L.c.filter(x => x.d)) : null, t = File(name);
      (A || L).c.push(t);
      const other = pick(libs.filter(x => x !== L)); (pick(other.c.filter(x => x.d)) || other).c.push(File(name));   // 同じ 名前の にせもの
      const root = Dir('C:', [Dir('Program Files', [Dir('ROOT', []), Dir('Microsoft Office', [])]), Dir('Users', [Dir('root', libs), Dir('Public', [])]), Dir('Windows', [Dir('System32', [])])]);
      const path = ['C:', 'Users', 'root', place, ...(A ? [A.n] : []), name];
      return { root, base: 'C:', start: [], path, target: t, full: true }; },
  };
  const pathStr = p => p[0] === 'C:' ? 'C:\\' + p.slice(1).join('\\') : p.join('\\');

  // ---------- 画面（にせの エクスプローラー） ----------
  const css = document.createElement('style');
  css.textContent = `.fxwin,.fxview{max-width:640px;margin:8px auto;border:1px solid #9aa4b2;border-radius:8px;background:#fff;text-align:left;font-size:.62em;box-shadow:0 2px 8px #0002;overflow:hidden;color:#222}
  .fxbar{display:flex;gap:6px;align-items:center;background:#eef2f7;padding:5px 8px;border-bottom:1px solid #cfd6e0}
  .fxbar button{font-size:1em;padding:2px 9px;min-width:0;border-radius:5px;border:1px solid #b8c2cf;background:#fff;cursor:pointer}.fxbar button:disabled{opacity:.35;cursor:default}
  .fxaddr{flex:1;background:#fff;border:1px solid #b8c2cf;border-radius:4px;padding:3px 8px;font-family:"Yu Gothic UI",Meiryo,sans-serif;white-space:nowrap;overflow-x:auto}
  .fxbody{display:flex;flex-wrap:wrap;gap:4px;padding:10px;min-height:9.5em;align-content:flex-start;user-select:none}
  .fxit{width:6.6em;padding:4px 2px;border-radius:5px;text-align:center;cursor:default;border:1px solid transparent;line-height:1.25;word-break:break-all}
  .fxit:hover{background:#e5f1fb}.fxit.sel{background:#cce8ff;border-color:#99d1ff}.fxit .ic{font-size:2.1em;display:block;line-height:1.2}.fxit small{color:#667;display:block;font-size:.8em}
  .fxstat{border-top:1px solid #e1e5ea;padding:3px 8px;color:#556;background:#fafbfc;min-height:1.6em}
  .fxgoal .fxins,.fxgoal.fxins{font-size:.72em;line-height:1.6}table .fxwin,table .fxview,table .fxins{display:none}table .fxpath{font-size:1em;margin:0}
  .fxgoal{max-width:640px;margin:4px auto;text-align:left}.fxpath{font-family:"Yu Gothic UI",Meiryo,sans-serif;font-size:1.15em;background:#fff8e1;border:2px solid #ffca28;border-radius:6px;padding:4px 10px;margin:4px 0;display:inline-block;word-break:break-all}`;
  document.head.appendChild(css);
  const W = {}; let wid = 0;
  const kana = n => KANA[n] ? `<small>${KANA[n]}</small>` : '';
  const iconOf = x => x.d ? '📁' : ICON[x.n.split('.').pop()] || '📄';
  const itemHTML = (x, i, sel) => `<div class="fxit${sel ? ' sel' : ''}" data-i="${i}"><span class="ic">${iconOf(x)}</span>${esc(x.n)}${kana(x.n)}</div>`;
  const addr = (w, trail) => { const names = [w.root.n, ...trail.map(d => d.n)]; return names[0] === 'C:' ? (names.length === 1 ? 'C:\\' : 'C:\\' + names.slice(1).join('\\')) : names.join('\\'); };
  const bar = (a, up, back) => `<div class="fxbar"><button data-b="back" title="もどる"${back ? '' : ' disabled'}>←</button><button data-b="up" title="1つ 上の フォルダ"${up ? '' : ' disabled'}>↑</button><div class="fxaddr">${esc(a)}</div></div>`;

  function boot(el) {
    el.dataset.on = '1';
    const w = W[el.dataset.w]; if (!w) return;
    const demo = !!el.closest('.ex');
    let trail = [], hist = [], sel = -1, touch = false, tip = false;
    const here = () => trail.length ? trail[trail.length - 1] : w.root;
    const draw = () => {
      const d = here();
      el.innerHTML = bar(addr(w, trail), trail.length > 0, hist.length > 0)
        + `<div class="fxbody">${d.c.length ? d.c.map((x, i) => itemHTML(x, i, i === sel)).join('') : '<span style="color:#889">（この フォルダは からっぽ）</span>'}</div>`
        + `<div class="fxstat">${tip ? 'ファイルは <b>ダブルクリック</b>で ひらくよ' : `${d.c.length} こ`}</div>`;
    };
    const go = t => { hist.push(trail); trail = t; sel = -1; tip = false; draw(); };
    const open = i => { const x = here().c[i]; if (!x) return;
      if (x.d) return go([...trail, x]);
      if (demo) return;
      const a = document.querySelector('.ans'); if (!a || !document.getElementById('ok')) return;
      a.dataset.raw = a.value = pathStr([w.root.n, ...trail.map(d => d.n), x.n]); document.getElementById('ok').click(); };   // 記録には 子どもが ひらいた ファイルの パスが 残る
    draw();
    if (demo) return;
    el.addEventListener('pointerdown', e => { touch = e.pointerType === 'touch'; if (typeof window.touch === 'function') window.touch(); });
    el.addEventListener('click', e => {
      const b = e.target.closest('button[data-b]');
      if (b) { if (b.dataset.b === 'up' && trail.length) go(trail.slice(0, -1)); else if (b.dataset.b === 'back' && hist.length) { trail = hist.pop(); sel = -1; tip = false; draw(); } return; }
      const it = e.target.closest('.fxit'); if (!it) { sel = -1; tip = false; draw(); return; }
      const i = +it.dataset.i;
      if (touch) return open(i);   // タッチの 画面は 1回 さわると ひらく
      sel = i; tip = !here().c[i].d; draw();
    });
    el.addEventListener('dblclick', e => { const it = e.target.closest('.fxit'); if (it) open(+it.dataset.i); });
  }
  new MutationObserver(() => document.querySelectorAll('.fxwin:not([data-on])').forEach(boot)).observe(document.documentElement, { childList: true, subtree: true });

  // 見るだけの 画面（⑤ パスを えらぶ 問題）：目あての ファイルを 青く して 出す。アドレスは かくす
  const viewHTML = (w, trail) => { const d = trail[trail.length - 1];
    return `<div class="fxview">${bar('？', false, false).replace('>？<', ' style="color:#c62828">？？？<')}<div class="fxbody">${d.c.map((x, i) => itemHTML(x, i, x === w.target)).join('')}</div><div class="fxstat">えらばれて いる ファイル：<b>${esc(w.target.n)}</b></div></div>`; };
  // 目あての ファイルまでの フォルダの 道
  const trailTo = (d, t, acc = []) => { for (const x of d.c) { if (x === t) return acc; if (x.d) { const r = trailTo(x, t, [...acc, x]); if (r) return r; } } return null; };

  // ---------- 問題 ----------
  const GOAL = F('つぎの ファイルを さがして、<b>ダブルクリック</b>で ひらこう。フォルダも ダブルクリックで ひらくよ。<b>↑</b> で 1つ 上(うえ)に もどる。');
  const findQ = lv => () => { const w = levels[lv](); sortC(w.root); const id = 'w' + (++wid); W[id] = w;
    return { key: `fx${lv}-${pathStr(w.path)}`, tap: { code: 0 }, boxes: [''], answer: [pathStr(w.path)],
      exHint: F('フォルダを ダブルクリックで ひらいて すすみ、さいごに ファイルを ダブルクリックしよう。'),
      text: `<div class="fxgoal"><span class="fxins">${GOAL}<br></span><span class="fxpath">${esc(pathStr(w.path))}</span></div><div class="fxwin" data-w="${id}"></div>` }; };
  // ⑤ 反対：ファイルの 場所を 見て、パスを えらぶ
  const pathQ = () => { const w = levels[pick([2, 3, 3])](); sortC(w.root);
    const tr = trailTo(w.root, w.target), right = pathStr(w.path), ns = w.path.slice(1, -1), fn = w.path[w.path.length - 1];
    // 画面には、ファイルの ある フォルダの 中と、そこまでの 道（フォルダの 名前）を 出す
    const road = ['Desktop', ...tr.map(d => d.n)].map(n => `📁 ${esc(n)}`).join(' → ');
    const wrong = new Set();
    if (ns.length >= 2) wrong.add(pathStr(['Desktop', ...[...ns].reverse(), fn]));
    if (ns.length >= 1) wrong.add(pathStr(['Desktop', ...ns.slice(0, -1), fn]));
    for (let t = 0; wrong.size < 4 && t < 30; t++) { const k = rand(0, Math.max(0, ns.length - 1)); const alt = [...ns]; if (alt.length) alt[k] = pick(k === 0 ? FOLD : SUB); else alt.push(pick(FOLD)); wrong.add(pathStr(['Desktop', ...alt, fn])); }
    wrong.delete(right);
    const ch = shuffle([right, ...shuffle([...wrong]).slice(0, 2)]);
    return { key: `fxp-${right}`, boxes: [''], answer: [ch.indexOf(right) + 1], pick: ch.map(esc), pickHTML: true, exAns: esc(right),
      text: `${F('青(あお)く なって いる ファイルの パスは どれ？')}<div class="fxgoal fxins" style="font-size:.8em">ひらいた じゅん：${road}</div>${viewHTML(w, tr.length ? tr : [w.root])}` }; };
  const five = make => () => Array.from({ length: 5 }, make);
  const add = (n, name, make, lecture) => { const id = `x0f-${n}`; UNITS[id] = { id, subject: 'x0', series: se.id, name: F(name), col: 'フォルダ', pass: 0.8, grade: 3, make, lecture: lecture.map(F) }; se.units.push(id); };

  // ---------- 講義 ----------
  const fig = (a, items) => `<div class="fxview" style="pointer-events:none">${bar(a, false, false)}<div class="fxbody" style="min-height:0">${items.map(([n, d]) => itemHTML({ n, d }, 0, false)).join('')}</div></div>`;
  const P = s => `<span class="fxpath">${esc(s)}</span>`;
  add(1, 'デスクトップの ファイル', five(findQ(1)), [
    `パソコンの ファイルは、<b>フォルダ</b>（📁 ファイルを 入(い)れる 箱(はこ)）の 中に しまって あるよ。いちばん よく 見(み)る 場所(ばしょ)は <b>デスクトップ</b>（英語(えいご)で <b>Desktop</b>）。${fig('Desktop', [['えんそく', true], ['ねこ.png', false], ['メモ.txt', false]])}`,
    `ファイルの 場所(ばしょ)は <b>パス</b> で あらわすよ。フォルダの 名前(なまえ)と ファイルの 名前(なまえ)を <b>\\</b> で つなぐ。<br>${P('Desktop\\ねこ.png')}<br>＝「デスクトップの 中(なか)の ねこ.png」。<br>\\ は パソコンに よっては <b>￥</b> に 見(み)える ことも あるよ。どちらも 同(おな)じ いみ。`,
    `ファイルを ひらく ときは <b>ダブルクリック</b>（マウスの 左(ひだり)を すばやく 2回(かい)）。<br>名前(なまえ)の さいごの「.png」「.txt」は ファイルの しゅるい。🖼️ .png＝しゃしん・え、📄 .docx＝文(ぶん)、📊 .xlsx＝表(ひょう)、📝 .txt＝メモ、🎵 .mp3＝音(おと)。`]);
  add(2, 'フォルダを 1つ ひらく', five(findQ(2)), [
    `パスに \\ が 2つ あったら、フォルダを 1つ ひらくよ。<br>${P('Desktop\\えんそく\\さくら.png')}<br>① デスクトップで <b>えんそく</b> フォルダを ダブルクリック<br>② その 中(なか)の <b>さくら.png</b> を ダブルクリック`,
    `上(うえ)の 白(しろ)い 所(ところ)（<b>アドレスバー</b>）に、いま いる 場所(ばしょ)の パスが 出(で)るよ。問題(もんだい)の パスと 見(み)くらべよう。${fig('Desktop\\えんそく', [['さくら.png', false], ['かんそう.docx', false]])}まちがえて 入(はい)ったら <b>↑</b> で 1つ 上(うえ)の フォルダに もどれる。`]);
  add(3, 'フォルダを いくつも ひらく', five(findQ(3)), [
    `パスは <b>左(ひだり)から じゅんに</b> 読(よ)む。\\ と \\ の あいだが 1つの フォルダ。<br>${P('Desktop\\うんどうかい\\しゃしん\\かめ.png')}<br>デスクトップ → うんどうかい → しゃしん → かめ.png`,
    `<b>同(おな)じ 名前(なまえ)の ファイルが、ちがう フォルダに ある</b> ことが あるよ。<br>${P('Desktop\\えんそく\\しゃしん\\さくら.png')} と ${P('Desktop\\うんどうかい\\しゃしん\\さくら.png')} は <b>べつの ファイル</b>。<br>名前(なまえ)だけで なく、パスの フォルダを 1つずつ たしかめよう。`]);
  add(4, 'C:\\ から はじまる パス', five(findQ(4)), [
    `ほんとうの パスは <b>C:\\</b>（Cドライブ＝パソコンの 中の 大(おお)きな 入(い)れ物(もの)）から はじまるよ。<br>${P('C:\\Users\\root\\Desktop\\ねこ.png')}<br>C:\\ → Users（ユーザー） → root（つかう 人(ひと)の 名前(なまえ)） → Desktop → ねこ.png`,
    `つかう 人(ひと)の フォルダの 中(なか)には、こんな フォルダが あるよ。${fig('C:\\Users\\root', [['Desktop', true], ['Documents', true], ['Downloads', true], ['Music', true], ['Pictures', true]])}Documents＝ドキュメント（文(ぶん)や 表(ひょう)）、Downloads＝ダウンロード（ネットから もらった もの）、Pictures＝ピクチャ（しゃしん）。`]);
  add(5, 'パスを 読(よ)む（えらぶ）', five(pathQ), [
    `こんどは 反対(はんたい)。ファイルの 場所(ばしょ)を 見(み)て、パスを えらぶよ。<br>ひらいた フォルダを じゅんに <b>\\</b> で つなぎ、さいごに ファイルの 名前(なまえ)を つける。<br>📁 Desktop → 📁 なつやすみ → 📁 え → ひまわり.png<br>${P('Desktop\\なつやすみ\\え\\ひまわり.png')}`,
    `まちがえ やすい ところ：<br>・フォルダの じゅんばんが 反対(はんたい)（Desktop\\え\\なつやすみ\\…）<br>・フォルダが 1つ たりない（Desktop\\なつやすみ\\ひまわり.png）<br>じゅんばんと 数(かず)を たしかめよう。`]);
  add(6, 'まとめ（さがす）', () => shuffle([findQ(3)(), findQ(4)(), findQ(4)(), pathQ(), pathQ()]), [
    'これまでの まとめ。パスを 見(み)て ファイルを さがす 問題(もんだい)と、ファイルの 場所(ばしょ)から パスを えらぶ 問題(もんだい)が まざって 出(で)るよ。',
    `さがす ときの コツ：① パスを 左(ひだり)から 1つずつ 読(よ)む ② アドレスバーと 見(み)くらべる ③ まちがえたら ↑ で もどる。<br>この 力(ちから)は、宿題(しゅくだい)の ファイルを しまう・さがす ときに 使(つか)えるよ。`]);
  // =====================================================================
  // ⑦〜⑩ ファイルを 作る・名前を 変える・動かす・コピー・消す（2026年11月26日 ユーザー「1〜4まで やろう」）
  // 画面の 中の にせの エクスプローラー（さわれる 版）。右クリックの メニュー・ドラッグ・Ctrl+X/C/V/Z・Delete・F2 が 使える。
  // おわったら「できた」を おす → プログラムが フォルダの 中を 見て たしかめる。
  // =====================================================================
  const pickOr = (a, d) => a.length ? pick(a) : d;
  const T = s => (typeof R === 'function' ? R(F(s)) : F(s));
  const BIN = 'ごみ箱';
  const clone = o => JSON.parse(JSON.stringify(o));
  const nd = (n, c) => ({ n, d: !!c, ...(c ? { c } : {}), id: 'e' + (++fid) });
  const Bin = () => ({ n: BIN, d: true, bin: true, c: [], id: 'bin' });
  const binOf = r => r.c.find(x => x.bin);
  // id で さがす（ごみ箱の 中は のぞく）→ 名前の 道（Desktop から 下）
  const where = (d, id, acc = []) => { for (const x of d.c) { if (x.bin) continue; if (x.id === id) return [...acc, x.n]; if (x.d) { const r = where(x, id, [...acc, x.n]); if (r) return r; } } return null; };
  const at = (r, names) => { let d = r; for (let i = 0; i < names.length; i++) { const x = (d.c || []).find(y => y.n === names[i] && !y.bin); if (!x) return null; d = x; } return d; };
  const allFiles = d => d.c.flatMap(x => x.bin ? [] : x.d ? allFiles(x) : [x]);
  const same = (a, b) => !!a && a.join('\\') === b.join('\\');
  const BAD = /[\\/:*?"<>|]/;
  const extOf = n => { const i = n.lastIndexOf('.'); return i > 0 ? n.slice(i) : ''; };
  const NEW = { dir: '新しい フォルダー', txt: '新しい テキスト ドキュメント.txt', docx: '新しい Microsoft Word 文書.docx', xlsx: '新しい Microsoft Excel ワークシート.xlsx' };
  const uniq = (dir, n) => { if (!dir.c.some(x => x.n === n)) return n; const e = extOf(n), b = e ? n.slice(0, -e.length) : n; for (let k = 2; ; k++) { const m = `${b} (${k})${e}`; if (!dir.c.some(x => x.n === m)) return m; } };
  const copyName = (dir, n) => { const e = extOf(n), b = e ? n.slice(0, -e.length) : n; let m = `${b} - コピー${e}`; for (let k = 2; dir.c.some(x => x.n === m); k++) m = `${b} - コピー (${k})${e}`; return m; };
  const reId = x => { x.id = 'e' + (++fid); if (x.c) x.c.forEach(reId); return x; };

  css.textContent += `.fxedit{position:relative;max-width:640px;margin:8px auto;text-align:left;outline:none}
  .fxedit .fxwin2{border:1px solid #9aa4b2;border-radius:8px;background:#fff;font-size:.62em;box-shadow:0 2px 8px #0002;overflow:hidden;color:#222}
  .fxedit .fxit.cut{opacity:.45}.fxedit .fxit.over{background:#b3dcff;border-color:#3d9be9}.fxedit .fxit input{width:100%;font:inherit;font-size:1em;padding:1px 2px;border:1px solid #3d9be9;text-align:center}
  .fxtask{font-size:.68em;background:#f3f8ee;border:1px solid #c5e1a5;border-radius:6px;padding:6px 10px;margin-bottom:6px;line-height:1.7}.fxtask .ok{color:#2e7d32}
  .fxmenu{position:absolute;z-index:20;background:#fff;border:1px solid #b8c2cf;border-radius:6px;box-shadow:0 4px 14px #0003;padding:4px 0;font-size:.62em;min-width:13em}
  .fxmenu div{padding:5px 16px;cursor:default;white-space:nowrap}.fxmenu div:hover{background:#e5f1fb}.fxmenu div.off{color:#aab;background:none}.fxmenu hr{border:0;border-top:1px solid #e1e5ea;margin:3px 0}
  .fxmodal{position:absolute;inset:0;background:#0003;display:flex;align-items:center;justify-content:center;z-index:30;border-radius:8px}
  .fxmodal>div{background:#fff;border-radius:8px;padding:14px 18px;max-width:80%;font-size:.66em;box-shadow:0 6px 20px #0004}.fxmodal button{font-size:1em;margin:10px 6px 0 0;padding:4px 14px}
  .fxdone{display:flex;gap:8px;justify-content:flex-end;margin-top:6px}.fxdone button{font-size:.7em;padding:4px 14px}
  table .fxedit{display:none}.fxsum{display:none}table .fxsum{display:inline;font-size:.85em}`;

  function bootEdit(el) {
    el.dataset.on = '1';
    const w = W[el.dataset.w]; if (!w) return;
    const demo = !!el.closest('.ex');
    el.tabIndex = 0;
    const S = { root: clone(w.root), cwd: [], back: [], sel: null, clip: null, undo: [], menu: null, ren: null, modal: null, msg: '', over: null, touch: false };
    const dirAt = names => { let d = S.root; for (const n of names) { const x = d.c.find(y => y.d && y.n === n); if (!x) return null; d = x; } return d; };
    const here = () => dirAt(S.cwd) || (S.cwd = [], S.root);
    const view = () => { const d = here(); return [...d.c].sort((a, b) => (!!b.bin - !!a.bin) || (b.d - a.d) || a.n.localeCompare(b.n, 'ja')); };
    const find = (id, d = S.root, path = []) => { for (const x of d.c) { if (x.id === id) return { x, parent: d, path }; if (x.d) { const r = find(id, x, [...path, x.n]); if (r) return r; } } return null; };
    const snap = () => { S.undo.push(JSON.stringify(S.root)); if (S.undo.length > 40) S.undo.shift(); };
    const say = m => { S.msg = m; };
    const inBin = () => !!here().bin;
    const addr = () => inBin() ? BIN : pathStr([S.root.n, ...S.cwd]);

    const draw = () => {
      const d = here(), v = view(), cutId = S.clip && S.clip.cut ? S.clip.id : null;
      const items = v.map((x, i) => {
        const cls = `fxit${S.sel === x.id ? ' sel' : ''}${cutId === x.id ? ' cut' : ''}${S.over === x.id ? ' over' : ''}`;
        const label = S.ren === x.id ? `<input value="${esc(x.n)}" spellcheck="false">` : `${esc(x.n)}${kana(x.n)}`;
        const ic = x.bin ? (x.c.length ? '🗑️' : '🗑') : iconOf(x);
        return `<div class="${cls}" data-i="${i}" draggable="${!demo && !x.bin && !inBin() && S.ren !== x.id}"><span class="ic">${ic}</span>${label}</div>`; }).join('');
      const steps = w.task.steps.map(s => `<div class="${s.ok(S.root) ? 'ok' : ''}">${s.ok(S.root) ? '✅' : '⬜'} ${T(s.t)}</div>`).join('');
      el.innerHTML = `<div class="fxtask">${T('<b>やる こと</b>')}${steps}</div>
        <div class="fxwin2">${bar(addr(), S.cwd.length > 0, S.back.length > 0)}
        <div class="fxbody">${items || `<span style="color:#889">${T(inBin() ? '（ごみ箱は 空(から)）' : '（この フォルダは 空(から)）')}</span>`}</div>
        <div class="fxstat">${S.msg ? T(S.msg) : `${d.c.length} こ`}</div></div>
        ${demo ? '' : `<div class="fxdone"><button data-b="reset">${T('はじめから')}</button><button class="primary" data-b="done">${T('できた')}</button></div>`}
        ${S.menu ? `<div class="fxmenu" style="left:${S.menu.x}px;top:${S.menu.y}px">${S.menu.items.map((m, k) => m === '-' ? '<hr>' : `<div data-m="${k}" class="${m[1] ? '' : 'off'}">${T(m[0])}</div>`).join('')}</div>` : ''}
        ${S.modal ? `<div class="fxmodal"><div>${T(S.modal.text)}<br>${S.modal.btns.map((b, k) => `<button data-q="${k}"${k === 0 ? ' class="primary"' : ''}>${T(b[0])}</button>`).join('')}</div></div>` : ''}`;
      if (S.ren) { const inp = el.querySelector('.fxit input'); if (inp) { inp.focus(); const e = extOf(inp.value), x = find(S.ren); inp.setSelectionRange(0, x && !x.x.d && e ? inp.value.length - e.length : inp.value.length); } }
      else if (!demo && document.activeElement !== el && el.isConnected && !S.modal) el.focus({ preventScroll: true });
    };
    const go = names => { S.back.push(S.cwd); S.cwd = names; S.sel = null; say(''); draw(); };
    const ask = (text, btns) => { S.modal = { text, btns }; draw(); };

    // ----- 操作 -----
    const newItem = kind => { if (inBin()) return; snap(); const d = here(), n = uniq(d, NEW[kind]), x = kind === 'dir' ? nd(n, []) : nd(n); d.c.push(x); S.sel = x.id; S.ren = x.id; say(''); draw(); };
    const startRen = id => { const f = find(id); if (!f || f.x.bin || inBin()) return; S.sel = id; S.ren = id; draw(); };
    const endRen = (val, ok) => {
      const f = find(S.ren); S.ren = null; if (!f || !ok) return draw();
      val = val.trim(); const x = f.x;
      if (!val || val === x.n) return draw();
      if (BAD.test(val)) { S.ren = x.id; return ask('ファイル名(めい)に つぎの 文字(もじ)は 使(つか)えません：<br><b>\\ / : * ? " &lt; &gt; |</b>', [['OK', () => {}]]); }
      if (f.parent.c.some(y => y !== x && y.n === val)) { S.ren = x.id; return ask(`この 場所(ばしょ)には 同(おな)じ 名前(なまえ)の ${x.d ? 'フォルダー' : 'ファイル'}が もう あります。`, [['OK', () => {}]]); }
      const doIt = () => { snap(); x.n = val; say(''); };
      if (!x.d && extOf(val) !== extOf(x.n)) return ask('拡張子(かくちょうし)（さいごの「.png」など）を 変(か)えると、ファイルが 使(つか)えなく なる ことが あります。<br>本当(ほんとう)に 変(か)えますか？', [['はい', doIt], ['いいえ', () => {}]]);
      doIt(); draw();
    };
    const del = id => { const f = find(id); if (!f || f.x.bin) return;
      if (f.parent.bin) return ask(`「${esc(f.x.n)}」を 完全(かんぜん)に 削除(さくじょ)しますか？（元(もと)に もどせません）`, [['はい', () => { snap(); f.parent.c.splice(f.parent.c.indexOf(f.x), 1); }], ['いいえ', () => {}]]);
      snap(); f.parent.c.splice(f.parent.c.indexOf(f.x), 1); f.x.from = f.path; binOf(S.root).c.push(f.x);
      if (S.clip && S.clip.id === id) S.clip = null; S.sel = null; say(`${esc(f.x.n)} を ごみ箱に 入(い)れたよ（Ctrl+Z で 元(もと)に もどせる）`); draw(); };
    const restore = id => { const f = find(id); if (!f || !f.parent.bin) return; snap();
      f.parent.c.splice(f.parent.c.indexOf(f.x), 1); const to = dirAt(f.x.from || []) || S.root; const back = f.x.from; delete f.x.from;
      f.x.n = uniq(to, f.x.n); to.c.push(f.x); say(`${esc(f.x.n)} を 元(もと)の 場所(ばしょ)（${esc(pathStr([S.root.n, ...(back || [])]))}）に もどしたよ`); draw(); };
    const emptyBin = () => { const b = binOf(S.root); if (!b.c.length) return say('ごみ箱は もう 空(から)だよ'), draw();
      ask('ごみ箱を 空(から)に しますか？<br>中の ものは 元(もと)に もどせなく なります。', [['はい', () => { snap(); b.c = []; say('ごみ箱を 空(から)に したよ'); }], ['いいえ', () => {}]]); };
    const putInto = (id, toNames, cut) => {   // 移動（cut）・コピー
      const f = find(id), to = dirAt(toNames); if (!f || !to || to.bin) return draw();
      if (cut && f.x.d) { const p = [...f.path, f.x.n]; if (toNames.length >= p.length && same(toNames.slice(0, p.length), p)) return say('その フォルダの 中には 移動(いどう)できないよ'), draw(); }
      if (cut && to === f.parent) { S.clip = null; return draw(); }
      if (!cut && to === f.parent) { snap(); const c = reId(clone(f.x)); c.n = copyName(to, f.x.n); to.c.push(c); S.sel = c.id; say(`コピーしたよ：${esc(c.n)}`); return draw(); }
      const go2 = replace => { snap(); if (replace) to.c.splice(to.c.indexOf(replace), 1);
        let x = f.x; if (cut) { f.parent.c.splice(f.parent.c.indexOf(f.x), 1); S.clip = null; } else x = reId(clone(f.x));
        to.c.push(x); S.sel = to === here() ? x.id : null; say(`${cut ? '移動(いどう)' : 'コピー'}したよ：${esc(x.n)} → ${esc(pathStr([S.root.n, ...toNames]))}`); };
      const dup = to.c.find(y => y.n === f.x.n);
      if (dup) { if (dup.d || f.x.d) return say('そこには 同(おな)じ 名前(なまえ)の ものが あるよ。先(さき)に 名前(なまえ)を 変(か)えよう'), draw();
        return ask(`「${esc(f.x.n)}」と いう ファイルが もう あります。`, [['置(お)きかえる', () => go2(dup)], ['スキップする', () => {}]]); }
      go2(null); draw();
    };
    const paste = toNames => { if (!S.clip) return say('先(さき)に 切(き)り取(と)り か コピーを してね'), draw(); if (inBin() && !toNames) return; putInto(S.clip.id, toNames || S.cwd, S.clip.cut); };
    const clip = (id, cut) => { const f = find(id); if (!f || f.x.bin || f.parent.bin) return; S.clip = { id, cut }; say(`${esc(f.x.n)} を ${cut ? '切(き)り取(と)ったよ' : 'コピーしたよ'}（貼(は)り付(つ)けたい 場所(ばしょ)で Ctrl+V）`); draw(); };
    const undo = () => { if (!S.undo.length) return say('もう もどせないよ'), draw(); S.root = JSON.parse(S.undo.pop()); if (!dirAt(S.cwd)) S.cwd = []; S.sel = null; S.ren = null; say('元(もと)に もどしたよ'); draw(); };
    const open = x => { if (x.d) return go([...S.cwd, x.n]); if (inBin()) return; say('まねの ファイルなので、中(なか)は 見(み)られないよ'); draw(); };
    const submit = () => {
      const bad = w.task.steps.find(s => !s.ok(S.root));
      const a = document.querySelector('.ans'); if (!a || !document.getElementById('ok')) return;
      a.dataset.raw = a.value = bad ? `まだ：${bad.t.replace(/<[^>]+>/g, '').replace(/\(([ぁ-ゟ]+)\)/g, '')}` : 'できた'; document.getElementById('ok').click();
    };

    // ----- メニュー -----
    const menuAt = (e, x) => {
      const r = el.getBoundingClientRect(), b = inBin();
      let items;
      if (x && x.bin) items = [['ひらく', () => open(x)], ['ごみ箱を 空(から)に する', emptyBin]];
      else if (x && b) items = [['元(もと)に 戻(もど)す', () => restore(x.id)], '-', ['削除(さくじょ)（完全(かんぜん)に 消(け)す）', () => del(x.id)]];
      else if (x) items = [['ひらく', () => open(x)], '-', ['切(き)り取(と)り　Ctrl+X', () => clip(x.id, true)], ['コピー　Ctrl+C', () => clip(x.id, false)],
        ...(x.d ? [['貼(は)り付(つ)け（この フォルダの 中(なか)へ）', S.clip ? () => paste([...S.cwd, x.n]) : null]] : []), '-',
        ['削除(さくじょ)　Delete', () => del(x.id)], ['名前(なまえ)の 変更(へんこう)　F2', () => startRen(x.id)]];
      else if (b) items = [['ごみ箱を 空(から)に する', emptyBin], ['元(もと)に 戻(もど)す　Ctrl+Z', S.undo.length ? undo : null]];
      else items = [['新規(しんき)作成(さくせい) ▸ フォルダー', () => newItem('dir')], ['新規(しんき)作成(さくせい) ▸ テキスト ドキュメント', () => newItem('txt')],
        ['新規(しんき)作成(さくせい) ▸ Word 文書(ぶんしょ)', () => newItem('docx')], ['新規(しんき)作成(さくせい) ▸ Excel ワークシート', () => newItem('xlsx')], '-',
        ['貼(は)り付(つ)け　Ctrl+V', S.clip ? () => paste() : null], ['元(もと)に 戻(もど)す　Ctrl+Z', S.undo.length ? undo : null]];
      S.menu = { x: Math.max(0, Math.min(e.clientX - r.left, r.width - 190)), y: e.clientY - r.top, items }; draw();
    };

    draw();
    if (demo) return;
    const itemOf = t => { const it = t.closest && t.closest('.fxit'); return it ? view()[+it.dataset.i] : null; };
    el.addEventListener('pointerdown', e => { S.touch = e.pointerType === 'touch'; if (typeof window.touch === 'function') window.touch(); });
    el.addEventListener('click', e => {
      if (e.target.closest('.fxit input')) return;
      const mq = e.target.closest('[data-q]'); if (mq) { const fn = S.modal.btns[+mq.dataset.q][1]; S.modal = null; fn(); draw(); return; }
      if (S.modal) return;
      const mm = e.target.closest('[data-m]'); if (mm) { const m = S.menu.items[+mm.dataset.m]; if (!m[1]) return; S.menu = null; m[1](); draw(); return; }
      if (S.menu) { S.menu = null; draw(); return; }
      const b = e.target.closest('button[data-b]');
      if (b) { const k = b.dataset.b;
        if (k === 'up' && S.cwd.length) go(S.cwd.slice(0, -1));
        else if (k === 'back' && S.back.length) { S.cwd = S.back.pop(); S.sel = null; say(''); draw(); }
        else if (k === 'reset') ask('はじめの 形(かたち)に もどしますか？', [['はい', () => { Object.assign(S, { root: clone(w.root), cwd: [], back: [], sel: null, clip: null, undo: [], msg: '' }); }], ['いいえ', () => {}]]);
        else if (k === 'done') submit();
        return; }
      if (S.ren) { const inp = el.querySelector('.fxit input'); endRen(inp ? inp.value : '', true); return; }
      const x = itemOf(e.target);
      if (x && S.touch) return open(x);
      S.sel = x ? x.id : null; draw();
    });
    el.addEventListener('dblclick', e => { if (S.ren || S.modal) return; const x = itemOf(e.target); if (x) open(x); });
    el.addEventListener('contextmenu', e => { e.preventDefault(); if (S.ren || S.modal) return; const x = itemOf(e.target); if (x) S.sel = x.id; menuAt(e, x); });
    el.addEventListener('keydown', e => {
      e.stopPropagation();   // 下の こたえの 箱（app.js の document.onkeydown）に わたさない
      if (typeof window.touch === 'function') window.touch();
      if (e.target.tagName === 'INPUT') { if (e.isComposing || e.keyCode === 229) return; if (e.key === 'Enter') { e.preventDefault(); endRen(e.target.value, true); } else if (e.key === 'Escape') { e.preventDefault(); endRen('', false); } return; }
      if (S.modal) { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); const fn = S.modal.btns[e.key === 'Enter' ? 0 : S.modal.btns.length - 1][1]; S.modal = null; fn(); draw(); } return; }
      if (S.menu && e.key === 'Escape') { S.menu = null; draw(); return; }
      const c = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
      if (c && k === 'x' && S.sel) { e.preventDefault(); clip(S.sel, true); }
      else if (c && k === 'c' && S.sel) { e.preventDefault(); clip(S.sel, false); }
      else if (c && k === 'v') { e.preventDefault(); paste(); }
      else if (c && k === 'z') { e.preventDefault(); undo(); }
      else if (e.key === 'Delete' && S.sel) { e.preventDefault(); del(S.sel); }
      else if (e.key === 'F2' && S.sel) { e.preventDefault(); startRen(S.sel); }
      else if (e.key === 'Enter' && S.sel) { e.preventDefault(); const f = find(S.sel); if (f) open(f.x); }
      else if (e.key === 'Backspace' && S.cwd.length) { e.preventDefault(); go(S.cwd.slice(0, -1)); }
    });
    // ドラッグ＆ドロップ：フォルダの 上か ごみ箱の 上で はなす
    let dragId = null;
    el.addEventListener('dragstart', e => { const x = itemOf(e.target); if (!x) return; dragId = x.id; S.sel = x.id; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', x.n); } catch (_) {} });
    el.addEventListener('dragover', e => { const x = itemOf(e.target); if (dragId && x && x.d && x.id !== dragId) { e.preventDefault(); if (S.over !== x.id) { S.over = x.id; el.querySelectorAll('.fxit').forEach((n, i) => n.classList.toggle('over', view()[i].id === x.id)); } } });
    el.addEventListener('dragleave', e => { if (!el.contains(e.relatedTarget)) { S.over = null; el.querySelectorAll('.fxit.over').forEach(n => n.classList.remove('over')); } });
    el.addEventListener('drop', e => { e.preventDefault(); const x = itemOf(e.target), id = dragId; dragId = null; S.over = null; if (!id || !x || !x.d || x.id === id) return draw();
      if (x.bin) return del(id);
      if (e.ctrlKey) putInto(id, [...S.cwd, x.n], false); else putInto(id, [...S.cwd, x.n], true); });
    el.addEventListener('dragend', () => { dragId = null; if (S.over) { S.over = null; draw(); } });
    setTimeout(() => el.isConnected && el.focus({ preventScroll: true }), 0);
  }
  new MutationObserver(() => document.querySelectorAll('.fxedit:not([data-on])').forEach(bootEdit)).observe(document.documentElement, { childList: true, subtree: true });

  // ---------- ⑦〜⑩ の 問題 ----------
  // デスクトップ：フォルダ 3つ（中に ファイル 2つずつ）＋ ファイル 3つ ＋ ごみ箱。ファイルの 名前は ぜんぶ ちがう
  const desk = (nf = 3) => { const used = new Set(), f = () => { for (let t = 0; t < 80; t++) { const n = fileName(); if (!used.has(n)) { used.add(n); return nd(n); } } return nd(`メモ${++fid}.txt`); };
    const fs = shuffle(FOLD).slice(0, 3).map(n => nd(n, [f(), f()])), loose = Array.from({ length: nf }, f);
    return { r: nd('Desktop', [...fs, ...loose, Bin()]), fs, loose, used, f }; };
  const keepAll = (r0, except = []) => { const ids = allFiles(r0).map(x => x.id).filter(id => !except.includes(id)); return { t: 'ほかの ファイルは 消(け)さない', ok: r => ids.every(id => where(r, id)) }; };
  const editQ = gen => () => { const w = gen(); const id = 'w' + (++wid); W[id] = w;
    return { key: `fe-${w.key}`, tap: { code: 0 }, boxes: [''], answer: ['できた'],
      exHint: F('右(みぎ)クリックの メニュー・ドラッグ・キーで ファイルを 動(うご)かして、さいごに「できた」を おそう。'),
      text: `<div class="fxgoal"><span class="fxsum">${w.task.steps.slice(0, -1).map(s => F(s.t)).join('／')}</span><span class="fxins">${F('下(した)の「やる こと」を ぜんぶ やって、さいごに <b>できた</b> を おそう（まちがえたら Ctrl+Z で もどせるよ）。')}</span></div><div class="fxedit" data-w="${id}"></div>` }; };
  const task = (r, key, steps) => ({ root: r, key, task: { steps } });
  const fsDir = (d, n) => d.c.find(x => x.n === n);

  const G7 = [   // 新しく 作る・名前を 変える
    () => { const { r, fs } = desk(), A = pick(fs), N = pick(SUB.filter(s => !A.c.some(x => x.n === s)));
      return task(r, `nd-${A.n}-${N}`, [{ t: `<b>${A.n}</b> フォルダの 中(なか)に、「<b>${N}</b>」と いう フォルダを 作(つく)る`, ok: x => { const y = at(x, [A.n, N]); return !!y && y.d; } }, keepAll(r)]); },
    () => { const { r, fs, used } = desk(), A = pick(fs), N = `${pickOr(FILES.txt.filter(n => !used.has(n + '.txt')), 'あたらしい メモ')}.txt`;
      return task(r, `nt-${A.n}-${N}`, [{ t: `<b>${A.n}</b> フォルダの 中(なか)に、「<b>${N}</b>」と いう テキスト ファイルを 作(つく)る`, ok: x => { const y = at(x, [A.n, N]); return !!y && !y.d; } }, keepAll(r)]); },
    () => { const { r, loose, used } = desk(), f = pick(loose), e = extOf(f.n), N = `${pickOr(FILES[e.slice(1)].filter(n => !used.has(n + e)), 'あたらしい')}${e}`;
      return task(r, `rf-${f.n}-${N}`, [{ t: `デスクトップの「<b>${f.n}</b>」の 名前(なまえ)を「<b>${N}</b>」に 変(か)える`, ok: x => same(where(x, f.id), [N]) }, keepAll(r)]); },
    () => { const { r, fs } = desk(), D = nd('新しい フォルダー', []), N = pick(FOLD.filter(n => !fs.some(x => x.n === n))); r.c.push(D);
      return task(r, `rd-${N}`, [{ t: `デスクトップの「<b>新(あたら)しい フォルダー</b>」の 名前(なまえ)を「<b>${N}</b>」に 変(か)える`, ok: x => same(where(x, D.id), [N]) }, keepAll(r)]); },
  ];
  const G8 = [   // 移動・コピー
    () => { const { r, fs, loose } = desk(), f = pick(loose), A = pick(fs);
      return task(r, `mv-${f.n}-${A.n}`, [{ t: `デスクトップの「<b>${f.n}</b>」を <b>${A.n}</b> フォルダに 移動(いどう)する`, ok: x => same(where(x, f.id), [A.n, f.n]) }, keepAll(r)]); },
    () => { const { r, fs } = desk(), [A, B] = shuffle(fs), f = pick(A.c);
      return task(r, `mv2-${f.n}-${B.n}`, [{ t: `<b>${A.n}</b> フォルダの 中(なか)の「<b>${f.n}</b>」を <b>${B.n}</b> フォルダに 移動(いどう)する`, ok: x => same(where(x, f.id), [B.n, f.n]) }, keepAll(r)]); },
    () => { const { r, fs, loose } = desk(), f = pick(loose), A = pick(fs);
      return task(r, `cp-${f.n}-${A.n}`, [{ t: `デスクトップの「<b>${f.n}</b>」を <b>${A.n}</b> フォルダに <b>コピー</b>する（デスクトップにも のこす）`, ok: x => same(where(x, f.id), [f.n]) && !!at(x, [A.n, f.n]) && !at(x, [A.n, f.n]).d }, keepAll(r)]); },
    () => { const { r, fs } = desk(), A = pick(fs), f = pick(A.c);
      return task(r, `mvd-${f.n}`, [{ t: `<b>${A.n}</b> フォルダの 中(なか)の「<b>${f.n}</b>」を <b>デスクトップ</b>に 移動(いどう)する`, ok: x => same(where(x, f.id), [f.n]) }, keepAll(r)]); },
    () => { const { r, fs } = desk(), [A, B] = shuffle(fs);
      return task(r, `mvf-${A.n}-${B.n}`, [{ t: `<b>${A.n}</b> フォルダを まるごと <b>${B.n}</b> フォルダの 中(なか)に 移動(いどう)する`, ok: x => same(where(x, A.id), [B.n, A.n]) }, keepAll(r)]); },
  ];
  const G9 = [   // 削除・ごみ箱・元に もどす
    () => { const { r, loose } = desk(), f = pick(loose);
      return task(r, `rm-${f.n}`, [{ t: `デスクトップの「<b>${f.n}</b>」を 削除(さくじょ)する（ごみ箱に 入(い)れる）`, ok: x => binOf(x).c.some(y => y.id === f.id) }, keepAll(r, [f.id])]); },
    () => { const { r, fs } = desk(), A = pick(fs), f = pick(A.c);
      return task(r, `rm2-${f.n}`, [{ t: `<b>${A.n}</b> フォルダの 中(なか)の「<b>${f.n}</b>」を 削除(さくじょ)する`, ok: x => binOf(x).c.some(y => y.id === f.id) }, keepAll(r, [f.id])]); },
    () => { const { r, fs, f: mk } = desk(), A = pick(fs), g = mk(), h = mk(); g.from = [A.n]; h.from = []; binOf(r).c.push(g, h);
      return task(r, `rs-${g.n}`, [{ t: `ごみ箱に 入(はい)って いる「<b>${g.n}</b>」を 元(もと)の 場所(ばしょ)に 戻(もど)す（右(みぎ)クリック →「元(もと)に 戻(もど)す」）`, ok: x => same(where(x, g.id), [A.n, g.n]) }, keepAll(r)]); },
    () => { const { r, f: mk } = desk(), a = mk(), b = mk(); a.from = []; b.from = []; binOf(r).c.push(a, b);
      return task(r, `eb-${a.n}`, [{ t: 'ごみ箱を 空(から)に する（ごみ箱を 右(みぎ)クリック）', ok: x => binOf(x).c.length === 0 }, keepAll(r)]); },
  ];
  const G10 = [   // まとめ：ちらかった デスクトップを 決まりどおりに 整理する
    () => { const used = new Set(), mk = ext => { const n = pickOr(FILES[ext].filter(m => !used.has(m)), `ファイル${used.size + 1}`); used.add(n); return nd(`${n}.${ext}`); };
      const pngs = [mk('png'), mk('png'), mk('png')], others = [mk('docx'), mk('xlsx'), mk('txt')], fs = shuffle(FOLD).slice(0, 2).map(n => nd(n, []));
      const r = nd('Desktop', [...fs, ...shuffle([...pngs, ...others]), Bin()]);
      return task(r, `s1-${pngs.map(x => x.n).join()}`, [
        { t: 'デスクトップに「<b>しゃしん</b>」と いう フォルダを 作(つく)る', ok: x => { const y = at(x, ['しゃしん']); return !!y && y.d; } },
        { t: `.png の ファイル（${pngs.length}こ）を ぜんぶ <b>しゃしん</b> フォルダに 移動(いどう)する`, ok: x => pngs.every(p => same(where(x, p.id), ['しゃしん', p.n])) }, keepAll(r)]); },
    () => { const { r, fs, loose } = desk(2), junk = nd('いらない.txt'), A = pick(fs), f = pick(loose), N = pick(FOLD.filter(n => !fs.some(x => x.n === n))); r.c.push(junk);
      return task(r, `s2-${f.n}-${N}`, [
        { t: '「<b>いらない.txt</b>」を 削除(さくじょ)する', ok: x => binOf(x).c.some(y => y.id === junk.id) },
        { t: `「<b>${f.n}</b>」を <b>${A.n}</b> フォルダに 移動(いどう)する`, ok: x => { const p = where(x, f.id), q = where(x, A.id); return !!p && !!q && same(p, [...q, f.n]); } },
        { t: `<b>${A.n}</b> フォルダの 名前(なまえ)を「<b>${N}</b>」に 変(か)える`, ok: x => same(where(x, A.id), [N]) }, keepAll(r, [junk.id])]); },
    () => { const { r, fs, loose } = desk(), f = pick(loose), A = pick(fs), e = extOf(f.n), old = `${f.n.slice(0, -e.length)}_ふるい${e}`;
      return task(r, `s3-${f.n}-${A.n}`, [
        { t: `「<b>${f.n}</b>」を <b>${A.n}</b> フォルダに <b>コピー</b>する`, ok: x => { const y = at(x, [A.n, f.n]); return !!y && !y.d && y.id !== f.id; } },
        { t: `デスクトップに のこった 元(もと)の ファイルの 名前(なまえ)を「<b>${old}</b>」に 変(か)える（コピーの あとで）`, ok: x => same(where(x, f.id), [old]) }, keepAll(r)]); },
  ];
  const three = G => () => shuffle(G).slice(0, 3).map(g => editQ(g)());
  const add3 = (n, name, make, lecture) => { add(n, name, make, lecture); UNITS[`x0f-${n}`].pass = 0.6; };
  const KEYS = s => `<span style="font-family:Consolas,monospace;background:#eee;border:1px solid #bbb;border-radius:4px;padding:0 5px">${s}</span>`;
  add3(7, '作(つく)る・名前(なまえ)を 変(か)える', three(G7), [
    `何(なに)も ない 所(ところ)で <b>右(みぎ)クリック</b>（マウスの 右(みぎ)の ボタン）すると メニューが 出(で)るよ。<br><b>新規(しんき)作成(さくせい)</b> ▸ フォルダー で、新(あたら)しい フォルダが できる。テキスト ドキュメント（.txt）や Word・Excel の ファイルも 作(つく)れる。`,
    `作(つく)ると すぐ 名前(なまえ)を 入(い)れる 箱(はこ)に なるよ。名前(なまえ)を 打(う)って ${KEYS('Enter')}。<br>あとから 変(か)える ときは、えらんで ${KEYS('F2')} か、右(みぎ)クリック →「名前(なまえ)の 変更(へんこう)」。`,
    `名前(なまえ)の きまり：<br>・<b>\\ / : * ? " &lt; &gt; |</b> は 使(つか)えない<br>・同(おな)じ 場所(ばしょ)に 同(おな)じ 名前(なまえ)は つけられない<br>・さいごの「.png」「.txt」（<b>拡張子(かくちょうし)</b>）は 消(け)さない（ファイルの しゅるいの しるし）`]);
  add3(8, '移動(いどう)・コピー', three(G8), [
    `<b>移動(いどう)</b>：ファイルを ドラッグして（左(ひだり)ボタンを おしたまま 動(うご)かして）、フォルダの 上(うえ)で はなす。<br>または ${KEYS('Ctrl')}＋${KEYS('X')}（切(き)り取(と)り）→ 入(い)れたい フォルダを ひらいて ${KEYS('Ctrl')}＋${KEYS('V')}（貼(は)り付(つ)け）。`,
    `<b>コピー</b>：${KEYS('Ctrl')}＋${KEYS('C')} → 入(い)れたい 場所(ばしょ)で ${KEYS('Ctrl')}＋${KEYS('V')}。元(もと)の ファイルも のこるよ。<br>同(おな)じ 場所(ばしょ)に コピーすると「〇〇 - コピー」と いう 名前(なまえ)に なる。`,
    `右(みぎ)クリックの メニューにも「切(き)り取(と)り」「コピー」「貼(は)り付(つ)け」が あるよ。<br>入(い)れる 先(さき)に 同(おな)じ 名前(なまえ)の ファイルが あると「置(お)きかえる？」と 聞(き)かれる。置(お)きかえると 前(まえ)の ファイルは 消(き)えるので、よく 考(かんが)えて。`]);
  add3(9, '削除(さくじょ)・ごみ箱・元(もと)に もどす', three(G9), [
    `<b>削除(さくじょ)</b>：えらんで ${KEYS('Delete')} か、右(みぎ)クリック →「削除(さくじょ)」。ごみ箱に ドラッグしても いいよ。<br>削除(さくじょ)した ものは すぐには 消(き)えず、<b>ごみ箱</b>（🗑️）に 入(はい)る。`,
    `ごみ箱を ひらいて、もどしたい ものを 右(みぎ)クリック →「<b>元(もと)に 戻(もど)す</b>」で、元(もと)の 場所(ばしょ)に もどる。<br>「<b>ごみ箱を 空(から)に する</b>」と、中(なか)の ものは 本当(ほんとう)に 消(き)えて もどせない。`,
    `まちがえた ときは ${KEYS('Ctrl')}＋${KEYS('Z')}（<b>元(もと)に 戻(もど)す</b>）。いま した ことを 1つずつ もどせるよ。<br>人(ひと)の ファイルは かってに 消(け)さない。わからない ときは 大人(おとな)に 聞(き)こう。`]);
  add3(10, 'まとめ（ファイルの 整理(せいり)）', three(G10), [
    'ちらかった デスクトップを、きまりどおりに 整理(せいり)しよう。「やる こと」が いくつか あるよ。1つ おわると ✅ が つく。',
    `整理(せいり)の コツ：① 同(おな)じ しゅるいの ものは 1つの フォルダに ② フォルダの 名前(なまえ)は 中(なか)みが わかる ことばに ③ いらない ものは 消(け)す。<br>まちがえたら ${KEYS('Ctrl')}＋${KEYS('Z')}。はじめから やりなおす ときは「はじめから」。`]);
})();
