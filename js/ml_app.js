// マネーラボの口座の画面（マネーラボ仕様書 8-1）。ことばは証券口座と同じにし、ふりがなは子どもの学年に合わせる。
const ML = MoneyLab;
const n0 = x => Math.round(x).toLocaleString();
// 上がった＝「▲＋」、下がった＝「▼−」に そろえる（2026年11月13日）
const sign = x => (x > 0 ? '▲＋' : x < 0 ? '▼−' : '') + n0(Math.abs(x));
const pctS = (x, base) => base ? `${x >= 0 ? '＋' : '−'}${Math.abs(x / base * 100).toFixed(1)}%` : '';
const nameOf = id => id === 'etf' ? ML.ETF_NAME : ML.SEC[id].name;
let mlTab = 'home', mlT = null;

// 1年生は投資なし（貯金だけ。2026年11月10日）。株や注文が残っているとき（学年の切りかえ前に買ったなど）は、売れるように取引の画面を残す
const hasInv = id => { const h = ML.hold(id); return h.etf.units > 0 || Object.keys(h.sec).length > 0 || ML.state().orders.some(o => o.child === id && o.status === '注文中'); };
const saverOnly = c => c.grade <= 1 && !hasInv(c.id);
function showAccount(tab) {
  glossClose();
  if (tab) mlTab = tab;
  const low = me.grade <= 2, saver = saverOnly(me);
  if (mlTab === 'pf') mlTab = 'home';   // ポートフォリオはホームに まとめた
  if (saver && (mlTab === 'trade' || mlTab === 'orders' || mlTab === 'chart')) mlTab = 'home';
  const tabs = [['home', saver ? '{口座|こうざ}' : 'ポートフォリオ'], ['trade', '{取引|とりひき}'], ['orders', '{注文照会|ちゅうもんしょうかい}'], ['bank', '{入出金|にゅうしゅっきん}・{振替|ふりかえ}'], ['ledger', '{入出金|にゅうしゅっきん}の{記録|きろく}'], ['shop', '{交換|こうかん}'], ['sim', 'シミュレーション'], ['review', 'ふりかえり']]
    .filter(([k]) => !(saver && (k === 'trade' || k === 'orders' || k === 'review')));
  if (saver && mlTab === 'review') mlTab = 'home';
  const body = { home: mlHome, pf: mlPf, chart: mlChart, trade: mlTrade, orders: mlOrders, bank: mlBank, ledger: mlLedger, shop: mlShop, sim: mlSim, review: mlReview }[mlTab](low);
  app().innerHTML = header(`<button onclick="showTop()">${R('Eラーニングへ')}</button>`, true) +
    `<nav>${tabs.map(([k, n]) => `<button class="${k === mlTab ? 'on' : ''}" onclick="mlT=null;mlPage.mlOrdPage=mlPage.mlLedPage=0;showAccount('${k}')">${R(n)}</button>`).join('')}</nav><main class="ml">${body}</main>`;
  if (mlTab === 'trade') mlBindTrade();
  if (mlTab === 'sim') mlSimCalc();
  bindCharts();
  mlGloss(document.querySelector('main.ml'));
  touch();   // マネーラボは 30秒で ログアウト（app.js の idleMs）
}

// ================= ROOT用語辞書（仕様書 1-7・8-1・テーブル glossary） =================
// 大人のことば（評価損益 など）は そのまま使い、ことばを おすと 子ども向けの 説明が 出る。
// 説明の文は Claude の下書き。先生が確かめる（仮）。本番は glossary テーブル（word, ruby, kid_meaning）から読む
const GLOSS = {
  'ポートフォリオ': '{自分|じぶん}が {持|も}っている お{金|かね}や {株|かぶ}を、ぜんぶ まとめて {見|み}た {一覧|いちらん}。',
  '総資産': '{持|も}っている ものを ぜんぶ ルトに して あわせた {合計|ごうけい}。{普通預金|ふつうよきん}・{定期預金|ていきよきん}・{株|かぶ}の {評価額|ひょうかがく}を たしたもの。',
  '評価額': '{持|も}っている {株|かぶ}を、いまの {値段|ねだん}で {売|う}ったら いくらに なるか。',
  '評価損益': '{買|か}った ときより いま {得|とく}を しているか（＋）、{損|そん}を しているか（−）。まだ {売|う}っていないので「もし いま {売|う}ったら」の {数字|すうじ}。',
  '損益': '{得|とく}（もうけ）と {損|そん}。＋なら もうけ、−なら {損|そん}。',
  '取得単価': '1{株|かぶ}を、{平均|へいきん}で いくらで {買|か}ったか。',
  '現在値': 'いまの 1{株|かぶ}の {値段|ねだん}。',
  '保有数': '{持|も}っている {株|かぶ}の {数|かず}。',
  '配当': '{会社|かいしゃ}が もうけの {一部|いちぶ}を、{株|かぶ}を {持|も}っている {人|ひと}に {分|わ}けて くれる お{金|かね}。',
  '株価': '{株|かぶ} 1つ{分|ぶん}の {値段|ねだん}。{毎週|まいしゅう} {上|あ}がったり {下|さ}がったり するよ。',
  '銘柄': '{売|う}り{買|か}い できる {株|かぶ}や ETF の {名前|なまえ}の こと。',
  '約定': '{注文|ちゅうもん}が {決|き}まって、{本当|ほんとう}に {売|う}り{買|か}い できた こと。',
  '成立': '{注文|ちゅうもん}が {決|き}まる こと（{約定|やくじょう}と {同|おな}じ）。',
  '注文照会': '{出|だ}した {注文|ちゅうもん}が、いま どう なっているかを {見|み}る ところ。',
  '入出金': 'お{金|かね}を {入|い}れたり {出|だ}したり する こと。',
  '振替': '{自分|じぶん}の {口座|こうざ}の {中|なか}で、お{金|かね}を うつす こと（{普通預金|ふつうよきん} → {定期預金|ていきよきん} など）。',
  '普通預金': 'いつでも {出|だ}し{入|い}れ できる {預金|よきん}。{利息|りそく}は すこしだけ。',
  '定期預金': '{決|き}めた {期間|きかん}は {出|だ}せない かわりに、{利息|りそく}が {普通預金|ふつうよきん}より {多|おお}く つく {預金|よきん}。',
  '利息': 'お{金|かね}を {預|あず}けて おくと、お{礼|れい}と して ふえる {分|ぶん}。',
  '元本': 'さいしょに {預|あず}けたり、{投資|とうし}したり した お{金|かね}。',
  '満期': '{定期預金|ていきよきん}の {期間|きかん}が おわる {日|ひ}。',
  'ETF': 'たくさんの {会社|かいしゃ}の {株|かぶ}を すこしずつ まとめた もの。1つ {買|か}うだけで、いろいろな {会社|かいしゃ}に {分|わ}けて {投資|とうし}できる。',
  '信託報酬': 'ETF を {管理|かんり}して もらう ための {手数料|てすうりょう}。すこしずつ {引|ひ}かれる。',
  '分割': '{株|かぶ}の {値段|ねだん}が {高|たか}く なりすぎた とき、1{株|かぶ}を 2{株|かぶ}に {分|わ}ける こと。1{株|かぶ}の {値段|ねだん}は {半分|はんぶん}に なるけど、{持|も}っている {株|かぶ}ぜんぶの {値打|ねう}ちは かわらない。',
  'セクター': '{同|おな}じ なかまの {仕事|しごと}を する {会社|かいしゃ}の グループ。',
  'ROOT平均': 'ROOT の {株|かぶ}の {値段|ねだん}が、ぜんたいで {上|あ}がったか {下|さ}がったかを {見|み}る {数字|すうじ}（{日経平均|にっけいへいきん}の ような もの）。',
};
const GLOSS_RE = new RegExp(Object.keys(GLOSS).sort((a, b) => b.length - a.length).join('|'), 'g');
function mlGloss(root) {
  if (!root || !me || me.role !== 'child') return;
  const skip = 'button,select,option,input,textarea,label,a,.gl,svg,script,style';
  // ふりがなが ついた ことば（<ruby>漢字<rt>よみ</rt></ruby>）
  root.querySelectorAll('ruby').forEach(r => {
    const base = [...r.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('');
    if (GLOSS[base] && !r.closest(skip)) { const s = document.createElement('span'); s.className = 'gl'; s.dataset.w = base; r.replaceWith(s); s.appendChild(r); }
  });
  // ふりがなが ない ことば（文字の まま）
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
  while (tw.nextNode()) nodes.push(tw.currentNode);
  nodes.forEach(n => {
    const t = n.textContent, p = n.parentElement;
    if (!p || p.closest(skip + ',ruby,rt')) return;
    GLOSS_RE.lastIndex = 0; if (!GLOSS_RE.test(t)) return;
    const f = document.createDocumentFragment(); let last = 0;
    t.replace(GLOSS_RE, (m, i) => { f.append(t.slice(last, i)); const s = document.createElement('span'); s.className = 'gl'; s.dataset.w = m; s.textContent = m; f.append(s); last = i + m.length; return m; });
    f.append(t.slice(last)); n.replaceWith(f);
  });
}
function glossShow(w, html) {
  let box = document.getElementById('gpop');
  if (!box) { box = document.createElement('div'); box.id = 'gpop'; box.className = 'gpop'; document.body.appendChild(box); }
  box.innerHTML = `<div class="gw">${html}</div><p>${R(GLOSS[w])}</p><p class="note">${R('ROOT{用語辞書|ようごじしょ}')}</p><button onclick="this.parentElement.remove()">${R('とじる')}</button>`;
}
const glossClose = () => { const b = document.getElementById('gpop'); if (b) b.remove(); };
document.addEventListener('click', e => { const g = e.target.closest && e.target.closest('.gl'); if (g) { e.preventDefault(); glossShow(g.dataset.w, g.innerHTML); } });

// 交換（仕様書 3-4・8-1）：物品の一覧・交換・受け取り待ちの一覧
const exDate = iso => { const d = new Date(iso); return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`; };
const exStatus = s => ({ '注文受付': '{注文受付|ちゅうもんうけつけ}', '発注済み': '{発注済|はっちゅうず}み（とどくのを まっている）', '受け取り待ち': '{受|う}け{取|と}り{待|ま}ち', '渡した': '{受|う}け{取|と}った', 'キャンセル': 'キャンセル' })[s] || s;
function mlShop() {
  const sv = Store.balance(me.id), mine = ML.exchanges().filter(e => e.child === me.id).slice().reverse();
  const cards = ML.GOODS.map(g => {
    const err = ML.canExchange(me.id, g.id), notes = [];
    if (g.order) notes.push('{受注生産|じゅちゅうせいさん}（{注文|ちゅうもん}してから {作|つく}る）');
    if (g.yearly) notes.push(`1{人|にん} 1{年|ねん}に ${g.yearly}{枚|まい}（{今年度|こんねんど}は あと ${Math.max(0, g.yearly - ML.usedThisYear(me.id, g.id))}{枚|まい}）`);
    if (g.from) notes.push(`${+g.from.slice(0, 2)}〜${+g.to.slice(0, 2)}{月|がつ}だけ`);
    const size = g.order ? `<select id="sz_${g.id}"><option value="">サイズ</option>${ML.SIZES.map(s => `<option>${s}</option>`).join('')}</select> ` : '';
    return `<tr><td>${R(g.name)}${notes.length ? `<br><small class="note">${notes.map(n => R(n)).join('・')}</small>` : ''}</td><td><b>${n0(g.price)}</b> ルト</td>
      <td>${err ? `<small class="note">${R(err)}</small>` : `${size}<button class="primary" onclick="mlEx('${g.id}')">${R('{交換|こうかん}する')}</button>`}</td></tr>`;
  }).join('');
  const rows = mine.map(e => `<tr><td>${exDate(e.at)}</td><td>${R(ML.GOOD[e.goods].name)}${e.size ? `（${e.size}）` : ''}</td><td>${n0(e.price)}</td><td>${R(exStatus(e.status))}</td>
    <td>${ML.childCanCancel(e) && !mlReadOnly ? `<button onclick="if(confirm('キャンセルすると ${e.price}ルト もどります'))ML.cancelEx('${e.id}'),showAccount()">${R('キャンセル')}</button>` : ''}</td></tr>`).join('');
  return `<h2>${R('{物品|ぶっぴん}と {交換|こうかん}')}</h2>
    <p>${R('{普通預金|ふつうよきん}')}：<b>${n0(sv)}</b> ルト　<small class="note">${R('{交換|こうかん}すると、その{場|ば}で {普通預金|ふつうよきん}から ひかれるよ。{株|かぶ}や {定期預金|ていきよきん}の ルトは つかえないよ。')}</small></p>
    ${me.grade === 6 && [1, 2].includes(new Date().getMonth()) ? `<p class="msg">${R('{卒業|そつぎょう}ショップの {期間|きかん}です（2〜3{月|がつ}）。')}<small class="note">${R('{卒業|そつぎょう}ショップだけの {物品|ぶっぴん}は まだ {決|き}まっていない（{未決|みけつ}）')}</small></p>` : ''}
    ${me.closed ? `<p class="msg">${R(`${ymdS(me.closed.at)}で ${me.closed.kind === '卒業' ? '{卒業|そつぎょう}' : me.closed.kind === 'スポット移行' ? 'スポット{会員|かいいん}に かわるよ' : '{退会|たいかい}'}。その{日|ひ}まで {交換|こうかん}できるよ。のこった ルトは なくなるよ。`)}</p>` : ''}
    <p id="exmsg" class="msg"></p>
    ${mlReadOnly ? '' : `<table class="list"><tr><th>${R('{物品|ぶっぴん}')}</th><th>ルト</th><th></th></tr>${cards}</table>`}
    <h3>${R('{交換|こうかん}した もの')}</h3>
    <table class="list"><tr><th>${R('{日|ひ}にち')}</th><th>${R('{物品|ぶっぴん}')}</th><th>ルト</th><th>${R('いまの {状態|じょうたい}')}</th><th></th></tr>
    ${rows || `<tr><td colspan="5">${R('まだ ありません')}</td></tr>`}</table>
    <p class="note">${R('{物品|ぶっぴん}を {友|とも}だちと {売|う}ったり あげたり しては いけません。')}</p>`;
}
function mlEx(gid) {
  const g = ML.GOOD[gid], sel = $('#sz_' + gid), size = sel ? sel.value : undefined;
  if (g.order && !size) { $('#exmsg').innerHTML = R('サイズを えらんでね'); return; }
  if (!confirm(`${g.name.replace(/\{([^|}]+)\|[^}]*\}/g, '$1')}${size ? `（${size}）` : ''} と ${g.price}ルトを こうかんします。いいですか？`)) return;
  const err = ML.exchange(me.id, gid, size);
  if (err) { $('#exmsg').innerHTML = R(err); return; }
  showAccount();
  $('#exmsg').innerHTML = R(g.order ? '{注文|ちゅうもん}しました。とどいたら {先生|せんせい}から わたします。' : '{交換|こうかん}しました。{先生|せんせい}から {受|う}け{取|と}ってね。');
}
// 先生の画面：交換の受け渡し（仕様書 8-2）。受け取り待ちの一覧・「渡した」・受注生産の発注まとめ（サイズ別の数）
function mlHandHTML() {
  const kids = Object.fromEntries(Store.children().map(c => [c.id, c])), ex = ML.exchanges();
  const open = ex.filter(e => e.status !== '渡した' && e.status !== 'キャンセル');
  const plain = s => s.replace(/\{([^|}]+)\|[^}]*\}/g, '$1');
  const BTN = { '注文受付': '発注した', '発注済み': '届いた', '受け取り待ち': '渡した' };
  const sum = {}; open.filter(e => e.status === '注文受付').forEach(e => { const k = `${plain(ML.GOOD[e.goods].name)}（${e.size}）`; sum[k] = (sum[k] || 0) + 1; });
  return `<h3>交換の受け渡し</h3>
    ${Object.keys(sum).length ? `<p><b>発注まとめ（注文受付のもの）</b>：${Object.entries(sum).map(([k, n]) => `${k} ${n}枚`).join('、')}
      <button onclick="ML.exchanges().filter(e=>e.status==='注文受付').forEach(e=>ML.advanceEx(e.id));showTeacher('ml')">まとめて「発注した」にする</button></p>` : ''}
    <table class="list"><tr><th>日にち</th><th>子ども</th><th>物品</th><th>状態</th><th></th></tr>
    ${open.map(e => `<tr><td>${exDate(e.at)}</td><td>${esc(kids[e.child] ? kids[e.child].name : e.child)}</td><td>${plain(ML.GOOD[e.goods].name)}${e.size ? `（${e.size}）` : ''}</td><td>${e.status}</td>
      <td><button class="primary" onclick="ML.advanceEx('${e.id}');showTeacher('ml')">${BTN[e.status]}</button>
      <button onclick="if(confirm('キャンセルして ${e.price}ルトを もどします'))ML.cancelEx('${e.id}',true),showTeacher('ml')">キャンセル</button></td></tr>`).join('') || '<tr><td colspan="5">ありません</td></tr>'}</table>`;
}
// ふりかえり（仕様書 8-1）：売った株ごとに、買ったときの目的と理由、売った結果（損益）を出す
function mlReview(low) {
  const os = ML.state().orders.filter(o => o.child === me.id && o.status === '成立');
  const sells = os.filter(o => o.side === 'sell').sort((a, b) => a.at < b.at ? 1 : -1);
  const ymd = iso => { const d = new Date(iso); return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`; };
  const rows = sells.map(s => {
    const buys = os.filter(o => o.side === 'buy' && o.asset === s.asset && o.at < s.at);
    // 目的は 決まった ことば（ふりがなを つける）。理由は 子どもが 書いた文なので、そのまま出す（ふりがなの しくみに 通さない）
    const why = [...new Set(buys.map(b => [b.purpose ? R(b.purpose) : '', esc(b.reason || '')].filter(Boolean).join('：')).filter(Boolean))].slice(-3);
    const p = s.profit || 0;
    return `<tr><td>${ymd(s.at)}</td><td>${R(nameOf(s.asset))}</td><td>${why.length ? why.join('<br>') : '—'}</td><td>${n0(s.got || 0)} ルト</td><td class="${p >= 0 ? 'up' : 'down'}">${sign(p)} ルト</td></tr>`;
  }).join('');
  const total = sells.reduce((t, s) => t + (s.profit || 0), 0);
  return `<h2>${R('ふりかえり（{売|う}った {株|かぶ}）')}</h2>
    <p>${R('{買|か}った ときの {目的|もくてき}と {理由|りゆう}、{売|う}った {結果|けっか}を くらべて みよう。')}</p>
    ${sells.length ? `<p>${R('{売|う}った {株|かぶ}の {損益|そんえき}の {合計|ごうけい}')}：<b class="${total >= 0 ? 'up' : 'down'}">${sign(total)}</b> ルト</p>` : ''}
    <table class="list"><tr><th>${R('{売|う}った {日|ひ}')}</th><th>${R('{銘柄|めいがら}')}</th><th>${R('{買|か}った ときの {目的|もくてき}：{理由|りゆう}')}</th><th>${R('{受|う}け{取|と}った')}</th><th>${R('{損益|そんえき}')}</th></tr>
    ${rows || `<tr><td colspan="5">${R('まだ {売|う}った {株|かぶ}は ありません')}</td></tr>`}</table>`;
}

