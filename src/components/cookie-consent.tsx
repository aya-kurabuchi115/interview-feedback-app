"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/** localStorage に保存する同意状態のキー */
const CONSENT_KEY = "cookie_consent";

/** ユーザーの Cookie 同意レベル */
export type ConsentLevel = "essential" | "all";

/**
 * 現在の Cookie 同意状態を取得する。
 * 同意未取得の場合は null を返す。
 */
export function getConsentLevel(): ConsentLevel | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "essential" || value === "all") return value;
  return null;
}

/**
 * Cookie 同意バナー。
 * 初回訪問時に画面下部に固定表示し、同意後は非表示にする。
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // localStorage から同意状態を確認
    const consent = getConsentLevel();
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function handleConsent(level: ConsentLevel) {
    localStorage.setItem(CONSENT_KEY, level);
    setVisible(false);

    // カスタムイベントを発火して Sentry など他のスクリプトに通知
    window.dispatchEvent(
      new CustomEvent("cookie-consent-change", { detail: { level } })
    );
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie の使用について"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background p-4 shadow-lg sm:p-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* 説明テキスト */}
        <div className="text-sm text-muted-foreground">
          <p>
            当サイトでは、サービスの提供・改善のために Cookie
            を使用しています。詳しくは{" "}
            <Link
              href="/legal/cookies"
              className="font-medium text-primary underline underline-offset-4 hover:no-underline"
            >
              Cookie ポリシー
            </Link>{" "}
            をご覧ください。
          </p>
        </div>

        {/* ボタン群 */}
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => handleConsent("essential")}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            必須 Cookie のみ
          </button>
          <button
            type="button"
            onClick={() => handleConsent("all")}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            すべて許可
          </button>
        </div>
      </div>
    </div>
  );
}
