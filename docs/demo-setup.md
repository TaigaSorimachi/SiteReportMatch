# デモ環境 起動手順

## 前提条件

- macOS（Homebrew インストール済み）
- Docker Desktop 起動済み
- Node.js 20 以上
- cloudflared（初回のみ `brew install cloudflared`）

---

## 起動手順（3ステップ）

### 1. Docker（PostgreSQL）を起動

```bash
cd /Users/taiga.sorimachi/App/myApp/demo-app/SiteReportMatch
docker compose up -d
```

### 2. バックエンドを本番モードで起動

```bash
cd backend
APP_ENV=development APP_PORT=3000 node dist/src/main.js &
```

> ビルドが必要な場合（初回 or コード変更後）：
>
> ```bash
> bash scripts/build-all.sh
> ```

### 3. Cloudflare Tunnel で公開

```bash
cloudflared tunnel --url http://localhost:3000
```

ターミナルに表示される URL がデモ用の公開 URL です。

```
https://xxxxx-xxxxx.trycloudflare.com
```

---

## アクセス先

| 画面 | パス |
|------|------|
| 作業者アプリ | `/` |
| 管理画面 | `/admin` |
| API ドキュメント | `/api/docs` |

---

## ログイン情報

### 管理画面（/admin）

| 項目 | 値 |
|------|-----|
| メール | `admin@demo.com` |
| パスワード | `admin123` |

### 作業者アプリ（/）

LINE LIFF ログインは本番ドメイン設定が必要なため、デモでは Swagger 経由で操作します。

1. `/api/docs` を開く
2. `POST /api/v1/auth/dev/login` を実行（`{"identifier": "demo-worker"}`）
3. レスポンスの `accessToken` をコピー
4. Swagger 右上の「Authorize」に `Bearer {token}` を貼り付け
5. 各 API を操作可能

### デモ用アカウント一覧

| 役割 | identifier | メール | パスワード |
|------|-----------|--------|-----------|
| 管理者 | - | `admin@demo.com` | `admin123` |
| 事業者 | `demo-owner` | `owner@demo.com` | `owner123` |
| 作業者 | `demo-worker` | `worker@demo.com` | - |

---

## 停止手順

```bash
# バックエンド停止
kill $(lsof -ti:3000)

# Cloudflare Tunnel は Ctrl+C で停止

# Docker 停止（任意）
docker compose down
```

---

## トラブルシューティング

### `Cannot find module dist/src/main.js`

ビルドが必要です。

```bash
bash scripts/build-all.sh
```

### ポート 3000 が既に使用中

```bash
kill $(lsof -ti:3000)
```

### DB 接続エラー

Docker が起動しているか確認してください。

```bash
docker compose ps
```

`srm-postgres` が `running` でない場合：

```bash
docker compose up -d
```

### URL にアクセスしても表示されない

cloudflared のターミナルが閉じていないか確認してください。URL は起動ごとに変わります。
