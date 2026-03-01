import { test, expect } from "@playwright/test";

// ============================================================
// パーソナリティ一覧ページ（/personality）
// ============================================================
test.describe("パーソナリティ一覧ページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/personality");
  });

  test("ページが表示される", async ({ page }) => {
    await expect(page).toHaveTitle(/16パーソナリティ/);
  });

  test("見出しが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1 })
    ).toContainText("16パーソナリティ診断");
  });

  test("16タイプのカードが表示される", async ({ page }) => {
    // 全16タイプのラベルが表示されていることを確認
    const types = [
      "INTJ", "INTP", "ENTJ", "ENTP",
      "INFJ", "INFP", "ENFJ", "ENFP",
      "ISTJ", "ISFJ", "ESTJ", "ESFJ",
      "ISTP", "ISFP", "ESTP", "ESFP",
    ];
    for (const t of types) {
      await expect(page.getByText(t, { exact: true }).first()).toBeVisible();
    }
  });

  test("4つのグループ見出しが表示される", async ({ page }) => {
    await expect(page.getByText("分析家").first()).toBeVisible();
    await expect(page.getByText("外交官").first()).toBeVisible();
    await expect(page.getByText("番人").first()).toBeVisible();
    await expect(page.getByText("探検家").first()).toBeVisible();
  });

  test("CTAセクションが表示される", async ({ page }) => {
    await expect(
      page.getByText("あなたはどのタイプ？")
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /今すぐ診断する/ })
    ).toBeVisible();
  });

  test("タイプカードから詳細ページへ遷移できる", async ({ page }) => {
    // INTJ カードをクリック
    await page.getByRole("link", { name: /INTJ/ }).first().click();
    await expect(page).toHaveURL(/\/personality\/intj/);
  });
});

// ============================================================
// パーソナリティ詳細ページ（/personality/[type]）
// ============================================================
test.describe("パーソナリティ詳細ページ", () => {
  test("INTJ 詳細ページが表示される", async ({ page }) => {
    await page.goto("/personality/intj");
    await expect(page).toHaveTitle(/INTJ/);
    await expect(
      page.getByRole("heading", { level: 1 })
    ).toContainText("建築家");
  });

  test("キャラクター画像が表示される", async ({ page }) => {
    await page.goto("/personality/intj");
    await expect(
      page.getByAltText("建築家のキャラクター")
    ).toBeVisible();
  });

  test("グループバッジが表示される", async ({ page }) => {
    await page.goto("/personality/intj");
    await expect(page.getByText("分析家").first()).toBeVisible();
  });

  test("性格の強み・弱みセクションが表示される", async ({ page }) => {
    await page.goto("/personality/intj");
    await expect(page.getByText("性格の強み")).toBeVisible();
    await expect(page.getByText("気をつけたいポイント")).toBeVisible();
  });

  test("面接の強み・弱みセクションが表示される", async ({ page }) => {
    await page.goto("/personality/intj");
    await expect(page.getByText("面接での強み")).toBeVisible();
    await expect(page.getByText("面接で気をつけること")).toBeVisible();
  });

  test("相性の良い業界セクションが表示される", async ({ page }) => {
    await page.goto("/personality/intj");
    await expect(page.getByText("相性の良い業界")).toBeVisible();
    await expect(page.getByText("コンサルティング")).toBeVisible();
  });

  test("面接コーチからのアドバイスが表示される", async ({ page }) => {
    await page.goto("/personality/intj");
    await expect(page.getByText("面接コーチからのアドバイス")).toBeVisible();
  });

  test("SNSシェアボタンが存在する", async ({ page }) => {
    await page.goto("/personality/intj");
    await expect(page.getByText("シェア:")).toBeVisible();
    await expect(page.getByLabel("Xでシェア")).toBeVisible();
    await expect(page.getByLabel("LINEでシェア")).toBeVisible();
    await expect(page.getByLabel("リンクをコピー")).toBeVisible();
  });

  test("パンくずリストが表示される", async ({ page }) => {
    await page.goto("/personality/intj");
    await expect(
      page.getByRole("link", { name: /16パーソナリティ一覧/ })
    ).toBeVisible();
  });

  test("同グループの他タイプが表示される", async ({ page }) => {
    await page.goto("/personality/intj");
    await expect(page.getByText(/同じ「分析家」グループのタイプ/)).toBeVisible();
    // INTJ は分析家グループ → 他の3タイプが表示される
    await expect(page.getByText("INTP").first()).toBeVisible();
    await expect(page.getByText("ENTJ").first()).toBeVisible();
    await expect(page.getByText("ENTP").first()).toBeVisible();
  });

  test("小文字の URL でもページが表示される", async ({ page }) => {
    await page.goto("/personality/enfp");
    await expect(page).toHaveTitle(/ENFP/);
    await expect(
      page.getByRole("heading", { level: 1 })
    ).toContainText("広報活動家");
  });

  test("存在しないタイプは 404 になる", async ({ page }) => {
    await page.goto("/personality/xxxx");
    await expect(page.getByText("404")).toBeVisible();
  });
});

// ============================================================
// 診断ページ（/personality/diagnosis）認証チェック
// ============================================================
test.describe("パーソナリティ診断ページ", () => {
  test("未認証の場合ログインページにリダイレクトされる", async ({ page }) => {
    await page.goto("/personality/diagnosis");
    // 認証チェックにより /login にリダイレクトされる
    await expect(page).toHaveURL(/\/login/);
  });
});
