// パソコン「HTMLで ページを 作ろう」（2026年11月26日 ユーザー「htmlで ページを 作って みる」「先生の 画面に 見せて ほしい」）。
// content_folder.js の あと、review.js の 前に 読む。
// 左に HTMLを 書くと、右に ページが すぐ 出る。「やる こと」が できると ✅。おわったら「できた」。
// 安全：ページは 画面の 中だけ（インターネットに 公開しない）。script は 動かない（sandbox）。外の 画像や 読みこみは 止める（CSP）。
// 画像は ROOTで 用意した 絵（neko.png など。中身は 絵文字の 絵）だけ。名前・学校・住所・顔写真は 書かない きまり（講義で 教える）。
// 「できた」を おすと、作った HTML を 記録（Store の html）に のこす → 先生の 画面（子どもごと）で 見られる。保護者の 画面には 出さない（未決）。
// 学年（4年）・1単元 3問・合格 0.6 は 仮。題材・文は ROOTの オリジナル（Claude の 案・仮。先生が 確かめる）。
(() => {
  const pick = a => a[rand(0, a.length - 1)];
  const F = s => typeof s !== 'string' ? s : s.replace(/([一-鿿々]+)\(([ぁ-ゟ]+)\)/g, '{$1|$2}');
  const T = s => (typeof R === 'function' ? R(F(s)) : F(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pc = SUBJECTS.find(s => s.id === 'x0');
  const se = { id: 'x0h', name: F('HTMLで ページを 作(つく)ろう'), units: [], noSum: true };
  pc.series.push(se);

  // ---------- 用意した 絵（ネットの 画像は 使わない） ----------
  const PIC = { neko: '🐱', inu: '🐶', usagi: '🐰', sakana: '🐟', ringo: '🍎', ichigo: '🍓', mikan: '🍊', budou: '🍇', densha: '🚃', kuruma: '🚗', hikouki: '✈️', fune: '🚢', sakkaa: '⚽', yakyuu: '⚾', basuke: '🏀', hana: '🌷', hoshi: '⭐' };
  const svg = e => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="16" fill="#fff3e0"/><text x="60" y="84" font-size="68" text-anchor="middle">${e}</text></svg>`);
  const THEME = {
    'どうぶつ': [['ねこ', 'neko'], ['いぬ', 'inu'], ['うさぎ', 'usagi'], ['さかな', 'sakana']],
    'くだもの': [['りんご', 'ringo'], ['いちご', 'ichigo'], ['みかん', 'mikan'], ['ぶどう', 'budou']],
    'のりもの': [['でんしゃ', 'densha'], ['くるま', 'kuruma'], ['ひこうき', 'hikouki'], ['ふね', 'fune']],
    'スポーツ': [['サッカー', 'sakkaa'], ['やきゅう', 'yakyuu'], ['バスケ', 'basuke']],
  };
  const theme = () => { const k = pick(Object.keys(THEME)); return { k, items: shuffle(THEME[k]) }; };
  const CSP = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'">`;
  // 書いた HTML → 画面に 出す HTML（絵の 名前を 絵に、CSP を 足す）
  const build = src => { let h = String(src).replace(/(src\s*=\s*["']?)([a-z]+)\.png/gi, (m, a, n) => PIC[n.toLowerCase()] ? a + svg(PIC[n.toLowerCase()]) : m);
    return /<head[^>]*>/i.test(h) ? h.replace(/<head[^>]*>/i, m => m + CSP) : CSP + h; };
  const parse = src => new DOMParser().parseFromString(String(src), 'text/html');   // 判定用（script は 動かない）
  const txt = n => (n ? n.textContent : '').replace(/\s+/g, ' ').trim();
  const has = (n, s) => txt(n).includes(s);
  const SKEL = body => `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>わたしの ページ</title>\n</head>\n<body>\n${body}\n</body>\n</html>`;

  // ---------- 画面 ----------
  const css = document.createElement('style');
  css.textContent = `.hxed{max-width:980px;margin:8px auto;text-align:left}
  .hxtask{font-size:.68em;background:#f3f8ee;border:1px solid #c5e1a5;border-radius:6px;padding:6px 10px;margin-bottom:6px;line-height:1.7}.hxtask .ok{color:#2e7d32}
  .hxrow{display:flex;gap:8px;flex-wrap:wrap}.hxrow>div{flex:1 1 300px;min-width:0}
  .hxtabs{display:flex;gap:4px;font-size:.6em}.hxtabs button{font-size:1em;padding:2px 10px;border-radius:6px 6px 0 0;border:1px solid #b8c2cf;border-bottom:0;background:#eef2f7;min-width:0}.hxtabs button.on{background:#1d1f21;color:#fff}
  .hxed textarea{width:100%;height:19em;box-sizing:border-box;font-family:Consolas,"BIZ UDGothic",monospace;font-size:.62em;line-height:1.5;background:#1d1f21;color:#e6e6e6;border-radius:0 6px 6px 6px;border:0;padding:8px;tab-size:2;resize:vertical}
  .hxed iframe{width:100%;height:19em;box-sizing:border-box;border:1px solid #9aa4b2;border-radius:6px;background:#fff}
  .hxlab{font-size:.58em;color:#556;margin:0 0 2px}.hxwarn{font-size:.62em;color:#c62828;min-height:1.2em}
  .hxpics{font-size:.58em;color:#556;line-height:1.6}.hxpics code{background:#eee;border-radius:3px;padding:0 3px}
  .hxdone{display:flex;gap:8px;justify-content:flex-end;margin-top:6px}.hxdone button{font-size:.7em;padding:4px 14px}
  table .hxed{display:none}.hxsum{display:none}table .hxsum{display:inline;font-size:.85em}table .hxins{display:none}.hxins{font-size:.72em;line-height:1.6}`;
  document.head.appendChild(css);
  const W = {}; let wid = 0;
  window.HX = { W };   // 点検用（見本の 答えで 判定が 通るかを たしかめる）

  function boot(el) {
    el.dataset.on = '1';
    const w = W[el.dataset.w]; if (!w) return;
    const demo = !!el.closest('.ex');
    const files = JSON.parse(JSON.stringify(demo ? w.model : w.files));
    const names = Object.keys(files);
    let cur = names[0], shown = names[0], timer = null, waitLoad = null;
    const picsUsed = w.pics;
    el.innerHTML = `<div class="hxtask"></div><div class="hxrow"><div>
        <div class="hxtabs">${names.map(n => `<button data-f="${n}" class="${n === cur ? 'on' : ''}">${n}</button>`).join('')}</div>
        <textarea spellcheck="false" autocomplete="off" autocapitalize="off" ${demo ? 'readonly' : ''}></textarea>
        <div class="hxwarn"></div>
        ${picsUsed ? `<div class="hxpics">${T('使(つか)える 絵：')}${Object.keys(PIC).map(k => `<code>${k}.png</code>${PIC[k]}`).join(' ')}</div>` : ''}
      </div><div><p class="hxlab">${T('できた ページ')}${names.length > 1 ? `（<span class="hxshown"></span>）` : ''}</p><iframe sandbox="allow-same-origin" title="preview"></iframe></div></div>
      ${demo ? '' : `<div class="hxdone"><button data-b="reset">${T('はじめから')}</button><button class="primary" data-b="done">${T('できた')}</button></div>`}`;
    const ta = el.querySelector('textarea'), fr = el.querySelector('iframe'), task = el.querySelector('.hxtask'), warn = el.querySelector('.hxwarn');
    ta.value = files[cur];
    const state = () => ({ files, D: n => parse(files[n]), V: () => fr.contentDocument });
    const check = () => { const s = state(); return w.steps.map(st => { try { return !!st.ok(s); } catch (_) { return false; } }); };
    const drawTask = () => { const r = check(); task.innerHTML = `${T('<b>やる こと</b>')}${w.steps.map((st, i) => `<div class="${r[i] ? 'ok' : ''}">${r[i] ? '✅' : '⬜'} ${T(st.t)}</div>`).join('')}`; return r; };
    const render = () => { const sh = el.querySelector('.hxshown'); if (sh) sh.textContent = shown; fr.srcdoc = build(files[shown]); };
    fr.addEventListener('load', () => {
      const d = fr.contentDocument; if (!d) return;
      // リンク：自分で 作った ページ（index.html・page2.html）だけ 画面の 中で ひらく。外の サイトへは 行かない
      d.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a'); if (!a) return; e.preventDefault();
        const h = (a.getAttribute('href') || '').trim(); if (files[h]) { shown = h; render(); } else warn.innerHTML = T(`この 練習(れんしゅう)では「${esc(h)}」には 行(い)けないよ（自分(じぶん)で 作(つく)った ページだけ）`); });
      drawTask();
      if (waitLoad) { const f = waitLoad; waitLoad = null; f(); }
    });
    const onEdit = () => { files[cur] = ta.value;
      warn.innerHTML = /[＜＞／＝”“]/.test(ta.value) ? T('＜ ＞ ／ ＝ ” が 全角(ぜんかく)に なって いるよ。「半角(はんかく)/全角(ぜんかく)」キーを 1回(かい) おして 打(う)ちなおそう') : '';
      clearTimeout(timer); timer = setTimeout(() => { timer = null; if (shown !== cur) shown = cur; render(); }, 250); };
    render(); drawTask();
    if (demo) return;
    ta.addEventListener('input', onEdit);
    ta.addEventListener('keydown', e => {
      e.stopPropagation();   // 下の こたえの 箱（app.js の document.onkeydown）に わたさない
      if (typeof window.touch === 'function') window.touch();
      if (e.key === 'Tab' && !e.isComposing) { e.preventDefault(); const a = ta.selectionStart, b = ta.selectionEnd; ta.value = ta.value.slice(0, a) + '  ' + ta.value.slice(b); ta.selectionStart = ta.selectionEnd = a + 2; onEdit(); }
    });
    el.addEventListener('click', e => {
      const t = e.target.closest('button[data-f]');
      if (t) { cur = shown = t.dataset.f; ta.value = files[cur]; el.querySelectorAll('.hxtabs button').forEach(b => b.classList.toggle('on', b.dataset.f === cur)); render(); ta.focus(); return; }
      const b = e.target.closest('button[data-b]'); if (!b) return;
      if (b.dataset.b === 'reset') { if (!confirm('はじめの 形に もどしますか？（書いた ものは きえます）')) return; Object.assign(files, JSON.parse(JSON.stringify(w.files))); ta.value = files[cur]; onEdit(); return; }
      if (b.dataset.b === 'done') {
        // 打った すぐ あと：画面を 作りなおしてから たしかめる
        if (timer) { clearTimeout(timer); timer = null; shown = cur; waitLoad = () => b.click(); render(); return; }
        const r = check(), bad = w.steps.find((_, i) => !r[i]);
        save(w, files, !bad);
        const a = document.querySelector('.ans'); if (!a || !document.getElementById('ok')) return;
        a.dataset.raw = a.value = bad ? `まだ：${bad.t.replace(/<[^>]+>/g, '').replace(/\(([ぁ-ゟ]+)\)/g, '')}` : 'できた'; document.getElementById('ok').click();
      }
    });
    setTimeout(() => { if (el.isConnected) ta.focus(); }, 0);
  }
  new MutationObserver(() => document.querySelectorAll('.hxed:not([data-on])').forEach(boot)).observe(document.documentElement, { childList: true, subtree: true });

  // 作った ページを 記録に のこす（先生の 画面で 見る）。この 端末の 中だけ（transfer.js で 先生の 端末へ 移せる）
  function save(w, files, ok) {
    try {
      if (typeof me === 'undefined' || !me || typeof Store !== 'object') return;
      const S = Store.get(); S.html = S.html || [];
      const src = {}; for (const [k, v] of Object.entries(files)) src[k] = String(v).slice(0, 20000);
      S.html.push({ child: me.id, day: Store.today(), at: new Date().toISOString(), unit: (typeof cur !== 'undefined' && cur && cur.unit) ? cur.unit.id : '', task: w.steps.slice(0, -1).map(s => s.t.replace(/<[^>]+>/g, '').replace(/\(([ぁ-ゟ]+)\)/g, '')).join('／'), ok, files: src });
      if (S.html.length > 3000) S.html.splice(0, S.html.length - 3000);
      Store.save();
    } catch (e) { /* 記録できなくても 問題は つづける */ }
  }
  // 先生の 画面：その月の 作品（app.js の reportHTML から 呼ぶ）
  window.htmlWorksBlock = (childId, month) => {
    const list = ((typeof Store === 'object' && Store.get().html) || []).filter(r => r.child === childId && String(r.day).slice(0, 7) === month).slice(-30).reverse();
    if (!list.length) return '';
    const row = r => { const u = UNITS[r.unit], main = r.files['index.html'] !== undefined ? 'index.html' : Object.keys(r.files)[0];
      return `<details class="hxwork"><summary>${esc(r.day)} ${esc(r.at.slice(11, 16))}　${u ? esc(Furigana.render(u.name, 'none')) : ''}　${r.ok ? '○ できた' : '△ とちゅう'}　<span class="note">${esc(r.task)}</span></summary>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0">${Object.keys(r.files).map(n => `<div style="flex:1 1 320px;min-width:0"><b>${esc(n)}</b>
          <iframe sandbox="" style="width:100%;height:220px;border:1px solid #9aa4b2;border-radius:6px;background:#fff" srcdoc="${esc(build(r.files[n]))}"></iframe>
          <pre style="white-space:pre-wrap;font-size:.8em;background:#f5f5f5;padding:6px;border-radius:6px;max-height:220px;overflow:auto">${esc(r.files[n])}</pre></div>`).join('')}</div></details>`; };
    return `<h3>HTMLで 作った ページ（${list.length}こ）</h3><p class="note">「できた」を おした ときの ページと 書いた HTML。クリックで ひらく。この 画面の 中だけで 表示（公開しない）。名前・学校・住所などが 書かれて いたら、声を かけて 消して もらう。</p>${list.map(row).join('')}`;
  };

  // ---------- 問題 ----------
  const editQ = gen => () => { const w = gen(); w.pics = w.pics || false; const id = 'h' + (++wid); W[id] = w;
    return { key: `hx-${w.key}`, tap: { code: 0 }, boxes: [''], answer: ['できた'],
      exHint: F('左(ひだり)に HTMLを 書(か)くと 右(みぎ)に ページが 出(で)るよ。「やる こと」が ぜんぶ ✅ に なったら「できた」。'),
      text: `<div class="fxgoal"><span class="hxsum">${w.steps.slice(0, -1).map(s => F(s.t)).join('／')}</span><span class="hxins">${F('左(ひだり)に HTMLを 書(か)こう。右(みぎ)に ページが 出(で)るよ。「やる こと」が ぜんぶ できたら <b>できた</b> を おそう。')}</span></div><div class="hxed" data-w="${id}"></div>` }; };
  const one = (key, body, steps, model, pics) => ({ key, files: { 'index.html': SKEL(body) }, model: { 'index.html': SKEL(model) }, steps: [...steps, NOINFO], pics });
  // どの 問題にも：個人情報を 書かない（自動では 見きれないので、しるしだけ。先生が 作品で 確かめる）
  const NOINFO = { t: '名前(なまえ)・学校(がっこう)・住所(じゅうしょ)は 書(か)かない', ok: () => true };
  const H1 = s => ({ D }) => has(D('index.html').querySelector('h1'), s);
  const G = {
    1: [
      () => { const { k } = theme(), t = `${k} ずかん`;
        return one(`h1-${k}`, '  <!-- この 下に 書こう -->\n', [{ t: `見出(みだ)し（<b>h1</b>）に「<b>${t}</b>」と 出(だ)す`, ok: H1(t) }], `  <h1>${t}</h1>\n`); },
      () => { const { k, items } = theme(), [a] = items, s = `${a[0]}が すき`;
        return one(`p-${a[0]}`, `  <h1>${k}</h1>\n  <!-- この 下に 書こう -->\n`, [{ t: `文(ぶん)（<b>p</b>）で「<b>${s}</b>」と 出(だ)す`, ok: ({ D }) => [...D('index.html').querySelectorAll('p')].some(p => has(p, s)) }], `  <h1>${k}</h1>\n  <p>${s}</p>\n`); },
      () => { const { k, items } = theme(), [a, b] = items;
        return one(`h2-${a[0]}`, `  <h1>${k}</h1>\n`, [
          { t: `小(ちい)さい 見出(みだ)し（<b>h2</b>）を 2つ 作(つく)って、「<b>${a[0]}</b>」「<b>${b[0]}</b>」と 書(か)く`, ok: ({ D }) => { const h = [...D('index.html').querySelectorAll('h2')]; return h.some(x => has(x, a[0])) && h.some(x => has(x, b[0])); } },
          { t: 'それぞれの 下(した)に 文(ぶん)（<b>p</b>）を 1つずつ 書(か)く', ok: ({ D }) => [...D('index.html').querySelectorAll('h2')].filter(x => x.nextElementSibling && x.nextElementSibling.tagName === 'P' && txt(x.nextElementSibling)).length >= 2 }],
          `  <h1>${k}</h1>\n  <h2>${a[0]}</h2>\n  <p>${a[0]}の ことを 書く。</p>\n  <h2>${b[0]}</h2>\n  <p>${b[0]}の ことを 書く。</p>\n`); },
    ],
    2: [
      () => { const { k, items } = theme(), [a] = items;
        return one(`st-${a[0]}`, `  <h1>${k}</h1>\n  <p>いちばん すきなのは ${a[0]} です。</p>\n`, [{ t: `「<b>${a[0]}</b>」を 太字(ふとじ)（<b>strong</b>）に する`, ok: ({ D }) => [...D('index.html').querySelectorAll('strong,b')].some(x => txt(x) === a[0]) }],
          `  <h1>${k}</h1>\n  <p>いちばん すきなのは <strong>${a[0]}</strong> です。</p>\n`); },
      () => { const { k, items } = theme(), [a, b, c] = items;
        return one(`br-${a[0]}`, `  <h1>${k}</h1>\n  <p>${a[0]} ${b[0]} ${c[0]}</p>\n`, [{ t: `文(ぶん)の 中(なか)で 改行(かいぎょう)（<b>br</b>）を 使(つか)って、${a[0]}・${b[0]}・${c[0]} を 3行(ぎょう)に 分(わ)ける`, ok: ({ D }) => [...D('index.html').querySelectorAll('p')].some(p => p.querySelectorAll('br').length >= 2 && [a, b, c].every(x => has(p, x[0]))) }],
          `  <h1>${k}</h1>\n  <p>${a[0]}<br>\n  ${b[0]}<br>\n  ${c[0]}</p>\n`); },
      () => { const { k, items } = theme(), [a, b] = items;
        return one(`st2-${a[0]}`, `  <h1>${k}</h1>\n`, [
          { t: `文(ぶん)（<b>p</b>）を 2つ 書(か)いて、1つ目(め)に「<b>${a[0]}</b>」、2つ目(め)に「<b>${b[0]}</b>」を 入(い)れる`, ok: ({ D }) => { const p = [...D('index.html').querySelectorAll('p')]; return p.length >= 2 && has(p[0], a[0]) && has(p[1], b[0]); } },
          { t: `「${b[0]}」を 太字(ふとじ)（<b>strong</b>）に する`, ok: ({ D }) => [...D('index.html').querySelectorAll('strong,b')].some(x => txt(x) === b[0]) }],
          `  <h1>${k}</h1>\n  <p>${a[0]}も すき。</p>\n  <p><strong>${b[0]}</strong>は もっと すき。</p>\n`); },
    ],
    3: [
      () => { const { k, items } = theme(), L = items.slice(0, 3);
        return one(`ul-${k}`, `  <h1>${k}</h1>\n`, [{ t: `点(てん)の リスト（<b>ul</b> と <b>li</b>）で、${L.map(x => x[0]).join('・')} を ならべる`, ok: ({ D }) => [...D('index.html').querySelectorAll('ul')].some(u => L.every(x => [...u.querySelectorAll('li')].some(li => has(li, x[0])))) }],
          `  <h1>${k}</h1>\n  <ul>\n${L.map(x => `    <li>${x[0]}</li>`).join('\n')}\n  </ul>\n`); },
      () => { const S = pick([['カレーの つくりかた', ['やさいを きる', 'にる', 'ルウを 入れる']], ['はみがきの しかた', ['ブラシに はみがきこを つける', 'はを みがく', 'くちを すすぐ']], ['パソコンの おわりかた', ['ファイルを ほぞんする', 'アプリを とじる', 'シャットダウンする']]]);
        return one(`ol-${S[0]}`, `  <h1>${S[0]}</h1>\n`, [{ t: `番号(ばんごう)の リスト（<b>ol</b> と <b>li</b>）で、「${S[1].join('」→「')}」の じゅんに ならべる`, ok: ({ D }) => [...D('index.html').querySelectorAll('ol')].some(o => { const li = [...o.querySelectorAll('li')]; return li.length >= 3 && S[1].every((s, i) => li[i] && has(li[i], s)); }) }],
          `  <h1>${S[0]}</h1>\n  <ol>\n${S[1].map(x => `    <li>${x}</li>`).join('\n')}\n  </ol>\n`); },
      () => { const { k, items } = theme(), L = items.slice(0, 3);
        return one(`ul2-${k}`, `  <h1>${k}</h1>\n  <ul>\n    <li>${L[0][0]}</li>\n  </ul>\n`, [{ t: `リストに「<b>${L[1][0]}</b>」「<b>${L[2][0]}</b>」を 足(た)して、3つに する`, ok: ({ D }) => [...D('index.html').querySelectorAll('ul')].some(u => u.querySelectorAll('li').length >= 3 && L.every(x => [...u.querySelectorAll('li')].some(li => has(li, x[0])))) }],
          `  <h1>${k}</h1>\n  <ul>\n${L.map(x => `    <li>${x[0]}</li>`).join('\n')}\n  </ul>\n`); },
    ],
    4: [
      () => { const { k, items } = theme(), [a] = items;
        return one(`img-${a[1]}`, `  <h1>${k}</h1>\n`, [{ t: `<b>img</b> で ${a[0]}の 絵(え)（<b>${a[1]}.png</b>）を 出(だ)す`, ok: ({ D }) => [...D('index.html').querySelectorAll('img')].some(i => (i.getAttribute('src') || '').toLowerCase() === a[1] + '.png') }],
          `  <h1>${k}</h1>\n  <img src="${a[1]}.png">\n`, true); },
      () => { const { k, items } = theme(), [a] = items;
        return one(`alt-${a[1]}`, `  <h1>${k}</h1>\n  <img src="${a[1]}.png">\n`, [{ t: `絵(え)に <b>alt</b>（絵(え)の 説明(せつめい)）で「<b>${a[0]}の 絵</b>」と つける`, ok: ({ D }) => [...D('index.html').querySelectorAll('img')].some(i => (i.getAttribute('alt') || '').includes(`${a[0]}の 絵`) || (i.getAttribute('alt') || '').includes(`${a[0]}の絵`)) }],
          `  <h1>${k}</h1>\n  <img src="${a[1]}.png" alt="${a[0]}の 絵">\n`, true); },
      () => { const { k, items } = theme(), [a, b] = items;
        return one(`img2-${a[1]}`, `  <h1>${k}</h1>\n`, [
          { t: `${a[0]}（<b>${a[1]}.png</b>）と ${b[0]}（<b>${b[1]}.png</b>）の 絵(え)を ならべる`, ok: ({ D }) => { const s = [...D('index.html').querySelectorAll('img')].map(i => (i.getAttribute('src') || '').toLowerCase()); return s.includes(a[1] + '.png') && s.includes(b[1] + '.png'); } },
          { t: '絵(え)の 大(おお)きさを <b>width="60"</b> に する（2つとも）', ok: ({ D }) => { const i = [...D('index.html').querySelectorAll('img')]; return i.length >= 2 && i.every(x => x.getAttribute('width') === '60'); } }],
          `  <h1>${k}</h1>\n  <img src="${a[1]}.png" width="60">\n  <img src="${b[1]}.png" width="60">\n`, true); },
    ],
    5: [
      () => { const { k, items } = theme(), [a] = items;
        return { key: `a-${a[1]}`, files: { 'index.html': SKEL(`  <h1>${k}</h1>\n`), 'page2.html': SKEL(`  <h1>${a[0]}</h1>\n`) },
          model: { 'index.html': SKEL(`  <h1>${k}</h1>\n  <a href="page2.html">${a[0]}の ページへ</a>\n`), 'page2.html': SKEL(`  <h1>${a[0]}</h1>\n`) },
          steps: [{ t: `index.html に、<b>page2.html</b> へ 行(い)く リンク（<b>a</b> と <b>href</b>）を 作(つく)る。文字(もじ)は「<b>${a[0]}の ページへ</b>」`, ok: ({ D }) => [...D('index.html').querySelectorAll('a')].some(x => (x.getAttribute('href') || '').trim() === 'page2.html' && has(x, `${a[0]}の ページへ`)) }, NOINFO] }; },
      () => { const { k, items } = theme(), [a] = items;
        return { key: `a2-${a[1]}`, files: { 'index.html': SKEL(`  <h1>${k}</h1>\n  <a href="page2.html">${a[0]}の ページへ</a>\n`), 'page2.html': SKEL('  <!-- この 下に 書こう -->\n') },
          model: { 'index.html': SKEL(`  <h1>${k}</h1>\n  <a href="page2.html">${a[0]}の ページへ</a>\n`), 'page2.html': SKEL(`  <h1>${a[0]}</h1>\n  <a href="index.html">もどる</a>\n`) },
          steps: [{ t: `page2.html に 見出(みだ)し（<b>h1</b>）「<b>${a[0]}</b>」を 書(か)く`, ok: ({ D }) => has(D('page2.html').querySelector('h1'), a[0]) },
            { t: 'page2.html に、<b>index.html</b> へ もどる リンク「<b>もどる</b>」を 作(つく)る', ok: ({ D }) => [...D('page2.html').querySelectorAll('a')].some(x => (x.getAttribute('href') || '').trim() === 'index.html' && has(x, 'もどる')) }, NOINFO] }; },
    ],
    6: [
      () => { const { k, items } = theme(), L = items.slice(0, 2), n = L.map(() => rand(1, 9));
        return one(`tb-${k}`, `  <h1>${k}の 人気(にんき)</h1>\n`.replace(/\(([ぁ-ゟ]+)\)/g, ''), [{ t: `表(ひょう)（<b>table</b>・<b>tr</b>・<b>td</b>）で、${L.map((x, i) => `${x[0]}＝${n[i]}`).join('、')} を 2行(ぎょう)に する（1行(ぎょう)に 名前(なまえ)と 数(かず)）`,
          ok: ({ D }) => [...D('index.html').querySelectorAll('table')].some(t => L.every((x, i) => [...t.querySelectorAll('tr')].some(tr => { const td = [...tr.querySelectorAll('td,th')].map(txt); return td.includes(x[0]) && td.includes(String(n[i])); }))) }],
          `  <h1>${k}の 人気</h1>\n  <table border="1">\n${L.map((x, i) => `    <tr><td>${x[0]}</td><td>${n[i]}</td></tr>`).join('\n')}\n  </table>\n`); },
      () => { const D5 = ['げつ', 'か', 'すい'], S = shuffle(['こくご', 'さんすう', 'りか', 'しゃかい', 'おんがく']).slice(0, 3);
        return one(`tb2-${S.join()}`, '  <h1>じかんわり</h1>\n', [
          { t: `表(ひょう)の 1行目(ぎょう め)に 見出(みだ)し（<b>th</b>）で ${D5.join('・')} を 書(か)く`, ok: ({ D }) => [...D('index.html').querySelectorAll('tr')].some(tr => { const th = [...tr.querySelectorAll('th')].map(txt); return D5.every(d => th.includes(d)); }) },
          { t: `2行目(ぎょう め)に（<b>td</b>）で ${S.join('・')} を 書(か)く`, ok: ({ D }) => [...D('index.html').querySelectorAll('tr')].some(tr => { const td = [...tr.querySelectorAll('td')].map(txt); return S.every((s, i) => td[i] === s); }) }],
          `  <h1>じかんわり</h1>\n  <table border="1">\n    <tr><th>${D5.join('</th><th>')}</th></tr>\n    <tr><td>${S.join('</td><td>')}</td></tr>\n  </table>\n`); },
    ],
    7: [
      () => { const C = pick([['あか', 'red', 'rgb(255, 0, 0)'], ['あお', 'blue', 'rgb(0, 0, 255)'], ['みどり', 'green', 'rgb(0, 128, 0)']]), { k } = theme();
        return one(`c-${C[1]}`, `  <h1>${k}</h1>\n`, [{ t: `見出(みだ)しの 文字(もじ)の 色(いろ)を ${C[0]}（<b>${C[1]}</b>）に する（<b>style="color: ${C[1]}"</b>）`, ok: ({ V }) => { const h = V().querySelector('h1'); return !!h && getComputedStyle(h).color === C[2]; } }],
          `  <h1 style="color: ${C[1]}">${k}</h1>\n`); },
      () => { const C = pick([['うすい きいろ', 'lightyellow', 'rgb(255, 255, 224)'], ['うすい あお', 'lightblue', 'rgb(173, 216, 230)'], ['うすい みどり', 'lightgreen', 'rgb(144, 238, 144)']]), { k } = theme();
        return one(`bg-${C[1]}`, `  <h1>${k}</h1>\n`, [{ t: `ページの 背景(はいけい)を ${C[0]}（<b>${C[1]}</b>）に する（<b>body</b> に <b>style="background-color: ${C[1]}"</b>）`, ok: ({ V }) => { const b = V().body; return !!b && getComputedStyle(b).backgroundColor === C[2]; } }],
          `  <h1>${k}</h1>\n<!-- body の 行を <body style="background-color: ${C[1]}"> に する -->\n`); },
      () => { const px = pick([24, 30, 36]), { k, items } = theme();
        return one(`fs-${px}`, `  <h1>${k}</h1>\n  <p>${items[0][0]}が すき</p>\n`, [{ t: `文(ぶん)（<b>p</b>）の 文字(もじ)の 大(おお)きさを <b>${px}px</b> に する（<b>style="font-size: ${px}px"</b>）`, ok: ({ V }) => [...V().querySelectorAll('p')].some(p => getComputedStyle(p).fontSize === px + 'px') }],
          `  <h1>${k}</h1>\n  <p style="font-size: ${px}px">${items[0][0]}が すき</p>\n`); },
    ],
    8: [
      () => { const { k, items } = theme(), L = items.slice(0, 3), title = `わたしの すきな ${k}`;
        return one(`all-${k}`, '  <!-- この 下に 書こう -->\n', [
          { t: `見出(みだ)し（<b>h1</b>）に「<b>${title}</b>」`, ok: H1(title) },
          { t: `リスト（<b>ul</b>・<b>li</b>）で すきな ${k}を 3つ（${L.map(x => x[0]).join('・')} など）`, ok: ({ D }) => [...D('index.html').querySelectorAll('ul')].some(u => u.querySelectorAll('li').length >= 3) },
          { t: `${k}の 絵(え)を 1つ 以上(いじょう)（<b>img</b>。使(つか)える 絵から）`, ok: ({ D }) => [...D('index.html').querySelectorAll('img')].some(i => PIC[(i.getAttribute('src') || '').toLowerCase().replace(/\.png$/, '')]) },
          { t: 'どこかの 文字(もじ)に 色(いろ)を つける（<b>style="color: …"</b>）', ok: ({ V }) => [...V().querySelectorAll('body *')].some(x => { const c = getComputedStyle(x).color; return c !== 'rgb(0, 0, 0)' && !(x.closest('a')); }) },
          { t: '文(ぶん)（<b>p</b>）で、すきな わけを 書(か)く', ok: ({ D }) => [...D('index.html').querySelectorAll('p')].some(p => txt(p).length >= 5) }],
          `  <h1 style="color: green">${title}</h1>\n  <img src="${L[0][1]}.png" alt="${L[0][0]}の 絵">\n  <ul>\n${L.map(x => `    <li>${x[0]}</li>`).join('\n')}\n  </ul>\n  <p>${L[0][0]}が いちばん すき。かわいいから。</p>\n`, true); },
    ],
  };
  // 背景の 問題の 見本は body の 行を かえる
  const fixBg = w => { if (/^bg-/.test(w.key)) { const c = w.key.slice(3); w.model['index.html'] = w.model['index.html'].replace('<body>', `<body style="background-color: ${c}">`).replace(/<!-- body の 行を[^>]*-->\n/, ''); } return w; };
  const three = list => () => { const g = list.length >= 3 ? shuffle(list).slice(0, 3) : [0, 1, 2].map(i => list[i % list.length]); return g.map(f => editQ(() => fixBg(f()))()); };
  const add = (n, name, lecture) => { const id = `x0h-${n}`; UNITS[id] = { id, subject: 'x0', series: se.id, name: F(name), col: 'HTML', pass: 0.6, grade: 4, make: three(G[n]), lecture: lecture.map(F) }; se.units.push(id); };
  const C = s => `<code style="font-family:Consolas,monospace;background:#1d1f21;color:#e6e6e6;border-radius:4px;padding:1px 6px">${esc(s)}</code>`;
  const PRE = s => `<pre style="font-family:Consolas,monospace;background:#1d1f21;color:#e6e6e6;border-radius:6px;padding:8px;text-align:left;font-size:.8em;white-space:pre-wrap">${esc(s)}</pre>`;
  const RULE = '<b>やくそく</b>：作(つく)った ページに <b>名前(なまえ)・学校(がっこう)・住所(じゅうしょ)・電話(でんわ)番号(ばんごう)・顔(かお)写真(しゃしん)</b>は 書(か)かない。ネットに 出(で)ると、知(し)らない 人(ひと)にも 見(み)られるから。この 練習(れんしゅう)の ページは 先生(せんせい)も 見(み)るよ。';
  add(1, '見出(みだ)しと 文(ぶん)（h1・p）', [
    `ホームページは <b>HTML</b>（エイチ・ティー・エム・エル）と いう ことばで 書(か)いて あるよ。<br>${C('<h1>')} と ${C('</h1>')} のように、<b>タグ</b>で はさむと、その 文字(もじ)が 何(なに)かを 決(き)められる。${PRE('<h1>どうぶつ ずかん</h1>\n<p>ねこが すき</p>')}h1＝いちばん 大(おお)きい 見出(みだ)し、h2＝小(ちい)さい 見出(みだ)し、p＝ふつうの 文(ぶん)。`,
    `タグの 記号(きごう) ${C('<')} ${C('>')} ${C('/')} は <b>半角(はんかく)</b>で 打(う)つ。「半角(はんかく)/全角(ぜんかく)」キーで きりかえよう。中(なか)の 文字(もじ)（ねこ など）は ひらがなで いいよ。<br>おわりの タグには ${C('/')} が つく（${C('</h1>')}）。わすれると、下(した)まで ぜんぶ 見出(みだ)しに なっちゃう。`,
    `${C('<body>')} と ${C('</body>')} の あいだに 書(か)いた ものが、ページに 出(で)るよ。<br>${RULE}`]);
  add(2, '太字(ふとじ)と 改行(かいぎょう)（strong・br）', [
    `${C('<strong>')}〜${C('</strong>')} で はさむと <b>太字(ふとじ)</b>に なる。大事(だいじ)な ことばに 使(つか)う。${PRE('<p>いちばん すきなのは <strong>ねこ</strong> です。</p>')}`,
    `HTMLは、Enterで 行(ぎょう)を かえても ページでは つながって 出(で)る。行(ぎょう)を かえたい ところに ${C('<br>')} を 書(か)く（おわりの タグは いらない）。${PRE('<p>ねこ<br>\nいぬ<br>\nうさぎ</p>')}`]);
  add(3, 'リスト（ul・ol・li）', [
    `${C('<ul>')} は 点(てん)の リスト、${C('<ol>')} は 番号(ばんごう)の リスト。1つ1つは ${C('<li>')} で 書(か)く。${PRE('<ul>\n  <li>りんご</li>\n  <li>いちご</li>\n</ul>')}`,
    `じゅんばんが 大事(だいじ)な もの（作(つく)りかた・やりかた）は ${C('<ol>')}。ページに 1. 2. 3. と 番号(ばんごう)が 出(で)るよ。<br>行(ぎょう)の はじめの 空白(くうはく)（字(じ)さげ）は 見(み)やすく する ため。<b>Tab</b>キーでも 入(い)れられる。`]);
  add(4, '画像(がぞう)（img）', [
    `${C('<img src="neko.png">')} で 絵(え)を 出(だ)す。<b>src</b> に 絵(え)の ファイルの 名前(なまえ)を 書(か)く。<br>この 練習(れんしゅう)では、ROOTで 用意(ようい)した 絵(え)（neko.png・ringo.png など。画面(がめん)の 下(した)に 一覧(いちらん)）だけ 使(つか)える。`,
    `<b>alt</b>（オルト）は 絵(え)の 説明(せつめい)。目(め)の 見(み)えない 人(ひと)の 読(よ)み上(あ)げや、絵(え)が 出(で)ない ときに 使(つか)われる。${PRE('<img src="neko.png" alt="ねこの 絵" width="60">')}<b>width</b> で 横(よこ)の 大(おお)きさを 決(き)められる。`,
    `ネットの 絵(え)や 写真(しゃしん)は、作(つく)った 人(ひと)の もの（著作権(ちょさくけん)）。かってに 使(つか)わない。<b>自分(じぶん)や 友(とも)だちの 顔(かお)写真(しゃしん)も のせない</b>。`]);
  add(5, 'リンク（a）', [
    `${C('<a href="page2.html">つぎへ</a>')} で、おすと ほかの ページへ 行(い)く <b>リンク</b>が できる。<b>href</b> に 行(い)きさきの ファイルの 名前(なまえ)を 書(か)く。`,
    `この 単元(たんげん)は ファイルが 2つ（<b>index.html</b> と <b>page2.html</b>）。上(うえ)の タブで きりかえて 書(か)こう。右(みぎ)の ページの リンクを おすと、ほんとうに ページが かわるよ。<br>この 練習(れんしゅう)では、自分(じぶん)で 作(つく)った ページにだけ 行(い)ける（外(そと)の サイトには 行(い)かない）。`]);
  add(6, '表(ひょう)（table）', [
    `${C('<table>')} で 表(ひょう)。${C('<tr>')} が 1行(ぎょう)、${C('<td>')} が 1つの ます。見出(みだ)しの ますは ${C('<th>')}。${PRE('<table border="1">\n  <tr><th>なまえ</th><th>かず</th></tr>\n  <tr><td>ねこ</td><td>5</td></tr>\n</table>')}`,
    `<b>border="1"</b> を つけると 線(せん)が 出(で)て 見(み)やすい。tr の 中(なか)に td を ならべる じゅんばんが、左(ひだり)から 右(みぎ)の じゅんばん。`]);
  add(7, '色(いろ)と 大(おお)きさ（CSS）', [
    `見(み)た目(め)を かえるのは <b>CSS</b>（シー・エス・エス）。タグに ${C('style="…"')} を つけて 書(か)く。${PRE('<h1 style="color: red">どうぶつ</h1>')}color＝文字(もじ)の 色(いろ)。red（あか）・blue（あお）・green（みどり）など、色(いろ)の 名前(なまえ)は 英語(えいご)。`,
    `${C('background-color')}＝背景(はいけい)の 色(いろ)。ページ ぜんぶなら ${C('<body style="background-color: lightyellow">')}。<br>${C('font-size')}＝文字(もじ)の 大(おお)きさ。${C('style="font-size: 24px"')}（px＝ピクセル。画面(がめん)の 点(てん)の 数(かず)）。`,
    `書(か)きかた：${C('style="なにを: どうする"')}。<b>:</b>（コロン）の あとに 決(き)める 中身(なかみ)。2つ 決(き)める ときは ${C(';')} で 区切(くぎ)る：${C('style="color: red; font-size: 30px"')}`]);
  add(8, 'まとめ（すきな もの しょうかい ページ）', [
    'これまでの タグを 使(つか)って、「すきな もの しょうかい ページ」を 作(つく)ろう。やる ことが 5つ あるよ。1つ できると ✅。',
    `${RULE}<br>できた ページは 先生(せんせい)の 画面(がめん)で 見(み)られるよ。`]);
})();
