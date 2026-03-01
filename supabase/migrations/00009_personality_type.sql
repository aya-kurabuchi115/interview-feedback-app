-- ============================================================
-- Migration: 00009_personality_type
-- Issue #138 Part 2: パーソナリティタイプカラムを profiles に追加
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS personality_type TEXT DEFAULT NULL;

-- personality_type のバリデーション (16タイプのみ許可)
ALTER TABLE profiles
  ADD CONSTRAINT chk_personality_type CHECK (
    personality_type IS NULL
    OR personality_type IN (
      'INTJ', 'INTP', 'ENTJ', 'ENTP',
      'INFJ', 'INFP', 'ENFJ', 'ENFP',
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
      'ISTP', 'ISFP', 'ESTP', 'ESFP'
    )
  );

COMMENT ON COLUMN profiles.personality_type IS '16パーソナリティタイプ (例: INTJ, ENFP)';
