/**
 * ブラウザ通知ユーティリティ
 *
 * Web Notifications API のラッパー。
 * Service Worker 不要（ページがアクティブな間のみ通知を送信）。
 */

// localStorage キー
const NOTIFICATION_ENABLED_KEY = "notification_enabled";

/** ブラウザが Web Notifications API に対応しているか */
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/** 現在の通知許可状態を取得 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!isNotificationSupported()) return null;
  return Notification.permission;
}

/** 通知許可をリクエスト */
export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (!isNotificationSupported()) return null;
  const permission = await Notification.requestPermission();
  return permission;
}

/** ユーザーが通知を有効にしているか（localStorage ベース） */
export function isNotificationEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(NOTIFICATION_ENABLED_KEY);
  // デフォルトは true（初回は有効）
  return stored === null ? true : stored === "true";
}

/** 通知の有効/無効を設定 */
export function setNotificationEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFICATION_ENABLED_KEY, String(enabled));
}

/** ブラウザ通知を送信 */
export function sendBrowserNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    onClick?: () => void;
  }
): Notification | null {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== "granted") return null;
  if (!isNotificationEnabled()) return null;

  const notification = new Notification(title, {
    body: options?.body,
    icon: options?.icon ?? "/icon-192x192.png",
    tag: options?.tag,
  });

  if (options?.onClick) {
    notification.onclick = () => {
      window.focus();
      options.onClick!();
      notification.close();
    };
  }

  return notification;
}

/**
 * 分析完了通知を送信するヘルパー
 * ブラウザ通知が利用できない場合は false を返す（フォールバックの判定に使用）
 */
export function sendAnalysisCompleteNotification(
  interviewId: string,
  onNavigate: (url: string) => void
): boolean {
  const notification = sendBrowserNotification("分析が完了しました", {
    body: "面接フィードバックの準備ができました。クリックして結果を確認しましょう。",
    tag: `analysis-complete-${interviewId}`,
    onClick: () => {
      onNavigate(`/mock-interview/${interviewId}/result`);
    },
  });

  return notification !== null;
}
