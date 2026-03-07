"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deletingRef = useRef(false);

  const handleDelete = async () => {
    if (!password.trim() || deletingRef.current) return;
    deletingRef.current = true;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/profile/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "アカウントの削除に失敗しました");
        setDeleting(false);
        deletingRef.current = false;
        return;
      }

      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/?deleted=true");
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
      setDeleting(false);
      deletingRef.current = false;
    }
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <Link
        href="/profile"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        プロフィールに戻る
      </Link>

      <Card className="border-destructive/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle className="text-xl">アカウントの削除</CardTitle>
          <CardDescription>
            この操作は取り消せません
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 rounded-lg bg-muted/50 p-4 text-sm">
            <p className="font-medium">削除されるデータ:</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>プロフィール情報</li>
              <li>面接録音・分析結果</li>
              <li>模擬面接の履歴</li>
              <li>ES添削の履歴</li>
              <li>パーソナリティ診断結果</li>
              <li>サブスクリプション情報</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              有料プランをご利用の場合、退会後も請求サイクル終了まではアクセス可能です。
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deletePassword">
              確認のためパスワードを入力してください
            </Label>
            <Input
              id="deletePassword"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="パスワード"
              disabled={deleting}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || !password.trim()}
              className="w-full"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deleting ? "削除中..." : "アカウントを完全に削除する"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/profile")}
              disabled={deleting}
              className="w-full"
            >
              キャンセル
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
