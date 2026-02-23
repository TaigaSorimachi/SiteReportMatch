-- ============================================================================
-- 建築業界向け 人材マッチング管理システム — 統合DB設計書 v2.0
-- ============================================================================
-- 技術スタック : PostgreSQL 15+ / NestJS / LINE LIFF / React Native
-- 方針        : シングルテナント / 論理削除 / snake_case / 日本語コメント必須
-- 対象業種    : 建築業全般（躯体・仕上げ・設備・電気等）左官に限定しない
-- ============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- テーブル一覧（全42テーブル + 5ビュー）
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--
-- ■ A. 組織・ユーザー基盤（5）
--   A-01 companies            会社マスタ
--   A-02 company_settings     会社別システム設定
--   A-03 users                ユーザー（全ロール統合）
--   A-04 user_licenses        保有資格
--   A-05 license_master       資格マスタ
--
-- ■ B. 人材管理（4）
--   B-01 worker_profiles      職人プロフィール
--   B-02 worker_skills        対応可能工種（N:M）
--   B-03 worker_evaluations   現場評価履歴
--   B-04 worker_availability  稼働カレンダー
--
-- ■ C. 案件管理（5）
--   C-01 projects             案件マスタ
--   C-02 project_phases       工程（フェーズ）
--   C-03 project_staffing     人員計画（工種×日）
--   C-04 project_assignments  配置確定
--   C-05 project_documents    案件書類
--
-- ■ D. 日報・勤怠（5）
--   D-01 daily_reports        日報
--   D-02 report_cost_items    日報原価明細
--   D-03 report_photos        日報写真
--   D-04 safety_records       安全KY記録
--   D-05 break_logs           休憩ログ
--
-- ■ E. 位置情報（2）
--   E-01 location_logs        位置情報ログ
--   E-02 geofence_events      ジオフェンスイベント
--
-- ■ F. マッチング — 募集（Demand）（3）
--   F-01 demand_postings      募集票（案件→人材を探す）
--   F-02 demand_applications  募集への応答
--   F-03 demand_messages      募集メッセージ
--
-- ■ G. マッチング — 応募/提案（Supply）（3）
--   G-01 supply_postings      人材公開票（人材→案件を探す）
--   G-02 supply_inquiries     人材への問合せ
--   G-03 supply_messages      人材公開メッセージ
--
-- ■ H. マッチング共通（3）
--   H-01 match_contracts      成約（募集/応募どちらからでも成約）
--   H-02 match_reviews        双方向レビュー
--   H-03 match_cancel_logs    キャンセルログ
--
-- ■ I. カスタムフィールド（2）
--   I-01 custom_field_defs    カスタム項目定義
--   I-02 custom_field_vals    カスタム項目値
--
-- ■ J. 会計・請求（6）
--   J-01 invoices             請求書
--   J-02 invoice_lines        請求明細
--   J-03 payments_received    入金記録
--   J-04 payroll              職人支払
--   J-05 payroll_lines        支払明細
--   J-06 cost_ledger          原価台帳
--
-- ■ K. マスタ・共通（4）
--   K-01 work_type_master     工種マスタ
--   K-02 structure_master     構造マスタ
--   K-03 account_master       勘定科目マスタ
--   K-04 notification_logs    通知ログ
--
-- ■ V. ビュー（5）
--   V-01 v_daily_staffing     日別人員充足状況
--   V-02 v_available_workers  待機中人材
--   V-03 v_project_profit     案件収支サマリー
--   V-04 v_matching_kpi       マッチングKPI
--   V-05 v_overdue_alerts     アラート一覧
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


-- **************************************************************************
-- 共通: 論理削除カラムテンプレート
-- 全テーブルに以下を付与（以降のDDLでは省略せず明記）
--   is_deleted   BOOLEAN DEFAULT false
--   deleted_at   TIMESTAMPTZ
--   deleted_by   UUID REFERENCES users(id)
-- **************************************************************************


-- ##########################################################################
-- A. 組織・ユーザー基盤
-- ##########################################################################

-- A-01 ─────────────────────────────────────────────────────────────────────
CREATE TABLE companies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name      VARCHAR(200) NOT NULL,          -- 会社名
  company_name_kana VARCHAR(200),                   -- 会社名カナ
  company_type      VARCHAR(30) NOT NULL,           -- own/client/partner/subcontractor
  corporate_number  VARCHAR(13) UNIQUE,             -- 法人番号
  representative    VARCHAR(100),                   -- 代表者名
  postal_code       VARCHAR(8),                     -- 郵便番号
  address           VARCHAR(300),                   -- 住所
  address_lat       DECIMAL(10,7),                  -- 本社緯度
  address_lng       DECIMAL(10,7),                  -- 本社経度
  phone             VARCHAR(20),
  fax               VARCHAR(20),
  email             VARCHAR(200),
  website           VARCHAR(300),
  invoice_reg_no    VARCHAR(20),                    -- インボイス登録番号 T+13桁
  ccus_company_id   VARCHAR(30),                    -- CCUS事業者ID

  -- 口座情報
  bank_name         VARCHAR(100),
  bank_branch       VARCHAR(100),
  bank_account_type VARCHAR(10),                    -- ordinary/current
  bank_account_no   VARCHAR(20),
  bank_account_name VARCHAR(100),
  payment_terms     VARCHAR(100),                   -- 支払条件テキスト

  notes             TEXT,
  is_active         BOOLEAN DEFAULT true,

  -- 論理削除
  is_deleted        BOOLEAN DEFAULT false,
  deleted_at        TIMESTAMPTZ,
  deleted_by        UUID,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE companies IS '会社マスタ — 自社/元請/協力会社/下請を統合管理';


