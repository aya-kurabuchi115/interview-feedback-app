import { Plus, ClipboardList, MessageSquare, BookOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { InterviewFilter, type SortOption } from "@/components/interview-filter";
import { InterviewListClient, type InterviewItem } from "@/components/dashboard/interview-list-client";
import { createClient } from "@/lib/supabase/server";
import type { Database, InterviewCategory } from "@/types/database";

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

interface InterviewListSectionProps {
  userId: string;
  currentCategory: InterviewCategory | "all";
  currentSort: SortOption;
  tagParam: string;
  /** "active" | "archived" — デフォルト "active" */
  currentTab?: "active" | "archived";
}

/**
 * ダッシュボード面接一覧の async Server Component
 * Suspense 境界内でデータ取得 + レンダリングを行う
 */
export async function InterviewListSection({
  userId,
  currentCategory,
  currentSort,
  tagParam,
  currentTab = "active",
}: InterviewListSectionProps) {
  const supabase = await createClient();

  // --- データ取得 ---
  // 必要なカラムのみ取得してレスポンスサイズを削減
  let interviewQuery = supabase
    .from("interviews")
    .select(
      "id, title, company_name_snapshot, interview_category, interview_round, interview_date, status, archived_at, deleted_at"
    )
    .eq("user_id", userId)
    // ソフトデリートされたレコードは除外
    .is("deleted_at", null);

  // タブに応じてアーカイブフィルタ
  if (currentTab === "archived") {
    interviewQuery = interviewQuery.not("archived_at", "is", null);
  } else {
    interviewQuery = interviewQuery.is("archived_at", null);
  }

  if (currentCategory !== "all") {
    interviewQuery = interviewQuery.eq("interview_category", currentCategory);
  }

  // DB レベルでのソート（日付順の場合）
  if (
    currentSort === "date_desc" ||
    currentSort === "score_desc" ||
    currentSort === "score_asc"
  ) {
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
  const interviewIds = interviews.map((i) => i.id);

  // feedbacks, tags, interview_tags を Promise.all で並列取得
  const [feedbacksResult, userTagsResult, interviewTagsResult] =
    await Promise.all([
      // フィードバック取得（全面接分を一括取得）
      interviewIds.length > 0
        ? supabase
            .from("feedbacks")
            .select("interview_id, overall_score")
            .in("interview_id", interviewIds)
        : Promise.resolve({ data: null }),
      // ユーザーのタグ取得
      supabase
        .from("tags")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
      // 面接タグ関連取得
      interviewIds.length > 0
        ? supabase
            .from("interview_tags")
            .select("interview_id, tag_id")
            .in("interview_id", interviewIds)
        : Promise.resolve({ data: null }),
    ]);

  const feedbacks = (feedbacksResult.data ?? []) as Feedback[];
  const userTags = (userTagsResult.data ?? []) as Tag[];
  const interviewTagRows = (interviewTagsResult.data ?? []) as InterviewTagRow[];

  // 各面接の最新フィードバックのスコアをマッピング
  const scoreMap = new Map<string, number>();
  for (const fb of feedbacks) {
    const existing = scoreMap.get(fb.interview_id);
    if (existing === undefined || fb.overall_score > existing) {
      scoreMap.set(fb.interview_id, fb.overall_score);
    }
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

  // Client Component に渡すデータを整形
  const interviewItems: InterviewItem[] = interviewsWithScore.map((iv) => ({
    id: iv.id,
    companyName: iv.company_name_snapshot,
    category: iv.interview_category,
    round: iv.interview_round,
    interviewDate: iv.interview_date,
    overallScore: iv.overallScore,
    status: iv.status,
    tags: iv.tags.map((t) => ({ id: t.id, name: t.name, color: t.color })),
  }));

  // 面接が一件もない場合（フィルタなし・アクティブタブの初回状態）
  const isEmptyWithoutFilters =
    currentTab === "active" &&
    currentCategory === "all" &&
    !tagParam &&
    interviewsWithScore.length === 0;

  return (
    <>
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
        {isEmptyWithoutFilters ? (
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
        ) : currentCategory !== "all" || tagParam
          ? interviewsWithScore.length === 0
            ? (
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
            )
            : (
              <InterviewListClient
                interviews={interviewItems}
                currentTab={currentTab}
              />
            )
          : (
            <InterviewListClient
              interviews={interviewItems}
              currentTab={currentTab}
            />
          )}
      </div>
    </>
  );
}