// シミュレーション「つみたて」（仕様書 8-1）：毎月○ルトを、1か月○%で12か月。実際の残高は変わらない。
// 計算：月のはじめに積み立て → 月のおわりに その月の利息（1ルト未満は切り捨て）をたす（仮）
function mlSim() {
  return `<h2>${R('シミュレーション：つみたて')}</h2>
    <p>${R('{毎月|まいつき} {同|おな}じ ルトを {預|あず}けると、12か{月|げつ}で いくらに なるか {試|ため}せるよ。ほんとうの {残高|ざんだか}は {変|か}わらないよ。')}</p>
    <p>${R('{毎月|まいつき}')} <input id="simx" type="number" min="1" max="100000" value="100" style="width:7em"> ルト
      ${R('1か{月|げつ}の {利息|りそく}')} <input id="simr" type="number" min="0" max="10" step="0.1" value="0.5" style="width:5em"> %
      <button class="primary" onclick="mlSimCalc()">${R('{計算|けいさん}する')}</button></p>
    <p class="note">${R('{普通預金|ふつうよきん}は {月|つき}0.2%、{定期預金|ていきよきん}は {月|つき}0.5%（{試作品|しさくひん}の {数字|すうじ}）')}</p>
    <div id="simout"></div>${saverOnly(me) ? '' : mlTryHTML() + mlIfHTML() + mlCmpHTML()}`;
}
// シミュレーション「売買の試し」（仕様書 8-1）：○○を○株 買ったら／売ったら、内訳・円グラフ・投資上限の残りがどう変わるか（ほんとうの注文はしない）
function mlTryHTML() {
  return `<h2>${R('シミュレーション：{売買|ばいばい}の {試|ため}し')}</h2>
    <p><select id="trysec">${ML.SECTORS.map(s => `<option value="${s.id}">${s.name.replace(/\{([^|}]+)\|[^}]*\}/g, '$1')}</option>`).join('')}</select>
    を <input id="tryn" type="number" min="1" max="100" value="1" style="width:5em"> ${R('{株|かぶ}')}
    <button class="primary" onclick="mlTryCalc('buy')">${R('{買|か}ったら')}</button> <button onclick="mlTryCalc('sell')">${R('{売|う}ったら')}</button></p><div id="tryout"></div>`;
}
function mlTryCalc(side) {
  const id = $('#trysec').value, n = Math.floor(Number($('#tryn').value)), out = $('#tryout');
  if (!(n >= 1 && n <= 100)) { out.innerHTML = `<p class="msg">${R('{株|かぶ}の {数|かず}は 1〜100で いれてね')}</p>`; return; }
  const a = ML.assets(me.id), v = n * ML.disp(id), held = (ML.hold(me.id).sec[id] || { shares: 0 }).shares;
  let msg = '';
  if (side === 'buy' && v > a.savings) msg = '{普通預金|ふつうよきん}が たりないので、ほんとうは {買|か}えないよ。';
  if (side === 'buy' && v > ML.capLeft(me.id, me.grade)) msg += '{投資上限|とうしじょうげん}を こえるので、ほんとうは {買|か}えないよ。';
  if (side === 'sell' && n > held) msg = `{持|も}って いるのは ${held}{株|かぶ}だけなので、ほんとうは {売|う}れないよ。`;
  const b = Object.assign({}, a, side === 'buy' ? { savings: a.savings - v, stocks: a.stocks + v } : { savings: a.savings + v, stocks: a.stocks - v });
  const cap = ML.capLeft(me.id, me.grade);
  out.innerHTML = `<p>${R(`${nameOf(id)}を ${n}{株|かぶ}（1{株|かぶ} ${n0(ML.disp(id))} ルト・{合計|ごうけい} ${n0(v)} ルト）${side === 'buy' ? '{買|か}ったら' : '{売|う}ったら'}`)}</p>
    ${msg ? `<p class="msg">${R(msg)}</p>` : ''}
    <div style="display:flex;flex-wrap:wrap;gap:16px"><div><b>${R('いま')}</b>${pie(breakdown(a))}</div><div><b>${R(side === 'buy' ? '{買|か}ったら' : '{売|う}ったら')}</b>${pie(breakdown(b))}</div></div>
    <p>${R(`{投資上限|とうしじょうげん}の {残|のこ}り：${n0(cap)} ルト → ${n0(Math.max(0, side === 'buy' ? cap - v : cap + v))} ルト`)}</p>
    <p class="note">${R('{総資産|そうしさん}は かわらないよ（{普通預金|ふつうよきん}と {株|かぶ}が {入|い}れかわるだけ）。ほんとうの {売買|ばいばい}は {次|つぎ}の {月曜|げつよう}の {値段|ねだん}だから、{少|すこ}し ちがう ことも あるよ。')}</p>`;
}
// シミュレーション「預金と株のくらべ」（仕様書 8-1）：同じルトを1年おいたら。株は過去の1年の値動きの いちばん よかった／わるかった 場合（予想ではない）
function mlCmpHTML() {
  if (ML.state().history.length <= 52) return '';
  return `<h2>${R('シミュレーション：{預金|よきん}と {株|かぶ}の くらべ')}</h2>
    <p><input id="cmpx" type="number" min="10" max="100000" value="1000" style="width:7em"> ${R('ルトを 1{年|ねん} おいたら')}
    <select id="cmpsec">${ML.SECTORS.map(s => `<option value="${s.id}">${s.name.replace(/\{([^|}]+)\|[^}]*\}/g, '$1')}</option>`).join('')}</select>
    <button class="primary" onclick="mlCmpCalc()">${R('{計算|けいさん}する')}</button></p><div id="cmpout"></div>`;
}
function mlCmpCalc() {
  const x = Math.floor(Number($('#cmpx').value)), id = $('#cmpsec').value, out = $('#cmpout');
  if (!(x >= 10 && x <= 100000)) { out.innerHTML = `<p class="msg">${R('10〜100000ルトで いれてね')}</p>`; return; }
  const bank = r => { let b = x; for (let m = 0; m < 12; m++) b += Math.floor(b * r / 100); return b; };
  const H = ML.state().history, range = f => { let lo = Infinity, hi = -Infinity; for (let i = 52; i < H.length; i++) { const v = f(H[i]) / f(H[i - 52]); lo = Math.min(lo, v); hi = Math.max(hi, v); } return [Math.floor(x * lo), Math.floor(x * hi)]; };
  const [el, eh] = range(h => h.etf), [sl, sh] = range(h => h.prices[id]);
  const row = (n, a, b) => `<tr><td>${R(n)}</td><td>${b === undefined ? n0(a) : `${n0(a)} 〜 ${n0(b)}`} ルト</td></tr>`;
  out.innerHTML = `<table class="list"><tr><th></th><th>${R('1{年|ねん}{後|ご}')}</th></tr>
    ${row('{普通預金|ふつうよきん}（{月|つき}0.2%）', bank(0.2))}${row('{定期預金|ていきよきん}（{月|つき}0.5%）', bank(0.5))}
    ${row(ML.ETF_NAME, el, eh)}${row(nameOf(id), sl, sh)}</table>
    <p class="note">${R('{株|かぶ}は、これまでの 1{年|ねん}の {値動|ねうご}きで いちばん わるかった とき 〜 いちばん よかった ときだよ。これからの {予想|よそう}では ないよ。{預金|よきん}は へらないけれど、{株|かぶ}は へる ことも あるよ。{配当|はいとう}は {入|い}れて いないよ。')}</p>`;
}
// シミュレーション「もしも過去に買っていたら」（仕様書 8-1）：株価の記録（分割を調整した値段）から計算する
function mlIfHTML() {
  const n = ML.state().history.length, ws = [1, 4, 12, 26, 52].filter(w => w < n);
  if (!ws.length) return '';
  return `<h2>${R('シミュレーション：もしも {過去|かこ}に {買|か}っていたら')}</h2>
    <p><select id="ifsec">${ML.SECTORS.map(s => `<option value="${s.id}">${s.name.replace(/\{([^|}]+)\|[^}]*\}/g, '$1')}</option>`).join('')}</select>
    <select id="ifw">${ws.map(w => `<option value="${w}">${w}しゅうかん まえ</option>`).join('')}</select>
    に <input id="ifn" type="number" min="1" max="100" value="5" style="width:5em"> ${R('{株|かぶ}')}
    <button class="primary" onclick="mlIfCalc()">${R('{計算|けいさん}する')}</button></p><div id="ifout"></div>`;
}
function mlIfCalc() {
  const id = $('#ifsec').value, w = Number($('#ifw').value), n = Math.floor(Number($('#ifn').value)), out = $('#ifout');
  if (!(n >= 1 && n <= 100)) { out.innerHTML = `<p class="msg">${R('{株|かぶ}の {数|かず}は 1〜100で いれてね')}</p>`; return; }
  const H = ML.state().history, then = Math.round(H[H.length - 1 - w].prices[id]), now = ML.disp(id), a = then * n, b = now * n;
  out.innerHTML = `<p>${R(`${w}{週間|しゅうかん}まえの {値段|ねだん}：${n0(then)} ルト → いまの {値段|ねだん}：${n0(now)} ルト`)}</p>
    <p class="big">${n0(a)} ルト → <b>${n0(b)}</b> ルト（<span class="${b - a >= 0 ? 'up' : 'down'}">${sign(b - a)} ルト</span>）</p>
    <p class="note">${R('{過去|かこ}の {記録|きろく}で {計算|けいさん}した {数字|すうじ}だよ。これからも おなじに なるとは かぎらないよ。{配当|はいとう}は {入|い}れて いないよ。')}</p>`;
}
function mlSimCalc() {
  const out = $('#simout'); if (!out) return;
  const x = Math.floor(Number($('#simx').value)), r = Number($('#simr').value);
  if (!(x >= 1 && x <= 100000) || !(r >= 0 && r <= 10)) { out.innerHTML = `<p class="msg">${R('{毎月|まいつき}は 1〜100000ルト、{利息|りそく}は 0〜10%で いれてね')}</p>`; return; }
  const rows = []; let bal = 0, prin = 0;
  for (let m = 1; m <= 12; m++) { bal += x; prin += x; const it = Math.floor(bal * r / 100); bal += it; rows.push({ m, prin, gain: bal - prin, bal, it }); }
  const max = rows[11].bal || 1, W = 30, H = 160;
  const bars = rows.map((o, i) => { const hp = o.prin / max * H, hg = o.gain / max * H, xx = 30 + i * (W + 6); return `<rect x="${xx}" y="${10 + H - hp}" width="${W}" height="${hp}" fill="#2f6f4f"/><rect x="${xx}" y="${10 + H - hp - hg}" width="${W}" height="${hg}" fill="#e0a030"/><text x="${xx + W / 2}" y="${H + 26}" font-size="11" text-anchor="middle" fill="currentColor">${o.m}</text>`; }).join('');
  const last = rows[11];
  out.innerHTML = `<p class="big">${R('12か{月|げつ}{後|ご}')}：<b>${n0(last.bal)}</b> ルト</p>
    <p>${R(`{預|あず}けた {合計|ごうけい}（{元本|がんぽん}）：${n0(last.prin)} ルト　{利息|りそく}で {増|ふ}えた {分|ぶん}：${n0(last.gain)} ルト`)}</p>
    <svg viewBox="0 0 ${30 + 12 * (W + 6)} ${H + 34}" width="100%" style="max-width:520px">${bars}</svg>
    <p>${R('（{下|した}の {数字|すうじ}は {何|なん}か{月|げつ}{目|め}か）')}<br><span class="sw" style="background:#2f6f4f"></span>${R('{元本|がんぽん}')}　<span class="sw" style="background:#e0a030"></span>${R('{利息|りそく}で {増|ふ}えた {分|ぶん}')}</p>
    <details><summary>${R('{月|つき}ごとの {表|ひょう}')}</summary><table class="list"><tr><th>${R('{月|つき}')}</th><th>${R('{元本|がんぽん}')}</th><th>${R('その{月|つき}の {利息|りそく}')}</th><th>${R('{合計|ごうけい}')}</th></tr>
    ${rows.map(o => `<tr><td>${o.m}</td><td>${n0(o.prin)}</td><td>${n0(o.it)}</td><td>${n0(o.bal)}</td></tr>`).join('')}</table></details>`;
}