-- A-02 ─────────────────────────────────────────────────────────────────────
CREATE TABLE company_settings (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id                 UUID UNIQUE NOT NULL REFERENCES companies(id),

  -- 日報設定
  default_report_mode        VARCHAR(20) DEFAULT 'selectable',
  allow_worker_mode_switch   BOOLEAN DEFAULT true,
  require_photo              BOOLEAN DEFAULT false,
  require_safety_record      BOOLEAN DEFAULT false,

  -- GPS設定
  gps_enabled                BOOLEAN DEFAULT false,
  gps_worker_can_disable     BOOLEAN DEFAULT false,
  geofence_enabled           BOOLEAN DEFAULT false,
  geofence_radius_m          INT DEFAULT 300,

  -- マッチング設定
  matching_enabled           BOOLEAN DEFAULT true,
  matching_auto_approve      BOOLEAN DEFAULT false,

  -- 人工計算
  standard_work_hours        DECIMAL(3,1) DEFAULT 8.0,
  overtime_threshold_hours   DECIMAL(3,1) DEFAULT 8.0,

  -- 拡張（将来の設定追加用）
  extra                      JSONB DEFAULT '{}',

  created_at                 TIMESTAMPTZ DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE company_settings IS '会社別システム設定 — 日報/GPS/マッチング動作制御';


-- A-03 ─────────────────────────────────────────────────────────────────────
-- 設計判断: 旧システムは職人テーブルと管理者テーブルが分離していた。
-- LINE連携を前提にユーザーID体系を統一し role で権限分離する方が
-- API設計・認証フローともにシンプルになるため統合。
--
-- ■ ロール定義（3ロール）:
--   admin  : 管理者（開発者）。全マスタ情報の編集・追加、管理画面へのログインが可能。
--            オーナーアカウントと会社情報の払い出しを行う。
--   owner  : オーナー。自社の情報を編集・閲覧可能。案件や人材の情報を登録し、
--            マッチング機能（募集・応募の登録・公開）を使用できる。
--            オーナーアカウントと会社は 1:1 の関係。
--   worker : 作業者。日報の登録と履歴の確認が可能。マッチング機能は利用しない。
--
CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID REFERENCES companies(id),

  -- LINE連携
  line_user_id        VARCHAR(50) UNIQUE,
  line_display_name   VARCHAR(100),

  -- 基本情報
  last_name           VARCHAR(50) NOT NULL,
  first_name          VARCHAR(50) NOT NULL,
  last_name_kana      VARCHAR(50),
  first_name_kana     VARCHAR(50),
  email               VARCHAR(200),
  phone               VARCHAR(20),
  birth_date          DATE,
  gender              VARCHAR(10),                  -- male/female/other
  avatar_url          VARCHAR(500),

  -- 住所（通勤可否判定用）
  postal_code         VARCHAR(8),
  address             VARCHAR(300),
  address_lat         DECIMAL(10,7),
  address_lng         DECIMAL(10,7),

  -- ロール・権限
  role                VARCHAR(30) NOT NULL,         -- admin/owner/worker
  is_individual       BOOLEAN DEFAULT false,        -- 一人親方フラグ

  -- 単価デフォルト
  default_daily_rate  INT,
  default_hourly_rate INT,

  -- ステータス
  employment_status   VARCHAR(20) DEFAULT 'active', -- active/inactive/suspended
  availability        VARCHAR(20) DEFAULT 'available',
    -- working/available/vacation/unavailable

  -- CCUS
  ccus_worker_id      VARCHAR(30),                  -- CCUS技能者ID

  -- 税区分
  tax_category        VARCHAR(20),                  -- employee/freelance
  my_number_stored    BOOLEAN DEFAULT false,

  -- 通知設定
  line_notify_enabled BOOLEAN DEFAULT true,
  gps_personal_enabled BOOLEAN DEFAULT true,

  is_active           BOOLEAN DEFAULT true,
  last_login_at       TIMESTAMPTZ,

  -- 論理削除
  is_deleted          BOOLEAN DEFAULT false,
  deleted_at          TIMESTAMPTZ,
  deleted_by          UUID,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE users IS 'ユーザー — admin(管理者)/owner(オーナー)/worker(作業者)の3ロール。LINE連携前提';

-- オーナーと会社は1:1制約
CREATE UNIQUE INDEX idx_users_owner_company ON users(company_id)
  WHERE role = 'owner' AND NOT is_deleted;

CREATE INDEX idx_users_company ON users(company_id) WHERE NOT is_deleted;
CREATE INDEX idx_users_avail   ON users(availability) WHERE NOT is_deleted;
CREATE INDEX idx_users_line    ON users(line_user_id);


-- A-04 ─────────────────────────────────────────────────────────────────────
CREATE TABLE license_master (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_name      VARCHAR(200) NOT NULL,
  license_category  VARCHAR(50),                    -- national/skill/special/safety
  has_expiry        BOOLEAN DEFAULT false,
  renewal_months    INT,
  sort_order        INT DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE license_master IS '資格マスタ — 国家/技能/特別教育/安全衛生';

CREATE TABLE user_licenses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  license_id        UUID NOT NULL REFERENCES license_master(id),
  license_number    VARCHAR(50),
  issued_date       DATE,
  expiry_date       DATE,                           -- NULL=無期限
  issuing_authority VARCHAR(200),
  document_url      VARCHAR(500),
  is_verified       BOOLEAN DEFAULT false,
  is_deleted        BOOLEAN DEFAULT false,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, license_id)
);
COMMENT ON TABLE user_licenses IS '保有資格 — 有効期限管理で法令遵守';


-- ##########################################################################
-- B. 人材管理
-- ##########################################################################

-- B-01 ─────────────────────────────────────────────────────────────────────
CREATE TABLE worker_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 経験
  experience_years  INT,
  skill_level       VARCHAR(20),                    -- beginner/intermediate/advanced/expert/master
  specialties       TEXT,
  career_summary    TEXT,

  -- 稼働条件
  preferred_area    VARCHAR(300),
  max_commute_km    INT DEFAULT 50,
  has_vehicle       BOOLEAN DEFAULT false,
  has_own_tools     BOOLEAN DEFAULT false,
  can_drive_truck   BOOLEAN DEFAULT false,
  available_hours   VARCHAR(50),                    -- 稼働可能時間帯（例: "08:00-17:00"）

  -- 希望単価
  desired_daily_min INT,
  desired_daily_max INT,
  desired_monthly   INT,                            -- 月額希望（SES風）

  -- 実績集計（バッチ更新）
  total_projects    INT DEFAULT 0,
  total_work_days   INT DEFAULT 0,
  avg_rating        DECIMAL(2,1) DEFAULT 0.0,
  attendance_rate   DECIMAL(4,1) DEFAULT 100.0,
  repeat_rate       DECIMAL(4,1) DEFAULT 0.0,
  cancel_count      INT DEFAULT 0,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE worker_profiles IS '職人プロフィール — SESスキルシートに相当する詳細情報';


