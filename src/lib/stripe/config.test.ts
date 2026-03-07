import { describe, it, expect } from "vitest";
import { MOCK_INTERVIEW_LIMITS, ES_REVIEW_LIMITS, PLAN_MODELS, PLANS, getBaseUrl } from "./config";

describe("stripe/config", () => {
  describe("MOCK_INTERVIEW_LIMITS", () => {
    it("無料プランは1回", () => {
      expect(MOCK_INTERVIEW_LIMITS.free).toBe(1);
    });

    it("Pro プランは30回", () => {
      expect(MOCK_INTERVIEW_LIMITS.pro).toBe(30);
    });

    it("Premium プランは無制限(null)", () => {
      expect(MOCK_INTERVIEW_LIMITS.premium).toBeNull();
    });
  });

  describe("ES_REVIEW_LIMITS", () => {
    it("無料プランは利用不可(0)", () => {
      expect(ES_REVIEW_LIMITS.free).toBe(0);
    });

    it("Pro プランは利用不可(0)", () => {
      expect(ES_REVIEW_LIMITS.pro).toBe(0);
    });

    it("Premium プランは30回", () => {
      expect(ES_REVIEW_LIMITS.premium).toBe(30);
    });
  });

  describe("PLAN_MODELS", () => {
    it("無料プランは flash モデル", () => {
      expect(PLAN_MODELS.free).toContain("flash");
    });

    it("Pro プランは pro モデル", () => {
      expect(PLAN_MODELS.pro).toContain("pro");
    });

    it("Premium プランは pro モデル", () => {
      expect(PLAN_MODELS.premium).toContain("pro");
    });
  });

  describe("PLANS", () => {
    it("3つのプランが定義されている", () => {
      expect(Object.keys(PLANS)).toHaveLength(3);
    });

    it("無料プランの価格は0円", () => {
      expect(PLANS.free.priceMonthly).toBe(0);
    });

    it("Pro プランの価格は980円", () => {
      expect(PLANS.pro.priceMonthly).toBe(980);
    });

    it("Premium プランの価格は1980円", () => {
      expect(PLANS.premium.priceMonthly).toBe(1980);
    });
  });

  describe("getBaseUrl", () => {
    it("デフォルトは localhost:3000", () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.VERCEL_URL;
      expect(getBaseUrl()).toBe("http://localhost:3000");
    });
  });
});
