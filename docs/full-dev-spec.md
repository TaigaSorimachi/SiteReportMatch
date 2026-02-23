# 建築業界 人材マッチング管理システム — 統合開発仕様書

> **対象**: Claude Code Agent Teams 向け  
> **技術スタック**: NestJS + PostgreSQL + LINE LIFF + React Native  
> **DB設計書**: v2.0（別途参照）

---

# 第1章: ER図

```mermaid
erDiagram
    companies ||--o{ users : "所属"
    companies ||--o| company_settings : "設定"
    companies ||--o{ projects : "保有"
    companies ||--o{ demand_postings : "募集"
    companies ||--o{ supply_postings : "人材公開"
    companies ||--o{ invoices : "請求"
    companies ||--o{ payroll : "支払"
    companies ||--o{ custom_field_defs : "カスタム定義"

    users ||--o| worker_profiles : "プロフィール"
    users ||--o{ user_licenses : "資格"
    users ||--o{ worker_skills : "工種スキル"
    users ||--o{ worker_availability : "稼働カレンダー"
    users ||--o{ worker_evaluations : "被評価"
    users ||--o{ daily_reports : "日報"
    users ||--o{ location_logs : "位置ログ"
    users ||--o{ geofence_events : "ジオフェンス"
    users ||--o{ demand_applications : "募集応答"
    users ||--o{ notification_logs : "通知"

    license_master ||--o{ user_licenses : "資格種別"
    work_type_master ||--o{ worker_skills : "工種"
    work_type_master ||--o{ demand_postings : "工種要件"
    work_type_master ||--o{ supply_postings : "対応工種"
    work_type_master ||--o| work_type_master : "親子階層"
    structure_master ||--o{ projects : "構造"

    projects ||--o{ project_phases : "工程"
    projects ||--o{ project_staffing : "人員計画"
    projects ||--o{ project_assignments : "配置"
    projects ||--o{ project_documents : "書類"
    projects ||--o{ daily_reports : "日報"
    projects ||--o{ safety_records : "安全記録"
    projects ||--o{ demand_postings : "募集"
    projects ||--o{ invoices : "請求"
    projects ||--o{ cost_ledger : "原価"

    daily_reports ||--o{ report_cost_items : "原価明細"
    daily_reports ||--o{ report_photos : "写真"
    daily_reports ||--o{ break_logs : "休憩"
    daily_reports ||--o{ safety_records : "安全KY"

    demand_postings ||--o{ demand_applications : "応答"
    demand_postings ||--o{ demand_messages : "メッセージ"
    supply_postings ||--o{ supply_inquiries : "問合せ"
    supply_postings ||--o{ supply_messages : "メッセージ"

    match_contracts ||--o{ match_reviews : "レビュー"
    match_contracts ||--o{ match_cancel_logs : "キャンセル"

    invoices ||--o{ invoice_lines : "明細"
    invoices ||--o{ payments_received : "入金"
    payroll ||--o{ payroll_lines : "支払明細"

    custom_field_defs ||--o{ custom_field_vals : "値"
    account_master ||--o{ cost_ledger : "科目"
    account_master ||--o{ invoice_lines : "科目"

    companies {
        uuid id PK
        varchar company_name
        varchar company_type
        varchar corporate_number UK
    }
    users {
        uuid id PK
        uuid company_id FK
        varchar line_user_id UK
        varchar role "admin/owner/worker"
        varchar availability
    }
    projects {
        uuid id PK
        uuid company_id FK
        varchar project_name
        varchar status
        decimal site_lat
        decimal site_lng
    }
    demand_postings {
        uuid id PK
        uuid company_id FK
        varchar contract_type
        uuid work_type_id FK
        date work_date_start
        int required_count
        varchar status
    }
    supply_postings {
        uuid id PK
        uuid user_id FK
        uuid work_type_id FK
        varchar contract_type
        date available_start
        varchar status
    }
    match_contracts {
        uuid id PK
        uuid demand_posting_id FK
        uuid supply_posting_id FK
        varchar contract_type
        varchar status
    }
    daily_reports {
        uuid id PK
        uuid project_id FK
        uuid worker_id FK
        date report_date
        varchar input_mode
        varchar status
    }
    custom_field_defs {
        uuid id PK
        varchar target_type
        varchar field_label
        varchar input_type
    }
```

---

# 第1.5章: ロール定義・権限マトリクス

## ロール一覧（3ロール）

| ロール | 日本語名 | 説明 | ログイン方法 |
|--------|---------|------|-------------|
| `admin` | 管理者 | 開発者。全マスタ情報の編集・追加。管理画面へのログインが可能。オーナーアカウントと会社情報の払い出しを行う。 | メール+パスワード（管理画面） |
| `owner` | オーナー | 自社の情報を編集・閲覧可能。案件や人材の情報を登録し、マッチング機能（募集・応募の登録・公開）を使用できる。 | LINE LIFF / メール+パスワード |
| `worker` | 作業者 | 日報の登録と履歴の確認が可能。マッチング機能は利用しない。 | LINE LIFF |

## オーナーアカウントと会社の関係

- オーナーアカウントと会社情報は **1:1** の関係
- オーナーアカウントは **admin（開発者）が管理画面から払い出す**
- 会社作成時にオーナーアカウントを同時に作成する運用

## 権限マトリクス

| 機能カテゴリ | 操作 | admin | owner | worker |
|-------------|------|:-----:|:-----:|:------:|
| **管理画面** | ログイン | o | x | x |
| **マスタ管理** | 工種/構造/資格/科目マスタの編集・追加 | o | x | x |
| **会社管理** | 全会社の一覧・作成・編集 | o | x | x |
| **会社管理** | 自社情報の閲覧・編集 | o | o | x |
| **ユーザー管理** | 全ユーザーの一覧・作成・編集 | o | x | x |
| **ユーザー管理** | 自社メンバーの一覧・作成・編集 | o | o | x |
| **オーナー管理** | オーナーアカウントの払い出し | o | x | x |
| **案件管理** | 案件の登録・編集・閲覧 | o | o | x |
| **人材管理** | 人材情報の登録・編集 | o | o | x |
| **マッチング** | 募集（Demand）の作成・公開 | o | o | x |
| **マッチング** | 仕事検索・応募 | o | o | x |
| **マッチング** | 人材公開（Supply） | o | o | x |
| **マッチング** | 応募/問合せ管理 | o | o | x |
| **マッチング** | 成約・レビュー | o | o | x |
| **日報** | 日報の登録 | x | x | o |
| **日報** | 日報の承認・差戻し | o | o | x |
| **日報** | 日報履歴の確認 | o | o | o |
| **出退勤** | 出退勤の打刻 | x | x | o |
| **レポート** | ダッシュボード閲覧 | o | o | x |
| **設定** | プロフィール編集 | o | o | o |
| **設定** | 会社設定の変更 | o | o | x |
| **会計** | 請求書・支払管理 | o | o | x |

