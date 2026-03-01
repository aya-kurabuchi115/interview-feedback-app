import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "./onboarding-wizard";

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
    redirect("/login");
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
