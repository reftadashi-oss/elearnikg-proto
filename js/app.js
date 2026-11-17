// 画面（見た目と動き）。決まりは rules.js、データは store.js、問題は content.js
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const app = () => $('#app');
let me = null;            // ログインしている人
let viewMode = 'all';     // ふりがなの決まり：子どもの学年／'all'／'none'
const R = t => Furigana.render(t, viewMode);
const IDLE_MIN = 10;      // しばらくさわらないと自動でログアウト（仮：10分）
let idleTimer = null;
// マネーラボの画面（子ども）は 30秒 さわらないと ログアウト（マネーラボ仕様書 8-1 の「共通」）。ほかの画面は IDLE_MIN 分
const ML_IDLE_SEC = 30;
const idleMs = () => me && me.role === 'child' && document.querySelector('main.ml') ? ML_IDLE_SEC * 1000 : IDLE_MIN * 60000;
// 先生のアカウントは 自動ログアウトしない（2026年11月12日）。テスト用の アカウント（admin・admin1234）も しない（11月15日 社長）
function touch() { clearTimeout(idleTimer); if (me && me.role !== 'teacher' && !me.test && !me.noIdle) idleTimer = setTimeout(() => { if (typeof glossClose === 'function') glossClose(); logout(); alert('しばらく つかわなかったので、ログアウトしました'); }, idleMs()); }
['click', 'keydown', 'wheel', 'touchstart'].forEach(e => document.addEventListener(e, touch, { passive: true }));

function logout() { me = null; testBack = null; sessionStorage.removeItem('me'); bodyClass(); showLogin(); }
// テスト用の アカウント（me.test）：子どもの 画面と 先生の 画面を、ログインし直さずに 行き来できる（2026年11月15日 社長。試作品だけ）
let testBack = null;
function testToTeacher() { testBack = me.id; me = Store.get().users.find(u => u.role === 'teacher'); route(); }
function testReturn() { me = Store.get().users.find(u => u.id === testBack) || null; testBack = null; route(); }
const holiday = () => Store.get().settings.holiday;

// ================= ログイン（全部の漢字にふりがな） =================
function showLogin(msg = '') {
  viewMode = 'all';
  app().innerHTML = `
  <div class="card login">
    <h1>ROOT Eラーニング</h1>
    <label><span>${R('ユーザー{名|めい}')}</span><input id="u" autocomplete="off"></label>
    <label>パスワード<input id="p" type="password"></label>
    <button id="go" class="primary">${R('{入|はい}る')}</button>
    <p class="msg">${msg}</p>
    <p class="note">${R('{試作品|しさくひん}です。{名前|なまえ}はすべて{架空|かくう}です。')}</p>
  </div>`;
  $('#u').focus();
  const go = async () => {
    const r = await Store.login($('#u').value, $('#p').value);
    if (r.ok) { me = r.user; sessionStorage.setItem('me', me.id); touch(); route(); }
    else if (r.locked) showLogin(R('ロックされました。{先生|せんせい}に {言|い}ってね。'));
    else showLogin(R('ユーザー{名|めい}か パスワードが ちがいます') + (r.left ? R(`（あと${r.left}{回|かい}）`) : ''));
  };
  $('#go').onclick = go;
  $('#p').onkeydown = e => { if (e.key === 'Enter') go(); };
  $('#u').onkeydown = e => { if (e.key === 'Enter') $('#p').focus(); };
}

// 画面の 形を 人で かえる目印：kid＝子どもの画面（ことばの 切れ目で 折り返す）、lowg＝1・2年生（ことばの あいだを 広く）
function bodyClass() { const kid = !!me && me.role === 'child'; document.body.classList.toggle('kid', kid); document.body.classList.toggle('lowg', kid && me.grade <= 2); }
// 架空のデータを 作ったあと 1回だけ：見本の 子を その学年の スタートに する（store.js の seedStart）
function seedStartApply() { const S = Store.get(); if (!S.seedStart) return; delete S.seedStart; Store.children().forEach(c => applyStart(c.id, c.grade, 't1')); Store.save(); }
function route() {
  bodyClass(); seedStartApply();
  if (!me) return showLogin();
  if (me.mustChange && Store.get().settings.mustChange) return showChangePw();
  if (me.role === 'child') {
    // 試作品：子どもがログインしたら、今日来たことにする（本番は出席のしくみから）
    const at = Store.get().attendance[me.id];
    if (!at.includes(Store.today())) { at.push(Store.today()); Store.save(); }
    viewMode = me.grade; return showTop();
  }
  viewMode = 'none';
  if (me.role === 'teacher') return showTeacher();
  const ks = Store.kidsOf(me); parentKid = ks.some(c => c.id === parentKid) ? parentKid : ks[0].id;
  return showParent(parentKid);
}
// はじめてのログイン（または先生がリセットしたあと）に、自分でパスワードを変える。先生の設定で on/off（仮）
function showChangePw(msg = '') {
  viewMode = me.role === 'child' ? me.grade : 'none';
  app().innerHTML = `<div class="card login"><h1>${R('パスワードを {変|か}えよう')}</h1>
    <p>${R('はじめての ログインです。{自分|じぶん}だけが わかる パスワードに {変|か}えてね（4もじ{以上|いじょう}。{名前|なまえ}や たんじょうびは だめ）。')}</p>
    <label>${R('{新|あたら}しい パスワード')}<input id="np1" type="password"></label>
    <label>${R('もう{一度|いちど}')}<input id="np2" type="password"></label>
    <button id="npgo" class="primary">${R('{変|か}える')}</button><p class="msg">${msg}</p></div>`;
  $('#np1').focus();
  $('#npgo').onclick = async () => {
    const a = $('#np1').value, b = $('#np2').value;
    if (a.length < 4) return showChangePw(R('4もじ{以上|いじょう}に してね'));
    if (a !== b) return showChangePw(R('2つが ちがいます'));
    await Store.changePassword(me.id, a); me = Store.get().users.find(u => u.id === me.id); route();
  };
}
let parentKid = null;

// ================= 子どものトップ =================
// ruto＝普通預金の残高を出すか。Eラーニングの画面では出さない（2026年11月12日。口座の画面だけ出す）
function header(extra = '', ruto = false) {
  // 親戚の 子は 年長・年少なので、学年（1ねん）の かわりに label（ねんちょう など）を 出す。内容は 1年生
  return `<header><span>${esc(me.name)}（${me.label ? esc(me.label) : Furigana.gradeLabel(me.grade, me.grade)}）</span>
    ${ruto ? `<span class="ruto">${R('{普通預金|ふつうよきん}')}：<b>${Store.balance(me.id).toLocaleString()}</b> ルト</span>` : ''}${extra}
    ${me.test ? `<button onclick="testToTeacher()">${R('{先生|せんせい}の {画面|がめん}へ')}</button>` : ''}<button onclick="logout()">ログアウト</button></header>`;
}
function todayDots() {
  const n = Rules.rutoCountOn(Store.attemptsOf(me.id), Store.today()), cap = Rules.capFor(holiday());
  return `<div class="dots">${R('{今日|きょう}の ルトの{回|かい}')}：${'●'.repeat(Math.min(n, cap))}${'○'.repeat(Math.max(0, cap - n))}
    ${n >= cap ? R('（このあとは {練習|れんしゅう}・ルトなし）') : ''}</div>`;
}

// ================= すすみぐあい（ロードマップ）：その子の進度に あった単元だけ えらべる =================
// シリーズの中：前の単元に 合格すると、次の単元が ひらく（仕様書 5-1「シリーズの中は やさしい順」）。
// シリーズ：その学年に なったら ひらく。前のシリーズを ぜんぶ合格しても ひらく。
// 学年の目安は 学習指導要領を もとにした Claude の案（仮。先生が決める）
const SERIES_GRADE = {
  k10: 1, k9: 2, k8: 3, k7: 4, k6: 5, k5: 6, k4: 7, k3: 7,          // 漢検：10級＝1年の字 … 5級＝6年の字。4・3級は 5級が おわったら
  m1: 1, m2: 1, m3: 1, m17: 1, m4: 2, m13: 2, m16: 2, m5: 3, m6: 3, m7: 3, m8: 3,
  m9: 4, m11: 4, m12: 4, m14: 5, m10: 6, m15: 6,
};
// 単元ごとの 学年の目安（2026年11月12日。Claude の案・仮）。シリーズの中でも、むずかしい単元は あとの学年で ひらく（植木算は 4年 など）。
// 7＝中学の内容（算数などは 6年生で ひらく。漢検は 前の級が おわったら）。先生の画面「ロードマップ」で ドラッグして 変えられる
const UNIT_GRADE = (() => {
  const o = {}, set = (sid, gs) => gs.forEach((g, i) => o[`${sid}-${i + 1}`] = g);
  set('m1', [1, 1, 1, 1, 3, 4, 5, 6]); set('m2', [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3]); set('m3', [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3]);
  set('m4', Array(12).fill(2)); set('m5', [3, 3, 3, 3, 3, 3]); set('m6', [3, 3, 3, 4, 4, 4]); set('m7', [3, 3, 4, 4, 5, 5, 5]);
  set('m8', [3, 4, 5, 5, 5]); set('m9', [3, 4, 5, 5, 5]); set('m10', [6, 6, 6, 6, 6]); set('m11', [3, 4, 4, 4, 6, 6, 7, 7, 7]);
  set('m12', [4, 4, 5, 5, 5]); set('m13', [1, 1, 2, 2, 2, 3, 3, 3, 4, 5]); set('m14', [3, 5, 5, 5, 5, 6, 6, 6, 6, 7]);
  set('m15', [7, 7, 7, 7]); set('m16', [2, 2, 3, 5, 6]); set('m17', [4, 4, 5, 5, 5, 5, 5, 6, 6]);
  set('m18', [3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6]);   // ⑱ 図形（content_zukei.js）
  set('x0r', Array(7).fill(3)); set('x0x', [4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6]); set('x0k', [3, 3, 4, 4]); set('x0m', [3, 3, 3, 3, 4]);   // 情報モラルは 3年から（1年生には 早い。2026年11月13日 社長）
  set('x0p', [1, 1, 3, 3, 3, 4, 4, 5]); ['x1k', 'x1m', 'x1d'].forEach(s => set(s, Array(7).fill(3)));   // 社会は 3年から。そのあとは 学年で しばらない（2026年11月13日）
  // 詰将棋は オプションなので 学年で しばらない（2026年11月12日。どの学年も 1年から。シリーズの中の 順番だけ 守る）
  set('x2m', [1, 1, 2, 3]); set('x2l', [1, 1, 1, 2, 2]);
  ['x3e-e1', 'x3e-e2', 'x3e-e3', 'x3e-e4', 'x3e-e5'].forEach(u => o[u] = 3);   // 英語は 3年から（1年生には 早い。2026年11月13日 社長）
  Object.assign(o, { 'x3e-1': 3,'x3e-2': 3, 'x3e-3': 3, 'x3e-4': 3, 'x3e-5': 3, 'x3e-6': 3, 'x3e-7': 5, 'x3e-8': 5 });   // 英語：絵と ことば（e1〜e5）は 1年から、つづりは 3年から
  // 2026年11月15日 社長：ローマ字は 1〜2年で おぼえて、3年から タイピング。英語は 1年から（早いうちから やる）。
  //   英語：1年は えらぶだけ（アルファベット・絵と ことば）、つづりを 打つ「ことば（〜）」は 2年。パソコン：社長が ロードマップの 画面で ならべた とおり。
  //   ローマ字の 50音などは、ひらがなを 習った あと（1年の 後半）に やる（しくみでは しばらない。運用）
  Object.assign(o, { 'x3e-1': 1, 'x3e-e1': 1, 'x3e-e2': 1, 'x3e-e3': 1, 'x3e-e4': 1, 'x3e-e5': 1, 'x3e-2': 2, 'x3e-3': 2, 'x3e-4': 2, 'x3e-5': 2, 'x3e-6': 2,
    'x3e-9': 2, 'x3e-11': 2, 'x3e-13': 2, 'x3e-14': 2, 'x3e-16': 2, 'x3e-22': 2, 'x3e-25': 3, 'x3e-7': 3, 'x3e-8': 3, 'x3e-17': 3, 'x3e-19': 3,
    'x3e-10': 4, 'x3e-12': 4, 'x3e-18': 4, 'x3e-20': 4, 'x3e-21': 4, 'x3e-15': 5, 'x3e-23': 5, 'x3e-24': 5,
    'x0r-1': 1, 'x0r-2': 1, 'x0r-3': 1, 'x0r-6': 1, 'x0r-4': 2, 'x0r-5': 2, 'x0r-7': 2,
    'x0x-1': 2, 'x0x-2': 3, 'x0x-3': 4, 'x0x-6': 4, 'x0x-7': 4, 'x0x-4': 5, 'x0x-5': 5, 'x0x-8': 5, 'x0x-9': 6, 'x0x-10': 6, 'x0x-11': 6, 'x0x-12': 6, 'x0x-13': 6,
    'x0k-1': 2, 'x0k-2': 2, 'x0k-3': 3, 'x0k-4': 3,
    'x0p-1': 1, 'x0p-2': 1, 'x0p-3': 2, 'x0p-4': 2, 'x0p-5': 2, 'x0p-6': 3, 'x0p-7': 3, 'x0p-8': 3, 'x0p-9': 4, 'x0p-10': 4, 'x0p-11': 4 });
  return o;
})();
// オプションの科目（2026年11月12日）：おすすめに 出さない。すすみぐあいの いちばん 下に「オプション」として 出す
const OPTIONAL = new Set(['x4', 'x5']);   // x5＝国語おまけ「よめるかな？」（content_yomu.js）
const unitGradeDefault = u => UNIT_GRADE[u] ?? UNITS[u].grade ?? SERIES_GRADE[UNITS[u].series] ?? 1;   // UNITS[u].grade＝content_add.js で 足した 単元の 学年
const seriesById = id => SUBJECTS.flatMap(s => s.series).find(x => x.id === id);
const subjectOf = se => SUBJECTS.find(s => s.series.includes(se));
// シリーズの ならび：[{ u: 単元, g: 学年 }]（学年の 小さい順）。先生が 変えたものは Store の plan に のこる
function planOf(se) {
  const base = se.units.filter(u => !UNITS[u].extra), P = (Store.get().plan || {})[se.id];
  let list = P ? P.filter(x => base.includes(x.u)).map(x => ({ ...x })) : [];
  base.forEach(u => { if (!list.some(x => x.u === u)) list.push({ u, g: unitGradeDefault(u) }); });
  return list.map((x, i) => [x, i]).sort((a, b) => a[0].g - b[0].g || a[1] - b[1]).map(a => a[0]);
}
const realUnits = se => planOf(se).map(x => x.u);
const unitGrade = u => { const x = planOf(seriesById(UNITS[u].series)).find(x => x.u === u); return x ? x.g : 1; };
// その学年で ひらくか。漢検は 前の級が ぜんぶ おわっても ひらく。7（中学）は 算数などは 6年生で ひらく
// 先取り（2026年11月12日）：その科目で、いまの学年までの 単元が ぜんぶ 合格なら、次の学年の 単元が ひらく（順番は 守る）
// 中学の 単元（7＝中1、8＝中2、9＝中3。2026年11月14日）：中1は 6年生で ひらく。中2は 中1までが ぜんぶ 合格したら、中3は 中2までが ぜんぶ 合格したら ひらく
const EG = g => g <= 6 ? g : g - 1;
const _eff = new WeakMap();
function effGrade(subj, hist, grade) {
  let m = _eff.get(hist); if (!m) _eff.set(hist, m = new Map());
  const key = `${subj.id}:${grade}`; if (m.has(key)) return m.get(key);
  const us = subj.series.flatMap(realUnits).map(u => [u, EG(unitGrade(u))]);
  let g = grade;
  // 国語（漢検）と 算数は、その学年の「仕上げ」に 合格して はじめて 次の学年へ（2026年11月13日）
  // その学年までに 単元が 1つも ない 科目（社会は 4年から など）は、先取りで ひらかない
  while (g < 8 && us.some(([, x]) => x <= g) && us.filter(([, x]) => x <= g).every(([u]) => cleared(hist, u)) && (g > 6 || !FIN.subj.includes(subj.id) || finPassed(hist, g))) g++;
  m.set(key, g); return g;
}
// 漢検の「読み」の 先取り（2026年11月13日）：いまの 学年の 級までの 読みが ぜんぶ 合格なら、つぎの 級の 読みの 単元だけ 先に ひらく。
// 読みを 先に 知って いると、書きを 習う ときに 入りやすい。書きなどは いままでどおり。先取りは 1つ 上の 級まで（YOMI_AHEAD・仮）
const YOMI_AHEAD = 1;
const isYomi = u => UNITS[u] && UNITS[u].subject === 'kanken' && !UNITS[u].extra && /^読み/.test(String(UNITS[u].base || UNITS[u].name).replace(/\{([^|}]+)\|[^}]*\}/g, '$1'));
function yomiPre(u, hist, grade = me.grade) {
  if (!isYomi(u)) return false;
  const kk = SUBJECTS.find(s => s.id === 'kanken'), i = kk.series.indexOf(seriesById(UNITS[u].series)), cur = Math.min(grade, 6) - 1;   // k10 が 0（1年）
  if (i <= cur || i > cur + YOMI_AHEAD) return false;
  return kk.series.slice(0, i).every(s => realUnits(s).filter(isYomi).every(x => cleared(hist, x)));
}
function gradeOK(u, hist, grade = me.grade) {
  if (me && me.test) return true;   /* テスト用の アカウント：ぜんぶ ひらく */
  const g = unitGrade(u), se = seriesById(UNITS[u].series), subj = subjectOf(se);
  if (subj.id !== 'kanken') return effGrade(subj, hist, grade) >= EG(g);
  if (yomiPre(u, hist, grade)) return true;
  if (g <= 6 && grade >= g) return true;
  const i = subj.series.indexOf(se);
  if (!(i > 0 && realUnits(subj.series[i - 1]).every(x => cleared(hist, x)))) return false;
  for (let h = grade; h < Math.min(g, 7); h++) if (!finPassed(hist, h)) return false;   // 先の級へは、いまの学年からの 仕上げに 合格してから
  return true;
}
const gradeWhy = u => { const g = unitGrade(u), kk = subjectOf(seriesById(UNITS[u].series)).id === 'kanken';
  return g > 6 && kk ? R('{前|まえ}の {級|きゅう}が おわったら') : g > 7 ? R(`{中|ちゅう}${g - 7}の {単元|たんげん}が おわったら`) : `${Furigana.gradeLabel(Math.min(g, 6), me.grade)}から`; };
