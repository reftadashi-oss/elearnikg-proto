// ルトの決まり（仕様書 4-3・4-3-2・4-4）。画面から切りはなしてある（本番は Python に移す）。
const Rules = (() => {
  const CONFIG = {
    dailyCap: 2,          // 1日にルトがもらえる回数
    holidayCap: 4,        // 長い休みの日
    fastMs: 2000,         // 早押し：1問2秒未満
    fastCount: 3,         //   で、まちがえた答えが3問以上で無効
    sameAnswerCount: 8,   // 同じ答えばかり：10問中8問以上が同じ答えで無効（仮：仕様書は「作るときに決める」）
    weakRecent: 20,       // 苦手：最近20問の最初の答えで
    weakRate: 0.8,        //   正答率8割未満
    finRuto: 30,          // 学年の 仕上げ（50問）に 合格（8割以上）した回（2026年11月13日）。届かない回は 1（ふつうの 単元と おなじ）。1日1回・ルトの回数には 数えない
  };
  CONFIG.examRuto = 30;    // 漢検の形の まとめテストに はじめて 合格した回
  CONFIG.sofukuRuto = 5;   // 5単元ごとの 総復習（20問）に 合格した回（2026年11月19日 社長 OK）。届かない回は 1。満点の 上乗せ・点数アップは なし
  CONFIG.bigAllRuto = 5;   // 理科・社会の カテゴリーの まとめテスト（20問）に 合格した回
  const isFin =unit => unit && unit.kind === 'fin';

  const valid = a => !a.invalid;
  const unitHistory = (history, unitId) => history.filter(a => a.unit === unitId && valid(a));

  // 単元の状態：おしまい？ 再受講？ 続けて届かなかった回数
  function unitState(history, unitId) {
    const h = unitHistory(history, unitId);
    const firstPerfect = h.findIndex(a => a.perfect);
    const sp = /^sofuku-/.test(unitId);   // 総復習は 中身が 毎回 かわるので「おしまい」「もう一度」に しない（spaced.js）
    const finished = !sp && firstPerfect >= 0 && h.length - firstPerfect - 1 >= 1; // 満点のあと＋1回（復習）でおしまい
    const reviewNext = !sp && firstPerfect >= 0 && !finished;
    const last = h[h.length - 1];
    const retake = !sp && !!last && !last.passed;
    let failStreak = 0;
    for (let i = h.length - 1; i >= 0 && !h[i].passed; i--) failStreak++;
    const bonusUsed = h.some(a => a.bonus > 0);
    const best = h.reduce((m, a) => Math.max(m, a.score), 0);
    return { tries: h.length, finished, reviewNext, retake, failStreak, bonusUsed, last, best, perfect: firstPerfect >= 0 };
  }

  // 今日、ルトの回として数えた回数（合格しなかった回・無効の回も数える（無効の回は仮））
  // 学年の 仕上げは 数えない（仕上げは 1日1回で、ふだんの 回とは べつ。2026年11月13日）
  const rutoCountOn = (history, day) => history.filter(a => a.day === day && a.kind === 'ruto' && !isFin(typeof UNITS === 'object' && UNITS[a.unit])).length;
  const capFor = holiday => holiday ? CONFIG.holidayCap : CONFIG.dailyCap;

  // まじめに取り組んだか（4-3-2）
  function checkInvalid(qs) {
    // 2秒未満で、しかもまちがえた答えだけ数える（正しく速く解いた子は無効にしない。2026年11月5日決定）
    // 10問より 多い回（学年の 仕上げ）は、問題の 数に あわせて 数を ふやす
    const per = Math.max(1, qs.length / 10);
    const fast = qs.filter(q => q.ms < CONFIG.fastMs && !q.ok).length;
    if (fast >= Math.ceil(CONFIG.fastCount * per)) return '早押し';
    const cnt = {};
    qs.forEach(q => { const k = q.first.join('/'); cnt[k] = (cnt[k] || 0) + 1; });
    if (Math.max(...Object.values(cnt)) >= Math.ceil(CONFIG.sameAnswerCount * per)) return '同じ答えばかり';
    return null;
  }

  // 1回分を判定する。qs＝10問（first＝最初の答え、ok＝正解か、ms＝かかった時間）
  function judge({ history, unit, qs, day, holiday }) {
    const st = unitState(history, unit.id);
    // 漢検の形の まとめテストは 点数（1問の点数 pts）で 数える。ほかは 1問 1点
    const score = qs.reduce((s, q) => s + (q.ok ? q.pts || 1 : 0), 0);
    const total = qs.reduce((s, q) => s + (q.pts || 1), 0);
    const passed = score / total >= unit.pass;
    const perfect = score === total;
    const r = { unit: unit.id, day, score, total, passed, perfect, retake: st.retake, review: st.reviewNext, kind: 'ruto', invalid: null, ruto: 0, bonus: 0, notes: [] };

    // 学年の 仕上げ：合格したら おしまい（そのあとは 練習）
    if (isFin(unit) && history.some(a => a.unit === unit.id && a.passed && !a.invalid)) { r.kind = 'practice'; r.notes.push('合格ずみの仕上げ'); return r; }
    // 詰将棋は ルトなし（2026年11月13日 社長回答 1-2 B）。1日の ルトの回にも 数えない
    if (unit.subject === 'x4') { r.kind = 'practice'; r.notes.push('詰将棋はルトなし'); return r; }
    if (st.finished) { r.kind = 'practice'; r.notes.push('おしまいの単元'); return r; }
    if (!isFin(unit) && rutoCountOn(history, day) >= capFor(holiday)) { r.kind = 'practice'; r.notes.push('今日のルトの回数をこえた'); return r; }

    r.invalid = checkInvalid(qs);
    if (r.invalid) { r.notes.push(r.invalid + '（無効）'); return r; }

    if (isFin(unit)) {
      r.ruto = passed ? CONFIG.finRuto : (st.failStreak >= 2 ? 0 : 1);   // 点数アップの ＋1は なし
      if (passed) r.notes.push('学年の仕上げ 合格');
      return r;
    }
    if (unit.kind === 'sofuku') { r.ruto = passed ? CONFIG.sofukuRuto : 1; if (passed) r.notes.push('総復習 合格'); return r; }
    // 理科・社会の カテゴリーの まとめ（20問）：合格で 5ルト（2026年11月13日）。届かない回は ふつうと 同じ
    if (unit.big && passed) { r.ruto = CONFIG.bigAllRuto; return r; }
    // 漢検の形の まとめテスト（65〜100問）：はじめて 合格した回は 30ルト（2026年11月13日 社長）。2回目からの 合格・届かない回は ふつうと 同じ（仮）
    if (unit.exam && passed && !history.some(a => a.unit === unit.id && a.passed && !a.invalid && a.kind === 'ruto')) { r.ruto = CONFIG.examRuto; r.notes.push(unit.subject === 'kanken' ? '漢検のまとめテスト 合格' : '検定の形のまとめテスト 合格'); return r; }
    if (st.retake) {
      if (st.failStreak >= 2 && !passed) { r.ruto = 0; r.notes.push('同じ単元で続けて届かなかった（3回目から0）'); }
      else r.ruto = 1; // 再受講：やった分1、合格しても1（満点でも1）。2回続けて届かなかったあと合格した回は1（仮）
    } else {
      r.ruto = perfect ? 3 : passed ? 2 : 1;
      if (st.last && score > st.last.score && !st.bonusUsed) { r.bonus = 1; r.notes.push('点数アップ'); }
    }
    return r;
  }

  // 苦手：単元ごと（＝問題の種類）に、最近20問の最初の答えの正答率が8割未満
  function weakUnits(history) {
    const by = {};
    history.slice().reverse().forEach(a => a.questions.forEach(q => { (by[a.unit] = by[a.unit] || []).push(q.ok); }));
    return Object.entries(by).filter(([u]) => !(typeof UNITS === 'object' && UNITS[u] && UNITS[u].kind === 'fin')).map(([u, oks]) => { const r = oks.slice(0, CONFIG.weakRecent); return { unit: u, ok: r.filter(Boolean).length, n: r.length }; })
      .filter(x => x.n >= 10 && x.ok / x.n < CONFIG.weakRate);
  }

  return { CONFIG, unitState, rutoCountOn, capFor, judge, checkInvalid, weakUnits };
})();
