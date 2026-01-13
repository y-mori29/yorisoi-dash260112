const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const fs = require("fs");
const path = require("path");

// 1. API Key Check & Fetch
async function getApiKey() {
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;

    const saKeyPath = path.join(__dirname, "sa-key.json");
    if (fs.existsSync(saKeyPath)) {
        console.log("Found sa-key.json. Attempting to fetch GEMINI_API_KEY from Secret Manager...");
        try {
            const client = new SecretManagerServiceClient({ keyFilename: saKeyPath });
            const saKey = JSON.parse(fs.readFileSync(saKeyPath, "utf-8"));
            const projectId = saKey.project_id;

            // Try DEV first, then PROD, then generic
            const candidates = ["DEV_GEMINI_API_KEY", "PROD_GEMINI_API_KEY", "GEMINI_API_KEY"];

            for (const name of candidates) {
                try {
                    const [version] = await client.accessSecretVersion({
                        name: `projects/${projectId}/secrets/${name}/versions/latest`,
                    });
                    console.log(`Successfully fetched secret: ${name}`);
                    return version.payload.data.toString();
                } catch (e) {
                    // console.log(`Failed to fetch ${name}: ${e.message}`);
                }
            }
        } catch (e) {
            console.error("Error initializing Secret Manager client:", e.message);
        }
    }
    return null;
}

// 2. Transcript Loading
const transcriptFile = process.argv[2];
let transcript = "";

if (transcriptFile) {
    try {
        transcript = fs.readFileSync(transcriptFile, "utf-8");
    } catch (e) {
        console.error(`Error reading file ${transcriptFile}:`, e.message);
        process.exit(1);
    }
} else {
    // Default Sample (Scenario 1 inspired)
    console.log("No transcript file provided. Using sample scenario (Cancer Pain/Constipation)...");
    transcript = `
医師: こんにちは。調子はどうですか？
患者: うーん、痛みはだいぶ良くなったんですけど、便秘がひどくて。
医師: あぁ、オピオイド（痛み止め）の影響ですね。お通じはいつから出てないですか？
患者: 丸3日出てないです。お腹が張って苦しいです。
薬剤師: 痛み止めの量は今のままで良さそうですが、便秘薬を追加したほうがいいかもしれませんね。
医師: そうだね。マグミットを増やしましょうか。あとセンノシドも屯用で出しておきましょう。
患者: あと、昼飲む薬をついつい忘れちゃうことがあって。
薬剤師: 昼は忘れやすいですよね。朝と夕方にまとめることもできますが、先生いかがでしょう？
医師: うん、この薬なら朝夕2回でも効果は変わらないから、それでいきましょう。
薬剤師: わかりました。では処方内容を変更して、飲み方をご説明しますね。
`.trim();
}

// 3. Prompt Construction (Match server.js)
const pharmacistPrompt = `
あなたは在宅医療・薬局業務を支援する「熟練の薬剤師パートナー」です。
以下の【録音された会話（文字起こし）】から、レセコン（電子薬歴）に転記するための **薬剤師向けSOAP** と **100文字要約報告書** を作成してください。

【前提・方針】
1. **診断の断定は禁止**。「〜と思われる」「〜の可能性がある」等の表現にとどめ、医師の診断領域には踏み込まない。
2. **薬学的介入を重視**。全身状態よりも「薬の効果・副作用・服薬状況・残薬・指導内容」に焦点を当てる。
3. **誤変換の正規化**。会話特有の誤変換やゆらぎ（例: プロポンプ→プロトンポンプ阻害薬）は、静かに正式名称へ修正する。
4. **不足情報は推測しない**。会話に出てこない項目（未確認の用法用量など）は「未確認」と明記するか、記載しない。嘘を書かないこと。

【出力JSONフォーマット】
以下のJSON形式のみを出力してください（Markdownコードブロックは不要）。

{
  "patient_name": "患者氏名（会話から判明すれば。不明なら空欄）",
  "visit_context": "訪問の背景（例：定期訪問、臨時配送、カウンター対応など）",
  "soap": {
    "S": "Subjective: 患者の訴え、家族の言葉。服薬状況、効果実感、副作用、困りごとを中心に短く。",
    "O": {
      "med_list": "確認できた薬剤名や変更点",
      "adherence": "残薬数、飲み忘れの有無、管理状況",
      "effect": "バイタルや症状の変化といった客観的事実",
      "side_effects": "副作用の兆候（なければ空欄か『特になし』）",
      "unused_meds": "今回確認した未使用薬・残薬リスト（理由・残数）",
      "other": "その他特記事項"
    },
    "A": "Assessment: 薬剤師としての評価。効果、副作用リスク、服薬アドヒアランス、DRP（Drug Related Problems）。",
    "P": {
      "next_check": "次回確認すべき副作用・症状・使い方",
      "education": "今回実施した指導内容、説明したこと",
      "proposal_to_prescriber": "処方医への情報提供や提案があれば記載",
      "follow_up": "今後の計画"
    }
  },
  "report_100": "レセコンの『報告書』欄にコピペするための約100文字〜120文字の要約。要点を簡潔にまとめる。"
}

【文字起こし】
<<TRANSCRIPT>>
${transcript}
<</TRANSCRIPT>>
`.trim();

// 4. Call Gemini
async function run() {
    const apiKey = await getApiKey();
    if (!apiKey) {
        console.error("Error: GEMINI_API_KEY not found in env or Secret Manager (via sa-key.json).");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro",
        generationConfig: { temperature: 0.2, topP: 0.9, maxOutputTokens: 4000, responseMimeType: "application/json" },
    });

    console.log("--- Generating Content ---");
    const t0 = Date.now();
    try {
        const result = await model.generateContent(pharmacistPrompt);
        const text = result.response.text();
        console.log(`Time: ${Date.now() - t0}ms`);
        console.log("--- Result JSON ---");
        console.log(text);
    } catch (e) {
        console.error("GenAI Error:", e.message);
    }
}

run();
