-- ============================================================================
-- マイグレーション: ロール構成を6ロールから3ロールに変更
-- platform → admin, admin → owner, manager/supervisor/office_staff → owner
-- オーナーと会社の1:1制約を追加
-- ============================================================================

-- 既存ロールを新ロールに変換
UPDATE users SET role = 'admin' WHERE role = 'platform';
UPDATE users SET role = 'owner' WHERE role IN ('admin', 'manager', 'supervisor', 'office_staff', 'office');

-- オーナーと会社の1:1制約（1会社に1オーナーのみ）
CREATE UNIQUE INDEX "idx_users_owner_company" ON "users" ("company_id")
  WHERE role = 'owner' AND NOT is_deleted;
