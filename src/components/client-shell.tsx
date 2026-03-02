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
 * レイアウトで使用するクライアントコンポーネント群
 * Next.js 16 では Server Component 内で dynamic({ ssr: false }) が禁止されたため、
 * Client Component に分離して遅延ロードを実現する
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
