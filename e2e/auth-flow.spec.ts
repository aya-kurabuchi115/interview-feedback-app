import { test, expect } from "@playwright/test";

// ============================================================
// 認証フロー — ページ UI 確認 & 未認証リダイレクト
// ============================================================

test.describe("ログインページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("ページタイトルが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "ログイン" })
    ).toBeVisible();
  });

  test("メールアドレスとパスワードの入力欄が表示される", async ({ page }) => {
    await expect(page.getByLabel("メールアドレス")).toBeVisible();
    await expect(page.getByLabel("パスワード")).toBeVisible();
  });

  test("ログインボタンが表示される", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "ログイン" })
    ).toBeVisible();
  });

  test("サインアップへのリンクが表示される", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "サインアップ" })
    ).toBeVisible();
  });

  test("パスワードを忘れた方リンクが表示される", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "パスワードを忘れた方" })
    ).toBeVisible();
  });

  test("空フォームでは送信されない（HTML バリデーション）", async ({ page }) => {
    const emailInput = page.getByLabel("メールアドレス");
    // required 属性を確認
    await expect(emailInput).toHaveAttribute("required", "");
  });

  test("サインアップリンクが /signup に遷移する", async ({ page }) => {
    await page.getByRole("link", { name: "サインアップ" }).click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("パスワードリセットリンクが /reset-password に遷移する", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "パスワードを忘れた方" }).click();
    await expect(page).toHaveURL(/\/reset-password/);
  });
});

test.describe("サインアップページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
  });

  test("ページタイトルが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "アカウント作成" })
    ).toBeVisible();
  });

  test("メールアドレスとパスワードの入力欄が表示される", async ({ page }) => {
    await expect(page.getByLabel("メールアドレス")).toBeVisible();
    await expect(page.getByLabel("パスワード")).toBeVisible();
  });

  test("利用規約とプライバシーポリシーへの同意チェックボックスが表示される", async ({
    page,
  }) => {
    await expect(page.getByText("利用規約")).toBeVisible();
    await expect(page.getByText("プライバシーポリシー")).toBeVisible();
  });

  test("サインアップボタンは同意チェック前は無効", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "サインアップ" })
    ).toBeDisabled();
  });

  test("同意チェック後にサインアップボタンが有効になる", async ({ page }) => {
    await page.getByLabel(/利用規約/).check();
    await expect(
      page.getByRole("button", { name: "サインアップ" })
    ).toBeEnabled();
  });

  test("ログインへのリンクが表示される", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "ログイン" })
    ).toBeVisible();
  });

  test("ログインリンクが /login に遷移する", async ({ page }) => {
    await page.getByRole("link", { name: "ログイン" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("パスワードリセットページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/reset-password");
  });

  test("ページタイトルが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "パスワードリセット" })
    ).toBeVisible();
  });

  test("メールアドレス入力欄が表示される", async ({ page }) => {
    await expect(page.getByLabel("メールアドレス")).toBeVisible();
  });

  test("リセットメール送信ボタンが表示される", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "リセットメールを送信" })
    ).toBeVisible();
  });

  test("ログインページに戻るリンクが表示される", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "ログインページに戻る" })
    ).toBeVisible();
  });
});

test.describe("認証リダイレクト — 追加パス", () => {
  test("ES添削ページは未認証でログインにリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/es-review");
    await expect(page).toHaveURL(/\/login/);
  });

  test("ES添削履歴ページは未認証でログインにリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/es-review/history");
    await expect(page).toHaveURL(/\/login/);
  });

  test("プロフィールページは未認証でログインにリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);
  });

  test("オンボーディングページは未認証でログインにリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/login/);
  });

  test("プラン管理ページは未認証でログインにリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/settings/billing");
    await expect(page).toHaveURL(/\/login/);
  });

  test("面接記録作成ページは未認証でログインにリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/interview/new");
    await expect(page).toHaveURL(/\/login/);
  });
});
