-- ============================================================
-- Migration: 00002_schema_extension.sql
-- Issue: #17 - DBスキーマ・RLS設計
-- 概要: profiles, companies, subscriptions テーブル追加、
--       interviews / feedbacks テーブル拡張、ENUM型定義、
--       RLS ポリシー、インデックス、制約
-- ============================================================

-- ============================================================
-- 1. ENUM 型定義
-- 将来カテゴリを追加する場合は ALTER TYPE ... ADD VALUE を使用
-- ============================================================

-- 面接カテゴリ: アルバイト / インターン / 新卒 / その他
CREATE TYPE public.interview_category AS ENUM (
  'arubaito',
  'intern',
  'new_grad',
  'other'
);

-- 面接ラウンド: 一次 / 二次 / 三次 / 最終 / GD / ケース / その他
-- new_grad カテゴリ時に主に使用するが、他カテゴリでも NULL 許容
CREATE TYPE public.interview_round AS ENUM (
  'first',
  'second',
  'third',
  'final',
  'gd',
  'case',
  'other'
);

-- サブスクリプションプラン
CREATE TYPE public.subscription_plan AS ENUM (
  'free',
  'pro',
  'enterprise'
);

-- サブスクリプションステータス
CREATE TYPE public.subscription_status AS ENUM (
  'active',
  'canceled',
  'past_due',
  'unpaid',
  'trialing',
  'incomplete',
  'incomplete_expired',
  'paused'
);

-- 就活ステータス
CREATE TYPE public.job_hunting_status AS ENUM (
  'not_started',
  'preparing',
  'active',
  'offered',
  'decided',
  'other'
);

-- ============================================================
-- 2. profiles テーブル作成
-- ============================================================

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text,
  university text,
  faculty text,
  graduation_year integer,
  graduation_month integer CHECK (graduation_month BETWEEN 1 AND 12),
  target_industry text[] DEFAULT '{}',
  target_job_type text[] DEFAULT '{}',
  job_hunting_status public.job_hunting_status DEFAULT 'not_started',
  job_hunting_start_date date,
  preferred_work_location text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'ユーザープロフィール情報';
COMMENT ON COLUMN public.profiles.graduation_year IS '卒業年（既卒の場合は過去の年も許容）';
COMMENT ON COLUMN public.profiles.graduation_month IS '卒業月（1〜12）';
COMMENT ON COLUMN public.profiles.target_industry IS '志望業界（複数選択可）';
COMMENT ON COLUMN public.profiles.target_job_type IS '志望職種（複数選択可）';
COMMENT ON COLUMN public.profiles.preferred_work_location IS '希望勤務地（複数選択可）';

-- ============================================================
-- 3. companies テーブル作成
-- ============================================================

CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text,
  normalized_name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.companies IS '企業マスタ（表記揺れ防止のため正規化名を保持）';
COMMENT ON COLUMN public.companies.normalized_name IS '企業名の正規化名（表記揺れ防止用、ユニーク制約）';

-- ============================================================
-- 4. interviews テーブル拡張
-- 既存カラム: id, user_id, title, audio_url, duration_seconds, status, created_at
-- 追加カラム: company_id, company_name_snapshot, interview_category,
--             interview_round, interview_date, transcript, transcript_char_count,
--             updated_at
-- ============================================================

ALTER TABLE public.interviews
  ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN company_name_snapshot text NOT NULL DEFAULT '',
  ADD COLUMN interview_category public.interview_category NOT NULL DEFAULT 'other',
  ADD COLUMN interview_round public.interview_round,
  ADD COLUMN interview_date date,
  ADD COLUMN transcript text,
  ADD COLUMN transcript_char_count integer DEFAULT 0,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

-- company_name_snapshot の空文字バリデーション用コメント
-- （空文字は許容するが、アプリ層でバリデーションを実施）
COMMENT ON COLUMN public.interviews.company_name_snapshot IS '登録時点の企業名スナップショット（companies更新時のデータ整合性確保）';
COMMENT ON COLUMN public.interviews.interview_category IS '面接カテゴリ: arubaito, intern, new_grad, other';
COMMENT ON COLUMN public.interviews.interview_round IS '面接ラウンド: first, second, third, final, gd, case, other（NULL許容）';
COMMENT ON COLUMN public.interviews.transcript IS '面接の文字起こし全文';
COMMENT ON COLUMN public.interviews.transcript_char_count IS '文字起こしの文字数';

