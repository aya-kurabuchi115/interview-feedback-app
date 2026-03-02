import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { getUserSubscription } from "@/lib/subscription";
import { getBaseUrl } from "@/lib/stripe/config";
import { unauthorized, badRequest, serverError } from "@/lib/api/error-response";
import { reportApiError } from "@/lib/error-reporting";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return unauthorized();
    }

    const subscription = await getUserSubscription(user.id);
    if (!subscription.stripeCustomerId) {
      return NextResponse.json(
        { error: "Stripe カスタマーが見つかりません" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${getBaseUrl()}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    reportApiError(error, {
      apiRoute: "/api/stripe/portal",
      featureArea: "stripe",
    });
    return NextResponse.json(
      { error: "ポータルセッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
