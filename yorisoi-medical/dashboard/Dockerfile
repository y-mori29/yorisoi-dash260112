# ステージ1: ビルド環境
FROM node:20-alpine as build

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci

# ソースコードのコピーとビルド
COPY . .
RUN npm run build

# ステージ2: 本番環境 (Nginx)
FROM nginx:alpine

# Nginxの設定ファイルをコピー
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ビルドした静的ファイルをNginxの公開ディレクトリにコピー
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Runのデフォルトポート8080を開放
EXPOSE 8080

# Nginxを起動
CMD ["nginx", "-g", "daemon off;"]
