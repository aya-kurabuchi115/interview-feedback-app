import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { ESReviewResultContent } from "./result-content";
import type { ESFeedback } from "@/types/es-review";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { title: "ES添削結果" };
  }

  const { data } = await supabase
    .from("es_reviews")
    .select("question, score")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const review = data as { question: string; score: number | null } | null;

  if (!review) {
    return { title: "ES添削結果" };
  }

  const scoreText = review.score !== null ? `${review.score}点` : "";
  return {
    title: `ES添削結果${scoreText ? ` (${scoreText})` : ""} - ${review.question.substring(0, 30)}`,
  };
}

export default async function ESReviewDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data, error } = await supabase
    .from("es_reviews")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    notFound();
  }

  const review = data as {
    id: string;
    question: string;
    answer: string;
    char_count: number;
    feedback: ESFeedback | null;
    score: number | null;
    status: string;
    created_at: string;
  };

  if (review.status !== "completed" || !review.feedback) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">添削処理中</h1>
          <p className="mt-2 text-muted-foreground">
            {review.status === "error"
              ? "添削処理中にエラーが発生しました。再度お試しください。"
              : "添削結果を生成中です。しばらくお待ちください。"}
          </p>
        </div>
      </div>
    );
  }

  // feedback が null でないことは上のガードで確認済み
  const reviewWithFeedback = {
    ...review,
    feedback: review.feedback,
  };

  return <ESReviewResultContent review={reviewWithFeedback} />;
}
