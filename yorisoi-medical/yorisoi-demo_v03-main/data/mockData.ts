import { Patient, Facility, Round, ClinicalData } from '../types';

// --- Text Transcripts (P1 - P9) ---
const text1 = `本日あなたの症状 なんですけれども、単なる傷ではなくて ですね。ちょっと 糖尿病性潰瘍になります。あの 結構重い病気でして こちら。
 アッシュの切断というのが起こる可能性があります。ちょっとこちら その。
 足の？
 裏にまぁちょっと結構大きめの。
 海洋がありまして。
 今からですね。ちょっと。
 軟鋼等を塗りながら何個目ゲルを塗りながら 敵 デブリードマンして。
 より良い。
 診察をよりよくその。
 より良い生活が送れるようにぜひぜひ 定期的に。
 通院していただいて 難聴 塗ったり行けるんだったりしていきたいなと思いますので。
 また来週 とりあえず今日はげると何個 塗りますので、来週また来ていただいて徐々に治していきたいなと思います。はい、お気をつけて。`;

const text2 = `今日の診察日ではお薬は変わりませんでした。
また3週間後に受診をします。
仕事を始めたことを話しました。どんな仕事をしてるのと聞かれました。
障害者雇用で割と同じ作業を一つ一つやっていることを話しました。仕事自体はやっぱりまだ慣れず大変だけれども、家にいて ママが寂しい寂しいと言ってくることのストレスが少し減ったことも話しました。
すごく辛くて寂しかった時。ずっと一人だったのに、どうして今寂しい寂しいって言えるんだろう と言いました。`;

const text3 = `よろしくお願いします。
お願いします。よろしくお願いします。今回は1ヶ月ぐらい前から咳が止まらないっていうことで、こういったことはよくありますか？結構よくあります。
補給のやつなんですけど、入ってみたいな。あれがちょっと 対策 業と肺活量に関してどれぐらい 1秒間で出せるか？みたいな割合っていうのがちょっと正常より低くなっている感じで、おそらく 単身 原則っていうような病気？
です。
牛乳の薬を出してしまうと思うんですけど、給料の使い方とかっていますかね？看護師さんですか？そうなんですね。
ありがとうございます。
再生してください。じゃあ あの一応 パーセントにしては 比較的保持するんですけど、ゼロの方、一度率の方がちょっとまだ低下してるので 非常に閉鎖的な疾患のある形になると思うので、家族歴とかもありますので、ボロボロは黒いことになったりとか。一応 急にステロイドの生活 指摘 ある の問題 みたいな感じで、1日1回でお話ししておきますので見てください。ちょっと また 2週間後くらいに解除してんだよ。動画をちゃんと見ても。
じゃあ ということで また。`;

const text4 = `こんにちは。
今日は 療養計画書の作成をしていただきます。ここにお名前と生年月日と。
現在のご年齢のご記入をお願いします。
お食事は取れてますか？
〇〇さん 血圧高いので塩分に気を付けてください。スープとかは飲まないようにしてくださいね。
運動は何か習慣があったりしますか？
ウォーキングをされてるんですね。
何分ぐらいですか？
ありがとうございます。ウォーキング30分ぐらい 週4回できてるっていう事で、すごく 運動の習慣はついてると思いますので、これ ぜひ 続けていただければと思います。
あと、今 体重が bmi25以上を超えているので 少しずつでも 減量の？
体重を落としていく っていう視点を持っていただければいいかなと思いますので、例えば お食事だと揚げ物がすごい 食べる頻度が多い よってことだったので、その揚げ物の頻度を週に 週4回から 週2回に減らしていただくということ と。あと運動はですね。あの
散歩はできているので動けてはいるとは思うんですけど、やっぱり 筋肉量 っていうところを見ると、少し軽い筋トレだったりとか入れていただくと散歩での有酸素運動だったり、あとは 筋トレ 筋肉を多くしていただくことによって、基礎の基礎代謝 代謝が上がりますので、死亡 だったり 燃焼しやすくなりますので、体重の減量も効果があるかなと思いますので、ぜひね。取り入れていただければと思います。体重が落ちてくると、血圧も少し改善傾向になるかなとは思いますので、それを今後次計画書 4ヶ月後なので、またその時に お話を聞かせていただければと思いますのでお願いします。`;

