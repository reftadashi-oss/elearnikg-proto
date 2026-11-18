// 音楽の 記号の 絵（SVG）。2026年11月18日。
// 𝄞（ト音記号）・𝄽（四分休符）などの 楽譜用の 文字は、スマホや パソコンに よっては 字が 入って いなくて 見えない（□に なる）。
// なので、ぜんぶ 線で かいた 絵に して、どの 機械でも 見えるように する。content_more.js・content_more2.js・lecture_more.js より 前に 読む。
const MSYM = (() => {
  const C = 'currentColor';
  const svg = (w, h, body, em = 1.6) => `<svg viewBox="0 0 ${w} ${h}" style="height:${em}em;width:auto;display:inline-block;vertical-align:middle" aria-hidden="true">${body}</svg>`;
  // 形（ほかの 図でも 使えるように、色と 位置を 引数に する）
  const G = (c, t = '') => `<path transform="${t}" d="M18 80 Q12 85 12.5 79 Q14 73 20 77 L22.5 14 Q24 3 29 8 Q32 17 19 32 Q6 46 13 58 Q20 67 28 60 Q33 52 24 47 Q15 45 15.5 54" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  const F = (c, t = '') => `<g transform="${t}"><circle cx="9" cy="20" r="3.8" fill="${c}"/><path d="M9 20 Q10 8 21 9 Q32 11 30 24 Q27 38 7 47" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/><circle cx="37" cy="15" r="2.6" fill="${c}"/><circle cx="37" cy="25" r="2.6" fill="${c}"/></g>`;
  const head = (x, y, c, open) => `<ellipse cx="${x}" cy="${y}" rx="6.5" ry="4.8" transform="rotate(-20 ${x} ${y})" fill="${open ? 'none' : c}" stroke="${c}" stroke-width="${open ? 2.2 : 1}"/>`;
  const q = (x, y, c, open) => head(x, y, c, open) + `<line x1="${x + 6}" y1="${y - 1}" x2="${x + 6}" y2="${y - 30}" stroke="${c}" stroke-width="1.8"/>`;
  const M = {
    gclef: svg(40, 90, G(C), 2.6),
    fclef: svg(42, 52, F(C), 1.8),
    whole: svg(26, 20, `<ellipse cx="13" cy="10" rx="10" ry="7" fill="none" stroke="${C}" stroke-width="3.5"/>`, 0.9),
    half: svg(22, 44, q(8, 36, C, true)),
    qrest: svg(20, 44, `<path d="M7 3 L14 13 Q8 19 11 25 L15 31 Q6 28 8 36 Q9 40 12 42" fill="none" stroke="${C}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`),
    erest: svg(20, 44, `<circle cx="7" cy="14" r="3.6" fill="${C}"/><path d="M7 16 Q12 18 16 12 L9 38" fill="none" stroke="${C}" stroke-width="2.4" stroke-linecap="round"/>`),
    fermata: svg(40, 26, `<path d="M4 22 A16 16 0 0 1 36 22" fill="none" stroke="${C}" stroke-width="2.6"/><circle cx="20" cy="19" r="2.8" fill="${C}"/>`, 1.3),
    repStart: svg(28, 44, `<rect x="2" y="2" width="5" height="40" fill="${C}"/><line x1="12" y1="2" x2="12" y2="42" stroke="${C}" stroke-width="1.6"/><circle cx="21" cy="17" r="2.8" fill="${C}"/><circle cx="21" cy="27" r="2.8" fill="${C}"/>`),
    repEnd: svg(28, 44, `<circle cx="7" cy="17" r="2.8" fill="${C}"/><circle cx="7" cy="27" r="2.8" fill="${C}"/><line x1="16" y1="2" x2="16" y2="42" stroke="${C}" stroke-width="1.6"/><rect x="21" y="2" width="5" height="40" fill="${C}"/>`),
    segno: svg(36, 40, `<path d="M25 10 Q19 3 12 7 Q6 13 14 19 Q25 24 22 31 Q18 38 10 32" fill="none" stroke="${C}" stroke-width="3" stroke-linecap="round"/><line x1="6" y1="37" x2="30" y2="3" stroke="${C}" stroke-width="2"/><circle cx="7" cy="23" r="2.6" fill="${C}"/><circle cx="29" cy="17" r="2.6" fill="${C}"/>`),
    coda: svg(40, 40, `<ellipse cx="20" cy="20" rx="10" ry="13" fill="none" stroke="${C}" stroke-width="2.6"/><line x1="20" y1="2" x2="20" y2="38" stroke="${C}" stroke-width="2"/><line x1="3" y1="20" x2="37" y2="20" stroke="${C}" stroke-width="2"/>`),
  };
  M.rep = M.repStart + ' ' + M.repEnd;
  M.G = G; // 五線の 図の 中で 使う（content_more.js の staff）
  // 楽譜の 図。hl に 名前を わたすと、その ところだけ 色を かえる（「楽譜の ことば」の 問題で 使う）
  M.score = (hl, w = 300) => {
    const H = '#f76707', c = k => (k === hl ? H : C);
    const ys = [30, 40, 50, 60, 70];
    const lines = ys.map(y => `<line x1="6" x2="292" y1="${y}" y2="${y}" stroke="${c('五線')}" stroke-width="${hl === '五線' ? 2.4 : 1.2}"/>`).join('');
    const clef = hl === 'ヘ音記号' ? F(c('ヘ音記号'), 'translate(12 21)') : G(c('ト音記号'), 'translate(6 5)');
    const time = `<text x="64" y="49" font-size="21" font-weight="bold" text-anchor="middle" font-family="serif" fill="${c('拍子記号')}">4</text><text x="64" y="69" font-size="21" font-weight="bold" text-anchor="middle" font-family="serif" fill="${c('拍子記号')}">4</text>`;
    const notes = [[95, 55], [120, 50], [145, 45], [170, 50], [205, 55], [230, 60]].map(([x, y]) => q(x, y, C)).join('');
    const bar = `<line x1="190" x2="190" y1="30" y2="70" stroke="${c('小節線')}" stroke-width="${hl === '小節線' ? 3 : 1.6}"/>`;
    const ledger = q(257, 80, C) + `<line x1="${hl === '加線' ? 239 : 247}" x2="${hl === '加線' ? 275 : 267}" y1="80" y2="80" stroke="${c('加線')}" stroke-width="${hl === '加線' ? 3.2 : 1.4}"/>`;
    const fin = `<line x1="282" x2="282" y1="30" y2="70" stroke="${c('終止線')}" stroke-width="${hl === '終止線' ? 2.4 : 1.4}"/><rect x="286" y="30" width="5" height="40" fill="${c('終止線')}"/>`;
    return `<svg viewBox="0 0 300 92" style="width:${w}px;max-width:100%;display:inline-block;vertical-align:middle" role="img" aria-label="楽譜">${lines}${clef}${time}${notes}${bar}${ledger}${fin}</svg>`;
  };
  return M;
})();
