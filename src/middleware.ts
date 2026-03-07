import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// ============================================================
// セキュリティヘッダー & CSP
// ============================================================

/**
 * Content Security Policy を構築する。
 * next-themes はインラインスクリプトでテーマ初期化を行うため 'unsafe-inline' が必要。
 * Tailwind CSS / shadcn/ui はインラインスタイルを使用するため style-src に 'unsafe-inline' が必要。
 */
function buildCsp(): string {
  const directives: string[] = [
    // デフォルト: 自サイトのみ
    "default-src 'self'",
    // スクリプト: 自サイト + unsafe-inline（next-themes テーマ初期化）
    "script-src 'self' 'unsafe-inline' https://js.stripe.com",
    // スタイル: 自サイト + unsafe-inline（Tailwind/shadcn）
    "style-src 'self' 'unsafe-inline'",
    // 画像: 自サイト + data URI（SVG インライン等）+ blob（画像プレビュー）
    "img-src 'self' data: blob:",
    // フォント: 自サイトのみ（next/font でセルフホスティング）
    "font-src 'self'",
    // 接続先: 自サイト + Supabase + Sentry
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io",
    // フレーム: Stripe Checkout 用
    "frame-src 'self' https://js.stripe.com",
    // メディア: 自サイト + blob（録音データ）
    "media-src 'self' blob:",
    // ワーカー: 自サイト + blob（AudioWorklet 等）
    "worker-src 'self' blob:",
    // フォーム送信先: 自サイトのみ
    "form-action 'self'",
    // ベース URI: 自サイトのみ
    "base-uri 'self'",
    // フレーム祖先: なし（クリックジャッキング防止）
    "frame-ancestors 'none'",
    // オブジェクト: なし（Flash 等のプラグイン無効化）
    "object-src 'none'",
  ];
  return directives.join("; ");
}

/**
 * レスポンスにセキュリティヘッダーを付与する。
 */
function setSecurityHeaders(response: NextResponse): void {
  // CSP
  response.headers.set("Content-Security-Policy", buildCsp());
  // クリックジャッキング防止
  response.headers.set("X-Frame-Options", "DENY");
  // MIME タイプスニッフィング防止
  response.headers.set("X-Content-Type-Options", "nosniff");
  // リファラー制御
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // ブラウザ機能制限（マイクは面接録音で必要）
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=()"
  );
  // DNS プリフェッチ有効化
  response.headers.set("X-DNS-Prefetch-Control", "on");
  // HTTPS 強制（2年間 + サブドメイン + preload）
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
}

// ============================================================
// CSRF 対策（Origin / Referer 検証）
// ============================================================

/** 許可するオリジンのリスト */
function getAllowedOrigins(): string[] {
  const origins = ["https://interviewcoach.jp"];
  // 開発環境
  if (process.env.NODE_ENV !== "production") {
    origins.push("http://localhost:3000");
    origins.push("http://127.0.0.1:3000");
  }
  // Vercel プレビュー環境
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }
  return origins;
}

/**
 * 状態変更系リクエスト（POST/PUT/PATCH/DELETE）に対して
 * Origin / Referer ヘッダーを検証する。
 * Stripe Webhook は署名検証で保護されているため CSRF チェックをスキップする。
 */
function validateCsrf(request: NextRequest): boolean {
  const method = request.method.toUpperCase();

  // GET / HEAD / OPTIONS は状態変更しないためスキップ
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return true;
  }

  // Stripe Webhook は stripe-signature で検証されるためスキップ
  if (request.nextUrl.pathname === "/api/stripe/webhook") {
    return true;
  }

  // Supabase Auth Callback は外部リダイレクトからのため CSRF チェックをスキップ
  if (
    request.nextUrl.pathname.startsWith("/auth/callback") ||
    request.nextUrl.pathname.startsWith("/api/auth/callback")
  ) {
    return true;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowedOrigins = getAllowedOrigins();

  // Origin ヘッダーがある場合はそれで検証
  if (origin) {
    return allowedOrigins.some((allowed) => origin === allowed);
  }

  // Origin がない場合は Referer で検証
  if (referer) {
    return allowedOrigins.some((allowed) => referer.startsWith(allowed));
  }

  // Origin も Referer もない場合は拒否（ブラウザからの正常なリクエストには必ず付与される）
  return false;
}

