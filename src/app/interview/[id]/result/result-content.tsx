"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Database } from "@/types/supabase";
import type { Json } from "@/types/supabase";
import type { CategoryScores, SubscriptionPlan } from "@/types/database";
import { CATEGORY_LABELS } from "@/lib/constants";
import { parseAnnotations } from "@/components/annotated-transcript";
import { ProUpsellCard } from "@/components/pro-upsell-card";

// 動的インポート: 初期表示に不要なインタラクティブコンポーネントを遅延ロード
const AnnotatedTranscript = dynamic(
  () =>
    import("@/components/annotated-transcript").then(
      (mod) => mod.AnnotatedTranscript
    ),
  {
    loading: () => (
      <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />
    ),
    ssr: false,
  }
);

const ExportButtons = dynamic(
  () => import("@/components/export-buttons").then((mod) => mod.ExportButtons),
  {
    loading: () => (
      <div className="h-9 w-[140px] animate-pulse rounded-md bg-muted" />
    ),
    ssr: false,
  }
);

const TagSelector = dynamic(
  () => import("@/components/tag-selector").then((mod) => mod.TagSelector),
  {
    loading: () => (
      <div className="space-y-2">
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="h-8 w-full animate-pulse rounded bg-muted" />
      </div>
    ),
    ssr: false,
  }
);

const NotesEditor = dynamic(
  () => import("@/components/notes-editor").then((mod) => mod.NotesEditor),
  {
    loading: () => (
      <div className="space-y-2">
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="h-24 w-full animate-pulse rounded bg-muted" />
      </div>
    ),
    ssr: false,
  }
);

type Interview = Database["public"]["Tables"]["interviews"]["Row"];
type Transcript = Database["public"]["Tables"]["transcripts"]["Row"];
type Feedback = Database["public"]["Tables"]["feedbacks"]["Row"];

interface TagData {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

interface Suggestion {
  original: string;
  improved: string;
  reason: string;
}

interface FillerWord {
  word: string;
  count: number;
}

/** 拡張フィラー分析構造 */
interface FillerAnalysis {
  total_count: number;
  filler_rate: number;
  details: FillerWord[];
  assessment: string;
}

/**
 * filler_words カラムのデータをパースする。
 * 新形式（オブジェクト）と旧形式（配列）の両方に対応。
 */
function parseFillerAnalysis(data: Json): FillerAnalysis {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, Json | undefined>;
    return {
      total_count: typeof obj.total_count === "number" ? obj.total_count : 0,
      filler_rate: typeof obj.filler_rate === "number" ? obj.filler_rate : 0,
      details: Array.isArray(obj.details)
        ? obj.details
            .filter((item): item is { [key: string]: Json | undefined } =>
              item !== null && typeof item === "object" && !Array.isArray(item)
            )
            .map((item) => ({
              word: typeof item.word === "string" ? item.word : "",
              count: typeof item.count === "number" ? item.count : 0,
            }))
        : [],
      assessment: typeof obj.assessment === "string" ? obj.assessment : "",
    };
  }
  // 旧形式（配列）の場合: details として扱い、total_count を算出
  if (Array.isArray(data)) {
    const details: FillerWord[] = data
      .filter((item): item is { [key: string]: Json | undefined } =>
        item !== null && typeof item === "object" && !Array.isArray(item)
      )
      .map((item) => ({
        word: typeof item.word === "string" ? item.word : "",
        count: typeof item.count === "number" ? item.count : 0,
      }));
    let totalCount = 0;
    for (const d of details) {
      totalCount += d.count;
    }
    return {
      total_count: totalCount,
      filler_rate: 0,
      details,
      assessment: "",
    };
  }
  return { total_count: 0, filler_rate: 0, details: [], assessment: "" };
}

function parseJsonArray<T>(data: Json): T[] {
  if (!Array.isArray(data)) return [];
  // null/undefined を除外してキャスト
  return data.filter((item) => item != null) as T[];
}

/** string 配列専用のパーサー。各要素が string であることを保証する */
function parseStringArray(data: Json): string[] {
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is string => typeof item === "string");
}

// ============================================================
// スコア表示コンポーネント
// ============================================================

