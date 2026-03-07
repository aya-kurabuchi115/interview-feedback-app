"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { reportClientError } from "@/lib/error-reporting";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorId, setErrorId] = useState("");

  useEffect(() => {
    const id = reportClientError(error, {
      featureArea: "profile",
      componentName: "DashboardErrorBoundary",
    });
    setErrorId(id);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-4 py-16">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          ダッシュボードの読み込みに失敗しました
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          データの取得中にエラーが発生しました。再試行してください。
        </p>
      </div>

      {errorId && (
        <p className="text-xs text-muted-foreground">
          エラーID: <code className="font-mono">{errorId}</code>
        </p>
      )}

      <div className="flex gap-3">
        <Button onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          再試行
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            ホーム
          </Link>
        </Button>
      </div>
    </div>
  );
}
