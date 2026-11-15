// 英語 中3（文法）と、英検3級の 形の 問題（2026年11月15日）。content_eigo2.js の あとに 読む（道具は EIGO）。
// 文法の 項目は 中学校学習指導要領（平成29年告示）外国語から（現在完了形・現在完了進行形・関係代名詞・分詞の 形容詞としての 用法・仮定法の 基本・原形不定詞・
//   It＋be動詞＋(for〜)＋to不定詞・tell／want＋目的語＋to不定詞・what などで 始まる 節・感嘆文）。学年の 分け方は Claude の めやす（仮）。
// 英検3級の 形：日本英語検定協会「3級の試験内容」（https://www.eiken.or.jp/eiken/exam/grade_3/solutions.html）の リーディング
//   短文の語句空所補充 15問・会話文の空所補充 5問・長文の内容一致選択 10問。ライティング（Eメール・英作文）は 自動で 丸つけが できないので 入れていない。リスニングも なし。
// 問題・長文は ぜんぶ Claude が 新しく 作った（過去問・本からは 写していない）。人・店・学校・電話番号などは 架空。文・講義は 仮（先生が 確かめる）。
(() => {
  const { pick, big, ch, fillQ, four, bank, sent, mean, P, pq, CHOOSE, kit } = EIGO;
  const { ser, add } = kit(9);
  const J3 = ser('x3j3', '{中|ちゅう}3 {英語|えいご}（{文法|ぶんぽう}）');

  // ---- 1. 現在完了①（経験） ----
  add(J3, '現在完了(げんざいかんりょう)①（〜した ことが ある）', [...bank([
    ['I have ( ) to Kyoto twice.', 'been', 'be', 'was'], ['Have you ever ( ) sushi?', 'eaten', 'eat', 'ate'], ['She has never ( ) a panda.', 'seen', 'saw', 'see'], ['( ) you ever visited Okinawa? — Yes, I have.', 'Have', 'Did', 'Are'],
    ['Ken ( ) climbed Mt. Fuji three times.', 'has', 'have', 'is'], ['I have ( ) played golf.（1回(かい)も 〜ない）', 'never', 'ever', 'yet'], ['Have you ( ) read this book?（今(いま)までに）', 'ever', 'never', 'once'], ['Have you ever been to Canada? — No, I ( ).', "haven't", "didn't", "don't"],
    ['My father has visited China ( ).（何回(なんかい)も）', 'many times', 'ever', 'yet'], ['I have ( ) this movie before.', 'seen', 'see', 'seeing'], ['How many times ( ) you been to Tokyo?', 'have', 'did', 'are'], ['Emi has ( ) to the museum once.', 'been', 'went', 'go'],
    ['We have ( ) him before.', 'met', 'meet', 'meeting'], ['Has Ken ever ( ) a letter in English? — Yes, he has.', 'written', 'wrote', 'write'], ['I have never ( ) such a beautiful picture.', 'seen', 'saw', 'seeing'], ['She ( ) never been abroad.', 'has', 'have', 'is']]),
    ...sent([['わたしは 2回(かい) 京都(きょうと)に 行(い)った ことが あります。', 'I have been to Kyoto twice.', 'I have be to Kyoto twice.', 'I am been to Kyoto twice.'], ['あなたは 今(いま)までに すしを 食(た)べた ことが ありますか。', 'Have you ever eaten sushi?', 'Did you ever eaten sushi?', 'Have you ever eat sushi?'],
      ['わたしは 1回(かい)も テニスを した ことが ありません。', 'I have never played tennis.', 'I never have play tennis.', "I don't have never played tennis."]]),
    ...mean([['ever', '今(いま)までに'], ['never', '1回(かい)も 〜ない'], ['once', '1回(かい)'], ['twice', '2回(かい)'], ['before', '前(まえ)に'], ['many times', '何回(なんかい)も']])],
    `${big('have（has）＋過去分詞(かこぶんし)')} の 形(かたち)を ${big('現在完了(げんざいかんりょう)')} と いうよ。1つめの 意味(いみ)は「（今(いま)までに）〜した ことが ある」。<br>${big('I have visited Kyoto twice.')}`,
    `主語(しゅご)が He・She・Ken の ときは ${big('has')}。<br>「〜に 行(い)った ことが ある」は ${big('have been to 〜')}。<br>${big('Ken has been to Canada.')}`,
    `${big('ever')} 今(いま)までに（たずねる 文(ぶん)）　${big('never')} 1回(かい)も 〜ない<br>${big('Have you ever seen a panda? — Yes, I have. / No, I haven\'t.')}<br>${big('I have never seen a panda.')}<br>${CHOOSE}`);

  // ---- 2. 現在完了②（完了） ----
  add(J3, '現在完了(げんざいかんりょう)②（〜した ところ・もう 〜した）', [...bank([
    ['I have ( ) finished my homework.（ちょうど）', 'just', 'yet', 'ever'], ['I have ( ) eaten lunch.（もう）', 'already', 'yet', 'ever'], ['Have you finished your homework ( )?（もう）', 'yet', 'ever', 'never'], ["I haven't read the book ( ).（まだ）", 'yet', 'already', 'just'],
    ['The train has just ( ).', 'arrived', 'arrive', 'arriving'], ['Ken ( ) already cleaned his room.', 'has', 'have', 'is'], ['Have you washed the dishes yet? — Yes, I ( ).', 'have', 'did', 'do'], ['Have you done your homework yet? — No, not ( ).', 'yet', 'already', 'just'],
    ["She hasn't ( ) the e-mail yet.", 'sent', 'send', 'sending'], ['I have just ( ) a letter to my aunt.', 'written', 'wrote', 'write'], ['( ) the game started yet?', 'Has', 'Did', 'Is'], ['We have already ( ) the movie.', 'seen', 'saw', 'see'],
    ['They ( ) arrived yet.', "haven't", "didn't", "aren't"], ['My mother has just ( ) home.', 'come', 'came', 'comes']]),
    ...sent([['わたしは ちょうど 宿題(しゅくだい)を 終(お)えた ところです。', 'I have just finished my homework.', 'I just have finish my homework.', 'I am just finished my homework.'], ['かれは まだ 昼(ひる)ごはんを 食(た)べて いません。', "He hasn't eaten lunch yet.", "He hasn't eaten lunch already.", "He didn't eaten lunch yet."]]),
    ...mean([['just', 'ちょうど'], ['already', 'もう（ふつうの 文(ぶん)）'], ['not 〜 yet', 'まだ 〜して いない'], ['Have you 〜 yet?', 'もう 〜しましたか']])],
    `現在完了(げんざいかんりょう)の 2つめの 意味(いみ)は「（ちょうど）〜した ところ」「（もう）〜して しまった」。<br>${big('I have just finished my homework.')}<br>${big('I have already eaten lunch.')}`,
    `${big('just')} ちょうど　${big('already')} もう　→ have と 過去分詞(かこぶんし)の 間(あいだ)に おく。<br>${big('yet')} → 文(ぶん)の さいごに おく。たずねる 文(ぶん)では「もう」、not の 文(ぶん)では「まだ」。`,
    `${big('Have you finished your homework yet?')}（もう 終(お)わった？）<br>${big("— No, not yet. / No, I haven't.")}（まだだよ。）<br>${CHOOSE}`);

  // ---- 3. 現在完了③（継続）・現在完了進行形 ----
  const FOR = ['three days', 'a week', 'two years', 'a long time', 'five hours', 'six months'], SIN = ['yesterday', 'last week', '2023', 'this morning', 'last Sunday', 'I was a child'];
  add(J3, '現在完了(げんざいかんりょう)③（ずっと 〜して いる）', [
    () => { const k = rand(0, 1), x = pick(k ? SIN : FOR), s = pick(['I have been here', 'Ken has lived in this town', 'We have been friends', 'She has been busy']); return fillQ(`${s} ( ) ${x}.`, ['for', 'since', 'from'], k ? 'since' : 'for'); },
    ...bank([['How ( ) have you lived here? — For five years.', 'long', 'many', 'much'], ['She has ( ) sick since yesterday.', 'been', 'be', 'was'], ['I have ( ) this bike for three years.', 'used', 'use', 'using'], ['It has been ( ) since this morning.', 'raining', 'rain', 'rained'],
      ['I have been ( ) for Ken for an hour.', 'waiting', 'wait', 'waited'], ['How long have you ( ) studying English?', 'been', 'be', 'are'], ['( ) Emi lived in Kobe for a long time? — Yes, she has.', 'Has', 'Did', 'Is'], ['Ken has been ( ) TV for two hours.', 'watching', 'watched', 'watch'],
      ['I have ( ) Ken since 2022.', 'known', 'knew', 'knowing'], ['My brother ( ) wanted a dog for a long time.', 'has', 'have', 'is']]),
    ...sent([['わたしは 10年間(ねんかん) 明石(あかし)に 住(す)んで います。', 'I have lived in Akashi for ten years.', 'I have lived in Akashi since ten years.', 'I am lived in Akashi for ten years.'], ['けさから ずっと 雨(あめ)が ふって います。', 'It has been raining since this morning.', 'It has raining since this morning.', 'It is been raining for this morning.']]),
    ...mean([['for 〜', '〜の 間(あいだ)'], ['since 〜', '〜から（ずっと）'], ['How long 〜?', 'どのくらい（長(なが)く）']])],
    `現在完了(げんざいかんりょう)の 3つめの 意味(いみ)は「（前(まえ)から 今(いま)まで）ずっと 〜して いる」。<br>${big('I have lived in Akashi for ten years.')}`,
    `${big('for')}＋長(なが)さ（for ten years・for a long time）<br>${big('since')}＋はじまった 時(とき)（since 2020・since yesterday）<br>${big('How long have you lived here?')}`,
    `動(うご)きが ずっと つづいて いる ときは、${big('have been ＋ 〜ing')}（現在完了進行形(げんざいかんりょうしんこうけい)）。<br>${big('It has been raining since this morning.')}<br>${CHOOSE}`);

  // ---- 4. 分詞の 後置修飾 ----
  add(J3, '名詞(めいし)を 説明(せつめい)する 〜ing・過去分詞(かこぶんし)', [...bank([
    ['The boy ( ) soccer over there is Ken.', 'playing', 'played', 'plays'], ['This is a book ( ) by a famous writer.', 'written', 'writing', 'wrote'], ['Look at the dog ( ) under the tree.', 'sleeping', 'slept', 'sleeps'], ['I have a watch ( ) in Japan.', 'made', 'making', 'makes'],
    ['The girl ( ) a book is my sister.', 'reading', 'reads', 'to read'], ['English is a language ( ) all over the world.', 'spoken', 'speaking', 'speaks'], ['Who is the man ( ) with Ms. Sato?', 'talking', 'talked', 'talks'], ['These are pictures ( ) in Okinawa.', 'taken', 'taking', 'took'],
    ['The woman ( ) a red hat is my aunt.', 'wearing', 'worn', 'wears'], ['I ate a cake ( ) by my mother.', 'made', 'making', 'make'], ['The baby ( ) in the bed is cute.', 'sleeping', 'slept', 'sleep'], ['This is a temple ( ) 600 years ago.', 'built', 'building', 'builds'],
    ['Do you know the girl ( ) the piano?', 'playing', 'played', 'plays'], ['I got a letter ( ) in English.', 'written', 'writing', 'write'], ['The students ( ) in the park are my classmates.', 'running', 'ran', 'run'], ['This is a song ( ) by many people.', 'loved', 'loving', 'loves']]),
    ...sent([['あそこで 走(はし)って いる 男(おとこ)の子(こ)は ケンです。', 'The boy running over there is Ken.', 'The boy run over there is Ken.', 'The boy is running over there is Ken.'], ['これは 母(はは)が 作(つく)った ケーキです。', 'This is a cake made by my mother.', 'This is a cake making by my mother.', 'This is a made cake by my mother.']])],
    `名詞(めいし)の あとに 〜ing の まとまりを おくと、「〜して いる …」と 説明(せつめい)できるよ。<br>${big('the boy playing soccer')}（サッカーを して いる 男(おとこ)の子(こ)）<br>${big('The boy playing soccer is Ken.')}`,
    `過去分詞(かこぶんし)の まとまりを おくと、「〜された …」と 説明(せつめい)できるよ。<br>${big('a book written in English')}（英語(えいご)で 書(か)かれた 本(ほん)）<br>${big('This is a watch made in Japan.')}`,
    `見分(みわ)け方(かた)：その 名詞(めいし)が「する」なら 〜ing、「される」なら 過去分詞(かこぶんし)。<br>${big('the girl reading a book')}（女(おんな)の子(こ)が 読(よ)む）<br>${big('the language spoken in Canada')}（ことばが 話(はな)される）<br>${CHOOSE}`);

  // ---- 5. 関係代名詞①（主格） ----
  add(J3, '関係代名詞(かんけいだいめいし)①（who・which・that）', [...bank([
    ['I have a friend ( ) lives in Canada.', 'who', 'which', 'whose'], ['This is a bus ( ) goes to the station.', 'which', 'who', 'whose'], ['The girl ( ) is singing is Emi.', 'who', 'which', 'what'], ['I want a house ( ) has a big garden.', 'which', 'who', 'what'],
    ['He is the teacher ( ) teaches us English.', 'who', 'which', 'what'], ['This is the book ( ) made me happy.', 'that', 'who', 'what'], ['I know a boy who ( ) three languages.', 'speaks', 'speak', 'speaking'], ['These are the pictures which ( ) taken in Kyoto.', 'were', 'was', 'is'],
    ['The people who ( ) in this town are kind.', 'live', 'lives', 'living'], ['I have a dog that ( ) very fast.', 'runs', 'run', 'running'], ['Do you know the woman ( ) is standing by the door?', 'who', 'which', 'whose'], ['Kyoto is a city ( ) has many temples.', 'which', 'who', 'what'],
    ['The boy ( ) won the race is my brother.', 'who', 'which', 'what'], ['This is a movie ( ) is popular in Japan.', 'that', 'who', 'what']]),
    ...sent([['わたしには カナダに 住(す)んで いる 友(とも)だちが います。', 'I have a friend who lives in Canada.', 'I have a friend which lives in Canada.', 'I have a friend who live in Canada.'], ['これは 駅(えき)に 行(い)く バスです。', 'This is a bus which goes to the station.', 'This is a bus who goes to the station.', 'This is a bus which go to the station.']])],
    `名詞(めいし)を 文(ぶん)で 説明(せつめい)する ときは、名詞(めいし)の あとに ${big('who・which・that')} を おいて つなぐよ。これを ${big('関係代名詞(かんけいだいめいし)')} と いうよ。<br>${big('I have a friend who lives in Canada.')}`,
    `説明(せつめい)する 名詞(めいし)が<br>・人(ひと) → ${big('who')}（that でも よい）<br>・もの・動物(どうぶつ) → ${big('which')}（that でも よい）<br>${big('This is a bus which goes to the station.')}`,
    `who・which の あとの 動詞(どうし)は、前(まえ)の 名詞(めいし)に 合(あ)わせるよ。<br>${big('a boy who speaks English')}（1人(にん)）<br>${big('the people who live here')}（何人(なんにん)も）<br>${CHOOSE}`);

  // ---- 6. 関係代名詞②（目的格・省略） ----
  add(J3, '関係代名詞(かんけいだいめいし)②（わたしが 〜した …）', [...bank([
    ['This is the book ( ) I bought yesterday.', 'which', 'who', 'what'], ['The man ( ) I met yesterday was kind.', 'that', 'which', 'what'], ['This is the picture ( ) Ken took.', 'that', 'who', 'what'], ['The movie ( ) we saw last night was exciting.', 'which', 'who', 'when'],
    ['Show me the bag ( ) you bought.', 'that', 'who', 'what'], ['The cake which my mother ( ) was delicious.', 'made', 'making', 'was made'], ['The book I ( ) yesterday was interesting.', 'read', 'reading', 'was read'], ['Is this the watch ( ) lost?', 'you', 'your', 'yours'],
    ['The boy ( ) is my cousin.', 'I met yesterday', 'met I yesterday', 'I met him yesterday'], ['The song ( ) the best is this one.', 'I like', 'like I', 'I like it'], ['This is the letter ( ).', 'Emi wrote', 'wrote Emi', 'Emi wrote it'], ['That is the house ( ) my uncle built.', 'which', 'who', 'whose'],
    ['The people ( ) we met in Kyoto were friendly.', 'that', 'which', 'what'], ['Everything ( ) he said was true.', 'that', 'who', 'what']]),
    ...sent([['これは わたしが きのう 買(か)った 本(ほん)です。', 'This is the book I bought yesterday.', 'This is the book I bought it yesterday.', 'This is I bought the book yesterday.'], ['ケンが とった 写真(しゃしん)は きれいです。', 'The picture Ken took is beautiful.', 'The picture took Ken is beautiful.', 'Ken took the picture is beautiful.']])],
    `「わたしが きのう 買(か)った 本(ほん)」のように、名詞(めいし)を「だれが 〜した」で 説明(せつめい)する ことも できるよ。<br>${big('the book which I bought yesterday')}`,
    `この ときの which・that は、はぶく ことが できるよ。<br>${big('This is the book (that) I bought yesterday.')}<br>${big('The picture Ken took is beautiful.')}`,
    `気(き)を つけよう：説明(せつめい)の まとまりの 中(なか)に、it・him を もう一度(いちど) 入(い)れない。<br>× the book I bought it<br>○ the book I bought<br>${CHOOSE}`);

  // ---- 7. 間接疑問文 ----
  add(J3, '間接疑問文(かんせつぎもんぶん)（I know where 〜）', [...bank([
    ['I know where ( ).', 'he lives', 'does he live', 'lives he'], ["I don't know what ( ).", 'this is', 'is this', 'does this'], ['Do you know who ( )?', 'she is', 'is she', 'does she'], ['Tell me when ( ).', 'the party starts', 'does the party start', 'starts the party'],
    ["I don't know why ( ) late.", 'he was', 'was he', 'did he'], ['Do you know what time ( )?', 'it is', 'is it', 'does it'], ['I want to know how ( ) to school.', 'she comes', 'does she come', 'comes she'], ['Please tell me where ( ) yesterday.', 'you went', 'did you go', 'went you'],
    ['I wonder what ( ) now.', 'Ken is doing', 'is Ken doing', 'Ken doing'], ['Do you know ( ) he lives?（どこに）', 'where', 'what', 'who'], ["I don't know ( ) she will come.（いつ）", 'when', 'which', 'what'], ['Can you tell me ( ) this word means?（何(なに)を）', 'what', 'where', 'who'],
    ['I know ( ) broke the window.（だれが）', 'who', 'when', 'where'], ['Do you know how old ( )?', 'he is', 'is he', 'does he'], ['I asked her what ( ).', 'she wanted', 'did she want', 'wanted she']]),
    ...sent([['わたしは かれが どこに 住(す)んで いるか 知(し)って います。', 'I know where he lives.', 'I know where does he live.', 'I know he lives where.'], ['あなたは これが 何(なに)か 知(し)って いますか。', 'Do you know what this is?', 'Do you know what is this?', 'Do you know this is what?']])],
    `what・where などで はじまる まとまりを、文(ぶん)の 中(なか)に 入(い)れる ことが できるよ。<br>${big('I know where he lives.')}（かれが どこに 住(す)んで いるか 知(し)って いる。）`,
    `文(ぶん)の 中(なか)に 入(はい)ると、ならび方(かた)が ${big('疑問詞(ぎもんし)＋主語(しゅご)＋動詞(どうし)')} に なるよ（ふつうの 文(ぶん)の じゅん）。<br>${big('Where does he live?')}<br>→ ${big('I know where he lives.')}（× where does he live）`,
    `${big('What is this?')} → ${big("I don't know what this is.")}<br>${big('When will she come?')} → ${big('Do you know when she will come?')}<br>${CHOOSE}`);

  // ---- 8. 仮定法 ----
  add(J3, '仮定法(かていほう)（もし 〜なら・〜なら いいのに）', [...bank([
    ['If I ( ) a bird, I could fly to you.', 'were', 'am', 'will be'], ['If I had a lot of money, I ( ) buy a big house.', 'would', 'will', 'can'], ['I wish I ( ) speak English well.', 'could', 'can', 'will'], ['If I ( ) you, I would study harder.', 'were', 'am', 'be'],
    ['I wish I ( ) a brother.', 'had', 'have', 'has'], ['If it ( ) sunny today, we could play tennis.（今日(きょう)は 雨(あめ)）', 'were', 'is', 'will be'], ['If I knew her address, I ( ) write to her.', 'would', 'will', 'am'], ['I wish it ( ) Sunday today.', 'were', 'is', 'will be'],
    ['If I ( ) time, I would help you.', 'had', 'have', 'will have'], ['What would you do if you ( ) a million yen?', 'had', 'have', 'will have'], ['I wish I ( ) fly like a bird.', 'could', 'can', 'am'], ['If I lived near the sea, I ( ) swim every day.', 'could', 'can', 'will'],
    ['If I were rich, I ( ) travel around the world.', 'would', 'will', 'do'], ['I wish I ( ) taller.', 'were', 'am', 'will be'], ['If it ( ) sunny tomorrow, I will go fishing.（ほんとうに ありそうな こと）', 'is', 'were', 'will be']]),
    ...sent([['もし わたしが 鳥(とり)なら、空(そら)を とべるのに。', 'If I were a bird, I could fly in the sky.', 'If I am a bird, I can fly in the sky.', 'If I were a bird, I can fly in the sky.'], ['英語(えいご)を じょうずに 話(はな)せたら いいのに。', 'I wish I could speak English well.', 'I wish I can speak English well.', 'I wish I speak English well.']])],
    `ほんとうでは ない ことを「もし 〜なら、…なのに」と 言(い)う ときは、動詞(どうし)を 過去形(かこけい)に するよ。これを ${big('仮定法(かていほう)')} と いうよ。<br>${big('If I had a lot of money, I would buy a big house.')}`,
    `形(かたち)：${big('If ＋ 主語(しゅご) ＋ 過去形(かこけい), 主語(しゅご) ＋ would（could）＋ 動詞(どうし)の もとの 形(かたち)')}<br>be動詞(どうし)は、主語(しゅご)が I でも ${big('were')} を 使(つか)うよ。<br>${big('If I were you, I would study harder.')}`,
    `「〜なら いいのに」は ${big('I wish ＋ 主語(しゅご) ＋ 過去形(かこけい)')}。<br>${big('I wish I could fly.')}<br>ほんとうに ありそうな ことは、ふつうの if の 文(ぶん)。<br>${big('If it is sunny tomorrow, I will go fishing.')}<br>${CHOOSE}`);

  // ---- 9. 原形不定詞 ----
  add(J3, 'let・make・help ＋ 人(ひと) ＋ 動詞(どうし)', [...bank([
    ['My mother let me ( ) to the party.', 'go', 'to go', 'going'], ['Ken helped me ( ) my homework.', 'do', 'doing', 'did'], ['The teacher made us ( ) the room.', 'clean', 'to clean', 'cleaning'], ['Let me ( ) myself.', 'introduce', 'to introduce', 'introducing'],
    ['I helped my father ( ) the car.', 'wash', 'washing', 'washed'], ['My father made me ( ) English every day.', 'study', 'to study', 'studied'], ['Please let ( ) know your address.', 'me', 'I', 'my'], ['She helped ( ) carry the bags.', 'us', 'we', 'our'],
    ['This song makes me ( ) happy.', 'feel', 'to feel', 'feeling'], ["Let's help them ( ) the park.", 'clean', 'cleaning', 'cleaned'], ['My parents let me ( ) a dog.', 'have', 'to have', 'having'], ['The news made her ( ).', 'cry', 'to cry', 'cried'],
    ['Can you help me ( ) for my key?', 'look', 'looking', 'looked'], ['Let me ( ) your new bike.', 'see', 'to see', 'seeing']]),
    ...mean([['let ＋ 人(ひと) ＋ 動詞(どうし)', '（人(ひと)）に 〜させて あげる（ゆるす）'], ['make ＋ 人(ひと) ＋ 動詞(どうし)', '（人(ひと)）に（むりにでも）〜させる'], ['help ＋ 人(ひと) ＋ 動詞(どうし)', '（人(ひと)）が 〜するのを 手伝(てつだ)う']]),
    ...sent([['母(はは)は わたしを パーティーに 行(い)かせて くれました。', 'My mother let me go to the party.', 'My mother let me to go to the party.', 'My mother let I go to the party.'], ['ケンは わたしが 宿題(しゅくだい)を するのを 手伝(てつだ)って くれました。', 'Ken helped me do my homework.', 'Ken helped my do homework.', 'Ken helped me did my homework.']])],
    `${big('let・make・help ＋ 人(ひと) ＋ 動詞(どうし)の もとの 形(かたち)')}<br>to を つけない もとの 形(かたち)を 使(つか)うよ。<br>${big('My mother let me go to the party.')}`,
    `${big('let')} 〜させて あげる（ゆるす）<br>${big('make')} （むりにでも）〜させる<br>${big('help')} 〜するのを 手伝(てつだ)う<br>${big('The teacher made us clean the room.　Ken helped me do my homework.')}`,
    `${big('Let me 〜.')} は「わたしに 〜させて ください」。<br>${big('Let me introduce myself.')}（自己紹介(じこしょうかい)させて ください。）<br>${CHOOSE}`);

  // ---- 10. It is … to 〜 ----
  add(J3, 'It is …（for 人(ひと)）to 〜', [...bank([
    ['It is important ( ) English.', 'to study', 'study', 'studies'], ['( ) is fun to play soccer.', 'It', 'This', 'That'], ['It is difficult ( ) me to get up early.', 'for', 'to', 'at'], ['It is easy for ( ) to swim.', 'him', 'he', 'his'],
    ['It was hard for Ken ( ) the question.', 'to answer', 'answer', 'answered'], ['Is it difficult ( ) Japanese?', 'to learn', 'learn', 'learned'], ['It is necessary for us ( ) water.', 'to save', 'save', 'saving'], ['It is ( ) to swim in this river.（きけん）', 'dangerous', 'danger', 'dangerously'],
    ['It ( ) exciting to watch the game yesterday.', 'was', 'is', 'were'], ["It isn't easy ( ) a foreign language.", 'to speak', 'speaks', 'spoke'], ['It is interesting for ( ) to read books.', 'me', 'I', 'my'], ['It takes time ( ) a language.', 'to learn', 'learn', 'learned']]),
    ...sent([['英語(えいご)を 勉強(べんきょう)する ことは 大切(たいせつ)です。', 'It is important to study English.', 'It is important study English.', 'This is important to study English.'], ['わたしに とって 早(はや)く 起(お)きる ことは むずかしいです。', 'It is difficult for me to get up early.', 'It is difficult to me for get up early.', 'It is difficult for I to get up early.'],
      ['この 川(かわ)で 泳(およ)ぐ ことは きけんです。', 'It is dangerous to swim in this river.', 'It is dangerous swimming to this river.', 'It dangerous is to swim in this river.']])],
    `「〜する ことは …だ」は、${big('It is … to 〜.')} で 言(い)えるよ。<br>${big('It is important to study English.')}<br>はじめの It は「それ」と 訳(やく)さないよ。to より あとを さして いるよ。`,
    `「（人(ひと)）に とって」は、to の 前(まえ)に ${big('for ＋ 人(ひと)')}。<br>${big('It is difficult for me to get up early.')}<br>人(ひと)の ところは me・him・her・us・them の 形(かたち)。`,
    `前(まえ)の ことは was。<br>${big('It was exciting to watch the game.')}<br>${CHOOSE}`);

  // ---- 11. want・tell・ask ＋ 人 ＋ to ----
  add(J3, 'want・tell・ask ＋ 人(ひと) ＋ to 〜', [...bank([
    ['I want you ( ) me.', 'to help', 'help', 'helping'], ['My mother told me ( ) my room.', 'to clean', 'clean', 'cleaned'], ['Ken asked me ( ) the window.', 'to open', 'open', 'opening'], ['I want ( ) to come to the party.', 'him', 'he', 'his'],
    ['The teacher told ( ) to be quiet.', 'us', 'we', 'our'], ['She asked her father ( ) her a bike.', 'to buy', 'buy', 'bought'], ['My father told me ( ) TV too much.', 'not to watch', "don't watch", 'to not watching'], ['Do you want me ( ) the door?', 'to close', 'close', 'closing'],
    ['I asked Emi ( ) me her notebook.', 'to show', 'show', 'showed'], ['Our teacher wants us ( ) many books.', 'to read', 'read', 'reading'], ['Mr. Sato told the students ( ) in the hall.', 'not to run', 'not run', "don't run"], ['I would like you ( ) this letter.', 'to read', 'read', 'reading'],
    ['My mother wants ( ) to be a doctor.', 'me', 'I', 'my']]),
    ...mean([['want ＋ 人(ひと) ＋ to 〜', '（人(ひと)）に 〜して ほしい'], ['tell ＋ 人(ひと) ＋ to 〜', '（人(ひと)）に 〜するように 言(い)う'], ['ask ＋ 人(ひと) ＋ to 〜', '（人(ひと)）に 〜するように たのむ']]),
    ...sent([['わたしは あなたに 手伝(てつだ)って ほしいです。', 'I want you to help me.', 'I want to you help me.', 'I want you help me.'], ['母(はは)は わたしに 部屋(へや)を そうじするように 言(い)いました。', 'My mother told me to clean my room.', 'My mother told to me clean my room.', 'My mother told me clean my room.']])],
    `${big('want ＋ 人(ひと) ＋ to 〜')}「（人(ひと)）に 〜して ほしい」<br>${big('I want you to help me.')}<br>${big('I want to help you.')}（わたしが 手伝(てつだ)いたい）と くらべよう。`,
    `${big('tell ＋ 人(ひと) ＋ to 〜')}「（人(ひと)）に 〜するように 言(い)う」<br>${big('ask ＋ 人(ひと) ＋ to 〜')}「（人(ひと)）に 〜するように たのむ」<br>${big('My mother told me to clean my room.')}`,
    `「〜しないように」は、to の 前(まえ)に not。<br>${big('My father told me not to watch TV too much.')}<br>${CHOOSE}`);

  // ---- 12. 疑問詞 ＋ to ----
  add(J3, 'how to 〜・what to 〜', [...bank([
    ['I know ( ) to use this computer.（使(つか)い方(かた)）', 'how', 'what', 'who'], ["I don't know ( ) to do next.（何(なに)を）", 'what', 'how', 'where'], ['Please tell me ( ) to go.（どこへ）', 'where', 'what', 'who'], ['Do you know ( ) to start?（いつ）', 'when', 'what', 'who'],
    ['Can you teach me how ( ) curry?', 'to cook', 'cook', 'cooking'], ['I learned how ( ) from my father.', 'to swim', 'swim', 'swam'], ["She didn't know what ( ).", 'to say', 'say', 'said'], ['Tell me ( ) to get to the station.（行(い)き方(かた)）', 'how', 'what', 'who'],
    ['I want to know ( ) to buy for her birthday.（何(なに)を）', 'what', 'how', 'when'], ['Ken showed me how ( ) the game.', 'to play', 'play', 'played'], ["We didn't know ( ) bus to take.（どの）", 'which', 'how', 'where'], ['Do you know how ( ) this word?', 'to read', 'read', 'reading']]),
    ...mean([['how to 〜', '〜の しかた・どう 〜すれば よいか'], ['what to 〜', '何(なに)を 〜すれば よいか'], ['where to 〜', 'どこで・どこへ 〜すれば よいか'], ['when to 〜', 'いつ 〜すれば よいか']]),
    ...sent([['わたしは この コンピューターの 使(つか)い方(かた)を 知(し)って います。', 'I know how to use this computer.', 'I know how use this computer.', 'I know to how use this computer.'], ['わたしは 何(なに)を すれば よいか わかりません。', "I don't know what to do.", "I don't know what do.", "I don't know to do what."]])],
    `${big('how to ＋ 動詞(どうし)の もとの 形(かたち)')} で「〜の しかた」。<br>${big('I know how to use this computer.')}（この コンピューターの 使(つか)い方(かた)を 知(し)って いる。）`,
    `ほかの 疑問詞(ぎもんし)でも 同(おな)じ 形(かたち)が 作(つく)れるよ。<br>${big('what to do')} 何(なに)を すれば よいか<br>${big('where to go')} どこへ 行(い)けば よいか<br>${big('when to start')} いつ はじめれば よいか`,
    `know・tell・teach・show・learn の あとに よく 使(つか)うよ。<br>${big('Please tell me where to go.')}<br>${CHOOSE}`);

  // ---- 13. 感嘆文 ----
  add(J3, '感嘆文(かんたんぶん)（What 〜!・How 〜!）', bank([
    ['( ) a beautiful flower this is!', 'What', 'How', 'Which'], ['( ) beautiful this flower is!', 'How', 'What', 'Which'], ['( ) fast he runs!', 'How', 'What', 'Who'], ['( ) a kind boy he is!', 'What', 'How', 'Who'],
    ['( ) tall that tower is!', 'How', 'What', 'Which'], ['( ) an interesting book!', 'What', 'How', 'Why'], ['( ) cute!', 'How', 'What', 'Who'], ['( ) a nice day!', 'What', 'How', 'When'],
    ['What ( ) big dog!', 'a', 'an', 'the'], ['What ( ) old house!', 'an', 'a', 'the'], ['How well she ( )!', 'sings', 'sing', 'singing'], ['What beautiful ( ) these are!', 'flowers', 'flower', 'a flower'],
    ['( ) a difficult question this is!', 'What', 'How', 'Why'], ['( ) kind you are!', 'How', 'What', 'Who']]),
    `「なんて 〜なんだろう！」と おどろきを 言(い)う 文(ぶん)を ${big('感嘆文(かんたんぶん)')} と いうよ。さいごは「！」。<br>${big('What a beautiful flower!')}<br>${big('How beautiful!')}`,
    `${big('What ＋ a（an）＋ ようす ＋ 名詞(めいし)!')}　→ あとに 名詞(めいし)（もの・人(ひと)）が ある<br>${big('How ＋ ようす!')}　→ 名詞(めいし)が ない`,
    `あとに 主語(しゅご)＋動詞(どうし)を つづける ことも あるよ。<br>${big('What a kind boy he is!')}<br>${big('How fast he runs!')}<br>${CHOOSE}`);

  // ================= 英検3級の 形（読む 問題） =================
  const K3 = ser('x3k3', '{英検|えいけん}3{級|きゅう}の {形|かたち}（{読|よ}む {問題|もんだい}）');
  const TAN = [["The museum is ( ) on Mondays, so we can't go today.", 'closed', 'crowded', 'famous', 'expensive'], ['Ken ( ) his leg while he was playing soccer.', 'hurt', 'spent', 'shared', 'chose'], ["I'd like to ( ) a table for four at seven o'clock.", 'reserve', 'repair', 'receive', 'remember'],
    ['My sister is ( ) in Japanese history.', 'interested', 'afraid', 'proud', 'tired'], ['A: Could you ( ) me the salt?　B: Sure. Here you are.', 'pass', 'lose', 'wear', 'hold'], ['We must ( ) the environment for the future.', 'protect', 'produce', 'promise', 'practice'],
    ['The ( ) of this town is about 50,000.', 'population', 'temperature', 'distance', 'direction'], ['I ( ) with you. Your idea is very good.', 'agree', 'fight', 'stay', 'travel'], ['It rained heavily, so the game was ( ).', 'canceled', 'invited', 'invented', 'collected'],
    ['He ( ) to tell me his new phone number.', 'forgot', 'enjoyed', 'finished', 'minded'], ['This machine was ( ) about 100 years ago.', 'invented', 'invited', 'graduated', 'traveled'], ['Please be ( ) when you cross the street.', 'careful', 'useful', 'peaceful', 'colorful'],
    ['I ( ) my grandparents in Hokkaido during the winter vacation.', 'visited', 'happened', 'arrived', 'agreed'], ['A: What is the ( ) of your visit?　B: Sightseeing.', 'purpose', 'memory', 'habit', 'prize'], ['My father ( ) me how to ride a bike.', 'taught', 'learned', 'studied', 'spoke'],
    ['She was ( ) to hear the news.', 'surprised', 'surprising', 'interesting', 'exciting'], ['Many people ( ) from hunger in the world.', 'suffer', 'differ', 'offer', 'prefer'], ['A: May I ( ) a message?　B: Yes. Please tell him to call me back.', 'take', 'speak', 'say', 'hear'],
    ['This bridge ( ) the island and the city.', 'connects', 'collects', 'corrects', 'contains'], ['We ( ) the summer festival every year.', 'look forward to', 'take care of', 'are afraid of', 'are different from'], ['He ( ) up smoking for his health.', 'gave', 'took', 'got', 'made'],
    ['The train was ( ) because of the snow.', 'delayed', 'decided', 'designed', 'delivered'], ['Would you ( ) opening the window?', 'mind', 'care', 'like', 'want'], ['I ( ) to go to the party, but I was sick.', 'wanted', 'enjoyed', 'finished', 'minded'],
    ['The ( ) from the top of the mountain was beautiful.', 'view', 'voice', 'price', 'prize'], ['She is ( ) of dogs because one bit her before.', 'afraid', 'proud', 'full', 'fond'], ['I ( ) my homework to my teacher this morning.', 'handed in', 'put on', 'turned off', 'got up'],
    ['Eating too much sugar is ( ) for your health.', 'bad', 'kind', 'late', 'free'], ['Please ( ) your hand if you have a question.', 'raise', 'rise', 'grow', 'climb'], ['He ( ) the race and got a gold medal.', 'won', 'lost', 'missed', 'failed']];
  add(K3, '短文(たんぶん)の 語句(ごく)（単語(たんご)・3級(きゅう)）', four(TAN),
    `英検(えいけん)3級(きゅう)の 1つめの 問題(もんだい)と 同(おな)じ 形(かたち)だよ。文(ぶん)の（　　）に 入(はい)る ことばを、4つから えらぼう。`,
    `にた つづりの ことば（invented・invited など）や、look forward to（〜を 楽(たの)しみに する）のような 言(い)い方(かた)も 出(で)るよ。<br>${CHOOSE}`);
  const BUN = [['I have ( ) finished my homework.', 'already', 'yet', 'ever', 'since'], ['This is the boy ( ) won the speech contest.', 'who', 'which', 'what', 'when'], ['The girl ( ) the piano is my sister.', 'playing', 'played', 'plays', 'play'],
    ["I don't know where ( ).", 'he lives', 'does he live', 'lives he', 'he live'], ['If I ( ) you, I would not do that.', 'were', 'am', 'be', 'will be'], ['My mother told me ( ) home early.', 'to come', 'come', 'came', 'coming'],
    ['It is important ( ) us to help each other.', 'for', 'to', 'with', 'by'], ['Have you ever ( ) to Hokkaido?', 'been', 'be', 'went', 'go'], ['This book was ( ) by a famous writer.', 'written', 'wrote', 'write', 'writing'],
    ['I have known him ( ) ten years.', 'for', 'since', 'from', 'at'], ['Do you know how ( ) this machine?', 'to use', 'use', 'using', 'used'], ['The cake ( ) my mother made was delicious.', 'that', 'who', 'what', 'it'],
    ['I wish I ( ) play the guitar.', 'could', 'can', 'will', 'may'], ['Let me ( ) you my new bike.', 'show', 'to show', 'showing', 'showed'], ['She has been ( ) English for three hours.', 'studying', 'studied', 'study', 'studies'],
    ['Ken is one of the ( ) players in his team.', 'best', 'better', 'good', 'well'], ['( ) a beautiful picture!', 'What', 'How', 'Which', 'Why'], ['I want you ( ) with me.', 'to come', 'come', 'coming', 'came'],
    ['This is the most interesting movie I have ever ( ).', 'seen', 'saw', 'see', 'seeing'], ['The language ( ) in Australia is English.', 'spoken', 'speaking', 'speaks', 'spoke'], ["I'm looking forward to ( ) you again.", 'seeing', 'see', 'saw', 'seen'],
    ['He is too tired ( ) his homework.', 'to do', 'doing', 'do', 'did'], ['A: Has Emi arrived yet?　B: No, she ( ).', "hasn't", "isn't", "didn't", "doesn't"], ['Both Ken ( ) Tom like soccer.', 'and', 'or', 'but', 'so'],
    ['My brother is good at ( ) pictures.', 'drawing', 'draw', 'drew', 'to draw'], ['It has been raining ( ) this morning.', 'since', 'for', 'during', 'until'], ['My father helped me ( ) my bike.', 'fix', 'fixing', 'fixed', 'fixes'],
    ["This question is so difficult ( ) I can't answer it.", 'that', 'which', 'what', 'because'], ['A: ( ) have you lived in this town?　B: For five years.', 'How long', 'How many', 'How far', 'How often'], ["I don't know what ( ) next.", 'to do', 'do', 'doing', 'did']];
  add(K3, '短文(たんぶん)の 語句(ごく)（文法(ぶんぽう)・3級(きゅう)）', four(BUN),
    `文(ぶん)の（　　）に 入(はい)る ことばを、4つから えらぼう。中学(ちゅうがく)3年(ねん)までの 文法(ぶんぽう)が 出(で)るよ。`,
    `have の あとは 過去分詞(かこぶんし)、to の あとは もとの 形(かたち)、前置詞(ぜんちし)の あとは 〜ing、のように 前(まえ)の ことばを 手(て)がかりに しよう。<br>${CHOOSE}`);
  const KAI = [["Girl: Have you finished your science report yet?<br>Boy: ( )", "Not yet. I'll do it tonight.", 'Yes, I do.', 'It was last week.', 'For three hours.'], ['Boy: Would you like to come to my house for dinner?<br>Girl: ( )', "I'd love to. Thank you.", 'It was delicious.', 'Yes, I did.', 'Here it is.'],
    ['Man: Excuse me. Could you tell me how to get to the city library?<br>Woman: ( )', 'Sure. Go straight and turn left at the bank.', 'It has many books.', 'I went there yesterday.', 'It takes two weeks.'], ['Girl: How long have you been playing the violin?<br>Boy: ( )', 'Since I was six.', 'Twice a week.', 'For my concert.', "Until five o'clock."],
    ['Mother: You have a fever. You should go to bed.<br>Boy: ( )', 'OK. I will.', "I'm glad to hear that.", 'Sounds fun.', 'Not at all.'], ['Boy: I heard you won the speech contest. Congratulations!<br>Girl: ( )', 'Thank you. I practiced a lot.', "That's too bad.", "You're welcome.", 'Good luck.'],
    ['Clerk: How would you like to pay?<br>Man: ( )', 'By credit card, please.', "It's too expensive.", "I'll take two.", "Yes, I'd like to."], ['Girl: Do you mind if I open the window?<br>Boy: ( )', 'Not at all. Go ahead.', 'I opened it.', "It's by the window.", 'Me, too.'],
    ['Boy: What do you think of this T-shirt?<br>Girl: ( )', 'It looks good on you.', 'I think so, too.', 'I bought it.', 'Yes, I do.'], ['Woman: Hello. This is Mary. May I speak to Mr. Sato?<br>Man: ( )', 'Speaking.', 'See you.', 'Yes, you are.', "I'm speaking English."],
    ["Boy: I'm sorry I'm late. I missed the train.<br>Girl: ( )", "That's all right. The movie hasn't started yet.", "You're welcome.", "I'll take it.", 'Good for you.'], ["Girl: What's wrong? You look sad.<br>Boy: ( )", 'I lost my wallet.', "I'm fine, and you?", 'That sounds great.', "It's my pleasure."],
    ['Father: How about going camping next weekend?<br>Girl: ( )', "Sounds great. I can't wait.", 'It was a lot of fun.', 'Three times.', 'Since last weekend.'], ['Boy: Can you tell me what time the concert starts?<br>Girl: ( )', 'It starts at six thirty.', 'For two hours.', 'At the city hall.', 'Yes, I can play.'],
    ['Woman: Would you like something to drink?<br>Man: ( )', 'Yes, a cup of coffee, please.', 'Yes, I do.', 'I drank it.', "No, I'm not."], ["Girl: I'm going to study in Canada next year.<br>Boy: ( )", 'Really? How long will you stay there?', 'How was it?', "You're welcome.", 'Yes, I was.'],
    ["Teacher: Why didn't you do your homework?<br>Boy: ( )", "I'm sorry. I was sick yesterday.", 'Yes, I did.', 'Because I like it.', 'At home.'], ['Boy: Shall I carry your bag?<br>Woman: ( )', "Thank you. That's very kind of you.", "Yes, let's.", "No, you can't.", 'I carried it.'],
    ['Girl: Which bus should I take to go to the stadium?<br>Man: ( )', 'Take the number five bus.', 'It takes fifteen minutes.', "It's 200 yen.", 'By bus.'], ['Boy: Have you ever been abroad?<br>Girl: ( )', 'Yes. I went to Korea last year.', 'Yes, I did.', "No, I don't.", 'For a week.']];
  add(K3, '会話文(かいわぶん)の 文(ぶん)（3級(きゅう)）', KAI.map(b => () => fillQ(b[0], b.slice(1), b[1], '', true)),
    `英検(えいけん)3級(きゅう)の 2つめの 問題(もんだい)と 同(おな)じ 形(かたち)だよ。会話(かいわ)の（　　）に 入(はい)る 文(ぶん)を、4つから えらぼう。`,
    `決(き)まった 言(い)い方(かた)を おぼえよう。<br>${big('Do you mind if 〜? — Not at all.')}（〜しても いい？ — いいですよ。）<br>${big('May I speak to 〜? — Speaking.')}（〜さんを おねがいします。— わたしです。）<br>${CHOOSE}`);

  // ---- 長文（掲示 2問・Eメール 3問・説明文 5問）。人・店・学校・電話番号は 架空 ----
  const NOTICE = [
    P('3n1', `<b>School Library News</b><br><br>To all students:<br>The school library will be closed from July 22 to July 26 because we are going to paint the walls. If you want to borrow books for the summer vacation, please come before July 19.<br>During the summer vacation, you can borrow ten books at a time. Please return them by September 3.<br><br>Ms. Tanaka, School Librarian`,
      [['Why will the library be closed?', 'Because the walls will be painted.', 'Because Ms. Tanaka will be on vacation.', 'Because there are no new books.', 'Because the students have tests.'], ['How many books can students borrow at a time during the summer vacation?', 'Ten.', 'Three.', 'Nineteen.', 'Twenty-six.']]),
    P('3n2', `<b>Volunteers Wanted — Beach Cleanup</b><br>Let's clean Minami Beach together!<br><br>Date: Sunday, June 9<br>Time: 9:00 a.m. – 11:00 a.m.<br>Meeting place: In front of the Minami Beach parking lot<br><br>We will give you gloves and garbage bags. Please bring a hat and something to drink. If it rains, the event will be held on June 16.<br>For more information, call the City Office at 555-0123.`,
      [['What should volunteers bring?', 'A hat and something to drink.', 'Gloves and garbage bags.', 'A lunch box.', 'A swimsuit.'], ['What will happen if it rains on June 9?', 'The event will be held on June 16.', 'The event will be held at the City Office.', 'Volunteers will clean the parking lot.', 'The event will start at 11:00 a.m.']]),
    P('3n3', `<b>Hillside Bookstore — Summer Sale</b><br><br>From August 1 to August 10, all comic books are 20% off.<br>If you buy three or more books, you will get a free bookmark.<br><br>On August 5, the writer Jane Miller will visit our store and talk about her new book from 2:00 p.m. Seats are for the first 30 people.<br><br>Opening hours: 10:00 a.m. – 8:00 p.m.`,
      [['What will people get if they buy three books?', 'A free bookmark.', 'A free comic book.', 'A ticket for the talk.', 'A new book by Jane Miller.'], ['What will happen on August 5?', 'A writer will talk about her new book.', 'The sale will end.', 'The store will be closed.', 'All books will be 30% off.']])];
  const MAIL = [
    P('3e1', `From: David<br>To: Shun<br>Date: July 3<br>Subject: Homestay<br><br>Dear Shun,<br>Thank you for your e-mail. My family and I are very happy that you will stay with us for two weeks in August. We live in a small town near Vancouver. There is a lake near our house, so we can go fishing together. My mother wants to know what food you can't eat. Please tell us. Also, it is cool here in the evening, so you should bring a jacket. I'm looking forward to seeing you at the airport.<br>Your friend,<br>David`,
      [["How long will Shun stay with David's family?", 'For two weeks.', 'For two months.', 'For a week.', 'For a year.'], ["What does David's mother want to know?", "What food Shun can't eat.", 'What sports Shun likes.', 'When Shun will arrive.', 'What Shun wants to buy.'], ['Why should Shun bring a jacket?', 'Because it is cool in the evening.', 'Because they will go fishing.', 'Because it rains a lot.', 'Because the airport is cold.']]),
    P('3e2', `From: Saki<br>To: Ms. Wilson<br>Date: November 12<br>Subject: Speech contest<br><br>Dear Ms. Wilson,<br>Thank you for helping me with my English speech. Yesterday, I spoke in front of 200 people at the city hall. I was very nervous at first, but I remembered your advice: "Look at the people and smile." I didn't win first prize, but I got third prize. My parents were very proud of me. I want to try again next year. Could you check my speech again then?<br>Sincerely,<br>Saki`,
      [['Where did Saki make her speech?', 'At the city hall.', 'At her school.', "At Ms. Wilson's house.", 'At a park.'], ["What was Ms. Wilson's advice?", 'To look at the people and smile.', 'To speak in a loud voice.', 'To practice every day.', 'To write a long speech.'], ['What prize did Saki get?', 'Third prize.', 'First prize.', 'Second prize.', 'No prize.']]),
    P('3e3', `From: Grandpa<br>To: Riku<br>Date: March 10<br>Subject: Your visit<br><br>Dear Riku,<br>I'm glad to hear that you will visit us during the spring vacation. Your grandmother has already started planning dinner for you. I have something to show you. Last month, I built a small boat by myself. It took me three months to finish it. If the weather is good, let's take it to the river and go fishing. Don't forget to bring warm clothes because it is still cold in the morning here.<br>See you soon,<br>Grandpa`,
      [['When will Riku visit his grandparents?', 'During the spring vacation.', 'During the summer vacation.', 'Last month.', 'Three months later.'], ["What did Riku's grandfather build?", 'A small boat.', 'A small house.', 'A new kitchen.', 'A bridge.'], ['How long did it take to build it?', 'Three months.', 'One month.', 'Three weeks.', 'A year.']])];
  const STORY = [
    P('3s1', `<b>A Small Shop with a Big Heart</b><br>Mr. Ito has a small bakery in his town. He opened it thirty years ago. Every morning, he gets up at four and starts baking bread. His bread is not expensive, and many people come to buy it.<br>Five years ago, a big supermarket opened near his shop. It sold cheap bread, and Mr. Ito's customers became fewer. He was worried and thought about closing his shop.<br>One day, a high school student named Yui had an idea. She made a website for the bakery and wrote about Mr. Ito's bread. Soon, people from other towns began to visit the shop. Now the bakery is more popular than before. Mr. Ito says, "Yui saved my shop. I will keep baking for my town."`,
      [['When did Mr. Ito open his bakery?', 'Thirty years ago.', 'Five years ago.', 'Four years ago.', 'Last year.'], ['What does Mr. Ito do at four every morning?', 'He gets up and starts baking bread.', 'He goes to the supermarket.', 'He opens his shop.', 'He makes a website.'],
        ['Why was Mr. Ito worried?', 'Because his customers became fewer.', 'Because his bread was expensive.', 'Because Yui closed her shop.', 'Because he could not get up early.'], ['What did Yui do for the bakery?', 'She made a website.', 'She baked bread.', 'She opened a supermarket.', 'She bought a lot of bread.'],
        ["What happened after Yui's idea?", 'People from other towns began to visit the shop.', 'The supermarket was closed.', 'Mr. Ito closed his shop.', 'Mr. Ito moved to another town.']]),
    P('3s2', `<b>Learning from Mistakes</b><br>Kana is in the school tennis club. Last year, she was chosen as captain. She wanted her team to win the city tournament, so she made the members practice very hard every day. She often got angry when they made mistakes.<br>One day, a first-year student stopped coming to practice. Kana was shocked. Her coach said, "A good captain listens to her members." That night, Kana thought about his words for a long time.<br>The next day, she said sorry to the members and asked them what they wanted to do. They talked for two hours and made a new practice plan together. The team did not win the tournament, but everyone enjoyed tennis more. Kana learned that listening is as important as leading.`,
      [['What did Kana want her team to do?', 'To win the city tournament.', 'To practice less.', 'To find a new coach.', 'To play in another city.'], ['What happened one day?', 'A first-year student stopped coming to practice.', 'The coach got angry at Kana.', 'Kana lost her racket.', 'The team won a game.'],
        ['What did the coach say to Kana?', 'A good captain listens to her members.', 'A good captain practices the hardest.', 'A good captain never makes mistakes.', 'A good captain always wins.'], ['What did Kana do the next day?', 'She said sorry to the members.', 'She stopped being captain.', 'She practiced alone.', 'She went to the tournament.'],
        ['What did Kana learn?', 'Listening is as important as leading.', 'Winning is the most important thing.', 'Tennis is not fun.', 'Practice is not necessary.']]),
    P('3s3', `<b>The Old Clock</b><br>There is an old clock in front of Sakura Station. It was made eighty years ago. For a long time, people in the town looked at it when they took trains. However, it stopped working ten years ago, and nobody repaired it.<br>Last year, students at Sakura Junior High School learned about the clock in their history class. They wanted to hear its bell again. They collected money at the school festival and asked an old clock maker, Mr. Mori, to repair it.<br>Mr. Mori worked on the clock for two months. Last spring, the clock started working again. When the bell rang, many old people cried because they remembered their young days. Now the clock is a symbol of the town again.`,
      [['Where is the old clock?', 'In front of Sakura Station.', 'In Sakura Junior High School.', "In Mr. Mori's shop.", 'In the history museum.'], ['When did the clock stop working?', 'Ten years ago.', 'Eighty years ago.', 'Two months ago.', 'Last spring.'],
        ['How did the students get money?', 'They collected it at the school festival.', 'They sold old clocks.', 'They asked the station for it.', 'They worked for Mr. Mori.'], ['How long did Mr. Mori work on the clock?', 'For two months.', 'For ten years.', 'For a year.', 'For eighty days.'],
        ['Why did many old people cry?', 'Because they remembered their young days.', 'Because the bell was too loud.', 'Because the clock stopped again.', 'Because Mr. Mori left the town.']])];
  add(K3, '長文(ちょうぶん)（お知(し)らせ・メール・お話(はなし)・3級(きゅう)）', [() => null],
    `英検(えいけん)3級(きゅう)の 3つめの 問題(もんだい)と 同(おな)じ 形(かたち)だよ。英語(えいご)の 文章(ぶんしょう)を 読(よ)んで、質問(しつもん)の 答(こた)えを 4つから えらぼう。`,
    `お知(し)らせ（2問(もん)）・メール（3問(もん)）・お話(はなし)（5問(もん)）が 出(で)るよ。4級(きゅう)より 文章(ぶんしょう)が 長(なが)いよ。`,
    `質問(しつもん)は、文章(ぶんしょう)の じゅんばんどおりに 出(で)る ことが 多(おお)いよ。答(こた)えは、文章(ぶんしょう)と ちがう ことばで 言(い)いかえて ある ことも あるよ。<br>${CHOOSE}`);
  const LU = UNITS[K3.units[K3.units.length - 1]];
  LU.make = () => [...pq(pick(NOTICE)), ...pq(pick(MAIL)), ...pq(pick(STORY))];
  LU.keep = true;
})();
