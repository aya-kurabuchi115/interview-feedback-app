"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  shouldShowInactivityBanner,
  getDaysSinceLastPractice,
  dismissReminderBanner,
  getReminderSettings,
  shouldShowReminder,
  FREQUENCY_LABELS,
} from "@/lib/reminder";
import {
  isNotificationSupported,
  sendBrowserNotification,
} from "@/lib/notifications";

/**
 * 練習リマインダーバナー
 *
 * ダッシュボード上部に表示。以下の条件で表示される:
 * - リマインダーが有効
 * - 設定日数以上練習していない場合 => 非アクティブバナー
 * - またはリマインダー時刻を過ぎている場合 => 通知も送信
 */
export function PracticeReminderBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [daysSince, setDaysSince] = useState<number | null>(null);
  const [notificationSent, setNotificationSent] = useState(false);

  useEffect(() => {
    // 非アクティブバナーの判定
    const shouldShow = shouldShowInactivityBanner();
    setShowBanner(shouldShow);

    if (shouldShow) {
      setDaysSince(getDaysSinceLastPractice());
    }

    // リマインダー時刻チェック + ブラウザ通知（ページ表示時のみ）
    if (shouldShowReminder() && isNotificationSupported() && !notificationSent) {
      const settings = getReminderSettings();
      const notifKey = `reminder_notif_${new Date().toISOString().slice(0, 10)}`;
      const alreadySent = localStorage.getItem(notifKey);

      if (!alreadySent) {
        sendBrowserNotification("面接練習の時間です", {
          body: `今日の面接練習をしましょう！（${FREQUENCY_LABELS[settings.frequency]}リマインダー）`,
          tag: "practice-reminder",
          onClick: () => {
            window.location.href = "/dashboard";
          },
        });
        localStorage.setItem(notifKey, "true");
        setNotificationSent(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!showBanner) return null;

  const getMessage = () => {
    if (daysSince === null) return "";
    if (daysSince >= 14) {
      return `${daysSince}日間練習していません。久しぶりに面接練習をしませんか？`;
    }
    if (daysSince >= 7) {
      return `${daysSince}日ぶりですね！面接力を維持するために、今日も練習しましょう。`;
    }
    return `${daysSince}日間練習していません。今日こそ面接練習をしましょう！`;
  };

  function handleDismiss() {
    dismissReminderBanner();
    setShowBanner(false);
  }

  return (
    <div
      role="alert"
      className="relative mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30"
    >
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 shrink-0 text-blue-500 dark:text-blue-400" />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {getMessage()}
          </p>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
            定期的な練習が面接成功のカギです。少しの時間でも効果があります。
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              asChild
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Link href="/interview/new">
                面接を記録する
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
            >
              <Link href="/mock-interview">AI模擬面接を試す</Link>
            </Button>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
            >
              今日は表示しない
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="閉じる"
          className="shrink-0 rounded-md p-1 text-blue-400 transition-colors hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
