// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { Storage } = require("@google-cloud/storage");
const speech = require("@google-cloud/speech").v1p1beta1;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { execFile } = require("child_process");

const PORT = process.env.PORT || 8080;
const ORIGIN = process.env.ALLOW_ORIGIN || "*";
const DATA_DIR = process.env.DATA_DIR || "/tmp/data";
const GCS_BUCKET = process.env.GCS_BUCKET;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
// const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET; // 未使用
const DETAIL_URL_TTL_DAYS = Number(process.env.DETAIL_URL_TTL_DAYS || "7"); // 詳細HTMLの署名URL期限（日）

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ---------------- App / Middlewares ----------------
const app = express();
app.use(cors({ origin: ORIGIN, credentials: true }));
app.options("*", cors());
app.use(express.json());

const upload = multer({ dest: path.join(DATA_DIR, "chunks") });

// ---------------- GCP Clients ----------------
const KEY_FILE_PATH = path.join(__dirname, "sa-key.json"); // Explicitly use local key file

const storage = new Storage({ keyFilename: KEY_FILE_PATH });
const bucket = storage.bucket(GCS_BUCKET);
const speechClient = new speech.SpeechClient({ keyFilename: KEY_FILE_PATH });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const { messagingApi } = require("@line/bot-sdk");
const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
});

// ---------------- Utils ----------------
function execFFmpeg(args) {
  return new Promise((resolve, reject) => {
    execFile("ffmpeg", ["-y", ...args], { windowsHide: true }, (err, _stdout, stderr) => {
      if (err) return reject(new Error(stderr || String(err)));
      resolve();
    });
  });
}
async function gcsExists(file) {
  const [exists] = await file.exists();
  return !!exists;
}
async function acquireLock(file, payloadObj) {
  try {
    await file.save(JSON.stringify(payloadObj || { at: new Date().toISOString() }, null, 2), {
      resumable: false,
      contentType: "application/json",
      ifGenerationMatch: 0, // 既存なら412
    });
    return true;
  } catch (e) {
    if (e.code === 412) return false;
    throw e;
  }
}
function parseJsonLoose(s) {
  if (!s) throw new Error("empty");
  let t = String(s).trim();
  // コードフェンス除去
  t = t.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  // 先頭{〜末尾} を抽出
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  return JSON.parse(t);
}
function shortText(s, n = 40) {
  const str = (s || "").trim();
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}
const arrify = (v) => (Array.isArray(v) ? v : []);

/**
 * sources を最大32個ずつ合成しながら最終的に 1 本にまとめる
 */
async function composeMany(objects /* File[] */, destFile /* File */) {
  const composeOnce = async (sources, destination) => {
    if (typeof destination.compose === "function") {
      await destination.compose(sources);
    } else if (typeof destination.bucket.combine === "function") {
      await destination.bucket.combine(sources, destination);
    } else {
      throw new Error("Neither File.compose nor bucket.combine is available.");
    }
  };

  let queue = objects.slice();
  let round = 0;
  while (queue.length > 1) {
    const next = [];
    for (let i = 0; i < queue.length; i += 32) {
      const batch = queue.slice(i, i + 32);
      if (batch.length === 1) { next.push(batch[0]); continue; }
      const tmp = destFile.bucket.file(`${destFile.name}.compose.${round}.${Math.floor(i / 32)}`);
      await composeOnce(batch, tmp);
      next.push(tmp);
    }
    queue = next;
    round++;
  }
  if (queue.length === 1 && queue[0].name !== destFile.name) {
    await queue[0].copy(destFile);
  }
  try { await destFile.bucket.deleteFiles({ prefix: `${destFile.name}.compose.` }); } catch { }
}

// ---- LINE 冪等プッシュ（X-Line-Retry-Key を UUID で永続化 & 409は成功扱い）----
async function safePushLine(to, messages, retryKey) {
  try {
    // SDK v9+ では pushMessage(body, xLineRetryKey:string) が使える
    return await lineClient.pushMessage({ to, messages }, retryKey);
  } catch (e) {
    // duplicate は成功相当として握りつぶす
    if (e?.statusCode === 409) {
      console.warn("LINE push deduplicated by retry key:", retryKey);
      return;
    }
    // 署名キー形式NGなどはそのままスロー
    throw e;
  }
}