const text5 = `使っていくしかないですかね。引き続き もう骨はくっついてるんで。
使って ちょっとで。まあ 劇的に良くなるのはまあここから難しいかもしれないね。リハビリ みたいにしない。限りはもっと カタカナに。
着替えるのがね。全然こんなもんだったから 使わなければ硬くなりますので、なので頑張って使ってってもらってっていう感じになるかな と思って。
て、どうしてもこの技術。まあ 手術して金属抜くまでは90度制限があるので、まあ どうしても90で硬くなっちゃうことは多いんですけど、まあね。そこまでも行ってないのでなかなかね。その時にもリハビリ。
なかなか 今からこう 歴史的に っていう基本的には難しい 気もしますので、まあちょっと日々ね。もう別に何やっちゃダメってことはないので、使いまくってもう男性とかまたしてないので もう動いてない。どうしても硬くなっちゃうんで、できるだけ使うようにね。いろんなものを剃ったりとかね。右手でやったり高いものだったり。とかも頑張って 右手を使うにしてください。上がらないと痛い 一緒です。
困ってます。日常
よくね。できるだけ動かしてやっていくしかないですかね。
摩周期から半年ぐらい経過してますのでは、一旦終了でいいかと思います。続けるとか動かすのとか、リハビリとかはもうずっとね。続けてもらうという形でいいかなと思うので、できるだけ使っていくようにしてください。じゃあ、以上になります ん。で はい、お疲れ様でした。これで終わりです。窓開けますので 境界線になってるので、どっか 別のとこにいたいとかありましたら、近くの病院さん 行ってもらって、何かあったら 紹介 リハビリに来るとかなったらそれもそれで。
ございます。`;

const text6 = `自分のこの4ギガの痩せた うまくいくかな？
珍しい23年 しちゃってますけど2人目です。そんなに少ない？僕の周りではもう一人いるから それでも3人か？
短大でも2人とかそんなんですか？
キャッスルマン病。
何かて免疫とか 絡んでくるようなもんなんです。リンパ腫とはちょっと違うんですけど、だから あれかな？内分泌の先生が免疫の自己抗体の値が上がっていって 明日 一応 内分泌 で診察ではあるんですけど。
特に何か検査 入ってなかったら、いつの先生が 術前に。
8月 結構。
血液内科の先生、そこがすごい上がってるっていう仕様とかでも上がる場合があるから手術の後にそうですね。
160って それって 160倍って正常は？
いろいろ 千差万別 色々あるんですけど、大神さんの場合は良性 って言うと言い過ぎ かもしれないですけど、行政に近いと考えるまで。
刑事 血管型探求 申請っていうのが？
当時結成。血管型
これの場合だいたい手術で治ります。取ったら ってこと 絶対とは言えないんですけど。
リンパに関するもの かって 前川村先生が言ってた。それも関係してますか？`;

const text7 = `お疲れ様でした。その後、退院後は大丈夫でしたか？
自分のチェックでどうします？痒みとか こちらにしますか？痒みとかあるようでしたら買えますけどいかがですか？大丈夫じゃあ。
まあ使い 変えましょう。
僕やりまして 大丈夫？これテープで止めてます ん。で はい、これ 剥がすだけですね。またね、前回 ここまで切りましたけど、この半分ぐらいで済んでますんで。
痒みとかないですかね？あれもないし。
OK 大丈夫でしょう。来週もし同じ時間で来ていただけるようでしたら、これ外してという形にさせていただきますが、また同じ時間でいいですよ。
しびれとかもないですかね。大丈夫ね。
はい、よろしいですよ。フロー はまだ。
だけしていただければ はい、ここがカバーしていただければ大丈夫です。
そうですね。11日の朝市に来ていただきましょうか。お疲れ様でした。
それではお待ちしてますね。`;

