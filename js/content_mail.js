// パソコン「メールの 書き方」（2026年11月26日 ユーザー決定の ⑤）。content_save.js の あと、review.js の 前に 読む。
// 画面の 中の「にせの メール」。宛先・CC・件名・本文、返信・転送。本当には 送らない（画面の 中の「送信済み」に 入るだけ）。
// 人の 名前・アドレスは ぜんぶ 架空（example.jp）。子どもは 自分の 本当の 名前を 書かない（問題で 名前を わたす）。
// 学年（5年）・1単元 3問・合格 0.6 は 仮。文の 形は ROOTの オリジナル（Claude の 案・仮。先生が 確かめる）。
(() => {
  const pick = a => a[rand(0, a.length - 1)];
  const F = s => typeof s !== 'string' ? s : s.replace(/([一-鿿々]+)\(([ぁ-ゟ]+)\)/g, '{$1|$2}');
  const T = s => (typeof R === 'function' ? R(F(s)) : F(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pc = SUBJECTS.find(s => s.id === 'x0');
  const se = { id: 'x0w', name: F('メールの 書(か)き方(かた)'), units: [], noSum: true };
  pc.series.push(se);

  // 架空の 人（アドレス帳）
  const PEOPLE = [['山田先生', 'yamada@root.example.jp'], ['森先生', 'mori@root.example.jp'], ['ROOT じむしつ', 'office@root.example.jp'], ['ひかり', 'hikari@kids.example.jp'], ['そうた', 'sota@kids.example.jp'], ['ゆい', 'yui@kids.example.jp']];
  const ME = ['はると', 'あおい', 'りく', 'めい'];
  const css = document.createElement('style');
  css.textContent = `.mlx{max-width:780px;margin:8px auto;text-align:left;position:relative}
  .mltask{font-size:.68em;background:#f3f8ee;border:1px solid #c5e1a5;border-radius:6px;padding:6px 10px;margin-bottom:6px;line-height:1.7}.mltask .ok{color:#2e7d32}
  .mlwin{border:1px solid #9aa4b2;border-radius:8px;background:#fff;overflow:hidden;font-size:.62em;color:#222;box-shadow:0 2px 8px #0002;display:flex;min-height:380px;position:relative}
  .mlside{width:11em;white-space:nowrap;background:#f1f4f8;border-right:1px solid #d5dbe3;padding:6px 0}.mlside button{display:block;width:100%;text-align:left;font-size:1em;padding:4px 10px;background:none;border:none;border-radius:0;min-width:0;cursor:pointer}.mlside button.on{background:#cce4f7}.mlside .new{background:#1565c0;color:#fff;margin:0 6px 6px;width:calc(100% - 12px);border-radius:6px;text-align:center}
  .mlmain{flex:1;display:flex;flex-direction:column;min-width:0}
  .mllist div{padding:5px 10px;border-bottom:1px solid #eef0f3;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mllist div:hover{background:#eef5fc}.mllist .on{background:#cce4f7}.mllist b{display:inline-block;width:8em}
  .mlread{padding:8px 12px;border-top:1px solid #e1e5ea;flex:1;overflow:auto}.mlread pre{white-space:pre-wrap;font:inherit;margin:6px 0}.mlread .hd{color:#556;font-size:.95em}
  .mlbar{display:flex;gap:6px;padding:4px 10px}.mlbar button{font-size:1em;padding:2px 10px;min-width:0}
  .mlform{display:flex;flex-direction:column;flex:1;padding:6px 10px;gap:4px}.mlform .r{display:flex;align-items:center;gap:6px}.mlform label{width:3.5em;color:#556}.mlform input{flex:1;font:inherit;padding:3px 6px;border:1px solid #b8c2cf}
  .mlform textarea{flex:1;min-height:170px;font:inherit;padding:6px;border:1px solid #b8c2cf;resize:vertical}.mlform .r button{font-size:.95em;padding:1px 8px;min-width:0}
  .mlbook{position:absolute;right:10px;top:40px;background:#fff;border:1px solid #7a8798;box-shadow:0 4px 14px #0004;z-index:6;padding:4px 0;min-width:17em}.mlbook div{padding:3px 10px;cursor:pointer}.mlbook div:hover{background:#e3f2fd}.mlbook small{color:#667;margin-left:.6em}
  .mlmsg{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);background:#fff;border:1px solid #7a8798;box-shadow:0 6px 24px #0006;z-index:9;padding:10px 14px;min-width:20em;max-width:90%}.mlmsg .b{display:flex;gap:6px;justify-content:flex-end;margin-top:10px}.mlmsg button{font-size:1em;padding:3px 14px;min-width:0}
  .mlstat{padding:3px 10px;color:#2e7d32;min-height:1.4em}
  .mldone{display:flex;gap:8px;justify-content:flex-end;margin-top:6px}.mldone button{font-size:.7em;padding:4px 14px}
  table .mlx{display:none}.mlsum{display:none}table .mlsum{display:inline;font-size:.85em}table .mlins{display:none}.mlins{font-size:.72em;line-height:1.6}`;
  document.head.appendChild(css);
  const W = {}; let wid = 0; window.MX = { W };
  const ADDR = /^[A-Za-z0-9._-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;
  const splitA = s => s.split(/[,;、，；\s]+/).map(x => x.trim()).filter(Boolean);
  const nameOf = a => (PEOPLE.find(p => p[1] === a) || [a])[0];

  function boot(el) {
    el.dataset.on = '1';
    const w = W[el.dataset.w]; if (!w) return;
    const demo = !!el.closest('.ex');
    const S = { box: 'in', sel: 0, inbox: w.inbox.map(m => ({ ...m })), sent: demo ? (w.modelSent || []).map(m => ({ ...m })) : [], draft: null, book: false, msg: null, stat: '' };
    if (demo && w.modelSent) S.box = 'sent';
    const st = () => ({ sent: S.sent, last: S.sent[S.sent.length - 1] || null });
    el.innerHTML = `<div class="mltask"></div><div class="mlwin"></div>${demo ? '' : `<div class="mldone"><button data-b="reset">${T('はじめから')}</button><button class="primary" data-b="done">${T('できた')}</button></div>`}`;
    const win = el.querySelector('.mlwin'), task = el.querySelector('.mltask');
    const drawTask = () => { const s = st(); task.innerHTML = `${T('<b>やる こと</b>')}${w.steps.map(x => { let ok = false; try { ok = !!x.ok(s); } catch (_) {} return `<div class="${ok ? 'ok' : ''}">${ok ? '✅' : '⬜'} ${T(x.t)}</div>`; }).join('')}`; };
    const readHTML = m => m ? `<div class="mlbar">${S.box === 'in' ? `<button data-a="reply">↩ 返信</button><button data-a="all">↩↩ 全員に返信</button>` : ''}<button data-a="fwd">→ 転送</button></div>
      <div class="mlread"><div class="hd">${S.box === 'in' ? '差出人' : '宛先'}：${esc(S.box === 'in' ? `${nameOf(m.from)} <${m.from}>` : m.to.join(', '))}${m.cc && m.cc.length ? `<br>CC：${esc(m.cc.join(', '))}` : ''}<br>件名：<b>${esc(m.subject || '（件名なし）')}</b></div><pre>${esc(m.body)}</pre></div>` : '';
    const draw = () => {
      const keep = {}; win.querySelectorAll('.mlform [name]').forEach(x => { keep[x.name] = x.value; });
      const act = document.activeElement && win.contains(document.activeElement) ? document.activeElement.name : null;
      const list = S.box === 'in' ? S.inbox : S.sent;
      win.innerHTML = `<div class="mlside">${demo ? '' : `<button class="new" data-a="new">＋ 新規メール</button>`}<button data-box="in" class="${S.box === 'in' && !S.draft ? 'on' : ''}">📥 受信トレイ (${S.inbox.length})</button><button data-box="sent" class="${S.box === 'sent' && !S.draft ? 'on' : ''}">📤 送信済み (${S.sent.length})</button></div>
        <div class="mlmain">${S.draft ? `<div class="mlform">
          <div class="r"><label>宛先</label><input name="to" value="${esc(S.draft.to)}" autocomplete="off" spellcheck="false"><button data-a="book" data-f="to">📒</button></div>
          <div class="r"><label>CC</label><input name="cc" value="${esc(S.draft.cc)}" autocomplete="off" spellcheck="false"><button data-a="book" data-f="cc">📒</button></div>
          <div class="r"><label>件名</label><input name="subject" value="${esc(S.draft.subject)}" autocomplete="off" spellcheck="false"></div>
          <textarea name="body" spellcheck="false">${esc(S.draft.body)}</textarea>
          <div class="r" style="justify-content:flex-end"><button data-a="discard">すてる</button><button class="primary" data-a="send">送信 ▶</button></div></div>
          ${S.book ? `<div class="mlbook">${PEOPLE.map(p => `<div data-p="${esc(p[1])}">${esc(p[0])}<small>${esc(p[1])}</small></div>`).join('')}</div>` : ''}`
        : `<div class="mllist">${list.length ? list.map((m, i) => `<div data-i="${i}" class="${S.sel === i ? 'on' : ''}"><b>${esc(S.box === 'in' ? nameOf(m.from) : m.to.map(nameOf).join(', '))}</b>${esc(m.subject || '（件名なし）')}</div>`).join('') : `<div style="color:#99a;cursor:default">${T('（まだ ない）')}</div>`}</div>${readHTML(list[S.sel])}`}
        <div class="mlstat">${S.stat ? T(S.stat) : ''}</div></div>
        ${S.msg ? `<div class="mlmsg">${T(S.msg.text)}<div class="b">${S.msg.btns.map((b, i) => `<button data-g="${i}" class="${i === 0 ? 'primary' : ''}">${T(b[0])}</button>`).join('')}</div></div>` : ''}`;
      if (S.draft) { win.querySelectorAll('.mlform [name]').forEach(x => { if (keep[x.name] !== undefined && document.contains(x)) x.value = S.draft[x.name]; }); const f = act && win.querySelector(`.mlform [name="${act}"]`); if (f && !S.msg) f.focus(); }
      drawTask();
    };
    const ask = (text, btns) => { S.msg = { text, btns }; draw(); };
    const compose = d => { S.draft = { to: '', cc: '', subject: '', body: '', kind: 'new', ...d }; S.book = false; S.stat = ''; draw(); const f = win.querySelector(`.mlform [name="${d && d.to ? 'body' : 'to'}"]`); if (f) { f.focus(); if (f.name === 'body') f.setSelectionRange(0, 0); } };
    const quote = m => `\n\n----- もとの メール -----\n差出人：${nameOf(m.from || '')} <${m.from || ''}>\n件名：${m.subject}\n\n${m.body.split('\n').map(l => '> ' + l).join('\n')}`;
    const send = (force) => {
      const d = S.draft, to = splitA(d.to), cc = splitA(d.cc);
      if (!to.length) return ask('<b>宛先(あてさき)</b>が 空(から)だよ。だれに 送(おく)るか 入(い)れよう。', [['OK', () => {}]]);
      const bad = [...to, ...cc].find(a => !ADDR.test(a));
      if (bad) return ask(`「${esc(bad)}」は メールアドレスの 形(かたち)に なって いないよ（@ や . を たしかめよう。全角(ぜんかく)は 使(つか)えない）。`, [['OK', () => {}]]);
      if (!force && !d.subject.trim()) return ask('<b>件名(けんめい)</b>が ないよ。このまま 送(おく)りますか？（件名(けんめい)が ないと、何(なん)の メールか わからない）', [['もどって 書(か)く', () => {}], ['このまま 送(おく)る', () => send(true)]]);
      S.sent.push({ to, cc, subject: d.subject, body: d.body, kind: d.kind, ref: d.ref });
      S.draft = null; S.box = 'sent'; S.sel = S.sent.length - 1; S.stat = '送信(そうしん)したよ（練習(れんしゅう)なので 本当(ほんとう)には とどかない）'; draw(); };
    draw();
    if (demo) return;

    win.addEventListener('input', e => { if (S.draft && e.target.name) S.draft[e.target.name] = e.target.value; });
    win.addEventListener('keydown', e => { e.stopPropagation(); if (typeof window.touch === 'function') window.touch();
      if (e.isComposing || e.keyCode === 229) return;
      if (S.msg && e.key === 'Escape') { S.msg = null; draw(); }
      if (S.draft && (e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); send(); } });
    el.addEventListener('click', e => {
      if (typeof window.touch === 'function') window.touch();
      const t = e.target.closest('button,[data-i],[data-p]'); if (!t) { if (S.book && !e.target.closest('.mlbook')) { S.book = false; draw(); } return; }
      const ds = t.dataset;
      if (ds.g !== undefined) { const f = S.msg.btns[+ds.g][1]; S.msg = null; draw(); f(); return; }
      if (ds.p) { const f = S.book; const cur = splitA(S.draft[f]); if (!cur.includes(ds.p)) cur.push(ds.p); S.draft[f] = cur.join(', '); S.book = false; return draw(); }
      if (ds.box) { if (S.draft) return ask('書(か)きかけの メールが あるよ。すてて いい？', [['もどる', () => {}], ['すてる', () => { S.draft = null; S.box = ds.box; S.sel = 0; draw(); }]]); S.box = ds.box; S.sel = 0; S.stat = ''; return draw(); }
      if (ds.i !== undefined) { S.sel = +ds.i; return draw(); }
      const m = (S.box === 'in' ? S.inbox : S.sent)[S.sel];
      switch (ds.a) {
        case 'new': return compose({});
        case 'book': S.book = S.book === ds.f ? false : ds.f; return draw();
        case 'send': return send();
        case 'discard': return ask('この メールを すてますか？', [['もどる', () => {}], ['すてる', () => { S.draft = null; draw(); }]]);
        case 'reply': return compose({ to: m.from, subject: /^re:/i.test(m.subject) ? m.subject : 'Re: ' + m.subject, body: quote(m), kind: 'reply', ref: m.id });
        case 'all': return compose({ to: m.from, cc: [...m.to, ...(m.cc || [])].filter(a => a !== w.myAddr).join(', '), subject: /^re:/i.test(m.subject) ? m.subject : 'Re: ' + m.subject, body: quote(m), kind: 'all', ref: m.id });
        case 'fwd': return compose({ to: '', subject: 'Fw: ' + m.subject, body: quote({ ...m, from: m.from || w.myAddr }), kind: 'fwd', ref: m.id });
      }
      if (ds.b === 'reset') { if (!confirm('はじめの 形に もどしますか？')) return; S.inbox = w.inbox.map(x => ({ ...x })); S.sent = []; S.draft = null; S.msg = null; S.box = 'in'; S.sel = 0; S.stat = ''; return draw(); }
      if (ds.b === 'done') { if (S.draft) return ask('まだ 送信(そうしん)して いない メールが あるよ。送信(そうしん)か「すてる」を してから「できた」を おそう。', [['OK', () => {}]]);
        const s = st(), bad = w.steps.find(x => { try { return !x.ok(s); } catch (_) { return true; } });
        const a = document.querySelector('.ans'); if (!a || !document.getElementById('ok')) return;
        a.dataset.raw = a.value = bad ? `まだ：${bad.t.replace(/<[^>]+>/g, '').replace(/\(([ぁ-ゟ]+)\)/g, '')}` : 'できた'; document.getElementById('ok').click(); }
    });
  }
  new MutationObserver(() => document.querySelectorAll('.mlx:not([data-on])').forEach(boot)).observe(document.documentElement, { childList: true, subtree: true });

  // ---------- 問題 ----------
  const editQ = gen => () => { const w = gen(); const id = 'm' + (++wid); W[id] = w;
    return { key: `ml-${w.key}`, tap: { code: 0 }, boxes: [''], answer: ['できた'],
      exHint: F('「＋ 新規メール」や「返信」で 書(か)いて「送信」。「やる こと」が ぜんぶ ✅ に なったら「できた」。'),
      text: `<div class="fxgoal"><span class="mlsum">${w.steps.map(s => F(s.t)).join('／')}</span><span class="mlins">${F(`下(した)の メールで「やる こと」を やろう。あなたの 名前(なまえ)は この 問題(もんだい)では「<b>${w.me}</b>」（本当(ほんとう)の 名前(なまえ)は 書(か)かない）。できたら <b>できた</b> を おそう。`)}</span></div><div class="mlx" data-w="${id}"></div>` }; };
  const P = n => PEOPLE.find(p => p[0] === n);
  const myAddr = me => ({ はると: 'haruto', あおい: 'aoi', りく: 'riku', めい: 'mei' }[me] + '@kids.example.jp');
  const inboxFor = me => [
    { id: 1, from: P('山田先生')[1], to: [myAddr(me)], subject: 'あしたの クラブ', body: `${me}さん\n\nこんにちは。山田です。\nあしたの クラブは 3時から パソコン室で やります。\nわかったら 返事を ください。\n\n山田` },
    { id: 2, from: P('森先生')[1], to: [myAddr(me), P('ひかり')[1]], cc: [P('山田先生')[1]], subject: 'はっぴょうかいの じゅんばん', body: `${me}さん、ひかりさん\n\nこんにちは。森です。\nはっぴょうかいの じゅんばんを きめたいです。\nやりたい じゅんばんを 返信で 教えてください。\n\n森` },
    { id: 3, from: P('ROOT じむしつ')[1], to: [myAddr(me)], subject: 'おしらせ：本の 日', body: 'みなさん\n\n金よう日は 本の 日です。\nすきな 本を 1さつ もって きてください。\n\nROOT じむしつ' },
  ];
  // 本文の 形を しらべる
  const lines = b => b.split('\n').map(l => l.trim()).filter(Boolean).filter(l => !/^>/.test(l) && !/^-{3,}/.test(l));
  const own = b => b.split(/\n-{3,} もとの メール/)[0];
  const atena = (b, who) => { const L = lines(own(b)); return L.length > 0 && L[0].includes(who.replace(/先生$/, '')); };
  const aisatsu = b => /こんにちは|こんばんは|おはよう|お(つか|疲)れ|おせわ|お世話/.test(own(b));
  const sign = (b, me) => { const L = lines(own(b)); return L.length > 0 && L[L.length - 1].includes(me); };
  const musubi = b => /よろしく|おねがい|お願い|ありがとう/.test(own(b));
  const sentTo = (s, addr) => s.sent.filter(m => m.to.includes(addr));
  const G = {
    1: [   // 宛先と 件名
      () => { const me = pick(ME), [nm, ad] = pick(PEOPLE.slice(0, 2)), sub = pick(['しゅくだいの しつもん', 'あしたの よてい', 'おれい']);
        return { key: `to-${ad}-${sub}`, me, myAddr: myAddr(me), inbox: inboxFor(me), modelSent: [{ to: [ad], cc: [], subject: sub, body: `${nm}\n\nこんにちは。${me}です。\n\n${me}` }],
          steps: [{ t: `<b>${nm}</b>（${ad}）に メールを 送(おく)る。宛先(あてさき)は 📒（アドレス帳(ちょう)）から えらんでも いい`, ok: s => sentTo(s, ad).length > 0 },
            { t: `件名(けんめい)は「<b>${sub}</b>」`, ok: s => sentTo(s, ad).some(m => m.subject.includes(sub)) }] }; },
      () => { const me = pick(ME), [nm, ad] = pick(PEOPLE.slice(3)), sub = pick(['あそぶ やくそく', 'クラブの こと', '本の かしかり']);
        return { key: `to2-${ad}-${sub}`, me, myAddr: myAddr(me), inbox: inboxFor(me), modelSent: [{ to: [ad], cc: [], subject: sub, body: `${nm}さん\n\nこんにちは。${me}です。\n\n${me}` }],
          steps: [{ t: `ともだちの <b>${nm}</b> に メール。アドレスは <b>${ad}</b>（キーボードで 打(う)とう。半角(はんかく)で）`, ok: s => sentTo(s, ad).length > 0 },
            { t: `件名(けんめい)は「${sub}」。本文(ほんぶん)の さいごに 自分(じぶん)の 名前(なまえ)「${me}」`, ok: s => sentTo(s, ad).some(m => m.subject.includes(sub) && sign(m.body, me)) }] }; },
    ],
    2: [   // 本文の 形
      () => { const me = pick(ME), [nm, ad] = pick(PEOPLE.slice(0, 2)), [sub, need, kw] = pick([['けっせきの れんらく', 'あしたは かぜで 休(やす)みます', '休'], ['しつもん', 'しゅくだいの 3ばんが わかりません', 'しゅくだい'], ['おれい', '本を かして くれて ありがとう', 'ありがとう']]);
        return { key: `bd-${ad}-${sub}`, me, myAddr: myAddr(me), inbox: inboxFor(me), modelSent: [{ to: [ad], cc: [], subject: sub, body: `${nm}\n\nこんにちは。${me}です。\n${need}。\nよろしく おねがいします。\n\n${me}` }],
          steps: [{ t: `${nm}（${ad}）に、件名(けんめい)「${sub}」で 送(おく)る`, ok: s => sentTo(s, ad).some(m => m.subject.includes(sub)) },
            { t: `1行目(ぎょうめ)は 宛名(あてな)（「${nm}」）`, ok: s => sentTo(s, ad).some(m => atena(m.body, nm)) },
            { t: `あいさつ（こんにちは。${me}です。）と 用(よう)けん（${need}）`, ok: s => sentTo(s, ad).some(m => aisatsu(m.body) && own(m.body).includes(kw)) },
            { t: `むすび（よろしく おねがいします など）と、さいごの 行(ぎょう)に 名前(なまえ)「${me}」`, ok: s => sentTo(s, ad).some(m => musubi(m.body) && sign(m.body, me)) }] }; },
    ],
    3: [   // 返信
      () => { const me = pick(ME);
        return { key: `re-${me}`, me, myAddr: myAddr(me), inbox: inboxFor(me), modelSent: [{ to: [P('山田先生')[1]], cc: [], subject: 'Re: あしたの クラブ', kind: 'reply', body: `山田先生\n\nわかりました。3時に パソコン室に 行きます。\n\n${me}` }],
          steps: [{ t: '山田先生(やまだせんせい)の「あしたの クラブ」に <b>返信(へんしん)</b>する（件名(けんめい)は「Re:」の まま）', ok: s => s.sent.some(m => m.kind === 'reply' && m.ref === 1 && /^re:/i.test(m.subject)) },
            { t: `本文(ほんぶん)：宛名(あてな)・「わかりました」・名前(なまえ)「${me}」`, ok: s => s.sent.some(m => m.ref === 1 && atena(m.body, '山田先生') && /わかりました/.test(m.body) && sign(m.body, me)) }] }; },
      () => { const me = pick(ME), [nm, ad] = pick(PEOPLE.slice(3).filter(p => p[0] !== 'ひかり'));
        return { key: `fw-${ad}`, me, myAddr: myAddr(me), inbox: inboxFor(me), modelSent: [{ to: [ad], cc: [], subject: 'Fw: おしらせ：本の 日', kind: 'fwd', body: `${nm}さん\n\nじむしつからの おしらせです。\n\n${me}` }],
          steps: [{ t: `じむしつの「おしらせ：本の 日」を、${nm}（${ad}）に <b>転送(てんそう)</b>する`, ok: s => s.sent.some(m => m.kind === 'fwd' && m.ref === 3 && m.to.includes(ad)) },
            { t: `転送(てんそう)の 上(うえ)に、ひとこと（宛名(あてな)と 自分(じぶん)の 名前(なまえ)「${me}」）を 書(か)く`, ok: s => s.sent.some(m => m.ref === 3 && atena(m.body, nm) && sign(m.body, me)) }] }; },
      () => { const me = pick(ME), n = pick(['1ばん', '2ばん', 'さいご']);
        return { key: `all-${me}-${n}`, me, myAddr: myAddr(me), inbox: inboxFor(me), modelSent: [{ to: [P('森先生')[1]], cc: [P('ひかり')[1], P('山田先生')[1]], subject: 'Re: はっぴょうかいの じゅんばん', kind: 'all', body: `森先生\n\n${n}が いいです。\n\n${me}` }],
          steps: [{ t: '森先生(もりせんせい)の「はっぴょうかいの じゅんばん」に <b>全員(ぜんいん)に 返信(へんしん)</b>（ひかりさん・山田先生(やまだせんせい)にも とどく）', ok: s => s.sent.some(m => m.ref === 2 && m.to.includes(P('森先生')[1]) && [...m.to, ...m.cc].includes(P('ひかり')[1])) },
            { t: `本文(ほんぶん)に「${n}」が いい と 書(か)いて、さいごに 名前(なまえ)「${me}」`, ok: s => s.sent.some(m => m.ref === 2 && own(m.body).includes(n) && sign(m.body, me)) }] }; },
    ],
    4: [   // CC
      () => { const me = pick(ME), [nm, ad] = pick(PEOPLE.slice(3)), cc = P('山田先生');
        return { key: `cc-${ad}`, me, myAddr: myAddr(me), inbox: inboxFor(me), modelSent: [{ to: [ad], cc: [cc[1]], subject: 'クラブの じゅんび', body: `${nm}さん\n\nこんにちは。${me}です。\nあした パソコン室で じゅんびを しよう。\n\n${me}` }],
          steps: [{ t: `宛先(あてさき)は ${nm}（${ad}）、件名(けんめい)「クラブの じゅんび」`, ok: s => sentTo(s, ad).some(m => m.subject.includes('クラブの じゅんび')) },
            { t: `<b>CC</b> に 山田先生(やまだせんせい)（${cc[1]}）を 入(い)れる（先生(せんせい)にも 知(し)って おいて ほしい）`, ok: s => sentTo(s, ad).some(m => m.cc.includes(cc[1]) && !m.to.includes(cc[1])) },
            { t: `宛名(あてな)と 名前(なまえ)「${me}」を 書(か)く`, ok: s => sentTo(s, ad).some(m => atena(m.body, nm) && sign(m.body, me)) }] }; },
      () => { const me = pick(ME), a = P('そうた'), b = P('ゆい');
        return { key: `cc2-${me}`, me, myAddr: myAddr(me), inbox: inboxFor(me), modelSent: [{ to: [a[1], b[1]], cc: [], subject: 'あそぶ やくそく', body: `そうたさん、ゆいさん\n\nこんにちは。${me}です。\n土よう日に こうえんで あそぼう。\n\n${me}` }],
          steps: [{ t: `そうた と ゆい の 2人(ふたり)に、1つの メールで 送(おく)る（宛先(あてさき)に 2人(ふたり)。「, 」で 区切(くぎ)る か 📒 で 2回(かい) えらぶ）`, ok: s => s.sent.some(m => m.to.includes(a[1]) && m.to.includes(b[1])) },
            { t: `件名(けんめい)「あそぶ やくそく」、さいごに 名前(なまえ)「${me}」`, ok: s => s.sent.some(m => m.to.includes(a[1]) && m.subject.includes('あそぶ') && sign(m.body, me)) }] }; },
    ],
    5: [   // まとめ
      () => { const me = pick(ME), ad = P('山田先生')[1];
        return { key: `mt-${me}`, me, myAddr: myAddr(me), inbox: inboxFor(me), modelSent: [{ to: [ad], cc: [], subject: 'Re: あしたの クラブ', kind: 'reply', body: `山田先生\n\nこんにちは。${me}です。\nわかりました。よろしく おねがいします。\n\n${me}` }, { to: [P('ゆい')[1]], cc: [ad], subject: 'Fw: あしたの クラブ', kind: 'fwd', body: `ゆいさん\n\n山田先生からです。\n\n${me}` }],
          steps: [{ t: '山田先生(やまだせんせい)の「あしたの クラブ」に 返信(へんしん)。宛名(あてな)・あいさつ・用(よう)けん・むすび・名前(なまえ) の 形(かたち)で', ok: s => s.sent.some(m => m.ref === 1 && m.kind === 'reply' && atena(m.body, '山田先生') && aisatsu(m.body) && musubi(m.body) && sign(m.body, me)) },
            { t: `同(おな)じ メールを ゆい（${P('ゆい')[1]}）に 転送(てんそう)し、CC に 山田先生(やまだせんせい)を 入(い)れる`, ok: s => s.sent.some(m => m.ref === 1 && m.kind === 'fwd' && m.to.includes(P('ゆい')[1]) && m.cc.includes(ad)) }] }; },
    ],
  };
  const make = list => () => { const s = shuffle(list); return [0, 1, 2].map(i => editQ(s[i % s.length])()); };
  const add = (n, name, lecture) => { const id = `x0w-${n}`; UNITS[id] = { id, subject: 'x0', series: se.id, name: F(name), col: 'メール', pass: 0.6, grade: 5, make: make(G[n]), lecture: lecture.map(F) }; se.units.push(id); };
  add(1, '宛先(あてさき)と 件名(けんめい)', [
    `メールは ①<b>宛先(あてさき)</b>（だれに）②<b>件名(けんめい)</b>（何(なん)の 話(はなし)か）③<b>本文(ほんぶん)</b> で できて いる。<br>宛先(あてさき)は メールアドレス（例(れい)：yamada@root.example.jp）。<b>半角(はんかく)</b>で、1文字(もじ)でも ちがうと とどかない。`,
    `件名(けんめい)は 短(みじか)く、見(み)ただけで 中身(なかみ)が わかるように（「しつもん」より「しゅくだいの しつもん」）。<br>送信(そうしん)した メールは <b>取(と)り消(け)せない</b>。送(おく)る 前(まえ)に 宛先(あてさき)を もう一度(いちど) 見(み)よう。`]);
  add(2, '本文(ほんぶん)の 形(かたち)', [
    `本文(ほんぶん)は この じゅんで 書(か)く：<br>①<b>宛名(あてな)</b>（山田先生(やまだせんせい)）②<b>あいさつと 名(な)のり</b>（こんにちは。〇〇です。）③<b>用(よう)けん</b>（言(い)いたい こと）④<b>むすび</b>（よろしく おねがいします）⑤<b>自分(じぶん)の 名前(なまえ)</b>`,
    'まとまりの 間(あいだ)は 1行(ぎょう) あけると 読(よ)みやすい。顔(かお)が 見(み)えないので、ていねいな ことばで。<br>自分(じぶん)の 住所(じゅうしょ)・電話(でんわ)番号(ばんごう)・パスワードは メールに 書(か)かない。']);
  add(3, '返信(へんしん)と 転送(てんそう)', [
    `<b>返信(へんしん)</b>：来(き)た メールに 返事(へんじ)を する。宛先(あてさき)が 自動(じどう)で 入(はい)り、件名(けんめい)に「Re:」が つく。<br><b>全員(ぜんいん)に 返信(へんしん)</b>：CC の 人(ひと)にも とどく。みんなに 知(し)らせたい ときだけ 使(つか)う。`,
    `<b>転送(てんそう)</b>：来(き)た メールを べつの 人(ひと)に そのまま 送(おく)る。件名(けんめい)に「Fw:」。上(うえ)に ひとこと そえよう。<br>人(ひと)から 来(き)た メールを 転送(てんそう)して いいか、まよったら 大人(おとな)に 聞(き)こう。`]);
  add(4, 'CC と 何人(なんにん)かに 送(おく)る', [
    `宛先(あてさき)は「<b>あなたに 送(おく)って いる</b>」人(ひと)。<b>CC</b> は「<b>知(し)って おいて ほしい</b>」人(ひと)。<br>CC の 人(ひと)の アドレスは、もらった 人(ひと) みんなに 見(み)える。`,
    '何人(なんにん)かに 送(おく)る ときは、アドレスを「, 」（半角(はんかく)の カンマ）で 区切(くぎ)る。宛名(あてな)にも 全員(ぜんいん)の 名前(なまえ)を 書(か)こう。']);
  add(5, 'まとめ（メール）', ['これまでの まとめ。返信(へんしん)は 本文(ほんぶん)の 形(かたち)で。転送(てんそう)と CC も 使(つか)おう。',
    '知(し)らない 人(ひと)からの メールの リンクや ファイルは 開(ひら)かない。へんだな と 思(おも)ったら 大人(おとな)に 見(み)せよう。']);
})();
