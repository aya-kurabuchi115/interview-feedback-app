import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus, ClipboardList, MessageSquare, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Database, InterviewCategory } from "@/types/database";
import { InterviewCard } from "@/components/interview-card";
import { InterviewFilter, type SortOption } from "@/components/interview-filter";
import { ExportButtons } from "@/components/export-buttons";

export const metadata: Metadata = {
  title: "ダッシュボード",
  robots: { index: false, follow: false },
};

type Interview = Database["public"]["Tables"]["interviews"]["Row"];
type Feedback = Database["public"]["Tables"]["feedbacks"]["Row"];
type Tag = Database["public"]["Tables"]["tags"]["Row"];

interface InterviewTagRow {
  interview_id: string;
  tag_id: string;
}

/** 面接 + 最新フィードバックの結合型 */
type InterviewWithScore = Interview & {
  overallScore: number | null;
  tags: Tag[];
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
  const tagParam = (params.tag as string) || "";

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
  // 必要なカラムのみ取得してレスポンスサイズを削減
  let interviewQuery = supabase.from("interviews").select("id, title, company_name_snapshot, interview_category, interview_round, interview_date, status").eq("user_id", user.id);

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
      .select("interview_id, overall_score")
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

  // タグ取得
  const { data: userTagsData } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  const userTags = (userTagsData ?? []) as Tag[];

  let interviewTagRows: InterviewTagRow[] = [];
  if (interviewIds.length > 0) {
    const { data: itData } = await supabase
      .from("interview_tags")
      .select("interview_id, tag_id")
      .in("interview_id", interviewIds);
    interviewTagRows = (itData ?? []) as InterviewTagRow[];
  }

  const tagMap = new Map<string, Tag[]>();
  for (const row of interviewTagRows) {
    const tag = userTags.find((t) => t.id === row.tag_id);
    if (tag) {
      const existing = tagMap.get(row.interview_id) ?? [];
      existing.push(tag);
      tagMap.set(row.interview_id, existing);
    }
  }

  let interviewsWithScore: InterviewWithScore[] = interviews.map((iv) => ({
    ...iv,
    overallScore: scoreMap.get(iv.id) ?? null,
    tags: tagMap.get(iv.id) ?? [],
  }));

  // タグフィルタリング
  if (tagParam) {
    interviewsWithScore = interviewsWithScore.filter((iv) =>
      iv.tags.some((t) => t.id === tagParam)
    );
  }

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
        <div className="flex items-center gap-2">
          <Suspense fallback={<div className="h-9 w-[180px] animate-pulse rounded-md bg-muted" />}>
            <ExportButtons variant="dropdown" />
          </Suspense>
          <Button variant="outline" asChild>
            <Link href="/mock-interview">
              <MessageSquare className="mr-2 h-4 w-4" />
              AI模擬面接
            </Link>
          </Button>
          <Button asChild>
            <Link href="/interview/new">
              <Plus className="mr-2 h-4 w-4" />
              新規面接を記録
            </Link>
          </Button>
        </div>
      </div>

      {/* フィルタ・ソート */}
      <div className="mt-6">
        <InterviewFilter
          currentCategory={currentCategory}
          currentSort={currentSort}
          totalCount={interviewsWithScore.length}
          tags={userTags}
          currentTag={tagParam}
        />
      </div>

      {/* 一覧 */}
      <div className="mt-6">
        {interviewsWithScore.length === 0 ? (
          currentCategory !== "all" || tagParam ? (
            <EmptyState
              icon={ClipboardList}
              title="条件に一致する面接がありません"
              description="フィルタ条件を変更するか、新しい面接を記録してください。"
              primaryAction={{
                label: "新規面接を記録",
                href: "/interview/new",
                icon: Plus,
              }}
              variant="no-results"
            />
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="さっそく面接練習を始めましょう！"
              description="面接を記録してAIフィードバックを受けると、ここにスコアや改善点が表示されます。"
              primaryAction={{
                label: "面接を記録する",
                href: "/interview/new",
                icon: Plus,
              }}
              secondaryActions={[
                {
                  label: "AI模擬面接を試す",
                  href: "/mock-interview",
                  icon: MessageSquare,
                },
                {
                  label: "質問集を見る",
                  href: "/question-bank",
                  icon: BookOpen,
                },
              ]}
            />
          )
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
                tags={interview.tags}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