---

# 第2章: NestJS API設計

## 2-1. モジュール構成

```
src/
├── main.ts
├── app.module.ts
├── common/
│   ├── decorators/          # @CurrentUser, @Roles
│   ├── filters/             # HttpException filter
│   ├── guards/              # LINEAuthGuard, RolesGuard
│   ├── interceptors/        # LoggingInterceptor, TransformInterceptor
│   ├── pipes/               # ValidationPipe config
│   └── dto/                 # PaginationDto, SortDto
├── config/                  # ConfigModule (env)
├── database/                # TypeORM / Prisma config
├── auth/                    # LINE LIFF 認証
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/line.strategy.ts
│   └── dto/
├── companies/
├── users/
├── workers/                 # profiles, skills, availability, evaluations
├── projects/                # phases, staffing, assignments, documents
├── reports/                 # daily_reports, cost_items, photos, safety, breaks
├── geolocation/             # location_logs, geofence_events
├── matching/
│   ├── demand/              # postings, applications, messages
│   ├── supply/              # postings, inquiries, messages
│   ├── contracts/           # match_contracts, reviews, cancel
│   └── dashboard/           # 過不足ダッシュボード
├── accounting/              # invoices, payments, payroll, cost_ledger
├── custom-fields/           # defs, vals
├── masters/                 # work_types, structures, licenses, accounts
├── notifications/           # LINE通知, Push, In-app
└── line/                    # LINE Messaging API webhook
```

## 2-2. 全エンドポイント一覧

### 認証（Auth）
```
POST   /api/v1/auth/line/login          LINE LIFF トークン検証・ログイン
POST   /api/v1/auth/line/callback       LINE Login コールバック
POST   /api/v1/auth/refresh             トークンリフレッシュ
GET    /api/v1/auth/me                  ログインユーザー情報
```

### 会社（Companies）
```
POST   /api/v1/companies                会社登録
GET    /api/v1/companies                会社一覧（検索・ページネーション）
GET    /api/v1/companies/:id            会社詳細
PATCH  /api/v1/companies/:id            会社更新
DELETE /api/v1/companies/:id            会社論理削除
GET    /api/v1/companies/:id/settings   会社設定取得
PATCH  /api/v1/companies/:id/settings   会社設定更新
```

### ユーザー（Users）
```
POST   /api/v1/users                    ユーザー登録
GET    /api/v1/users                    一覧（role/availability フィルタ）
GET    /api/v1/users/:id                詳細
PATCH  /api/v1/users/:id                更新
DELETE /api/v1/users/:id                論理削除
PATCH  /api/v1/users/:id/availability   稼働ステータス一括変更
```

### 職人（Workers）
```
GET    /api/v1/workers/:id/profile              プロフィール取得
PATCH  /api/v1/workers/:id/profile              プロフィール更新
GET    /api/v1/workers/:id/skills               対応工種一覧
PUT    /api/v1/workers/:id/skills               対応工種一括更新
GET    /api/v1/workers/:id/licenses             保有資格一覧
POST   /api/v1/workers/:id/licenses             資格追加
PATCH  /api/v1/workers/:id/licenses/:lid        資格更新
DELETE /api/v1/workers/:id/licenses/:lid        資格削除
GET    /api/v1/workers/:id/evaluations          評価履歴
POST   /api/v1/workers/:id/evaluations          評価登録
GET    /api/v1/workers/:id/calendar             稼働カレンダー取得
PUT    /api/v1/workers/:id/calendar             稼働カレンダー一括更新
GET    /api/v1/workers/available                 待機中人材検索（ワンアクション候補用）
```

### 案件（Projects）
```
POST   /api/v1/projects                         案件登録
GET    /api/v1/projects                         一覧（ステータス/工期フィルタ）
GET    /api/v1/projects/:id                     詳細
PATCH  /api/v1/projects/:id                     更新
DELETE /api/v1/projects/:id                     論理削除
PATCH  /api/v1/projects/:id/status              ステータス変更

GET    /api/v1/projects/:id/phases              工程一覧
POST   /api/v1/projects/:id/phases              工程追加
PATCH  /api/v1/projects/:id/phases/:pid         工程更新

GET    /api/v1/projects/:id/staffing            人員計画取得
PUT    /api/v1/projects/:id/staffing            人員計画一括更新（日別×工種別）
GET    /api/v1/projects/:id/staffing/summary    充足状況サマリー

GET    /api/v1/projects/:id/assignments         配置一覧
POST   /api/v1/projects/:id/assignments         配置登録（直接 or マッチング経由）
PATCH  /api/v1/projects/:id/assignments/:aid    配置更新
DELETE /api/v1/projects/:id/assignments/:aid    配置キャンセル

POST   /api/v1/projects/:id/documents           書類アップロード
GET    /api/v1/projects/:id/documents           書類一覧
```

### 日報（Reports）
```
POST   /api/v1/reports                          日報作成（まとめ入力）
POST   /api/v1/reports/clock-in                 作業開始（リアルタイム）
PATCH  /api/v1/reports/:id/clock-out            作業終了（リアルタイム）
POST   /api/v1/reports/:id/break/start          休憩開始
PATCH  /api/v1/reports/:id/break/end            休憩終了
PATCH  /api/v1/reports/:id                      日報更新
PATCH  /api/v1/reports/:id/submit               提出
PATCH  /api/v1/reports/:id/approve              承認
PATCH  /api/v1/reports/:id/reject               差戻し
GET    /api/v1/reports                          一覧（日付/案件/作業者フィルタ）
GET    /api/v1/reports/:id                      詳細

POST   /api/v1/reports/:id/costs                原価明細追加
POST   /api/v1/reports/:id/photos               写真アップロード
POST   /api/v1/reports/:id/safety               安全KY記録追加
```

### 位置情報（Geolocation）
```
POST   /api/v1/geolocation/record               位置記録
POST   /api/v1/geolocation/geofence/check       ジオフェンス判定（リアルタイム）
GET    /api/v1/geolocation/logs                  位置ログ一覧
GET    /api/v1/geolocation/geofence/events       ジオフェンスイベント一覧
```

