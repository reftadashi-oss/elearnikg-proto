// 名作を 見て 打つ（視写タイピング。2026年11月26日 ユーザー決定）。bunko.js・typing.js の あとに 読む。
// 左に お手本（青空文庫の 本文・ふりがな つき）、右に 打った 文。日本語入力（IME）で 打つ。5分（仮）。3年から（仮）。
// ふりがなの ついた ことばは、漢字でも ひらがなでも 正解（漢字に 変えられなくても すすめる）。空白・改行は 見ない。
// 写しは 打つ 練習なので、お手本の コピー・はりつけは できない ように する。記録は typing（level：作品の id）。ルトなし（仮）。
const Bunko = (() => {
  const SEC = 300;   // 5分（仮）
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // お手本の ふりがなは 青空文庫の とおり いつも 出す（学年の ふりがな 設定とは べつ）
  const ruby = s => s.replace(/\{([^|}]+)\|([^}]+)\}|([^{]+)/g, (m, a, y, t) => t !== undefined ? esc(t) : `<ruby>${esc(a)}<rt>${esc(y)}</rt></ruby>`);
  const N = s => s.normalize('NFKC').replace(/\s+/g, '');
  // 本文 → 打つ 単位（ルビ つきは 漢字 と よみ の どちらでも いい）
  const units = w => { if (w.u) return w.u; const u = []; let para = 0;
    const re = /\{([^|}]+)\|([^}]+)\}|\n+|[\s\S]/g; let m;
    while ((m = re.exec(w.text))) {
      if (m[1]) u.push({ s: m[0], alt: [N(m[1]), N(m[2])], len: m[1].length, p: para });
      else if (/^\n+$/.test(m[0])) { if (/\n\n/.test(m[0])) para++; u.push({ s: m[0], skip: true, p: para }); }
      else { const n = N(m[0]); u.push(n ? { s: m[0], alt: [n], len: 1, p: para } : { s: m[0], skip: true, p: para }); }
    }
    return (w.u = u); };
  // 打った 文が お手本の どこまで 合って いるか
  function match(w, from, typed) {
    const u = units(w), t = N(typed); let i = from, j = 0, chars = 0;
    while (i < u.length && j < t.length) {
      if (u[i].skip) { i++; continue; }
      const a = u[i].alt.find(x => t.startsWith(x, j));
      if (!a) { // ひらがなで 打ちかけ（よみの とちゅう）は まちがいに しない
        const part = u[i].alt.find(x => x.startsWith(t.slice(j)));
        return { i, j, chars, ok: !!part, partial: !!part };
      }
      j += a.length; chars += u[i].len; i++;
    }
    while (i < u.length && u[i].skip) i++;
    return { i, j, chars, ok: j >= t.length, done: i >= u.length };
  }
  const total = w => units(w).filter(x => !x.skip).reduce((s, x) => s + x.len, 0);
  const recs = () => { const S = Store.get(); return S.typing || (S.typing = []); };
  const posOf = id => { const r = recs().filter(x => x.child === me.id && x.level === id && x.to !== undefined).pop(); return r && r.to < units(BUNKO.find(w => w.id === id)).length ? r.to : 0; };
  const doneChars = (w, i) => units(w).slice(0, i).filter(x => !x.skip).reduce((s, x) => s + x.len, 0);

  const css = document.createElement('style');
  css.textContent = `.bk{max-width:1100px}.bk .cols{display:flex;gap:12px;align-items:stretch;text-align:left}.bk .cols>div{flex:1;min-width:0}
  .bk .model{border:1px solid #c9d3df;border-radius:8px;background:#fffdf6;padding:10px 14px;height:22em;overflow:auto;line-height:2.3;font-size:1.05em;user-select:none;-webkit-user-select:none}
  .bk .model .d{color:#9aa}.bk .model .cur{background:#fff176;border-radius:3px}.bk .model .nx{background:#fff9c4}.bk .model p{margin:0 0 .6em}
  .bk textarea{width:100%;box-sizing:border-box;height:22em;font-size:1.05em;line-height:1.9;padding:10px 14px;border:2px solid #90caf9;border-radius:8px;resize:none}
  .bk textarea.bad{border-color:#e57373;background:#fff6f6}.bk .msg{min-height:1.6em;margin:6px 0}.bk .msg .er{color:#c62828}
  .bk .credit{font-size:.75em;color:#667;text-align:left;margin-top:8px}
  @media (max-width:700px){.bk .cols{flex-direction:column}.bk .model,.bk textarea{height:12em}}`;
  document.head.appendChild(css);

  // 作品を タイピングの 記録の レベルに 入れる（先生・保護者の 画面の 表に 出る）
  if (typeof Typing !== 'undefined') BUNKO.forEach(w => Typing.LEVELS.push({ id: w.id, name: w.title, label: '名作', note: '', bunko: true }));
  // メニュー（typing.js の メニューの 下に 出す）
  const menuHTML = () => `<h3>${R('③ {名作|めいさく}を {見|み}て {打|う}つ（3{年|ねん}から）')}</h3>
    <p>${R(`{左|ひだり}の お{手本|てほん}を {見|み}て、{右|みぎ}に {日本語|にほんご}で {打|う}とう。${SEC / 60}{分|ふん}。ふりがなの ついた ことばは ひらがなで {打|う}っても いいよ。つぎは つづきから はじまる。`)}</p>
    <div class="units">${BUNKO.map(w => { const p = posOf(w.id), pc = Math.round(doneChars(w, p) / total(w) * 100);
      return `<button class="unit" onclick="Bunko.start('${w.id}')"><small>${esc(w.author)}</small><span class="nm">${esc(w.title)}</span><span class="tag">${pc ? R(`${pc}% まで {打|う}った`) : R('はじめから')}</span></button>`; }).join('')}</div>
    <p class="note">${R('{本文|ほんぶん}は {青空文庫|あおぞらぶんこ}より（{著作権|ちょさくけん}の {切|き}れた {作品|さくひん}）。')}</p>`;

  let st = null, timer = null;
  const stop = () => { if (timer) clearInterval(timer); timer = null; };
  function draw() {
    const w = st.w, u = units(w), m = match(w, st.from, st.ta.value);
    st.m = m;
    // お手本：前の 段落 少し ＋ いまの 所から 先を 出す
    const p0 = Math.max(0, u[st.from] ? u[st.from].p - 1 : 0); let html = '', p = -1, nxEnd = m.i;
    for (let k = m.i; k < u.length && nxEnd - m.i < 12; k++) if (!u[k].skip) nxEnd = k + 1;
    for (let k = 0; k < u.length; k++) { const x = u[k]; if (x.p < p0) continue; if (x.p > (u[m.i] || u[u.length - 1]).p + 3) break;
      if (x.p !== p) { html += (p >= 0 ? '</p>' : '') + '<p>'; p = x.p; }
      if (x.skip) { if (/\n/.test(x.s) && !/\n\n/.test(x.s)) html += '<br>'; else if (!/\n/.test(x.s)) html += esc(x.s); continue; }
      const cls = k < st.from ? 'd' : k < m.i ? 'd' : k === m.i ? 'cur' : k < nxEnd ? 'nx' : '';
      html += `<span class="${cls}"${k === m.i ? ' id="bkcur"' : ''}>${ruby(x.s)}</span>`; }
    st.model.innerHTML = html + '</p>';
    const c = document.getElementById('bkcur'); if (c) st.model.scrollTop = Math.max(0, c.offsetTop - st.model.offsetTop - 60);
    st.ta.classList.toggle('bad', !m.ok);
    const ok = m.chars;
    $('#bkn').textContent = ok;
    $('#bkmsg').innerHTML = !m.ok ? `<span class="er">${R(`ちがう ところが あるよ。{黄色|きいろ}の ところ「${esc(u[m.i] ? u[m.i].alt.join('」か「') : '')}」から {打|う}ちなおそう（BackSpace で けす）。`)}</span>` : m.done ? R('さいごまで {打|う}てた！ すごい！') : '';
    if (m.done && m.ok) finish();
  }
  function start(id, fresh) {
    document.onkeydown = null;   // typing.js の キー操作を 止める
    stop(); const w = BUNKO.find(x => x.id === id);
    st = { w, from: fresh ? 0 : posOf(id), t0: 0 };
    app().innerHTML = header(`<button onclick="Bunko.quit()">${R('やめる')}</button>`) + `<main id="typ" class="typ bk">
      <p class="tbar"><b>${esc(w.title)}</b>（${esc(w.author)}）　${R('のこり')} <b id="bkt">${SEC / 60}:00</b>　／　${R('{打|う}てた {文字|もじ}')} <b id="bkn">0</b>
        ${st.from ? `<button style="font-size:.8em;margin-left:8px" onclick="Bunko.restart('${id}')">${R('はじめから')}</button>` : ''}</p>
      <div class="cols"><div><div class="model" id="bkmodel"></div></div><div><textarea id="bkta" spellcheck="false" autocomplete="off" placeholder="${esc(F_('ここに {打|う}つ'))}"></textarea></div></div>
      <p class="msg" id="bkmsg">${R('{打|う}ち{始|はじ}めると {時間|じかん}が スタート。{日本語|にほんご}{入力|にゅうりょく}（「{半角|はんかく}/{全角|ぜんかく}」キー）に して {打|う}とう。')}</p>
      <p><button onclick="Bunko.finish()">${R('ここで おわる')}</button></p>
      <p class="credit">${R('{本文|ほんぶん}：{青空文庫|あおぞらぶんこ}より')}　${esc(w.author)}「${esc(w.title)}」　${esc(w.bib)}</p></main>`;
    st.model = $('#bkmodel'); st.ta = $('#bkta');
    const ta = st.ta;
    ['paste', 'drop'].forEach(ev => ta.addEventListener(ev, e => { e.preventDefault(); $('#bkmsg').innerHTML = `<span class="er">${R('はりつけは できないよ。じぶんで {打|う}とう。')}</span>`; }));
    st.model.addEventListener('copy', e => e.preventDefault());
    ta.addEventListener('keydown', e => { e.stopPropagation(); if (typeof touch === 'function') touch(); });
    // 変換中（ひらがなの まま 未確定）は まちがいに しない。確定（compositionend）してから しらべる
    ta.addEventListener('input', e => { if (!st) return; if (!st.t0) st.t0 = Date.now(); if (typeof touch === 'function') touch(); if (!e.isComposing) draw(); });
    ta.addEventListener('compositionend', () => { if (st) draw(); });
    draw(); ta.focus();
    timer = setInterval(() => { if (!document.getElementById('bkta') || !st) return stop(); if (!st.t0) return;
      const left = Math.max(0, SEC - (Date.now() - st.t0) / 1000); $('#bkt').textContent = `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`; if (left <= 0) finish(); }, 250);
  }
  const F_ = s => s.replace(/\{([^|}]+)\|[^}]+\}/g, '$1');
  function finish() {
    if (!st) return; const w = st.w, m = match(w, st.from, st.ta.value); stop();
    const typedLen = N(st.ta.value).length, sec = st.t0 ? Math.min(SEC, Math.round((Date.now() - st.t0) / 1000)) : 0;
    const r = { child: me.id, at: new Date().toISOString(), day: Store.today(), level: w.id, keys: m.chars, miss: Math.max(0, typedLen - m.j), words: 0, sec: SEC, used: sec, from: st.from, to: m.done ? 0 : m.i };
    if (st.t0) { recs().push(r); Store.save(); }
    const acc = typedLen ? Math.round(m.j / typedLen * 100) : 0, all = total(w), upto = m.done ? all : doneChars(w, m.i);
    st = null;
    app().innerHTML = header(`<button onclick="showTop()">${R('Eラーニングへ')}</button>`) + `<main id="typ" class="typ center">
      <h2>${R('おつかれさま！')}</h2>
      <table class="list tres">
        <tr><td>${R('{作品|さくひん}')}</td><td>${esc(w.title)}（${esc(w.author)}）</td></tr>
        <tr><td>${R('{正|ただ}しく {打|う}てた {文字|もじ}')}</td><td><b>${r.keys}</b> ${R('{文字|もじ}')}（${sec}${R('{秒|びょう}')}）</td></tr>
        <tr><td>${R('1{分|ぷん}あたり')}</td><td>${sec ? Math.round(r.keys / sec * 60) : 0} ${R('{文字|もじ}')}</td></tr>
        <tr><td>${R('{正|ただ}しさ')}</td><td>${acc}%</td></tr>
        <tr><td>${R('すすんだ ところ')}</td><td>${Math.round(upto / all * 100)}%${m.done ? R('（さいごまで {打|う}てた！）') : ''}</td></tr>
      </table>
      <p><button class="primary big" onclick="Bunko.start('${w.id}'${m.done ? ', true' : ''})">${R(m.done ? 'もう{一回|いっかい}（はじめから）' : 'つづきを {打|う}つ')}</button><button onclick="Typing.menu()">${R('えらびなおす')}</button></p>
    </main>`;
  }
  return { menuHTML, start, finish, match, units,
    quit: () => { stop(); st = null; Typing.menu(); },
    restart: id => start(id, true) };
})();