// 先生の調整（差し戻し・先に進める）：road[子ども][シリーズ] = { pos, at, by }。
// pos より前の単元は 合格あつかい。pos から後ろは、調整のあとに 合格したものだけ 合格あつかい
const roadAdj = kid => ((Store.get().road || {})[kid] || {});
function cleared(hist, u, kid = me.id) {
  const U = UNITS[u], o = roadAdj(kid)[U.series];
  if (!o) return hist.some(a => a.unit === u && a.passed);
  const us = realUnits(seriesById(U.series)), i = us.indexOf(u);
  // 先生が ならびを 変えても ずれないように、調整した 単元（u）で 位置を きめる（null＝ぜんぶ合格）
  let pos = o.pos; if ('u' in o) { const k = o.u === null ? us.length : us.indexOf(o.u); if (k >= 0) pos = k; }
  return i < pos || hist.some(a => a.unit === u && a.passed && a.at > o.at);
}
// ================= 学年ごとの スタート（2026年11月13日） =================
// 途中から 入った子は、その学年の スタートから はじめる。スタートより 前の 単元は 合格あつかい（やりたければ「前の 単元」から えらべる）。
// はじめの スタート＝国語（漢検）と 算数は、その シリーズで、その学年（か それより 上）の さいしょの 単元。ほかの 科目は はじめから。
// 先生が「ロードマップ」の 画面で 変えられる：Store の startDef[学年][シリーズ] = 単元（null＝ぜんぶ 合格あつかい）
function startOf(g, se) {
  const us = realUnits(se), D = (Store.get().startDef || {})[g] || {};
  if (se.id in D) { if (D[se.id] === null) return us.length; const k = us.indexOf(D[se.id]); if (k >= 0) return k; }
  if (!FIN.subj.includes(subjectOf(se).id)) return 0;   // とばすのは 国語（漢検）と 算数だけ。パソコン・社会・理科・音楽・英語・オプションは はじめから（先生が 変えられる）
  const i = planOf(se).findIndex(x => x.g >= g);
  return i < 0 ? us.length : i;
}
// その子の すすみぐあいを、g年の スタートに する。at を 空に して おくので、前に 合格した 単元は 合格の まま
function applyStart(kid, g, by) {
  const S = Store.get(); S.road = S.road || {}; const o = S.road[kid] = S.road[kid] || {};
  SUBJECTS.forEach(s => s.series.forEach(se => {
    const us = realUnits(se); if (!us.length) return;
    const pos = startOf(g, se);
    if (pos > 0) o[se.id] = { pos, u: us[pos] || null, at: '', by, start: g }; else delete o[se.id];
  }));
  Store.save();
}
function roadStart(kid) {
  const g = +$('#rs_g').value, c = Store.get().users.find(u => u.id === kid);
  if (!confirm(`${c.name} の すすみぐあいを「${g}年の スタート」に します。${g}年より 前の 単元は 合格あつかいに なります（やりたければ えらべます）。前に 合格した 記録と ルトは そのままです。`)) return;
  applyStart(kid, g, me.id); tKid = kid; showTeacher('child'); $('.roadadm').open = true;
}
// ================= 学年の「仕上げ」（2026年11月13日。数・ルト・合格ラインは 仮） =================
// 1〜6年。その学年までの 国語（漢検）と 算数の 単元が ぜんぶ 合格に なると ひらく。
// その学年の 単元から 50問（算数 30・国語 20）。合格すると 30ルト。合格すると、国語と 算数の 次の学年が ひらく
const FIN = { subj: ['math', 'kanken'], n: 50, math: 30, ruto: 30 };
const finId = g => `fin-${g}`;
const finPassed = (hist, g) => hist.some(a => a.unit === finId(g) && a.passed && !a.invalid);
const finNeed = g => FIN.subj.flatMap(id => SUBJECTS.find(s => s.id === id).series.flatMap(realUnits)).filter(u => unitGrade(u) <= g);
const finReady = (hist, g) => finNeed(g).every(u => cleared(hist, u));
function finMake(g) {
  const qKeys = new Set(), out = [];
  const okQ = q => q && !q.tap && !q.sound && !q.judge && !q.keys && !q.arrows;
  const take = (sid, n) => {
    const us = shuffle(SUBJECTS.find(s => s.id === sid).series.flatMap(realUnits).filter(u => unitGrade(u) === g));
    const got = [];
    for (let i = 0; us.length && got.length < n && i < n * 6; i++) {
      const u = us[i % us.length];
      try { const q = UNITS[u].make(new Set()).find(x => okQ(x) && !qKeys.has(qKey(x))); if (q) { qKeys.add(qKey(q)); got.push(q); } } catch (e) { /* 作れない単元は とばす */ }
    }
    return got;
  };
  return [...take('math', FIN.math), ...take('kanken', FIN.n - FIN.math)];   // 算数 → 国語の じゅん（答えの 入れ方が 行ったり来たり しないように）
}
for (let g = 1; g <= 6; g++) UNITS[finId(g)] = {
  id: finId(g), subject: 'fin', kind: 'fin', extra: true, grade: g, pass: 0.8, name: `${g}{年|ねん}の {仕上|しあ}げ`, make: () => finMake(g),
  lecture: [`${g}{年|ねん}の {算数|さんすう}と {国語|こくご}（{漢検|かんけん}）から、${FIN.n}{問|もん} {出|で}るよ。`,
    `8{割|わり}（${FIN.n * 0.8}{問|もん}）{正解|せいかい}で {合格|ごうかく}。{合格|ごうかく}すると ${FIN.ruto}ルト もらえて、{次|つぎ}の {学年|がくねん}の {単元|たんげん}が ひらくよ。`],
};
// 単元の 名前が かさならないように（2026年11月13日）：漢検は 級を 前に つける（10級 読み①）。まとめテスト・苦手まとめは【シリーズの 名前】を つける。
// もとの 名前は base に のこす（名前で 見分ける ところ：isYomi・review.js の KEXAM は base を 見る）
SUBJECTS.forEach(s => s.series.forEach(se => se.units.forEach(u => {
  const U = UNITS[u]; if (!U || U.base) return; U.base = U.name;
  if (U.extra) U.name = `${U.name}【${se.name}】`; else if (s.id === 'kanken') U.name = `${se.name} ${U.name}`;
})));
// それでも 同じ 名前が のこる 単元（社会の「関東」など）は、後ろに（シリーズの 名前）を つける
(() => { const n = {}; Object.values(UNITS).forEach(U => n[U.name] = (n[U.name] || 0) + 1);
  SUBJECTS.forEach(s => s.series.forEach(se => se.units.forEach(u => { const U = UNITS[u]; if (U && n[U.name] > 1) U.name = `${U.name}（${se.name}）`; }))); })();
// 仕上げの じょうたい：'done'・'now'・'lock'。いまの学年より 前の 仕上げは 出さない（null）
// 1日1回（2026年11月13日）：今日 もう やった（合格しなかった）ときは 'wait'
const finToday = (hist, g) => hist.some(a => a.unit === finId(g) && a.day === Store.today());
function finStep(g, hist, grade = me.grade) {
  if (g < grade) return null;
  if (finPassed(hist, g)) return 'done';
  if (!finReady(hist, g)) return 'lock';
  return finToday(hist, g) ? 'wait' : 'now';
}
// いま 目ざす 仕上げ（いちばん 下の まだの 学年）
function finCurrent(hist, grade = me.grade) {
  for (let g = grade; g <= 6; g++) { const s = finStep(g, hist, grade); if (s && s !== 'done') return { g, s }; }
  return null;
}

// シリーズが ひらくか：さいしょの 単元が その学年で ひらくか
function seriesOpen(se, hist, grade = me.grade) {
  const us = realUnits(se);
  return !us.length || us.some(u => cleared(hist, u)) || gradeOK(us[0], hist, grade);
}
// 単元の じょうたい：'done'（合格した）・'now'（いま やる）・'lock'（まだ）
function unitStep(u, hist) {
  const U = UNITS[u], se = SUBJECTS.flatMap(s => s.series).find(x => x.id === U.series);
  if (me && me.test) return se && !U.extra && U.kind !== 'fin' && cleared(hist, u) ? 'done' : 'now';   /* テスト用：順番も 学年も 関係なく ぜんぶ できる */
  if (U.kind === 'fin') { const s = finStep(U.grade, hist); return s === 'now' || s === 'done' ? s : 'lock'; }
  if (!se) return 'now';
  if (!seriesOpen(se, hist)) return 'lock';
  if (U.extra) return U.kind === 'weak' ? (Review.ready(se.id, hist) ? 'now' : 'lock') : realUnits(se).every(x => cleared(hist, x)) ? 'now' : 'lock';
  if (cleared(hist, u)) return 'done';
  if (!gradeOK(u, hist)) return 'lock';
  const R_ = realUnits(se), i = R_.indexOf(u);
  if (i <= 0 || cleared(hist, R_[i - 1])) return 'now';
  // 読みの 先取り：読みの 単元どうしの 順番だけ 守る
  if (yomiPre(u, hist)) { const ys = R_.filter(isYomi), j = ys.indexOf(u); return j <= 0 || cleared(hist, ys[j - 1]) ? 'now' : 'lock'; }
  return 'lock';
}
const canOpen = (u, hist) => unitStep(u, hist) !== 'lock' || assignPending(me.id, hist).some(a => a.unit === u);

function recommendations(hist) {
  const rec = [];
  // 苦手まとめ（試作品では、苦手な単元をもう一度）
  // おすすめの順（仕様書）：苦手まとめ → 苦手な単元 → 次の単元 → 復習 → まとめテスト
  // 1〜3年生は 計算（算数）を いちばん先に すすめる（2026年11月12日。基礎の 計算を しっかり）
  const subjOrder = me.grade <= 3 ? [...SUBJECTS].sort((a, b) => (b.id === 'math') - (a.id === 'math')) : SUBJECTS;
  if (me.label) subjOrder.sort((a, b) => (b.id === 'x7') - (a.id === 'x7'));   // 年長・年少の 子は ひらがな・カタカナを いちばん 先に おすすめ
  // オプションの科目（詰将棋）は おすすめに 出さない。やりたい子が「すすみぐあい」から えらぶ
  const series = subjOrder.filter(s => !OPTIONAL.has(s.id)).flatMap(s => s.series).filter(se => se.units.length);
  const real = se => se.units.filter(u => !UNITS[u].extra);
  series.forEach(se => { const id = `weak-${se.id}`; if (Review.ready(se.id, hist) && !Rules.unitState(hist, id).finished) rec.push({ unit: id, why: '{苦手|にがて}' }); });
  Rules.weakUnits(hist).filter(w => !UNITS[w.unit].extra && !OPTIONAL.has(subjectOf(seriesById(UNITS[w.unit].series))?.id) &&!Rules.unitState(hist, w.unit).finished).forEach(w => rec.push({ unit: w.unit, why: '{苦手|にがて}' }));
  for (const se of series) for (const u of real(se)) { const st = Rules.unitState(hist, u); if (!st.perfect && (st.tries || !cleared(hist, u))) rec.push({ unit: u, why: 'つぎの{単元|たんげん}' }); }   // 学年の スタートで とばした 単元（やって いない）は すすめない
  for (const se of series) for (const u of real(se)) { if (Rules.unitState(hist, u).reviewNext) rec.push({ unit: u, why: '{復習|ふくしゅう}' }); }
  series.forEach(se => { const id = `all-${se.id}`; if (real(se).every(u => Rules.unitState(hist, u).tries) && !Rules.unitState(hist, id).finished) rec.push({ unit: id, why: 'まとめ' }); });
  const f = finCurrent(hist); if (f && f.s === 'now') rec.unshift({ unit: finId(f.g), why: '{仕上|しあ}げ' });   // 学年の 仕上げが ひらいたら いちばん先に
  // 苦手まとめは 1つだけ 出す（同じ ような カードが ならばないように。2026年11月13日）
  const seen = new Set(); let weak = 0; return rec.filter(r => unitStep(r.unit, hist) !== 'lock' && !seen.has(r.unit) && seen.add(r.unit) && !(UNITS[r.unit].kind === 'weak' && weak++)).slice(0, 4);
}

