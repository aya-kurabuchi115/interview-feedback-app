import { redirectToLogin } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription, getRemainingUsage } from "@/lib/subscription";
import dynamic from "next/dynamic";
import { PLANS } from "@/lib/stripe/config";

// 課金クライアントは Stripe 関連の重いコンポーネントのため遅延ロード
const BillingClient = dynamic(
  () => import("./billing-client").then((mod) => mod.BillingClient),
  {
    loading: () => (
      <div className="mt-8 space-y-6">
        <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-32 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    ),
  }
);

export const metadata = { title: "プラン管理 | InterviewCoach" };

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { await redirectToLogin(); return null; }

  const subscription = await getUserSubscription(user.id);
  const usage = await getRemainingUsage(user.id);
  const planConfig = PLANS[subscription.plan === "enterprise" ? "premium" : subscription.plan];

  return (
    <div className="px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">プラン管理</h1>
        <p className="mt-2 text-muted-foreground">サブスクリプションの確認・変更ができます</p>
        <BillingClient
          plan={subscription.plan} status={subscription.status}
          planName={planConfig.name} priceMonthly={planConfig.priceMonthly}
          currentPeriodEnd={subscription.currentPeriodEnd}
          cancelAt={subscription.cancelAt} canceledAt={subscription.canceledAt}
          hasStripeCustomer={!!subscription.stripeCustomerId}
          usageUsed={usage.used} usageLimit={usage.limit} usageRemaining={usage.remaining}
        />
      </div>
    </div>
  );
}
