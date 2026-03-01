-- ============================================================
-- Migration: 00010_es_reviews
-- Issue #133: ES添削機能
-- ============================================================

CREATE TABLE IF NOT EXISTS es_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  char_count INT NOT NULL DEFAULT 0,
  feedback JSONB DEFAULT NULL,
  score INT DEFAULT NULL CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'error')),
  model_version TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_es_reviews_user_id ON es_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_es_reviews_created_at ON es_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_es_reviews_user_created ON es_reviews(user_id, created_at DESC);

-- RLS 有効化
ALTER TABLE es_reviews ENABLE ROW LEVEL SECURITY;

-- ポリシー: 自分のデータのみ SELECT
CREATE POLICY "es_reviews_select_own"
  ON es_reviews FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: 自分のデータのみ INSERT
CREATE POLICY "es_reviews_insert_own"
  ON es_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ポリシー: 自分のデータのみ UPDATE
CREATE POLICY "es_reviews_update_own"
  ON es_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- ポリシー: 自分のデータのみ DELETE
CREATE POLICY "es_reviews_delete_own"
  ON es_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_es_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_es_reviews_updated_at
  BEFORE UPDATE ON es_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_es_reviews_updated_at();

COMMENT ON TABLE es_reviews IS 'ES添削データ（Issue #133）';
COMMENT ON COLUMN es_reviews.question IS 'ESの設問（例: 学生時代に力を入れたことは？）';
COMMENT ON COLUMN es_reviews.answer IS 'ESの回答テキスト';
COMMENT ON COLUMN es_reviews.char_count IS '回答の文字数';
COMMENT ON COLUMN es_reviews.feedback IS 'AIフィードバック（JSONB）';
COMMENT ON COLUMN es_reviews.score IS '総合スコア（0-100）';
COMMENT ON COLUMN es_reviews.status IS 'ステータス: pending, analyzing, completed, error';
COMMENT ON COLUMN es_reviews.model_version IS '使用したAIモデル';