-- B-02 ─────────────────────────────────────────────────────────────────────
CREATE TABLE work_type_master (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id         UUID REFERENCES work_type_master(id),  -- 大分類→小分類の階層
  work_type_name    VARCHAR(100) NOT NULL,
  category          VARCHAR(50),                    -- structural/finishing/equipment/electrical/civil
  level             INT DEFAULT 1,                  -- 1=大分類 / 2=小分類
  sort_order        INT DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE work_type_master IS '工種マスタ — 大分類→小分類の2階層。業種横断で使用';

-- 初期データ
INSERT INTO work_type_master (id, work_type_name, category, level, sort_order) VALUES
  (gen_random_uuid(), '左官工事',   'finishing',    1, 10),
  (gen_random_uuid(), '塗装工事',   'finishing',    1, 20),
  (gen_random_uuid(), 'タイル工事', 'finishing',    1, 30),
  (gen_random_uuid(), '防水工事',   'finishing',    1, 40),
  (gen_random_uuid(), '内装仕上げ', 'finishing',    1, 50),
  (gen_random_uuid(), '基礎工事',   'structural',   1, 60),
  (gen_random_uuid(), '型枠工事',   'structural',   1, 70),
  (gen_random_uuid(), '鉄筋工事',   'structural',   1, 80),
  (gen_random_uuid(), 'とび工事',   'structural',   1, 90),
  (gen_random_uuid(), '電気工事',   'electrical',   1, 100),
  (gen_random_uuid(), '管工事',     'equipment',    1, 110),
  (gen_random_uuid(), '空調設備',   'equipment',    1, 120),
  (gen_random_uuid(), '土木工事',   'civil',        1, 130),
  (gen_random_uuid(), '解体工事',   'civil',        1, 140);

CREATE TABLE worker_skills (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  work_type_id      UUID NOT NULL REFERENCES work_type_master(id),
  proficiency       VARCHAR(20) DEFAULT 'capable',
  years_experience  INT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, work_type_id)
);
COMMENT ON TABLE worker_skills IS '対応可能工種 — 職人×工種 N:M';


-- B-03 ─────────────────────────────────────────────────────────────────────
CREATE TABLE worker_evaluations (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id              UUID NOT NULL REFERENCES users(id),
  evaluator_id           UUID NOT NULL REFERENCES users(id),
  project_id             UUID NOT NULL REFERENCES projects(id),
  evaluation_date        DATE NOT NULL,
  rating_skill           INT CHECK (rating_skill BETWEEN 1 AND 5),
  rating_speed           INT CHECK (rating_speed BETWEEN 1 AND 5),
  rating_attitude        INT CHECK (rating_attitude BETWEEN 1 AND 5),
  rating_safety          INT CHECK (rating_safety BETWEEN 1 AND 5),
  rating_communication   INT CHECK (rating_communication BETWEEN 1 AND 5),
  rating_overall         DECIMAL(2,1),
  comment                TEXT,
  is_public              BOOLEAN DEFAULT false,
  created_at             TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE worker_evaluations IS '現場評価 — 5軸。旧システムの総合5段階から多角化';


-- B-04 ─────────────────────────────────────────────────────────────────────
-- 設計判断: 「待機中人材をワンアクションで候補投入」の実現基盤。
-- status='available' のレコードを一括取得→マッチング候補画面に表示。
CREATE TABLE worker_availability (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_date       DATE NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'available',
    -- available / assigned / requested / vacation / unavailable
  project_id        UUID REFERENCES projects(id),
  notes             VARCHAR(200),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_date)
);
COMMENT ON TABLE worker_availability IS '稼働カレンダー — 日別空き状況。ワンアクション候補投入の基盤';

CREATE INDEX idx_avail_date ON worker_availability(target_date, status);


-- ##########################################################################
-- C. 案件管理
-- ##########################################################################

-- C-01 ─────────────────────────────────────────────────────────────────────
CREATE TABLE structure_master (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_name    VARCHAR(50) NOT NULL,            -- RC造/S造/SRC造/木造/その他
  sort_order        INT DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE structure_master IS '構造マスタ — 旧 m_structures を独立テーブル化';

INSERT INTO structure_master (id, structure_name, sort_order) VALUES
  (gen_random_uuid(), 'RC造',   10),
  (gen_random_uuid(), 'S造',    20),
  (gen_random_uuid(), 'SRC造',  30),
  (gen_random_uuid(), '木造',   40),
  (gen_random_uuid(), 'その他', 90);

CREATE TABLE projects (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id),
  project_code        VARCHAR(50) UNIQUE,

  -- 基本情報
  project_name        VARCHAR(300) NOT NULL,
  description         TEXT,

  -- 元請・下請構造
  client_company_id   UUID REFERENCES companies(id),
  prime_contractor_id UUID REFERENCES companies(id),
  contract_tier       INT DEFAULT 1,                -- 1=元請/2=1次下請/3=2次下請...
    -- 旧 subcontracting_division を整数化

  -- 工種
  primary_work_type_id UUID REFERENCES work_type_master(id),

  -- 物件情報
  structure_id        UUID REFERENCES structure_master(id),
  floor_count         INT,                          -- 階数（旧 floor）
  property_type       VARCHAR(50),                  -- マンション/ビル/戸建/公共施設/商業施設 等

  -- 現場情報
  site_name           VARCHAR(200),
  site_postal_code    VARCHAR(8),
  site_prefecture     VARCHAR(10),                  -- 都道府県（旧 prefectures を分離）
  site_city           VARCHAR(50),                  -- 市区町村（旧 city）
  site_address        VARCHAR(300),                 -- 以降の住所（旧 address）
  site_lat            DECIMAL(10,7),
  site_lng            DECIMAL(10,7),
  geofence_radius_m   INT DEFAULT 300,

  -- 工期
  scheduled_start     DATE,
  scheduled_end       DATE,
  actual_start        DATE,
  actual_end          DATE,

  -- 金額
  contract_amount     BIGINT,                       -- 契約金額（税抜）
  estimated_cost      BIGINT,
  tax_rate            DECIMAL(4,2) DEFAULT 10.00,

  -- 安全・CCUS
  safety_doc_system   VARCHAR(100),                 -- 安全書類提出システム名（旧 sds_system）
  ccus_required       BOOLEAN DEFAULT false,        -- CCUS必須か（旧 ccus）

  -- 担当者
  sales_person_id     UUID REFERENCES users(id),
  site_manager_id     UUID REFERENCES users(id),
  foreman_id          UUID REFERENCES users(id),

  -- ステータス
  status              VARCHAR(20) DEFAULT 'planning',
    -- planning/estimating/ordered/in_progress/completed/closed/cancelled/lost

  notes               TEXT,
  is_deleted          BOOLEAN DEFAULT false,
  deleted_at          TIMESTAMPTZ,
  deleted_by          UUID,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE projects IS '案件マスタ — 旧t_tasksの現場情報部分を正規化・汎用化';

CREATE INDEX idx_proj_status ON projects(status) WHERE NOT is_deleted;
CREATE INDEX idx_proj_dates  ON projects(scheduled_start, scheduled_end);


-- C-02〜C-05（前回v1と同一構造のため簡略表記）─────────────────────────────
CREATE TABLE project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_name VARCHAR(200) NOT NULL,
  work_type_id UUID REFERENCES work_type_master(id),
  sort_order INT DEFAULT 0,
  scheduled_start DATE, scheduled_end DATE,
  actual_start DATE, actual_end DATE,
  progress_pct DECIMAL(5,2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_staffing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  work_type_id UUID REFERENCES work_type_master(id),
  target_date DATE NOT NULL,
  required_count INT NOT NULL DEFAULT 1,
  confirmed_count INT DEFAULT 0,
  notes VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, work_type_id, target_date)
);

