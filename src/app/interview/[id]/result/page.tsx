import { redirect } from "next/navigation";
import { redirectToLogin } from "@/lib/auth/redirect";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import type { Database } from "@/types/supabase";
import { ResultContent } from "./result-content";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "面接結果 | InterviewCoach",
    robots: { index: false },
  };
}

type Interview = Database["public"]["Tables"]["interviews"]["Row"];
type Transcript = Database["public"]["Tables"]["transcripts"]["Row"];
type Feedback = Database["public"]["Tables"]["feedbacks"]["Row"];

interface TagData {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) { await redirectToLogin(); return null; }

  const { data: interviewData } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const interview = interviewData as Interview | null;
  if (!interview) redirect("/dashboard");

  const { data: transcriptsData } = await supabase
    .from("transcripts")
    .select("*")
    .eq("interview_id", id)
    .order("start_time", { ascending: true });

  const transcripts = (transcriptsData ?? []) as Transcript[];

  // 最新のフィードバックを取得（履歴として複数保持されるため）
  // Defence-in-Depth: RLS に加えアプリケーション層でも user_id フィルタ
  const { data: feedbackData } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("interview_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const feedback = feedbackData as Feedback | null;

  // 面接に付与されたタグを取得
  const { data: interviewTagsData } = await supabase
    .from("interview_tags")
    .select("tag_id, tags(id, name, color, created_at)")
    .eq("interview_id", id);

  const interviewTags: TagData[] = ((interviewTagsData ?? []) as never[])
    .map((row: Record<string, unknown>) => row.tags as TagData | null)
    .filter((t): t is TagData => t !== null && !Array.isArray(t));

  // 比較可能な他の完了済み面接が存在するか確認
  const { count: otherCompletedCount } = await supabase
    .from("interviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed")
    .neq("id", id);

  const hasOtherInterviews = (otherCompletedCount ?? 0) > 0;

  // ユーザーのサブスクリプション情報を取得（アップセルカード用）
  const subscription = await getUserSubscription(user.id);

  // 原文テキストを取得（transcripts → interview.transcript の優先順）
  let rawTranscript: string | null = null;
  if (transcripts.length > 0) {
    rawTranscript = transcripts
      .map((t) => {
        const speaker = t.speaker === "interviewer" ? "面接官" : "候補者";
        return `[${speaker}] ${t.content}`;
      })
      .join("\n");
  } else if (interview.transcript) {
    rawTranscript = interview.transcript;
  }

  return (
    <ResultContent
      interview={interview}
      transcripts={transcripts}
      feedback={feedback}
      interviewTags={interviewTags}
      hasOtherInterviews={hasOtherInterviews}
      rawTranscript={rawTranscript}
      currentPlan={subscription.plan}
    />
  );
}
