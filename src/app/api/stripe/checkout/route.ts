import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { PLANS, getBaseUrl } from "@/lib/stripe/config";
import { getUserSubscription } from "@/lib/subscription";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 既に Pro 以上のプランの場合はエラー
    const subscription = await getUserSubscription(user.id);
    if (subscription.plan !== "free") {
      return NextResponse.json(
        { error: "既に有料プランに加入済みです" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const priceId = PLANS.pro.stripePriceId;
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
        metadata: { supabase_user_id: user.id },
      },
      metadata: { supabase_user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout] Error:", error);
    return NextResponse.json(
      { error: "チェックアウトセッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
