// 5単元ごとの 総復習（2026年11月19日）。review.js の あとに 読む。
// はじめは「合格から 1週間後・その 3週間後」の 日数で 出す 復習だったが、社長の 指示で「単元が 5つ おわったら やる」形だけに した（日数の 復習は けした）。
const Spaced = (() => {
  const realUnits = sid => { const se = SUBJECTS.flatMap(s => s.series).find(s => s.id === sid); return se ? se.units.filter(u => UNITS[u] && !UNITS[u].extra && !UNITS[u].exam && !UNITS[u].keep) : []; };
  const stem = t => t.split('<br><span class="ch">')[0];
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
  return { blocks };
})();
