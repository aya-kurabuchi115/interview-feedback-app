-- ============================================================
-- Migration: 00003_security_fixes.sql
-- 概要: セキュリティ脆弱性の修正
--   VULN-05: subscriptions テーブルの INSERT/UPDATE/DELETE ポリシーを削除
--            （サーバーサイドの service_role のみ書き込み可能に）
--   VULN-06: interviews ステータス改ざん防止
--            （クライアントからの UPDATE は status を特定の遷移のみ許可）
-- ============================================================

-- ============================================================
-- VULN-05: subscriptions テーブルの INSERT/UPDATE/DELETE ポリシーを削除
-- ユーザーが自分のサブスクリプションを直接 INSERT/UPDATE/DELETE できないようにする
-- サーバーサイド（service_role）のみが操作可能
-- SELECT ポリシーは残す（ユーザーが自分のプラン情報を読み取れるようにする）
-- ============================================================

DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscription" ON public.subscriptions;

-- ============================================================
-- VULN-06: interviews ステータス改ざん防止
-- クライアントからの UPDATE 時、status の値を制限するポリシーに変更
-- 既存の UPDATE ポリシーを削除して、より厳格なポリシーに置き換え
-- 許可する遷移: error -> uploaded（リトライ用）のみ
-- それ以外のステータス変更は API Route（service_role）経由で行う
-- ============================================================

DROP POLICY IF EXISTS "Users can update own interviews" ON public.interviews;

-- ユーザーは自分のインタビューの非ステータスフィールドを更新可能
-- ステータスの変更は error -> uploaded のリトライのみ許可
CREATE POLICY "Users can update own interviews with status restriction"
  ON public.interviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      -- ステータスが変更されていない場合は許可
      status = (SELECT i.status FROM public.interviews i WHERE i.id = id)
      -- error -> uploaded のリトライ遷移のみ許可
      OR (
        (SELECT i.status FROM public.interviews i WHERE i.id = id) = 'error'
        AND status = 'uploaded'
      )
    )
  );

-- ============================================================
-- ロールバック用:
-- DROP POLICY IF EXISTS "Users can update own interviews with status restriction" ON public.interviews;
-- CREATE POLICY "Users can update own interviews"
--   ON public.interviews FOR UPDATE
--   USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own subscription"
--   ON public.subscriptions FOR INSERT
--   WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own subscription"
--   ON public.subscriptions FOR UPDATE
--   USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own subscription"
--   ON public.subscriptions FOR DELETE
--   USING (auth.uid() = user_id);
-- ============================================================
