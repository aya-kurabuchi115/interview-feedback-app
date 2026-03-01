"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReviewItem {
  id: string;
  question: string;
  answer: string;
  char_count: number;
  score: number | null;
  status: string;
  created_at: string;
}

function getScoreBadgeVariant(score: number | null): "default" | "secondary" | "destructive" | "outline" {
  if (score === null) return "secondary";
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  return "destructive";
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "completed":
      return "完了";
    case "analyzing":
      return "添削中";
    case "error":
      return "エラー";
    default:
      return "処理中";
  }
}

export function ESReviewHistoryContent({
  reviews,
}: {
  reviews: ReviewItem[];
}) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/es-review">
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">ES添削履歴</h1>
        </div>
        <Button size="sm" asChild>
          <Link href="/es-review">
            <Plus className="mr-2 h-4 w-4" />
            新規添削
          </Link>
        </Button>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-medium">添削履歴がありません</p>
              <p className="mt-1 text-sm text-muted-foreground">
                ES添削を始めて、回答を改善しましょう
              </p>
            </div>
            <Button asChild>
              <Link href="/es-review">ES添削を始める</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Link key={review.id} href={`/es-review/${review.id}`}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">
                        {review.question}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {review.answer.substring(0, 80)}
                        {review.answer.length > 80 ? "..." : ""}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{review.char_count}文字</span>
                        <span>|</span>
                        <span>
                          {new Date(review.created_at).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {review.status === "completed" && review.score !== null ? (
                        <Badge variant={getScoreBadgeVariant(review.score)}>
                          {review.score}点
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {getStatusLabel(review.status)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
