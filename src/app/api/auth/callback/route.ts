import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/auth/callback
 * Supabase メール確認リンクからのコールバック処理
 * - code パラメータを使ってセッションを確立
 * - 成功時はオンボーディングページへリダイレクト
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding";

  const redirectBase = process.env.NEXT_PUBLIC_APP_URL || origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}`);
    }
  }

  // エラー時はログインページへ（エラーメッセージ付き）
  return NextResponse.redirect(
    `${redirectBase}/login?error=メール確認に失敗しました。もう一度お試しください。`
  );
}