// 円グラフ（総資産の内訳：普通・定期・株。%は全学年で出す）
function pie(parts) {
  const total = parts.reduce((s, p) => s + p.v, 0) || 1; let a = -Math.PI / 2;
  const arcs = parts.filter(p => p.v > 0).map(p => {
    const b = a + p.v / total * Math.PI * 2, large = b - a > Math.PI ? 1 : 0;
    const d = p.v >= total ? `M60 0 A60 60 0 1 1 59.99 0 Z` : `M60 60 L${60 + 60 * Math.cos(a)} ${60 + 60 * Math.sin(a)} A60 60 0 ${large} 1 ${60 + 60 * Math.cos(b)} ${60 + 60 * Math.sin(b)} Z`;
    a = b; return `<path d="${d}" fill="${p.c}" stroke="#fff"/>`;
  }).join('');
  return `<div class="pie"><svg viewBox="0 0 120 120" width="150">${arcs || '<circle cx="60" cy="60" r="60" fill="#ddd"/>'}</svg>
    <ul>${parts.map(p => `<li><span class="sw" style="background:${p.c}"></span>${R(p.n)}：${n0(p.v)} ルト（${Math.round(p.v / total * 100)}%）</li>`).join('')}</ul></div>`;
}
const breakdown = a => [{ n: '{普通預金|ふつうよきん}', v: a.savings + a.reserved, c: '#2f6f4f' }, { n: '{定期預金|ていきよきん}', v: a.time, c: '#8fbf9f' }, { n: '{株|かぶ}', v: a.stocks, c: '#e0a030' }];
// 株の中身：銘柄（ETF・セクター）ごとの評価額と割合
const SEC_COLORS = ['#f2c14e', '#c0392b', '#1f5fa8', '#7d3c98', '#16a085', '#d35400', '#2c3e50', '#b7950b', '#e84393', '#5d6d7e', '#27ae60'];
function stockParts(childId) {
  const h = ML.hold(childId), parts = [];
  if (h.etf.units > 0) parts.push({ n: ML.ETF_NAME, v: Math.floor(h.etf.units * ML.state().etf) });
  ML.SECTORS.forEach(s => { const x = h.sec[s.id]; if (x) parts.push({ n: s.name, v: x.shares * ML.disp(s.id) }); });
  return parts.sort((a, b) => b.v - a.v).map((p, i) => Object.assign(p, { c: SEC_COLORS[i % SEC_COLORS.length] }));
}
// 総資産の円グラフ（1つにまとめる）：普通・定期・株の銘柄ごと。株の部分は外側に太い弧でかこむ
const CASH_BAND = '#3d7ea6';
function assetPie(childId) {
  const a = ML.assets(childId), stocks = stockParts(childId);
  const slices = [{ n: '{普通預金|ふつうよきん}', v: a.savings + a.reserved, c: '#2f6f4f' }, { n: '{定期預金|ていきよきん}', v: a.time, c: '#8fbf9f' }].concat(stocks);
  const total = slices.reduce((s, p) => s + p.v, 0) || 1, C = 85, r0 = 62, r1 = 70, r2 = 80;
  const pt = (r, ang) => `${(C + r * Math.cos(ang)).toFixed(2)} ${(C + r * Math.sin(ang)).toFixed(2)}`;
  const arc = (r, a0, a1) => `${a1 - a0 > Math.PI ? 1 : 0} 1 ${pt(r, a1)}`;
  let ang = -Math.PI / 2; const stockStart = -Math.PI / 2 + (slices[0].v + slices[1].v) / total * Math.PI * 2;
  const paths = slices.filter(p => p.v > 0).map(p => {
    const b = ang + p.v / total * Math.PI * 2;
    const d = p.v >= total ? `M${C} ${C - r0} A${r0} ${r0} 0 1 1 ${C - 0.01} ${C - r0} Z` : `M${C} ${C} L${pt(r0, ang)} A${r0} ${r0} 0 ${arc(r0, ang, b)} Z`;
    ang = b; return `<path d="${d}" fill="${p.c}" stroke="#fff" stroke-width="1"/>`;
  }).join('');
  // 外側の太い弧：預金（普通＋定期）と株を別の色で
  const bandArc = (s, e, color) => e - s <= 0 ? '' : e - s >= Math.PI * 2 - 1e-6 ? `<circle cx="${C}" cy="${C}" r="${(r1 + r2) / 2}" fill="none" stroke="${color}" stroke-width="${r2 - r1}"/>`
    : `<path d="M${pt(r2, s)} A${r2} ${r2} 0 ${arc(r2, s, e)} L${pt(r1, e)} A${r1} ${r1} 0 ${e - s > Math.PI ? 1 : 0} 0 ${pt(r1, s)} Z" fill="${color}"/>`;
  const gap = 0.03, cash = slices[0].v + slices[1].v;
  const band = bandArc(-Math.PI / 2 + (a.stocks > 0 ? gap : 0), stockStart - (a.stocks > 0 ? gap : 0), CASH_BAND)
    + bandArc(stockStart + (cash > 0 ? gap : 0), stockStart + a.stocks / total * Math.PI * 2 - (cash > 0 ? gap : 0), '#e0a030');
  const pc = v => Math.round(v / total * 100);
  return `<div class="pie"><svg viewBox="0 0 170 170" width="190">${paths || `<circle cx="${C}" cy="${C}" r="${r0}" fill="#ddd"/>`}${band}</svg>
    <ul><li><span class="sw band" style="background:${CASH_BAND}"></span><b>${R('{預金|よきん}')}：${n0(cash)} ルト（${pc(cash)}%）</b>
        <ul class="sub">${slices.slice(0, 2).map((p, i) => `<li><span class="sw" style="background:${p.c}"></span>${R(p.n)}：${n0(p.v)} ルト（${pc(p.v)}%）${i === 0 && a.reserved ? `<br><small class="note">${R(`うち ${n0(a.reserved)}ルトは {買|か}い{注文|ちゅうもん}の {取|と}り{置|お}き（{上|うえ}の {残高|ざんだか}には {入|はい}っていない）`)}</small>` : ''}</li>`).join('')}</ul></li>
      <li><span class="sw band"></span><b>${R('{株|かぶ}')}：${n0(a.stocks)} ルト（${pc(a.stocks)}%）</b>
        ${stocks.length ? `<ul class="sub">${stocks.map(p => `<li><span class="sw" style="background:${p.c}"></span>${R(p.n)}：${n0(p.v)} ルト（${pc(p.v)}%）</li>`).join('')}</ul>` : ''}</li></ul></div>
    ${stocks.some(p => p.n === ML.ETF_NAME) ? `<p class="note">${R('ETF「ROOT10」の{中|なか}は、10セクターに {同|おな}じだけ {分|わ}けて{入|はい}っている')}</p>` : ''}`;
}
function stockPie(childId) {
  const parts = stockParts(childId);
  if (!parts.length) return '';
  return `<h3>${R('{株|かぶ}の{中身|なかみ}')}</h3>${pie(parts)}
    ${parts.some(p => p.n === ML.ETF_NAME) ? `<p class="note">${R('ETF「ROOT10」の{中|なか}は、10セクターに {同|おな}じだけ {分|わ}けて{入|はい}っている')}</p>` : ''}`;
}

