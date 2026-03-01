import { createClient } from "@/lib/supabase/server";
import { redirectToLogin } from "@/lib/auth/redirect";
import type { Metadata } from "next";
import { ESReviewHistoryContent } from "./history-content";

export const metadata: Metadata = {
  title: "ES添削履歴",
  description: "過去のES添削結果の一覧を確認できます。",
};

export default async function ESReviewHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await redirectToLogin();
    return null;
  }

  const { data, error } = await supabase
    .from("es_reviews")
    .select("id, question, answer, char_count, score, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const reviews = (error ? [] : data) as {
    id: string;
    question: string;
    answer: string;
    char_count: number;
    score: number | null;
    status: string;
    created_at: string;
  }[];

  return <ESReviewHistoryContent reviews={reviews} />;
}
