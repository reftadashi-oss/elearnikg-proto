// 時間を あけた 復習（2026年11月19日）。review.js の あとに 読む。
// 合格した 単元を、合格から 1週間後に もう一度 出す。そこで その 単元の 問題が ぜんぶ 正解なら、さらに 3週間後（合格から 約1か月）に もう一度。
// まちがえた 単元は「まだ」の ままなので、つぎの 回にも また 出る。
// シリーズごとに 1つ（spaced-シリーズ）。すすみぐあいの ならびには 入れず、おすすめに だけ 出す（出す 単元が ある ときだけ）。
// 日数（7日・23日）と 1回に まぜる 単元の 数（5つまで）は 仮。
const Spaced = (() => {
  const GAPS = [7, 23];   // 合格 → 1回目まで 7日、1回目 → 2回目まで 23日（仮）
  const MAXU = 5;
  const DAY = 864e5;
  const realUnits = sid => { const se = SUBJECTS.flatMap(s => s.series).find(s => s.id === sid); return se ? se.units.filter(u => UNITS[u] && !UNITS[u].extra && !UNITS[u].exam && !UNITS[u].keep) : []; };
  // 出す 単元：[{ unit, stage（0＝1週間後・1＝1か月後）, since（いつから 数えるか） }]（古い じゅん）
  function due(sid, hist, now = Date.now()) {
    const id = `spaced-${sid}`, rev = hist.filter(a => a.unit === id && !a.invalid);
    const out = [];
    realUnits(sid).forEach(u => {
      const p = hist.find(a => a.unit === u && a.passed && !a.invalid && a.at); if (!p) return;
      // 時間を あけた 復習で、その 単元の 問題が ぜんぶ 正解だった 回
      const ok = rev.filter(a => a.at > p.at && a.questions.some(q => q.src === u) && a.questions.filter(q => q.src === u).every(q => q.ok));
      const n = ok.length; if (n >= GAPS.length) return;
      const since = n ? ok[n - 1].at : p.at;
      if (now - Date.parse(since) >= GAPS[n] * DAY) out.push({ unit: u, stage: n, since });
    });
    return out.sort((a, b) => a.since < b.since ? -1 : 1);
  }
  const stem = t => t.split('<br><span class="ch">')[0];
  function make(sid) {
    const hist = Store.attemptsOf(me.id), us = due(sid, hist).slice(0, MAXU).map(x => x.unit), qs = [], seen = new Set();
    if (!us.length) return [];
    const per = Math.ceil(10 / us.length);
    for (let round = 0; qs.length < 10 && round < 6; round++) us.forEach(u => {
      const got = shuffle(UNITS[u].make(new Set()) || []).filter(q => q && !seen.has(stem(q.text)));
      got.slice(0, round ? 1 : per).forEach(q => { if (qs.length < 10) { seen.add(stem(q.text)); qs.push({ ...q, src: u }); } });
    });
    return shuffle(qs);
  }
  // ===== 5単元ごとの 総復習（2026年11月19日 社長「5つの 単元 おわったら 総復習」）=====
  // シリーズの 単元を 合格した じゅんに 5つずつ 区切る。5つ そろった 区切りごとに、その 5単元から 20問（1単元 4問）の 総復習。
  // 合格（8割）すると その 区切りは おわり。そのとき 区切りの 5単元ぜんぶから 問題が 出て いる ことで 見る（questions[].src）。
  const BLK = 5, PER = 4;
  function blocks(sid, hist) {
    const id = `sofuku-${sid}`, done = hist.filter(a => a.unit === id && a.passed && !a.invalid);
    const first = realUnits(sid).map(u => [u, hist.find(a => a.unit === u && a.passed && !a.invalid && a.at)]).filter(x => x[1]).sort((a, b) => a[1].at < b[1].at ? -1 : 1);
    const out = [];
    for (let k = 0; (k + 1) * BLK <= first.length; k++) {
      const us = first.slice(k * BLK, (k + 1) * BLK).map(x => x[0]), end = first[(k + 1) * BLK - 1][1].at;
      if (!done.some(a => a.at > end && us.every(u => a.questions.some(q => q.src === u)))) out.push({ k, units: us });
    }
    return out;
  }
  function makeSofuku(sid) {
    const b = blocks(sid, Store.attemptsOf(me.id))[0]; if (!b) return [];
    const qs = [], seen = new Set();
    b.units.forEach(u => { let n = 0; for (let t = 0; t < 4 && n < PER; t++) shuffle(UNITS[u].make(new Set()) || []).forEach(q => { if (q && n < PER && !seen.has(stem(q.text))) { seen.add(stem(q.text)); qs.push({ ...q, src: u }); n++; } }); });
    return shuffle(qs);
  }
  SUBJECTS.forEach(s => s.series.forEach(se => {
    if (!se.units.length || !UNITS[se.units[0]]) return;
    const first = UNITS[se.units[0]], id = `sofuku-${se.id}`;
    UNITS[id] = { subject: first.subject, series: se.id, col: first.col, pass: first.pass, extra: true, kind: 'sofuku', id, name: '{総復習|そうふくしゅう}（5つの {単元|たんげん}）', make: () => makeSofuku(se.id),
      lecture: ['{合格|ごうかく}した 5つの {単元|たんげん}から、ぜんぶで 20{問|もん} {出|で}るよ。', '8{割|わり}（16{問|もん}）できたら {合格|ごうかく}。つぎの 5つが おわったら、また {総復習|そうふくしゅう}が ひらくよ。'] };
  }));
  SUBJECTS.forEach(s => s.series.forEach(se => {
    if (!se.units.length || !UNITS[se.units[0]]) return;
    const first = UNITS[se.units[0]], id = `spaced-${se.id}`;
    UNITS[id] = { subject: first.subject, series: se.id, col: first.col, pass: first.pass, extra: true, kind: 'spaced', id, name: '{時間|じかん}を あけた {復習|ふくしゅう}', make: () => make(se.id),
      lecture: ['{前|まえ}に {合格|ごうかく}した {単元|たんげん}から、10{問|もん} {出|で}るよ。わすれて いないか たしかめよう。', 'ぜんぶ できた {単元|たんげん}は、つぎは もっと あとで {出|で}るよ。まちがえた {単元|たんげん}は、また {近|ちか}いうちに {出|で}るよ。'] };
  }));
  return { due, GAPS, blocks };
})();
