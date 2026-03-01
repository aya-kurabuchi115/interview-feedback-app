import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // 画像最適化: WebP/AVIF フォーマットに対応
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  silent: !process.env.CI,
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },
  authToken: process.env.SENTRY_AUTH_TOKEN,
  telemetry: false,
});
