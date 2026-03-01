"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-4 py-24">
      <div className="rounded-full bg-destructive/10 p-6">
        <AlertTriangle className="h-16 w-16 text-destructive" />
      </div>

      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          エラーが発生しました
        </h1>
        <p className="mt-4 text-muted-foreground">
          申し訳ございません。予期しないエラーが発生しました。
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          時間をおいて再度お試しいただくか、ホームに戻ってください。
        </p>
      </div>

      <div className="flex gap-4">
        <Button size="lg" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          もう一度試す
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            ホームに戻る
          </Link>
        </Button>
      </div>
    </div>
  );
}
