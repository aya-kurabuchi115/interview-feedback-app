"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorInfo } from "@/lib/auth/error-messages";
import type { AuthErrorInfo } from "@/lib/auth/error-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Info } from "lucide-react";
import { t } from "@/lib/i18n";

/**
 * redirect パラメータのバリデーション。
 * 同一オリジンの相対パスのみ許可し、オープンリダイレクトを防止する。
 */
function getSafeRedirectPath(redirect: string | null): string | null {
  if (!redirect) return null;

  // 相対パス（/ で始まる）のみ許可
  if (!redirect.startsWith("/")) return null;

  // プロトコル相対URL（//example.com）を拒否
  if (redirect.startsWith("//")) return null;

  // バックスラッシュを使った回避策を拒否
  if (redirect.includes("\\")) return null;

  // 許可される遷移先のプレフィックス（保護されたルートのみ）
  const allowedPrefixes = [
    "/dashboard",
    "/mock-interview",
    "/profile",
    "/es-review",
    "/settings",
    "/onboarding",
    "/personality",
    "/questions",
  ];
  const pathWithoutQuery = redirect.split("?")[0];
  if (!allowedPrefixes.some((prefix) => pathWithoutQuery.startsWith(prefix))) {
    return null;
  }

  return redirect;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorAction, setErrorAction] = useState<AuthErrorInfo["action"]>();
  const [loading, setLoading] = useState(false);
  const [sessionExpiredBanner, setSessionExpiredBanner] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // セッション切れバナーの表示
  const isExpired = searchParams.get("expired") === "true";
  const redirectParam = searchParams.get("redirect");

  useEffect(() => {
    if (isExpired) {
      setSessionExpiredBanner(true);
    }
  }, [isExpired]);

  // auth callback からのエラーコードをマッピングして表示（XSS 対策）
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const errorInfo = getAuthErrorInfo(errorParam);
    if (errorInfo) {
      setError(errorInfo.message);
      setErrorAction(errorInfo.action);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorAction(undefined);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setError(t("auth.emailNotConfirmed"));
        } else {
          setError(t("auth.invalidCredentials"));
        }
        return;
      }

      // リダイレクト先のバリデーション（オープンリダイレクト防止）
      const safeRedirect = getSafeRedirectPath(redirectParam);
      router.push(safeRedirect ?? "/dashboard");
      router.refresh();
    } catch {
      setError(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* 左パネル: 訴求エリア */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <img
          src="/images/hero-bg.png"
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-sm"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(17, 34, 64, 0.8)' }} />
        <div className="relative z-10 flex h-full flex-col justify-center px-16 xl:px-24">
          <img src="/images/logo.png" alt="Menpass" className="mb-8 h-8 w-auto self-start brightness-0 invert" />
          <h1 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
            声に出して練習する、
            <br />
            AI面接コーチ。
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-gray-300">
            回答内容・話し方・論理構成をAIが多角的に分析し、
            具体的な改善アクションを提示します。
          </p>
          <div className="mt-8 flex flex-col gap-2">
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                4.8 平均評価
              </span>
              <span>92% 利用者満足度</span>
            </div>
            <span className="text-xs text-gray-500">※ βテスト参加者のデータ</span>
          </div>
        </div>
      </div>

      {/* 右パネル: フォーム */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm">
          <CardHeader className="text-center">
            <img src="/images/logo.png" alt="Menpass" className="mx-auto mb-4 h-8 w-auto lg:hidden" />
            <CardTitle className="text-2xl">{t("auth.login")}</CardTitle>
            <CardDescription>
              {t("auth.loginDescription")}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <CardContent className="space-y-4">
              {/* セッション切れバナー（info スタイル・青系） */}
              {sessionExpiredBanner && (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
                >
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div>
                    <p>{t("auth.sessionExpired")}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSessionExpiredBanner(false)}
                    className="ml-auto flex-shrink-0 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                    aria-label={t("auth.closeNotification")}
                  >
                    &times;
                  </button>
                </div>
              )}
              {error && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                >
                  <p>{error}</p>
                  {errorAction && (
                    <Link
                      href={errorAction.href}
                      className="mt-1 inline-block font-medium underline hover:no-underline"
                    >
                      {errorAction.label}
                    </Link>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <Link
                    href="/reset-password"
                    className="text-xs text-muted-foreground hover:text-primary hover:underline"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="h-12 w-full text-base font-bold" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? t("auth.loginLoading") : t("auth.login")}
              </Button>
              <p className="text-sm text-muted-foreground">
                {t("auth.noAccount")}{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  {t("auth.signup")}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