CREATE TABLE project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  user_id UUID NOT NULL REFERENCES users(id),
  target_date DATE NOT NULL,
  work_type_id UUID REFERENCES work_type_master(id),
  contract_type VARCHAR(20) NOT NULL,               -- daily_rate/fixed_price
  daily_rate INT,
  hourly_rate INT,
  source VARCHAR(20) DEFAULT 'direct',              -- direct/matching
  demand_posting_id UUID REFERENCES demand_postings(id),
  supply_posting_id UUID REFERENCES supply_postings(id),
  contract_id UUID REFERENCES match_contracts(id),
  status VARCHAR(20) DEFAULT 'confirmed',
    -- tentative/confirmed/cancelled/completed
  cancelled_at TIMESTAMPTZ, cancel_reason VARCHAR(200),
  is_deleted BOOLEAN DEFAULT false, deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_date)
);

CREATE TABLE project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  doc_type VARCHAR(30),
  doc_name VARCHAR(300) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size_bytes BIGINT,
  uploaded_by UUID REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT false, deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ##########################################################################
-- D. 日報・勤怠（前回v1と同一のため構造のみ）
-- ##########################################################################

CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  assignment_id UUID REFERENCES project_assignments(id),
  worker_id UUID NOT NULL REFERENCES users(id),
  report_date DATE NOT NULL,
  input_mode VARCHAR(20) NOT NULL,                  -- batch/realtime

  clock_in TIMESTAMPTZ, clock_out TIMESTAMPTZ,
  break_minutes INT DEFAULT 0,
  work_minutes INT,
  man_days DECIMAL(4,2),
  overtime_minutes INT DEFAULT 0,

  clock_in_lat DECIMAL(10,7), clock_in_lng DECIMAL(10,7),
  clock_out_lat DECIMAL(10,7), clock_out_lng DECIMAL(10,7),

  work_content TEXT,
  progress_pct DECIMAL(5,2),
  weather VARCHAR(20),
  temperature DECIMAL(3,1),

  status VARCHAR(20) DEFAULT 'draft',
    -- in_progress/draft/submitted/approved/rejected
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,

  is_deleted BOOLEAN DEFAULT false, deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, report_date, project_id)
);
CREATE INDEX idx_rpt_date ON daily_reports(report_date) WHERE NOT is_deleted;

