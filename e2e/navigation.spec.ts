import { test, expect } from "@playwright/test";

// ============================================================
// ヘッダー・フッター ナビゲーション E2E テスト
// ============================================================

test.describe("ヘッダーナビゲーション（未ログイン）", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("ロゴが表示されトップページにリンクしている", async ({ page }) => {
    const logo = page.getByRole("link", { name: /InterviewCoach/ }).first();
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("href", "/");
  });

  test("質問集リンクが表示される", async ({ page }) => {
    // Desktop nav（md 以上で表示）
    await expect(
      page.getByRole("link", { name: "質問集" }).first()
    ).toBeVisible();
  });

  test("16パーソナリティリンクが表示される", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "16パーソナリティ" }).first()
    ).toBeVisible();
  });

  test("ログインボタンが表示される", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "ログイン" }).first()
    ).toBeVisible();
  });

  test("無料体験ボタンが表示される", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /無料体験/ }).first()
    ).toBeVisible();
  });

  test("質問集リンクが /questions に遷移する", async ({ page }) => {
    await page.getByRole("link", { name: "質問集" }).first().click();
    await expect(page).toHaveURL(/\/questions/);
  });

  test("16パーソナリティリンクが /personality に遷移する", async ({ page }) => {
    await page
      .getByRole("link", { name: "16パーソナリティ" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/personality/);
  });

  test("ログインリンクが /login に遷移する", async ({ page }) => {
    await page.getByRole("link", { name: "ログイン" }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("無料体験ボタンが /signup に遷移する", async ({ page }) => {
    await page.getByRole("link", { name: /無料体験/ }).first().click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("テーマ切り替えボタンが表示される", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "テーマを切り替え" })
    ).toBeVisible();
  });
});

test.describe("フッターナビゲーション", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("利用規約リンクが /legal/terms に遷移する", async ({ page }) => {
    const footer = page.locator("footer");
    await footer.getByRole("link", { name: "利用規約" }).click();
    await expect(page).toHaveURL(/\/legal\/terms/);
  });

  test("プライバシーポリシーリンクが /legal/privacy に遷移する", async ({
    page,
  }) => {
    const footer = page.locator("footer");
    await footer.getByRole("link", { name: "プライバシーポリシー" }).click();
    await expect(page).toHaveURL(/\/legal\/privacy/);
  });

  test("Cookie ポリシーリンクが /legal/cookies に遷移する", async ({
    page,
  }) => {
    const footer = page.locator("footer");
    await footer.getByRole("link", { name: "Cookie ポリシー" }).click();
    await expect(page).toHaveURL(/\/legal\/cookies/);
  });

  test("特定商取引法リンクが /legal/tokushoho に遷移する", async ({
    page,
  }) => {
    const footer = page.locator("footer");
    await footer
      .getByRole("link", { name: "特定商取引法に基づく表記" })
      .click();
    await expect(page).toHaveURL(/\/legal\/tokushoho/);
  });
});

test.describe("クロスページナビゲーション", () => {
  test("トップ → 質問集 → 質問詳細 → パンくずで戻る", async ({ page }) => {
    // トップページから質問集へ
    await page.goto("/");
    await page.getByRole("link", { name: "質問集" }).first().click();
    await expect(page).toHaveURL(/\/questions/);

    // 最初の質問カードをクリック
    const firstCard = page.locator('a[href^="/questions/q"]').first();
    await firstCard.click();
    await expect(page).toHaveURL(/\/questions\/q\d+/);

    // パンくずで質問集に戻る
    await page.getByRole("link", { name: "面接質問集に戻る" }).click();
    await expect(page).toHaveURL(/\/questions$/);
  });

  test("トップ → パーソナリティ一覧 → タイプ詳細 → パンくずで戻る", async ({
    page,
  }) => {
    // トップからパーソナリティへ
    await page.goto("/");
    await page
      .getByRole("link", { name: "16パーソナリティ" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/personality/);

    // INTJ カードをクリック
    await page.getByRole("link", { name: /INTJ/ }).first().click();
    await expect(page).toHaveURL(/\/personality\/intj/);

    // パンくずで一覧に戻る
    await page
      .getByRole("link", { name: /16パーソナリティ一覧/ })
      .click();
    await expect(page).toHaveURL(/\/personality$/);
  });

  test("料金ページから各プランのサインアップリンクが機能する", async ({
    page,
  }) => {
    await page.goto("/pricing");

    // 無料で始めるリンクをクリック
    await page.getByRole("link", { name: "無料で始める" }).click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("法的ページ間のリンク遷移", async ({ page }) => {
    // 利用規約ページへ
    await page.goto("/legal/terms");
    await expect(
      page.getByRole("heading", { level: 1, name: "利用規約" })
    ).toBeVisible();

    // トップページに戻る
    await page.getByRole("link", { name: "トップページに戻る" }).click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("モバイルナビゲーション", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("ハンバーガーメニューが表示される", async ({ page }) => {
    await page.goto("/");
    // モバイルではハンバーガーメニューボタンが表示される
    const menuButton = page.locator("button").filter({ has: page.locator('svg.lucide-menu') });
    await expect(menuButton).toBeVisible();
  });

  test("ハンバーガーメニューを開くとナビリンクが表示される", async ({
    page,
  }) => {
    await page.goto("/");

    // ハンバーガーメニューをクリック
    const menuButton = page.locator("button").filter({ has: page.locator('svg.lucide-menu') });
    await menuButton.click();

    // シートメニュー内にナビリンクが表示される
    await expect(page.getByRole("link", { name: "質問集" }).last()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "16パーソナリティ" }).last()
    ).toBeVisible();
  });
});
