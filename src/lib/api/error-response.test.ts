import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  apiError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  gone,
  serverError,
  serverErrorWithLog,
} from "./error-response";

describe("error-response", () => {
  describe("apiError", () => {
    it("指定したメッセージ・コード・ステータスでレスポンスを返す", async () => {
      const res = apiError("テストエラー", "test_error", 400);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBe("テストエラー");
      expect(body.code).toBe("test_error");
    });

    it("action を指定しない場合はステータスに応じたデフォルトが設定される", async () => {
      const res = apiError("テスト", "test", 401);
      const body = await res.json();

      expect(body.action).toBe("ログインし直してください");
    });

    it("action を明示的に指定した場合はそれが使われる", async () => {
      const res = apiError("テスト", "test", 401, "カスタムアクション");
      const body = await res.json();

      expect(body.action).toBe("カスタムアクション");
    });
  });

  describe("デフォルト action のステータスコード別マッピング", () => {
    const cases: [number, string][] = [
      [401, "ログインし直してください"],
      [403, "アクセス権限を確認してください"],
      [404, "URLやIDが正しいか確認してください"],
      [409, "内容を確認して再度お試しください"],
      [410, "新しいリンクを発行してください"],
      [429, "しばらく待ってから再度お試しください"],
      [500, "しばらくしてから再度お試しください。問題が続く場合はお問い合わせください"],
      [502, "しばらくしてから再度お試しください。問題が続く場合はお問い合わせください"],
      [400, "入力内容を確認して再度お試しください"],
      [422, "入力内容を確認して再度お試しください"],
    ];

    it.each(cases)("ステータス %i → '%s'", async (status, expectedAction) => {
      const res = apiError("msg", "code", status);
      const body = await res.json();
      expect(body.action).toBe(expectedAction);
    });
  });

  describe("badRequest", () => {
    it("400 ステータスと bad_request コードを返す", async () => {
      const res = badRequest("入力が不正です");
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("bad_request");
      expect(body.error).toBe("入力が不正です");
    });

    it("カスタム action を指定できる", async () => {
      const res = badRequest("不正", "やり直してください");
      const body = await res.json();

      expect(body.action).toBe("やり直してください");
    });
  });

  describe("unauthorized", () => {
    it("401 ステータスとデフォルトメッセージを返す", async () => {
      const res = unauthorized();
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.code).toBe("unauthorized");
      expect(body.error).toBe("認証が必要です。ログインしてからお試しください。");
    });

    it("カスタムメッセージを指定できる", async () => {
      const res = unauthorized("セッション切れ");
      const body = await res.json();

      expect(body.error).toBe("セッション切れ");
    });
  });

  describe("forbidden", () => {
    it("403 ステータスと forbidden コードを返す", async () => {
      const res = forbidden("アクセス拒否");
      const body = await res.json();

      expect(res.status).toBe(403);
      expect(body.code).toBe("forbidden");
      expect(body.error).toBe("アクセス拒否");
    });
  });

  describe("notFound", () => {
    it("404 ステータスと not_found コードを返す", async () => {
      const res = notFound("データが見つかりません");
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.code).toBe("not_found");
      expect(body.error).toBe("データが見つかりません");
    });
  });

  describe("conflict", () => {
    it("409 ステータスと conflict コードを返す", async () => {
      const res = conflict("重複しています");
      const body = await res.json();

      expect(res.status).toBe(409);
      expect(body.code).toBe("conflict");
    });
  });

  describe("gone", () => {
    it("410 ステータスと gone コードを返す", async () => {
      const res = gone("リソースは削除されました");
      const body = await res.json();

      expect(res.status).toBe(410);
      expect(body.code).toBe("gone");
    });
  });

  describe("serverError", () => {
    it("500 ステータスとデフォルトメッセージを返す", async () => {
      const res = serverError();
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.code).toBe("server_error");
      expect(body.error).toContain("こちらの問題でエラーが発生しました");
    });

    it("カスタムメッセージを指定できる", async () => {
      const res = serverError("カスタムサーバーエラー");
      const body = await res.json();

      expect(body.error).toBe("カスタムサーバーエラー");
    });
  });

  describe("serverErrorWithLog", () => {
    beforeEach(() => {
      vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("500 レスポンスを返しつつ、内部エラーをログに出力する", async () => {
      const internalError = new Error("DB connection failed");
      const res = serverErrorWithLog("サーバーエラーです", internalError, "DB");
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.error).toBe("サーバーエラーです");
      // 内部エラーの詳細がクライアントに漏れていないこと
      expect(body.error).not.toContain("DB connection failed");
      // ログには出力されていること
      expect(console.error).toHaveBeenCalledWith(
        "[serverError] DB: DB connection failed"
      );
    });

    it("Error 以外の値も文字列化してログ出力する", async () => {
      const res = serverErrorWithLog("エラー", "string error");
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(console.error).toHaveBeenCalledWith(
        "[serverError] string error"
      );
    });

    it("context が未指定の場合はコロンなしでログ出力する", async () => {
      serverErrorWithLog("エラー", new Error("fail"));

      expect(console.error).toHaveBeenCalledWith(
        "[serverError] fail"
      );
    });
  });
});
