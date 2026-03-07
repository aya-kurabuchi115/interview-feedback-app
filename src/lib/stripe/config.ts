import type { SubscriptionPlan } from "@/types/database";

// ============================================================
// 機能別の月間利用上限
// ============================================================

type PlanLimits = Record<Exclude<SubscriptionPlan, "enterprise">, number | null>;

/** 模擬面接の月間利用上限（null = 無制限, 0 = 利用不可） */
export const MOCK_INTERVIEW_LIMITS: PlanLimits = {
  free: 1,
  pro: 30,
  premium: null,
};

/** ES添削の月間利用上限（0 = 利用不可） */
export const ES_REVIEW_LIMITS: PlanLimits = {
  free: 0,
  pro: 0,
  premium: 30,
};

// ============================================================
// プラン別の AI モデル
// ============================================================

/** プラン別に使用する Gemini モデル */
export const PLAN_MODELS: Record<Exclude<SubscriptionPlan, "enterprise">, string> = {
  free: "gemini-2.5-flash",
  pro: "gemini-2.5-pro",
  premium: "gemini-2.5-pro",
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
}

export const PLANS: Record<Exclude<SubscriptionPlan, "enterprise">, PlanConfig> = {
  free: {
    name: "無料プラン",
    description: "まずは気軽に試したい方へ",
    priceMonthly: 0,
    stripePriceId: null,
    features: [
      "模擬面接 月1回",
      "基本的なAIフィードバック",
      "スコア表示",
    ],
    badge: null,
  },
  pro: {
    name: "Pro プラン",
    description: "本気で面接対策したい方へ",
    priceMonthly: 980,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    features: [
      "模擬面接 月30回",
      "詳細なAIフィードバック",
      "スコア表示",
      "成長トラッキング",
      "パーソナライズ分析",
    ],
    badge: "おすすめ",
  },
  premium: {
    name: "Premium プラン",
    description: "すべての機能を制限なく使いたい方へ",
    priceMonthly: 1980,
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID ?? null,
    features: [
      "模擬面接 無制限",
      "AI質問集で面接対策",
      "面接履歴を活用したES添削 月30回",
      "詳細なAIフィードバック",
      "スコア表示",
      "成長トラッキング",
      "パーソナライズ分析",
      "優先処理",
    ],
    badge: "すべての機能",
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
