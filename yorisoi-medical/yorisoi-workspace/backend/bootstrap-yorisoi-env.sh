#!/usr/bin/env bash
set -euo pipefail

###
# bootstrap-yorisoi-env.sh
#
# 使い方:
#   ./bootstrap-yorisoi-env.sh <GCP_PROJECT_ID> <ENV>
#   ENV は dev / stg / prod のいずれかを想定しています。
###

PROJECT_ID="${1:?Usage: $0 <GCP_PROJECT_ID> <ENV>}"
ENV="${2:?Usage: $0 <GCP_PROJECT_ID> <ENV (dev|stg|prod)>}"

# ----------------------------------------
# 基本設定
# ----------------------------------------
REGION="${REGION:-asia-northeast1}"
SERVICE_BASENAME="${SERVICE_BASENAME:-yorisoi}"
SERVICE_NAME="${SERVICE_BASENAME}-${ENV}"

# Artifact Registry（Docker）関連
REPO_NAME="${REPO_NAME:-yorisoi}"
IMAGE_NAME="${IMAGE_NAME:-yorisoi}"
IMAGE_TAG="${ENV}-$(date +%Y%m%d-%H%M%S)"
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"

# サービスアカウント
SA_NAME="${SA_NAME:-yorisoi-run}"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# GCS バケット（環境ごとに分割）
BUCKET_NAME="${BUCKET_NAME:-medi-yorisoi-audio-${ENV}}"

# ALLOW_ORIGIN（環境ドメイン）
# 例: https://yorisoi-dev.medi-canvas.com / https://yorisoi.medi-canvas.com
if [[ "${ENV}" == "prod" ]]; then
  ALLOW_ORIGIN_DEFAULT="https://yorisoi.medi-canvas.com"
else
  ALLOW_ORIGIN_DEFAULT="https://yorisoi-${ENV}.medi-canvas.com"
fi
ALLOW_ORIGIN="${ALLOW_ORIGIN:-${ALLOW_ORIGIN_DEFAULT}}"

# Secret 名（環境ごとに作成）
SECRET_PREFIX="${ENV^^}" # dev → DEV, stg → STG, prod → PROD
SECRET_GEMINI="${SECRET_PREFIX}_GEMINI_API_KEY"
SECRET_LINE_ACCESS_TOKEN="${SECRET_PREFIX}_LINE_CHANNEL_ACCESS_TOKEN"
SECRET_LINE_SECRET="${SECRET_PREFIX}_LINE_CHANNEL_SECRET"
SECRET_LINE_LOGIN_ID="${SECRET_PREFIX}_LINE_LOGIN_CHANNEL_ID"

echo "=========================================="
echo " Project : ${PROJECT_ID}"
echo " Env     : ${ENV}"
echo " Region  : ${REGION}"
echo " Service : ${SERVICE_NAME}"
echo " Bucket  : ${BUCKET_NAME}"
echo " Image   : ${IMAGE_URI}"
echo " Origin  : ${ALLOW_ORIGIN}"
echo "=========================================="

read -p "この設定で処理を続行しますか？ [y/N]: " yn
case "$yn" in
  [yY]*) ;;
  *) echo "中断しました。"; exit 1 ;;
esac

# ----------------------------------------
# 1. API 有効化
# ----------------------------------------
echo "[1/7] 必要な API を有効化します..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  speech.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  --project="${PROJECT_ID}"

# ----------------------------------------
# 2. サービスアカウント作成 + ロール付与
# ----------------------------------------
echo "[2/7] Cloud Run 実行サービスアカウントを作成します..."

gcloud iam service-accounts create "${SA_NAME}" \
  --project="${PROJECT_ID}" \
  --display-name="yorisoi Cloud Run service account" \
  2>/dev/null || echo " 既に存在しているためスキップします。"

echo "[2/7] サービスアカウントへロールを付与します..."

ROLES=(
  "roles/logging.logWriter"
  "roles/monitoring.metricWriter"
  "roles/cloudtrace.agent"
  "roles/secretmanager.secretAccessor"
  "roles/storage.objectAdmin"
  "roles/speech.client"
  "roles/iam.serviceAccountTokenCreator"
)

for ROLE in "${ROLES[@]}"; do
  echo " - ${ROLE}"
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="${ROLE}" \
    --quiet \
    --project="${PROJECT_ID}" >/dev/null
done

