// 英検 準2級・2級の 形の 問題（読む 問題）（2026年11月17日）。content_eigo9.js の あとに 読む（道具は EIGO）。
// 形：日本英語検定協会「準2級の試験内容」「2級の試験内容」（https://www.eiken.or.jp/eiken/exam/grade_p2/solutions.html ・ grade_2/solutions.html。2026年11月17日に 見た）の リーディング
//   準2級：短文の語句空所補充 15問・会話文の空所補充 5問・長文の語句空所補充 2問・長文の内容一致選択 7問（Eメール・説明文）
//   2級：短文の語句空所補充 17問・長文の語句空所補充 6問・長文の内容一致選択 8問（Eメール・説明文）
//   ライティング（Eメール・要約・英作文）は 自動で 丸つけが できないので 入れていない。リスニングも なし。
//   長文の 内容一致で、Eメールと 説明文の 問題数の 分け方（準2級 3＋4・2級 3＋5）は ROOT の 仮。
// 問題・長文は ぜんぶ Claude が 新しく 作った（過去問・本からは 写していない）。人・店・学校などは 架空。文・講義は 仮（先生が 確かめる）。
(() => {
  if (!window.EIGO || !EIGO.P) return;
  const { pick, big, fillQ, four, P, pq, CHOOSE, kit } = EIGO;
  const { ser, add } = kit(9);

  // ================= 準2級 =================
  const KP = ser('x3kp2', '{英検|えいけん}{準|じゅん}2{級|きゅう}の {形|かたち}（{読|よ}む {問題|もんだい}）');
  const TP = [['The museum is ( ) to the public for free on the first Sunday of every month.', 'open', 'close', 'equal', 'polite'],
    ['Tom was so ( ) after the long hike that he fell asleep on the train.', 'exhausted', 'excited', 'expensive', 'exact'],
    ['The concert was ( ) because the singer suddenly got sick.', 'canceled', 'collected', 'continued', 'counted'],
    ['A: Have you ( ) a hotel for our trip?　B: Yes, I booked a room near the station.', 'reserved', 'respected', 'repeated', 'removed'],
    ['Please read the ( ) carefully before you use this machine.', 'instructions', 'invitations', 'inventions', 'impressions'],
    ['My grandfather ( ) from his job last year, and now he enjoys gardening.', 'retired', 'replied', 'returned', 'reported'],
    ['The ( ) of the earthquake was felt in the next city.', 'shock', 'shape', 'share', 'shade'],
    ['Many students ( ) to join the volunteer club this year.', 'applied', 'arrived', 'argued', 'agreed'],
    ['This soup has a lot of ( ), such as onions, carrots, and beans.', 'ingredients', 'instruments', 'incidents', 'industries'],
    ['A: Is this seat ( )?　B: Yes. Please sit down.', 'available', 'valuable', 'possible', 'comfortable'],
    ['The new library has a ( ) atmosphere, so many people go there to study.', 'quiet', 'quick', 'quite', 'quarter'],
    ['Jim spent all his money on the trip, so he had to ( ) some from his sister.', 'borrow', 'lend', 'owe', 'pay'],
    ['The police are looking for ( ) of the accident.', 'witnesses', 'wishes', 'wages', 'waves'],
    ['Eating vegetables helps to ( ) diseases.', 'prevent', 'present', 'pretend', 'predict'],
    ['The singer is ( ) for her beautiful voice.', 'famous', 'familiar', 'similar', 'serious'],
    ['After the storm, the town needed a lot of time to ( ) the damaged houses.', 'repair', 'require', 'relax', 'remind'],
    ['Lisa ( ) her mother by washing all the dishes.', 'surprised', 'suggested', 'supported', 'supposed'],
    ['The company ( ) a new smartphone last month.', 'released', 'relaxed', 'received', 'recovered'],
    ['It is ( ) to use your phone while you are driving.', 'dangerous', 'delicious', 'different', 'difficult'],
    ['A: How was the movie?　B: It was so ( ) that I almost fell asleep.', 'boring', 'exciting', 'surprising', 'amazing'],
    ['Ken ( ) up with a great idea for the school festival.', 'came', 'got', 'looked', 'took'],
    ['I have to ( ) this report by Friday.', 'hand in', 'take off', 'look after', 'give up'],
    ['The game was ( ) because of the heavy rain.', 'put off', 'put on', 'turned on', 'turned up'],
    ['Mary is ( ) of her son, who won the speech contest.', 'proud', 'afraid', 'tired', 'full'],
    ['We ran ( ) of milk, so I went to the store.', 'out', 'away', 'over', 'into'],
    ['She ( ) her phone at home, so she could not call her friend.', 'left', 'lost', 'let', 'lent'],
    ['My brother is used to ( ) up early.', 'getting', 'get', 'got', 'gets'],
    ['If it ( ) tomorrow, the picnic will be canceled.', 'rains', 'will rain', 'rained', 'raining'],
    ['This is the house ( ) the famous writer was born.', 'where', 'which', 'what', 'who'],
    ["I'd rather stay home than ( ) out in this cold weather.", 'go', 'going', 'to go', 'went']];
  add(KP, '短文(たんぶん)の 語句(ごく)（準(じゅん)2級(きゅう)）', four(TP),
    `英検(えいけん)準(じゅん)2級(きゅう)の 1つめの 問題(もんだい)と 同(おな)じ 形(かたち)だよ。文(ぶん)の（　　）に 入(はい)る ことばを、4つから えらぼう。`,
    `単語(たんご)・熟語(じゅくご)・文法(ぶんぽう)が 出(で)るよ。前後(ぜんご)の ことばを 手(て)がかりに しよう。<br>${CHOOSE}`);
  const KAIP = [["Woman: Excuse me. I bought this shirt yesterday, but it's too small.<br>Clerk: ( )", 'Would you like to exchange it for a bigger one?', 'It looks good on you.', "We don't sell shirts.", 'You can pay by card.'],
    ["Boy: Mom, can I go to Ken's house after dinner?<br>Mother: ( )", 'OK, but come back by eight.', 'Yes, I went there.', "No, he isn't.", "It's near the park."],
    ['Man: I think I left my umbrella on the train.<br>Station staff: ( )', 'What color is it? I will check the lost and found.', 'You should buy a ticket.', 'The train is late today.', "It's going to rain."],
    ["Girl: I'm thinking of joining the drama club.<br>Boy: ( )", "That's a good idea. You're good at acting.", "I didn't know that.", 'It was last year.', "No, thanks. I'm full."],
    ["Woman: Hello. I'd like to make an appointment with Dr. Brown.<br>Receptionist: ( )", 'Sure. When would be good for you?', 'He is a doctor.', 'Take this medicine.', 'You look well.'],
    ['Boy: How did you do on the math test?<br>Girl: ( )', 'Better than I expected.', 'I like math.', 'On Monday.', 'With my friend.'],
    ['Man: Could you help me carry these boxes?<br>Woman: ( )', 'Sure. Where should I put them?', "No, I don't have any.", 'They are heavy.', 'I bought them yesterday.'],
    ['Girl: What should I bring to the barbecue?<br>Boy: ( )', 'Just bring something to drink.', 'It starts at noon.', 'At the river.', 'I had a good time.'],
    ['Waiter: Are you ready to order?<br>Woman: ( )', 'Not yet. Could you give me a few more minutes?', "Yes, it's delicious.", 'I already paid.', "No, I'm not hungry anymore."],
    ["Boy: I can't find my key anywhere.<br>Mother: ( )", 'Did you check your jacket pocket?', 'You should lock the door.', 'I made a copy.', 'The key is new.'],
    ['Man: The bus is very crowded today.<br>Woman: ( )', "Let's wait for the next one.", 'I took a taxi.', 'It is number seven.', 'It was cheap.'],
    ["Girl: I'm going to Kyoto during the holidays.<br>Boy: ( )", 'Lucky you! Will you visit any temples?', 'I went there by bus.', "No, it isn't.", 'Since last week.'],
    ['Teacher: Your speech was excellent.<br>Student: ( )', 'Thank you. I practiced it many times.', "You're welcome.", 'I hope so.', "That's too bad."],
    ['Woman: Do you know where the post office is?<br>Man: ( )', "Sorry, I'm a stranger here myself.", 'Yes, I sent a letter.', 'It opens at nine.', 'By bike.'],
    ['Boy: Shall we play tennis this afternoon?<br>Girl: ( )', "I'd like to, but I have to finish my homework.", 'I played very well.', 'It was fun.', 'Tennis is popular.'],
    ['Clerk: This coat is 30 percent off today.<br>Man: ( )', "Really? Then I'll take it.", "It's too warm.", 'I came by train.', 'Yes, I have one.']];
  add(KP, '会話文(かいわぶん)の 文(ぶん)（準(じゅん)2級(きゅう)）', KAIP.map(b => () => fillQ(b[0], b.slice(1), b[1], '', true)),
    `英検(えいけん)準(じゅん)2級(きゅう)の 2つめの 問題(もんだい)と 同(おな)じ 形(かたち)だよ。会話(かいわ)の（　　）に 入(はい)る 文(ぶん)を、4つから えらぼう。`,
    `（　　）の あとの ことばも よく 読(よ)もう。答(こた)えの ヒントが あるよ。<br>${CHOOSE}`);
  // 長文の 語句（2問）＋ Eメール（3問）＋ 説明文（4問）
  const BP = [
    P('p2b1', `<b>A New Hobby</b><br>Last spring, Haruto's grandmother gave him an old camera. At first, he did not know how to use it. He watched some videos on the Internet and ( 1 ). Soon, he started taking pictures of birds in the park near his house.<br>In autumn, he sent one of his pictures to a photo contest, and it won second prize. Now, Haruto wants to ( 2 ) about birds so that he can take even better pictures.`,
      [['Which fits ( 1 )?', 'practiced every day', 'sold the camera', 'stopped using it', 'bought a new phone'], ['Which fits ( 2 )?', 'learn more', 'talk less', 'worry more', 'think less']]),
    P('p2b2', `<b>Green Curtains</b><br>In summer, some families in Japan grow plants such as bitter melon on the outside of their windows. These plants make a "green curtain." The leaves block strong sunlight, so the rooms stay cooler. As a result, people ( 1 ) their air conditioners as often.<br>Also, they can eat the vegetables that grow on the plants. For these reasons, green curtains have ( 2 ) in many towns.`,
      [['Which fits ( 1 )?', "don't need to use", 'have to buy', 'often repair', 'cannot find'], ['Which fits ( 2 )?', 'become popular', 'been forgotten', 'made trouble', 'gotten smaller']])];
  const MP = [
    P('p2m1', `From: Emily Clark<br>To: Yuki Tanaka<br>Date: June 2<br>Subject: Summer camp<br><br>Hi Yuki,<br>Thank you for telling me about the English summer camp at Lake Midori. It sounds like a lot of fun! I talked with my parents, and they said I can go if I pay half of the cost myself. So I'm going to work at my uncle's flower shop on weekends this month.<br>By the way, do you know what we need to bring? I don't have a sleeping bag. Can I rent one there, or should I buy one?<br>Also, my brother Sam wants to join, too, but he is only eleven. Is that OK?<br>Your friend,<br>Emily`,
      [['What did Emily\'s parents say?', 'She can go if she pays for half of it.', 'She cannot go to the camp.', 'She has to go with her uncle.', 'She should buy a new bag.'], ['What does Emily want to know?', 'If she can rent a sleeping bag at the camp.', 'Where Lake Midori is.', 'How much the flower shop pays.', 'When the camp starts.'], ['What is the problem with Sam?', 'He may be too young to join.', 'He does not like English.', 'He has to work at a shop.', 'He lost his sleeping bag.']]),
    P('p2m2', `From: Mark Lee<br>To: Ms. Ono<br>Date: October 15<br>Subject: Cooking class<br><br>Dear Ms. Ono,<br>My name is Mark, and I'm a student at Kita University. I saw the poster for your Japanese cooking class at the community center. I'm very interested because I want to cook Japanese food for my family when I go back to Australia.<br>The poster says the class is held on Wednesday evenings. Unfortunately, I have a part-time job on Wednesdays. Do you have any other classes on weekends?<br>Also, I'm allergic to eggs. Could you tell me if the recipes use eggs?<br>Best regards,<br>Mark Lee`,
      [['Why does Mark want to join the class?', 'He wants to cook Japanese food for his family.', 'He wants to work at a restaurant.', 'He wants to make a poster.', 'He wants to teach cooking.'], ['What problem does Mark have?', 'He works on Wednesdays.', 'He cannot go to the community center.', 'He has no money.', 'He is going back to Australia tomorrow.'], ['What does Mark ask about?', 'Whether the dishes use eggs.', 'How to get to the university.', 'How much the class costs.', "Ms. Ono's phone number."]])];
  const EP = [
    P('p2e1', `<b>The Story of the Bicycle</b><br>Today, bicycles are used all over the world. However, the first bicycles looked very different. About 200 years ago, a man in Germany made a wooden machine with two wheels. It had no pedals, so riders had to push the ground with their feet.<br>Later, people added pedals to the front wheel. To go faster, they made the front wheel very large. These bicycles were fast, but they were dangerous because riders often fell off.<br>In the 1880s, a new type of bicycle appeared. Its two wheels were the same size, and a chain turned the back wheel. This design was much safer, and many people started to ride bicycles to work.<br>Now, some cities are building special roads for bicycles because they do not produce pollution.`,
      [['How did people ride the first bicycle?', 'By pushing the ground with their feet.', 'By using pedals on the back wheel.', 'By using a chain.', 'By pulling a rope.'], ['Why were bicycles with a large front wheel dangerous?', 'Riders often fell off.', 'They were too slow.', 'They were made of wood.', 'They had no wheels.'], ['What was new about the bicycles in the 1880s?', 'The wheels were the same size.', 'They had no pedals.', 'They were very expensive.', 'They had three wheels.'], ['Why are some cities building roads for bicycles?', 'Because bicycles do not cause pollution.', 'Because cars are too fast.', 'Because bicycles are cheap to make.', 'Because people do not like trains.']]),
    P('p2e2', `<b>Libraries on Wheels</b><br>In some areas, it is difficult for people to visit a library. They may live far from the city, or they may be too old to travel. To help these people, some towns use "mobile libraries." A mobile library is a bus or truck that carries books.<br>The bus visits different places, such as small villages and hospitals, on a regular schedule. People can borrow books and return them the next time the bus comes.<br>In some countries, libraries even use animals. In parts of Kenya, for example, camels carry boxes of books to villages without roads.<br>Mobile libraries are not only for reading. Librarians often talk with people and help them find information. For many people, the visit of the library is an important event.`,
      [['Who are mobile libraries for?', 'People who cannot easily visit a library.', 'Students who study in the city.', 'People who want to buy books.', 'Drivers of buses and trucks.'], ['How do people return books?', 'They give them back when the bus comes again.', 'They send them by mail.', 'They take them to the city.', 'They keep them forever.'], ['What is used in parts of Kenya?', 'Camels.', 'Boats.', 'Airplanes.', 'Bicycles.'], ['What do librarians often do?', 'Talk with people and help them find information.', 'Drive the camels.', 'Sell books to villages.', 'Build new roads.']])];
  add(KP, '長文(ちょうぶん)（語句(ごく)・メール・説明文(せつめいぶん)・準(じゅん)2級(きゅう)）', [() => null],
    `英検(えいけん)準(じゅん)2級(きゅう)の 3つめ・4つめの 問題(もんだい)と 同(おな)じ 形(かたち)だよ。英語(えいご)の 文章(ぶんしょう)を 読(よ)んで、（　）に 入(はい)る ことばや、質問(しつもん)の 答(こた)えを 4つから えらぼう。`,
    `長文(ちょうぶん)の 語句(ごく)（2問(もん)）・メール（3問(もん)）・説明文(せつめいぶん)（4問(もん)）が 出(で)るよ。`,
    `（　）の 問題(もんだい)は、前(まえ)と あとの 文(ぶん)の つながりを 考(かんが)えよう。質問(しつもん)は、文章(ぶんしょう)の じゅんばんどおりに 出(で)る ことが 多(おお)いよ。<br>${CHOOSE}`);
  const LP = UNITS[KP.units[KP.units.length - 1]];
  LP.make = () => [...pq(pick(BP)), ...pq(pick(MP)), ...pq(pick(EP))];
  LP.keep = true;

  // ================= 2級 =================
  const KG = ser('x3kg2', '{英検|えいけん}2{級|きゅう}の {形|かたち}（{読|よ}む {問題|もんだい}）');
  const TG = [['The government plans to ( ) taxes on cigarettes to reduce smoking.', 'raise', 'rise', 'arise', 'praise'],
    ['The scientist made an important ( ) about how the virus spreads.', 'discovery', 'delivery', 'discount', 'district'],
    ['Because of the heavy snow, the flight was ( ) until the next morning.', 'postponed', 'promoted', 'preserved', 'predicted'],
    ['The museum ( ) more than one million visitors last year.', 'attracted', 'attached', 'attended', 'attempted'],
    ['A: Did you understand the professor\'s lecture?　B: Not really. His explanation was too ( ).', 'complicated', 'convenient', 'confident', 'considerate'],
    ['The two companies signed a ( ) to work together on the new project.', 'contract', 'contrast', 'contest', 'context'],
    ['The doctor said that regular exercise can ( ) the risk of heart disease.', 'reduce', 'refuse', 'reflect', 'reveal'],
    ['Many species are in danger of ( ) because their forests are being cut down.', 'extinction', 'expression', 'expansion', 'explanation'],
    ['Emma is very ( ). She always thinks about other people\'s feelings.', 'considerate', 'considerable', 'consistent', 'conscious'],
    ['The town held a ceremony to ( ) the 100th anniversary of the school.', 'celebrate', 'calculate', 'communicate', 'cooperate'],
    ['The new law will ( ) next April.', 'take effect', 'take place', 'take part', 'take care'],
    ['The police are still trying to ( ) what caused the fire.', 'figure out', 'give in', 'put up', 'run over'],
    ['Sales of electric cars have increased ( ) in recent years.', 'dramatically', 'dangerously', 'differently', 'directly'],
    ['The hotel staff were very ( ) and answered all our questions.', 'helpful', 'harmful', 'hopeless', 'homeless'],
    ['Because the store did not have enough staff, customers had to wait for a long time. ( ), many people left without buying anything.', 'As a result', 'In contrast', 'For example', 'On the other hand'],
    ['The company decided to ( ) 200 new workers next year.', 'hire', 'fire', 'tire', 'wire'],
    ['Children are ( ) to learn languages more quickly than adults.', 'likely', 'lonely', 'lively', 'lovely'],
    ['The student was ( ) for a scholarship because of his excellent grades.', 'chosen', 'charged', 'changed', 'checked'],
    ['The mayor promised to ( ) the problem of traffic jams in the city center.', 'deal with', 'come across', 'look up', 'get over'],
    ['A: I\'m sorry I broke your vase.　B: Don\'t worry. It was not very ( ).', 'valuable', 'variable', 'various', 'visible'],
    ['The museum has a large ( ) of paintings from the 18th century.', 'collection', 'connection', 'correction', 'collision'],
    ['After months of training, the team finally ( ) its goal of winning the championship.', 'achieved', 'avoided', 'admitted', 'adopted'],
    ['Not until the meeting ended ( ) that he had left his bag on the train.', 'did he realize', 'he realized', 'he did realize', 'realized he'],
    ['( ) the bad weather, the event was held as planned.', 'Despite', 'Although', 'Because', 'Unless'],
    ['If I had left home earlier, I ( ) the train.', 'would have caught', 'will catch', 'caught', 'would catch'],
    ['The book, ( ) was written 50 years ago, is still popular today.', 'which', 'that', 'what', 'where'],
    ['She is ( ) to speak three languages.', 'able', 'capable', 'possible', 'skillful'],
    ['The concert hall was so crowded that there was no room to ( ).', 'spare', 'share', 'stare', 'scare'],
    ['The researchers ( ) an experiment to test their theory.', 'conducted', 'connected', 'concluded', 'consumed'],
    ['It is ( ) that we protect the environment for future generations.', 'essential', 'additional', 'emotional', 'occasional']];
  add(KG, '短文(たんぶん)の 語句(ごく)（2級(きゅう)）', four(TG),
    `英検(えいけん)2級(きゅう)の 1つめの 問題(もんだい)と 同(おな)じ 形(かたち)だよ。文(ぶん)の（　　）に 入(はい)る ことばを、4つから えらぼう。`,
    `つづりの にた 単語(たんご)（considerate・considerable など）に 気(き)を つけよう。熟語(じゅくご)や 文法(ぶんぽう)も 出(で)るよ。<br>${CHOOSE}`);
  // 長文の 語句（3問）×2 ＋ Eメール（3問）＋ 説明文（5問）
  const BG = [
    P('g2b1', `<b>Sleep and Memory</b><br>Many students stay up late before a test. They believe that studying longer will help them get a better score. However, scientists say this may not be a good idea. While we sleep, the brain organizes the information we learned during the day. ( 1 ), getting enough sleep can actually help us remember things better.<br>In one study, two groups of students learned a list of words. One group slept for eight hours, and the other group stayed awake. The next day, the students who had slept ( 2 ).<br>Experts suggest that students ( 3 ) instead of studying all night.`,
      [['Which fits ( 1 )?', 'In other words', 'On the other hand', 'For instance', 'Even so'], ['Which fits ( 2 )?', 'remembered more words', 'forgot all the words', 'felt more tired', 'studied a new list'], ['Which fits ( 3 )?', 'plan their study time carefully', 'drink more coffee', 'skip breakfast', 'take tests more often']]),
    P('g2b2', `<b>Food That Is Thrown Away</b><br>Every year, a large amount of food is thrown away around the world. Some of it is wasted at stores because it does not look perfect. For example, vegetables with strange shapes are often ( 1 ), even though they taste the same as other vegetables.<br>To solve this problem, some companies have started selling such vegetables at lower prices. Others give food that is close to its expiration date to people who need it. ( 2 ), some apps let customers buy leftover food from restaurants at the end of the day.<br>Experts say that each person can also help. By buying only what we need, we can ( 3 ) the amount of food we waste.`,
      [['Which fits ( 1 )?', 'not sold', 'very expensive', 'grown again', 'given prizes'], ['Which fits ( 2 )?', 'In addition', 'Instead', 'However', 'Otherwise'], ['Which fits ( 3 )?', 'reduce', 'increase', 'measure', 'repeat']]),
    P('g2b3', `<b>Working from Home</b><br>In recent years, more people have started working from home. For many workers, this has clear benefits. They do not have to spend time commuting, so they have ( 1 ) for their families and hobbies.<br>However, working from home also has some problems. Some people find it hard to separate work from private life. Others feel lonely because they ( 2 ) their coworkers face to face.<br>Because of this, some companies now use a mixed system. Workers come to the office a few days a week and work at home on the other days. Many people say this system ( 3 ).`,
      [['Which fits ( 1 )?', 'more free time', 'less money', 'fewer chances', 'more work'], ['Which fits ( 2 )?', 'rarely see', 'often meet', 'always call', 'never forget'], ['Which fits ( 3 )?', 'gives them the best of both', 'makes them more lonely', 'costs too much money', 'is too difficult to follow']])];
  const MG = [
    P('g2m1', `From: Daniel Moore<br>To: Customer Service, Sunrise Electronics<br>Date: February 8<br>Subject: Problem with my order<br><br>Dear Sir or Madam,<br>I ordered a laptop computer from your online store on February 1. It arrived yesterday, but when I opened the box, I found that the screen was cracked. I took some photos of the damage, and I have attached them to this e-mail.<br>I need the computer for my new job, which starts next Monday. Could you send me a new one as soon as possible? If that is not possible, I would like a full refund.<br>Also, please tell me how I should send the broken computer back to you. I do not want to pay for the shipping because it was not my fault.<br>Sincerely,<br>Daniel Moore`,
      [['What problem did Daniel find?', 'The screen of the laptop was broken.', 'The laptop did not arrive.', 'He received the wrong color.', 'The box was empty.'], ['What does Daniel want the company to do first?', 'Send him a new computer quickly.', 'Give him a discount on his next order.', 'Call him at his new job.', 'Repair the computer at his house.'], ['What does Daniel say about sending the computer back?', 'He does not want to pay for it.', 'He will bring it to the store.', 'He has already sent it.', 'He wants to keep it.']]),
    P('g2m2', `From: Aya Kimura<br>To: Professor Hill<br>Date: May 20<br>Subject: Research project<br><br>Dear Professor Hill,<br>Thank you for your class on ocean pollution last week. I was shocked to learn how much plastic ends up in the sea. Since then, I have been reading articles about the topic, and I would like to write my final report on it.<br>I am thinking of doing a survey of how much plastic students at our university use every day. However, I am not sure how to make good survey questions. Would it be possible to meet you during your office hours to get some advice?<br>I am free on Tuesday and Thursday afternoons. Please let me know which day would be convenient for you.<br>Best wishes,<br>Aya Kimura`,
      [['Why did Aya become interested in ocean pollution?', "Because of Professor Hill's class.", 'Because she lives near the sea.', 'Because her friend asked her.', 'Because she saw it on TV.'], ['What does Aya want to do for her report?', 'Do a survey about plastic use.', 'Clean a beach.', 'Interview Professor Hill.', 'Write an article for a newspaper.'], ['What does Aya ask Professor Hill?', 'If she can meet him to get advice.', 'If she can take his class again.', 'If he can write the survey for her.', 'If he can change the topic of her report.']])];
  const EG = [
    P('g2e1', `<b>The Return of the Wolves</b><br>Wolves once lived in many parts of North America. However, people saw them as a danger to farm animals, and by the 1920s, almost all the wolves in a large national park had been killed.<br>Without wolves, the number of deer in the park grew quickly. The deer ate young trees and plants near rivers, and many areas became bare. Birds and other small animals that depended on these plants also began to disappear.<br>In 1995, scientists brought wolves back to the park. The wolves hunted the deer, and the deer began to avoid open areas near rivers. As a result, trees and plants started to grow again. Their roots made the riverbanks stronger, and the shape of some rivers even changed.<br>Today, this story is often used as an example of how one animal can affect a whole ecosystem. However, some scientists say that other factors, such as changes in the weather, may also have played a role.<br>The debate continues, but most experts agree that predators like wolves are an important part of nature.`,
      [['Why were wolves killed in the past?', 'People thought they were dangerous to farm animals.', 'People wanted their fur.', 'They ate all the trees.', 'They caused diseases.'], ['What happened when there were no wolves?', 'The number of deer increased.', 'The rivers became wider.', 'More birds came to the park.', 'Young trees grew quickly.'], ['What happened after wolves were brought back?', 'Plants near rivers began to grow again.', 'The deer moved to the rivers.', 'All the deer disappeared.', 'The weather became colder.'], ['What do some scientists say?', 'Other factors may also explain the changes.', 'Wolves should be removed again.', 'Deer are more important than wolves.', 'The story is completely false.'], ['What do most experts agree on?', 'Predators are important in nature.', 'Wolves are dangerous to people.', 'National parks should be closed.', 'Deer should be hunted by people.']]),
    P('g2e2', `<b>The Power of Small Loans</b><br>In many developing countries, poor people find it difficult to borrow money from banks. Banks usually require people to have property or a steady income, which many poor people do not have.<br>In the 1970s, an economics professor in Bangladesh thought of a different system. He lent small amounts of money to groups of women who wanted to start their own businesses, such as raising chickens or making baskets. Members of each group supported each other and made sure that everyone paid the money back.<br>Surprisingly, most of the borrowers returned the money on time. With the profits from their businesses, many families were able to send their children to school and improve their living conditions.<br>This system, known as "microfinance," spread to many other countries. Later, the professor and his bank received the Nobel Peace Prize.<br>However, microfinance is not perfect. In some places, borrowers have had to pay very high interest, and some people fell into debt. Experts say that such loans work best when they are combined with education and other support.`,
      [['Why is it hard for poor people to borrow money from banks?', 'They often do not have property or a steady income.', 'Banks are too far from their homes.', 'They do not want to start businesses.', 'Banks only lend money to students.'], ['What did the professor do?', 'He lent small amounts of money to groups of women.', 'He opened a chicken farm.', 'He built new schools.', 'He taught women how to make baskets.'], ['What happened to most of the borrowers?', 'They paid the money back on time.', 'They could not pay the money back.', 'They moved to other countries.', 'They became bank workers.'], ['What did the professor and his bank receive?', 'The Nobel Peace Prize.', 'A large loan.', 'A new building.', 'A prize from the government.'], ['According to experts, when do such loans work best?', 'When they are combined with education and support.', 'When the interest is very high.', 'When only men can borrow money.', 'When banks are not involved.']])];
  add(KG, '長文(ちょうぶん)（語句(ごく)・メール・説明文(せつめいぶん)・2級(きゅう)）', [() => null],
    `英検(えいけん)2級(きゅう)の 2つめ・3つめの 問題(もんだい)と 同(おな)じ 形(かたち)だよ。英語(えいご)の 文章(ぶんしょう)を 読(よ)んで、（　）に 入(はい)る ことばや、質問(しつもん)の 答(こた)えを 4つから えらぼう。`,
    `長文(ちょうぶん)の 語句(ごく)（3問(もん)×2）・メール（3問(もん)）・説明文(せつめいぶん)（5問(もん)）が 出(で)るよ。`,
    `In other words・As a result・However などの つなぎの ことばは、前(まえ)と あとの 関係(かんけい)（言(い)いかえ・結果(けっか)・反対(はんたい)）を 考(かんが)えて えらぼう。<br>${CHOOSE}`);
  const LG = UNITS[KG.units[KG.units.length - 1]];
  LG.make = () => { const b = [...BG].sort(() => Math.random() - 0.5); return [...pq(b[0]), ...pq(b[1]), ...pq(pick(MG)), ...pq(pick(EG))]; };
  LG.keep = true;
})();
