import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { redirectToLogin } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";
import dynamic from "next/dynamic";
import { getUserSubscription } from "@/lib/subscription";

// 診断クライアントは重いインタラクティブコンポーネントのため遅延ロード
const DiagnosisClient = dynamic(
  () => import("./diagnosis-client").then((mod) => mod.DiagnosisClient),
  {
    loading: () => (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    ),
  }
);

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
    await redirectToLogin();
    return null;
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
