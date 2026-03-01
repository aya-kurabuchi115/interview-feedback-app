import { describe, it, expect } from "vitest";
import {
  AUTH_ERROR_MESSAGES,
  DEFAULT_ERROR,
  getAuthErrorInfo,
} from "./error-messages";
import type { AuthErrorInfo } from "./error-messages";

describe("auth/error-messages", () => {
  describe("AUTH_ERROR_MESSAGES", () => {
    it("必要なエラーコードが全て定義されている", () => {
      const requiredCodes = [
        "auth_error",
        "config_error",
        "email_expired",
        "code_used",
        "recovery_expired",
        "email_confirm_failed",
      ];

      for (const code of requiredCodes) {
        expect(AUTH_ERROR_MESSAGES[code]).toBeDefined();
        expect(AUTH_ERROR_MESSAGES[code].message).toBeTruthy();
      }
    });

    it("action が定義されているエントリには label と href が含まれる", () => {
      for (const [code, info] of Object.entries(AUTH_ERROR_MESSAGES)) {
        if (info.action) {
          expect(info.action.label).toBeTruthy();
          expect(info.action.href).toBeTruthy();
          expect(info.action.href).toMatch(/^\//); // 相対パスであること
        }
      }
    });

    it("email_expired にはサインアップへのアクションがある", () => {
      const info = AUTH_ERROR_MESSAGES.email_expired;
      expect(info.action).toBeDefined();
      expect(info.action!.label).toBe("サインアップ");
      expect(info.action!.href).toBe("/signup");
    });

    it("recovery_expired にはパスワードリセットへのアクションがある", () => {
      const info = AUTH_ERROR_MESSAGES.recovery_expired;
      expect(info.action).toBeDefined();
      expect(info.action!.label).toBe("パスワードリセット");
      expect(info.action!.href).toBe("/reset-password");
    });
  });

  describe("DEFAULT_ERROR", () => {
    it("汎用のエラーメッセージが定義されている", () => {
      expect(DEFAULT_ERROR.message).toBeTruthy();
      expect(DEFAULT_ERROR.message).toContain("認証");
    });
  });

  describe("getAuthErrorInfo", () => {
    it("null を渡した場合は null を返す", () => {
      expect(getAuthErrorInfo(null)).toBeNull();
    });

    it("空文字を渡した場合は null を返す（falsy）", () => {
      expect(getAuthErrorInfo("")).toBeNull();
    });

    it("既知のエラーコードは対応する AuthErrorInfo を返す", () => {
      const result = getAuthErrorInfo("auth_error");
      expect(result).not.toBeNull();
      expect(result!.message).toBe(AUTH_ERROR_MESSAGES.auth_error.message);
    });

    it("未知のエラーコードは DEFAULT_ERROR を返す（XSS 対策）", () => {
      const result = getAuthErrorInfo("<script>alert('xss')</script>");
      expect(result).toBe(DEFAULT_ERROR);
    });

    it("SQLインジェクション風の文字列も DEFAULT_ERROR を返す", () => {
      const result = getAuthErrorInfo("'; DROP TABLE users; --");
      expect(result).toBe(DEFAULT_ERROR);
    });

    it("各定義済みコードに対して正しい AuthErrorInfo を返す", () => {
      for (const [code, expected] of Object.entries(AUTH_ERROR_MESSAGES)) {
        const result = getAuthErrorInfo(code);
        expect(result).toEqual(expected);
      }
    });
  });
});