const text8 = `忘れ物 しちゃった。
こんにちは。よろしくお願いします。
会えていました。空いてました。すいません。
小さめ みたいな感じで 今ちょっと病んでます。よろしくお願い致します。
すいません、昨日はね。お医者さんどう？
でした。はい、はいはい。血圧も130の80で心配ないって言うんです。結構 何本も撮った？ここから本当ですか？隣の行った時、先月 行った時ね。今度の来た時は検査します。血圧 検査、いろんな血を取ったの2本ぐらいだから色々 全部取ってくれたんで 結構ね。いろんなものか 本当ですか？申し込んできたんですよ。あの 今 あれですよね。基本検診も予約 なんですよね。近藤先生、そうですね。どこも 病院 もね。どうも 昨日は混んでね。みんなそういう人だからさ。
みんな検査してる 予約の人だからいつも1時間で来るのに2時間半ぐらいかかったけど疲れました。血も抜かれる してでも行って良かったですよ。今日だったらね。
薬はまだあるんだけど、土曜日あたりまであるんだけどね。早く行っといた方が。
安心するから、じゃあ帰りがけにとって これました。お薬もそこまで 車で 往復 行って。それで5年にも買い物もしないで 元気がないのね。疲れ切っちゃって休まず一生懸命 歩いてきた。これ押して 薬局から薬局から。
この坂がね。信号を渡るところが、やっぱり ガタガタする。なんとか一生懸命 行ってきて良かったです。本当です。親切な人で運転さんが行く ながらも 女の運転さんで帰りも親切な運転さんて良かったです。よかったですね。本当に車が低いからね。タクシーのね。
よかった いって人に。
その血液検査の結果はいつ頃出るんですか？だから今度行った来週、来月から来月の15日 かな？予約したんですよ。本当ですか？名車もあるんだけど、まぁしょうがない。4日あるから 眼医者は予約してあるんですよ。15日に19 かな？15だから大丈夫。水曜日、みんな どっちも 水曜日。
だよね？
9月 水曜で12が水曜ですね。水曜日 予約したんだよ。12日かもしれないです。
これは白いものなんだろう。
お薬の あれかな？
これ 予約だ！予約表 予約。昨日 これだけの検査したの？いろんな 本当ですね。結構まあいっぱいすいません。5分ぐらい仕事って もう めまい しちゃいますね。
同じ姿勢でいるとね。
次回は書いてないかな？あれだね。同じ水量 だったんだよ。両方とも。
今日は10月の16日ですね。木曜日 ありがとうございます。はい、そうですね。熱は36.5。
冷えピタを息子に買ってきといてもらって熱がありそうな時は冷えピタをするんですよ。まあ29か。
39°c30分ぐらいになる時あったんですよ。心配で終わっちゃったらどうしようと思ったらすぐ治った。
回復力が 冷えピタ して本当ですか？
下ろして大丈夫？リラックスしててくださいね。
114。
また振り出しましたかね。28。ありがとうございます。
足の爪の様子はどうですか？あのね はい、足がねむくみがで取れましたよ。確かにちょっと一回り小さくなってます。昨日は全然 むくみがない。こないだ 成績 調べたんですよ。あの、妻の日から 本当ですか？不思議とか思って不思議。
昨日もね。靴下 の後はこの辺はつくんだけど、ここがね 踏まないの？今日は少しむくんでるか？
でも いつもより取れてます。取れてます。見事だったの？暮らしてまだ でも情報がちょっと今日は 手話がずっと出てた。本当ですか？
血圧 取りますね。
爪自体は刺さって。
160の62レース ありがとうございます。
今日はね。ちょっとお天気があれなので 外出られそうなさそうなので、ちょっとで今日はね。昨日もいっぱいあるからだと思うので、その前の日。
は、全く前の日はね。名前の前の日かな？はいはいはい、木曜日。
7階まで行ってきたんですよ。本当ですか？動かれてます。ゴミ捨て ぐらいなのにそうですよね。じゃあ今日は マッサージをして体操をちょっと多めにさせてください。はい、お願いします。`;

const text9 = `それじゃあ、今日は 健吾くんの卵アレルギーの負荷試験についてお話ししますね。もうすぐ幼稚園でも給食始まる時期ですもんね。ちょっとドキドキですよね。試験は来週の火曜日、10月15日の午前9時からです。
朝ごはんは食べずに来てもらって お水とかぽちゃくらいなら大丈夫です。あ、牛乳とかジュースはちょっとやめておいてください ねね。圭吾くん頑張ろうね。
で、持ち物は 母子手帳と保険証、それから 医療証とお薬手帳。あとはもし エピペン お持ちでしたら 念のため 持ってきてください。当日はね。卵をほんの少しずつ食べてもらって 体の反応を見ていきます。途中で痒みとか咳とか気分が悪くなった時はすぐ教えてください。無理に続けなくて大丈夫ですからね。
あと、体調が悪い日や熱がある日は試験できませんので、その時は朝にお電話いただけたら助かります。試験の後、だいたい1時間ぐらい 院内で様子を見ます。圭吾君、隊長 退屈しちゃうかもしれませんけど、絵本とか持ってきてもらうといいかもですね。あ、お母さんも 朝 バタバタすると思うんですけど、無理せず来てくださいね。午前中は 予定入れずにゆったりめ で大丈夫です。ああと以前お渡ししたお薬も一緒にお持ちください。はい、そんな感じです。何かご不安なことをありますか？
はい、大丈夫です。`;

// --- Clinical Data (JSON) P1 - P9 ---

