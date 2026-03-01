"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SubscriptionPlan } from "@/types/database";

/** localStorage に保存する dismiss キー */
const DISMISS_KEY = "usage_nudge_dismissed";

/**
 * 今月の dismiss キーを生成する。月が変わればリセットされる。
 */
function getMonthlyDismissKey(): string {
  const now = new Date();
  return `${DISMISS_KEY}_${now.getFullYear()}_${now.getMonth()}`;
}

interface UsageNudgeBannerProps {
  plan: SubscriptionPlan;
  remaining: number | null;
  limit: number | null;
  used: number;
}

/**
 * 利用上限ナッジバナー
 *
 * - Free プランで残り1回: 黄色の注意バナー
 * - Free プランで残り0回: 赤色の警告バナー
 * - Pro/Premium/enterprise: 表示しない
 * - 「今月は表示しない」で localStorage に保存
 */
export function UsageNudgeBanner({
  plan,
  remaining,
  limit,
  used,
}: UsageNudgeBannerProps) {
  const [dismissed, setDismissed] = useState(true); // 初期値は非表示（SSR対策）

  useEffect(() => {
    const key = getMonthlyDismissKey();
    const stored = localStorage.getItem(key);
    setDismissed(stored === "true");
  }, []);

  // Free プラン以外は表示しない
  if (plan !== "free") return null;

  // 上限なし or 残り2回以上は表示しない
  if (remaining === null || limit === null) return null;
  if (remaining > 1) return null;

  // dismiss 済みなら表示しない
  if (dismissed) return null;

  const isExhausted = remaining === 0;

  function handleDismiss() {
    const key = getMonthlyDismissKey();
    localStorage.setItem(key, "true");
    setDismissed(true);
  }

  return (
    <div
      role="alert"
      className={`relative mb-6 rounded-lg border p-4 ${
        isExhausted
          ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
          : "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <Sparkles
          className={`mt-0.5 h-5 w-5 shrink-0 ${
            isExhausted
              ? "text-red-500 dark:text-red-400"
              : "text-yellow-500 dark:text-yellow-400"
          }`}
        />

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium ${
              isExhausted
                ? "text-red-800 dark:text-red-200"
                : "text-yellow-800 dark:text-yellow-200"
            }`}
          >
            {isExhausted
              ? "今月の無料枠を使い切りました"
              : `今月の残り利用回数: ${remaining}回（${used}/${limit}回使用済み）`}
          </p>
          <p
            className={`mt-1 text-sm ${
              isExhausted
                ? "text-red-700 dark:text-red-300"
                : "text-yellow-700 dark:text-yellow-300"
            }`}
          >
            {isExhausted
              ? "Pro プランにアップグレードすると、月30回まで分析できます。"
              : "Pro プランなら月30回まで。もっと面接対策を進めませんか？"}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <Button
              size="sm"
              asChild
              className={
                isExhausted
                  ? "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                  : "bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700"
              }
            >
              <Link href="/pricing">
                料金プランを見る
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <button
              type="button"
              onClick={handleDismiss}
              className={`text-xs underline-offset-2 hover:underline ${
                isExhausted
                  ? "text-red-600 dark:text-red-400"
                  : "text-yellow-600 dark:text-yellow-400"
              }`}
            >
              今月は表示しない
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="閉じる"
          className={`shrink-0 rounded-md p-1 transition-colors ${
            isExhausted
              ? "text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
              : "text-yellow-400 hover:text-yellow-600 dark:text-yellow-500 dark:hover:text-yellow-300"
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
