import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E テスト設定
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  /* テスト実行の最大タイムアウト */
  timeout: 30_000,
  /* expect のタイムアウト */
  expect: {
    timeout: 5_000,
  },
  /* テスト全体のタイムアウト（CI 環境向け） */
  globalTimeout: 10 * 60_000,
  /* CI では並列実行を抑制 */
  fullyParallel: true,
  /* CI ではリトライを 2 回に設定 */
  retries: process.env.CI ? 2 : 0,
  /* CI ではワーカー数を 1 に制限 */
  workers: process.env.CI ? 1 : undefined,
  /* レポーター */
  reporter: "html",
  /* 全プロジェクト共通設定 */
  use: {
    baseURL: "http://localhost:3000",
    /* 失敗時にスクリーンショットを自動取得 */
    screenshot: "only-on-failure",
    /* 失敗時にトレースを取得 */
    trace: "on-first-retry",
  },
  /* ブラウザプロジェクト（MVP: Chromium のみ） */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  /* dev サーバーの自動起動設定 */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