const data1: ClinicalData = {
  "soap": {
    "subjective": "医師より足裏の傷について、単なる外傷ではなく糖尿病性潰瘍であるとの説明を受ける。重篤な状態であり、下肢切断のリスクがある旨を聴取。",
    "objective": "足底部に比較的大きな潰瘍あり。診断：糖尿病性足病変（糖尿病性潰瘍）。処置：デブリードマン施行、軟膏およびゲル剤の塗布。",
    "assessment": "糖尿病性潰瘍に対し、デブリードマンおよび外用療法にて治療開始。下肢切断のリスクが高いため、継続的な創部管理と定期的な通院が必要である。",
    "plan": "軟膏・ゲル剤による外用療法を継続。週1回の通院にて経過観察および処置を行う方針。次回は来週受診予定。"
  },
  "home_visit": {
    "basic_info": "2025/11/12 AM ひまわりケアセンター 田中健 101号室",
    "chief_complaint": "足の傷",
    "observation_treatment": "足底部潰瘍処置。デブリードマン実施。",
    "medication_instruction": "軟膏塗布指導。",
    "next_plan_handover": "来週再診。"
  },
  "pharmacy_focus": {
    "medications": [
      {
        "name": "外用薬（軟膏・ゲル剤）",
        "dose": "適量",
        "route": "外用（患部塗布）",
        "frequency": "医師の指示通り",
        "status": "開始",
        "reason_or_note": "糖尿病性潰瘍の治療およびデブリードマン後の保護"
      }
    ],
    "adherence": "院内処置が中心だが、自己塗布の有無確認が必要。",
    "side_effects": [],
    "drug_related_problems": ["糖尿病治療薬のコントロール状況確認が必要"],
    "labs_and_monitoring": ["創部の状態（サイズ、感染兆候、肉芽形成）", "血糖コントロール指標"],
    "patient_education": ["下肢切断リスクがあるため週1回の定期受診継続を指導", "足への負荷軽減や観察の重要性を示唆"],
    "follow_up": "来週の受診状況および創部の改善傾向を確認する。"
  },
  "alerts": {
    "red_flags": ["創部の感染兆候（発赤、腫脹、排膿、悪臭、発熱）", "壊死の拡大、疼痛の急激な増悪"],
    "need_to_contact_physician": ["創部が悪化傾向にある場合"]
  },
  "meta": {
    "main_problems": ["糖尿病性足潰瘍（下肢切断リスクあり）"],
    "note_for_pharmacy": "文字起こし内の「アッシュ」は足、「海洋」は潰瘍等と推測して補正済。"
  }
};

const data2: ClinicalData = {
  "soap": {
    "subjective": "処方変更なし。障害者雇用にて就労開始。定型作業中心だが未だ慣れず負荷を感じている。在宅時間減少により母からの干渉ストレスは軽減。過去の孤独感と現在の母の訴えとのギャップに葛藤あり。",
    "objective": "処方内容：変更なし（Do処方）。次回受診：3週間後。生活状況：就労開始。",
    "assessment": "就労開始により社会機能向上。職場ストレスはあるが、家庭内ストレスからの物理的距離確保はプラス。経過は概ね安定。",
    "plan": "現在の薬物療法を継続。就労に伴う服薬アドヒアランス低下がないか確認。仕事と家庭のストレスバランスについてフォローアップ。"
  },
  "home_visit": {
    "basic_info": "2025/11/12 AM ひまわりケアセンター 佐藤博 102号室",
    "chief_complaint": "特になし",
    "observation_treatment": "精神状態確認。",
    "medication_instruction": "継続処方確認。",
    "next_plan_handover": "3週間後。"
  },
  "pharmacy_focus": {
    "medications": [
      {
        "name": "（既存処方継続）",
        "dose": "",
        "route": "",
        "frequency": "",
        "status": "継続",
        "reason_or_note": "処方変更なし"
      }
    ],
    "adherence": "生活リズム変化に伴う飲み忘れ有無を確認。",
    "side_effects": [],
    "drug_related_problems": ["特になし"],
    "labs_and_monitoring": ["精神状態（気分の波、不安）", "睡眠状況"],
    "patient_education": ["生活習慣に合わせた服薬管理", "十分な休息の推奨"],
    "follow_up": "仕事の継続状況と心身のコンディション確認。"
  },
  "alerts": {
    "red_flags": ["精神状態の急激な悪化", "ストレス過多による自己管理能力低下"],
    "need_to_contact_physician": []
  },
  "meta": {
    "main_problems": ["精神症状コントロール", "家庭環境ストレス", "就労適応"],
    "note_for_pharmacy": "障害者雇用開始。母との関係性に葛藤あり。"
  }
};

