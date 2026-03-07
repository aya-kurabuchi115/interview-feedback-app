-- ============================================================
-- 00013: アナリティクス基盤 + インデックス追加
-- ============================================================

-- ============================================================
-- 1. user_activity_log テーブル（ユーザー行動ログ）
-- ============================================================

CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,              -- 'mock_interview_start', 'mock_interview_complete', 'es_review_submit', 'diagnosis_complete', 'login', 'signup' 等
  resource_type text,                -- 'mock_interview', 'es_review', 'personality', 'question' 等
  resource_id uuid,                  -- 対象リソースのID
  metadata jsonb DEFAULT '{}',       -- 追加情報（スコア、カテゴリ、企業名等）
  user_agent text,                   -- ブラウザ情報
  ip_address inet,                   -- IPアドレス（匿名化用）
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_activity"
  ON user_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_activity"
  ON user_activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- service_role は全データ読み取り可（管理画面・分析用）
CREATE POLICY "service_read_all_activity"
  ON user_activity_log FOR SELECT
  USING (auth.role() = 'service_role');

-- インデックス
CREATE INDEX idx_activity_user_id ON user_activity_log(user_id);
CREATE INDEX idx_activity_action ON user_activity_log(action);
CREATE INDEX idx_activity_created_at ON user_activity_log(created_at DESC);
CREATE INDEX idx_activity_user_action ON user_activity_log(user_id, action, created_at DESC);
CREATE INDEX idx_activity_resource ON user_activity_log(resource_type, resource_id);

-- ============================================================
-- 2. 既存テーブルの不足インデックス追加
-- ============================================================

-- profiles: user_id での検索が頻繁
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- subscriptions: user_id + plan でのフィルタ
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- mock_interviews: 日時順ソート、カテゴリ別集計
CREATE INDEX IF NOT EXISTS idx_mock_interviews_created_at ON mock_interviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_user_created ON mock_interviews(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_category ON mock_interviews(category);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_company ON mock_interviews(company_name);

-- contact_requests: ステータス管理
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at DESC);

-- companies: 名前検索
CREATE INDEX IF NOT EXISTS idx_companies_normalized_name ON companies(normalized_name);

-- ============================================================
-- 3. 分析用ビュー
-- ============================================================

-- DAU/MAU 計算用
CREATE OR REPLACE VIEW daily_active_users AS
SELECT
  date_trunc('day', created_at) AS day,
  count(DISTINCT user_id) AS dau
FROM user_activity_log
GROUP BY 1
ORDER BY 1 DESC;

-- 機能別利用状況
CREATE OR REPLACE VIEW feature_usage_stats AS
SELECT
  date_trunc('day', created_at) AS day,
  action,
  count(*) AS count,
  count(DISTINCT user_id) AS unique_users
FROM user_activity_log
GROUP BY 1, 2
ORDER BY 1 DESC, 3 DESC;

-- ユーザーごとの利用サマリ
CREATE OR REPLACE VIEW user_usage_summary AS
SELECT
  u.user_id,
  p.display_name,
  s.plan,
  count(*) FILTER (WHERE u.action = 'mock_interview_complete') AS mock_interviews_completed,
  count(*) FILTER (WHERE u.action = 'es_review_submit') AS es_reviews_submitted,
  count(*) FILTER (WHERE u.action = 'diagnosis_complete') AS diagnoses_completed,
  min(u.created_at) AS first_activity,
  max(u.created_at) AS last_activity
FROM user_activity_log u
LEFT JOIN profiles p ON u.user_id = p.user_id
LEFT JOIN subscriptions s ON u.user_id = s.user_id
GROUP BY u.user_id, p.display_name, s.plan;