CREATE TABLE report_cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  cost_type VARCHAR(20) NOT NULL,
  item_name VARCHAR(200) NOT NULL,
  quantity DECIMAL(10,2), unit VARCHAR(20),
  unit_price DECIMAL(12,2), amount DECIMAL(12,2),
  notes VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE report_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  photo_url VARCHAR(500) NOT NULL,
  photo_type VARCHAR(20), caption VARCHAR(200),
  taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE safety_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES daily_reports(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  recorded_by UUID NOT NULL REFERENCES users(id),
  record_date DATE NOT NULL,
  hazard_identified TEXT NOT NULL,
  countermeasure TEXT NOT NULL,
  safety_officer VARCHAR(100),
  participants UUID[],
  participant_count INT,
  is_confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE break_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  break_start TIMESTAMPTZ NOT NULL,
  break_end TIMESTAMPTZ,
  break_minutes INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ##########################################################################
-- E. 位置情報
-- ##########################################################################

CREATE TABLE location_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  event_type VARCHAR(20) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  accuracy_m DECIMAL(6,1),
  project_id UUID REFERENCES projects(id),
  report_id UUID REFERENCES daily_reports(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_loc_user ON location_logs(user_id, recorded_at);

CREATE TABLE geofence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  event_type VARCHAR(10) NOT NULL,                  -- enter/exit
  event_at TIMESTAMPTZ NOT NULL,
  latitude DECIMAL(10,7), longitude DECIMAL(10,7),
  accuracy_m DECIMAL(6,1),
  distance_m DECIMAL(8,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_geo_proj ON geofence_events(project_id, event_at);


-- ##########################################################################
-- F. マッチング — 募集（Demand: 案件→人材を探す）
-- ##########################################################################

-- F-01 ─────────────────────────────────────────────────────────────────────
-- 設計判断:
-- 旧 t_tasks は task_type=1(募集)/2(応募) を1テーブルに混在させていた。
-- → Demand（募集）と Supply（応募/人材公開）を完全分離。
--   理由: 必須項目が異なる / 検索条件が異なる / 参照整合性が明確になる。
--
-- 必須項目の根拠:
--   site_name       → マッチング検索・一覧表示の基本情報
--   site_prefecture → エリア検索の最低粒度
--   site_city       → 通勤可否判定に必須
--   contract_type   → 単価/請負で入力項目と金額計算が変わる
--   work_type_id    → 工種マッチングの基本軸
--   work_date_start → 日程マッチングの基本
--   work_date_end   → 同上
--   required_count  → 過不足判定に必須
--   daily_rate_min or fixed_price → 金額条件なしでは応募判断不可
CREATE TABLE demand_postings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id),
  project_id          UUID REFERENCES projects(id),
  posted_by           UUID NOT NULL REFERENCES users(id),

  -- ■ 必須項目（システム固定・削除不可）─────────────
  site_name           VARCHAR(300) NOT NULL,         -- 現場名称
  site_prefecture     VARCHAR(10) NOT NULL,          -- 都道府県
  site_city           VARCHAR(50) NOT NULL,          -- 市区町村
  site_address        VARCHAR(300),                  -- 以降住所
  site_lat            DECIMAL(10,7),
  site_lng            DECIMAL(10,7),

  contract_type       VARCHAR(20) NOT NULL,          -- daily_rate=常用単価 / fixed_price=請負
  work_type_id        UUID NOT NULL REFERENCES work_type_master(id),  -- 工種（大分類）
  work_type_sub_id    UUID REFERENCES work_type_master(id),           -- 工種（小分類）

  work_date_start     DATE NOT NULL,                 -- 作業開始日
  work_date_end       DATE NOT NULL,                 -- 作業終了日
  required_count      INT NOT NULL DEFAULT 1,        -- 必要人数

  -- 単価案件（contract_type='daily_rate'時に必須）
  daily_rate_min      INT,                           -- 日当下限
  daily_rate_max      INT,                           -- 日当上限

  -- 請負案件（contract_type='fixed_price'時に必須）
  fixed_price         BIGINT,                        -- 請負金額
  fixed_scope         TEXT,                          -- 請負範囲

  -- ステータス（必須）
  status              VARCHAR(20) NOT NULL DEFAULT 'draft',
    -- ステータス遷移（後述の遷移図参照）:
    -- draft → open → filled / closed / expired
    --              → suspended（一時停止）→ open
    --       → cancelled

  -- ■ 任意項目（デフォルト表示、管理者が非表示設定可）───
  structure_id        UUID REFERENCES structure_master(id),  -- 構造（RC/S造等）
  floor_count         INT,                           -- 階数
  prime_contractor    VARCHAR(200),                  -- 元請業者名
  contract_tier       INT,                           -- 下請次数
  work_time_start     TIME,                          -- 集合時間
  work_time_end       TIME,                          -- 想定終了時間

  transportation_type VARCHAR(20),                   -- provided=支給/none=なし/conditional=条件付
  transportation_note VARCHAR(200),                  -- 交通費条件詳細

  safety_doc_system   VARCHAR(100),                  -- 安全書類提出システム
  ccus_required       BOOLEAN DEFAULT false,         -- CCUS必須

  required_skill_level VARCHAR(20),                  -- beginner/intermediate/advanced/expert
  required_licenses   UUID[],                        -- 必要資格ID配列

  provides_parking    BOOLEAN DEFAULT false,
  provides_tools      BOOLEAN DEFAULT false,
  provides_meals      BOOLEAN DEFAULT false,

  description         TEXT,                          -- 募集詳細説明
  notes               TEXT,                          -- 特記事項（旧 memo）

  -- ■ 管理カラム ───────────────────────────────────
  confirmed_count     INT DEFAULT 0,                 -- 確定済み人数
  published_at        TIMESTAMPTZ,                   -- 公開日時
  expires_at          TIMESTAMPTZ,                   -- 募集期限
  view_count          INT DEFAULT 0,                 -- 閲覧数
  application_count   INT DEFAULT 0,                 -- 応募数

  is_deleted          BOOLEAN DEFAULT false,
  deleted_at          TIMESTAMPTZ,
  deleted_by          UUID,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE demand_postings IS '募集票（Demand）— SESの案件票に相当。旧t_tasks(type=1)を正規化・拡張';

CREATE INDEX idx_demand_status ON demand_postings(status, work_date_start) WHERE NOT is_deleted;
CREATE INDEX idx_demand_area   ON demand_postings(site_prefecture, site_city) WHERE NOT is_deleted;
CREATE INDEX idx_demand_type   ON demand_postings(contract_type, work_type_id) WHERE NOT is_deleted;


-- F-02 ─────────────────────────────────────────────────────────────────────
CREATE TABLE demand_applications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posting_id          UUID NOT NULL REFERENCES demand_postings(id),
  applicant_id        UUID NOT NULL REFERENCES users(id),
  applicant_company_id UUID REFERENCES companies(id),
  applicant_type      VARCHAR(20) NOT NULL,          -- individual/company

  proposed_rate       INT,                           -- 希望日当
  proposed_price      BIGINT,                        -- 希望請負金額
  available_count     INT DEFAULT 1,                 -- 出せる人数
  available_dates     DATE[],                        -- 対応可能日（部分対応用）
  message             TEXT,

  status              VARCHAR(20) DEFAULT 'pending',
    -- pending → accepted / rejected / withdrawn / expired
  responded_at        TIMESTAMPTZ,
  responded_by        UUID REFERENCES users(id),
  rejection_reason    VARCHAR(300),

  is_deleted          BOOLEAN DEFAULT false,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE demand_applications IS '募集への応答 — 人材側からの「この現場行けます」';

CREATE INDEX idx_dapp_posting ON demand_applications(posting_id, status);


-- F-03 ─────────────────────────────────────────────────────────────────────
CREATE TABLE demand_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posting_id UUID NOT NULL REFERENCES demand_postings(id),
  application_id UUID REFERENCES demand_applications(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ##########################################################################
-- G. マッチング — 応募/人材公開（Supply: 人材→案件を探す）
-- ##########################################################################

-- G-01 ─────────────────────────────────────────────────────────────────────
-- 設計判断:
-- SES業界の「要員提案書」に相当。
-- 「うちにこういう人材がいるので使いませんか？」と公開する側。
-- 旧 t_tasks の task_type=2 に相当するが、完全に別テーブルに分離。
--
-- 必須項目の根拠:
--   company_name or user → 誰が提案しているかの特定
--   work_type_id        → 工種マッチングの基本
--   desired_daily_rate  → 金額条件なしではマッチング不成立
--   available_start/end → 時期が合わなければマッチング不可
--   available_area      → エリア制約の基本
CREATE TABLE supply_postings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID REFERENCES companies(id),  -- 会社提案の場合
  user_id             UUID NOT NULL REFERENCES users(id),  -- 提案者 or 本人
  is_self_posting     BOOLEAN DEFAULT true,          -- 本人公開 or 会社が代理公開

  -- ■ 必須項目 ───────────────────────────────────
  work_type_id        UUID NOT NULL REFERENCES work_type_master(id),
  work_type_sub_id    UUID REFERENCES work_type_master(id),

  -- 単価
  contract_type       VARCHAR(20) NOT NULL,          -- daily_rate/fixed_price/either
  desired_daily_rate  INT,                           -- 希望日当
  desired_monthly_rate INT,                          -- 希望月額

  -- 期間
  available_start     DATE NOT NULL,
  available_end       DATE NOT NULL,
  available_hours     VARCHAR(50),                   -- 稼働可能時間帯

  -- エリア
  available_prefecture VARCHAR(10) NOT NULL,         -- 対応可能都道府県
  available_area      VARCHAR(200),                  -- 詳細エリア

  -- ステータス
  status              VARCHAR(20) NOT NULL DEFAULT 'draft',
    -- draft → open → matched / closed / expired
    --              → suspended → open
    --       → cancelled

  -- ■ 任意項目 ───────────────────────────────────
  skill_level         VARCHAR(20),
  experience_years    INT,
  licenses            UUID[],                        -- 保有資格ID配列
  portfolio_text      TEXT,                          -- 実績・ポートフォリオ
  ccus_worker_id      VARCHAR(30),
  has_vehicle         BOOLEAN,
  has_own_tools       BOOLEAN,
  transportation_type VARCHAR(20),                   -- 交通手段

  title               VARCHAR(300),                  -- 見出し
  description         TEXT,                          -- 詳細PR
  notes               TEXT,

  -- ■ 管理カラム ──────────────────────────────────
  published_at        TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ,
  view_count          INT DEFAULT 0,
  inquiry_count       INT DEFAULT 0,

  is_deleted          BOOLEAN DEFAULT false,
  deleted_at          TIMESTAMPTZ,
  deleted_by          UUID,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE supply_postings IS '人材公開票（Supply）— SESの要員提案書に相当。旧t_tasks(type=2)を分離';

CREATE INDEX idx_supply_status ON supply_postings(status, available_start) WHERE NOT is_deleted;
CREATE INDEX idx_supply_area   ON supply_postings(available_prefecture) WHERE NOT is_deleted;


-- G-02 ─────────────────────────────────────────────────────────────────────
CREATE TABLE supply_inquiries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_posting_id   UUID NOT NULL REFERENCES supply_postings(id),
  inquirer_id         UUID NOT NULL REFERENCES users(id),
  inquirer_company_id UUID REFERENCES companies(id),

  project_id          UUID REFERENCES projects(id),  -- この案件に来てほしい
  proposed_rate       INT,                           -- 提示日当
  proposed_period     VARCHAR(100),                  -- 提示期間
  message             TEXT,

  status              VARCHAR(20) DEFAULT 'pending',
    -- pending / accepted / rejected / withdrawn
  responded_at        TIMESTAMPTZ,

  is_deleted          BOOLEAN DEFAULT false,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE supply_inquiries IS '人材への問合せ — 案件側から「うちの現場に来ませんか？」';

CREATE TABLE supply_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_posting_id UUID NOT NULL REFERENCES supply_postings(id),
  inquiry_id UUID REFERENCES supply_inquiries(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ##########################################################################
-- H. マッチング共通
-- ##########################################################################

-- H-01 ─────────────────────────────────────────────────────────────────────
-- 設計判断: 募集経由でも人材公開経由でも、最終的に「成約」に至ったら
-- このテーブルにレコードが作成される。SESの「契約書」に相当。
CREATE TABLE match_contracts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 成約元（どちらか一方がNOT NULL）
  demand_posting_id   UUID REFERENCES demand_postings(id),
  demand_app_id       UUID REFERENCES demand_applications(id),
  supply_posting_id   UUID REFERENCES supply_postings(id),
  supply_inquiry_id   UUID REFERENCES supply_inquiries(id),

  -- 当事者
  client_company_id   UUID NOT NULL REFERENCES companies(id),  -- 発注側
  worker_user_id      UUID NOT NULL REFERENCES users(id),       -- 受注側（職人）
  worker_company_id   UUID REFERENCES companies(id),            -- 受注側（会社）

  project_id          UUID REFERENCES projects(id),

  -- 契約内容
  contract_type       VARCHAR(20) NOT NULL,          -- daily_rate/fixed_price
  agreed_daily_rate   INT,
  agreed_fixed_price  BIGINT,
  work_date_start     DATE NOT NULL,
  work_date_end       DATE NOT NULL,
  agreed_count        INT DEFAULT 1,

  -- ステータス
  status              VARCHAR(20) DEFAULT 'active',
    -- active / completed / cancelled
  completed_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  cancel_reason       VARCHAR(300),

  -- KPI計測用
  matched_at          TIMESTAMPTZ DEFAULT NOW(),     -- 成約日時
  time_to_match_hours DECIMAL(8,1),                  -- 募集公開→成約までの時間

  is_deleted          BOOLEAN DEFAULT false,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE match_contracts IS '成約 — Demand/Supply両方の成約を統一管理。SESの契約書相当';


-- H-02 ─────────────────────────────────────────────────────────────────────
CREATE TABLE match_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES match_contracts(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id),
  review_type VARCHAR(20) NOT NULL,                  -- client_to_worker / worker_to_client
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- H-03 ─────────────────────────────────────────────────────────────────────
CREATE TABLE match_cancel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES match_contracts(id),
  demand_posting_id UUID REFERENCES demand_postings(id),
  supply_posting_id UUID REFERENCES supply_postings(id),
  cancelled_by UUID NOT NULL REFERENCES users(id),
  cancel_reason VARCHAR(300),
  cancel_type VARCHAR(20),                           -- before_start / during_work / no_show
  penalty_amount INT DEFAULT 0,
  cancelled_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE match_cancel_logs IS 'キャンセルログ — KPI算出用。ペナルティ管理も想定';


-- ##########################################################################
-- I. カスタムフィールド（EAVパターン）
-- ##########################################################################

-- 設計判断: EAV vs JSONB の選択
-- ─────────────────────────────────────────────────────────
-- EAV（Entity-Attribute-Value）を採用した理由:
--
-- 1. 管理画面からコード変更なしで項目追加・編集・削除が必要
--    → EAVはUI上での「フィールド定義CRUD」と自然に対応する
--
-- 2. 項目ごとに必須/任意・入力タイプ・選択肢を個別管理する必要がある
--    → 定義テーブルにメタ情報を持つEAVが適切
--
-- 3. カスタム項目での検索・フィルタが必要になる可能性
--    → EAVなら field_def_id + value でインデックス可能
--
-- 4. JSOBの場合:
--    ○ 読み書きはシンプル
--    × 項目定義のメタ情報管理が別途必要
--    × バリデーション（必須チェック等）をアプリ層で全て実装
--    × 項目単位の検索にGINインデックスが必要で複雑化
--
-- → 項目定義の管理UI を提供する本システムではEAVが最適と判断。
--   ただし custom_field_defs.options にはJSONBを使い、
--   セレクトボックスの選択肢等はJSON配列で柔軟に持つハイブリッド設計。
-- ─────────────────────────────────────────────────────────

-- I-01 ─────────────────────────────────────────────────────────────────────
CREATE TABLE custom_field_defs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id),  -- 会社ごとに定義可能

  target_type       VARCHAR(20) NOT NULL,            -- demand/supply/project/worker
  field_label       VARCHAR(100) NOT NULL,           -- 表示ラベル（例: 仕上げ種別）
  field_key         VARCHAR(50) NOT NULL,            -- APIキー（例: finish_type）
  input_type        VARCHAR(20) NOT NULL,            -- text/number/date/select/checkbox/textarea
  options           JSONB,                           -- select時の選択肢 [{"value":"1","label":"漆喰"},...]
  is_required       BOOLEAN DEFAULT false,           -- 必須フラグ
  is_visible        BOOLEAN DEFAULT true,            -- 表示フラグ（非表示にできる）
  sort_order        INT DEFAULT 0,
  placeholder       VARCHAR(200),                    -- プレースホルダー
  help_text         VARCHAR(300),                    -- ヘルプテキスト

  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, target_type, field_key)
);
COMMENT ON TABLE custom_field_defs IS 'カスタム項目定義 — 管理画面から動的に項目追加。EAVの"A"';

-- 初期データ例（左官業固有のカスタム項目）
-- INSERT INTO custom_field_defs (company_id, target_type, field_label, field_key, input_type, options) VALUES
-- ('...', 'demand', '仕上げ種別', 'finish_type', 'select',
--   '[{"value":"plaster","label":"漆喰"},{"value":"mortar","label":"モルタル"},{"value":"stucco","label":"スタッコ"}]'),
-- ('...', 'demand', '電圧区分', 'voltage_class', 'select',
--   '[{"value":"low","label":"低圧"},{"value":"high","label":"高圧"},{"value":"extra","label":"特別高圧"}]');


-- I-02 ─────────────────────────────────────────────────────────────────────
CREATE TABLE custom_field_vals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_def_id      UUID NOT NULL REFERENCES custom_field_defs(id),
  target_type       VARCHAR(20) NOT NULL,            -- demand/supply/project/worker
  target_id         UUID NOT NULL,                   -- 対象レコードのID
  field_value       TEXT,                            -- 入力値（全型をTEXTで格納）
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(field_def_id, target_id)
);
COMMENT ON TABLE custom_field_vals IS 'カスタム項目値 — EAVの"V"。対象レコードの動的拡張データ';

