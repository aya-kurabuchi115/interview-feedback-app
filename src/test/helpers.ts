/**
 * テストヘルパー
 * Supabase / Claude API のモックユーティリティと
 * テスト用のリクエスト生成関数を集約
 */
import { vi } from "vitest";

// ============================================================
// 型定義
// ============================================================

/** Supabase クエリビルダーのモック型 */
export interface MockQueryBuilder {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  gte: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
}

/** Supabase クライアントのモック型 */
export interface MockSupabaseClient {
  auth: {
    getUser: ReturnType<typeof vi.fn>;
  };
  from: ReturnType<typeof vi.fn>;
}

// ============================================================
// Supabase モック
// ============================================================

/**
 * チェイン可能な Supabase クエリビルダーのモックを生成する。
 * 各メソッドは自分自身を返すので .from("x").select("*").eq("id", 1).single() のようにチェインできる。
 */
export function createMockQueryBuilder(resolvedData: unknown = null, resolvedError: unknown = null): MockQueryBuilder {
  const builder: MockQueryBuilder = {} as MockQueryBuilder;

  const result = { data: resolvedData, error: resolvedError, count: null };

  const chainable = vi.fn().mockReturnValue(builder);

  builder.select = vi.fn().mockReturnValue(builder);
  builder.insert = vi.fn().mockReturnValue(builder);
  builder.update = vi.fn().mockReturnValue(builder);
  builder.delete = vi.fn().mockReturnValue(builder);
  builder.eq = vi.fn().mockReturnValue(builder);
  builder.in = vi.fn().mockReturnValue(builder);
  builder.gte = vi.fn().mockReturnValue(builder);
  builder.order = vi.fn().mockReturnValue(builder);
  builder.single = vi.fn().mockResolvedValue(result);

  // select の終端（.single() なし）でも結果を返せるように
  // Promise-like にする
  Object.assign(builder.select, {
    then: (resolve: (value: unknown) => void) => resolve(result),
  });

  return builder;
}

/**
 * 認証済みの Supabase クライアントモックを生成する。
 */
export function createMockSupabaseClient(options?: {
  user?: { id: string; email?: string } | null;
}): MockSupabaseClient {
  const user = options?.user === undefined
    ? { id: "test-user-id", email: "test@example.com" }
    : options.user;

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: null,
      }),
    },
    from: vi.fn().mockReturnValue(createMockQueryBuilder()),
  };
}

/**
 * 未認証の Supabase クライアントモックを生成する。
 */
export function createUnauthenticatedMockSupabaseClient(): MockSupabaseClient {
  return createMockSupabaseClient({ user: null });
}

// ============================================================
// リクエスト生成
// ============================================================

/**
 * POST リクエストを生成する（JSON body 付き）。
 */
export function createPostRequest(body: unknown, url = "http://localhost:3000/api/test"): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * GET リクエストを生成する。
 */
export function createGetRequest(url = "http://localhost:3000/api/test"): Request {
  return new Request(url, {
    method: "GET",
  });
}

// ============================================================
// レスポンスヘルパー
// ============================================================

/**
 * NextResponse の JSON ボディをパースして返す。
 */
export async function parseJsonResponse(response: Response): Promise<{ status: number; body: Record<string, unknown> }> {
  const body = await response.json();
  return {
    status: response.status,
    body,
  };
}