function showTop() {
  const hist = Store.attemptsOf(me.id);
  const unitBtn = (u, why) => {
    const st = Rules.unitState(hist, u), U = UNITS[u];
    const tag = st.finished ? R('おしまい') : st.reviewNext ? R('あと1{回|かい}') : st.retake ? R('もう{一度|いちど}') : st.tries ? R(`さいこう ${st.best}{点|てん}`) : '';
    return `<button class="unit ${st.finished ? 'done' : ''} ${why === 'いま' ? 'now' : ''}" onclick="startUnit('${u}')">${why ? `<small>${R(why)}</small>` : ''}<span class="nm">${R(U.name)}</span><span class="tag">${tag}</span></button>`;
  };
  const hw = [...new Set(assignPending(me.id, hist).map(a => a.unit))];
  const rec = recommendations(hist).filter(r => !hw.includes(r.unit));
  app().innerHTML = header(`<button onclick="Typing.menu()">${R('タイピング')}</button><button onclick="showAccount()">${R('{口座|こうざ}')}</button>`) + `
  <main>
    ${todayDots()}
    ${hw.length ? `<h2>${R('{先生|せんせい}からの{宿題|しゅくだい}')}</h2><div class="units rec-sub">${hw.map(u => unitBtn(u, '{宿題|しゅくだい}')).join('')}</div>` : ''}
    <h2>${R('おすすめ')}</h2>
    ${rec.length ? `<div class="units rec-main">${unitBtn(rec[0].unit, rec[0].why)}</div>
    <div class="units rec-sub">${rec.slice(1).map(r => unitBtn(r.unit, r.why)).join('')}</div>` : R('ぜんぶ おしまい！')}
    <h2>${R('すすみぐあい')}</h2>
    <p class="note">${R('{合格|ごうかく}すると、{次|つぎ}の {単元|たんげん}が ひらくよ。{国語|こくご}と {算数|さんすう}は、その {学年|がくねん}の {単元|たんげん}が ぜんぶ {合格|ごうかく}に なると「{仕上|しあ}げ」が ひらくよ。{仕上|しあ}げに {合格|ごうかく}すると、{次|つぎ}の {学年|がくねん}へ すすめるよ。')}</p>
    ${finBox(hist, unitBtn)}
    ${SUBJECTS.filter(s => !OPTIONAL.has(s.id)).map(s => roadSubject(s, hist, unitBtn)).join('')}
    <h2>${R('オプション')} <small class="prog">${R('すきな ときに')}</small></h2>
    ${SUBJECTS.filter(s => OPTIONAL.has(s.id)).map(s => roadSubject(s, hist, unitBtn)).join('')}
  </main>`;
}
// 先生の画面（子どもごと）：シリーズごとに「いまの単元」を えらびなおす。前に もどす＝差し戻し、後ろ＝先に進める
function roadAdminHTML(kid) {
  const hist = Store.attemptsOf(kid), adj = roadAdj(kid), users = Store.get().users;
  const posOf = se => { const us = realUnits(se), i = us.findIndex(u => !cleared(hist, u, kid)); return i < 0 ? us.length : i; };
  return `<details class="roadadm"><summary>すすみぐあいの調整（差し戻し・先に進める）</summary>
    <p class="note">「いまの単元」を前にもどすと、そこから後ろは もう一度合格するまで「まだ」になります（差し戻し）。後ろにすると、そこより前は合格あつかいになります。ルトの記録は消えません。</p>
    <p><b>学年のスタートにする</b>（途中から入った子など）：<select id="rs_g">${[1, 2, 3, 4, 5, 6].map(g => `<option value="${g}" ${g === (users.find(u => u.id === kid) || {}).grade ? 'selected' : ''}>${g}年の スタート</option>`).join('')}</select>
      <button onclick="roadStart('${kid}')">この スタートに する</button> <span class="note">ぜんぶの シリーズを まとめて 変えます。スタートの 場所は「ロードマップ」タブで 決めます。</span></p>
    ${SUBJECTS.filter(s => s.series.some(se => se.units.length)).map(s => `<h3>${R(s.name)}</h3><table class="list"><tr><th>シリーズ</th><th>いまの単元</th><th>調整</th></tr>
      ${s.series.filter(se => se.units.length).map(se => { const us = realUnits(se), p = posOf(se), o = adj[se.id], by = o && users.find(u => u.id === o.by);
        return `<tr><td>${R(se.name)}</td><td><select onchange="roadSet('${kid}','${se.id}',+this.value,${p})">
          ${us.map((u, i) => `<option value="${i}" ${i === p ? 'selected' : ''}>${i + 1}. ${esc(UNITS[u].name.replace(/\{([^|}]+)\|[^}]*\}/g, '$1'))}</option>`).join('')}
          <option value="${us.length}" ${p === us.length ? 'selected' : ''}>（ぜんぶ合格）</option></select></td>
          <td>${o ? `<small>${o.start ? `${o.start}年の スタート` : `${o.at.slice(5, 10).replace('-', '/')} ${esc(by ? by.name : '')}が調整`}</small> <button onclick="roadClear('${kid}','${se.id}')">調整を消す</button>` : ''}</td></tr>`; }).join('')}</table>`).join('')}
    ${finAdminHTML(kid, hist)}
  </details>`;
}
// 先生が 学年の 仕上げを「合格」に する（2026年11月13日）。テストを うけなくても 次の学年が ひらく。
// ルトは 出さない（仮）。記録は attempts に kind:'teacher' で のこす（ルトの回・練習の 数には 入らない）
function finAdminHTML(kid, hist) {
  const c = Store.get().users.find(u => u.id === kid), users = Store.get().users;
  const rows = [];
  for (let g = c.grade; g <= 6; g++) {
    const t = hist.find(a => a.unit === finId(g) && a.kind === 'teacher'), by = t && users.find(u => u.id === t.by);
    const st = t ? `先生が合格にした（${t.day.slice(5).replace('-', '/')} ${esc(by ? by.name : '')}）` : finPassed(hist, g) ? 'テストで合格' : finReady(hist, g) ? 'テストを うけられる' : 'まだ ひらいていない';
    rows.push(`<tr><td>${g}年の 仕上げ</td><td>${st}</td><td>${t ? `<button onclick="finTeacher('${kid}',${g},false)">取り消す</button>` : finPassed(hist, g) ? '' : `<button onclick="finTeacher('${kid}',${g},true)">合格にする</button>`}</td></tr>`);
  }
  return `<h3>学年の仕上げ</h3><p class="note">「合格にする」と、仕上げの テストを 合格あつかいに します。その学年までの 国語・算数の 単元が ぜんぶ 合格なら、次の学年が ひらきます（単元を 先に 進めるときは、上の「調整」を 使う）。ルトは 出ません（仮）。</p>
    <table class="list"><tr><th>仕上げ</th><th>いま</th><th></th></tr>${rows.join('')}</table>`;
}
function finTeacher(kid, g, on) {
  const c = Store.get().users.find(u => u.id === kid);
  if (!confirm(on ? `${c.name} の ${g}年の 仕上げを 合格あつかいに します。` : `${g}年の 仕上げの「先生が合格にした」を 取り消します。`)) return;
  const S = Store.get();
  if (on) Store.addAttempt(kid, { unit: finId(g), day: Store.today(), at: new Date().toISOString(), kind: 'teacher', passed: true, perfect: false, score: 0, total: 0, ruto: 0, bonus: 0, invalid: null, notes: ['先生が合格にした'], questions: [], by: me.id });
  else { S.attempts = S.attempts.filter(a => !(a.child === kid && a.unit === finId(g) && a.kind === 'teacher')); Store.save(); }
  tKid = kid; showTeacher('child'); $('.roadadm').open = true;
}
function roadSet(kid, sid, pos, old) {
  const se = seriesById(sid), us = realUnits(se), nm = i => i >= us.length ? 'ぜんぶ合格' : UNITS[us[i]].name.replace(/\{([^|}]+)\|[^}]*\}/g, '$1');
  const msg = pos < old ? `差し戻します：「${nm(pos)}」からもう一度。後ろの単元は、合格するまで「まだ」になります。` : `先に進めます：「${nm(pos)}」から。前の単元は合格あつかいになります。`;
  if (!confirm(msg)) { tKid = kid; showTeacher('child'); $('.roadadm').open = true; return; }
  const S = Store.get(); S.road = S.road || {}; S.road[kid] = S.road[kid] || {};
  S.road[kid][sid] = { pos, u: us[pos] || null, at: new Date().toISOString(), by: me.id }; Store.save();
  tKid = kid; showTeacher('child'); $('.roadadm').open = true;
}
function roadClear(kid, sid) {
  if (!confirm('調整を消して、子どもの合格の記録どおりに もどします。')) return;
  const S = Store.get(); delete S.road[kid][sid]; Store.save();
  tKid = kid; showTeacher('child'); $('.roadadm').open = true;
}
// ================= 先生の画面「ロードマップ」：単元を ドラッグして、ひらく学年と 順番を 変える =================
// 行＝シリーズ、列＝学年。左から右へ ならんだ順が、その シリーズの 順番。シリーズを こえては 動かせない（保護者のページの らんが 変わるため）
// タブレットでも 使えるように、カードを おして えらび → 置きたい ところを おす、でも 動かせる
const PLAN_COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const gName = g => g > 6 ? `中${g - 6}` : `${g}年`;
let planPick = null, planSubj = 'math', planStartG = 0;   // planStartG：学年の スタートを 決める モード（0＝ふつう）
function planSetStart(g, sid, u) {
  const S = Store.get(); S.startDef = S.startDef || {}; S.startDef[g] = S.startDef[g] || {};
  if (u === undefined) delete S.startDef[g][sid]; else S.startDef[g][sid] = u;
  S.planLog = S.planLog || []; S.planLog.push({ at: new Date().toISOString(), by: me.id, what: `${g}年の スタート（${plainName(seriesById(sid).name)}）：${u === undefined ? 'はじめに もどした' : u === null ? 'ぜんぶ 合格あつかい' : plainName(UNITS[u].name)}` });
  Store.save(); showTeacher('plan');
}
const plainName = s => String(s).replace(/\{([^|}]+)\|[^}]*\}/g, '$1').replace(/\[\[([^|\]]+)(\|[^\]]*)?\]\]/g, '$1');
// 学年ごとの 単元の 数（ぜんぶの 科目。2026年11月15日）：多すぎる 学年が ないかを 見る ための 表。まとめテスト・苦手まとめは 数えない
function planTotals(subs) {
  const rows = subs.map(x => [plainName(x.name), PLAN_COLS.map(g => x.series.reduce((n, se) => n + planOf(se).filter(p => p.g === g).length, 0))]);
  const tot = PLAN_COLS.map((_, i) => rows.reduce((n, r) => n + r[1][i], 0));
  return `<details class="summary"><summary><b>学年ごとの 単元の 数（ぜんぶの 科目）</b>　${PLAN_COLS.map((g, i) => `${gName(g)} ${tot[i]}`).join('・')}</summary>
    <table class="list"><tr><th>科目</th>${PLAN_COLS.map(g => `<th>${gName(g)}</th>`).join('')}<th>計</th></tr>
    ${rows.map(([n, c]) => `<tr><td>${n}</td>${c.map(v => `<td>${v || ''}</td>`).join('')}<td>${c.reduce((a, b) => a + b, 0)}</td></tr>`).join('')}
    <tr><th>計</th>${tot.map(v => `<th>${v}</th>`).join('')}<th>${tot.reduce((a, b) => a + b, 0)}</th></tr></table>
    <p class="note">変えた ロードマップを Claude に 見せる とき：<button class="mini" onclick="planExport()">ロードマップを ファイルに 書き出す</button>（roadmap.json が ダウンロードの フォルダに できます。名前や 記録は 入りません）</p></details>`;
}
function planExport() {
  const S = Store.get(), d = { at: new Date().toISOString(), plan: S.plan || {}, startDef: S.startDef || {} };
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 1)], { type: 'application/json' })); a.download = 'roadmap.json'; a.click();
}
function planHTML() {
  const subs = SUBJECTS.filter(s => s.series.some(se => realUnits(se).length));
  const s = subs.find(x => x.id === planSubj) || subs[0], log = (Store.get().planLog || []).slice(-5).reverse(), users = Store.get().users;
  const colName = g => g === 7 ? (s.id === 'kanken' ? '前の級のあと' : '中1（6年で）') : g === 8 ? '中2（中1のあと）' : g === 9 ? '中3（中2のあと）' : `${g}年`;
  // 2026年11月14日 見直し：①やる ことを 2つに 分けた（単元を 動かす／学年の スタートを 決める）②シリーズは たたんで、学年ごとの 数だけ 見せる（おすと ひらく）
  // ③えらんだ 単元を ボタンで 動かせる（前の学年・後の学年・先に・後に）④学年の 見出しと シリーズの 名前は、スクロールしても 動かない ⑤単元を さがす ⑥学年ごとの 単元の 数
  const sers = s.series.filter(se => realUnits(se).length), q = planQ.trim();
  const nm = u => plainName(UNITS[u].base || UNITS[u].name), hit = u => q && nm(u).includes(q);
  const cntAll = PLAN_COLS.map(g => sers.reduce((n, se) => n + planOf(se).filter(x => x.g === g).length, 0));
  const pk = planPick && UNITS[planPick] && sers.some(se => se.id === UNITS[planPick].series) ? planPick : null;
  return `<div class="summary planmode"><b>なにを しますか</b>
      <button class="${planStartG ? '' : 'primary'}" onclick="planStartG=0;planPick=null;showTeacher('plan')">① 単元の 学年・順番を 変える</button>
      <span class="pgrp">② 学年の スタートを 決める：${[1, 2, 3, 4, 5, 6].map(g => `<button class="${planStartG === g ? 'primary' : ''}" onclick="planStartG=${g};planPick=null;showTeacher('plan')">${g}年</button>`).join('')}</span>
      ${planStartG ? `<p class="note">🚩＝${planStartG}年の スタート（途中から 入った子が はじめる 場所）。<b>カードを おすと、その シリーズの スタートが 変わります。</b>うすい カード＝スタートより 前（合格あつかい。子どもは「前の 単元」から えらべる）。はじめは 国語（漢検）と 算数が「その 学年の さいしょの 単元」、ほかの 科目は はじめから。</p>`
        : `<p class="note"><b>カードを おして えらぶ → 下に 出る ボタンで 動かす</b>（ドラッグでも 動かせます）。同じ シリーズの 中だけ 動かせます。左から 右の じゅんに ひらきます。学年の 目安は Claude の案（仮）。</p>`}</div>
    ${planTotals(subs)}
    <nav class="sub">${subs.map(x => `<button class="${x === s ? 'on' : ''}" onclick="planSubj='${x.id}';planPick=null;showTeacher('plan')">${R(x.name)}</button>`).join('')}</nav>
    <p class="plantools">さがす <input id="planq" value="${esc(planQ)}" placeholder="単元の 名前（Enter）" style="width:12em" onchange="planQ=this.value;showTeacher('plan')">${q ? ` <button class="mini" onclick="planQ='';showTeacher('plan')">けす</button>` : ''}
      <button class="mini" onclick="planOpen=new Set(${JSON.stringify(sers.map(se => se.id)).replace(/"/g, "'")});showTeacher('plan')">ぜんぶ ひらく</button> <button class="mini" onclick="planOpen=new Set();showTeacher('plan')">ぜんぶ とじる</button>
      <span class="note">シリーズの 名前を おすと、ひらく／とじる</span></p>
    <div class="planwrap"><table class="plan"><thead><tr><th>シリーズ</th>${PLAN_COLS.map((g, i) => `<th>${colName(g)}<br><small>${cntAll[i]}単元</small></th>`).join('')}</tr></thead>
    ${sers.map(se => { const P = planOf(se), changed = !!(Store.get().plan || {})[se.id];
      const sp = planStartG ? startOf(planStartG, se) : -1, sSet = planStartG && se.id in ((Store.get().startDef || {})[planStartG] || {});
      const open = planOpen.has(se.id) || P.some(x => hit(x.u)) || (pk && UNITS[pk].series === se.id);
      return `<tr class="${open ? 'open' : 'shut'}"><th><button class="pser" onclick="planOpen.has('${se.id}')?planOpen.delete('${se.id}'):planOpen.add('${se.id}');showTeacher('plan')">${open ? '▼' : '▶'} ${R(se.name)}</button> <small>${P.length}</small>${changed ? `<br><button class="mini" onclick="planReset('${se.id}')">はじめに もどす</button>` : ''}
        ${planStartG ? `<br><small>${sp >= P.length ? '🚩 ぜんぶ 合格あつかい' : sp === 0 ? '🚩 はじめから' : `🚩 ${sp + 1}番目から`}</small>${open && sp < P.length ? `<br><button class="mini" onclick="planSetStart(${planStartG},'${se.id}',null)">ぜんぶ 合格あつかいに</button>` : ''}${sSet ? `<br><button class="mini" onclick="planSetStart(${planStartG},'${se.id}')">スタートを はじめに もどす</button>` : ''}` : ''}</th>
      ${PLAN_COLS.map(g => { const L = P.filter(x => x.g === g);
        if (!open) return `<td class="pcell pc0" onclick="planOpen.add('${se.id}');showTeacher('plan')">${L.length ? `<span class="pcnt ${L.some(x => x.g !== unitGradeDefault(x.u)) ? 'moved' : ''}">${L.some(x => P.indexOf(x) === sp) ? '🚩 ' : ''}${L.length}</span>` : ''}</td>`;
        return `<td class="pcell" data-s="${se.id}" data-g="${g}" ondragover="planOver(event)" ondragleave="this.classList.remove('over')" ondrop="planDrop(event,'${se.id}',${g})" onclick="planTap(event,'${se.id}',${g})">
        ${L.map(x => `<div class="pcard ${pk === x.u ? 'pick' : ''} ${x.g !== unitGradeDefault(x.u) ? 'moved' : ''} ${P.indexOf(x) === sp ? 'startc' : ''} ${sp >= 0 && P.indexOf(x) < sp ? 'skipc' : ''} ${hit(x.u) ? 'hit' : ''}" draggable="true" data-u="${x.u}"
          ondragstart="event.dataTransfer.setData('text/plain','${x.u}');planPick='${x.u}'" onclick="planTap(event,'${se.id}',${g},'${x.u}')">${P.indexOf(x) === sp ? '🚩 ' : ''}${P.indexOf(x) + 1}. ${esc(nm(x.u))}</div>`).join('')}</td>`; }).join('')}</tr>`; }).join('')}
    </table></div>
    ${pk && !planStartG ? (() => { const P = planOf(seriesById(UNITS[pk].series)), x = P.find(y => y.u === pk), i = P.indexOf(x);
      return `<div class="planbar"><b>${i + 1}. ${esc(nm(pk))}</b>（いま ${gName(x.g)}）
        <button ${x.g <= 1 ? 'disabled' : ''} onclick="planNudge('g',-1)">◀ 前の 学年へ</button><button ${x.g >= 9 ? 'disabled' : ''} onclick="planNudge('g',1)">後の 学年へ ▶</button>
        <button ${i <= 0 || P[i - 1].g !== x.g ? 'disabled' : ''} onclick="planNudge('o',-1)">▲ 先に</button><button ${i >= P.length - 1 || P[i + 1].g !== x.g ? 'disabled' : ''} onclick="planNudge('o',1)">▼ 後に</button>
        <button onclick="planPick=null;showTeacher('plan')">えらぶのを やめる</button></div>`; })() : ''}
    <p class="note">色が ついた カード・数＝はじめの 学年から 動かした 単元。動かしても、子どもの 合格の 記録は 消えません（もう 合格した 単元は「おわった」の まま）。</p>
    ${log.length ? `<h3>さいきんの 変更</h3><table class="list">${log.map(l => { const b = users.find(u => u.id === l.by); return `<tr><td>${l.at.slice(5, 16).replace('T', ' ').replace('-', '/')}</td><td>${esc(b ? b.name : '')}</td><td>${esc(l.what)}</td></tr>`; }).join('')}</table>` : ''}`;
}
let planQ = '', planOpen = new Set();   // さがす ことば・ひらいて いる シリーズ
// えらんだ 単元を ボタンで 動かす：'g'＝学年（前・後）、'o'＝同じ 学年の 中の 順番（先・後）。動かした あとも えらんだ まま
function planNudge(kind, d) {
  const u = planPick; if (!u || !UNITS[u]) return;
  const sid = UNITS[u].series, P = planOf(seriesById(sid)), x = P.find(y => y.u === u), i = P.indexOf(x);
  if (kind === 'g') { const g = Math.min(9, Math.max(1, x.g + d)), first = P.find(y => y.g === g && y.u !== u); planMove(u, sid, g, d > 0 && first ? first.u : null); }   // 後の学年へ＝その学年の はじめ、前の学年へ＝その学年の おわり
  else if (d < 0) planMove(u, sid, x.g, P[i - 1].u);
  else { const nx = P[i + 2]; planMove(u, sid, x.g, nx && nx.g === x.g ? nx.u : null); }
  planPick = u; showTeacher('plan');
}
function planOver(e) { e.preventDefault(); e.currentTarget.classList.add('over'); }
function planDrop(e, sid, g) {
  e.preventDefault(); e.stopPropagation();
  const u = e.dataTransfer.getData('text/plain') || planPick, card = e.target.closest('.pcard');
  planMove(u, sid, g, card ? card.dataset.u : null);
}
function planTap(e, sid, g, onU) {
  e.stopPropagation();
  if (planStartG) { if (onU) planSetStart(planStartG, sid, onU); return; }   // スタートを 決める モード：おした カードが スタート
  if (!planPick || (onU && onU === planPick)) { planPick = onU && planPick !== onU ? onU : null; return showTeacher('plan'); }
  planMove(planPick, sid, g, onU || null);
}
// u を シリーズ sid の 学年 g へ。before が あれば その 前に 入れる
function planMove(u, sid, g, before) {
  planPick = null;
  if (!u || !UNITS[u]) return showTeacher('plan');
  if (UNITS[u].series !== sid) { alert('ちがう シリーズには 動かせません（保護者のページの らんが 変わるため）。'); return showTeacher('plan'); }
  const se = seriesById(sid), P = planOf(se), from = P.find(x => x.u === u), oldI = P.indexOf(from), oldG = from.g;
  if (before === u) return showTeacher('plan');
  P.splice(oldI, 1); from.g = g;
  let at = before ? P.findIndex(x => x.u === before) : -1;
  if (at < 0) { at = P.length; for (let i = 0; i < P.length; i++) if (P[i].g > g) { at = i; break; } }
  P.splice(at, 0, from);
  const S = Store.get(); S.plan = S.plan || {}; S.plan[sid] = P.map(x => ({ u: x.u, g: x.g }));
  const newI = planOf(se).findIndex(x => x.u === u);
  if (oldG !== g || oldI !== newI) {
    S.planLog = S.planLog || []; S.planLog.push({ at: new Date().toISOString(), by: me.id, what: `${plainName(UNITS[u].name)}：${oldG === g ? '' : `${gName(oldG)} → ${gName(g)}、`}${oldI + 1}番目 → ${newI + 1}番目` });
  }
  Store.save(); showTeacher('plan');
}
function planReset(sid) {
  if (!confirm('この シリーズの ならびを、はじめ（Claude の案）に もどします。')) return;
  const S = Store.get(); delete S.plan[sid];
  S.planLog = S.planLog || []; S.planLog.push({ at: new Date().toISOString(), by: me.id, what: `${plainName(seriesById(sid).name)}：はじめに もどした` });
  Store.save(); showTeacher('plan');
}

// 科目ごとの ロードマップ：おわった単元（たたむ）→ いまの単元 → 次の2つ（🔒）→ あと何こ
// 学年の 仕上げ：ひらいたら ボタン、まだなら「あと 何単元で ひらくか」
function finBox(hist, unitBtn) {
  const f = finCurrent(hist); if (!f) return '';
  const id = finId(f.g);
  if (f.s === 'now') return `<div class="series road fin"><h3>🏁 ${R(UNITS[id].name)} <small class="prog">${R(`${FIN.n}{問|もん}・{合格|ごうかく}で ${FIN.ruto}ルト`)}</small></h3><div class="units path">${unitBtn(id, 'いま')}</div></div>`;
  if (f.s === 'wait') return `<p class="soon fin">🏁 ${R(`${UNITS[id].name}：きょうは もう やったよ。あした また チャレンジしよう（1{日|にち} 1{回|かい}）`)}</p>`;
  const left = finNeed(f.g).filter(u => !cleared(hist, u)).length;
  return `<p class="soon fin">🏁 ${R(`${UNITS[id].name}：{国語|こくご}と {算数|さんすう}の のこり ${left}{単元|たんげん}で ひらくよ`)}</p>`;
}
// 科目ごとの ロードマップ。いまの 学年で できない（学年が まだの）単元・シリーズ・科目は 出さない（2026年11月13日）
function roadSubject(s, hist, unitBtn) {
  const vis = se => realUnits(se).filter(u => cleared(hist, u) || gradeOK(u, hist));
  const open = s.series.filter(se => se.units.length && seriesOpen(se, hist) && vis(se).length);
  if (!open.length) return '';
  // とばした 単元（学年の スタート・先生の「先に進める」で 合格あつかい。自分では 合格して いない）は、数に 入れない
  const skip = u => cleared(hist, u) && !hist.some(a => a.unit === u && a.passed);
  const all = open.flatMap(vis).filter(u => !skip(u)), done = all.filter(u => cleared(hist, u)).length;
  const cnt = (d, n) => R(`{合格|ごうかく} ${d}／${n}{単元|たんげん}`);
  const old = se => vis(se).every(skip);   // ぜんぶ とばした シリーズ（前の 学年の 分）は、下に まとめて たたむ
  const lockBtn = u => `<button class="unit lock" disabled><small>🔒 ${R('まだ')}</small><span class="nm">${R(UNITS[u].name)}</span></button>`;
  const road = se => {
    const us = vis(se), sk = us.filter(skip), d = us.filter(u => cleared(hist, u) && !skip(u)), nowU = us.filter(u => unitStep(u, hist) === 'now');
    const later = us.filter(u => unitStep(u, hist) === 'lock'), extras = se.units.filter(u => UNITS[u].extra && unitStep(u, hist) === 'now');
    return `<div class="series road"><h3>${R(se.name)} <small class="prog">${cnt(d.length, us.length - sk.length)}</small></h3>
      <div class="units path">
        ${sk.length ? `<details class="donebox"><summary>⏪ ${R(`{前|まえ}の {単元|たんげん} ${sk.length}（やっても いいよ）`)}</summary><div class="units">${sk.map(u => unitBtn(u)).join('')}</div></details>` : ''}
        ${d.length ? `<details class="donebox"><summary>✓ ${R('おわった')} ${d.length}</summary><div class="units">${d.map(u => unitBtn(u)).join('')}</div></details>` : ''}
        ${nowU.map(u => unitBtn(u, 'いま')).join('')}${extras.map(u => unitBtn(u)).join('')}
        ${later.slice(0, 2).map(lockBtn).join('')}
        ${later.length > 2 ? `<span class="more">${R(`あと ${later.length - 2}`)}</span>` : ''}
        ${!nowU.length && !later.length && d.length ? `<span class="fin">🎉 ${R(us.length < realUnits(se).length ? 'いまの {学年|がくねん}の ぶんは ぜんぶ {合格|ごうかく}！' : 'ぜんぶ {合格|ごうかく}！')}</span>` : ''}
      </div></div>`;
  };
  return `<details><summary>${R(s.name)} <small class="prog">${cnt(done, all.length)}</small></summary>
    ${open.filter(se => !old(se)).map(road).join('')}
    ${open.some(old) ? `<details class="donebox oldser"><summary>⏪ ${R(`{前|まえ}の {学年|がくねん}の まとまり ${open.filter(old).length}（やっても いいよ）`)}</summary>${open.filter(old).map(road).join('')}</details>` : ''}</details>`;
}

