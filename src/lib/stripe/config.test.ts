import { describe, it, expect } from "vitest";
import { PLAN_MONTHLY_LIMITS, PLAN_MODELS, PLANS, getBaseUrl } from "./config";

describe("stripe/config", () => {
  describe("PLAN_MONTHLY_LIMITS", () => {
    it("無料プランは3回", () => {
      expect(PLAN_MONTHLY_LIMITS.free).toBe(3);
    });

    it("Pro プランは30回", () => {
      expect(PLAN_MONTHLY_LIMITS.pro).toBe(30);
    });

    it("Premium プランは無制限(null)", () => {
      expect(PLAN_MONTHLY_LIMITS.premium).toBeNull();
    });
  });

  describe("PLAN_MODELS", () => {
    it("無料プランは Haiku モデル", () => {
      expect(PLAN_MODELS.free).toContain("haiku");
    });

    it("Pro プランは Sonnet モデル", () => {
      expect(PLAN_MODELS.pro).toContain("sonnet");
    });

    it("Premium プランは Sonnet モデル", () => {
      expect(PLAN_MODELS.premium).toContain("sonnet");
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
