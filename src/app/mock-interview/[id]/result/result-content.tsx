"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  LayoutDashboard,
  History,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { MockInterviewMessage, Json } from "@/types/database";

// ============================================================
// 型定義
// ============================================================

interface MockInterviewSummary {
  id: string;
  company_name: string | null;
  industry: string | null;
  category: string;
  round: string;
  difficulty: string;
  total_questions: number;
  started_at: string;
  completed_at: string | null;
  status: string;
  feedback_id: string | null;
}

interface FeedbackSummary {
  id: string;
  overall_score: number;
  summary: string;
  good_points: Json;
  improvement_points: Json;
  overall_comment: string | null;
  category_scores: Json;
  filler_words: Json;
  raw_response: Json | null;
}

/** raw_response 内の question_evaluations */
interface QuestionEvaluation {
  question: string;
  answer: string;
  good_points: string[];
  improvement_points: string[];
  model_answer: string;
  score: number;
}

interface FillerWord {
  word: string;
  count: number;
}

interface FillerAnalysis {
  total_count: number;
  filler_rate: number;
  details: FillerWord[];
  assessment: string;
}

interface Props {
  mockInterview: MockInterviewSummary;
  messages: MockInterviewMessage[];
  feedback: FeedbackSummary | null;
}

// ============================================================
// ラベル
// ============================================================

const CATEGORY_LABELS: Record<string, string> = {
  general: "人物面接（総合）",
  behavioral: "行動面接",
  technical: "技術面接",
  case: "ケース面接",
};

const ROUND_LABELS: Record<string, string> = {
  first: "一次面接",
  second: "二次面接",
  third: "三次面接",
  final: "最終面接",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "やさしい",
  normal: "標準",
  hard: "厳しい",
};

const MOCK_CATEGORY_SCORE_LABELS: Record<string, string> = {
  logic: "論理性",
  specificity: "具体性",
  expression: "表現力",
  impression: "印象/態度",
};

// ============================================================
// JSON パーサー
// ============================================================

function parseStringArray(data: Json): string[] {
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is string => typeof item === "string");
}

function parseFillerAnalysis(data: Json): FillerAnalysis {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, Json | undefined>;
    return {
      total_count: typeof obj.total_count === "number" ? obj.total_count : 0,
      filler_rate: typeof obj.filler_rate === "number" ? obj.filler_rate : 0,
      details: Array.isArray(obj.details)
        ? obj.details
            .filter(
              (item): item is { [key: string]: Json | undefined } =>
                item !== null &&
                typeof item === "object" &&
                !Array.isArray(item)
            )
            .map((item) => ({
              word: typeof item.word === "string" ? item.word : "",
              count: typeof item.count === "number" ? item.count : 0,
            }))
        : [],
      assessment: typeof obj.assessment === "string" ? obj.assessment : "",
    };
  }
  return { total_count: 0, filler_rate: 0, details: [], assessment: "" };
}

function parseCategoryScores(
  data: Json
): Record<string, number> {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const result: Record<string, number> = {};
  const obj = data as Record<string, Json | undefined>;
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "number") {
      result[key] = value;
    }
  }
  return result;
}

function parseQuestionEvaluations(rawResponse: Json | null): QuestionEvaluation[] {
  if (!rawResponse || typeof rawResponse !== "object" || Array.isArray(rawResponse)) {
    return [];
  }
  const obj = rawResponse as Record<string, Json | undefined>;
  if (!Array.isArray(obj.question_evaluations)) return [];
  return obj.question_evaluations
    .filter(
      (item): item is { [key: string]: Json | undefined } =>
        item !== null && typeof item === "object" && !Array.isArray(item)
    )
    .map((item) => ({
      question: typeof item.question === "string" ? item.question : "",
      answer: typeof item.answer === "string" ? item.answer : "",
      good_points: Array.isArray(item.good_points)
        ? item.good_points.filter((p): p is string => typeof p === "string")
        : [],
      improvement_points: Array.isArray(item.improvement_points)
        ? item.improvement_points.filter(
            (p): p is string => typeof p === "string"
          )
        : [],
      model_answer:
        typeof item.model_answer === "string" ? item.model_answer : "",
      score: typeof item.score === "number" ? item.score : 0,
    }));
}

function parseOverallAdvice(rawResponse: Json | null): string {
  if (!rawResponse || typeof rawResponse !== "object" || Array.isArray(rawResponse)) {
    return "";
  }
  const obj = rawResponse as Record<string, Json | undefined>;
  return typeof obj.overall_advice === "string" ? obj.overall_advice : "";
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
    <div
      className={`flex flex-col items-center gap-3 rounded-xl p-8 ${bgColor}`}
    >
      <p className="text-sm font-medium text-muted-foreground">総合スコア</p>
      <span className={`text-7xl font-bold ${color}`}>{score}</span>
      <span className="text-sm text-muted-foreground">/ 100</span>
      <Progress value={score} className="w-48" />
    </div>
  );
}

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

