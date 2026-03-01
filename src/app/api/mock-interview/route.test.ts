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

const mockCheckUsageLimit = vi.fn();
const mockGetModelForPlan = vi.fn();

vi.mock("@/lib/subscription", () => ({
  checkUsageLimit: (...args: unknown[]) => mockCheckUsageLimit(...args),
  getModelForPlan: (...args: unknown[]) => mockGetModelForPlan(...args),
}));

// Anthropic SDK モック
const mockMessagesCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      messages = { create: mockMessagesCreate };
    },
  };
});

import { POST } from "./route";

// ============================================================
// ヘルパー
// ============================================================

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost:3000/api/mock-interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ============================================================
// テスト
// ============================================================

describe("POST /api/mock-interview", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // ANTHROPIC_API_KEY を設定
    process.env.ANTHROPIC_API_KEY = "test-api-key";

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockCheckUsageLimit.mockResolvedValue({
      allowed: true,
      plan: "pro",
      used: 5,
      limit: 30,
    });

    mockGetModelForPlan.mockReturnValue("claude-sonnet-4-6");

    mockMessagesCreate.mockResolvedValue({
      content: [{ type: "text", text: "面接を始めましょう。まず自己紹介をお願いします。" }],
    });

    // Supabase insert モック
    const insertChain = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "mock-interview-id-1" },
        error: null,
      }),
    };
    const fromMock = {
      insert: vi.fn().mockReturnValue(insertChain),
    };
    mockSupabase.from.mockReturnValue(fromMock);
  });

  describe("バリデーション", () => {
    it("無効なカテゴリの場合は 400 を返す", async () => {
      const res = await POST(makeRequest({ category: "invalid" }));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("カテゴリ");
    });

    it("無効なラウンドの場合は 400 を返す", async () => {
      const res = await POST(makeRequest({ round: "invalid" }));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("ラウンド");
    });

    it("無効な難易度の場合は 400 を返す", async () => {
      const res = await POST(makeRequest({ difficulty: "invalid" }));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("難易度");
    });

    it("無効な面接時間の場合は 400 を返す", async () => {
      const res = await POST(makeRequest({ duration_minutes: 45 }));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("面接時間");
    });

    it("企業名が100文字超の場合は 400 を返す", async () => {
      const res = await POST(makeRequest({ company_name: "A".repeat(101) }));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("100文字");
    });

    it("デフォルト値で有効なリクエスト（空ボディ）を処理できる", async () => {
      const res = await POST(makeRequest({}));
      // バリデーションは通る（デフォルト値が使われる）
      expect(res.status).not.toBe(400);
    });
  });

  describe("認証", () => {
    it("未認証の場合は 401 を返す", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const res = await POST(makeRequest({}));
      expect(res.status).toBe(401);
    });
  });

  describe("API キー", () => {
    it("ANTHROPIC_API_KEY が未設定の場合は 500 を返す", async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const res = await POST(makeRequest({}));
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toContain("ANTHROPIC_API_KEY");
    });
  });

  describe("利用制限", () => {
    it("利用上限に達している場合は 403 を返す", async () => {
      mockCheckUsageLimit.mockResolvedValue({
        allowed: false,
        plan: "free",
        used: 3,
        limit: 3,
      });

      const res = await POST(makeRequest({}));
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe("USAGE_LIMIT_EXCEEDED");
      expect(json.upgrade_url).toBe("/pricing");
    });
  });

  describe("正常系", () => {
    it("セッション作成に成功すると id と firstQuestion を返す", async () => {
      const res = await POST(makeRequest({}));
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.id).toBe("mock-interview-id-1");
      expect(json.firstQuestion).toBeTruthy();
    });

    it("Claude API に正しいモデルが使用される", async () => {
      mockGetModelForPlan.mockReturnValue("claude-haiku-4-5-20251001");

      await POST(makeRequest({}));

      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "claude-haiku-4-5-20251001",
        })
      );
    });
  });

  describe("エラーハンドリング", () => {
    it("Claude API がエラーの場合は 500 を返す", async () => {
      mockMessagesCreate.mockRejectedValue(new Error("API error"));

      vi.spyOn(console, "error").mockImplementation(() => {});

      const res = await POST(makeRequest({}));
      expect(res.status).toBe(500);
    });
  });
});