### マッチング — 募集（Demand）
```
POST   /api/v1/matching/demand                   募集作成
GET    /api/v1/matching/demand                   募集一覧（エリア/工種/単価フィルタ）
GET    /api/v1/matching/demand/:id               募集詳細
PATCH  /api/v1/matching/demand/:id               募集更新
PATCH  /api/v1/matching/demand/:id/publish       公開
PATCH  /api/v1/matching/demand/:id/suspend       一時停止
PATCH  /api/v1/matching/demand/:id/close         終了
DELETE /api/v1/matching/demand/:id               論理削除

POST   /api/v1/matching/demand/:id/apply         応募する
GET    /api/v1/matching/demand/:id/applications  応募一覧
PATCH  /api/v1/matching/demand/:id/applications/:aid/accept   応募承認→成約
PATCH  /api/v1/matching/demand/:id/applications/:aid/reject   応募却下

GET    /api/v1/matching/demand/:id/messages       メッセージ一覧
POST   /api/v1/matching/demand/:id/messages       メッセージ送信
```

### マッチング — 人材公開（Supply）
```
POST   /api/v1/matching/supply                   人材公開作成
GET    /api/v1/matching/supply                   一覧（エリア/工種/単価フィルタ）
GET    /api/v1/matching/supply/:id               詳細
PATCH  /api/v1/matching/supply/:id               更新
PATCH  /api/v1/matching/supply/:id/publish       公開
PATCH  /api/v1/matching/supply/:id/close         終了
DELETE /api/v1/matching/supply/:id               論理削除

POST   /api/v1/matching/supply/:id/inquire       問合せする
GET    /api/v1/matching/supply/:id/inquiries      問合せ一覧
PATCH  /api/v1/matching/supply/:id/inquiries/:iid/accept   承認→成約
PATCH  /api/v1/matching/supply/:id/inquiries/:iid/reject   却下
```

### マッチング — 成約・共通
```
GET    /api/v1/matching/contracts                成約一覧
GET    /api/v1/matching/contracts/:id            成約詳細
PATCH  /api/v1/matching/contracts/:id/complete   完了
POST   /api/v1/matching/contracts/:id/cancel     キャンセル
POST   /api/v1/matching/contracts/:id/review     レビュー投稿
GET    /api/v1/matching/dashboard                過不足ダッシュボード
GET    /api/v1/matching/kpi                      KPIサマリー
```

### カスタムフィールド
```
GET    /api/v1/custom-fields/defs                項目定義一覧（target_type フィルタ）
POST   /api/v1/custom-fields/defs                項目定義追加
PATCH  /api/v1/custom-fields/defs/:id            項目定義更新
DELETE /api/v1/custom-fields/defs/:id            項目定義削除（論理）
PUT    /api/v1/custom-fields/defs/sort            表示順一括更新

GET    /api/v1/custom-fields/vals/:targetType/:targetId   値取得
PUT    /api/v1/custom-fields/vals/:targetType/:targetId   値一括保存
```

### 会計（Accounting）
```
POST   /api/v1/invoices                          請求書作成
GET    /api/v1/invoices                          一覧
GET    /api/v1/invoices/:id                      詳細
PATCH  /api/v1/invoices/:id                      更新
PATCH  /api/v1/invoices/:id/issue                発行
POST   /api/v1/invoices/:id/payments             入金記録
GET    /api/v1/invoices/:id/pdf                  PDF生成

POST   /api/v1/payroll                           支払作成
GET    /api/v1/payroll                           支払一覧
PATCH  /api/v1/payroll/:id/confirm               確定
PATCH  /api/v1/payroll/:id/pay                   支払実行

GET    /api/v1/cost-ledger                       原価台帳
GET    /api/v1/cost-ledger/summary/:projectId    案件別原価サマリー
```

### ダッシュボード
```
GET    /api/v1/dashboard/staffing                稼働サマリー
GET    /api/v1/dashboard/revenue                 売上サマリー
GET    /api/v1/dashboard/matching                マッチングKPI
GET    /api/v1/dashboard/alerts                  アラート一覧
```

### マスタ
```
GET    /api/v1/masters/work-types                工種一覧（階層）
GET    /api/v1/masters/structures                構造一覧
GET    /api/v1/masters/licenses                  資格一覧
GET    /api/v1/masters/accounts                  勘定科目一覧
```

## 2-3. 主要DTO定義

