# SiteReportMatch システム構成書

## 概要

建築業界向け人材マッチング＆現場管理プラットフォーム。
日報・出退勤管理、案件・人材マッチング、経理機能を統合的に提供する。

---

## 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| Backend | NestJS (TypeScript) | 11.x |
| ORM | Prisma | 7.4 |
| Database | PostgreSQL | 15 (Alpine) |
| Cache | Redis | 7 (Alpine) |
| Frontend (LIFF) | React + Vite | React 19 / Vite 7 |
| Admin Panel | React + Vite | React 19 / Vite 7 |
| CSS | Tailwind CSS | 4.2 |
| 認証 | JWT + LINE LIFF + Passport | - |
| バリデーション | Zod + class-validator | - |
| フォーム | react-hook-form | 7.x |

---

## プロジェクト構成

```
SiteReportMatch/
├── backend/          # NestJS APIサーバー
├── frontend/         # LINE LIFF Reactアプリ（作業者・オーナー向け）
├── admin/            # 管理画面 Reactアプリ（管理者向け）
├── docs/             # 設計ドキュメント
├── docker-compose.yml
└── setup.sh
```

---

## インフラ構成

### Docker Compose

| サービス | イメージ | ポート | 用途 |
|---------|---------|-------|------|
| postgres | postgres:15-alpine | 5435:5432 | メインDB |
| redis | redis:7-alpine | 6380:6379 | キャッシュ |

### 環境変数（backend/.env）

| 変数名 | 説明 |
|--------|------|
| DATABASE_URL | PostgreSQL接続文字列 |
| JWT_SECRET | JWTトークン署名鍵 |
| JWT_EXPIRATION | アクセストークン有効期限（デフォルト: 24h） |
| JWT_REFRESH_EXPIRATION | リフレッシュトークン有効期限（デフォルト: 7d） |
| REDIS_URL | Redis接続URL |
| LINE_CHANNEL_ID / LINE_CHANNEL_SECRET | LINE連携設定 |
| LINE_LIFF_ID | LIFF アプリケーションID |
| APP_PORT | APIサーバーポート（デフォルト: 3000） |
| APP_ENV | 実行環境（development / production） |

---

## ロール・権限

| ロール | 説明 | ログイン方式 |
|--------|------|-------------|
| admin（管理者） | 開発者。全マスター編集、管理画面アクセス | Email + Password |
| owner（オーナー） | 会社代表。自社情報編集、マッチング機能利用 | LINE LIFF |
| worker（作業者） | 現場作業者。日報登録・履歴確認のみ | LINE LIFF |

- オーナーアカウントと会社は1:1（ユニーク制約あり）
- オーナーアカウントは管理者が払い出す

---

## Backend（NestJS）

### アーキテクチャ

モジュラー構成。Controller → Service → Prisma の3層アーキテクチャ。

```
backend/src/
├── auth/             # 認証（JWT, LINE LIFF, Admin Login）
├── users/            # ユーザー管理
├── companies/        # 会社管理
├── projects/         # 案件・現場管理
├── reports/          # 日報・出退勤・安全記録
├── workers/          # 作業者プロフィール・スキル・評価
├── matching/
│   ├── demand/       # 人材募集（求人側）
│   ├── supply/       # 人材公開（求職側）
│   ├── contracts/    # マッチ成立・レビュー
│   └── dashboard/    # マッチング統計
├── geolocation/      # GPS記録・ジオフェンス
├── accounting/       # 請求書・給与・原価台帳
├── masters/          # マスターデータ（工種・資格等）
├── custom-fields/    # カスタム項目定義
├── notifications/    # 通知ログ
├── common/           # ガード・インターセプター・デコレータ
├── config/           # 設定
├── database/         # Prismaサービス
└── line/             # LINE連携ユーティリティ
```

### 認証フロー

**LINE LIFF ログイン（frontend）:**
1. LIFFでLINEアクセストークン取得
2. `POST /api/v1/auth/line/login` にトークン送信
3. LINE APIでプロフィール検証
4. 新規ユーザーは自動作成、既存ユーザーは更新
5. JWT（access + refresh）を返却

**管理者ログイン（admin）:**
1. `POST /api/v1/auth/admin/login` にメール+パスワード送信
2. bcryptでパスワード検証
3. `role === 'admin'` のみ許可
4. JWT（access + refresh）を返却

### グローバルミドルウェア

| 種類 | 名前 | 機能 |
|------|------|------|
| Guard | JwtAuthGuard | 全エンドポイントでJWT検証（`@Public()`で除外） |
| Guard | RolesGuard | `@Roles()` デコレータによるロール制御 |
| Interceptor | TransformInterceptor | Decimal→number, BigInt→number, Date→ISO変換 |
| Pipe | ValidationPipe | DTOバリデーション（whitelist有効） |
| Decorator | @CurrentUser | JWTペイロードからユーザー情報取得 |
| Decorator | @Public | 認証不要エンドポイントの指定 |

