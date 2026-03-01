import { test, expect } from "@playwright/test";

test.describe("プライバシーポリシーページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/legal/privacy");
  });

  test("ページタイトルが正しく表示される", async ({ page }) => {
    await expect(page).toHaveTitle(/プライバシーポリシー/);
  });

  test("見出しが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "プライバシーポリシー" })
    ).toBeVisible();
  });

  test("目次が表示される", async ({ page }) => {
    await expect(page.getByText("目次")).toBeVisible();
    await expect(page.getByRole("link", { name: "はじめに" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "お問い合わせ" })
    ).toBeVisible();
  });

  test("主要セクションが存在する", async ({ page }) => {
    await expect(page.getByText("1. はじめに")).toBeVisible();
    await expect(page.getByText("3. 収集する情報")).toBeVisible();
    await expect(page.getByText("5. 第三者提供")).toBeVisible();
    await expect(page.getByText("13. お問い合わせ")).toBeVisible();
  });

  test("トップページへの戻りリンクが存在する", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "トップページに戻る" })
    ).toBeVisible();
  });
});

test.describe("利用規約ページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/legal/terms");
  });

  test("ページタイトルが正しく表示される", async ({ page }) => {
    await expect(page).toHaveTitle(/利用規約/);
  });

  test("見出しが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "利用規約" })
    ).toBeVisible();
  });

  test("目次が表示される", async ({ page }) => {
    await expect(page.getByText("目次")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "第1条 総則" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "附則" })).toBeVisible();
  });

  test("主要セクションが存在する", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "第1条 総則" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "第5条 禁止事項" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "第13条 準拠法・管轄裁判所" })
    ).toBeVisible();
  });

  test("トップページへの戻りリンクが存在する", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "トップページに戻る" })
    ).toBeVisible();
  });
});

test.describe("特定商取引法に基づく表記ページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/legal/tokushoho");
  });

  test("ページタイトルが正しく表示される", async ({ page }) => {
    await expect(page).toHaveTitle(/特定商取引法に基づく表記/);
  });

  test("見出しが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "特定商取引法に基づく表記" })
    ).toBeVisible();
  });

  test("テーブルに必須項目が表示される", async ({ page }) => {
    await expect(page.getByText("販売業者")).toBeVisible();
    await expect(page.getByText("販売価格")).toBeVisible();
    await expect(page.getByText("支払方法")).toBeVisible();
    await expect(page.getByText("返品・キャンセル")).toBeVisible();
    await expect(page.getByText("動作環境")).toBeVisible();
  });

  test("問い合わせメールアドレスが表示される", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "support@interviewcoach.jp" }).first()
    ).toBeVisible();
  });

  test("関連ページへのリンクが存在する", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "利用規約" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "プライバシーポリシー" })
    ).toBeVisible();
  });

  test("トップページへの戻りリンクが存在する", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "トップページに戻る" })
    ).toBeVisible();
  });
});
