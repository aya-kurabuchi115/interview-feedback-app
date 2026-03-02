import { test, expect } from "@playwright/test";

// ============================================================
// 質問集ページ — フィルタリング・質問詳細テスト
// ============================================================

test.describe("質問集ページ — フィルタリング", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/questions");
  });

  test("ページタイトルが表示される", async ({ page }) => {
    await expect(page).toHaveTitle(/面接質問集/);
  });

  test("見出しが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "面接質問集" })
    ).toBeVisible();
  });

  test("全件数が表示される", async ({ page }) => {
    // "全 N 問 収録" の表示を確認
    await expect(page.getByText(/全 \d+ 問 収録/)).toBeVisible();
  });

  test("絞り込み検索カードが表示される", async ({ page }) => {
    await expect(page.getByText("絞り込み検索")).toBeVisible();
  });

  test("業界フィルタボタンが表示される", async ({ page }) => {
    const industries = ["IT", "金融", "コンサル", "メーカー", "商社"];
    for (const industry of industries) {
      await expect(
        page.getByRole("button", { name: industry, exact: true })
      ).toBeVisible();
    }
  });

  test("面接ラウンドフィルタボタンが表示される", async ({ page }) => {
    const rounds = ["1次", "2次", "最終", "GD", "ケース"];
    for (const round of rounds) {
      await expect(
        page.getByRole("button", { name: round, exact: true })
      ).toBeVisible();
    }
  });

  test("質問タイプフィルタボタンが表示される", async ({ page }) => {
    const types = ["自己PR", "志望動機", "ガクチカ", "逆質問"];
    for (const type of types) {
      await expect(
        page.getByRole("button", { name: type, exact: true })
      ).toBeVisible();
    }
  });

  test("テキスト検索で質問を絞り込める", async ({ page }) => {
    const searchInput = page.getByPlaceholder("質問を検索...");
    await searchInput.fill("自己PR");

    // 絞り込み結果が表示される
    await expect(page.getByText(/\d+ 件の質問が見つかりました/)).toBeVisible();
  });

  test("業界フィルタで質問を絞り込める", async ({ page }) => {
    // IT をクリック
    await page.getByRole("button", { name: "IT", exact: true }).click();

    // 絞り込み結果件数が表示される
    await expect(page.getByText(/\d+ 件の質問が見つかりました/)).toBeVisible();

    // フィルタをクリアボタンが表示される
    await expect(
      page.getByRole("button", { name: "フィルタをクリア" })
    ).toBeVisible();
  });

  test("ラウンドフィルタで質問を絞り込める", async ({ page }) => {
    // 最終 をクリック
    await page.getByRole("button", { name: "最終", exact: true }).click();

    // 件数表示の確認
    await expect(page.getByText(/\d+ 件の質問が見つかりました/)).toBeVisible();
  });

  test("タイプフィルタで質問を絞り込める", async ({ page }) => {
    // 志望動機 をクリック
    await page
      .getByRole("button", { name: "志望動機", exact: true })
      .click();

    // 件数表示の確認
    await expect(page.getByText(/\d+ 件の質問が見つかりました/)).toBeVisible();
  });

  test("フィルタをクリアで全件に戻る", async ({ page }) => {
    // 最初の全件数を取得
    const allCountText = await page
      .getByText(/\d+ 件の質問が見つかりました/)
      .textContent();

    // フィルタを適用
    await page.getByRole("button", { name: "金融", exact: true }).click();

    // フィルタをクリア
    await page.getByRole("button", { name: "フィルタをクリア" }).click();

    // 全件数に戻る
    await expect(page.getByText(allCountText!)).toBeVisible();
  });

  test("フィルタのトグル動作 — 同じボタンを2回クリックでフィルタ解除", async ({
    page,
  }) => {
    // 全件数を取得
    const allCountText = await page
      .getByText(/\d+ 件の質問が見つかりました/)
      .textContent();

    // IT をクリック → フィルタ適用
    await page.getByRole("button", { name: "IT", exact: true }).click();

    // もう一度 IT をクリック → フィルタ解除
    await page.getByRole("button", { name: "IT", exact: true }).click();

    // 全件数に戻る
    await expect(page.getByText(allCountText!)).toBeVisible();
  });

  test("複数フィルタの組み合わせが動作する", async ({ page }) => {
    // 業界: IT を選択
    await page.getByRole("button", { name: "IT", exact: true }).click();

    // タイプ: 自己PR を選択
    await page
      .getByRole("button", { name: "自己PR", exact: true })
      .click();

    // 件数が表示される（組み合わせ絞り込み）
    await expect(page.getByText(/\d+ 件の質問が見つかりました/)).toBeVisible();
  });

  test("質問カードをクリックすると詳細ページに遷移する", async ({ page }) => {
    // 最初の質問カードをクリック
    const firstCard = page.locator('a[href^="/questions/q"]').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    // URL が /questions/qXXX 形式に遷移
    await expect(page).toHaveURL(/\/questions\/q\d+/);
  });

  test("絞り込み結果がゼロの場合にメッセージが表示される", async ({ page }) => {
    // ありえない検索文字列
    const searchInput = page.getByPlaceholder("質問を検索...");
    await searchInput.fill("zzzzxxxxxyyyyy");

    // ゼロ件メッセージの確認
    await expect(
      page.getByText("条件に一致する質問が見つかりませんでした")
    ).toBeVisible();
  });
});

