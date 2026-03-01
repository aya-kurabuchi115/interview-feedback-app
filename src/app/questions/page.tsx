import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { questions } from "@/lib/questions/data";
import { QuestionFilter } from "./question-filter";

export const metadata: Metadata = {
  title: "面接質問集",
  description:
    "面接でよく聞かれる質問90問を業界別・ラウンド別・タイプ別に整理。回答のポイントと模範解答付きで面接対策に最適です。",
  openGraph: {
    title: "面接質問集 | InterviewCoach",
    description:
      "面接でよく聞かれる質問90問を業界別・ラウンド別・タイプ別に整理。回答のポイントと模範解答付きで面接対策に最適です。",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: questions.slice(0, 10).map((q) => ({
    "@type": "Question",
    name: q.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: q.exampleAnswer,
    },
  })),
};

export default function QuestionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ヘッダー */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <BookOpen className="size-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            面接質問集
          </h1>
        </div>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          面接でよく聞かれる質問を業界別・ラウンド別・タイプ別に整理しました。
          <br className="hidden sm:block" />
          回答のポイントと模範解答を参考に、面接対策を進めましょう。
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          全 {questions.length} 問 収録
        </p>
      </div>

      {/* フィルタ付き質問一覧 */}
      <QuestionFilter questions={questions} />
    </div>
  );
}
