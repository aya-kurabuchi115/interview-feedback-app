import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { redirectToLogin } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

// オンボーディングウィザードは重いインタラクティブコンポーネントのため遅延ロード
const OnboardingWizard = dynamic(
  () => import("./onboarding-wizard").then((mod) => mod.OnboardingWizard),
  {
    loading: () => (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    ),
  }
);

/**
 * オンボーディングページ (Server Component)
 * - 未認証ユーザーは /login にリダイレクト
 * - 既にオンボーディング完了済みのユーザーは /dashboard にリダイレクト
 */
export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await redirectToLogin();
    return null;
  }

  // オンボーディング完了チェック
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .single();

  if ((profile as { onboarding_completed?: boolean } | null)?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <OnboardingWizard />
    </div>
  );
}