// ============================================================
// 質問アコーディオンアイテム
// ============================================================

function QuestionAccordionItem({
  evaluation,
  index,
}: {
  evaluation: QuestionEvaluation;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  const scoreColor =
    evaluation.score >= 80
      ? "text-green-600 bg-green-50 dark:bg-green-950/30"
      : evaluation.score >= 60
        ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30"
        : "text-red-600 bg-red-50 dark:bg-red-950/30";

  // Esc キー対応
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <Card>
      <button
        type="button"
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`question-${index}-content`}
      >
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="shrink-0">
              Q{index + 1}
            </Badge>
            <span
              className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${scoreColor}`}
            >
              {evaluation.score}点
            </span>
          </div>
          <p className="text-sm font-medium truncate">{evaluation.question}</p>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div id={`question-${index}-content`} className="border-t px-6 pb-6 pt-4">
          {/* 質問テキスト */}
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              面接官の質問
            </p>
            <p className="text-sm bg-muted rounded-lg p-3">
              {evaluation.question}
            </p>
          </div>

          {/* あなたの回答 */}
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              あなたの回答
            </p>
            <p className="text-sm whitespace-pre-wrap bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
              {evaluation.answer}
            </p>
          </div>

          {/* 良かった点 */}
          {evaluation.good_points.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-green-600 mb-2">
                良かった点
              </p>
              <ul className="space-y-1">
                {evaluation.good_points.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 改善点 */}
          {evaluation.improvement_points.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-orange-600 mb-2">
                改善点
              </p>
              <ul className="space-y-1">
                {evaluation.improvement_points.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 模範回答 */}
          {evaluation.model_answer && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModelAnswer(!showModelAnswer)}
                className="mb-2"
              >
                {showModelAnswer ? (
                  <>
                    <EyeOff className="mr-1 h-4 w-4" />
                    模範回答を閉じる
                  </>
                ) : (
                  <>
                    <Eye className="mr-1 h-4 w-4" />
                    模範回答を見る
                  </>
                )}
              </Button>
              {showModelAnswer && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
                  <p className="text-xs font-medium text-blue-600 mb-2">
                    模範回答
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {evaluation.model_answer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ============================================================
// メインコンポーネント
// ============================================================

export function MockResultContent({
  mockInterview,
  messages,
  feedback,
}: Props) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // パース
  const goodPoints = feedback
    ? parseStringArray(feedback.good_points)
    : [];
  const improvementPoints = feedback
    ? parseStringArray(feedback.improvement_points)
    : [];
  const categoryScores = feedback
    ? parseCategoryScores(feedback.category_scores)
    : {};
  const fillerAnalysis = feedback
    ? parseFillerAnalysis(feedback.filler_words)
    : { total_count: 0, filler_rate: 0, details: [], assessment: "" };
  const questionEvaluations = feedback
    ? parseQuestionEvaluations(feedback.raw_response)
    : [];
  const overallAdvice = feedback
    ? (parseOverallAdvice(feedback.raw_response) || feedback.overall_comment || "")
    : "";

  // フィードバック生成
  const handleGenerateFeedback = useCallback(async () => {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/mock-interview/${mockInterview.id}/feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "フィードバック生成に失敗しました");
        setGenerating(false);
        return;
      }

      // リロードしてフィードバックを表示
      router.refresh();
    } catch {
      setError(
        "ネットワークエラーが発生しました。接続を確認してもう一度お試しください。"
      );
    } finally {
      setGenerating(false);
    }
  }, [mockInterview.id, router]);

  // カテゴリスコアのラベルマッピング
  // raw_response に元の category_scores があればそちらを使う
  const rawCategoryScores = feedback?.raw_response &&
    typeof feedback.raw_response === "object" &&
    !Array.isArray(feedback.raw_response) &&
    feedback.raw_response !== null
    ? parseCategoryScores(
        (feedback.raw_response as Record<string, Json | undefined>)
          .category_scores as Json
      )
    : categoryScores;

  // 表示するカテゴリスコア（模擬面接用ラベルを優先）
  const displayCategoryScores = Object.keys(rawCategoryScores).length > 0
    ? rawCategoryScores
    : categoryScores;

  // カテゴリスコアのラベル取得
  const getCategoryLabel = (key: string): string => {
    return (
      MOCK_CATEGORY_SCORE_LABELS[key] ||
      { communication: "コミュニケーション", content: "回答内容", manner: "マナー", logic: "論理性" }[key] ||
      key
    );
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/mock-interview/history">
              <ArrowLeft className="mr-2 h-4 w-4" />
              履歴に戻る
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-bold">
          {mockInterview.company_name
            ? `模擬面接結果: ${mockInterview.company_name}`
            : "模擬面接結果"}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {CATEGORY_LABELS[mockInterview.category] || mockInterview.category}
          </Badge>
          <Badge variant="outline">
            {ROUND_LABELS[mockInterview.round] || mockInterview.round}
          </Badge>
          <Badge variant="outline">
            {DIFFICULTY_LABELS[mockInterview.difficulty] ||
              mockInterview.difficulty}
          </Badge>
          <span className="text-xs text-muted-foreground">
            質問数: {mockInterview.total_questions}問
          </span>
          {mockInterview.completed_at && (
            <span className="text-xs text-muted-foreground">
              {new Date(mockInterview.completed_at).toLocaleDateString("ja-JP")}
            </span>
          )}
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* フィードバック未生成の場合 */}
      {!feedback && (
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center py-12">
            {generating ? (
              <>
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
                <p className="text-lg font-medium">
                  フィードバックを生成中...
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  AIが面接内容を分析しています。1-2分ほどお待ちください。
                </p>
              </>
            ) : (
              <>
                <Lightbulb className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium text-muted-foreground">
                  フィードバックはまだ生成されていません
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  ボタンを押してAIフィードバックを生成しましょう
                </p>
                <Button
                  className="mt-4"
                  onClick={handleGenerateFeedback}
                  disabled={generating || mockInterview.status !== "completed"}
                >
                  フィードバックを生成する
                </Button>
                {mockInterview.status !== "completed" && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    面接が完了するとフィードバックを生成できます
                  </p>
                )}
              </>
            )}
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
              {Object.keys(displayCategoryScores).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  カテゴリ別スコアはありません
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(displayCategoryScores).map(([key, value]) => (
                    <CategoryScoreBar
                      key={key}
                      label={getCategoryLabel(key)}
                      score={value}
                    />
                  ))}
                </div>
              )}
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
              {goodPoints.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  データがありません
                </p>
              ) : (
                <ul className="space-y-3">
                  {goodPoints.map((point, i) => (
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
              {improvementPoints.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  データがありません
                </p>
              ) : (
                <ul className="space-y-3">
                  {improvementPoints.map((point, i) => (
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

      {/* 質問ごとの個別評価（アコーディオン） */}
      {feedback && questionEvaluations.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold">質問ごとの評価</h2>
          <div className="space-y-3">
            {questionEvaluations.map((evaluation, index) => (
              <QuestionAccordionItem
                key={index}
                evaluation={evaluation}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* フィラー分析 */}
      {feedback && (
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold">フィラー分析</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col items-center py-6">
                <p className="text-sm font-medium text-muted-foreground">
                  総フィラー数
                </p>
                <span className="mt-1 text-4xl font-bold">
                  {fillerAnalysis.total_count}
                </span>
                <span className="text-xs text-muted-foreground">回</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center py-6">
                <p className="text-sm font-medium text-muted-foreground">
                  フィラー率
                </p>
                <span
                  className={`mt-1 text-4xl font-bold ${
                    fillerAnalysis.filler_rate <= 2
                      ? "text-green-600"
                      : fillerAnalysis.filler_rate <= 5
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {fillerAnalysis.filler_rate}
                </span>
                <span className="text-xs text-muted-foreground">%</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center py-6">
                <p className="text-sm font-medium text-muted-foreground">
                  種類数
                </p>
                <span className="mt-1 text-4xl font-bold">
                  {fillerAnalysis.details.length}
                </span>
                <span className="text-xs text-muted-foreground">種類</span>
              </CardContent>
            </Card>
          </div>

          {fillerAnalysis.assessment && (
            <Card className="mt-4 border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <p className="text-sm leading-relaxed">
                    {fillerAnalysis.assessment}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {fillerAnalysis.details.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">
                  フィラー表現の内訳
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...fillerAnalysis.details]
                    .sort((a, b) => b.count - a.count)
                    .map((fw, i) => {
                      const maxCount = Math.max(
                        ...fillerAnalysis.details.map((d) => d.count)
                      );
                      const barWidth =
                        maxCount > 0
                          ? Math.max((fw.count / maxCount) * 100, 4)
                          : 0;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-16 shrink-0 text-right text-sm font-medium">
                            {fw.word}
                          </span>
                          <div className="relative h-7 flex-1 overflow-hidden rounded bg-muted">
                            <div
                              className="absolute inset-y-0 left-0 rounded bg-orange-400 transition-all dark:bg-orange-500"
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
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 全体的なアドバイス */}
      {feedback && overallAdvice && (
        <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Lightbulb className="h-5 w-5" />
              全体的な改善提案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed whitespace-pre-wrap text-sm">
              {overallAdvice}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 要約 */}
      {feedback && feedback.summary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">面接の要約</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {feedback.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* アクションボタン */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/mock-interview">
            <RotateCcw className="mr-2 h-4 w-4" />
            もう一度練習する
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/mock-interview/history">
            <History className="mr-2 h-4 w-4" />
            履歴を見る
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            ダッシュボードに戻る
          </Link>
        </Button>
      </div>
    </div>
  );
}
