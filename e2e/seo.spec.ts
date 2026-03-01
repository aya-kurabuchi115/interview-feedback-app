import { test, expect } from "@playwright/test";

test.describe("SEO メタ情報", () => {
  test("トップページに meta description が設定されている", async ({
    page,
  }) => {
    await page.goto("/");
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /.+/);
  });

  test("トップページに OGP タグが設定されている", async ({ page }) => {
    await page.goto("/");

    // og:title
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /InterviewCoach/);

    // og:description
    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute("content", /.+/);

    // og:url
    const ogUrl = page.locator('meta[property="og:url"]');
    await expect(ogUrl).toHaveAttribute("content", /.+/);

    // og:type
    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute("content", "website");

    // og:locale
    const ogLocale = page.locator('meta[property="og:locale"]');
    await expect(ogLocale).toHaveAttribute("content", "ja_JP");
  });

  test("トップページに Twitter Card タグが設定されている", async ({
    page,
  }) => {
    await page.goto("/");

    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute(
      "content",
      "summary_large_image"
    );

    const twitterTitle = page.locator('meta[name="twitter:title"]');
    await expect(twitterTitle).toHaveAttribute("content", /InterviewCoach/);
  });

  test("トップページに JSON-LD 構造化データが埋め込まれている", async ({
    page,
  }) => {
    await page.goto("/");

    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();

    const content = await jsonLd.textContent();
    expect(content).toBeTruthy();

    const parsed = JSON.parse(content!);
    expect(parsed["@context"]).toBe("https://schema.org");
  });

  test("html lang 属性が ja に設定されている", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "ja");
  });
});

test.describe("robots.txt / sitemap.xml", () => {
  test("robots.txt にアクセスできる", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.ok()).toBeTruthy();

    const body = await response.text();
    expect(body).toContain("User-Agent:");
    expect(body).toContain("Allow: /");
    expect(body).toContain("sitemap.xml");
  });

  test("robots.txt で認証ページがブロックされている", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");
    const body = await response.text();

    expect(body).toContain("Disallow: /dashboard");
    expect(body).toContain("Disallow: /interview");
    expect(body).toContain("Disallow: /profile");
    expect(body).toContain("Disallow: /api");
  });

  test("sitemap.xml にアクセスできる", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.ok()).toBeTruthy();

    const body = await response.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("interviewcoach.jp");
  });

  test("sitemap.xml に主要ページが含まれている", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();

    // 公開ページの URL が含まれていることを確認
    expect(body).toContain("interviewcoach.jp</loc>");
    expect(body).toContain("/legal/privacy</loc>");
    expect(body).toContain("/legal/terms</loc>");
    expect(body).toContain("/legal/tokushoho</loc>");
  });
});
