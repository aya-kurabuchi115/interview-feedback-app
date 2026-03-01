import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MockInterviewMessage } from "@/types/database";
import { ChatInterface } from "./chat-interface";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "模擬面接中 | InterviewCoach",
    robots: { index: false, follow: false },
  };
}

/**
 * AI模擬面接チャット画面 (Server Component)
 * - 認証チェック + user_id フィルタ（Defence-in-Depth）
 * - mock_interviews からデータ取得
 * - status チェック（in_progress でなければリダイレクト）
 */
export default async function MockInterviewChatPage({
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
    redirect("/login");
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

  const mockInterview = mockData as unknown as {
    id: string;
    user_id: string;
    company_name: string | null;
    industry: string | null;
    category: string;
    round: string;
    duration_minutes: number;
    difficulty: string;
    messages: MockInterviewMessage[];
    status: string;
    total_questions: number;
    started_at: string;
    completed_at: string | null;
  };

  // in_progress でなければセットアップ画面にリダイレクト
  if (mockInterview.status !== "in_progress") {
    redirect(`/mock-interview`);
  }

  // メッセージ配列を安全にパース
  const messages: MockInterviewMessage[] = Array.isArray(mockInterview.messages)
    ? mockInterview.messages
    : [];

  return (
    <ChatInterface
      interviewId={mockInterview.id}
      initialMessages={messages}
      durationMinutes={mockInterview.duration_minutes}
      startedAt={mockInterview.started_at}
      totalQuestions={mockInterview.total_questions}
      category={mockInterview.category}
      companyName={mockInterview.company_name}
      difficulty={mockInterview.difficulty}
    />
  );
}
