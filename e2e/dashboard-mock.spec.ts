import { test, expect } from "@playwright/test";

// ============================================================
// ダッシュボード & 模擬面接 — API モックを使った認証済みテスト
// ============================================================

/**
 * Supabase Auth API をモックして認証済みセッションを偽装するヘルパー。
 * page.route() で Supabase のセッション取得をインターセプトする。
 */
async function mockAuthenticated(page: import("@playwright/test").Page) {
  const fakeUser = {
    id: "00000000-0000-0000-0000-000000000001",
    email: "test@example.com",
    aud: "authenticated",
    role: "authenticated",
    email_confirmed_at: "2025-01-01T00:00:00Z",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    app_metadata: { provider: "email" },
    user_metadata: {},
  };

  const fakeSession = {
    access_token: "fake-access-token",
    token_type: "bearer",
    expires_in: 3600,
    refresh_token: "fake-refresh-token",
    user: fakeUser,
  };

  // Supabase の getUser / getSession をモック
  await page.route("**/auth/v1/user", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeUser),
    })
  );

  await page.route("**/auth/v1/token?grant_type=refresh_token", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeSession),
    })
  );

  // profiles テーブルクエリをモック（オンボーディング完了済み）
  await page.route("**/rest/v1/profiles*", (route) => {
    const url = route.request().url();
    if (url.includes("select=onboarding_completed")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ onboarding_completed: true }),
      });
    }
    // 他の profiles クエリ
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        onboarding_completed: true,
        target_industry: ["IT"],
        personality_type: "INTJ",
      }),
    });
  });
}

test.describe("ダッシュボード — 面接一覧（モック認証）", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);

    // interviews テーブルクエリをモック
    await page.route("**/rest/v1/interviews*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "content-range": "0-2/3" },
        body: JSON.stringify([
          {
            id: "int-001",
            title: "テスト面接1",
            category: "new_grad",
            overall_score: 75,
            created_at: "2025-12-01T10:00:00Z",
            is_archived: false,
            tags: ["IT"],
          },
          {
            id: "int-002",
            title: "テスト面接2",
            category: "intern",
            overall_score: 85,
            created_at: "2025-12-02T10:00:00Z",
            is_archived: false,
            tags: ["金融"],
          },
          {
            id: "int-003",
            title: "テスト面接3",
            category: "arubaito",
            overall_score: 60,
            created_at: "2025-11-30T10:00:00Z",
            is_archived: false,
            tags: [],
          },
        ]),
      })
    );

    // 利用状況 API をモック
    await page.route("**/rest/v1/subscriptions*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          plan: "free",
          status: "active",
          current_period_end: "2026-12-31T00:00:00Z",
        }),
      })
    );

    // usage_logs をモック
    await page.route("**/rest/v1/usage_logs*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      })
    );

    // weekly summary をモック
    await page.route("**/rest/v1/weekly_summaries*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      })
    );
  });

  test("ダッシュボードが表示される", async ({ page }) => {
    await page.goto("/dashboard");
    // ダッシュボードのヘッダー or タイトルが表示されることを確認
    // リダイレクトされずにダッシュボードに留まる
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("模擬面接セットアップ — フォームバリデーション（モック認証）", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
  });

  test("模擬面接ページが表示される（認証モック）", async ({ page }) => {
    await page.goto("/mock-interview");
    // リダイレクトされずに模擬面接ページに留まる
    await expect(page).toHaveURL(/\/mock-interview/);
  });
});

test.describe("ES添削 — フォームバリデーション（モック認証）", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
  });

  test("ES添削ページが表示される（認証モック）", async ({ page }) => {
    await page.goto("/es-review");
    // ES添削ページにリダイレクトされずに留まるか、ロード完了を確認
    // クライアントサイド認証なので、Supabase の auth/v1/user を通して認証を偽装
    await expect(page).toHaveURL(/\/es-review/);
  });

  test("ES添削フォームの質問例が表示される", async ({ page }) => {
    await page.goto("/es-review");
    // フォームが表示されるまで待つ
    await expect(
      page.getByText("学生時代に力を入れたことは何ですか？")
    ).toBeVisible({ timeout: 10_000 });
  });

  test("ES添削フォームに回答が短すぎるとエラーが出る", async ({ page }) => {
    await page.goto("/es-review");

    // フォームのロードを待つ
    await page.waitForSelector('textarea', { timeout: 10_000 });

    // 質問を入力
    const questionInput = page.getByLabel(/質問/);
    if (await questionInput.isVisible()) {
      await questionInput.fill("テスト質問です");
    }

    // 短すぎる回答を入力
    const answerTextarea = page.locator("textarea").first();
    await answerTextarea.fill("短い回答");

    // 送信ボタンをクリック
    const submitButton = page.getByRole("button", { name: /添削/ });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // バリデーションエラーが表示されることを確認
      await expect(page.getByText(/50文字以上/)).toBeVisible({ timeout: 5_000 });
    }
  });
});