# ----------------------------------------
# 3. GCS バケット作成 + CORS 設定
# ----------------------------------------
echo "[3/7] GCS バケットを作成します (gs://${BUCKET_NAME})..."

if gsutil ls -p "${PROJECT_ID}" "gs://${BUCKET_NAME}" >/dev/null 2>&1; then
  echo " 既に存在しているため作成をスキップします。"
else
  gsutil mb -p "${PROJECT_ID}" -c STANDARD -l "${REGION}" "gs://${BUCKET_NAME}"
fi

echo "[3/7] CORS 設定を反映します..."

TMP_CORS_FILE="$(mktemp)"
cat > "${TMP_CORS_FILE}" <<EOF
[
  {
    "maxAgeSeconds": 3600,
    "method": ["PUT", "GET", "HEAD", "OPTIONS"],
    "origin": ["${ALLOW_ORIGIN}", "https://liff.line.me"],
    "responseHeader": ["Content-Type"]
  }
]
EOF

gsutil cors set "${TMP_CORS_FILE}" "gs://${BUCKET_NAME}"
rm -f "${TMP_CORS_FILE}"

# ----------------------------------------
# 4. Secret Manager に「器」を作成
#    （値の投入はこの後コンソール or CLI で）
# ----------------------------------------
echo "[4/7] Secret Manager にシークレットの器を作成します..."

SECRETS=(
  "${SECRET_GEMINI}"
  "${SECRET_LINE_ACCESS_TOKEN}"
  "${SECRET_LINE_SECRET}"
  "${SECRET_LINE_LOGIN_ID}"
)

for SEC in "${SECRETS[@]}"; do
  if gcloud secrets describe "${SEC}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
    echo " - ${SEC}: 既に存在しているためスキップします。"
  else
    echo " - ${SEC}: 作成します。"
    gcloud secrets create "${SEC}" \
      --replication-policy="automatic" \
      --project="${PROJECT_ID}"
    echo "   ※ このあと必ず値を登録してください。"
  fi
done

echo
echo ">>> ここで一旦止めて、以下のシークレットに値を登録してください。"
echo "    - ${SECRET_GEMINI}"
echo "    - ${SECRET_LINE_ACCESS_TOKEN}"
echo "    - ${SECRET_LINE_SECRET}"
echo "    - ${SECRET_LINE_LOGIN_ID}"
echo "    登録後に Enter を押してください。"
read -p "続行してよろしければ Enter を押してください: " _

# ----------------------------------------
# 5. Artifact Registry 作成 + Docker イメージ build & push
# ----------------------------------------
echo "[5/7] Artifact Registry を作成します (リポジトリ: ${REPO_NAME})..."

gcloud artifacts repositories create "${REPO_NAME}" \
  --repository-format=DOCKER \
  --location="${REGION}" \
  --description="yorisoi container images" \
  --project="${PROJECT_ID}" \
  2>/dev/null || echo " 既に存在しているため作成をスキップします。"

echo "[5/7] Docker イメージを build & push します..."
gcloud builds submit \
  --tag "${IMAGE_URI}" \
  --project="${PROJECT_ID}"

# ----------------------------------------
# 6. Cloud Run デプロイ
# ----------------------------------------
echo "[6/7] Cloud Run サービス ${SERVICE_NAME} をデプロイします..."

gcloud run deploy "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --image="${IMAGE_URI}" \
  --service-account="${SA_EMAIL}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --cpu=1 --memory=512Mi \
  --concurrency=80 \
  --timeout=300 \
  --set-env-vars="ALLOW_ORIGIN=${ALLOW_ORIGIN},GCS_BUCKET=${BUCKET_NAME},DATA_DIR=/app/data" \
  --set-secrets="GEMINI_API_KEY=${SECRET_GEMINI}:latest,LINE_CHANNEL_ACCESS_TOKEN=${SECRET_LINE_ACCESS_TOKEN}:latest,LINE_CHANNEL_SECRET=${SECRET_LINE_SECRET}:latest,LINE_LOGIN_CHANNEL_ID=${SECRET_LINE_LOGIN_ID}:latest"

# ----------------------------------------
# 7. 動作確認用の URL 表示
# ----------------------------------------
echo "[7/7] デプロイが完了しました。サービス URL を取得します..."

SERVICE_URL="$(gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format='value(status.url)')"

echo "------------------------------------------"
echo " Cloud Run URL: ${SERVICE_URL}"
echo " ヘルスチェック: curl -sS \"${SERVICE_URL}/\""
echo "------------------------------------------"
echo "bootstrap 処理が完了しました。"
#!/usr/bin/env bash
set -euo pipefail