CREATE INDEX idx_cfv_target ON custom_field_vals(target_type, target_id);
CREATE INDEX idx_cfv_def    ON custom_field_vals(field_def_id);


-- ##########################################################################
-- J. 会計・請求（前回v1と同構造・論理削除追加）
-- ##########################################################################

CREATE TABLE account_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code VARCHAR(10) NOT NULL UNIQUE,
  account_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(30),                          -- revenue/cost/expense/asset/liability
  parent_code VARCHAR(10),
  is_construction BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE account_master IS '勘定科目 — 建設業会計準拠';

INSERT INTO account_master (account_code, account_name, account_type) VALUES
  ('4100', '完成工事高',   'revenue'),
  ('5100', '材料費',       'cost'),
  ('5200', '労務費',       'cost'),
  ('5210', '労務費（自社）','cost'),
  ('5220', '労務外注費',   'cost'),
  ('5300', '外注費',       'cost'),
  ('5400', '経費',         'cost'),
  ('5410', '機械等経費',   'cost'),
  ('5420', '運搬費',       'cost'),
  ('5440', '安全対策費',   'cost'),
  ('5490', 'その他経費',   'cost');

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  client_company_id UUID NOT NULL REFERENCES companies(id),
  project_id UUID REFERENCES projects(id),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  billing_type VARCHAR(20),                          -- progress/completion/monthly/daily
  subtotal BIGINT NOT NULL,
  tax_amount BIGINT NOT NULL,
  total_amount BIGINT NOT NULL,
  tax_rate DECIMAL(4,2) DEFAULT 10.00,
  qualified_invoice BOOLEAN DEFAULT true,
  invoice_reg_no VARCHAR(20),
  status VARCHAR(20) DEFAULT 'draft',
  issued_at TIMESTAMPTZ, sent_at TIMESTAMPTZ, paid_at TIMESTAMPTZ,
  pdf_url VARCHAR(500),
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false, deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  line_order INT DEFAULT 0,
  description VARCHAR(300) NOT NULL,
  quantity DECIMAL(10,2), unit VARCHAR(20),
  unit_price DECIMAL(12,2), amount BIGINT NOT NULL,
  tax_category VARCHAR(10) DEFAULT 'taxable',
  account_id UUID REFERENCES account_master(id),
  project_phase_id UUID REFERENCES project_phases(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments_received (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  payment_date DATE NOT NULL,
  amount BIGINT NOT NULL,
  payment_method VARCHAR(20),
  bank_ref VARCHAR(100), notes VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  worker_id UUID NOT NULL REFERENCES users(id),
  period_start DATE NOT NULL, period_end DATE NOT NULL,
  payment_date DATE,
  gross_amount BIGINT NOT NULL,
  withholding_tax BIGINT DEFAULT 0,
  deductions BIGINT DEFAULT 0,
  net_amount BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  paid_at TIMESTAMPTZ,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false, deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payroll_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_id UUID NOT NULL REFERENCES payroll(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  assignment_id UUID REFERENCES project_assignments(id),
  work_date DATE, man_days DECIMAL(4,2),
  daily_rate INT, amount BIGINT NOT NULL,
  description VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cost_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  account_id UUID REFERENCES account_master(id),
  cost_category VARCHAR(30) NOT NULL,
  transaction_date DATE NOT NULL,
  description VARCHAR(300),
  amount BIGINT NOT NULL,
  source_type VARCHAR(20), source_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cost_proj ON cost_ledger(project_id, cost_category);


-- ##########################################################################
-- K. 通知ログ
-- ##########################################################################

CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  channel VARCHAR(20) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(200), body TEXT,
  related_type VARCHAR(30), related_id UUID,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ##########################################################################
-- V. ビュー
-- ##########################################################################

-- V-01 日別人員充足状況
CREATE VIEW v_daily_staffing AS
SELECT
  ps.project_id, p.project_name, ps.target_date,
  ps.work_type_id, wt.work_type_name,
  ps.required_count, ps.confirmed_count,
  ps.required_count - ps.confirmed_count AS shortage,
  CASE
    WHEN ps.confirmed_count >= ps.required_count THEN 'sufficient'
    WHEN ps.confirmed_count >= ps.required_count * 0.8 THEN 'warning'
    ELSE 'shortage'
  END AS fulfillment
FROM project_staffing ps
JOIN projects p ON ps.project_id = p.id AND NOT p.is_deleted
LEFT JOIN work_type_master wt ON ps.work_type_id = wt.id
WHERE p.status IN ('ordered','in_progress');

-- V-02 待機中人材（ワンアクション候補投入用）
CREATE VIEW v_available_workers AS
SELECT
  u.id, u.last_name || u.first_name AS name,
  u.availability, wp.skill_level, wp.avg_rating,
  wp.experience_years, wp.desired_daily_min, wp.desired_daily_max,
  wa.target_date, wa.status AS cal_status,
  u.address_lat, u.address_lng
FROM users u
JOIN worker_profiles wp ON u.id = wp.user_id
JOIN worker_availability wa ON u.id = wa.user_id
WHERE u.role = 'worker' AND u.is_active AND NOT u.is_deleted
  AND wa.status = 'available';

-- V-03 案件収支サマリー
CREATE VIEW v_project_profit AS
SELECT
  p.id, p.project_name, p.contract_amount, p.estimated_cost,
  COALESCE(SUM(CASE WHEN cl.cost_category LIKE 'labor%' THEN cl.amount END),0) AS labor_cost,
  COALESCE(SUM(CASE WHEN cl.cost_category='material' THEN cl.amount END),0) AS material_cost,
  COALESCE(SUM(CASE WHEN cl.cost_category='subcontract' THEN cl.amount END),0) AS sub_cost,
  COALESCE(SUM(cl.amount),0) AS total_cost,
  p.contract_amount - COALESCE(SUM(cl.amount),0) AS gross_profit,
  CASE WHEN p.contract_amount > 0
    THEN ROUND((p.contract_amount - COALESCE(SUM(cl.amount),0))::DECIMAL / p.contract_amount * 100, 1)
    ELSE 0 END AS profit_pct
FROM projects p
LEFT JOIN cost_ledger cl ON p.id = cl.project_id
WHERE NOT p.is_deleted
GROUP BY p.id;

-- V-04 マッチングKPI
CREATE VIEW v_matching_kpi AS
SELECT
  DATE_TRUNC('month', mc.matched_at) AS month,
  COUNT(*) AS total_matches,
  COUNT(*) FILTER (WHERE mc.status='completed') AS completed,
  COUNT(*) FILTER (WHERE mc.status='cancelled') AS cancelled,
  ROUND(AVG(mc.time_to_match_hours),1) AS avg_match_hours,
  ROUND(
    COUNT(*) FILTER (WHERE mc.status='cancelled')::DECIMAL
    / NULLIF(COUNT(*),0) * 100, 1
  ) AS cancel_rate_pct
FROM match_contracts mc
WHERE NOT mc.is_deleted
GROUP BY DATE_TRUNC('month', mc.matched_at);

-- V-05 アラート一覧
CREATE VIEW v_overdue_alerts AS
-- 未請求案件
SELECT 'unpaid_invoice' AS alert_type,
  i.id AS related_id, i.invoice_number AS label,
  i.due_date::TEXT AS detail
FROM invoices i
WHERE i.status IN ('issued','sent') AND i.due_date < CURRENT_DATE AND NOT i.is_deleted
UNION ALL
-- 資格期限切れ30日以内
SELECT 'license_expiry', ul.id,
  u.last_name || u.first_name || ' - ' || lm.license_name,
  ul.expiry_date::TEXT
FROM user_licenses ul
JOIN users u ON ul.user_id = u.id
JOIN license_master lm ON ul.license_id = lm.id
WHERE ul.expiry_date <= CURRENT_DATE + 30 AND NOT ul.is_deleted
UNION ALL
-- 長期待機（14日以上 available 継続）
SELECT 'long_idle', u.id,
  u.last_name || u.first_name,
  MIN(wa.target_date)::TEXT
FROM users u
JOIN worker_availability wa ON u.id = wa.user_id AND wa.status = 'available'
WHERE wa.target_date BETWEEN CURRENT_DATE - 14 AND CURRENT_DATE
  AND NOT u.is_deleted
GROUP BY u.id, u.last_name, u.first_name
HAVING COUNT(*) >= 14;


-- ##########################################################################
-- ステータス遷移図
-- ##########################################################################
--
-- ■ 募集（demand_postings.status）
--
--   draft ──→ open ──→ filled（全枠確定）
--     │         │  ↘
--     │         │   suspended ──→ open（再開）
--     │         │
--     │         ╰──→ closed（手動終了）
--     │         ╰──→ expired（期限切れ: バッチ処理）
--     ╰──→ cancelled
--
-- ■ 募集応答（demand_applications.status）
--
--   pending ──→ accepted ──→ (match_contracts作成)
--     │    ↘
--     │     rejected
--     ╰──→ withdrawn（応募者取下げ）
--     ╰──→ expired（募集自体の期限切れ連動）
--
-- ■ 人材公開（supply_postings.status）
--
--   draft ──→ open ──→ matched（成約済）
--     │         │  ↘
--     │         │   suspended ──→ open（再開）
--     │         │
--     │         ╰──→ closed
--     │         ╰──→ expired
--     ╰──→ cancelled
--
-- ■ 人材問合せ（supply_inquiries.status）
--
--   pending ──→ accepted ──→ (match_contracts作成)
--     │    ↘
--     │     rejected
--     ╰──→ withdrawn
--
-- ■ 成約（match_contracts.status）
--
--   active ──→ completed（工期完了）
--     ╰──→ cancelled ──→ match_cancel_logs に記録
--
-- ##########################################################################


-- ##########################################################################
-- 旧システム（t_tasks）との対比メモ
-- ##########################################################################
--
-- ┌──────────────────────┬──────────────────────┬──────────────────────────┐
-- │ 旧カラム              │ 新テーブル.カラム      │ 改善内容                  │
-- ├──────────────────────┼──────────────────────┼──────────────────────────┤
-- │ task_type (1:募集/2:応│ demand_postings /    │ テーブル完全分離。          │
-- │ 募を1テーブル混在)    │ supply_postings      │ 必須項目が異なるため。      │
-- ├──────────────────────┼──────────────────────┼──────────────────────────┤
-- │ site_name             │ demand.site_name     │ そのまま継承。             │
-- ├──────────────────────┼──────────────────────┼──────────────────────────┤
-- │ prefectures (都道府県 │ site_prefecture +    │ 都道府県を独立カラムに。    │
-- │ 含めて1カラム)        │ site_city +          │ ジオコーディング連携のため  │
-- │                      │ site_address         │ 3分割。                   │
-- ├──────────────────────┼──────────────────────┼──────────────────────────┤
-- │ site_type_id          │ （廃止）              │ 工種マスタに統合。         │
-- ├──────────────────────┼──────────────────────┼──────────────────────────┤
-- │ structure_id          │ structure_master.id   │ 独立マスタとして維持。     │
-- ├──────────────────────┼──────────────────────┼──────────────────────────┤
-- │ property_type_id      │ projects.property_type│ 自由テキスト化。           │
-- │                      │                      │ マスタ管理の必要性低いため。│
-- ├──────────────────────┼──────────────────────┼──────────────────────────┤
-- │ contract_type_id (FK) │ contract_type (enum) │ マスタ参照→直接値に変更。  │
-- │                      │                      │ 選択肢が2種のみのため。    │
-- ├──────────────────────┼──────────────────────┼──────────────────────────┤
-- │ 左官開始時期/終了時期  │ work_date_start/end  │ 業種非依存の汎用名に。     │
-- ├──────────────────────┼──────────────────────┼──────────────────────────┤
-- │ human_work            │ required_count       │ 「人工」→「必要人数」に    │
-- │                      │                      │ 明確化。                  │
-- ├──────────────────────┼──────────────────────┼──────────────────────────┤
-- │ unit_price/total_price│ daily_rate_min/max   │ 単価は範囲指定に拡張。     │
-- │                      │ + fixed_price        │ 請負金額も同一テーブルに。  │
-- ├──────────────────────┼──────────────────────┼──────────────────────────┤
-- │ status (varchar)      │ status (varchar +    │ 遷移ルールを明文化。       │
-- │                      │ CHECK制約想定)       │ suspended/expired追加。   │
-- ├──────────────────────┼──────────────────────┼──────────────────────────┤
-- │ （カスタム項目なし）   │ custom_field_defs/   │ EAVパターンで動的項目追加  │
-- │                      │ custom_field_vals    │ を実現。                  │
-- ├──────────────────────┼──────────────────────┼──────────────────────────┤
-- │ （位置情報なし）       │ site_lat/lng +       │ ジオコーディング+          │
-- │                      │ geofence_events      │ ジオフェンス対応。         │
-- ├──────────────────────┼──────────────────────┼──────────────────────────┤
-- │ is_deleted            │ is_deleted +         │ 論理削除を全テーブル標準化。│
-- │                      │ deleted_at +         │ 削除者も記録。            │
-- │                      │ deleted_by           │                          │
-- └──────────────────────┴──────────────────────┴──────────────────────────┘
--
-- ##########################################################################