```typescript
// ============================================================
// 共通
// ============================================================
class PaginationQuery {
  @IsOptional() @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @IsInt() @Min(1) @Max(100)
  limit?: number = 20;

  @IsOptional() @IsString()
  sort?: string;      // 例: "created_at:desc"
}

class PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================
// 認証
// ============================================================
class LineLoginDto {
  @IsString() @IsNotEmpty()
  liffAccessToken: string;    // LIFF SDK から取得
}

class AuthResponse {
  accessToken: string;        // JWT
  refreshToken: string;
  user: UserSummary;
}

// ============================================================
// 日報
// ============================================================
class CreateReportBatchDto {
  @IsUUID()
  projectId: string;

  @IsDateString()
  reportDate: string;

  @IsString() @IsIn(['batch'])
  inputMode: 'batch';

  @IsDateString()
  clockIn: string;

  @IsDateString()
  clockOut: string;

  @IsInt() @Min(0) @Max(180)
  breakMinutes: number;

  @IsOptional() @IsNumber() @Min(0) @Max(2)
  manDays?: number;             // 未指定時は自動計算

  @IsString() @IsNotEmpty()
  workContent: string;

  @IsOptional() @IsNumber()
  progressPct?: number;

  @IsOptional() @IsString()
  weather?: string;

  @IsOptional()
  costItems?: CreateCostItemDto[];

  @IsOptional()
  location?: { lat: number; lng: number; accuracy?: number };
}

class ClockInDto {
  @IsUUID()
  projectId: string;

  @IsOptional()
  location?: { lat: number; lng: number; accuracy?: number };
}

class ClockOutDto {
  @IsString() @IsNotEmpty()
  workContent: string;

  @IsOptional() @IsNumber()
  progressPct?: number;

  @IsOptional()
  costItems?: CreateCostItemDto[];

  @IsOptional()
  location?: { lat: number; lng: number; accuracy?: number };
}

class CreateCostItemDto {
  @IsIn(['material','equipment','transport','other'])
  costType: string;

  @IsString() @IsNotEmpty()
  itemName: string;

  @IsOptional() @IsNumber()
  quantity?: number;

  @IsOptional() @IsString()
  unit?: string;

  @IsOptional() @IsNumber()
  unitPrice?: number;

  @IsNumber()
  amount: number;
}

// ============================================================
// マッチング — 募集（Demand）
// ============================================================
class CreateDemandPostingDto {
  @IsOptional() @IsUUID()
  projectId?: string;

  // ■ 必須項目
  @IsString() @IsNotEmpty() @MaxLength(300)
  siteName: string;

  @IsString() @IsNotEmpty() @MaxLength(10)
  sitePrefecture: string;

  @IsString() @IsNotEmpty() @MaxLength(50)
  siteCity: string;

  @IsOptional() @IsString()
  siteAddress?: string;

  @IsIn(['daily_rate', 'fixed_price'])
  contractType: string;

  @IsUUID()
  workTypeId: string;

  @IsOptional() @IsUUID()
  workTypeSubId?: string;

  @IsDateString()
  workDateStart: string;

  @IsDateString()
  workDateEnd: string;

  @IsInt() @Min(1)
  requiredCount: number;

  // 単価案件（contractType='daily_rate'時）
  @ValidateIf(o => o.contractType === 'daily_rate')
  @IsInt() @Min(1)
  dailyRateMin?: number;

  @IsOptional() @IsInt()
  dailyRateMax?: number;

  // 請負案件（contractType='fixed_price'時）
  @ValidateIf(o => o.contractType === 'fixed_price')
  @IsInt() @Min(1)
  fixedPrice?: number;

  @IsOptional() @IsString()
  fixedScope?: string;

  // ■ 任意項目
  @IsOptional() @IsUUID()
  structureId?: string;

  @IsOptional() @IsInt() @Min(1)
  floorCount?: number;

  @IsOptional() @IsString()
  primeContractor?: string;

  @IsOptional() @IsInt() @Min(1) @Max(10)
  contractTier?: number;

  @IsOptional() @IsString()
  workTimeStart?: string;           // "HH:mm"

  @IsOptional() @IsString()
  workTimeEnd?: string;

  @IsOptional() @IsIn(['provided','none','conditional'])
  transportationType?: string;

  @IsOptional() @IsString()
  safetyDocSystem?: string;

  @IsOptional() @IsBoolean()
  ccusRequired?: boolean;

  @IsOptional() @IsIn(['beginner','intermediate','advanced','expert'])
  requiredSkillLevel?: string;

  @IsOptional() @IsArray() @IsUUID("4", { each: true })
  requiredLicenses?: string[];

  @IsOptional() @IsBoolean()
  providesParking?: boolean;

  @IsOptional() @IsBoolean()
  providesTools?: boolean;

  @IsOptional() @IsBoolean()
  providesMeals?: boolean;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  notes?: string;

  // ■ カスタムフィールド
  @IsOptional()
  customFields?: Record<string, any>;    // { field_key: value }
}

class SearchDemandQuery extends PaginationQuery {
  @IsOptional() @IsString()
  prefecture?: string;

  @IsOptional() @IsString()
  city?: string;

  @IsOptional() @IsUUID()
  workTypeId?: string;

  @IsOptional() @IsIn(['daily_rate','fixed_price'])
  contractType?: string;

  @IsOptional() @IsInt()
  rateMin?: number;

  @IsOptional() @IsInt()
  rateMax?: number;

  @IsOptional() @IsDateString()
  dateFrom?: string;

  @IsOptional() @IsDateString()
  dateTo?: string;

  @IsOptional() @IsIn(['open','filled','closed'])
  status?: string;
}

class ApplyToDemandDto {
  @IsOptional() @IsInt()
  proposedRate?: number;

  @IsOptional() @IsInt()
  proposedPrice?: number;

  @IsOptional() @IsInt() @Min(1)
  availableCount?: number;

  @IsOptional() @IsArray()
  availableDates?: string[];

  @IsOptional() @IsString()
  message?: string;
}

// ============================================================
// マッチング — 人材公開（Supply）
// ============================================================
class CreateSupplyPostingDto {
  // ■ 必須
  @IsUUID()
  workTypeId: string;

  @IsIn(['daily_rate','fixed_price','either'])
  contractType: string;

  @IsOptional() @IsInt()
  desiredDailyRate?: number;

  @IsDateString()
  availableStart: string;

  @IsDateString()
  availableEnd: string;

  @IsString() @IsNotEmpty()
  availablePrefecture: string;

  // ■ 任意
  @IsOptional() @IsString()
  availableArea?: string;

  @IsOptional() @IsString()
  availableHours?: string;

  @IsOptional() @IsIn(['beginner','intermediate','advanced','expert'])
  skillLevel?: string;

  @IsOptional() @IsInt()
  experienceYears?: number;

  @IsOptional() @IsArray()
  licenses?: string[];

  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  description?: string;

  // ■ カスタムフィールド
  @IsOptional()
  customFields?: Record<string, any>;
}

// ============================================================
// カスタムフィールド
// ============================================================
class CreateFieldDefDto {
  @IsIn(['demand','supply','project','worker'])
  targetType: string;

  @IsString() @IsNotEmpty() @MaxLength(100)
  fieldLabel: string;

  @IsString() @IsNotEmpty() @MaxLength(50) @Matches(/^[a-z][a-z0-9_]*$/)
  fieldKey: string;

  @IsIn(['text','number','date','select','checkbox','textarea'])
  inputType: string;

  @IsOptional()
  options?: { value: string; label: string }[];

  @IsOptional() @IsBoolean()
  isRequired?: boolean;

  @IsOptional() @IsInt()
  sortOrder?: number;
}

class SaveFieldValsDto {
  @IsObject()
  values: Record<string, any>;    // { field_key: value, ... }
}

// ============================================================
// ジオフェンス判定
// ============================================================
class GeofenceCheckDto {
  @IsNumber() lat: number;
  @IsNumber() lng: number;
  @IsOptional() @IsNumber() accuracy?: number;
  @IsOptional() @IsUUID() projectId?: string;
}

class GeofenceCheckResponse {
  isInsideGeofence: boolean;
  distanceMeters: number;
  projectId: string;
  projectName: string;
  event?: 'enter' | 'exit' | null;  // 状態変化があった場合
}

// ============================================================
// ダッシュボード
// ============================================================
class StaffingDashboardResponse {
  weekly: {
    date: string;
    required: number;
    confirmed: number;
    shortage: number;
    status: 'sufficient' | 'warning' | 'shortage';
  }[];
  byProject: {
    projectId: string;
    projectName: string;
    required: number;
    confirmed: number;
    shortage: number;
  }[];
}

class MatchingKpiResponse {
  period: string;
  totalMatches: number;
  completedMatches: number;
  cancelledMatches: number;
  avgMatchHours: number;
  cancelRate: number;
  successRate: number;
}

class AlertsResponse {
  overdueInvoices: { id: string; number: string; dueDate: string; amount: number }[];
  expiringLicenses: { userId: string; name: string; license: string; expiryDate: string }[];
  longIdleWorkers: { userId: string; name: string; idleDays: number }[];
  unfiledReports: { projectId: string; name: string; date: string }[];
}
```

