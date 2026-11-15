// まとめテストと苦手まとめ（仕様書：級やシリーズごとに置く）。全部の単元を読みこんだあとに、シリーズごとに2つ足す。
// まとめテスト：そのシリーズの全部の単元から10問。漢検は 本物の 漢検の 形（分野ごとの 大問・点数。下の KEXAM）。
// 苦手まとめ：その子が最近まちがえた問題と、苦手な単元（Rules.weakUnits）から10問。子どもごとに中身が変わる。ルトの決まりは普通の単元と同じ（仮）。
const Review = (() => {
  const RECENT = 30;   // 最近の何回から、まちがえた問題を探すか（仮）
  const stem = t => t.split('<br><span class="ch">')[0];   // えらぶ問題は番号の順がかわるので、問いの部分でくらべる
  const realUnits = sid => SUBJECTS.flatMap(s => s.series).find(s => s.id === sid).units.filter(u => !UNITS[u].extra);
  const fill = (qs, more, n = 10) => { const seen = new Set(qs.map(q => stem(q.text))); more.forEach(q => { if (qs.length < n && !seen.has(stem(q.text))) { qs.push(q); seen.add(stem(q.text)); } }); return qs; };

  // まだ直っていない、まちがえた問題：{問いの文 → 単元}
  function wrongOf(sid, history) {
    const us = new Set(realUnits(sid)), mine = new Set([...us, `weak-${sid}`, `all-${sid}`]), out = new Map();
    // まとめの回で正解したら「直った」にする。まとめの回のまちがいは、元の単元がわからないので足さない
    history.filter(a => mine.has(a.unit) && !a.invalid).slice(-RECENT).forEach(a => a.questions.forEach(q => { const t = stem(q.text); if (q.ok) out.delete(t); else if (us.has(a.unit)) out.set(t, a.unit); }));
    return out;
  }
  const weakOf = (sid, history) => { const us = new Set(realUnits(sid)); return Rules.weakUnits(history).filter(w => us.has(w.unit)).map(w => w.unit); };
  // 苦手まとめを出せるか：苦手な単元があるか、まちがえた問題が3問以上（3問は仮）
  const ready = (sid, history) => weakOf(sid, history).length > 0 || wrongOf(sid, history).size >= 3;

  function makeWeak(sid) {
    const hist = Store.attemptsOf(me.id), wrong = wrongOf(sid, hist), weak = weakOf(sid, hist), qs = [];
    // 問題の数が決まっている単元（漢検など）は、まちがえた問題そのものをもう一度出す
    [...new Set(wrong.values())].filter(u => UNITS[u].subject === 'kanken').slice(0, 6).forEach(u => {
      for (let i = 0; i < 12 && qs.length < 10; i++) fill(qs, UNITS[u].make(new Set()).filter(q => wrong.has(stem(q.text)) && wrong.get(stem(q.text)) === u));
    });
    // のこりは、苦手な単元 → まちがえたことのある単元 の順に、新しい問題で
    const from = [...new Set([...weak, ...wrong.values()])];
    for (let i = 0; i < 8 && qs.length < 10 && from.length; i++) fill(qs, UNITS[from[i % from.length]].make(new Set()).slice(0, Math.max(3, Math.ceil(10 / from.length))));
    const all = realUnits(sid);
    for (let i = 0; qs.length < 10 && i < 12; i++) fill(qs, UNITS[all[i % all.length]].make(new Set()));
    return shuffle(qs).slice(0, 10);
  }
  function makeAll(sid, n = 10) {
    const units = shuffle(realUnits(sid)).slice(0, 10);
    for (let t = 0; ; t++) {
      const sets = units.map(u => shuffle(UNITS[u].make(new Set()))), qs = [];
      for (let i = 0; qs.length < n && i < 10; i++) sets.forEach(s => { if (s[i]) fill(qs, [s[i]], n); });
      const c = {}; qs.forEach(q => { const k = q.answer.join('/'); c[k] = (c[k] || 0) + 1; });
      if (t >= 8 || Math.max(...Object.values(c)) <= Math.ceil(n * 0.6)) return shuffle(qs).slice(0, n);
    }
  }
  // 理科・社会の カテゴリーの まとめは 20問・合格で 5ルト（2026年11月13日。rules.js の bigAllRuto）
  const BIG = new Set(['x1', 'sci']);

  // 漢検の まとめテストは 本物の 漢検の 形（2026年11月13日 社長回答 1-6 B）。
  // 出る分野・満点（10〜8級 150点、7級から 200点）・合格ライン（10〜8級 8割、7〜3級 7割）は 漢検協会「各級の概要」
  //   https://www.kanken.or.jp/kanken/grades/overview/ による。
  // 分野ごとの 問題数・1問の点数は 公式ページに 出ていないので ROOT の 仮（過去問からは 写していない）。
  // 4級・3級は 書き取りの 単元が まだ ないので 入れていない。9級・10級は 公式の 分野に 部首が ないので 入れていない。
  // ［大問の名前, 単元の名前（ふりがなを とったもの）, 問題数, 1問の点数］
  const KR = /^読み/, KW = /^書き/, KK = /^画数/, KH = /^筆順/, KB = /^部首/, OK = /^送り仮名/, TR = /^(対|類)義語/, DO = /^同(音|訓)異字/;
  const KEXAM = {
    k10: [['読み', KR, 30, 2], ['書き取り', KW, 20, 3], ['画数', KK, 5, 2], ['筆順', KH, 10, 2]],
    k8: [['読み', KR, 20, 2], ['書き取り', KW, 25, 2], ['部首', KB, 5, 2], ['画数', KK, 5, 2], ['筆順', KH, 5, 2], ['送り仮名', OK, 5, 2], ['対義語', /^対義語/, 5, 2], ['同じ漢字の読み', /^同じ 漢字の 読み/, 5, 2]],
    k7: [['読み', KR, 30, 2], ['書き取り', KW, 35, 2], ['部首', KB, 5, 2], ['画数', KK, 5, 2], ['筆順', KH, 5, 2], ['送り仮名', OK, 5, 2], ['対義語', /^対義語/, 5, 2], ['同音異字', /^同音異字/, 5, 2], ['三字熟語', /^三字熟語/, 5, 2]],
    k6: [['読み', KR, 20, 2], ['書き取り', KW, 20, 2], ['部首', KB, 5, 2], ['画数', KK, 5, 2], ['筆順', KH, 5, 2], ['送り仮名', OK, 5, 2], ['対義語・類義語', TR, 10, 2], ['同音・同訓異字', DO, 10, 2], ['三字熟語', /^三字熟語/, 10, 2], ['熟語の構成', /^熟語の 構成/, 10, 2]],
    k5: [['読み', KR, 20, 2], ['書き取り', KW, 20, 2], ['部首', KB, 5, 2], ['画数', KK, 5, 2], ['筆順', KH, 5, 2], ['送り仮名', OK, 5, 2], ['対義語・類義語', TR, 10, 2], ['同音・同訓異字', DO, 10, 2], ['誤字訂正', /^誤字訂正/, 5, 2], ['四字熟語', /^四字熟語/, 10, 2], ['熟語の構成', /^熟語の 構成/, 5, 2]],
    k4: [['読み', KR, 30, 2], ['部首', KB, 10, 2], ['送り仮名', OK, 10, 2], ['対義語・類義語', TR, 10, 2], ['同音・同訓異字', DO, 10, 2], ['誤字訂正', /^誤字訂正/, 5, 2], ['四字熟語', /^四字熟語/, 15, 2], ['熟語の構成', /^熟語の 構成/, 10, 2]],
  };
  KEXAM.k9 = KEXAM.k10; KEXAM.k3 = KEXAM.k4;
  // 英検5級の 形（2026年11月15日。content_eigo.js）：リーディングの 大問と 問題数は 英検協会「5級の試験内容」による。1問 1点・合格 8割は ROOT の 仮（本物は CSEスコア）。リスニングは なし
  KEXAM.x3k5 = [['{短文|たんぶん}の {語句|ごく}', /^短文/, 15, 1], ['{会話文|かいわぶん}の {文|ぶん}', /^会話文/, 5, 1], ['ならべかえ', /^ならべかえ/, 5, 1]];
  // 英検4級の 形（content_eigo2.js）：リーディング 35問（協会「4級の試験内容」）。長文は 同じ 文章の 問題が つづくように まぜない（単元の keep）
  KEXAM.x3k4 = [['{短文|たんぶん}の {語句|ごく}', /^短文/, 15, 1], ['{会話文|かいわぶん}の {文|ぶん}', /^会話文/, 5, 1], ['ならべかえ', /^ならべかえ/, 5, 1], ['{長文|ちょうぶん}', /^長文/, 10, 1]];
  // 英検3級の 形（content_eigo3.js）：リーディング 30問（協会「3級の試験内容」）。ライティング 2問は 入れていない
  KEXAM.x3k3 = [['{短文|たんぶん}の {語句|ごく}', /^短文/, 15, 1], ['{会話文|かいわぶん}の {文|ぶん}', /^会話文/, 5, 1], ['{長文|ちょうぶん}', /^長文/, 10, 1]];
  const EIKEN = { x3k5: '{英検|えいけん}5{級|きゅう}', x3k4: '{英検|えいけん}4{級|きゅう}', x3k3: '{英検|えいけん}3{級|きゅう}' };
  const FG = { '読み': '{読|よ}み', '書き取り': '{書|か}き{取|と}り', '画数': '{画数|かくすう}', '筆順': '{筆順|ひつじゅん}', '部首': '{部首|ぶしゅ}', '送り仮名': '{送|おく}り{仮名|がな}', '対義語': '{対義語|たいぎご}',
    '同じ漢字の読み': '{同|おな}じ {漢字|かんじ}の {読|よ}み', '同音異字': '{同音異字|どうおんいじ}', '三字熟語': '{三字熟語|さんじじゅくご}', '対義語・類義語': '{対義語|たいぎご}・{類義語|るいぎご}',
    '同音・同訓異字': '{同音|どうおん}・{同訓異字|どうくんいじ}', '熟語の構成': '{熟語|じゅくご}の {構成|こうせい}', '誤字訂正': '{誤字訂正|ごじていせい}', '四字熟語': '{四字熟語|よじじゅくご}' };
  Object.values(KEXAM).forEach(l => l.forEach(x => { if (!x.fg) x[0] = FG[x[0]] || x[0]; x.fg = 1; }));
  const plain = n => n.replace(/\{([^|}]+)\|[^}]+\}/g, '$1');
  const examMax = sid => KEXAM[sid].reduce((s, [, , n, p]) => s + n * p, 0);
  function makeExam(sid) {
    const us = realUnits(sid), out = [];
    KEXAM[sid].forEach(([sec, re, n, pts]) => {
      const from = us.filter(u => re.test(plain(UNITS[u].base || UNITS[u].name)));   // base＝級を つける 前の 名前（app.js）
      // 前の大問と 同じ 問題が 出ないように、got の 先頭に いままでの 問題を 入れておく
      const got = out.slice(), want = out.length + n;
      const keep = from.some(u => UNITS[u].keep), mix = a => keep ? a : shuffle(a);
      for (let i = 0; from.length && got.length < want && i < n * 3; i++) fill(got, mix(UNITS[from[i % from.length]].make(new Set())).slice(0, Math.max(2, Math.ceil(n / from.length))), want);
      mix(got.slice(out.length)).forEach(q => out.push({ ...q, sec, pts }));
    });
    return out;
  }
  const examLecture = sid => {
    const max = examMax(sid), pass = UNITS[realUnits(sid)[0]].pass;
    return [EIKEN[sid] ? `${EIKEN[sid]}の {読|よ}む {問題|もんだい}と {同|おな}じ {形|かたち}の テストだよ（{聞|き}く {問題|もんだい}は ないよ）。じゅんばんに {出|で}るよ。` : '{本物|ほんもの}の {漢検|かんけん}と {同|おな}じ {形|かたち}の テストだよ。{分野|ぶんや}ごとに じゅんばんに {出|で}るよ。',
      KEXAM[sid].map(([sec, , n, p]) => `${sec} ${n}{問|もん}（1{問|もん} ${p}{点|てん}）`).join('<br>'),
      `${max}{点|てん}まんてん。${Math.round(max * pass)}{点|てん}（${pass * 10}{割|わり}）で {合格|ごうかく}。はじめて {合格|ごうかく}すると 30ルト もらえるよ。{時間|じかん}が かかるから、{時間|じかん}の ある {日|ひ}に やろう。`];
  };

  SUBJECTS.forEach(s => s.series.forEach(se => {
    if (!se.units.length) return;
    const first = UNITS[se.units[0]], base = { subject: first.subject, series: se.id, col: first.col, pass: first.pass, extra: true };
    const allId = `all-${se.id}`, weakId = `weak-${se.id}`;
    const big = BIG.has(s.id), n = big ? 20 : 10;
    UNITS[allId] = { ...base, id: allId, kind: 'all', big, name: 'まとめテスト', make: () => makeAll(se.id, n), lecture: [`ここまでの {単元|たんげん}から、${n}{問|もん} {出|で}るよ。`, big ? '{今|いま}までの {力|ちから}を ためして みよう。{合格|ごうかく}すると 5ルト もらえるよ。' : '{今|いま}までの {力|ちから}を ためして みよう。'] };
    if (KEXAM[se.id]) Object.assign(UNITS[allId], { exam: true, name: EIKEN[se.id] ? `まとめテスト（${EIKEN[se.id]}の {形|かたち}）` : 'まとめテスト（{漢検|かんけん}の {形|かたち}）', make: () => makeExam(se.id), lecture: examLecture(se.id) });
    UNITS[weakId] = { ...base, id: weakId, kind: 'weak', name: '{苦手|にがて}まとめ', make: () => makeWeak(se.id), lecture: ['まちがえた {問題|もんだい}や、{苦手|にがて}な {単元|たんげん}から、10{問|もん} {出|で}るよ。', 'もう{一度|いちど} ちょうせん してみよう。'] };
    se.units.push(weakId, allId);
  }));

  return { ready, wrongOf, weakOf };
})();
