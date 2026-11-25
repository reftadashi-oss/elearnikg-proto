// パソコン「コマンドプロンプト」（2026年11月26日 ユーザー決定の ⑦）。content_mail.js の あと、review.js の 前に 読む。
// 画面の 中の「にせの コマンドプロンプト（Windows）」。Linuxの 宝さがし（content_linux.js）と 同じ 形：コマンドで「あいことば」などを 見つけて 下の 箱に 入れる。
// 本物の パソコン・ネットには さわらない（ping・ipconfig の 答えも 画面の 中で 作った 架空の もの。IPは 192.168.x.x の 家の 中の 番号）。
// 学年（5年）・1単元 3問・合格 0.6 は 仮。ステージと 文は ROOTの オリジナル（Claude の 案・仮。先生が 確かめる）。
(() => {
  const pick = a => a[rand(0, a.length - 1)];
  const F = s => typeof s !== 'string' ? s : s.replace(/([一-鿿々]+)\(([ぁ-ゟ]+)\)/g, '{$1|$2}');
  const pc = SUBJECTS.find(s => s.id === 'x0');
  const se = { id: 'x0c', name: F('コマンドプロンプト'), units: [], noSum: true };
  pc.series.push(se);

  const PWC = 'abcdefghjkmnpqrstuvwxyz23456789';
  const pw = (n = 6) => Array.from({ length: n }, () => pick([...PWC])).join('');
  const WORDS = ['ringo', 'mikan', 'neko', 'inu', 'sora', 'umi', 'yama', 'kawa', 'hoshi', 'tsuki', 'kumo', 'ame', 'kaze', 'hana', 'mori', 'sakana', 'tori', 'kame', 'usagi', 'densha', 'basu', 'hon', 'tsukue', 'mado'];
  const sentence = () => `${pick(WORDS)} to ${pick(WORDS)} ga ${pick(['ita', 'atta', 'mieta', 'nakatta', 'hashitta'])}.`;
  const NO = ['ここには ないよ。', 'ざんねん！ ほかを さがそう。', 'これは ただの メモだよ。', 'はずれ！'];
  const line = p => `あいことばは ${p} だよ。`;
  const D = (c, h) => ({ d: true, c, h: !!h });
  const T = (t, h) => ({ d: false, t: t.replace(/([一-鿿々]+)\([ぁ-ゟ]+\)/g, '$1'), h: !!h });
  const HOME = ['Users', 'tanken'];
  const world = (homeC, extra) => ({ fs: D({ Users: D({ tanken: D(homeC), Public: D({}) }), Windows: D({ System32: D({}) }) }), net: { me: '192.168.1.' + rand(10, 60), gw: '192.168.1.1', hosts: {} }, ...extra });

  const stages = {
    1: () => { const p = pw(), names = shuffle(['memo.txt', 'takara.txt', 'himitsu.txt', 'nikki.txt', 'kaimono.txt']).slice(0, 4), at = rand(0, 3), c = {};
      names.forEach((n, i) => c[n] = T(i === at ? line(p) : pick(NO)));
      return world(c, { p, box: 'あいことば', goal: 'どれかの ファイルに あいことばが 書(か)いて ある。<b>dir</b> で ファイルを 見(み)て、<b>type</b> で 読(よ)もう。' }); },
    2: () => { const p = pw(), tops = ['Mori', 'Umi', 'Yama'], subs = ['Doukutsu', 'Ike', 'Kinoue', 'Iwa'], t = pick(tops), s = pick(subs), c = {};
      tops.forEach(a => { c[a] = D({}); shuffle(subs).slice(0, 2).concat(a === t ? [s] : []).forEach(b => { c[a].c[b] = D({ 'hako.txt': T(a === t && b === s ? line(p) : pick(NO)) }); }); });
      c['chizu.txt'] = T(`たからの ちず：\n${t} の 中の ${s} の 中に ある hako.txt`);
      return world(c, { p, box: 'あいことば', goal: '<b>chizu.txt</b> を 読(よ)んで、<b>cd</b> で フォルダに 入(はい)ろう。<b>cd ..</b> で 1つ 上(うえ)に もどる。' }); },
    3: () => { const p = pw(), h = pick(['kakushi.txt', 'himitsu.txt', 'ura.txt']), c = { Heya: D({ 'tsukue.txt': T(pick(NO)), 'hondana.txt': T(pick(NO)), [h]: T(line(p), true) }) };
      c['hint.txt'] = T('Heya の 中には、かくしファイルが あるらしい。\nかくしファイルは dir では 出てこない。dir /a で 出てくる。');
      return world(c, { p, box: 'あいことば', goal: '<b>Heya</b> の 中に かくしファイルが ある。<b>dir /a</b> で さがそう。' }); },
    4: () => { const p = pw(), names = ['Kita', 'Minami', 'Higashi', 'Nishi', 'Ue', 'Shita'], c = {}, dirs = [];
      const grow = (o, depth) => { shuffle(names).slice(0, depth === 0 ? 4 : 3).forEach(n => { o[n] = D({ [`${pick(WORDS)}.txt`]: T(pick(NO)) }); dirs.push(o[n].c); if (depth < 2) grow(o[n].c, depth + 1); }); };
      grow(c, 0); pick(dirs.slice(-12))['takara.txt'] = T(line(p));
      return world(c, { p, box: 'あいことば', goal: 'フォルダが たくさん。どこかに <b>takara.txt</b> が ある。<b>dir /s takara.txt</b> で 場所(ばしょ)を 見(み)つけよう（<b>tree</b> で フォルダの 形(かたち)も 見(み)られる）。' }); },
    5: () => { const p = pw(), n = rand(250, 350), at = rand(40, n - 40), ls = [];
      for (let i = 0; i < n; i++) ls.push(i === at ? `aikotoba: ${p}` : sentence());
      return world({ 'nikki.txt': T(ls.join('\n')) }, { p, box: 'あいことば', goal: '<b>nikki.txt</b> は とても 長(なが)い。どこかの 行(ぎょう)に <b>aikotoba</b> と ある。<b>findstr aikotoba nikki.txt</b> で さがそう。' }); },
    6: () => { const w = world({ 'hint.txt': T('この パソコンの IPアドレスは ipconfig で わかる。\n「IPv4 アドレス」の ところを 見よう。') }, { box: 'IPアドレス', goal: 'この パソコンの <b>IPアドレス</b>（ネットの 中の 住所(じゅうしょ)の 番号(ばんごう)）を <b>ipconfig</b> で しらべて、下(した)の 箱(はこ)に 入(い)れよう（半角(はんかく)で、. も わすれずに）。' }); w.p = w.net.me; return w; },
    7: () => { const names = shuffle(['printer', 'tablet', 'pc-kyoushitsu', 'nas', 'camera']).slice(0, 4), bad = pick(names), w = world({}, { box: 'つながらない きかい', goal: `つながらない きかいが 1台(だい) ある。<b>ping きかいの名前</b> で 1台(だい)ずつ たしかめて、<b>返事(へんじ)が ない</b> きかいの 名前(なまえ)を 下(した)の 箱(はこ)に 入(い)れよう。きかい：<b>${names.join('・')}</b>` });
      names.forEach((n, i) => { w.net.hosts[n] = { ip: `192.168.1.${100 + i * 7 + rand(0, 5)}`, up: n !== bad }; }); w.p = bad; return w; },
    8: () => { const p = pw(), c = {}, tops = shuffle(['Kita', 'Minami', 'Higashi', 'Nishi']);
      tops.forEach(t => { c[t] = D({ 'memo.txt': T(pick(NO)) }); });
      const big = [], n = rand(200, 300), at = rand(30, n - 30);
      for (let i = 0; i < n; i++) big.push(i === at ? `aikotoba: ${p}` : sentence());
      c[tops[0]].c['Ura'] = D({ [`${pick(WORDS)}.txt`]: T(big.join('\n')) }, true);
      c['hint.txt'] = T('どこかの フォルダの 中に、かくしフォルダが ある。\nその 中の 大きな ファイルの どこかに aikotoba と 書いた 行が ある。');
      return world(c, { p, box: 'あいことば', goal: 'これまでの まとめ。<b>hint.txt</b> を 読(よ)んで、<b>dir /a</b>・<b>cd</b>・<b>findstr</b> を 組(く)み合(あ)わせよう。' }); },
  };

  // ---------- コマンド ----------
  const W = {}; let wid = 0;
  const clone = o => JSON.parse(JSON.stringify(o));
  const key = (n, k) => n && n.d ? Object.keys(n.c).find(x => x.toLowerCase() === k.toLowerCase()) : null;   // Windows は 大文字・小文字を 区別しない
  const norm = (cwd, path) => {
    if (!path) return cwd.slice();
    path = path.replace(/^"|"$/g, '').replace(/\//g, '\\');
    let parts = /^[a-z]:\\/i.test(path) ? [] : path.startsWith('\\') ? [] : cwd.slice();
    for (const x of path.replace(/^[a-z]:\\?/i, '').split('\\')) { if (!x || x === '.') continue; if (x === '..') parts.pop(); else parts.push(x); }
    return parts;
  };
  const node = (fs, parts) => { let n = fs; const real = []; for (const x of parts) { const k = key(n, x); if (!k) return [null, null]; real.push(k); n = n.c[k]; } return [n, real]; };
  const pstr = parts => 'C:\\' + parts.join('\\');
  const DATE = '2026/11/26  10:00';
  const HELP = [
    'つかえる コマンド（大文字・小文字は どちらでも いい）：',
    '  dir            ファイルと フォルダを 見る（dir /a で かくしファイルも、dir /s 名前 で 下の フォルダまで さがす）',
    '  cd 名前        フォルダに 入る（cd .. で 1つ 上へ、cd \\ で いちばん 上へ、cd だけで いまの 場所）',
    '  type 名前      ファイルを 読む',
    '  tree           フォルダの 形を 木のように 出す',
    '  findstr ことば ファイル   ことばが ある 行だけ 出す',
    '  ipconfig       この パソコンの ネットの 番号（IPアドレス）',
    '  ping 名前      ほかの きかいに 「とどく？」と 聞く',
    '  hostname / whoami / ver / echo / cls',
    '  ↑ キーで 前の コマンド。Tab キーで 名前の のこりを 入れる。',
  ];
  function run(st, input) {
    const out = [], say = s => out.push({ s }), err = s => out.push({ e: true, s });
    const a = input.match(/"[^"]*"|\S+/g) || [], cmd = (a.shift() || '').toLowerCase(), args = a.map(x => x.replace(/^"|"$/g, ''));
    const sw = args.filter(x => /^\/[a-z?]$/i.test(x)).map(x => x.toLowerCase()), rest = args.filter(x => !/^\/[a-z?]$/i.test(x));
    const cmdM = /^cd(\.\.|\\)$/i.exec(cmd); if (cmdM) return run(st, 'cd ' + cmdM[1]);
    const readFile = p => { const [n, real] = node(st.fs, norm(st.cwd, p)); if (!n) { err('指定されたファイルが見つかりません。（そんな ファイルは ないよ）'); return null; } if (n.d) { err('アクセスが拒否されました。（それは フォルダだよ。cd で 入ろう）'); return null; } return n.t.split('\n'); };
    switch (cmd) {
      case 'help': case '/?': HELP.forEach(say); break;
      case 'cls': st.clear = true; break;
      case 'echo': say(rest.join(' ')); break;
      case 'ver': say('Microsoft Windows（れんしゅう用の にせもの）'); break;
      case 'whoami': say('root-pc\\tanken'); break;
      case 'hostname': say('root-pc'); break;
      case 'cd': case 'chdir': {
        if (!rest.length) { say(pstr(st.cwd)); break; }
        const [n, real] = node(st.fs, norm(st.cwd, rest.join(' ')));
        if (!n) err('指定されたパスが見つかりません。（そんな フォルダは ないよ）'); else if (!n.d) err('ディレクトリ名が無効です。（それは ファイルだよ。type で 読もう）'); else st.cwd = real;
        break; }
      case 'dir': {
        const all = sw.includes('/a'), sub = sw.includes('/s');
        if (sub) { const pat = (rest[0] || '*').toLowerCase(), re = new RegExp('^' + pat.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$'), [n0, r0] = node(st.fs, st.cwd); let hit = 0;
          const walk = (n, parts) => { const names = Object.keys(n.c).filter(k => re.test(k.toLowerCase()) && (all || !n.c[k].h));
            if (names.length) { say(''); say(` ${pstr(parts)} のディレクトリ`); names.sort().forEach(k => say(`${DATE}    ${n.c[k].d ? '<DIR>         ' : '           ' + String(n.c[k].t.length).padStart(3)} ${k}`)); hit += names.length; }
            Object.keys(n.c).sort().forEach(k => { if (n.c[k].d && (all || !n.c[k].h)) walk(n.c[k], [...parts, k]); }); };
          walk(n0, r0); if (!hit) err('ファイルが見つかりません'); else { say(''); say(`     ファイルの数: ${hit}`); } break; }
        const [n, real] = node(st.fs, norm(st.cwd, rest[0])); if (!n || !n.d) { err('ファイルが見つかりません'); break; }
        say(''); say(` ${pstr(real)} のディレクトリ`); say('');
        if (real.length) { say(`${DATE}    <DIR>          .`); say(`${DATE}    <DIR>          ..`); }
        const names = Object.keys(n.c).filter(k => all || !n.c[k].h).sort();
        names.forEach(k => out.push({ s: `${DATE}    ${n.c[k].d ? '<DIR>         ' : '           ' + String(n.c[k].t.length).padStart(3)} ${k}`, dir: n.c[k].d, hid: n.c[k].h }));
        say(`               ${names.filter(k => !n.c[k].d).length} 個のファイル`); say(`               ${names.filter(k => n.c[k].d).length} 個のディレクトリ`); break; }
      case 'type': case 'more': { if (!rest.length) { err('構文が間違っています。（type の あとに ファイルの 名前を 書いてね）'); break; } const t = readFile(rest.join(' ')); if (t) t.forEach(say); break; }
      case 'tree': { const [n0, r0] = node(st.fs, st.cwd); say(pstr(r0));
        const walk = (n, pre) => { const ks = Object.keys(n.c).filter(k => n.c[k].d && !n.c[k].h).sort(); ks.forEach((k, i) => { const last = i === ks.length - 1; out.push({ s: `${pre}${last ? '└─' : '├─'}${k}`, dir: true }); walk(n.c[k], pre + (last ? '    ' : '│  ')); }); };
        walk(n0, ''); break; }
      case 'findstr': case 'find': {
        const pat = rest[0], f = rest.slice(1).join(' ');
        if (!pat || !f) { err(`${cmd}: さがす ことばと ファイルを 書いてね（例：findstr aikotoba nikki.txt）`); break; }
        const t = readFile(f); if (!t) break; const ic = sw.includes('/i');
        const hits = t.filter(s => ic ? s.toLowerCase().includes(pat.toLowerCase()) : s.includes(pat));
        if (cmd === 'find') say(`---------- ${f.toUpperCase()}`); hits.forEach(say); break; }
      case 'ipconfig': say(''); say('Windows IP 構成'); say(''); say('イーサネット アダプター イーサネット:'); say('');
        say(`   IPv4 アドレス . . . . . . . . . . . .: ${st.net.me}`); say('   サブネット マスク . . . . . . . . . .: 255.255.255.0'); say(`   デフォルト ゲートウェイ . . . . . . .: ${st.net.gw}`); break;
      case 'ping': { const h = (rest[0] || '').toLowerCase(); if (!h) { err('ping の あとに きかいの 名前か IPアドレスを 書いてね（例：ping printer）'); break; }
        const name = Object.keys(st.net.hosts).find(k => k === h || st.net.hosts[k].ip === h);
        const me = h === 'root-pc' || h === 'localhost' || h === '127.0.0.1' || h === st.net.me, gw = h === st.net.gw || h === 'router';
        if (!name && !me && !gw) { err(`ping 要求ではホスト ${rest[0]} が見つかりませんでした。（そんな 名前の きかいは ないよ。名前を たしかめよう）`); break; }
        const ip = me ? st.net.me : gw ? st.net.gw : st.net.hosts[name].ip, up = me || gw || st.net.hosts[name].up;
        say(''); say(`${rest[0]} [${ip}]に ping を送信しています 32 バイトのデータ:`);
        for (let i = 0; i < 4; i++) say(up ? `${ip} からの応答: バイト数 =32 時間 =${me ? '<1' : rand(1, 9)}ms TTL=128` : '要求がタイムアウトしました。');
        say(''); say(`${ip} の ping 統計:`); say(`    パケット数: 送信 = 4、受信 = ${up ? 4 : 0}、損失 = ${up ? 0 : 4} (${up ? 0 : 100}% の損失)`);
        out.push({ s: up ? '→ 返事が あった（つながって いる）' : '→ 返事が ない（つながって いない）', note: true }); break; }
      case 'del': case 'erase': case 'rd': case 'rmdir': case 'format': case 'shutdown': case 'move': case 'copy': case 'ren': case 'mkdir': case 'md':
        err(`${cmd}: この 練習では つかえないよ（ファイルや パソコンを こわさない）`); break;
      case '': break;
      default: err(`'${cmd}' は、内部コマンドまたは外部コマンド、操作可能なプログラムまたはバッチ ファイルとして認識されていません。（そんな コマンドは ないよ。help で 一覧）`);
    }
    return out;
  }

  // ---------- 画面 ----------
  const css = document.createElement('style');
  css.textContent = `.cmterm{background:#0c0c0c;color:#cccccc;font-family:Consolas,"MS Gothic",monospace;font-size:.72em;text-align:left;border-radius:6px;padding:8px 10px;height:16em;overflow-y:auto;margin:8px auto;max-width:760px;cursor:text;line-height:1.45;border-top:22px solid #2b2b2b;position:relative}
  .cmterm .o{white-space:pre-wrap;word-break:break-all}.cmterm .er{color:#ff8a80}.cmterm .dir{color:#9cdcfe}.cmterm .hid{color:#c5a5ff}.cmterm .nt{color:#b9f6ca}
  .cmterm .in{display:flex}.cmterm input{flex:1;background:transparent!important;border:0!important;outline:0!important;box-shadow:none!important;border-radius:0!important;min-height:0!important;margin:0!important;color:#fff;font:inherit;padding:0}`;
  document.head.appendChild(css);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const toHalf = s => s.replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/　/g, ' ').replace(/[￥¥]/g, '\\');
  function boot(el) {
    el.dataset.on = '1';
    const w = W[el.dataset.w]; if (!w) return;
    const st = { fs: clone(w.fs), net: w.net, cwd: HOME.slice(), hist: [], hi: 0 };
    const demo = !!el.closest('.ex');
    const prompt = () => `${esc(pstr(st.cwd))}&gt;`;
    const log = document.createElement('div'); el.appendChild(log);
    const add = h => { const d = document.createElement('div'); d.className = 'o'; d.innerHTML = h; log.appendChild(d); };
    add('Microsoft Windows（れんしゅう用）　<b>help</b> と 打つと、つかえる コマンドが 出るよ。<br>&nbsp;');
    if (demo) { add(`${prompt()}dir`); return; }
    const row = document.createElement('div'); row.className = 'in'; row.innerHTML = `<span class="pr">${prompt()}</span><input spellcheck="false" autocomplete="off" autocapitalize="off" lang="en" inputmode="latin">`;
    el.appendChild(row);
    const inp = row.querySelector('input');
    el.addEventListener('mousedown', e => { if (e.target !== inp && !window.getSelection().toString()) setTimeout(() => inp.focus(), 0); });
    inp.addEventListener('input', () => { inp.style.color = /[ぁ-んァ-ヶ一-鿿]/.test(inp.value) ? '#ffcc80' : ''; });
    inp.addEventListener('keydown', e => {
      e.stopPropagation(); if (typeof touch === 'function') touch();
      if (e.isComposing || e.keyCode === 229) return;
      if (e.key === 'Enter') {
        e.preventDefault(); const v = toHalf(inp.value).trim(); inp.value = ''; inp.style.color = '';
        add(`${prompt()}${esc(v)}`);
        if (v) { st.hist.push(v); st.hi = st.hist.length;
          if (/[ぁ-んァ-ヶ一-鿿]/.test(v)) add('<span class="er">ひらがなに なって いるよ。「半角/全角」キーを 1回 おして、英語の 文字で 打とう。</span>');
          else run(st, v).forEach(o => add(`<span class="${o.e ? 'er' : o.note ? 'nt' : o.hid ? 'hid' : o.dir ? 'dir' : ''}">${esc(o.s)}</span>`)); }
        add('&nbsp;');
        if (st.clear) { log.innerHTML = ''; st.clear = false; }
        row.querySelector('.pr').innerHTML = prompt();
        el.scrollTop = el.scrollHeight; return;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); st.hi = Math.max(0, Math.min(st.hist.length, st.hi + (e.key === 'ArrowUp' ? -1 : 1))); inp.value = st.hist[st.hi] || ''; return; }
      if (e.key === 'Tab') { e.preventDefault();
        const m = inp.value.match(/^(.*?)(\S*)$/), word = m[2], cut = word.lastIndexOf('\\') + 1, dirPart = word.slice(0, cut), base = word.slice(cut).toLowerCase();
        const [n] = node(st.fs, norm(st.cwd, dirPart)); if (!n || !n.d) return;
        const hits = Object.keys(n.c).filter(k => k.toLowerCase().startsWith(base) && !n.c[k].h);
        if (hits.length === 1) inp.value = m[1] + dirPart + hits[0];
        else if (hits.length > 1) { add(`${prompt()}${esc(inp.value)}`); add(`<span class="dir">${hits.sort().map(esc).join('   ')}</span>`); el.scrollTop = el.scrollHeight; }
      }
    });
    setTimeout(() => inp.focus(), 0);
  }
  new MutationObserver(() => document.querySelectorAll('.cmterm:not([data-on])').forEach(boot)).observe(document.documentElement, { childList: true, subtree: true });

  // ---------- 単元 ----------
  const q = stage => () => { const w = stages[stage](), id = 'c' + (++wid); W[id] = w;
    return { key: `cm${stage}-${w.p}`, keys: true, boxes: [w.box], answer: [w.p],
      text: F(`<div class="lxgoal">${w.goal}</div><div class="cmterm" data-w="${id}"></div><div class="lxgoal">見(み)つけた 答(こた)えを 下(した)の 箱(はこ)に 入(い)れて Enter（箱(はこ)を おしてから 打(う)とう）。</div>`) }; };
  const three = stage => () => [q(stage)(), q(stage)(), q(stage)()];
  const add = (n, name, lecture) => { const id = `x0c-${n}`; UNITS[id] = { id, subject: 'x0', series: se.id, name: F(name), col: 'コマンド', pass: 0.6, grade: 5, make: three(n), lecture: lecture.map(F) }; se.units.push(id); };
  const ex = (cmd, out) => `<pre style="background:#0c0c0c;color:#ccc;text-align:left;padding:8px;border-radius:6px;font-size:.85em;white-space:pre-wrap">C:\\Users\\tanken&gt;${esc(cmd)}${out ? '\n' + esc(out) : ''}</pre>`;
  const COMMON = '<b>コマンドプロンプト</b>は、Windowsで コマンド（命令(めいれい)）を 打(う)って パソコンを 動(うご)かす 黒(くろ)い 画面(がめん)。Linuxの 宝(たから)さがしと にて いるけど、コマンドの 名前(なまえ)が ちがう（ls → dir、cat → type）。ここは 練習用(れんしゅうよう)の にせもので、本物(ほんもの)の パソコンには さわらない。';
  add(1, 'dir と type（見(み)る・読(よ)む）', [COMMON, `<b>dir</b> で ファイルと フォルダの 一覧(いちらん)（フォルダには &lt;DIR&gt; と 出(で)る）。<b>type 名前(なまえ)</b> で ファイルを 読(よ)む。${ex('type memo.txt', 'これは ただの メモだよ。')}`, '名前(なまえ)を 少(すこ)し 打(う)って <b>Tab</b> キーで のこりが 入(はい)る。↑ キーで 前(まえ)の コマンド。']);
  add(2, 'cd（フォルダを 動(うご)く）', [`<b>cd 名前(なまえ)</b> で フォルダに 入(はい)る。<b>cd ..</b> で 1つ 上(うえ)。<b>cd \\</b> で いちばん 上(うえ)（C:\\）。<br>いま いる 場所(ばしょ)は、&gt; の 前(まえ)に 出(で)て いる（パス）。${ex('cd Mori', '')}`, 'Windowsは 大文字(おおもじ)・小文字(こもじ)を 区別(くべつ)しない。mori でも Mori でも 同(おな)じ。']);
  add(3, 'dir /a（かくしファイル）', [`かくしファイルは ふつうの dir では 出(で)て こない。<b>dir /a</b> と 打(う)つと 出(で)てくる（/ の あとの 文字(もじ)は「オプション」＝ コマンドの 使(つか)い方(かた)を かえる）。`, 'エクスプローラーでも「表示(ひょうじ)」→「隠(かく)しファイル」で 見(み)られる。大事(だいじ)な ファイルが かくして ある ことが あるので、さわらない ように しよう。']);
  add(4, 'dir /s と tree（さがす）', [`<b>dir /s 名前(なまえ)</b> で、いまの 場所(ばしょ)から 下(した)の フォルダを ぜんぶ さがす。見(み)つかった 場所(ばしょ)が「〇〇 のディレクトリ」と 出(で)る。${ex('dir /s takara.txt', ' C:\\Users\\tanken\\Kita\\Ue のディレクトリ')}`, `<b>tree</b> で フォルダの 形(かたち)が 木(き)のように 見(み)える。見(み)つけた 場所(ばしょ)まで cd で 行(い)って type。`]);
  add(5, 'findstr（ことばを さがす）', [`<b>findstr ことば ファイル</b> で、その ことばが ある 行(ぎょう)だけ 出(だ)す（Linuxの grep と 同(おな)じ）。${ex('findstr neko nikki.txt', 'neko to inu ga ita.')}`, '<b>/i</b> を つけると 大文字(おおもじ)・小文字(こもじ)を 区別(くべつ)しないで さがす。']);
  add(6, 'ipconfig（IPアドレス）', [`ネットに つながる きかいには <b>IPアドレス</b>（住所(じゅうしょ)のような 番号(ばんごう)）が ある。<b>ipconfig</b> で 見(み)られる。${ex('ipconfig', '   IPv4 アドレス . . . : 192.168.1.23')}`, '192.168. で はじまる 番号(ばんごう)は、家(いえ)や 教室(きょうしつ)の 中(なか)だけで 使(つか)う 番号(ばんごう)。IPアドレスは むやみに 人(ひと)に 教(おし)えない。']);
  add(7, 'ping（つながって いるか）', [`<b>ping 名前(なまえ)</b> で、ほかの きかいに「とどいてる？」と 4回(かい) 聞(き)く。返事(へんじ)（応答(おうとう)）が あれば つながって いる。「タイムアウト」は 返事(へんじ)が ない。${ex('ping printer', '192.168.1.101 からの応答: バイト数 =32 時間 =3ms')}`, 'プリンターが 使(つか)えない ときなど、まず ping で つながって いるか しらべるのが PC当番(とうばん)の 第一歩(だいいっぽ)。']);
  add(8, 'まとめ（組(く)み合(あ)わせる）', ['これまでの コマンドを 組(く)み合(あ)わせよう。hint.txt を 読(よ)む → dir /a で かくしフォルダ → cd → findstr。', 'ファイルを 消(け)す コマンド（del・rd）や 電源(でんげん)を 切(き)る コマンド（shutdown）は 本物(ほんもの)の パソコンでは 大人(おとな)と いっしょの ときだけ。']);
})();
