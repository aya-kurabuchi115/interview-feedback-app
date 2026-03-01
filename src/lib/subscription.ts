import { createClient } from "@/lib/supabase/server";
import { PLAN_MONTHLY_LIMITS, PLAN_MODELS } from "@/lib/stripe/config";
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

/**
 * 今月のフィードバック利用回数を返す
 */
async function getMonthlyUsageCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count } = await supabase
    .from("feedbacks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", monthStart);

  return count ?? 0;
}

/**
 * プラン別の月間利用上限を取得する。
 * enterprise は無制限として扱う。
 */
function getPlanLimit(plan: SubscriptionPlan): number | null {
  if (plan === "enterprise") return null;
  return PLAN_MONTHLY_LIMITS[plan];
}

/**
 * プラン別の AI モデルを取得する。
 * enterprise は premium と同じモデルを使う。
 */
export function getModelForPlan(plan: SubscriptionPlan): string {
  if (plan === "enterprise") return PLAN_MODELS.premium;
  return PLAN_MODELS[plan];
}

/**
 * ユーザーが分析を実行可能か判定する。
 * 各プランの月間利用上限をチェックする（null = 無制限）。
 */
export async function checkUsageLimit(userId: string): Promise<{
  allowed: boolean;
  plan: SubscriptionPlan;
  used: number;
  limit: number | null;
}> {
  const sub = await getUserSubscription(userId);
  const limit = getPlanLimit(sub.plan);
  const used = await getMonthlyUsageCount(userId);

  // 上限が null のプランは無制限
  if (limit === null) {
    return { allowed: true, plan: sub.plan, used, limit };
  }

  return {
    allowed: used < limit,
    plan: sub.plan,
    used,
    limit,
  };
}

/**
 * 残り利用回数の情報を返す
 */
export async function getRemainingUsage(userId: string): Promise<{
  plan: SubscriptionPlan;
  used: number;
  limit: number | null;
  remaining: number | null;
}> {
  const sub = await getUserSubscription(userId);
  const used = await getMonthlyUsageCount(userId);
  const limit = getPlanLimit(sub.plan);

  if (limit === null) {
    return { plan: sub.plan, used, limit: null, remaining: null };
  }

  return {
    plan: sub.plan,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}
