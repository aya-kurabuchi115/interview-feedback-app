"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { t } from "@/lib/i18n";

// ============================================================
// チェックリスト項目定義
// ============================================================

interface ChecklistItem {
  id: string;
  labelKey: string;
  href: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: "profile", labelKey: "onboarding.checkProfile", href: "/profile" },
  {
    id: "interview",
    labelKey: "onboarding.checkInterview",
    href: "/interview/new",
  },
  { id: "mock", labelKey: "onboarding.checkMock", href: "/mock-interview" },
  {
    id: "personality",
    labelKey: "onboarding.checkPersonality",
    href: "/personality",
  },
  { id: "es", labelKey: "onboarding.checkES", href: "/es-review" },
];

const STORAGE_KEY = "interviewcoach_getting_started";
const HIDDEN_KEY = "interviewcoach_getting_started_hidden";

// ============================================================
// コンポーネント
// ============================================================

interface GettingStartedChecklistProps {
  serverCompletedItems?: string[];
}

export function GettingStartedChecklist({
  serverCompletedItems = [],
}: GettingStartedChecklistProps) {
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [isHidden, setIsHidden] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 初期化: localStorage + サーバーデータのマージ
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const hidden = localStorage.getItem(HIDDEN_KEY);
      const localItems: string[] = stored ? JSON.parse(stored) : [];

      // サーバーデータとローカルデータをマージ（重複除去）
      const merged = Array.from(
        new Set([...localItems, ...serverCompletedItems])
      );
      setCompletedItems(merged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

      if (hidden === "true") {
        setIsHidden(true);
      }
    } catch {
      // localStorage アクセスエラーは無視
      setCompletedItems(serverCompletedItems);
    }
    setMounted(true);
  }, [serverCompletedItems]);

  // 項目の完了/未完了トグル
  const toggleItem = useCallback(
    (id: string) => {
      setCompletedItems((prev) => {
        const next = prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // 無視
        }
        return next;
      });
    },
    []
  );

  // ガイドを非表示
  const handleHide = useCallback(() => {
    setIsHidden(true);
    try {
      localStorage.setItem(HIDDEN_KEY, "true");
    } catch {
      // 無視
    }
  }, []);

  // ガイドを再表示
  const handleShow = useCallback(() => {
    setIsHidden(false);
    try {
      localStorage.removeItem(HIDDEN_KEY);
    } catch {
      // 無視
    }
  }, []);

  // SSR 時はレンダリングしない
  if (!mounted) return null;

  const total = CHECKLIST_ITEMS.length;
  const completed = completedItems.length;
  const progressValue = total > 0 ? (completed / total) * 100 : 0;
  const allCompleted = completed >= total;

  // 非表示時は「再表示」ボタンのみ
  if (isHidden) {
    return (
      <div className="mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShow}
          className="text-xs text-muted-foreground"
        >
          <Sparkles className="mr-1 h-3 w-3" />
          {t("onboarding.showGuide")}
        </Button>
      </div>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              {t("onboarding.gettingStarted")}
            </CardTitle>
            <CardDescription className="mt-1">
              {t("onboarding.gettingStartedDesc")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "展開" : "折りたたみ"}
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleHide}
              aria-label={t("onboarding.hideGuide")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* プログレスバー */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("onboarding.progressLabel")
                .replace("{completed}", String(completed))
                .replace("{total}", String(total))}
            </span>
            <span>{Math.round(progressValue)}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="pt-0">
          {/* 全完了時のお祝いメッセージ */}
          {allCompleted && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-center text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
              すべてのステップを完了しました！
            </div>
          )}

          <ul className="space-y-2">
            {CHECKLIST_ITEMS.map((item) => {
              const done = completedItems.includes(item.id);
              return (
                <li key={item.id} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="flex shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
                    aria-label={
                      done ? "未完了にする" : "完了にする"
                    }
                  >
                    {done ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <Link
                    href={item.href}
                    className={`flex-1 text-sm transition-colors hover:text-primary ${
                      done
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {t(item.labelKey as Parameters<typeof t>[0])}
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
