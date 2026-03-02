"use client";

import dynamic from "next/dynamic";

// 初期表示に不要なクライアントコンポーネントを遅延ロード（バンドルサイズ最適化）
// Next.js 16 では Server Component 内で dynamic({ ssr: false }) が使えないため、
// Client Component に分離して遅延ロードを実現する
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

/**
 * レイアウトで使用するクライアントコンポーネント群。
 * dynamic import でバンドル分割し、初期 JS サイズを削減する。
 */
export function ClientShell() {
  return (
    <>
      <SessionMonitor />
      <MobileCTA />
      <CookieConsent />
    </>
  );
}
