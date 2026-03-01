-- ============================================================
-- Issue #78: 面接結果の共有機能
-- shared_results テーブル: 面接結果の共有リンクを管理
-- ============================================================

-- テーブル作成
CREATE TABLE IF NOT EXISTS public.shared_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- コメント
COMMENT ON TABLE public.shared_results IS '面接結果の共有リンクを管理するテーブル';
COMMENT ON COLUMN public.shared_results.share_token IS 'URL に含める一意トークン（UUID 形式）';
COMMENT ON COLUMN public.shared_results.is_active IS '共有リンクが有効かどうか（取り消し時に false にする）';
COMMENT ON COLUMN public.shared_results.expires_at IS '有効期限（NULL = 無期限）';

-- インデックス
CREATE UNIQUE INDEX IF NOT EXISTS idx_shared_results_share_token
  ON public.shared_results (share_token);

CREATE INDEX IF NOT EXISTS idx_shared_results_interview_user
  ON public.shared_results (interview_id, user_id);

-- ============================================================
-- RLS（Row Level Security）
-- ============================================================

ALTER TABLE public.shared_results ENABLE ROW LEVEL SECURITY;

-- ポリシー 1: 自分の共有リンクのみ SELECT 可能
CREATE POLICY "自分の共有リンクを閲覧"
  ON public.shared_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ポリシー 2: share_token による公開読み取り（匿名ユーザー含む）
-- is_active = true かつ期限内のみ
CREATE POLICY "トークンで公開読み取り"
  ON public.shared_results
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  );

-- ポリシー 3: 自分の面接のみ INSERT 可能
CREATE POLICY "自分の共有リンクを作成"
  ON public.shared_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ポリシー 4: 自分の共有リンクのみ UPDATE 可能（無効化用）
CREATE POLICY "自分の共有リンクを更新"
  ON public.shared_results
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ポリシー 5: 自分の共有リンクのみ DELETE 可能
CREATE POLICY "自分の共有リンクを削除"
  ON public.shared_results
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
