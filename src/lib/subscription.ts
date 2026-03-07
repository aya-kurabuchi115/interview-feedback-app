import { createClient } from "@/lib/supabase/server";
import { MOCK_INTERVIEW_LIMITS, ES_REVIEW_LIMITS, PLAN_MODELS } from "@/lib/stripe/config";
import type { Row, SubscriptionPlan, SubscriptionStatus } from "@/types/database";

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  currentPeriodEnd: string | null;
  cancelAt: string | null;
  canceledAt: string | null;
}

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  plan: "free",
  status: "active",
  stripeCustomerId: null,
  currentPeriodEnd: null,
  cancelAt: null,
  canceledAt: null,
};

/**
 * ユーザーの現在のサブスクリプション情報を取得する。
 * active / trialing / past_due のいずれかのステータスを持つレコードを返す。
 * 見つからない場合は無料プランのデフォルト値を返す。
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "trialing", "past_due"]);

  const rows = (data ?? []) as Row<"subscriptions">[];
  const row = rows[0] ?? null;

  if (!row) return DEFAULT_SUBSCRIPTION;

  return {
    plan: row.plan,
    status: row.status,
    stripeCustomerId: row.stripe_customer_id,
    currentPeriodEnd: row.current_period_end,
    cancelAt: row.cancel_at,
    canceledAt: row.canceled_at,
  };
}

// ============================================================
// 機能別カウント
// ============================================================

function getMonthStartISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

/** 今月の模擬面接回数を返す */
export async function getMonthlyMockInterviewCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("mock_interviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", getMonthStartISO());
  return count ?? 0;
}

/** 今月のES添削回数を返す */
export async function getMonthlyEsReviewCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("es_reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", getMonthStartISO());
  return count ?? 0;
}

// ============================================================
// リミット取得
// ============================================================

function getMockInterviewLimit(plan: SubscriptionPlan): number | null {
  if (plan === "enterprise") return null;
  return MOCK_INTERVIEW_LIMITS[plan];
}

function getEsReviewLimit(plan: SubscriptionPlan): number | null {
  if (plan === "enterprise") return null;
  return ES_REVIEW_LIMITS[plan];
}

/**
 * プラン別の AI モデルを取得する。
 * enterprise は premium と同じモデルを使う。
 */
export function getModelForPlan(plan: SubscriptionPlan): string {
  if (plan === "enterprise") return PLAN_MODELS.premium;
  return PLAN_MODELS[plan];
}

// ============================================================
// 利用制限チェック
// ============================================================

interface UsageLimitResult {
  allowed: boolean;
  plan: SubscriptionPlan;
  used: number;
  limit: number | null;
}

/** 模擬面接の利用制限チェック */
export async function checkMockInterviewLimit(userId: string): Promise<UsageLimitResult> {
  const sub = await getUserSubscription(userId);
  const limit = getMockInterviewLimit(sub.plan);
  const used = await getMonthlyMockInterviewCount(userId);

  if (limit === null) {
    return { allowed: true, plan: sub.plan, used, limit };
  }
  return { allowed: used < limit, plan: sub.plan, used, limit };
}

/** ES添削の利用制限チェック */
export async function checkEsReviewLimit(userId: string): Promise<UsageLimitResult> {
  const sub = await getUserSubscription(userId);
  const limit = getEsReviewLimit(sub.plan);
  const used = await getMonthlyEsReviewCount(userId);

  if (limit === null) {
    return { allowed: true, plan: sub.plan, used, limit };
  }
  return { allowed: used < limit, plan: sub.plan, used, limit };
}

// ============================================================
// 機能別残り利用回数
// ============================================================

export interface FeatureUsage {
  used: number;
  limit: number | null;
  remaining: number | null;
}

export interface FeatureUsageByFeature {
  plan: SubscriptionPlan;
  mockInterview: FeatureUsage;
  esReview: FeatureUsage;
}

function buildFeatureUsage(used: number, limit: number | null): FeatureUsage {
  if (limit === null) {
    return { used, limit: null, remaining: null };
  }
  return { used, limit, remaining: Math.max(0, limit - used) };
}

/** 機能別の残り利用回数を返す */
export async function getRemainingUsageByFeature(userId: string): Promise<FeatureUsageByFeature> {
  const sub = await getUserSubscription(userId);

  const [mockCount, esCount] = await Promise.all([
    getMonthlyMockInterviewCount(userId),
    getMonthlyEsReviewCount(userId),
  ]);

  return {
    plan: sub.plan,
    mockInterview: buildFeatureUsage(mockCount, getMockInterviewLimit(sub.plan)),
    esReview: buildFeatureUsage(esCount, getEsReviewLimit(sub.plan)),
  };
}
