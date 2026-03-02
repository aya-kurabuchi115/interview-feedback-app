import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription, getRemainingUsage } from "@/lib/subscription";
import { unauthorized, serverError } from "@/lib/api/error-response";
import { reportApiError } from "@/lib/error-reporting";

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
    const usage = await getRemainingUsage(user.id);

    return NextResponse.json(
      { subscription, usage },
      {
        headers: {
          "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
        },
      }
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
