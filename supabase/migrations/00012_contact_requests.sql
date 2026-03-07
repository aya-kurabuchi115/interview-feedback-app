-- 問い合わせテーブル
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- 誰でも INSERT 可能（未ログインユーザーからの問い合わせも受付）
CREATE POLICY "Anyone can insert contact requests"
  ON contact_requests FOR INSERT
  WITH CHECK (true);

-- 本人のみ自分の問い合わせを閲覧可能
CREATE POLICY "Users can view own contact requests"
  ON contact_requests FOR SELECT
  USING (auth.uid() = user_id);
