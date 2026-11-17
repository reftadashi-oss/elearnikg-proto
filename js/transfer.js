// 記録の うつしかえ（試作品だけのしくみ。2026年11月17日）
// 試作品は 記録を その端末の ブラウザに しか 置かないので、スマホ・PC・先生の端末で 記録が つながらない。
// そこで、1人分の 記録を 文字（ROOT1: で始まる 長い文字）に して、LINE などで 送り、べつの端末で 貼りつけて 足す。
// ・まとめる 記録：Eラーニングの回、ルトの出入り、出席の日、すすみぐあいの調整、宿題の しめい、タイピング
// ・おなじ 記録は 2回 足さない（何回 貼りつけても 同じ）
// ・パスワードは 入れない。読みこむ 端末にも 同じ ユーザー名の 子が いること
// 本番は 教室の サーバーに 記録が 集まるので、このしくみは いらなくなる。
const Transfer = (() => {
  const TAG = 'ROOT1:';
  const b64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); };
  const unb64 = t => Uint8Array.from(atob(t), c => c.charCodeAt(0));
  const pipe = async (bytes, Stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new Stream('gzip'))).arrayBuffer());

  // 1人分を 取り出す
  // since（時刻）を わたすと、それより あとの 回・ルト・タイピングだけ（文字を 短くするため。LINEは 1回 5000文字まで）
  function pack(childId, since = '') {
    const S = Store.get(), c = S.users.find(u => u.id === childId), mine = r => r.child === childId && String(r.at || r.day || '') >= since;
    return {
      v: 1, username: c.username, name: c.name, exported: new Date().toISOString(),
      attempts: (S.attempts || []).filter(mine), ledger: (S.ledger || []).filter(mine),
      attendance: (S.attendance || {})[childId] || [], road: (S.road || {})[childId] || {},
      assigned: (S.assigned || []).filter(mine), typing: (S.typing || []).filter(mine),
    };
  }
  async function encode(childId, since) {
    const raw = new TextEncoder().encode(JSON.stringify(pack(childId, since)));
    if (window.CompressionStream) return TAG + 'z' + b64(await pipe(raw, CompressionStream));
    return TAG + 'p' + b64(raw);
  }
  async function decode(text) {
    const t = String(text || '').replace(/\s+/g, ''), i = t.indexOf(TAG);
    if (i < 0) throw new Error('「ROOT1:」で始まる 文字が 見つかりません');
    const kind = t[i + TAG.length];
    if (kind === 'z' && !window.DecompressionStream) throw new Error('このブラウザでは 読めません');
    let d;
    try { const body = unb64(t.slice(i + TAG.length + 1)); d = JSON.parse(new TextDecoder().decode(kind === 'z' ? await pipe(body, DecompressionStream) : body)); }
    catch (e) { throw new Error('文字が 途中で 切れているか、まちがっています。もう一度 コピーしてください'); }
    if (d.v !== 1 || !d.username) throw new Error('記録の 形が ちがいます');
    return d;
  }

  // 足す（おなじものは 足さない）。足した数を かえす
  function merge(d) {
    const S = Store.get(), c = S.users.find(u => u.role === 'child' && u.username === d.username);
    if (!c) throw new Error(`この端末に「${d.username}」の 子が いません`);
    const id = c.id, n = { attempts: 0, ledger: 0, days: 0, road: 0, other: 0 };
    S.attempts = S.attempts || []; S.ledger = S.ledger || [];
    // Eラーニングの回：時刻＋単元＋種類で 同じかを 見る。番号（id）は この端末で つけなおす
    const aKey = a => `${a.at}|${a.unit}|${a.kind}`, have = new Map(S.attempts.filter(a => a.child === id).map(a => [aKey(a), a.id])), idMap = {};
    for (const a of d.attempts || []) {
      const k = aKey(a);
      if (have.has(k)) { idMap[a.id] = have.get(k); continue; }
      const b = Object.assign({}, a, { child: id, id: 'a' + (S.seq++) });
      S.attempts.push(b); have.set(k, b.id); idMap[a.id] = b.id; n.attempts++;
    }
    S.attempts.sort((x, y) => x.at < y.at ? -1 : x.at > y.at ? 1 : 0);
    // ルトの出入り：時刻＋金額＋メモで 同じかを 見る
    const lKey = l => `${l.at}|${l.amount}|${l.memo || ''}`, lHave = new Set(S.ledger.filter(l => l.child === id).map(lKey));
    for (const l of d.ledger || []) {
      if (lHave.has(lKey(l))) continue;
      const m = Object.assign({}, l, { child: id }); if (l.attempt) m.attempt = idMap[l.attempt] || l.attempt;
      S.ledger.push(m); lHave.add(lKey(l)); n.ledger++;
    }
    // 出席の日
    S.attendance = S.attendance || {}; const days = new Set(S.attendance[id] || []);
    for (const day of d.attendance || []) if (!days.has(day)) { days.add(day); n.days++; }
    S.attendance[id] = [...days].sort();
    // すすみぐあいの調整：新しいほうを とる
    S.road = S.road || {}; const road = S.road[id] = S.road[id] || {};
    for (const [sid, o] of Object.entries(d.road || {})) if (!road[sid] || String(o.at || '') > String(road[sid].at || '')) { road[sid] = o; n.road++; }
    // 宿題の しめい・タイピング：中身が まったく同じなら 足さない
    for (const key of ['assigned', 'typing']) {
      S[key] = S[key] || []; const seen = new Set(S[key].filter(r => r.child === id).map(r => JSON.stringify(Object.assign({}, r, { child: 0 }))));
      for (const r of d[key] || []) { const s = JSON.stringify(Object.assign({}, r, { child: 0 })); if (!seen.has(s)) { S[key].push(Object.assign({}, r, { child: id })); seen.add(s); n.other++; } }
    }
    Store.save();
    return { child: c, n };
  }

  // ---- 画面 ----
  const box = () => document.getElementById('xferBox');
  function close() { const b = box(); if (b) b.remove(); }
  function open(html) {
    close(); const d = document.createElement('div'); d.id = 'xferBox';
    d.style.cssText = 'position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;';
    d.innerHTML = `<div style="background:#fff;color:#222;max-width:560px;width:100%;max-height:90vh;overflow:auto;border-radius:12px;padding:16px 18px;">${html}
      <p style="text-align:right;margin:12px 0 0"><button onclick="Transfer.close()">とじる</button></p></div>`;
    document.body.appendChild(d);
  }
  const ta = 'width:100%;box-sizing:border-box;height:120px;font-size:12px;word-break:break-all;';
  // さいごに コピーした 時刻（この端末に おぼえる）。つぎは それより あとの 分だけ 出す
  const LAST = 'root-elearning-xfer-last';
  const lastOf = id => { try { return (JSON.parse(localStorage.getItem(LAST) || '{}'))[id] || ''; } catch (e) { return ''; } };
  const setLast = (id, at) => { try { const o = JSON.parse(localStorage.getItem(LAST) || '{}'); o[id] = at; localStorage.setItem(LAST, JSON.stringify(o)); } catch (e) {} };
  let cur = null;
  async function showCopy(childId, all = false) {
    const S = Store.get(), c = S.users.find(u => u.id === childId), last = lastOf(childId);
    // 前の コピーと 1時間 かさねる（コピーしたのに 送りわすれた 回が もれないように。同じ 記録は 読みこむ側で 2回 足さない）
    const since = all || !last ? '' : new Date(new Date(last).getTime() - 3600e3).toISOString();
    const now = new Date().toISOString(), t = await encode(childId, since); cur = { childId, now, t, name: c.username };
    const kid = me && me.role === 'child', r = s => kid ? R(s) : s.replace(/\{([^|}]+)\|[^}]+\}/g, '$1');
    const when = since ? `${r('{前|まえ}に コピーした あとの {分|ぶん}だけ')}（${last.slice(5, 10).replace('-', '/')} ${new Date(last).toTimeString().slice(0, 5)}${r('から')}）<button onclick="Transfer.showCopy('${childId}',true)">${r('ぜんぶ {出|だ}す')}</button>` : r('ぜんぶの {記録|きろく}');
    open(`<h3 style="margin-top:0">${r('{記録|きろく}を コピー')}（${esc(c.name)}）</h3>
      <p class="note">${when}</p>
      <p class="note">${r('この {文字|もじ}を LINEなどで {先生|せんせい}に {送|おく}ってね。{先生|せんせい}が「{記録|きろく}を {読|よ}みこむ」に {貼|は}りつけると、{記録|きろく}が つながるよ。')}</p>
      <textarea id="xferOut" readonly style="${ta}">${t}</textarea>
      <p><button onclick="Transfer.copy()">${r('コピーする')}</button> <button onclick="Transfer.save()">${r('ファイルで {保存|ほぞん}')}</button> <span id="xferMsg" class="note">${t.length.toLocaleString()}${r('{文字|もじ}')}</span></p>
      ${t.length > 5000 ? `<p class="note" style="color:#c0392b">${r('{長|なが}いので LINEの {文|ぶん}に {入|はい}りきらないかも。そのときは「ファイルで {保存|ほぞん}」して、ファイルを {送|おく}ってね。')}</p>` : ''}`);
  }
  async function copy() {
    const el = document.getElementById('xferOut'), msg = document.getElementById('xferMsg');
    try { await navigator.clipboard.writeText(el.value); msg.textContent = 'コピーしました'; setLast(cur.childId, cur.now); }
    catch (e) { el.select(); try { document.execCommand('copy'); msg.textContent = 'コピーしました'; setLast(cur.childId, cur.now); } catch (e2) { msg.textContent = '文字を 長押しして コピーしてください'; } }
  }
  function save() {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([cur.t], { type: 'text/plain' }));
    a.download = `ROOT記録_${cur.name}_${cur.now.slice(0, 10)}.txt`; document.body.appendChild(a); a.click(); a.remove();
    setLast(cur.childId, cur.now); document.getElementById('xferMsg').textContent = 'ファイルに 保存しました';
  }
  async function pickFile(inp) { const f = inp.files[0]; if (f) document.getElementById('xferIn').value = await f.text(); }
  function showLoad(after) {
    loadAfter = after;
    open(`<h3 style="margin-top:0">記録を 読みこむ</h3>
      <p class="note">ほかの端末で「記録を コピー」した 文字（ROOT1: で始まる）を 貼りつけてください。同じ 記録は 2回 足しません。</p>
      <textarea id="xferIn" style="${ta}" placeholder="ROOT1:…"></textarea>
      <p class="note">ファイルで もらったときは：<input type="file" accept=".txt,text/plain" onchange="Transfer.pickFile(this)"></p>
      <p><button onclick="Transfer.load()">読みこむ</button></p><p id="xferMsg"></p>`);
  }
  let loadAfter = null;
  async function load() {
    const msg = document.getElementById('xferMsg');
    try {
      const { child, n } = merge(await decode(document.getElementById('xferIn').value));
      const total = n.attempts + n.ledger + n.days + n.road + n.other;
      msg.innerHTML = total ? `<b>${esc(child.name)}さんの 記録を 足しました</b>：Eラーニング ${n.attempts}回、ルト ${n.ledger}件、出席 ${n.days}日、すすみぐあい ${n.road}件、そのほか ${n.other}件`
        : `${esc(child.name)}さんの 記録は もう ぜんぶ 入っています（足すものは ありませんでした）`;
      if (loadAfter) loadAfter(child.id);
    } catch (e) { msg.innerHTML = `<span style="color:#c0392b">読みこめませんでした：${esc(e.message)}</span>`; }
  }
  return { pack, encode, decode, merge, showCopy, showLoad, copy, save, pickFile, load, close };
})();
