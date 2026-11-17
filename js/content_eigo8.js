// 英語 中学の 単語の つづき③（2026年11月17日）。content_eigo5.js の あとに 読む（道具は EIGO.vocab）。
// content_eigo〜7 に ない 語を 約330語 足す（社長の 指示）。学年・語の えらび方は Claude の めやす（仮。先生が 確かめる）。
(() => {
  if (!window.EIGO || !EIGO.vocab) return;
  const { vocab, big, vocabSeries: W } = EIGO;
  vocab(7, '家(いえ)の 中(なか)と 台所(だいどころ)', 'stairs=階段(かいだん)|ceiling=天井(てんじょう)|curtain=カーテン|sofa=ソファー|drawer=引(ひ)き出(だ)し|soap=せっけん|toothbrush=歯(は)ブラシ|pillow=まくら|fridge=冷蔵庫(れいぞうこ)|oven=オーブン|yard=庭(にわ)・中庭(なかにわ)|lamp=電気(でんき)スタンド|vase=花(か)びん|carpet=じゅうたん|basket=かご|trash=ごみ|mug=マグカップ|bowl=おわん・ボウル|fork=フォーク|spoon=スプーン|chopsticks=はし|napkin=ナプキン|bottle=びん・ボトル|jar=（広口(ひろくち)の）びん|kettle=やかん|pan=フライパン|knife=ナイフ・包丁(ほうちょう)',
    `${big('chopsticks')}（はし）は 2本(ほん)で 1組(くみ)なので s が つく。`);
  vocab(7, '教室(きょうしつ)と 遊(あそ)び', 'scissors=はさみ|glue=のり|tape=テープ|stapler=ホッチキス|chalk=チョーク|blackboard=黒板(こくばん)|locker=ロッカー|cafeteria=食堂(しょくどう)|playground=校庭(こうてい)|bell=ベル・かね|crayon=クレヨン|marker=マーカー|stamp=切手(きって)・スタンプ|envelope=ふうとう|balloon=風船(ふうせん)|kite=たこ（あげる もの）|puzzle=パズル|swing=ブランコ|slide=すべり台(だい)|sandbox=すな場(ば)|tent=テント|flag=旗(はた)|gift=おくり物(もの)',
    `${big('scissors')}（はさみ）も 2つの 刃(は)で 1つなので s が つく。`);
  vocab(7, '服(ふく)と 身(み)の 回(まわ)り', 'purse=（小(ちい)さな）さいふ|necklace=ネックレス|belt=ベルト|scarf=マフラー・スカーフ|gloves=手(て)ぶくろ|boots=ブーツ|sneakers=運動(うんどう)ぐつ|pajamas=パジャマ|button=ボタン|pocket=ポケット|ribbon=リボン|comb=くし|shampoo=シャンプー|tissue=ティッシュ|iron=アイロン・鉄(てつ)|vacuum=そうじ機(き)|dishes=食器(しょっき)|chore=家事(かじ)の 仕事(しごと)',
    `${big('gloves')}・${big('boots')}・${big('sneakers')}・${big('pajamas')} は 2つで 1組(くみ)なので s が つく。`);
  vocab(7, '食(た)べ物(もの)②', 'rice ball=おにぎり|noodle=めん|pie=パイ|pancake=ホットケーキ|candy=あめ|jam=ジャム|yogurt=ヨーグルト|honey=はちみつ|pepper=こしょう|pumpkin=かぼちゃ|bean=豆(まめ)|grape=ぶどう|cherry=さくらんぼ|pineapple=パイナップル|cucumber=きゅうり|eggplant=なす|spinach=ほうれんそう|mushroom=きのこ|garlic=にんにく|lettuce=レタス|pear=洋(よう)なし|soy sauce=しょうゆ|vinegar=す（調味料(ちょうみりょう)）',
    `${big('rice ball')}・${big('soy sauce')} は 2語(ご)で 1つの 言葉(ことば)。`);
  vocab(7, '食(た)べ物(もの)③', 'steak=ステーキ|spaghetti=スパゲッティ|toast=トースト|cereal=シリアル|omelet=オムレツ|sausage=ソーセージ|bacon=ベーコン|shrimp=エビ|tuna=マグロ|salmon=サケ|tofu=豆腐(とうふ)|seaweed=海藻(かいそう)|popcorn=ポップコーン|donut=ドーナツ|pudding=プリン|soda=炭酸(たんさん)飲料(いんりょう)|lemonade=レモネード|cocoa=ココア',
    `${big('tofu')} のように 日本語(にほんご)から 英語(えいご)に なった 言葉(ことば)も ある。`);
  vocab(7, '動物(どうぶつ)③', 'deer=しか|goat=やぎ|owl=ふくろう|penguin=ペンギン|spider=くも（虫(むし)）|zebra=シマウマ|squirrel=りす|crow=からす|hamster=ハムスター|parrot=オウム|goldfish=金魚(きんぎょ)|puppy=子犬(こいぬ)|kitten=子(こ)ねこ|camel=ラクダ|kangaroo=カンガルー|gorilla=ゴリラ|octopus=タコ|crab=カニ|jellyfish=クラゲ',
    `${big('deer')}（しか）は 1頭(とう)でも 2頭(とう)でも deer（形(かたち)が 変(か)わらない）。${big('puppy')} は 子犬(こいぬ)、${big('kitten')} は 子(こ)ねこ。`);
  vocab(7, '虫(むし)・鳥(とり)・植物(しょくぶつ)', 'beetle=カブトムシ|dragonfly=トンボ|mosquito=蚊(か)|cricket=コオロギ|swan=白鳥(はくちょう)|eagle=ワシ|pigeon=ハト|sparrow=スズメ|tulip=チューリップ|sunflower=ひまわり|rose=バラ|lily=ユリ|bamboo=竹(たけ)|pine=松(まつ)|maple=カエデ|cherry blossom=桜(さくら)の 花(はな)|acorn=どんぐり|cactus=サボテン',
    `${big('sunflower')} は sun（太陽(たいよう)）＋ flower（花(はな)）。`);
  vocab(7, 'よく 使(つか)う 動詞(どうし)⑧', 'paint=（絵(え)の 具(ぐ)で）ぬる・かく|kick=ける|wake=目(め)が さめる|knock=ノックする|ring=鳴(な)る|shake=ふる・ゆれる|hide=かくれる・かくす|lead=導(みちび)く|pick=つむ・選(えら)ぶ|mix=混(ま)ぜる|fry=油(あぶら)で いためる・あげる|taste=味(あじ)が する・味(あじ)わう|smell=においが する|whisper=ささやく|clap=手(て)を たたく|thank=感謝(かんしゃ)する|welcome=歓迎(かんげい)する|promise=約束(やくそく)する|save=救(すく)う・節約(せつやく)する|count=数(かぞ)える',
    `${big('wake up')}（目(め)が さめる）のように up を つけて 使(つか)う ことが 多(おお)い。`);
  vocab(7, 'スポーツ・音楽(おんがく)・行事(ぎょうじ)', 'fireworks=花火(はなび)|parade=パレード|picnic=ピクニック|camping=キャンプ|hiking=ハイキング|fishing=つり|skating=スケート|skiing=スキー|surfing=サーフィン|jogging=ジョギング|chess=チェス|drum=たいこ|flute=フルート|violin=バイオリン|trumpet=トランペット|choir=合唱団(がっしょうだん)|band=バンド・楽団(がくだん)|winner=勝者(しょうしゃ)|loser=負(ま)けた 人(ひと)|medal=メダル',
    `「〜しに 行(い)く」は ${big('go fishing')}・${big('go camping')} のように go ＋ 〜ing。`);
  vocab(8, '体(からだ)と 健康(けんこう)②', 'elbow=ひじ|toe=足(あし)の 指(ゆび)|chest=むね|cheek=ほお|chin=あご|nod=うなずく|lean=もたれる|kneel=ひざまずく|wink=ウインクする|sneeze=くしゃみを する|bleed=血(ち)が 出(で)る|wheelchair=車(くるま)いす',
    `${big('kneel')} の k は 読(よ)まない（ニール）。`);
  vocab(8, 'ようすを 表(あらわ)す 言葉(ことば)⑦', 'thick=厚(あつ)い|salty=塩(しお)からい|loud=（音(おと)が）大(おお)きい|lazy=なまけた|relieved=ほっとした|clever=りこうな|awake=目(め)が さめて|asleep=ねむって|alive=生(い)きて いる|dead=死(し)んだ|ripe=熟(じゅく)した|frozen=こおった|noisy=さわがしい|strange=変(へん)な・奇妙(きみょう)な|native=生(う)まれた 土地(とち)の',
    `${big('asleep')}・${big('awake')}・${big('alive')} は ふつう 名詞(めいし)の 前(まえ)ではなく、be動詞(どうし)の あとに 使(つか)う（He is asleep.）。`);
  vocab(8, '町(まち)と 乗(の)り物(もの)②', 'bakery=パン屋(や)|church=教会(きょうかい)|castle=城(しろ)|tower=塔(とう)|tunnel=トンネル|factory=工場(こうじょう)|farm=農場(のうじょう)|police station=警察署(けいさつしょ)|fire station=消防署(しょうぼうしょ)|sidewalk=歩道(ほどう)|block=区画(くかく)・ブロック|traffic=交通(こうつう)|truck=トラック|motorcycle=オートバイ|helmet=ヘルメット|gas station=ガソリンスタンド|parking=駐車(ちゅうしゃ)|highway=幹線(かんせん)道路(どうろ)|path=小道(こみち)|crosswalk=横断(おうだん)歩道(ほどう)|luggage=手荷物(てにもつ)',
    `${big('luggage')}（手荷物(てにもつ)）は 数(かぞ)えない 名詞(めいし)（a や s を つけない）。`);
  vocab(8, '職業(しょくぎょう)と 人(ひと)②', 'fisherman=漁師(りょうし)|baker=パン職人(しょくにん)|florist=花屋(はなや)の 人(ひと)|hairdresser=美容師(びようし)|reporter=記者(きしゃ)|photographer=写真家(しゃしんか)|cartoonist=まんが家(か)|musician=音楽家(おんがくか)|actor=俳優(はいゆう)|clerk=店員(てんいん)・事務員(じむいん)|crowd=群衆(ぐんしゅう)|twin=ふたごの 1人(ひとり)',
    `「〜する 人(ひと)」は 語(ご)の 終(お)わりが -er・-ist・-ian に なる ことが 多(おお)い（bake → baker、piano → pianist）。`);
  vocab(8, '天気(てんき)・地理(ちり)・時(とき)', 'foggy=きりの 出(で)た|lightning=いなずま|shade=日(ひ)かげ|shore=岸(きし)|cave=どうくつ|peninsula=半島(はんとう)|capital=首都(しゅと)|region=地方(ちほう)|suburb=郊外(こうがい)|equator=赤道(せきどう)|north pole=北極(ほっきょく)|stream=小川(おがわ)|tide=潮(しお)の 満(み)ち引(ひ)き|horizon=地平線(ちへいせん)・水平線(すいへいせん)|dawn=夜明(よあ)け|decade=10年間(ねんかん)|era=時代(じだい)',
    `${big('decade')} は 10年間(ねんかん)、${big('century')} は 100年間(ねんかん)。`);
  vocab(8, 'メディアと 道具(どうぐ)', 'collection=収集(しゅうしゅう)|album=アルバム|cartoon=まんが・アニメ|channel=チャンネル|commercial=コマーシャル|email=電子(でんし)メール|charger=充電器(じゅうでんき)|keyboard=キーボード|printer=プリンター',
    `${big('email')} は「メールを 送(おく)る」と 動詞(どうし)でも 使(つか)える。`);
  vocab(9, '気持(きも)ちや 態度(たいど)を 表(あらわ)す 動詞(どうし)', 'argue=言(い)い争(あらそ)う|confuse=混乱(こんらん)させる|forgive=許(ゆる)す|praise=ほめる|prove=証明(しょうめい)する|regret=後悔(こうかい)する|struggle=もがく・奮闘(ふんとう)する|surround=取(と)り囲(かこ)む|tend=〜する 傾向(けいこう)が ある|wander=ぶらつく|whistle=口笛(くちぶえ)を ふく|yell=大声(おおごえ)で 言(い)う|depend=たよる',
    `${big('depend on 〜')}（〜に たよる・〜しだいだ）、${big('tend to 〜')}（〜しがちだ）の 形(かたち)で よく 使(つか)う。`);
  vocab(9, '社会(しゃかい)と 環境(かんきょう)②', 'hunger=飢(う)え|duty=義務(ぎむ)|failure=失敗(しっぱい)|recycling=リサイクル|carbon=炭素(たんそ)|endangered=絶滅(ぜつめつ)の おそれの ある|extinct=絶滅(ぜつめつ)した|wheat=小麦(こむぎ)|wind power=風力(ふうりょく)|million=100万(まん)|billion=10億(おく)|double=2倍(ばい)の|disabled=障(しょう)がいの ある|barrier-free=バリアフリーの|sign language=手話(しゅわ)|braille=点字(てんじ)|gas=気体(きたい)・ガス|liquid=液体(えきたい)|solid=固体(こたい)|metal=金属(きんぞく)|fossil=化石(かせき)',
    `${big('million')}＝100万(まん)、${big('billion')}＝10億(おく)。「3百万(びゃくまん)」は ${big('three million')}（s を つけない）。`);
  vocab(9, '学校(がっこう)と 日本(にほん)の 文化(ぶんか)', 'graph=グラフ|essay=作文(さくぶん)|diary=日記(にっき)|chapter=（本(ほん)の）章(しょう)|paragraph=段落(だんらく)|vocabulary=語(ご)い|grammar=文法(ぶんぽう)|pronunciation=発音(はつおん)|spelling=つづり|pottery=陶器(とうき)|calligraphy=書道(しょどう)|tea ceremony=茶道(さどう)|kimono=着物(きもの)|origami=折(お)り紙(がみ)|haiku=俳句(はいく)|pilgrim=巡礼者(じゅんれいしゃ)',
    `${big('kimono')}・${big('origami')}・${big('haiku')} は 日本語(にほんご)から 英語(えいご)に なった 言葉(ことば)。`);
  vocab(9, 'つけ足(た)す 言葉(ことば)（副詞(ふくし)）④', 'neither=どちらも 〜ない|forever=永遠(えいえん)に|honestly=正直(しょうじき)に|someday=いつか|though=〜だけれど|luckily=幸運(こううん)にも|naturally=当然(とうぜん)・自然(しぜん)に|politely=ていねいに|silently=だまって|loudly=大(おお)きな 声(こえ)で|safely=安全(あんぜん)に|freely=自由(じゆう)に|mostly=たいてい|anywhere=どこにでも|nowhere=どこにも 〜ない|upstairs=上(うえ)の 階(かい)へ|downstairs=下(した)の 階(かい)へ|beyond=〜の 向(む)こうに',
    `ようすを 表(あらわ)す 言葉(ことば)に ${big('-ly')} を つけると「〜に」の 意味(いみ)に なる ことが 多(おお)い（safe → safely）。`);
  W.units.sort((a, b) => UNITS[a].grade - UNITS[b].grade);
})();