// ================= 単元：講義 → 10問 → 答え合わせ → 直す → 結果 =================
let cur = null;
function startUnit(id) {
  const hist = Store.attemptsOf(me.id), st = Rules.unitState(hist, id);
  if (me.role === 'child' && UNITS[id].kind === 'fin' && finToday(hist, UNITS[id].grade)) { alert('しあげは 1日 1かい だよ。あした また チャレンジしよう'); return showTop(); }
  if (me.role === 'child' && !canOpen(id, hist)) { alert('この たんげんは まだ ひらいていないよ'); return showTop(); }   // 宿題に 出た単元は ひらく
  const last = hist.filter(a => a.unit === id).pop();
  const avoid = new Set(last ? last.questions.map(qKey) : []);
  const prevKey = last && last.questions.length ? qKey(last.questions[last.questions.length - 1]) : null;
  // 漢検の形の まとめテストは 大問の じゅんばんを くずさない（並べかえない・1回だけ 作る）
  const qs = UNITS[id].exam ? UNITS[id].make() : spread(pickAvoid(id, avoid), prevKey);
  // 仕上げは 1日の ルトの回数に 数えない（1日1回だけ。合格したら もう ひらかない）
  const willPractice = UNITS[id].kind === 'fin' ? false : UNITS[id].subject === 'x4' || st.finished || Rules.rutoCountOn(hist, Store.today()) >= Rules.capFor(holiday());
  cur = { unit: UNITS[id], st, qs, i: 0, page: 0, practice: willPractice, input: [], checked: UNITS[id].kind === 'fin' || !!UNITS[id].exam };   // 仕上げは 確認の 1問なし
  cur.lec = lecturePages(UNITS[id], qs);
  showLecture(st.tries === 0 || st.retake);
}
// 講義のページ：単元の講義 ＋ その単元の問題を つかった「例題」（答えつき）。
// 答え方の説明（さいごの ページ）が あれば、例題は その前に 入れる
const HOWTO = /テンキー|Enter|いれよう|おそう|ボタン|ドラッグ|マウスで|おしたまま|\{打\|う\}とう|スペースキー/;
function lecturePages(u, qs) {
  const L = (u.lecture || []).slice();
  let ex = '';
  try { ex = exampleHTML(u, qs); } catch (e) { console.warn('例題を作れなかった', u.id, e); }
  if (!ex) return L;
  const at = L.length > 1 && HOWTO.test(L[L.length - 1]) ? L.length - 1 : L.length;
  L.splice(at, 0, ex);
  return L;
}
function exampleHTML(u, qs) {
  if (u.kind) return '';                                    // まとめテスト・苦手まとめは なし
  const keys = new Set(qs.map(qKey));
  let q = null;
  for (let k = 0; k < 6 && !q; k++) { const c = u.make(new Set()).find(x => !keys.has(qKey(x))); if (c) q = c; }
  if (!q) q = u.make(new Set())[0];
  if (!q) return '';
  // リズムを打つ問題：答えの 数は プログラムの ための もの（子どもには 意味が ない）ので 出さない（2026年11月15日 社長の 指摘）
  if (q.tap) return `<span class="lh ex">{例題|れいだい}</span>この {単元|たんげん}の {問題|もんだい}は、こんな {形|かたち}だよ。
    <div class="q ex lbox" style="pointer-events:none;margin:10px 0;font-size:1.05em;text-align:center">${q.text}</div>
    <p class="hint" style="font-size:1.15em;text-align:center;margin:4px 0">「スタート」を おして、{音符|おんぷ}の リズムに {合|あ}わせて「タン」を おそう。</p>`;
  let a = ansText(u.id, q.answer.map(String), q.boxes);
  if (/[一-鿿]/.test(a) && q.boxes[0] !== 'マス') a = `[[${a}]]`;                   // 県の名前など（ふりがなの しくみで 線つきに なる）
  const snd = q.sound ? `<p class="note">（{音|おと}が {出|で}る {問題|もんだい}だよ。{問題|もんだい}の ときに「きく」ボタンで {聞|き}けるよ）</p>` : '';
  return `<span class="lh ex">{例題|れいだい}</span>この {単元|たんげん}の {問題|もんだい}は、こんな {形|かたち}だよ。
    <div class="q ex lbox" style="pointer-events:none;margin:10px 0;font-size:1.05em;text-align:center">${q.text}</div>${snd}
    ${typeof Steps === 'object' ? Steps.html(u.id, q) : ''}
    <p class="hint" style="font-size:1.15em;text-align:center;margin:4px 0">こたえ：<b${a.length > 14 ? '' : ' class="big"'}>${a}</b></p>`;
}
// 問題の見分け方：key（えらぶ問題は、答えの順番が変わっても同じ key）。古い記録は key がないので文で
const qKey = q => q.key || q.text;
function pickAvoid(id, avoid) {
  // 前の回と同じ問題が なるべく出ないようにする（何回か作って、かさなりが いちばん少ないものを使う）
  let best = null, bs = Infinity;
  for (let k = 0; k < 12; k++) { const qs = UNITS[id].make(new Set()), s = qs.filter(q => avoid.has(qKey(q))).length; if (s < bs) { best = qs; bs = s; } if (!s) break; }
  return best;
}
// 同じ問題を となりどうしに しない。前の回の さいごの問題と、今回の 1問目も ちがう問題に する
function spread(qs, prevKey) {
  const a = qs.slice(), same = (i, x) => i === 0 ? prevKey && qKey(x) === prevKey : qKey(x) === qKey(a[i - 1]);
  for (let i = 0; i < a.length; i++) {
    if (!same(i, a[i])) continue;
    let done = false;
    for (let j = i + 1; j < a.length && !done; j++) if (qKey(a[j]) !== qKey(a[i]) && !same(i, a[j])) { [a[i], a[j]] = [a[j], a[i]]; done = true; }
    // うしろに いれかえる 問題が ないとき（さいごの ほう）：前の ほうの 問題と いれかえる
    const fits = (k, x) => (k === 0 ? !(prevKey && qKey(x) === prevKey) : qKey(x) !== qKey(a[k - 1])) && (k === a.length - 1 || qKey(x) !== qKey(a[k + 1]));
    for (let k = 0; k < i - 1 && !done; k++) { const x = a[k], y = a[i]; if (fits(i, x) && (a[i] = x, a[k] = y, fits(k, y))) done = true; else { a[i] = y; a[k] = x; } }
  }
  return a;
}

function unitHeader() {
  return `<header><span>${R(cur.unit.name)}</span>
    <span>${cur.unit.subject === 'x4' ? R('<b class="practice">ルトなしの {単元|たんげん}</b>') : cur.practice ? R('<b class="practice">{練習|れんしゅう}（ルトなし）</b>') : cur.st.retake ? R('{再受講|さいじゅこう}') : ''}</span>
    <button onclick="showTop()">${R('やめる')}</button></header>`;
}

// 講義（初めて・再受講のときは講義から。2回目からは「講義を見る」で見られる）
function showLecture(must) {
  const L = cur.lec || cur.unit.lecture;
  if (!must && cur.page === 0 && !cur.viewing) {
    app().innerHTML = unitHeader() + `<main class="center">
      <button class="big primary" onclick="startQuiz()">${R(`${cur.qs.length}{問|もん} はじめる`)}</button>
      <button onclick="cur.viewing=true;showLecture(true)">${R('{講義|こうぎ}を {見|み}る')}</button></main>`;
    return;
  }
  const p = cur.page;
  if (p >= L.length) {
    if (cur.st.retake && !cur.checked) return showCheck();
    return startQuiz();
  }
  // ページの しゅるいの ふだ：ページの はじめに .lh が あれば それを 上に出す。なければ 場所で きめる
  let body = L[p], tag = '';
  const m = body.match(/^\s*(<span class="lh[^"]*">[\s\S]*?<\/span>)(\s*<br>)?/);
  if (m) { tag = m[1]; body = body.slice(m[0].length); }
  else if (p === 0) tag = '<span class="lh st">きょう まなぶ こと</span>';
  else if (p === L.length - 1 && HOWTO.test(body)) tag = '<span class="lh how">こたえかた</span>';
  else tag = '<span class="lh">せつめい</span>';
  body = body.replace(/class="lh( [^"]*)?"/g, (_, c) => `class="lsec${c || ''}"`);   // ページの とちゅうの ふだは 見出しに
  const last = p === L.length - 1;
  // 文が みじかい ページは、大きな 字で まん中に（ページ ぜんたいを つかう）
  const short = !/<(svg|table|div|ol)/.test(body) && body.replace(/\{([^|}]+)\|[^}]*\}/g, '$1').replace(/<[^>]+>/g, '').replace(/\s+/g, '').length < 70;
  app().innerHTML = unitHeader() + `<main class="lecture">
    <div class="page"><div class="ptop">${R(tag)}</div><div class="pc${short ? ' short' : ''}"><div>${R(body)}</div></div></div>
    <div class="nav">${p > 0 ? `<button onclick="cur.page--;showLecture(true)">${R('まえ')}</button>` : '<span></span>'}
    <span class="pdots">${L.map((_, i) => `<i class="${i === p ? 'on' : ''}"></i>`).join('')}</span>
    <button class="primary" onclick="cur.page++;showLecture(true)">${last ? R(cur.st.retake && !cur.checked ? '{確認|かくにん}の 1{問|もん}へ' : `${cur.qs.length}{問|もん} はじめる`) : R('つぎ')}</button></div></main>`;
}

// 再受講のときの、講義の確認問題（正解すると10問に進める）
function showCheck() {
  if (hasSound() && !cur.phonesOk) return showPhones(showCheck);
  const q = cur.unit.make(new Set())[0];
  cur.checkQ = q; cur.redraw = showCheck;
  app().innerHTML = unitHeader() + `<main class="center"><p>${R('{確認|かくにん}の 1{問|もん}')}</p>${questionHTML(q)}<p class="msg" id="cmsg"></p></main>`;
  bindInput(q, ans => {
    if (isRight(q, ans)) { cur.checked = true; startQuiz(); }
    else { $('#cmsg').innerHTML = R('ちがうよ。{講義|こうぎ}を もう{一度|いちど} {見|み}よう。'); setTimeout(() => { cur.page = 0; showLecture(true); }, 1500); }
  });
}

// 音が出る問題（音楽の「聞く」・リズムを打つ）の前に、ヘッドホンを つける ページを 出す（1回の 単元で 1回だけ）
// q.tap は 地図の問題（答えの箱を かくす ため）にも ついているので、リズム（tap.p が ある）だけを 音の問題と する
const hasSound = () => cur.qs.some(q => q.sound || (q.tap && q.tap.p));
function showPhones(next) {
  cur.afterPhones = next;
  app().innerHTML = unitHeader() + `<main class="lecture"><div class="page"><div class="ptop"><span class="lh how">${R('{始|はじ}める {前|まえ}に')}</span></div>
    <div class="pc short"><div>
      <div style="font-size:3.2em;line-height:1.2">🎧</div>
      <b>${R('ヘッドホンを つけよう')}</b>
      <p style="font-size:.7em;line-height:1.9;margin:10px auto;max-width:34em;text-align:left">${R('この {単元|たんげん}は {音|おと}が {出|で}る {問題|もんだい}だよ。<br>ヘッドホンを つけると、{音|おと}が よく {聞|き}こえて、まわりの {人|ひと}の じゃまにも ならないよ。<br>つけたら「{音|おと}を ためす」を おして、{聞|き}こえるか たしかめよう。{大|おお}きすぎる ときは、{音|おと}を {小|ちい}さく してね。')}</p>
      <p style="font-size:.7em"><button class="big" onclick="window.Snd&&Snd.play([[523,.5],[659,.5],[784,1]])">▶ ${R('{音|おと}を ためす')}</button>
      <button class="big primary" onclick="cur.phonesOk=true;cur.afterPhones()">${R('つけた！ はじめる')}</button></p>
    </div></div></div></main>`;
}
function startQuiz() { if (hasSound() && !cur.phonesOk) return showPhones(startQuiz); cur.i = 0; cur.answers = []; cur.shownAt = Date.now(); showQuestion(); }

const LAB_AFTER = new Set(['市', '時', '分', '秒', '時間', '画']);
// 画面の ボタンで 答えを 入れる（タブレット・スマホ用。2026年11月13日）。指で さわる 画面では はじめから on。「⌨」で 切りかえ（その ブラウザで おぼえる）
const padOn = () => { try { const v = localStorage.getItem('root-pad'); if (v !== null) return v === '1'; } catch (e) { /* 使えないときは 下へ */ } return matchMedia('(pointer: coarse)').matches; };
function padToggle() { try { localStorage.setItem('root-pad', padOn() ? '0' : '1'); } catch (e) { /* そのまま */ } if (cur && cur.redraw) cur.redraw(); }
const padKeys = (rows, cls) => `<div class="pad ${cls}">${rows.map(r => `<div>${r.map(c => `<button tabindex="-1" data-k="${c}"${c.length > 1 || c === ' ' ? ' class="wide"' : ''}>${{ '-': '−', ' ': 'あける', BS: 'けす', EN: 'つぎ' }[c] || c}</button>`).join('')}</div>`).join('')}</div>`;
const numPad = () => padKeys([[...'789'], [...'456'], [...'123'], [...'0.-'], ['BS', 'EN']], 'npad');
const abcPad = () => padKeys([[...'qwertyuiop'], [...'asdfghjkl'], [...'zxcvbnm'], [' ', '-', '.', 'BS']], 'abc');
// ひらがなの 問題を スマホ・タブレットの キーボード（フリック・テンキー）で 入れる（2026年11月15日）。
// 指で さわる 画面だけ。3年生から はじめは この 形（1〜2年は 画面の あいうえお ボタン：仮）。「⌨」で 切りかえ（その ブラウザで おぼえる）
const isTouch = () => matchMedia('(pointer: coarse)').matches;
const kanaNative = () => { if (!isTouch()) return false; try { const v = localStorage.getItem('root-kana'); if (v) return v === 'native'; } catch (e) { /* 下へ */ } return me.grade >= 3; };
function kanaToggle() { try { localStorage.setItem('root-kana', kanaNative() ? 'pad' : 'native'); } catch (e) { /* そのまま */ } if (cur && cur.redraw) cur.redraw(); }
const useKanaButtons = () => !kanaNative() && (me.grade <= 2 || padOn()); // 3年生の3月まではボタン（試作品は学年で分ける：仮）。画面の ボタンが on の ときは どの 学年も ボタン
const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
function questionHTML(q) {
  // 箱は readonly：日本語入力（IME）がオンでも変換されないよう、押したキーをプログラムで読む
  // 箱の名前：「市」「時」「分」などは 箱の 右（あおもり 市・3 時 20 分）。「あまり」「分子」などは 箱の 左
  // スマホの キーボードで 入れる ときだけ、箱を ふつうの 入力に する（readonly に しない）
  const native = q.kana && kanaNative();
  const boxes = q.boxes.map((lab, k) => { const l = lab ? `<span class="lab">${R(lab)}</span>` : '', after = lab && LAB_AFTER.has(lab.replace(/\{([^|}]+)\|[^}]*\}/g, '$1'));
    return `<span class="ab">${after ? '' : l}<input class="ans ${q.kana || q.latin || q.keys || q.arrows ? 'kana' : 'num'}" data-k="${k}" autocomplete="off" ${native ? `lang="ja" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="${k < q.boxes.length - 1 ? 'next' : 'done'}"` : 'readonly'}>${after ? l : ''}</span>`; }).join('');
  // 音を聞く問題：出したときに1回鳴らし、「きく」ボタンで何回でも（content_more.js の Snd）
  if (q.tap && window.Snd) Snd.tapQ = q.tap;   // リズムを打つ問題
  if (q.sound && window.Snd) { Snd.cur = q.sound; Snd.metro = !!q.metro; setTimeout(() => Snd.play(q.sound, undefined, q.metro), 300); }
  const play = q.sound ? `<p><button class="play" tabindex="-1" onmousedown="event.preventDefault()" onclick="Snd.play(Snd.cur, undefined, Snd.metro)">▶ きく</button></p>` : '';
  // リズムを打つ問題は、答えの箱とボタンを かくす（打ったあと、プログラムが入れて答える）
  if (q.tap) return `<div class="q">${R(q.text)} <span style="display:none">${boxes}</span></div><button class="primary" id="ok" style="display:none"></button>`;
  return `${play}<div class="q">${R(q.text)} ${boxes}</div>
    ${native ? `<p class="note">${R('{箱|はこ}を さわって、ひらがなで {入|い}れてね（{漢字|かんじ}に しない）')}</p>` : ''}
    ${q.kana && !native && !useKanaButtons() ? `<p class="note">${R('ローマ{字|じ}で {打|う}つと ひらがなに なるよ')}</p>` : ''}
    ${q.kana && useKanaButtons() ? kanaPad() : ''}
    ${padOn() && !q.kana ? (q.keys ? `<p class="note">${R('この {問題|もんだい}は キーボードで {打|う}つ {練習|れんしゅう}だよ（{画面|がめん}の ボタンは ないよ）')}</p>` : q.arrows ? '' : q.latin ? abcPad() : numPad()) : ''}
    <button class="primary" id="ok">${R('こたえる')}${padOn() ? '' : '（Enter）'}</button>
    <p class="msg" id="qmsg"></p>
    <p>${q.kana && isTouch() ? `<button class="mini padtg" tabindex="-1" onclick="kanaToggle()">⌨ ${R(native ? '{画面|がめん}の あいうえお ボタンで {入|い}れる' : 'スマホの キーボードで {入|い}れる')}</button>`
      : `<button class="mini padtg" tabindex="-1" onclick="padToggle()">⌨ ${R(padOn() ? '{画面|がめん}の ボタンを かくす' : '{画面|がめん}の ボタンで {入|い}れる')}</button>`}</p>`;
}
function kanaPad() {
  return `<div class="pad">${Kana.ROWS.map(r => `<div>${[...r].map(c => c === ' ' ? '<span></span>' : `<button tabindex="-1" data-c="${c}">${c}</button>`).join('')}</div>`).join('')}
    <div><button data-c="゛">゛</button><button data-c="゜">゜</button><button data-c="⌫" class="wide">けす</button></div></div>`;
}
// 算数は数として同じなら正解（1.50 と 1.5 など）。漢検などの文字は完全に同じとき
function isRight(q, ans) {
  return q.answer.every((a, k) => {
    const s = String(ans[k]).trim();
    if (q.keys) return String(a) === s; // キーボード：大文字・小文字も そのまま
    if (q.judge) return q.judge(s);     // プログラミング（ロボット）：命令を動かして確かめる（道は何とおりでもよい）
    if (q.latin) { const n = s.toLowerCase().replace(/\s+/g, ' '); return (q.roma && Kana.finish(n) === q.roma) || [a, ...(q.alts || [])].some(x => String(x).toLowerCase() === n); }
    if (!q.kana && s !== '' && !isNaN(Number(s)) && !isNaN(Number(a))) return Number(s) === Number(a);
    if (q.kana) return toHira(String(a)) === toHira(s).replace(/\s+/g, ''); // スマホで カタカナに なっても 同じに あつかう
    return String(a) === s;
  });
}

