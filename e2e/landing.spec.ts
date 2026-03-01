import { test, expect } from "@playwright/test";

test.describe("ランディングページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("ページタイトルが正しく表示される", async ({ page }) => {
    await expect(page).toHaveTitle(/InterviewCoach/);
  });

  test("ヒーローセクションが表示される", async ({ page }) => {
    // メインコピーの表示
    await expect(
      page.getByRole("heading", { level: 1 })
    ).toContainText("面接、もう一人で");

    // サブコピーの表示
    await expect(page.getByText("AIがあなたの面接を分析し")).toBeVisible();

    // CTA ボタンの表示
    await expect(
      page.getByRole("link", { name: "無料で始める" }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "詳しく見る" })
    ).toBeVisible();
  });

  test("特徴セクションが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "3つの強みで面接力を伸ばす" })
    ).toBeVisible();

    // 3つの特徴カードの確認（#features セクション内で絞る）
    const featuresSection = page.locator("#features");
    await expect(featuresSection.getByText("AI分析")).toBeVisible();
    await expect(featuresSection.getByText("成長トラッキング").first()).toBeVisible();
    await expect(featuresSection.getByText("パーソナライズ").first()).toBeVisible();
  });

  test("使い方セクションが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "かんたん3ステップ" })
    ).toBeVisible();

    await expect(page.getByRole("heading", { name: "面接を記録" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "AIが分析" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "フィードバックで改善" })).toBeVisible();
  });

  test("料金プランセクションが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "料金プラン" }).first()
    ).toBeVisible();

    // 無料プランの表示
    await expect(page.getByText("無料プラン").first()).toBeVisible();
    await expect(page.getByText("¥0").first()).toBeVisible();

    // Pro プランの表示
    await expect(page.getByText("Pro プラン").first()).toBeVisible();
    await expect(page.getByText("¥980").first()).toBeVisible();
  });

  test("CTA セクションが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "今すぐ始めよう" })
    ).toBeVisible();
  });

  test("フッターにリンクが表示される", async ({ page }) => {
    const footer = page.locator("footer");

    await expect(footer.getByRole("link", { name: "利用規約" })).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "プライバシーポリシー" })
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "特定商取引法に基づく表記" })
    ).toBeVisible();
  });

  test("フッターのコピーライトが表示される", async ({ page }) => {
    await expect(
      page.locator("footer").getByText("InterviewCoach. All rights reserved.")
    ).toBeVisible();
  });
});
