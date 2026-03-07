import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription, getRemainingUsageByFeature } from "@/lib/subscription";
import { unauthorized } from "@/lib/api/error-response";
import { reportApiError } from "@/lib/error-reporting";
import { CACHE_PRIVATE_SHORT } from "@/lib/api/cache-headers";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return unauthorized();
    }

    const subscription = await getUserSubscription(user.id);
    const usage = await getRemainingUsageByFeature(user.id);

    return NextResponse.json(
      { subscription, usage },
      { headers: CACHE_PRIVATE_SHORT }
    );
  } catch (error) {
    reportApiError(error, {
      apiRoute: "/api/subscription",
      featureArea: "subscription",
    });
    return NextResponse.json(
      { error: "サブスクリプション情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}
