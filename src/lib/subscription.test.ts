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

import { getModelForPlan, checkUsageLimit, getRemainingUsage } from "./subscription";

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

/** feedbacks テーブル用のモッククエリビルダー（count のみ） */
function createFeedbacksBuilder(count: number) {
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
    it("free プランは haiku モデルを返す", () => {
      expect(getModelForPlan("free")).toContain("haiku");
    });

    it("pro プランは sonnet モデルを返す", () => {
      expect(getModelForPlan("pro")).toContain("sonnet");
    });

    it("premium プランは sonnet モデルを返す", () => {
      expect(getModelForPlan("premium")).toContain("sonnet");
    });

    it("enterprise プランは premium と同じ sonnet モデルを返す", () => {
      expect(getModelForPlan("enterprise")).toContain("sonnet");
    });
  });

  describe("checkUsageLimit", () => {
    it("無料プランで利用回数が上限未満の場合は allowed: true を返す", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "free", status: "active",
          stripe_customer_id: null, current_period_end: null,
          cancel_at: null, canceled_at: null,
        }),
        feedbacks: createFeedbacksBuilder(1),
      });

      const result = await checkUsageLimit("test-user-id");

      expect(result.allowed).toBe(true);
      expect(result.plan).toBe("free");
      expect(result.used).toBe(1);
      expect(result.limit).toBe(3);
    });

    it("無料プランで利用回数が上限に達した場合は allowed: false を返す", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "free", status: "active",
          stripe_customer_id: null, current_period_end: null,
          cancel_at: null, canceled_at: null,
        }),
        feedbacks: createFeedbacksBuilder(3),
      });

      const result = await checkUsageLimit("test-user-id");

      expect(result.allowed).toBe(false);
      expect(result.used).toBe(3);
      expect(result.limit).toBe(3);
    });

    it("pro プランで利用回数が上限未満の場合は allowed: true を返す", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "pro", status: "active",
          stripe_customer_id: "cus_123", current_period_end: "2026-04-01",
          cancel_at: null, canceled_at: null,
        }),
        feedbacks: createFeedbacksBuilder(15),
      });

      const result = await checkUsageLimit("test-user-id");

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
        feedbacks: createFeedbacksBuilder(100),
      });

      const result = await checkUsageLimit("test-user-id");

      expect(result.allowed).toBe(true);
      expect(result.plan).toBe("premium");
      expect(result.limit).toBeNull();
    });

    it("サブスクリプションがない場合は free プランとして扱う", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder(null),
        feedbacks: createFeedbacksBuilder(0),
      });

      const result = await checkUsageLimit("test-user-id");

      expect(result.plan).toBe("free");
      expect(result.limit).toBe(3);
    });
  });

  describe("getRemainingUsage", () => {
    it("無料プランで2回使用済みの場合、remaining: 1 を返す", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "free", status: "active",
          stripe_customer_id: null, current_period_end: null,
          cancel_at: null, canceled_at: null,
        }),
        feedbacks: createFeedbacksBuilder(2),
      });

      const result = await getRemainingUsage("test-user-id");

      expect(result.plan).toBe("free");
      expect(result.used).toBe(2);
      expect(result.limit).toBe(3);
      expect(result.remaining).toBe(1);
    });

    it("premium プランでは remaining: null（無制限）を返す", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "premium", status: "active",
          stripe_customer_id: "cus_123", current_period_end: "2026-04-01",
          cancel_at: null, canceled_at: null,
        }),
        feedbacks: createFeedbacksBuilder(50),
      });

      const result = await getRemainingUsage("test-user-id");

      expect(result.plan).toBe("premium");
      expect(result.limit).toBeNull();
      expect(result.remaining).toBeNull();
    });

    it("利用回数が上限を超えても remaining は 0 以上を返す", async () => {
      setupFromMock({
        subscriptions: createSubsBuilder({
          plan: "free", status: "active",
          stripe_customer_id: null, current_period_end: null,
          cancel_at: null, canceled_at: null,
        }),
        feedbacks: createFeedbacksBuilder(5),
      });

      const result = await getRemainingUsage("test-user-id");

      expect(result.remaining).toBe(0);
    });
  });
});
