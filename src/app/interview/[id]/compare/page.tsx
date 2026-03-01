import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { redirectToLogin } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { CompareContent } from "./compare-content";

type Interview = Database["public"]["Tables"]["interviews"]["Row"];
type Feedback = Database["public"]["Tables"]["feedbacks"]["Row"];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "フィードバック比較 | InterviewCoach",
    description:
      "面接フィードバックを比較して成長を可視化します。カテゴリ別スコアや改善ポイントの変化を確認できます。",
    robots: { index: false },
  };
}

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const compareId = (query.with as string) || "";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) { await redirectToLogin(); return null; }

  // 現在の面接を取得（user_id フィルタで Defence-in-Depth）
  const { data: currentInterviewData } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const currentInterview = currentInterviewData as Interview | null;
  if (!currentInterview) redirect("/dashboard");

  // 現在の面接のフィードバック取得（user_id フィルタで Defence-in-Depth）
  const { data: currentFeedbackData } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("interview_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const currentFeedback = currentFeedbackData as Feedback | null;

  // ユーザーの全面接一覧を取得（比較対象ドロップダウン用）
  const { data: allInterviewsData } = await supabase
    .from("interviews")
    .select(
      "id, title, company_name_snapshot, company_id, interview_date, status"
    )
    .eq("user_id", user.id)
    .eq("status", "completed")
    .neq("id", id)
    .order("interview_date", { ascending: false, nullsFirst: false });

  const allInterviews = (allInterviewsData ?? []) as Interview[];

  // 比較対象の面接情報を取得
  let compareInterview: Interview | null = null;
  let compareFeedback: Feedback | null = null;

  if (compareId) {
    const { data: compareInterviewData } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", compareId)
      .eq("user_id", user.id)
      .single();

    compareInterview = compareInterviewData as Interview | null;

    if (compareInterview) {
      // 比較対象のフィードバック取得（user_id フィルタで Defence-in-Depth）
      const { data: compareFeedbackData } = await supabase
        .from("feedbacks")
        .select("*")
        .eq("interview_id", compareId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      compareFeedback = compareFeedbackData as Feedback | null;
    }
  }

  return (
    <CompareContent
      currentInterview={currentInterview}
      currentFeedback={currentFeedback}
      compareInterview={compareInterview}
      compareFeedback={compareFeedback}
      allInterviews={allInterviews}
      currentInterviewId={id}
    />
  );
}
