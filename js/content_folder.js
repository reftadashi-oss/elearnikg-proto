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
  add(6, 'まとめ', () => shuffle([findQ(3)(), findQ(4)(), findQ(4)(), pathQ(), pathQ()]), [
    'これまでの まとめ。パスを 見(み)て ファイルを さがす 問題(もんだい)と、ファイルの 場所(ばしょ)から パスを えらぶ 問題(もんだい)が まざって 出(で)るよ。',
    `さがす ときの コツ：① パスを 左(ひだり)から 1つずつ 読(よ)む ② アドレスバーと 見(み)くらべる ③ まちがえたら ↑ で もどる。<br>この 力(ちから)は、宿題(しゅくだい)の ファイルを しまう・さがす ときに 使(つか)えるよ。`]);
})();
