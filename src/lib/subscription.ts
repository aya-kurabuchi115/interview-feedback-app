import { createClient } from "@/lib/supabase/server";
import { FREE_MONTHLY_LIMIT } from "@/lib/stripe/config";
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
 * ユーザーが分析を実行可能か判定する。
 * Pro プラン以上は常に true、無料プランは月間利用上限をチェックする。
 */
export async function checkUsageLimit(userId: string): Promise<boolean> {
  const sub = await getUserSubscription(userId);
  if (sub.plan !== "free") return true;

  const used = await getMonthlyUsageCount(userId);
  return used < FREE_MONTHLY_LIMIT;
}

/**
 * 残り利用回数の情報を返す
 */
export async function getRemainingUsage(userId: string): Promise<{
  used: number;
  limit: number | null;
  remaining: number | null;
}> {
  const sub = await getUserSubscription(userId);
  const used = await getMonthlyUsageCount(userId);

  if (sub.plan !== "free") {
    return { used, limit: null, remaining: null };
  }

  return {
    used,
    limit: FREE_MONTHLY_LIMIT,
    remaining: Math.max(0, FREE_MONTHLY_LIMIT - used),
  };
}
