import { describe, it, expect } from "vitest";
import {
  createMockQueryBuilder,
  createMockSupabaseClient,
  createUnauthenticatedMockSupabaseClient,
  createPostRequest,
  createGetRequest,
  parseJsonResponse,
} from "./helpers";

describe("test/helpers", () => {
  describe("createMockQueryBuilder", () => {
    it("チェイン可能なクエリビルダーを返す", () => {
      const builder = createMockQueryBuilder();

      // メソッドチェインが可能であること
      const chain = builder.select("*");
      expect(chain).toBe(builder);

      const chain2 = builder.eq("id", "1");
      expect(chain2).toBe(builder);
    });

    it("single() は指定したデータを返す", async () => {
      const builder = createMockQueryBuilder({ id: "1", name: "test" });
      const result = await builder.single();

      expect(result.data).toEqual({ id: "1", name: "test" });
      expect(result.error).toBeNull();
    });
  });

  describe("createMockSupabaseClient", () => {
    it("認証済みのモッククライアントを返す", async () => {
      const client = createMockSupabaseClient();
      const { data } = await client.auth.getUser();

      expect(data.user).toBeDefined();
      expect(data.user.id).toBe("test-user-id");
    });

    it("カスタムユーザーを指定できる", async () => {
      const client = createMockSupabaseClient({
        user: { id: "custom-id", email: "custom@test.com" },
      });
      const { data } = await client.auth.getUser();

      expect(data.user.id).toBe("custom-id");
    });
  });

  describe("createUnauthenticatedMockSupabaseClient", () => {
    it("未認証のモッククライアントを返す", async () => {
      const client = createUnauthenticatedMockSupabaseClient();
      const { data } = await client.auth.getUser();

      expect(data.user).toBeNull();
    });
  });

  describe("createPostRequest", () => {
    it("JSON body 付きの POST リクエストを生成する", async () => {
      const req = createPostRequest({ key: "value" });

      expect(req.method).toBe("POST");
      expect(req.headers.get("Content-Type")).toBe("application/json");

      const body = await req.json();
      expect(body.key).toBe("value");
    });
  });

  describe("createGetRequest", () => {
    it("GET リクエストを生成する", () => {
      const req = createGetRequest("http://localhost:3000/api/test");
      expect(req.method).toBe("GET");
    });
  });

  describe("parseJsonResponse", () => {
    it("Response からステータスとボディをパースする", async () => {
      const response = new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
      });

      const result = await parseJsonResponse(response);
      expect(result.status).toBe(404);
      expect(result.body.error).toBe("not found");
    });
  });
});