-- transcript 文字数上限の CHECK 制約（50,000文字）
ALTER TABLE public.interviews
  ADD CONSTRAINT interviews_transcript_length_check
  CHECK (char_length(transcript) <= 50000);

-- ============================================================
-- 5. feedbacks テーブル拡張
-- 既存カラム: id, interview_id, overall_score, summary, filler_words,
--             suggestions, strengths, improvements
-- 追加カラム: user_id, good_points, improvement_points, overall_comment,
--             category_scores, raw_response, model_version
-- ============================================================

ALTER TABLE public.feedbacks
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN good_points jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN improvement_points jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN overall_comment text,
  ADD COLUMN category_scores jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN raw_response jsonb,
  ADD COLUMN model_version text,
  ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();

COMMENT ON COLUMN public.feedbacks.user_id IS 'フィードバック所有者（RLS用）';
COMMENT ON COLUMN public.feedbacks.good_points IS '良かった点（JSONB配列）';
COMMENT ON COLUMN public.feedbacks.improvement_points IS '改善点（JSONB配列）';
COMMENT ON COLUMN public.feedbacks.category_scores IS 'カテゴリ別スコア（論理性, 具体性, 熱意, マナー, 質問対応 等）';
COMMENT ON COLUMN public.feedbacks.raw_response IS 'AIモデルの生レスポンス';
COMMENT ON COLUMN public.feedbacks.model_version IS '使用したAIモデルのバージョン';

-- overall_score の CHECK 制約は既存（1〜100）のままだが、0〜100 に変更
ALTER TABLE public.feedbacks
  DROP CONSTRAINT IF EXISTS feedbacks_overall_score_check;

ALTER TABLE public.feedbacks
  ADD CONSTRAINT feedbacks_overall_score_check
  CHECK (overall_score BETWEEN 0 AND 100);

-- ============================================================
-- 6. subscriptions テーブル作成
-- ============================================================

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan public.subscription_plan NOT NULL DEFAULT 'free',
  status public.subscription_status NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subscriptions IS 'Stripe サブスクリプション管理';
COMMENT ON COLUMN public.subscriptions.stripe_customer_id IS 'Stripe Customer ID';
COMMENT ON COLUMN public.subscriptions.stripe_subscription_id IS 'Stripe Subscription ID';
COMMENT ON COLUMN public.subscriptions.cancel_at IS '解約予定日';
COMMENT ON COLUMN public.subscriptions.canceled_at IS '実際の解約日';

-- ============================================================
-- 7. インデックス
-- ============================================================

-- interviews: ユーザー × 面接日の複合インデックス
CREATE INDEX idx_interviews_user_date
  ON public.interviews (user_id, interview_date);

-- interviews: ユーザー × 企業の複合インデックス
CREATE INDEX idx_interviews_user_company
  ON public.interviews (user_id, company_id);

-- profiles: user_id の検索用（UNIQUE制約で自動作成されるが明示）
-- UNIQUE制約でインデックスは自動作成されるため省略

-- feedbacks: user_id の検索用
CREATE INDEX idx_feedbacks_user_id
  ON public.feedbacks (user_id);

-- feedbacks: interview_id の検索用（既存の外部キーで自動作成されない場合）
CREATE INDEX idx_feedbacks_interview_id
  ON public.feedbacks (interview_id);

-- subscriptions: stripe_customer_id の検索用
CREATE INDEX idx_subscriptions_stripe_customer
  ON public.subscriptions (stripe_customer_id);

-- subscriptions: stripe_subscription_id の検索用
CREATE INDEX idx_subscriptions_stripe_subscription
  ON public.subscriptions (stripe_subscription_id);

-- companies: normalized_name のインデックス（UNIQUE制約で自動作成）

-- ============================================================
-- 8. RLS 有効化 & ポリシー
-- ============================================================

-- ----- profiles -----
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = user_id);

-- ----- companies -----
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 全認証ユーザーが SELECT 可能
CREATE POLICY "Authenticated users can select companies"
  ON public.companies FOR SELECT
  USING (auth.role() = 'authenticated');

-- 認証ユーザーが INSERT 可能
CREATE POLICY "Authenticated users can insert companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- UPDATE / DELETE は管理者のみ（service_role で操作）
-- 一般ユーザーからの UPDATE / DELETE ポリシーは設定しない

