import type { SubscriptionPlan } from "@/types/database";

// ============================================================
// プラン別の月間利用上限
// ============================================================

/** プラン別の月間利用上限（null = 無制限） */
export const PLAN_MONTHLY_LIMITS: Record<Exclude<SubscriptionPlan, "enterprise">, number | null> = {
  free: 3,
  pro: 30,
  premium: null,
};

/** 無料プランの月間利用上限（後方互換用） */
export const FREE_MONTHLY_LIMIT = PLAN_MONTHLY_LIMITS.free as number;

// ============================================================
// プラン別の AI モデル
// ============================================================

/** プラン別に使用する Claude モデル */
export const PLAN_MODELS: Record<Exclude<SubscriptionPlan, "enterprise">, string> = {
  free: "claude-haiku-4-5-20251001",
  pro: "claude-sonnet-4-6",
  premium: "claude-sonnet-4-6",
};

// ============================================================
// プラン設定
// ============================================================

export interface PlanConfig {
  name: string;
  description: string;
  priceMonthly: number;
  stripePriceId: string | null;
  features: string[];
  badge: string | null;
  monthlyLimit: number | null;
}

export const PLANS: Record<Exclude<SubscriptionPlan, "enterprise">, PlanConfig> = {
  free: {
    name: "無料プラン",
    description: "まずは気軽に試したい方へ",
    priceMonthly: 0,
    stripePriceId: null,
    features: [
      "月3回まで面接分析",
      "基本的なAIフィードバック",
      "スコア表示",
    ],
    badge: null,
    monthlyLimit: PLAN_MONTHLY_LIMITS.free,
  },
  pro: {
    name: "Pro プラン",
    description: "本気で面接対策したい方へ",
    priceMonthly: 980,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    features: [
      "月30回まで面接分析",
      "詳細なAIフィードバック",
      "スコア表示",
      "成長トラッキング",
      "パーソナライズ分析",
    ],
    badge: "おすすめ",
    monthlyLimit: PLAN_MONTHLY_LIMITS.pro,
  },
  premium: {
    name: "Premium プラン",
    description: "すべての機能を制限なく使いたい方へ",
    priceMonthly: 1980,
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID ?? null,
    features: [
      "無制限の面接分析",
      "詳細なAIフィードバック",
      "スコア表示",
      "成長トラッキング",
      "パーソナライズ分析",
      "AI 模擬面接（無制限）",
      "優先処理",
    ],
    badge: "すべての機能",
    monthlyLimit: PLAN_MONTHLY_LIMITS.premium,
  },
};

/** 有料プランのキー一覧 */
export const PAID_PLAN_KEYS = ["pro", "premium"] as const;
export type PaidPlanKey = (typeof PAID_PLAN_KEYS)[number];

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
