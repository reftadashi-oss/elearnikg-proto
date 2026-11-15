// 英語 中1（文法）と、英検5級の 形の 問題（2026年11月15日）。content_more2.js の あと、review.js の 前に 読む。
// 文法の 項目は 中学校学習指導要領（平成29年告示）外国語の「文、文構造及び文法事項」から。学年の 分け方は Claude の めやす（教科書で ちがう。仮）。
// 英検5級の 形：日本英語検定協会「5級の試験内容」（https://www.eiken.or.jp/eiken/exam/grade_5/solutions.html）の リーディング
//   短文の語句空所補充 15問・会話文の文空所補充 5問・日本文付き短文の語句整序 5問（4つから えらぶ）。リスニングは 音声が 未決なので 入れていない。
// 問題は ぜんぶ Claude が 新しく 作った（過去問・本からは 写していない）。文・講義は 仮（先生が 確かめる）。英検®は 日本英語検定協会の 登録商標。
(() => {
  const pick = a => a[rand(0, a.length - 1)];
  const F = s => typeof s !== 'string' ? s : s.replace(/([一-鿿々]+)\(([ぁ-ゖー]+)\)/g, '{$1|$2}');
  const big = s => `<span class="big">${s}</span>`;
  const gap = s => s.replace(/\( \)/g, '（　　）');
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const ch = (stem, opts, correct, key, tate) => { const o = shuffle([...new Set(opts)]); return { key: (key || stem) + '#' + correct, text: F(`${stem}<br><span class="ch">${o.map((x, i) => `<b>${i + 1}</b> ${x}`).join(tate ? '<br>' : '　')}</span>`), boxes: [''], answer: [o.indexOf(correct) + 1] }; };
  // 英語の 文の（　）に 入る ものを えらぶ
  const fillQ = (sent, opts, correct, jp, tate) => ch(`${big(gap(sent))}${jp ? `<br>${jp}` : ''}`, opts, correct, sent, tate);
  const typ = (text, a, key) => ({ key: key || text, text: F(text), boxes: [''], answer: [a], latin: true });
  const ten = fns => () => {
    const m = new Map();
    for (let i = 0; i < 400 && m.size < 10; i++) { const x = pick(fns)(); if (x && !m.has(x.key)) m.set(x.key, x); }
    const a = [...m.values()]; for (let i = 0; a.length < 10; i++) a.push(a[i]);
    return shuffle(a);
  };
  let GRADE = 7;   /* 7＝中1、8＝中2（content_eigo2.js は EIGO.kit(8) で 切りかえる） */
  const en = SUBJECTS.find(s => s.id === 'x3');
  const ser = (id, name) => { const se = { id, name, units: [] }; en.series.push(se); return se; };
  const add = (se, name, fns, ...lecture) => { const id = `${se.id}-${se.units.length + 1}`;
    UNITS[id] = { id, subject: 'x3', series: se.id, name: F(name), col: '英語', pass: 0.8, grade: GRADE, make: ten(fns), lecture: lecture.map(F) }; se.units.push(id); };
  const CHOOSE = 'こたえの 番号(ばんごう)を テンキーで いれよう。', TYPE = 'アルファベットで 打(う)って、Enterを おそう。';

  // 主語：［文の はじめの 形, 文の 中の 形, 答える ときの 代名詞］
  const S3 = [['He', 'he', 'he'], ['She', 'she', 'she'], ['Ken', 'Ken', 'he'], ['Emi', 'Emi', 'she'], ['My father', 'my father', 'he'], ['My sister', 'my sister', 'she']];
  const SP = [['I', 'I'], ['You', 'you'], ['We', 'we'], ['They', 'they'], ['Ken and Emi', 'Ken and Emi'], ['My friends', 'my friends']];
  const Q3 = [['he', 'he'], ['she', 'she'], ['Ken', 'he'], ['Emi', 'she'], ['your father', 'he'], ['your sister', 'she']];
  const QP = [['you', 'I'], ['they', 'they'], ['Ken and Emi', 'they'], ['your friends', 'they']];
  const be = s => s === 'I' ? 'am' : /^(You|We|They|you|we|they|These|Those)$| and |friends|boys/.test(s) ? 'are' : 'is';
  const s3 = v => /(s|x|ch|sh|o)$/.test(v) ? v + 'es' : /[^aeiou]y$/.test(v) ? v.slice(0, -1) + 'ies' : v + 's';
  // 動詞：［もとの形, 三人称単数, ing形, 過去形, あとに つづく ことば, 進行形に しない 動詞］
  const V = [['play', 'plays', 'playing', 'played', 'tennis'], ['study', 'studies', 'studying', 'studied', 'English'], ['watch', 'watches', 'watching', 'watched', 'TV'], ['wash', 'washes', 'washing', 'washed', 'the dishes'],
    ['read', 'reads', 'reading', 'read', 'a book'], ['use', 'uses', 'using', 'used', 'this computer'], ['make', 'makes', 'making', 'made', 'lunch'], ['write', 'writes', 'writing', 'wrote', 'a letter'],
    ['run', 'runs', 'running', 'ran', 'in the park'], ['swim', 'swims', 'swimming', 'swam', 'in the pool'], ['cook', 'cooks', 'cooking', 'cooked', 'dinner'], ['clean', 'cleans', 'cleaning', 'cleaned', 'the room'],
    ['eat', 'eats', 'eating', 'ate', 'an apple'], ['sing', 'sings', 'singing', 'sang', 'a song'], ['go', 'goes', 'going', 'went', 'to the library'], ['teach', 'teaches', 'teaching', 'taught', 'math'],
    ['speak', 'speaks', 'speaking', 'spoke', 'Chinese'], ['carry', 'carries', 'carrying', 'carried', 'a big bag'],
    ['like', 'likes', 'liking', 'liked', 'music', 1], ['have', 'has', 'having', 'had', 'a dog', 1], ['live', 'lives', 'living', 'lived', 'in Osaka', 1], ['want', 'wants', 'wanting', 'wanted', 'a new bike', 1]];
  const VA = V.filter(v => !v[5]);   // 動きを 表す 動詞
  const every = v => v[5] ? '' : ' every day';

  const J1 = ser('x3j', '{中|ちゅう}1 {英語|えいご}（{文法|ぶんぽう}）');

  // ---- 1. be動詞 ----
  const ADJ = [['happy', 'しあわせです'], ['busy', 'いそがしいです'], ['hungry', 'おなかが すいています'], ['tired', 'つかれています'], ['kind', '親切(しんせつ)です'], ['from Japan', '日本(にほん)の 出身(しゅっしん)です'], ['in the park', '公園(こうえん)に います'], ['at home', '家(いえ)に います']];
  const BES = [['I', 'わたしは'], ['You', 'あなたは'], ['He', 'かれは'], ['She', 'かのじょは'], ['We', 'わたしたちは'], ['They', 'かれらは'], ['Ken', 'ケンは'], ['My mother', 'わたしの 母(はは)は'], ['Ken and Emi', 'ケンと エミは'], ['My friends', 'わたしの 友(とも)だちは'], ['Those boys', 'あの 男(おとこ)の子(こ)たちは']];
  const THIS = [['This', 'my bag', 'これは わたしの かばんです'], ['That', 'our school', 'あれは わたしたちの 学校(がっこう)です'], ['These', 'my books', 'これらは わたしの 本(ほん)です'], ['Those', 'his shoes', 'あれらは かれの くつです'], ['This', 'a new camera', 'これは 新(あたら)しい カメラです'], ['Those', 'her pencils', 'あれらは かのじょの えんぴつです']];
  add(J1, 'be動詞(どうし)（am・are・is）', [
    () => { const [s, sj] = pick(BES), [a, aj] = pick(ADJ); return fillQ(`${s} ( ) ${a}.`, ['am', 'are', 'is'], be(s), `（${sj} ${aj}。）`); },
    () => { const [s, c, j] = pick(THIS); return fillQ(`${s} ( ) ${c}.`, ['am', 'are', 'is'], be(s), `（${j}。）`); },
    () => { const [s, sj] = pick(BES.slice(0, 6)); return ch(`${big(s)} と いっしょに 使(つか)う be動詞(どうし)は？`, ['am', 'are', 'is'], be(s), 'w' + s); },
  ], `${big('I am Ken.')}（わたしは ケンです。）<br>am・are・is を ${big('be動詞(どうし)')} と いうよ。「〜です」「〜に います」の 意味(いみ)だよ。`,
    `主語(しゅご)（「〜は」の ことば）で 形(かたち)が かわるよ。<br>${big('I → am　　You → are　　He・She・Ken・This → is')}`,
    `ふたり・2つ より 多(おお)い ときは ${big('are')}。<br>${big('We are　They are　Ken and Emi are　These are')}<br>${CHOOSE}`);

  // ---- 2. be動詞の 否定文・疑問文 ----
  add(J1, 'be動詞(どうし)の 否定文(ひていぶん)・疑問文(ぎもんぶん)', [
    () => { const [s] = pick([...Q3, ...QP]), [a] = pick(ADJ); return fillQ(`( ) ${s} ${a}?`, ['Am', 'Are', 'Is'], cap(be(s)), `（たずねる 文(ぶん)）`); },
    () => { const [s, p] = pick([...Q3, ...QP]), [a] = pick(ADJ), b = be(p), yes = rand(0, 1);
      const ok = yes ? `${p} ${b}` : p === 'I' ? "I'm not" : `${p} ${b === 'is' ? "isn't" : "aren't"}`;
      const ng = yes ? [`${p} ${p === 'I' ? 'do' : b === 'is' ? 'does' : 'do'}`, `${p} ${b === 'is' ? 'are' : 'is'}`] : [`${p} ${p === 'I' ? "don't" : b === 'is' ? "doesn't" : "don't"}`, `${p} ${b === 'is' ? "aren't" : "isn't"}`];
      return fillQ(`${cap(be(s))} ${s} ${a}? — ${yes ? 'Yes' : 'No'}, ( ).`, [ok, ...ng], ok); },
    () => { const [s] = pick(BES), [a] = pick(ADJ), b = be(s), ok = b === 'am' ? 'am not' : b === 'is' ? "isn't" : "aren't"; return fillQ(`${s} ( ) ${a}.`, ['am not', "isn't", "aren't"], ok, '（「〜では ありません」の 文(ぶん)）'); },
    () => { const [s, , ] = pick(BES.slice(2)), [a] = pick(ADJ), b = be(s), low = /^(Ken|He|She|They|We)/.test(s) ? s : s[0].toLowerCase() + s.slice(1), t = /^(He|She|They|We)$/.test(s) ? s.toLowerCase() : low;
      return ch(`${big(`${s} ${b} ${a}.`)}<br>これを たずねる 文(ぶん)に すると？`, [`${cap(b)} ${t} ${a}?`, `Do ${t} ${a}?`, `${s} ${b} ${a}?`], `${cap(b)} ${t} ${a}?`, 'q' + s + a, true); },
  ], `「〜では ありません」は、be動詞(どうし)の あとに ${big('not')}。<br>${big('I am not busy.　He is not (isn\'t) busy.　They are not (aren\'t) busy.')}`,
    `たずねる ときは、be動詞(どうし)を 文(ぶん)の はじめに 出(だ)すよ。<br>${big('You are busy. → Are you busy?')}`,
    `答(こた)え方(かた)：${big('Yes, I am.　No, I\'m not.')}<br>${big('Is Ken busy? — Yes, he is. / No, he isn\'t.')}<br>${CHOOSE}`);

  // ---- 3. 一般動詞 ----
  const GV = [['play tennis', 'テニスを します'], ['like music', '音楽(おんがく)が 好(す)きです'], ['study English', '英語(えいご)を 勉強(べんきょう)します'], ['have a dog', '犬(いぬ)を かっています'], ['speak Japanese', '日本語(にほんご)を 話(はな)します'],
    ['watch TV', 'テレビを 見(み)ます'], ['eat breakfast', '朝(あさ)ごはんを 食(た)べます'], ['go to school', '学校(がっこう)に 行(い)きます'], ['read books', '本(ほん)を 読(よ)みます'], ['use a computer', 'コンピューターを 使(つか)います']];
  const negJ = j => j.endsWith('です') ? j.slice(0, -2) + 'では ありません' : j.slice(0, -2) + 'ません';
  const GS = [['I', 'わたしは'], ['We', 'わたしたちは'], ['They', 'かれらは']];
  add(J1, '一般動詞(いっぱんどうし)（play・like など）', [
    () => { const [p, j] = pick(GV), [s, sj] = pick(GS), [v, ...o] = p.split(' '), ng = shuffle(GV.map(x => x[0].split(' ')[0]).filter(x => x !== v && !(v === 'eat' && x === 'have'))).slice(0, 2); return fillQ(`${s} ( ) ${o.join(' ')}.`, [v, ...ng], v, `（${sj} ${j}。）`); },
    () => { const [p, j] = pick(GV), [s, sj] = pick(GS); return fillQ(`${s} ( ) ${p}.`, ["don't", s === 'I' ? 'am not' : "aren't", "isn't"], "don't", `（${sj} ${negJ(j)}。）`); },
    () => { const [p] = pick(GV), [s] = pick(QP); return fillQ(`( ) ${s} ${p}?`, ['Do', 'Are', 'Is'], 'Do'); },
    () => { const [a] = pick(ADJ), [s] = pick(QP); return fillQ(`( ) ${s} ${a}?`, ['Do', 'Are', 'Is'], 'Are'); },
    () => { const [p] = pick(GV), [s, a] = pick(QP), yes = rand(0, 1), ok = `${a} ${yes ? 'do' : "don't"}`; return fillQ(`Do ${s} ${p}? — ${yes ? 'Yes' : 'No'}, ( ).`, [ok, `${a} ${yes ? (a === 'I' ? 'am' : 'are') : (a === 'I' ? 'am not' : "aren't")}`, `${a} ${yes ? '' : 'not '}${p.split(' ')[0]}`], ok); },
    () => { const [p, j] = pick(GV), [s, sj] = pick(GS), ok = `${s} don't ${p}.`; return ch(`「${sj} ${negJ(j)}。」を 英語(えいご)で 言(い)うと？`, [ok, `${s} not ${p}.`, `${s} ${s === 'I' ? 'am' : 'are'} not ${p}.`], ok, 'n' + s + p, true); },
  ], `play（する）・like（好(す)き）・have（持(も)っている）のような、be動詞(どうし)では ない 動詞(どうし)を ${big('一般動詞(いっぱんどうし)')} と いうよ。<br>${big('I play tennis.')}`,
    `「〜しません」は、動詞(どうし)の 前(まえ)に ${big("do not (don't)")}。<br>${big("I don't play tennis.")}<br>be動詞(どうし)と いっしょには 使(つか)わないよ（× I am not play）。`,
    `たずねる ときは、文(ぶん)の はじめに ${big('Do')}。<br>${big('Do you play tennis? — Yes, I do. / No, I don\'t.')}<br>${CHOOSE}`);

  // ---- 4. 三人称単数 ----
  const V3 = [...V.map(v => [v[0], v[1]]), ['try', 'tries'], ['do', 'does'], ['come', 'comes'], ['cry', 'cries'], ['enjoy', 'enjoys'], ['fix', 'fixes'], ['pass', 'passes'], ['fly', 'flies'], ['buy', 'buys'], ['finish', 'finishes']];
  add(J1, '三人称単数(さんにんしょうたんすう)の s', [
    () => { const [b, t] = pick(V3); return typ(`${big(b)}<br>主語(しゅご)が He の ときの 形(かたち)を 打(う)とう。`, t, 't' + b); },
    () => { const [b, t] = pick(V3), ng = [...new Set([b + 's', b + 'es', b.replace(/y$/, 'ies'), b.replace(/y$/, 'ys')])].filter(x => x !== t && x !== b); return ch(`${big(b)} に s を つけた 形(かたち)は？`, [t, ...shuffle(ng).slice(0, 2)], t, 'c' + b); },
    () => { const v = pick(V), [s] = pick(S3); return fillQ(`${s} ( ) ${v[4]}${every(v)}.`, [v[0], v[1], v[2]], v[1]); },
    () => { const v = pick(V), [s] = pick(SP); return fillQ(`${s} ( ) ${v[4]}${every(v)}.`, [v[0], v[1], v[2]], v[0]); },
  ], `主語(しゅご)が ${big('I・You')} では ない ひとり・1つ の とき（He・She・Ken・my father など）、動詞(どうし)に ${big('s')} を つけるよ。<br>${big('I play tennis. → Ken plays tennis.')}`,
    `s の つけ方(かた)<br>・ふつうは s：${big('plays　likes')}<br>・s・x・ch・sh・o で おわる → es：${big('watches　goes')}<br>・「a i u e o で ない 字(じ)＋y」→ y を i に かえて es：${big('study → studies')}`,
    `とくべつな 形(かたち)：${big('have → has')}<br>主語(しゅご)が ふたりより 多(おお)い とき（Ken and Emi・They）は s を つけないよ。<br>${CHOOSE} 打(う)つ 問題(もんだい)は ${TYPE}`);

  // ---- 5. 三単現の 否定文・疑問文 ----
  add(J1, '三人称単数(さんにんしょうたんすう)の 否定文(ひていぶん)・疑問文(ぎもんぶん)', [
    () => { const v = pick(V), [s] = pick(S3); return fillQ(`${s} ( ) ${v[0]} ${v[4]}.`, ["doesn't", "don't", "isn't"], "doesn't"); },
    () => { const v = pick(V), [s] = pick(SP); return fillQ(`${s} ( ) ${v[0]} ${v[4]}.`, ["doesn't", "don't", "isn't"], "don't"); },
    () => { const v = pick(V), [s] = pick(Q3); return fillQ(`( ) ${s} ${v[0]} ${v[4]}?`, ['Does', 'Do', 'Is'], 'Does'); },
    () => { const v = pick(V), [s] = pick(QP); return fillQ(`( ) ${s} ${v[0]} ${v[4]}?`, ['Does', 'Do', 'Are'], 'Do'); },
    () => { const v = pick(V), [s] = pick(Q3); return fillQ(`Does ${s} ( ) ${v[4]}?`, [v[0], v[1], v[2]], v[0]); },
    () => { const v = pick(V), [s] = pick(S3); return fillQ(`${s} doesn't ( ) ${v[4]}.`, [v[0], v[1], v[2]], v[0]); },
    () => { const v = pick(V), [s, p] = pick(Q3), yes = rand(0, 1), ok = `${p} ${yes ? 'does' : "doesn't"}`; return fillQ(`Does ${s} ${v[0]} ${v[4]}? — ${yes ? 'Yes' : 'No'}, ( ).`, [ok, `${p} ${yes ? 'do' : "don't"}`, `${p} ${yes ? 'is' : "isn't"}`], ok); },
  ], `主語(しゅご)が He・She・Ken などの とき、「〜しません」は ${big("does not (doesn't)")}。<br>${big("Ken doesn't play tennis.")}<br>doesn't の あとの 動詞(どうし)は、s の ない もとの 形(かたち)（原形(げんけい)）に もどすよ。`,
    `たずねる ときは、文(ぶん)の はじめに ${big('Does')}。動詞(どうし)は もとの 形(かたち)。<br>${big('Does Ken play tennis? — Yes, he does. / No, he doesn\'t.')}`,
    `I・You・We・They の ときは ${big("do・don't")} だったね。主語(しゅご)を よく 見(み)よう。<br>${CHOOSE}`);

  // ---- 6. 代名詞 ----
  const PRO = [['I', 'my', 'me', 'mine', 'わたし'], ['you', 'your', 'you', 'yours', 'あなた'], ['he', 'his', 'him', 'his', 'かれ'], ['she', 'her', 'her', 'hers', 'かのじょ'], ['we', 'our', 'us', 'ours', 'わたしたち'], ['they', 'their', 'them', 'theirs', 'かれら']];
  const upI = x => x === 'I' ? x : cap(x);
  add(J1, '代名詞(だいめいし)（I・my・me・mine）', [
    () => { const p = pick(PRO), s = pick(['( ) can swim well.', '( ) went to the park yesterday.', '( ) will come soon.']); return fillQ(s, p.slice(0, 4).map(upI), upI(p[0]), `（${p[4]}は）`); },
    () => { const p = pick(PRO), s = pick(['This is ( ) bag.', 'That is ( ) house.', 'Look at ( ) new bike.', 'Ken knows ( ) name.']); return fillQ(s, p.slice(0, 4), p[1], `（${p[4]}の）`); },
    () => { const p = pick(PRO), s = pick(['Mr. Sato knows ( ).', 'Please help ( ).', 'Emi plays tennis with ( ).', 'The teacher likes ( ).']); return fillQ(s, p.slice(0, 4), p[2], `（${p[4]}を・${p[4]}に）`); },
    () => { const p = pick(PRO), s = pick(['This bag is ( ).', 'That bike is ( ).', 'These books are ( ).']); return fillQ(s, p.slice(0, 4), p[3], `（${p[4]}の もの）`); },
    () => { const p = pick(PRO), k = rand(1, 3), lab = ['', `「${p[4]}の」`, `「${p[4]}を」`, `「${p[4]}の もの」`][k]; return ch(`${big(p[0])} を ${lab} の 形(かたち)に すると？`, p.slice(0, 4), p[k], 'f' + p[0] + k); },
  ], `「わたし」は、文(ぶん)の 中(なか)の はたらきで 形(かたち)が かわるよ。<br>${big('I（〜は）　my（〜の）　me（〜を・〜に）　mine（〜の もの）')}`,
    `${big('you your you yours')}<br>${big('he his him his')}<br>${big('she her her hers')}<br>${big('we our us ours')}<br>${big('they their them theirs')}`,
    `${big('This is my bag.')}（これは わたしの かばんです。）<br>${big('This bag is mine.')}（この かばんは わたしの ものです。）<br>${CHOOSE}`);

  // ---- 7. 複数形 ----
  const PL = [['book', 'books'], ['dog', 'dogs'], ['apple', 'apples'], ['key', 'keys'], ['boy', 'boys'], ['day', 'days'], ['box', 'boxes'], ['bus', 'buses'], ['dish', 'dishes'], ['watch', 'watches'], ['class', 'classes'], ['tomato', 'tomatoes'],
    ['city', 'cities'], ['baby', 'babies'], ['story', 'stories'], ['country', 'countries'], ['knife', 'knives'], ['leaf', 'leaves'], ['child', 'children'], ['man', 'men'], ['woman', 'women'], ['foot', 'feet'], ['tooth', 'teeth']];
  add(J1, '名詞(めいし)の 複数形(ふくすうけい)', [
    () => { const [a, b] = pick(PL); return typ(`${big(`one ${a} → two （　　）`)}<br>2つより 多(おお)い ときの 形(かたち)を 打(う)とう。`, b, 't' + a); },
    () => { const [a, b] = pick(PL), ng = [...new Set([a + 's', a + 'es', a.replace(/y$/, 'ies'), a.replace(/fe?$/, 'ves')])].filter(x => x !== b && x !== a); return ch(`${big(a)} の 複数形(ふくすうけい)は？`, [b, ...shuffle(ng).slice(0, 2)], b, 'c' + a); },
    () => { const [a, b] = pick(PL), n = pick(['two', 'three', 'many', 'some']); return fillQ(`I see ${n} ( ).`, [a, b], b); },
    () => { const [a, b] = pick(PL); return fillQ(`I see one ( ).`, [a, b], a); },
  ], `2つより 多(おお)い ときは、名詞(めいし)（ものの 名前(なまえ)）に ${big('s')} を つけるよ。この 形(かたち)が ${big('複数形(ふくすうけい)')}。<br>${big('one book → two books')}`,
    `s の つけ方(かた)<br>・s・x・ch・sh で おわる → es：${big('boxes　dishes')}<br>・「a i u e o で ない 字(じ)＋y」→ ies：${big('city → cities')}<br>・f・fe で おわる → ves：${big('knife → knives')}`,
    `とくべつな 形(かたち)も あるよ。<br>${big('child → children　man → men　woman → women　foot → feet　tooth → teeth')}<br>${CHOOSE} 打(う)つ 問題(もんだい)は ${TYPE}`);

  // ---- 8. 疑問詞 ----
  const WH = [["( ) is this? — It's a camera.", 'What', 'Who', 'When'], ['( ) is that boy? — He is my brother.', 'Who', 'What', 'Where'], ["( ) is your birthday? — It's July 7.", 'When', 'Where', 'Who'], ['( ) do you live? — I live in Akashi.', 'Where', 'When', 'Who'],
    ["( ) bag is this? — It's Emi's.", 'Whose', 'Who', 'How'], ['( ) do you like, dogs or cats? — I like dogs.', 'Which', 'Who', 'When'], ["( ) are you? — I'm fine, thank you.", 'How', 'What', 'Whose'], ["( ) time is it? — It's ten o'clock.", 'What', 'How', 'When'],
    ['( ) many books do you have? — I have twenty.', 'How', 'What', 'Which'], ['( ) old is your sister? — She is eight.', 'How', 'What', 'When'], ['( ) do you go to school? — By bike.', 'How', 'Who', 'What'], ["( ) is the library? — It's near the station.", 'Where', 'When', 'Who'],
    ['( ) plays the piano? — Emi does.', 'Who', 'What', 'Where'], ['( ) do you have for breakfast? — I have rice and miso soup.', 'What', 'Who', 'Where'], ["( ) is your favorite color? — It's blue.", 'What', 'Who', 'Where'], ['( ) is Mr. Brown from? — He is from Canada.', 'Where', 'When', 'Whose'],
    ["( ) notebook is this? — It's mine.", 'Whose', 'Who', 'Where'], ['( ) do you study English? — After dinner.', 'When', 'Who', 'What'], ["( ) is the weather today? — It's sunny.", 'How', 'Who', 'Whose'], ['( ) is your English teacher? — Ms. Green is.', 'Who', 'Where', 'When'],
    ["( ) is this pencil case? — It's 300 yen.", 'How much', 'How many', 'How old'], ['( ) is the school festival? — It is next Saturday.', 'When', 'Who', 'What']];
  const WM = [['what', '何(なに)'], ['who', 'だれ'], ['when', 'いつ'], ['where', 'どこ'], ['whose', 'だれの'], ['which', 'どちら・どれ'], ['how', 'どのように・どう']];
  add(J1, '疑問詞(ぎもんし)（what・who・where など）', [
    ...WH.map(w => () => fillQ(w[0], w.slice(1), w[1])),
    ...WM.map(([e, j], i) => () => ch(`${big(e)} の 意味(いみ)は？`, [j, ...shuffle(WM.filter((_, k) => k !== i).map(x => x[1])).slice(0, 2)], j, 'm' + e)),
  ], `「何(なに)」「だれ」などを たずねる ことばを ${big('疑問詞(ぎもんし)')} と いうよ。文(ぶん)の はじめに おくよ。<br>${big('what 何(なに)　who だれ　when いつ　where どこ')}`,
    `${big('whose だれの　which どちら　how どのように')}<br>${big('How many 〜?')} いくつ　${big('How much 〜?')} いくら　${big('How old 〜?')} 何(なん)さい`,
    `答(こた)えの 文(ぶん)を 見(み)ると、何(なに)を たずねているかが わかるよ。<br>${big("Where do you live? — I live in Akashi.")}<br>${CHOOSE}`);

  // ---- 9. 命令文 ----
  const IM = [['open the window', 'まどを あけ', 'まどを あけて'], ['close the door', 'ドアを しめ', 'ドアを しめて'], ['stand up', '立(た)ち', '立(た)って'], ['sit down', 'すわり', 'すわって'], ['wash your hands', '手(て)を あらい', '手(て)を あらって'],
    ['come here', 'ここに 来(き)', 'ここに 来(き)て'], ['look at this picture', 'この 絵(え)を 見(み)', 'この 絵(え)を 見(み)て'], ['use this pen', 'この ペンを 使(つか)い', 'この ペンを 使(つか)って'], ['read this book', 'この 本(ほん)を 読(よ)み', 'この 本(ほん)を 読(よ)んで'], ['run in the park', '公園(こうえん)で 走(はし)り', '公園(こうえん)で 走(はし)って']];
  const BEI = [['( ) quiet in the library.', 'Be'], ['( ) kind to your friends.', 'Be'], ['( ) careful.', 'Be'], ["Don't ( ) late for school.", 'be'], ["Don't ( ) afraid.", 'be']];
  add(J1, '命令文(めいれいぶん)（〜しなさい・Don\'t・Let\'s）', [
    () => { const [e, j] = pick(IM), [v, ...o] = e.split(' '), r = o.join(' '), ok = `${cap(e)}.`; return ch(`「${j}なさい。」を 英語(えいご)で 言(い)うと？`, [ok, `${cap(s3(v))} ${r}.`, `You ${s3(v)} ${r}.`], ok, 'a' + e, true); },
    () => { const [e, , t] = pick(IM), ok = `Don't ${e}.`; return ch(`「${t}は いけません。」を 英語(えいご)で 言(い)うと？`, [ok, `Not ${e}.`, `Doesn't ${e}.`], ok, 'b' + e, true); },
    () => { const [e, j] = pick(IM), [v, ...o] = e.split(' '), ok = `Let's ${e}.`; return ch(`「${j}ましょう。」を 英語(えいご)で 言(い)うと？`, [ok, `Let ${e}.`, `Let's ${s3(v)} ${o.join(' ')}.`], ok, 'c' + e, true); },
    () => { const [s, a] = pick(BEI), u = a === 'Be'; return fillQ(s, u ? ['Be', 'Is', 'Are'] : ['be', 'is', 'are'], a); },
    () => { const [e] = pick(IM), [v, ...o] = e.split(' '); return fillQ(`Please ( ) ${o.join(' ')}.`, [v, s3(v), 'to ' + v], v); },
  ], `「〜しなさい」は、主語(しゅご)を つけないで、動詞(どうし)の もとの 形(かたち)で はじめるよ。<br>${big('Open the window.')}（まどを あけなさい。）<br>please を つけると ていねいに なるよ。`,
    `「〜しては いけません」は ${big("Don't")} を 前(まえ)に。<br>${big("Don't open the window.")}<br>「〜しましょう」は ${big("Let's")} を 前(まえ)に。<br>${big("Let's play tennis.")}`,
    `be動詞(どうし)の 命令文(めいれいぶん)は ${big('Be')} で はじめるよ。<br>${big('Be quiet.')}（しずかに しなさい。）<br>${CHOOSE}`);

  // ---- 10. can ----
  const CAN = [['run fast', 'はやく 走(はし)れます'], ['swim well', 'じょうずに 泳(およ)げます'], ['play the piano', 'ピアノを ひけます'], ['speak English', '英語(えいご)を 話(はな)せます'], ['ride a bike', '自転車(じてんしゃ)に 乗(の)れます'], ['cook curry', 'カレーを 作(つく)れます'], ['read this kanji', 'この 漢字(かんじ)を 読(よ)めます'], ['use a computer', 'コンピューターを 使(つか)えます']];
  const v1 = p => { const [v, ...o] = p.split(' '); return [v, v + 's', o.join(' ')]; };
  const CS = [['Ken', 'ケンは'], ['Emi', 'エミは'], ['My father', 'わたしの 父(ちち)は'], ['She', 'かのじょは']];
  add(J1, 'can（〜できる）', [
    () => { const [p] = pick(CAN), [v, vs, o] = v1(p), [s] = pick(CS); return fillQ(`${s} can ( ) ${o}.`, [v, vs, v.replace(/e$/, '') + (/(run|swim)/.test(v) ? v.slice(-1) : '') + 'ing'], v); },
    () => { const [p, j] = pick(CAN), [v, vs, o] = v1(p), [s, sj] = pick(CS), ok = `${s} can ${p}.`; return ch(`「${sj} ${j}。」を 英語(えいご)で 言(い)うと？`, [ok, `${s} cans ${p}.`, `${s} can ${vs} ${o}.`], ok, 'a' + s + p, true); },
    () => { const [p] = pick(CAN), [s, a] = pick([...Q3, ...QP]), yes = rand(0, 1); return fillQ(`( ) ${s} ${p}? — ${yes ? `Yes, ${a} can` : `No, ${a} can't`}.`, ['Can', /^(you|they|Ken and|your friends)/.test(s) ? 'Are' : 'Is', /^(you|they|Ken and|your friends)/.test(s) ? 'Do' : 'Does'], 'Can'); },
    () => { const [p] = pick(CAN), [s, a] = pick([...Q3, ...QP]), yes = rand(0, 1), pl = a === 'I' || a === 'they', ok = `${a} ${yes ? 'can' : "can't"}`;
      return fillQ(`Can ${s} ${p}? — ${yes ? 'Yes' : 'No'}, ( ).`, [ok, `${a} ${yes ? (pl ? 'do' : 'does') : (pl ? "don't" : "doesn't")}`, `${a} ${yes ? (a === 'I' ? 'am' : pl ? 'are' : 'is') : (a === 'I' ? 'am not' : pl ? "aren't" : "isn't")}`], ok); },
    () => { const [p, j] = pick(CAN), ok = `I can't ${p}.`; return ch(`「わたしは ${j.replace(/ます$/, 'ません')}。」を 英語(えいご)で 言(い)うと？`, [ok, `I don't can ${p}.`, `I am not can ${p}.`], ok, 'n' + p, true); },
  ], `「〜できる」は、動詞(どうし)の 前(まえ)に ${big('can')}。<br>${big('I can swim.　Ken can swim.')}<br>主語(しゅご)が Ken でも、can に s は つけない。あとの 動詞(どうし)も もとの 形(かたち)だよ。`,
    `「〜できません」は ${big("cannot (can't)")}。<br>${big("I can't swim.")}`,
    `たずねる ときは、Can を 文(ぶん)の はじめに。<br>${big("Can you swim? — Yes, I can. / No, I can't.")}<br>${CHOOSE}`);

  // ---- 11. 現在進行形 ----
  const PS = [...S3.map(s => s[0]), ...SP.map(s => s[0])];
  add(J1, '現在進行形(げんざいしんこうけい)（〜しているところ）', [
    () => { const v = pick(VA), s = pick(PS); return fillQ(`${s} ( ) ${v[2]} ${v[4]} now.`, ['am', 'are', 'is'], be(s)); },
    () => { const v = pick(VA), [s] = pick(S3); return fillQ(`${s} ( ) ${v[4]} now.`, [`is ${v[2]}`, v[1], `is ${v[0]}`], `is ${v[2]}`); },
    () => { const v = pick(V); return typ(`${big(v[0])}<br>ing を つけた 形(かたち)を 打(う)とう。`, v[2], 't' + v[0]); },
    () => { const v = pick(VA), [s] = pick([...Q3, ...QP]), b = cap(be(s)); return fillQ(`( ) ${s} ${v[2]} ${v[4]} now?`, [b, /^(you|they|Ken and|your friends)/.test(s) ? 'Do' : 'Does', b === 'Is' ? 'Are' : 'Is'], b); },
    () => { const v = pick(VA), s = pick(PS), b = be(s), ok = b === 'am' ? 'am not' : b === 'is' ? "isn't" : "aren't"; return fillQ(`${s} ( ) ${v[2]} ${v[4]} now.`, [ok, b === 'is' ? "doesn't" : "don't", b === 'is' ? "aren't" : "isn't"], ok, '（「〜していません」の 文(ぶん)）'); },
  ], `「今(いま) 〜している ところ」は、${big('be動詞(どうし)＋動詞(どうし)の ing形(けい)')}。<br>${big('I am studying English now.')}<br>${big('Ken is watching TV now.')}`,
    `ing の つけ方(かた)<br>・ふつうは そのまま：${big('playing　reading')}<br>・e で おわる → e を とって ing：${big('make → making')}<br>・run・swim などは さいごの 字(じ)を 重(かさ)ねる：${big('running　swimming')}`,
    `「〜していません」は be動詞(どうし)の あとに not。たずねる ときは be動詞(どうし)を 前(まえ)に。<br>${big('Is Ken watching TV? — Yes, he is.')}<br>${CHOOSE} 打(う)つ 問題(もんだい)は ${TYPE}`);

  // ---- 12. 過去形（規則動詞） ----
  const REG = [['play', 'played', 'tennis'], ['watch', 'watched', 'TV'], ['study', 'studied', 'English'], ['cook', 'cooked', 'dinner'], ['clean', 'cleaned', 'my room'], ['visit', 'visited', 'Kyoto'], ['use', 'used', 'this computer'], ['wash', 'washed', 'the dishes'],
    ['enjoy', 'enjoyed', 'the party'], ['help', 'helped', 'my mother'], ['walk', 'walked', 'to school'], ['talk', 'talked', 'with my friends'], ['live', 'lived'], ['stop', 'stopped'], ['like', 'liked'], ['try', 'tried'], ['carry', 'carried'], ['want', 'wanted'], ['look', 'looked'], ['dance', 'danced'], ['plan', 'planned'], ['open', 'opened']];
  const AGO = ['yesterday', 'last Sunday', 'last night', 'two days ago', 'last week'];
  add(J1, '過去形(かこけい)（ed を つける 動詞(どうし)）', [
    () => { const [b, p] = pick(REG); return typ(`${big(b)}<br>過去形(かこけい)（〜した）を 打(う)とう。`, p, 't' + b); },
    () => { const [b, p] = pick(REG), ng = [...new Set([b + 'ed', b + 'd', b.replace(/y$/, 'ied'), b + b.slice(-1) + 'ed'])].filter(x => x !== p); return ch(`${big(b)} の 過去形(かこけい)は？`, [p, ...shuffle(ng).slice(0, 2)], p, 'c' + b); },
    () => { const [b, p, o] = pick(REG.filter(r => r[2])); return fillQ(`I ( ) ${o} ${pick(AGO)}.`, [p, b, s3(b)], p); },
    () => { const [b, p, o] = pick(REG.filter(r => r[2])), [s] = pick(S3.slice(0, 4)); return fillQ(`${s} ( ) ${o} ${pick(AGO)}.`, [p, b, s3(b)], p); },
  ], `「〜した」と 前(まえ)の ことを 言(い)う ときは、動詞(どうし)を ${big('過去形(かこけい)')} に するよ。多(おお)くの 動詞(どうし)は ${big('ed')} を つける。<br>${big('I played tennis yesterday.')}`,
    `ed の つけ方(かた)<br>・e で おわる → d だけ：${big('live → lived')}<br>・「a i u e o で ない 字(じ)＋y」→ ied：${big('study → studied')}<br>・stop・plan は さいごの 字(じ)を 重(かさ)ねる：${big('stopped　planned')}`,
    `過去形(かこけい)は、主語(しゅご)が Ken でも 同(おな)じ 形(かたち)。<br>${big('yesterday（きのう）　last 〜（この前(まえ)の 〜）　〜 ago（〜前(まえ)）')} が 目(め)じるしだよ。<br>${CHOOSE} 打(う)つ 問題(もんだい)は ${TYPE}`);

  // ---- 13. 過去形（不規則動詞） ----
  const IRR = [['go', 'went', 'to Kyoto'], ['see', 'saw', 'a movie'], ['eat', 'ate', 'sushi'], ['buy', 'bought', 'a new bag'], ['write', 'wrote', 'a letter'], ['make', 'made', 'a cake'], ['take', 'took', 'many pictures'], ['meet', 'met', 'my friend'], ['get', 'got', 'a present'],
    ['swim', 'swam', 'in the sea'], ['sing', 'sang', 'a song'], ['drink', 'drank', 'milk'], ['come', 'came'], ['have', 'had'], ['run', 'ran'], ['speak', 'spoke'], ['teach', 'taught'], ['do', 'did'], ['say', 'said'], ['give', 'gave'], ['know', 'knew'], ['find', 'found'], ['tell', 'told'],
    ['sleep', 'slept'], ['bring', 'brought'], ['think', 'thought'], ['leave', 'left'], ['sit', 'sat'], ['stand', 'stood'], ['read', 'read']];
  const IR2 = IRR.filter(r => r[0] !== r[1]);
  add(J1, '過去形(かこけい)（形(かたち)が かわる 動詞(どうし)）', [
    () => { const [b, p] = pick(IRR); return typ(`${big(b)}<br>過去形(かこけい)（〜した）を 打(う)とう。`, p, 't' + b); },
    () => { const [b, p] = pick(IR2), o = pick(IR2.filter(r => r[0] !== b))[1]; return ch(`${big(b)} の 過去形(かこけい)は？`, [p, b + (b.endsWith('e') ? 'd' : 'ed'), o], p, 'c' + b); },
    () => { const [b, p] = pick(IR2), ng = shuffle(IR2.filter(r => r[0] !== b).map(r => r[0])).slice(0, 2); return ch(`${big(p)} の もとの 形(かたち)は？`, [b, ...ng], b, 'r' + b); },
    () => { const [b, p, o] = pick(IRR.filter(r => r[2])); return fillQ(`I ( ) ${o} ${pick(AGO)}.`, [p, b, s3(b)], p); },
  ], `ed を つけないで、形(かたち)が かわる 動詞(どうし)が あるよ。1つずつ おぼえよう。<br>${big('go → went　see → saw　eat → ate　have → had')}`,
    `${big('come → came　get → got　make → made　take → took')}<br>${big('buy → bought　write → wrote　run → ran　swim → swam')}`,
    `${big('read → read')} は つづりが 同(おな)じ（読(よ)み方(かた)は「レッド」に かわる）。<br>${CHOOSE} 打(う)つ 問題(もんだい)は ${TYPE}`);

  // ---- 14. 過去の 否定文・疑問文、was・were ----
  const PV = [...REG.filter(r => r[2]), ...IRR.filter(r => r[2])];
  const wasOf = s => be(s) === 'are' ? 'were' : 'was', WADJ = ADJ.filter(a => !/kind|Japan/.test(a[0]));
  add(J1, '過去(かこ)の 否定文(ひていぶん)・疑問文(ぎもんぶん)、was・were', [
    () => { const [b, , o] = pick(PV), s = pick(['I', 'We', 'Ken', 'She']); return fillQ(`${s} ( ) ${b} ${o} ${pick(AGO)}.`, ["didn't", s === 'Ken' || s === 'She' ? "doesn't" : "don't", s === 'We' ? "weren't" : "wasn't"], "didn't"); },
    () => { const [b, p, o] = pick(PV), [s] = pick([...Q3, ...QP]); return fillQ(`Did ${s} ( ) ${o} ${pick(AGO)}?`, [b, p, s3(b)], b); },
    () => { const [b, , o] = pick(PV), [s] = pick([...Q3, ...QP]); return fillQ(`( ) ${s} ${b} ${o} ${pick(AGO)}?`, ['Did', /^(you|they|Ken and|your friends)/.test(s) ? 'Do' : 'Does', /^(you|they|Ken and|your friends)/.test(s) ? 'Were' : 'Was'], 'Did'); },
    () => { const [b, , o] = pick(PV), [s, a] = pick([...Q3, ...QP]), yes = rand(0, 1), pl = a === 'I' || a === 'they', ok = `${a} ${yes ? 'did' : "didn't"}`;
      return fillQ(`Did ${s} ${b} ${o} ${pick(AGO)}? — ${yes ? 'Yes' : 'No'}, ( ).`, [ok, `${a} ${yes ? (pl ? 'do' : 'does') : (pl ? "don't" : "doesn't")}`, `${a} ${yes ? (a === 'they' ? 'were' : 'was') : (a === 'they' ? "weren't" : "wasn't")}`], ok); },
    () => { const [s] = pick(BES), [a] = pick(WADJ), w = wasOf(s); return fillQ(`${s} ( ) ${a} ${pick(['yesterday', 'last night', 'last week'])}.`, ['was', 'were', be(s)], w); },
    () => { const [s] = pick([...Q3, ...QP]), [a] = pick(WADJ), w = cap(wasOf(s)); return fillQ(`( ) ${s} ${a} ${pick(['yesterday', 'last night'])}?`, ['Was', 'Were', 'Did'], w); },
  ], `「〜しませんでした」は ${big("did not (didn't)")}。あとの 動詞(どうし)は もとの 形(かたち)に もどすよ。<br>${big("I didn't watch TV yesterday.")}`,
    `たずねる ときは、文(ぶん)の はじめに ${big('Did')}。<br>${big("Did you go to Kyoto? — Yes, I did. / No, I didn't.")}`,
    `be動詞(どうし)の 過去形(かこけい)：${big('am・is → was　　are → were')}<br>${big('I was busy yesterday.　They were in Tokyo last week.')}<br>${CHOOSE}`);

  // ---- 15. There is / are ----
  const T1 = [['a book', 'on the desk'], ['a cat', 'under the chair'], ['an apple', 'in the box'], ['a library', 'near the station'], ['a big park', 'in my town'], ['a computer', 'in my room'], ['a clock', 'on the wall']];
  const T2 = [['two books', 'on the desk'], ['three cats', 'under the tree'], ['some apples', 'in the box'], ['many shops', 'near the station'], ['two parks', 'in my town'], ['five students', 'in the room'], ['some pictures', 'on the wall']];
  add(J1, 'There is・There are（〜が ある）', [
    () => { const k = rand(0, 1), [t, p] = pick(k ? T2 : T1); return fillQ(`There ( ) ${t} ${p}.`, ['am', 'are', 'is'], k ? 'are' : 'is'); },
    () => { const k = rand(0, 1), [t, p] = pick(k ? T2.filter(x => /^some/.test(x[0])) : T1), tt = t.replace('some', 'any'); return fillQ(`( ) there ${tt} ${p}?`, ['Is', 'Are', k ? 'Do' : 'Does'], k ? 'Are' : 'Is'); },
    () => { const [t, p] = pick(T1), yes = rand(0, 1), ok = `there ${yes ? 'is' : "isn't"}`; return fillQ(`Is there ${t} ${p}? — ${yes ? 'Yes' : 'No'}, ( ).`, [ok, `it ${yes ? 'is' : "isn't"}`, `there ${yes ? 'are' : "aren't"}`], ok); },
    () => { const k = rand(0, 1), [t, p] = pick(k ? T2.filter(x => /^some/.test(x[0])) : T1), ok = k ? "aren't" : "isn't"; return fillQ(`There ( ) ${t.replace('some', 'any')} ${p}.`, ["isn't", "aren't", "don't"], ok, '（「〜は ありません」の 文(ぶん)）'); },
    () => { const [t, p] = pick(T1), n = t.replace(/^an? /, ''), ok = `There is ${t} ${p}.`; return ch(`「〜が あります」の 文(ぶん)として 正(ただ)しいのは？`, [ok, `There are ${t} ${p}.`, `There ${n} is ${p}.`], ok, 'o' + t, true); },
  ], `「〜が あります・います」は ${big('There is 〜.')}<br>${big('There is a book on the desk.')}（つくえの 上(うえ)に 本(ほん)が あります。）`,
    `2つより 多(おお)い ときは ${big('There are 〜.')}<br>${big('There are two books on the desk.')}`,
    `たずねる ときは is・are を 前(まえ)に。<br>${big("Is there a park near here? — Yes, there is. / No, there isn't.")}<br>${CHOOSE}`);

  // ---- 16. 前置詞 ----
  const PRE = [['I get up ( ) seven.', 'at', 'on', 'in'], ['We have no school ( ) Sunday.', 'on', 'at', 'in'], ['My birthday is ( ) May.', 'in', 'on', 'at'], ['School starts ( ) April.', 'in', 'on', 'at'], ["Let's meet ( ) ten o'clock.", 'at', 'on', 'in'],
    ['I play soccer ( ) Saturdays.', 'on', 'in', 'at'], ['The party is ( ) December 24.', 'on', 'in', 'at'], ['I walk my dog ( ) the morning.', 'in', 'on', 'at'], ['I live ( ) Japan.', 'in', 'on', 'at'],
    ['The cat is ( ) the table.（テーブルの 下(した)）', 'under', 'on', 'in'], ['The ball is ( ) the box.（はこの 中(なか)）', 'in', 'on', 'under'], ['The picture is ( ) the wall.（かべに かかっている）', 'on', 'in', 'under'], ['The cup is ( ) the table.（テーブルの 上(うえ)）', 'on', 'in', 'under'],
    ['I go to school ( ) bus.', 'by', 'in', 'at'], ['I go to school ( ) my friends.', 'with', 'by', 'at'], ['This is a present ( ) you.', 'for', 'at', 'of'], ['He is ( ) Canada.（カナダの 出身(しゅっしん)）', 'from', 'for', 'with'],
    ['The store is ( ) the station.（駅(えき)の 近(ちか)く）', 'near', 'under', 'from'], ['I watch TV ( ) dinner.（夕(ゆう)ごはんの あと）', 'after', 'before', 'under'], ['Wash your hands ( ) lunch.（昼(ひる)ごはんの 前(まえ)）', 'before', 'after', 'with'],
    ['Emi sits ( ) Ken and Yuki.（ケンと ユキの あいだ）', 'between', 'under', 'with'], ['The park is ( ) front of the school.', 'in', 'at', 'on'], ['Look ( ) this picture.', 'at', 'on', 'in'], ['Listen ( ) the teacher.', 'to', 'at', 'for'], ['I am good ( ) math.', 'at', 'in', 'for']];
  add(J1, '前置詞(ぜんちし)（in・on・at など）', PRE.map(p => () => { const [s, j] = p[0].split('（'); return fillQ(s, p.slice(1), p[1], j ? '（' + j : ''); }),
    `名詞(めいし)の 前(まえ)に おいて、時(とき)や 場所(ばしょ)を 表(あらわ)す ことばを ${big('前置詞(ぜんちし)')} と いうよ。<br>時(とき)：${big('at seven（7時(じ)に）　on Sunday（日曜日(にちようび)に）　in May（5月(がつ)に）')}`,
    `場所(ばしょ)：${big('in（〜の 中(なか)に）　on（〜の 上(うえ)に）　under（〜の 下(した)に）　near（〜の 近(ちか)くに）')}`,
    `ほかにも：${big('by bus（バスで）　with（〜と いっしょに）　for（〜の ために）　from（〜から）　before（〜の 前(まえ)に）　after（〜の あとに）')}<br>${CHOOSE}`);

  // ================= 英検5級の 形（読む 問題） =================
  const K5 = ser('x3k5', '{英検|えいけん}5{級|きゅう}の {形|かたち}（{読|よ}む {問題|もんだい}）');
  const four = B => B.map(b => () => fillQ(b[0], b.slice(1), b[1]));
  const TAN = [['A: What do you want for lunch?　B: I want a ( ).', 'sandwich', 'window', 'pencil', 'bicycle'], ['My father is a ( ). He works at a hospital.', 'doctor', 'pilot', 'farmer', 'singer'], ["It is very ( ) today. Let's go swimming.", 'hot', 'cold', 'snowy', 'dark'],
    ['I ( ) my teeth after breakfast.', 'brush', 'cook', 'read', 'sing'], ['A: What ( ) do you like?　B: I like blue.', 'color', 'sport', 'animal', 'fruit'], ['We have twelve ( ) in a year.', 'months', 'weeks', 'days', 'hours'], ['Emi can ( ) the guitar well.', 'play', 'speak', 'write', 'drink'],
    ['Please open your ( ) to page ten.', 'textbooks', 'pencils', 'shoes', 'hats'], ['I usually ( ) to bed at nine.', 'go', 'get', 'sit', 'take'], ['Tom is ( ). He wants some water.', 'thirsty', 'sleepy', 'happy', 'tall'],
    ["A: Whose ( ) is this?　B: It's mine. I wear it in winter.", 'coat', 'desk', 'ball', 'dish'], ['I go to the ( ) to borrow books.', 'library', 'station', 'hospital', 'pool'], ['Sunday comes after ( ).', 'Saturday', 'Monday', 'Friday', 'Tuesday'],
    ['My sister ( ) pictures of flowers.', 'draws', 'sings', 'runs', 'drinks'], ['An elephant is a very ( ) animal.', 'big', 'short', 'new', 'busy'], ['I have a ( ) in my room. I do my homework there.', 'desk', 'bath', 'garden', 'kitchen'],
    ["A: How is the ( ) today?　B: It's rainy.", 'weather', 'time', 'school', 'name'], ['The ( ) month of the year is January.', 'first', 'second', 'third', 'last'], ['Ken is ( ) math in his room now.', 'studying', 'cooking', 'wearing', 'washing'],
    ['I ( ) up at six every morning.', 'get', 'go', 'look', 'sit'], ['My mother ( ) English at a junior high school.', 'teaches', 'eats', 'opens', 'swims'], ['Birds can ( ) in the sky.', 'fly', 'swim', 'read', 'cook'],
    ["This question is very ( ). I can't answer it.", 'difficult', 'easy', 'small', 'cloudy'], ["A: What ( ) is it?　B: It's three o'clock.", 'time', 'day', 'color', 'food'], ['I want to ( ) a letter to my grandmother.', 'write', 'listen', 'speak', 'watch'],
    ['We ( ) lunch at school at twelve thirty.', 'have', 'play', 'read', 'wear'], ["It's cold. Please ( ) the window.", 'close', 'cook', 'drink', 'sing'], ["My ( ) is my father's brother.", 'uncle', 'aunt', 'sister', 'grandmother'],
    ['I ( ) TV after dinner.', 'watch', 'listen', 'speak', 'write'], ['A ( ) has seven days.', 'week', 'month', 'year', 'hour'], ['Emi is a good ( ). She can run fast.', 'runner', 'singer', 'cook', 'teacher'], ['I am ( ). I want to go to bed.', 'sleepy', 'hungry', 'thirsty', 'tall']];
  add(K5, '短文(たんぶん)の 語句(ごく)（単語(たんご)）', four(TAN),
    `英検(えいけん)5級(きゅう)の 1つめの 問題(もんだい)と 同(おな)じ 形(かたち)だよ。文(ぶん)の（　　）に 入(はい)る ことばを、4つから えらぼう。`,
    `前(まえ)と あとの ことばを よく 読(よ)んで、意味(いみ)が 通(とお)る ことばを さがそう。<br>${big('I go to the （　　） to borrow books.')}<br>本(ほん)を かりる 場所(ばしょ)だから library だね。<br>${CHOOSE}`);
  const BUN = [['( ) is your teacher? — Mr. Tanaka is.', 'Who', 'What', 'Where', 'When'], ['My brother ( ) soccer every Sunday.', 'plays', 'play', 'playing', 'to play'], ["A: Is this your pen?　B: Yes, it's ( ).", 'mine', 'my', 'me', 'I'], ['Look at ( ) dogs. They are very cute.', 'those', 'that', 'this', 'it'],
    ['I ( ) not hungry now.', 'am', 'is', 'are', 'do'], ['A: ( ) do you live?　B: In Kobe.', 'Where', 'Who', 'Whose', 'What'], ['Ken can ( ) very fast.', 'swim', 'swims', 'swimming', 'to swim'], ['A: ( ) you like cats?　B: Yes, I do.', 'Do', 'Are', 'Is', 'Does'],
    ['My sister is ( ) a book now.', 'reading', 'read', 'reads', 'to read'], ['This is my friend. ( ) name is Lisa.', 'Her', 'She', 'Hers', 'He'], ["( ) open the door. It's cold.", "Don't", "Isn't", 'Not', "Aren't"], ['A: How ( ) pencils do you have?　B: I have five.', 'many', 'much', 'old', 'long'],
    ['Mr. Smith ( ) from Australia.', 'is', 'am', 'are', 'be'], ['I have two ( ).', 'brothers', 'brother', "brother's", 'a brother'], ["A: ( ) is your birthday?　B: It's in March.", 'When', 'Where', 'Who', 'How'], ['Emi ( ) not like tomatoes.', 'does', 'do', 'is', 'are'],
    ["Let's ( ) tennis after school.", 'play', 'plays', 'playing', 'played'], ["A: ( ) bag is this?　B: It's Ken's.", 'Whose', 'Who', 'How', 'Where'], ['These ( ) my new shoes.', 'are', 'is', 'am', 'be'], ['I play baseball ( ) Saturdays.', 'on', 'in', 'at', 'to'],
    ['A: Does your father cook?　B: Yes, he ( ).', 'does', 'do', 'is', 'cooks'], ['We go to school ( ) bus.', 'by', 'at', 'to', 'of'], ['There ( ) a big park near my house.', 'is', 'are', 'am', 'be'], ['A: Can you ski?　B: No, I ( ).', "can't", "don't", 'am not', "isn't"],
    ['Please help ( ). We are very busy.', 'us', 'we', 'our', 'ours'], ["A: ( ) are you, Ken?　B: I'm fine.", 'How', 'What', 'Who', 'Where'], ['I get up ( ) six thirty.', 'at', 'on', 'in', 'for'], ['My dog ( ) big ears.', 'has', 'have', 'is', 'are'],
    ['( ) quiet in the library.', 'Be', 'Do', 'Is', 'Are'], ['That boy is my classmate. I know ( ) well.', 'him', 'he', 'his', 'her']];
  add(K5, '短文(たんぶん)の 語句(ごく)（文法(ぶんぽう)）', four(BUN),
    `文(ぶん)の（　　）に 入(はい)る ことばを、4つから えらぼう。こんどは 文法(ぶんぽう)（ことばの 形(かたち)）を 見(み)る 問題(もんだい)だよ。`,
    `主語(しゅご)は だれか、今(いま)の ことか、たずねる 文(ぶん)か、を たしかめよう。<br>${big('My brother （　　） soccer every Sunday.')}<br>主語(しゅご)が My brother だから plays だね。<br>${CHOOSE}`);
  const KAI = [["Boy: Hi, I'm Ken. Nice to meet you.<br>Girl: ( )", 'Nice to meet you, too.', "I'm fine, thank you.", 'See you tomorrow.', "You're welcome."], ["Mother: It's time for dinner, Tom.<br>Boy: ( )", "OK, I'm coming.", 'She is in the kitchen.', 'I like tennis.', "That's my bag."],
    ['Girl: Whose umbrella is this?<br>Boy: ( )', "It's mine.", "It's rainy.", "It's by the door.", 'Yes, it is.'], ['Teacher: Where is your homework, Emi?<br>Girl: ( )', "It's in my bag.", "It's math.", "At five o'clock.", "I'm twelve."],
    ['Boy: Thank you for the present.<br>Girl: ( )', "You're welcome.", "I'm sorry.", 'Me, too.', 'Good morning.'], ['Girl: How do you come to school?<br>Boy: ( )', 'By bike.', 'At eight.', 'In the morning.', 'Yes, I do.'],
    ['Father: What do you want for breakfast?<br>Girl: ( )', 'Toast and milk, please.', 'At seven thirty.', 'In the kitchen.', 'No, thank you.'], ['Boy: Can I use your eraser?<br>Girl: ( )', 'Sure. Here you are.', "I'm fine.", "It's 100 yen.", 'Yes, I can.'],
    ["Girl: When is the school festival?<br>Boy: ( )", "It's next Saturday.", "It's in the gym.", "It's fun.", 'Yes, it is.'], ["Mother: Don't forget your lunch box.<br>Boy: ( )", 'OK. Thanks, Mom.', "It's delicious.", 'At school.', 'Yes, I am.'],
    ['Boy: How many students are in your class?<br>Girl: ( )', 'Thirty.', 'Thirteen years old.', 'In Room 2.', 'Mr. Sato.'], ["Girl: Let's play badminton in the park.<br>Boy: ( )", "That's a good idea.", "I'm from Japan.", "It's my racket.", "You're welcome."],
    ['Boy: What time does the movie start?<br>Girl: ( )', 'At two thirty.', 'For two hours.', 'On Sunday.', 'At the station.'], ["Girl: I can't find my pencil case.<br>Boy: ( )", "It's under your chair.", "It's five dollars.", 'I have two.', "That's all."],
    ['Teacher: Who is your English teacher?<br>Boy: ( )', 'Ms. Green is.', 'She is kind.', 'In the classroom.', "It's interesting."], ['Boy: Do you have any pets?<br>Girl: ( )', 'Yes, I have a rabbit.', 'Yes, I am.', "No, I can't.", 'He is my brother.'],
    ['Girl: Goodbye, Mr. Brown.<br>Teacher: ( )', 'See you tomorrow.', 'Nice to meet you.', "I'm fine.", 'Here you are.'], ['Boy: How much is this notebook?<br>Clerk: ( )', "It's 150 yen.", "It's blue.", "It's on the desk.", "It's mine."],
    ['Girl: Are you a baseball fan?<br>Boy: ( )', 'Yes, I am.', 'Yes, I do.', 'Yes, I can.', 'Yes, it is.'], ['Mother: Are you sleepy, Yuki?<br>Girl: ( )', 'Yes. Good night, Mom.', 'Good morning.', "I'm at home.", "It's my bed."]];
  add(K5, '会話文(かいわぶん)の 文(ぶん)', KAI.map(b => () => fillQ(b[0], b.slice(1), b[1], '', true)),
    `英検(えいけん)5級(きゅう)の 2つめの 問題(もんだい)と 同(おな)じ 形(かたち)だよ。ふたりの 会話(かいわ)の（　　）に 入(はい)る 文(ぶん)を、4つから えらぼう。`,
    `はじめの 人(ひと)が 何(なに)を 言(い)ったか（たずねた・さそった・お礼(れい)を 言(い)った）を 考(かんが)えよう。<br>Where 〜? には 場所(ばしょ)、When 〜? には 時(とき)で 答(こた)えるよ。<br>${CHOOSE}`);
  const NAR = [['わたしの 兄(あに)は 毎日(まいにち) ピアノを ひきます。', 'My brother', ['plays', 'the piano', 'every', 'day'], '.'], ['あなたは どこに 住(す)んで いますか。', '', ['Where', 'do', 'you', 'live'], '?'], ['この 本(ほん)は とても おもしろいです。', 'This', ['book', 'is', 'very', 'interesting'], '.'],
    ['テーブルの 上(うえ)に りんごが 3こ あります。', 'There', ['are', 'three apples', 'on', 'the table'], '.'], ['ケンは 今(いま) 部屋(へや)で 勉強(べんきょう)して います。', 'Ken', ['is', 'studying', 'in', 'his room'], 'now.'], ['まどを あけては いけません。', '', ["Don't", 'open', 'the', 'window'], '.'],
    ['あなたの 誕生日(たんじょうび)は いつですか。', '', ['When', 'is', 'your', 'birthday'], '?'], ['わたしは 放課後(ほうかご)に テニスを します。', 'I', ['play', 'tennis', 'after', 'school'], '.'], ['エミは とても じょうずに 泳(およ)げます。', 'Emi', ['can', 'swim', 'very', 'well'], '.'],
    ['あの 男(おとこ)の子(こ)は だれですか。', '', ['Who', 'is', 'that', 'boy'], '?'], ['わたしは ねこを 2ひき かって います。', '', ['I', 'have', 'two', 'cats'], '.'], ['いっしょに 公園(こうえん)へ 行(い)きましょう。', '', ["Let's", 'go', 'to', 'the park'], 'together.'],
    ['これは だれの かさですか。', '', ['Whose', 'umbrella', 'is', 'this'], '?'], ['父(ちち)は 7時(じ)に 朝(あさ)ごはんを 食(た)べます。', 'My father', ['eats', 'breakfast', 'at', 'seven'], '.'], ['あなたは 何(なん)の 教科(きょうか)が 好(す)きですか。', '', ['What', 'subject', 'do', 'you'], 'like?'],
    ['わたしの 姉(あね)は 英語(えいご)を 話(はな)しません。', 'My sister', ['does', 'not', 'speak', 'English'], '.'], ['今日(きょう)の 天気(てんき)は どうですか。', '', ['How', 'is', 'the weather', 'today'], '?'], ['あなたは 本(ほん)を 何(なん)さつ 持(も)って いますか。', 'How', ['many', 'books', 'do', 'you'], 'have?'],
    ['図書館(としょかん)では しずかに しなさい。', '', ['Be', 'quiet', 'in', 'the library'], '.'], ['かれらは 毎週(まいしゅう) 日曜日(にちようび)に サッカーを します。', 'They', ['play', 'soccer', 'every', 'Sunday'], '.']];
  const low = t => /^(I$|English|Sunday|Pochi|Ken)/.test(t) ? t : t[0].toLowerCase() + t.slice(1);
  /* ことばが 4つ（5級の 形）は 1番目と 3番目、5つ（4級の 形）は 2番目と 4番目を 答える */
  const ord = ([jp, pre, w, post]) => () => { const ix = shuffle(w.map((_, i) => i)), [a, b] = w.length === 4 ? [0, 2] : [1, 3];
    const frame = w.map((_, i) => i === a || i === b ? `（${i + 1}番目(ばんめ)）` : '（　　）').join('');
    return { key: jp, text: F(`「${jp}」<br>${big(`${pre} ${frame}${/^[.?,]/.test(post) ? post : ' ' + post}`)}<br><span class="ch">${ix.map((j, k) => `<b>${k + 1}</b> ${low(w[j])}`).join('　')}</span>`), boxes: [F(`${a + 1}番目(ばんめ)`), F(`${b + 1}番目(ばんめ)`)], answer: [ix.indexOf(a) + 1, ix.indexOf(b) + 1] }; };
  add(K5, 'ならべかえ（語句(ごく)の 順番(じゅんばん)）', NAR.map(ord),
    `英検(えいけん)5級(きゅう)の 3つめの 問題(もんだい)と 同(おな)じ 形(かたち)だよ。日本語(にほんご)の 文(ぶん)に 合(あ)うように、4つの ことばを ならべかえよう。`,
    `ならべた ときに ${big('1番目(ばんめ)')} と ${big('3番目(ばんめ)')} に くる ことばの 番号(ばんごう)を、じゅんに 入(い)れるよ。<br>文(ぶん)の はじめに くる ことばも、小文字(こもじ)で 書(か)いて あるよ。`,
    `「${'あなたは どこに 住(す)んで いますか。'}」<br>${big('Where do you live?')} なら、1番目(ばんめ)は where、3番目(ばんめ)は you。<br>紙(かみ)に 書(か)いて ならべると まちがえにくいよ。`);

  /* 中2の ファイルから 同じ 道具を 使う */
  window.EIGO = { pick, F, big, cap, ch, fillQ, typ, four, ord, V, VA, S3, SP, Q3, QP, be, s3, wasOf, CHOOSE, TYPE, kit: g => { GRADE = g; return { ser, add }; } };
})();