function mlHome(low) {
  const a = ML.assets(me.id), ml = ML.state();
  const etfR = ml.etf / ml.etfPrev - 1;
  if (saverOnly(me)) return `<h2>${R('{貯金|ちょきん}')}：${n0(a.total)} ルト</h2>${pie(breakdown(a).slice(0, 2))}${assetTrend()}
    <p class="note">${R('1{年生|ねんせい}は {貯金|ちょきん}だけ（{普通預金|ふつうよきん}と {定期預金|ていきよきん}）。{投資|とうし}は 2{年生|ねんせい}から できます。')}</p>`;
  return `<h2>${R('{総資産|そうしさん}')}：${n0(a.total)} ルト</h2>${assetPie(me.id)}${assetTrend()}
    ${a.reserved ? `<p class="note">${R(`{普通預金|ふつうよきん}のうち ${n0(a.reserved)}ルトは、{買|か}い{注文|ちゅうもん}で {取|と}り{置|お}き{中|ちゅう}`)}</p>` : ''}
    ${mlPf(low)}
    ${mlReadOnly ? '' : `<h3>${R('{今週|こんしゅう}の {値段|ねだん}の{動|うご}き')}</h3>${indexBox(low)}
    <table class="list"><tr><th>${R('{銘柄|めいがら}')}</th><th>${R('{今|いま}の{値段|ねだん}')}</th><th>${R('{先週|せんしゅう}から')}</th></tr>
    <tr><td>${R(ML.ETF_NAME)}</td><td>${ml.etf.toFixed(2)}</td><td>${updown(etfR, low)}</td></tr>
    ${low ? '' : ML.SECTORS.map(s => { const p = ML.disp(s.id), q = ml.prev[s.id] || ml.prices[s.id]; return `<tr><td>${R(s.name)}</td><td>${p}</td><td>${updown(q ? (ml.prices[s.id] - q) / q : 0, low)}</td></tr>`; }).join('')}</table>`}`;   // 先生の画面では、値段の表は上にあるので出さない
}
// 資産推移（仕様書 8-1）：総資産の折れ線。下から「稼いだ分」「利息・配当」、その上と線のあいだが「値上がり（赤）・値下がり（青）」
let assetSpan = 52;
function assetTrend() {
  const all = (ML.state().snap || {})[me.id] || [];
  const head = `<h3>${R('{資産|しさん}の {推移|すいい}')}</h3>`;
  if (all.length < 2) return head + `<p class="note">${R('まだ {記録|きろく}が ありません（{毎週|まいしゅう} {月曜|げつよう}に ふえます）。{試作品|しさくひん}では、{先生|せんせい}の {画面|がめん}の「{架空|かくう}の データを {作|つく}りなおす」で 6{年分|ねんぶん}の {記録|きろく}が できます。')}</p>`;
  const rows = all.slice(-(assetSpan + 1)), W = 600, H = 220, L = 54, T = 10, B = 26;
  const top = rows.map(r => r[2] + r[3]);
  const lo = Math.min(0, ...rows.map(r => Math.min(r[1], r[2]))), hi = Math.max(1, ...rows.map((r, k) => Math.max(r[1], top[k])));
  const X = k => L + (W - L - 8) * k / (rows.length - 1), Y = v => T + (H - T - B) * (hi - v) / (hi - lo || 1);
  const poly = (a, b, c) => `<polygon points="${a.map((v, k) => `${X(k)},${Y(v)}`).concat(b.map((v, k) => `${X(k)},${Y(v)}`).reverse()).join(' ')}" fill="${c}"/>`;
  const zero = rows.map(() => 0), earn = rows.map(r => r[2]);
  let gain = '';
  for (let k = 1; k < rows.length; k++) {   // 値上がり・値下がりの帯は、週ごとに色を決める
    const g = (rows[k][1] - top[k] + rows[k - 1][1] - top[k - 1]) / 2;
    gain += `<polygon points="${X(k - 1)},${Y(top[k - 1])} ${X(k)},${Y(top[k])} ${X(k)},${Y(rows[k][1])} ${X(k - 1)},${Y(rows[k - 1][1])}" fill="${g >= 0 ? '#e57373' : '#6fa8dc'}" opacity=".75"/>`;
  }
  const line = `<polyline points="${rows.map((r, k) => `${X(k)},${Y(r[1])}`).join(' ')}" fill="none" stroke="#222" stroke-width="2"/>`;
  const ymd = w => weekDate(w).replace(/-/g, '/');
  const axis = `<line x1="${L}" x2="${W - 8}" y1="${Y(0)}" y2="${Y(0)}" stroke="#999"/>
    <text x="${L - 4}" y="${Y(hi) + 4}" text-anchor="end" font-size="11">${n0(hi)}</text><text x="${L - 4}" y="${Y(0) + 4}" text-anchor="end" font-size="11">0</text>
    <text x="${L}" y="${H - 6}" font-size="11">${ymd(rows[0][0])}</text><text x="${W - 8}" y="${H - 6}" text-anchor="end" font-size="11">${ymd(rows[rows.length - 1][0])}</text>`;
  const [, t, e, i] = rows[rows.length - 1], g = t - e - i, f = rows[0];
  const spans = [[13, '3か{月|げつ}'], [52, '1{年|ねん}'], [99999, '{全部|ぜんぶ}']];
  return head + `<div class="seg">${spans.map(([n, l]) => `<button class="${n === assetSpan ? 'on' : ''}" onclick="assetSpan=${n};showAccount()">${R(l)}</button>`).join('')}</div>
    <svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:640px">${poly(earn, zero, '#2f6f4f')}${poly(top, earn, '#e0a030')}${gain}${axis}${line}</svg>
    <p><span class="sw" style="background:#2f6f4f"></span>${R('{稼|かせ}いだ {分|ぶん}')}：${n0(e)}　<span class="sw" style="background:#e0a030"></span>${R('{利息|りそく}・{配当|はいとう}')}：${n0(i)}${saverOnly(me) ? '' : `　<span class="sw" style="background:#e57373"></span>${R('{値上|ねあ}がり')}／<span class="sw" style="background:#6fa8dc"></span>${R('{値下|ねさ}がり')}：<b class="${g >= 0 ? 'up' : 'down'}">${g >= 0 ? '＋' : ''}${n0(g)}</b>`}（ルト）</p>
    <p class="note">${R(`{黒|くろ}い {線|せん}が ${saverOnly(me) ? '{貯金|ちょきん}' : '{総資産|そうしさん}'}。この {期間|きかん}で ${n0(f[1])} → ${n0(t)} ルト。{稼|かせ}いだ {分|ぶん}は、Eラーニングなどで もらった ルトから {交換|こうかん}で つかった ルトを ひいた もの。`)}</p>`;
}
// ROOT平均（日経平均のようなもの）：10セクターの株価を、6年前（記録の最初）を1000として平均した数。分割を調整した値段で計算する
function rootIndex(prices) {
  const base = ML.state().history[0].prices;
  return 1000 * ML.SECTORS.reduce((s, x) => s + prices[x.id] / base[x.id], 0) / ML.SECTORS.length;
}
function indexBox(low) {
  const hist = ML.state().history, pts = hist.slice(-53).map(h => ({ v: rootIndex(h.prices), d: weekDate(h.week) }));
  const now = pts[pts.length - 1].v, prev = pts.length > 1 ? pts[pts.length - 2].v : now, yr = pts[0].v;
  return `<div class="tchart"><h3>${R('ROOT{平均|へいきん}')}：${n0(now)}　${updown(now / prev - 1, low)} <small class="note">${R('{先週|せんしゅう}から')}</small></h3>
    <p class="note">${R('10セクターの {株価|かぶか}を {平均|へいきん}した {数|かず}（6{年前|ねんまえ}を1000とする）。{株|かぶ}{全体|ぜんたい}が {上|あ}がっているか {下|さ}がっているかが わかる。1{年前|ねんまえ}から')} ${updown(now / yr - 1, low)}</p>
    ${lineChart(pts, null, false, '')}</div>`;
}
// 上がった＝赤▲、下がった＝青▼、同じ＝灰色の「→」（1・2年は記号と ことばだけ）
function updown(r, low) {
  if (Math.abs(r) < 0.0005) return `<span class="note">→ ${R('{同|おな}じ')}</span>`;
  const up = r > 0, mark = up ? '▲' : '▼';
  return `<span class="${up ? 'up' : 'down'}">${mark}${low ? ' ' : ''}${low ? R(up ? '{上|あ}がった' : '{下|さ}がった') : `${up ? '＋' : '−'}${Math.abs(r * 100).toFixed(1)}%`}</span>`;
}

