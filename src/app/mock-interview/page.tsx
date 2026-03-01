import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SetupForm } from "./setup-form";

export const metadata: Metadata = {
  title: "AI模擬面接",
  description:
    "AIが面接官役となり、リアルな模擬面接をテキストチャット形式で体験できます。",
  robots: { index: false, follow: false },
};

/**
 * AI模擬面接セットアップページ (Server Component)
 * - 認証チェック
 * - プロフィール情報を取得して初期値にセット
 */
export default async function MockInterviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // プロフィール情報を取得（初期値用）
  const { data: profile } = await supabase
    .from("profiles")
    .select("target_industry, personality_type")
    .eq("user_id", user.id)
    .single();

  const typedProfile = profile as { target_industry?: string[]; personality_type?: string | null } | null;
  const targetIndustry = typedProfile?.target_industry ?? [];
  const personalityType = typedProfile?.personality_type ?? null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">AI模擬面接</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        AIが面接官役となり、リアルな模擬面接を体験できます。設定を選んで面接を始めましょう。
      </p>
      <SetupForm defaultIndustry={targetIndustry[0] ?? ""} personalityType={personalityType} />
    </div>
  );
}
