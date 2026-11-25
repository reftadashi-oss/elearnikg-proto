// パソコン「Linuxの 宝さがし」（2026年11月26日 ユーザーの 案）。content_more2.js などの あと、review.js の 前に 読む。
// 画面の 中の「にせの Linux」。本物の サーバーや パソコンの ファイルには さわらない（ブラウザの 中だけで 動く）。
// コマンドを 打って かくれた「あいことば」を さがし、下の 箱に 入れる。あいことばと ファイルの 置き場所は 毎回 プログラムが 作る。
// ステージと 文は ROOTの オリジナル（Claude の 案・仮。先生が 確かめる）。ほかの ゲームの まねは しない。
// 学年（5年）・1単元 3問・合格 3問中 2問（0.6）は 仮。
(() => {
  const pick = a => a[rand(0, a.length - 1)];
  const F = s => typeof s !== 'string' ? s : s.replace(/([一-鿿々]+)\(([ぁ-ゟ]+)\)/g, '{$1|$2}');
  const pc = SUBJECTS.find(s => s.id === 'x0');
  const se = { id: 'x0n', name: F('Linuxの 宝(たから)さがし'), units: [], noSum: true };   // noSum：まとめテスト・苦手まとめを 作らない（1問が 長いため）
  pc.series.push(se);

  // ---------- あいことばと ことば ----------
  const PWC = 'abcdefghjkmnpqrstuvwxyz23456789';   // l・1・o・0 は まぎらわしいので 使わない
  const pw = (n = 6) => Array.from({ length: n }, () => pick([...PWC])).join('');
  const WORDS = ['ringo', 'mikan', 'neko', 'inu', 'sora', 'umi', 'yama', 'kawa', 'hoshi', 'tsuki', 'kumo', 'ame', 'kaze', 'hana', 'ki', 'mori', 'sakana', 'tori', 'kame', 'usagi', 'densha', 'basu', 'kuruma', 'hon', 'enpitsu', 'tsukue', 'isu', 'mado', 'doa', 'boushi'];
  const sentence = () => `${pick(WORDS)} to ${pick(WORDS)} ga ${pick(['ita', 'atta', 'mieta', 'nakatta', 'hashitta', 'nemutta'])}.`;
  const line = p => `あいことばは ${p} だよ。`;

  // ---------- にせの ファイル ----------
  const D = c => ({ d: true, c });            // フォルダ
  const T = t => ({ d: false, t: t.replace(/([一-鿿々]+)\([ぁ-ゟ]+\)/g, '$1') });   // ファイル（中身の 文）。黒い 画面には ふりがなを 出せないので「漢字(よみ)」の よみは けす
  const HOME = '/home/tanken';
  const world = (homeC, extra) => ({ fs: D({ home: D({ tanken: D(homeC) }), etc: D({ 'hostname': T('root-pc') }), tmp: D({}) }), ...extra });

  // ---------- ステージ（1問ずつ 作る） ----------
  const NO = ['ここには ないよ。', 'ざんねん！ ほかを さがそう。', 'これは ただの メモだよ。', 'はずれ！'];
  const stages = {
    // ① ls と cat
    1: () => { const p = pw(), names = shuffle(['memo.txt', 'takara.txt', 'himitsu.txt', 'nikki.txt', 'kaimono.txt']).slice(0, 4), at = rand(0, 3), c = {};
      names.forEach((n, i) => c[n] = T(i === at ? line(p) : pick(NO)));
      return world(c, { p, goal: 'ホームの ファイルの どれかに、あいことばが 書(か)いて ある。<b>ls</b> で ファイルを 見て、<b>cat</b> で 読(よ)もう。' }); },
    // ② cd と pwd
    2: () => { const p = pw(), tops = ['mori', 'umi', 'yama'], subs = ['doukutsu', 'ike', 'kinoue', 'iwa'], t = pick(tops), s = pick(subs), c = {};
      tops.forEach(a => { c[a] = D({}); shuffle(subs).slice(0, 2).concat(a === t ? [s] : []).forEach(b => { c[a].c[b] = D({ 'hako.txt': T(a === t && b === s ? line(p) : pick(NO)) }); }); });
      c['chizu.txt'] = T(`たからの ちず：\n${t} の 中の ${s} の 中に ある hako.txt`);
      return world(c, { p, goal: '<b>chizu.txt</b>（ちず）を 読(よ)んで、<b>cd</b> で フォルダに 入(はい)って いこう。いま どこに いるかは <b>pwd</b>。' }); },
    // ③ ls -a（かくれた ファイル）
    3: () => { const p = pw(), h = pick(['.kakushi.txt', '.himitsu.txt', '.ura.txt']), c = { heya: D({ 'tsukue.txt': T(pick(NO)), 'hondana.txt': T(pick(NO)), [h]: T(line(p)) }) };
      c['hint.txt'] = T('heya の 中には、見(み)えない ファイルが あるらしい。\n名前(なまえ)が「.」で はじまる ファイルは ls では 出(で)てこない。');
      return world(c, { p, goal: '<b>heya</b> の 中に かくれた ファイルが ある。<b>ls -a</b> で さがそう。' }); },
    // ④ find
    4: () => { const p = pw(), names = ['a', 'b', 'c', 'kita', 'minami', 'higashi', 'nishi', 'ue', 'shita'], c = {}, dirs = [];
      const grow = (o, path, depth) => { shuffle(names).slice(0, depth === 0 ? 4 : 3).forEach(n => { o[n] = D({ [`${pick(WORDS)}.txt`]: T(pick(NO)) }); dirs.push([o[n].c, `${path}/${n}`]); if (depth < 2) grow(o[n].c, `${path}/${n}`, depth + 1); }); };
      grow(c, '.', 0); const deep = dirs.filter(([, s]) => s.split('/').length >= 4); pick(deep.length ? deep : dirs)[0]['takara.txt'] = T(line(p));
      return world(c, { p, goal: 'フォルダが たくさん。どこかに <b>takara.txt</b> が ある。<b>find . -name takara.txt</b> で 場所(ばしょ)を 見(み)つけて、<b>cat</b> で 読(よ)もう。' }); },
    // ⑤ grep
    5: () => { const p = pw(), n = rand(250, 350), at = rand(40, n - 40), ls = [];
      for (let i = 0; i < n; i++) ls.push(i === at ? `aikotoba: ${p}` : sentence());
      return world({ 'nikki.txt': T(ls.join('\n')) }, { p, goal: '<b>nikki.txt</b> は とても 長(なが)い。どこかの 行(ぎょう)に <b>aikotoba</b> と 書(か)いて ある。<b>grep aikotoba nikki.txt</b> で さがそう。' }); },
    // ⑥ sort と uniq
    6: () => { const p = pw(), ws = new Set(); while (ws.size < 30) { const w = pw(); if (w !== p) ws.add(w); } const ls = [p];
      [...ws].forEach(w => { for (let k = rand(2, 4); k > 0; k--) ls.push(w); });
      return world({ 'list.txt': T(shuffle(ls).join('\n')), 'hint.txt': T('list.txt の ことばは、どれも 2回(かい) 以上(いじょう) 出(で)てくる。\n1回(かい)しか 出(で)てこない ことばが あいことば。') },
        { p, goal: '<b>list.txt</b> の 中で、1回(かい)しか 出(で)てこない ことばが あいことば。<b>sort list.txt | uniq -u</b> を ためそう（<b>|</b> は Shift ＋ ￥ キー）。' }); },
    // ⑦ head・tail・wc
    7: () => { const p = pw(), n = rand(400, 600), first = Math.random() < 0.5, k = first ? rand(2, 5) : 1, ls = [];
      for (let i = 0; i < n; i++) ls.push(sentence());
      if (first) ls[k - 1] = `aikotoba: ${p}`; else ls[n - 1] = `aikotoba: ${p}`;
      const h = first ? `あいことばは 上(うえ)から ${k} 行目(ぎょうめ)。\nhead -n ${k} で 上(うえ)から ${k} 行(ぎょう)だけ 見(み)られるよ。` : 'あいことばは いちばん 下(した)の 行(ぎょう)。\ntail -n 1 で いちばん 下(した)の 1行(ぎょう)だけ 見(み)られるよ。';
      return world({ 'nagai.txt': T(ls.join('\n')), 'hint.txt': T(h) }, { p, goal: '<b>nagai.txt</b> は 何百行(なんびゃくぎょう)も ある。<b>hint.txt</b> を 読(よ)んで、<b>head</b> か <b>tail</b> を 使(つか)おう。<b>wc -l nagai.txt</b> で 行(ぎょう)の 数(かず)も わかるよ。' }); },
    // ⑧ まとめ：かくれた フォルダ ＋ find ＋ grep
    8: () => { const p = pw(), c = {}, tops = shuffle(['kita', 'minami', 'higashi', 'nishi']);
      tops.forEach(t => { c[t] = D({ 'memo.txt': T(pick(NO)) }); });
      const ura = pick(['.ura', '.kakushi', '.himitsu']), big = [], n = rand(200, 300), at = rand(30, n - 30);
      for (let i = 0; i < n; i++) big.push(i === at ? `aikotoba: ${p}` : sentence());
      c[tops[0]].c[ura] = D({ [`${pick(WORDS)}.txt`]: T(big.join('\n')) });
      c['hint.txt'] = T('どこかの フォルダの 中に、名前(なまえ)が「.」で はじまる かくれた フォルダが ある。\nその 中の 大(おお)きな ファイルの どこかに aikotoba と 書(か)いた 行(ぎょう)が ある。\nfind . を 使(つか)うと、かくれた ものも ぜんぶ 出(で)てくるよ。');
      return world(c, { p, goal: 'これまでの まとめ。<b>hint.txt</b> を 読(よ)んで、<b>find</b>・<b>cd</b>・<b>grep</b> を 組(く)み合(あ)わせよう。' }); },
  };

  // ---------- シェル ----------
  const W = {}; let wid = 0;
  const clone = o => JSON.parse(JSON.stringify(o));
  const norm = (cwd, path) => {
    if (!path || path === '~') return HOME;
    let parts = path.startsWith('/') ? [] : path.startsWith('~/') ? HOME.split('/').filter(Boolean) : cwd.split('/').filter(Boolean);
    for (const x of path.replace(/^~\//, '').split('/')) { if (!x || x === '.') continue; if (x === '..') parts.pop(); else parts.push(x); }
    return '/' + parts.join('/');
  };
  const node = (fs, abs) => { let n = fs; for (const x of abs.split('/').filter(Boolean)) { if (!n.d || !n.c[x]) return null; n = n.c[x]; } return n; };
  const show = (cwd, abs) => abs === HOME ? '~' : abs.startsWith(HOME + '/') ? '~' + abs.slice(HOME.length) : abs;
  const glob = g => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
  const HELP = [
    'つかえる コマンド：',
    '  ls          ファイルと フォルダを 見る（ls -a で かくれた ものも）',
    '  cd 名前     フォルダに 入る（cd .. で 1つ 上へ、cd だけで ホームへ）',
    '  pwd         いま いる 場所',
    '  cat 名前    ファイルを 読む',
    '  find . -name 名前   ファイルを さがす',
    '  grep ことば ファイル   ことばが ある 行だけ 出す',
    '  head -n 数 / tail -n 数   上から・下から 何行か 出す',
    '  wc -l ファイル   行の 数',
    '  sort / uniq -u / uniq -c   ならべる・1回だけの 行・数える',
    '  clear       画面を きれいに',
    '  |（Shift ＋ ￥）で コマンドを つなげる。↑ キーで 前の コマンド。Tab キーで 名前の のこりを 入れる。',
  ];
  function run(st, input) {
    const out = [], err = s => out.push({ e: true, s });
    const segs = input.split('|').map(s => s.trim());
    let pipe = null;
    for (const seg of segs) {
      const a = seg.match(/"[^"]*"|'[^']*'|\S+/g) || []; const cmd = a.shift(); if (!cmd) { if (segs.length > 1) err('| の 前か あとが からっぽ'); return out; }
      const args = a.map(x => x.replace(/^["']|["']$/g, ''));
      const flags = args.filter(x => /^-[a-zA-Z]+$/.test(x)), rest = args.filter(x => !/^-[a-zA-Z]+$/.test(x));
      const readFile = p => { const ab = norm(st.cwd, p), n = node(st.fs, ab); if (!n) { err(`${cmd}: ${p}: そんな ファイルは ないよ`); return null; } if (n.d) { err(`${cmd}: ${p}: それは フォルダだよ（cd で 入ろう）`); return null; } return n.t.split('\n'); };
      const input_ = () => { if (pipe) return pipe; const f = rest.find(x => !/^\d+$/.test(x)); if (!f) { err(`${cmd}: ファイルの 名前を 書いてね`); return null; } return readFile(f); };
      const nOpt = def => { const i = args.indexOf('-n'); if (i >= 0 && /^\d+$/.test(args[i + 1] || '')) return +args[i + 1]; const m = args.find(x => /^-\d+$/.test(x)); return m ? +m.slice(1) : def; };
      let res = [];
      switch (cmd) {
        case 'help': res = HELP; break;
        case 'clear': st.clear = true; return [];
        case 'pwd': res = [st.cwd]; break;
        case 'echo': res = [rest.join(' ')]; break;
        case 'whoami': res = ['tanken']; break;
        case 'ls': {
          const all = flags.some(f => f.includes('a')), targets = rest.length ? rest : ['.'];
          for (const t of targets) { const ab = norm(st.cwd, t), n = node(st.fs, ab);
            if (!n) { err(`ls: ${t}: そんな ファイルや フォルダは ないよ`); continue; }
            if (!n.d) { res.push(t); continue; }
            if (targets.length > 1) res.push(t + ':');
            const names = Object.keys(n.c).filter(x => all || !x.startsWith('.')).sort();
            res.push({ ls: (all ? ['.', '..'] : []).concat(names).map(x => [x, x === '.' || x === '..' || (n.c[x] && n.c[x].d)]) }); }
          break; }
        case 'cd': { const ab = norm(st.cwd, rest[0]), n = node(st.fs, ab);
          if (!n) err(`cd: ${rest[0]}: そんな フォルダは ないよ`); else if (!n.d) err(`cd: ${rest[0]}: それは ファイルだよ（cat で 読もう）`); else st.cwd = ab;
          break; }
        case 'cat': if (pipe) { res = pipe; break; } if (!rest.length) { err('cat: ファイルの 名前を 書いてね'); break; } for (const f of rest) { const t = readFile(f); if (t) res.push(...t); } break;
        case 'find': {
          const ni = args.indexOf('-name');
          if (ni >= 0 && !args[ni + 1]) { err('find: -name の あとに 名前を 書いてね'); break; }
          const re = ni >= 0 ? glob(args[ni + 1]) : null;
          const start = args.find((x, i) => !x.startsWith('-') && i !== ni + 1) || '.';
          const ab = norm(st.cwd, start), n = node(st.fs, ab); if (!n) { err(`find: ${start}: そんな フォルダは ないよ`); break; }
          const walk = (o, p) => { if (!re || re.test(p.split('/').pop())) res.push(p); if (o.d) Object.keys(o.c).sort().forEach(k => walk(o.c[k], `${p}/${k}`)); };
          walk(n, start.length > 1 ? start.replace(/\/$/, '') : start); break; }
        case 'grep': {
          const pat = rest[0]; if (!pat) { err('grep: さがす ことばを 書いてね（例：grep aikotoba nikki.txt）'); break; }
          const ic = flags.some(f => f.includes('i')), rec = flags.some(f => /[rR]/.test(f)), hasN = flags.some(f => f.includes('n'));
          const hit = s => ic ? s.toLowerCase().includes(pat.toLowerCase()) : s.includes(pat);
          if (pipe) { res = pipe.filter(hit); break; }
          const files = rest.slice(1); if (!files.length) { err('grep: どの ファイルから さがすか 書いてね（例：grep aikotoba nikki.txt）'); break; }
          const list = [];
          for (const f of files) { const ab = norm(st.cwd, f), n = node(st.fs, ab); if (!n) { err(`grep: ${f}: そんな ファイルは ないよ`); continue; }
            if (n.d) { if (!rec) { err(`grep: ${f}: フォルダだよ（grep -r で 中まで さがせる）`); continue; } const walk = (o, p) => o.d ? Object.keys(o.c).sort().forEach(k => walk(o.c[k], `${p}/${k}`)) : list.push([p, o.t]); walk(n, f.replace(/\/$/, '')); }
            else list.push([f, n.t]); }
          const multi = list.length > 1;
          list.forEach(([p, t]) => t.split('\n').forEach((s, i) => { if (hit(s)) res.push(`${multi ? p + ':' : ''}${hasN ? i + 1 + ':' : ''}${s}`); }));
          break; }
        case 'head': case 'tail': { const t = input_(); if (!t) break; const k = nOpt(10); res = cmd === 'head' ? t.slice(0, k) : t.slice(Math.max(0, t.length - k)); break; }
        case 'wc': { const t = input_(); if (!t) break; const f = rest.find(x => !/^\d+$/.test(x)); res = [`${t.length}${pipe ? '' : ' ' + f}`]; if (!flags.some(x => x.includes('l'))) res = [`${t.length} ${t.join(' ').split(/\s+/).filter(Boolean).length} ${t.join('\n').length}${pipe ? '' : ' ' + f}`]; break; }
        case 'sort': { const t = input_(); if (!t) break; res = t.slice().sort(); if (flags.some(x => x.includes('r'))) res.reverse(); break; }
        case 'uniq': { const t = input_(); if (!t) break; const g = []; t.forEach(s => { const l = g[g.length - 1]; if (l && l[0] === s) l[1]++; else g.push([s, 1]); });
          const u = flags.some(x => x.includes('u')), c = flags.some(x => x.includes('c'));
          res = g.filter(([, n]) => !u || n === 1).map(([s, n]) => c ? `${String(n).padStart(4)} ${s}` : s); break; }
        case 'sudo': err('sudo: ここでは つかえないよ'); return out;
        case 'rm': case 'mv': case 'cp': case 'mkdir': case 'touch': err(`${cmd}: この 宝さがしでは つかえないよ（ファイルは こわさない）`); return out;
        default: err(`${cmd}: そんな コマンドは ないよ（help で 一覧）`); return out;
      }
      pipe = res.flatMap(x => typeof x === 'string' ? [x] : x.ls.map(([n]) => n));
      if (seg === segs[segs.length - 1]) res.forEach(x => out.push(typeof x === 'string' ? { s: x } : x));
    }
    return out;
  }

  // ---------- 画面 ----------
  const css = document.createElement('style');
  css.textContent = `.lxterm{background:#1d1f21;color:#e6e6e6;font-family:Consolas,"Courier New",monospace;font-size:.72em;text-align:left;border-radius:8px;padding:8px 10px;height:15em;overflow-y:auto;margin:8px auto;max-width:760px;cursor:text;line-height:1.45}
  .lxterm .o{white-space:pre-wrap;word-break:break-all}.lxterm .er{color:#ff8a80}.lxterm .dir{color:#82b1ff;font-weight:bold}.lxterm .pr{color:#b9f6ca}
  .lxterm .ls span{display:inline-block;margin-right:18px}.lxterm .in{display:flex}.lxterm input{flex:1;background:transparent;border:0;outline:0;color:#fff;font:inherit;padding:0;margin-left:6px}
  .lxgoal{max-width:760px;margin:4px auto;text-align:left}.lxwarn{color:#c62828;font-size:.9em}`;
  document.head.appendChild(css);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const toHalf = s => s.replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/　/g, ' ').replace(/[￥¥]/g, '\\');
  function boot(el) {
    el.dataset.on = '1';
    const w = W[el.dataset.w]; if (!w) return;
    const st = { fs: clone(w.fs), cwd: HOME, hist: [], hi: 0 };
    const demo = !!el.closest('.ex');   // 講義の 例題：打てない（見るだけ）
    const prompt = () => `<span class="pr">tanken@root:${esc(show(st.cwd, st.cwd))}$</span>`;
    const log = document.createElement('div'); el.appendChild(log);
    const add = h => { const d = document.createElement('div'); d.className = 'o'; d.innerHTML = h; log.appendChild(d); };
    add('ようこそ！ <b>help</b> と 打つと、つかえる コマンドが 出るよ。');
    if (demo) { add(`${prompt()} ls`); return; }
    const row = document.createElement('div'); row.className = 'in'; row.innerHTML = prompt() + '<input spellcheck="false" autocomplete="off" autocapitalize="off" lang="en" inputmode="latin">';
    el.appendChild(row);
    const inp = row.querySelector('input');
    el.addEventListener('mousedown', e => { if (e.target !== inp && !window.getSelection().toString()) setTimeout(() => inp.focus(), 0); });
    const warn = () => { const bad = /[ぁ-んァ-ヶ一-鿿]/.test(inp.value); row.title = bad ? '「半角/全角」キーを 1回 おしてね' : ''; inp.style.color = bad ? '#ffcc80' : ''; };
    inp.addEventListener('input', warn);
    inp.addEventListener('keydown', e => {
      e.stopPropagation();                       // 下の こたえの 箱の キー操作（app.js の document.onkeydown）に わたさない
      if (typeof touch === 'function') touch();  // 打っている あいだは 自動ログアウトしない
      if (e.isComposing || e.keyCode === 229) return;
      if (e.key === 'Enter') {
        e.preventDefault(); const v = toHalf(inp.value).trim(); inp.value = ''; warn();
        add(`${prompt()} ${esc(v)}`);
        if (v) { st.hist.push(v); st.hi = st.hist.length;
          if (/[ぁ-んァ-ヶ一-鿿]/.test(v)) add('<span class="er">ひらがなに なって いるよ。「半角/全角」キーを 1回 おして、英語の 文字で 打とう。</span>');
          else run(st, v).forEach(o => add(o.ls ? `<div class="ls">${o.ls.map(([n, d]) => `<span class="${d ? 'dir' : ''}">${esc(n)}${d && n !== '.' && n !== '..' ? '/' : ''}</span>`).join(' ')}</div>` : o.e ? `<span class="er">${esc(o.s)}</span>` : esc(o.s))); }
        if (st.clear) { log.innerHTML = ''; st.clear = false; }
        row.querySelector('.pr').outerHTML = prompt();
        el.scrollTop = el.scrollHeight; return;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); st.hi = Math.max(0, Math.min(st.hist.length, st.hi + (e.key === 'ArrowUp' ? -1 : 1))); inp.value = st.hist[st.hi] || ''; return; }
      if (e.key === 'Tab') { e.preventDefault();
        const m = inp.value.match(/^(.*?)(\S*)$/), word = m[2], dirPart = word.includes('/') ? word.slice(0, word.lastIndexOf('/') + 1) : '', base = word.slice(dirPart.length);
        const n = node(st.fs, norm(st.cwd, dirPart || '.')); if (!n || !n.d) return;
        const hits = Object.keys(n.c).filter(k => k.startsWith(base) && (base.startsWith('.') || !k.startsWith('.')));
        if (hits.length === 1) inp.value = m[1] + dirPart + hits[0] + (n.c[hits[0]].d ? '/' : '');
        else if (hits.length > 1) { add(`${prompt()} ${esc(inp.value)}`); add(`<div class="ls">${hits.sort().map(h => `<span class="${n.c[h].d ? 'dir' : ''}">${esc(h)}</span>`).join(' ')}</div>`); el.scrollTop = el.scrollHeight; }
      }
    });
    setTimeout(() => inp.focus(), 0);
  }
  new MutationObserver(() => document.querySelectorAll('.lxterm:not([data-on])').forEach(boot)).observe(document.documentElement, { childList: true, subtree: true });

  // ---------- 単元 ----------
  const q = (stage) => () => { const w = stages[stage](), id = 'w' + (++wid); W[id] = w;
    return { key: `lx${stage}-${w.p}`, keys: true, boxes: ['あいことば'], answer: [w.p],
      text: F(`<div class="lxgoal">${w.goal}</div><div class="lxterm" data-w="${id}"></div><div class="lxgoal">見(み)つけた あいことばを 下(した)の 箱(はこ)に 入(い)れて Enter（箱(はこ)を おしてから 打(う)とう）。<br><span class="lxwarn">ひらがなに なったら「半角(はんかく)/全角(ぜんかく)」キーを 1回(かい) おそう。</span></div>`) }; };
  const three = stage => () => [q(stage)(), q(stage)(), q(stage)()];
  const add = (n, name, lecture) => { const id = `x0n-${n}`; UNITS[id] = { id, subject: 'x0', series: se.id, name: F(name), col: 'Linux', pass: 0.6, grade: 5, make: three(n), lecture: lecture.map(F) }; se.units.push(id); };
  const ex = (cmd, out) => `<pre style="background:#1d1f21;color:#e6e6e6;text-align:left;padding:8px;border-radius:6px;font-size:.85em;white-space:pre-wrap">$ ${esc(cmd)}${out ? '\n' + esc(out) : ''}</pre>`;
  const COMMON = 'Linux（リナックス）は、サーバーや ロボットなどで 使(つか)われて いる パソコンの しくみ。マウスでは なく、<b>コマンド</b>（命令(めいれい)）を 打(う)って 動(うご)かすよ。この 宝(たから)さがしは 画面(がめん)の 中だけの「にせの Linux」なので、何(なに)を 打(う)っても こわれないよ。';
  add(1, 'ls と cat（ファイルを 見(み)る・読(よ)む）', [COMMON,
    `<b>ls</b> は、いま いる 場所(ばしょ)の ファイルの 一覧(いちらん)。<b>cat</b> は ファイルの 中を 読(よ)む。${ex('ls', 'memo.txt  takara.txt')}${ex('cat memo.txt', 'これは ただの メモだよ。')}`,
    '1問(もん)ごとに あいことばは かわるよ。3問(もん)中(ちゅう) 2問(もん)で 合格(ごうかく)。']);
  add(2, 'cd と pwd（フォルダを 動(うご)く）', [`<b>cd 名前(なまえ)</b> で フォルダに 入(はい)る。<b>cd ..</b> で 1つ 上(うえ)に もどる。<b>cd</b> だけで ホーム（さいしょの 場所(ばしょ)）に もどる。<b>pwd</b> で いま いる 場所(ばしょ)が わかる。${ex('cd mori')}${ex('pwd', '/home/tanken/mori')}`,
    '名前(なまえ)を 少(すこ)し 打(う)って <b>Tab</b> キーを おすと、のこりを 入(い)れて くれるよ。']);
  add(3, 'ls -a（かくれた ファイル）', [`名前(なまえ)が「<b>.</b>」で はじまる ファイルは、ふつうの ls では 出(で)てこない。<b>ls -a</b> と 打(う)つと 出(で)てくるよ。${ex('ls -a', '.  ..  .kakushi.txt  tsukue.txt')}`,
    '「.」は いまの フォルダ、「..」は 1つ 上(うえ)の フォルダの こと。']);
  add(4, 'find（ファイルを さがす）', [`<b>find . -name 名前(なまえ)</b> で、いまの 場所(ばしょ)から 下(した)の フォルダを ぜんぶ さがして くれる。${ex('find . -name takara.txt', './kita/ue/takara.txt')}`,
    `見(み)つかった 場所(ばしょ)を そのまま cat に 書(か)けば 読(よ)めるよ。${ex('cat ./kita/ue/takara.txt')}`]);
  add(5, 'grep（ことばを さがす）', [`<b>grep ことば ファイル</b> で、その ことばが ある 行(ぎょう)だけ 出(だ)して くれる。長(なが)い ファイルを ぜんぶ 読(よ)まなくて いい。${ex('grep neko nikki.txt', 'neko to inu ga ita.')}`]);
  add(6, 'sort と uniq（ならべる・1回(かい)だけ）', [`<b>sort</b> は 行(ぎょう)を ABC順(じゅん)に ならべる。<b>uniq -u</b> は、となりと 同(おな)じで ない 行(ぎょう)（1回(かい)だけの 行(ぎょう)）を 出(だ)す。`,
    `<b>|</b>（パイプ）で、左(ひだり)の コマンドの 答(こた)えを 右(みぎ)の コマンドに わたせる。<b>|</b> は Shift ＋ ￥ キー。${ex('sort list.txt | uniq -u', 'x7kq2m')}`,
    'uniq は となりどうししか くらべないので、先(さき)に sort で ならべるのが ポイント。<b>uniq -c</b> だと 何回(なんかい) 出(で)てきたかも わかるよ。']);
  add(7, 'head・tail・wc（上(うえ)・下(した)・数(かず)）', [`<b>head -n 3 ファイル</b> で 上(うえ)から 3行(ぎょう)、<b>tail -n 1 ファイル</b> で いちばん 下(した)の 1行(ぎょう)。<b>wc -l ファイル</b> で 行(ぎょう)の 数(かず)。${ex('wc -l nagai.txt', '512 nagai.txt')}${ex('tail -n 1 nagai.txt', 'hoshi to kame ga hashitta.')}`]);
  add(8, 'まとめ（組(く)み合(あ)わせて さがす）', ['これまでの コマンドを 組(く)み合(あ)わせよう。まず hint.txt を 読(よ)む → かくれた フォルダを さがす → 大(おお)きな ファイルから grep。',
    `<b>find .</b> だけ 打(う)つと、かくれた ものも ふくめて ぜんぶの 場所(ばしょ)が 出(で)るよ。<b>grep -r ことば .</b> で、フォルダの 中の ファイルを ぜんぶ さがす ことも できる。`]);
})();