### 主要APIエンドポイント

| モジュール | パス | 概要 |
|-----------|------|------|
| Auth | `/api/v1/auth/*` | ログイン・トークンリフレッシュ・ユーザー情報取得 |
| Users | `/api/v1/users` | ユーザーCRUD |
| Companies | `/api/v1/companies` | 会社CRUD・設定管理 |
| Projects | `/api/v1/projects` | 案件CRUD・フェーズ・配員・アサイン・ドキュメント |
| Reports | `/api/v1/reports` | 日報CRUD・打刻・承認・原価項目・安全記録 |
| Workers | `/api/v1/workers` | 作業者プロフィール・スキル・資格・評価 |
| Matching (Demand) | `/api/v1/matching/demand` | 求人掲載・応募・メッセージ |
| Matching (Supply) | `/api/v1/matching/supply` | 人材公開・問い合わせ・メッセージ |
| Matching (Contracts) | `/api/v1/matching/contracts` | 契約・レビュー・キャンセル |
| Geolocation | `/api/v1/geolocation` | GPS記録・ジオフェンスチェック |
| Accounting | `/api/v1/invoices, payroll, cost-ledger` | 請求・給与・原価管理 |
| Masters | `/api/v1/masters` | 工種・資格・構造物マスター |
| Notifications | `/api/v1/notifications` | 通知ログ・既読管理 |

### データベース設計（Prisma 42テーブル）

| カテゴリ | テーブル数 | 主要モデル |
|---------|-----------|-----------|
| A. 組織・ユーザー基盤 | 5 | Company, CompanySetting, User, LicenseMaster, UserLicense |
| B. 人材管理 | 5 | WorkerProfile, WorkTypeMaster, WorkerSkill, WorkerEvaluation, WorkerAvailability |
| C. 案件管理 | 5 | Project, ProjectPhase, ProjectStaffing, ProjectAssignment, ProjectDocument |
| D. 日報・勤怠 | 5 | DailyReport, ReportCostItem, ReportPhoto, SafetyRecord, BreakLog |
| E. 位置情報 | 2 | LocationLog, GeofenceEvent |
| F. マッチング（求人） | 3 | DemandPosting, DemandApplication, DemandMessage |
| G. マッチング（求職） | 3 | SupplyPosting, SupplyInquiry, SupplyMessage |
| H. マッチング共通 | 3 | MatchContract, MatchReview, MatchCancelLog |
| I. カスタム項目 | 2 | CustomFieldDef, CustomFieldVal |
| J. 経理 | 7 | Invoice, InvoiceLine, PaymentReceived, Payroll, PayrollLine, CostLedger, AccountMaster |
| K. 通知 | 1 | NotificationLog |

**DB設計の特徴:**
- UUID主キー（`gen_random_uuid()`）
- 論理削除（isDeleted, deletedAt, deletedBy）
- タイムスタンプ自動管理（createdAt, updatedAt）
- 位置情報は Decimal(10,7) で管理
- JSON/JSONB列によるフレキシブルデータ対応

---

## Frontend（LINE LIFF アプリ）

LINE LIFF上で動作するモバイルファーストのWebアプリ。作業者とオーナーが使用。

### 構成

```
frontend/src/
├── pages/
│   ├── auth/          # ログイン
│   ├── report/        # 日報（ハブ・バッチ入力・リアルタイム入力・履歴）
│   ├── attendance/    # 出退勤打刻
│   ├── matching/      # マッチング（求人・求職・契約・メッセージ）
│   ├── analytics/     # レポート・KPI・アラート
│   └── settings/      # プロフィール・資格・通知・会社設定
├── components/
│   ├── ui/            # Button, Card, Input, Select, Badge, Toggle 等
│   ├── layout/        # AppHeader, BottomNav, PageContainer
│   └── domain/        # StaffingBar, WorkerChip, PostingCard, GeofenceIndicator 等
├── contexts/          # AuthContext
├── hooks/             # useMasters, useGeofenceCheck, useTimer
├── lib/
│   ├── api/           # APIクライアント（14モジュール）
│   ├── auth.ts        # トークン管理（localStorage）
│   ├── liff.ts        # LINE LIFF統合
│   └── utils.ts       # 日付・通貨フォーマット等
└── types/             # TypeScript型定義
```

### 画面一覧

