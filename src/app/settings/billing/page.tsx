import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription, getRemainingUsage } from "@/lib/subscription";
import { PLANS } from "@/lib/stripe/config";
import { BillingClient } from "./billing-client";

export const metadata = { title: "プラン管理 | InterviewCoach" };

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const subscription = await getUserSubscription(user.id);
  const usage = await getRemainingUsage(user.id);
  const planConfig = PLANS[subscription.plan === "enterprise" ? "pro" : subscription.plan];

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
