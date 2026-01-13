import { Patient, Facility, Round, ClinicalData } from '../types';

// --- Text Transcripts for Demo Scenarios ---

// Scenario 1: Cancer Pain + Constipation + Unused Meds
const textScenario1 = `
薬剤師「こんにちは、体調いかがですか？」
患者「うん、痛みはだいぶ落ち着いてるよ。オキシコンチンのおかげかな。」
薬剤師「それは良かったです。痛み止め、ちゃんと時間通り飲めてますか？」
患者「うん。でもね、ちょっと便秘気味で…。お腹が張って苦しいんだよね。」
薬剤師「ああ、痛み止め（オキシコンチン）の副作用で便秘になりやすいんですよ。下剤のマグミットは飲んでます？」
患者「いや、あんまり薬増やしたくなくて、まだ飲んでないんだ。残ってるのが3シートくらいあるかな。」
薬剤師「痛み止めを使う時は、便通を良くすることも大事なんです。我慢せずにマグミットも飲んでみましょうか。あと、レスキューのオキノームは使いました？」
患者「いや、今回は使わなかった。前の分もまだあるから、今回はもらわなくていいかな。」
薬剤師「わかりました。オキノームは残薬ありということで調整しますね。眠気とかふらつきはどうですか？」
患者「昼間ちょっとぼーっとすることはあるけど、生活に支障はないよ。」
薬剤師「わかりました。もしふらつきが強くなるようなら教えてくださいね。じゃあ、今回は便秘のケアをしっかりしていきましょう。」
`;

// Scenario 2: Chronic Disease + Polypharmacy + Forgetting Night Dose
const textScenario2 = `
薬剤師「こんにちは。血圧のお薬、順調に飲めてますか？」
患者「いやぁ、朝はいいんだけどね、夜はどうしても飲み忘れちゃうことがあって。」
薬剤師「そうですか。夜のお薬、結構残ってます？」
患者「うん、1週間分くらい溜まっちゃってるかも。」
薬剤師「なるほど。夜は何かと忙しいですもんね。例えば、夕食後すぐに飲むとか、歯磨きの時に飲むとか、習慣づけできるといいんですけど。」
患者「ああ、歯磨きの時なら忘れないかも。」
薬剤師「じゃあ、薬の置き場所を洗面所の目につく所に変えてみましょうか。あと、最近めまいとか立ちくらみはないですか？」
患者「たまに立ち上がった時にクラッとすることはあるね。」
薬剤師「飲み忘れで血圧が変動してる可能性もありますし、薬が効きすぎてる可能性もありますね。続くようなら先生に相談してみましょう。」
`;

// Scenario 3: Anti-cancer Agent + Nausea + Unused Antiemetic
const textScenario3 = `
薬剤師「抗がん剤の治療、始まりましたね。体調はどうですか？」
患者「うん…やっぱり気持ち悪くて、食欲がないのよ。」
薬剤師「辛いですね。吐き気止め（ドンペリドン）は使ってますか？」
患者「いや、なんか薬飲むのも怖くて、まだ使ってないの。余計気持ち悪くなりそうで。」
薬剤師「ドンペリドンは、胃腸の動きを良くして吐き気を抑えるお薬です。飲むことで楽になって、ご飯も食べられるようになるかもしれませんよ。」
患者「そうなの？じゃあ、飲んでみたほうがいいのかしら。」
薬剤師「ええ、我慢せずに試してみてください。食事が摂れないと体力も落ちちゃいますからね。あと、手足のしびれとかはないですか？」
患者「今のところそれは大丈夫。」
薬剤師「わかりました。じゃあまずは吐き気対策を優先しましょう。頓服のドンペリドンはまだ手元にありますよね？」
患者「ええ、10回分そのまま残ってるわ。」
`;

// Scenario 4: Delivery Only (Short Visit)
const textScenario4 = `
薬剤師「こんにちは、薬局です。今月分のお薬お届けに来ました。」
患者「あら、ご苦労様。そこに置いといてちょうだい。」
薬剤師「はい、いつもの血圧とコレステロールのお薬ですね。変わりないですか？」
患者「ええ、特にないわよ。元気にしてる。」
薬剤師「それは良かったです。残薬とかもないですか？」
患者「ないない、ちゃんと飲んでるから。」
薬剤師「承知しました。じゃあまた来月伺いますね。お大事に。」
`;

