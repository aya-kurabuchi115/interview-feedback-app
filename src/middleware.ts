import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

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
  "/share/",
  "/_next/",
  "/login",
  "/signup",
  "/reset-password",
  "/update-password",
  "/personality",
];

const ONBOARDING_REQUIRED_PREFIXES = [
  "/dashboard",
  "/interview",
  "/mock-interview",
  "/profile",
];

function shouldCheckOnboarding(pathname: string): boolean {
  if (ONBOARDING_BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }
  return ONBOARDING_REQUIRED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
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
    return response;
  }

  const response = await updateSession(request);

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

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
