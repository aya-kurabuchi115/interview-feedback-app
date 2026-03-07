import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// モック設定（vi.hoisted を使ってホイスティング対応）
// ============================================================

const { mockSupabase } = vi.hoisted(() => {
  const mockSupabase = {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  };
  return { mockSupabase };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}));

import {
  getModelForPlan,
  checkMockInterviewLimit,
  checkEsReviewLimit,
  getRemainingUsageByFeature,
} from "./subscription";

// ============================================================
// ヘルパー: テーブル別にモッククエリビルダーを返す
// ============================================================

function setupFromMock(tableHandlers: Record<string, unknown>) {
  mockSupabase.from.mockImplementation((table: string) => {
    return tableHandlers[table] ?? {};
  });
}

/** subscriptions テーブル用のモッククエリビルダー */
function createSubsBuilder(planData: Record<string, unknown> | null) {
  const data = planData ? [planData] : [];
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockResolvedValue({ data, error: null }),
  };
}

/** count クエリ用のモッククエリビルダー */
function createCountBuilder(count: number) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockResolvedValue({ data: null, error: null, count }),
  };
}

// ============================================================
// テスト
// ============================================================

describe("subscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getModelForPlan", () => {
    it("free プランは flash モデルを返す", () => {
      expect(getModelForPlan("free")).toContain("flash");
    });

    it("pro プランは pro モデルを返す", () => {
      expect(getModelForPlan("pro")).toContain("pro");
    });

    it("premium プランは pro モデルを返す", () => {
      expect(getModelForPlan("premium")).toContain("pro");
    });

    it("enterprise プランは premium と同じ pro モデルを返す", () => {
      expect(getModelForPlan("enterprise")).toContain("pro");
    });
  });

  describe("checkMockInterviewLimit", () => {
    it("無料プランで利用回数が上限未満の場合は allowed: true を返す", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "free", status: "active",
          stripe_customer_id: null, current_period_end: null,
          cancel_at: null, canceled_at: null,
        }),
        mock_interviews: createCountBuilder(0),
      });

      const result = await checkMockInterviewLimit("test-user-id");

      expect(result.allowed).toBe(true);
      expect(result.plan).toBe("free");
      expect(result.used).toBe(0);
      expect(result.limit).toBe(1);
    });

    it("無料プランで利用回数が上限に達した場合は allowed: false を返す", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "free", status: "active",
          stripe_customer_id: null, current_period_end: null,
          cancel_at: null, canceled_at: null,
        }),
        mock_interviews: createCountBuilder(1),
      });

      const result = await checkMockInterviewLimit("test-user-id");

      expect(result.allowed).toBe(false);
      expect(result.used).toBe(1);
      expect(result.limit).toBe(1);
    });

    it("pro プランで利用回数が上限未満の場合は allowed: true を返す", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "pro", status: "active",
          stripe_customer_id: "cus_123", current_period_end: "2026-04-01",
          cancel_at: null, canceled_at: null,
        }),
        mock_interviews: createCountBuilder(15),
      });

      const result = await checkMockInterviewLimit("test-user-id");

      expect(result.allowed).toBe(true);
      expect(result.plan).toBe("pro");
      expect(result.used).toBe(15);
      expect(result.limit).toBe(30);
    });

    it("premium プランは常に allowed: true（無制限）を返す", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "premium", status: "active",
          stripe_customer_id: "cus_456", current_period_end: "2026-04-01",
          cancel_at: null, canceled_at: null,
        }),
        mock_interviews: createCountBuilder(100),
      });

      const result = await checkMockInterviewLimit("test-user-id");

      expect(result.allowed).toBe(true);
      expect(result.plan).toBe("premium");
      expect(result.limit).toBeNull();
    });

    it("サブスクリプションがない場合は free プランとして扱う", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder(null),
        mock_interviews: createCountBuilder(0),
      });

      const result = await checkMockInterviewLimit("test-user-id");

      expect(result.plan).toBe("free");
      expect(result.limit).toBe(1);
    });
  });

  describe("checkEsReviewLimit", () => {
    it("無料プランは利用不可（上限0）なので allowed: false を返す", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "free", status: "active",
          stripe_customer_id: null, current_period_end: null,
          cancel_at: null, canceled_at: null,
        }),
        es_reviews: createCountBuilder(0),
      });

      const result = await checkEsReviewLimit("test-user-id");

      expect(result.allowed).toBe(false);
      expect(result.plan).toBe("free");
      expect(result.used).toBe(0);
      expect(result.limit).toBe(0);
    });

    it("無料プランで利用回数が1の場合も allowed: false を返す", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "free", status: "active",
          stripe_customer_id: null, current_period_end: null,
          cancel_at: null, canceled_at: null,
        }),
        es_reviews: createCountBuilder(1),
      });

      const result = await checkEsReviewLimit("test-user-id");

      expect(result.allowed).toBe(false);
      expect(result.used).toBe(1);
      expect(result.limit).toBe(0);
    });

    it("pro プランは利用不可（上限0）なので allowed: false を返す", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "pro", status: "active",
          stripe_customer_id: "cus_123", current_period_end: "2026-04-01",
          cancel_at: null, canceled_at: null,
        }),
        es_reviews: createCountBuilder(0),
      });

      const result = await checkEsReviewLimit("test-user-id");

      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(0);
    });

    it("premium プランでは月30回まで利用可能", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "premium", status: "active",
          stripe_customer_id: "cus_456", current_period_end: "2026-04-01",
          cancel_at: null, canceled_at: null,
        }),
        es_reviews: createCountBuilder(10),
      });

      const result = await checkEsReviewLimit("test-user-id");

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(30);
    });
  });

  describe("getRemainingUsageByFeature", () => {
    it("無料プランで各機能の残り回数を正しく返す", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "free", status: "active",
          stripe_customer_id: null, current_period_end: null,
          cancel_at: null, canceled_at: null,
        }),
        mock_interviews: createCountBuilder(0),
        es_reviews: createCountBuilder(0),
      });

      const result = await getRemainingUsageByFeature("test-user-id");

      expect(result.plan).toBe("free");
      expect(result.mockInterview).toEqual({ used: 0, limit: 1, remaining: 1 });
      expect(result.esReview).toEqual({ used: 0, limit: 0, remaining: 0 });
    });

    it("premium プランでは模擬面接が無制限、ES添削は30回", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "premium", status: "active",
          stripe_customer_id: "cus_123", current_period_end: "2026-04-01",
          cancel_at: null, canceled_at: null,
        }),
        mock_interviews: createCountBuilder(50),
        es_reviews: createCountBuilder(10),
      });

      const result = await getRemainingUsageByFeature("test-user-id");

      expect(result.plan).toBe("premium");
      expect(result.mockInterview).toEqual({ used: 50, limit: null, remaining: null });
      expect(result.esReview).toEqual({ used: 10, limit: 30, remaining: 20 });
    });

    it("利用回数が上限を超えても remaining は 0 以上を返す", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "free", status: "active",
          stripe_customer_id: null, current_period_end: null,
          cancel_at: null, canceled_at: null,
        }),
        mock_interviews: createCountBuilder(3),
        es_reviews: createCountBuilder(2),
      });

      const result = await getRemainingUsageByFeature("test-user-id");

      expect(result.mockInterview.remaining).toBe(0);
      expect(result.esReview.remaining).toBe(0);
    });
  });
});
