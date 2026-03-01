import * as Sentry from "@sentry/nextjs";

/**
 * Cookie 同意状態を localStorage から取得する。
 * sentry.client.config.ts はモジュールスコープで実行されるため、
 * ここでは初期値のみ読み取り、同意変更後はイベントリスナーで対応する。
 */
function getConsentLevel(): "essential" | "all" | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem("cookie_consent");
  if (value === "essential" || value === "all") return value;
  return null;
}

const consentLevel = getConsentLevel();
const hasFullConsent = consentLevel === "all";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
  sendDefaultPii: false,
  // セッションリプレイは「すべて許可」の場合のみ有効
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: hasFullConsent ? 1.0 : 0,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
      delete event.user.username;
    }
    return event;
  },
  integrations: hasFullConsent
    ? [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ]
    : [],
});

/**
 * Cookie 同意変更イベントを監視し、
 * 「すべて許可」が選択された場合にリプレイ統合を動的に追加する。
 */
if (typeof window !== "undefined") {
  window.addEventListener("cookie-consent-change", ((
    event: CustomEvent<{ level: string }>
  ) => {
    if (event.detail.level === "all") {
      const client = Sentry.getClient();
      if (client) {
        client.addIntegration(
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          })
        );
      }
    }
  }) as EventListener);
}
