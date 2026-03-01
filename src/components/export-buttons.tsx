"use client";

import { useState, useEffect } from "react";
import { Download, Printer, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonsProps {
  /** 特定の面接IDを指定（個別レポートの場合） */
  interviewId?: string;
  /** ドロップダウン形式で表示するか（ダッシュボード用） */
  variant?: "dropdown" | "inline";
}

export function ExportButtons({
  interviewId,
  variant = "dropdown",
}: ExportButtonsProps) {
  const [csvLoading, setCsvLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** CSV ダウンロード */
  const handleCsvExport = async () => {
    setCsvLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/export/csv");

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.error ?? "CSV のダウンロードに失敗しました"
        );
      }

      // Blob としてダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "interview-history.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "CSV のダウンロードに失敗しました";
      setError(message);
    } finally {
      setCsvLoading(false);
    }
  };

  /** PDF 印刷（新しいウィンドウで印刷用 HTML を開く） */
  const handlePdfExport = () => {
    setPdfLoading(true);
    setError(null);

    try {
      const url = interviewId
        ? `/api/export/pdf?id=${encodeURIComponent(interviewId)}`
        : "/api/export/pdf";

      window.open(url, "_blank");
    } catch {
      setError("PDF の生成に失敗しました");
    } finally {
      // ウィンドウが開いた後すぐにローディングを解除
      setTimeout(() => setPdfLoading(false), 500);
    }
  };

  // エラー表示を一定時間後に消す
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (variant === "inline") {
    return (
      <div className="relative">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePdfExport}
            disabled={pdfLoading}
          >
            {pdfLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}
            この結果を印刷
          </Button>
        </div>
        {error && (
          <div className="absolute top-full left-0 mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            エクスポート
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleCsvExport}
            disabled={csvLoading}
          >
            {csvLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            CSV ダウンロード
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handlePdfExport}
            disabled={pdfLoading}
          >
            {pdfLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}
            PDF 印刷
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {error && (
        <div className="absolute top-full right-0 z-50 mt-2 w-max max-w-xs rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
