"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Json } from "@/types/database";

// ============================================================
// 型定義
// ============================================================

/** アノテーション */
export interface Annotation {
  start: number;
  end: number;
  type: "error" | "warning" | "good";
  text: string;
  reason: string;
  suggestion?: string;
}

/** テキストセグメント（通常テキスト or ハイライト付き） */
interface TextSegment {
  text: string;
  annotation: Annotation | null;
}

// ============================================================
// ユーティリティ
// ============================================================

/** Json 型からAnnotation配列をパースする */
export function parseAnnotations(data: Json): Annotation[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item): item is Record<string, Json | undefined> =>
      item !== null && typeof item === "object" && !Array.isArray(item)
    )
    .filter((item) => {
      return (
        typeof item.start === "number" &&
        Number.isFinite(item.start) &&
        typeof item.end === "number" &&
        Number.isFinite(item.end) &&
        typeof item.type === "string" &&
        typeof item.text === "string" &&
        typeof item.reason === "string" &&
        ["error", "warning", "good"].includes(item.type as string)
      );
    })
    .map((item) => ({
      start: item.start as number,
      end: item.end as number,
      type: item.type as "error" | "warning" | "good",
      text: item.text as string,
      reason: item.reason as string,
      suggestion: typeof item.suggestion === "string" ? item.suggestion : undefined,
    }));
}

/**
 * テキストをアノテーションに基づいてセグメントに分割する。
 * 重複範囲を処理し、start 順にソートしたアノテーションで分割。
 */
function splitTextByAnnotations(
  text: string,
  annotations: Annotation[]
): TextSegment[] {
  if (annotations.length === 0) {
    return [{ text, annotation: null }];
  }

  // start 順にソート（同じ start なら end が大きい方が先）
  const sorted = [...annotations]
    .filter((a) => a.start >= 0 && a.end <= text.length && a.start < a.end)
    .sort((a, b) => a.start - b.start || b.end - a.end);

  // 重複範囲を除外（先に来たアノテーションを優先）
  const resolved: Annotation[] = [];
  let lastEnd = 0;
  for (const ann of sorted) {
    if (ann.start >= lastEnd) {
      resolved.push(ann);
      lastEnd = ann.end;
    }
  }

  const segments: TextSegment[] = [];
  let currentPos = 0;

  for (const ann of resolved) {
    // アノテーション前の通常テキスト
    if (ann.start > currentPos) {
      segments.push({
        text: text.slice(currentPos, ann.start),
        annotation: null,
      });
    }
    // ハイライトテキスト
    segments.push({
      text: text.slice(ann.start, ann.end),
      annotation: ann,
    });
    currentPos = ann.end;
  }

  // 残りのテキスト
  if (currentPos < text.length) {
    segments.push({
      text: text.slice(currentPos),
      annotation: null,
    });
  }

  return segments;
}

// ============================================================
// ツールチップコンポーネント
// ============================================================

