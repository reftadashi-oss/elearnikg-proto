// タイピングの練習（試作品。2026年11月10日）
// ことばが出る → ローマ字で正しく打つ → 次のことば。時間は60秒（仮）。ルトなしの練習（仮）。
// ローマ字は訓令式・ヘボン式どちらでも正解（kana.js と同じ決まり）。画面の手本はヘボン式（shi・chi・tsu。仮）。
const Typing = (() => {
  const SEC = 60;   // 1回の時間（仮）
  // ことばはROOTで作ったもの（本・サイトから写していない）。本番は先生がOKをつけたものだけ使う
  // キーの練習（2026年11月12日）：ホームポジション → 指ごとの キー → ぜんぶ。出た 文字を そのまま 打つ（ローマ字に 直さない）
  // 指の わりあては ふつうの タッチタイピング（ひとさしゆびは F・J の 列と その となり）。ならびは Claude の案（仮）
  const DRILLS = [
    { id: 'k1', name: 'ホームポジション①（F と J）', note: '{人|ひと}さし{指|ゆび}', words: ['fff', 'jjj', 'fjf', 'jfj', 'ffjj', 'jjff', 'fjfj', 'jfjf', 'fjjf', 'jffj'] },
    { id: 'k2', name: 'ホームポジション②（A S D F・J K L ;）', note: '8{本|ほん}の {指|ゆび}', words: ['asdf', 'jkl;', 'fdsa', ';lkj', 'fjdk', 'dkfj', 'sla;', 'a;sl', 'asdfjkl;', 'fdsajkl;', 'adsf', 'jlk;', 'dfjk', 'sdkl'] },
    { id: 'k3', name: '{人|ひと}さし{指|ゆび}（R T G V B・Y U H N M）', note: 'F・J から のばす', words: ['frf', 'ftf', 'fgf', 'fvf', 'fbf', 'juj', 'jyj', 'jhj', 'jnj', 'jmj', 'frfv', 'jujm', 'ftgb', 'jyhn', 'rtgvb', 'yuhnm', 'fghj', 'rugby', 'thumb', 'hunt'] },
    { id: 'k4', name: '{中指|なかゆび}（E D C・I K ,）', note: 'D・K から のばす', words: ['ded', 'dcd', 'kik', 'k,k', 'dedc', 'kik,', 'deki', 'cedk', 'dice', 'kid', 'deck', 'iced'] },
    { id: 'k5', name: 'くすり{指|ゆび}（W S X・O L .）', note: 'S・L から のばす', words: ['sws', 'sxs', 'lol', 'l.l', 'swsx', 'lol.', 'wolx', 'slow', 'wool', 'solo', 'xlsw'] },
    { id: 'k6', name: '{小指|こゆび}（Q A Z・P ;）', note: 'A・; から のばす', words: ['aqa', 'aza', ';p;', 'aqaz', ';p;p', 'qazp', 'papa', 'zap', 'aqp;'] },
    { id: 'k7', name: 'ぜんぶの {指|ゆび}', note: 'アルファベット ぜんぶ', words: ['qwert', 'yuiop', 'asdfg', 'hjkl;', 'zxcvb', 'nm,.', 'quiz', 'jump', 'frog', 'black', 'windy', 'exam', 'video', 'happy', 'kabuto', 'sakura', 'yokozuna'] },
  ].map(l => Object.assign(l, { drill: true, label: 'キー' + l.id.slice(1) }));
  const KB = ['qwertyuiop', 'asdfghjkl;', 'zxcvbnm,./'];
  const FINGER = {}; ['qaz', 'wsx', 'edc', 'rfvtgb', 'yhnujm', 'ik,', 'ol.', 'p;/'].forEach((s, i) => [...s].forEach(c => FINGER[c] = i));
  const FNAME = ['{左|ひだり}の {小指|こゆび}', '{左|ひだり}の くすり{指|ゆび}', '{左|ひだり}の {中指|なかゆび}', '{左|ひだり}の {人|ひと}さし{指|ゆび}', '{右|みぎ}の {人|ひと}さし{指|ゆび}', '{右|みぎ}の {中指|なかゆび}', '{右|みぎ}の くすり{指|ゆび}', '{右|みぎ}の {小指|こゆび}'];
  // キーボードの図：指ごとに 色を わける。next＝つぎに 打つ キー（光らせる）。F・J・ホームの 列は わくを こく
  const kbdHTML = next => `<div class="kbd">${KB.map((row, r) => `<div>${[...row].map(c => `<span class="kc f${FINGER[c]}${r === 1 && c !== 'g' && c !== 'h' ? ' home' : ''}${c === 'f' || c === 'j' ? ' bump' : ''}${c === next ? ' on' : ''}">${c.toUpperCase()}</span>`).join('')}</div>`).join('')}</div>`;
  const fingerHint = next => next && FINGER[next] !== undefined ? `${R('つぎは')} <b class="kn">${esc(next.toUpperCase())}</b>：${R(FNAME[FINGER[next]])}` : '&nbsp;';
  const LEVELS = [
    ...DRILLS,
    { id: 1, name: 'みじかい ことば', note: '2〜3{文字|もじ}', words: ['いぬ', 'ねこ', 'うみ', 'やま', 'そら', 'かさ', 'はな', 'とり', 'くも', 'ほし', 'あめ', 'ゆき', 'つき', 'かに', 'たこ', 'いす', 'つくえ', 'さかな', 'くるま', 'とけい', 'あさ', 'よる', 'なつ', 'ふゆ', 'はる', 'あき', 'もり', 'かわ', 'いえ', 'みち'] },
    { id: 2, name: 'ことば', note: '「が」「きゃ」「っ」「ん」も {出|で}る', words: ['がっこう', 'せんせい', 'ともだち', 'きょうしつ', 'しゅくだい', 'えんぴつ', 'けしごむ', 'じてんしゃ', 'でんしゃ', 'きって', 'がっき', 'ぎゅうにゅう', 'りょうり', 'びょういん', 'ちゃわん', 'しょくじ', 'きんぎょ', 'おちゃ', 'ざっし', 'ねっこ', 'らっぱ', 'ぱんだ', 'ぺんぎん', 'ぶらんこ', 'どんぐり', 'かぼちゃ', 'にんじん', 'だいこん', 'べんきょう', 'うんどうかい'] },
    { id: 3, name: 'みじかい {文|ぶん}', note: '', words: ['あさごはんを たべる', 'ほんを よむのが すき', 'ともだちと あそぶ', 'しゅくだいを おわらせる', 'あしたは はれるかな', 'おやつの じかんだ', 'てを あらって うがいを する', 'げんきに あいさつする', 'としょかんで ほんを かりる', 'こうえんで はしる', 'きょうは いい てんきだ', 'えんぴつを けずる'] },
  ];

  // ---- ひらがな → 手本のローマ字 ----
  const T = Kana.T, PREF = ['shi', 'chi', 'tsu', 'fu', 'ji', 'sha', 'shu', 'sho', 'cha', 'chu', 'cho', 'ja', 'ju', 'jo'];
  const REV = {};
  Object.entries(T).forEach(([k, v]) => {
    if (v === 'ん') return;
    const small = /^[xl]/.test(k), cur = REV[v];
    if (!cur) { REV[v] = k; return; }
    if (PREF.includes(cur)) return;
    if (PREF.includes(k) || (/^[xl]/.test(cur) && !small) || (!small && k.length < cur.length)) REV[v] = k;
  });
  function guide(k) {
    if (!k) return '';
    const c = k[0];
    if (c === 'ん') { const r = guide(k.slice(1)); return (r === '' || /^[aiueoyn]/.test(r) ? 'nn' : 'n') + r; }
    if (c === 'っ') { const r = guide(k.slice(1)); return (/^[bcdfghjkmprstvwz]/.test(r) ? r[0] : 'xtu') + r; }
    const two = k.slice(0, 2);
    if (two.length === 2 && REV[two]) return REV[two] + guide(k.slice(2));
    return (REV[c] || c) + guide(k.slice(1));
  }
  // 打ちかけのローマ字（rest）が、のこりのひらがな（t）につながるか
  function cont(rest, t) {
    if (!t) return false;
    if (t[0] === 'っ' && rest.length === 1 && /[bcdfghjkmprstvwz]/.test(rest) && cont(rest, t.slice(1))) return true;
    return Object.keys(T).some(k => k.startsWith(rest) && t.startsWith(T[k]));
  }
  // 今まで打ったローマ字（raw）が、ことば（target）の途中として正しいか。正しければ { n: 打てたひらがなの数, rest }
  function progress(raw, target) {
    const r = Kana.toHira(raw);
    if (!target.startsWith(r.kana)) return null;
    if (r.rest && !cont(r.rest, target.slice(r.kana.length))) return null;
    return { n: r.kana.length, rest: r.rest };
  }
  // のこりの手本（打ちかけの字に合わせる）
  function restGuide(target, p) {
    const t = target.slice(p.n), g = guide(t);
    if (!p.rest) return g;
    if (g.startsWith(p.rest)) return g.slice(p.rest.length);
    const k = Object.keys(T).find(x => x.startsWith(p.rest) && t.startsWith(T[x]));
    return k ? k.slice(p.rest.length) + guide(t.slice(T[k].length)) : g;
  }

  // ---- 記録（ルトなし。先生・保護者の画面には app.js の typingBlock で出す） ----
  const recs = () => { const S = Store.get(); return S.typing || (S.typing = []); };
  const bestOf = (child, level) => recs().filter(r => r.child === child && r.level === level).reduce((m, r) => Math.max(m, r.keys), 0);

  let st = null, timer = null, showGuide = true;
  const stop = () => { if (timer) clearInterval(timer); timer = null; document.onkeydown = null; };

  const lvOf = id => LEVELS.find(l => String(l.id) === String(id));
  const lvLabel = l => l.label || 'レベル' + l.id;
  const lvBtn = l => { const b = bestOf(me.id, l.id); return `<button class="unit" onclick="Typing.start('${l.id}')"><small>${lvLabel(l)}</small><span class="nm">${R(l.name)}</span><span class="tag">${R(l.note)}${b ? `${l.note ? '・' : ''}${R(`さいこう ${b}{文字|もじ}`)}` : ''}</span></button>`; };
  function menu() {
    stop(); st = null;
    app().innerHTML = header(`<button onclick="showTop()">${R('Eラーニングへ')}</button>`) + `<main id="typ" class="typ">
      <h2>${R('タイピングの {練習|れんしゅう}')}</h2>
      <p>${R(`ことばが {出|で}るので、ローマ{字|じ}で {打|う}とう。${SEC}{秒|びょう}で いくつ {打|う}てるかな。`)}<br><small class="note">${R('{練習|れんしゅう}なので、ルトは つきません。')}</small></p>
      <h3>${R('① キーの {練習|れんしゅう}（ホームポジションから）')}</h3>
      <p>${R('{左|ひだり}の {人|ひと}さし{指|ゆび}を <b>F</b>、{右|みぎ}の {人|ひと}さし{指|ゆび}を <b>J</b> に おこう（F と J には {小|ちい}さな でっぱりが あるよ）。ほかの {指|ゆび}は、その となりに {順|じゅん}に おく。これが ホームポジション。{打|う}ったら、{指|ゆび}を ホームポジションに もどそう。')}</p>
      <div style="text-align:center">${kbdHTML(null)}<p class="note">${FNAME.map((n, i) => `<span class="kc f${i}" style="display:inline-flex;width:auto;height:auto;padding:0 8px;font-size:.95em;font-weight:normal">${R(n)}</span>`).join(' ')}</p></div>
      <div class="units">${LEVELS.filter(l => l.drill).map(lvBtn).join('')}</div>
      <h3>${R('② ことばの {練習|れんしゅう}（ローマ{字|じ}）')}</h3>
      <div class="units">${LEVELS.filter(l => !l.drill).map(lvBtn).join('')}</div>
      <label class="inline"><input type="checkbox" id="tg" ${showGuide ? 'checked' : ''}> ${R('{手本|てほん}（ローマ{字|じ}・キーボードの {図|ず}）を {出|だ}す')}</label>
    </main>`;
    $('#tg').onchange = e => { showGuide = e.target.checked; };
  }

  function next() {
    const L = lvOf(st.level);
    let w; do { w = L.words[Math.floor(Math.random() * L.words.length)]; } while (w === st.shown && L.words.length > 1);
    st.shown = w; st.target = w.replace(/ /g, ''); st.raw = ''; st.drill = !!L.drill;
  }
  // キーの練習：打った 文字が、出ている 文字の 途中まで 合っていれば よい
  const prog = (raw, target) => st.drill ? (target.startsWith(raw) ? { n: raw.length, rest: '' } : null) : progress(raw, target);
  function draw(miss) {
    const p = prog(st.raw, st.target) || { n: 0, rest: '' };
    let i = 0;
    const rest = st.drill ? st.target.slice(st.raw.length) : restGuide(st.target, p);
    $('#tword').innerHTML = [...st.shown].map(c => c === ' ' ? '<span class="sp"></span>' : `<span class="${i++ < p.n ? 'ok' : ''}">${esc(st.drill ? c.toUpperCase() : c)}</span>`).join('');
    $('#tguide').innerHTML = st.drill ? '' : `<span class="ok">${esc(st.raw)}</span>${showGuide ? esc(rest) : ''}`;
    if ($('#tkbd')) $('#tkbd').innerHTML = showGuide || st.drill ? `<p class="tfinger">${fingerHint(rest[0])}</p>${kbdHTML(rest[0])}` : '';
    $('#tcount').textContent = st.words;
    const box = $('#tbox'); box.classList.toggle('miss', !!miss); if (miss) setTimeout(() => box.classList.remove('miss'), 150);
  }
  function tick() {
    if (!document.getElementById('typ') || !st) return stop();
    if (!st.t0) return;
    const left = Math.max(0, SEC - (Date.now() - st.t0) / 1000);
    $('#ttime').textContent = Math.ceil(left);
    if (left <= 0) finish();
  }
  function start(level) {
    stop();
    level = lvOf(level).id;   // 画面の ボタンからは 文字で 来るので、もとの id（数字 か 'k1' など）に 直す
    st = { level, keys: 0, miss: 0, words: 0, t0: 0 }; next();
    app().innerHTML = header(`<button onclick="Typing.menu()">${R('やめる')}</button>`) + `<main id="typ" class="typ">
      <p class="tbar">${R('のこり')} <b id="ttime">${SEC}</b> ${R('{秒|びょう}')}　／　${R('{打|う}てた ことば')} <b id="tcount">0</b></p>
      <div id="tbox" class="tbox"><div id="tword" class="tword"></div><div id="tguide" class="tguide"></div></div>
      <div id="tkbd" style="text-align:center"></div>
      <p class="note" id="thint">${R('さいしょの キーを {打|う}つと、{時間|じかん}が スタートします。')}</p>
    </main>`;
    draw();
    timer = setInterval(tick, 200);
    document.onkeydown = e => {
      if (!document.getElementById('typ') || !st) return stop();
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape') return menu();
      if (e.key === 'Process' || e.isComposing) { $('#thint').innerHTML = R('キーが きかないときは、キーボードの「{半角|はんかく}/{全角|ぜんかく}」キーを 1{回|かい} おしてね。'); return; }
      if (!(st.drill ? /^[a-zA-Z;,.\/]$/ : /^[a-zA-Z\-']$/).test(e.key)) return;
      e.preventDefault();
      if (!st.t0) { st.t0 = Date.now(); $('#thint').textContent = ''; }
      const raw = st.raw + e.key.toLowerCase();
      if (!prog(raw, st.target)) { st.miss++; return draw(true); }
      st.raw = raw; st.keys++;
      if (st.drill) { if (raw === st.target) { st.words++; next(); } return draw(); }
      // 最後の「ん」は nn と打つ（本物の日本語入力と同じ。手本も nn）
      const done = Kana.toHira(raw); if (done.kana === st.target && !done.rest) { st.words++; next(); }
      draw();
    };
  }
  function finish() {
    const r = { child: me.id, at: new Date().toISOString(), day: Store.today(), level: st.level, keys: st.keys, miss: st.miss, words: st.words, sec: SEC };
    const before = bestOf(me.id, st.level);
    stop(); recs().push(r); Store.save();
    const acc = r.keys + r.miss ? Math.round(r.keys / (r.keys + r.miss) * 100) : 0;
    const level = st.level; st = null;
    app().innerHTML = header(`<button onclick="showTop()">${R('Eラーニングへ')}</button>`) + `<main id="typ" class="typ center">
      <h2>${R('おつかれさま！')}</h2>
      <table class="list tres">
        <tr><td>${R(lvOf(level).drill ? '{打|う}てた かたまり' : '{打|う}てた ことば')}</td><td><b>${r.words}</b></td></tr>
        <tr><td>${R('{正|ただ}しく {打|う}った キー')}</td><td><b>${r.keys}</b> ${R('{文字|もじ}')}${r.keys > before && before ? `　<span class="up">${R('じぶんの {新記録|しんきろく}！')}</span>` : ''}</td></tr>
        <tr><td>${R('まちがえた キー')}</td><td>${r.miss}</td></tr>
        <tr><td>${R('{正|ただ}しさ')}</td><td>${acc}%</td></tr>
      </table>
      <p><button class="primary big" onclick="Typing.start('${level}')">${R('もう{一回|いっかい}')}</button><button onclick="Typing.menu()">${R('レベルを えらぶ')}</button></p>
    </main>`;
  }
  return { menu, start, guide, progress, LEVELS };
})();
