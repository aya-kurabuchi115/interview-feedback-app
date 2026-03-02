import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // 画像最適化: WebP/AVIF フォーマットに対応
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // セキュリティヘッダー（middleware 非経由のリクエストにも適用）
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        // クリックジャッキング防止
        { key: "X-Frame-Options", value: "DENY" },
        // MIME タイプスニッフィング防止
        { key: "X-Content-Type-Options", value: "nosniff" },
        // リファラー制御
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        // ブラウザ機能制限（マイクは面接録音で必要）
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(self), geolocation=()",
        },
        // DNS プリフェッチ有効化
        { key: "X-DNS-Prefetch-Control", value: "on" },
        // HTTPS 強制（2年間 + サブドメイン + preload）
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ],
    },
  ],
};

export default withBundleAnalyzer(
  withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    sourcemaps: {
      disable: !process.env.SENTRY_AUTH_TOKEN,
    },
    silent: !process.env.CI,
    bundleSizeOptimizations: {
      excludeDebugStatements: true,
      excludeReplayIframe: true,
      excludeReplayShadowDom: true,
    },
    authToken: process.env.SENTRY_AUTH_TOKEN,
    telemetry: false,
  })
);