// Scenario 5: Doctor Conversation Focus (Pharmacist Observation)
const textScenario5 = `
医師「どうですか、血圧は。ちょっと高めですね。」
患者「そうなんですよ、最近寒くなったからですかね。」
医師「うーん、アムロジピンを少し増やしましょうか。5mgから10mgにしますね。」
患者「はい、わかりました。」
医師「あと、この新しい薬は少し足がむくみやすくなるかもしれません。気になったら教えてください。」
患者「むくみですね、わかりました。」
(医師退室後)
薬剤師「先生からお薬の変更ありましたね。アムロジピンが10mgになります。」
患者「そうだね。薬増えるのかぁ。」
薬剤師「血圧をしっかり下げるためですからね。前の5mgの薬、まだ残ってます？」
患者「いや、ちょうど今日で飲みきったよ。」
薬剤師「素晴らしいですね。じゃあ明日からはこの新しい10mgの方を飲んでください。先生もおっしゃってましたが、足のむくみが出たら教えてくださいね。」
患者「わかったよ。」
`;


// --- Clinical Data (JSON) for Scenarios ---

const dataScenario1: ClinicalData = {
  soap: {
    s: "疼痛コントロール良好（NRS 2/10）。オキシコンチン有効。便秘（排便3日に1回、腹満感あり）訴えあり。眠気・ふらつきは生活に支障なし。",
    o: "残薬確認：マグミット（3シート・未服用）、オキノーム（前回処方分残あり・今回使用なし）。バイタル安定。",
    a: "オキシコンチンによる便秘と思われる。マグミット服用に対する抵抗感（多剤懸念）あるが、疼痛管理継続のため排便コントロール必要と判断。オキノームは疼痛安定しており使用頻度低下。",
    p: "マグミット服用の重要性説明し、服用勧奨（まずは1日1回から）。オキノームは今回処方なしで調整。次回、排便状況と眠気・ふらつきの再確認。"
  },
  report_100: "疼痛良好。オピオイド副作用の便秘あり、マグミット未服用のため服用指導。レスキュー（オキノーム）今回使用なく残薬調整済。眠気ふらつき軽度で経過観察。次回排便状況確認する。",
  home_visit: {
    basic_info: "2025/12/19 AM 山田太郎",
    chief_complaint: "便秘、お腹の張り",
    observation_treatment: "残薬カウント、副作用確認",
    medication_instruction: "緩下剤の服用意義説明",
    next_plan_handover: "排便状況確認"
  },
  pharmacy_focus: {
    medications: [
      { name: "オキシコンチン", dose: "10mg", route: "内服", frequency: "1日2回", status: "継続", reason_or_note: "疼痛制御良好" },
      { name: "マグミット", dose: "330mg", route: "内服", frequency: "1日3回", status: "継続", reason_or_note: "残薬多数あり、服用指導" },
      { name: "オキノーム", dose: "2.5mg", route: "内服", frequency: "頓用", status: "中止", reason_or_note: "残薬調整（今回処方削除）" }
    ],
    adherence: "定期薬良好、頓用・対症療法薬に自己調節あり",
    side_effects: ["便秘（オピオイド由来疑い）"],
    drug_related_problems: ["副作用（便秘）に対する未治療（薬剤忌避）"],
    labs_and_monitoring: ["排便回数", "腹部膨満感", "眠気・ふらつき"],
    patient_education: ["疼痛管理における排便コントロールの重要性", "我慢せず緩下剤を使用することのメリット"],
    follow_up: "排便頻度、便性状の改善確認"
  },
  alerts: { red_flags: [], need_to_contact_physician: [] },
  meta: { main_problems: ["がん性疼痛", "オピオイド誘発性便秘"], note_for_pharmacy: "マグミットのアドヒアランス向上に注力" }
};

