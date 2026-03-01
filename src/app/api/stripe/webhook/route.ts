import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/database";
import type Stripe from "stripe";

/**
 * Stripe Webhook ハンドラ
 *
 * subscriptions テーブルは RLS で service_role のみ INSERT/UPDATE/DELETE 可能なため、
 * createAdminClient() を使用する。
 */

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET が設定されていません");
  return secret;
}

/** Stripe の subscription status を DB の enum にマッピング */
function mapStripeStatus(status: string): SubscriptionStatus {
  const mapping: Record<string, SubscriptionStatus> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "unpaid",
    incomplete: "incomplete",
    incomplete_expired: "incomplete_expired",
    paused: "paused",
  };
  return mapping[status] ?? "incomplete";
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient();
  const userId = session.metadata?.supabase_user_id;
  if (!userId) {
    console.error("[webhook] checkout.session.completed: supabase_user_id がメタデータにありません");
    return;
  }

  const stripe = getStripe();
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const subData = subscription as unknown as Record<string, unknown>;

  const periodStart = subData.current_period_start as number | undefined;
  const periodEnd = subData.current_period_end as number | undefined;

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
      stripe_subscription_id: subscription.id,
      plan: "pro" as SubscriptionPlan,
      status: mapStripeStatus(subscription.status),
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    } as never,
    { onConflict: "user_id" }
  );
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = createAdminClient();
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) {
    console.error("[webhook] subscription.updated: supabase_user_id がメタデータにありません");
    return;
  }

  const subData = subscription as unknown as Record<string, unknown>;
  const periodStart = subData.current_period_start as number | undefined;
  const periodEnd = subData.current_period_end as number | undefined;

  const plan: SubscriptionPlan = subscription.status === "canceled" ? "free" : "pro";

  await supabase
    .from("subscriptions")
    .update({
      plan,
      status: mapStripeStatus(subscription.status),
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    } as never)
    .eq("stripe_subscription_id", subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = createAdminClient();

  await supabase
    .from("subscriptions")
    .update({
      plan: "free" as SubscriptionPlan,
      status: "canceled" as SubscriptionStatus,
      canceled_at: new Date().toISOString(),
    } as never)
    .eq("stripe_subscription_id", subscription.id);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // checkout.session.completed で処理済みのため、ここでは期間の更新のみ
  // Stripe v20+ では subscription プロパティが直接存在しないため、
  // subscription_details?.metadata 経由か、レガシー互換でキャストして取得する
  const invoiceRecord = invoice as unknown as Record<string, unknown>;
  const subscriptionRef = invoiceRecord.subscription as string | { id: string } | null | undefined;
  if (!subscriptionRef) return;

  const stripe = getStripe();
  const subscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await handleSubscriptionUpdated(subscription);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const invoiceRecord = invoice as unknown as Record<string, unknown>;
  const subscriptionRef = invoiceRecord.subscription as string | { id: string } | null | undefined;
  if (!subscriptionRef) return;

  const supabase = createAdminClient();
  const subscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;

  await supabase
    .from("subscriptions")
    .update({ status: "past_due" as SubscriptionStatus } as never)
    .eq("stripe_subscription_id", subscriptionId);
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "署名がありません" }, { status: 400 });
    }

    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, getWebhookSecret());

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        // 未処理のイベントは無視
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook] Error:", error);
    Sentry.captureException(error, {
      tags: { api_route: "/api/stripe/webhook" },
    });
    return NextResponse.json(
      { error: "Webhook の処理に失敗しました" },
      { status: 400 }
    );
  }
}