const data3: ClinicalData = {
  "soap": {
    "subjective": "約1ヶ月前より咳嗽が遷延しており受診。過去にも同様の症状あり。職業は看護師。",
    "objective": "スパイロメトリー実施。％肺活量は保持されるが、1秒率（FEV1%）低下あり。閉塞性換気障害示唆。",
    "assessment": "遷延性咳嗽および検査所見から気管支喘息等の閉塞性呼吸器疾患疑い。吸入ステロイド薬導入が妥当。",
    "plan": "吸入ステロイド薬（1日1回）処方開始。医師より動画視聴等による吸入指導指示あり。2週間後再受診。"
  },
  "home_visit": {
    "basic_info": "2025/11/10 AM ひまわりケアセンター 鈴木一郎 103号室",
    "chief_complaint": "咳",
    "observation_treatment": "呼吸音聴診。",
    "medication_instruction": "吸入指導。",
    "next_plan_handover": "2週間後。"
  },
  "pharmacy_focus": {
    "medications": [
      {
        "name": "吸入ステロイド薬",
        "dose": "用量不明",
        "route": "吸入",
        "frequency": "1日1回",
        "status": "開始",
        "reason_or_note": "遷延性咳嗽、閉塞性障害疑い"
      }
    ],
    "adherence": "",
    "side_effects": [],
    "drug_related_problems": ["吸入手技の習得"],
    "labs_and_monitoring": ["呼吸機能検査（1秒率）"],
    "patient_education": ["吸入薬の使用方法指導（動画視聴併用）", "毎日継続の重要性"],
    "follow_up": "2週間後の咳嗽症状改善度と手技再確認。"
  },
  "alerts": {
    "red_flags": ["呼吸困難、喘鳴増悪", "夜間睡眠が妨げられる咳き込み"],
    "need_to_contact_physician": []
  },
  "meta": {
    "main_problems": ["1ヶ月続く遷延性咳嗽", "気管支喘息疑い"],
    "note_for_pharmacy": "患者は看護師だが吸入手技は個別に確認望ましい。"
  }
};

const data4: ClinicalData = {
  "soap": {
    "subjective": "療養計画書作成。食事摂取可。週4回30分ウォーキング実施中。揚げ物を週4回程度摂取。",
    "objective": "高血圧症および肥満（BMI 25以上）。",
    "assessment": "高血圧・肥満に対し生活習慣改善が必要。運動習慣は良好。食習慣（塩分・脂質）の是正により減量と血圧改善が期待できる。",
    "plan": "減塩指導、揚げ物摂取頻度低減（週4→週2）目標設定。運動は継続＋軽い筋トレ提案。4ヶ月後再評価。"
  },
  "home_visit": {
    "basic_info": "2025/11/08 AM ひまわりケアセンター 高橋誠 104号室",
    "chief_complaint": "なし",
    "observation_treatment": "血圧測定。",
    "medication_instruction": "食事指導。",
    "next_plan_handover": "4ヶ月後。"
  },
  "pharmacy_focus": {
    "medications": [],
    "adherence": "",
    "side_effects": [],
    "drug_related_problems": [],
    "labs_and_monitoring": ["体重・BMI推移", "血圧値推移"],
    "patient_education": ["減塩指導", "揚げ物頻度低減", "筋力トレーニング追加提案"],
    "follow_up": "4ヶ月後の計画書見直しに向け、生活習慣定着度と体重変化を確認。"
  },
  "alerts": {
    "red_flags": [],
    "need_to_contact_physician": []
  },
  "meta": {
    "main_problems": ["高血圧症", "肥満症", "不適切な食習慣"],
    "note_for_pharmacy": "療養計画書に基づき、薬局でも食事・運動の継続状況を確認支援する。"
  }
};