test.describe("質問詳細ページ", () => {
  test("質問詳細ページが表示される", async ({ page }) => {
    await page.goto("/questions/q001");
    await expect(
      page.getByRole("heading", { level: 1, name: "自己PRをしてください。" })
    ).toBeVisible();
  });

  test("パンくずナビゲーションが表示される", async ({ page }) => {
    await page.goto("/questions/q001");
    await expect(
      page.getByRole("link", { name: "面接質問集に戻る" })
    ).toBeVisible();
  });

  test("回答のポイントセクションが表示される", async ({ page }) => {
    await page.goto("/questions/q001");
    await expect(page.getByText("回答のポイント")).toBeVisible();
  });

  test("難易度バッジが表示される", async ({ page }) => {
    await page.goto("/questions/q001");
    // q001 は easy = "基本"
    await expect(page.getByText("基本")).toBeVisible();
  });

  test("質問タイプバッジが表示される", async ({ page }) => {
    await page.goto("/questions/q001");
    await expect(page.getByText("自己PR").first()).toBeVisible();
  });

  test("関連する質問セクションが表示される", async ({ page }) => {
    await page.goto("/questions/q001");
    await expect(page.getByText("関連する質問")).toBeVisible();
  });

  test("カテゴリから探すセクションが表示される", async ({ page }) => {
    await page.goto("/questions/q001");
    await expect(page.getByText("カテゴリから探す")).toBeVisible();
  });

  test("対象業界セクションが表示される", async ({ page }) => {
    await page.goto("/questions/q001");
    await expect(page.getByText("対象業界")).toBeVisible();
  });

  test("模擬面接を始めるリンクが表示される", async ({ page }) => {
    await page.goto("/questions/q001");
    await expect(
      page.getByRole("link", { name: /模擬面接を始める/ })
    ).toBeVisible();
  });

  test("パンくずから質問一覧に戻れる", async ({ page }) => {
    await page.goto("/questions/q001");
    await page.getByRole("link", { name: "面接質問集に戻る" }).click();
    await expect(page).toHaveURL(/\/questions$/);
  });

  test("存在しない質問IDで 404 が表示される", async ({ page }) => {
    await page.goto("/questions/q99999");
    await expect(page.getByText("404")).toBeVisible();
  });

  test("JSON-LD 構造化データが埋め込まれている", async ({ page }) => {
    await page.goto("/questions/q001");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();

    const content = await jsonLd.textContent();
    expect(content).toBeTruthy();
    const parsed = JSON.parse(content!);
    expect(parsed["@type"]).toBe("QAPage");
  });
});

test.describe("質問集ページ — SEO", () => {
  test("meta description が設定されている", async ({ page }) => {
    await page.goto("/questions");
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /面接/);
  });

  test("JSON-LD FAQPage が埋め込まれている", async ({ page }) => {
    await page.goto("/questions");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();

    const content = await jsonLd.textContent();
    expect(content).toBeTruthy();
    const parsed = JSON.parse(content!);
    expect(parsed["@type"]).toBe("FAQPage");
  });
});