function ScoreDisplay({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green-600"
      : score >= 60
        ? "text-yellow-600"
        : "text-red-600";

  const bgColor =
    score >= 80
      ? "bg-green-50 dark:bg-green-950/30"
      : score >= 60
        ? "bg-yellow-50 dark:bg-yellow-950/30"
        : "bg-red-50 dark:bg-red-950/30";

  return (
    <div className={`flex flex-col items-center gap-3 rounded-xl p-8 ${bgColor}`}>
      <p className="text-sm font-medium text-muted-foreground">総合スコア</p>
      <span className={`text-7xl font-bold ${color}`}>{score}</span>
      <span className="text-sm text-muted-foreground">/ 100</span>
      <Progress value={score} className="w-48" />
    </div>
  );
}

// ============================================================
// カテゴリ別スコア表示
// ============================================================

function CategoryScoreBar({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  const color =
    score >= 80
      ? "bg-green-500"
      : score >= 60
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{score}点</span>
      </div>
      <div className="h-3 w-full rounded-full bg-muted">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function CategoryScoresDisplay({
  scores,
}: {
  scores: CategoryScores | null;
}) {
  if (!scores || Object.keys(scores).length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        カテゴリ別スコアはありません
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(scores).map(([key, value]) => {
        if (typeof value !== "number") return null;
        const label = CATEGORY_LABELS[key] || key;
        return <CategoryScoreBar key={key} label={label} score={value} />;
      })}
    </div>
  );
}

// ============================================================
// メインコンポーネント
// ============================================================

export function ResultContent({
  interview,
  transcripts,
  feedback,
  interviewTags = [],
  hasOtherInterviews = false,
  rawTranscript = null,
  currentPlan = "free",
}: {
  interview: Interview;
  transcripts: Transcript[];
  feedback: Feedback | null;
  interviewTags?: TagData[];
  hasOtherInterviews?: boolean;
  rawTranscript?: string | null;
  currentPlan?: SubscriptionPlan;
}) {
  const suggestions = feedback
    ? parseJsonArray<Suggestion>(feedback.suggestions)
    : [];
  const fillerAnalysis = feedback
    ? parseFillerAnalysis(feedback.filler_words)
    : { total_count: 0, filler_rate: 0, details: [], assessment: "" };
  const goodPoints = feedback
    ? parseStringArray(feedback.good_points)
    : [];
  const improvementPoints = feedback
    ? parseStringArray(feedback.improvement_points)
    : [];
  const strengths = feedback
    ? parseStringArray(feedback.strengths)
    : [];
  const improvements = feedback
    ? parseStringArray(feedback.improvements)
    : [];

  // annotations をパース
  const annotations = feedback
    ? parseAnnotations(feedback.annotations)
    : [];

  // good_points が空の場合は strengths にフォールバック
  const displayGoodPoints = goodPoints.length > 0 ? goodPoints : strengths;
  // improvement_points が空の場合は improvements にフォールバック
  const displayImprovementPoints =
    improvementPoints.length > 0 ? improvementPoints : improvements;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ダッシュボードに戻る
          </Link>
        </Button>
        <h1 className="flex-1 text-2xl font-bold">{interview.title}</h1>
        {feedback && (
          <ExportButtons interviewId={interview.id} variant="inline" />
        )}
        {feedback && hasOtherInterviews && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/interview/${interview.id}/compare`}>
              <GitCompareArrows className="mr-2 h-4 w-4" />
              前回と比較
            </Link>
          </Button>
        )}
      </div>

      {/* フィードバック未生成の場合 */}
      {!feedback && (
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center py-12">
            <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              フィードバックはまだ生成されていません
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              処理が完了するまでお待ちください
            </p>
            <Button className="mt-4" asChild>
              <Link href={`/interview/${interview.id}/processing`}>
                処理状況を確認する
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* タグ・メモセクション */}
      <Card className="mb-6">
        <CardContent className="space-y-6 pt-6">
          <TagSelector interviewId={interview.id} initialTags={interviewTags} />
          <div className="border-t pt-4">
            <NotesEditor interviewId={interview.id} initialNotes={(interview as Interview & { notes?: string | null }).notes ?? null} />
          </div>
        </CardContent>
      </Card>

      {/* スコア & カテゴリ別スコア */}
      {feedback && (
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="flex flex-col items-center py-6">
              <ScoreDisplay score={feedback.overall_score} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">カテゴリ別スコア</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryScoresDisplay
                scores={feedback.category_scores as CategoryScores}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* 良い点 & 改善点 */}
      {feedback && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                良い点
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayGoodPoints.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  データがありません
                </p>
              ) : (
                <ul className="space-y-3">
                  {displayGoodPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                改善点
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayImprovementPoints.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  データがありません
                </p>
              ) : (
                <ul className="space-y-3">
                  {displayImprovementPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 詳細フィードバック & アドバイス */}
      {feedback && feedback.overall_comment && (
        <div className="mb-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">詳細フィードバック</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed whitespace-pre-wrap">
                {feedback.overall_comment}
              </p>
            </CardContent>
          </Card>

          {/* アドバイスセクション - raw_response から取得 */}
          {feedback.raw_response &&
            typeof feedback.raw_response === "object" &&
            !Array.isArray(feedback.raw_response) &&
            feedback.raw_response !== null &&
            "advice" in feedback.raw_response &&
            typeof (feedback.raw_response as Record<string, unknown>).advice ===
              "string" && (
              <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Lightbulb className="h-5 w-5" />
                    次回へのアドバイス
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {
                      (feedback.raw_response as Record<string, unknown>)
                        .advice as string
                    }
                  </p>
                </CardContent>
              </Card>
            )}
        </div>
      )}

      {/* 原文スクリプト（ハイライト付き） */}
      {rawTranscript && (
        <div className="mb-6">
          <AnnotatedTranscript
            transcript={rawTranscript}
            annotations={annotations}
          />
        </div>
      )}

      {/* タブ: 要約・文字起こし・改善提案・フィラー */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">要約</TabsTrigger>
          <TabsTrigger value="transcript">文字起こし</TabsTrigger>
          <TabsTrigger value="suggestions">改善提案</TabsTrigger>
          <TabsTrigger value="filler">フィラー</TabsTrigger>
        </TabsList>

        {/* 要約 */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>面接の要約</CardTitle>
            </CardHeader>
            <CardContent>
              {feedback ? (
                <p className="leading-relaxed whitespace-pre-wrap">
                  {feedback.summary}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  フィードバックはまだ生成されていません
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 文字起こし */}
        <TabsContent value="transcript">
          <Card>
            <CardHeader>
              <CardTitle>文字起こし</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transcripts.length === 0 ? (
                <p className="text-muted-foreground">
                  文字起こしデータがありません
                </p>
              ) : (
                transcripts.map((t) => (
                  <div
                    key={t.id}
                    className={`rounded-lg p-3 ${
                      t.speaker === "interviewer"
                        ? "bg-muted"
                        : "bg-blue-50 dark:bg-blue-950/30"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Badge
                        variant={
                          t.speaker === "interviewer"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {t.speaker === "interviewer"
                          ? "面接官"
                          : "候補者"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(t.start_time / 60)}:
                        {String(Math.floor(t.start_time % 60)).padStart(
                          2,
                          "0"
                        )}
                      </span>
                    </div>
                    <p className="text-sm">{t.content}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 改善提案 */}
        <TabsContent value="suggestions">
          <div className="space-y-4">
            {suggestions.length === 0 ? (
              <Card>
                <CardContent className="py-6">
                  <p className="text-muted-foreground">改善提案はありません</p>
                </CardContent>
              </Card>
            ) : (
              suggestions.map((s, i) => (
                <Card key={i}>
                  <CardContent className="space-y-3 pt-6">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        元の回答
                      </p>
                      <p className="mt-1 text-sm">{s.original}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-600">
                        改善案
                      </p>
                      <p className="mt-1 text-sm">{s.improved}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-600">理由</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {s.reason}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* フィラーワード分析 */}
        <TabsContent value="filler">
          <div className="space-y-4">
            {/* サマリーカード */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex flex-col items-center py-6">
                  <p className="text-sm font-medium text-muted-foreground">総フィラー数</p>
                  <span className="mt-1 text-4xl font-bold">{fillerAnalysis.total_count}</span>
                  <span className="text-xs text-muted-foreground">回</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center py-6">
                  <p className="text-sm font-medium text-muted-foreground">フィラー率</p>
                  <span className={`mt-1 text-4xl font-bold ${
                    fillerAnalysis.filler_rate <= 2
                      ? "text-green-600"
                      : fillerAnalysis.filler_rate <= 5
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}>
                    {fillerAnalysis.filler_rate}
                  </span>
                  <span className="text-xs text-muted-foreground">%</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center py-6">
                  <p className="text-sm font-medium text-muted-foreground">種類数</p>
                  <span className="mt-1 text-4xl font-bold">{fillerAnalysis.details.length}</span>
                  <span className="text-xs text-muted-foreground">種類</span>
                </CardContent>
              </Card>
            </div>

            {/* 評価コメント */}
            {fillerAnalysis.assessment && (
              <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
                <CardContent className="py-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    <p className="text-sm leading-relaxed">{fillerAnalysis.assessment}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* フィラー種類別の出現回数（横棒グラフ） */}
            <Card>
              <CardHeader>
                <CardTitle>フィラー表現の内訳</CardTitle>
              </CardHeader>
              <CardContent>
                {fillerAnalysis.details.length === 0 ? (
                  <p className="text-muted-foreground">
                    フィラー表現は検出されませんでした
                  </p>
                ) : (
                  <div className="space-y-3">
                    {[...fillerAnalysis.details]
                      .sort((a, b) => b.count - a.count)
                      .map((fw, i) => {
                        const maxCount = Math.max(
                          ...fillerAnalysis.details.map((d) => d.count)
                        );
                        const barWidth = maxCount > 0
                          ? Math.max((fw.count / maxCount) * 100, 4)
                          : 0;
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className="w-16 shrink-0 text-sm font-medium text-right">
                              {fw.word}
                            </span>
                            <div className="relative flex-1 h-7 rounded bg-muted overflow-hidden">
                              <div
                                className="absolute inset-y-0 left-0 rounded bg-orange-400 dark:bg-orange-500 transition-all"
                                style={{ width: `${barWidth}%` }}
                              />
                              <span className="relative z-10 flex h-full items-center px-2 text-xs font-medium">
                                {fw.count}回
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Pro プランアップセルカード（Free プランのみ） */}
      {feedback && <ProUpsellCard plan={currentPlan} />}

      {/* ダッシュボードへのリンク */}
      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ダッシュボードに戻る
          </Link>
        </Button>
      </div>
    </div>
  );
}