// 入れ方：Enterで次の箱へ、最後の箱でEnterを押すと答える
function bindInput(q, done) {
  const ins = [...document.querySelectorAll('.ans')];
  const native = q.kana && kanaNative();
  const romaji = q.kana && !native && !useKanaButtons();
  let active = 0;
  const focus = k => { active = k; ins.forEach((el, j) => el.classList.toggle('active', j === k)); ins[k].focus(); };
  ins.forEach((el, k) => { el.dataset.raw = ''; el.onfocus = () => focus(k); });
  focus(0);
  const show = el => { if (romaji) { const r = Kana.toHira(el.dataset.raw); el.value = r.kana + r.rest; } else el.value = el.dataset.raw; };
  const read = () => ins.map(el => q.kana ? (romaji ? Kana.finish(el.dataset.raw) : el.value.trim()) : el.dataset.raw);
  const submit = () => { const a = read(); if (a.some(x => x === '')) { focus(a.findIndex(x => x === '')); const m = $('#qmsg'); if (m) m.innerHTML = R('こたえを {入|い}れてね'); return; } done(a); };

  // e.code（キーの場所）で読むので、IMEがオン・オフどちらでも同じに動く
  document.onkeydown = e => {
    if (!document.body.contains(ins[0])) { document.onkeydown = null; return; }
    const el = ins[active], c = e.code;
    // スマホの キーボード：文字は そのまま 入れさせ、変換中で ない Enter（つぎ・完了）だけ 読む
    if (native) { if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); if (active < ins.length - 1) focus(active + 1); else submit(); } return; }
    if (c === 'Enter' || c === 'NumpadEnter') { e.preventDefault(); if (active < ins.length - 1) focus(active + 1); else submit(); return; }
    if (c === 'Backspace') { e.preventDefault(); if (q.kana && !romaji) el.value = el.value.slice(0, -1); else { el.dataset.raw = el.dataset.raw.slice(0, -1); show(el); } return; }
    // キーボードの単元：e.key（出た文字）で読む。Ctrl＋文字は「Ctrl+C」として入れる
    if (q.keys) {
      if (e.key === 'Process' || e.isComposing) { e.preventDefault(); el.placeholder = '「半角/全角」キーを 1回 おしてね'; return; }
      if ((e.ctrlKey || e.metaKey) && /^Key[A-Z]$/.test(c)) { e.preventDefault(); el.dataset.raw = 'Ctrl+' + c.slice(3); show(el); return; }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); el.dataset.raw += e.key; show(el); }
      return;
    }
    // プログラミング（ロボット）：矢印キーで ↑↓←→ を入れる
    if (q.arrows) { const A = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' }; if (A[c]) { e.preventDefault(); el.dataset.raw += A[c]; show(el); } return; }
    let ch = null;
    if (q.latin) { const m = c.match(/^Key([A-Z])$/); if (m) ch = m[1].toLowerCase(); else if (c === 'Space') ch = ' '; else if (c === 'Minus') ch = '-'; else if (c === 'Period') ch = '.'; }
    else if (q.kana) { if (romaji) { const m = c.match(/^Key([A-Z])$/); if (m) ch = m[1].toLowerCase(); else if (c === 'Minus') ch = '-'; } }
    else { const m = c.match(/^(?:Digit|Numpad)([0-9])$/); if (m) ch = m[1]; else if (c === 'Period' || c === 'NumpadDecimal') ch = '.'; else if (c === 'Minus' || c === 'NumpadSubtract') ch = '-'; }
    if (ch !== null) { e.preventDefault(); el.dataset.raw += ch; show(el); }
  };
  document.querySelectorAll('.pad button').forEach(b => b.onmousedown = e => e.preventDefault()); // 入れる箱からフォーカスをはなさない
  document.querySelectorAll('.pad button').forEach(b => b.onclick = () => {
    // 数字・アルファベットの ボタン：キーを おしたのと 同じに する
    const k = b.dataset.k;
    if (k !== undefined) { const code = k === 'BS' ? 'Backspace' : k === 'EN' ? 'Enter' : k === '.' ? 'Period' : k === '-' ? 'Minus' : k === ' ' ? 'Space' : /\d/.test(k) ? 'Digit' + k : 'Key' + k.toUpperCase(); if (document.onkeydown) document.onkeydown({ code, key: k, preventDefault() {} }); return; }
    const el = ins[active], c = b.dataset.c, v = el.value, lastC = v.slice(-1);
    if (c === '⌫') el.value = v.slice(0, -1);
    else if (c === '゛') el.value = v.slice(0, -1) + (Kana.DAKU[lastC] || lastC);
    else if (c === '゜') el.value = v.slice(0, -1) + (Kana.HANDAKU[lastC] || lastC);
    else el.value = v + c;
  });
  $('#ok').onclick = submit;
}

function showQuestion() {
  const q = cur.qs[cur.i]; cur.redraw = showQuestion;
  app().innerHTML = unitHeader() + `<main class="center"><p class="count">${q.sec ? R(`【${q.sec}】 `) : ''}${cur.i + 1} / ${cur.qs.length}</p>${questionHTML(q)}</main>`;
  cur.shownAt = Date.now();
  bindInput(q, ans => {
    cur.answers.push({ key: q.key, text: q.text, boxes: q.boxes, first: ans, correct: q.answer, ok: isRight(q, ans), fixed: false, ms: Date.now() - cur.shownAt, ...(q.pts ? { pts: q.pts, sec: q.sec } : {}) });
    cur.i++;
    if (cur.i < cur.qs.length) showQuestion(); else grade();
  });
}

// 答え合わせ（点数は直す前の最初の答えで数える）→ ルトを決めて記録する
function grade() {
  document.onkeydown = null;
  const hist = Store.attemptsOf(me.id);
  let r = Rules.judge({ history: hist, unit: cur.unit, qs: cur.answers, day: Store.today(), holiday: holiday() });
  r = Object.assign(r, { at: new Date().toISOString(), questions: cur.answers });
  cur.result = Store.addAttempt(me.id, r);
  const fmt = (a, x) => ansText(cur.unit.id, a, x.boxes);
  // 正しい 答え：このあと「なおす」が ない 回（合格に 届かなかった 回 など）は、表に 出す（2026年11月13日）。なおす 回は、自分で なおしてから（2回 まちがえると 出る）
  // 1回目の 不合格では 出さない（講義から もう一度）。同じ 単元で 2回 つづけて 不合格に なったら 出す（2026年11月13日 社長）
  const needFix = cur.unit.kind === 'fin' ? !r.passed && !r.perfect : r.passed && !r.perfect, showAns = !needFix && !r.passed && cur.st.failStreak >= 1;
  app().innerHTML = unitHeader() + `<main>
    <h2>${R('こたえあわせ')}：${r.score} / ${r.total}</h2>
    <table class="check"><tr><th></th><th>${R('{問題|もんだい}')}</th><th>${R('きみの {答|こた}え')}</th><th></th>${showAns ? `<th>${R('{正|ただ}しい {答|こた}え')}</th>` : ''}</tr>
    ${cur.answers.map((a, k) => `<tr><td>${k + 1}</td><td>${R(noBtn(a.text))}</td><td>${fmt(a.first, a)}</td><td class="${a.ok ? 'ok' : 'ng'}">${a.ok ? '○' : '×'}</td>${showAns ? `<td class="hint"><b>${a.ok ? '' : fmt(a.correct.map(String), a)}</b></td>` : ''}</tr>`).join('')}</table>
    <div class="center">${cur.unit.kind === 'fin' ? (r.passed ? '' : `<p>${R('まちがえた {問題|もんだい}を なおそう')}</p>`) : ''}${needFix ? `<button class="primary big" onclick="startFix()">${R('まちがえた{問題|もんだい}を なおす')}</button>`
      : `<button class="primary big" onclick="showResult()">${R('つぎへ')}</button>`}</div></main>`;
}

// 合格ラインをこえたとき：まちがえた問題をその場で直し、満点になるまで
function startFix() { cur.fix = cur.answers.map((a, k) => a.ok ? -1 : k).filter(k => k >= 0); cur.tries = 0; showFix(); }
function showFix(wrong) {
  if (!cur.fix.length) { Store.save(); return showResult(); }
  const k = cur.fix[0], a = cur.answers[k], q = cur.qs[k]; cur.redraw = () => showFix();
  app().innerHTML = unitHeader() + `<main class="center"><p>${R('なおそう')}（${R('のこり')} ${cur.fix.length}）</p>${questionHTML(q)}
    ${cur.tries >= 2 ? `<p class="hint">${R('こたえ')}：${ansText(cur.unit.id, q.answer.map(String), q.boxes)}</p>` : ''}<p class="msg" id="fmsg">${wrong === true ? R('ちがうよ。もう {一度|いちど} やって みよう') : ''}</p></main>`;
  bindInput(q, ans => {
    if (isRight(q, ans)) { a.fixed = true; cur.fix.shift(); cur.tries = 0; showFix(); }
    else { cur.tries++; showFix(true); }
  });
}

// つぎの 単元：同じ シリーズで、いま できる 単元（この 単元の 後ろから さがす）
function nextUnitOf(id) {
  const U = UNITS[id], se = U && !U.extra && seriesById(U.series); if (!se) return null;
  const hist = Store.attemptsOf(me.id), us = realUnits(se), i = us.indexOf(id);
  return [...us.slice(i + 1), ...us.slice(0, i)].find(u => unitStep(u, hist) === 'now') || null;
}
function showResult() {
  const r = cur.result, nx = r.passed ? nextUnitOf(r.unit) : null;
  const total = r.ruto + r.bonus;
  let line;
  if (r.kind === 'practice') line = R(cur.unit.subject === 'x4' ? 'この {単元|たんげん}は ルトなしだよ' : '{練習|れんしゅう}の{回|かい}なので ルトは ありません');
  else if (r.invalid) line = R('この{回|かい}の ルトは 0です');               // 理由（早押しなど）は子どもの画面に出さない
  else line = R(`<b class="big">${total}</b> ルト もらえたよ`) + (r.bonus ? R('（{点数|てんすう}アップ ＋1をふくむ）') : '');
  app().innerHTML = unitHeader() + `<main class="center">
    <h2>${r.perfect ? R('まんてん！') : r.passed ? R('{合格|ごうかく}！') : R('もう{少|すこ}し！')}　${r.score} / ${r.total}</h2>
    <p>${line}</p>
    ${!r.passed && cur.unit.kind === 'fin' ? `<p>${R('{仕上|しあ}げは 1{日|にち} 1{回|かい}。あした また チャレンジしよう')}</p>` : ''}
    ${!r.passed && cur.unit.kind !== 'fin' ? `<p>${R('{講義|こうぎ}から もう{一度|いちど} やってみよう')}</p><button class="primary big" onclick="startUnit('${r.unit}')">${R('{講義|こうぎ}から もう{一度|いちど}')}</button>` : ''}
    ${nx ? `<button class="primary big" onclick="startUnit('${nx}')">${R('つぎの {単元|たんげん}へ')}<br><small>${R(UNITS[nx].name)}</small></button>` : ''}
    <button onclick="showTop()">${R('トップへ')}</button></main>`;
}

// 口座（マネーラボ）の画面は ml_app.js

// ================= 先生の画面（ふりがななし） =================
let tTab = 'today', tKid = null;   // tKid：「子どもごと」で えらんでいる子（画面を出しなおしても そのまま）
// 今日のまとめ（AIを使わず、プログラムが決まった形の文を作る。社長の判断まではAIにしない：06_社長に決めてほしいこと.md）
function callList(kids, today) {
  return kids.filter(c => { const days = Store.get().attendance[c.id].filter(d => d <= today).slice(-3); const h = Store.attemptsOf(c.id); return days.length === 3 && days.every(d => !h.some(a => a.day === d)); });
}
// 今日発行したルト：今日、教室から子どもの口座に新しく入ったルト（取り置きをもどす・株を売る・定期の満期は、もとからあるルトの移動なので数えない）
const ISSUE_KINDS = [['Eラーニング', m => m.includes('Eラーニング')], ['宿題チェック', m => m === '宿題チェック'], ['利息と配当', m => m === '普通預金の利息' || m === '配当'], ['そのほか（テスト用の入金など）', m => m === 'テスト用の入金']];
function issuedToday(today, childId) {
  const L = Store.get().ledger.filter(l => l.amount > 0 && Store.dayOf(new Date(l.at)) === today && (!childId || l.child === childId));
  const by = ISSUE_KINDS.map(([n, f]) => [n, L.filter(l => f(l.memo)).reduce((s, l) => s + l.amount, 0)]);
  return { total: by.reduce((s, [, v]) => s + v, 0), by };
}

// 宿題チェック（マネーラボ仕様書：先生が出席一覧でOK、その日1回、1ルト。全員ON → できていない子だけOFF → 確定）
// 苦手な単元を宿題にする（仕様書：苦手は先生の画面に出し、宿題にできる）。出したあとに1回やったら「やった」になる（仮）。無効の回は数えない。宿題チェック（1ルト）とは別のもの
const assignList = () => { const S = Store.get(); return S.assigned || (S.assigned = []); };
const assignDone = (a, h) => h.filter(x => x.unit === a.unit && !x.invalid)[a.n];   // n：宿題にしたときに、もうやっていた回数。その次の回が宿題の分
const assignPending = (childId, h) => assignList().filter(a => a.child === childId && !assignDone(a, h));
function assignUnit(childId, unit) { const h = Store.attemptsOf(childId); if (!assignPending(childId, h).some(a => a.unit === unit)) assignList().push({ child: childId, unit, at: new Date().toISOString(), n: h.filter(x => x.unit === unit && !x.invalid).length }); Store.save(); showTeacher('warn'); }
function unassignUnit(childId, unit) { const h = Store.attemptsOf(childId), S = Store.get(); S.assigned = assignList().filter(a => a.child !== childId || a.unit !== unit || assignDone(a, h)); Store.save(); showTeacher('warn'); }
function assignTable(kids) {
  const since = new Date(Date.now() - 14 * 864e5).toISOString();
  const rows = kids.flatMap(c => { const h = Store.attemptsOf(c.id); return assignList().filter(a => a.child === c.id && (a.at >= since || !assignDone(a, h))).map(a => { const d = assignDone(a, h); return `<tr><td>${esc(c.name)}</td><td>${R(UNITS[a.unit].name)}</td><td>${Store.dayOf(new Date(a.at)).replace(/-/g, '/')}</td><td>${d ? `やった（${d.day.replace(/-/g, '/')}・最初の答えで ${pct(d.questions.filter(q => q.ok).length, d.questions.length)}）` : `<span class="warn">まだ</span> <button onclick="unassignUnit('${c.id}','${a.unit}')">取り消す</button>`}</td></tr>`; }); });
  return `<h3>出した宿題（最近14日と、まだの分）</h3><table class="list"><tr><th>子ども</th><th>単元</th><th>出した日</th><th>ようす</th></tr>${rows.join('') || '<tr><td colspan="4">ありません</td></tr>'}</table>`;
}
const HW_MEMO = '宿題チェック';
function hwState(today) { const S = Store.get(); S.homework = S.homework || {}; return S.homework[today] || (S.homework[today] = { done: false, off: [] }); }
const hwPaid = (id, today) => Store.get().ledger.some(l => l.child === id && l.memo === HW_MEMO && Store.dayOf(new Date(l.at)) === today);
const hwOn = (id, today) => { const st = hwState(today); return st.done ? hwPaid(id, today) : !st.off.includes(id); };
function hwToggle(id, on) {
  const today = Store.today(), st = hwState(today), S = Store.get();
  if (!st.done) st.off = on ? st.off.filter(x => x !== id) : st.off.concat(id);
  else if (on && !hwPaid(id, today)) S.ledger.push({ child: id, at: new Date().toISOString(), amount: 1, memo: HW_MEMO });
  else if (!on) S.ledger = S.ledger.filter(l => !(l.child === id && l.memo === HW_MEMO && Store.dayOf(new Date(l.at)) === today));   // 確定のあとに外したら、その日の1ルトを取り消す
  Store.save(); showTeacher();
}
function hwConfirm() {
  const today = Store.today(), st = hwState(today), S = Store.get();
  Store.children().filter(c => S.attendance[c.id].includes(today) && !st.off.includes(c.id) && !hwPaid(c.id, today))
    .forEach(c => S.ledger.push({ child: c.id, at: new Date().toISOString(), amount: 1, memo: HW_MEMO }));
  st.done = true; Store.save(); showTeacher();
}

