-- Issue #79: tags and notes
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'blue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS interview_tags (
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (interview_id, tag_id)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_select_own" ON tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tags_insert_own" ON tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tags_update_own" ON tags FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tags_delete_own" ON tags FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE interview_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interview_tags_select_own" ON interview_tags FOR SELECT USING (EXISTS (SELECT 1 FROM interviews WHERE interviews.id = interview_tags.interview_id AND interviews.user_id = auth.uid()));
CREATE POLICY "interview_tags_insert_own" ON interview_tags FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM interviews WHERE interviews.id = interview_tags.interview_id AND interviews.user_id = auth.uid()));
CREATE POLICY "interview_tags_delete_own" ON interview_tags FOR DELETE USING (EXISTS (SELECT 1 FROM interviews WHERE interviews.id = interview_tags.interview_id AND interviews.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_tags_interview_id ON interview_tags(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_tags_tag_id ON interview_tags(tag_id);
