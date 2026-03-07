"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Home, RotateCcw, Mail, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { reportClientError } from "@/lib/error-reporting";
import { t } from "@/lib/i18n";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorId, setErrorId] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = reportClientError(error, {
      featureArea: "auth",
      componentName: "GlobalErrorBoundary",
    });
    setErrorId(id);
  }, [error]);

  const handleCopyErrorId = async () => {
    if (!errorId) return;
    try {
      await navigator.clipboard.writeText(errorId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API が使えない環境ではフォールバック不要
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-4 py-24">
      <div className="rounded-full bg-destructive/10 p-6">
        <AlertTriangle className="h-16 w-16 text-destructive" />
      </div>

      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          {t("error.title")}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {t("error.description")}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("error.suggestion")}
        </p>
      </div>

      {/* エラーID表示 */}
      {errorId && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-xs text-muted-foreground">{t("error.errorId")}</span>
          <code className="text-xs font-mono font-medium">{errorId}</code>
          <button
            onClick={handleCopyErrorId}
            className="ml-1 rounded p-1 hover:bg-muted transition-colors"
            title={t("error.copyErrorId")}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Button size="lg" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          {t("error.retry")}
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            {t("error.goHome")}
          </Link>
        </Button>
      </div>

      {/* サポート案内 */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {t("error.supportGuide")}
        </p>
        <a
          href="mailto:support@menpass.jp"
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <Mail className="h-3.5 w-3.5" />
          support@menpass.jp
        </a>
      </div>
    </div>
  );
}