// 漢検の状況：実施率（来た日のうち、漢検の単元を1回でもやった日の割合）と、合格点（10〜8級は8割、7〜3級は7割）をこえた割合
// 無効の回は数えない。練習の回はふくめる（力を見るため）
const KK = { lowDo: 0.5, lowPass: 0.7 };   // ⚠️をつける目安（仮）：実施率50%未満、合格率70%未満
const isKanken = a => UNITS[a.unit] && UNITS[a.unit].subject === 'kanken';
function kankenStats(c, from, to) {
  const days = Store.get().attendance[c.id].filter(d => d >= from && d <= to);
  const as = Store.attemptsOf(c.id).filter(a => isKanken(a) && !a.invalid && a.day >= from && a.day <= to);
  const did = days.filter(d => as.some(a => a.day === d)).length;
  return { days: days.length, did, n: as.length, ok: as.filter(a => a.passed).length, last: as[as.length - 1] };
}
function kankenBlock(kids, today) {
  const d = new Date(today), from7 = Store.dayOf(new Date(d - 6 * 864e5)), fromM = today.slice(0, 8) + '01';
  const sum = (from) => kids.map(c => kankenStats(c, from, today)).reduce((s, x) => ({ days: s.days + x.days, did: s.did + x.did, n: s.n + x.n, ok: s.ok + x.ok }), { days: 0, did: 0, n: 0, ok: 0 });
  const p = (a, b) => b ? `${Math.round(a / b * 100)}%` : '-';
  const cols = [['今日', today], ['最近7日', from7], [`今月（${+today.slice(5, 7)}月）`, fromM]].map(([n, f]) => [n, sum(f)]);
  const rows = kids.map(c => [c, kankenStats(c, fromM, today)]).filter(([, x]) => x.days);
  const flag = x => (x.days && x.did / x.days < KK.lowDo) || (x.n && x.ok / x.n < KK.lowPass);
  return `<div class="summary kk"><h3>漢検の状況</h3>
    <table class="list"><tr><th></th>${cols.map(([n]) => `<th>${n}</th>`).join('')}</tr>
      <tr><td><b>実施率</b><br><small class="note">来た日のうち漢検をやった日</small></td>${cols.map(([, x]) => `<td><b>${p(x.did, x.days)}</b><br><small class="note">${x.did}/${x.days}日</small></td>`).join('')}</tr>
      <tr><td><b>合格点をこえた割合</b><br><small class="note">10〜8級は8割、7〜3級は7割</small></td>${cols.map(([, x]) => `<td><b>${p(x.ok, x.n)}</b><br><small class="note">${x.ok}/${x.n}回</small></td>`).join('')}</tr></table>
    <details class="detail"><summary>子どもごと（今月）${rows.some(([, x]) => flag(x)) ? '　⚠️ あり' : ''}</summary>
      <p class="note">⚠️ は、実施率${KK.lowDo * 100}%未満か、合格点をこえた割合が${KK.lowPass * 100}%未満の子（目安は仮）。無効の回は数えない。</p>
      <table class="list"><tr><th>子ども</th><th>実施率</th><th>漢検の回数</th><th>合格点をこえた</th><th>最近の回</th></tr>
      ${rows.map(([c, x]) => `<tr><td>${flag(x) ? '⚠️ ' : ''}${esc(c.name)}（${c.grade}年）</td><td>${p(x.did, x.days)}（${x.did}/${x.days}日）</td><td>${x.n}回</td><td>${p(x.ok, x.n)}（${x.ok}/${x.n}回）</td>
        <td>${x.last ? `${R(UNITS[x.last.unit].name)} ${x.last.score}/${x.last.total}点 ${x.last.passed ? '○' : '×'}` : '-'}</td></tr>`).join('') || '<tr><td colspan="5">ありません</td></tr>'}</table></details></div>`;
}
function todaySummary(kids, today) {
  const names = cs => cs.map(c => esc(c.name)).join('、');
  const S = Store.get(), here = kids.filter(c => S.attendance[c.id].includes(today));   // 来ていない子の名前は出さない（人数が多いと長くなるので）
  const all = here.flatMap(c => Store.attemptsOf(c.id).filter(a => a.day === today).map(a => Object.assign({ c }, a)));
  const ruto = all.filter(a => a.kind === 'ruto' && !a.invalid), prac = all.filter(a => a.kind === 'practice');
  const zero = here.filter(c => !all.some(a => a.c === c));
  const invalid = all.filter(a => a.invalid);
  const stuck = here.filter(c => { const h = Store.attemptsOf(c.id); return Object.keys(UNITS).some(u => { const st = Rules.unitState(h, u); return st.failStreak >= 2 && st.last && st.last.day === today; }); });
  const perfect = all.filter(a => a.perfect && a.kind === 'ruto' && !a.invalid);
  const up = all.filter(a => a.bonus > 0);
  const passedKids = [...new Set(ruto.filter(a => a.passed).map(a => a.c))];
  const finished = here.flatMap(c => { const h = Store.attemptsOf(c.id); return Object.keys(UNITS).filter(u => { const st = Rules.unitState(h, u); return st.finished && st.last && st.last.day === today; }).map(u => `${esc(c.name)}（${R(UNITS[u].name)}）`); });
  const call = callList(kids, today);
  const orders = (typeof ML !== 'undefined' ? ML.state().orders : []).filter(o => Store.dayOf(new Date(o.at || 0)) === today && here.some(c => c.id === o.child));
  const iss = issuedToday(today), hw = hwState(today), hwNg = here.filter(c => !hwOn(c.id, today));
  // 物品の交換：今日の交換と、まだ渡していないもの（見落とさないように、今日のまとめにも出す）
  const exAll = typeof ML !== 'undefined' ? ML.exchanges().filter(e => e.status !== 'キャンセル' && kids.some(c => c.id === e.child)) : [];
  const exLine = e => `${esc(kids.find(c => c.id === e.child).name)}（${Furigana.render(ML.GOOD[e.goods].name, 'none')}${e.size ? `・${e.size}` : ''}）`;
  const exToday = exAll.filter(e => Store.dayOf(new Date(e.at)) === today), exWait = exAll.filter(e => e.status === '受け取り待ち'), exOrder = exAll.filter(e => e.status === '注文受付');
  // 正答率：今日と、最近7日（今日をのぞく）の平均をくらべる。最初の答えで数える
  const rate = as => { const qs = as.flatMap(a => a.questions); return qs.length ? Math.round(qs.filter(q => q.ok).length / qs.length * 100) : null; };
  const since = Store.dayOf(new Date(Date.now() - 7 * 864e5));
  const week = kids.flatMap(c => Store.attemptsOf(c.id).filter(a => a.day >= since && a.day < today));
  const rToday = rate(all), rWeek = rate(week);
  const sec = all.length ? (all.flatMap(a => a.questions).reduce((s, q) => s + q.ms, 0) / all.flatMap(a => a.questions).length / 1000).toFixed(1) : null;
  const byUnit = {}; all.forEach(a => byUnit[a.unit] = (byUnit[a.unit] || 0) + 1);
  const topUnits = Object.entries(byUnit).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([u, n]) => `${R(UNITS[u].name)} ${n}回`).join('、');
  // 来た子：最近7日の1日あたりの平均とくらべる
  const days = [...new Set(kids.flatMap(c => S.attendance[c.id]).filter(d => d >= since && d < today))];
  const avgHere = days.length ? (kids.reduce((s, c) => s + S.attendance[c.id].filter(d => d >= since && d < today).length, 0) / days.length).toFixed(1) : null;
  const ri = typeof ML !== 'undefined' && ML.state().history; const idx = ri && ri.length > 1 ? [rootIndex(ri[ri.length - 1].prices), rootIndex(ri[ri.length - 2].prices)] : null;
  const tile = (label, big, small) => `<div class="tile"><div class="tl">${label}</div><div class="tb">${big}</div><div class="ts">${small || '&nbsp;'}</div></div>`;
  const sect = (title, items) => { items = items.filter(Boolean); return items.length ? `<div class="sect"><h4>${title}</h4><ul>${items.map(x => `<li>${x}</li>`).join('')}</ul></div>` : ''; };
  return `<div class="summary"><h3>今日のまとめ（${today.slice(5).replace('-', '/')}）</h3>
    <div class="tiles">
      ${tile('来た子', `${here.length}<small>/${kids.length}人</small>`, avgHere ? `最近7日の平均 ${avgHere}人` : '')}
      ${tile('ルトの回', `${ruto.length + invalid.filter(a => a.kind === 'ruto').length}<small>回</small>`, `練習 ${prac.length}回`)}
      ${tile('正答率（最初の答え）', rToday === null ? '-' : `${rToday}<small>%</small>`, rWeek === null ? '' : `最近7日 ${rWeek}%${rToday !== null ? `（${rToday - rWeek >= 0 ? '＋' : '−'}${Math.abs(rToday - rWeek)}）` : ''}`)}
      ${tile('今日発行したルト', `${iss.total.toLocaleString()}<small>ルト</small>`, iss.by.filter(([, v]) => v).map(([n, v]) => `${n.replace('（テスト用の入金など）', '')} ${v.toLocaleString()}`).join('・'))}
    </div>
    <div class="sects">
    ${sect('学習', [
      `ルトの回：合格 ${ruto.filter(a => a.passed).length}回・満点 ${perfect.length}回・届かない ${ruto.filter(a => !a.passed).length}回${invalid.length ? `・無効 ${invalid.length}回` : ''}`,
      topUnits ? `よくやった単元：${topUnits}` : '',
      sec ? `1問にかかった時間：平均 ${sec}秒` : '',
      `宿題チェック：${hw.done ? `確定ずみ（OK ${here.length - hwNg.length}人）` : '<span class="warn">まだ確定していません</span>（下の表）'}`,
    ])}
    ${sect('ほめるチャンス', [
      perfect.length ? `満点：${names([...new Set(perfect.map(a => a.c))])}` : '',
      up.length ? `前回より点数アップ（＋1ルト）：${names([...new Set(up.map(a => a.c))])}` : '',
      finished.length ? `単元おしまい：${finished.join('、')}` : '',
      passedKids.length ? `合格した子：${names(passedKids)}` : '',
    ])}
    ${sect('⚠️ 気をつけること', [
      invalid.length ? `<span class="warn">無効の回</span>：${invalid.map(a => `${esc(a.c.name)}（${esc(a.invalid)}）`).join('、')}` : '',
      stuck.length ? `<span class="warn">つまずき</span>（同じ単元で2回続けて届かない）：${names(stuck)}` : '',
      call.length ? `<span class="warn">声かけリスト</span>（来た日が3回続けて0回。1回でもやれば自動で消える）：${names(call)}` : '',
      hwNg.length ? `<span class="warn">宿題ができていない</span>：${names(hwNg)}` : '',
      zero.length ? `まだEラーニングを1回もやっていない（声かけは強制しない）：${names(zero)}` : '',
    ])}
    ${sect('🎁 物品の交換（わたす もの）', [
      exToday.length ? `<span class="warn">今日の交換 ${exToday.length}件</span>：${exToday.map(exLine).join('、')}` : '今日の交換：0件',
      exWait.length ? `<span class="warn">まだ渡していない</span>（受け取り待ち）${exWait.length}件：${exWait.map(exLine).join('、')}` : '',
      exOrder.length ? `<span class="warn">発注がまだ</span>（注文受付）${exOrder.length}件：${exOrder.map(exLine).join('、')}` : '',
      exToday.length || exWait.length || exOrder.length ? '「渡した」「発注した」は、「マネーラボ」タブの「交換の受け渡し」で おす' : '',
    ])}
    ${sect('マネーラボ', [
      typeof ML !== 'undefined' && ML.proposal() && ML.proposal().status === '提案中' ? '<span class="warn">株価の案が まだ承認されていません</span>（「マネーラボ」タブの「株価の承認」）' : '',
      `今日の注文：${orders.length}件${orders.length ? `（買い ${orders.filter(o => o.side === 'buy').length}・売り ${orders.filter(o => o.side === 'sell').length}）` : ''}`,
      idx ? `ROOT平均：${Math.round(idx[0]).toLocaleString()}（先週から ${idx[0] >= idx[1] ? '▲＋' : '▼−'}${Math.abs((idx[0] / idx[1] - 1) * 100).toFixed(1)}%）` : '',
    ])}
    </div>
    <p class="note">AIは使わず、記録から決まった形で作っています。くわしくは下の表と、それぞれのタブで見られます。</p></div>`;
}// 1回分の中身（先生だけが見る）：10問の問題・最初の答え・正しい答え・○×・かかった時間。早押しの目安（2秒未満）の行は色をつける
function attemptDetail(a, label) {
  const t = new Date(a.at), fast = q => q.ms < Rules.CONFIG.fastMs;
  return `<div class="att"><p><b>${label ? label + '：' : ''}${t.getMonth() + 1}/${t.getDate()} ${t.getHours()}:${String(t.getMinutes()).padStart(2, '0')}</b>　${a.score}/${a.total}点　${a.invalid ? `無効（${esc(a.invalid)}）` : a.passed ? '合格' : '合格ラインに届かない'}</p>
    <table class="check"><tr><th></th><th>問題</th><th>最初の答え</th><th>正しい答え</th><th></th><th>時間</th><th>直し</th></tr>
    ${a.questions.map((q, k) => `<tr class="${fast(q) && !q.ok ? 'fastng' : ''}"><td>${k + 1}</td><td>${Furigana.render(noBtn(q.text), 'none')}</td><td>${ansText(a.unit, q.first, q.boxes)}</td><td>${ansText(a.unit, q.correct, q.boxes)}</td><td>${q.ok ? '○' : '×'}</td><td>${(q.ms / 1000).toFixed(1)}秒</td><td>${q.ok ? '' : q.fixed ? '直した' : '直していない'}</td></tr>`).join('')}</table></div>`;
}
// 苦手の中身：その単元の最近20問（新しい順）。苦手の計算（rules.js の weakUnits）と同じ問題を出す。まちがえた問題は色をつける
function weakDetail(childId, unit) {
  const qs = Store.attemptsOf(childId).filter(a => a.unit === unit).reverse()
    .flatMap(a => a.questions.map(q => Object.assign({ at: a.at }, q))).slice(0, Rules.CONFIG.weakRecent);
  const ng = qs.filter(q => !q.ok);
  return `<p class="att">まちがえた問題：${ng.length}問 / ${qs.length}問</p>
    <table class="check"><tr><th>日</th><th>問題</th><th>最初の答え</th><th>正しい答え</th><th></th><th>時間</th></tr>
    ${qs.map(q => { const d = new Date(q.at); return `<tr class="${q.ok ? '' : 'ng'}"><td>${d.getMonth() + 1}/${d.getDate()}</td><td>${Furigana.render(noBtn(q.text), 'none')}</td><td>${ansText(unit, q.first, q.boxes)}</td><td>${ansText(unit, q.correct, q.boxes)}</td><td>${q.ok ? '○' : '×'}</td><td>${(q.ms / 1000).toFixed(1)}秒</td></tr>`; }).join('')}</table>`;
}
// みんながまちがえる問題（仕様書9章の5番の目的：問題文がおかしくないかのチェック）。同じ問題文を、全員分の最初の答えで数える。
// 数字を変えて作る算数は同じ問題がくり返し出にくいので、漢字などの決まった問題で役に立つ
const HARD = { minTries: 4, maxRate: 0.5 };   // 4回以上出て、正答率50%未満（仮）
function hardQuestions(kids) {
  const by = {};
  kids.forEach(c => Store.attemptsOf(c.id).forEach(a => a.questions.forEach(q => {
    const k = a.unit + '\u0000' + q.text, x = by[k] || (by[k] = { unit: a.unit, text: q.text, correct: q.correct, boxes: q.boxes, n: 0, ok: 0, wrong: {}, grades: new Set() });
    x.n++; x.grades.add(c.grade);
    if (q.ok) x.ok++; else { const w = q.first.join(' '); x.wrong[w] = (x.wrong[w] || 0) + 1; }
  })));
  const list = Object.values(by).filter(x => x.n >= HARD.minTries && x.ok / x.n < HARD.maxRate).sort((a, b) => a.ok / a.n - b.ok / b.n);
  return `<details class="detail hard"><summary>みんながまちがえる問題（${list.length}問）</summary>
    <p class="note">問題文や答えがおかしくないかのチェック用。${HARD.minTries}回以上出て、正答率${HARD.maxRate * 100}%未満の問題。</p>
    <table class="list"><tr><th>問題</th><th>正しい答え</th><th>正答率</th><th>多い まちがい</th></tr>
    ${list.map(x => { const top = Object.entries(x.wrong).sort((a, b) => b[1] - a[1])[0]; return `<tr><td>${Furigana.render(noBtn(x.text), 'none')}<br><small class="note">${R(UNITS[x.unit].name)}</small></td><td>${ansText(x.unit, x.correct, x.boxes)}</td><td>${Math.round(x.ok / x.n * 100)}%</td><td>${top ? `${ansText(x.unit, top[0].split(' '), x.boxes)}（${top[1]}回）` : ''}</td></tr>`; }).join('') || '<tr><td colspan="4">ありません</td></tr>'}</table></details>`;
}
// 答えの見せ方：あまりのあるわり算は「9 あまり 3」
// 答えの見せ方：箱の名前（あまり・分子・分母など）に合わせる
// 記録の 表では、問題の 中の ボタン（リズムの スタート・タン など）は 出さない
const noBtn = t => String(t).replace(/<button[^>]*>[\s\S]*?<\/button>|<p class="tapmsg"><\/p>/g, '');
function ansText(unit, arr, boxes) {
  if (unit === 'x2l-5') return String(arr[0]) === '0' ? 'ずれた' : 'ぴったり';   // リズムを打つ：中の 番号は 見せない（2026年11月15日）
  const L = (boxes || []).map(b => (b || '').replace(/\{([^|}]+)\|[^}]*\}/g, '$1'));
  if ((L[1] === 'あまり' || (!boxes && unit === 'm6-3')) && arr.length === 2) return esc(`${arr[0]} あまり ${arr[1]}`);
  if (L[0] === '県' && window.PREF_NAME) return esc(arr.map(x => PREF_NAME(Number(x)) || 'こたえなし').join(''));   // 地図をクリックする問題（県のコード → 名前）
  if (L.join() === '分子,分母') return esc(`${arr[0]}/${arr[1]}`);
  // 詰将棋の答え：マスの 番号（21＝上の 数字 2・右の 数字 1）を、盤の 数字で 読める 形に（2026年11月15日 社長：「21 → 23」は わかりにくい）
  const SQ = n => `「上 ${Math.floor(n / 10)}・右 ${n % 10}」`;
  const TE = (s, start) => s.map((n, i) => `${start + i * 2}手目は ${SQ(n)}`).join('、') + ' の マス';
  if (L[0] === 'マス' && String(arr[0]).length === 6) { const v = Number(arr[0]), s = [Math.floor(v / 10000), Math.floor(v / 100) % 100, v % 100].filter(Boolean); return esc(TE(s, 1)); }   // 5手詰の答え（1手目 → 3手目 → 5手目）
  if (L[0] === 'マス' && String(arr[0]).length === 4) { const v = Number(arr[0]), s = [Math.floor(v / 100), v % 100].filter(Boolean); return esc(TE(s, 1)); }   // 3手詰の答え（1手目 → 3手目）
  if (L[0] === 'マス' && String(arr[0]).length === 2 && String(arr[0])[1] !== '0') return esc(`${SQ(Number(arr[0]))} の マス`);   // 1手詰
  if (L.join() === '整数,分子,分母') return esc(`${arr[0]}と${arr[1]}/${arr[2]}`);
  if (L[1] === '：') return esc(`${arr[0]}：${arr[1]}`);
  if (L.some(Boolean)) return esc(arr.map((x, i) => `${x}${L[i] || ''}`).join(' '));
  return esc(arr.join(' '));
}
function showTeacher(tab) {
  seedStartApply();
  if (tab) tTab = tab;
  if (tTab === 'call') tTab = 'today';   // 声かけリストは「今日のまとめ」に入れたので、タブはなくした
  if (tTab === 'weak' || tTab === 'class') tTab = 'warn';    // 苦手と「みんながまちがえる問題」（もとのクラス全体）は「注意・苦手」タブにまとめた
  const kids = Store.children(), today = Store.today(), cap = Rules.capFor(holiday());
  const tabs = [['today', '今日'], ['warn', '注意・苦手'], ['child', '子どもごと'], ['plan', 'ロードマップ'], ['ml', 'マネーラボ'], ['acct', 'アカウント']];
  let body = '';
  if (tTab === 'today') {
    const here = kids.filter(c => Store.get().attendance[c.id].includes(today));
    const hw = hwState(today);
    body = todaySummary(kids, today) + kankenBlock(kids, today) + `<table class="list"><tr><th>子ども</th><th>学年</th><th>宿題OK</th><th>今日のルトの回</th><th>練習</th><th>今日入ったルト</th></tr>
      ${here.map(c => { const h = Store.attemptsOf(c.id).filter(a => a.day === today); return `<tr><td>${esc(c.name)}</td><td>${c.grade}年</td>
        <td><label class="hw"><input type="checkbox" ${hwOn(c.id, today) ? 'checked' : ''} onchange="hwToggle('${c.id}', this.checked)"> ${hwOn(c.id, today) ? 'OK' : 'まだ'}</label></td>
        <td>${h.filter(a => a.kind === 'ruto').length} / ${cap}</td><td>${h.filter(a => a.kind === 'practice').length}</td><td>${issuedToday(today, c.id).total}</td></tr>`; }).join('')}</table>
      ${hw.done ? `<p class="note">宿題チェックは確定ずみ（OKの子に1ルト）。あとから来た子やまちがいは、チェックを変えるとすぐ反映されます（1ルトを入れる／取り消す）。</p>`
        : `<p><button class="primary" onclick="hwConfirm()">宿題チェックを確定する（OKの子に1ルト）</button> <span class="note">最初は全員OK。宿題ができていない子だけチェックを外してから押す。1日1回。</span></p>`}
      <p class="note">「今日は0回」の子に色や注意はつけない。順位は出さない。「いまといている子」は本番でサーバーから出す（試作品では出していない）。</p>
      <label class="inline"><input type="checkbox" id="hol" ${holiday() ? 'checked' : ''}> 今日は学校の長い休みの日（ルトは1日4回まで）</label>`;
  } else if (tTab === 'warn') {
    const since = Store.dayOf(new Date(Date.now() - 14 * 864e5));
    const rows = [];
    kids.forEach(c => {
      const h = Store.attemptsOf(c.id);
      h.filter(a => a.invalid && a.day >= since).forEach(a => rows.push([c, a.day, UNITS[a.unit].name, a.invalid, [a]]));
      Object.keys(UNITS).forEach(u => { const st = Rules.unitState(h, u); if (st.failStreak >= 2) rows.push([c, st.last.day, UNITS[u].name, `同じ単元で${st.failStreak}回続けて合格ラインに届かない（つまずき）`, h.filter(a => a.unit === u && !a.invalid).slice(-st.failStreak)]); });
    });
    body = `<h3>⚠️ 注意（最近14日）</h3>
      <p class="note">罰ではなく、声をかけるために使う。子どもの画面には出さない。「中身を見る」で、その回の10問（最初の答え・正しい答え・かかった時間）が見られます。</p>
      <table class="list"><tr><th>子ども</th><th>日</th><th>単元</th><th>内容</th></tr>${rows.map(([c, d, u, t, as]) => `<tr><td>${esc(c.name)}</td><td>${d.replace(/-/g, '/')}</td><td>${R(u)}</td>
        <td>⚠️ ${esc(t)}</td></tr>
        <tr class="drow"><td colspan="4"><details class="detail"><summary>中身を見る</summary>${as.map((a, i) => attemptDetail(a, as.length > 1 ? `${i + 1}回目` : '')).join('')}</details></td></tr>`).join('') || '<tr><td colspan="4">ありません</td></tr>'}</table>
      <h3>苦手</h3>
      <p class="note">決まり：単元ごとに、最近20問の最初の答えの正答率が80%未満。「宿題にする」を押すと、その子の最初の画面に「先生からの宿題」として出ます。1回やると「やった」になります（仮）。</p>
      <table class="list"><tr><th>子ども</th><th>単元</th><th>正答率</th><th>宿題</th></tr>
      ${kids.flatMap(c => { const h = Store.attemptsOf(c.id), p = assignPending(c.id, h); return Rules.weakUnits(h).map(w => `<tr><td>${esc(c.name)}</td><td>${R(UNITS[w.unit].name)}</td><td>${pct(w.ok, w.n)}</td><td>${p.some(a => a.unit === w.unit) ? '宿題にした' : `<button onclick="assignUnit('${c.id}','${w.unit}')">宿題にする</button>`}</td></tr>
        <tr class="drow"><td colspan="4"><details class="detail"><summary>中身を見る（最近${w.n}問）</summary>${weakDetail(c.id, w.unit)}</details></td></tr>`); }).join('') || '<tr><td colspan="4">ありません</td></tr>'}</table>
      ${assignTable(kids)}
      ${hardQuestions(kids)}`;
  } else if (tTab === 'child') {
    body = `<select id="kid">${kids.map(c => `<option value="${c.id}" ${c.id === tKid ? 'selected' : ''}>${esc(c.name)}（${c.grade}年）</option>`).join('')}</select><div id="rep"></div>`;
  } else if (tTab === 'plan') {
    body = planHTML();
  } else if (tTab === 'ml') {
    body = mlTeacherHTML();
  } else if (tTab === 'acct') {
    body = acctHTML(kids) + `
      <button onclick="if(confirm('架空のデータを作りなおします'))Store.reset().then(logout)">架空のデータを作りなおす</button>`;
  }
  app().innerHTML = `<header><span>先生の画面（${esc(me.name)}）</span><span>${testBack ? '<button onclick="testReturn()">テスト用の 子どもの 画面へ</button>' : ''}<button onclick="logout()">ログアウト</button></span></header>
    <nav>${tabs.map(([k, n]) => `<button class="${k === tTab ? 'on' : ''}" onclick="showTeacher('${k}')">${n}</button>`).join('')}</nav><main class="wide">${body}</main>`;
  if (tTab === 'ml') { mlTeacherBind(); bindCharts(); }
  if ($('#hol')) $('#hol').onchange = e => { Store.get().settings.holiday = e.target.checked; Store.save(); };
  if ($('#kid')) { const f = () => { tKid = $('#kid').value; $('#rep').innerHTML = roadAdminHTML($('#kid').value) + reportHTML($('#kid').value, null); bindReport($('#kid').value); }; $('#kid').onchange = f; f(); }
}
const pct = (ok, n) => n ? `${Math.round(ok / n * 100)}%（${n}問中${ok}問）` : '0問';

