"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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

/** クールダウン秒数 */
const COOLDOWN_SECONDS = 60;

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // クールダウンタイマーのクリーンアップ
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);

    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }

    cooldownTimerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
            cooldownTimerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // クールダウン中は送信を拒否
    if (cooldown > 0) {
      setError(`リクエストの間隔を空けてください。${cooldown}秒後に再度お試しください。`);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) {
        setError("リセットメールの送信中にエラーが発生しました。しばらくしてから再度お試しください。");
        return;
      }

      // セキュリティ上、メール未登録でも同じメッセージを表示
      // 送信成功・失敗に関わらずクールダウンを開始（列挙攻撃防止）
      startCooldown();
      setSent(true);
    } catch {
      setError("リセットメールの送信中にエラーが発生しました");
      // エラー時もクールダウンを開始
      startCooldown();
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">メールを確認してください</CardTitle>
            <CardDescription>
              パスワードリセット用のリンクを送信しました
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              <strong>{email}</strong>{" "}
              宛にパスワードリセット用のメールを送信しました。
              メール内のリンクをクリックして、新しいパスワードを設定してください。
            </p>
            <p className="text-center text-xs text-muted-foreground">
              メールが届かない場合は、迷惑メールフォルダもご確認ください。
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {cooldown > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                再送信まであと {cooldown} 秒お待ちください
              </p>
            )}
            <Button
              variant="outline"
              className="w-full"
              disabled={cooldown > 0}
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
            >
              {cooldown > 0
                ? `再送信まで ${cooldown} 秒`
                : "別のメールアドレスで再送信"}
            </Button>
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              ログインページに戻る
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">パスワードリセット</CardTitle>
          <CardDescription>
            登録済みのメールアドレスを入力してください
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <CardContent className="space-y-4">
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading || cooldown > 0}>
              {loading
                ? "送信中..."
                : cooldown > 0
                  ? `再送信まで ${cooldown} 秒`
                  : "リセットメールを送信"}
            </Button>
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              ログインページに戻る
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
