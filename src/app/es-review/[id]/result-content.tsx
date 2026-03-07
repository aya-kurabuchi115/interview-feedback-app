"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ESFeedback } from "@/types/es-review";

interface ReviewData {
  id: string;
  question: string;
  answer: string;
  char_count: number;
  feedback: ESFeedback;
  score: number | null;
  created_at: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "素晴らしい";
  if (score >= 80) return "良い";
  if (score >= 70) return "まずまず";
  if (score >= 60) return "改善余地あり";
  if (score >= 40) return "要改善";
  return "大幅な改善が必要";
}

function getProgressColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

const CATEGORY_LABELS: Record<string, string> = {
  structure: "構成",
  specificity: "具体性",
  persuasiveness: "説得力",
  grammar: "文法",
};

export function ESReviewResultContent({ review }: { review: ReviewData }) {
  const { feedback } = review;
  const score = feedback.overall_score;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/es-review/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            履歴に戻る
          </Link>
        </Button>
      </div>

      {/* 総合スコア */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
            <div className="flex flex-col items-center">
              <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
                {score}
              </span>
              <span className="text-sm text-muted-foreground">/ 100点</span>
            </div>
            <div className="flex-1">
              <Badge
                variant="secondary"
                className={`mb-2 ${getScoreColor(score)}`}
              >
                {getScoreLabel(score)}
              </Badge>
              <p className="text-sm text-muted-foreground">
                設問: {review.question}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                文字数: {review.char_count}文字 / 添削日:{" "}
                {new Date(review.created_at).toLocaleDateString("ja-JP")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* カテゴリ別スコア */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">カテゴリ別評価</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.entries(feedback.categories) as [string, { score: number; comment: string }][]).map(
            ([key, cat]) => (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {CATEGORY_LABELS[key] || key}
                  </span>
                  <span className={`text-sm font-bold ${getScoreColor(cat.score)}`}>
                    {cat.score}点
                  </span>
                </div>
                <div className="relative">
                  <Progress value={cat.score} className="h-2" />
                  <div
                    className={`absolute inset-0 h-2 rounded-full ${getProgressColor(cat.score)}`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{cat.comment}</p>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* 良い点 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            良い点
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {feedback.good_points.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="mt-0.5 flex-shrink-0 text-green-600">+</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 改善点 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            改善点
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {feedback.improvement_points.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="mt-0.5 flex-shrink-0 text-amber-600">!</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Before/After 改善提案 */}
      {feedback.suggestions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              改善提案（Before / After）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedback.suggestions.map((suggestion, i) => (
              <div key={i} className="rounded-md border p-4">
                <div className="mb-3 space-y-2">
                  <div>
                    <span className="mb-1 inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Before
                    </span>
                    <p className="mt-1 text-sm text-muted-foreground line-through">
                      {suggestion.original}
                    </p>
                  </div>
                  <div>
                    <span className="mb-1 inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      After
                    </span>
                    <p className="mt-1 text-sm">{suggestion.improved}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  理由: {suggestion.reason}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI書き直し例 */}
      {feedback.rewritten_answer && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              AIによる書き直し例
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-muted/50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {feedback.rewritten_answer}
              </p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              ※ この書き直し例はあくまで参考です。自分の言葉で書き直すことが重要です。
            </p>
          </CardContent>
        </Card>
      )}

      {/* パーソナリティアドバイス */}
      {feedback.personality_advice && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              パーソナリティタイプ別アドバイス
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
              {feedback.personality_advice}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 面接履歴を踏まえたアドバイス */}
      {feedback.interview_based_advice && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-[var(--brand-orange)]" />
              面接履歴を踏まえたアドバイス
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
              {feedback.interview_based_advice}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 元の回答 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">あなたの回答</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            設問: {review.question}
          </p>
          <div className="rounded-md bg-muted/30 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {review.answer}
            </p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            文字数: {review.char_count}文字
          </p>
        </CardContent>
      </Card>

      {/* アクション */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="flex-1">
          <Link href="/es-review">新しいESを添削する</Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/es-review/history">添削履歴を見る</Link>
        </Button>
      </div>
    </div>
  );
}
