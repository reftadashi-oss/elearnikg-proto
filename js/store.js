// データの置き場（試作品はブラウザの localStorage だけ。外には送らない）
// 本番では教室のサーバー（PostgreSQL）に置きかえる。名前はすべて架空。
const Store = (() => {
  const KEY = 'root-elearning-proto-v1';
  let S = null;

  const pad = n => String(n).padStart(2, '0');
  const dayOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => dayOf(new Date());

  // パスワードはハッシュにしてしまう（試作品は SHA-256。本番は bcrypt など）
  async function hash(pw, salt) {
    const data = new TextEncoder().encode(salt + ':' + pw);
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', data);
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381; for (const b of data) h = ((h << 5) + h + b) | 0; return 'x' + (h >>> 0).toString(16); // 予備（試作品だけ）
  }

  let lastText = null; // このタブが最後に読んだ／書いたデータ
  const save = () => { try { lastText = JSON.stringify(S); localStorage.setItem(KEY, lastText); } catch (e) { console.warn('保存できませんでした', e); } };
  function load() { try { const t = localStorage.getItem(KEY); lastText = t; return t ? JSON.parse(t) : null; } catch (e) { return null; } }

  // ほかのタブが保存していたら読みなおす。ファイルを直接開いたとき（file://）は知らせ（storage）が来ないことがあるので、
  // 1秒ごと・タブを切りかえたとき・保存する前にも確かめる
  // プログラムの版（index.html の ?v=）。ほかのタブで新しい版が開かれたら、このタブも読みなおす（古いプログラムで処理しないため）
  const VER_KEY = 'root-elearning-proto-ver';
  const VER = Number((/[?&]v=(\d+)/.exec((document.currentScript || {}).src || '') || [])[1] || 0);
  try { if (VER > Number(localStorage.getItem(VER_KEY) || 0)) localStorage.setItem(VER_KEY, String(VER)); } catch (e) {}
  function sync() {
    // 読みなおしは、その版につき1回だけ（読みなおしても古い版のままのとき、ずっと読みなおし続けないように）
    try {
      const want = Number(localStorage.getItem(VER_KEY) || 0);
      if (VER && want > VER) {
        const k = 'root-elearning-reloaded-' + want;
        if (!sessionStorage.getItem(k)) { sessionStorage.setItem(k, '1'); location.reload(); return false; }
        if (!document.getElementById('verWarn') && document.body) {
          const d = document.createElement('div'); d.id = 'verWarn';
          d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99;background:#c0392b;color:#fff;padding:8px 16px;font-size:15px;';
          d.textContent = 'このタブは古い版です。Ctrl+F5 を押すか、このタブを閉じてください。';
          document.body.appendChild(d);
        }
      }
    } catch (e) {}
    let t; try { t = localStorage.getItem(KEY); } catch (e) { return false; }
    if (!t || t === lastText) return false;
    try { S = JSON.parse(t); lastText = t; } catch (e) { return false; }
    if (window.onStoreChanged) window.onStoreChanged();
    return true;
  }
  setInterval(sync, 1000);
  window.addEventListener('focus', sync);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });

  // ---- 架空の人（ユーザー名に子どもの名前を使わない：仕様書 2-1） ----
  const CHILDREN = [
    // units＝見本の 記録で やる 単元。その学年の スタートの 単元に した（2026年11月13日。前は どの学年も 1年の たし算などで、6年生が 1年の 勉強を して いた）
    { id: 'c1', username: 'r101', name: '佐藤 そうた', grade: 1, skill: 0.88, units: ['m1-a69', 'm2-a79', 'k10-1'] },
    { id: 'c2', username: 'r102', name: '鈴木 ひなた', grade: 2, skill: 0.85, units: ['m2-a108', 'm4-1', 'k9-1'] },
    { id: 'c3', username: 'r103', name: '高橋 ゆい', grade: 3, skill: 0.72, units: ['m2-11', 'm6-1', 'k8-1'] },
    { id: 'c4', username: 'r104', name: '田中 れん', grade: 4, skill: 0.9, units: ['m6-4', 'm11-2', 'k7-1'] },
    { id: 'c5', username: 'r105', name: '伊藤 みお', grade: 5, skill: 0.93, units: ['m9-3', 'm14-2', 'k6-1'] },
    { id: 'c6', username: 'r106', name: '山本 はると', grade: 6, skill: 0.8, units: ['m10-1', 'm14-6', 'k5-1'] },
  ];
  const seedUnits = c => { const us = c.units.filter(u => UNITS[u]); return us.length ? us : ['m2-1']; };   // 単元の 番号が 変わっても 止まらないように

  async function seed() {
    S = { users: [], attempts: [], ledger: [], attendance: {}, settings: { holiday: false }, seq: 1, made: new Date().toLocaleString('ja-JP') };
    for (const c of CHILDREN) S.users.push({ id: c.id, username: c.username, role: 'child', name: c.name, grade: c.grade, salt: c.id, pw: await hash('1234', c.id), fails: 0, locked: false });
    S.users.push({ id: 't1', username: 'sensei1', role: 'teacher', name: '先生A', salt: 't1', pw: await hash('sensei', 't1'), fails: 0, locked: false });
    S.users.push({ id: 't2', username: 'sensei2', role: 'teacher', name: '先生B', salt: 't2', pw: await hash('sensei', 't2'), fails: 0, locked: false });
    for (const c of CHILDREN) { const id = 'p' + c.id.slice(1); S.users.push({ id, username: 'hogo' + c.username.slice(1), role: 'parent', name: c.name.split(' ')[0] + 'さんの保護者', child: c.id, salt: id, pw: await hash('hogo', id), fails: 0, locked: false }); }

    // 過去60日分の架空の記録を、ルトの決まり（rules.js）を通して作る
    const now = new Date(), days = [];
    for (let i = 60; i >= 0; i--) { const d = new Date(now); d.setDate(d.getDate() - i); if (d.getDay() !== 0 && d.getDay() !== 6) days.push(d); }
    for (const c of CHILDREN) {
      S.attendance[c.id] = [];
      days.forEach((d, i) => {
        const isToday = i === days.length - 1;
        const last3 = c.id === 'c4' && !isToday && i >= days.length - 4; // れん：最後の3回の来た日は0回（声かけリストに出る）
        if (!isToday && !last3 && Math.random() < 0.3) return;
        if (isToday && c.id === 'c6') return; // はるとは今日お休み
        const day = dayOf(d);
        S.attendance[c.id].push(day);
        if (isToday) return; // 今日の分はあとで
        const n = last3 ? 0 : [0, 1, 2, 2, 2, 3][Math.floor(Math.random() * 6)];
        const us = seedUnits(c);
        for (let k = 0; k < n; k++) simulate(c, us[Math.floor(Math.random() * us.length)], d, 15 + k);
      });
    }
    // 今日の分と「注意」に出る例
    const T = new Date();
    simulate(CHILDREN[0], seedUnits(CHILDREN[0])[0], T, 15);
    simulate(CHILDREN[1], UNITS['m1-a102'] ? 'm1-a102' : seedUnits(CHILDREN[1])[0], T, 15, { fast: true, skill: 0.3 });   // はじめての 単元で（おしまいの 単元だと 無効に ならない） // 連打してまちがえた例                 // ひなた：早押し
    const yui = seedUnits(CHILDREN[2]).slice(-1)[0];
    simulate(CHILDREN[2], yui, T, 15, { skill: 0.4 });                 // ゆい：続けて届かない
    simulate(CHILDREN[2], yui, T, 16, { skill: 0.4 });
    await addTester();
    await addGuests();
    S.seedStart = true;   // 2年生から上は、その学年の スタートから（app.js の seedStartApply が 1回だけ 入れる）
    S.attendance.c4 = S.attendance.c4.filter(d => d !== today());         // れんは今日はまだ来ていない
    if (typeof MoneyLab !== 'undefined') MoneyLab.state();                              // マネーラボ（はるとの6年分）も作る
    save();
  }

  function simulate(c, unitId, date, hour, opt = {}) {
    const u = UNITS[unitId], skill = opt.skill || c.skill;
    const qs = u.make(new Set()).map(q => {
      const ok = Math.random() < skill;
      const first = ok ? q.answer.slice() : q.answer.map(a => typeof a === 'number' ? a + 1 : a.slice(0, -1) + 'ゑ');
      return { text: q.text, boxes: q.boxes, first, correct: q.answer, ok, fixed: false, ms: opt.fast ? 900 : 3000 + Math.random() * 9000 };
    });
    const d = new Date(date); d.setHours(hour, Math.floor(Math.random() * 60));
    const r = Rules.judge({ history: attemptsOf(c.id), unit: u, qs, day: dayOf(d), holiday: false });
    if (r.passed) qs.forEach(q => { if (!q.ok) q.fixed = true; });
    addAttempt(c.id, Object.assign(r, { at: d.toISOString(), questions: qs }));
  }

  function addAttempt(childId, a) {
    a.id = 'a' + (S.seq++); a.child = childId;
    S.attempts.push(a);
    const amount = a.ruto + a.bonus;
    if (a.kind === 'ruto' && amount > 0) S.ledger.push({ child: childId, at: a.at, amount, attempt: a.id, memo: (a.bonus ? '点数アップ+1 ' : '') + 'Eラーニング' });
    save();
    return a;
  }

  const attemptsOf = childId => S.attempts.filter(a => a.child === childId).sort((x, y) => x.at < y.at ? -1 : 1);
  const balance = childId => S.ledger.filter(l => l.child === childId).reduce((s, l) => s + l.amount, 0);

  // ---- ログイン（5回まちがえたらロック） ----
  async function login(username, pw) {
    const u = S.users.find(x => x.username === username.trim());
    if (!u) return { ok: false, msg: 'ユーザー名かパスワードがちがいます' };
    if (stopped(u)) return { ok: false, msg: 'このアカウントは もう つかえません（退会・卒業・スポット会員）' };
    if (u.locked) return { ok: false, locked: true };
    if (await hash(pw, u.salt) === u.pw) { u.fails = 0; save(); return { ok: true, user: u }; }
    u.fails++; if (u.fails >= 5) u.locked = true; save();
    return { ok: false, locked: u.locked, msg: 'ユーザー名かパスワードがちがいます', left: 5 - u.fails };
  }
  // ---- アカウント（マネーラボ仕様書 2章・8-2、Eラーニング仕様書 2-1） ----
  // 開設：ユーザー名は名前を使わず番号（r107…）、初期パスワードは数字4けたを自動で作る（仮）。保護者のアカウントもいっしょに作る
  const pin = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 10000).padStart(4, '0');
  // sibling：きょうだいがいるときは、上の子の保護者のユーザー名（hogo101 など）。その保護者のアカウントで、きょうだい全員を見られる
  async function openAccount(name, grade, sibling) {
    let par = null;
    if (sibling) { par = S.users.find(u => u.role === 'parent' && u.username === sibling.trim()); if (!par) return { error: 'その保護者のユーザー名は ありません' }; }
    const nums = S.users.filter(u => /^r\d+$/.test(u.username)).map(u => +u.username.slice(1));
    const no = Math.max(100, ...nums, ...(S.gone || [])) + 1, id = 'c' + (S.seq++);
    const pw = pin(), must = !!(S.settings && S.settings.mustChange);
    S.users.push({ id, username: 'r' + no, role: 'child', name, grade, salt: id, pw: await hash(pw, id), fails: 0, locked: false, opened: today(), mustChange: must });
    S.attendance[id] = [];
    if (par) { par.kids = kidIds(par).concat(id); save(); return { username: 'r' + no, pw, parent: par.username, ppw: null }; }
    const pid = 'p' + id.slice(1), ppw = pin();
    S.users.push({ id: pid, username: 'hogo' + no, role: 'parent', name: name.split(' ')[0] + 'さんの保護者', child: id, kids: [id], salt: pid, pw: await hash(ppw, pid), fails: 0, locked: false, mustChange: must });
    save();
    return { username: 'r' + no, pw, parent: 'hogo' + no, ppw };
  }
  // 先生のアカウント（ユーザー名は sensei＋番号。初期パスワードは数字4けた：仮）
  async function openTeacher(name) {
    const nums = S.users.filter(u => /^sensei\d+$/.test(u.username)).map(u => +u.username.slice(6));
    const no = Math.max(0, ...nums) + 1, id = 't' + (S.seq++), pw = pin();
    S.users.push({ id, username: 'sensei' + no, role: 'teacher', name, salt: id, pw: await hash(pw, id), fails: 0, locked: false, mustChange: !!(S.settings && S.settings.mustChange) });
    save(); return { username: 'sensei' + no, pw };
  }
  const kidIds = p => p.kids || (p.child ? [p.child] : []);
  // 保護者が見られる子ども（止まった子はのぞく）
  const kidsOf = p => kidIds(p).map(id => S.users.find(u => u.id === id)).filter(c => c && !(c.closed && c.closed.at < today()));
  function setGrade(id, g) { const u = S.users.find(x => x.id === id); u.grade = Math.min(6, Math.max(1, g)); save(); }
  function rename(id, name) { const u = S.users.find(x => x.id === id); u.name = name; save(); }
  // 進級：退会・卒業していない子の学年を1つ上げる。6年生はそのまま（卒業の手続きをする）
  function promoteAll() { let n = 0; S.users.filter(u => u.role === 'child' && !u.closed && u.grade < 6).forEach(u => { u.grade++; n++; }); S.lastPromote = today(); save(); return n; }
  async function changePassword(id, pw) { const u = S.users.find(x => x.id === id); u.pw = await hash(pw, u.salt); u.mustChange = false; save(); }
  // 退会・卒業：その日までは使える（退会は、退会月の最終登所日まで交換できる）。その日を過ぎたら止める（ログインできない・一覧に出ない）。
  // 止めたあと半年は「かくして保管」（管理者だけが元にもどせる）。半年たったら本当に消す
  const stopC = c => !!(c && c.closed && c.closed.at < today());
  // 保護者は、見られる子どもが1人もいなくなったら止まる
  const stopped = u => !u ? false : u.role === 'parent' ? kidIds(u).every(id => stopC(S.users.find(x => x.id === id))) : stopC(u);
  function closeAccount(id, kind, at) { const u = S.users.find(x => x.id === id); u.closed = { kind, at, set: today() }; save(); }
  function reopen(id) { const u = S.users.find(x => x.id === id); delete u.closed; save(); }
  const purgeDay = u => { const d = new Date(u.closed.at + 'T00:00:00'); d.setMonth(d.getMonth() + 6); return dayOf(d); };
  function purge() {
    const gone = S.users.filter(u => u.role === 'child' && u.closed && purgeDay(u) <= today()).map(u => u.id);
    if (!gone.length) return;
    S.gone = (S.gone || []).concat(S.users.filter(u => gone.includes(u.id)).map(u => +u.username.slice(1)));   // 同じ番号をもう使わない
    S.users.filter(u => u.role === 'parent').forEach(p => { p.kids = kidIds(p).filter(id => !gone.includes(id)); p.child = p.kids[0]; });
    S.users = S.users.filter(u => !gone.includes(u.id) && !(u.role === 'parent' && !u.kids.length));
    S.attempts = S.attempts.filter(a => !gone.includes(a.child)); S.ledger = S.ledger.filter(l => !gone.includes(l.child));
    for (const k of ['typing', 'html']) if (S[k]) S[k] = S[k].filter(r => !gone.includes(r.child));   // タイピングの 記録・HTMLの 作品も 消す
    gone.forEach(id => { delete S.attendance[id]; if (S.road) delete S.road[id]; });
    const ml = S.ml; if (ml) {
      gone.forEach(id => { if (ml.hold) delete ml.hold[id]; if (ml.snap) delete ml.snap[id]; });
      ['orders', 'time', 'ex'].forEach(k => { if (ml[k]) ml[k] = ml[k].filter(x => !gone.includes(x.child)); });
    }
    save();
  }
  async function resetPassword(userId, pw) { const u = S.users.find(x => x.id === userId); u.pw = await hash(pw, u.salt); u.fails = 0; u.locked = false; u.mustChange = !!(S.settings && S.settings.mustChange); save(); }

  // ほかのタブで保存されたら、このタブのデータも読みなおす（古いデータで上書きしないため）
  window.addEventListener('storage', e => { if (e.key === KEY) sync(); });

  // テスト用の アカウント（2026年11月15日 社長）：ぜんぶの 単元が はじめから ひらく（app.js の me.test）。先生の 一覧・マネーラボには 出さない。
  // 試作品だけの もの。本番には 作らない。名前は 本物の 人の 名前に しない（公開の リポジトリに 入るため）
  const TESTERS = [{ id: 'x1', username: 'admin', name: 'テスト①（全単元）' }, { id: 'x2', username: 'admin1234', name: 'テスト②（全単元）' }];
  async function addTester() {
    let added = false;
    for (const t of TESTERS) {
      const old = S.users.find(u => u.username === t.username);
      if (old) { if (old.test && (!S.attendance[old.id] || old.name !== t.name)) { S.attendance[old.id] = S.attendance[old.id] || []; old.name = t.name; added = true; } continue; }
      S.users.push({ id: t.id, username: t.username, role: 'child', test: true, name: t.name, grade: 6, salt: t.id, pw: await hash('admin', t.id), fails: 0, locked: false });
      S.attendance[t.id] = S.attendance[t.id] || []; added = true;
    }
    return added;
  }
  // 遠くに 住む 親戚の 子に 使って もらう アカウント（2026年11月17日 社長）。どの 端末でも 同じ アカウントで 入れるよう、ここに 書く。
  // 本名を 出す ことは 社長が 了承した（2026年11月17日）。年長・年少の 子なので、画面の 上には 学年の かわりに label を 出す。内容は ふつうの 1年生として 進む。自動ログアウト しない（app.js の noIdle）
  const GUESTS = [{ id: 'g1', username: 'miyu', name: '村上 望悠', ruby: '{村上|むらかみ} {望悠|みゆ}', label: '{年長|ねんちょう}' }, { id: 'g2', username: 'sawa', name: '村上 沙環', ruby: '{村上|むらかみ} {沙環|さわ}', label: '{年少|ねんしょう}' }];
  async function addGuests() {
    let added = false;
    for (const t of GUESTS) {
      const old = S.users.find(u => u.username === t.username);
      if (old) { if (old.noIdle && (old.name !== t.name || old.label !== t.label || old.ruby !== t.ruby)) { old.name = t.name; old.label = t.label; old.ruby = t.ruby; added = true; } continue; }
      S.users.push({ id: t.id, username: t.username, role: 'child', noIdle: true, name: t.name, ruby: t.ruby, label: t.label, grade: 1, salt: t.id, pw: await hash('1234', t.id), fails: 0, locked: false, opened: today() });
      S.attendance[t.id] = S.attendance[t.id] || []; added = true;
    }
    return added;
  }
  async function init() { S = load(); if (!S) await seed(); else { const a = await addTester(), b = await addGuests(); if (a || b) save(); } purge(); }
  // 架空のデータを 作りなおす。先生が 変えた ロードマップ（plan・startDef・planLog）は のこす（2026年11月15日）
  async function reset() { const keep = S ? { plan: S.plan, startDef: S.startDef, planLog: S.planLog } : {}; localStorage.removeItem(KEY); await seed(); Object.entries(keep).forEach(([k, v]) => { if (v) S[k] = v; }); save(); }

  return { init, reset, save, get: () => S, today, dayOf, attemptsOf, balance, addAttempt, login, resetPassword,
    openAccount, closeAccount, reopen, stopped, purgeDay, purge, openTeacher, kidsOf, setGrade, rename, promoteAll, changePassword,
    parents: () => S.users.filter(u => u.role === 'parent' && !stopped(u)), teachers: () => S.users.filter(u => u.role === 'teacher'),
    children: () => S.users.filter(u => u.role === 'child' && !u.test && !stopped(u)),
    hidden: () => S.users.filter(u => u.role === 'child' && stopped(u)) };
})();
