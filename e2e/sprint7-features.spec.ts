import { test, expect } from "@playwright/test";

// ============================================================
// 料金ページ（未ログイン状態で閲覧可能）
// ============================================================
test.describe("料金ページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
  });

  test("ページタイトルが表示される", async ({ page }) => {
    await expect(page).toHaveTitle(/料金プラン/);
  });

  test("3つのプランが表示される", async ({ page }) => {
    // 無料プラン
    await expect(page.getByText("無料プラン").first()).toBeVisible();
    await expect(page.getByText("¥0").first()).toBeVisible();

    // Pro プラン
    await expect(page.getByText("Pro プラン").first()).toBeVisible();
    await expect(page.getByText("¥980").first()).toBeVisible();

    // Premium プラン
    await expect(page.getByText("Premium プラン").first()).toBeVisible();
    await expect(page.getByText("¥1,980").first()).toBeVisible();
  });

  test("各プランの特徴が表示される", async ({ page }) => {
    // 無料プランの特徴
    await expect(page.getByText("月3回まで面接分析")).toBeVisible();

    // Pro プランの特徴
    await expect(page.getByText("月30回まで面接分析")).toBeVisible();

    // Premium プランの特徴
    await expect(page.getByText("無制限の面接分析")).toBeVisible();
  });

  test("未ログイン時にサインアップリンクが表示される", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "無料で始める" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Pro で始める" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Premium で始める" })
    ).toBeVisible();
  });

  test("おすすめバッジが Pro プランに表示される", async ({ page }) => {
    await expect(page.getByText("おすすめ")).toBeVisible();
  });
});

// ============================================================
// 決済完了/キャンセルページ
// ============================================================
test.describe("決済結果ページ", () => {
  test("決済完了ページが表示される", async ({ page }) => {
    await page.goto("/pricing/success");
    await expect(page).toHaveTitle(/決済完了/);
    await expect(
      page.getByText("Pro プランへようこそ!")
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "ダッシュボードへ" })
    ).toBeVisible();
  });

  test("決済キャンセルページが表示される", async ({ page }) => {
    await page.goto("/pricing/cancel");
    await expect(page).toHaveTitle(/決済キャンセル/);
    await expect(
      page.getByText("決済がキャンセルされました")
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "料金プランに戻る" })
    ).toBeVisible();
  });
});

// ============================================================
// 404 ページ
// ============================================================
test.describe("404 エラーページ", () => {
  test("存在しないページにアクセスすると 404 が表示される", async ({
    page,
  }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText("ページが見つかりません")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "ホームに戻る" })
    ).toBeVisible();
  });
});

// ============================================================
// 認証が必要なページへの未認証アクセス
// ============================================================
test.describe("認証リダイレクト", () => {
  test("模擬面接ページは未認証でログインにリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/mock-interview");
    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/login/);
  });

  test("模擬面接履歴ページは未認証でログインにリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/mock-interview/history");
    await expect(page).toHaveURL(/\/login/);
  });

  test("ダッシュボードは未認証でログインにリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("成長ダッシュボードは未認証でログインにリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/dashboard/growth");
    await expect(page).toHaveURL(/\/login/);
  });
});

// ============================================================
// Cookie ポリシーページ
// ============================================================
test.describe("Cookie ポリシーページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/legal/cookies");
  });

  test("ページタイトルが表示される", async ({ page }) => {
    await expect(page).toHaveTitle(/Cookie ポリシー/);
  });

  test("見出しが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "Cookie ポリシー" })
    ).toBeVisible();
  });

  test("Cookie 一覧テーブルが表示される", async ({ page }) => {
    await expect(page.getByText("Cookie 名")).toBeVisible();
    await expect(page.getByText("sb-*-auth-token")).toBeVisible();
    await expect(page.getByText("sentryReplaySession")).toBeVisible();
  });

  test("トップページへの戻りリンクが存在する", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "トップページに戻る" })
    ).toBeVisible();
  });
});

// ============================================================
// API エンドポイントのエラーハンドリング
// ============================================================
test.describe("API エラーハンドリング", () => {
  test("未認証での API アクセスが 401 を返す", async ({ request }) => {
    // mock-interview API
    const mockRes = await request.post("/api/mock-interview", {
      data: { category: "general", round: "first", difficulty: "normal" },
    });
    expect([401, 403]).toContain(mockRes.status());

    // profile API
    const profileRes = await request.get("/api/profile");
    expect([401, 403]).toContain(profileRes.status());
  });

  test("不正なメソッドで API にアクセスすると適切なエラーを返す", async ({
    request,
  }) => {
    // stripe webhook は POST のみ
    const res = await request.get("/api/stripe/webhook");
    expect(res.ok()).toBeFalsy();
  });
});
