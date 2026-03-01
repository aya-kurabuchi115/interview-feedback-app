-- ============================================================
-- Issue #30: オンボーディングフロー
-- profiles テーブルに onboarding_completed カラムを追加
-- ============================================================

-- onboarding_completed カラム追加（デフォルトは FALSE）
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- 既存レコードは全て TRUE にセット（既存ユーザーにはウィザード不要）
UPDATE public.profiles
SET onboarding_completed = TRUE
WHERE onboarding_completed IS NULL OR onboarding_completed = FALSE;
