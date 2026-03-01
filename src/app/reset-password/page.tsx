"use client";

import { useState } from "react";
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

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
      setSent(true);
    } catch {
      setError("リセットメールの送信中にエラーが発生しました");
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
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
            >
              別のメールアドレスで再送信
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
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "送信中..." : "リセットメールを送信"}
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
