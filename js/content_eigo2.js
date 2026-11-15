// 英語 中2（文法）と、英検4級の 形の 問題（2026年11月15日）。content_eigo.js の あとに 読む（道具は EIGO）。
// 文法の 項目は 中学校学習指導要領（平成29年告示）外国語から。学年の 分け方は Claude の めやす（教科書で ちがう。仮）。
// 英検4級の 形：日本英語検定協会「4級の試験内容」（https://www.eiken.or.jp/eiken/exam/grade_4/solutions.html）の リーディング
//   短文の語句空所補充 15問・会話文の文空所補充 5問・日本文付き短文の語句整序 5問・長文の内容一致選択 10問（掲示・Eメール・説明文）。リスニングは なし。
//   ならべかえを「5つの ことば・2番目と 4番目」に したのは Claude の 理解（協会の ページには 書いて いない。未確認）。
// 問題・長文は ぜんぶ Claude が 新しく 作った（過去問・本からは 写していない）。人・学校・電話番号などは 架空。文・講義は 仮（先生が 確かめる）。
(() => {
  const { pick, F, big, cap, ch, fillQ, typ, four, ord, V, VA, S3, SP, Q3, QP, be, wasOf, CHOOSE, TYPE, kit } = EIGO;
  const { ser, add } = kit(8);
  const bank = B => B.map(b => () => { const [s, j] = b[0].split('（'); return fillQ(s, b.slice(1), b[1], j ? '（' + j : ''); });
  const sent = (B, ask = '正(ただ)しい 文(ぶん)は？') => B.map(b => () => ch(b[0] ? `「${b[0]}」を 英語(えいご)で 言(い)うと？` : ask, b.slice(1), b[1], b[1], true));
  const mean = (M, ask = 'の 意味(いみ)は？') => M.map(([e, j], i) => () => ch(`${big(e)} ${ask}`, [j, ...shuffle(M.filter((_, k) => k !== i).map(x => x[1]).filter(x => x !== j)).slice(0, 2)], j, 'm' + e, true));
  const PL = /^(you|they|Ken and|your friends|You|We|They|My friends)/;
  const FUT = ['tomorrow', 'next Sunday', 'next week', 'this weekend'], THEN = ['then', 'at that time', 'at eight last night'];
  const VB = VA.filter(v => v[0] !== 'read');   /* read は 過去形が 同じ つづりなので、形を えらぶ 問題には 使わない */
  const PS = [...S3.map(s => s[0]), ...SP.map(s => s[0])];

  const J2 = ser('x3j2', '{中|ちゅう}2 {英語|えいご}（{文法|ぶんぽう}）');

  // ---- 1. 過去進行形 ----
  add(J2, '過去進行形(かこしんこうけい)（〜していた）', [
    () => { const v = pick(VA), s = pick(PS); return fillQ(`${s} ( ) ${v[2]} ${v[4]} ${pick(THEN)}.`, ['was', 'were', be(s)], wasOf(s)); },
    () => { const v = pick(VB), [s] = pick(S3); return fillQ(`${s} ( ) ${v[4]} ${pick(THEN)}.`, [`was ${v[2]}`, `is ${v[2]}`, `was ${v[0]}`], `was ${v[2]}`); },
    () => { const v = pick(VA), [s] = pick([...Q3, ...QP]), w = cap(wasOf(s)); return fillQ(`( ) ${s} ${v[2]} ${v[4]} ${pick(THEN)}?`, ['Was', 'Were', 'Did'], w); },
    () => { const v = pick(VA), s = pick(PS), w = wasOf(s) + "n't"; return fillQ(`${s} ( ) ${v[2]} ${v[4]} ${pick(THEN)}.`, ["wasn't", "weren't", "didn't"], w, '（「〜して いませんでした」の 文(ぶん)）'); },
    () => { const v = pick(VA), [s, p] = pick(Q3), yes = rand(0, 1), ok = `${p} ${yes ? 'was' : "wasn't"}`; return fillQ(`Was ${s} ${v[2]} ${v[4]} ${pick(THEN)}? — ${yes ? 'Yes' : 'No'}, ( ).`, [ok, `${p} ${yes ? 'did' : "didn't"}`, `${p} ${yes ? 'is' : "isn't"}`], ok); },
    () => { const v = pick(VA), [s] = pick(S3); return fillQ(`${s} was ( ) ${v[4]} when I called.`, [v[2], v[3] === v[2] ? v[1] : v[3], v[0]], v[2]); },
  ], `「（その とき）〜して いました」は、${big('was・were＋動詞(どうし)の ing形(けい)')}。<br>${big('I was watching TV then.')}<br>現在進行形(げんざいしんこうけい)の be動詞(どうし)を 過去形(かこけい)に するだけだよ。`,
    `${big('I・He・She・Ken → was　　You・We・They → were')}<br>${big('They were playing tennis at that time.')}`,
    `「〜して いませんでした」は ${big("wasn't・weren't")}。たずねる ときは Was・Were を 前(まえ)に。<br>${big('Was Ken studying then? — Yes, he was.')}<br>${CHOOSE}`);

  // ---- 2. will ----
  add(J2, '未来(みらい)の 文(ぶん)① will', [
    () => { const v = pick(VA), s = pick(PS); return fillQ(`${s} will ( ) ${v[4]} ${pick(FUT)}.`, [v[0], v[1], v[2]], v[0]); },
    () => { const v = pick(VB), [s] = pick(S3); return fillQ(`${s} ( ) ${v[4]} ${pick(FUT)}.`, [`will ${v[0]}`, v[3], `will ${v[1]}`], `will ${v[0]}`); },
    () => { const v = pick(VA), [s, p] = pick([...Q3, ...QP]), yes = rand(0, 1); return fillQ(`( ) ${s} ${v[0]} ${v[4]} ${pick(FUT)}? — ${yes ? `Yes, ${p} will` : `No, ${p} won't`}.`, ['Will', PL.test(s) ? 'Do' : 'Does', 'Did'], 'Will'); },
    () => { const v = pick(VA), [s, p] = pick([...Q3, ...QP]), yes = rand(0, 1), pl = p === 'I' || p === 'they', ok = `${p} ${yes ? 'will' : "won't"}`;
      return fillQ(`Will ${s} ${v[0]} ${v[4]} ${pick(FUT)}? — ${yes ? 'Yes' : 'No'}, ( ).`, [ok, `${p} ${yes ? (pl ? 'do' : 'does') : (pl ? "don't" : "doesn't")}`, `${p} ${yes ? 'did' : "didn't"}`], ok); },
    () => { const v = pick(VA), s = pick(PS); return fillQ(`${s} ( ) ${v[0]} ${v[4]} ${pick(FUT)}.`, ["won't", "wasn't", "didn't"], "won't", '（「〜しないでしょう」の 文(ぶん)）'); },
    () => { const v = pick(VA), [s] = pick(S3), ok = `${s} will ${v[0]} ${v[4]}.`; return ch('正(ただ)しい 文(ぶん)は？', [ok, `${s} wills ${v[0]} ${v[4]}.`, `${s} will ${v[1]} ${v[4]}.`], ok, 'o' + s + v[0], true); },
  ], `これからの ことは、動詞(どうし)の 前(まえ)に ${big('will')}。「〜するでしょう」「〜します」の 意味(いみ)だよ。<br>${big('I will play tennis tomorrow.')}`,
    `will の あとの 動詞(どうし)は もとの 形(かたち)。主語(しゅご)が Ken でも will に s は つけないよ。<br>${big('Ken will play tennis tomorrow.')}<br>${big("I'll = I will　　won't = will not")}`,
    `たずねる ときは Will を 前(まえ)に。<br>${big("Will you come tomorrow? — Yes, I will. / No, I won't.")}<br>${big('tomorrow（明日(あした)）　next 〜（つぎの 〜）')} が 目(め)じるし。<br>${CHOOSE}`);

  // ---- 3. be going to ----
  add(J2, '未来(みらい)の 文(ぶん)② be going to', [
    () => { const v = pick(VA), s = pick(PS); return fillQ(`${s} ( ) going to ${v[0]} ${v[4]} ${pick(FUT)}.`, ['am', 'are', 'is'], be(s)); },
    () => { const v = pick(VA), [s] = pick(S3); return fillQ(`${s} is going to ( ) ${v[4]} ${pick(FUT)}.`, [v[0], v[1], v[2]], v[0]); },
    () => { const v = pick(VA), [s] = pick([...Q3, ...QP]), b = cap(be(s)); return fillQ(`( ) ${s} going to ${v[0]} ${v[4]} ${pick(FUT)}?`, [b, 'Will', PL.test(s) ? 'Do' : 'Does'], b); },
    () => { const v = pick(VA), [s] = pick(S3), ok = `${s} is going to ${v[0]} ${v[4]}.`; return ch('正(ただ)しい 文(ぶん)は？', [ok, `${s} is going ${v[0]} ${v[4]}.`, `${s} going to ${v[0]} ${v[4]}.`], ok, 'o' + s + v[0], true); },
    () => { const v = pick(VA), [s, p] = pick([...Q3, ...QP]), yes = rand(0, 1), b = be(p), ok = yes ? `${p} ${b}` : p === 'I' ? "I'm not" : `${p} ${b === 'is' ? "isn't" : "aren't"}`;
      return fillQ(`${cap(be(s))} ${s} going to ${v[0]} ${v[4]} ${pick(FUT)}? — ${yes ? 'Yes' : 'No'}, ( ).`, [ok, `${p} ${yes ? 'will' : "won't"}`, `${p} ${yes ? (b === 'is' ? 'does' : 'do') : (b === 'is' ? "doesn't" : "don't")}`], ok); },
    () => { const v = pick(VA), s = pick(PS), b = be(s), ok = b === 'am' ? 'am not' : b === 'is' ? "isn't" : "aren't"; return fillQ(`${s} ( ) going to ${v[0]} ${v[4]} ${pick(FUT)}.`, [ok, "won't", b === 'is' ? "doesn't" : "don't"], ok, '（「〜する つもりは ありません」の 文(ぶん)）'); },
  ], `「〜する つもりです」「〜する 予定(よてい)です」は、${big('be動詞(どうし)＋going to＋動詞(どうし)の もとの 形(かたち)')}。<br>${big('I am going to visit Kyoto next week.')}`,
    `be動詞(どうし)は 主語(しゅご)に 合(あ)わせるよ。<br>${big('Ken is going to 〜.　　We are going to 〜.')}`,
    `たずねる ときは be動詞(どうし)を 前(まえ)に。<br>${big('Are you going to study tonight? — Yes, I am. / No, I\'m not.')}<br>${CHOOSE}`);

  // ---- 4. 助動詞 ----
  const JODO = [['You ( ) be quiet in the library.（〜しなければ ならない）', 'must', 'may', 'will'], ['I ( ) to get up early tomorrow.（〜しなければ ならない）', 'have', 'must', 'should'], ['Ken ( ) to clean his room.（〜しなければ ならない）', 'has', 'have', 'must'],
    ['You ( ) not run in the classroom.（〜しては いけない）', 'must', 'have', 'are'], ['You ( ) have to hurry.（〜しなくても よい）', "don't", 'must not', "aren't"], ['She ( ) have to cook today.（〜しなくても よい）', "doesn't", "don't", "isn't"],
    ['( ) I use your pen? — Sure.（〜しても よいですか）', 'May', 'Must', 'Do'], ['You ( ) see a doctor.（〜した ほうが よい）', 'should', 'may', 'will'], ['( ) I open the window? — Yes, please.（〜しましょうか）', 'Shall', 'Will', 'Must'],
    ['( ) you help me? — Sure.（〜して くれませんか）', 'Will', 'Shall', 'May'], ['You must ( ) kind to old people.', 'be', 'are', 'is'], ['Ken has to ( ) his homework now.', 'do', 'does', 'doing'],
    ['We ( ) eat in this room.（〜しては いけない）', 'must not', "don't have to", "aren't"], ['You ( ) come to school tomorrow. It is Sunday.（〜しなくても よい）', "don't have to", 'must not', 'should'], ["Do I ( ) to go now? — No, you don't.", 'have', 'must', 'should'],
    ['It ( ) rain tomorrow.（〜かもしれない）', 'may', 'must', 'have'], ['You ( ) read this book. It is interesting.（〜した ほうが よい）', 'should', 'may not', 'must not'], ["( ) we go shopping? — Yes, let's.（〜しましょうか）", 'Shall', 'Must', 'Did'],
    ['Emi ( ) to help her mother yesterday.（〜しなければ ならなかった）', 'had', 'has', 'must'], ['You should ( ) to bed early.', 'go', 'goes', 'going']];
  const JM = [['must', '〜しなければ ならない'], ['should', '〜した ほうが よい'], ['may', '〜しても よい・〜かもしれない'], ['must not', '〜しては いけない'], ["don't have to", '〜しなくても よい'], ['Shall I 〜?', '（わたしが）〜しましょうか'], ['Will you 〜?', '〜して くれませんか']];
  add(J2, '助動詞(じょどうし)（must・have to・should・may）', [...bank(JODO), ...mean(JM)],
    `動詞(どうし)の 前(まえ)に おいて、意味(いみ)を 足(た)す ことばを ${big('助動詞(じょどうし)')} と いうよ（can・will も なかま）。あとの 動詞(どうし)は もとの 形(かたち)。<br>${big('must・have to')} 〜しなければ ならない<br>${big('should')} 〜した ほうが よい　${big('may')} 〜しても よい・〜かもしれない`,
    `not を つけると 意味(いみ)が ちがうよ。<br>${big('must not')} 〜しては いけない<br>${big("don't have to")} 〜しなくても よい<br>主語(しゅご)が Ken の ときは ${big("has to・doesn't have to")}。`,
    `${big('Shall I 〜?')}（わたしが）〜しましょうか<br>${big('Shall we 〜?')}（いっしょに）〜しましょうか<br>${big('Will you 〜?')} 〜して くれませんか<br>${big('May I 〜?')} 〜しても よいですか<br>${CHOOSE}`);

  // ---- 5. 接続詞 ----
  const SETSU = [['( ) I was a child, I lived in Kobe.（〜とき）', 'When', 'If', 'Because'], ['( ) it is sunny tomorrow, we will play tennis.（もし〜なら）', 'If', 'Because', 'But'], ['I went to bed early ( ) I was tired.（〜なので）', 'because', 'if', 'but'],
    ['I think ( ) this book is interesting.（〜と いう こと）', 'that', 'when', 'because'], ['I know ( ) Ken likes soccer.（〜と いう こと）', 'that', 'because', 'but'], ['I like dogs, ( ) my brother likes cats.（しかし）', 'but', 'so', 'because'],
    ['It was raining, ( ) I stayed home.（だから）', 'so', 'but', 'because'], ['Wash your hands ( ) you eat lunch.（〜の 前(まえ)に）', 'before', 'after', 'if'], ['( ) you are free, please help me.（もし〜なら）', 'If', 'That', 'But'],
    ['I was happy ( ) I got a present.（〜なので）', 'because', 'but', 'if'], ['Ken was reading a book ( ) I visited him.（〜とき）', 'when', 'that', 'so'], ['I hope ( ) you will like it.（〜と いう こと）', 'that', 'when', 'but'],
    ['Please call me ( ) you get to the station.（〜とき）', 'when', 'that', 'but'], ["I can't buy the bag ( ) I don't have money.（〜なので）", 'because', 'so', 'that'], ['If it ( ) tomorrow, I will stay home.', 'rains', 'will rain', 'rained'],
    ['I will call you when I ( ) home.', 'get', 'will get', 'got'], ['Brush your teeth ( ) you eat breakfast.（〜の あとに）', 'after', 'before', 'that'], ['She says ( ) she is busy today.（〜と いう こと）', 'that', 'but', 'so'],
    ['I was sleepy, ( ) I finished my homework.（しかし）', 'but', 'so', 'if'], ['I got up late, ( ) I missed the bus.（だから）', 'so', 'but', 'when']];
  const SM = [['when', '〜（する）とき'], ['if', 'もし 〜なら'], ['because', '〜なので'], ['that', '〜と いう こと'], ['but', 'しかし'], ['so', 'だから'], ['before', '〜の 前(まえ)に'], ['after', '〜の あとに']];
  add(J2, '接続詞(せつぞくし)（when・if・because・that）', [...bank(SETSU), ...mean(SM)],
    `文(ぶん)と 文(ぶん)を つなぐ ことばを ${big('接続詞(せつぞくし)')} と いうよ。<br>${big('when')} 〜とき　${big('if')} もし〜なら　${big('because')} 〜なので<br>${big('When I was a child, I lived in Kobe.')}`,
    `${big('that')} は「〜と いう こと」。think・know・hope の あとに よく 使(つか)うよ（that は はぶく ことも できる）。<br>${big('I think that this book is interesting.')}`,
    `気(き)を つけよう：when・if の まとまりの 中(なか)では、これからの ことも 今(いま)の 形(かたち)で 書(か)くよ。<br>${big('If it rains tomorrow, I will stay home.')}（× will rain）<br>${CHOOSE}`);

  // ---- 6. 不定詞①（〜すること） ----
  const WANT = [['want', 'wants'], ['hope', 'hopes'], ['need', 'needs']];
  const JOB = ['a doctor', 'a teacher', 'a singer', 'a soccer player', 'a nurse', 'a cook'];
  add(J2, '不定詞(ふていし)①（to＋動詞(どうし)：〜すること）', [
    () => { const v = pick(VA), w = pick(WANT), k = rand(0, 1), [s] = pick(k ? S3 : SP); return fillQ(`${s} ${w[k]} ( ) ${v[4]}.`, [`to ${v[0]}`, v[0], `to ${v[2]}`], `to ${v[0]}`); },
    () => { const v = pick(VA), [s] = pick(S3); return fillQ(`${s} wants to ( ) ${v[4]}.`, [v[0], v[1], v[2]], v[0]); },
    () => { const j = pick(JOB); return fillQ(`I want to ( ) ${j} in the future.`, ['be', 'am', 'is'], 'be'); },
    () => { const j = pick(JOB); return fillQ(`My dream is ( ) ${j}.`, ['to be', 'be', 'am'], 'to be'); },
    () => { const v = pick(VA); return fillQ(`( ) ${v[4]} is fun.`, [`To ${v[0]}`, cap(v[0]), cap(v[1])], `To ${v[0]}`, '（〜する ことは 楽(たの)しい）'); },
    () => { const v = pick(VA), ok = `I want to ${v[0]} ${v[4]}.`; return ch('「〜したい」の 文(ぶん)として 正(ただ)しいのは？', [ok, `I want ${v[0]} ${v[4]}.`, `I want to ${v[2]} ${v[4]}.`], ok, 'o' + v[0], true); },
    () => { const v = pick(VA), [s] = pick(S3); return fillQ(`${s} likes ( ) ${v[4]}.`, [`to ${v[0]}`, v[1], `to ${v[1]}`], `to ${v[0]}`); },
  ], `${big('to＋動詞(どうし)の もとの 形(かたち)')} を ${big('不定詞(ふていし)')} と いうよ。「〜する こと」の 意味(いみ)に なるよ。<br>${big('I want to play tennis.')}（テニスを する ことを ほしい → テニスを したい）`,
    `${big('want to 〜')} 〜したい　${big('like to 〜')} 〜するのが 好(す)き　${big('hope to 〜')} 〜したいと 思(おも)う　${big('need to 〜')} 〜する 必要(ひつよう)が ある<br>主語(しゅご)が Ken でも、to の あとは もとの 形(かたち)。<br>${big('Ken wants to play tennis.')}`,
    `「〜に なりたい」は ${big('want to be 〜')}。<br>${big('I want to be a doctor.')}<br>${big('My dream is to be a singer.')}（わたしの ゆめは 歌手(かしゅ)に なる ことです。）<br>${CHOOSE}`);

  // ---- 7. 不定詞②（〜するために・〜するための） ----
  const FU2 = [['I went to the store ( ) some milk.', 'to buy', 'buy', 'bought'], ['Ken got up early ( ) breakfast.', 'to make', 'makes', 'made'], ['She studies hard ( ) a teacher.', 'to be', 'is', 'be'], ['I want something ( ).', 'to drink', 'drink', 'drinks'],
    ['I have a lot of homework ( ) today.', 'to do', 'do', 'did'], ['Kyoto has many places ( ).', 'to visit', 'visit', 'visited'], ['I am happy ( ) you.', 'to see', 'see', 'saw'], ['We went to the park ( ) tennis.', 'to play', 'played', 'plays'],
    ['Do you have time ( ) me?', 'to help', 'help', 'helps'], ['I need a book ( ) on the train.', 'to read', 'reads', 'for read'], ['Emi was sad ( ) the news.', 'to hear', 'hear', 'heard'], ['He went to the library ( ) English.', 'to study', 'studies', 'studied'],
    ['I use a computer ( ) e-mails.', 'to send', 'send', 'sent'], ['Give me something ( ).', 'to eat', 'eat', 'ate'], ['She visited Tokyo ( ) her aunt.', 'to see', 'saw', 'sees'], ['I have no time ( ) TV.', 'to watch', 'watch', 'watched']];
  const FM = [['I went to the park to play tennis.', '〜する ために（目的(もくてき)）'], ['I want something to drink.', '〜する ための（前(まえ)の ことばを 説明(せつめい)）'], ['I am glad to meet you.', '〜して（気持(きも)ちの わけ）'], ['I want to play tennis.', '〜する こと'],
    ['Ken got up early to make breakfast.', '〜する ために（目的(もくてき)）'], ['I have a lot of homework to do.', '〜する ための（前(まえ)の ことばを 説明(せつめい)）'], ['Emi was sad to hear the news.', '〜して（気持(きも)ちの わけ）'], ['My dream is to be a singer.', '〜する こと'],
    ['She went to the library to study.', '〜する ために（目的(もくてき)）'], ['Kyoto has many places to visit.', '〜する ための（前(まえ)の ことばを 説明(せつめい)）'], ['I was surprised to see him.', '〜して（気持(きも)ちの わけ）'], ['I like to read books.', '〜する こと']];
  add(J2, '不定詞(ふていし)②（〜する ために・〜する ための）', [...bank(FU2), ...mean(FM, 'の to 〜 の 意味(いみ)は？')],
    `to＋動詞(どうし)には、「〜する こと」の ほかにも 意味(いみ)が あるよ。<br>${big('〜する ために')}（目的(もくてき)）<br>${big('I went to the park to play tennis.')}（テニスを する ために 公園(こうえん)へ 行(い)った。）`,
    `${big('〜する ための')}（前(まえ)の ことばを 説明(せつめい)する）<br>${big('I want something to drink.')}（何(なに)か 飲(の)む ものが ほしい。）<br>${big('I have a lot of homework to do.')}（する 宿題(しゅくだい)が たくさん ある。）`,
    `${big('〜して')}（気持(きも)ちの わけ）<br>${big('I am happy to see you.')}（あなたに 会(あ)えて うれしい。）<br>${CHOOSE}`);

  // ---- 8. 動名詞 ----
  const DOU = [['( ) soccer is fun.', 'Playing', 'Play', 'Plays'], ['I am good at ( ).', 'swimming', 'swim', 'to swim'], ['Thank you for ( ) me.', 'helping', 'help', 'to help'], ['How about ( ) tennis after school?', 'playing', 'play', 'to play'],
    ['My hobby is ( ) pictures.', 'taking', 'take', 'takes'], ['( ) books is important.', 'Reading', 'Read', 'Reads'], ['She is interested in ( ) English.', 'studying', 'study', 'to study'], ['It stopped ( ).', 'raining', 'rain', 'to rain'],
    ['My father likes ( ) in the sea.', 'swimming', 'swim', 'swims'], ['( ) early is good for you.', 'Getting up', 'Get up', 'Gets up']];
  add(J2, '動名詞(どうめいし)（〜ing：〜すること）', [
    () => { const v = pick(VA), w = pick(['enjoyed', 'finished', 'stopped']), [s] = pick([...S3, ...SP]); return fillQ(`${s} ${w} ( ) ${v[4]}.`, [v[2], `to ${v[0]}`, v[0]], v[2]); },
    () => { const v = pick(VA), w = pick(['wants', 'hopes', 'decided']), [s] = pick(S3); return fillQ(`${s} ${w} ( ) ${v[4]}.`, [v[2], `to ${v[0]}`, v[0]], `to ${v[0]}`); },
    () => { const w = pick(['enjoy', 'finish', 'stop', 'want', 'hope', 'decide']), ing = /enjoy|finish|stop/.test(w); return ch(`${big(w)} の あとに つづくのは？`, ['〜ing', 'to 〜'], ing ? '〜ing' : 'to 〜', 'k' + w); },
    ...bank(DOU),
  ], `動詞(どうし)の ing形(けい)も「〜する こと」の 意味(いみ)に なるよ。これを ${big('動名詞(どうめいし)')} と いうよ。<br>${big('I like playing tennis.')}（＝ I like to play tennis.）`,
    `あとに つづく 形(かたち)が 決(き)まって いる 動詞(どうし)が あるよ。<br>${big('enjoy・finish・stop ＋ 〜ing')}<br>${big('want・hope・decide ＋ to 〜')}<br>${big('I enjoyed playing tennis.')}（× enjoyed to play）`,
    `at・for・in などの 前置詞(ぜんちし)の あとも 〜ing。<br>${big('I am good at swimming.　Thank you for helping me.')}<br>${CHOOSE}`);

  // ---- 9. 比較①（er・est） ----
  const HI = [['tall', 'taller', 'tallest'], ['long', 'longer', 'longest'], ['short', 'shorter', 'shortest'], ['old', 'older', 'oldest'], ['young', 'younger', 'youngest'], ['fast', 'faster', 'fastest'], ['small', 'smaller', 'smallest'], ['cold', 'colder', 'coldest'], ['new', 'newer', 'newest'], ['high', 'higher', 'highest'], ['strong', 'stronger', 'strongest'],
    ['big', 'bigger', 'biggest'], ['hot', 'hotter', 'hottest'], ['large', 'larger', 'largest'], ['nice', 'nicer', 'nicest'], ['easy', 'easier', 'easiest'], ['busy', 'busier', 'busiest'], ['happy', 'happier', 'happiest'], ['early', 'earlier', 'earliest'], ['heavy', 'heavier', 'heaviest']];
  const HP = [['Ken', 'Tom', 'tall'], ['Ken', 'his father', 'tall'], ['This bag', 'that one', 'big'], ['This bag', 'that one', 'heavy'], ['My dog', 'your dog', 'small'], ['Emi', 'her sister', 'young'], ['This river', 'that river', 'long'], ['Today', 'yesterday', 'hot'], ['Today', 'yesterday', 'cold'],
    ['This question', 'that one', 'easy'], ['My father', 'my mother', 'old'], ['This car', 'that car', 'new'], ['Mr. Sato', 'Mr. Brown', 'busy'], ['This mountain', 'that mountain', 'high']];
  const HS = [['Ken', 'in his class', 'tall'], ['Ken', 'of the three', 'tall'], ['This bag', 'of the five', 'big'], ['Emi', 'in her family', 'young'], ['This river', 'in Japan', 'long'], ['August', 'of the year', 'hot'], ['This question', 'of all', 'easy'], ['My grandfather', 'in my family', 'old'], ['Mr. Sato', 'in this school', 'busy'], ['This mountain', 'in Japan', 'high']];
  const hi = a => HI.find(x => x[0] === a);
  add(J2, '比較(ひかく)①（er・est）', [
    () => { const h = pick(HI); return typ(`${big(h[0])}<br>「もっと 〜」の 形(かたち)（比較級(ひかくきゅう)）を 打(う)とう。`, h[1], 'e' + h[0]); },
    () => { const h = pick(HI); return typ(`${big(h[0])}<br>「いちばん 〜」の 形(かたち)（最上級(さいじょうきゅう)）を 打(う)とう。`, h[2], 's' + h[0]); },
    () => { const [a, b, j] = pick(HP), h = hi(j); return fillQ(`${a} is ( ) than ${b}.`, h, h[1]); },
    () => { const [a, r, j] = pick(HS), h = hi(j); return fillQ(`${a} is the ( ) ${r}.`, h, h[2]); },
    () => { const [a, b, j] = pick(HP), h = hi(j); return fillQ(`${a} is ${h[1]} ( ) ${b}.`, ['than', 'in', 'of'], 'than'); },
    () => { const [a, r, j] = pick(HS), h = hi(j), [p, ...x] = r.split(' '); return fillQ(`${a} is the ${h[2]} ( ) ${x.join(' ')}.`, ['in', 'of', 'than'], p); },
  ], `2つを くらべて「…より 〜」は、${big('er＋than')}。<br>${big('Ken is taller than Tom.')}（ケンは トムより 背(せ)が 高(たか)い。）`,
    `3つ より 多(おお)い 中(なか)で「いちばん 〜」は、${big('the＋est')}。<br>${big('Ken is the tallest in his class.')}<br>${big('in')}＋場所(ばしょ)・グループ（in Japan・in his class）、${big('of')}＋数(かず)・all（of the three・of all）`,
    `つけ方(かた)<br>・e で おわる → r・st：${big('large → larger → largest')}<br>・big・hot は 字(じ)を 重(かさ)ねる：${big('bigger　hottest')}<br>・y → ier・iest：${big('easy → easier → easiest')}<br>${CHOOSE} 打(う)つ 問題(もんだい)は ${TYPE}`);

  // ---- 10. 比較②（more・most・as 〜 as・better・best） ----
  const LONG = ['beautiful', 'interesting', 'popular', 'difficult', 'important', 'famous', 'useful', 'exciting', 'expensive', 'careful'];
  const HI2 = [['I like soccer ( ) than baseball.', 'better', 'best', 'well'], ['I like summer the ( ) of all seasons.', 'best', 'better', 'well'], ['Emi plays the piano ( ) than Ken.', 'better', 'gooder', 'best'], ['This is the ( ) movie of the year.', 'best', 'better', 'goodest'],
    ['Ken is as ( ) as Tom.', 'tall', 'taller', 'tallest'], ['My bag is not as ( ) as yours.', 'big', 'bigger', 'biggest'], ['This question is as ( ) as that one.', 'easy', 'easier', 'easiest'], ['Emi can run as ( ) as Ken.', 'fast', 'faster', 'fastest'],
    ['Which do you like ( ), tea or coffee?', 'better', 'best', 'good'], ['Who is the ( ) popular singer in Japan?', 'most', 'more', 'much'], ['Ken has ( ) books than Tom.', 'more', 'many', 'most'], ['This is ( ) of the two.', 'the better', 'the best', 'good']];
  add(J2, '比較(ひかく)②（more・most・as 〜 as・better）', [
    () => { const a = pick(LONG); return fillQ(`This book is ( ) ${a} than that one.`, ['more', 'most', 'very'], 'more'); },
    () => { const a = pick(LONG); return fillQ(`This is the ( ) ${a} book of the three.`, ['most', 'more', 'very'], 'most'); },
    () => { const a = pick(LONG); return ch(`${big(a)} の 比較級(ひかくきゅう)（もっと 〜）は？`, [`more ${a}`, `${a}er`, `most ${a}`], `more ${a}`, 'c' + a); },
    () => { const a = pick(LONG); return fillQ(`This song is ( ) than that one.`, [`more ${a}`, `${a}er`, `most ${a}`], `more ${a}`, '', true); },
    ...bank(HI2.slice(0, 11)),
  ], `長(なが)い ことば（beautiful・interesting など）は、er・est を つけないで、前(まえ)に ${big('more・most')} を おくよ。<br>${big('This book is more interesting than that one.')}<br>${big('This is the most interesting book of all.')}`,
    `「…と 同(おな)じ くらい 〜」は ${big('as 〜 as …')}。間(あいだ)は もとの 形(かたち)。<br>${big('Ken is as tall as Tom.')}<br>${big('not as 〜 as …')} は「…ほど 〜で ない」。`,
    `とくべつな 形(かたち)：${big('good・well → better → best')}<br>${big('I like soccer better than baseball.')}<br>${big('I like summer the best.')}<br>${CHOOSE}`);

  // ---- 11. 過去分詞の 形 ----
  const PP = [['go', 'went', 'gone'], ['see', 'saw', 'seen'], ['eat', 'ate', 'eaten'], ['write', 'wrote', 'written'], ['speak', 'spoke', 'spoken'], ['take', 'took', 'taken'], ['make', 'made', 'made'], ['break', 'broke', 'broken'], ['build', 'built', 'built'], ['give', 'gave', 'given'],
    ['know', 'knew', 'known'], ['do', 'did', 'done'], ['read', 'read', 'read'], ['send', 'sent', 'sent'], ['buy', 'bought', 'bought'], ['sing', 'sang', 'sung'], ['come', 'came', 'come'], ['find', 'found', 'found'], ['teach', 'taught', 'taught'], ['tell', 'told', 'told'],
    ['hold', 'held', 'held'], ['use', 'used', 'used'], ['play', 'played', 'played'], ['love', 'loved', 'loved'], ['clean', 'cleaned', 'cleaned'], ['sell', 'sold', 'sold'], ['draw', 'drew', 'drawn'], ['grow', 'grew', 'grown']];
  const PP2 = PP.filter(p => p[1] !== p[2]);
  add(J2, '過去分詞(かこぶんし)の 形(かたち)', [
    () => { const p = pick(PP); return typ(`${big(`${p[0]} － ${p[1]} － （　　）`)}<br>過去分詞(かこぶんし)を 打(う)とう。`, p[2], 't' + p[0]); },
    () => { const p = pick(PP2); return ch(`${big(p[0])} の 過去分詞(かこぶんし)は？`, [p[2], p[1], p[0] + (p[0].endsWith('e') ? 'd' : 'ed')], p[2], 'c' + p[0]); },
    () => { const p = pick(PP2), ng = shuffle(PP2.filter(x => x[0] !== p[0]).map(x => x[0])).slice(0, 2); return ch(`${big(p[2])} の もとの 形(かたち)は？`, [p[0], ...ng], p[0], 'r' + p[0]); },
  ], `動詞(どうし)には、もとの 形(かたち)・過去形(かこけい)の ほかに ${big('過去分詞(かこぶんし)')} と いう 形(かたち)が あるよ。「〜される」（受(う)け身(み)）の 文(ぶん)で 使(つか)うよ。`,
    `ed を つける 動詞(どうし)は、過去形(かこけい)と 同(おな)じ。<br>${big('play － played － played')}<br>形(かたち)が かわる 動詞(どうし)は 1つずつ おぼえよう。<br>${big('make － made － made　　buy － bought － bought')}`,
    `3つとも ちがう ものも あるよ。<br>${big('go － went － gone　　see － saw － seen')}<br>${big('write － wrote － written　　speak － spoke － spoken')}<br>${CHOOSE} 打(う)つ 問題(もんだい)は ${TYPE}`);

  // ---- 12. 受け身 ----
  const UKE = [['This room is ( ) every day.', 'cleaned', 'clean', 'cleaning'], ['English is ( ) in many countries.', 'spoken', 'speak', 'spoke'], ['This book was ( ) by a famous writer.', 'written', 'wrote', 'write'], ['These pictures were ( ) in Kyoto.', 'taken', 'took', 'take'],
    ['This car was ( ) in Japan.', 'made', 'make', 'making'], ['The window was ( ) by Ken.', 'broken', 'broke', 'break'], ['Soccer is ( ) all over the world.', 'played', 'play', 'playing'], ['This song is ( ) by many people.', 'loved', 'love', 'loving'],
    ['Dinner was ( ) by my father.', 'cooked', 'cook', 'cooking'], ['This temple was ( ) 500 years ago.', 'built', 'build', 'building'], ['Many stars are ( ) at night.', 'seen', 'see', 'saw'], ['This letter was ( ) yesterday.', 'sent', 'send', 'sending'],
    ['The festival is ( ) in August.', 'held', 'hold', 'holding'], ['This room ( ) cleaned every day.', 'is', 'are', 'does'], ['These books ( ) written in English.', 'are', 'is', 'do'], ['The cake ( ) made yesterday.', 'was', 'were', 'did'],
    ['The windows ( ) broken last night.', 'were', 'was', 'did'], ['This song is loved ( ) many people.', 'by', 'of', 'to'], ['( ) this picture taken in Kyoto? — Yes, it was.', 'Was', 'Did', 'Does'], ['This room ( ) not used now.', 'is', 'does', 'do'],
    ['( ) English spoken in Australia? — Yes, it is.', 'Is', 'Does', 'Do'], ['These vegetables are ( ) at that store.', 'sold', 'sell', 'selling']];
  const UKS = [['この 部屋(へや)は 毎日(まいにち) そうじされます。', 'This room is cleaned every day.', 'This room cleans every day.', 'This room is clean every day by.'], ['この 本(ほん)は 多(おお)くの 人(ひと)に 読(よ)まれて います。', 'This book is read by many people.', 'This book reads many people.', 'This book is reading by many people.'],
    ['その 写真(しゃしん)は ケンに よって とられました。', 'The picture was taken by Ken.', 'The picture took by Ken.', 'The picture was took Ken.'], ['英語(えいご)は ここでは 話(はな)されて いません。', 'English is not spoken here.', "English doesn't spoken here.", 'English is not speak here.']];
  add(J2, '受(う)け身(み)（be動詞(どうし)＋過去分詞(かこぶんし)）', [...bank(UKE), ...sent(UKS)],
    `「〜される」「〜されて いる」は、${big('be動詞(どうし)＋過去分詞(かこぶんし)')}。これを ${big('受(う)け身(み)')} と いうよ。<br>${big('This room is cleaned every day.')}（この 部屋(へや)は 毎日(まいにち) そうじされる。）`,
    `「〜された」は be動詞(どうし)を 過去形(かこけい)に。<br>${big('This picture was taken in Kyoto.')}<br>「…に よって」は ${big('by …')}。<br>${big('The window was broken by Ken.')}`,
    `「〜されない」は be動詞(どうし)の あとに not。たずねる ときは be動詞(どうし)を 前(まえ)に。<br>${big('Is English spoken in Australia? — Yes, it is.')}<br>${CHOOSE}`);

  // ---- 13. SVOO ----
  const OO = [['My father gave ( ) a watch.', 'me', 'my', 'I'], ['Ms. Green teaches ( ) English.', 'us', 'we', 'our'], ['Please show ( ) your notebook.', 'me', 'I', 'mine'], ['I will give ( ) this book.', 'him', 'he', 'his'], ['Ken told ( ) the story.', 'her', 'she', 'hers'],
    ['I gave a present ( ) my mother.', 'to', 'for', 'at'], ['My mother made a cake ( ) me.', 'for', 'to', 'of'], ['She bought a bag ( ) her sister.', 'for', 'to', 'at'], ['Please show the picture ( ) me.', 'to', 'for', 'in'], ['He sent an e-mail ( ) Emi.', 'to', 'for', 'on'],
    ['My uncle bought ( ) a new bike.', 'me', 'I', 'my'], ['Can you tell ( ) the way to the station?', 'me', 'my', 'mine'], ['Mr. Sato teaches math ( ) us.', 'to', 'for', 'at'], ['I will cook dinner ( ) my family.', 'for', 'to', 'at']];
  const GIVE = ['gave', 'showed', 'sent', 'bought', 'made'], WHO = [['me', 'I'], ['him', 'he'], ['her', 'she'], ['us', 'we'], ['them', 'they']], WHAT = ['a book', 'a picture', 'a present', 'a card'];
  add(J2, '「人(ひと)に 物(もの)を」の 文(ぶん)（give・show など）', [...bank(OO),
    () => { const g = pick(GIVE), [o, n] = pick(WHO), w = pick(WHAT), ok = `Ken ${g} ${o} ${w}.`; return ch('正(ただ)しい 文(ぶん)は？', [ok, `Ken ${g} ${w} ${o}.`, `Ken ${g} ${n} ${w}.`], ok, 'o' + g + o + w, true); },
  ], `give（あげる）・show（見(み)せる）・tell（話(はな)す）・teach（教(おし)える）・buy（買(か)う）・make（作(つく)る）などは、${big('動詞(どうし)＋人(ひと)＋物(もの)')} の じゅんに ならべるよ。<br>${big('My father gave me a watch.')}（父(ちち)は わたしに 時計(とけい)を くれた。）`,
    `「人(ひと)」の ところは me・him・her・us・them の 形(かたち)。<br>${big('Ms. Green teaches us English.')}`,
    `物(もの)を 先(さき)に 言(い)う ときは、人(ひと)の 前(まえ)に to か for。<br>${big('give・show・tell・teach・send → to')}<br>${big('buy・make・cook → for')}<br>${big('I gave a present to my mother.　She made a cake for me.')}<br>${CHOOSE}`);

  // ---- 14. SVOC・look ----
  const OC = [['We call ( ) Ken.', 'him', 'he', 'his'], ['The news made me ( ).', 'happy', 'happily', 'happiness'], ['This song makes ( ) happy.', 'us', 'we', 'our'], ['You look ( ) today.', 'happy', 'happily', 'to happy'], ['That sounds ( ).', 'nice', 'nicely', 'to nice'],
    ['What do you call this animal ( ) English?', 'in', 'at', 'on'], ['He looks ( ) his father.', 'like', 'at', 'for'], ['The movie made ( ) sad.', 'her', 'she', 'hers'], ['Please call ( ) Tom.', 'me', 'I', 'my'], ['Her smile makes everyone ( ).', 'happy', 'happily', 'to happy'],
    ['Ken looked ( ) yesterday.', 'sad', 'sadly', 'sadness'], ['She got ( ) when she heard the news.', 'angry', 'angrily', 'anger'], ['This soup tastes ( ).', 'good', 'well', 'goodly'], ['It is getting ( ).', 'dark', 'darkly', 'darkness']];
  const OCS = [['わたしたちは かれを ケンと よびます。', 'We call him Ken.', 'We call Ken him.', 'We call he Ken.'], ['その 知(し)らせは わたしを 悲(かな)しく させました。', 'The news made me sad.', 'The news made sad me.', 'The news made I sad.'], ['あなたは つかれて 見(み)えます。', 'You look tired.', 'You look at tired.', 'You are look tired.'],
    ['その 歌(うた)は わたしたちを 楽(たの)しく させます。', 'The song makes us happy.', 'The song makes happy us.', 'The song makes we happy.'], ['友(とも)だちは わたしを ミキと よびます。', 'My friends call me Miki.', 'My friends call Miki me.', 'My friends call I Miki.'], ['かれは 有名(ゆうめい)に なりました。', 'He became famous.', 'He became famously.', 'He was became famous.']];
  add(J2, 'call・make・look の 文(ぶん)', [...bank(OC), ...sent(OCS)],
    `${big('call ＋ 人(ひと) ＋ 名前(なまえ)')}「（人(ひと)）を 〜と よぶ」<br>${big('We call him Ken.')}<br>${big('make ＋ 人(ひと) ＋ ようす')}「（人(ひと)）を 〜に する」<br>${big('The news made me happy.')}`,
    `${big('look ＋ ようす')}「〜に 見(み)える」<br>${big('You look tired.')}<br>${big('become ＋ 〜')}「〜に なる」　${big('sound ＋ ようす')}「〜に 聞(き)こえる」　${big('get ＋ ようす')}「〜に なる」`,
    `ようすを 表(あらわ)す ことばは、happy・sad の 形(かたち)（× happily）。<br>${big('look like ＋ 人(ひと)・もの')} は「〜に にて いる・〜の ように 見(み)える」。<br>${CHOOSE}`);

  // ================= 英検4級の 形（読む 問題） =================
  const K4 = ser('x3k4', '{英検|えいけん}4{級|きゅう}の {形|かたち}（{読|よ}む {問題|もんだい}）');
  const TAN = [['I was very ( ), so I went to bed early.', 'tired', 'famous', 'cheap', 'sunny'], ['A: Did you ( ) your homework?　B: Yes, I did it last night.', 'finish', 'invite', 'climb', 'build'], ['My grandfather lives in a small ( ) near the sea.', 'village', 'kitchen', 'season', 'subject'],
    ['It started to rain, so I opened my ( ).', 'umbrella', 'dictionary', 'ticket', 'camera'], ['We ( ) at the station at ten yesterday.', 'arrived', 'belonged', 'invited', 'borrowed'], ["This bag is too ( ). I can't buy it.", 'expensive', 'delicious', 'sleepy', 'cloudy'],
    ["A: What is your ( ) for the weekend?　B: I'm going to visit my aunt.", 'plan', 'voice', 'body', 'floor'], ['I often ( ) books from the school library.', 'borrow', 'teach', 'grow', 'wear'], ['Ken ( ) the bus this morning, so he was late for school.', 'missed', 'caught', 'washed', 'painted'],
    ['Please ( ) me your new address.', 'tell', 'speak', 'say', 'talk'], ['The ( ) in this park are beautiful in spring.', 'flowers', 'pockets', 'spoons', 'notebooks'], ['My sister wants to ( ) a nurse in the future.', 'become', 'begin', 'bring', 'build'],
    ["I ( ) my key yesterday. I can't find it.", 'lost', 'won', 'sang', 'drew'], ['A: How was the movie?　B: It was very ( ). I want to see it again.', 'exciting', 'hungry', 'absent', 'careful'], ['We need a ( ) to see that movie.', 'ticket', 'blanket', 'pillow', 'spoon'],
    ["Let's take a ( ) under that tree. I'm tired.", 'rest', 'test', 'number', 'corner'], ['Ms. Sato ( ) us a story about her trip.', 'told', 'said', 'spoke', 'talked'], ['It takes twenty ( ) from here to the station by bus.', 'minutes', 'pieces', 'pages', 'pairs'],
    ['I ( ) up late this morning.', 'woke', 'slept', 'went', 'fell'], ["Don't ( ) to bring your lunch tomorrow.", 'forget', 'enjoy', 'finish', 'travel'], ['The math test was ( ), so everyone got a good score.', 'easy', 'heavy', 'dark', 'angry'],
    ['My father ( ) to work by train every day.', 'goes', 'makes', 'puts', 'tells'], ['A: Can I ( ) this shirt on?　B: Sure.', 'try', 'catch', 'hold', 'send'], ['We had a good ( ) at the party.', 'time', 'hour', 'minute', 'clock'],
    ["I'm ( ) for my pen. Did you see it?", 'looking', 'watching', 'seeing', 'listening'], ['Kyoto is ( ) for its old temples.', 'famous', 'careful', 'ready', 'late'], ['Please ( ) off the light when you leave the room.', 'turn', 'come', 'look', 'stand'],
    ['She ( ) care of her little brother yesterday.', 'took', 'made', 'had', 'gave'], ['I want to travel ( ) someday.', 'abroad', 'already', 'almost', 'always'], ['The ( ) of this story is very sad.', 'end', 'face', 'hand', 'door']];
  add(K4, '短文(たんぶん)の 語句(ごく)（単語(たんご)・4級(きゅう)）', four(TAN),
    `英検(えいけん)4級(きゅう)の 1つめの 問題(もんだい)と 同(おな)じ 形(かたち)だよ。文(ぶん)の（　　）に 入(はい)る ことばを、4つから えらぼう。`,
    `take care of（〜の 世話(せわ)を する）、look for（〜を さがす）のような、2つ・3つの ことばで 1つの 意味(いみ)に なる 言(い)い方(かた)も 出(で)るよ。<br>${CHOOSE}`);
  const BUN = [['Ken is ( ) than his father.', 'taller', 'tall', 'tallest', 'the tallest'], ['I ( ) TV when my mother came home.', 'was watching', 'watch', 'am watching', 'watches'], ["A: What are you going ( ) tomorrow?　B: I'm going to go fishing.", 'to do', 'do', 'doing', 'did'],
    ['I enjoyed ( ) with my friends yesterday.', 'talking', 'to talk', 'talk', 'talked'], ['This is the ( ) interesting book of the three.', 'most', 'more', 'much', 'very'], ['My mother ( ) me a new bike last week.', 'bought', 'buys', 'buy', 'buying'],
    ['I went to the park ( ) soccer.', 'to play', 'played', 'plays', 'play'], ['You ( ) be quiet in the hospital.', 'must', 'are', 'have', 'did'], ['( ) it is sunny tomorrow, we will go to the beach.', 'If', 'That', 'But', 'So'],
    ['This picture was ( ) by my uncle.', 'taken', 'took', 'take', 'taking'], ['A: ( ) I open the window?　B: Yes, please.', 'Shall', 'Did', 'Am', 'Have'], ['I want something cold ( ).', 'to drink', 'drink', 'drank', 'drinks'],
    ['Emi can run the ( ) in her class.', 'fastest', 'fast', 'faster', 'more fast'], ["I didn't ( ) breakfast this morning.", 'eat', 'ate', 'eats', 'eating'], ['A: ( ) did you go last Sunday?　B: I went to the zoo.', 'Where', 'Who', 'Which', 'Whose'],
    ['My brother finished ( ) his homework.', 'doing', 'to do', 'do', 'did'], ['I think ( ) English is useful.', 'that', 'what', 'which', 'who'], ['There ( ) many people in the park yesterday.', 'were', 'was', 'are', 'is'],
    ['Tom has to ( ) home by six.', 'come', 'comes', 'came', 'coming'], ['This question is as ( ) as that one.', 'difficult', 'more difficult', 'most difficult', 'the most difficult'], ['I will ( ) you tonight.', 'call', 'called', 'calling', 'calls'],
    ['She was happy ( ) the present.', 'to get', 'gets', 'got', 'get'], ['A: ( ) bag is yours?　B: The red one.', 'Which', 'Why', 'When', 'Where'], ['I was tired, ( ) I went to bed early.', 'so', 'because', 'if', 'or'],
    ['I like summer the ( ) of all seasons.', 'best', 'better', 'good', 'well'], ['Please give ( ) some water.', 'me', 'I', 'my', 'mine'], ['A: ( ) are you late?　B: Because I missed the bus.', 'Why', 'What', 'Where', 'Who'],
    ['English ( ) in many countries.', 'is spoken', 'speaks', 'is speaking', 'spoke'], ['Mr. Brown ( ) in Japan for three years when he was young.', 'lived', 'lives', 'live', 'is living'], ['A: How ( ) does it take to the station?　B: About ten minutes.', 'long', 'much', 'many', 'far']];
  add(K4, '短文(たんぶん)の 語句(ごく)（文法(ぶんぽう)・4級(きゅう)）', four(BUN),
    `文(ぶん)の（　　）に 入(はい)る ことばを、4つから えらぼう。文法(ぶんぽう)（ことばの 形(かたち)）を 見(み)る 問題(もんだい)だよ。`,
    `いつの ことか（yesterday・tomorrow）、前(まえ)に ある ことば（than・the・to・enjoy など）を 手(て)がかりに しよう。<br>${CHOOSE}`);
  const KAI = [['Boy: What are you going to do this weekend?<br>Girl: ( )', "I'm going to visit my grandmother.", 'I went shopping.', "I'm fine, thanks.", 'It was fun.'], ['Girl: You look tired. Are you OK?<br>Boy: ( )', 'I went to bed late last night.', "I'm looking at the picture.", "You're welcome.", "That's a good idea."],
    ['Mother: Can you help me with dinner?<br>Boy: ( )', 'Sure. What should I do?', 'Yes, it was delicious.', 'I ate curry.', "It's seven o'clock."], ['Boy: How was your trip to Okinawa?<br>Girl: ( )', 'It was great. The sea was beautiful.', 'By plane.', 'For three days.', 'With my family.'],
    ['Clerk: May I help you?<br>Woman: ( )', "Yes, I'm looking for a T-shirt.", "No, I can't.", "I'm fine, thank you.", 'Here you are.'], ['Girl: Shall we go to the movies tomorrow?<br>Boy: ( )', 'Sorry, I have to study for the test.', 'Yes, I did.', 'It was interesting.', 'At the station.'],
    ['Boy: May I speak to Emi, please?<br>Woman: ( )', 'Sorry, she is out now.', 'Yes, you are.', 'Nice to meet you.', 'She speaks English well.'], ['Teacher: Why were you late this morning?<br>Boy: ( )', 'Because I got up late.', 'At eight thirty.', 'By bus.', 'Yes, I was.'],
    ['Girl: This cake is delicious. Did you make it?<br>Boy: ( )', 'No, my father did.', 'Yes, I do.', 'I like cake.', "It's on the table."], ['Boy: How long does it take to the museum?<br>Man: ( )', 'About fifteen minutes on foot.', "It's 500 yen.", 'It opens at nine.', 'On Sunday.'],
    ['Girl: I have a headache.<br>Boy: ( )', "That's too bad. You should go home.", 'Sounds good.', 'Here you are.', "I'm glad to hear that."], ['Father: Have a nice day at school.<br>Girl: ( )', 'Thanks. See you later.', 'Me, neither.', 'Nice to meet you.', 'Yes, please.'],
    ['Boy: Which do you like better, cats or dogs?<br>Girl: ( )', 'I like dogs better.', 'Yes, I do.', 'I have two.', 'They are cute.'], ['Woman: Excuse me. Where is the post office?<br>Man: ( )', "It's next to the bank.", 'It opens at nine.', "I'm going to send a letter.", 'By bus.'],
    ['Girl: Thank you for helping me.<br>Boy: ( )', 'My pleasure.', 'Yes, please.', "That's too bad.", "I'll take it."], ['Boy: What did you do last night?<br>Girl: ( )', 'I watched a soccer game on TV.', "I'm going to study.", 'I usually read books.', "At nine o'clock."],
    ["Mother: Don't forget to take your umbrella.<br>Boy: ( )", "OK, I won't.", "No, I didn't.", 'Yes, it is.', "It's mine."], ['Girl: Would you like some more tea?<br>Man: ( )', "Yes, please. It's very good.", 'Yes, I like.', 'I drank it.', "It's a cup."],
    ['Boy: Whose dictionary is this?<br>Girl: ( )', "It's Ken's.", "It's useful.", 'He is Ken.', 'On the desk.'], ['Girl: I won the tennis match yesterday.<br>Boy: ( )', "Really? That's great!", "That's too bad.", "You're welcome.", "I'm sorry to hear that."]];
  add(K4, '会話文(かいわぶん)の 文(ぶん)（4級(きゅう)）', KAI.map(b => () => fillQ(b[0], b.slice(1), b[1], '', true)),
    `英検(えいけん)4級(きゅう)の 2つめの 問題(もんだい)と 同(おな)じ 形(かたち)だよ。会話(かいわ)の（　　）に 入(はい)る 文(ぶん)を、4つから えらぼう。`,
    `さそう（Shall we 〜?）、たのむ（Can you 〜?）、すすめる（Would you like 〜?）などの 言(い)い方(かた)と、その 答(こた)え方(かた)を おぼえよう。<br>${CHOOSE}`);
  const NAR = [['わたしは きのう 母(はは)に 花(はな)を あげました。', 'I', ['gave', 'my mother', 'some', 'flowers', 'yesterday'], '.'], ['あなたは 明日(あした) 何(なに)を する つもりですか。', 'What', ['are', 'you', 'going', 'to', 'do'], 'tomorrow?'], ['ケンは クラスで いちばん 背(せ)が 高(たか)いです。', 'Ken', ['is', 'the', 'tallest', 'in', 'his class'], '.'],
    ['わたしは 今(いま) 何(なに)か 飲(の)む ものが ほしいです。', 'I', ['want', 'something', 'to', 'drink', 'now'], '.'], ['この 本(ほん)は あの 本(ほん)より おもしろいです。', 'This book', ['is', 'more', 'interesting', 'than', 'that one'], '.'], ['わたしが 家(いえ)に 帰(かえ)った とき、弟(おとうと)は ねて いました。', 'My brother', ['was', 'sleeping', 'when', 'I', 'came'], 'home.'],
    ['英語(えいご)は 多(おお)くの 国(くに)で 話(はな)されて います。', 'English', ['is', 'spoken', 'in', 'many', 'countries'], '.'], ['あなたは 宿題(しゅくだい)を しなければ なりません。', 'You', ['have', 'to', 'do', 'your', 'homework'], '.'], ['わたしは 友(とも)だちと 話(はな)すのを 楽(たの)しみました。', 'I', ['enjoyed', 'talking', 'with', 'my', 'friends'], '.'],
    ['まどを あけて くれませんか。', '', ['Will', 'you', 'open', 'the', 'window'], '?'], ['もし 明日(あした) 晴(は)れたら、海(うみ)に 行(い)きましょう。', '', ['If', 'it', 'is', 'sunny', 'tomorrow'], ", let's go to the sea."], ['わたしたちは その 犬(いぬ)を ポチと よびます。', '', ['We', 'call', 'the', 'dog', 'Pochi'], '.'],
    ['わたしは サッカーを 見(み)る ために スタジアムへ 行(い)きました。', 'I went', ['to', 'the stadium', 'to', 'watch', 'soccer'], '.'], ['かれは きのう わたしに 写真(しゃしん)を 見(み)せて くれました。', 'He', ['showed', 'me', 'some', 'pictures', 'yesterday'], '.'], ['駅(えき)まで どのくらい 時間(じかん)が かかりますか。', 'How', ['long', 'does', 'it', 'take', 'to'], 'the station?'],
    ['わたしは 将来(しょうらい) 医者(いしゃ)に なりたいです。', 'I', ['want', 'to', 'be', 'a doctor', 'in'], 'the future.'], ['この 歌(うた)は 多(おお)くの 人(ひと)に 愛(あい)されて います。', 'This song', ['is', 'loved', 'by', 'many', 'people'], '.'], ['かのじょは ケンより 速(はや)く 泳(およ)げます。', 'She', ['can', 'swim', 'faster', 'than', 'Ken'], '.'],
    ['わたしは かれが 親切(しんせつ)だと 思(おも)います。', 'I', ['think', 'that', 'he', 'is', 'kind'], '.'], ['あなたは 今日(きょう) 学校(がっこう)に 行(い)かなくても よいです。', 'You', ["don't", 'have', 'to', 'go', 'to'], 'school today.']];
  add(K4, 'ならべかえ（4級(きゅう)）', NAR.map(ord),
    `日本語(にほんご)の 文(ぶん)に 合(あ)うように、5つの ことばを ならべかえよう。`,
    `ならべた ときに ${big('2番目(ばんめ)')} と ${big('4番目(ばんめ)')} に くる ことばの 番号(ばんごう)を、じゅんに 入(い)れるよ。<br>同(おな)じ ことばが 2つ ある ときは、どちらの 番号(ばんごう)でも その 場所(ばしょ)に 入(はい)れば 同(おな)じだよ。<br>紙(かみ)に 書(か)いて ならべると まちがえにくいよ。`);

  // ---- 長文（掲示 2問・Eメール 3問・説明文 5問）。人・学校・電話番号は 架空 ----
  const box = t => `<div style="text-align:left;border:1px solid #999;border-radius:8px;padding:.6em 1em;margin:.3em auto .6em;max-width:36em;font-size:.85em;line-height:1.55">${t}</div>`;
  const P = (id, text, qs) => ({ id, text: box(text), qs });
  const NOTICE = [
    P('n1', `<b>Spring Concert</b><br>Midori Junior High School Brass Band<br><br>Date: Saturday, April 20<br>Time: 2:00 p.m. – 3:30 p.m.<br>Place: School gym<br>Tickets: 300 yen (Students: free)<br><br>Please come and enjoy our music!`,
      [['When will the concert start?', 'At 2:00 p.m.', 'At 3:30 p.m.', 'At 3:00 p.m.', 'At 4:20 p.m.'], ['How much is a ticket for students?', 'It is free.', 'It is 300 yen.', 'It is 200 yen.', 'It is 320 yen.']]),
    P('n2', `<b>Lost Dog</b><br><br>My dog, Momo, ran away from Aoba Park on Sunday morning.<br>She is small and white, and she has a red collar.<br>She likes people and never bites.<br><br>If you find her, please call Yuta Kato at 555-0147.`,
      [['Where did Momo run away from?', 'From Aoba Park.', "From Yuta's house.", 'From a pet shop.', 'From the school.'], ['What color is Momo?', 'White.', 'Red.', 'Brown.', 'Black.']]),
    P('n3', `<b>Cooking Class for Kids</b><br>Let's make pizza together!<br><br>Day: Every Wednesday in July<br>Time: 4:00 p.m. – 5:30 p.m.<br>Place: Sakura Community Center, Room 2<br>Bring: An apron and a towel<br><br>The class is for children from 10 to 15 years old.`,
      [['What will the children make in the class?', 'Pizza.', 'Curry.', 'Cake.', 'Sandwiches.'], ['What do the children need to bring?', 'An apron and a towel.', 'A pizza and a drink.', 'A notebook and a pen.', 'Some money.']])];
  const MAIL = [
    P('e1', `From: Lisa Brown<br>To: Aya Mori<br>Date: June 5<br>Subject: Saturday<br><br>Hi Aya,<br>Are you free this Saturday? My father is going to take me to the zoo. He says you can come with us. We are going to leave my house at nine. A baby panda was born there last month, and I want to see it. Please bring your lunch. We will eat it in the park near the zoo.<br>Write back soon,<br>Lisa`,
      [['Who is going to take Lisa to the zoo?', 'Her father.', 'Her mother.', "Aya's father.", 'Her teacher.'], ["What time are they going to leave Lisa's house?", 'At nine.', 'At ten.', 'At noon.', 'At five.'], ['What does Lisa want to see?', 'A baby panda.', 'A baby lion.', 'A new park.', "Aya's lunch."]]),
    P('e2', `From: Kenta<br>To: Mike<br>Date: August 21<br>Subject: Thank you<br><br>Dear Mike,<br>Thank you for the pictures of your summer vacation. The lake in Canada was very beautiful. I went to my grandmother's house in Nagano last week. I stayed there for five days. My grandmother grows vegetables, so I helped her every morning. Her tomatoes were delicious. I will send you some pictures tomorrow.<br>Your friend,<br>Kenta`,
      [['What did Mike send to Kenta?', 'Some pictures.', 'Some tomatoes.', 'A letter from Nagano.', 'A map of Canada.'], ["How long did Kenta stay at his grandmother's house?", 'For five days.', 'For a week.', 'For three days.', 'For a month.'], ['What did Kenta do every morning?', 'He helped his grandmother.', 'He swam in the lake.', 'He took pictures.', 'He cooked breakfast.']]),
    P('e3', `From: Emma<br>To: Yuki<br>Date: October 10<br>Subject: School festival<br><br>Hi Yuki,<br>How are you? Our school festival is next Friday. My class is going to sing two English songs on the stage. We practice every day after school. I was not good at singing, but my music teacher, Mr. Hill, helped me a lot. Now I like singing very much. Can you come and listen to our songs? The show starts at one thirty.<br>See you,<br>Emma`,
      [['When is the school festival?', 'Next Friday.', 'Next Sunday.', 'Every day.', 'On October 10.'], ['Who helped Emma?', 'Her music teacher.', 'Her friend Yuki.', 'Her mother.', 'Her English teacher.'], ['What time does the show start?', 'At one thirty.', 'At two thirty.', "At one o'clock.", 'After school.']])];
  const STORY = [
    P('s1', `<b>Taro's New Friend</b><br>Taro is a junior high school student. Last spring, a new student came to his class. His name was Sam, and he was from Australia. Sam could not speak Japanese well, so he looked sad at first.<br>One day, Taro saw Sam in the park. Sam was playing basketball alone. Taro likes basketball, too, so he said, "Can I join you?" Sam smiled and said, "Sure!" They played together for two hours.<br>After that, they became good friends. Taro teaches Sam Japanese, and Sam teaches Taro English. Next summer, Taro is going to visit Sam's family in Australia.`,
      [['Where was Sam from?', 'Australia.', 'America.', 'Canada.', 'Japan.'], ['Why did Sam look sad at first?', 'Because he could not speak Japanese well.', 'Because he did not like basketball.', 'Because he lost his ball.', 'Because Taro was not kind.'],
        ['What was Sam doing in the park?', 'He was playing basketball.', 'He was studying Japanese.', 'He was reading a book.', 'He was running with Taro.'], ['How long did Taro and Sam play together?', 'For two hours.', 'For one hour.', 'For two days.', 'For three hours.'],
        ['What is Taro going to do next summer?', "He is going to visit Sam's family.", 'He is going to teach English at school.', 'He is going to play in the park.', 'He is going to go to a new school.']]),
    P('s2', `<b>Mika's Garden</b><br>Mika lives with her parents and her grandfather. Her grandfather loves flowers, and he has a small garden behind the house. Last year, he hurt his leg and could not work in the garden.<br>Mika wanted to help him. She did not know much about flowers, so she borrowed three books from the library. Every Saturday, she watered the flowers and cut the grass. Her grandfather sat on a chair and taught her many things.<br>In May, the garden was full of red and yellow flowers. Her grandfather was very happy. Mika took a picture of the garden and gave it to him on his birthday.`,
      [['Where is the garden?', 'Behind the house.', 'In front of the library.', 'Near the school.', 'In the park.'], ["Why couldn't Mika's grandfather work in the garden?", 'Because he hurt his leg.', 'Because he was busy.', 'Because he did not like flowers.', 'Because it rained a lot.'],
        ['How many books did Mika borrow from the library?', 'Three.', 'Two.', 'Five.', 'Ten.'], ['When did Mika work in the garden?', 'Every Saturday.', 'Every morning.', 'Every Sunday.', 'Every day after school.'],
        ['What did Mika give to her grandfather on his birthday?', 'A picture of the garden.', 'Red and yellow flowers.', 'A book about flowers.', 'A new chair.']]),
    P('s3', `<b>The School Trip</b><br>Last October, Hiroshi went to Nara on a school trip. He went there by bus with his classmates. It took three hours.<br>In the morning, they visited an old temple. Hiroshi was surprised because the building was very big. In the park, there were many deer. Hiroshi bought some food for them, and the deer ate it from his hand.<br>In the afternoon, it started to rain, so the students went to a museum. Hiroshi bought a small bell for his sister at the shop. When he got home, he gave it to her. She liked it very much.`,
      [['How did Hiroshi go to Nara?', 'By bus.', 'By train.', 'By car.', 'By plane.'], ['Why was Hiroshi surprised?', 'Because the building was very big.', 'Because the deer were very big.', 'Because it started to rain.', 'Because the trip was short.'],
        ['What did Hiroshi buy in the park?', 'Some food for the deer.', 'A small bell.', 'A picture of the temple.', 'Lunch for his sister.'], ['Where did the students go in the afternoon?', 'To a museum.', 'To an old temple.', 'To a park.', 'To a restaurant.'],
        ['Who did Hiroshi give the bell to?', 'His sister.', 'His mother.', 'His classmate.', 'His teacher.']])];
  const pq = p => p.qs.map((q, i) => ch(`${p.text}${big(q[0])}`, q.slice(1), q[1], p.id + i, true));
  add(K4, '長文(ちょうぶん)（お知(し)らせ・メール・お話(はなし)）', [() => null],
    `英検(えいけん)4級(きゅう)の 4つめの 問題(もんだい)と 同(おな)じ 形(かたち)だよ。英語(えいご)の 文章(ぶんしょう)を 読(よ)んで、質問(しつもん)の 答(こた)えを 4つから えらぼう。`,
    `お知(し)らせ（2問(もん)）・メール（3問(もん)）・お話(はなし)（5問(もん)）が 出(で)るよ。同(おな)じ 文章(ぶんしょう)で 何問(なんもん)か つづくよ。`,
    `先(さき)に 質問(しつもん)を 読(よ)んでから、文章(ぶんしょう)の 中(なか)で 答(こた)えの 場所(ばしょ)を さがすと はやいよ。<br>When（いつ）・Where（どこ）・Who（だれ）・Why（なぜ）・How long（どのくらい）に 気(き)を つけよう。<br>${CHOOSE}`);
  const LU = UNITS[K4.units[K4.units.length - 1]];
  LU.make = () => [...pq(pick(NOTICE)), ...pq(pick(MAIL)), ...pq(pick(STORY))];
  LU.keep = true;   /* 同じ 文章の 問題が つづくように、じゅんばんを まぜない（review.js の makeExam） */
  Object.assign(EIGO, { bank, sent, mean, P, pq });   /* 中3の ファイル（content_eigo3.js）から 使う */
})();
