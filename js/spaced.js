// 5単元ごとの 総復習（2026年11月19日）。review.js の あとに 読む。
// はじめは「合格から 1週間後・その 3週間後」の 日数で 出す 復習だったが、社長の 指示で「単元が 5つ おわったら やる」形だけに した（日数の 復習は けした）。
const Spaced = (() => {
  const realUnits = sid => { const se = SUBJECTS.flatMap(s => s.series).find(s => s.id === sid); return se ? se.units.filter(u => UNITS[u] && !UNITS[u].extra && !UNITS[u].exam && !UNITS[u].keep) : []; };
  const stem = t => t.split('<br><span class="ch">')[0];
  // ===== 5単元ごとの 総復習（2026年11月19日 社長「5つの 単元 おわったら 総復習」）=====
  // シリーズの 単元を 合格した じゅんに 5つずつ 区切る。5つ そろった 区切りごとに、その 5単元から 20問（1単元 4問）の 総復習。
  // 合格（8割）すると その 区切りは おわり。そのとき 区切りの 5単元ぜんぶから 問題が 出て いる ことで 見る（questions[].src）。
  // 2026年11月19日 社長「20問で 足りなければ 2回 連続、ちがう 問題で」→ 1つの 区切りを 2回（1回目・2回目、どちらも 20問）。2回目は 1回目と ちがう 問題。2回 合格で その 区切りは おわり。
  const BLK = 5, PER = 4, ROUNDS = 2;
  function blocks(sid, hist) {
    const id = `sofuku-${sid}`, done = hist.filter(a => a.unit === id && a.passed && !a.invalid);
    const first = realUnits(sid).map(u => [u, hist.find(a => a.unit === u && a.passed && !a.invalid && a.at)]).filter(x => x[1]).sort((a, b) => a[1].at < b[1].at ? -1 : 1);
    const out = [];
    for (let k = 0; (k + 1) * BLK <= first.length; k++) {
      const us = first.slice(k * BLK, (k + 1) * BLK).map(x => x[0]), end = first[(k + 1) * BLK - 1][1].at;
      const mine = hist.filter(a => a.unit === id && a.at > end && us.every(u => a.questions.some(q => q.src === u)));   // この 区切りの 回（合格しなかった 回も）
      const part = mine.filter(a => a.passed && !a.invalid).length;
      if (part < ROUNDS) out.push({ k, units: us, part, prev: mine });
    }
    return out;
  }
  function makeSofuku(sid) {
    const b = blocks(sid, Store.attemptsOf(me.id))[0]; if (!b) return [];
    // 前の 回（1回目など）に 出た 問題は なるべく 出さない
    const old = new Set(b.prev.flatMap(a => a.questions.map(q => stem(q.text || ''))));
    const qs = [], seen = new Set(old);
    b.units.forEach(u => { let n = 0; for (let t = 0; t < 8 && n < PER; t++) shuffle(UNITS[u].make(new Set()) || []).forEach(q => { if (q && n < PER && !seen.has(stem(q.text))) { seen.add(stem(q.text)); qs.push({ ...q, src: u }); n++; } });
      // 問題の 種類が 少ない 単元は、前の 回と 同じ 問題でも 入れる
      for (let t = 0; t < 4 && n < PER; t++) shuffle(UNITS[u].make(new Set()) || []).forEach(q => { if (q && n < PER && !qs.some(x => stem(x.text) === stem(q.text))) { qs.push({ ...q, src: u }); n++; } }); });
    return shuffle(qs);
  }
  SUBJECTS.forEach(s => s.series.forEach(se => {
    if (!se.units.length || !UNITS[se.units[0]]) return;
    const first = UNITS[se.units[0]], id = `sofuku-${se.id}`;
    UNITS[id] = { subject: first.subject, series: se.id, col: first.col, pass: first.pass, extra: true, kind: 'sofuku', id, make: () => makeSofuku(se.id),
      // 名前に「1回目・2回目」を 出す（子どもの 画面だけ。先生・保護者の 画面では 出さない）
      get name() { let p = null; try { if (me && me.role === 'child') { const b = blocks(se.id, Store.attemptsOf(me.id))[0]; if (b) p = b.part; } } catch (e) { } return `{総復習|そうふくしゅう}（5つの {単元|たんげん}${p === null ? '' : `・${p + 1}{回目|かいめ}`}）`; },
      lecture: ['{合格|ごうかく}した 5つの {単元|たんげん}から 20{問|もん} {出|で}るよ。{総復習|そうふくしゅう}は 2{回|かい}。2{回目|かいめ}は 1{回目|かいめ}と ちがう {問題|もんだい}だよ。', '8{割|わり}（16{問|もん}）できたら {合格|ごうかく}で 5ルト もらえるよ。2{回|かい} {合格|ごうかく}したら おわり。つぎの 5つが おわったら、また {総復習|そうふくしゅう}が ひらくよ。'] };
  }));
  return { blocks };
})();