-- ----- subscriptions -----
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscription"
  ON public.subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- ----- feedbacks: user_id ベースの追加ポリシー -----
-- 既存ポリシーは interview_id 経由の所有者チェック
-- user_id カラム追加に伴い、直接的な所有者チェックも追加
CREATE POLICY "Users can select own feedbacks by user_id"
  ON public.feedbacks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedbacks by user_id"
  ON public.feedbacks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedbacks by user_id"
  ON public.feedbacks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own feedbacks by user_id"
  ON public.feedbacks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 9. updated_at 自動更新トリガー
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 10. ロールバック用コメント
-- ロールバックが必要な場合は以下のSQLを実行:
--
-- DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON public.subscriptions;
-- DROP TRIGGER IF EXISTS set_interviews_updated_at ON public.interviews;
-- DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
-- DROP FUNCTION IF EXISTS public.handle_updated_at();
--
-- DROP POLICY IF EXISTS "Users can delete own feedbacks by user_id" ON public.feedbacks;
-- DROP POLICY IF EXISTS "Users can update own feedbacks by user_id" ON public.feedbacks;
-- DROP POLICY IF EXISTS "Users can insert own feedbacks by user_id" ON public.feedbacks;
-- DROP POLICY IF EXISTS "Users can select own feedbacks by user_id" ON public.feedbacks;
-- DROP POLICY IF EXISTS "Users can delete own subscription" ON public.subscriptions;
-- DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
-- DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
-- DROP POLICY IF EXISTS "Users can select own subscription" ON public.subscriptions;
-- DROP POLICY IF EXISTS "Authenticated users can insert companies" ON public.companies;
-- DROP POLICY IF EXISTS "Authenticated users can select companies" ON public.companies;
-- DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can select own profile" ON public.profiles;
--
-- DROP TABLE IF EXISTS public.subscriptions;
-- DROP TABLE IF EXISTS public.profiles;
--
-- ALTER TABLE public.feedbacks
--   DROP COLUMN IF EXISTS user_id,
--   DROP COLUMN IF EXISTS good_points,
--   DROP COLUMN IF EXISTS improvement_points,
--   DROP COLUMN IF EXISTS overall_comment,
--   DROP COLUMN IF EXISTS category_scores,
--   DROP COLUMN IF EXISTS raw_response,
--   DROP COLUMN IF EXISTS model_version,
--   DROP COLUMN IF EXISTS created_at;
-- ALTER TABLE public.feedbacks
--   DROP CONSTRAINT IF EXISTS feedbacks_overall_score_check;
-- ALTER TABLE public.feedbacks
--   ADD CONSTRAINT feedbacks_overall_score_check CHECK (overall_score BETWEEN 1 AND 100);
--
-- DROP INDEX IF EXISTS idx_subscriptions_stripe_subscription;
-- DROP INDEX IF EXISTS idx_subscriptions_stripe_customer;
-- DROP INDEX IF EXISTS idx_feedbacks_interview_id;
-- DROP INDEX IF EXISTS idx_feedbacks_user_id;
-- DROP INDEX IF EXISTS idx_interviews_user_company;
-- DROP INDEX IF EXISTS idx_interviews_user_date;
--
-- ALTER TABLE public.interviews
--   DROP CONSTRAINT IF EXISTS interviews_transcript_length_check,
--   DROP COLUMN IF EXISTS company_id,
--   DROP COLUMN IF EXISTS company_name_snapshot,
--   DROP COLUMN IF EXISTS interview_category,
--   DROP COLUMN IF EXISTS interview_round,
--   DROP COLUMN IF EXISTS interview_date,
--   DROP COLUMN IF EXISTS transcript,
--   DROP COLUMN IF EXISTS transcript_char_count,
--   DROP COLUMN IF EXISTS updated_at;
--
-- DROP TABLE IF EXISTS public.companies;
--
-- DROP TYPE IF EXISTS public.job_hunting_status;
-- DROP TYPE IF EXISTS public.subscription_status;
-- DROP TYPE IF EXISTS public.subscription_plan;
-- DROP TYPE IF EXISTS public.interview_round;
-- DROP TYPE IF EXISTS public.interview_category;
-- ============================================================