// ================= 保護者のページ（見るだけ・ルトはのせない） =================
function showParent(childId) {
  const c = Store.get().users.find(u => u.id === childId), ks = me && me.role === 'parent' ? Store.kidsOf(me) : [];
  const pick = ks.length > 1 ? `<select onchange="parentKid=this.value;showParent(parentKid)">${ks.map(k => `<option value="${k.id}" ${k.id === childId ? 'selected' : ''}>${esc(k.name)}</option>`).join('')}</select>` : '';   // きょうだい
  app().innerHTML = `<header><span>${esc(c.name)}さんの記録 ${pick}</span><span><button onclick="print()">印刷</button><button onclick="logout()">ログアウト</button></span></header>
    <main id="rep">${reportHTML(childId, null)}</main>`;
  bindReport(childId);
}
const monthOf = s => s.slice(0, 7);
// タイピングの記録（先生・保護者の画面）。やった月だけ出す
function typingBlock(childId, month, prev) {
  const all = (Store.get().typing || []).filter(r => r.child === childId);
  const inM = all.filter(r => monthOf(r.day) === month);
  if (!inM.length) return '';
  const best = (list, id) => list.filter(r => r.level === id).reduce((m, r) => Math.max(m, r.keys), 0);
  const rows = Typing.LEVELS.map(l => {
    const a = inM.filter(r => r.level === l.id); if (!a.length) return '';
    const b = best(a, l.id), p = best(all.filter(r => monthOf(r.day) === prev), l.id);
    const keys = a.reduce((s, r) => s + r.keys, 0), miss = a.reduce((s, r) => s + r.miss, 0);
    return `<tr><td>${l.label || 'レベル' + l.id}：${Furigana.render(l.name, 'none')}</td><td>${a.length}回</td><td><b>${b}</b>文字</td><td>${p ? `${p}文字` : '―'}</td><td>${keys + miss ? Math.round(keys / (keys + miss) * 100) : 0}%</td></tr>`;
  }).join('');
  return `<h3>タイピング</h3><table class="list"><tr><th>レベル</th><th>今月の回数</th><th>1回（${inM[0].sec}秒）の最高　今月</th><th>最高　先月</th><th>正しく打てた割合</th></tr>${rows}</table>`;
}
function reportHTML(childId, month) {
  const all = Store.attemptsOf(childId);
  const months = [...new Set(all.map(a => monthOf(a.day)).concat(monthOf(Store.today())))].sort().reverse();
  month = month || months[0];
  const [y, m] = month.split('-').map(Number);
  const prev = `${m === 1 ? y - 1 : y}-${String(m === 1 ? 12 : m - 1).padStart(2, '0')}`;
  const inM = mm => all.filter(a => monthOf(a.day) === mm);
  const A = inM(month), P = inM(prev);
  const isNow = month === monthOf(Store.today());
  const lastDay = isNow ? Number(Store.today().slice(8)) : new Date(y, m, 0).getDate();
  const qsOf = (list, col) => list.filter(a => UNITS[a.unit].col === col).flatMap(a => a.questions);
  const qn = A.reduce((s, a) => s + a.questions.length, 0);
  const allCols = REPORT_COLUMNS.flatMap(g => g.cols);
  const weak = allCols.filter(col => { const q = qsOf(A, col); return q.length && q.filter(x => x.ok).length / q.length < 0.8; });
  const finished = Object.keys(UNITS).filter(u => !UNITS[u].extra && Rules.unitState(all.filter(a => monthOf(a.day) <= month), u).finished).length;
  const bar = (label, q, cls) => q.length
    ? `<div class="bar ${cls}"><span class="bl">${label}</span><span class="track"><span style="width:${q.filter(x => x.ok).length / q.length * 100}%"></span></span><span class="bv">${pct(q.filter(x => x.ok).length, q.length)}</span></div>`
    : `<div class="bar ${cls}"><span class="bl">${label}</span><span class="zero">この月は0問</span></div>`;
  // 単元の進み具合（その月の終わりまでの記録で見る。練習の回もふくむ）
  const upto = all.filter(a => monthOf(a.day) <= month);
  const ST = [['done', 'おわった'], ['pass', '合格'], ['try', 'とりくみ中'], ['none', 'まだ']];
  const stOf = u => { const s = Rules.unitState(upto, u.id); return s.finished ? 'done' : upto.some(a => a.unit === u.id && a.passed) ? 'pass' : s.tries ? 'try' : 'none'; };
  const prog = us => { const n = { done: 0, pass: 0, try: 0, none: 0 }; us.forEach(u => n[stOf(u)]++); return n; };
  // やっていない 種類は 表に 出さない（2026年11月13日）。1回でも とりくんだ 単元が ある 種類だけ
  const _on = {}, colOn = col => _on[col] ??= upto.some(a => UNITS[a.unit] && UNITS[a.unit].col === col);
  const progBar = (us) => {
    if (!us.length) return '<span class="zero">じゅんびちゅう</span>';
    const n = prog(us), started = us.length - n.none;
    return `<div class="pbar">${ST.filter(([k]) => k !== 'none').map(([k]) => n[k] ? `<span class="p-${k}" style="width:${n[k] / us.length * 100}%"></span>` : '').join('')}</div>
      <div class="pv"><b>${started}単元</b>に とりくんだ<br><small>${ST.filter(([k]) => k !== 'none').map(([k, l]) => `${l}${n[k]}`).join('・')}</small></div>
      <details class="detail"><summary>単元を見る</summary><table class="check">${us.filter(u => stOf(u) !== 'none').map(u => { const s = stOf(u), h = upto.filter(a => a.unit === u.id);
        return `<tr><td>${Furigana.render(u.name, 'none')}</td><td class="st-${s}">${ST.find(([k]) => k === s)[1]}</td><td>${h.length ? `${h.length}回・最高 ${Math.max(...h.map(a => a.score))}/${h[0].total}` : ''}</td></tr>`; }).join('')}</table></details>`;
  };
  const rate = (q) => q.length ? `<div class="rbar"><span style="width:${q.filter(x => x.ok).length / q.length * 100}%"></span></div>${pct(q.filter(x => x.ok).length, q.length)}` : '<span class="zero">0問</span>';
  const allUnits = Object.values(UNITS).filter(u => !u.extra), tot = prog(allUnits);   // まとめテスト・苦手まとめは進み具合の単元の数に入れない
  // 総評：決まった形の文を、記録から自動で作る（AIは使わない。先生が書く必要もない）
  const review = (() => {
    const days = (Store.get().attendance[childId] || []).filter(d => monthOf(d) === month).length;
    if (!A.length) return [`この月は、まだEラーニングの記録がありません${days ? `（来た日：${days}日）` : ''}。`];
    const P2 = isNow ? P.filter(a => Number(a.day.slice(8)) <= lastDay) : P;   // 今の月は、先月の同じ日までとくらべる
    const qa = A.flatMap(a => a.questions), qp = P.flatMap(a => a.questions);
    const r = q => q.filter(x => x.ok).length / q.length;
    const out = [];
    const cmpN = P2.length ? (A.length > P2.length ? `先月の同じころ（${P2.length}回）より多く取りくめています。` : A.length < P2.length ? `先月の同じころ（${P2.length}回）より少しへっています。` : '先月の同じころと同じくらいです。') : '';
    out.push(`${days ? `${days}日来て、` : ''}${A.length}回（${qn}問）取りくみました。${isNow ? cmpN : ''}`);
    const ra = r(qa), diff = qp.length ? Math.round((ra - r(qp)) * 100) : null;
    out.push(`最初の答えの正答率は <b>${Math.round(ra * 100)}%</b>（${qa.length}問中${qa.filter(x => x.ok).length}問）${diff === null ? 'です。' : diff >= 3 ? `で、先月（${Math.round(r(qp) * 100)}%）より上がりました。` : diff <= -3 ? `で、先月（${Math.round(r(qp) * 100)}%）より少し下がりました。` : `で、先月（${Math.round(r(qp) * 100)}%）と同じくらいです。`}`);
    const colR = allCols.map(col => { const q = qsOf(A, col); return [col, q.length, q.length ? r(q) : 0]; }).filter(x => x[1] >= 10);
    const good = colR.filter(x => x[2] >= 0.9).sort((a, b) => b[2] - a[2]);
    if (good.length) out.push(`<b>${good.map(x => `${x[0]}（${Math.round(x[2] * 100)}%）`).join('、')}</b> がよくできています。`);
    if (weak.length) out.push(`${weak.map(c => `<b>${c}</b>（${Math.round(r(qsOf(A, c)) * 100)}%）`).join('、')} は、もう少し練習するとよさそうです。`);
    const before = all.filter(a => monthOf(a.day) < month);
    const newDone = allUnits.filter(u => stOf(u) === 'done' && !Rules.unitState(before, u.id).finished);
    const newStart = allUnits.filter(u => A.some(a => a.unit === u.id) && !before.some(a => a.unit === u.id));
    if (newStart.length) out.push(`はじめての単元に ${newStart.length}つ 取りくみました（${newStart.map(u => Furigana.render(u.name, 'none')).join('、')}）。`);
    if (newDone.length) out.push(`${newDone.length}つの単元が「おわった」になりました（${newDone.map(u => Furigana.render(u.name, 'none')).join('、')}）。`);
    const tryU = allUnits.filter(u => stOf(u) === 'try');
    if (tryU.length) out.push(`まだ合格していない単元：${tryU.map(u => Furigana.render(u.name, 'none')).join('、')}。`);
    return out;
  })();
  // 家でやるのがおすすめの単元（3つまで）：まだ合格していない単元 → 最近の正答率が低い単元 の順。最近まちがえた問題もそえる
  const HOME = { max: 3, recent: 20, rate: 0.8, qs: 5 };   // 目安は仮
  const homeRec = (() => {
    const list = [];
    allUnits.forEach(u => {
      const h = upto.filter(a => a.unit === u.id); if (!h.length) return;
      const qs = h.flatMap(a => a.questions).slice(-HOME.recent), rr = qs.filter(x => x.ok).length / qs.length;
      const st = stOf(u);
      if (st === 'try') list.push([u, 0, `まだ合格していない（最近の正答率 ${Math.round(rr * 100)}%）`, qs]);
      else if (rr < HOME.rate) list.push([u, 1 + rr, `最近の正答率が ${Math.round(rr * 100)}%（最近${qs.length}問）`, qs]);
    });
    return list.sort((a, b) => a[1] - b[1]).slice(0, HOME.max).map(([u, , why, qs]) => {
      const seen = new Set(), ng = qs.filter(q => !q.ok).reverse().filter(q => !seen.has(q.text) && seen.add(q.text)).slice(0, HOME.qs);
      return `<li><b>${Furigana.render(u.name, 'none')}</b>（${u.col}）　<small class="note">${why}</small>
        ${ng.length ? `<details class="detail"><summary>最近まちがえた問題（${ng.length}問）</summary><table class="check">${ng.map(q => `<tr><td>${Furigana.render(noBtn(q.text), 'none')}</td><td>正しい答え：${ansText(u.id, q.correct, q.boxes)}</td></tr>`).join('')}</table></details>` : ''}</li>`;
    });
  })();
  return `
    <label>月：<select id="mon">${months.map(x => `<option ${x === month ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
    <h2>${y}年${m}月1日〜${m}月${lastDay}日${isNow ? `（今日まで）` : ``}</h2>
    <div class="summary review"><h3>${m}月の総評</h3><ul>${review.map(s => `<li>${s}</li>`).join('')}</ul><p class="note">記録から自動で作った文です。</p></div>
    <div class="summary home"><h3>家でやるのがおすすめの単元</h3>
      ${homeRec.length ? `<ul>${homeRec.join('')}</ul><p class="note">まだ合格していない単元と、最近の正答率が80%未満の単元から、3つまで。「最近まちがえた問題」をいっしょに見てあげてください。</p>` : '<p>今は、とくにありません。よくできています。</p>'}</div>
    ${typingBlock(childId, month, prev)}
    <ul class="sum">
      <li>やった回数：${A.length}回、問題数：${qn}問</li>
      <li>正答率80%未満の種類：${weak.join('、') || 'なし'}（決まり：その月の最初の答えの正答率が80%未満）</li>
      <li>これまでに とりくんだ単元：${allUnits.length - tot.none}単元（${ST.filter(([k]) => k !== 'none').map(([k, l]) => `${l}${tot[k]}`).join('・')}）</li>
    </ul>
    <p class="legend">進み具合：<span class="sw p-done"></span>おわった（最初の答えで満点のあと、もう1回やった）　<span class="sw p-pass"></span>合格（合格点をこえたことがある）　<span class="sw p-try"></span>とりくみ中（まだ合格していない）　白＝まだ。
      正答率は最初の答えで数える。棒は 0〜100% の同じものさし。</p>
    ${REPORT_COLUMNS.map(g => !g.cols.some(colOn) ? '' : `<h3>${g.subject}${g.note ? `<small>（${g.note}）</small>` : ''}</h3>
      <table class="list prog"><tr><th>種類</th><th>進み具合（${isNow ? '今日' : `${m}月の終わり`}まで）</th><th>正答率　今月</th><th>正答率　先月</th></tr>
      ${g.cols.filter(colOn).map(col => `<tr><td>${col}</td><td>${progBar(allUnits.filter(u => u.col === col))}</td><td>${rate(qsOf(A, col))}</td><td class="prev">${rate(qsOf(P, col))}</td></tr>`).join('')}</table>`).join('')}
    ${allCols.some(c => !colOn(c)) ? `<p class="note">まだ とりくんでいない種類（${allCols.filter(c => !colOn(c)).length}）は、表に出していません。</p>` : ''}
    <h3>1回ごとの記録</h3>
    <table class="list"><tr><th>日時</th><th>単元</th><th>点数</th><th></th></tr>
      ${A.slice().reverse().map(a => `<tr><td>${a.at.slice(5, 16).replace('T', ' ').replace('-', '/')}</td><td>${Furigana.render(UNITS[a.unit].name, 'none')}</td><td>${a.score}/${a.total}</td>
      <td><details><summary>10問を見る</summary><table class="check">${a.questions.map((q, k) => `<tr><td>${k + 1}</td><td>${Furigana.render(noBtn(q.text), 'none')}</td><td>最初の答え：${ansText(a.unit, q.first, q.boxes)}</td><td>正しい答え：${ansText(a.unit, q.correct, q.boxes)}</td><td>${q.ok ? '○' : '×'}</td><td>${q.ok ? '' : q.fixed ? '直した' : '直していない'}</td></tr>`).join('')}</table></details></td></tr>`).join('') || '<tr><td colspan="4">この月の記録はありません</td></tr>'}
    </table>`;
}
function bindReport(childId) { const s = $('#mon'); if (s) s.onchange = () => { $('#rep').innerHTML = reportHTML(childId, s.value); bindReport(childId); }; }

// ---- 先生の画面：アカウント（マネーラボ仕様書 2章・8-2。Eラーニングとマネーラボで共通） ----
let acctMsg = '';
const ymdS = s => s.replace(/-/g, '/');
function endOfMonth() { const d = new Date(); return Store.dayOf(new Date(d.getFullYear(), d.getMonth() + 1, 0)); }
function gradDay() { const d = new Date(); return `${d.getMonth() >= 3 ? d.getFullYear() + 1 : d.getFullYear()}-03-31`; }
function acctHTML(kids) {
  const st = c => c.closed ? `${c.closed.kind}：${ymdS(c.closed.at)}まで` : c.locked ? 'ロック中' : c.fails ? `${c.fails}回まちがい` : '';
  const hid = Store.hidden();
  return `<h3>口座の開設（入会のとき）</h3>
    <p class="note">ユーザー名（番号）と初期パスワード（数字4けた・仮）を自動で作ります。保護者のアカウントもいっしょにできます。Eラーニングとマネーラボで同じアカウントです。<b>試作品では架空の名前だけを入れてください。</b></p>
    <p>名前 <input id="nname" placeholder="例：架空 たろう" style="width:12em"> 学年 <select id="ngrade">${[1, 2, 3, 4, 5, 6].map(g => `<option>${g}</option>`).join('')}</select>
      スタート <select id="nstart"><option value="0">その学年の スタート（ふつう）</option>${[1, 2, 3, 4, 5, 6].map(g => `<option value="${g}">${g}年の スタート${g === 1 ? '（ぜんぶ はじめから）' : ''}</option>`).join('')}</select>
      きょうだい <span class="sug"><input id="nsib" placeholder="きょうだいの名前（いなければ空）" style="width:14em" autocomplete="off" oninput="sibSuggest()" onfocus="sibSuggest()"><div id="sibList"></div></span>
      <button class="primary" onclick="acctOpen()">開設する</button></p>
    <p class="note">きょうだいがいるときは、もう入っている きょうだいの名前を打つと、下に候補が出ます。えらぶと、その保護者のアカウントで きょうだい全員を見られます（保護者のアカウントは増えません）。</p>
    ${acctMsg}
    <p><label><input type="checkbox" ${Store.get().settings.mustChange ? 'checked' : ''} onchange="Store.get().settings.mustChange=this.checked;Store.save()"> はじめてのログイン（とリセットのあと）に、本人がパスワードを変える（仮）</label></p>
    <h3>進級（4月）</h3>
    <p><button onclick="if(confirm('退会・卒業していない子の学年を1つ上げます（6年生はそのまま）'))acctMsg='<p class=msg>'+Store.promoteAll()+'人の学年を上げました</p>',showTeacher('acct')">全員の学年を1つ上げる</button>
      <span class="note">最後に押した日：${Store.get().lastPromote ? ymdS(Store.get().lastPromote) : 'まだ'}。1人ずつ直すときは、下の一覧の学年を変えてください。</span></p>
    <h3>アカウントの一覧</h3>
    <p class="note">パスワードのリセット（試作品：新しいパスワードは 1234）・ロックの解除。退会・卒業・スポットに移るは、その日まで使えます（退会・スポット：その月の最後に来る日まで交換できる）。スポット会員は ルトなし（2026年11月13日に決定）。その日を過ぎると、Eラーニング・マネーラボ・保護者のページが止まり、残高はなくなります。</p>
    <table class="list"><tr><th>子ども</th><th>ユーザー名</th><th>状態</th><th></th></tr>
    ${kids.map(c => `<tr><td>${esc(c.name)} <button onclick="acctRename('${c.id}')">名前を直す</button><br>
      <select onchange="Store.setGrade('${c.id}',+this.value);showTeacher('acct')">${[1, 2, 3, 4, 5, 6].map(g => `<option value="${g}" ${g === c.grade ? 'selected' : ''}>${g}年</option>`).join('')}</select></td><td>${c.username}</td><td>${st(c)}</td><td>
      <button onclick="Store.resetPassword('${c.id}','1234').then(()=>showTeacher())">リセット</button>
      ${c.closed ? `<button onclick="if(confirm('${c.closed.kind}を取り消します'))Store.reopen('${c.id}'),showTeacher()">${c.closed.kind}の取り消し</button>${c.closed.kind === '卒業' ? ` <button onclick="acctCert('${c.id}')">修了証の文</button>` : ''}`
        : `<input type="date" id="cd_${c.id}" value="${c.grade === 6 ? gradDay() : endOfMonth()}">
      <button onclick="acctClose('${c.id}','退会')">退会</button> <button onclick="acctClose('${c.id}','スポット移行')">スポットに移る</button>${c.grade === 6 ? ` <button onclick="acctClose('${c.id}','卒業')">卒業</button>` : ''}`}</td></tr>`).join('')}</table>
    <div id="cert"></div>
    <h3>保護者のアカウント</h3>
    <table class="list"><tr><th>保護者</th><th>ユーザー名</th><th>見られる子ども</th><th>状態</th><th></th></tr>
    ${Store.parents().map(p => `<tr><td>${esc(p.name)}</td><td>${p.username}</td><td>${Store.kidsOf(p).map(k => esc(k.name)).join('、')}</td><td>${p.locked ? 'ロック中' : p.fails ? `${p.fails}回まちがい` : ''}</td>
      <td><button onclick="Store.resetPassword('${p.id}','1234').then(()=>showTeacher('acct'))">リセット</button></td></tr>`).join('')}</table>
    <h3>先生のアカウント</h3>
    <p>名前 <input id="tname" placeholder="例：先生C" style="width:10em"> <button onclick="acctTeacher()">先生を追加する</button></p>
    <table class="list"><tr><th>先生</th><th>ユーザー名</th><th>状態</th><th></th></tr>
    ${Store.teachers().map(t => `<tr><td>${esc(t.name)}</td><td>${t.username}</td><td>${t.locked ? 'ロック中' : t.fails ? `${t.fails}回まちがい` : ''}</td>
      <td>${t.id === me.id ? '（いま使っている）' : `<button onclick="Store.resetPassword('${t.id}','1234').then(()=>showTeacher('acct'))">リセット</button>`}</td></tr>`).join('')}</table>
    <p class="note">試作品では、リセットした パスワードは 1234。先生のアカウントを消す・管理者と先生を分けるのは未決。</p>
    <details><summary>かくして保管している記録（管理者だけ）：${hid.length}人</summary>
      <p class="note">退会・卒業の日から半年は、ここにだけ出します（先生の一覧や保護者のページには出ません）。半年たったら、記録を本当に消します（ルトの記録・Eラーニングの記録・マネーラボの株や交換も）。</p>
      <table class="list"><tr><th>子ども</th><th>ユーザー名</th><th>退会・卒業</th><th>本当に消す日</th><th></th></tr>
      ${hid.map(c => `<tr><td>${esc(c.name)}</td><td>${c.username}</td><td>${c.closed.kind}（${ymdS(c.closed.at)}）</td><td>${ymdS(Store.purgeDay(c))}</td>
        <td><button onclick="if(confirm('元にもどします'))Store.reopen('${c.id}'),showTeacher()">元にもどす</button></td></tr>`).join('') || '<tr><td colspan="5">ありません</td></tr>'}</table></details>`;
}
// きょうだい：名前を打つと、もう入っている子の候補を下に出す。えらんだ子の保護者のアカウントに つなぐ
let sibPick = null;
const sibKey = s => s.replace(/[\s　]/g, '');
function sibSuggest() {
  const box = $('#sibList'), v = sibKey($('#nsib').value); sibPick = null;
  if (!box) return;
  const hit = v ? Store.children().filter(c => sibKey(c.name).includes(v)).slice(0, 8) : [];
  box.innerHTML = hit.map(c => `<button type="button" onmousedown="event.preventDefault()" onclick="sibChoose('${c.id}')">${esc(c.name)}（${c.grade}年・${c.username}）</button>`).join('') || (v ? '<span class="note">その名前の子は いません</span>' : '');
}
function sibChoose(id) {
  const c = Store.get().users.find(u => u.id === id), p = Store.parents().find(x => Store.kidsOf(x).some(k => k.id === id));
  sibPick = id; $('#nsib').value = c.name;
  $('#sibList').innerHTML = `<span class="note">→ ${esc(c.name)} の保護者（${p ? p.username : '？'}）のアカウントで 見られるようにします</span>`;
}
async function acctOpen() {
  const name = $('#nname').value.trim(), grade = +$('#ngrade').value, sib = $('#nsib').value.trim(), startG = +$('#nstart').value || grade;
  if (!name) { acctMsg = '<p class="msg">名前を入れてください</p>'; return showTeacher(); }
  let par = '';
  if (sib) {
    const same = Store.children().filter(c => sibKey(c.name) === sibKey(sib)), id = sibPick || (same.length === 1 ? same[0].id : null);
    const p = id && Store.parents().find(x => Store.kidsOf(x).some(k => k.id === id));
    if (!p) { acctMsg = '<p class="msg">きょうだいは、名前を打って 下に出る候補から えらんでください（いなければ 空に する）</p>'; return showTeacher(); }
    par = p.username;
  }
  sibPick = null;
  const r = await Store.openAccount(name, grade, par);
  if (r.error) { acctMsg = `<p class="msg">${r.error}</p>`; return showTeacher(); }
  // すすみぐあいは その学年の スタートから（2026年11月13日）。あとで「子どもごと」→「すすみぐあいの調整」で 変えられる
  const nk = Store.get().users.find(u => u.username === r.username); if (nk) applyStart(nk.id, startG, me.id);
  acctMsg = `<div class="msg"><p><b>${esc(name)}（${grade}年）の口座を作りました。</b>すすみぐあいは「${startG}年の スタート」から。この画面を閉じると、パスワードはもう出ません。紙に書いて手わたしてください。</p>
    <table class="list"><tr><th></th><th>ユーザー名</th><th>初期パスワード</th></tr><tr><td>子ども</td><td>${r.username}</td><td>${r.pw}</td></tr><tr><td>保護者</td><td>${r.parent}</td><td>${r.ppw || '（きょうだいと同じ。いまの パスワードの まま）'}</td></tr></table></div>`;
  showTeacher(); acctMsg = '';
}
async function acctTeacher() {
  const name = $('#tname').value.trim(); if (!name) { acctMsg = '<p class="msg">名前を入れてください</p>'; return showTeacher(); }
  const r = await Store.openTeacher(name);
  acctMsg = `<div class="msg"><p><b>${esc(name)} を追加しました。</b>ユーザー名 <b>${r.username}</b>　初期パスワード <b>${r.pw}</b>（この画面を閉じると、もう出ません）</p></div>`;
  showTeacher(); acctMsg = '';
}
function acctRename(id) {
  const c = Store.get().users.find(u => u.id === id), n = prompt('新しい名前（試作品では架空の名前）', c.name);
  if (n && n.trim()) { Store.rename(id, n.trim()); showTeacher(); }
}
function acctClose(id, kind) {
  const c = Store.get().users.find(u => u.id === id), at = $('#cd_' + id).value;
  if (!at) return alert('日にちを入れてください');
  // 2段階：①のこっている ルトを見て「確認した」をおす → ②「退会（卒業）にする」が おせるようになる
  const a = MoneyLab.assets(id), wait = MoneyLab.exchanges().filter(e => e.child === id && e.status !== '渡した' && e.status !== 'キャンセル').length;
  closeReq = { id, kind, at };
  $('#cert').innerHTML = `<div class="msg closebox"><p><b>${esc(c.name)} を ${ymdS(at)} で${kind}にします。</b></p>
    <table class="list" style="max-width:520px"><tr><th>のこっている ルト</th><th></th></tr>
      <tr><td>普通預金</td><td>${n0(a.savings + a.reserved)} ルト</td></tr><tr><td>定期預金</td><td>${n0(a.time)} ルト</td></tr><tr><td>株（ETF・セクター株）</td><td>${n0(a.stocks)} ルト</td></tr>
      <tr><td><b>総資産</b></td><td><b>${n0(a.total)} ルト</b></td></tr></table>
    <p>${ymdS(at)} を過ぎると、アカウントが止まり、<b>この ルトは なくなります</b>${kind === '卒業' ? '（修了証に「総資産○○ルト」と書く）' : ''}。${kind === 'スポット移行' ? '<b>スポット会員には ルトが ありません</b>（Eラーニング・マネーラボは 使わない）。レギュラーに もどるときは、新しく 口座を 作って 0ルトから。' : ''}${wait ? `<b>まだ渡していない物品が ${wait}件 あります。</b>` : ''}その日までは、交換できます。</p>
    <p><button onclick="this.disabled=true;document.getElementById('close2').disabled=false">① のこりの ルトを 確認した</button>
      <button id="close2" class="primary" disabled onclick="acctCloseDo()">② ${kind}にする</button>
      <button onclick="closeReq=null;document.getElementById('cert').innerHTML=''">やめる</button></p></div>`;
  $('#cert').scrollIntoView({ block: 'center' });
}
let closeReq = null;
function acctCloseDo() { if (!closeReq) return; Store.closeAccount(closeReq.id, closeReq.kind, closeReq.at); closeReq = null; showTeacher(); }
// 修了証に書く文（仕様書 2章：残りは修了証に「総資産○○ルト」と記載）。卒業の日に出す
function acctCert(id) {
  const c = Store.get().users.find(u => u.id === id), a = MoneyLab.assets(id);
  $('#cert').innerHTML = `<div class="msg"><p><b>修了証に書く文（${ymdS(Store.today())}の数字）</b></p><p>${esc(c.name)} さん　ROOTマネーラボ　総資産 ${Math.round(a.total).toLocaleString()} ルト</p>
    <p class="note">株の値段で変わるので、卒業の日に出してください。紙の明細は出しません（修了証だけ）。</p></div>`;
}
// ほかのタブでデータが変わったとき：いま見ている画面を新しい数字で出しなおす（問題をといている途中はそのまま）
window.onStoreChanged = () => {
  if (!me) return;
  me = Store.get().users.find(u => u.id === me.id) || me;
  if (me.role === 'teacher') return showTeacher();
  if (me.role === 'parent') return route();
  if (document.querySelector('main.ml')) { if (!(mlT && mlT.step === 2)) showAccount(); }
  else if (document.querySelector('.units') && !document.querySelector('.q')) showTop();
  else { const r = document.querySelector('header .ruto b'); if (r) r.textContent = Store.balance(me.id); }
};

// ================= はじめ =================
// 全部のファイル（マネーラボの部品も）を読みこんでから始める
window.addEventListener('DOMContentLoaded', () => Store.init().then(() => {
  MoneyLab.state();   // マネーラボのデータがまだなければ、ここで作って保存する
  const id = sessionStorage.getItem('me');
  me = id ? Store.get().users.find(u => u.id === id) : null;
  if (me && Store.stopped(me)) { me = null; sessionStorage.removeItem('me'); }   // 退会・卒業で止まったアカウントは入れない
  touch(); route();
}));
