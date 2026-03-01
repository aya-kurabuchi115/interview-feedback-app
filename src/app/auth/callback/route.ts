import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * リダイレクト先のオリジンを安全に取得する。
 * リバースプロキシ環境では X-Forwarded-Host が攻撃者に操作される可能性があるため、
 * 環境変数 NEXT_PUBLIC_SITE_URL を優先的に使用し、Open Redirect を防止する。
 */
function getSafeOrigin(requestUrl: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    // 末尾スラッシュを除去して返す
    return siteUrl.replace(/\/+$/, "");
  }
  // フォールバック: 開発環境向け
  return new URL(requestUrl).origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getSafeOrigin(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (code) {
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(`${origin}/login?error=config`);
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component からの呼び出し時は無視
          }
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // パスワードリカバリーの場合はパスワード更新ページにリダイレクト
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/update-password`);
      }
      // 通常のログイン/サインアップの場合はダッシュボードへ
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // エラーの場合はログインページにリダイレクト
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