function AnnotationTooltip({
  annotation,
  position,
  onClose,
}: {
  annotation: Annotation;
  position: { top: number; left: number };
  onClose: () => void;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const typeConfig = {
    error: {
      label: "重大な問題",
      borderColor: "border-red-300 dark:border-red-700",
      bgColor: "bg-red-50 dark:bg-red-950/50",
      labelColor: "text-red-700 dark:text-red-300",
    },
    warning: {
      label: "改善推奨",
      borderColor: "border-yellow-300 dark:border-yellow-700",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/50",
      labelColor: "text-yellow-700 dark:text-yellow-300",
    },
    good: {
      label: "良い表現",
      borderColor: "border-green-300 dark:border-green-700",
      bgColor: "bg-green-50 dark:bg-green-950/50",
      labelColor: "text-green-700 dark:text-green-300",
    },
  };

  const config = typeConfig[annotation.type];

  return (
    <div
      ref={tooltipRef}
      role="tooltip"
      className={`absolute z-50 max-w-sm rounded-lg border-2 ${config.borderColor} ${config.bgColor} p-3 shadow-lg`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="space-y-2">
        <span
          className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${config.labelColor} ${config.bgColor}`}
        >
          {config.label}
        </span>
        <p className="text-sm font-medium">{annotation.reason}</p>
        {annotation.suggestion && (
          <div className="border-t border-current/10 pt-2">
            <p className="text-xs font-medium text-muted-foreground">改善提案:</p>
            <p className="text-sm">{annotation.suggestion}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ハイライト付きテキストコンポーネント
// ============================================================

function HighlightedSpan({
  segment,
  highlightEnabled,
}: {
  segment: TextSegment;
  highlightEnabled: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleInteraction = useCallback(() => {
    if (!segment.annotation || !highlightEnabled || !spanRef.current) return;
    const rect = spanRef.current.getBoundingClientRect();
    const containerRect = spanRef.current.closest("[data-transcript-container]")?.getBoundingClientRect();
    if (!containerRect) return;

    setTooltipPosition({
      top: rect.bottom - containerRect.top + 4,
      left: Math.max(0, rect.left - containerRect.left),
    });
    setShowTooltip((prev) => !prev);
  }, [segment.annotation, highlightEnabled]);

  const handleClose = useCallback(() => {
    setShowTooltip(false);
  }, []);

  if (!segment.annotation || !highlightEnabled) {
    return <span>{segment.text}</span>;
  }

  const highlightClasses = {
    error:
      "bg-red-100 dark:bg-red-900/40 border-b-2 border-red-400 dark:border-red-600 cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/60",
    warning:
      "bg-yellow-100 dark:bg-yellow-900/40 border-b-2 border-yellow-400 dark:border-yellow-600 cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-900/60",
    good:
      "bg-green-100 dark:bg-green-900/40 border-b-2 border-green-400 dark:border-green-600 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/60",
  };

  return (
    <>
      <span
        ref={spanRef}
        className={`rounded-sm px-0.5 transition-colors ${highlightClasses[segment.annotation.type]}`}
        onClick={handleInteraction}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleInteraction();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`${segment.annotation.type === "error" ? "重大な問題" : segment.annotation.type === "warning" ? "改善推奨" : "良い表現"}: ${segment.annotation.reason}`}
        aria-expanded={showTooltip}
      >
        {segment.text}
      </span>
      {showTooltip && (
        <AnnotationTooltip
          annotation={segment.annotation}
          position={tooltipPosition}
          onClose={handleClose}
        />
      )}
    </>
  );
}

// ============================================================
// 凡例コンポーネント
// ============================================================

function AnnotationLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-sm bg-red-100 border border-red-400 dark:bg-red-900/40 dark:border-red-600" />
        重大な問題
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-sm bg-yellow-100 border border-yellow-400 dark:bg-yellow-900/40 dark:border-yellow-600" />
        改善推奨
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-sm bg-green-100 border border-green-400 dark:bg-green-900/40 dark:border-green-600" />
        良い表現
      </span>
      <span className="text-muted-foreground/60">
        ハイライト箇所をクリック/タップで詳細表示
      </span>
    </div>
  );
}

// ============================================================
// メインコンポーネント
// ============================================================

export function AnnotatedTranscript({
  transcript,
  annotations,
}: {
  transcript: string;
  annotations: Annotation[];
}) {
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const segments = splitTextByAnnotations(transcript, annotations);

  // アノテーション数の集計
  const errorCount = annotations.filter((a) => a.type === "error").length;
  const warningCount = annotations.filter((a) => a.type === "warning").length;
  const goodCount = annotations.filter((a) => a.type === "good").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            原文スクリプト
            {annotations.length > 0 && (
              <span className="flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
                {errorCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/40 px-2 py-0.5 text-xs text-red-700 dark:text-red-300">
                    {errorCount}
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/40 px-2 py-0.5 text-xs text-yellow-700 dark:text-yellow-300">
                    {warningCount}
                  </span>
                )}
                {goodCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/40 px-2 py-0.5 text-xs text-green-700 dark:text-green-300">
                    {goodCount}
                  </span>
                )}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {annotations.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHighlightEnabled(!highlightEnabled)}
                aria-label={highlightEnabled ? "ハイライトを非表示" : "ハイライトを表示"}
              >
                {highlightEnabled ? (
                  <>
                    <EyeOff className="mr-1.5 h-4 w-4" />
                    ハイライトOFF
                  </>
                ) : (
                  <>
                    <Eye className="mr-1.5 h-4 w-4" />
                    ハイライトON
                  </>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "原文スクリプトを展開" : "原文スクリプトを折りたたむ"}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-4">
          {/* 凡例 */}
          {annotations.length > 0 && highlightEnabled && <AnnotationLegend />}

          {/* 原文テキスト（ハイライト付き） */}
          <div
            data-transcript-container=""
            className="relative rounded-lg bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap"
          >
            {segments.map((segment, i) => (
              <HighlightedSpan
                key={i}
                segment={segment}
                highlightEnabled={highlightEnabled}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