// ============================================================
// インメモリレート制限（MVP用）
// 本番環境では Redis ベースのレート制限に置き換えること
// ============================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1分
const RATE_LIMIT_MAX_REQUESTS = 30; // 1分あたり30回

// IP アドレスごとのリクエスト数を追跡
const rateLimitMap = new Map<string, RateLimitEntry>();

// 古いエントリを定期的にクリーンアップ（メモリリーク防止）
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5分ごと
let lastCleanup = Date.now();

function cleanupRateLimitMap() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

function getClientIp(request: NextRequest): string {
  // Vercel / プロキシ環境での実際の IP を取得
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();

  cleanupRateLimitMap();

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    // 新しいウィンドウを開始
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt };
  }

  entry.count += 1;

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetAt: entry.resetAt,
  };
}

const ONBOARDING_BYPASS_PREFIXES = [
  "/onboarding",
  "/api/",
  "/auth/",
  "/legal/",
  "/_next/",
  "/login",
  "/signup",
  "/reset-password",
  "/update-password",
  "/personality",
  "/questions",
  "/help",
  "/lp-preview",
];

const ONBOARDING_REQUIRED_PREFIXES = [
  "/dashboard",
  "/mock-interview",
  "/es-review",
  "/profile",
];

function shouldCheckOnboarding(pathname: string): boolean {
  if (ONBOARDING_BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }
  return ONBOARDING_REQUIRED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  // -------------------------------------------------------
  // CSRF 検証（状態変更系 API に対して Origin/Referer を検証）
  // -------------------------------------------------------
  if (request.nextUrl.pathname.startsWith("/api/") && !validateCsrf(request)) {
    return NextResponse.json(
      { error: "不正なリクエストです。ページを再読み込みしてお試しください。" },
      { status: 403 }
    );
  }

  // /api/* へのリクエストにレート制限を適用
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    const { allowed, remaining, resetAt } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: "リクエスト数の上限に達しました。しばらくしてから再度お試しください。" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
          },
        }
      );
    }

    // セッション更新後にレート制限ヘッダーを付与
    const response = await updateSession(request);
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX_REQUESTS));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
    setSecurityHeaders(response);
    return response;
  }

  const response = await updateSession(request);

  // ログイン済みユーザーがトップページ（/）にアクセスした場合、ダッシュボードにリダイレクト
  if (request.nextUrl.pathname === "/") {
    const hasSession = request.cookies.getAll().some(
      (cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
    );
    if (hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // ログイン済みユーザーが /login, /signup にアクセスした場合、/dashboard にリダイレクト
  // ?error= パラメータ付きの場合はリダイレクトしない（auth callback からのエラー表示を妨げない）
  const authPaths = ["/login", "/signup"];
  if (authPaths.includes(request.nextUrl.pathname)) {
    if (!request.nextUrl.searchParams.has("error") && !request.nextUrl.searchParams.has("expired")) {
      const hasSession = request.cookies.getAll().some(
        (cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
      );

      if (hasSession) {
        const url = request.nextUrl.clone();
        // オンボーディング未完了の場合は /onboarding にリダイレクト
        const onboardingCompleted = request.cookies.get("onboarding_completed")?.value;
        url.pathname = onboardingCompleted === "true" ? "/dashboard" : "/onboarding";
        return NextResponse.redirect(url);
      }
    }
  }

  if (shouldCheckOnboarding(request.nextUrl.pathname)) {
    const onboardingCompleted = request.cookies.get("onboarding_completed")?.value;
    const hasSession = request.cookies.getAll().some(
      (cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
    );

    if (hasSession && onboardingCompleted !== "true") {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  // 全レスポンスにセキュリティヘッダーを付与
  setSecurityHeaders(response);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