const data5: ClinicalData = {
  "soap": {
    "subjective": "術後半年経過。右上肢可動域制限残存しADL支障あり。疼痛あり。「使っていくしかないのか」と確認。",
    "objective": "術後半年、骨癒合確認済。患側関節拘縮あり。可動域制限指示以下の可動域。",
    "assessment": "骨癒合良好だが関節拘縮顕著。劇的改善は困難だが、拘縮進行防止のため疼痛があっても積極的使用とリハビリ継続が不可欠。",
    "plan": "当院での経過観察終了（終診）。日常生活での積極的使用と自主リハビリ継続を指導。不調時は近医受診方針。",
  },
  "home_visit": {
    "basic_info": "2025/11/07 AM グループホーム さくら 渡辺和子 201号室",
    "chief_complaint": "腕の痛み",
    "observation_treatment": "可動域確認。",
    "medication_instruction": "リハビリ指導。",
    "next_plan_handover": "終診。"
  },
  "pharmacy_focus": {
    "medications": [],
    "adherence": "",
    "side_effects": [],
    "drug_related_problems": [],
    "labs_and_monitoring": ["可動域（ROM）", "疼痛推移"],
    "patient_education": ["日常生活での積極的使用", "自主リハビリ継続励行", "過度な安静不要"],
    "follow_up": "終診だが、来局時に患部使用状況や疼痛確認しリハビリ継続を動機づけ。"
  },
  "alerts": {
    "red_flags": [],
    "need_to_contact_physician": []
  },
  "meta": {
    "main_problems": ["術後関節拘縮（右上肢）"],
    "note_for_pharmacy": "医療機関終診。今後は自主管理中心のため薬局でも支援望ましい。"
  }
};

const data6: ClinicalData = {
  "soap": {
    "subjective": "キャッスルマン病について医師に確認。自己抗体高値を懸念。前医より「リンパに関する病気」と説明あり。",
    "objective": "キャッスルマン病疑い。自己抗体値上昇。術前に内分泌科・血液内科評価中。",
    "assessment": "希少疾患評価段階。「硝子血管型」と推測され、外科的切除により根治期待できる病態（限局性）と考えられている。",
    "plan": "内分泌科での術前評価予定。外科的手術が第一選択。"
  },
  "home_visit": {
    "basic_info": "2025/11/05 AM グループホーム さくら 小林勇 202号室",
    "chief_complaint": "不安",
    "observation_treatment": "問診。",
    "medication_instruction": "説明。",
    "next_plan_handover": "術前評価。"
  },
  "pharmacy_focus": {
    "medications": [],
    "adherence": "",
    "side_effects": [],
    "drug_related_problems": [],
    "labs_and_monitoring": ["自己抗体値", "免疫関連マーカー"],
    "patient_education": ["病態説明（良性・根治期待）への理解確認", "不安傾聴"],
    "follow_up": "周術期の指示事項（持参薬・休薬等）発生時は確認。"
  },
  "alerts": {
    "red_flags": [],
    "need_to_contact_physician": []
  },
  "meta": {
    "main_problems": ["キャッスルマン病疑い", "自己抗体価上昇"],
    "note_for_pharmacy": "希少疾患。術前評価段階。"
  }
};

const data7: ClinicalData = {
  "soap": {
    "subjective": "退院後経過観察。創部痒みやしびれ等なし。",
    "objective": "術後創部（テープ固定中）。発赤・炎症なし。しびれなし。テープ除去し観察。",
    "assessment": "術後経過良好。感染兆候や神経合併症なし。",
    "plan": "シャワー浴許可。1週間後に創部固定完全除去予定。"
  },
  "home_visit": {
    "basic_info": "2025/10/30 AM グループホーム さくら 加藤美咲 203号室",
    "chief_complaint": "なし",
    "observation_treatment": "創部確認。",
    "medication_instruction": "入浴指導。",
    "next_plan_handover": "1週間後。"
  },
  "pharmacy_focus": {
    "medications": [],
    "adherence": "",
    "side_effects": [],
    "drug_related_problems": [],
    "labs_and_monitoring": ["創部治癒状態"],
    "patient_education": ["入浴指導（患部保護）"],
    "follow_up": "次回受診時（1週間後）に固定除去完了予定。"
  },
  "alerts": {
    "red_flags": ["創部の発赤、疼痛、熱感（感染兆候）"],
    "need_to_contact_physician": []
  },
  "meta": {
    "main_problems": ["術後経過観察"],
    "note_for_pharmacy": ""
  }
};

