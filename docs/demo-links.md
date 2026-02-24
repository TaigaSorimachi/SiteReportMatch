# SiteReportMatch デモ公開リンク

## アクセスURL

| 画面 | URL |
|------|-----|
| 作業者アプリ | https://prevention-enhance-bacterial-nothing.trycloudflare.com/ |
| 管理画面 | https://prevention-enhance-bacterial-nothing.trycloudflare.com/admin |
| API ドキュメント | https://prevention-enhance-bacterial-nothing.trycloudflare.com/api/docs |

## ログイン情報

### 管理画面（/admin）

- メール: `admin@demo.com`
- パスワード: `admin123`

### 事業者ログイン（/admin）

- メール: `owner@demo.com`
- パスワード: `owner123`

### 作業者（API経由）

Swagger（/api/docs）から以下を実行：

```
POST /api/v1/auth/dev/login
{"identifier": "demo-worker"}
```

---

## ローカル起動手順

### 初回のみ

```bash
brew install cloudflared
```

### 毎回の起動（3コマンド）

```bash
# 1. プロジェクトルートへ移動
cd /Users/taiga.sorimachi/App/myApp/demo-app/SiteReportMatch

# 2. DB起動 & バックエンド起動
docker compose up -d && cd backend && APP_ENV=development APP_PORT=3000 node dist/src/main.js &

# 3. トンネル公開（表示されるURLがデモ用リンク）
cloudflared tunnel --url http://localhost:3000
```

### コード変更後はビルドが必要

```bash
bash scripts/build-all.sh
```

### 停止

```bash
kill $(lsof -ti:3000)   # バックエンド停止
docker compose down      # DB停止（任意）
# トンネルは Ctrl+C で停止
```

---

> URLはトンネル起動ごとに変わります。再起動した場合はこのファイルのURLを更新してください。