###
# bootstrap-yorisoi-env.sh
#
# 使い方:
#   ./bootstrap-yorisoi-env.sh <GCP_PROJECT_ID> <ENV>
#   ENV は dev / stg / prod のいずれかを想定しています。
###

PROJECT_ID="${1:?Usage: $0 <GCP_PROJECT_ID> <ENV>}"
ENV="${2:?Usage: $0 <GCP_PROJECT_ID> <ENV (dev|stg|prod)>}"

# ----------------------------------------
# 基本設定
# ----------------------------------------
REGION="${REGION:-asia-northeast1}"
SERVICE_BASENAME="${SERVICE_BASENAME:-yorisoi}"
SERVICE_NAME="${SERVICE_BASENAME}-${ENV}"

# Artifact Registry（Docker）関連
REPO_NAME="${REPO_NAME:-yorisoi}"
IMAGE_NAME="${IMAGE_NAME:-yorisoi}"
IMAGE_TAG="${ENV}-$(date +%Y%m%d-%H%M%S)"
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"

# サービスアカウント
SA_NAME="${SA_NAME:-yorisoi-run}"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# GCS バケット（環境ごとに分割）
BUCKET_NAME="${BUCKET_NAME:-medi-yorisoi-audio-${ENV}}"

# ALLOW_ORIGIN（環境ドメイン）
# 例: https://yorisoi-dev.medi-canvas.com / https://yorisoi.medi-canvas.com
if [[ "${ENV}" == "prod" ]]; then
  ALLOW_ORIGIN_DEFAULT="https://yorisoi.medi-canvas.com"
else
  ALLOW_ORIGIN_DEFAULT="https://yorisoi-${ENV}.medi-canvas.com"
fi
ALLOW_ORIGIN="${ALLOW_ORIGIN:-${ALLOW_ORIGIN_DEFAULT}}"

# Secret 名（環境ごとに作成）
SECRET_PREFIX="${ENV^^}" # dev → DEV, stg → STG, prod → PROD
SECRET_GEMINI="${SECRET_PREFIX}_GEMINI_API_KEY"
SECRET_LINE_ACCESS_TOKEN="${SECRET_PREFIX}_LINE_CHANNEL_ACCESS_TOKEN"
SECRET_LINE_SECRET="${SECRET_PREFIX}_LINE_CHANNEL_SECRET"
SECRET_LINE_LOGIN_ID="${SECRET_PREFIX}_LINE_LOGIN_CHANNEL_ID"

echo "=========================================="
echo " Project : ${PROJECT_ID}"
echo " Env     : ${ENV}"
echo " Region  : ${REGION}"
echo " Service : ${SERVICE_NAME}"
echo " Bucket  : ${BUCKET_NAME}"
echo " Image   : ${IMAGE_URI}"
echo " Origin  : ${ALLOW_ORIGIN}"
echo "=========================================="

read -p "この設定で処理を続行しますか？ [y/N]: " yn
case "$yn" in
  [yY]*) ;;
  *) echo "中断しました。"; exit 1 ;;
esac

# ----------------------------------------
# 1. API 有効化
# ----------------------------------------
echo "[1/7] 必要な API を有効化します..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  speech.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  --project="${PROJECT_ID}"

# ----------------------------------------
# 2. サービスアカウント作成 + ロール付与
# ----------------------------------------
echo "[2/7] Cloud Run 実行サービスアカウントを作成します..."

gcloud iam service-accounts create "${SA_NAME}" \
  --project="${PROJECT_ID}" \
  --display-name="yorisoi Cloud Run service account" \
  2>/dev/null || echo " 既に存在しているためスキップします。"

echo "[2/7] サービスアカウントへロールを付与します..."

ROLES=(
  "roles/logging.logWriter"
  "roles/monitoring.metricWriter"
  "roles/cloudtrace.agent"
  "roles/secretmanager.secretAccessor"
  "roles/storage.objectAdmin"
  "roles/speech.client"
  "roles/iam.serviceAccountTokenCreator"
)

for ROLE in "${ROLES[@]}"; do
  echo " - ${ROLE}"
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="${ROLE}" \
    --quiet \
    --project="${PROJECT_ID}" >/dev/null
done

# ----------------------------------------
# 3. GCS バケット作成 + CORS 設定
# ----------------------------------------
echo "[3/7] GCS バケットを作成します (gs://${BUCKET_NAME})..."