| セクション | パス | 画面名 | アクセス権限 |
|-----------|------|--------|------------|
| 日報 | `/report` | 日報ハブ | 全ロール |
| | `/report/batch` | バッチ入力 | 全ロール |
| | `/report/realtime/*` | リアルタイム入力 | 全ロール |
| | `/report/history` | 履歴一覧 | 全ロール |
| | `/report/history/:id` | 日報詳細 | 全ロール |
| 出退勤 | `/attendance` | 出退勤打刻 | 全ロール |
| マッチング | `/matching` | マッチングトップ | admin/owner |
| | `/matching/demand/*` | 求人掲載・検索・詳細 | admin/owner |
| | `/matching/supply/*` | 人材公開・一覧・詳細 | admin/owner |
| | `/matching/contracts/*` | 契約管理 | admin/owner |
| レポート | `/analytics` | レポートトップ | admin/owner |
| | `/analytics/staffing` | 配員サマリー | admin/owner |
| | `/analytics/pl` | 案件損益 | admin/owner |
| | `/analytics/kpi` | マッチングKPI | admin/owner |
| 設定 | `/settings` | 設定トップ | 全ロール |
| | `/settings/profile` | プロフィール編集 | 全ロール |
| | `/settings/licenses` | 資格管理 | 全ロール |
| | `/settings/company` | 会社設定 | admin/owner |

### ボトムナビゲーション

| タブ | ラベル | 表示ロール |
|------|--------|-----------|
| 日報 | 日報 | 全ロール |
| 出退勤 | 出退勤 | 全ロール |
| マッチング | マッチング | admin/owner |
| レポート | レポート | admin/owner |
| 設定 | 設定 | 全ロール |

### 主要ライブラリ

| 用途 | ライブラリ |
|------|-----------|
| チャート | Recharts |
| ドラッグ＆ドロップ | dnd-kit |
| 日付処理 | date-fns（ja locale） |
| LINE連携 | @line/liff |

---

## Admin（管理画面）

管理者（admin）専用のデスクトップ向けWebアプリ。

### 構成

```
admin/src/
├── pages/
│   ├── LoginPage.tsx           # ログイン
│   ├── DashboardPage.tsx       # ダッシュボード（統計カード）
│   ├── companies/              # 会社管理（一覧・詳細編集）
│   ├── members/                # ユーザー管理（一覧・作成/編集）
│   └── projects/               # 案件管理（一覧・作成/編集）
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx     # 認証チェック付きレイアウト
│   │   ├── Sidebar.tsx         # サイドバーナビゲーション
│   │   └── Header.tsx          # ヘッダー（ユーザー情報・ログアウト）
│   └── ui/                     # Button, Input, Select, Modal, Table, Badge, Pagination
├── contexts/AuthContext.tsx     # 認証状態管理
├── lib/
│   ├── api/                    # APIクライアント（auth, companies, users, projects）
│   ├── auth.ts                 # トークン管理
│   └── utils.ts                # フォーマット・ラベルユーティリティ
└── types/api.ts                # TypeScript型定義
```

### 画面一覧

| パス | 画面名 | 機能 |
|------|--------|------|
| `/login` | ログイン | Email + Password認証 |
| `/` | ダッシュボード | 会社数・ユーザー数・プロジェクト数の統計表示 |
| `/companies` | 会社一覧 | 一覧表示・新規作成モーダル |
| `/companies/:id` | 会社詳細 | 会社情報編集・オーナー追加 |
| `/members` | ユーザー一覧 | 検索・会社フィルター・ロールバッジ表示 |
| `/members/new` | ユーザー作成 | ロール選択（owner/worker）・会社紐付け |
| `/members/:id` | ユーザー編集 | ユーザー情報更新 |
| `/projects` | 案件一覧 | ステータスフィルター・会社フィルター |
| `/projects/new` | 案件作成 | 案件情報入力 |
| `/projects/:id` | 案件編集 | 案件情報更新 |

### サイドバーナビゲーション

| メニュー | パス | 権限 |
|---------|------|------|
| ダッシュボード | `/` | admin |
| 会社管理 | `/companies` | admin |
| ユーザー管理 | `/members` | admin |
| 案件管理 | `/projects` | admin |

---

## APIクライアント共通仕様

### トークン管理

| 項目 | Frontend | Admin |
|------|----------|-------|
| アクセストークンキー | `srm_access_token` | `srm_admin_access_token` |
| リフレッシュトークンキー | `srm_refresh_token` | `srm_admin_refresh_token` |
| 保存先 | localStorage | localStorage |

### リクエストインターセプター
- Authorizationヘッダーに `Bearer {accessToken}` を自動付与

### レスポンスインターセプター（401対応）
1. 401レスポンスを検知
2. 同時リクエストをキューイング
3. リフレッシュトークンで新トークン取得
4. 元のリクエストを新トークンでリトライ
5. リフレッシュ失敗時はログイン画面にリダイレクト

---

## 開発環境セットアップ

### 前提条件
- Node.js
- Docker / Docker Compose

### 起動手順

```bash
# 1. DB・Redis起動
docker compose up -d

# 2. Backend
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev          # http://localhost:3000

# 3. Frontend
cd frontend
npm install
npm run dev                # http://localhost:5173

# 4. Admin
cd admin
npm install
npm run dev                # http://localhost:5175
```

### 開発用ポート

| サービス | ポート |
|---------|-------|
| Backend API | 3000 |
| Frontend (LIFF) | 5173 |
| Admin Panel | 5175 |
| PostgreSQL | 5435 |
| Redis | 6380 |
