// パソコン「保存と ひらく」（2026年11月26日 ユーザー決定の ②）。content_sheet.js の あと、review.js の 前に 読む。
// 画面の 中の「にせの メモちょう」と「名前を つけて 保存」「開く」の 画面。保存場所（フォルダ）と ファイル名を えらぶ、上書き保存、開く、保存しないで 閉じる ときの 確認。
// 「やる こと」が できると ✅。おわったら「できた」。本物の ファイルには さわらない。学年（4年）・1単元 3問・合格 0.6 は 仮。題材は ROOTの オリジナル（Claude の 案・仮）。
(() => {
  const pick = a => a[rand(0, a.length - 1)];
  const F = s => typeof s !== 'string' ? s : s.replace(/([一-鿿々]+)\(([ぁ-ゟ]+)\)/g, '{$1|$2}');
  const T = s => (typeof R === 'function' ? R(F(s)) : F(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pc = SUBJECTS.find(s => s.id === 'x0');
  const se = { id: 'x0v', name: F('保存(ほぞん)と ひらく'), units: [], noSum: true };
  pc.series.push(se);

  const ROOTS = ['デスクトップ', 'ドキュメント', 'ピクチャ'];
  const BAD = /[\\/:*?"<>|]/;
  const css = document.createElement('style');
  css.textContent = `.svx{max-width:760px;margin:8px auto;text-align:left;position:relative}
  .svtask{font-size:.68em;background:#f3f8ee;border:1px solid #c5e1a5;border-radius:6px;padding:6px 10px;margin-bottom:6px;line-height:1.7}.svtask .ok{color:#2e7d32}
  .svwin{border:1px solid #9aa4b2;border-radius:8px;background:#fff;overflow:hidden;font-size:.62em;color:#222;box-shadow:0 2px 8px #0002;position:relative;min-height:420px}
  .svtitle{background:#eef2f7;padding:4px 10px;border-bottom:1px solid #d5dbe3;font-family:"Yu Gothic UI",Meiryo,sans-serif}
  .svmenu{display:flex;gap:2px;padding:2px 6px;border-bottom:1px solid #e1e5ea;position:relative}.svmenu>button{font-size:1em;padding:2px 10px;min-width:0;background:none;border:none;cursor:pointer;border-radius:4px}.svmenu>button:hover{background:#e3eaf3}
  .svdrop{position:absolute;top:100%;left:6px;background:#fff;border:1px solid #b8c2cf;box-shadow:0 3px 10px #0003;z-index:5;min-width:15em;padding:3px 0}.svdrop button{display:flex;justify-content:space-between;width:100%;font-size:1em;padding:4px 12px;background:none;border:none;text-align:left;cursor:pointer;border-radius:0;min-width:0}.svdrop button:hover{background:#e3f2fd}.svdrop small{color:#778;margin-left:2em}
  .svtext{width:100%;box-sizing:border-box;height:290px;border:none;resize:none;padding:8px 10px;font:1.05em "Yu Gothic UI",Meiryo,sans-serif;outline:none}
  .svstat{border-top:1px solid #e1e5ea;padding:3px 8px;color:#556;background:#fafbfc;min-height:1.5em}
  .svdlg{position:absolute;inset:8px;background:#fff;border:1px solid #7a8798;box-shadow:0 6px 24px #0005;z-index:8;display:flex;flex-direction:column}
  .svdlg h4{margin:0;padding:5px 10px;background:#eef2f7;font-size:1em;font-weight:normal;border-bottom:1px solid #d5dbe3}
  .svaddr{margin:5px 8px;border:1px solid #b8c2cf;padding:2px 8px;font-family:"Yu Gothic UI",Meiryo,sans-serif;display:flex;gap:6px;align-items:center}.svaddr button{font-size:1em;min-width:0;padding:0 6px}
  .svbody{flex:1;display:flex;border-top:1px solid #e1e5ea;border-bottom:1px solid #e1e5ea;min-height:130px;overflow:hidden}
  .svnav{width:9.5em;border-right:1px solid #e1e5ea;padding:4px 0;overflow:auto}.svnav div,.svlist div{padding:2px 8px;cursor:pointer;white-space:nowrap}.svnav div:hover,.svlist div:hover{background:#eef5fc}.svnav .on{background:#cce4f7}
  .svlist{flex:1;padding:4px 0;overflow:auto}.svlist .on{background:#cce4f7}.svlist .empty{color:#99a;cursor:default}
  .svrow{display:flex;gap:6px;align-items:center;margin:4px 8px}.svrow label{width:9.5em;text-align:right;white-space:nowrap}.svrow input,.svrow select{flex:1;font:inherit;padding:2px 6px;border:1px solid #b8c2cf}
  .svbtns{display:flex;gap:6px;justify-content:flex-end;margin:6px 8px}.svbtns button{font-size:1em;padding:3px 14px;min-width:0}
  .svmsg{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);background:#fff;border:1px solid #7a8798;box-shadow:0 6px 24px #0006;z-index:9;padding:10px 14px;min-width:20em}.svmsg .svbtns{margin:10px 0 0}
  .svdone{display:flex;gap:8px;justify-content:flex-end;margin-top:6px}.svdone button{font-size:.7em;padding:4px 14px}
  table .svx{display:none}.svsum{display:none}table .svsum{display:inline;font-size:.85em}table .svins{display:none}.svins{font-size:.72em;line-height:1.6}`;
  document.head.appendChild(css);
  const W = {}; let wid = 0; window.SV = { W };
  const clone = o => JSON.parse(JSON.stringify(o));
  const pstr = p => 'C:\\Users\\root\\' + p.join('\\');

  function boot(el) {
    el.dataset.on = '1';
    const w = W[el.dataset.w]; if (!w) return;
    const demo = !!el.closest('.ex');
    // fs：{ 'ドキュメント': {dirs:{しゅくだい:{...}}, files:{'a.txt':'...'}} }
    const S = { fs: clone(demo ? w.modelFs || w.fs : w.fs), doc: clone(demo ? w.modelDoc || w.doc : w.doc), dlg: null, msg: null, drop: false, stat: '', log: [] };
    const node = p => { let n = { dirs: {} }; ROOTS.forEach(r => { n.dirs[r] = S.fs[r]; }); for (const k of p) { n = n.dirs[k]; if (!n) return null; } return n; };
    const st = () => ({ fs: S.fs, doc: S.doc, log: S.log, file: (p, f) => { const n = node(p); return n && Object.prototype.hasOwnProperty.call(n.files, f) ? n.files[f] : null; } });
    el.innerHTML = `<div class="svtask"></div><div class="svwin"></div>${demo ? '' : `<div class="svdone"><button data-b="reset">${T('はじめから')}</button><button class="primary" data-b="done">${T('できた')}</button></div>`}`;
    const win = el.querySelector('.svwin'), task = el.querySelector('.svtask');
    const drawTask = () => { const s = st(); task.innerHTML = `${T('<b>やる こと</b>')}${w.steps.map(x => { let ok = false; try { ok = !!x.ok(s); } catch (_) {} return `<div class="${ok ? 'ok' : ''}">${ok ? '✅' : '⬜'} ${T(x.t)}</div>`; }).join('')}`; };
    const title = () => `${S.doc.dirty ? '*' : ''}${S.doc.name || '無題'} - メモちょう`;
    const draw = () => {
      const ta = win.querySelector('.svtext'), keep = ta && document.activeElement === ta ? [ta.selectionStart, ta.selectionEnd] : null;
      win.innerHTML = `<div class="svtitle">${esc(title())}</div>
        <div class="svmenu"><button data-m="file">ファイル(F)</button>${S.drop ? `<div class="svdrop">
          <button data-c="new">新規<small>Ctrl+N</small></button><button data-c="open">開く...<small>Ctrl+O</small></button><button data-c="save">上書き保存<small>Ctrl+S</small></button><button data-c="saveas">名前を付けて保存...<small>Ctrl+Shift+S</small></button></div>` : ''}</div>
        <textarea class="svtext" spellcheck="false" ${demo ? 'readonly' : ''}>${esc(S.doc.text)}</textarea>
        <div class="svstat">${S.stat ? T(S.stat) : (S.doc.path ? esc(pstr([...S.doc.path, S.doc.name])) : T('まだ 保存(ほぞん)して いない'))}</div>${dlgHTML()}${msgHTML()}`;
      if (keep && !S.dlg && !S.msg) { const t2 = win.querySelector('.svtext'); t2.focus(); t2.setSelectionRange(...keep); }
      const fn = win.querySelector('.svdlg input[name=fn]'); if (fn && S.dlg.focusName) { fn.focus(); fn.select(); S.dlg.focusName = false; }
      drawTask();
    };
    const dlgHTML = () => { const d = S.dlg; if (!d) return '';
      const n = node(d.path) || { dirs: {}, files: {} }, items = [...Object.keys(n.dirs).sort().map(k => ['d', k]), ...Object.keys(n.files).sort().filter(f => d.type === 'all' || /\.txt$/i.test(f)).map(k => ['f', k])];
      return `<div class="svdlg"><h4>${d.mode === 'save' ? '名前を付けて保存' : '開く'}</h4>
        <div class="svaddr"><button data-d="up" title="上へ">↑</button><span>${esc(pstr(d.path))}</span></div>
        <div class="svbody"><div class="svnav">${ROOTS.map(r => `<div data-nav="${r}" class="${d.path[0] === r && d.path.length === 1 ? 'on' : ''}">${r === 'デスクトップ' ? '🖥' : r === 'ピクチャ' ? '🖼' : '📄'} ${r}</div>`).join('')}</div>
        <div class="svlist">${items.length ? items.map(([t, k]) => `<div data-${t === 'd' ? 'dir' : 'file'}="${esc(k)}" class="${d.sel === k ? 'on' : ''}">${t === 'd' ? '📁' : '📝'} ${esc(k)}</div>`).join('') : `<div class="empty">${T('（何(なに)も ない）')}</div>`}</div></div>
        <div class="svrow"><label>ファイル名(N):</label><input name="fn" value="${esc(d.name)}" autocomplete="off" spellcheck="false"></div>
        <div class="svrow"><label>ファイルの種類(T):</label><select name="ty"><option value="txt" ${d.type !== 'all' ? 'selected' : ''}>テキスト文書 (*.txt)</option><option value="all" ${d.type === 'all' ? 'selected' : ''}>すべてのファイル (*.*)</option></select></div>
        <div class="svbtns"><button class="primary" data-d="ok">${d.mode === 'save' ? '保存(S)' : '開く(O)'}</button><button data-d="cancel">キャンセル</button></div></div>`; };
    const msgHTML = () => { const m = S.msg; if (!m) return ''; return `<div class="svmsg">${T(m.text)}<div class="svbtns">${m.btns.map((b, i) => `<button data-g="${i}" class="${i === 0 ? 'primary' : ''}">${T(b[0])}</button>`).join('')}</div></div>`; };
    const ask = (text, btns) => { S.msg = { text, btns }; draw(); };
    const writeFile = (path, name) => { const n = node(path); n.files[name] = S.doc.text; S.doc.path = [...path]; S.doc.name = name; S.doc.dirty = false; S.log.push({ act: 'save', path: [...path], name }); S.stat = `「${name}」に 保存(ほぞん)したよ`; };
    const openSave = after => { S.drop = false; S.dlg = { mode: 'save', path: S.doc.path ? [...S.doc.path] : ['ドキュメント'], name: S.doc.name || '無題.txt', type: 'txt', sel: null, focusName: true, after }; draw(); };
    const save = after => { S.drop = false; if (!S.doc.path) return openSave(after); writeFile(S.doc.path, S.doc.name); S.log.push({ act: 'over', name: S.doc.name }); draw(); if (after) after(); };
    // 変更が ある とき：保存する？
    const guard = next => { if (!S.doc.dirty) return next();
      ask(`「${S.doc.name || '無題'}」への 変更(へんこう)内容(ないよう)を 保存(ほぞん)しますか？`, [['保存する', () => save(next)], ['保存しない', () => { S.log.push({ act: 'discard' }); next(); }], ['キャンセル', () => {}]]); };
    const doNew = () => guard(() => { S.doc = { text: '', name: '', path: null, dirty: false }; S.log.push({ act: 'new' }); S.stat = ''; draw(); });
    const doOpen = () => guard(() => { S.dlg = { mode: 'open', path: S.doc.path ? [...S.doc.path] : ['ドキュメント'], name: '', type: 'txt', sel: null }; draw(); });
    const dlgOk = () => { const d = S.dlg; let name = (win.querySelector('.svdlg input[name=fn]').value || '').trim(); d.name = name;
      if (d.mode === 'open') { const n = node(d.path); if (n && n.dirs[name]) { d.path.push(name); d.name = ''; d.sel = null; return draw(); }
        if (!n || !Object.prototype.hasOwnProperty.call(n.files, name)) { S.dlg = d; return ask(`「${name || '（空）'}」が 見(み)つかりません。ファイル名(めい)を たしかめよう。`, [['OK', () => {}]]); }
        S.doc = { text: n.files[name], name, path: [...d.path], dirty: false }; S.log.push({ act: 'open', path: [...d.path], name }); S.dlg = null; S.stat = `「${name}」を 開(ひら)いたよ`; return draw(); }
      if (!name) return ask('ファイル名(めい)を 入(い)れよう。', [['OK', () => {}]]);
      if (BAD.test(name)) return ask('ファイル名(めい)に つかえない 文字(もじ)が あるよ：\\ / : * ? " < > |', [['OK', () => {}]]);
      if (d.type !== 'all' && !/\.[^.]+$/.test(name)) name += '.txt';
      const n = node(d.path), after = d.after;
      const go = () => { S.dlg = null; writeFile(d.path, name); draw(); if (after) after(); };
      if (Object.prototype.hasOwnProperty.call(n.files, name)) return ask(`「${name}」は すでに あります。上書(うわが)きしますか？`, [['はい', go], ['いいえ', () => {}]]);
      go(); };
    draw();
    if (demo) return;

    win.addEventListener('input', e => { if (e.target.classList.contains('svtext')) { S.doc.text = e.target.value; if (!S.doc.dirty) { S.doc.dirty = true; S.stat = ''; win.querySelector('.svtitle').textContent = title(); } drawTask(); }
      if (e.target.name === 'fn' && S.dlg) S.dlg.name = e.target.value; });
    win.addEventListener('change', e => { if (e.target.name === 'ty' && S.dlg) { S.dlg.type = e.target.value; draw(); } });
    win.addEventListener('keydown', e => {
      e.stopPropagation(); if (typeof window.touch === 'function') window.touch();
      if (e.isComposing || e.keyCode === 229) return;
      const c = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
      if (S.msg) { if (e.key === 'Escape') { e.preventDefault(); S.msg = null; draw(); } return; }
      if (S.dlg) { if (e.key === 'Enter') { e.preventDefault(); dlgOk(); } else if (e.key === 'Escape') { e.preventDefault(); S.dlg = null; draw(); } return; }
      if (c && k === 's') { e.preventDefault(); return e.shiftKey ? openSave() : save(); }
      if (c && k === 'o') { e.preventDefault(); return doOpen(); }
      if (c && k === 'n') { e.preventDefault(); return doNew(); }
    });
    let lastClick = 0;
    el.addEventListener('click', e => {
      if (typeof window.touch === 'function') window.touch();
      const t = e.target.closest('button,[data-nav],[data-dir],[data-file]'); if (!t) { if (S.drop && !e.target.closest('.svmenu')) { S.drop = false; draw(); } return; }
      const ds = t.dataset;
      if (ds.g !== undefined) { const f = S.msg.btns[+ds.g][1]; S.msg = null; draw(); f(); return; }
      if (ds.m) { S.drop = !S.drop; return draw(); }
      if (ds.c) { S.drop = false; return ({ new: doNew, open: doOpen, save: () => save(), saveas: () => openSave() })[ds.c](); }
      if (ds.nav) { S.dlg.path = [ds.nav]; S.dlg.sel = null; return draw(); }
      if (ds.d === 'up') { if (S.dlg.path.length > 1) S.dlg.path.pop(); S.dlg.sel = null; return draw(); }
      if (ds.d === 'cancel') { S.dlg = null; return draw(); }
      if (ds.d === 'ok') return dlgOk();
      const now = Date.now(), dbl = now - lastClick < 400 && S.dlg && S.dlg.sel === (ds.dir || ds.file); lastClick = now;
      if (ds.dir !== undefined) { if (dbl) { S.dlg.path.push(ds.dir); S.dlg.sel = null; S.dlg.name = S.dlg.mode === 'save' ? S.dlg.name : ''; } else { S.dlg.sel = ds.dir; } return draw(); }
      if (ds.file !== undefined) { S.dlg.sel = ds.file; S.dlg.name = ds.file; draw(); if (dbl) dlgOk(); return; }
      if (ds.b === 'reset') { if (!confirm('はじめの 形に もどしますか？')) return; S.fs = clone(w.fs); S.doc = clone(w.doc); S.dlg = S.msg = null; S.log = []; S.stat = ''; return draw(); }
      if (ds.b === 'done') { const s = st(), bad = w.steps.find(x => { try { return !x.ok(s); } catch (_) { return true; } });
        const a = document.querySelector('.ans'); if (!a || !document.getElementById('ok')) return;
        a.dataset.raw = a.value = bad ? `まだ：${bad.t.replace(/<[^>]+>/g, '').replace(/\(([ぁ-ゟ]+)\)/g, '')}` : 'できた'; document.getElementById('ok').click(); }
    });
  }
  new MutationObserver(() => document.querySelectorAll('.svx:not([data-on])').forEach(boot)).observe(document.documentElement, { childList: true, subtree: true });

  // ---------- 問題 ----------
  const editQ = gen => () => { const w = gen(); const id = 'v' + (++wid); W[id] = w;
    return { key: `sv-${w.key}`, tap: { code: 0 }, boxes: [''], answer: ['できた'],
      exHint: F('「ファイル」メニュー（または Ctrl+S・Ctrl+O）を つかおう。「やる こと」が ぜんぶ ✅ に なったら「できた」。'),
      text: `<div class="fxgoal"><span class="svsum">${w.steps.map(s => F(s.t)).join('／')}</span><span class="svins">${F('下(した)の メモちょうで「やる こと」を やろう。できたら <b>できた</b> を おそう。')}</span></div><div class="svx" data-w="${id}"></div>` }; };
  const D = () => ({ dirs: {}, files: {} });
  const baseFs = () => { const fs = { 'デスクトップ': D(), 'ドキュメント': D(), 'ピクチャ': D() };
    fs['ドキュメント'].dirs['しゅくだい'] = D(); fs['ドキュメント'].dirs['クラブ'] = D(); fs['ドキュメント'].dirs['しゅくだい'].dirs['こくご'] = D();
    fs['ドキュメント'].files['れんらく.txt'] = 'あしたは 9じに あつまる。'; fs['デスクトップ'].files['メモ.txt'] = 'かいもの：たまご、パン'; fs['ピクチャ'].files['ねこ.png'] = '(え)'; return fs; };
  const TOPIC = [['にっき', 'きょうは 雨だった。 本を よんだ。'], ['かんそう', 'この 本は おもしろかった。'], ['よてい', '土よう日：プール\n日よう日：そうじ'], ['クイズ', 'もんだい：1+1は？\nこたえ：2'], ['しりとり', 'りんご → ゴリラ → ラッパ']];
  const where = () => pick([[['ドキュメント'], 'ドキュメント'], [['デスクトップ'], 'デスクトップ'], [['ドキュメント', 'しゅくだい'], 'ドキュメント の 中(なか)の「しゅくだい」'], [['ドキュメント', 'クラブ'], 'ドキュメント の 中(なか)の「クラブ」'], [['ドキュメント', 'しゅくだい', 'こくご'], 'ドキュメント → しゅくだい → こくご']]);
  const at = (fs, p) => { let n = fs[p[0]]; for (const k of p.slice(1)) n = n.dirs[k]; return n; };
  const has = (s, p, f, txt) => { const v = s.file(p, f); return v !== null && (txt === undefined || v.includes(txt)); };
  const G = {
    1: [   // 名前を つけて 保存
      () => { const [tp, body] = pick(TOPIC), [p, ps] = where(), fs = baseFs(), name = tp + '.txt', mf = clone(fs); at(mf, p).files[name] = body;
        return { key: `sa-${tp}-${p.join('/')}`, fs, doc: { text: body, name: '', path: null, dirty: true }, modelFs: mf, modelDoc: { text: body, name, path: p, dirty: false },
          steps: [{ t: `この 文(ぶん)を、<b>${ps}</b> に「<b>${tp}</b>」と いう 名前(なまえ)で 保存(ほぞん)する（ファイル → 名前(なまえ)を 付(つ)けて 保存(ほぞん)）`, ok: s => has(s, p, name) }] }; },
      () => { const [tp, body] = pick(TOPIC), fs = baseFs(), p = ['ドキュメント'], name = tp + '.txt', mf = clone(fs); at(mf, p).files[name] = body + '\nおわり';
        return { key: `sa2-${tp}`, fs, doc: { text: body, name: '', path: null, dirty: true }, modelFs: mf, modelDoc: { text: body + '\nおわり', name, path: p, dirty: false },
          steps: [{ t: `いちばん 下(した)に「おわり」と 書(か)きたす`, ok: s => /おわり\s*$/.test(s.doc.text) }, { t: `ドキュメント に「${tp}」と いう 名前(なまえ)で 保存(ほぞん)する（「おわり」も 入(はい)った 形(かたち)で）`, ok: s => has(s, p, name, 'おわり') }] }; },
    ],
    2: [   // 上書き保存・別名
      () => { const fs = baseFs(), [tp, body] = pick(TOPIC), p = ['ドキュメント', 'しゅくだい'], name = tp + '.txt'; at(fs, p).files[name] = body; const add = pick(['ばんごはんは カレー。', 'あしたは はれ。', 'ともだちと あそんだ。']); const mf = clone(fs); at(mf, p).files[name] = body + '\n' + add;
        return { key: `ov-${tp}`, fs, doc: { text: body, name, path: p, dirty: false }, modelFs: mf, modelDoc: { text: body + '\n' + add, name, path: p, dirty: false },
          steps: [{ t: `いちばん 下(した)に「${add}」と 書(か)きたす`, ok: s => s.doc.text.includes(add) }, { t: '<b>上書(うわが)き保存(ほぞん)</b>する（Ctrl+S）。タイトルの * が 消(き)えるよ', ok: s => has(s, p, name, add) && !s.doc.dirty }] }; },
      () => { const fs = baseFs(), [tp, body] = pick(TOPIC), p = ['ドキュメント'], name = tp + '.txt', n2 = tp + '2.txt'; at(fs, p).files[name] = body; const mf = clone(fs); at(mf, p).files[n2] = body + '\nつづき';
        return { key: `cp-${tp}`, fs, doc: { text: body, name, path: p, dirty: false }, modelFs: mf, modelDoc: { text: body + '\nつづき', name: n2, path: p, dirty: false },
          steps: [{ t: `いちばん 下(した)に「つづき」と 書(か)きたす`, ok: s => s.doc.text.includes('つづき') }, { t: `<b>もとの「${tp}」は そのまま</b>に して、<b>名前(なまえ)を 付(つ)けて 保存(ほぞん)</b>で「${tp}2」に 保存(ほぞん)する`, ok: s => has(s, p, n2, 'つづき') && s.file(p, name) === body }] }; },
      () => { const fs = baseFs(), [tp, body] = pick(TOPIC), [p, ps] = where(), name = tp + '.txt'; at(fs, p).files[name] = 'まえの ' + tp; const mf = clone(fs); at(mf, p).files[name] = body;
        return { key: `ow-${tp}-${p.join('/')}`, fs, doc: { text: body, name: '', path: null, dirty: true }, modelFs: mf, modelDoc: { text: body, name, path: p, dirty: false },
          steps: [{ t: `この 文(ぶん)を ${ps} の「${tp}」に 保存(ほぞん)する。「上書(うわが)きしますか？」と 聞(き)かれたら よく 読(よ)んで「はい」`, ok: s => s.file(p, name) === s.doc.text && s.doc.text === body }] }; },
    ],
    3: [   // 開く
      () => { const fs = baseFs(), [tp, body] = pick(TOPIC), [p, ps] = where(), name = tp + '.txt'; at(fs, p).files[name] = body;
        return { key: `op-${tp}-${p.join('/')}`, fs, doc: { text: '', name: '', path: null, dirty: false }, modelDoc: { text: body, name, path: p, dirty: false },
          steps: [{ t: `${ps} に ある「${tp}」を <b>開(ひら)く</b>（ファイル → 開(ひら)く、Ctrl+O）`, ok: s => s.doc.name === name && JSON.stringify(s.doc.path) === JSON.stringify(p) && s.log.some(l => l.act === 'open') }] }; },
      () => { const fs = baseFs(); fs['ピクチャ'].files['え日記.txt'] = 'きょうは ねこを かいた。';
        return { key: 'op-all', fs, doc: { text: '', name: '', path: null, dirty: false }, modelDoc: { text: fs['ピクチャ'].files['え日記.txt'], name: 'え日記.txt', path: ['ピクチャ'], dirty: false },
          steps: [{ t: 'ピクチャ に ある「え日記(にっき)」を 開(ひら)く。開(ひら)いてから、ピクチャに ある ほかの ファイル（ねこ.png）は「ファイルの 種類(しゅるい)」を「すべての ファイル」に すると 見(み)える ことも たしかめよう', ok: s => s.doc.name === 'え日記.txt' && s.doc.path && s.doc.path[0] === 'ピクチャ' }] }; },
      () => { const fs = baseFs(), [tp, body] = pick(TOPIC), p = ['デスクトップ'], name = tp + '.txt'; at(fs, p).files[name] = body; const mf = clone(fs); at(mf, ['デスクトップ']).files['メモ.txt'] = 'かいもの：たまご、パン、ぎゅうにゅう';
        return { key: `op3-${tp}`, fs, doc: { text: '', name: '', path: null, dirty: false }, modelFs: mf, modelDoc: { text: mf['デスクトップ'].files['メモ.txt'], name: 'メモ.txt', path: p, dirty: false },
          steps: [{ t: 'デスクトップの「メモ」を 開(ひら)いて、さいごに「、ぎゅうにゅう」を 書(か)きたす', ok: s => s.doc.name === 'メモ.txt' && /ぎゅうにゅう/.test(s.doc.text) }, { t: '上書(うわが)き保存(ほぞん)する', ok: s => has(s, p, 'メモ.txt', 'ぎゅうにゅう') }] }; },
    ],
    4: [   // 保存しないで 閉じない
      () => { const fs = baseFs(), [tp, body] = pick(TOPIC), name = tp + '.txt', p = ['ドキュメント']; const mf = clone(fs); at(mf, p).files[name] = body;
        return { key: `gd-${tp}`, fs, doc: { text: body, name: '', path: null, dirty: true }, modelFs: mf, modelDoc: { text: '', name: '', path: null, dirty: false },
          steps: [{ t: `「新規(しんき)」で あたらしい 紙(かみ)に したい。でも 今(いま)の 文(ぶん)は 消(け)したく ない。「保存(ほぞん)しますか？」で「保存(ほぞん)する」を えらび、ドキュメント に「${tp}」で 保存(ほぞん)する`, ok: s => has(s, p, name) && s.log.some(l => l.act === 'new') && !s.log.some(l => l.act === 'discard') }] }; },
      () => { const fs = baseFs(), p = ['ドキュメント'], [tp, body] = pick(TOPIC), name = tp + '.txt'; at(fs, p).files[name] = body; const mf = clone(fs);
        return { key: `ds-${tp}`, fs, doc: { text: body + '\nあいうえおあいうえお', name, path: p, dirty: true }, modelFs: mf, modelDoc: { text: body, name, path: p, dirty: false },
          steps: [{ t: `まちがえて「あいうえお…」と 打(う)って しまった。<b>保存(ほぞん)しないで</b>、「${tp}」を もう一度(いちど) 開(ひら)きなおす（開(ひら)く → 「保存(ほぞん)しますか？」で「保存(ほぞん)しない」）`, ok: s => s.file(p, name) === body && s.doc.name === name && s.doc.text === body && s.log.some(l => l.act === 'discard') }] }; },
    ],
    5: [   // まとめ
      () => { const fs = baseFs(), [tp, body] = pick(TOPIC), p = ['ドキュメント', 'しゅくだい'], name = tp + '.txt', n2 = 'クラブ.txt'; at(fs, p).files[name] = body; const mf = clone(fs); at(mf, p).files[name] = body + '\nよかった'; at(mf, ['ドキュメント', 'クラブ']).files[n2] = body + '\nよかった';
        return { key: `mt-${tp}`, fs, doc: { text: '', name: '', path: null, dirty: false }, modelFs: mf, modelDoc: { text: body + '\nよかった', name: n2, path: ['ドキュメント', 'クラブ'], dirty: false },
          steps: [{ t: `ドキュメント → しゅくだい の「${tp}」を 開(ひら)く`, ok: s => s.log.some(l => l.act === 'open' && l.name === name) },
            { t: 'さいごに「よかった」を 書(か)きたして 上書(うわが)き保存(ほぞん)', ok: s => has(s, p, name, 'よかった') },
            { t: '同(おな)じ 文(ぶん)を、ドキュメント → クラブ に「クラブ」と いう 名前(なまえ)でも 保存(ほぞん)する', ok: s => has(s, ['ドキュメント', 'クラブ'], n2, 'よかった') }] }; },
    ],
  };
  const make = list => () => { const s = shuffle(list); return [0, 1, 2].map(i => editQ(s[i % s.length])()); };
  const add = (n, name, lecture) => { const id = `x0v-${n}`; UNITS[id] = { id, subject: 'x0', series: se.id, name: F(name), col: '保存', pass: 0.6, grade: 4, make: make(G[n]), lecture: lecture.map(F) }; se.units.push(id); };
  const K = s => `<span style="font-family:Consolas,monospace;background:#eee;border:1px solid #bbb;border-radius:4px;padding:0 5px">${s}</span>`;
  add(1, '名前(なまえ)を 付(つ)けて 保存(ほぞん)', [
    `作(つく)った ものは <b>保存(ほぞん)</b>しないと、ソフトを 閉(と)じた とき 消(き)えて しまう。<br>はじめて 保存(ほぞん)する ときは「ファイル」→「<b>名前(なまえ)を 付(つ)けて 保存(ほぞん)</b>」。`,
    `保存(ほぞん)の 画面(がめん)では、①<b>どこに</b>（左(ひだり)で フォルダを えらぶ。フォルダは ダブルクリックで 中(なか)へ。↑ で 上(うえ)へ）②<b>どんな 名前(なまえ)で</b>（ファイル名(めい)の ところに 打(う)つ）を きめて「保存(ほぞん)」。<br>上(うえ)の 長(なが)い 文字(もじ)は 保存(ほぞん)場所(ばしょ)の <b>パス</b>。「フォルダの たんけん」で 学(まな)んだね。`]);
  add(2, '上書(うわが)き保存(ほぞん)', [
    `一度(いちど) 保存(ほぞん)した ファイルを なおした ときは「<b>上書(うわが)き保存(ほぞん)</b>」（${K('Ctrl')}＋${K('S')}）。同(おな)じ 場所(ばしょ)・同(おな)じ 名前(なまえ)に 新(あたら)しい 中身(なかみ)で 保存(ほぞん)する。<br>タイトルの さいしょの <b>*</b> は「まだ 保存(ほぞん)して いない 変更(へんこう)が ある」の しるし。`,
    `もとの ファイルも のこしたい ときは「名前(なまえ)を 付(つ)けて 保存(ほぞん)」で <b>べつの 名前(なまえ)</b>に する。<br>同(おな)じ 名前(なまえ)に 保存(ほぞん)すると「上書(うわが)きしますか？」と 聞(き)かれる。「はい」を おすと 前(まえ)の 中身(なかみ)は <b>消(き)える</b>。よく 読(よ)んでから おそう。`]);
  add(3, 'ファイルを 開(ひら)く', [
    `前(まえ)に 作(つく)った ファイルを つづける ときは「ファイル」→「<b>開(ひら)く</b>」（${K('Ctrl')}＋${K('O')}）。保存(ほぞん)した 場所(ばしょ)まで フォルダを たどって、ファイルを ダブルクリック。`,
    `ソフトに よって 開(ひら)ける ファイルの 種類(しゅるい)が きまって いる。メモちょうは ふつう <b>.txt</b> だけ 見(み)せる。「ファイルの 種類(しゅるい)」を「すべての ファイル」に すると、ほかの ファイルも 見(み)える。`]);
  add(4, '保存(ほぞん)しますか？', [
    `保存(ほぞん)して いない まま「新規(しんき)」や「開(ひら)く」を すると「<b>保存(ほぞん)しますか？</b>」と 聞(き)かれる。<br>「保存(ほぞん)する」＝のこす。「保存(ほぞん)しない」＝今(いま)の 変更(へんこう)を すてる。「キャンセル」＝もとに もどる。`,
    'まよったら「キャンセル」で もどって、よく 考(かんが)えよう。「保存(ほぞん)しない」を おすと、なおした ところは もどって こない。']);
  add(5, 'まとめ（保存(ほぞん)と 開(ひら)く）', ['これまでの まとめ。開(ひら)く → なおす → 上書(うわが)き保存(ほぞん) → べつの 場所(ばしょ)にも 保存(ほぞん)。', 'いつも「どこに・どんな 名前(なまえ)で」保存(ほぞん)したか、おぼえて おこう。']);
})();
