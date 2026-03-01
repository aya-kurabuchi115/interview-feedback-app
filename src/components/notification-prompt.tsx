"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationEnabled,
  setNotificationEnabled,
} from "@/lib/notifications";

type PromptState = "idle" | "granted" | "denied" | "unsupported";

/**
 * 通知許可リクエストコンポーネント
 *
 * 分析処理待ちページで表示。
 * - ブラウザが通知非対応の場合は非表示
 * - 既に許可済みの場合は「通知ON」状態を表示
 * - 拒否済みの場合はブラウザ設定への案内を表示
 */
export function NotificationPrompt() {
  const [state, setState] = useState<PromptState>("idle");
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!isNotificationSupported()) {
      setState("unsupported");
      return;
    }

    const permission = getNotificationPermission();
    if (permission === "granted") {
      setState("granted");
    } else if (permission === "denied") {
      setState("denied");
    }

    setEnabled(isNotificationEnabled());
  }, []);

  const handleRequestPermission = useCallback(async () => {
    const permission = await requestNotificationPermission();
    if (permission === "granted") {
      setState("granted");
      setNotificationEnabled(true);
      setEnabled(true);
    } else if (permission === "denied") {
      setState("denied");
    }
  }, []);

  const handleToggle = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    setNotificationEnabled(next);
  }, [enabled]);

  // 非対応ブラウザでは何も表示しない
  if (state === "unsupported") return null;

  // 許可済み: トグルボタンを表示
  if (state === "granted") {
    return (
      <div className="mt-4 flex items-center justify-center gap-2">
        {enabled ? (
          <button
            onClick={handleToggle}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            aria-label="通知を無効にする"
          >
            <Bell className="h-3.5 w-3.5" />
            完了時に通知
            <Check className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            onClick={handleToggle}
            className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/20 bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            aria-label="通知を有効にする"
          >
            <BellOff className="h-3.5 w-3.5" />
            通知OFF
          </button>
        )}
      </div>
    );
  }

  // 拒否済み: ブラウザ設定への案内
  if (state === "denied") {
    return (
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          通知がブロックされています。ブラウザの設定から通知を許可してください。
        </p>
      </div>
    );
  }

  // 未許可: リクエストボタン
  return (
    <div className="mt-4 flex justify-center">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRequestPermission}
        className="gap-2"
      >
        <Bell className="h-4 w-4" />
        分析完了時に通知を受け取る
      </Button>
    </div>
  );
}
