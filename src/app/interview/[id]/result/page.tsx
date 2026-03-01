import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { ResultContent } from "./result-content";

type Interview = Database["public"]["Tables"]["interviews"]["Row"];
type Transcript = Database["public"]["Tables"]["transcripts"]["Row"];
type Feedback = Database["public"]["Tables"]["feedbacks"]["Row"];

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
  if (!user) redirect("/login");

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
  const { data: feedbackData } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("interview_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const feedback = feedbackData as Feedback | null;

  return (
    <ResultContent
      interview={interview}
      transcripts={transcripts}
      feedback={feedback}
    />
  );
}
