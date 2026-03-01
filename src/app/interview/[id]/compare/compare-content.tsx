"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  TrendingUp,
  Building2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Database } from "@/types/supabase";
import type { CategoryScores } from "@/types/database";
import { CATEGORY_LABELS } from "@/lib/constants";

type Interview = Database["public"]["Tables"]["interviews"]["Row"];
type Feedback = Database["public"]["Tables"]["feedbacks"]["Row"];

interface CompareContentProps {
  currentInterview: Interview;
  currentFeedback: Feedback | null;
  compareInterview: Interview | null;
  compareFeedback: Feedback | null;
  allInterviews: Interview[];
  currentInterviewId: string;
}

/** スコア差分の色・アイコンを返す */
function getScoreDiffStyle(diff: number) {
  if (diff > 0) {
    return {
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-800",
      icon: ArrowUpRight,
      label: `+${diff}`,
    };
  }
  if (diff < 0) {
    return {
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
      icon: ArrowDownRight,
      label: `${diff}`,
    };
  }
  return {
    color: "text-gray-500",
    bg: "bg-gray-50 dark:bg-gray-950/30",
    border: "border-gray-200 dark:border-gray-800",
    icon: Minus,
    label: "0",
  };
}

/** スコアの色を返す */
function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

function getScoreBgColor(score: number) {
  if (score >= 80) return "bg-green-50 dark:bg-green-950/30";
  if (score >= 60) return "bg-yellow-50 dark:bg-yellow-950/30";
  return "bg-red-50 dark:bg-red-950/30";
}

function getBarColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

/** 面接日付のフォーマット */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "日付なし";
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

// ============================================================
// スコア比較カード
// ============================================================

