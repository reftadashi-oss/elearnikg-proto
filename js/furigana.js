// ふりがなの決まり（仕様書 9-1）
// 文は {漢字|よみ} の形で1回だけ書く。ことば単位で、ふりがなをつけるか決める。
// mode: 数字（子どもの学年）→ 前の学年までに習った字だけのことばは、ふりがななし
//       'all'  → 全部ふりがな（ログインする前の画面）
//       'none' → ふりがななし（先生・保護者の画面）
const Furigana = (() => {
  const gradeOf = {};
  KANJI_BY_GRADE.forEach((s, i) => { for (const c of s) gradeOf[c] = i + 1; });
  const isKanji = c => /[一-鿿々]/.test(c);
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // そのことばを、その学年の子がふりがななしで読めるか（前の学年までの字だけ）
  function learned(word, grade) {
    for (const c of word) {
      if (!isKanji(c)) continue;
      const g = gradeOf[c];
      if (!g || g >= grade) return false; // 配当表にない字・今の学年の字・まだの字
    }
    return true;
  }

  function render(text, mode) {
    let out = '', last = 0;
    const re = /\{([^|{}]+)\|([^{}]+)\}/g;
    let m;
    while ((m = re.exec(text))) {
      out += plain(text.slice(last, m.index), mode === 'none');
      const [, kan, yomi] = m;
      const ruby = mode === 'all' || (typeof mode === 'number' && !learned(kan, mode));
      out += ruby ? `<ruby>${esc(kan)}<rt>${esc(yomi)}</rt></ruby>` : esc(kan);
      last = re.lastIndex;
    }
    return out + plain(text.slice(last), mode === 'none');
  }

  // 文はプログラムの中に書いた決まった文だけ（子どもや保護者が書いた文は入れない）。
  // [[漢字]]＝漢検の答えになる字：ふりがなをつけず、線を引く。
  // 読み方のない漢字があれば知らせる（仕様書 9-1）
  // quiet＝先生・保護者の画面（ふりがなを つけない画面）では、注意を出さない
  function plain(s, quiet) {
    s = s.replace(/\[\[([^\]]+)\]\]/g, '<u class="target">$1</u>');
    if (quiet) return s;
    // <i class="nf">…</i>＝漢字の形そのものを見せるところ（部首の えらぶもの）。読み方は いらない
    const bare = s.replace(/<u class="target">[^<]*<\/u>/g, '').replace(/<i class="nf">[\s\S]*?<\/i>/g, '').replace(/<[^>]*>/g, '');
    if (/[一-鿿]/.test(bare)) console.warn('読み方のない漢字があります:', bare);
    return s;
  }

  // 学年の表示：「年」を習っていれば「4年」、1年生は「1ねん」
  function gradeLabel(grade, viewerGrade) {
    if (viewerGrade === 'none') return `${grade}年`;
    if (viewerGrade === 'all') return `${grade}ねん`;
    return learned('年', viewerGrade) ? `${grade}年` : `${grade}ねん`;
  }

  return { render, learned, gradeLabel, gradeOf };
})();
