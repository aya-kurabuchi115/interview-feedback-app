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
    "/interview",
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
          setError("メールアドレスの確認が完了していません。受信トレイの確認メールからアカウントを有効化してください。");
        } else {
          setError("メールアドレスまたはパスワードが正しくありません。入力内容をご確認ください。");
        }
        return;
      }

      // リダイレクト先のバリデーション（オープンリダイレクト防止）
      const safeRedirect = getSafeRedirectPath(redirectParam);
      router.push(safeRedirect ?? "/dashboard");
      router.refresh();
    } catch {
      setError("サーバーとの通信に失敗しました。時間を置いて再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ログイン</CardTitle>
          <CardDescription>
            メールアドレスとパスワードでログイン
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
                  <p>セッションの有効期限が切れました。再度ログインしてください。</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSessionExpiredBanner(false)}
                  className="ml-auto flex-shrink-0 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                  aria-label="通知を閉じる"
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
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">パスワード</Label>
                <Link
                  href="/reset-password"
                  className="text-xs text-muted-foreground hover:text-primary hover:underline"
                >
                  パスワードを忘れた方
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
            <p className="text-sm text-muted-foreground">
              アカウントをお持ちでないですか？{" "}
              <Link href="/signup" className="text-primary hover:underline">
                サインアップ
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
