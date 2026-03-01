import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { DiagnosisClient } from "./diagnosis-client";

export const metadata: Metadata = {
  title: "パーソナリティ診断テスト",
  description:
    "10問の簡単なテストであなたの16パーソナリティタイプを診断。面接での強み・弱みを把握して就活に活かそう。",
  robots: { index: false, follow: false },
};

/**
 * パーソナリティ診断ページ (Server Component)
 * - 認証チェック
 * - Pro/Premium プランチェック
 */
export default async function DiagnosisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // プランチェック: Pro/Premium のみ
  const subscription = await getUserSubscription(user.id);
  if (subscription.plan === "free") {
    redirect("/pricing");
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <DiagnosisClient />
    </div>
  );
}
