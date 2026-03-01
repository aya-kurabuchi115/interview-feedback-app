import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// モック設定
// ============================================================

const mockUser = { id: "user-123", email: "test@example.com" };

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockImplementation(async () => mockSupabase),
}));

const mockGetUserSubscription = vi.fn();
const mockGetRemainingUsage = vi.fn();

vi.mock("@/lib/subscription", () => ({
  getUserSubscription: (...args: unknown[]) => mockGetUserSubscription(...args),
  getRemainingUsage: (...args: unknown[]) => mockGetRemainingUsage(...args),
}));

import { GET } from "./route";

// ============================================================
// テスト
// ============================================================

describe("GET /api/subscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe("認証", () => {
    it("未認証の場合は 401 を返す", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const res = await GET();
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.code).toBe("unauthorized");
    });
  });

  describe("正常系", () => {
    it("サブスクリプション情報と利用状況を返す", async () => {
      const subscription = {
        plan: "free",
        status: "active",
        stripeCustomerId: null,
        currentPeriodEnd: null,
        cancelAt: null,
        canceledAt: null,
      };

      const usage = {
        plan: "free",
        used: 1,
        limit: 3,
        remaining: 2,
      };

      mockGetUserSubscription.mockResolvedValue(subscription);
      mockGetRemainingUsage.mockResolvedValue(usage);

      const res = await GET();
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.subscription).toEqual(subscription);
      expect(json.usage).toEqual(usage);
    });

    it("Cache-Control ヘッダーが設定されている", async () => {
      mockGetUserSubscription.mockResolvedValue({
        plan: "free",
        status: "active",
        stripeCustomerId: null,
        currentPeriodEnd: null,
        cancelAt: null,
        canceledAt: null,
      });
      mockGetRemainingUsage.mockResolvedValue({
        plan: "free",
        used: 0,
        limit: 3,
        remaining: 3,
      });

      const res = await GET();
      expect(res.headers.get("Cache-Control")).toContain("private");
      expect(res.headers.get("Cache-Control")).toContain("max-age=60");
    });
  });

  describe("エラーハンドリング", () => {
    it("内部エラー発生時は 500 を返す", async () => {
      mockGetUserSubscription.mockRejectedValue(new Error("DB error"));

      // console.error のスパイ
      vi.spyOn(console, "error").mockImplementation(() => {});

      const res = await GET();
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json.error).toContain("サブスクリプション");
    });
  });
});