const data8: ClinicalData = {
  "soap": {
    "subjective": "昨日受診し疲労。血圧130/80と言われた。来月血液検査結果説明。残薬あるが早めに受取済。時々39℃台発熱あるがすぐ解熱。足むくみ改善感あり。",
    "objective": "訪問日10/16。体温36.5℃。血圧114/78, 160/62。下肢浮腫軽度改善。爪食い込みなし。",
    "assessment": "服薬意識高い。血圧変動あり（160mmHg）。一過性高熱あり注意要。浮腫改善傾向。",
    "plan": "血圧変動と発熱観察継続。来月検査結果確認。残薬管理支援。"
  },
  "home_visit": {
    "basic_info": "2025/10/16 AM グループホーム さくら 山本トメ 204号室",
    "chief_complaint": "疲労感",
    "observation_treatment": "バイタル測定。",
    "medication_instruction": "残薬確認。",
    "next_plan_handover": "来月。"
  },
  "pharmacy_focus": {
    "medications": [],
    "adherence": "意識高い（早めの受診等）。",
    "side_effects": [],
    "drug_related_problems": [],
    "labs_and_monitoring": ["訪問時血圧（変動あり）", "体温（一過性発熱）", "下肢浮腫", "来月血液検査結果"],
    "patient_education": [],
    "follow_up": "血圧日内変動、発熱再発有無確認。"
  },
  "alerts": {
    "red_flags": ["一時的な39℃台発熱（原因不明）", "収縮期血圧160mmHg"],
    "need_to_contact_physician": ["血圧高値と不明熱について医師への情報提供検討"]
  },
  "meta": {
    "main_problems": ["血圧不安定", "一過性発熱", "下肢浮腫"],
    "note_for_pharmacy": "訪問スタッフ記録。シルバーカー使用。"
  }
};

const data9: ClinicalData = {
  "soap": {
    "subjective": "幼稚園給食開始控え、卵経口負荷試験受けることに母了承（不安あり）。",
    "objective": "来週火曜（10/15）卵負荷試験予定。朝絶食。持参物指示済。試験後1時間観察予定。",
    "assessment": "アレルギー評価段階。負荷試験リスクについて保護者への説明・同意済。",
    "plan": "事前オリエンテーション実施。絶食、持参物、連絡体制説明。予定通り実施方針。"
  },
  "home_visit": {
    "basic_info": "2025/10/10 AM グループホーム さくら 中村健吾 205号室",
    "chief_complaint": "アレルギー相談",
    "observation_treatment": "問診。",
    "medication_instruction": "負荷試験説明。",
    "next_plan_handover": "来週。"
  },
  "pharmacy_focus": {
    "medications": [
      { name: "エピペン", dose: "", route: "注射", frequency: "頓用", status: "不明", reason_or_note: "所持者のみ持参指示" },
      { name: "既処方薬", dose: "", route: "", frequency: "", status: "継続", reason_or_note: "当日持参指示" }
    ],
    "adherence": "",
    "side_effects": [],
    "drug_related_problems": [],
    "labs_and_monitoring": ["負荷試験結果（誘発症状、摂取可能量）"],
    "patient_education": ["絶食指示厳守", "当日体調確認・連絡", "試験中症状報告", "エピペン持参徹底"],
    "follow_up": "試験結果確認し処方・除去食指導に反映。"
  },
  "alerts": {
    "red_flags": ["アナフィラキシー症状"],
    "need_to_contact_physician": []
  },
  "meta": {
    "main_problems": ["食物アレルギー（卵）", "負荷試験予定"],
    "note_for_pharmacy": "エピペン所持状況・使用期限確認望ましい。"
  }
};