// 持っている銘柄の損益（評価額・評価損益）
function plOf(id) {
  const h = ML.hold(me.id);
  if (id === 'etf') { if (!(h.etf.units > 0)) return null; const v = Math.floor(h.etf.units * ML.state().etf); return { avg: h.etf.cost / h.etf.units, v, pl: v - h.etf.cost, cost: h.etf.cost }; }
  const x = h.sec[id]; if (!x) return null; const v = x.shares * ML.disp(id); return { avg: x.cost / x.shares, v, pl: v - x.cost, cost: x.cost };
}
const plText = (p, low) => `<span class="${p.pl >= 0 ? 'up' : 'down'}">${sign(p.pl)}${low ? '' : `（${pctS(p.pl, p.cost)}）`}</span>`;

// 1株あたりの配当（月）。少ないときは小数2けたで出す
const dps = id => id === 'etf' ? R('なし（{再投資型|さいとうしがた}）') : `${ML.divPerShare(id).toFixed(2)} ルト`;

// 株価の推移（週ごとの折れ線。分割を調整した値段）
let chartAsset = 'etf', chartSpan = 26;
// ref＝取得単価（買った値段の平均）。点線で引き、これより上なら勝ち・下なら負け
function lineChart(pts, ref, dec, unit = 'ルト') {
  const W = 640, Hh = 240, L = 48, B = 28, T = 10, Rr = 10;
  const vs = pts.map(p => p.v), all = ref ? vs.concat(ref) : vs, lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * 0.1 || 1;
  const y0 = lo - pad, y1 = hi + pad;
  const X = i => L + (W - L - Rr) * (pts.length > 1 ? i / (pts.length - 1) : 0.5), Y = v => T + (Hh - T - B) * (1 - (v - y0) / (y1 - y0));
  const ticks = [y0 + pad, (y0 + y1) / 2, y1 - pad];
  const up = vs[vs.length - 1] >= vs[0];
  return `<svg viewBox="0 0 ${W} ${Hh}" class="chart" role="img">
    ${ticks.map(t => `<line x1="${L}" x2="${W - Rr}" y1="${Y(t)}" y2="${Y(t)}" stroke="#ddd"/><text x="${L - 6}" y="${Y(t) + 4}" text-anchor="end" font-size="12" fill="#666">${t.toFixed(t < 10 ? 2 : 0)}</text>`).join('')}
    <polyline fill="none" stroke="${up ? '#c0392b' : '#1f5fa8'}" stroke-width="2.5" points="${pts.map((p, i) => `${X(i).toFixed(1)},${Y(p.v).toFixed(1)}`).join(' ')}"/>
    ${ref ? `<line x1="${L}" x2="${W - Rr}" y1="${Y(ref)}" y2="${Y(ref)}" stroke="#333" stroke-dasharray="6 4"/><text x="${L + 4}" y="${Y(ref) - 5}" font-size="12" fill="#333">かった ねだん（${ref.toFixed(ref < 10 ? 2 : 1)}）</text>` : ''}
    <circle cx="${X(pts.length - 1)}" cy="${Y(vs[vs.length - 1])}" r="4" fill="${up ? '#c0392b' : '#1f5fa8'}"/>
    ${xTicks(pts.length).map(i => `<line x1="${X(i)}" x2="${X(i)}" y1="${Hh - B}" y2="${Hh - B + 4}" stroke="#999"/><text x="${X(i)}" y="${Hh - 8}" font-size="12" fill="#666" text-anchor="${i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}">${dateLabel(pts[i].d, pts.length)}</text>`).join('')}
    <g class="tip" style="display:none"><line y1="${T}" y2="${Hh - B}" stroke="#666"/><circle r="5" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect height="40" rx="6" fill="#222" opacity=".9"/><text class="t1" font-size="12" fill="#fff"></text><text class="t2" font-size="14" font-weight="bold" fill="#fff"></text></g>
    <rect class="hit" x="${L}" y="${T}" width="${W - L - Rr}" height="${Hh - T - B}" fill="transparent" style="cursor:crosshair"
      data-pts='${JSON.stringify(pts.map((p, i) => [+X(i).toFixed(1), +Y(p.v).toFixed(1), p.v, p.d]))}' data-w="${W}" data-dec="${dec ? 1 : 0}" data-unit="${unit}"/>
  </svg>`;
}
// 横軸の日付：5か所くらい。期間が長いときは「年/月」、短いときは「月/日」
function xTicks(n) { const k = Math.min(5, n); return [...new Set(Array.from({ length: k }, (_, j) => Math.round(j * (n - 1) / (k - 1 || 1))))]; }
function dateLabel(iso, n) { const d = new Date(iso); return n > 60 ? `${d.getFullYear()}/${d.getMonth() + 1}` : `${d.getMonth() + 1}/${d.getDate()}`; }
// その週の日付（今週＝今日。1週前＝7日前）
function weekDate(w) { const d = new Date(); d.setDate(d.getDate() - (ML.state().week - w) * 7); return d.toISOString().slice(0, 10); }
// グラフをタップ（クリック）・なぞると、その時期の値段を出す
function bindCharts() {
  document.querySelectorAll('svg.chart rect.hit').forEach(hit => {
    const svg = hit.ownerSVGElement, pts = JSON.parse(hit.dataset.pts), W = +hit.dataset.w, dec = hit.dataset.dec === '1', tip = svg.querySelector('.tip');
    const show = e => {
      const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * (W / r.width);
      let best = pts[0]; pts.forEach(p => { if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p; });
      const [px, py, v, iso] = best, d = new Date(iso);
      tip.style.display = '';
      tip.querySelector('line').setAttribute('x1', px); tip.querySelector('line').setAttribute('x2', px);
      const c = tip.querySelector('circle'); c.setAttribute('cx', px); c.setAttribute('cy', py);
      const bw = 150, bx = Math.min(Math.max(px - bw / 2, 0), W - bw), by = py > 70 ? py - 52 : py + 12;
      const rc = tip.querySelector('rect'); rc.setAttribute('x', bx); rc.setAttribute('y', by); rc.setAttribute('width', bw);
      const t1 = tip.querySelector('.t1'), t2 = tip.querySelector('.t2');
      t1.setAttribute('x', bx + 10); t1.setAttribute('y', by + 16); t1.textContent = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ごろ`;
      t2.setAttribute('x', bx + 10); t2.setAttribute('y', by + 33); t2.textContent = `${dec ? v.toFixed(2) : Math.round(v)}${hit.dataset.unit ? ' ' + hit.dataset.unit : ''}`;
    };
    hit.addEventListener('pointermove', show);
    hit.addEventListener('pointerdown', show);
    hit.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') tip.style.display = 'none'; });
  });
}
// 取引の画面：選んだ銘柄の株価の推移（期間は「株価の推移」の画面と同じものを使う）
function tradeChart(id, low) {
  const pts = ML.state().history.slice(-(chartSpan + 1)).map(h => ({ v: id === 'etf' ? h.etf : h.prices[id], d: weekDate(h.week) }));
  const now = pts[pts.length - 1].v, first = pts[0].v, d = now - first, p = plOf(id);
  return `<div class="tchart"><h3>${R(nameOf(id))}${R('の{株価|かぶか}の{推移|すいい}')}
      <span class="${d >= 0 ? 'up' : 'down'}">（${d >= 0 ? '▲' : '▼'}${low ? '' : pctS(d, first)}）</span></h3>
    <div class="seg">${[[13, '3か{月|げつ}'], [26, '{半年|はんとし}'], [52, '1{年|ねん}'], [9999, '{全部|ぜんぶ}']].map(([n, l]) => `<button class="${n === chartSpan ? 'on' : ''}" data-span="${n}">${R(l)}</button>`).join('')}</div>
    ${lineChart(pts, p && p.avg, id === 'etf')}
    ${p ? `<table class="list"><tr><th>${R('{取得単価|しゅとくたんか}')}</th><th>${R('{現在値|げんざいね}')}</th><th>${R('{評価額|ひょうかがく}')}</th><th>${R('{評価損益|ひょうかそんえき}')}</th></tr>
      <tr><td>${p.avg.toFixed(2)}</td><td>${id === 'etf' ? now.toFixed(2) : Math.round(now)}</td><td>${n0(p.v)} ルト</td><td><b>${plText(p, low)}</b></td></tr></table>` : ''}
    <p>${R(id === 'etf' ? '1{口|くち}あたりの{配当|はいとう}' : '1{株|かぶ}あたりの{配当|はいとう}（1か{月|げつ}）')}：<b>${dps(id)}</b>${id === 'etf' ? '' : (low ? '' : `　${R('{配当利回|はいとうりまわ}り')} ${(ML.yieldOf(id) * 100).toFixed(2)}%`) + `<br><small>${R('{配当|はいとう}の{額|がく}は {毎年|まいとし}4{月|がつ}に {決|き}まり、1{年間|ねんかん} {変|か}わらない。{安|やす}いときに{買|か}うと {利回|りまわ}りが {高|たか}くなる')}</small>`}</p></div>`;
}
function mlChart(low) {
  const ml = ML.state(), ids = ['etf'].concat(ML.SECTORS.map(s => s.id));
  const hist = ml.history.slice(-(chartSpan + 1));
  const pts = hist.map(h => ({ w: h.week, v: chartAsset === 'etf' ? h.etf : h.prices[chartAsset], d: weekDate(h.week) }));
  const now = pts[pts.length - 1].v, first = pts[0].v, d = now - first;
  const splits = (ml.splits || []).filter(s => s.id === chartAsset);
  return `<h2>${R('{株価|かぶか}の{推移|すいい}')}</h2>
    <div class="seg">${ids.map(id => `<button class="${id === chartAsset ? 'on' : ''}" onclick="chartAsset='${id}';showAccount()">${R(nameOf(id))}</button>`).join('')}</div>
    <div class="seg">${[[13, '3か{月|げつ}'], [26, '{半年|はんとし}'], [52, '1{年|ねん}'], [9999, '{全部|ぜんぶ}']].map(([n, l]) => `<button class="${n === chartSpan ? 'on' : ''}" onclick="chartSpan=${n};showAccount()">${R(l)}</button>`).join('')}</div>
    <h3>${R(nameOf(chartAsset))}　${R('{今|いま}')} ${chartAsset === 'etf' ? now.toFixed(2) : Math.round(now)} ルト
      <span class="${d >= 0 ? 'up' : 'down'}">（${R('この{期間|きかん}で')} ${d >= 0 ? '▲' : '▼'}${low ? '' : pctS(d, first)}）</span></h3>
    ${lineChart(pts)}
    <table class="list">
      <tr><td>${R(chartAsset === 'etf' ? '1{口|くち}あたりの{配当|はいとう}（1か{月|げつ}）' : '1{株|かぶ}あたりの{配当|はいとう}（1か{月|げつ}）')}</td><td><b>${dps(chartAsset)}</b></td></tr>
      ${chartAsset !== 'etf' && !low ? `<tr><td>${R('{配当利回|はいとうりまわ}り（1か{月|げつ}）')}</td><td>${(ML.yieldOf(chartAsset) * 100).toFixed(2)}%</td></tr>` : ''}
      ${chartAsset !== 'etf' ? `<tr><td colspan="2" class="note">${R('{配当|はいとう}は {月末|げつまつ}に「{株数|かぶすう}×{値段|ねだん}×{配当率|はいとうりつ}」で{計算|けいさん}する。1ルトに たりない{分|ぶん}は {次|つぎ}の{月|つき}に くりこして、たまったら はらう。')}</td></tr>` : `<tr><td colspan="2" class="note">${R('ETFは {配当|はいとう}を {出|だ}さずに {値段|ねだん}に{上乗|うわの}せする（{再投資|さいとうし}）')}</td></tr>`}
    </table>
    ${splits.length ? `<p class="note">${R('{株式分割|かぶしきぶんかつ}')}：${splits.map(s => R(`${s.week}{週目|しゅうめ}`)).join('、')}${R('（グラフは {分割|ぶんかつ}に{合|あ}わせて {前|まえ}の{値段|ねだん}も {半分|はんぶん}にしている）')}</p>` : ''}`;
}

function mlPf(low) {
  const h = ML.hold(me.id), a = ML.assets(me.id), ml = ML.state(), rows = [];
  if (h.etf.units > 0) { const v = Math.floor(h.etf.units * ml.etf); rows.push({ id: 'etf', n: ML.ETF_NAME, q: `${h.etf.units.toFixed(4)}{口|くち}`, avg: h.etf.cost / h.etf.units, p: ml.etf, v, pl: v - h.etf.cost }); }
  Object.entries(h.sec).forEach(([id, x]) => { const p = ML.disp(id), v = x.shares * p; rows.push({ id, n: ML.SEC[id].name, q: `${x.shares}{株|かぶ}`, avg: x.cost / x.shares, p, v, pl: v - x.cost }); });
  return `<h3>${R('{持|も}っている{銘柄|めいがら}（{保有証券|ほゆうしょうけん}）')}</h3>` +
    (rows.length ? `<table class="list"><tr><th>${R('{銘柄|めいがら}')}</th><th>${R('{保有数|ほゆうすう}')}</th><th>${R('{取得単価|しゅとくたんか}')}</th><th>${R('{現在値|げんざいね}')}</th><th>${R('{評価額|ひょうかがく}')}</th><th>${R('{評価損益|ひょうかそんえき}')}</th><th>${R('1{株|かぶ}あたりの{配当|はいとう}（{月|つき}）')}</th></tr>
      ${rows.map(r => `<tr><td>${R(r.n)}</td><td>${R(r.q)}</td><td>${r.avg.toFixed(2)}</td><td>${typeof r.p === 'number' && r.p % 1 ? r.p.toFixed(2) : r.p}</td><td><b>${n0(r.v)}</b></td><td class="${r.pl >= 0 ? 'up' : 'down'}">${sign(r.pl)}${low ? '' : `（${pctS(r.pl, r.v - r.pl)}）`}</td><td>${dps(r.id)}</td></tr>`).join('')}</table>`
      : `<p>${R('まだ {何|なに}も {持|も}っていません')}</p>`) +
    `<p>${R('{配当|はいとう}の{合計|ごうけい}')}：${n0(h.div)} ルト　<small>${R('{次|つぎ}の{月|つき}への くりこし')}：${(Object.values(h.divCarry || {}).reduce((s, v) => s + v, 0) / 100).toFixed(2)} ルト</small></p>`;
}

// 取引：銘柄 → 数量 → 目的と理由 → 注文確認（買ったあとの総資産・投資上限の残り）→ パスワード → 注文受付
function mlTrade(low) {
  const t = mlT || (mlT = { step: 1, side: 'buy', asset: 'etf' });
  const left = ML.capLeft(me.id, me.grade), a = ML.assets(me.id);
  const head = me.grade <= 1 ? `<p class="note">${R('1{年生|ねんせい}は {買|か}えません（{貯金|ちょきん}だけ）。{持|も}っているものを {売|う}ることは できます。')}</p>`
    : `<p class="note">${R(`{次|つぎ}の{月曜|げつよう}の{値段|ねだん}で{売買|ばいばい}します（{成行|なりゆき}）。{投資上限|とうしじょうげん}は{総資産|そうしさん}の${me.grade <= 2 ? '1/4' : '3/4'}、{残|のこ}り ${n0(left)} ルト`)}</p>`;
  if (me.grade <= 1 && t.side === 'buy') t.side = 'sell';
  if (t.step === 1) {
    let assets = ['etf'].concat(low ? [] : ML.SECTORS.map(s => s.id));
    const h = ML.hold(me.id);
    if (t.side === 'sell') {
      // 売るときは、持っているものだけ
      assets = assets.filter(id => id === 'etf' ? h.etf.units > 0 : ((h.sec[id] || {}).shares || 0) > 0);
      const sideBtns = `<div class="seg"><button data-side="buy">${R('{買|か}う')}</button><button class="on" data-side="sell">${R('{売|う}る')}</button></div>`;
      if (!assets.length) return head + sideBtns + `<p>${R('{売|う}れるものを {持|も}っていません。{注文中|ちゅうもんちゅう}の{買|か}い{注文|ちゅうもん}は、{月曜|げつよう}に{成立|せいりつ}すると {売|う}れるようになります。')}</p>`;
      if (!assets.includes(t.asset)) t.asset = assets[0];
    }
    return head + `<div class="seg"><button class="${t.side === 'buy' ? 'on' : ''}" data-side="buy">${R('{買|か}う')}</button><button class="${t.side === 'sell' ? 'on' : ''}" data-side="sell">${R('{売|う}る')}</button></div>
      <h3>${R('{銘柄|めいがら}をえらぶ')}</h3><div class="units">${assets.map(id => `<button class="unit ${t.asset === id ? 'sel' : ''}" data-asset="${id}"><span class="nm">${R(nameOf(id))}</span><span class="tag">${id === 'etf' ? ML.state().etf.toFixed(2) : ML.disp(id)} ルト${t.side === 'sell' ? `・${R('{持|も}っている')} ${id === 'etf' ? `${h.etf.units.toFixed(4)}${R('{口|くち}')}` : `${h.sec[id].shares}${R('{株|かぶ}')}`}` : ''}${t.side === 'sell' && plOf(id) ? `<br><b>${plText(plOf(id), low)}</b>` : ''}${id === 'etf' || t.side === 'sell' ? '' : `・${R('{配当|はいとう}')} ${ML.divPerShare(id).toFixed(2)}/${R('{株|かぶ}')}`}</span></button>`).join('')}</div>
      ${low ? `<p class="note">${R('セクター{株|かぶ}は 3{年生|ねんせい}から')}</p>` : ''}
      ${tradeChart(t.asset, low)}
      <h3>${R(t.asset === 'etf' ? (t.side === 'buy' ? '{何|なん}ルト{分|ぶん} {買|か}う？（{金額|きんがく}で{買|か}う）' : '{何|なん}ルト{分|ぶん} {売|う}る？') : '{何株|なんかぶ}？（1{株|かぶ}ずつ）')}</h3>
      <input id="qty" class="ans" inputmode="numeric" value="${t.qty || ''}"> ${t.asset === 'etf' && t.side === 'sell' ? `<label class="inline" style="display:inline"><input type="checkbox" id="all" ${t.all ? 'checked' : ''}> ${R('{全部|ぜんぶ}')}</label>` : ''}
      ${t.side === 'buy' ? `<h3>${R('{目的|もくてき}')}</h3><div class="seg">${['{配当|はいとう}', '{値上|ねあ}がり', '{長|なが}く{持|も}つ'].map(p => `<button class="${t.purpose === p ? 'on' : ''}" data-purpose="${p}">${R(p)}</button>`).join('')}</div>
      <h3>${R('ひとこと{理由|りゆう}')}</h3><input id="why" value="${esc(t.reason || '')}" style="width:100%">` : ''}
      <p class="msg" id="tmsg">${t.err ? R(t.err) : ''}</p><button class="primary big" id="tnext">${R('{注文確認|ちゅうもんかくにん}へ')}</button>`;
  }
  if (t.step === 2) {
    const after = t.side === 'buy' ? left - t.reserve : left;
    return head + `<h2>${R('{注文確認|ちゅうもんかくにん}')}</h2><table class="list">
      <tr><td>${R('{売買|ばいばい}')}</td><td>${R(t.side === 'buy' ? '{買|か}い' : '{売|う}り')}</td></tr><tr><td>${R('{銘柄|めいがら}')}</td><td>${R(nameOf(t.asset))}</td></tr>
      <tr><td>${R('{数量|すうりょう}')}</td><td>${t.asset === 'etf' ? (t.all ? R('{全部|ぜんぶ}') : `${t.amount} ${R('ルト{分|ぶん}')}`) : `${t.shares} ${R('{株|かぶ}')}`}</td></tr>
      ${t.side === 'buy' ? `<tr><td>${R('{取|と}り{置|お}く{額|がく}')}</td><td>${n0(t.reserve)} ルト${t.asset === 'etf' ? '' : R('（{今|いま}の{値段|ねだん}×1.1。あまりは あとで もどる）')}</td></tr>
      <tr><td>${R('{目的|もくてき}')}</td><td>${R(t.purpose)}</td></tr>` : ''}
      <tr><td>${R('{注文|ちゅうもん}のあとの{総資産|そうしさん}')}</td><td>${n0(a.total)} ルト（${R('{変|か}わらない')}）</td></tr>
      <tr><td>${R('{投資上限|とうしじょうげん}の{残|のこ}り')}</td><td>${n0(after)} ルト</td></tr></table>
      <h3>${R('パスワードを もう{一度|いちど}')}</h3><input id="pw2" type="password"><p class="msg" id="tmsg">${t.err ? R(t.err) : ''}</p>
      <button onclick="mlT.step=1;mlT.err='';showAccount()">${R('もどる')}</button><button class="primary big" id="tok">${R('{注文|ちゅうもん}する')}</button>`;
  }
  return `<h2>${R('{注文|ちゅうもん}を {受|う}け{付|つ}けました')}</h2><p>${R('{次|つぎ}の{月曜|げつよう}に {成立|せいりつ}します。{注文照会|ちゅうもんしょうかい}で {取|と}り{消|け}せます。')}</p>
    <button onclick="mlT=null;showAccount('orders')">${R('{注文照会|ちゅうもんしょうかい}へ')}</button>`;
}
// moneylab.js の「できない理由」を、子どもの画面の文（ふりがなつき）に直す
const ML_ERR = { 'セクター株は3年生から': 'セクター{株|かぶ}は 3{年生|ねんせい}から', '1ルト以上で': '1ルト{以上|いじょう}で', '1株以上で': '1{株|かぶ}{以上|いじょう}で', '普通預金がたりない': '{普通預金|ふつうよきん}が たりない', '投資上限をこえる': '{投資上限|とうしじょうげん}を こえる', 'ETFの売り注文は1つまで（仮）': 'ETFの{売|う}り{注文|ちゅうもん}は 1つまで（{仮|かり}）', '持っていない': '{持|も}っていない', '売れる株数をこえる': '{売|う}れる{株数|かぶすう}を こえる' };
function mlBindTrade() {
  const t = mlT, keep = () => { const q = $('#qty'); if (q) t.qty = q.value.replace(/[^0-9]/g, ''); const w = $('#why'); if (w) t.reason = w.value; const al = $('#all'); if (al) t.all = al.checked; };
  document.querySelectorAll('[data-side]').forEach(b => b.onclick = () => { keep(); t.side = b.dataset.side; t.err = ''; showAccount(); });
  document.querySelectorAll('[data-asset]').forEach(b => b.onclick = () => { keep(); t.asset = b.dataset.asset; t.err = ''; showAccount(); });
  document.querySelectorAll('[data-span]').forEach(b => b.onclick = () => { keep(); chartSpan = Number(b.dataset.span); showAccount(); });
  document.querySelectorAll('[data-purpose]').forEach(b => b.onclick = () => { keep(); t.purpose = b.dataset.purpose; showAccount(); });
  if ($('#tnext')) $('#tnext').onclick = () => {
    keep(); const q = Number(t.qty);
    Object.assign(t, t.asset === 'etf' ? { amount: q, shares: 0 } : { shares: q, amount: 0 });
    if (t.side === 'buy' && !t.purpose) { t.err = '{目的|もくてき}を えらんでね'; return showAccount(); }
    if (t.side === 'buy' && !(t.reason || '').trim()) { t.err = 'ひとこと{理由|りゆう}を {書|か}いてね'; return showAccount(); }
    const r = ML.check(me.id, me.grade, t);
    if (typeof r === 'string') { t.err = ML_ERR[r] || r; return showAccount(); }
    t.reserve = r.reserve || 0; t.step = 2; t.err = ''; showAccount();
  };
  if ($('#tok')) $('#tok').onclick = async () => {
    const r = await Store.login(me.username, $('#pw2').value);
    if (!r.ok) { t.err = r.locked ? 'ロックされました' : 'パスワードが ちがいます'; return showAccount(); }
    const o = ML.place(me.id, me.grade, { side: t.side, asset: t.asset, shares: t.shares, amount: t.amount, all: !!t.all, purpose: t.purpose, reason: t.reason });
    if (typeof o === 'string') { t.step = 1; t.err = ML_ERR[o] || o; return showAccount(); }
    t.step = 3; showAccount();
  };
}

// 長い表は10件ずつ。page は 'mlOrdPage' などの変数名
const mlPage = { mlOrdPage: 0, mlLedPage: 0 };
function paged(all, key) {
  const pages = Math.max(1, Math.ceil(all.length / 10));
  const p = mlPage[key] = Math.min(Math.max(0, mlPage[key]), pages - 1);
  const go = mlReadOnly ? "showTeacher('ml')" : 'showAccount()';
  const pager = pages > 1 ? `<div class="pager"><button ${p ? '' : 'disabled'} onclick="mlPage.${key}--;${go}">${R('← {前|まえ}')}</button>
    <span>${p + 1} / ${pages}${R(`ページ（${all.length}{件|けん}）`)}</span>
    <button ${p < pages - 1 ? '' : 'disabled'} onclick="mlPage.${key}++;${go}">${R('{次|つぎ} →')}</button></div>` : '';
  return { rows: all.slice(p * 10, p * 10 + 10), pager };
}
function mlOrders() {
  const { rows: os, pager } = paged(ML.state().orders.filter(o => o.child === me.id).slice().reverse(), 'mlOrdPage');
  return `<h2>${R('{注文照会|ちゅうもんしょうかい}')}</h2><table class="list"><tr><th>${R('{銘柄|めいがら}')}</th><th>${R('{売買|ばいばい}')}</th><th>${R('{数量|すうりょう}')}</th><th>${R('{状態|じょうたい}')}</th><th></th></tr>
    ${os.map(o => `<tr><td>${R(nameOf(o.asset))}</td><td>${R(o.side === 'buy' ? '{買|か}い' : '{売|う}り')}</td>
      <td>${o.asset === 'etf' ? (o.all ? R('{全部|ぜんぶ}') : `${o.amount}${R('ルト{分|ぶん}')}`) : `${o.shares}${R('{株|かぶ}')}`}${o.units ? `<br><small>${o.units.toFixed(4)}${R('{口|くち}')}</small>` : ''}</td>
      <td>${R(o.status.replace('注文中', '{注文中|ちゅうもんちゅう}').replace('成立', '{成立|せいりつ}').replace('取り消し', '{取|と}り{消|け}し').replace('上限オーバー', '{上限|じょうげん}オーバー').replace('値上がりで買えない', '{値上|ねあ}がりで{買|か}えない'))}
        ${o.status === '成立' ? `<br><small>${o.side === 'buy' ? `${n0(o.paid)}${R('ルト {払|はら}った')}` : `${n0(o.got)}${R('ルト {入|はい}った')}（${R('{損益|そんえき}')} ${sign(o.profit)}）`}</small>` : ''}</td>
      <td>${o.status === '注文中' && !mlReadOnly ? `<button onclick="ML.cancel('${o.id}');showAccount()">${R('{取|と}り{消|け}す')}</button>` : ''}</td></tr>`).join('') || `<tr><td colspan="5">${R('{注文|ちゅうもん}は ありません')}</td></tr>`}</table>${pager}`;
}

function mlBank() {
  const ts = ML.state().time.filter(t => t.child === me.id);
  return `<h2>${R('{普通預金|ふつうよきん} → {定期預金|ていきよきん}')}</h2>
    <p>${R(`{普通預金|ふつうよきん}：${n0(ML.assets(me.id).savings)} ルト（{利息|りそく} {月|つき}0.2%）`)}<br>${R('{定期預金|ていきよきん}：{利息|りそく} {月|つき}0.5%。3か{月|げつ} {引|ひ}き{出|だ}せない。{満期|まんき}で {普通預金|ふつうよきん}に もどる')}</p>
    <input id="tamt" class="ans" inputmode="numeric"> ルト <button class="primary" onclick="const e=ML.toTime(me.id,Number($('#tamt').value));if(e)alert('ふつうよきんが たりないよ（1ルト いじょうで いれてね）');showAccount()">${R('{定期預金|ていきよきん}にする')}</button>
    <h3>${R('{定期預金|ていきよきん}の{一覧|いちらん}')}</h3><table class="list"><tr><th>${R('{元本|がんぽん}')}</th><th>${R('{満期|まんき}まで')}</th></tr>
    ${ts.map(t => `<tr><td>${n0(t.principal)} ルト</td><td>${R(`あと ${ML.C.timeMonths - t.months}か{月|げつ}`)}</td></tr>`).join('') || `<tr><td colspan="2">${R('ありません')}</td></tr>`}</table>`;
}

function mlLedger() {
  const { rows: L, pager } = paged(Store.get().ledger.filter(l => l.child === me.id).slice().sort((x, y) => x.at < y.at ? 1 : -1), 'mlLedPage');
  const ymd = iso => { const d = new Date(iso); return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`; };
  const MEMO = { 'Eラーニング': 'Eラーニング', '点数アップ+1 Eラーニング': 'Eラーニング（{点数|てんすう}アップ＋1）', '買い注文の取り置き': '{買|か}い{注文|ちゅうもん}の{取|と}り{置|お}き', '取り置きをもどす': '{取|と}り{置|お}きを もどす', '取り置きの残りをもどす': '{取|と}り{置|お}きの {残|のこ}りを もどす', 'ETFを売った': 'ETFを {売|う}った', '株を売った': '{株|かぶ}を {売|う}った', '普通預金の利息': '{普通預金|ふつうよきん}の{利息|りそく}', '配当': '{配当|はいとう}', '宿題チェック': '{宿題|しゅくだい}チェック', 'テスト用の入金': 'テスト{用|よう}の{入金|にゅうきん}','定期預金へ': '{定期預金|ていきよきん}へ', '定期預金の満期': '{定期預金|ていきよきん}の{満期|まんき}' };
  return `<h2>${R('{入出金|にゅうしゅっきん}の{記録|きろく}（{普通預金|ふつうよきん}）')}</h2><p>${R('{残高|ざんだか}')}：<b>${n0(Store.balance(me.id))}</b> ルト</p>
    <table class="list"><tr><th>${R('{日|ひ}にち')}</th><th>${R('{何|なに}で')}</th><th>ルト</th></tr>
    ${L.map(l => { const a = l.attempt && Store.get().attempts.find(x => x.id === l.attempt); return `<tr><td>${ymd(l.at)}</td><td>${R(MEMO[l.memo] || l.memo)}${a ? `<br><small>${R(UNITS[a.unit].name)}</small>` : ''}</td><td class="${l.amount >= 0 ? 'up' : 'down'}">${l.amount >= 0 ? '＋' : ''}${n0(l.amount)}</td></tr>`; }).join('')}</table>${pager}`;
}

// ---- 先生の画面：株価の承認（マネーラボ仕様書 5-1・8-2）。金曜の案を見て「承認」か「差し戻し」だけ。数字は書きかえられない ----
// 試作品：案は乱数。コメントは決まった形の文（本番は Claude が セクターの変化率だけを見て作る）。大きく動いた＝±5%以上（仮）
function mlProposalHTML() {
  const ml = ML.state(), p = ML.proposal(), BIG = 0.05;
  const dt = iso => { const d = new Date(iso); return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const pc = r => `<span class="${r > 0 ? 'up' : r < 0 ? 'down' : ''}">${r > 0 ? '▲＋' : r < 0 ? '▼−' : '±'}${Math.abs(r * 100).toFixed(1)}%</span>`;
  const sn = s => Furigana.render(s.name, 'none');
  let body;
  if (!p || p.status === '期限切れ') {
    body = `<p>${p ? '<span class="warn">前の案は、承認されないまま月曜をすぎました（株価は据え置き）。</span> ' : ''}いま、案は ありません。${ml.missed ? `<b>反映されていない週が ${ml.missed}週</b> あります（次の案で まとめて反映）。` : ''}</p>
      <p><button class="primary" onclick="ML.propose();showTeacher('ml')">金曜の「株価の案」を作る</button>
      <button onclick="if(confirm('承認された案が ないまま、月曜の処理を します（株価は 据え置き。注文の約定は します）'))ML.monday(false),showTeacher('ml')">案なしで 月曜にする（据え置きのテスト）</button></p>`;
  } else {
    const re = ML.etfRate(p.rates), rows = ML.SECTORS.map(s => { const now = ml.prices[s.id], nx = now * (1 + p.rates[s.id]); return { s, r: p.rates[s.id], now: Math.round(now), nx: Math.round(nx) }; });
    const big = rows.filter(x => Math.abs(x.r) >= BIG), split = rows.filter(x => x.nx > ML.C.splitThreshold), same = rows.filter(x => x.nx === x.now);
    const comment = [`上がった ${rows.filter(x => x.r > 0).length}セクター・下がった ${rows.filter(x => x.r < 0).length}セクター。`,
      big.length ? `大きく動いた（±${BIG * 100}%以上）：${big.map(x => `${sn(x.s)}（${(x.r > 0 ? '＋' : '−') + Math.abs(x.r * 100).toFixed(1)}%）`).join('、')}。数字が おかしくないか 見てください。` : `大きく動いた（±${BIG * 100}%以上）セクターは ありません。`,
      split.length ? `株式分割の見込み（${ML.C.splitThreshold}ルトを こえる）：${split.map(x => sn(x.s)).join('、')}。` : '',
      same.length ? `先週と 同じ値段：${same.map(x => sn(x.s)).join('、')}（取りこぼしでないか 確かめる）。` : '',
      p.weeks > 1 ? `<b>${p.weeks}週分を まとめた案です</b>（前の週が 承認されなかったため）。` : ''].filter(Boolean);
    const st = p.status === '提案中' ? '<span class="warn">まだ 承認していません</span>' : p.status === '承認' ? `<b class="st-done">承認ずみ</b>（${esc(p.byName)}・${dt(p.byAt)}）。月曜の朝に 反映されます` : `<span class="warn">差し戻し</span>（${esc(p.byName)}・${dt(p.byAt)}）理由：${esc(p.reason || '')}`;
    body = `<p>${ml.week + 1}週目の案（作った日時：${dt(p.at)}）　${st}</p>
      <table class="list" style="max-width:720px"><tr><th>セクター</th><th>先週（今の値段）</th><th>今週の案</th><th>変化率</th></tr>
        ${rows.map(x => `<tr><td>${sn(x.s)}</td><td>${x.now}</td><td><b>${x.nx}</b></td><td>${pc(x.r)}</td></tr>`).join('')}
        <tr><td>${ML.ETF_NAME}</td><td>${ml.etf.toFixed(2)}</td><td><b>${(ml.etf * (1 + re)).toFixed(2)}</b></td><td>${pc(re)}</td></tr></table>
      <p><b>コメント（決まった形の文）</b><br>${comment.join('<br>')}</p>
      <p>${p.status === '提案中' ? `<button class="primary" onclick="ML.approve(me.id,me.name);showTeacher('ml')">承認する</button>
          <button onclick="mlReject()">差し戻す（理由を書く）</button>` : ''}
        ${p.status === '差し戻し' ? `<button class="primary" onclick="ML.propose();showTeacher('ml')">データを取り直して、もう一度 案を作る</button>` : ''}
        ${p.status === '承認' ? `<button class="primary" onclick="ML.monday(false);showTeacher('ml')">月曜の処理をする（案を反映・注文の約定）</button>`
          : `<button onclick="if(confirm('承認していない まま、月曜の処理を します（株価は 据え置き。注文の約定は します）'))ML.monday(false),showTeacher('ml')">承認しないで 月曜にする（据え置きのテスト）</button>`}</p>`;
  }
  const past = (ml.pastProposals || []).slice(-5).reverse();
  return `<div class="summary"><h3>株価の承認（金曜の案 → 先生が承認 → 月曜に反映）</h3>${body}
    <p class="note">できるのは「承認」か「差し戻し」だけ（数字は 書きかえられない）。承認した人と時刻は 記録に のこる。試作品では、案は 乱数で作る（本番は 実際の業種別ETFの 金曜の終値。コメントは Claude が セクターの変化率だけを見て作る）。</p>
    ${past.length ? `<details class="detail"><summary>これまでの案（新しい順・5件）</summary><table class="list" style="max-width:720px"><tr><th>週</th><th>結果</th><th>承認・差し戻しした人</th><th>時刻</th></tr>
      ${past.map(x => `<tr><td>${x.week}週目${x.weeks > 1 ? `（${x.weeks}週分）` : ''}</td><td>${x.status === '期限切れ' ? '承認なし（据え置き）' : x.status}</td><td>${esc(x.byName)}</td><td>${x.byAt ? dt(x.byAt) : ''}</td></tr>`).join('')}</table></details>` : ''}</div>`;
}
function mlReject() {
  const why = prompt('差し戻しの理由（例：自動車の数字が 大きすぎる）'); if (why === null) return;
  if (!why.trim()) return alert('理由を 書いてください');
  ML.reject(me.id, me.name, why.trim()); showTeacher('ml');
}
// ---- 先生の画面：マネーラボを試す（試作品だけ。本番は金曜の提案→先生の承認→月曜の反映） ----
function mlTeacherHTML() {
  const ml = ML.state();
  const kids = Store.children();
  const chg = (now, prev) => { if (!prev) return '-'; const d = now - prev; return `<span class="${d > 0 ? 'up' : d < 0 ? 'down' : ''}">${d > 0 ? '▲＋' : d < 0 ? '▼−' : '±'}${Math.abs(d / prev * 100).toFixed(1)}%</span>`; };
  // 記録：「-293週目」は日付（yyyy/mm/dd）に、「drug」などは名前に直して出す
  const logText = x => x.replace(/^(-?\d+)週目：/, (m, w) => `${weekDate(Number(w)).replace(/-/g, '/')}：`)
    .replace(/^(.*?：)(\w+) を分割/, (m, p, id) => `${p}${ML.SEC[id] ? Furigana.render(ML.SEC[id].name, 'none') : id} を分割`);
  return `${mlProposalHTML()}
    <div class="summary" style="border-left-color:#b9770e"><b>🧪 試作品だけ：時間を進めるボタン</b>（本番には ありません。本番は カレンダーどおりに 進みます）
    <p class="note">架空のデータを 作ってから、ボタンで <b>${ml.week}週・${ml.month}か月</b> 進めました。</p>
    <div class="btns">
      <button title="案 → 承認 → 月曜の処理（株価・分割・約定）を 自動で" onclick="ML.monday(true);showTeacher('ml')">1週間進める（自動で承認）</button>
      <button title="4週＋月末の処理" onclick="for(let i=0;i<4;i++)ML.monday(true);ML.monthEnd();showTeacher('ml')">1か月進める（自動で承認）</button>
      <button title="利息・定期・配当・ETFの再投資と信託報酬" onclick="ML.monthEnd();showTeacher('ml')">月末の処理だけ</button>
      <button onclick="Store.children().forEach(c=>Store.get().ledger.push({child:c.id,at:new Date().toISOString(),amount:500,memo:'テスト用の入金'}));Store.save();showTeacher('ml')">全員に＋500ルト</button>
    </div></div>
    <h3>子どもごとの資産</h3><table class="list"><tr><th>子ども</th><th>総資産</th><th>普通</th><th>定期</th><th>株</th><th>注文中</th></tr>
      ${kids.map(c => { const a = ML.assets(c.id); return `<tr><td>${esc(c.name)}（${c.grade}年）</td><td><b>${n0(a.total)}</b></td><td>${n0(a.savings)}</td><td>${n0(a.time)}</td><td>${n0(a.stocks)}</td><td>${ml.orders.filter(o => o.child === c.id && o.status === '注文中').length}</td></tr>`; }).join('')}</table>
    <h3>値段</h3>${indexBox(false)}<table class="list"><tr><th>銘柄</th><th>今</th><th>先週から</th><th>1株の配当（月）</th><th>利回り</th></tr>
      ${(() => { const hs = ml.history, a = rootIndex(hs[hs.length - 1].prices), b = hs.length > 1 ? rootIndex(hs[hs.length - 2].prices) : a; return `<tr><td><b>ROOT平均</b>（10セクターの平均。6年前＝1000）</td><td><b>${n0(a)}</b></td><td>${chg(a, b)}</td><td>-</td><td>-</td></tr>`; })()}
      <tr><td>${ML.ETF_NAME}</td><td>${ml.etf.toFixed(2)}</td><td>${chg(ml.etf, ml.etfPrev)}</td><td>なし</td><td>-</td></tr>
      ${ML.SECTORS.map(s => `<tr><td>${Furigana.render(s.name, 'none')}</td><td>${ML.disp(s.id)}</td><td>${chg(ml.prices[s.id], ml.prev[s.id])}</td><td>${ML.divPerShare(s.id).toFixed(2)}</td><td>${(ML.yieldOf(s.id) * 100).toFixed(2)}%</td></tr>`).join('')}</table>
    <p class="note">1株の配当は毎年4月に決めて1年間同じ。データを作った日時：${Store.get().made || 'ふめい'}</p>
    ${ml.log.length ? `<details><summary>記録（新しい順・10件）</summary><ul>${ml.log.slice(-10).reverse().map(x => `<li>${Furigana.render(logText(x), 'none')}</li>`).join('')}</ul></details>` : ''}
    ${mlHandHTML()}
    <h3>子どもの口座の中身（見るだけ）</h3>
    <select id="mlkid">${kids.map(c => `<option value="${c.id}" ${c.id === mlKid ? 'selected' : ''}>${esc(c.name)}（${c.grade}年）</option>`).join('')}</select>
    <div class="ml">${mlChildView(mlKid || kids[0].id)}</div>`;
}
let mlKid = null, mlReadOnly = false;
// 子どもの画面と同じ中身を、ふりがななし・ボタンなしで出す
function mlChildView(id) {
  const c = Store.children().find(x => x.id === id), saveMe = me, saveMode = viewMode;
  me = c; viewMode = 'none'; mlReadOnly = true;
  try {
    const ts = ML.state().time.filter(t => t.child === id);
    const os = ML.state().orders.filter(o => o.child === id);
    const why = os.filter(o => o.side === 'buy').slice(-5).reverse().map(o => `<li>${Furigana.render(nameOf(o.asset), 'none')}：目的「${Furigana.render(o.purpose || '', 'none')}」理由「${esc(o.reason || '')}」</li>`).join('');
    const saver = saverOnly(c);
    return mlHome(c.grade <= 2) + (saver ? '' : mlOrders()) +
      `<h3>定期預金</h3><table class="list"><tr><th>元本</th><th>満期まで</th></tr>${ts.map(t => `<tr><td>${n0(t.principal)} ルト</td><td>あと${ML.C.timeMonths - t.months}か月</td></tr>`).join('') || '<tr><td colspan="2">ありません</td></tr>'}</table>
      ${saver ? '' : `<h3>買うときの目的と理由（最近5件）</h3><ul>${why || '<li>ありません</li>'}</ul>`}` + mlShop() + mlLedger();
  } finally { me = saveMe; viewMode = saveMode; mlReadOnly = false; }
}
function mlTeacherBind() { const s = $('#mlkid'); if (s) s.onchange = () => { mlKid = s.value; mlPage.mlOrdPage = mlPage.mlLedPage = 0; showTeacher('ml'); }; }
