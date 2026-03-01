import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// モック設定
// ============================================================

const mockUser = { id: "user-123", email: "test@example.com" };

function createChainMock(resolveValue: unknown = { data: null, error: null }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.in = vi.fn().mockReturnValue(chain);
  chain.gte = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(resolveValue);
  return chain;
}

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

// Sentry モック
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
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
  return new Request("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Claude API が返す妥当な JSON レスポンス */
const validAIResponse = {
  overall_score: 75,
  good_points: ["論理的な構成", "具体的なエピソード"],
  improvement_points: ["もう少し簡潔に"],
  detailed_feedback: "全体的に良い面接でした。",
  category_scores: { communication: 80, content: 70, manner: 85, logic: 75 },
  advice: "結論ファーストを意識しましょう。",
  summary: "面接の要約です。",
  suggestions: [{ original: "元の回答", improved: "改善案", reason: "理由" }],
  filler_words: { total_count: 3, filler_rate: 1.5, details: [{ word: "えーと", count: 3 }], assessment: "やや多め" },
  strengths: ["論理的思考"],
  improvements: ["簡潔さ"],
  annotations: [],
};

// ============================================================
// テスト
// ============================================================

describe("POST /api/analyze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      content: [{ type: "text", text: JSON.stringify(validAIResponse) }],
    });

    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("バリデーション", () => {
    it("interview_id が未指定の場合は 400 を返す", async () => {
      const res = await POST(makeRequest({}));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("interview_id");
    });
  });

  describe("認証", () => {
    it("未認証の場合は 401 を返す", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // interviews の select が走る前に認証チェックで弾かれる
      const res = await POST(makeRequest({ interview_id: "int-1" }));
      expect(res.status).toBe(401);
    });
  });

  describe("API キー", () => {
    it("ANTHROPIC_API_KEY が未設定の場合は 500 を返す", async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const res = await POST(makeRequest({ interview_id: "int-1" }));
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toContain("ANTHROPIC_API_KEY");
    });
  });

  describe("面接データ取得", () => {
    it("面接データが見つからない場合は 404 を返す", async () => {
      const interviewsChain = createChainMock({ data: null, error: { message: "not found" } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "interviews") return interviewsChain;
        return createChainMock();
      });

      const res = await POST(makeRequest({ interview_id: "nonexistent" }));
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain("面接データが見つかりません");
    });
  });

  describe("利用制限", () => {
    it("利用上限に達している場合は 403 を返す", async () => {
      // 面接データは見つかる
      const interviewsChain = createChainMock({
        data: {
          id: "int-1",
          user_id: "user-123",
          transcript: "テスト".repeat(50),
          interview_category: "new_grad",
          interview_round: "first",
          company_name_snapshot: "テスト株式会社",
        },
        error: null,
      });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "interviews") return interviewsChain;
        return createChainMock();
      });

      mockCheckUsageLimit.mockResolvedValue({
        allowed: false,
        plan: "free",
        used: 3,
        limit: 3,
      });

      const res = await POST(makeRequest({ interview_id: "int-1" }));
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe("USAGE_LIMIT_EXCEEDED");
      expect(json.upgrade_url).toBe("/pricing");
    });
  });

  describe("正常系", () => {
    it("分析が成功すると success: true を返す", async () => {
      const interviewData = {
        id: "int-1",
        user_id: "user-123",
        transcript: "A".repeat(200),
        interview_category: "new_grad",
        interview_round: "first",
        company_name_snapshot: "テスト株式会社",
        status: "uploaded",
      };

      // update (analyzing) 用のチェイン
      const updateChain = createChainMock({ data: null, error: null });
      updateChain.update = vi.fn().mockReturnValue(updateChain);
      updateChain.eq = vi.fn().mockResolvedValue({ data: null, error: null });

      // insert (feedbacks) 用のチェイン
      const feedbackInsertChain = createChainMock({ data: null, error: null });
      feedbackInsertChain.insert = vi.fn().mockResolvedValue({ data: null, error: null });

      // transcripts: 空
      const transcriptsChain = createChainMock({ data: [], error: null });
      transcriptsChain.order = vi.fn().mockResolvedValue({ data: [], error: null });

      // profiles
      const profilesChain = createChainMock({
        data: { university: "テスト大学", faculty: "工学部", target_industry: ["IT"], target_job_type: ["エンジニア"], personality_type: null },
        error: null,
      });

      let interviewsCallCount = 0;
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "interviews") {
          interviewsCallCount++;
          if (interviewsCallCount === 1) {
            // SELECT
            return createChainMock({ data: interviewData, error: null });
          }
          // UPDATE（analyzing / completed）
          return updateChain;
        }
        if (table === "transcripts") return transcriptsChain;
        if (table === "profiles") return profilesChain;
        if (table === "feedbacks") return feedbackInsertChain;
        return createChainMock();
      });

      const res = await POST(makeRequest({ interview_id: "int-1" }));
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
    });
  });

  describe("エラーハンドリング", () => {
    it("内部エラーが発生しても詳細はクライアントに漏れない", async () => {
      // interviews SELECT で例外をスロー
      mockSupabase.from.mockImplementation(() => {
        throw new Error("Internal DB connection error: password=secret");
      });

      const res = await POST(makeRequest({ interview_id: "int-1" }));
      expect(res.status).toBe(500);

      const json = await res.json();
      // 内部エラーメッセージが漏れていないこと
      expect(json.error).not.toContain("password");
      expect(json.error).not.toContain("Internal DB");
      expect(json.error).toContain("分析処理中にエラーが発生しました");
    });
  });
});