export const MOCK_FACILITIES: Facility[] = [
  {
    id: 'f_001',
    name: 'ひまわりケアセンター',
    patients: [] // Will be populated below
  },
  {
    id: 'f_002',
    name: 'グループホーム さくら',
    patients: []
  }
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: "p1",
    name: "田中 健",
    kana: "タナカ ケン",
    birthDate: "1952-04-10",
    age: 72,
    gender: "male",
    avatarColor: "#fca5a5", // red-300
    facility_id: 'f_001',
    room_number: '101',
    records: [
      { id: "r1-1", date: "2025-11-12", transcript: text1, clinicalData: data1, status: 'pending' },
      { id: "r1-0", date: "2025-11-05", transcript: "（前回の記録...）", clinicalData: { ...data1, soap: { ...data1.soap, subjective: "前回記録" } }, status: 'approved' }
    ]
  },
  {
    id: "p2",
    name: "佐藤 博",
    kana: "サトウ ヒロシ",
    birthDate: "1989-08-22",
    age: 35,
    gender: "male",
    avatarColor: "#93c5fd", // blue-300
    facility_id: 'f_001',
    room_number: '102',
    records: [
      { id: "r2-1", date: "2025-11-12", transcript: text2, clinicalData: data2, status: 'pending' }
    ]
  },
  {
    id: "p3",
    name: "鈴木 一郎",
    kana: "スズキ イチロウ",
    birthDate: "1980-01-15",
    age: 45,
    gender: "male",
    avatarColor: "#6ee7b7", // emerald-300
    facility_id: 'f_001',
    room_number: '103',
    records: [
      { id: "r3-1", date: "2025-11-10", transcript: text3, clinicalData: data3, status: 'approved' }
    ]
  },
  {
    id: "p4",
    name: "高橋 誠",
    kana: "タカハシ マコト",
    birthDate: "1965-06-30",
    age: 60,
    gender: "male",
    avatarColor: "#fcd34d", // amber-300
    facility_id: 'f_001',
    room_number: '104',
    records: [
      { id: "r4-1", date: "2025-11-08", transcript: text4, clinicalData: data4, status: 'pending' }
    ]
  },
  {
    id: "p5",
    name: "渡辺 和子",
    kana: "ワタナベ カズコ",
    birthDate: "1948-11-03",
    age: 77,
    gender: "female",
    avatarColor: "#c4b5fd", // violet-300
    facility_id: 'f_002',
    room_number: '201',
    records: [
      { id: "r5-1", date: "2025-11-07", transcript: text5, clinicalData: data5, status: 'pending' }
    ]
  },
  {
    id: "p6",
    name: "小林 勇",
    kana: "コバヤシ イサム",
    birthDate: "1995-03-21",
    age: 30,
    gender: "male",
    avatarColor: "#f9a8d4", // pink-300
    facility_id: 'f_002',
    room_number: '202',
    records: [
      { id: "r6-1", date: "2025-11-05", transcript: text6, clinicalData: data6, status: 'pending' }
    ]
  },
  {
    id: "p7",
    name: "加藤 美咲",
    kana: "カトウ ミサキ",
    birthDate: "1990-12-10",
    age: 34,
    gender: "female",
    avatarColor: "#67e8f9", // cyan-300
    facility_id: 'f_002',
    room_number: '203',
    records: [
      { id: "r7-1", date: "2025-10-30", transcript: text7, clinicalData: data7, status: 'approved' }
    ]
  },
  {
    id: "p8",
    name: "山本 トメ",
    kana: "ヤマモト トメ",
    birthDate: "1938-09-15",
    age: 87,
    gender: "female",
    avatarColor: "#fdba74", // orange-300
    facility_id: 'f_002',
    room_number: '204',
    records: [
      { id: "r8-1", date: "2025-10-16", transcript: text8, clinicalData: data8, status: 'pending' }
    ]
  },
  {
    id: "p9",
    name: "中村 健吾",
    kana: "ナカムラ ケンゴ",
    birthDate: "2020-05-05",
    age: 5,
    gender: "male",
    avatarColor: "#bef264", // lime-300
    facility_id: 'f_002',
    room_number: '205',
    records: [
      { id: "r9-1", date: "2025-10-10", transcript: text9, clinicalData: data9, status: 'pending' }
    ]
  }
];

// Link patients to facilities
MOCK_FACILITIES[0].patients = MOCK_PATIENTS.filter(p => p.facility_id === 'f_001');
MOCK_FACILITIES[1].patients = MOCK_PATIENTS.filter(p => p.facility_id === 'f_002');

export const MOCK_ROUNDS: Round[] = [
  {
    id: 'r_001',
    date: '2025-12-04',
    time_slot: 'AM',
    facility_id: 'f_001',
    facility_name: 'ひまわりケアセンター',
    visits: [
      {
        id: 'v_001',
        order: 1,
        transcript_summary: '足の傷の処置。デブリードマン実施。',
        estimated_patient_name: '田中健',
        confirmed_patient_id: 'p1',
        status: 'matched',
        clinicalData: data1,
        transcript: text1
      },
      {
        id: 'v_002',
        order: 2,
        transcript_summary: '精神状態の確認。就労開始によるストレス。',
        estimated_patient_name: '佐藤博',
        confirmed_patient_id: 'p2',
        status: 'matched',
        clinicalData: data2,
        transcript: text2
      },
      {
        id: 'v_003',
        order: 3,
        transcript_summary: '咳の症状。吸入指導。',
        estimated_patient_name: '鈴木一郎',
        confirmed_patient_id: 'p3',
        status: 'matched',
        clinicalData: data3,
        transcript: text3
      }
    ]
  },
  {
    id: 'r_002',
    date: '2025-12-04',
    time_slot: 'PM',
    facility_id: 'f_002',
    facility_name: 'グループホーム さくら',
    visits: [
      {
        id: 'v_004',
        order: 1,
        transcript_summary: '術後経過観察。リハビリ指導。',
        estimated_patient_name: '渡辺和子',
        confirmed_patient_id: 'p5',
        status: 'matched',
        clinicalData: data5,
        transcript: text5
      }
    ]
  }
];