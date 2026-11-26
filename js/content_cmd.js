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
  const mac = () => [((rand(0, 63) << 2) | 2), ...Array.from({ length: 5 }, () => rand(0, 255))].map(x => x.toString(16).padStart(2, '0')).join('-');
  const world = (homeC, extra) => ({ fs: D({ Users: D({ tanken: D(homeC), Public: D({}) }), Windows: D({ System32: D({}) }) }), net: { me: '192.168.1.' + rand(10, 60), gw: '192.168.1.1', gwmac: mac(), hosts: {} }, ...extra });

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
    // 9：ping に 返事を しない 設定の サーバー（動いて いる）と、本当に 止まって いる サーバーを 見分ける。curl で ホームページが 返るかも 見る
    9: () => { const names = shuffle(Object.keys(SITE)).slice(0, 4), [quiet, down] = shuffle(names.slice()), w = world({}, { box: 'ping に へんじ しない きかい', goal: `ホームページを 出(だ)す きかい（サーバー）が 4台(だい)。1台(だい)は 本当(ほんとう)に 止(と)まって いて、1台(だい)は 動(うご)いて いるのに <b>ping に 返事(へんじ)を しない 設定(せってい)</b>。<b>ping 名前(なまえ)</b> と <b>curl http://名前(なまえ)</b> で しらべて、<b>動(うご)いて いるのに ping に 返事(へんじ)しない</b> きかいの 名前(なまえ)を 入(い)れよう。きかい：<b>${names.join('・')}</b>` });
      names.forEach((n, i) => { w.net.hosts[n] = { ip: `192.168.1.${150 + i * 9 + rand(0, 6)}`, up: n !== down, icmp: n !== quiet, web: true }; }); w.p = quiet; return w; },
    // 10：netstat -an で TCP と UDP を 見る（答えの 形は 3しゅるい）。相手の IP は 例に 使う ための 番号（203.0.113.x・198.51.100.x）
    10: () => { const w = world({}, {}), me = w.net.me, used = new Set([135, 445, 5353, 123]), port = (a, b) => { let x; do x = rand(a, b); while (used.has(x)); used.add(x); return x; };
      const far = () => `${pick(['203.0.113', '198.51.100'])}.${rand(2, 250)}`, n = rand(3, 5), at = rand(0, n - 1), cn = [];
      cn.push({ pr: 'TCP', l: '0.0.0.0:135', f: '0.0.0.0:0', s: 'LISTENING', lp: 135 }, { pr: 'TCP', l: '0.0.0.0:445', f: '0.0.0.0:0', s: 'LISTENING', lp: 445 });
      for (let i = 0; i < n; i++) { const lp = port(49200, 64900), ip = far(), fp = i === at ? 80 : 443; cn.push({ pr: 'TCP', l: `${me}:${lp}`, f: `${ip}:${fp}`, s: 'ESTABLISHED', lp, ip, fp }); }
      const u = rand(2, 5); for (let i = 0; i < u; i++) { const lp = i === 0 ? 5353 : i === 1 ? 123 : port(50000, 64000); cn.push({ pr: 'UDP', l: `${i < 2 ? '0.0.0.0' : me}:${lp}`, f: '*:*', s: '', lp }); }
      w.net.cn = cn; const t = rand(0, 2), H = '<b>netstat -an</b> で、いま 動(うご)いて いる 通信(つうしん)の 一覧(いちらん)を 見(み)よう。';
      if (t === 0) { const c = pick(cn.filter(x => x.lp !== 135 && x.lp !== 445)); w.p = c.pr; w.k = c.lp; w.ci = true; w.box = 'TCP か UDP'; w.goal = `${H}<b>ローカル アドレス</b>の ポート番号(ばんごう)（: の うしろ）が <b>${c.lp}</b> の 通信(つうしん)は、<b>TCP</b> と <b>UDP</b> の どっち？`; }
      else if (t === 1) { w.p = String(u); w.box = 'UDP の ぎょうの かず'; w.goal = `${H}<b>UDP</b> の 行(ぎょう)は いくつ ある？（<b>netstat -an -p udp</b> で UDP だけ 出(だ)せる）`; }
      else { w.p = cn.find(x => x.fp === 80).ip; w.box = 'IPアドレス'; w.goal = `${H}TCP で つながって いる（ESTABLISHED）相手(あいて)の うち、<b>相手(あいて)の ポートが 80</b>（ふつうの ホームページ）の 相手(あいて)の <b>IPアドレス</b>を 入(い)れよう（: より 前(まえ)の 番号(ばんごう)だけ）。`; }
      return w; },
    // 11：arp -a で MACアドレス。表には さいきん やりとりした きかいだけ 出るので、先に ping する
    11: () => { const names = shuffle(['printer', 'tablet', 'pc-kyoushitsu', 'nas', 'camera']).slice(0, 4), t = pick(names), w = world({}, { ci: true, box: `${t} の MACアドレス`, goal: `<b>${t}</b> の <b>MACアドレス</b>を しらべよう。<b>arp -a</b> の 表(ひょう)には、さいきん やりとりした きかいだけ 出(で)る。まず <b>ping ${t}</b> で やりとりしてから <b>arp -a</b>。答(こた)えは「物理(ぶつり)アドレス」の らんを - も いっしょに 入(い)れよう。きかい：<b>${names.join('・')}</b>` });
      names.forEach((n, i) => { w.net.hosts[n] = { ip: `192.168.1.${100 + i * 7 + rand(0, 5)}`, up: true, mac: mac() }; }); w.p = w.net.hosts[t].mac; w.k = t; return w; },
  };

  // ---------- コマンド ----------
  const SITE = { 'gakkou-web': 'がっこうの おしらせ', toshokan: 'としょかんの 本さがし', tenki: 'きょうの てんき', kyushoku: 'きゅうしょくの こんだて', zukan: 'いきもの ずかん' };
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
    '  curl http://名前   その きかいの ホームページを もらう',
    '  netstat -an    いまの 通信の 一覧（-p tcp / -p udp で しぼる）',
    '  arp -a         IPアドレスと MACアドレスの 表',
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
        const ip = me ? st.net.me : gw ? st.net.gw : st.net.hosts[name].ip, up = me || gw || (st.net.hosts[name].up && st.net.hosts[name].icmp !== false);
        if (name && st.net.hosts[name].up) st.arp.add(name);
        say(''); say(`${rest[0]} [${ip}]に ping を送信しています 32 バイトのデータ:`);
        for (let i = 0; i < 4; i++) say(up ? `${ip} からの応答: バイト数 =32 時間 =${me ? '<1' : rand(1, 9)}ms TTL=128` : '要求がタイムアウトしました。');
        say(''); say(`${ip} の ping 統計:`); say(`    パケット数: 送信 = 4、受信 = ${up ? 4 : 0}、損失 = ${up ? 0 : 4} (${up ? 0 : 100}% の損失)`);
        out.push({ s: up ? '→ 返事が あった（つながって いる）' : '→ 返事が ない（つながって いない か、ping に 返事を しない せっていかも）', note: true }); break; }
      case 'curl': { const u = rest.find(x => !x.startsWith('-')); if (!u) { err('curl の あとに アドレスを 書いてね（例：curl http://tenki）'); break; }
        const m = /^(?:(https?):\/\/)?([^/:]+)(?::(\d+))?/i.exec(u), h = (m && m[2] || '').toLowerCase(), pt = m && m[3] ? +m[3] : m && /^https$/i.test(m[1] || '') ? 443 : 80;
        const name = Object.keys(st.net.hosts).find(k => k === h || st.net.hosts[k].ip === h), gw = h === st.net.gw || h === 'router', me = h === 'root-pc' || h === 'localhost' || h === '127.0.0.1' || h === st.net.me;
        if (!name && !gw && !me) { err(`curl: (6) Could not resolve host: ${h}（そんな 名前の きかいは ないよ）`); break; }
        const hs = name && st.net.hosts[name];
        if (me || (hs && !hs.web && hs.up)) { err(`curl: (7) Failed to connect to ${h} port ${pt}: Connection refused（この きかいは ホームページを 出して いないよ）`); break; }
        if (hs && !hs.up) { err(`curl: (28) Failed to connect to ${h} port ${pt} after 21000 ms: Timed out（返事が ない）`); out.push({ s: '→ ホームページも 返って こない（止まって いる かも）', note: true }); break; }
        if (pt !== 80 && pt !== 443) { err(`curl: (7) Failed to connect to ${h} port ${pt}: Connection refused（その ポートでは 返事が ないよ）`); break; }
        if (name) st.arp.add(name);
        const title = gw ? 'ルーター（入るには 大人の パスワードが いる）' : SITE[name] || name;
        say(`<html><head><title>${title}</title></head>`); say(`<body><h1>${title}</h1> ...</body></html>`);
        out.push({ s: '→ ホームページが 返って きた（この きかいは 動いて いる）', note: true }); break; }
      case 'arp': { if (!sw.length && !args.some(x => /^-[ag]$/i.test(x))) { say('使い方: arp -a     （IPアドレスと MACアドレスの 表を 出す）'); break; }
        const f = rest.find(x => !/^-/.test(x)), rows = [[st.net.gw, st.net.gwmac, '動的'], ...Object.keys(st.net.hosts).filter(k => st.arp.has(k)).map(k => [st.net.hosts[k].ip, st.net.hosts[k].mac || '00-00-00-00-00-00', '動的']), ['192.168.1.255', 'ff-ff-ff-ff-ff-ff', '静的'], ['224.0.0.22', '01-00-5e-00-00-16', '静的']].filter(r => !f || r[0] === f);
        if (!rows.length) { err('ARP エントリが見つかりませんでした。（その IPアドレスは 表に ないよ。先に ping してみよう）'); break; }
        say(''); say(`インターフェイス: ${st.net.me} --- 0x5`); say('  インターネット アドレス 物理アドレス          種類');
        rows.forEach(r => say(`  ${r[0].padEnd(22)} ${r[1].padEnd(21)} ${r[2]}`)); break; }
      case 'netstat': { const cn = st.net.cn || [], fl = args.filter(x => /^[-/]/.test(x)).join('').toLowerCase(), pi = args.findIndex(x => /^[-/]p$/i.test(x)), pp = pi >= 0 ? (args[pi + 1] || '').toUpperCase() : '';
        if (pi >= 0 && pp !== 'TCP' && pp !== 'UDP') { err('-p の あとに tcp か udp を 書いてね（例：netstat -an -p udp）'); break; }
        const list = cn.filter(x => (fl.includes('a') || x.s === 'ESTABLISHED') && (!pp || x.pr === pp));
        say(''); say('アクティブな接続'); say(''); say('  プロトコル  ローカル アドレス        外部アドレス           状態');
        list.forEach(x => say(`  ${x.pr.padEnd(10)}  ${x.l.padEnd(23)}  ${x.f.padEnd(21)}  ${x.s}`));
        if (!fl.includes('a')) out.push({ s: '→ つながって いる TCP だけ 出たよ。-a を つけると ぜんぶ 出る（netstat -an）', note: true }); break; }
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
    const st = { fs: clone(w.fs), net: w.net, cwd: HOME.slice(), hist: [], hi: 0, arp: new Set() };
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
    return { key: `cm${stage}-${w.p}-${w.k || w.box}`, keys: true, ci: !!w.ci, boxes: [w.box], answer: [w.p],
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
  add(7, 'ping（つながって いるか）', [`<b>ping 名前(なまえ)</b> で、ほかの きかいに「とどいてる？」と 4回(かい) 聞(き)く。返事(へんじ)（応答(おうとう)）が あれば つながって いる。「タイムアウト」は 返事(へんじ)が ない。${ex('ping printer', '192.168.1.101 からの応答: バイト数 =32 時間 =3ms')}`, 'プリンターが 使(つか)えない ときなど、まず ping で つながって いるか しらべるのが PC当番(とうばん)の 第一歩(だいいっぽ)。', 'ただし、返事(へんじ)が ない ＝ こわれて いる、とは かぎらない（「ping の 返事(へんじ)が ない ＝ こわれた？」の 単元(たんげん)）。']);
  add(8, 'まとめ（組(く)み合(あ)わせる）', ['これまでの コマンドを 組(く)み合(あ)わせよう。hint.txt を 読(よ)む → dir /a で かくしフォルダ → cd → findstr。', 'ファイルを 消(け)す コマンド（del・rd）や 電源(でんげん)を 切(き)る コマンド（shutdown）は 本物(ほんもの)の パソコンでは 大人(おとな)と いっしょの ときだけ。']);
  add(9, 'ping の 返事(へんじ)が ない ＝ こわれた？', [`ping は「おーい」と 呼(よ)んで「はーい」と 返(かえ)って くるかを 見(み)る もの。<b>行(い)きと 帰(かえ)りが そろって はじめて 成功(せいこう)</b>。`, `サーバー（ホームページなどを 出(だ)す きかい）の 中(なか)には、<b>ping に 返事(へんじ)を しない 設定(せってい)</b>に して いる ものが ある（あやしい 人(ひと)に「ここに きかいが あるよ」と 知(し)られにくく するため）。だから <b>返事(へんじ)が ない ＝ こわれて いる、とは かぎらない</b>。`, `ほかの 方法(ほうほう)でも たしかめよう。<b>curl http://名前(なまえ)</b> で ホームページが 返(かえ)って くれば、その きかいは 動(うご)いて いる。${ex('curl http://tenki', '<html><head><title>きょうの てんき</title></head>')}`, 'おまけ：ping は <b>ICMP</b> という しくみ。ホームページは <b>TCP</b> の しくみ（つぎの 単元(たんげん)）。<b>ファイアウォール</b>（通信(つうしん)の 門番(もんばん)）が ICMP だけ 止(と)めて いると、ping は とどかないのに ホームページは 見(み)られる。']);
  add(10, 'TCP と UDP（送(おく)り方(かた)の ちがい）', [`ネットで データを 送(おく)る やり方(かた)には 大(おお)きく 2つ ある。<br><b>TCP</b>：とどいたか たしかめながら、順番(じゅんばん)どおりに 送(おく)る（電話(でんわ)のように「聞(き)こえた？」「うん」と やりとりする）。ホームページ・メールなど、1文字(もじ)でも 欠(か)けたら こまる もの。<br><b>UDP</b>：送(おく)りっぱなし。たしかめない ぶん 速(はや)い（放送(ほうそう)のように 流(なが)すだけ）。ビデオ通話(つうわ)・ゲーム・時計(とけい)あわせなど、少(すこ)し 欠(か)けても 速(はや)さが 大事(だいじ)な もの。`, `<b>ポート番号(ばんごう)</b>は、きかいの 中(なか)の「部屋(へや)番号(ばんごう)」。IPアドレスが 住所(じゅうしょ)なら、ポートは その 家(いえ)の 部屋(へや)。ホームページは 80（http）と 443（https）、名前(なまえ)しらべ（DNS）は 53、時計(とけい)あわせは 123 が よく 使(つか)われる。`, `<b>netstat -an</b> で、いまの 通信(つうしん)の 一覧(いちらん)が 見(み)られる。アドレスの <b>: の うしろ</b>が ポート番号(ばんごう)。TCP には「状態(じょうたい)」が ある（LISTENING＝待(ま)って いる、ESTABLISHED＝つながって いる）。UDP は 状態(じょうたい)の らんが 空(から)（「つながる」という 考(かんが)えが ない）。${ex('netstat -an', '  TCP   192.168.1.23:52011   203.0.113.8:443   ESTABLISHED\n  UDP   0.0.0.0:5353         *:*')}`, 'おまけ：ping の ICMP は TCP でも UDP でも ない べつの しくみで、ポート番号(ばんごう)が ない。']);
  add(11, 'arp（MACアドレス）', [`<b>MACアドレス</b>は、きかいの ネットの 部品(ぶひん)に 1つずつ ついて いる 番号(ばんごう)（工場(こうじょう)で つけられる）。0〜9 と a〜f の 12けたで、2けたずつ - で 区切(くぎ)る（例(れい)：3a-5c-11-8e-02-f4）。IPアドレスが「いま 住(す)んで いる 住所(じゅうしょ)」（ネットが かわると かわる）なら、MACアドレスは「その きかいの 背番号(せばんごう)」。`, `<b>arp -a</b> で、同(おな)じ ネットの 中(なか)の「IPアドレス → MACアドレス」の 表(ひょう)が 見(み)られる。表(ひょう)に 出(で)るのは <b>さいきん やりとりした きかいだけ</b>。だから 先(さき)に <b>ping</b> してから 見(み)る。${ex('arp -a', '  インターネット アドレス 物理アドレス          種類\n  192.168.1.1            3a-5c-11-8e-02-f4     動的')}`, '「動的(どうてき)」は 自動(じどう)で おぼえた もの、「静的(せいてき)」は はじめから 決(き)まって いる もの。ff-ff-ff-ff-ff-ff は「みんなへ」の 番号(ばんごう)。', 'おまけ：スマホなどには、MACアドレスを わざと かえる 機能(きのう)（ランダムな MACアドレス）も ある。MACアドレスも むやみに 人(ひと)に 教(おし)えない。']);
})();