function OverallScoreCompare({
  currentScore,
  compareScore,
}: {
  currentScore: number;
  compareScore: number;
}) {
  const diff = currentScore - compareScore;
  const style = getScoreDiffStyle(diff);
  const DiffIcon = style.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" />
          総合スコア比較
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
          {/* 前回スコア */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              比較対象
            </span>
            <span
              className={`text-5xl font-bold ${getScoreColor(compareScore)}`}
            >
              {compareScore}
            </span>
            <Progress value={compareScore} className="w-32" />
          </div>

          {/* 差分 */}
          <div
            className={`flex flex-col items-center gap-1 rounded-lg border px-4 py-3 ${style.bg} ${style.border}`}
          >
            <DiffIcon className={`h-6 w-6 ${style.color}`} />
            <span className={`text-2xl font-bold ${style.color}`}>
              {style.label}
            </span>
            <span className="text-xs text-muted-foreground">スコア差分</span>
          </div>

          {/* 今回スコア */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              今回
            </span>
            <span
              className={`text-5xl font-bold ${getScoreColor(currentScore)}`}
            >
              {currentScore}
            </span>
            <Progress value={currentScore} className="w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// カテゴリ別スコア比較
// ============================================================

function CategoryScoreCompare({
  currentScores,
  compareScores,
}: {
  currentScores: CategoryScores | null;
  compareScores: CategoryScores | null;
}) {
  // 全カテゴリキーを統合
  const allKeys = useMemo(() => {
    const keys = new Set<string>();
    if (currentScores) {
      Object.keys(currentScores).forEach((k) => keys.add(k));
    }
    if (compareScores) {
      Object.keys(compareScores).forEach((k) => keys.add(k));
    }
    return Array.from(keys);
  }, [currentScores, compareScores]);

  if (allKeys.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        カテゴリ別スコアデータがありません
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {allKeys.map((key) => {
        const currentVal =
          currentScores && typeof currentScores[key] === "number"
            ? (currentScores[key] as number)
            : 0;
        const compareVal =
          compareScores && typeof compareScores[key] === "number"
            ? (compareScores[key] as number)
            : 0;
        const diff = currentVal - compareVal;
        const style = getScoreDiffStyle(diff);
        const label = CATEGORY_LABELS[key] || key;

        return (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{label}</span>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{compareVal}点</span>
                <span className="text-muted-foreground">&rarr;</span>
                <span className="font-medium">{currentVal}点</span>
                <Badge
                  variant="outline"
                  className={`${style.color} ${style.bg} ${style.border}`}
                >
                  {style.label}
                </Badge>
              </div>
            </div>
            {/* 比較バー */}
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="h-3 w-full rounded-full bg-muted">
                  <div
                    className={`h-3 rounded-full opacity-40 transition-all duration-500 ${getBarColor(compareVal)}`}
                    style={{ width: `${compareVal}%` }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="h-3 w-full rounded-full bg-muted">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getBarColor(currentVal)}`}
                    style={{ width: `${currentVal}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex text-xs text-muted-foreground">
              <span className="flex-1">比較対象</span>
              <span className="flex-1">今回</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// フィードバックカード（左右並列表示用）
// ============================================================

function FeedbackSideCard({
  label,
  interview,
  feedback,
}: {
  label: string;
  interview: Interview;
  feedback: Feedback | null;
}) {
  if (!feedback) {
    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-base">{label}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            フィードバックがありません
          </p>
        </CardContent>
      </Card>
    );
  }

  const goodPoints = parseStringArray(feedback.good_points);
  const improvementPoints = parseStringArray(feedback.improvement_points);
  const strengths = parseStringArray(feedback.strengths);
  const improvements = parseStringArray(feedback.improvements);
  const displayGood = goodPoints.length > 0 ? goodPoints : strengths;
  const displayImprove =
    improvementPoints.length > 0 ? improvementPoints : improvements;

  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{label}</CardTitle>
          <Badge variant="outline">
            {formatDate(interview.interview_date)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {interview.company_name_snapshot} - {interview.title}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 総合スコア */}
        <div
          className={`flex items-center justify-center gap-2 rounded-lg p-4 ${getScoreBgColor(feedback.overall_score)}`}
        >
          <span
            className={`text-4xl font-bold ${getScoreColor(feedback.overall_score)}`}
          >
            {feedback.overall_score}
          </span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>

        {/* 良い点 */}
        {displayGood.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-green-600">
              良い点
            </h4>
            <ul className="space-y-1">
              {displayGood.map((point, i) => (
                <li key={i} className="text-xs leading-relaxed">
                  <span className="mr-1 text-green-500">&bull;</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 改善点 - ハイライト表示 */}
        {displayImprove.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-orange-600">
              改善ポイント
            </h4>
            <ul className="space-y-1">
              {displayImprove.map((point, i) => (
                <li
                  key={i}
                  className="rounded-md bg-orange-50 px-2 py-1 text-xs leading-relaxed dark:bg-orange-950/20"
                >
                  <span className="mr-1 text-orange-500">&bull;</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 要約 */}
        {feedback.overall_comment && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
              フィードバック
            </h4>
            <p className="text-xs leading-relaxed text-muted-foreground line-clamp-6">
              {feedback.overall_comment}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// 改善ポイントのハイライト比較
// ============================================================

function ImprovementHighlight({
  currentFeedback,
  compareFeedback,
}: {
  currentFeedback: Feedback;
  compareFeedback: Feedback;
}) {
  const prevImprove = parseStringArray(compareFeedback.improvement_points);
  const prevImproveFallback = parseStringArray(compareFeedback.improvements);
  const currentImprove = parseStringArray(currentFeedback.improvement_points);
  const currentImproveFallback = parseStringArray(currentFeedback.improvements);

  const prevPoints =
    prevImprove.length > 0 ? prevImprove : prevImproveFallback;
  const currentPoints =
    currentImprove.length > 0 ? currentImprove : currentImproveFallback;

  if (prevPoints.length === 0 && currentPoints.length === 0) return null;

  return (
    <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-blue-600">
          <TrendingUp className="h-5 w-5" />
          AI改善ポイント分析
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {prevPoints.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
              前回の改善ポイント
            </h4>
            <ul className="space-y-1">
              {prevPoints.map((point, i) => (
                <li
                  key={i}
                  className="rounded-md bg-white/60 px-3 py-2 text-sm dark:bg-gray-900/40"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}
        {currentPoints.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-blue-600">
              今回の改善ポイント
            </h4>
            <ul className="space-y-1">
              {currentPoints.map((point, i) => (
                <li
                  key={i}
                  className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-medium dark:border-blue-800 dark:bg-blue-950/30"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// ユーティリティ
// ============================================================

function parseStringArray(data: unknown): string[] {
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is string => typeof item === "string");
}

// ============================================================
// メインコンポーネント
// ============================================================

export function CompareContent({
  currentInterview,
  currentFeedback,
  compareInterview,
  compareFeedback,
  allInterviews,
  currentInterviewId,
}: CompareContentProps) {
  const router = useRouter();
  const [sameCompanyOnly, setSameCompanyOnly] = useState(false);

  // フィルタ: 同一企業のみ
  const filteredInterviews = useMemo(() => {
    if (!sameCompanyOnly) return allInterviews;
    return allInterviews.filter(
      (iv) =>
        iv.company_id &&
        iv.company_id === currentInterview.company_id
    );
  }, [allInterviews, sameCompanyOnly, currentInterview.company_id]);

  const handleCompareSelect = (interviewId: string) => {
    router.push(
      `/interview/${currentInterviewId}/compare?with=${interviewId}`
    );
  };

  const handleCompanyFilter = () => {
    setSameCompanyOnly((prev) => !prev);
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/interview/${currentInterviewId}/result`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            結果に戻る
          </Link>
        </Button>
        <h1 className="flex-1 text-xl font-bold sm:text-2xl">
          フィードバック比較
        </h1>
      </div>

      {/* 比較対象選択 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">
                比較対象の面接を選択
              </label>
              <Select
                value={compareInterview?.id ?? ""}
                onValueChange={handleCompareSelect}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="面接を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {filteredInterviews.length === 0 ? (
                    <SelectItem value="_empty" disabled>
                      比較可能な面接がありません
                    </SelectItem>
                  ) : (
                    filteredInterviews.map((iv) => (
                      <SelectItem key={iv.id} value={iv.id}>
                        {iv.company_name_snapshot} - {iv.title}
                        {iv.interview_date
                          ? ` (${formatDate(iv.interview_date)})`
                          : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* 同一企業フィルタ */}
            {currentInterview.company_id && (
              <Button
                variant={sameCompanyOnly ? "default" : "outline"}
                size="sm"
                onClick={handleCompanyFilter}
                className="shrink-0"
              >
                <Building2 className="mr-2 h-4 w-4" />
                <Filter className="mr-1 h-3 w-3" />
                同一企業のみ
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 比較対象未選択時 */}
      {!compareInterview && (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">
              比較対象を選択してください
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              上のドロップダウンから比較したい面接を選んでください
            </p>
          </CardContent>
        </Card>
      )}

      {/* 比較表示 */}
      {compareInterview && (
        <div className="space-y-6">
          {/* 総合スコア比較 */}
          {currentFeedback && compareFeedback && (
            <OverallScoreCompare
              currentScore={currentFeedback.overall_score}
              compareScore={compareFeedback.overall_score}
            />
          )}

          {/* カテゴリ別スコア比較 */}
          {currentFeedback && compareFeedback && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  カテゴリ別スコア比較
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryScoreCompare
                  currentScores={
                    currentFeedback.category_scores as CategoryScores
                  }
                  compareScores={
                    compareFeedback.category_scores as CategoryScores
                  }
                />
              </CardContent>
            </Card>
          )}

          {/* AI改善ポイントハイライト */}
          {currentFeedback && compareFeedback && (
            <ImprovementHighlight
              currentFeedback={currentFeedback}
              compareFeedback={compareFeedback}
            />
          )}

          {/* フィードバック左右比較 - モバイルでは上下 */}
          <div className="flex flex-col gap-4 lg:flex-row">
            <FeedbackSideCard
              label="比較対象"
              interview={compareInterview}
              feedback={compareFeedback}
            />
            <FeedbackSideCard
              label="今回"
              interview={currentInterview}
              feedback={currentFeedback}
            />
          </div>
        </div>
      )}

      {/* フッターナビ */}
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" asChild>
          <Link href={`/interview/${currentInterviewId}/result`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            結果に戻る
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">ダッシュボードに戻る</Link>
        </Button>
      </div>
    </div>
  );
}
