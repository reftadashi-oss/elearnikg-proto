// ROOTマネーラボの決まり（マネーラボ仕様書 v2.4 の 3-2・3-3・5-1〜5-4）。画面から切りはなしてある。
// 試作品では株価は乱数で動かす（本番は実際の業種別ETFの変化率）。数字はすべて「仮」。
const MoneyLab = (() => {
  const C = {
    rateSavings: 0.002, rateTime: 0.005, timeMonths: 3,       // 普通 月0.2%、定期 月0.5%・3か月
    capLow: 0.25, capHigh: 0.75,                             // 投資上限：1年 0（貯金だけ）、2年 1/4、3年から 3/4（現金を1/4残す。2026年11月5日）
    dpsMonth: 3,                                             // 1株あたりの配当を決める月（4月。1年間固定）
    etfFee: 0.002, etfFactor: 0.5, etfMaxWeek: 0.05,         // ETF：信託報酬 月0.2%、週の変化＝平均×0.5、±5%まで
    etfDigits: 4, etfPrice0: 50, splitThreshold: 300,        // 口数は小数4けた、分割は300をこえたら（仮）
    reserveRate: 1.1,                                        // 買い注文の取り置き＝株数×今の値段×1.1
  };
  // 10セクター（名前は仕様書4章）。最初の株価・配当率・値動きの大きさは仮
  const SECTORS = [
    ['food', '{食品|しょくひん}', 120, 0.005, 0.02], ['drug', '{薬|くすり}', 150, 0.005, 0.02],
    ['auto', '{自動車|じどうしゃ}', 100, 0.009, 0.04], ['elec', '{電気製品|でんきせいひん}', 200, 0.002, 0.035],
    ['play', '{遊|あそ}び・{通信|つうしん}', 180, 0.002, 0.035], ['power', '{電気|でんき}・ガス', 60, 0.01, 0.02],
    ['rail', '{鉄道|てつどう}・{運送|うんそう}', 90, 0.005, 0.025], ['shop', 'お{店|みせ}', 80, 0.002, 0.03],
    ['bank', '{銀行|ぎんこう}', 50, 0.01, 0.05], ['oil', '{石油|せきゆ}・エネルギー', 70, 0.01, 0.05],
  ].map(([id, name, p0, div, vol]) => ({ id, name, p0, div, vol }));
  const SEC = Object.fromEntries(SECTORS.map(s => [s.id, s]));
  const ETF_NAME = 'ETF「ROOT10」';

  const floor4 = x => Math.floor(x * 1e4 + 1e-9) / 1e4;
  const S = () => {
    const st = Store.get();
    if (!st.ml) st.ml = { week: 0, month: 0, prices: Object.fromEntries(SECTORS.map(s => [s.id, s.p0])), prev: {}, etf: C.etfPrice0, etfPrev: C.etfPrice0, orders: [], hold: {}, time: [], log: [], seq: 1, cal: new Date().getMonth() };
    if (!st.ml.dps) st.ml.dps = Object.fromEntries(SECTORS.map(s => [s.id, Math.round(Math.round(st.ml.prices[s.id]) * s.div * 100) / 100]));
    if (!st.ml.history) {
      if (st.ml.week === 0 && !st.ml.orders.length) { st.ml.history = []; longRun(st.ml); }   // 新しく作るとき：6年分を動かす
      else st.ml.history = pastHistory(st.ml, 52);
      Store.save();   // 作ったらすぐ保存（ほかのタブが別のデータを作らないように）
    }
    return st.ml;
  };
  // ---- 試作品：6年生（c6）が1年生から6年間ためて運用してきた口座を作る（行動はすべて仮） ----
  let clock = null; // 記録の日時（6年分を作るあいだだけ過去の日付にする）
  const logDay = () => { const d = clock || new Date(); return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`; };
  function longRun(ml) {
    const WEEKS = 312, kid = 'c6', save = Store.save; Store.save = () => {};
    ml.week = -WEEKS; ml.cal = new Date(Date.now() - WEEKS * 7 * 864e5).getMonth(); ml.history.push({ week: ml.week, prices: Object.assign({}, ml.prices), etf: ml.etf });
    const start = new Date(); start.setDate(start.getDate() - WEEKS * 7);
    let lastMonth = start.getMonth();
    const goods = [[50, '{交換|こうかん}：ROOT{鉛筆|えんぴつ}'], [150, '{交換|こうかん}：ROOT{消|け}しゴム'], [250, '{交換|こうかん}：{缶|かん}バッジ'], [400, '{交換|こうかん}：ROOTノート'], [300, '{交換|こうかん}：ROOTシャーペン']];
    let gi = 0;
    for (let w = 1; w <= WEEKS; w++) {
      clock = new Date(start); clock.setDate(start.getDate() + w * 7);
      const grade = Math.min(6, 1 + Math.floor((w - 1) / 52));
      const pick = arr => arr[Math.floor(Math.random() * arr.length)];
      if (clock.getMonth() !== lastMonth) {                        // 月が変わった → 月末の処理と、その月の行動
        lastMonth = clock.getMonth(); monthEnd([kid]);
        if (grade >= 3 && clock.getMonth() % 2 === 0) {          // 2か月に1回、セクター株（安めの銘柄から）
          const cheap = SECTORS.filter(s => disp(s.id) * C.reserveRate <= capLeft(kid, grade) * 0.7);
          if (cheap.length) { const s = pick(cheap), n = Math.floor(capLeft(kid, grade) * 0.5 / (disp(s.id) * C.reserveRate));
            place(kid, grade, { side: 'buy', asset: s.id, shares: Math.max(1, Math.min(n, 6)), purpose: pick(['{配当|はいとう}', '{値上|ねあ}がり']), reason: pick(['ニュースを見た', '配当がほしい', '安くなっていた']) }); }
        }
        if (grade === 1 && (clock.getMonth() === 3 || clock.getMonth() === 9)) { const amt = Math.floor(savings(kid) * 0.3); if (amt >= 10) toTime(kid, amt); }   // 1年生は貯金だけ（定期預金）
        const etfAmt = Math.floor(Math.min(capLeft(kid, grade) * (grade <= 2 ? 0.6 : 0.2), savings(kid) * 0.3));
        if (etfAmt >= 10) place(kid, grade, { side: 'buy', asset: 'etf', amount: etfAmt, purpose: '{長|なが}く{持|も}つ', reason: 'こつこつ' });
        if (grade >= 3 && (clock.getMonth() === 3 || clock.getMonth() === 9)) { const amt = Math.floor(savings(kid) * 0.3); if (amt >= 10) toTime(kid, amt); }   // 4月に定期
        if (clock.getMonth() === 9 && grade >= 4) {                // 10月に、もうかっている株を1つ売る
          const h = H(kid), best = Object.entries(h.sec).filter(([id, x]) => x.shares * disp(id) > x.cost).sort((a, b) => b[1].shares - a[1].shares)[0];
          if (best) place(kid, grade, { side: 'sell', asset: best[0], shares: Math.ceil(best[1].shares / 2) });
        }
        if (clock.getMonth() === 7 && h0(kid) > 0) {                 // 夏に ETF を少し売る（5年生から）
          if (grade >= 5) place(kid, grade, { side: 'sell', asset: 'etf', amount: 100, all: false });
        }
        if (clock.getMonth() === 11 && gi < goods.length && savings(kid) > goods[gi][0] * 2) { pay(kid, -goods[gi][0], goods[gi][1]); gi++; }   // 12月に物品と交換
      }
      pay(kid, rand10(), 'Eラーニング（1{週間|しゅうかん}ぶん）');
      monday(true);
    }
    clock = null; Store.save = save; ml.week = 0; ml.month = 0; ml.history.forEach((h, i) => h.week = i - WEEKS);
  }
  const h0 = kid => H(kid).etf.units;
  const rand10 = () => 6 + Math.floor(Math.random() * 9);   // 1週間のルト（仮：6〜14）
  // 値段の記録（週ごと）。試作品では、今の値段から1年前までをさかのぼって乱数で作る
  function pastHistory(ml, n) {
    const out = [{ week: ml.week, prices: Object.assign({}, ml.prices), etf: ml.etf }];
    let p = Object.assign({}, ml.prices), e = ml.etf;
    for (let w = 1; w <= n; w++) {
      const rs = SECTORS.map(s => { const r = 0.002 + s.vol * gauss(); p[s.id] = p[s.id] / (1 + r); return r; });
      let re = rs.reduce((a, b) => a + b, 0) / rs.length * C.etfFactor; re = Math.max(-C.etfMaxWeek, Math.min(C.etfMaxWeek, re));
      e = e / (1 + re);
      out.unshift({ week: ml.week - w, prices: Object.fromEntries(SECTORS.map(s => [s.id, floor4(p[s.id])])), etf: floor4(e) });
    }
    return out;
  }
  // 1株（ETFは1口）あたりの配当（月）。セクター株だけ。ETFは再投資型なので配当なし
  // 1株あたりの配当（月）は、毎年4月に「その時の株価×配当率」で決めて1年間固定（2026年11月5日決定）。ETFは再投資型なので0
  const divPerShare = id => id === 'etf' ? 0 : S().dps[id];
  const yieldOf = id => id === 'etf' ? 0 : S().dps[id] / disp(id);   // 配当利回り（株価で変わる）
  const disp = id => id === 'etf' ? S().etf : Math.round(S().prices[id]);   // 表示の値段（売買はこの値段）
  const H = child => { const h = S().hold; return h[child] || (h[child] = { etf: { units: 0, cost: 0 }, sec: {}, div: 0 }); };
  const pay = (child, amount, memo) => { if (amount) Store.get().ledger.push({ child, at: (clock || new Date()).toISOString(), amount, memo }); };
  const savings = child => Store.balance(child);

  const orderCost = o => o.asset === 'etf' ? o.reserve : o.shares * disp(o.asset);
  function assets(child) {
    const h = H(child), ml = S();
    const etf = Math.floor(h.etf.units * ml.etf);
    const sec = Object.entries(h.sec).reduce((s, [id, x]) => s + x.shares * disp(id), 0);
    const time = ml.time.filter(t => t.child === child).reduce((s, t) => s + t.principal, 0);
    const reserved = ml.orders.filter(o => o.child === child && o.status === '注文中' && o.side === 'buy').reduce((s, o) => s + o.reserve, 0);
    const sv = savings(child);
    // 投資上限の計算では、注文中の株は「株数×今の値段」で数える（取り置きの1.1倍では数えない）
    const pending = ml.orders.filter(o => o.child === child && o.status === '注文中' && o.side === 'buy').reduce((s, o) => s + orderCost(o), 0);
    return { savings: sv, time, etf, sec, stocks: etf + sec, reserved, total: sv + time + etf + sec + reserved, invested: etf + sec + pending };
  }
  // 1年生は投資なし（貯金だけ：普通預金と定期預金。2026年11月10日）。2年生はETFだけ・1/4、3年生から3/4
  const capRate = grade => grade <= 1 ? 0 : grade <= 2 ? C.capLow : C.capHigh;
  const capLeft = (child, grade) => { const a = assets(child); return Math.max(0, Math.floor(a.total * capRate(grade) - a.invested)); };

  // 注文（成立は次の月曜の値段）。o = { side, asset, shares, amount, all, purpose, reason }
  function check(child, grade, o) {
    const h = H(child), ml = S();
    if (o.side === 'buy' && grade <= 1) return '1{年生|ねんせい}は {貯金|ちょきん}だけ（{投資|とうし}は 2{年生|ねんせい}から）';
    if (o.asset !== 'etf' && grade <= 2) return 'セクター株は3年生から';
    if (o.side === 'buy') {
      const reserve = o.asset === 'etf' ? Math.floor(o.amount) : Math.ceil(o.shares * disp(o.asset) * C.reserveRate);
      if (!(reserve >= 1)) return o.asset === 'etf' ? '1ルト以上で' : '1株以上で';
      if (reserve > savings(child)) return '普通預金がたりない';
      // 投資上限は今の値段で見る（取り置きの1.1倍では見ない。2026年11月5日）。月曜に値上がりしてこえたら、そのとき取り消し
      const cost = o.asset === 'etf' ? reserve : o.shares * disp(o.asset);
      if (cost > capLeft(child, grade)) return '投資上限をこえる';
      return { reserve };
    }
    if (o.asset === 'etf') {
      const pend = ml.orders.some(x => x.child === child && x.status === '注文中' && x.side === 'sell' && x.asset === 'etf');
      if (pend) return 'ETFの売り注文は1つまで（仮）';
      if (h.etf.units <= 0) return '持っていない';
      if (!o.all && !(o.amount >= 1)) return '1ルト以上で';
      return {};
    }
    const held = (h.sec[o.asset] || {}).shares || 0;
    const selling = ml.orders.filter(x => x.child === child && x.status === '注文中' && x.side === 'sell' && x.asset === o.asset).reduce((s, x) => s + x.shares, 0);
    if (!(o.shares >= 1) || o.shares > held - selling) return '売れる株数をこえる';
    return {};
  }
  function place(child, grade, o) {
    const r = check(child, grade, o); if (typeof r === 'string') return r;
    const ord = Object.assign({ id: 'o' + (S().seq++), child, grade, status: '注文中', at: (clock || new Date()).toISOString(), week: S().week, reserve: 0 }, o, r);
    if (ord.side === 'buy') pay(child, -ord.reserve, '買い注文の取り置き');
    S().orders.push(ord); Store.save(); return ord;
  }
  function cancel(id, why = '取り消し') {
    const o = S().orders.find(x => x.id === id); if (!o || o.status !== '注文中') return;
    o.status = why; if (o.side === 'buy') pay(o.child, o.reserve, '取り置きをもどす'); Store.save();
  }

  // ---- 月曜の処理（5-1・5-4）：株価 → ETF → 分割 → 売り → 買い ----
  function gauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  // ---- 株価の案（5-1）：金曜に 案を作る → 先生が「承認」か「差し戻し」→ 月曜に 反映。数字を 手で 書きかえる 機能は 作らない ----
  // 試作品では、変化率は 乱数（本番は 実際の 業種別ETFの 金曜の終値）。承認されないまま 月曜を すぎたら 据え置きで、次の案に まとめる
  const genRates = () => Object.fromEntries(SECTORS.map(s => [s.id, 0.002 + s.vol * gauss()]));
  const etfRate = rates => { const rs = SECTORS.map(s => rates[s.id]); return Math.max(-C.etfMaxWeek, Math.min(C.etfMaxWeek, rs.reduce((a, b) => a + b, 0) / rs.length * C.etfFactor)); };
  const proposal = () => { const p = S().proposal; return p && p.status !== '反映ずみ' ? p : null; };
  const closeProposal = p => { const ml = S(); (ml.pastProposals = ml.pastProposals || []).push({ week: p.week, weeks: p.weeks, status: p.status, byName: p.byName || '', byAt: p.byAt || '', at: p.at }); ml.pastProposals = ml.pastProposals.slice(-20); };
  function propose() {
    const ml = S(), old = proposal(), weeks = 1 + (ml.missed || 0);
    if (old && old.status === '承認') return old;                 // 承認ずみの 案は 作りなおさない
    if (old && old.status !== '期限切れ') closeProposal(old);     // 差し戻した 案・出しなおす 前の 案は 記録に のこす
    const rates = Object.fromEntries(SECTORS.map(s => [s.id, 0]));
    for (let w = 0; w < weeks; w++) { const r = genRates(); SECTORS.forEach(s => rates[s.id] = (1 + rates[s.id]) * (1 + r[s.id]) - 1); }
    ml.proposal = { id: 'p' + (ml.seq++), week: ml.week + 1, weeks, at: new Date().toISOString(), rates, status: '提案中' };
    ml.log.push(`${logDay()}：株価の案を作った${weeks > 1 ? `（${weeks}週分を まとめた案）` : ''}`);
    Store.save(); return ml.proposal;
  }
  function approve(byId, byName) {
    const p = proposal(); if (!p || p.status !== '提案中') return;
    Object.assign(p, { status: '承認', by: byId, byName, byAt: new Date().toISOString() });
    S().log.push(`${logDay()}：株価の案を 承認（${byName}）`); Store.save();
  }
  function reject(byId, byName, reason) {
    const p = proposal(); if (!p || p.status !== '提案中') return;
    Object.assign(p, { status: '差し戻し', by: byId, byName, byAt: new Date().toISOString(), reason });
    S().log.push(`${logDay()}：株価の案を 差し戻し（${byName}。理由：${reason}）`); Store.save();
  }
  // force＝試作品の「自動で進める」と、6年分の記録を作るとき（案 → 承認 → 反映を 自動で する）
  function monday(force) {
    const ml = S(), p = proposal(); let rates = null;
    if (p && p.status === '承認') rates = p.rates;
    else if (force) rates = p && p.status !== '期限切れ' ? p.rates : genRates();
    if (rates) { if (p) { if (p.status !== '承認') p.byName = '（自動）'; p.status = '反映ずみ'; closeProposal(p); } ml.missed = 0; }
    else {
      // 承認された 案が ない：株価は 据え置き。注文の 約定などは する。次の案は、たまった 週の 分を まとめる
      if (p && p.status !== '期限切れ') { p.status = '期限切れ'; closeProposal(p); }
      ml.missed = (ml.missed || 0) + 1;
      ml.log.push(`${logDay()}：承認された 案が ないので、株価は 据え置き（次の案で まとめて 反映）`);
    }
    ml.week++; ml.prev = Object.assign({}, ml.prices); ml.etfPrev = ml.etf;
    if (rates) SECTORS.forEach(s => { ml.prices[s.id] = Math.max(1, floor4(ml.prices[s.id] * (1 + rates[s.id]))); });
    const re = rates ? etfRate(rates) : 0;          // ETFは平均×0.5、±5%まで
    ml.etf = floor4(ml.etf * (1 + re));
    // 株式分割：表示の値段が基準をこえたら 1株→2株
    SECTORS.forEach(s => {
      if (disp(s.id) <= C.splitThreshold) return;
      ml.prices[s.id] = floor4(ml.prices[s.id] / 2);
      ml.history.forEach(h => h.prices[s.id] = floor4(h.prices[s.id] / 2));   // チャートは分割を調整した値段で出す
      (ml.splits = ml.splits || []).push({ week: ml.week, id: s.id });
      Object.values(ml.hold).forEach(h => { const x = h.sec[s.id]; if (x) { x.shares *= 2; } });
      ml.dps[s.id] = Math.round(ml.dps[s.id] / 2 * 100) / 100;               // 分割したら1株あたりの配当も半分
      ml.orders.filter(o => o.status === '注文中' && o.asset === s.id).forEach(o => o.shares *= 2);
      ml.log.push(`${logDay()}：${s.name} を分割（1株→2株）`);
    });
    ml.history.push({ week: ml.week, prices: Object.assign({}, ml.prices), etf: ml.etf });
    const kids = Object.fromEntries(Store.children().map(c => [c.id, c]));
    const open = ml.orders.filter(o => o.status === '注文中');
    open.filter(o => o.side === 'sell').forEach(o => execSell(o));
    open.filter(o => o.side === 'buy').forEach(o => execBuy(o, kids[o.child]));
    snap(); Store.save();
  }
  // ---- 資産推移の記録（仕様書 8-1）：週ごとに [週, 総資産, 稼いだ分, 利息・配当] をのこす ----
  // 稼いだ分＝Eラーニングなどでもらったルト − 交換でつかったルト。利息・配当＝普通預金の利息＋配当＋定期預金の利息。
  // 値上がり・値下がり＝総資産 − 稼いだ分 − 利息・配当（ETFの再投資・信託報酬もここに入る）
  const MOVE = /^(買い注文の取り置き|取り置きをもどす|取り置きの残りをもどす|ETFを売った|株を売った|定期預金へ|定期預金の満期)$/, INC = /^(普通預金の利息|配当)$/;
  function snap(only) {
    const ml = S(), sum = {}; ml.snap = ml.snap || {};
    Store.get().ledger.forEach(l => {
      if (MOVE.test(l.memo)) return;
      const x = sum[l.child] || (sum[l.child] = [0, 0]); x[INC.test(l.memo) ? 1 : 0] += l.amount;
    });
    Store.children().filter(c => !only || only.includes(c.id)).forEach(c => {
      const x = sum[c.id] || [0, 0], arr = ml.snap[c.id] || (ml.snap[c.id] = []);
      const row = [ml.week, assets(c.id).total, x[0], x[1] + (H(c.id).tint || 0)];
      if (arr.length && arr[arr.length - 1][0] === ml.week) arr[arr.length - 1] = row; else arr.push(row);
    });
  }
  function execSell(o) {
    const h = H(o.child);
    if (o.asset === 'etf') {
      let units = o.all ? h.etf.units : Math.min(h.etf.units, Math.ceil(o.amount / S().etf * 1e4 - 1e-9) / 1e4);   // ○ルト分がちょうど入るように、口数は切りあげ
      const get = Math.floor(units * S().etf);
      const costPart = h.etf.units ? h.etf.cost * units / h.etf.units : 0;
      h.etf.cost -= costPart; h.etf.units = floor4(h.etf.units - units);
      if (h.etf.units <= 0) { h.etf.units = 0; h.etf.cost = 0; }
      pay(o.child, get, 'ETFを売った'); Object.assign(o, { status: '成立', price: S().etf, units, got: get, profit: Math.round(get - costPart) });
    } else {
      const x = h.sec[o.asset], p = disp(o.asset), get = o.shares * p, avg = x.cost / x.shares;
      x.cost -= avg * o.shares; x.shares -= o.shares; if (!x.shares) delete h.sec[o.asset];
      pay(o.child, get, '株を売った'); Object.assign(o, { status: '成立', price: p, got: get, profit: Math.round(get - avg * o.shares) });
    }
  }
  function execBuy(o, kid) {
    const h = H(o.child);
    // 投資上限は注文のときだけ見る。月曜に値上がりして上限をこえても取り消さない（2026年11月5日）
    if (o.asset === 'etf') {
      const amt = o.reserve;   // 取り置いた分（整数）で買う。小数の金額で注文されても、はらった分と買った分が ずれない
      const units = floor4(amt / S().etf);
      h.etf.units = floor4(h.etf.units + units); h.etf.cost += amt;
      Object.assign(o, { status: '成立', price: S().etf, units, paid: amt });
    } else {
      const p = disp(o.asset), shares = Math.min(o.shares, Math.floor(o.reserve / p));
      if (!shares) return cancel(o.id, '取り消し（値上がりで買えない）');
      const x = h.sec[o.asset] || (h.sec[o.asset] = { shares: 0, cost: 0 });
      x.shares += shares; x.cost += shares * p;
      pay(o.child, o.reserve - shares * p, '取り置きの残りをもどす');
      Object.assign(o, { status: '成立', price: p, done: shares, paid: shares * p });
    }
  }

  // ---- 月末の処理（5-2）：利息・定期・配当・ETFの再投資と信託報酬 ----
  function monthEnd(only) {
    const ml = S(); ml.month++;
    if (ml.cal === undefined) ml.cal = new Date().getMonth();
    Store.children().filter(c => !only || only.includes(c.id)).forEach(c => {
      pay(c.id, Math.floor(savings(c.id) * C.rateSavings), '普通預金の利息');
      const h = H(c.id);
      // 配当の小数の分は「くり越し」にためて、1ルトになったら次の月に払う（1/100ルト単位の整数で計算してずれを防ぐ）
      if (!h.divCarry) h.divCarry = {};
      Object.entries(h.sec).forEach(([id, x]) => {
        const cents = Math.round(x.shares * divPerShare(id) * 100) + (h.divCarry[id] || 0);
        const d = Math.floor(cents / 100); h.divCarry[id] = cents - d * 100;
        if (d) { pay(c.id, d, '配当'); h.div += d; }
      });
    });
    ml.time.filter(t => !only || only.includes(t.child)).forEach(t => { const it = Math.floor(t.principal * C.rateTime); t.principal += it; t.months++; const h = H(t.child); h.tint = (h.tint || 0) + it; });
    ml.time.filter(t => t.months >= C.timeMonths).forEach(t => pay(t.child, t.principal, '定期預金の満期'));
    ml.time = ml.time.filter(t => t.months < C.timeMonths);
    const avgDiv = SECTORS.reduce((s, x) => s + x.div, 0) / SECTORS.length;
    ml.etf = floor4(ml.etf * (1 + avgDiv) * (1 - C.etfFee));
    const last = ml.history[ml.history.length - 1]; if (last) last.etf = ml.etf;
    // 次の月へ。4月になったら、1株あたりの配当を決めなおす（1年間固定）
    ml.cal = (ml.cal + 1) % 12;
    if (ml.cal === C.dpsMonth) {
      SECTORS.forEach(s => ml.dps[s.id] = Math.round(disp(s.id) * s.div * 100) / 100);
      ml.log.push(`${logDay()}：4月なので、1株あたりの配当を決めなおした`);
    }
    snap(only); Store.save();
  }
  function toTime(child, amount) {
    amount = Math.floor(amount);
    if (!(amount >= 1) || amount > savings(child)) return '普通預金がたりない';
    pay(child, -amount, '定期預金へ'); S().time.push({ id: 't' + (S().seq++), child, principal: amount, months: 0, at: (clock || new Date()).toISOString() }); Store.save(); return null;
  }

  // ---- 交換（仕様書 3-4・7）：物品とルトを交換する。交換したらその場で普通預金から引く。キャンセルはもどす ----
  // 受注生産（ポロシャツ・パーカー）：注文受付 → 発注済み → 受け取り待ち → 渡した。ほかの物品：受け取り待ち → 渡した
  // サイズ（120〜160）・パーカーの期間（10/1〜12/31）・年度は4月から、は仮。在庫の数は未決なので入れていない
  const GOODS = [
    ['pencil', 'ROOT{鉛筆|えんぴつ}', 50], ['eraser', 'ROOT{消|け}しゴム', 150], ['badge', '{缶|かん}バッジ', 250], ['pen', 'ROOTボールペン', 250],
    ['sharp', 'ROOTシャーペン', 300], ['key', 'ROOTキーホルダー', 400], ['note', 'ROOTノート', 400],
    ['polo', 'ROOTポロシャツ', 2500, { order: true, yearly: 1 }], ['parka', 'ROOTパーカー', 3000, { order: true, yearly: 1, from: '10-01', to: '12-31' }],
  ].map(([id, name, price, o]) => Object.assign({ id, name, price }, o));
  const GOOD = Object.fromEntries(GOODS.map(g => [g.id, g]));
  const SIZES = ['120', '130', '140', '150', '160'];
  const EX = () => S().ex || (S().ex = []);
  const fy = d => d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  const md = d => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const inSeason = (g, d = new Date()) => !g.from || (g.from <= g.to ? md(d) >= g.from && md(d) <= g.to : md(d) >= g.from || md(d) <= g.to);
  const usedThisYear = (child, gid) => EX().filter(e => e.child === child && e.goods === gid && e.status !== 'キャンセル' && fy(new Date(e.at)) === fy(new Date())).length;
  function canExchange(child, gid, size) {
    const g = GOOD[gid]; if (!g) return 'ない{物品|ぶっぴん}';
    if (!inSeason(g)) return `{交換|こうかん}できるのは ${+g.from.slice(0, 2)}〜${+g.to.slice(0, 2)}{月|がつ}だけ`;
    if (g.yearly && usedThisYear(child, gid) >= g.yearly) return `1{人|にん} 1{年|ねん}に ${g.yearly}{枚|まい}まで`;
    const u = Store.get().users.find(x => x.id === child), cl = u && u.closed;
    if (cl && g.order) { const d = new Date(cl.at + 'T00:00:00'); d.setMonth(d.getMonth() - 1); if (Store.today() > Store.dayOf(d)) return cl.kind === '卒業' ? '{卒業|そつぎょう}の 1か{月|げつ}{前|まえ}までしか {注文|ちゅうもん}できない' : cl.kind === 'スポット移行' ? 'スポットに かわる 1か{月|げつ}{前|まえ}までしか {注文|ちゅうもん}できない' : '{退会|たいかい}の 1か{月|げつ}{前|まえ}までしか {注文|ちゅうもん}できない'; }
    if (g.order && size !== undefined && !SIZES.includes(size)) return 'サイズを えらんでね';
    if (g.price > savings(child)) return '{普通預金|ふつうよきん}が たりない';
    return null;
  }
  function exchange(child, gid, size) {
    const err = canExchange(child, gid, size || ''); if (err) return err;
    const g = GOOD[gid];
    pay(child, -g.price, `{交換|こうかん}：${g.name}`);
    EX().push({ id: 'x' + (S().seq++), child, goods: gid, price: g.price, size: g.order ? size : null, status: g.order ? '注文受付' : '受け取り待ち', at: new Date().toISOString() });
    Store.save(); return null;
  }
  // 子どもが取り消せるのは、まだ発注していないものだけ。先生は渡す前なら取り消せる
  const childCanCancel = e => e.status === (GOOD[e.goods].order ? '注文受付' : '受け取り待ち');
  function cancelEx(id, byTeacher) {
    const e = EX().find(x => x.id === id); if (!e || e.status === '渡した' || e.status === 'キャンセル') return;
    if (!byTeacher && !childCanCancel(e)) return;
    e.status = 'キャンセル'; pay(e.child, e.price, '{交換|こうかん}の キャンセル'); Store.save();
  }
  const NEXT = { '注文受付': '発注済み', '発注済み': '受け取り待ち', '受け取り待ち': '渡した' };
  function advanceEx(id) {
    const e = EX().find(x => x.id === id); if (!e || !NEXT[e.status]) return;
    e.status = NEXT[e.status]; if (e.status === '渡した') e.handedAt = new Date().toISOString(); Store.save();
  }

  return { GOODS, GOOD, SIZES, exchanges: EX, inSeason, usedThisYear, canExchange, exchange, childCanCancel, cancelEx, advanceEx,
    C, SECTORS, SEC, ETF_NAME, state: S, disp, divPerShare, yieldOf, hold: H, assets, capRate, capLeft, check, place, cancel, monday, monthEnd, toTime, propose, approve, reject, proposal, etfRate };
})();
