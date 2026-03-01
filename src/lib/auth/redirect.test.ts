import { describe, it, expect, vi, beforeEach } from "vitest";

// next/navigation と next/headers のモック
const mockRedirect = vi.fn();
const mockHeaders = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    // Next.js の redirect() は例外をスローして制御フローを中断する
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

vi.mock("next/headers", () => ({
  headers: () => mockHeaders(),
}));

// モック設定後にインポート
import { redirectToLogin } from "./redirect";

describe("auth/redirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ヘッダーからパスが取得できない場合は /login?expired=true にリダイレクトする", async () => {
    mockHeaders.mockResolvedValue({
      get: () => null,
    });

    await expect(redirectToLogin()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/login?expired=true");
  });

  it("x-url ヘッダーからパスを取得してリダイレクト先に含める", async () => {
    mockHeaders.mockResolvedValue({
      get: (name: string) => {
        if (name === "x-url") return "http://localhost:3000/dashboard?tab=history";
        return null;
      },
    });

    await expect(redirectToLogin()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith(
      "/login?expired=true&redirect=%2Fdashboard%3Ftab%3Dhistory"
    );
  });

  it("x-invoke-path ヘッダーをフォールバックとして使用する", async () => {
    mockHeaders.mockResolvedValue({
      get: (name: string) => {
        if (name === "x-invoke-path") return "/settings";
        return null;
      },
    });

    await expect(redirectToLogin()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith(
      "/login?expired=true&redirect=%2Fsettings"
    );
  });

  it("referer ヘッダーをフォールバックとして使用する", async () => {
    mockHeaders.mockResolvedValue({
      get: (name: string) => {
        if (name === "referer") return "http://localhost:3000/interviews/123";
        return null;
      },
    });

    await expect(redirectToLogin()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith(
      "/login?expired=true&redirect=%2Finterviews%2F123"
    );
  });

  it("現在のパスが /login の場合は redirect パラメータを付けない", async () => {
    mockHeaders.mockResolvedValue({
      get: (name: string) => {
        if (name === "x-url") return "http://localhost:3000/login";
        return null;
      },
    });

    await expect(redirectToLogin()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/login?expired=true");
  });

  it("headers() が例外をスローしても /login?expired=true にリダイレクトする", async () => {
    mockHeaders.mockRejectedValue(new Error("headers not available"));

    await expect(redirectToLogin()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/login?expired=true");
  });
});
