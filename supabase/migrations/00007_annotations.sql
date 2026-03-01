-- Issue #106: 原文スクリプト表示 + インラインフィードバック（ハイライト）
-- feedbacks テーブルに annotations JSONB カラムを追加

ALTER TABLE feedbacks
  ADD COLUMN IF NOT EXISTS annotations JSONB DEFAULT '[]'::jsonb;

-- annotations カラムにコメント追加
COMMENT ON COLUMN feedbacks.annotations IS 'AI分析によるテキストアノテーション（ハイライト情報）。各要素: {start, end, type, text, reason, suggestion}';
