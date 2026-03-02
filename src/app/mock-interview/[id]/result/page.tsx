import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { redirectToLogin } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";
import dynamic from "next/dynamic";
import type { MockInterviewMessage, Json } from "@/types/database";

// 結果コンテンツは重いクライアントコンポーネントのため遅延ロード
const MockResultContent = dynamic(
  () => import("./result-content").then((mod) => mod.MockResultContent),
  {
    loading: () => (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted mb-6" />
        <div className="h-96 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    ),
  }
);

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "模擬面接結果 | InterviewCoach",
    robots: { index: false },
  };
}

/** mock_interviews の行型 */
interface MockInterviewRow {
  id: string;
  user_id: string;
  company_name: string | null;
  industry: string | null;
  category: string;
  round: string;
  duration_minutes: number;
  difficulty: string;
  messages: Json;
  status: string;
  total_questions: number;
  started_at: string;
  completed_at: string | null;
  feedback_id: string | null;
  created_at: string;
}

/** feedbacks の行型(raw_response 含む) */
interface FeedbackRow {
  id: string;
  interview_id: string;
  user_id: string | null;
  overall_score: number;
  summary: string;
  good_points: Json;
  improvement_points: Json;
  overall_comment: string | null;
  category_scores: Json;
  filler_words: Json;
  suggestions: Json;
  strengths: Json;
  improvements: Json;
  annotations: Json;
  raw_response: Json | null;
  model_version: string | null;
  created_at: string;
}

export default async function MockInterviewResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await redirectToLogin();
    return null;
  }

  // Defence-in-Depth: RLS + user_id フィルタ
  const { data: mockData, error: fetchError } = await supabase
    .from("mock_interviews")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !mockData) {
    notFound();
  }

  const mockInterview = mockData as unknown as MockInterviewRow;

  // メッセージ配列を安全にパース
  const messages: MockInterviewMessage[] = Array.isArray(mockInterview.messages)
    ? (mockInterview.messages as unknown as MockInterviewMessage[])
    : [];

  // フィードバックを取得
  let feedback: FeedbackRow | null = null;
  if (mockInterview.feedback_id) {
    const { data: feedbackData } = await supabase
      .from("feedbacks")
      .select("*")
      .eq("id", mockInterview.feedback_id)
      .eq("user_id", user.id)
      .single();

    feedback = feedbackData as unknown as FeedbackRow | null;
  }

  return (
    <MockResultContent
      mockInterview={{
        id: mockInterview.id,
        company_name: mockInterview.company_name,
        industry: mockInterview.industry,
        category: mockInterview.category,
        round: mockInterview.round,
        difficulty: mockInterview.difficulty,
        total_questions: mockInterview.total_questions,
        started_at: mockInterview.started_at,
        completed_at: mockInterview.completed_at,
        status: mockInterview.status,
        feedback_id: mockInterview.feedback_id,
      }}
      messages={messages}
      feedback={feedback ? {
        id: feedback.id,
        overall_score: feedback.overall_score,
        summary: feedback.summary,
        good_points: feedback.good_points,
        improvement_points: feedback.improvement_points,
        overall_comment: feedback.overall_comment,
        category_scores: feedback.category_scores,
        filler_words: feedback.filler_words,
        raw_response: feedback.raw_response,
      } : null}
    />
  );
}
