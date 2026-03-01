"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
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
import type { CategoryScores } from "@/types/database";

type Interview = Database["public"]["Tables"]["interviews"]["Row"];
type Transcript = Database["public"]["Tables"]["transcripts"]["Row"];
type Feedback = Database["public"]["Tables"]["feedbacks"]["Row"];

interface Suggestion {
  original: string;
  improved: string;
  reason: string;
}

interface FillerWord {
  word: string;
  count: number;
}

function parseJsonArray<T>(data: Json): T[] {
  if (Array.isArray(data)) return data as T[];
  return [];
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

const CATEGORY_LABELS: Record<string, string> = {
  communication: "コミュニケーション",
  content: "回答内容",
  manner: "マナー",
  logic: "論理性",
  specificity: "具体性",
  enthusiasm: "熱意",
  manners: "マナー",
  question_handling: "質問対応",
};

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
}: {
  interview: Interview;
  transcripts: Transcript[];
  feedback: Feedback | null;
}) {
  const suggestions = feedback
    ? parseJsonArray<Suggestion>(feedback.suggestions)
    : [];
  const fillerWords = feedback
    ? parseJsonArray<FillerWord>(feedback.filler_words)
    : [];
  const goodPoints = feedback
    ? parseJsonArray<string>(feedback.good_points)
    : [];
  const improvementPoints = feedback
    ? parseJsonArray<string>(feedback.improvement_points)
    : [];
  const strengths = feedback
    ? parseJsonArray<string>(feedback.strengths)
    : [];
  const improvements = feedback
    ? parseJsonArray<string>(feedback.improvements)
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
        <h1 className="text-2xl font-bold">{interview.title}</h1>
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

        {/* フィラーワード */}
        <TabsContent value="filler">
          <Card>
            <CardHeader>
              <CardTitle>フィラーワード検出</CardTitle>
            </CardHeader>
            <CardContent>
              {fillerWords.length === 0 ? (
                <p className="text-muted-foreground">
                  フィラーワードは検出されませんでした
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {fillerWords.map((fw, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border px-4 py-2"
                    >
                      <span className="font-medium">{fw.word}</span>
                      <Badge variant="destructive">{fw.count}回</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
