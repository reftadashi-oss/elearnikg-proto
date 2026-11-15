// 講義の「例題」に 途中式を つける（2026年11月12日）。
// 例題の 数字を 読みとって、プログラムが 途中式を 作る。さいごの 答えが 問題の 答えと ちがうときは 出さない（まちがった 途中式を 見せないため）。
// 文は Claude が 書いた 案（仮。先生が 確かめる）。文の 漢字は {漢字|よみ} の 形で 書く。
const Steps = (() => {
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const lcm = (a, b) => a / gcd(a, b) * b;
  const fr = (n, d) => `<span class="fr"><i>${n}</i><i>${d}</i></span>`;
  const mx = (w, n, d) => w ? `${w}${fr(n, d)}` : fr(n, d);
  const neg = n => n < 0 ? `（−${-n}）` : String(n);
  const nn = n => n < 0 ? `−${-n}` : String(n);
  const OPS = { '+': '＋', '-': '−', '*': '×', '/': '÷' };
  const HS = () => window.HS || {};

  // ---- 文を 読みやすい 形に（分数は ⟨整数|分子|分母⟩、ふりがな・タグは とる） ----
  function plain(html) {
    return String(html)
      .replace(/(\d+)?<span class="fr"><i>([^<]*)<\/i><i>([^<]*)<\/i><\/span>/g, (m, w, n, d) => ` ⟨${w || 0}|${n}|${d}⟩ `)
      .replace(/<sup>(\d)<\/sup>/g, '^$1').replace(/<[^>]+>/g, ' ')
      .replace(/\{([^|}]+)\|[^}]*\}/g, '$1').replace(/\[\[([^|\]]+)(\|[^\]]*)?\]\]/g, '$1')
      .replace(/[ 　]+/g, ' ').trim();
  }
  const num = s => Number(String(s).replace(/,/g, ''));

  // ================= 式を 1つずつ 計算する（整数・マイナス・（ ）） =================
  function tokens(s) {
    s = s.replace(/[＝=]\s*$/, '').replace(/[（(]\s*[−-]\s*(\d+)\s*[）)]/g, ' N$1 ');
    const t = [], re = /N(\d+)|(\d+)|([＋−×÷+\-*/])|([（(])|([）)])|(\S)/g; let m;
    while ((m = re.exec(s))) {
      if (m[1]) t.push(-num(m[1])); else if (m[2]) t.push(num(m[2]));
      else if (m[3]) t.push({ '＋': '+', '−': '-', '×': '*', '÷': '/' }[m[3]] || m[3]);
      else if (m[4]) t.push('('); else if (m[5]) t.push(')'); else return null;
    }
    // −12 の ように 先頭が マイナスの 数
    if (t[0] === '-' && typeof t[1] === 'number') t.splice(0, 2, -t[1]);
    return t.length ? t : null;
  }
  const show = t => t.map((x, i) => typeof x === 'number' ? (i === 0 && x < 0 ? nn(x) : neg(x)) : x === '(' ? '（' : x === ')' ? '）' : ` ${OPS[x]} `).join('').replace(/\s+/g, ' ').trim();
  const calc = (a, op, b) => op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : b && a % b === 0 ? a / b : NaN;
  function signNote(a, op, b) {
    if (op === '+' && b < 0) return `（＋${neg(b)} は −${-b} と おなじ）`;
    if (op === '-' && b < 0) return `（−${neg(b)} は ＋${-b} と おなじ）`;
    if ((op === '*' || op === '/') && (a < 0 || b < 0)) return a < 0 && b < 0 ? '（マイナス どうしは プラス）' : '（どちらかが マイナスなら、こたえも マイナス）';
    return '';
  }
  function evalSteps(t) {
    t = t.slice(); const lines = [];
    const nOps = x => x.filter(y => typeof y === 'string' && '+-*/'.includes(y)).length;
    if (nOps(t) === 0) return null;
    for (let guard = 0; guard < 20 && t.length > 1; guard++) {
      // いちばん 内がわの （ ）
      let L = -1, Rr = -1;
      for (let i = 0; i < t.length; i++) { if (t[i] === '(') L = i; if (t[i] === ')') { Rr = i; break; } }
      const lo = Rr > 0 ? L + 1 : 0, hi = Rr > 0 ? Rr : t.length, seg = t.slice(lo, hi);
      if (seg.length === 1 && Rr > 0) { t.splice(L, 3, seg[0]); continue; }
      let k = seg.findIndex(x => x === '*' || x === '/'), why = '';
      const mixed = seg.some(x => x === '+' || x === '-') && k >= 0;
      if (k < 0) k = seg.findIndex(x => x === '+' || x === '-');
      if (k < 1) return null;
      const a = seg[k - 1], op = seg[k], b = seg[k + 1], r = calc(a, op, b);
      if (typeof a !== 'number' || typeof b !== 'number' || !Number.isFinite(r)) return null;
      if (Rr > 0) why = '（ ）の {中|なか}を {先|さき}に：';
      else if (mixed) why = '× と ÷ を {先|さき}に：';
      else if (nOps(t) > 1) why = '{前|まえ}から じゅんに：';
      t.splice(lo + k - 1, 3, r);
      if (Rr > 0 && hi - lo === 3) t.splice(L, 3, r);   // （ ）の 中が 1つに なったら （ ）を とる
      lines.push(`${why}${neg(a)} ${OPS[op]} ${neg(b)} ＝ ${nn(r)} ${signNote(a, op, b)}${t.length > 1 ? `<br>→ ${show(t)}` : ''}`);
    }
    return t.length === 1 ? { lines, val: t[0] } : null;
  }

  // ================= たし算・ひき算・かけ算・わり算（2つの 数） =================
  const D = n => String(n).split('').map(Number);
  const PLACE = ['いち', 'じゅう', 'ひゃく', 'せん', '{一万|いちまん}'];
  function addSteps(a, b) {
    const s = a + b;
    if (b === 0 || a === 0) return { lines: ['0を たしても、{数|かず}は かわらないよ。'], val: s };
    if (a < 10 && b < 10) {
      const [x, y] = a >= b ? [a, b] : [b, a];
      if (s <= 10) return { lines: [`${a < b ? '{大|おお}きい ほうの ' : ''}${x}から、${y}つ かぞえる：${Array.from({ length: y }, (_, i) => x + i + 1).join('、')}`], val: s };
      const need = 10 - x, rest = y - need;
      return { lines: [`${x}は あと ${need}で 10。${y}を ${need}と ${rest}に わける`, `${x} ＋ ${need} ＝ 10`, `10 ＋ ${rest} ＝ ${s}`], val: s };
    }
    if (a % 10 === 0 && b % 10 === 0 && a < 1000 && b < 1000 && (a < 100 || b < 100)) return { lines: [`10の まとまりで かんがえる：10が ${a / 10}こと ${b / 10}こ`, `${a / 10} ＋ ${b / 10} ＝ ${s / 10} → 10が ${s / 10}こで ${s}`], val: s };
    if (a < 100 && (b < 10 || (b < 100 && b % 10 === 0)) && s <= 100) {
      const t = Math.floor(a / 10) * 10, o = a % 10;
      return b < 10 ? { lines: [`${a}を ${t}と ${o}に わける`, `いちの くらい：${o} ＋ ${b} ＝ ${o + b}`, `${t} ＋ ${o + b} ＝ ${s}`], val: s }
        : { lines: [`${a}を ${t}と ${o}に わける`, `じゅうの くらい：${t} ＋ ${b} ＝ ${t + b}`, `${t + b} ＋ ${o} ＝ ${s}`], val: s };
    }
    // 筆算
    const A = D(a).reverse(), B = D(b).reverse(), n = Math.max(A.length, B.length), lines = [];
    let c = 0;
    for (let i = 0; i < n; i++) {
      const x = A[i] || 0, y = B[i] || 0, d = x + y + c;
      lines.push(`${PLACE[i] || ''}の くらい：${x} ＋ ${y}${c ? ' ＋ 1（くりあがり）' : ''} ＝ ${d}${d >= 10 ? ` → ${d % 10}を {書|か}いて、1を くりあげる` : ''}`);
      c = d >= 10 ? 1 : 0;
    }
    if (c) lines.push(`くりあがった 1を ${PLACE[n] || ''}の くらいに {書|か}く`);
    return { lines, val: s, fig: HS().hsAdd ? HS().hsAdd(a, b) : '' };
  }
  function subSteps(a, b) {
    const s = a - b;
    if (s < 0) return null;
    if (b === 0) return { lines: ['0を ひいても、{数|かず}は かわらないよ。'], val: s };
    if (a === b) return { lines: ['おなじ {数|かず}を ひくと 0。'], val: s };
    if (a <= 10) return { lines: [`${a}から ${b}を ひく → のこりは ${s}`, `たしかめ：${s} ＋ ${b} ＝ ${a}`], val: s };
    if (a < 20 && b < 10 && a % 10 < b) {
      const o = a % 10;
      return { lines: [`${o}から ${b}は ひけない。${a}を 10と ${o}に わける`, `10 − ${b} ＝ ${10 - b}`, `${10 - b} ＋ ${o} ＝ ${s}`, `たしかめ：${s} ＋ ${b} ＝ ${a}`], val: s };
    }
    if (a < 20 && b < 10) return { lines: [`いちの くらい：${a % 10} − ${b} ＝ ${a % 10 - b}`, `10 ＋ ${a % 10 - b} ＝ ${s}`], val: s };
    if (a % 10 === 0 && b % 10 === 0 && a <= 1000 && b < 1000) return { lines: [`10の まとまりで かんがえる：10が ${a / 10}こ から ${b / 10}こ ひく`, `${a / 10} − ${b / 10} ＝ ${s / 10} → 10が ${s / 10}こで ${s}`], val: s };
    if (a < 100 && (b < 10 && a % 10 >= b || b % 10 === 0 && b < 100)) {
      const t = Math.floor(a / 10) * 10, o = a % 10;
      return b < 10 ? { lines: [`${a}を ${t}と ${o}に わける`, `いちの くらい：${o} − ${b} ＝ ${o - b}`, `${t} ＋ ${o - b} ＝ ${s}`], val: s }
        : { lines: [`${a}を ${t}と ${o}に わける`, `じゅうの くらい：${t} − ${b} ＝ ${t - b}`, `${t - b} ＋ ${o} ＝ ${s}`], val: s };
    }
    // 筆算（くりさがり）
    const W = D(a).reverse(), B = D(b).reverse(), lines = [];
    for (let i = 0; i < W.length; i++) {
      const y = B[i] || 0;
      if (i >= B.length && W.slice(i).every((v, j) => v === D(a).reverse()[i + j])) { lines.push(`${PLACE[i] || ''}の くらいから {上|うえ}は、そのまま {下|お}ろす`); break; }
      if (W[i] < y) {
        let j = i + 1; while (W[j] === 0) j++;
        const what = j === i + 1 ? `${PLACE[j]}の くらいから 1 かりる` : `${PLACE[j]}の くらいから 1 かりる（とちゅうの 0は 9に なる）`;
        W[j]--; for (let k = i + 1; k < j; k++) W[k] = 9; W[i] += 10;
        lines.push(`${PLACE[i]}の くらい：${W[i] - 10} − ${y}は ひけない → ${what} → ${W[i]} − ${y} ＝ ${W[i] - y}`);
      } else lines.push(`${PLACE[i]}の くらい：${W[i]} − ${y} ＝ ${W[i] - y}`);
    }
    lines.push(`たしかめ：${s} ＋ ${b} ＝ ${a}`);
    return { lines, val: s, fig: HS().hsSub ? HS().hsSub(a, b) : '' };
  }
  function mulSteps(a, b) {
    const p = a * b;
    if (a < 10 && b < 10) {
      if (b === 1 || a === 1) return { lines: [`1を かけても、1が かかっても、もとの {数|かず}の まま`], val: p };
      if (b <= 5) return { lines: [`${a} × ${b} は、${a}が ${b}こ`, `${Array(b).fill(a).join(' ＋ ')} ＝ ${p}`], val: p };
      return { lines: [`${a} × ${b - 1} ＝ ${a * (b - 1)}（${a}の {段|だん}の 1つ {前|まえ}）`, `かける {数|かず}が 1 {増|ふ}えると、こたえは ${a} {増|ふ}える`, `${a * (b - 1)} ＋ ${a} ＝ ${p}`], val: p };
    }
    // 0の ついた 数
    const tz = n => { let k = 0; while (n % 10 === 0 && n) { n /= 10; k++; } return [n, k]; };
    const [a1, ka] = tz(a), [b1, kb] = tz(b);
    if ((ka || kb) && a1 < 100 && b1 < 10 || (ka || kb) && a1 < 10 && b1 < 100) {
      const z = '0'.repeat(ka + kb);
      return { lines: [`0を とって {計算|けいさん}する：${a1} × ${b1} ＝ ${a1 * b1}`, `とった 0は ${ka + kb}こ。${a1 * b1}に 0を ${ka + kb}こ つける → ${a1 * b1}${z}`], val: p };
    }
    // 筆算
    if (b < 10) {
      const A = D(a).reverse(), lines = []; let c = 0;
      for (let i = 0; i < A.length; i++) {
        const d = A[i] * b + c;
        lines.push(`${PLACE[i]}の くらい：${A[i]} × ${b} ＝ ${A[i] * b}${c ? `、＋ ${c}（くりあがり）＝ ${d}` : ''}${i < A.length - 1 && d >= 10 ? ` → ${d % 10}を {書|か}いて、${Math.floor(d / 10)}を くりあげる` : ''}`);
        c = Math.floor(d / 10);
      }
      return { lines, val: p, fig: HS().hsMul ? HS().hsMul(a, b) : '' };
    }
    if (b < 100) {
      const o = b % 10, t = Math.floor(b / 10);
      return { lines: [`${a} × ${o} ＝ ${a * o}（${b}の いちの くらい）`, `${a} × ${t} ＝ ${a * t} → じゅうの くらいなので、1つ {左|ひだり}に ずらして ${a * t * 10}`, `${a * o} ＋ ${a * t * 10} ＝ ${p}`], val: p, fig: HS().hsMul ? HS().hsMul(a, b) : '' };
    }
    return null;
  }
  function divSteps(a, b, rem) {
    const q = Math.floor(a / b), r = a % b;
    if (r && !rem) return null;
    if (a < 100 && b < 10 && q < 10) {
      if (!r) return { lines: [`${b}の {段|だん}で、こたえが ${a}に なる ものを さがす`, `${b} × ${q} ＝ ${a} → こたえは ${q}`], val: [q] };
      return { lines: [`${b}の {段|だん}で、${a}を こえない いちばん {大|おお}きい {数|かず}を さがす`, `${b} × ${q} ＝ ${b * q}（${b} × ${q + 1} ＝ ${b * (q + 1)} だと こえて しまう）`, `あまり：${a} − ${b * q} ＝ ${r}`, `たしかめ：${b} × ${q} ＋ ${r} ＝ ${a}`], val: [q, r] };
    }
    // 何十・何百
    let k = 0, a1 = a; while (a1 % 10 === 0 && (a1 / 10) % b === 0 && a1 / 10 >= b && !r) { a1 /= 10; k++; }
    if (k && a1 / b < 10 && b < 10) return { lines: [`0を ${k}こ とって {考|かんが}える：${a1} ÷ ${b} ＝ ${a1 / b}`, `とった 0を つける → ${q}`], val: [q] };
    // 筆算（たてる・かける・ひく・おろす）
    const ds = D(a), lines = []; let cur = 0, started = false;
    for (let i = 0; i < ds.length; i++) {
      cur = cur * 10 + ds[i];
      if (!started && cur < b) continue;
      started = true;
      const t = Math.floor(cur / b), m = t * b;
      lines.push(`${cur} ÷ ${b} → ${t}を たてる。${b} × ${t} ＝ ${m}、${cur} − ${m} ＝ ${cur - m}${i < ds.length - 1 ? `、つぎの ${ds[i + 1]}を おろす` : ''}`);
      cur -= m;
    }
    lines.push(r ? `こたえ：${q} あまり ${r}<br>たしかめ：${b} × ${q} ＋ ${r} ＝ ${a}` : `たしかめ：${b} × ${q} ＝ ${a}`);
    return { lines, val: rem ? [q, r] : [q] };
  }
  function binSteps(a, op, b, rem) {
    if (op === '+') return addSteps(a, b);
    if (op === '-') return subSteps(a, b);
    if (op === '*') return mulSteps(a, b);
    if (op === '/') return divSteps(a, b, rem);
  }

  // ================= 小数 =================
  const decs = s => (String(s).split('.')[1] || '').length;
  const toInt = (s, p) => Math.round(Number(s) * 10 ** p);
  const fmtDec = (n, p) => { const neg_ = n < 0, s = String(Math.abs(n)).padStart(p + 1, '0'), i = s.slice(0, s.length - p), f = s.slice(s.length - p).replace(/0+$/, ''); return (neg_ ? '-' : '') + i + (f ? '.' + f : ''); };
  function decSteps(x, op, y) {
    const px = decs(x), py = decs(y);
    if (op === '+' || op === '-') {
      const p = Math.max(px, py), u = 10 ** -p, X = toInt(x, p), Y = toInt(y, p), R = op === '+' ? X + Y : X - Y;
      return { lines: [`${u}の いくつ{分|ぶん}で {考|かんが}える：${x}は ${u}が ${X}こ、${y}は ${u}が ${Y}こ`, `${X} ${OPS[op]} ${Y} ＝ ${R}`, `${u}が ${R}こで ${fmtDec(R, p)}`], val: fmtDec(R, p) };
    }
    if (op === '*') {
      const X = toInt(x, px), Y = toInt(y, py), p = px + py, R = X * Y;
      return { lines: [`{小数点|しょうすうてん}を ないものと して {計算|けいさん}：${X} × ${Y} ＝ ${R}`, `{小数点|しょうすうてん}の {下|した}の けたは、${px ? `${x}が ${px}けた` : ''}${px && py ? '、' : ''}${py ? `${y}が ${py}けた` : ''} → あわせて ${p}けた`, `${R}の {右|みぎ}から ${p}けたの ところに {小数点|しょうすうてん} → ${fmtDec(R, p)}`], val: fmtDec(R, p) };
    }
    if (op === '/') {
      if (py) {
        const k = 10 ** py, X = Math.round(Number(x) * k * 1e6) / 1e6, Y = Math.round(Number(y) * k);
        const sub = Number.isInteger(X) && X % Y === 0 ? `${X} ÷ ${Y} ＝ ${X / Y}` : null;
        return sub ? { lines: [`わる {数|かず}が {整数|せいすう}に なるように、{両方|りょうほう}を ${k}{倍|ばい}する`, `${x} ÷ ${y} → ${X} ÷ ${Y}`, sub], val: String(X / Y) } : null;
      }
      const X = toInt(x, px), Y = Number(y);
      if (X % Y) return null;
      return { lines: [`{小数点|しょうすうてん}を ないものと して {計算|けいさん}：${X} ÷ ${Y} ＝ ${X / Y}`, `{商|しょう}の {小数点|しょうすうてん}は、${x}の {小数点|しょうすうてん}に そろえる → ${fmtDec(X / Y, px)}`], val: fmtDec(X / Y, px) };
    }
  }

  // ================= 分数 =================
  const red = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
  const F = (n, d) => ({ n, d });
  function parseFracExpr(s) {
    // ⟨w|n|d⟩・整数・小数 と ＋−×÷ だけの 式
    s = s.replace(/[＝=]\s*$/, '').trim();
    const t = [], re = /⟨(\d+)\|(\d+)\|(\d+)⟩|(\d+\.\d+)|(\d+)|([＋−×÷])|(\S)/g; let m;
    while ((m = re.exec(s))) {
      if (m[1] !== undefined) t.push({ w: +m[1], n: +m[2], d: +m[3], kind: +m[1] ? 'mix' : 'fr' });
      else if (m[4]) t.push({ dec: m[4] }); else if (m[5]) t.push({ int: +m[5] });
      else if (m[6]) t.push({ '＋': '+', '−': '-', '×': '*', '÷': '/' }[m[6]]); else return null;
    }
    return t.length >= 3 && t.length % 2 === 1 ? t : null;
  }
  const fhtml = x => x.dec ? x.dec : x.int !== undefined ? String(x.int) : mx(x.w, x.n, x.d);
  function fracSteps(t, wantMixed) {
    const lines = [], vals = t.filter((_, i) => i % 2 === 0), ops = t.filter((_, i) => i % 2 === 1);
    const addOnly = ops.every(o => o === '+' || o === '-'), mulOnly = ops.every(o => o === '*' || o === '/');
    if (!addOnly && !mulOnly) return null;
    // 仮分数・小数を 分数に
    const F0 = vals.map(x => {
      if (x.dec) { const p = decs(x.dec), n = toInt(x.dec, p), d = 10 ** p, [a, b] = red(n, d); lines.push(`${x.dec} ＝ ${fr(n, d)}${a !== n ? ` ＝ ${fr(a, b)}` : ''}（{小数|しょうすう}を {分数|ぶんすう}に）`); return F(a, b); }
      if (x.int !== undefined) return F(x.int, 1);
      if (x.w) { const n = x.w * x.d + x.n; lines.push(`${mx(x.w, x.n, x.d)} ＝ ${fr(n, x.d)}（${x.w} × ${x.d} ＋ ${x.n} ＝ ${n}。{仮分数|かぶんすう}に）`); return F(n, x.d); }
      return F(x.n, x.d);
    });
    let r;
    if (addOnly) {
      const L = F0.reduce((a, f) => lcm(a, f.d), 1), same = F0.every(f => f.d === L);
      const G = F0.map(f => F(f.n * (L / f.d), L));
      if (!same) lines.push(`{分母|ぶんぼ}を ${F0.map(f => f.d).filter((d, i, a) => a.indexOf(d) === i).join('と ')}の {最小公倍数|さいしょうこうばいすう} ${L}に そろえる（{通分|つうぶん}）：${F0.map((f, i) => f.d === L ? '' : `${fr(f.n, f.d)} ＝ ${fr(G[i].n, L)}`).filter(Boolean).join('、')}`);
      let n = G[0].n; const parts = [String(G[0].n)];
      ops.forEach((o, i) => { n = o === '+' ? n + G[i + 1].n : n - G[i + 1].n; parts.push(`${OPS[o]} ${G[i + 1].n}`); });
      if (n < 0) return null;
      lines.push(`{分母|ぶんぼ}は ${L}の まま、{分子|ぶんし}を {計算|けいさん}：${parts.join(' ')} ＝ ${n} → ${fr(n, L)}`);
      r = F(n, L);
    } else {
      let cur = F0[0];
      ops.forEach((o, i) => {
        let b = F0[i + 1];
        if (o === '/') { lines.push(`わる {数|かず}を {逆数|ぎゃくすう}に して かける：÷ ${b.d === 1 ? b.n : fr(b.n, b.d)} → × ${fr(b.d, b.n)}`); b = F(b.d, b.n); }
        const n = cur.n * b.n, d = cur.d * b.d;
        lines.push(`{分子|ぶんし}どうし、{分母|ぶんぼ}どうしを かける：${fr(`${cur.n} × ${b.n}`, `${cur.d} × ${b.d}`)} ＝ ${fr(n, d)}`);
        cur = F(n, d);
      });
      r = cur;
    }
    const [a, b] = red(r.n, r.d);
    if (a !== r.n) lines.push(`{約分|やくぶん}：{分子|ぶんし}と {分母|ぶんぼ}を ${r.n / a}で わる → ${b === 1 ? a : fr(a, b)}`);
    if (wantMixed && a >= b && b > 1) { lines.push(`{帯分数|たいぶんすう}に：${a} ÷ ${b} ＝ ${Math.floor(a / b)} あまり ${a % b} → ${mx(Math.floor(a / b), a % b, b)}`); return { lines, val: [Math.floor(a / b), a % b, b] }; }
    return { lines, val: wantMixed ? [0, a, b] : [a, b] };
  }

  // ================= 単位 =================
  const U = {
    mm: ['l', 1], cm: ['l', 10], m: ['l', 1000], km: ['l', 1e6],
    mL: ['v', 1], dL: ['v', 100], L: ['v', 1000], 'cm^3': ['v', 1], 'm^3': ['v', 1e6],
    g: ['w', 1], kg: ['w', 1000], t: ['w', 1e6],
    'cm^2': ['a', 1], 'm^2': ['a', 1e4], a: ['a', 1e6], ha: ['a', 1e8], 'km^2': ['a', 1e10],
  };
  const uh = u => u.replace(/\^(\d)/, '<sup>$1</sup>');
  function unitSteps(s) {
    const m = s.match(/^(.*?)＝(.*)$/); if (!m) return null;
    const side = x => [...x.matchAll(/(\d+|□)\s*(km\^2|m\^2|cm\^2|m\^3|cm\^3|km|cm|mm|mL|dL|kg|ha|m|L|g|t|a)(?![a-zA-Z^])/g)].map(y => [y[1], y[2]]);
    const Lh = side(m[1]), Rh = side(m[2]);
    if (!Lh.length || Rh.length !== 1 || Rh[0][0] !== '□' || Lh.some(x => x[0] === '□')) return null;
    const to = Rh[0][1]; if (!U[to] || Lh.some(([, u]) => !U[u] || U[u][0] !== U[to][0])) return null;
    const lines = []; let tot = 0;
    for (const [v, u] of Lh) {
      const k = U[u][1] / U[to][1], n = Number(v);
      if (u === to) { tot += n; continue; }
      if (k >= 1) { lines.push(`1${uh(u)} ＝ ${k}${uh(to)} なので、${n}${uh(u)} ＝ ${n} × ${k} ＝ ${n * k}${uh(to)}`); tot += n * k; }
      else { const kk = Math.round(1 / k); if (n % kk) return null; lines.push(`${kk}${uh(u)} ＝ 1${uh(to)} なので、${n}${uh(u)} ＝ ${n} ÷ ${kk} ＝ ${n / kk}${uh(to)}`); tot += n / kk; }
    }
    if (Lh.length > 1) lines.push(`あわせて ${tot}${uh(to)}`);
    return lines.length ? { lines, val: tot } : null;
  }

  // ================= 文章題 など（パターンで 読む） =================
  const PAT = [
    // 植木算
    [/長さ (\d+)mの 道に、(\d+)mおきに 木を うえます。両はしにも/, ([L, d]) => { const n = L / d; return [[`{木|き}と {木|き}の あいだの {数|かず}：${L} ÷ ${d} ＝ ${n}`, `{両|りょう}はしにも うえるので、{木|き}は あいだより 1 {多|おお}い`, `${n} ＋ 1 ＝ ${n + 1}`], n + 1]; }],
    [/長さ (\d+)mの 道に、(\d+)mおきに 木を うえます。両はしには うえない/, ([L, d]) => { const n = L / d; return [[`{木|き}と {木|き}の あいだの {数|かず}：${L} ÷ ${d} ＝ ${n}`, `{両|りょう}はしには うえないので、{木|き}は あいだより 1 {少|すく}ない`, `${n} − 1 ＝ ${n - 1}`], n - 1]; }],
    [/まわりが (\d+)mの 池に、(\d+)mおきに/, ([L, d]) => [[`あいだの {数|かず}：${L} ÷ ${d} ＝ ${L / d}`, `{池|いけ}の まわりは ひとまわりして もどるので、{木|き}の {数|かず}と あいだの {数|かず}は おなじ → ${L / d}`], L / d]],
    // 和差算
    [/あわせて (\d+)こで、兄の ほうが (\d+)こ 多いです。(兄|弟)は/, ([S, d, w]) => w === '弟'
      ? [[`{兄|あに}の {多|おお}い ${d}こを ひくと、2{人|り}とも {弟|おとうと}と おなじ {数|かず}：${S} − ${d} ＝ ${S - d}`, `2{人|り}{分|ぶん}なので 2で わる：${S - d} ÷ 2 ＝ ${(S - d) / 2}`], (S - d) / 2]
      : [[`{弟|おとうと}に ${d}こ たすと、2{人|り}とも {兄|あに}と おなじ {数|かず}：${S} ＋ ${d} ＝ ${S + d}`, `2{人|り}{分|ぶん}なので 2で わる：${S + d} ÷ 2 ＝ ${(S + d) / 2}`], (S + d) / 2]],
    // 分配算
    [/あめ (\d+)こを 兄と 弟で わけます。兄は 弟の (\d+)倍より (\d+)こ 多く/, ([T, k, c]) => [[`{兄|あに}の {多|おお}い ${c}こを のぞく：${T} − ${c} ＝ ${T - c}`, `のこりは {弟|おとうと}の 1つ{分|ぶん}と {兄|あに}の ${k}つ{分|ぶん} → あわせて ${k + 1}つ{分|ぶん}`, `{弟|おとうと}（1つ{分|ぶん}）：${T - c} ÷ ${k + 1} ＝ ${(T - c) / (k + 1)}`], (T - c) / (k + 1)]],
    // 過不足算
    [/(\d+)こずつ くばると (\d+)こ あまり、(\d+)こずつ くばると (\d+)こ たりません。(子どもは|あめは)/, ([a, b, c, d, w]) => {
      const n = (b + d) / (c - a), L = [`1{人|り}に くばる {数|かず}の ちがい：${c} − ${a} ＝ ${c - a}`, `ぜんぶの ちがい：あまり ${b} ＋ たりない ${d} ＝ ${b + d}`, `{子|こ}どもの {数|かず}：${b + d} ÷ ${c - a} ＝ ${n}`];
      return w === 'あめは' ? [[...L, `あめの {数|かず}：${a} × ${n} ＋ ${b} ＝ ${a * n + b}`], a * n + b] : [L, n]; }],
    // 鶴亀算
    [/ツルと カメが あわせて (\d+)ひき、足は ぜんぶで (\d+)本です。(カメ|ツル)は/, ([T, Fo, w]) => {
      const k = (Fo - 2 * T) / 2, L = [`ぜんぶ ツルだと すると、{足|あし}は 2 × ${T} ＝ ${2 * T}{本|ほん}`, `ほんとうは ${Fo}{本|ほん}。たりない {足|あし}：${Fo} − ${2 * T} ＝ ${Fo - 2 * T}{本|ほん}`, `ツルを カメに かえると、{足|あし}は 1ぴきで 2{本|ほん} ふえる`, `カメ：${Fo - 2 * T} ÷ 2 ＝ ${k}ひき`];
      return w === 'ツル' ? [[...L, `ツル：${T} − ${k} ＝ ${T - k}ひき`], T - k] : [L, k]; }],
    // 年齢算
    [/お母さんは (\d+)さい、子どもは (\d+)さいです。□年後に、お母さんの 年は 子どもの (\d+)倍/, ([p, c, k]) => { const D_ = p - c, y = D_ / (k - 1); return [[`{年|とし}の {差|さ}は ずっと おなじ：${p} − ${c} ＝ ${D_}`, `${k}{倍|ばい}に なる とき、{差|さ}は {子|こ}どもの ${k - 1}つ{分|ぶん}`, `そのときの {子|こ}どもの {年|とし}：${D_} ÷ ${k - 1} ＝ ${y}`, `${y} − ${c} ＝ ${y - c}{年後|ねんご}`], y - c]; }],
    // 旅人算
    [/(\d+)mはなれた 2人が、分速 (\d+)mと 分速 (\d+)mで 向かい合って/, ([L, a, b]) => [[`1{分|ぷん}で ちかづく {長|なが}さ：${a} ＋ ${b} ＝ ${a + b}m`, `${L} ÷ ${a + b} ＝ ${L / (a + b)}{分|ふん}`], L / (a + b)]],
    [/(\d+)m 先を 分速 (\d+)mで 歩く 人を、分速 (\d+)mで 追いかけ/, ([L, lo, hi]) => [[`1{分|ぷん}で ちぢまる {長|なが}さ：${hi} − ${lo} ＝ ${hi - lo}m`, `${L} ÷ ${hi - lo} ＝ ${L / (hi - lo)}{分|ふん}`], L / (hi - lo)]],
    // 流水算
    [/時速 (\d+)kmの 船が、流れの 速さ 時速 (\d+)kmの 川を (\d+)km (のぼり|くだり)/, ([v, c, L, w]) => { const s = w === 'のぼり' ? v - c : v + c; return [[w === 'のぼり' ? `のぼりの {速|はや}さ ＝ {船|ふね} − {流|なが}れ：${v} − ${c} ＝ {時速|じそく} ${s}km` : `くだりの {速|はや}さ ＝ {船|ふね} ＋ {流|なが}れ：${v} ＋ ${c} ＝ {時速|じそく} ${s}km`, `${L} ÷ ${s} ＝ ${L / s}{時間|じかん}`], L / s]; }],
    // 仕事算
    [/Aさんは 1人で (\d+)日、Bさんは 1人で (\d+)日/, ([a, b]) => { const L = lcm(a, b), x = L / a, y = L / b; return [[`{仕事|しごと} ぜんぶを ${a}と ${b}の {最小公倍数|さいしょうこうばいすう} ${L}と {考|かんが}える`, `1{日|にち}に A：${L} ÷ ${a} ＝ ${x}、B：${L} ÷ ${b} ＝ ${y}`, `2{人|り}で 1{日|にち}に ${x} ＋ ${y} ＝ ${x + y}`, `${L} ÷ ${x + y} ＝ ${L / (x + y)}{日|にち}`], L / (x + y)]; }],
    // わり算の いみ
    [/(\d+)こを (\d+)人で おなじ かずずつ/, ([a, b]) => [[`${a} ÷ ${b}`, `${b}の {段|だん}で さがす：${b} × ${a / b} ＝ ${a}`], a / b]],
    [/(\d+)こを (\d+)こずつ わけると/, ([a, b]) => [[`${a} ÷ ${b}`, `${b}の {段|だん}で さがす：${b} × ${a / b} ＝ ${a}`], a / b]],
    // 数の しくみ
    [/^(\d+)は (\d+)と □$/, ([a, b]) => [[`${a} − ${b} ＝ ${a - b}`], a - b]],
    [/^(\d+)は、(10+)が □こ$/, ([a, b]) => [[`${a} ÷ ${b} ＝ ${a / b}`], a / b]],
    [/2進数の (\d+)は、ふつうの 数/, ([s]) => { const ds = String(s).split('').map(Number), n = ds.length, parts = ds.map((d, i) => d ? 2 ** (n - 1 - i) : 0).filter(Boolean); return [[`{右|みぎ}から 1・2・4・8・16 … の {位|くらい}`, `1が ある {位|くらい}を たす：${parts.join(' ＋ ')} ＝ ${parts.reduce((a, b) => a + b, 0)}`], parts.reduce((a, b) => a + b, 0)]; }],
    // 式
    [/^□ ([＋−×÷]) (\d+) ＝ (\d+)$/, ([o, a, c]) => { const inv = { '＋': ['−', c - a], '−': ['＋', c + a], '×': ['÷', c / a], '÷': ['×', c * a] }[o]; return [[`□ ＝ ${c} ${inv[0]} ${a}（${o === '＋' ? 'たし{算|ざん}の ぎゃくは ひき{算|ざん}' : o === '−' ? 'ひき{算|ざん}の ぎゃくは たし{算|ざん}' : o === '×' ? 'かけ{算|ざん}の ぎゃくは わり{算|ざん}' : 'わり{算|ざん}の ぎゃくは かけ{算|ざん}'}）`, `□ ＝ ${inv[1]}`], inv[1]]; }],
    [/^(\d+) × □ ＝ (\d+)$/, ([a, c]) => [[`${a}の {段|だん}で ${c}に なるのは ${a} × ${c / a}`, `□ ＝ ${c} ÷ ${a} ＝ ${c / a}`], c / a]],
    [/^x ([＋−×÷]) (\d+) ＝ (\d+) x ＝$/, ([o, a, c]) => { const inv = { '＋': ['−', c - a], '−': ['＋', c + a], '×': ['÷', c / a], '÷': ['×', c * a] }[o]; return [[`x ＝ ${c} ${inv[0]} ${a}`, `x ＝ ${inv[1]}`], inv[1]]; }],
    [/^(\d+) × x ([＋−]) (\d+) ＝ (\d+) x ＝$/, ([a, o, b, c]) => { const m = o === '＋' ? c - b : c + b; return [[`${a} × x ＝ ${c} ${o === '＋' ? '−' : '＋'} ${b} ＝ ${m}`, `x ＝ ${m} ÷ ${a} ＝ ${m / a}`], m / a]; }],
    [/^(\d+)x ＋ (\d+) ＝ (\d*)x ＋ (\d+) x ＝$/, ([a, b, c, d]) => { c = c === '' || Number.isNaN(c) ? 1 : c; return [[`x の ある {項|こう}を {左|ひだり}、{数|かず}を {右|みぎ}に あつめる（{移|うつ}すと ＋と − が かわる）`, `${a}x − ${c === 1 ? '' : c}x ＝ ${d} − ${b}`, `${a - c}x ＝ ${d - b}`, `x ＝ ${d - b} ÷ ${a - c} ＝ ${(d - b) / (a - c)}`], (d - b) / (a - c)]; }],
    [/^○ ＝ □ × (\d+) ＋ (\d+) です。□が (\d+)の とき、○は$/, ([a, b, x]) => [[`□に ${x}を いれる：${x} × ${a} ＋ ${b}`, `${x} × ${a} ＝ ${x * a}`, `${x * a} ＋ ${b} ＝ ${x * a + b}`], x * a + b]],
    [/^□が 1 増えると、○は (\d+) 増えます。□が 0の とき ○は (\d+)。□が (\d+)の とき、○は$/, ([a, b, x]) => [[`しきに すると ○ ＝ □ × ${a} ＋ ${b}`, `□に ${x}を いれる：${x} × ${a} ＝ ${x * a}`, `${x * a} ＋ ${b} ＝ ${x * a + b}`], x * a + b]],
    [/^○ ＝ □ ＋ (\d+) です。○が (\d+)の とき、□は$/, ([a, c]) => [[`□ ＝ ○ − ${a}`, `${c} − ${a} ＝ ${c - a}`], c - a]],
    // 割合・比・速さ
    [/^(\d+)、(.*) の 平均は$/, (_, s) => { const v = s.match(/^(.*) の 平均は$/)[1].split('、').map(Number), sum = v.reduce((a, b) => a + b, 0); return [[`ぜんぶ たす：${v.join(' ＋ ')} ＝ ${sum}`, `{個数|こすう}（${v.length}こ）で わる：${sum} ÷ ${v.length} ＝ ${sum / v.length}`], sum / v.length]; }],
    [/(\d+)(m|kg|L|本|こ)で (\d+)円の (.+)は、1\2あたり/, ([a, u, p]) => [[`1${u}あたりの ねだん ＝ ぜんぶの ねだん ÷ ${u === 'こ' || u === '本' ? 'かず' : 'りょう'}`, `${p} ÷ ${a} ＝ ${p / a}{円|えん}`], p / a]],
    [/時速 (\d+)kmで (\d+)時間 走ると、□km/, ([v, t]) => [[`{道|みち}のり ＝ {速|はや}さ × {時間|じかん}`, `${v} × ${t} ＝ ${v * t}km`], v * t]],
    [/(\d+)人の (\d+)%は □人/, ([n, p]) => [[`${p}% → ${p / 100}（%は 100で わる）`, `${n} × ${p / 100} ＝ ${Math.round(n * p) / 100}{人|にん}`], Math.round(n * p) / 100]],
    [/(\d+)こを (\d+)：(\d+)に わけると、(大きい|小さい) ほうは/, ([T, a, b, w]) => { const k = T / (a + b), m = w === '大きい' ? Math.max(a, b) : Math.min(a, b); return [[`{比|ひ}の {合計|ごうけい}：${a} ＋ ${b} ＝ ${a + b}`, `1つ{分|ぶん}：${T} ÷ ${a + b} ＝ ${k}`, `${m}つ{分|ぶん}：${k} × ${m} ＝ ${k * m}`], k * m]; }],
    [/^y ＝ (\d+) × x で、x ＝ (\d+)の とき y ＝$/, ([a, x]) => [[`x に ${x}を いれる：y ＝ ${a} × ${x}`, `y ＝ ${a * x}`], a * x]],
    [/^y ＝ (\d+) ÷ x で、x ＝ (\d+)の とき y ＝$/, ([a, x]) => [[`x に ${x}を いれる：y ＝ ${a} ÷ ${x}`, `y ＝ ${a / x}`], a / x]],
    [/反比例します。x ＝ (\d+)の とき y ＝ (\d+)。x ＝ (\d+)の とき y ＝/,([x1, y1, x2]) => [[`{反比例|はんぴれい}は x × y が いつも おなじ：${x1} × ${y1} ＝ ${x1 * y1}`, `y ＝ ${x1 * y1} ÷ ${x2} ＝ ${x1 * y1 / x2}`], x1 * y1 / x2]],
    [/−(\d+)より (\d+) (小さい|大きい) 数は/, ([a, c, w]) => w === '小さい' ? [[`−${a}から {左|ひだり}へ ${c}：−${a} − ${c} ＝ ${nn(-a - c)}`], -a - c] : [[`−${a}から {右|みぎ}へ ${c}：−${a} ＋ ${c} ＝ ${nn(c - a)}`], c - a]],
    // がい数・倍数
    [/^(\d+)を (一|十|百|千|一万)の位で 四捨五入すると$/, ([x, p]) => { const P = { '一': 1, '十': 10, '百': 100, '千': 1000, '一万': 10000 }[p], d = Math.floor(x / P) % 10, r = Math.floor((x + 5 * P) / (10 * P)) * 10 * P; return [[`{${p}|${{ '一': 'いち', '十': 'じゅう', '百': 'ひゃく', '千': 'せん', '一万': 'いちまん' }[p]}}の {位|くらい}の {数字|すうじ}は ${d}`, d >= 5 ? `5より {大|おお}きいか 5なので {切|き}り{上|あ}げ` : '4より {小|ちい}さいか 4なので {切|き}り{捨|す}て', `→ ${r}`], r]; }],
    [/^(\d+)と (\d+)の 最小公倍数は$/, ([a, b]) => { const L = lcm(a, b), M = x => Array.from({ length: Math.min(8, L / x + 1) }, (_, i) => x * (i + 1)).join('、'); return [[`${a}の {倍数|ばいすう}：${M(a)} …`, `${b}の {倍数|ばいすう}：${M(b)} …`, `いちばん {小|ちい}さい {共通|きょうつう}の {数|かず}は ${L}`], L]; }],
    [/^(\d+)と (\d+)の 最大公約数は$/, ([a, b]) => { const dv = n => Array.from({ length: n }, (_, i) => i + 1).filter(i => n % i === 0), g = gcd(a, b); return [[`${a}の {約数|やくすう}：${dv(a).join('、')}`, `${b}の {約数|やくすう}：${dv(b).join('、')}`, `いちばん {大|おお}きい {共通|きょうつう}の {数|かず}は ${g}`], g]; }],
    [/^(\d+)の 約数は、ぜんぶで □こ$/, ([n]) => { const dv = Array.from({ length: n }, (_, i) => i + 1).filter(i => n % i === 0); return [[`${n}を わりきれる {数|かず}：${dv.join('、')}`, `ぜんぶで ${dv.length}こ`], dv.length]; }],
    // 時間
    [/^(\d+)分は、何時間 何分？$/, ([m]) => [[`60{分|ぷん}で 1{時間|じかん}`, `${m} ÷ 60 ＝ ${Math.floor(m / 60)} あまり ${m % 60}`, `→ ${Math.floor(m / 60)}{時間|じかん}${m % 60}{分|ふん}`], [Math.floor(m / 60), m % 60]]],
    [/^(\d+)時(\d+)分の (\d+)分 (まえ|あと)は、何時 何分？$/, ([h, m, d, w]) => { const t = h * 60 + m + (w === 'あと' ? d : -d), H = ((Math.floor(t / 60) + 11) % 12) + 1, M = ((t % 60) + 60) % 60; return [[`${h}{時|じ}${m}{分|ふん}を {分|ふん}だけで あらわす：${h} × 60 ＋ ${m} ＝ ${h * 60 + m}{分|ふん}`, `${h * 60 + m} ${w === 'あと' ? '＋' : '−'} ${d} ＝ ${t}{分|ふん}`, `${t} ÷ 60 ＝ ${Math.floor(t / 60)} あまり ${M} → ${H}{時|じ}${M}{分|ふん}`], [H, M]]; }],
    // 何倍
    [/^□の (\d+)倍は (\d+)$/, ([k, n]) => [[`□ × ${k} ＝ ${n}`, `□ ＝ ${n} ÷ ${k} ＝ ${n / k}`], n / k]],
    [/^(\d+)は、(\d+)の □倍$/, ([a, b]) => [[`${a}が ${b}の {何倍|なんばい}か → ${a} ÷ ${b}`, `${a} ÷ ${b} ＝ ${a / b}`], a / b]],
    [/^(\d+)の (\d+)倍は$/, ([a, k]) => [[`${a}の ${k}{倍|ばい} → ${a} × ${k}`, `${a} × ${k} ＝ ${a * k}`], a * k]],
    // 数の しくみ（つづき）
    [/^10と (\d+)で □$/, ([b]) => [[`10と ${b}を あわせる：10 ＋ ${b} ＝ ${10 + b}`], 10 + b]],
    [/^10が (\d+)こで □$/, ([n]) => [[`10が ${n}こ：10 × ${n} ＝ ${10 * n}`], 10 * n]],
    [/^(\d+)は、10が □こと 1が (\d+)こ$/, ([a]) => [[`${a}の じゅうの くらいの {数字|すうじ}が、10の {数|かず}`, `${a} ＝ ${Math.floor(a / 10) * 10} ＋ ${a % 10} → 10が ${Math.floor(a / 10)}こ`], Math.floor(a / 10)]],
    [/^10が (\d+)こと 1が (\d+)こで □$/, ([t, o]) => [[`10が ${t}こで ${t * 10}`, `${t * 10} ＋ ${o} ＝ ${t * 10 + o}`], t * 10 + o]],
    [/^(10+)が (\d+)こと (10+)が (\d+)こで □$/, ([u1, a, u2, b]) => [[`${u1}が ${a}こで ${u1 * a}`, `${u2}が ${b}こで ${u2 * b}`, `${u1 * a} ＋ ${u2 * b} ＝ ${u1 * a + u2 * b}`], u1 * a + u2 * b]],
    [/^(10+)が (\d+)こで □$/, ([u, n]) => [[`${u} × ${n} ＝ ${u * n}`], u * n]],
    [/^([\d兆億万千]+)を 数字で 書くと$/, ([s]) => { const P = { '兆': 1e12, '億': 1e8, '万': 1e4, '千': 1e3 }, parts = [...String(s).matchAll(/(\d+)(兆|億|万|千)?/g)].filter(m => m[0]); let tot = 0; const L = parts.map(m => { const v = Number(m[1]) * (P[m[2]] || 1); tot += v; return `${m[0].replace(/兆|億|万|千/, x => `{${x}|${{ '兆': 'ちょう', '億': 'おく', '万': 'まん', '千': 'せん' }[x]}}`)} → ${v}`; }); return [[...L, `あわせて ${tot}`], tot]; }],
    [/^1億を (\d+)こ あつめた 数は □億$/, ([n]) => [[`1{億|おく}が ${n}こで ${n}{億|おく}`], n]],
    [/^(\d+)(兆|億)は、1億が □こ$/, ([n, u]) => u === '兆' ? [[`1{兆|ちょう}は 1{億|おく}が 10000こ`, `${n} × 10000 ＝ ${n * 10000}`], n * 10000] : [[`${n}{億|おく}は 1{億|おく}が ${n}こ`], n]],
    [/^(\d+)億を 10倍すると □億$/, ([n]) => [[`10{倍|ばい}すると 0が 1つ つく：${n} × 10 ＝ ${n * 10}`], n * 10]],
    [/^(\d+(?:\.\d+)?)を (10|100|1000)倍 ?すると$/, ([x, k], s) => { const z = String(k).length - 1, A = Math.round(Number(x) * k * 1000) / 1000; return [[`${k}{倍|ばい}は、{小数点|しょうすうてん}が {右|みぎ}へ ${z}つ うごく`, `${x} → ${A}`], A]; }],
    [/^(\d+(?:\.\d+)?)を (10|100|1000)分の1に すると$/, ([x, k]) => { const z = String(k).length - 1, A = Math.round(Number(x) / k * 1e6) / 1e6; return [[`${k}{分|ぶん}の1は、{小数点|しょうすうてん}が {左|ひだり}へ ${z}つ うごく`, `${x} → ${A}`], A]; }],
    [/^ふつうの 数 (\d+)を、2進数で 書くと$/, ([n]) => { const bits = n.toString(2), parts = [...bits].map((d, i) => d === '1' ? 2 ** (bits.length - 1 - i) : 0).filter(Boolean); return [[`${n}を 16・8・4・2・1 の あわせで あらわす：${n} ＝ ${parts.join(' ＋ ')}`, `つかう {位|くらい}は 1、つかわない {位|くらい}は 0 → ${bits}`], bits]; }],
    [/^0\.1が (\d+)こで □$/, ([n]) => [[`0.1が 10こで 1`, `${n}こ → ${n} ÷ 10 ＝ ${n / 10}`], n / 10]],
    [/^(\d+\.\d)は、0\.1が □こ$/, ([x]) => [[`1は 0.1が 10こ`, `${x} × 10 ＝ ${Math.round(x * 10)}`], Math.round(x * 10)]],
    // がい数（見つもり）
    [/^(\d+) ([＋−]) (\d+)を、それぞれ 百の位までの がい数に して/, ([a, o, b]) => { const r = x => Math.round(x / 100) * 100, v = o === '＋' ? r(a) + r(b) : r(a) - r(b); return [[`{十|じゅう}の {位|くらい}で {四捨五入|ししゃごにゅう}：${a} → ${r(a)}、${b} → ${r(b)}`, `${r(a)} ${o} ${r(b)} ＝ ${v}`], v]; }],
    [/^(\d+) × (\d+)を、それぞれ 上から 1けたの がい数に して/, ([a, b]) => { const r = x => { const p = 10 ** (String(x).length - 1); return Math.round(x / p) * p; }; return [[`{上|うえ}から 2けた{目|め}で {四捨五入|ししゃごにゅう}：${a} → ${r(a)}、${b} → ${r(b)}`, `${r(a)} × ${r(b)} ＝ ${r(a) * r(b)}`], r(a) * r(b)]; }],
    // 時間（つづき）
    [/^(\d+)分(\d+)秒 ＝ □秒$/, ([m, s]) => [[`1{分|ぷん}は 60{秒|びょう}：${m} × 60 ＝ ${m * 60}`, `${m * 60} ＋ ${s} ＝ ${m * 60 + s}{秒|びょう}`], m * 60 + s]],
    [/^(\d+)時間(\d+)分 ＝ □分$/, ([h, m]) => [[`1{時間|じかん}は 60{分|ぷん}：${h} × 60 ＝ ${h * 60}`, `${h * 60} ＋ ${m} ＝ ${h * 60 + m}{分|ふん}`], h * 60 + m]],
    [/^(\d+)秒は、何分 何秒？$/, ([s]) => [[`60{秒|びょう}で 1{分|ぷん}`, `${s} ÷ 60 ＝ ${Math.floor(s / 60)} あまり ${s % 60}`, `→ ${Math.floor(s / 60)}{分|ふん}${s % 60}{秒|びょう}`], [Math.floor(s / 60), s % 60]]],
    // 単位量あたり・速さ（つづき）
    [/^(\d+)人が (\d+)部屋に おなじ 人数ずつ います。1部屋あたり □人$/, ([p, r]) => [[`${p} ÷ ${r} ＝ ${p / r}{人|にん}`], p / r]],
    [/^1(m|L|kg|こ)あたり (\d+)円の (.+)を (\d+)\1 買うと □円$/, ([u, p, , n]) => [[`1${u}あたりの ねだん × ${u === 'こ' ? 'かず' : 'りょう'}`, `${p} × ${n} ＝ ${p * n}{円|えん}`], p * n]],
    [/^(\d+)Lで (\d+)km 走る 車は、1Lあたり □km$/, ([l, k]) => [[`${k} ÷ ${l} ＝ ${k / l}km`], k / l]],
    [/^(\d+)kmを (\d+)時間で 走る 車の 速さは、時速 □km$/, ([d, t]) => [[`{速|はや}さ ＝ {道|みち}のり ÷ {時間|じかん}`, `${d} ÷ ${t} ＝ ${d / t}`], d / t]],
    [/^(分速|時速|秒速) (\d+)(m|km)で (\d+)(分|時間|秒) (歩く|走る)と、□(m|km) 進む$/, ([w, v, , t]) => [[`{道|みち}のり ＝ {速|はや}さ × {時間|じかん}`, `${v} × ${t} ＝ ${v * t}`], v * t]],
    [/^(\d+)(km|m)を (時速|分速|秒速) (\d+)(km|m)で (走る|歩く)と、□(時間|分|秒) かかる$/, ([d, , , v]) => [[`{時間|じかん} ＝ {道|みち}のり ÷ {速|はや}さ`, `${d} ÷ ${v} ＝ ${d / v}`], d / v]],
    [/^(\d+(?:\.\d+)?)を 百分率で あらわすと □%$/, ([x]) => [[`{百分率|ひゃくぶんりつ}は 100{倍|ばい}する`, `${x} × 100 ＝ ${Math.round(x * 100)}`], Math.round(x * 100)]],
    [/^(\d+)%を 小数で あらわすと$/, ([p]) => [[`%は 100で わる`, `${p} ÷ 100 ＝ ${p / 100}`], p / 100]],
    [/^(\d+)割を 小数で あらわすと$/, ([p]) => [[`1{割|わり}は 0.1`, `${p} × 0.1 ＝ ${p / 10}`], p / 10]],
    [/y は x に 比例します。x ＝ (\d+)の とき y ＝ (\d+)。x ＝ (\d+)の とき y ＝/, ([x1, y1, x2]) => [[`{比例|ひれい}は y ÷ x が いつも おなじ：${y1} ÷ ${x1} ＝ ${y1 / x1}`, `y ＝ ${y1 / x1} × ${x2} ＝ ${y1 / x1 * x2}`], y1 / x1 * x2]],
    // 確率
    [/赤い 玉 (\d+)こ、白い 玉 (\d+)この 中から 1こ とると、赤い 玉の 確率は/, ([R0, W]) => { const [a, b] = red(R0, R0 + W); return [[`ぜんぶで ${R0} ＋ ${W} ＝ ${R0 + W}こ、{赤|あか}は ${R0}こ`, `${fr(R0, R0 + W)}${a !== R0 ? ` ＝ ${fr(a, b)}（{約分|やくぶん}）` : ''}`], [a, b]]; }],
    [/さいころを 1回 ふって、(.+)の 目が 出る 確率は/, ([nm]) => {
      nm = String(nm); const T = { '偶数': [2, 4, 6], '奇数': [1, 3, 5], '3の 倍数': [3, 6], '2の 倍数': [2, 4, 6] };
      let m, hit = T[nm]; if (!hit && (m = nm.match(/^(\d)以下$/))) hit = [1, 2, 3, 4, 5, 6].filter(x => x <= +m[1]); if (!hit && (m = nm.match(/^(\d)以上$/))) hit = [1, 2, 3, 4, 5, 6].filter(x => x >= +m[1]); if (!hit && (m = nm.match(/^(\d)$/))) hit = [+m[1]];
      if (!hit) return null; const [a, b] = red(hit.length, 6);
      return [[`さいころの {目|め}は ぜんぶで 6{通|とお}り`, `あてはまる {目|め}：${hit.join('・')} の ${hit.length}{通|とお}り`, `${fr(hit.length, 6)}${a !== hit.length ? ` ＝ ${fr(a, b)}（{約分|やくぶん}）` : ''}`], [a, b]]; }],
    [/コインを 2回 なげて、2回とも 表が 出る 確率は/, () => [[`{出方|でかた}は {表表|おもておもて}・{表裏|おもてうら}・{裏表|うらおもて}・{裏裏|うらうら}の 4{通|とお}り`, `2{回|かい}とも {表|おもて}は 1{通|とお}り → ${fr(1, 4)}`], [1, 4]]],
  ];
  function patSteps(s, q) {
    for (const [re, f] of PAT) {
      const m = s.match(re); if (!m) continue;
      const args = m.slice(1).map(x => x !== undefined && /^\d+$/.test(x) ? Number(x) : x);
      const r = f(args, s); if (!r) continue;
      const v = Array.isArray(r[1]) ? r[1] : [r[1]];
      return { lines: r[0], val: v };
    }
    return null;
  }

  // ================= 単元ごとに えらぶ =================
  function build(uid, q) {
    if (Array.isArray(q.steps) && q.steps.length) return { lines: q.steps, val: q.answer };   // 問題を 作るときに 途中式も 作った もの（図形など）
    const s = plain(q.text), A = q.answer.map(String);
    const isMath = /^m\d/.test(uid);
    if (!isMath) return null;
    let r = patSteps(s, q);
    if (r) return r;
    // えらぶ 問題（番号で こたえる）
    const cq = s.match(/^(.*?)？ (.*)$/);
    if (cq) {
      const stem = cq[1], opts = [...cq[2].matchAll(/(\d) (\S+)/g)].map(m => m[2]), at = f => { const i = opts.findIndex(f); return i < 0 ? null : i + 1; };
      const fv = o => { const m = o.match(/^⟨(\d+)\|(\d+)\|(\d+)⟩$/); return m ? (+m[1] + m[2] / m[3]) : Number(o.replace('−', '-')); };
      let m, i;
      if ((m = stem.match(/^(\d+)の 倍数は どれ$/)) && (i = at(o => +o % +m[1] === 0))) return { lines: [`${m[1]}の {倍数|ばいすう}は、${m[1]}で わりきれる {数|かず}`, ...opts.map(o => `${o} ÷ ${m[1]} ＝ ${Math.floor(o / m[1])}${o % m[1] ? ` あまり ${o % m[1]}` : ' → わりきれる'}`)], val: [i] };
      if ((m = stem.match(/^(\d+)の 約数は どれ$/)) && (i = at(o => +m[1] % +o === 0))) return { lines: [`${m[1]}の {約数|やくすう}は、${m[1]}を わりきれる {数|かず}`, ...opts.map(o => `${m[1]} ÷ ${o} ＝ ${Math.floor(m[1] / o)}${m[1] % o ? ` あまり ${m[1] % o}` : ' → わりきれる'}`)], val: [i] };
      if ((m = stem.match(/^(\d+)は どっち$/))) { const ev = +m[1] % 2 === 0; return { lines: [`いちの {位|くらい}を {見|み}る：${m[1] % 10}`, ev ? '0・2・4・6・8 なら {偶数|ぐうすう}' : '1・3・5・7・9 なら {奇数|きすう}'], val: [at(o => o === (ev ? '偶数' : '奇数'))] }; }
      if (/^どちらが 大きい$/.test(stem) && opts.length === 2) {
        const [a, b] = opts.map(fv); if (a === b || Number.isNaN(a) || Number.isNaN(b)) return null;
        const big = a > b ? 1 : 2, isF = opts.every(o => o.startsWith('⟨'));
        if (isF) { const P = opts.map(o => o.match(/⟨\d+\|(\d+)\|(\d+)⟩/)).map(x => [+x[1], +x[2]]); const L = lcm(P[0][1], P[1][1]); return { lines: [P[0][1] === P[1][1] ? `{分母|ぶんぼ}が おなじなので、{分子|ぶんし}が {大|おお}きい ほうが {大|おお}きい` : `{分母|ぶんぼ}を ${L}に そろえる：${fr(P[0][0], P[0][1])} ＝ ${fr(P[0][0] * L / P[0][1], L)}、${fr(P[1][0], P[1][1])} ＝ ${fr(P[1][0] * L / P[1][1], L)}`, `→ ${big}の ほうが {大|おお}きい`], val: [big] }; }
        return { lines: [`{数直線|すうちょくせん}では、{右|みぎ}に ある ほうが {大|おお}きい`, a < 0 && b < 0 ? `マイナスどうしは、0に {近|ちか}い ほうが {大|おお}きい → ${opts[big - 1]}` : `→ ${opts[big - 1]}`], val: [big] };
      }
      if ((m = stem.match(/^(\d+) × (\d+(?:\.\d+)?)の こたえは、(\d+)より$/))) { const k = Number(m[2]), w = k > 1 ? '大きい' : '小さい'; return { lines: [`かける {数|かず} ${m[2]}は 1より ${k > 1 ? '{大|おお}きい' : '{小|ちい}さい'}`, `1より ${k > 1 ? '{大|おお}きい {数|かず}を かけると {大|おお}きく' : '{小|ちい}さい {数|かず}を かけると {小|ちい}さく'} なる`], val: [at(o => o === w)] }; }
    }
    if (/^m13-(4|5|6|9|10)$/.test(uid)) return unitSteps(s);
    // 分数の 式
    if (s.includes('⟨') && /[＝]\s*$/.test(s)) { const t = parseFracExpr(s); if (t) return fracSteps(t, q.boxes.length === 3); }
    // 分数の しくみ
    let m;
    if ((m = s.match(/^⟨0\|(\d+)\|(\d+)⟩ が (\d+)こで$/))) return { lines: [`${fr(m[1], m[2])}が ${m[3]}こで、{分子|ぶんし}は ${m[1]} × ${m[3]} ＝ ${m[1] * m[3]}`, `{分母|ぶんぼ}は ${m[2]}の まま → ${fr(m[1] * m[3], m[2])}`], val: [String(m[1] * m[3]), m[2]] };
    if ((m = s.match(/^⟨(\d+)\|(\d+)\|(\d+)⟩ を 仮分数に すると$/)) && +m[1]) { const [w, n, d] = m.slice(1).map(Number); return { lines: [`{整数|せいすう}の ${w}は ${fr(w * d, d)}（${w} × ${d} ＝ ${w * d}）`, `${w * d} ＋ ${n} ＝ ${w * d + n} → ${fr(w * d + n, d)}`], val: [w * d + n, d] }; }
    if ((m = s.match(/^⟨0\|(\d+)\|(\d+)⟩ を 帯分数に すると$/))) { const [n, d] = m.slice(1).map(Number); return { lines: [`${n} ÷ ${d} ＝ ${Math.floor(n / d)} あまり ${n % d}`, `{整数|せいすう}が ${Math.floor(n / d)}、{分子|ぶんし}が ${n % d} → ${mx(Math.floor(n / d), n % d, d)}`], val: [Math.floor(n / d), n % d, d] }; }
    if ((m = s.match(/^⟨0\|(\d+)\|(\d+)⟩ は、 ?⟨0\|1\|(\d+)⟩ の □こ分$/))) return { lines: [`${fr(1, m[2])}が いくつ{分|ぶん}かは、{分子|ぶんし}を {見|み}る`, `${fr(m[1], m[2])}は ${fr(1, m[2])}が ${m[1]}こ`], val: [m[1]] };
    if ((m = s.match(/^⟨0\|(\d+)\|(\d+)⟩ を 約分すると$/))) { const g = gcd(+m[1], +m[2]); return { lines: [`${m[1]}と ${m[2]}の {最大公約数|さいだいこうやくすう}は ${g}`, `{分子|ぶんし}も {分母|ぶんぼ}も ${g}で わる：${m[1]} ÷ ${g} ＝ ${m[1] / g}、${m[2]} ÷ ${g} ＝ ${m[2] / g}`], val: [m[1] / g, m[2] / g] }; }
    if ((m = s.match(/^⟨0\|(\d+)\|(\d+)⟩ を 小数で あらわすと$/))) { const v = Math.round(m[1] / m[2] * 1e6) / 1e6; return { lines: [`{分数|ぶんすう}は {分子|ぶんし} ÷ {分母|ぶんぼ}`, `${m[1]} ÷ ${m[2]} ＝ ${v}`], val: [v] }; }
    if ((m = s.match(/^(\d+\.\d+)を 分数で あらわすと$/))) { const p = decs(m[1]), n = toInt(m[1], p), d = 10 ** p, [a, b] = red(n, d); return { lines: [`${1 / d}が ${n}こ → ${fr(n, d)}`, ...(a !== n ? [`{約分|やくぶん}：${fr(a, b)}`] : [])], val: [a, b] }; }
    if ((m = s.match(/^(\d+) ÷ (\d+)を 分数で あらわすと$/))) return { lines: [`わられる {数|かず}が {分子|ぶんし}、わる {数|かず}が {分母|ぶんぼ}`, `${m[1]} ÷ ${m[2]} ＝ ${fr(m[1], m[2])}`], val: [m[1], m[2]] };
    if ((m = s.match(/^⟨0\|(\d+)\|(\d+)⟩ と ⟨0\|(\d+)\|(\d+)⟩ を 通分すると、分母は □$/))) { const a = +m[2], b = +m[4], L = lcm(a, b), M = x => Array.from({ length: L / x }, (_, i) => x * (i + 1)).join('、'); return { lines: [`${a}の {倍数|ばいすう}：${M(a)}`, `${b}の {倍数|ばいすう}：${M(b)}`, `いちばん {小|ちい}さい {共通|きょうつう}の {数|かず} → ${L}`], val: [L] }; }
    if ((m = s.match(/^⟨0\|(\d+)\|(\d+)⟩ の 逆数は$/))) return { lines: [`{分子|ぶんし}と {分母|ぶんぼ}を いれかえる → ${fr(m[2], m[1])}`], val: [m[2], m[1]] };
    if ((m = s.match(/^(\d+)の 逆数は$/))) return { lines: [`${m[1]} ＝ ${fr(m[1], 1)} と {考|かんが}える`, `いれかえて ${fr(1, m[1])}`], val: ['1', m[1]] };
    if ((m = s.match(/^(\d+)：(\d+)の 比の 値は$/))) { const [a, b] = red(+m[1], +m[2]); return { lines: [`{比|ひ}の {値|あたい} ＝ {前|まえ}の {数|かず} ÷ {後|うし}ろの {数|かず}`, `${m[1]} ÷ ${m[2]} ＝ ${fr(m[1], m[2])}${a !== +m[1] ? ` ＝ ${fr(a, b)}` : ''}`], val: [a, b] }; }
    if ((m = s.match(/^(\d+)：(\d+)を かんたんな 比に すると$/))) { const g = gcd(+m[1], +m[2]); return { lines: [`${m[1]}と ${m[2]}を どちらも ${g}で わる`, `${m[1]} ÷ ${g} ＝ ${m[1] / g}、${m[2]} ÷ ${g} ＝ ${m[2] / g}`], val: [m[1] / g, m[2] / g] }; }
    if ((m = s.match(/^x ＝ (\d+)の とき、(.+) の 値は$/))) { const t = tokens(m[2].replace(/x/g, ` ${m[1]} `)); const e = t && evalSteps(t); if (e) return { lines: [`x に ${m[1]}を いれる：${show(t)}`, ...e.lines], val: [e.val] }; }
    // 小数の 計算
    if ((m = s.match(/^(\d+(?:\.\d+)?) ([＋−×÷]) (\d+(?:\.\d+)?) ＝$/)) && (m[1].includes('.') || m[3].includes('.'))) {
      const op = { '＋': '+', '−': '-', '×': '*', '÷': '/' }[m[2]], d = decSteps(m[1], op, m[3]); return d && { lines: d.lines, val: [d.val] };
    }
    if ((m = s.match(/^(\d+\.\d+)を (10|100|1000)倍 すると$|^(\d+\.\d+)を (10|100|1000)分の1に すると$/))) {
      const up = !!m[1], x = m[1] || m[3], k = +(m[2] || m[4]), z = String(k).length - 1;
      return { lines: [`${up ? `${k}{倍|ばい}` : `${k}{分|ぶん}の1`}は、{小数点|しょうすうてん}が ${up ? '{右|みぎ}' : '{左|ひだり}'}へ ${z}つ うごく`, `${x} → ${A[0]}`], val: [A[0]] };
    }
    // 整数の 式
    const t = tokens(s);
    if (t) {
      const nums = t.filter(x => typeof x === 'number'), ops = t.filter(x => typeof x === 'string' && '+-*/'.includes(x));
      if (ops.length === 1 && nums.length === 2 && !t.includes('(') && nums.every(x => x >= 0)) {
        const b = binSteps(nums[0], ops[0], nums[1], q.boxes.length === 2);
        if (b) return { lines: b.lines, val: Array.isArray(b.val) ? b.val : [b.val], fig: b.fig };
      }
      const e = evalSteps(t);
      if (e) return { lines: e.lines, val: [e.val] };
    }
    return null;
  }
  const same = (v, A) => v.length === A.length && v.every((x, i) => String(x) === String(A[i]) || Number(x) === Number(A[i]));
  // 途中式の HTML。作れない・答えが あわない ときは ''
  function html(uid, q) {
    let r = null;
    try { r = build(uid, q); } catch (e) { r = null; }
    if (!r || !r.lines || !r.lines.length || r.val === undefined) return '';
    const v = (Array.isArray(r.val) ? r.val : [r.val]).map(String), A = q.answer.map(String);
    const ok = same(v, A) || (v.length === 3 && v[0] === '0' && same(v.slice(1), A)) || (A.length === 3 && A[0] === '0' && same(v, A.slice(1)));
    if (!ok) return '';
    return `<div class="lbox wk"><b>とちゅうの しき</b>${r.fig ? `<div style="margin:6px 0">${r.fig}</div>` : ''}<ol class="steps">${r.lines.map(l => `<li>${l}</li>`).join('')}</ol></div>`;
  }
  return { html, build, plain };
})();