const dataScenario2: ClinicalData = {
  soap: {
    s: "朝の服薬は良好だが、夜間は生活動作の都合で飲み忘れ頻発（週3-4回）。立ちくらみ（めまい）の訴えあり。",
    o: "残薬確認：夕食後薬約7日分残。血圧手帳未確認だが、自覚症状（立ちくらみ）あり。",
    a: "夕食後の服用時点が生活リズムと合っていない可能性。アドヒアランス低下により血圧変動・症状発現のリスク。服用タイミングの変更（歯磨き時など）が有効と考える。",
    p: "夕食後薬の服用タイミングを「夕食後」から「就寝前（歯磨き時）」等の忘れにくい時間帯へ変更提案。服薬カレンダーや設置場所の工夫指導。めまいの経過観察。",
  },
  report_100: "夜間薬飲み忘れ（週3-4回）あり残薬7日分。立ちくらみ訴えあり。服用時点を生活リズムに合わせ「歯磨き時」等へ変更提案し設置場所指導実施。次回アドヒアランス改善と症状確認。",
  home_visit: {
    basic_info: "2025/12/19 AM 鈴木花子",
    chief_complaint: "飲み忘れ、立ちくらみ",
    observation_treatment: "残薬確認、生活動線確認",
    medication_instruction: "服用タイミング再設定",
    next_plan_handover: "飲み忘れ回数確認"
  },
  pharmacy_focus: {
    medications: [],
    adherence: "朝良好、夕不良（残薬あり）",
    side_effects: ["めまい・立ちくらみ（降圧不足or過効の可能性）"],
    drug_related_problems: ["アドヒアランス不良による治療効果不十分のリスク"],
    labs_and_monitoring: ["血圧値", "ふらつき・めまいの頻度"],
    patient_education: ["生活習慣に紐付けた服薬行動の確立（歯磨き時）", "薬の見える化"],
    follow_up: "変更後の飲み忘れ頻度確認"
  },
  alerts: { red_flags: ["めまいの増悪", "転倒リスク"], need_to_contact_physician: [] },
  meta: { main_problems: ["アドヒアランス低下", "起立性低血圧疑い"], note_for_pharmacy: "一包化検討も視野" }
};

const dataScenario3: ClinicalData = {
  soap: {
    s: "抗がん剤開始後、悪心・食欲不振あり。ドンペリドン（制吐剤）は「副作用が怖い」との理由で未使用。",
    o: "残薬確認：ドンペリドン全量（10回分）残。食事摂取量低下。",
    a: "悪心によるQOL低下・栄養摂取不足のリスク。制吐剤に対する不安感（ノセボ効果懸念）があるが、利益（食欲回復）が上回ることを説明し使用を促す必要あり。",
    p: "ドンペリドンの効果と安全性を再説明し、まずは1回試用するよう指導。副作用（しびれ等）は現時点なし。次回、使用状況と悪心の改善度確認。"
  },
  report_100: "抗がん剤による悪心・食欲不振著明。制吐剤（ドンペリドン）不安で未使用のため、安全性と必要性を説明し服用促す。手足のしびれなし。次回制吐剤の使用可否と食事摂取状況を確認する。",
  home_visit: {
    basic_info: "2025/12/19 PM 佐藤健太",
    chief_complaint: "吐き気、食欲がない",
    observation_treatment: "食事摂取状況確認",
    medication_instruction: "制吐剤の服用指導",
    next_plan_handover: "悪心コントロール確認"
  },
  pharmacy_focus: {
    medications: [
      { name: "ドンペリドン", status: "開始", dose: "10mg", route: "内服", frequency: "頓用", reason_or_note: "未使用のため指導" }
    ],
    adherence: "頓用薬未使用（不安）",
    side_effects: ["悪心（原疾患or抗がん剤）"],
    drug_related_problems: ["副作用への不安による有効薬剤の不使用"],
    labs_and_monitoring: ["食事摂取量", "悪心強度(CTCAE)"],
    patient_education: ["制吐剤による症状緩和のメリット", "無理せず薬に頼ることの重要性"],
    follow_up: "ドンペリドン試用後の体感変化確認"
  },
  alerts: { red_flags: ["脱水症状", "経口摂取困難"], need_to_contact_physician: [] },
  meta: { main_problems: ["化学療法誘発性悪心嘔吐(CINV)", "服薬不安"], note_for_pharmacy: "" }
};

const dataScenario4: ClinicalData = {
  soap: {
    s: "変化なし。元気である。",
    o: "定期配送のみ。玄関先対応。顔色良好。残薬なし（本人申告）。",
    a: "容体安定。アドヒアランス良好と判断。",
    p: "定期薬継続。次回も定期訪問。"
  },
  report_100: "定期配送実施。本人対応、体調変化なく元気。残薬なしとの申告あり。アドヒアランス良好。特記事項なし。次回定期訪問予定。",
  home_visit: {
    basic_info: "2025/12/19 PM 高橋ウメ",
    chief_complaint: "なし",
    observation_treatment: "顔色観察",
    medication_instruction: "なし",
    next_plan_handover: "定期訪問"
  },
  pharmacy_focus: {
    medications: [],
    adherence: "良好（申告）",
    side_effects: [],
    drug_related_problems: [],
    labs_and_monitoring: [],
    patient_education: [],
    follow_up: "特になし"
  },
  alerts: { red_flags: [], need_to_contact_physician: [] },
  meta: { main_problems: [], note_for_pharmacy: "短時間対応" }
};