---

# 第3章: LINE LIFF 画面遷移図・ワイヤーフレーム

## 3-1. 画面遷移図

```
[LINE リッチメニュー]
  ├── 📝 日報 ──→ [日報TOP]
  │                 ├── [モード選択] ──→ [まとめ入力フォーム] ──→ [確認] ──→ [完了]
  │                 ├── [リアルタイム] ──→ [案件選択] ──→ [作業開始]
  │                 │                      ──→ [作業中タイマー] ──→ [休憩]
  │                 │                      ──→ [作業終了] ──→ [補足入力] ──→ [完了]
  │                 └── [日報履歴一覧] ──→ [日報詳細]
  │
  ├── 📍 出退勤 ──→ [出退勤TOP]
  │                   ├── [▶ 出勤] ──→ (GPS記録) ──→ [作業中画面]
  │                   └── [⏹ 退勤] ──→ (GPS記録) ──→ [日報補足] ──→ [完了]
  │
  ├── 🔧 マッチング ──→ [マッチングTOP] ※ownerのみ表示（workerには非表示）
  │                      ├── [📋 募集する] ──→ [募集作成フォーム] ──→ [確認] ──→ [公開]
  │                      │                     └── [カスタム項目入力]
  │                      ├── [🔍 仕事を探す] ──→ [募集検索/一覧] ──→ [募集詳細] ──→ [応募]
  │                      ├── [👤 人材を公開] ──→ [人材公開フォーム] ──→ [公開]
  │                      ├── [📩 応募/問合せ管理] ──→ [一覧] ──→ [承認/却下]
  │                      └── [過不足ダッシュボード]
  │
  ├── 📊 レポート ──→ [レポートTOP]
  │                    ├── [稼働サマリー]
  │                    ├── [案件収支]
  │                    ├── [マッチングKPI]
  │                    └── [アラート一覧]
  │
  ├── 👤 設定 ──→ [設定TOP]
  │               ├── [プロフィール編集]
  │               ├── [資格管理]
  │               ├── [会社設定]（owner以上のみ）
  │               │    ├── [日報モード設定]
  │               │    ├── [GPS/ジオフェンス設定]
  │               │    └── [カスタム項目管理]
  │               └── [通知設定]
  │
  └── 💬 サポート ──→ チャットサポート
```

## 3-2. 主要画面ワイヤーフレーム

### ① マッチングTOP（過不足ダッシュボード付き）
```
┌─────────────────────────────────────┐
│ ☰ マッチング              🔔 3     │
│─────────────────────────────────────│
│                                     │
│ ┌───────────────┐┌───────────────┐  │
│ │ 📋            ││ 🔍            │  │
│ │ 募集する      ││ 仕事を探す    │  │
│ │ （72px高）    ││ （72px高）    │  │
│ └───────────────┘└───────────────┘  │
│ ┌───────────────┐┌───────────────┐  │
│ │ 👤            ││ 📩            │  │
│ │ 人材を公開    ││ 応募管理      │  │
│ │               ││      ❸       │  │
│ └───────────────┘└───────────────┘  │
│                                     │
│ ━━ 今週の人員状況 ━━━━━━━━━━━━━━  │
│                                     │
│ 2/17(月) ████████░░ 8/10  ⚠️        │
│ 2/18(火) ██████████ 10/10 ✅        │
│ 2/19(水) █████░░░░░  5/10 🔴        │
│ 2/20(木) ██████████ 12/10 ✅        │
│ 2/21(金) ███████░░░  7/10 ⚠️        │
│                                     │
│ ━━ 不足案件 ━━━━━━━━━━━━━━━━━━━━━  │
│ ┌─────────────────────────────────┐ │
│ │ 🔴 ○○邸基礎工事    2/19(水)    │ │
│ │    左官工 必要10名 → 確定5名    │ │
│ │    ╭──────────────────────╮     │ │
│ │    │  📋 募集を作成する   │     │ │
│ │    ╰──────────────────────╯     │ │
│ ├─────────────────────────────────┤ │
│ │ ⚠️ △△ビル改修工事   2/17(月)    │ │
│ │    塗装工 必要10名 → 確定8名    │ │
│ │    ╭──────────────────────╮     │ │
│ │    │  📋 募集を作成する   │     │ │
│ │    ╰──────────────────────╯     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ━━ 待機中の人材 ━━━━━━━━━━━ ＞全件 │
│ ┌────┐┌────┐┌────┐┌────┐          │
│ │👷A ││👷B ││👷C ││👷D │ (横スクロール)│
│ │★4.5││★4.2││★3.8││★4.8│          │
│ │左官 ││塗装 ││型枠 ││左官│          │
│ └────┘└────┘└────┘└────┘          │
│                                     │
└─────────────────────────────────────┘
```

