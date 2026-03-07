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
  const nextParam = searchParams.get("next") ?? "/onboarding";
  // Open Redirect 防止: 相対パスのみ許可、プロトコル相対URL(//)を拒否
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/onboarding";

  const redirectBase = process.env.NEXT_PUBLIC_APP_URL || origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}`);
    }

    // Supabase エラーメッセージに基づくエラーコード分岐
    const errorCode = error.message?.includes("expired")
      ? "email_expired"
      : error.message?.includes("already used") ||
          error.message?.includes("already confirmed")
        ? "code_used"
        : "email_confirm_failed";

    return NextResponse.redirect(
      `${redirectBase}/login?error=${errorCode}`
    );
  }

  // code パラメータが無い場合
  return NextResponse.redirect(
    `${redirectBase}/login?error=auth_error`
  );
}
