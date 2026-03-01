import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Database, InterviewCategory } from "@/types/database";
import { InterviewCard } from "@/components/interview-card";
import { InterviewFilter, type SortOption } from "@/components/interview-filter";

type Interview = Database["public"]["Tables"]["interviews"]["Row"];
type Feedback = Database["public"]["Tables"]["feedbacks"]["Row"];

/** 面接 + 最新フィードバックの結合型 */
type InterviewWithScore = Interview & {
  overallScore: number | null;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --- URL パラメータ取得 ---
  const params = await searchParams;
  const categoryParam = (params.category as string) || "all";
  const sortParam = (params.sort as string) || "date_desc";

  const currentCategory = ["arubaito", "intern", "new_grad", "other", "all"].includes(
    categoryParam
  )
    ? (categoryParam as InterviewCategory | "all")
    : "all";

  const currentSort = ["date_desc", "date_asc", "score_desc", "score_asc"].includes(
    sortParam
  )
    ? (sortParam as SortOption)
    : "date_desc";

  // --- データ取得 ---
  let interviewQuery = supabase.from("interviews").select("*");

  if (currentCategory !== "all") {
    interviewQuery = interviewQuery.eq("interview_category", currentCategory);
  }

  // DB レベルでのソート（日付順の場合）
  if (currentSort === "date_desc" || currentSort === "score_desc" || currentSort === "score_asc") {
    interviewQuery = interviewQuery.order("interview_date", {
      ascending: false,
      nullsFirst: false,
    });
  } else {
    interviewQuery = interviewQuery.order("interview_date", {
      ascending: true,
      nullsFirst: false,
    });
  }

  const { data: interviewsData } = await interviewQuery;
  const interviews = (interviewsData ?? []) as Interview[];

  // フィードバック取得（全面接分を一括取得）
  const interviewIds = interviews.map((i) => i.id);

  let feedbacks: Feedback[] = [];
  if (interviewIds.length > 0) {
    const { data: feedbacksData } = await supabase
      .from("feedbacks")
      .select("*")
      .in("interview_id", interviewIds);
    feedbacks = (feedbacksData ?? []) as Feedback[];
  }

  // 各面接の最新フィードバックのスコアをマッピング
  const scoreMap = new Map<string, number>();
  for (const fb of feedbacks) {
    const existing = scoreMap.get(fb.interview_id);
    if (existing === undefined || fb.overall_score > existing) {
      scoreMap.set(fb.interview_id, fb.overall_score);
    }
  }

  const interviewsWithScore: InterviewWithScore[] = interviews.map((iv) => ({
    ...iv,
    overallScore: scoreMap.get(iv.id) ?? null,
  }));

  // スコア順ソート（アプリレベル）
  if (currentSort === "score_desc") {
    interviewsWithScore.sort((a, b) => {
      if (a.overallScore === null && b.overallScore === null) return 0;
      if (a.overallScore === null) return 1;
      if (b.overallScore === null) return -1;
      return b.overallScore - a.overallScore;
    });
  } else if (currentSort === "score_asc") {
    interviewsWithScore.sort((a, b) => {
      if (a.overallScore === null && b.overallScore === null) return 0;
      if (a.overallScore === null) return 1;
      if (b.overallScore === null) return -1;
      return a.overallScore - b.overallScore;
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">面接履歴</h1>
        <Button asChild>
          <Link href="/interview/new">
            <Plus className="mr-2 h-4 w-4" />
            新規面接を記録
          </Link>
        </Button>
      </div>

      {/* フィルタ・ソート */}
      <div className="mt-6">
        <InterviewFilter
          currentCategory={currentCategory}
          currentSort={currentSort}
          totalCount={interviewsWithScore.length}
        />
      </div>

      {/* 一覧 */}
      <div className="mt-6">
        {interviewsWithScore.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-4 text-lg font-semibold">
              {currentCategory !== "all"
                ? "条件に一致する面接がありません"
                : "最初の面接を記録しましょう"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {currentCategory !== "all"
                ? "フィルタ条件を変更するか、新しい面接を記録してください。"
                : "面接を登録して最初のフィードバックを受けましょう。"}
            </p>
            <Button className="mt-6" asChild>
              <Link href="/interview/new">
                <Plus className="mr-2 h-4 w-4" />
                新規面接を記録
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {interviewsWithScore.map((interview) => (
              <InterviewCard
                key={interview.id}
                id={interview.id}
                companyName={interview.company_name_snapshot}
                category={interview.interview_category}
                round={interview.interview_round}
                interviewDate={interview.interview_date}
                overallScore={interview.overallScore}
                status={interview.status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
