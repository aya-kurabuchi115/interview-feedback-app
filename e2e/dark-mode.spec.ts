import { test, expect } from "@playwright/test";

// ============================================================
// ダークモード切替 E2E テスト
// ============================================================

test.describe("ダークモード切替", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("テーマ切替ボタンが表示される", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "テーマを切り替え" })
    ).toBeVisible();
  });

  test("ダークモードに切り替えるとhtml要素にdarkクラスが付与される", async ({
    page,
  }) => {
    // テーマ切替ボタンをクリック
    await page.getByRole("button", { name: "テーマを切り替え" }).click();

    // ダークを選択
    await page.getByRole("menuitem", { name: "ダーク" }).click();

    // html 要素に dark クラスが付与されることを確認
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("ライトモードに切り替えるとhtml要素にlightクラスが付与される", async ({
    page,
  }) => {
    // テーマ切替ボタンをクリック
    await page.getByRole("button", { name: "テーマを切り替え" }).click();

    // ライトを選択
    await page.getByRole("menuitem", { name: "ライト" }).click();

    // html 要素に light クラスが付与されることを確認
    await expect(page.locator("html")).toHaveClass(/light/);
  });

  test("システムモードに切り替えるとhtml要素のクラスが正しく設定される", async ({
    page,
  }) => {
    // テーマ切替ボタンをクリック
    await page.getByRole("button", { name: "テーマを切り替え" }).click();

    // システムを選択
    await page.getByRole("menuitem", { name: "システム" }).click();

    // html 要素に light か dark のどちらかのクラスが付与されている
    const htmlClass = await page.locator("html").getAttribute("class");
    expect(htmlClass).toMatch(/light|dark/);
  });

  test("ダークモードでもランディングページの主要コンテンツが表示される", async ({
    page,
  }) => {
    // ダークモードに切り替え
    await page.getByRole("button", { name: "テーマを切り替え" }).click();
    await page.getByRole("menuitem", { name: "ダーク" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    // ヒーローセクションが引き続き表示されている
    await expect(
      page.getByRole("heading", { level: 1 })
    ).toBeVisible();

    // ヘッダーのロゴが表示されている
    await expect(
      page.getByRole("link", { name: /InterviewCoach/ }).first()
    ).toBeVisible();

    // フッターが表示されている
    await expect(
      page.locator("footer").getByText("InterviewCoach. All rights reserved.")
    ).toBeVisible();
  });

  test("テーマ設定がページ遷移後も維持される", async ({ page }) => {
    // ダークモードに切り替え
    await page.getByRole("button", { name: "テーマを切り替え" }).click();
    await page.getByRole("menuitem", { name: "ダーク" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    // 別のページに遷移
    await page.goto("/pricing");
    await page.waitForLoadState("domcontentloaded");

    // ダークモードが維持されている
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("ダークモードでテーマ切替ドロップダウンの選択状態が正しい", async ({
    page,
  }) => {
    // ダークモードに切り替え
    await page.getByRole("button", { name: "テーマを切り替え" }).click();
    await page.getByRole("menuitem", { name: "ダーク" }).click();

    // もう一度開いて「ダーク」が強調されていることを確認
    await page.getByRole("button", { name: "テーマを切り替え" }).click();
    const darkItem = page.getByRole("menuitem", { name: "ダーク" });
    await expect(darkItem).toHaveClass(/font-semibold/);
  });
});
