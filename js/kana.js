// 答えの入れ方（仕様書 4-9）
// ・3年生の3月まで（試作品では1・2年生）：画面のひらがなボタン
// ・3年生から：ローマ字で打つ。画面の中でひらがなに直す（漢字変換は使わない）。訓令式・ヘボン式どちらも正解
const Kana = (() => {
  const T = {
    a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
    ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ', ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
    sa: 'さ', si: 'し', shi: 'し', su: 'す', se: 'せ', so: 'そ', za: 'ざ', zi: 'じ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
    ta: 'た', ti: 'ち', chi: 'ち', tu: 'つ', tsu: 'つ', te: 'て', to: 'と', da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
    na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の', ha: 'は', hi: 'ひ', hu: 'ふ', fu: 'ふ', he: 'へ', ho: 'ほ',
    ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ', pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
    ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も', ya: 'や', yu: 'ゆ', yo: 'よ',
    ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ', wa: 'わ', wo: 'を', nn: 'ん', "n'": 'ん', '-': 'ー',
    xa: 'ぁ', xi: 'ぃ', xu: 'ぅ', xe: 'ぇ', xo: 'ぉ', xya: 'ゃ', xyu: 'ゅ', xyo: 'ょ', xtu: 'っ', ltu: 'っ', la: 'ぁ', li: 'ぃ', lu: 'ぅ', le: 'ぇ', lo: 'ぉ', lya: 'ゃ', lyu: 'ゅ', lyo: 'ょ',
    sha: 'しゃ', shu: 'しゅ', sho: 'しょ', cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ', ja: 'じゃ', ju: 'じゅ', jo: 'じょ',
    fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ',
  };
  'k:き,s:し,t:ち,n:に,h:ひ,m:み,r:り,g:ぎ,z:じ,b:び,p:ぴ,j:じ,d:ぢ'.split(',').forEach(p => {
    const [c, k] = p.split(':');
    T[c + 'ya'] = k + 'ゃ'; T[c + 'yu'] = k + 'ゅ'; T[c + 'yo'] = k + 'ょ';
  });

  // ローマ字→ひらがな。直せない残りは、ローマ字のまま後ろに残す
  function toHira(src) {
    let s = src.toLowerCase(), out = '';
    while (s.length) {
      if (s[0] === 'n' && s.length >= 2 && !'aiueoyn\''.includes(s[1])) { out += 'ん'; s = s.slice(1); continue; }
      if (s.length >= 2 && s[0] === s[1] && /[bcdfghjkmprstvwz]/.test(s[0])) { out += 'っ'; s = s.slice(1); continue; }
      let hit = false;
      for (let l = 3; l >= 1; l--) { const k = s.slice(0, l); if (T[k]) { out += T[k]; s = s.slice(l); hit = true; break; } }
      if (!hit) { if (/^[a-z]+$/.test(s) && s.length <= 2) break; out += s[0]; s = s.slice(1); }
    }
    return { kana: out, rest: s };
  }
  // 答え合わせのとき：最後の n も ん にする
  const finish = src => { const r = toHira(src); return r.kana + (r.rest === 'n' ? 'ん' : r.rest); };

  // ひらがなボタンの並び
  const ROWS = ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの', 'はひふへほ', 'まみむめも', 'や ゆ よ', 'らりるれろ', 'わ を ん', 'ゃゅょっー'];
  const DAKU = { か: 'が', き: 'ぎ', く: 'ぐ', け: 'げ', こ: 'ご', さ: 'ざ', し: 'じ', す: 'ず', せ: 'ぜ', そ: 'ぞ', た: 'だ', ち: 'ぢ', つ: 'づ', て: 'で', と: 'ど', は: 'ば', ひ: 'び', ふ: 'ぶ', へ: 'べ', ほ: 'ぼ' };
  const HANDAKU = { は: 'ぱ', ひ: 'ぴ', ふ: 'ぷ', へ: 'ぺ', ほ: 'ぽ' };

  return { toHira, finish, ROWS, DAKU, HANDAKU, T };
})();
