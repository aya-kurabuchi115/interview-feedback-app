import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// モック設定
// ============================================================

// Supabase のチェイン可能なクエリビルダーモック
function createChainMock(resolveValue: unknown = { data: null, error: null }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(resolveValue);
  return chain;
}

let mockUser: { id: string; email: string } | null = { id: "user-123", email: "test@example.com" };
let companiesChain: ReturnType<typeof createChainMock>;
let interviewsChain: ReturnType<typeof createChainMock>;

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockImplementation(async () => mockSupabase),
}));

// crypto.randomUUID をモック
vi.stubGlobal("crypto", {
  ...globalThis.crypto,
  randomUUID: () => "mock-uuid-1234",
});

import { POST } from "./route";

// ============================================================
// ヘルパー
// ============================================================

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost:3000/api/interviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function validBody(): Record<string, unknown> {
  return {
    company_name: "テスト株式会社",
    interview_category: "new_grad",
    interview_round: "first",
    interview_date: "2025-12-01",
    transcript: "A".repeat(150), // 100文字以上
  };
}

// ============================================================
// テスト
// ============================================================

describe("POST /api/interviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { id: "user-123", email: "test@example.com" };
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // companies テーブル: 既存企業なし → 新規作成
    companiesChain = createChainMock({ data: null, error: null });
    // insert 後の select → single で id を返す
    const companiesInsertChain = createChainMock({ data: { id: "company-1" }, error: null });

    // interviews テーブル: 成功
    interviewsChain = createChainMock({ data: null, error: null });
    // insert は error のみ返す
    interviewsChain.insert = vi.fn().mockResolvedValue({ error: null });

    let companiesCallCount = 0;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "companies") {
        companiesCallCount++;
        if (companiesCallCount === 1) {
          // SELECT（既存企業検索）
          return companiesChain;
        }
        // INSERT（新規作成）
        return companiesInsertChain;
      }
      if (table === "interviews") {
        return interviewsChain;
      }
      return createChainMock();
    });
  });

  describe("認証", () => {
    it("未認証の場合は 401 を返す", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const res = await POST(makeRequest(validBody()));
      expect(res.status).toBe(401);
    });
  });

  describe("バリデーション", () => {
    it("企業名が空の場合は 400 を返す", async () => {
      const body = validBody();
      body.company_name = "";

      const res = await POST(makeRequest(body));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("企業名");
    });

    it("企業名が100文字超の場合は 400 を返す", async () => {
      const body = validBody();
      body.company_name = "A".repeat(101);

      const res = await POST(makeRequest(body));
      expect(res.status).toBe(400);
    });

    it("無効な面接カテゴリの場合は 400 を返す", async () => {
      const body = validBody();
      body.interview_category = "invalid_category";

      const res = await POST(makeRequest(body));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("面接カテゴリ");
    });

    it("新卒面接で interview_round がない場合は 400 を返す", async () => {
      const body = validBody();
      body.interview_category = "new_grad";
      body.interview_round = null;

      const res = await POST(makeRequest(body));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("面接ラウンド");
    });

    it("アルバイト面接では interview_round が不要", async () => {
      const body = validBody();
      body.interview_category = "arubaito";
      body.interview_round = null;

      const res = await POST(makeRequest(body));
      // バリデーションエラーにならないこと（次の処理で失敗しても400ではない）
      expect(res.status).not.toBe(400);
    });

    it("未来の面接日は 400 を返す", async () => {
      const body = validBody();
      body.interview_date = "2099-01-01";

      const res = await POST(makeRequest(body));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("今日以前");
    });

    it("音声スクリプトが空の場合は 400 を返す", async () => {
      const body = validBody();
      body.transcript = "";

      const res = await POST(makeRequest(body));
      expect(res.status).toBe(400);
    });

    it("音声スクリプトが100文字未満の場合は 400 を返す", async () => {
      const body = validBody();
      body.transcript = "短すぎ";

      const res = await POST(makeRequest(body));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("100文字以上");
    });

    it("音声スクリプトが50,000文字超の場合は 400 を返す", async () => {
      const body = validBody();
      body.transcript = "A".repeat(50001);

      const res = await POST(makeRequest(body));
      expect(res.status).toBe(400);
    });
  });

  describe("正常系", () => {
    it("有効なリクエストで 200 と interview_id を返す", async () => {
      const res = await POST(makeRequest(validBody()));
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.interview_id).toBeDefined();
    });
  });
});
