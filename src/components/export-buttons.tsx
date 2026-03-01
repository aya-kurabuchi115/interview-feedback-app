"use client";

import { useState, useEffect } from "react";
import { Download, Printer, FileDown, Loader2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ExportButtonsProps {
  /** 特定の面接IDを指定（個別レポートの場合） */
  interviewId?: string;
  /** ドロップダウン形式で表示するか（ダッシュボード用） */
  variant?: "dropdown" | "inline";
}

/** 日付パラメータをクエリ文字列に変換 */
function buildDateParams(from: string, to: string): string {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function ExportButtons({
  interviewId,
  variant = "dropdown",
}: ExportButtonsProps) {
  const [csvLoading, setCsvLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  /** CSV ダウンロード */
  const handleCsvExport = async () => {
    setCsvLoading(true);
    setError(null);

    // 日付バリデーション
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setError("開始日は終了日より前に設定してください");
      setCsvLoading(false);
      return;
    }

    try {
      const dateParams = buildDateParams(dateFrom, dateTo);
      const response = await fetch(`/api/export/csv${dateParams}`);

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

    // 日付バリデーション
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setError("開始日は終了日より前に設定してください");
      setPdfLoading(false);
      return;
    }

    try {
      const dateParams = buildDateParams(dateFrom, dateTo);
      const baseUrl = interviewId
        ? `/api/export/pdf?id=${encodeURIComponent(interviewId)}`
        : `/api/export/pdf${dateParams}`;

      // interviewId がある場合は日付パラメータを追加
      const url =
        interviewId && dateParams
          ? `${baseUrl}&${dateParams.slice(1)}`
          : baseUrl;

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

  /** 日付範囲ピッカー */
  const dateRangePicker = (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <CalendarDays className="mr-2 h-4 w-4" />
            {dateFrom || dateTo
              ? `${dateFrom || "..."} ~ ${dateTo || "..."}`
              : "期間指定"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="export-date-from" className="text-xs text-muted-foreground">
                開始日
              </Label>
              <Input
                id="export-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="export-date-to" className="text-xs text-muted-foreground">
                終了日
              </Label>
              <Input
                id="export-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            {dateFrom && dateTo && dateFrom > dateTo && (
              <p className="text-xs text-red-500">
                開始日は終了日より前に設定してください
              </p>
            )}
            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-full text-xs"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                期間をクリア
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {dateRangePicker}
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
      </div>
      {error && (
        <div className="absolute top-full right-0 z-50 mt-2 w-max max-w-xs rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
