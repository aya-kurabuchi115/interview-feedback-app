import type { SubscriptionPlan } from "@/types/database";

/** 無料プランの月間利用上限 */
export const FREE_MONTHLY_LIMIT = 3;

export interface PlanConfig {
  name: string;
  priceMonthly: number;
  stripePriceId: string | null;
  features: string[];
}

export const PLANS: Record<Exclude<SubscriptionPlan, "enterprise">, PlanConfig> = {
  free: {
    name: "無料プラン",
    priceMonthly: 0,
    stripePriceId: null,
    features: ["月3回まで面接分析", "基本的なAIフィードバック", "スコア表示"],
  },
  pro: {
    name: "Pro プラン",
    priceMonthly: 980,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    features: [
      "無制限の面接分析",
      "詳細なAIフィードバック",
      "スコア表示",
      "成長トラッキング",
      "パーソナライズ分析",
    ],
  },
};

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
