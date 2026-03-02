"use client";

import dynamic from "next/dynamic";

const CookieConsent = dynamic(
  () => import("@/components/cookie-consent").then((mod) => mod.CookieConsent),
  { ssr: false }
);
const SessionMonitor = dynamic(
  () =>
    import("@/components/session-monitor").then((mod) => mod.SessionMonitor),
  { ssr: false }
);
const MobileCTA = dynamic(
  () => import("@/components/mobile-cta").then((mod) => mod.MobileCTA),
  { ssr: false }
);
const CommandPalette = dynamic(
  () =>
    import("@/components/command-palette").then((mod) => mod.CommandPalette),
  { ssr: false }
);

/**
 * レイアウトで使用するクライアントコンポーネント群。
 * dynamic import でバンドル分割し、初期 JS サイズを削減する。
 */
export function ClientShell() {
  return (
    <>
      <CommandPalette />
      <SessionMonitor />
      <MobileCTA />
      <CookieConsent />
    </>
  );
}