### ② 募集作成（Demand Posting）
```
┌─────────────────────────────────────┐
│ ← 募集作成                          │
│─────────────────────────────────────│
│                                     │
│ ━━ 契約形態 ━━━━━━━━━━━━━━━━━━━━  │
│ ┌───────────────┐┌───────────────┐  │
│ │  💰 単価      ││  📦 請負      │  │
│ │  （常用）     ││               │  │
│ └───────────────┘└───────────────┘  │
│                                     │
│ ━━ 必須項目 ━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ 現場名称 *                          │
│ ┌─────────────────────────────────┐ │
│ │ ○○邸新築工事                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 都道府県 *         市区町村 *        │
│ [  東京都  ▼ ]    [ 新宿区     ]   │
│                                     │
│ それ以降の住所                       │
│ [  西新宿2-8-1                  ]   │
│                                     │
│ 工種 *                              │
│ [ 大分類 ▼ ] → [ 小分類 ▼ ]       │
│ [ 左官工事 ]   [ モルタル塗り ]     │
│                                     │
│ 作業期間 *                          │
│ [ 2026/03/01 ] 〜 [ 2026/03/31 ]   │
│                                     │
│ 必要人数 *                          │
│ [  -  ]    5 人    [  +  ]          │
│ （大きな+/-ボタン）                  │
│                                     │
│ 日当（単価案件時）*                  │
│ ¥ [ 18,000 ] 〜 ¥ [ 22,000 ]      │
│                                     │
│ ━━ 任意項目 ━━━━━━━━━━━━━━━━━━━━  │
│ （タップで展開/折りたたみ）           │
│                                     │
│ ▼ 物件情報                          │
│   構造     [ RC造 ▼ ]              │
│   階数     [ 5 ] 階                │
│   元請     [ ○○建設 ]              │
│   下請次数  [ 2 ] 次               │
│                                     │
│ ▼ 条件                              │
│   集合時間  [ 08:00 ▼ ]            │
│   交通費    ○支給 ○なし ○条件付   │
│   CCUS     [ OFF ○ ][ ON ◉ ]      │
│   駐車場    ☑ あり                  │
│   工具貸与  ☐                       │
│                                     │
│ ▼ スキル要件                         │
│   スキルレベル [ 中級以上 ▼ ]       │
│   必要資格     ☑玉掛 ☑足場 ☐クレーン│
│                                     │
│ ▼ カスタム項目                       │
│   仕上げ種別  [ 漆喰 ▼ ]           │
│   （管理者が追加した項目が動的表示）   │
│                                     │
│ 特記事項                             │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ╭─────────────────────────────────╮ │
│ │      確認画面へ進む →           │ │
│ ╰─────────────────────────────────╯ │
│                                     │
└─────────────────────────────────────┘
```

### ③ 仕事を探す（募集検索/一覧）
```
┌─────────────────────────────────────┐
│ ← 仕事を探す             🔍 絞込み  │
│─────────────────────────────────────│
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🔎 キーワード検索               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [エリア▼] [工種▼] [単価▼] [日程▼]  │
│                                     │
│ 123件の募集                          │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 💰 単価 | 左官工事               │ │
│ │ ○○邸新築工事                    │ │
│ │ 📍 東京都新宿区                  │ │
│ │ 📅 3/1〜3/31  👷 5名募集         │ │
│ │ 💴 ¥18,000〜22,000/日           │ │
│ │ ┌─────┐┌─────┐┌──────┐         │ │
│ │ │CCUS ││駐車場││交通費 │         │ │
│ │ └─────┘└─────┘└──────┘         │ │
│ ├─────────────────────────────────┤ │
│ │ 📦 請負 | 塗装工事               │ │
│ │ △△ビル外壁塗装                  │ │
│ │ 📍 東京都渋谷区                  │ │
│ │ 📅 3/15〜4/15  👷 1式            │ │
│ │ 💴 ¥2,500,000                   │ │
│ ├─────────────────────────────────┤ │
│ │ 💰 単価 | とび工事               │ │
│ │ □□マンション足場組立             │ │
│ │ 📍 神奈川県横浜市                │ │
│ │ 📅 2/20〜2/25  👷 3名募集        │ │
│ │ 💴 ¥20,000〜25,000/日           │ │
│ └─────────────────────────────────┘ │
│                                     │
│       [ もっと見る ▼ ]              │
│                                     │
└─────────────────────────────────────┘
```

### ④ 日報（リアルタイムモード - 作業中）
```
┌─────────────────────────────────────┐
│ ← 出退勤              📍ON  🔋83%  │
│─────────────────────────────────────│
│                                     │
│  📅 2026年2月17日（月）              │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📌 ○○邸基礎工事                ││
│  │    東京都新宿区西新宿2-8-1      ││
│  │    📍 現場から 120m（圏内 ✅）   ││
│  └─────────────────────────────────┘│
│                                     │
│         ⏱ 作業中                    │
│                                     │
│     ┌─────────────────────┐         │
│     │                     │         │
│     │     02 : 34 : 15    │         │
│     │                     │         │
│     └─────────────────────┘         │
│                                     │
│     開始: 08:00  |  休憩: 0分       │
│                                     │
│  ╭─────────────────────────────╮    │
│  │                             │    │
│  │       ☕ 休憩する            │    │
│  │                             │    │
│  ╰─────────────────────────────╯    │
│       （青色・72px高ボタン）          │
│                                     │
│  ╭─────────────────────────────╮    │
│  │                             │    │
│  │       ⏹ 作業終了            │    │
│  │                             │    │
│  ╰─────────────────────────────╯    │
│       （赤色・72px高ボタン）          │
│                                     │
│  ── 今日の記録 ───────────          │
│  08:00 📍出勤打刻 (現場圏内)        │
│                                     │
└─────────────────────────────────────┘
```

### ⑤ 管理者設定画面
```
┌─────────────────────────────────────┐
│ ← 会社設定                          │
│─────────────────────────────────────│
│                                     │
│ ━━ 日報設定 ━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ 入力モード                           │
│ ○ まとめ入力のみ                     │
│ ○ リアルタイムのみ                   │
│ ◉ 選択制（作業員が選べる）           │
│                                     │
│ 写真必須         [ OFF ○ ][ ON ◉ ]  │
│ 安全KY必須       [ OFF ◉ ][ ON ○ ]  │
│                                     │
│ ━━ GPS設定 ━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ GPS取得          [ OFF ○ ][ ON ◉ ]  │
│ 作業員がOFF可能  [ OFF ◉ ][ ON ○ ]  │
│                                     │
│ ジオフェンス     [ OFF ○ ][ ON ◉ ]  │
│ 判定半径                  [ 300 ] m  │
│                                     │
│ ━━ マッチング設定 ━━━━━━━━━━━━━━━  │
│                                     │
│ マッチング機能   [ OFF ○ ][ ON ◉ ]  │
│ 応募自動承認     [ OFF ◉ ][ ON ○ ]  │
│                                     │
│ ━━ 人工計算 ━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ 1人工の標準時間        [ 8.0 ] 時間  │
│ 残業閾値              [ 8.0 ] 時間  │
│                                     │
│ ━━ カスタム項目管理 ━━━━━━━━━━━━━  │
│                                     │
│  [募集用 ▼]                         │
│  ┌──────────────────────────────┐   │
│  │ ≡ 仕上げ種別  select  必須   │   │
│  │ ≡ 下地種類    select  任意   │   │
│  │ ≡ 面積        number  任意   │   │
│  │                              │   │
│  │   [ ＋ 項目を追加 ]          │   │
│  └──────────────────────────────┘   │
│  ※ ≡ はドラッグで並び替え可能        │
│                                     │
│ ╭─────────────────────────────────╮ │
│ │          保存する               │ │
│ ╰─────────────────────────────────╯ │
│                                     │
└─────────────────────────────────────┘
```