// ---------------- Routes ----------------

// 1) 署名URL発行（クライアントがPUTでチャンクを直アップロード）
app.post("/sign-upload", async (req, res) => {
  try {
    const { sessionId, userId, seq, contentType } = req.body || {};
    if (!sessionId || !userId || !seq) {
      return res.status(400).json({ ok: false, error: "sessionId/userId/seq required" });
    }
    const isMp4 = contentType && contentType.includes("mp4");
    const ext = isMp4 ? "mp4" : "webm";
    const objectPath = `sessions/${sessionId}/chunk-${String(seq).padStart(5, "0")}.${ext}`;
    const file = bucket.file(objectPath);

    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType: contentType || (isMp4 ? "audio/mp4" : "audio/webm"),
    });

    res.json({ ok: true, signedUrl, objectPath });
  } catch (e) {
    console.error("[/sign-upload]", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// 2) 結合＋STTジョブ開始（セッション冪等化）
app.post("/finalize", async (req, res) => {
  try {
    const { sessionId, userId, patientId, patientName, facilityId, facilityName } = req.body;
    if (!sessionId || !userId)
      return res.status(400).json({ ok: false, error: "sessionId/userId required" });

    // セッション冪等化（既にjobがあればそれを返す）
    const sessionMetaFile = bucket.file(`jobs-meta/by-session/${sessionId}.json`);
    if (await gcsExists(sessionMetaFile)) {
      try {
        const [buf] = await sessionMetaFile.download();
        const prev = JSON.parse(buf.toString("utf-8"));
        if (prev && prev.jobId) {
          return res.json({ ok: true, jobId: prev.jobId });
        }
      } catch { }
    }

    // チャンク一覧
    const prefix = `sessions/${sessionId}/`;
    const [files] = await bucket.getFiles({ prefix });
    const chunks = files
      .filter((f) => /chunk-\d+\.(webm|mp4)$/.test(f.name))
      .sort((a, b) => a.name.localeCompare(b.name));
    if (chunks.length === 0) return res.status(400).json({ ok: false, error: "no chunks in GCS" });

    // GCS compose → 1本化
    const ext = chunks[0].name.endsWith(".mp4") ? "mp4" : "webm";
    const assembledObj = bucket.file(`sessions/${sessionId}/assembled.${ext}`);
    await composeMany(chunks.map((c) => bucket.file(c.name)), assembledObj);

    // ffmpegでWAV化
    const workDir = path.join(DATA_DIR, "sessions", sessionId);
    fs.mkdirSync(workDir, { recursive: true });
    const localAssembled = path.join(workDir, `assembled.${ext}`);
    const mergedWav = path.join(workDir, "merged.wav");

    await assembledObj.download({ destination: localAssembled });
    await execFFmpeg(["-i", localAssembled, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", mergedWav]);

    // GCSへアップ（STT入力）
    const gcsName = `audio/${sessionId}.wav`;
    await bucket.upload(mergedWav, { destination: gcsName, contentType: "audio/wav" });
    const gcsUri = `gs://${GCS_BUCKET}/${gcsName}`;

    try { fs.unlinkSync(localAssembled); } catch { }
    try { fs.unlinkSync(mergedWav); } catch { }

    // STT起動
    const [op] = await speechClient.longRunningRecognize({
      audio: { uri: gcsUri },
      config: {
        languageCode: "ja-JP",
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        enableAutomaticPunctuation: true,
        model: "latest_long",
      },
    });
    let jobId = op.name;

    // GCSにジョブメタを原子的に保存（同時起動レース対策）
    try {
      await sessionMetaFile.save(JSON.stringify({ sessionId, userId, gcsUri, jobId, patientId, patientName, facilityId, facilityName }, null, 2), {
        resumable: false,
        contentType: "application/json",
        ifGenerationMatch: 0,
      });
    } catch (e) {
      if (e.code === 412) {
        // 他インスタンスが先に保存 -> そのjobIdを返す
        const [buf] = await sessionMetaFile.download();
        const prev = JSON.parse(buf.toString("utf-8"));
        jobId = prev.jobId || jobId;
      } else {
        throw e;
      }
    }

    // /tmp にも（互換）
    const jobsDir = path.join(DATA_DIR, "jobs");
    fs.mkdirSync(jobsDir, { recursive: true });
    fs.writeFileSync(path.join(jobsDir, `${jobId}.json`), JSON.stringify({ sessionId, userId, gcsUri, patientId, patientName, facilityId, facilityName }, null, 2));

    // jobId基準のメタ（/jobsで引けるように）
    try {
      await bucket.file(`jobs-meta/by-job/${jobId}.json`).save(
        JSON.stringify({ sessionId, userId, gcsUri, jobId, patientId, patientName, facilityId, facilityName }, null, 2),
        { resumable: false, contentType: "application/json", metadata: { cacheControl: "no-store" } }
      );
    } catch { }

    res.json({ ok: true, jobId });
  } catch (e) {
    console.error("[/finalize] error", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// 3) ポーリング: /jobs/:id
app.get("/jobs/:id", async (req, res) => {
  const t0 = Date.now();
  try {
    const jobId = req.params.id;

    // 既に完了配信済みなら即終了（早期return）
    const doneFile = bucket.file(`deliveries/${jobId}.done`);
    if (await gcsExists(doneFile)) {
      // メタデータを読み取って sessionId を特定し、サマリーを返す
      try {
        let meta = {};
        try {
          const [buf] = await bucket.file(`jobs-meta/by-job/${jobId}.json`).download();
          meta = JSON.parse(buf.toString("utf-8"));
        } catch {
          const jobsDir = path.join(DATA_DIR, "jobs");
          meta = JSON.parse(fs.readFileSync(path.join(jobsDir, `${jobId}.json`), "utf-8"));
        }
        const sid = meta.sessionId;
        if (sid) {
          const summaryFile = bucket.file(`summaries/${sid}.json`);
          if (await gcsExists(summaryFile)) {
            const [buf] = await summaryFile.download();
            const summary = JSON.parse(buf.toString("utf-8"));
            return res.json({ ok: true, status: "DONE", summary });
          }
        }
      } catch (e) {
        console.warn("Error fetching existing summary:", e.message);
      }
      return res.json({ ok: true, status: "DONE" });
    }

    // STT 進捗
    const progress = await speechClient.checkLongRunningRecognizeProgress(jobId);
    const op = Array.isArray(progress) ? progress[0] : progress;
    if (!op) {
      console.error("[/jobs] invalid operation object:", typeof progress, progress);
      return res.status(500).json({ ok: false, error: "invalid operation object" });
    }
    const isDone = op.done === true || (op.latestResponse && op.latestResponse.done === true);
    if (!isDone) {
      return res.json({ ok: true, status: "RUNNING" });
    }

    // 配信ロック（重複防止）：取れなければ他インスタンスが処理中
    const lockFile = bucket.file(`deliveries/${jobId}.lock`);
    const locked = await acquireLock(lockFile, { jobId, at: new Date().toISOString() });
    if (!locked) {
      // ロックが取得できない場合、既に他で処理中。結果があるか確認して返す
      try {
        let meta = {};
        try {
          const [buf] = await bucket.file(`jobs-meta/by-job/${jobId}.json`).download();
          meta = JSON.parse(buf.toString("utf-8"));
        } catch {
          const jobsDir = path.join(DATA_DIR, "jobs");
          meta = JSON.parse(fs.readFileSync(path.join(jobsDir, `${jobId}.json`), "utf-8"));
        }
        const sid = meta.sessionId;
        if (sid) {
          const summaryFile = bucket.file(`summaries/${sid}.json`);
          if (await gcsExists(summaryFile)) {
            const [buf] = await summaryFile.download();
            const summary = JSON.parse(buf.toString("utf-8"));
            return res.json({ ok: true, status: "DONE", summary });
          }
        }
      } catch { }
      return res.json({ ok: true, status: "RUNNING" }); // まだ処理中の可能性が高いので RUNNING に戻す
    }

    // 結果抽出（op.promise() 互換）
    let response;
    if (typeof op.promise === "function") {
      const result = await op.promise();
      response = Array.isArray(result) ? result[0] : result;
    } else if (op.result) {
      response = op.result;
    } else if (op.latestResponse && op.latestResponse.response) {
      response = op.latestResponse.response;
    } else {
      const p2 = await speechClient.checkLongRunningRecognizeProgress(jobId);
      const op2 = Array.isArray(p2) ? p2[0] : p2;
      if (op2 && op2.result) response = op2.result;
      else if (op2 && op2.latestResponse && op2.latestResponse.response) response = op2.latestResponse.response;
      else return res.status(500).json({ ok: false, error: "cannot extract STT response" });
    }

    const transcript = (response.results || [])
      .map((r) => r.alternatives?.[0]?.transcript || "")
      .join("\n")
      .trim();

    // メタ：GCS by-job を優先、なければ /tmp
    let meta = {};
    try {
      const [buf] = await bucket.file(`jobs-meta/by-job/${jobId}.json`).download();
      meta = JSON.parse(buf.toString("utf-8"));
    } catch {
      try {
        const jobsDir = path.join(DATA_DIR, "jobs");
        meta = JSON.parse(fs.readFileSync(path.join(jobsDir, `${jobId}.json`), "utf-8"));
      } catch { }
    }
    const sessionId = meta.sessionId || `unknown-${jobId}`;

    // 既に詳細JSONがあれば、誰かが生成済みとみなしてDONEにして終了
    const summaryFilePrev = bucket.file(`summaries/${sessionId}.json`);
    if (await gcsExists(summaryFilePrev)) {
      try {
        await doneFile.save(JSON.stringify({ from: "existing-summary", at: new Date().toISOString() }, null, 2),
          { resumable: false, contentType: "application/json", ifGenerationMatch: 0 });
      } catch { }

      // ★既存のJSONがあれば読み込んで返す
      let summary = {};
      try {
        const [buf] = await bucket.file(`summaries/${sessionId}.json`).download();
        summary = JSON.parse(buf.toString("utf-8"));
      } catch { }

      return res.json({ ok: true, status: "DONE", summary });
    }

    // transcript を GCS 保存
    try {
      await bucket.file(`transcripts/${sessionId}.txt`).save(transcript || "", {
        resumable: false,
        contentType: "text/plain; charset=utf-8",
        metadata: { cacheControl: "no-store" },
      });
    } catch (e) {
      console.error("save transcript failed:", e?.message);
    }

    // 短すぎる→軽い通知のみ（1通）
    if (!transcript || transcript.replace(/\s/g, "").length < 2) {
      // リトライキーを job 単位で発行・保存
      const retryKeyObj = bucket.file(`deliveries/${jobId}.retryKey`);
      let retryKey;
      try {
        const [buf] = await retryKeyObj.download();
        retryKey = buf.toString("utf-8").trim();
      } catch {
        retryKey = uuidv4();
        await retryKeyObj.save(retryKey, { resumable: false, contentType: "text/plain" });
      }

      try {
        if (meta.userId) {
          await safePushLine(meta.userId, [{ type: "text", text: "■診察メモ\n（短い内容のためメモは作成しませんでした）" }], retryKey);
        }
      } catch (e) {
        console.error("LINE push (short) failed:", e?.statusCode, e?.message);
      } finally {
        // done マーク（ロックは残す：ライフサイクルで削除）
        try {
          await doneFile.save(JSON.stringify({ short: true, at: new Date().toISOString() }, null, 2), {
            resumable: false, contentType: "application/json"
          });
        } catch { }
      }
      return res.json({ ok: true, status: "DONE", transcript });
    }

    // ---- 3'. Result JSON Retrieval (DONE status) ----
    try {
      if (isDone) {
        // Try to fetch the full JSON summary to include in the response
        try {
          // GCS or Local? Priority: GCS summaries/sessionId.json
          // Note: sessionId comes from meta
          const sessId = meta.sessionId;
          if (sessId) {
            const summaryFile = bucket.file(`summaries/${sessId}.json`);
            if (await gcsExists(summaryFile)) {
              const [buf] = await summaryFile.download();
              const summaryJson = JSON.parse(buf.toString("utf-8"));
              return res.json({ ok: true, status: "DONE", transcript, summary: summaryJson });
            }
          }
        } catch (e) {
          console.warn("[/jobs] failed to fetch summary json:", e.message);
        }
        // If query failed or file missing, just return DONE + transcript
        return res.json({ ok: true, status: "DONE", transcript });
      }
    } catch (e) {
      console.error("[/jobs] error in done handling:", e);
    }

    // ---- LLM (Pharmacy SOAP) ----
    const pharmacyPrompt = `
あなたは薬局薬剤師の業務を支援するAIアシスタントです。
入力される【会話（文字起こし）】から、電子薬歴（SOAP形式）のドラフトと、レセコン報告書用の100文字要約を作成してください。

【方針】
- 医師の診断のような断定的な表現は避ける。事実と薬剤師としての評価（可能性）を区別する。
- 専門用語、医薬品名は正式名称に正規化する（例：プロポンプ阻害薬→プロトンポンプ阻害薬）。
- 「〜です/ます」調（丁寧語）で統一する。

【出力JSON形式】
{
  "report_100": "レセコンの『報告書』欄に転記するための要約。100文字〜120文字程度。要点を詰め込み、体言止め等は適宜使用して短くまとめる。",
  "soap": {
    "s": "【S:主訴】患者の主訴、発言の要約。\n- 服薬状況\n- 効果の実感\n- 副作用、困りごと",
    "o": "【O:客観的情報】今回は会話のみなので、事実（未使用薬の数や具体的な数値など）を記載。\n特に【未使用薬】（残薬・トン用未使用・飲み忘れ）がある場合は、『薬品名：残数（理由）』を明記する。",
    "a": "【A:薬学的評価】\n- 薬学的課題（効果・副作用・コンプライアンス・DRP）\n- 指導の到達度\n（全身状態評価ではなく、薬の効果や副作用、使い方の評価を中心に）",
    "p": "【P:計画】次回の方針。\n- 次回確認すべきこと（副作用、症状変化、使い方）\n- 実施した指導内容\n- 処方医への提案内容（もしあれば）\n- 今後のフォロー計画"
  }
}

【文字起こし】
<<TRANSCRIPT>>
${transcript}
<</TRANSCRIPT>>
`.trim();

    const pharmacyModel = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig: { temperature: 0.2, topP: 0.9, maxOutputTokens: 2500, responseMimeType: "application/json" },
    });

    const [pharmacyResp] = await Promise.all([
      pharmacyModel.generateContent(pharmacyPrompt),
    ]);
    console.log(`[jobs] llm parallel ms=${Date.now() - t0}`);

    // ---- Pharmacy JSON Parse ----
    let j;
    try {
      j = parseJsonLoose(pharmacyResp.response.text());
    } catch (e) {
      console.error("pharmacy JSON parse failed:", e?.message);
      j = { report_100: "要約作成エラー", soap: { s: "", o: "", a: "", p: "" } };
    }

    // ---- GCS保存 (Single JSON) ----
    await Promise.all([
      bucket.file(`summaries/${sessionId}.json`).save(JSON.stringify(j, null, 2), {
        resumable: false, contentType: "application/json", metadata: { cacheControl: "no-store" }
      }),
    ]);

    // ---- LINE整形（シンプル版）----
    const header = "■Pharmacy Note";
    const report = j.report_100 ? `📝 報告書要約\n${j.report_100}` : "";
    let cleaned = [header, report].filter(Boolean).join("\n");

    const retryKeyObj = bucket.file(`deliveries/${jobId}.retryKey`);
    let retryKey;
    try {
      const [buf] = await retryKeyObj.download();
      retryKey = buf.toString("utf-8").trim();
    } catch {
      retryKey = uuidv4();
      await retryKeyObj.save(retryKey, { resumable: false, contentType: "text/plain" });
    }

    try {
      if (meta.userId) {
        await safePushLine(meta.userId, [{ type: "text", text: cleaned.slice(0, 4999) }], retryKey);
      }
    } catch (e) {
      console.error("LINE push failed:", e?.statusCode, e?.message);
    } finally {
      try {
        await doneFile.save(JSON.stringify({ pushedAt: new Date().toISOString(), sessionId }, null, 2), {
          resumable: false,
          contentType: "application/json",
        });
      } catch (e) {
        console.error("write done failed:", e?.message);
      }
    }
    console.log(`[jobs] total ms=${Date.now() - t0}`);
    return res.json({ ok: true, status: "DONE", transcript });
  } catch (e) {
    console.error("[/jobs] error", e);
    return res.status(500).json({ ok: false, error: String(e) });
  }
});
// 4) LINE Webhook（必要なら拡張）
app.post("/line/webhook", express.json(), async (req, res) => {
  res.status(200).end();
  try {
    const events = req.body.events || [];
    for (const ev of events) {
      if (ev.type === "follow") {
        await lineClient.replyMessage({
          replyToken: ev.replyToken,
          messages: [{ type: "text", text: "友だち追加ありがとうございます。LIFFから録音して送ってください。" }],
        });
      }
    }
  } catch (e) {
    console.error(e);
  }
});

// Healthz
const HOST = "0.0.0.0";
app.get("/", (_req, res) => res.json({ ok: true }));

app.listen(PORT, HOST, () => {
  console.log(`yorisoi mvp listening on ${HOST}:${PORT}`);
});

// ---------------- List Jobs (For Dashboard Sync) ----------------
app.get("/jobs", async (req, res) => {
  try {
    const jobsDir = path.join(DATA_DIR, "jobs");
    if (!fs.existsSync(jobsDir)) return res.json({ ok: true, jobs: [] });

    // Read directory and get stats for sorting
    const files = fs.readdirSync(jobsDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        try {
          const filePath = path.join(jobsDir, f);
          const stat = fs.statSync(filePath);
          const meta = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          return {
            jobId: f.replace(".json", ""),
            mtime: stat.mtime,
            patientId: meta.patientId,
            patientName: meta.patientName,
            facilityId: meta.facilityId,
            facilityName: meta.facilityName
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.mtime - a.mtime) // Newest first
      .slice(0, 20); // 少し多めに取得

    // Optionally attach status (done/running) if needed, but for list we keep it simple
    res.json({ ok: true, jobs: files });
  } catch (e) {
    console.error("[/jobs] error", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// ---------------- Helpers for Detail HTML ----------------
function escapeHtml(s = "") {
  return (s || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
function buildSoapHtml(data, transcript) {
  const safe = (s) => escapeHtml(s || "");
  const soap = data.soap || {};
  const O = soap.O || {};
  const P = soap.P || {};

  return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>薬剤師向けSOAP</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN",sans-serif;margin:16px;line-height:1.6;color:#333}
  h1{font-size:18px;margin:0 0 12px}
  .section{background:#fff;border:1px solid #ddd;border-radius:4px;padding:12px;margin-bottom:12px}
  .label{font-weight:bold;color:#005c4b;display:block;margin-bottom:4px}
  .content{white-space:pre-wrap;font-size:14px}
  .copy-btn{display:inline-block;background:#005c4b;color:#fff;padding:4px 8px;border-radius:4px;text-decoration:none;font-size:12px;margin-bottom:8px}
  hr{border:0;border-top:1px solid #eee;margin:12px 0}
  .meta{font-size:12px;color:#666}
</style></head>
<body>
  <h1>${safe(data.patient_name)} 様 (${safe(data.visit_context)})</h1>

  <div class="section" style="background:#eef7f0;border-color:#274">
    <span class="label">▼報告書用要約 (100文字)</span>
    <div class="content">${safe(data.report_100)}</div>
  </div>

  <div class="section">
    <span class="label">S (Subjective)</span>
    <div class="content">${safe(soap.S)}</div>
    <hr>
    <span class="label">O (Objective)</span>
    <div class="content">
<b>薬剤:</b> ${safe(O.med_list)}<br>
<b>服薬:</b> ${safe(O.adherence)}<br>
<b>効果:</b> ${safe(O.effect)}<br>
<b>副作用:</b> ${safe(O.side_effects)}<br>
<b>残薬:</b> ${safe(O.unused_meds)}<br>
<b>その他:</b> ${safe(O.other)}
    </div>
    <hr>
    <span class="label">A (Assessment)</span>
    <div class="content">${safe(soap.A)}</div>
    <hr>
    <span class="label">P (Plan)</span>
    <div class="content">
<b>次回確認:</b> ${safe(P.next_check)}<br>
<b>指導:</b> ${safe(P.education)}<br>
<b>提案:</b> ${safe(P.proposal_to_prescriber)}<br>
<b>方針:</b> ${safe(P.follow_up)}
    </div>
  </div>

  <div class="section">
    <span class="label">文字起こし</span>
    <div class="content" style="color:#555">${safe(transcript)}</div>
  </div>
</body></html>`;
}
