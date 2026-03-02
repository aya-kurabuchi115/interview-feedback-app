import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { PLANS, getBaseUrl, PAID_PLAN_KEYS } from "@/lib/stripe/config";
import type { PaidPlanKey } from "@/lib/stripe/config";
import { getUserSubscription } from "@/lib/subscription";
import { unauthorized, badRequest, serverError } from "@/lib/api/error-response";
import { reportApiError } from "@/lib/error-reporting";

interface CheckoutRequest {
  plan?: string;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return unauthorized();
    }

    // リクエストボディからプランを取得（デフォルトは pro）
    let targetPlan: PaidPlanKey = "pro";
    try {
      const body = (await request.json()) as CheckoutRequest;
      if (body.plan && PAID_PLAN_KEYS.includes(body.plan as PaidPlanKey)) {
        targetPlan = body.plan as PaidPlanKey;
      }
    } catch {
      // body が空の場合はデフォルトの pro を使用
    }

    // 既に同一以上のプランの場合はエラー
    const subscription = await getUserSubscription(user.id);
    const planOrder = ["free", "pro", "premium", "enterprise"] as const;
    const currentIndex = planOrder.indexOf(subscription.plan as (typeof planOrder)[number]);
    const targetIndex = planOrder.indexOf(targetPlan);

    if (currentIndex >= targetIndex) {
      return NextResponse.json(
        { error: "既に同等以上のプランに加入済みです。プラン変更は設定画面の「支払い・プラン管理」からお手続きください。" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const priceId = PLANS[targetPlan].stripePriceId;
    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe Price ID が設定されていません" },
        { status: 500 }
      );
    }

    const baseUrl = getBaseUrl();

    // 既存の Stripe Customer があれば再利用
    let customerId: string | undefined;
    if (subscription.stripeCustomerId) {
      customerId = subscription.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing/cancel`,
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan: targetPlan },
      },
      metadata: { supabase_user_id: user.id, plan: targetPlan },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    reportApiError(error, {
      apiRoute: "/api/stripe/checkout",
      featureArea: "stripe",
    });
    return NextResponse.json(
      { error: "チェックアウトセッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