---

# 第4章: バリデーションルール・ビジネスロジック

## 4-1. 日報（daily_reports）

### ステータス遷移ルール
```
[リアルタイムモード]
  (新規) → in_progress   : clock-in API 呼出し時
  in_progress → draft     : clock-out API 呼出し時
  draft → submitted       : submit API 呼出し時
  submitted → approved    : approve API（admin/owner のみ）
  submitted → rejected    : reject API（admin/owner のみ）
  rejected → submitted    : 修正後に再提出

[まとめ入力モード]
  (新規) → draft          : 作成時
  draft → submitted       : submit API
  (以降同じ)
```

### バリデーションルール
```typescript
// ■ 時間整合性
validate_clock_times(dto):
  - clock_out > clock_in                     // 終了は開始の後
  - clock_out - clock_in <= 24h              // 24時間以内
  - break_minutes <= (clock_out - clock_in)  // 休憩は勤務時間以内
  - report_date == clock_in の日付           // 日付一致

// ■ 人工数の自動計算
calc_man_days(work_minutes, standard_hours):
  man_days = work_minutes / (standard_hours * 60)
  round to 0.25 単位 (0.25, 0.5, 0.75, 1.0...)
  // 設定 company_settings.standard_work_hours を参照

// ■ 残業計算
calc_overtime(work_minutes, threshold_hours):
  overtime = max(0, work_minutes - threshold_hours * 60)

// ■ GPS検証（GPS有効時）
validate_location(location, project):
  if company_settings.gps_enabled:
    - location は必須
    - accuracy_m <= 100  // 精度100m以内を推奨
  if company_settings.geofence_enabled:
    distance = haversine(location, project.site_lat/lng)
    if distance <= project.geofence_radius_m:
      create geofence_event('enter')
    // ※ 警告のみ。圏外でも打刻は許可（現場近くの路上等あり得る）

// ■ 重複チェック
check_duplicate:
  - 同一 worker_id + report_date + project_id は1件のみ
  - リアルタイムモードで in_progress の日報が既にある場合はエラー
```

### ビジネスロジック（副作用）
```typescript
// 日報承認時の処理
async onReportApproved(report):
  1. project_assignments の status を 'completed' に更新
  2. worker_availability の status を 'assigned' に更新
  3. cost_ledger に労務費レコード作成:
     amount = man_days × assignment.daily_rate
     cost_category = worker.is_individual ? 'labor_external' : 'labor_internal'
  4. report_cost_items の各行を cost_ledger に反映
  5. project_staffing.confirmed_count を再計算
  6. worker_profiles の集計値を更新（バッチでも可）
```

## 4-2. 募集（demand_postings）

### ステータス遷移ルール
```
draft ──→ open           : publish API（必須項目バリデーション通過時）
open ──→ suspended       : suspend API（一時停止）
suspended ──→ open       : publish API（再開）
open ──→ filled          : confirmed_count >= required_count 時に自動
open ──→ closed          : close API（手動終了）
open ──→ expired         : expires_at 超過時にバッチ処理
draft/open ──→ cancelled : delete API
```

### バリデーションルール
```typescript
// ■ 公開時バリデーション（draft → open）
validate_publish(posting):
  必須: site_name, site_prefecture, site_city,
        contract_type, work_type_id,
        work_date_start, work_date_end, required_count
  if contract_type == 'daily_rate':
    必須: daily_rate_min
    daily_rate_max >= daily_rate_min (指定時)
  if contract_type == 'fixed_price':
    必須: fixed_price
  work_date_end >= work_date_start
  work_date_start >= today  // 過去日は不可

  // カスタム項目の必須チェック
  for def in custom_field_defs where target_type='demand' and is_required:
    custom_field_vals[def.field_key] must exist and not empty

// ■ 応募承認時（accept）
on_accept_application(application):
  1. match_contracts レコード作成
  2. demand_postings.confirmed_count += application.available_count
  3. if confirmed_count >= required_count:
       demand_postings.status = 'filled'
  4. project_assignments レコード作成（日付ごとに展開）
  5. worker_availability の各日を 'assigned' に更新
  6. 応募者に LINE 通知送信
  7. match_contracts.time_to_match_hours を計算
```

## 4-3. 人材公開（supply_postings）

### ステータス遷移ルール
```
draft ──→ open           : publish API
open ──→ suspended       : suspend API
suspended ──→ open       : publish API
open ──→ matched         : 成約確定時（全日程が埋まった場合）
open ──→ closed          : close API
open ──→ expired         : expires_at 超過時
draft/open ──→ cancelled : delete API
```

### バリデーションルール
```typescript
validate_publish(posting):
  必須: work_type_id, contract_type,
        available_start, available_end, available_prefecture
  if contract_type in ['daily_rate','either']:
    必須: desired_daily_rate
  available_end >= available_start
  available_start >= today
```

## 4-4. ジオフェンス判定ロジック

```typescript
// Haversine距離計算
function haversineDistance(lat1, lng1, lat2, lng2): number {
  const R = 6371000; // 地球の半径（m）
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = sin(dLat/2)² + cos(toRad(lat1)) * cos(toRad(lat2)) * sin(dLng/2)²;
  return R * 2 * atan2(sqrt(a), sqrt(1-a));
}

// ジオフェンス判定
async function checkGeofence(userId, lat, lng, projectId?):
  // 1. 対象プロジェクト特定
  projects = projectId
    ? [getProject(projectId)]
    : getTodayAssignedProjects(userId);

  for project in projects:
    distance = haversineDistance(lat, lng, project.site_lat, project.site_lng);
    isInside = distance <= project.geofence_radius_m;

    // 2. 前回の状態と比較してイベント検出
    lastEvent = getLastGeofenceEvent(userId, project.id);
    wasInside = lastEvent?.event_type === 'enter';

    if isInside && !wasInside:
      // 進入イベント
      createGeofenceEvent(userId, project.id, 'enter', lat, lng, distance);
      sendNotification(project.site_manager_id, '作業員が現場圏内に入りました');

    if !isInside && wasInside:
      // 退出イベント
      createGeofenceEvent(userId, project.id, 'exit', lat, lng, distance);

    return { isInside, distance, project, event };
```