const dataScenario5: ClinicalData = {
  soap: {
    s: "寒くなり血圧高め。医師よりアムロジピン増量（5mg→10mg）の指示あり了承。足のむくみについて医師より説明受けている。",
    o: "医師診察同席。アムロジピン5mg残薬なし（飲みきり）。新規10mg処方開始。",
    a: "増量に伴う降圧効果と副作用（浮腫）のモニタリングが必要。旧用量の残薬がないため切り替えはスムーズに行える。",
    p: "新規用量（10mg）での開始確認。下肢浮腫の初期症状について具体的（靴下の跡等）に説明。次回、血圧値と浮腫の有無を確認。"
  },
  report_100: "医師診察同席。血圧上昇にてアムロジピン5mg→10mgへ増量。旧薬残薬ゼロ確認済。増量に伴う下肢浮腫の注意点を指導。次回血圧推移と浮腫の有無を確認する。",
  home_visit: {
    basic_info: "2025/12/19 PM 田中次郎",
    chief_complaint: "なし（医師診察同席）",
    observation_treatment: "残薬確認",
    medication_instruction: "処方変更説明、副作用指導",
    next_plan_handover: "血圧・浮腫確認"
  },
  pharmacy_focus: {
    medications: [
      { name: "アムロジピン", status: "変更", dose: "10mg", route: "内服", frequency: "1日1回", reason_or_note: "5mgから増量" }
    ],
    adherence: "良好（残薬なし）",
    side_effects: [],
    drug_related_problems: ["用量増加による浮腫リスク"],
    labs_and_monitoring: ["血圧", "下肢浮腫"],
    patient_education: ["浮腫のセルフチェック方法", "確実な服薬継続"],
    follow_up: "増量後の血圧コントロール状況"
  },
  alerts: { red_flags: [], need_to_contact_physician: [] },
  meta: { main_problems: ["高血圧", "処方変更"], note_for_pharmacy: "医師同席" }
};


// --- Mock Facilities & Patients (Demo Set) ---

export const MOCK_FACILITIES: Facility[] = [
  { id: 'f_demo', name: 'デモ用ケアセンター', patients: [] }
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: "p1_demo", name: "山田 太郎", kana: "ヤマダ タロウ", birthDate: "1950-01-01", age: 75, gender: "male", avatarColor: "#fca5a5",
    facility_id: 'f_demo', room_number: '101',
    records: [
      { id: "r1", date: "2025-12-19", transcript: textScenario1, clinicalData: dataScenario1, status: 'pending' }
    ]
  },
  {
    id: "p2_demo", name: "鈴木 花子", kana: "スズキ ハナコ", birthDate: "1945-05-05", age: 80, gender: "female", avatarColor: "#93c5fd",
    facility_id: 'f_demo', room_number: '102',
    records: [
      { id: "r2", date: "2025-12-19", transcript: textScenario2, clinicalData: dataScenario2, status: 'pending' }
    ]
  },
  {
    id: "p3_demo", name: "佐藤 健太", kana: "サトウ ケンタ", birthDate: "1960-10-10", age: 65, gender: "male", avatarColor: "#6ee7b7",
    facility_id: 'f_demo', room_number: '103',
    records: [
      { id: "r3", date: "2025-12-19", transcript: textScenario3, clinicalData: dataScenario3, status: 'pending' }
    ]
  },
  {
    id: "p4_demo", name: "高橋 ウメ", kana: "タカハシ ウメ", birthDate: "1930-03-03", age: 95, gender: "female", avatarColor: "#fcd34d",
    facility_id: 'f_demo', room_number: '104',
    records: [
      { id: "r4", date: "2025-12-19", transcript: textScenario4, clinicalData: dataScenario4, status: 'approved' }
    ]
  },
  {
    id: "p5_demo", name: "田中 次郎", kana: "タナカ ジロウ", birthDate: "1955-08-08", age: 70, gender: "male", avatarColor: "#c4b5fd",
    facility_id: 'f_demo', room_number: '105',
    records: [
      { id: "r5", date: "2025-12-19", transcript: textScenario5, clinicalData: dataScenario5, status: 'pending' }
    ]
  }
];

MOCK_FACILITIES[0].patients = MOCK_PATIENTS;

export const MOCK_ROUNDS: Round[] = [
  {
    id: 'round_demo', date: '2025-12-19', time_slot: 'AM', facility_id: 'f_demo', facility_name: 'デモ用ケアセンター',
    visits: MOCK_PATIENTS.map((p, i) => ({
      id: `v_demo_${i}`, order: i + 1,
      transcript_summary: p.records[0].clinicalData.report_100 || '',
      estimated_patient_name: p.name, confirmed_patient_id: p.id,
      status: 'matched', clinicalData: p.records[0].clinicalData, transcript: p.records[0].transcript
    }))
  }
];