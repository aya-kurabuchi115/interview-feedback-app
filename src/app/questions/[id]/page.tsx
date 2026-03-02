import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Lightbulb,
  Mic,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { questions, getQuestionById } from "@/lib/questions/data";
import { DIFFICULTY_LABELS } from "@/lib/questions/types";
import type { Difficulty } from "@/lib/questions/types";
import { ExampleAnswer } from "@/components/questions/example-answer";
import { FrameworkGuide } from "@/components/questions/framework-guide";
import { AnswerComparison } from "@/components/questions/answer-comparison";

/** ISR: 24時間ごとに再検証（静的コンテンツ） */
export const revalidate = 86400;

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "bg-green-100 text-green-800",
  normal: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return questions.map((q) => ({ id: q.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const question = getQuestionById(id);
  if (!question) {
    return { title: "質問が見つかりません" };
  }

  return {
    title: `${question.question} - 面接質問集`,
    description: `「${question.question}」の回答のポイントと模範解答。${question.type}カテゴリの面接対策。`,
    keywords: question.keywords,
    openGraph: {
      title: `${question.question} | InterviewCoach 面接質問集`,
      description: `「${question.question}」の回答のポイントと模範解答。面接対策に役立つ具体的なアドバイス付き。`,
    },
  };
}

export default async function QuestionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const question = getQuestionById(id);

  if (!question) {
    notFound();
  }

  // 同じタイプの関連質問（最大3件）
  const relatedQuestions = questions
    .filter((q) => q.type === question.type && q.id !== question.id)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: question.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: question.exampleAnswer,
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* パンくず */}
      <nav className="mb-6">
        <Link
          href="/questions"
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          面接質問集に戻る
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* メインコンテンツ */}
        <div className="space-y-6 lg:col-span-2">
          {/* 質問 */}
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{question.type}</Badge>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[question.difficulty]}`}
              >
                {DIFFICULTY_LABELS[question.difficulty]}
              </span>
              {question.round.map((r) => (
                <span
                  key={r}
                  className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {r}面接
                </span>
              ))}
            </div>
            <h1 className="text-2xl font-bold leading-relaxed sm:text-3xl">
              {question.question}
            </h1>
          </div>

          {/* 回答のポイント */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="size-5 text-yellow-500" />
                回答のポイント
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {question.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span className="text-sm leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 模範解答（アコーディオン） */}
          <ExampleAnswer exampleAnswer={question.exampleAnswer} />

          {/* 回答フレームワークガイド */}
          <FrameworkGuide />

          {/* 自分の回答入力 */}
          <AnswerComparison questionId={question.id} />

          {/* この質問で練習する */}
          <Card className="border-primary">
            <CardContent className="flex flex-col items-center gap-4 py-8 sm:flex-row sm:justify-between">
              <div>
                <h3 className="font-semibold">この質問で模擬面接を練習する</h3>
                <p className="text-sm text-muted-foreground">
                  AIと一緒に面接練習をして、フィードバックを受けましょう
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/mock-interview">
                  <Mic className="mr-2 size-4" />
                  模擬面接を始める
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* 対象業界 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="size-4" />
                対象業界
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {question.industry.map((ind) => (
                  <Link
                    key={ind}
                    href={`/questions?industry=${encodeURIComponent(ind)}`}
                  >
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      {ind}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 関連質問 */}
          {relatedQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">関連する質問</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {relatedQuestions.map((rq) => (
                    <li key={rq.id}>
                      <Link
                        href={`/questions/${rq.id}`}
                        className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {rq.question}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* カテゴリ別リンク */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">カテゴリから探す</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["自己PR", "志望動機", "ガクチカ", "逆質問", "長所短所", "キャリア", "業界理解", "その他"].map(
                  (type) => (
                    <Link
                      key={type}
                      href={`/questions?type=${encodeURIComponent(type)}`}
                    >
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      >
                        {type}
                      </Badge>
                    </Link>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