## 4-5. マッチングスコアリング（候補推薦用）

```typescript
// 待機中人材のマッチングスコア算出
function calcMatchScore(worker, demandPosting): number {
  let score = 0;

  // 工種一致（最重要: 40点）
  if worker.skills.includes(demandPosting.work_type_id):
    score += 40;

  // エリア近接度（30点）
  distance = haversineDistance(worker.address_lat/lng, posting.site_lat/lng);
  if distance <= 10_000:  score += 30;      // 10km以内
  elif distance <= 30_000: score += 20;     // 30km以内
  elif distance <= 50_000: score += 10;     // 50km以内

  // スキルレベル（15点）
  levelMap = { beginner:1, intermediate:2, advanced:3, expert:4, master:5 };
  if levelMap[worker.skill_level] >= levelMap[posting.required_skill_level]:
    score += 15;

  // 評価（10点）
  score += worker.avg_rating * 2;           // 最大10点

  // リピート（5点）
  if worker が同じ会社の案件経験あり:
    score += 5;

  return score;
}
```

## 4-6. 原価自動積上げロジック

```typescript
// 日報承認 → 原価台帳への反映
async function syncCostLedger(report: DailyReport):
  const assignment = report.assignment;

  // 1. 労務費
  const laborAmount = report.man_days * assignment.daily_rate;
  await createCostLedgerEntry({
    project_id: report.project_id,
    cost_category: assignment.user.is_individual ? 'labor_external' : 'labor_internal',
    account_id: assignment.user.is_individual ? '5220' : '5210',  // 労務外注 or 自社労務
    amount: laborAmount,
    transaction_date: report.report_date,
    source_type: 'daily_report',
    source_id: report.id,
  });

  // 2. 日報原価明細
  for item of report.costItems:
    const accountMap = {
      material: '5100',    // 材料費
      equipment: '5410',   // 機械等経費
      transport: '5420',   // 運搬費
      other: '5490',       // その他経費
    };
    await createCostLedgerEntry({
      project_id: report.project_id,
      cost_category: item.cost_type,
      account_id: accountMap[item.cost_type],
      amount: item.amount,
      transaction_date: report.report_date,
      source_type: 'daily_report',
      source_id: report.id,
    });
```

## 4-7. 定期バッチ処理一覧

| バッチ名 | 実行タイミング | 処理内容 |
|---------|-------------|---------|
| expire_postings | 毎日 0:00 | 期限切れ募集/人材公開を `expired` に |
| update_staffing_counts | 毎日 6:00 | project_staffing.confirmed_count を再集計 |
| update_worker_stats | 毎日 2:00 | worker_profiles の集計値を更新 |
| license_expiry_alert | 毎日 8:00 | 30日以内に期限切れの資格を通知 |
| overdue_invoice_alert | 毎日 9:00 | 支払期限超過の請求書を通知 |
| idle_worker_alert | 毎週月曜 | 14日以上待機中の人材を通知 |
| unfiled_report_reminder | 毎日 20:00 | 当日の未提出日報をLINE通知 |

---

# 第5章: Claude Code Agent Teams 向け開発ガイド

## 5-1. 推奨エージェント分担

```
Agent 1: 「DB・インフラ担当」
  - PostgreSQL マイグレーション作成（上記DDL全テーブル）
  - TypeORM / Prisma Entity 定義
  - シードデータ投入スクリプト
  - Docker Compose（PostgreSQL + Redis）

Agent 2: 「API バックエンド担当」
  - NestJS プロジェクト初期化
  - 全モジュール・コントローラー・サービス実装
  - Guards（LINE認証・ロール）
  - DTO バリデーション
  - ビジネスロジック実装

Agent 3: 「LINE LIFF フロントエンド担当」
  - LIFF 初期化・認証フロー
  - 全画面のReactコンポーネント（上記ワイヤーフレーム準拠）
  - Geolocation API 連携
  - リッチメニュー設定JSON

Agent 4: 「テスト・品質担当」
  - E2Eテスト（日報フロー・マッチングフロー）
  - ユニットテスト（ビジネスロジック・バリデーション）
  - API インテグレーションテスト
```

## 5-2. 開発優先度（Phase分け）

```
Phase 1 — MVP（4週間）
  ☐ DB マイグレーション（全テーブル）
  ☐ 認証（LINE LIFF Login）
  ☐ ユーザー・会社 CRUD
  ☐ 案件 CRUD
  ☐ 日報（2モード: まとめ + リアルタイム）
  ☐ LINE リッチメニュー + 基本画面

Phase 2 — 位置情報 + マッチング基盤（3週間）
  ☐ GPS記録（出退勤時）
  ☐ ジオフェンス判定
  ☐ 募集（Demand）CRUD + 公開/検索
  ☐ 応募フロー + 成約
  ☐ 過不足ダッシュボード

Phase 3 — マッチング拡張 + カスタム項目（3週間）
  ☐ 人材公開（Supply）CRUD + 問合せ
  ☐ カスタムフィールド（定義 + 値）
  ☐ マッチングスコアリング
  ☐ メッセージ機能
  ☐ レビュー機能

Phase 4 — 会計 + レポート（3週間）
  ☐ 請求書発行・入金管理
  ☐ 支払管理（源泉徴収対応）
  ☐ 原価台帳（自動積上げ）
  ☐ ダッシュボード（稼働/売上/KPI/アラート）

Phase 5 — 品質向上（2週間）
  ☐ バッチ処理実装
  ☐ LINE通知最適化
  ☐ テスト網羅
  ☐ パフォーマンスチューニング
```

## 5-3. 環境変数テンプレート

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/construction_matching
DATABASE_SSL=false

# LINE
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
LINE_LIFF_ID=your_liff_id
LINE_BOT_CHANNEL_TOKEN=your_bot_token

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d

# Google Maps (ジオコーディング)
GOOGLE_MAPS_API_KEY=your_api_key

# Storage (写真・書類)
S3_BUCKET=construction-matching-files
S3_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# Redis (キャッシュ・ジョブキュー)
REDIS_URL=redis://localhost:6379

# App
APP_PORT=3000
APP_ENV=development
```
