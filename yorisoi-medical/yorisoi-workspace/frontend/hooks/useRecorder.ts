import { useState, useRef, useCallback } from "react";

// 設定値（過去コードの設定を踏襲しつつ、開発環境用にlocalhostに向ける）
// ※本番デプロイ時はここを実際のURLに変える必要があります
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const SIGN_URL = `${API_BASE_URL}/sign-upload`;
const FINALIZE_URL = `${API_BASE_URL}/finalize`;
const JOB_URL = (id: string) => `${API_BASE_URL}/jobs/${id}`;
const CHUNK_DURATION_MS = 10000;

interface RecordingMeta {
  patientId: string;
  patientName: string;
  facilityId: string;
  facilityName: string;
}

export const useRecorder = () => {
  // 状態管理
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // 処理中（ポーリング中）かどうか
  const [statusText, setStatusText] = useState<string>(""); // ユーザーへのメッセージ

  // 内部変数（Ref）
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const sessionIdRef = useRef<string>("");
  const chunkSeqRef = useRef<number>(0);
  const inflightUploadsRef = useRef<Promise<void>[]>([]); // 飛行中のアップロードタスク
  const startReqIdRef = useRef<number>(0); // 競合防止用ID

  // --- 1. 録音開始 (startRec 相当) ---
  const startRecording = useCallback(async () => {
    // リクエストID更新（競合防止）
    const myReqId = startReqIdRef.current + 1;
    startReqIdRef.current = myReqId;

    // 既存リセット
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      mediaRecorderRef.current = null;
    }
    inflightUploadsRef.current = [];

    try {
      setStatusText("マイク準備中...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 競合チェック
      if (startReqIdRef.current !== myReqId) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      // セッション初期化
      sessionIdRef.current = crypto.randomUUID(); // モダンブラウザなら使える
      chunkSeqRef.current = 0;

      // MIMEタイプ決定 (pickMime 相当)
      let mimeType = "";
      const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
      for (const t of candidates) {
        if (MediaRecorder.isTypeSupported(t)) {
          mimeType = t;
          break;
        }
      }
      if (!mimeType) mimeType = ""; // 空ならブラウザのデフォルト

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        // 競合チェック
        if (startReqIdRef.current !== myReqId) return;

        if (event.data && event.data.size > 0) {
          // アップロード処理を非同期で開始し、Promiseを配列で管理
          const task = uploadChunk(event.data, sessionIdRef.current, mimeType);
          inflightUploadsRef.current.push(task);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(CHUNK_DURATION_MS); // 10秒ごとに切る

      setIsRecording(true);
      setStatusText("録音中...");
      console.log(`Started session: ${sessionIdRef.current}`);

    } catch (error) {
      if (startReqIdRef.current !== myReqId) return;
      console.error("Mic error:", error);
      setStatusText("マイクエラー");
    }
  }, []);

  // --- 2. チャンクアップロード (uploadChunk 相当) ---
  const uploadChunk = async (blob: Blob, sessionId: string, contentType: string) => {
    // シーケンス番号をインクリメント（ローカル変数で保持しないと非同期でズレるため注意）
    chunkSeqRef.current++;
    const seq = chunkSeqRef.current;

    // Blobの型がなければ指定のものを使う
    const ct = blob.type || contentType || 'audio/webm';

    try {
      // 1. 署名URL取得
      const signRes = await fetch(SIGN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: "demo-user", // TODO: ログイン機能ができたら変える
          seq,
          contentType: ct
        })
      });
      if (!signRes.ok) throw new Error('署名URL取得エラー');
      const { signedUrl } = await signRes.json();

      // 2. 実データPUT
      const putRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': ct },
        body: blob
      });
      if (!putRes.ok) throw new Error('GCSアップロード失敗');

      console.log(`Uploaded chunk #${seq}`);
    } catch (e: any) {
      console.error(`Upload error (seq=${seq}):`, e);
      setStatusText(`アップロードエラー: ${e.message || "不明"}`);
    }
  };

  // --- 3. 録音停止＆完了プロセス (stopRec + showProcessingSteps 相当) ---
  const stopRecording = useCallback(async (meta: RecordingMeta) => {
    // 新規録音などをブロック
    startReqIdRef.current += 1;

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      // stopイベントをPromiseで待つ
      const stopped = new Promise<void>(resolve => {
        recorder.onstop = () => resolve();
      });
      recorder.stop();
      await stopped;
    }

    // マイクのライトを消す
    if (recorder) {
      recorder.stream.getTracks().forEach(t => t.stop());
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);

    // 残っているアップロードを待つ
    setStatusText("データを保存中...");
    if (inflightUploadsRef.current.length > 0) {
      await Promise.allSettled(inflightUploadsRef.current);
      inflightUploadsRef.current = [];
    }

    // ファイナライズ開始
    return await finalizeAndPoll(sessionIdRef.current, meta);

  }, []);

  // --- 4. キャンセル (破棄) ---
  const cancelRecording = useCallback(() => {
    startReqIdRef.current += 1;
    const recorder = mediaRecorderRef.current;
    if (recorder) {
      if (recorder.state !== "inactive") recorder.stop();
      recorder.stream.getTracks().forEach(t => t.stop());
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setIsProcessing(false);
    setStatusText("");
    console.log("Recording cancelled.");
  }, []);

  // --- 5. ファイナライズとポーリング (showProcessingSteps + pollJobStatus 相当) ---
  const finalizeAndPoll = async (sessionId: string, meta: RecordingMeta) => {
    setIsProcessing(true);
    setStatusText("AIが要約を作成中...");

    try {
      // Finalizeリクエスト
      const res = await fetch(FINALIZE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: "demo-user",
          // メタデータを含める
          patientId: meta.patientId,
          patientName: meta.patientName,
          facilityId: meta.facilityId,
          facilityName: meta.facilityName,
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `サーバーエラー: ${res.status}`);
      }

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "処理エラー");

      const jobId = json.jobId;
      console.log(`Finalize started. JobID: ${jobId}`);

      // ポーリング開始
      return await pollJobStatus(jobId);

    } catch (e: any) {
      console.error("Finalize/Polling error:", e);
      setStatusText("処理中にエラーが発生しました");
      setIsProcessing(false);

      // エラー時も「結果画面」を表示して、エラー内容を伝える
      return {
        report_100: "【処理エラー】",
        soap: {
          s: `システムエラーが発生しました。\n詳細: ${e.message || String(e)}`,
          o: "（接続先: " + API_BASE_URL + "）",
          a: "バックエンドの起動状況やネットワークを確認してください。",
          p: "再試行してください。"
        }
      };
    }
  };

  // --- 6. ポーリングロジック ---
  const pollJobStatus = async (jobId: string) => {
    let attempts = 0;
    const maxAttempts = 30; // 30回 * 4秒 = 120秒待つ

    return new Promise<any>((resolve, reject) => {
      const intervalId = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch(JOB_URL(jobId));
          if (!res.ok) throw new Error("Status check failed");

          const statusJson = await res.json();
          console.log(`Polling job ${jobId}: ${statusJson.status}`);

          if (statusJson.status === 'DONE') {
            clearInterval(intervalId);
            setStatusText("完了しました！");
            setIsProcessing(false);
            // サマリーがない場合（短すぎる、失敗など）のフォールバック
            const result = statusJson.summary || {
              report_100: "",
              soap: { s: "（音声が短いため、または処理エラーのため要約が生成されませんでした）", o: "", a: "", p: "" }
            };
            resolve(result);
          } else if (attempts >= maxAttempts) {
            clearInterval(intervalId);
            setStatusText("タイムアウトしました");
            setIsProcessing(false);
            reject(new Error("Timeout"));
          }
        } catch (e) {
          console.error("Polling error", e);
          clearInterval(intervalId);
          setStatusText("通信エラー");
          setIsProcessing(false);
          reject(e);
        }
      }, 4000); // 4秒ごとに確認
    });
  };

  return {
    isRecording,
    isProcessing,
    statusText,
    startRecording,
    stopRecording,
    cancelRecording
  };
};