if gsutil ls -p "${PROJECT_ID}" "gs://${BUCKET_NAME}" >/dev/null 2>&1; then
  echo " 既に存在しているため作成をスキップします。"
else
  gsutil mb -p "${PROJECT_ID}" -c STANDARD -l "${REGION}" "gs://${BUCKET_NAME}"
fi

echo "[3/7] CORS 設定を反映します..."

TMP_CORS_FILE="$(mktemp)"
cat > "${TMP_CORS_FILE}" <<EOF
[
  {
    "maxAgeSeconds": 3600,
    "method": ["PUT", "GET", "HEAD", "OPTIONS"],
    "origin": ["${ALLOW_ORIGIN}", "https://liff.line.me"],
    "responseHeader": ["Content-Type"]
  }
]
EOF

gsutil cors set "${TMP_CORS_FILE}" "gs://${BUCKET_NAME}"
rm -f "${TMP_CORS_FILE}"

# ----------------------------------------
# 4. Secret Manager に「器」を作成
#    （値の投入はこの後コンソール or CLI で）
# ----------------------------------------
echo "[4/7] Secret Manager にシークレットの器を作成します..."

SECRETS=(
  "${SECRET_GEMINI}"
  "${SECRET_LINE_ACCESS_TOKEN}"
  "${SECRET_LINE_SECRET}"
  "${SECRET_LINE_LOGIN_ID}"
)

for SEC in "${SECRETS[@]}"; do
  if gcloud secrets describe "${SEC}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
    echo " - ${SEC}: 既に存在しているためスキップします。"
  else
    echo " - ${SEC}: 作成します。"
    gcloud secrets create "${SEC}" \
      --replication-policy="automatic" \
      --project="${PROJECT_ID}"
    echo "   ※ このあと必ず値を登録してください。"
  fi
done

echo
echo ">>> ここで一旦止めて、以下のシークレットに値を登録してください。"
echo "    - ${SECRET_GEMINI}"
echo "    - ${SECRET_LINE_ACCESS_TOKEN}"
echo "    - ${SECRET_LINE_SECRET}"
echo "    - ${SECRET_LINE_LOGIN_ID}"
echo "    登録後に Enter を押してください。"
read -p "続行してよろしければ Enter を押してください: " _

# ----------------------------------------
# 5. Artifact Registry 作成 + Docker イメージ build & push
# ----------------------------------------
echo "[5/7] Artifact Registry を作成します (リポジトリ: ${REPO_NAME})..."

gcloud artifacts repositories create "${REPO_NAME}" \
  --repository-format=DOCKER \
  --location="${REGION}" \
  --description="yorisoi container images" \
  --project="${PROJECT_ID}" \
  2>/dev/null || echo " 既に存在しているため作成をスキップします。"

echo "[5/7] Docker イメージを build & push します..."
gcloud builds submit \
  --tag "${IMAGE_URI}" \
  --project="${PROJECT_ID}"

# ----------------------------------------
# 6. Cloud Run デプロイ
# ----------------------------------------
echo "[6/7] Cloud Run サービス ${SERVICE_NAME} をデプロイします..."

gcloud run deploy "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --image="${IMAGE_URI}" \
  --service-account="${SA_EMAIL}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --cpu=1 --memory=512Mi \
  --concurrency=80 \
  --timeout=300 \
  --set-env-vars="ALLOW_ORIGIN=${ALLOW_ORIGIN},GCS_BUCKET=${BUCKET_NAME},DATA_DIR=/app/data" \
  --set-secrets="GEMINI_API_KEY=${SECRET_GEMINI}:latest,LINE_CHANNEL_ACCESS_TOKEN=${SECRET_LINE_ACCESS_TOKEN}:latest,LINE_CHANNEL_SECRET=${SECRET_LINE_SECRET}:latest,LINE_LOGIN_CHANNEL_ID=${SECRET_LINE_LOGIN_ID}:latest"

# ----------------------------------------
# 7. 動作確認用の URL 表示
# ----------------------------------------
echo "[7/7] デプロイが完了しました。サービス URL を取得します..."

SERVICE_URL="$(gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format='value(status.url)')"

echo "------------------------------------------"
echo " Cloud Run URL: ${SERVICE_URL}"
echo " ヘルスチェック: curl -sS \"${SERVICE_URL}/\""
echo "------------------------------------------"
echo "bootstrap 処理が完了しました。"
