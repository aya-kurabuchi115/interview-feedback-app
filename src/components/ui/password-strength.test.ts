/**
 * PasswordStrength コンポーネントのロジック部分をテスト
 *
 * evaluateCriteria / calculateStrength はコンポーネントファイル内で定義されているため、
 * 同じロジックをテスト側で再現してテストする。
 * （React Testing Library は未導入のため、ロジック検証に特化）
 */
import { describe, it, expect } from "vitest";

// ============================================================
// コンポーネント内のロジックを抽出（テスト用）
// ============================================================

interface StrengthCriteria {
  label: string;
  met: boolean;
}

type StrengthLevel = 0 | 1 | 2 | 3;

interface StrengthInfo {
  level: StrengthLevel;
  label: string;
}

function evaluateCriteria(password: string): StrengthCriteria[] {
  return [
    { label: "8文字以上", met: password.length >= 8 },
    { label: "英大文字を含む", met: /[A-Z]/.test(password) },
    { label: "英小文字を含む", met: /[a-z]/.test(password) },
    { label: "数字を含む", met: /[0-9]/.test(password) },
    { label: "記号を含む", met: /[^A-Za-z0-9]/.test(password) },
  ];
}

function calculateStrength(password: string): StrengthInfo {
  if (password.length === 0) {
    return { level: 0, label: "" };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isLong = password.length >= 12;

  // 強い: 大文字+小文字+数字+記号 かつ 12文字以上
  if (hasLower && hasUpper && hasDigit && hasSymbol && isLong) {
    return { level: 3, label: "非常に強い" };
  }

  // 普通〜強い: 複数の文字種の組み合わせ
  const typesCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  if (typesCount >= 3 && password.length >= 8) {
    return { level: 2, label: "強い" };
  }

  if (typesCount >= 2 && password.length >= 8) {
    return { level: 1, label: "普通" };
  }

  // 弱い: 8文字未満 or 1種類のみ
  return { level: 0, label: "弱い" };
}

// ============================================================
// テスト
// ============================================================

describe("password-strength ロジック", () => {
  describe("evaluateCriteria", () => {
    it("空パスワードでは全条件が false", () => {
      const criteria = evaluateCriteria("");
      expect(criteria.every((c) => !c.met)).toBe(true);
    });

    it("8文字以上の条件を判定できる", () => {
      const short = evaluateCriteria("abc");
      expect(short[0].met).toBe(false);

      const long = evaluateCriteria("abcdefgh");
      expect(long[0].met).toBe(true);
    });

    it("英大文字を含む条件を判定できる", () => {
      expect(evaluateCriteria("abc")[1].met).toBe(false);
      expect(evaluateCriteria("Abc")[1].met).toBe(true);
    });

    it("英小文字を含む条件を判定できる", () => {
      expect(evaluateCriteria("ABC")[2].met).toBe(false);
      expect(evaluateCriteria("ABc")[2].met).toBe(true);
    });

    it("数字を含む条件を判定できる", () => {
      expect(evaluateCriteria("abc")[3].met).toBe(false);
      expect(evaluateCriteria("abc1")[3].met).toBe(true);
    });

    it("記号を含む条件を判定できる", () => {
      expect(evaluateCriteria("abc123")[4].met).toBe(false);
      expect(evaluateCriteria("abc!")[4].met).toBe(true);
    });

    it("全条件を満たすパスワードでは全て true", () => {
      const criteria = evaluateCriteria("Abc12345!");
      expect(criteria.every((c) => c.met)).toBe(true);
    });

    it("5つの条件が返される", () => {
      expect(evaluateCriteria("test").length).toBe(5);
    });
  });

  describe("calculateStrength", () => {
    it("空パスワードはレベル 0、ラベル空文字", () => {
      const result = calculateStrength("");
      expect(result.level).toBe(0);
      expect(result.label).toBe("");
    });

    it("短い1種類のパスワードは '弱い'（レベル 0）", () => {
      const result = calculateStrength("abc");
      expect(result.level).toBe(0);
      expect(result.label).toBe("弱い");
    });

    it("8文字以上でも1種類のみは '弱い'（レベル 0）", () => {
      const result = calculateStrength("abcdefgh");
      expect(result.level).toBe(0);
      expect(result.label).toBe("弱い");
    });

    it("8文字以上 + 2種類で '普通'（レベル 1）", () => {
      const result = calculateStrength("abcdefg1");
      expect(result.level).toBe(1);
      expect(result.label).toBe("普通");
    });

    it("8文字以上 + 3種類で '強い'（レベル 2）", () => {
      const result = calculateStrength("Abcdefg1");
      expect(result.level).toBe(2);
      expect(result.label).toBe("強い");
    });

    it("12文字以上 + 全4種類で '非常に強い'（レベル 3）", () => {
      const result = calculateStrength("Abcdefg123!!");
      expect(result.level).toBe(3);
      expect(result.label).toBe("非常に強い");
    });

    it("11文字 + 全4種類は '非常に強い' にはならない", () => {
      const result = calculateStrength("Abcdefg12!");
      // 10文字・4種類 → level 2 (強い)
      expect(result.level).toBe(2);
      expect(result.label).toBe("強い");
    });

    it("数字のみ8文字は '弱い'", () => {
      const result = calculateStrength("12345678");
      expect(result.level).toBe(0);
      expect(result.label).toBe("弱い");
    });

    it("大文字小文字のみ8文字は '普通'", () => {
      const result = calculateStrength("ABCDabcd");
      expect(result.level).toBe(1);
      expect(result.label).toBe("普通");
    });

    it("記号を含む短いパスワードは '弱い'", () => {
      const result = calculateStrength("a!");
      expect(result.level).toBe(0);
      expect(result.label).toBe("弱い");
    });
  });
});
