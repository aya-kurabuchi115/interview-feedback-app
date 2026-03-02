-- ============================================================
-- Issue #210: 面接データの一括管理 — アーカイブ・一括削除・検索機能
-- ============================================================

-- interviews テーブルに archived_at, deleted_at カラムを追加
ALTER TABLE interviews
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- インデックス追加（ソフトデリート・アーカイブフィルタ用）
CREATE INDEX IF NOT EXISTS idx_interviews_deleted_at ON interviews (deleted_at);
CREATE INDEX IF NOT EXISTS idx_interviews_archived_at ON interviews (archived_at);
CREATE INDEX IF NOT EXISTS idx_interviews_user_deleted ON interviews (user_id, deleted_at);

-- 検索用: company_name_snapshot の trigram インデックス（ilike 検索高速化）
-- pg_trgm 拡張が利用可能な場合に有効
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS idx_interviews_company_trgm ON interviews USING gin (company_name_snapshot gin_trgm_ops);

COMMENT ON COLUMN interviews.archived_at IS 'アーカイブ日時。NULLならアクティブ。';
COMMENT ON COLUMN interviews.deleted_at IS 'ソフトデリート日時。NULLなら未削除。30日後に完全削除。';
