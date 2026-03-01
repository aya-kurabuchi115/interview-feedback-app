import { redirectToLogin } from "@/lib/auth/redirect";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  MessageSquare,
  CheckCircle,
  Clock,
  ChevronRight,
  Plus,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "模擬面接履歴 | InterviewCoach",
  robots: { index: false },
};

// ============================================================
// 型定義
// ============================================================

interface MockInterviewHistoryRow {
  id: string;
  company_name: string | null;
  industry: string | null;
  category: string;
  round: string;
  difficulty: string;
  status: string;
  total_questions: number;
  started_at: string;
  completed_at: string | null;
  feedback_id: string | null;
  created_at: string;
}

interface FeedbackScoreRow {
  id: string;
  overall_score: number;
}

// ============================================================
// ラベル定数
// ============================================================

const CATEGORY_LABELS: Record<string, string> = {
  general: "人物面接",
  behavioral: "行動面接",
  technical: "技術面接",
  case: "ケース面接",
};

const ROUND_LABELS: Record<string, string> = {
  first: "一次",
  second: "二次",
  third: "三次",
  final: "最終",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "やさしい",
  normal: "標準",
  hard: "厳しい",
};

// ============================================================
// スコアバッジコンポーネント
// ============================================================

function ScoreBadge({ score }: { score: number }) {
  const colorClass =
    score >= 80
      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
      : score >= 60
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
        : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-bold ${colorClass}`}
    >
      {score}点
    </span>
  );
}

// ============================================================
// ページコンポーネント
// ============================================================

export default async function MockInterviewHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await redirectToLogin();
    return null;
  }

  // Defence-in-Depth: RLS + user_id フィルタ
  const { data: mockInterviewsData } = await supabase
    .from("mock_interviews")
    .select(
      "id, company_name, industry, category, round, difficulty, status, total_questions, started_at, completed_at, feedback_id, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const mockInterviews = (mockInterviewsData ?? []) as unknown as MockInterviewHistoryRow[];

  // フィードバックのスコアを一括取得
  const feedbackIds = mockInterviews
    .map((mi) => mi.feedback_id)
    .filter((id): id is string => id !== null);

  let feedbackScores: Record<string, number> = {};
  if (feedbackIds.length > 0) {
    const { data: feedbacksData } = await supabase
      .from("feedbacks")
      .select("id, overall_score")
      .in("id", feedbackIds)
      .eq("user_id", user.id);

    const feedbacks = (feedbacksData ?? []) as unknown as FeedbackScoreRow[];
    feedbackScores = Object.fromEntries(
      feedbacks.map((f) => [f.id, f.overall_score])
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                ダッシュボード
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold">模擬面接履歴</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            過去の模擬面接の結果を確認できます
          </p>
        </div>
        <Button asChild>
          <Link href="/mock-interview">
            <Plus className="mr-2 h-4 w-4" />
            新しい面接
          </Link>
        </Button>
      </div>

      {/* 履歴一覧 */}
      {mockInterviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="AI模擬面接で面接力を磨きましょう！"
          description="AIが面接官になって質問を投げかけます。回答後にはスコアと改善ポイントのフィードバックが受けられます。"
          primaryAction={{
            label: "模擬面接を始める",
            href: "/mock-interview",
            icon: Plus,
          }}
          secondaryActions={[
            {
              label: "面接を記録する",
              href: "/interview/new",
              icon: ClipboardList,
            },
          ]}
        />
      ) : (
        <div className="space-y-3">
          {mockInterviews.map((mi) => {
            const score =
              mi.feedback_id && feedbackScores[mi.feedback_id] !== undefined
                ? feedbackScores[mi.feedback_id]
                : null;
            const isCompleted = mi.status === "completed";
            const hasFeedback = mi.feedback_id !== null;

            return (
              <Link
                key={mi.id}
                href={
                  isCompleted
                    ? `/mock-interview/${mi.id}/result`
                    : `/mock-interview/${mi.id}/chat`
                }
                className="block"
              >
                <Card className="transition-colors hover:bg-accent/50">
                  <CardContent className="flex items-center gap-4 py-4">
                    {/* ステータスアイコン */}
                    <div className="shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <Clock className="h-8 w-8 text-yellow-500" />
                      )}
                    </div>

                    {/* 面接情報 */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="truncate font-medium text-sm">
                          {mi.company_name || "企業名なし"}
                        </span>
                        {score !== null && <ScoreBadge score={score} />}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className="text-xs">
                          {CATEGORY_LABELS[mi.category] || mi.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {ROUND_LABELS[mi.round] || mi.round}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {DIFFICULTY_LABELS[mi.difficulty] || mi.difficulty}
                        </Badge>
                        {!isCompleted && (
                          <Badge
                            variant="outline"
                            className="border-yellow-300 text-yellow-700 text-xs dark:border-yellow-700 dark:text-yellow-400"
                          >
                            進行中
                          </Badge>
                        )}
                        {isCompleted && !hasFeedback && (
                          <Badge
                            variant="outline"
                            className="border-blue-300 text-blue-700 text-xs dark:border-blue-700 dark:text-blue-400"
                          >
                            未分析
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          {new Date(mi.created_at).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span>質問 {mi.total_questions}問</span>
                      </div>
                    </div>

                    {/* 矢印 */}
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
