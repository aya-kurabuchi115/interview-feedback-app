"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

function ScoreDisplay({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green-600"
      : score >= 60
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="flex flex-col items-center gap-2">
      <span className={`text-6xl font-bold ${color}`}>{score}</span>
      <span className="text-sm text-muted-foreground">/ 100</span>
      <Progress value={score} className="w-48" />
    </div>
  );
}

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
  const strengths = feedback
    ? parseJsonArray<string>(feedback.strengths)
    : [];
  const improvements = feedback
    ? parseJsonArray<string>(feedback.improvements)
    : [];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{interview.title}</h1>
      </div>

      {/* スコア */}
      {feedback && (
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center py-8">
            <ScoreDisplay score={feedback.overall_score} />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">要約</TabsTrigger>
          <TabsTrigger value="transcript">文字起こし</TabsTrigger>
          <TabsTrigger value="suggestions">改善提案</TabsTrigger>
          <TabsTrigger value="filler">フィラー</TabsTrigger>
          <TabsTrigger value="points">評価</TabsTrigger>
        </TabsList>

        {/* 要約 */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>面接の要約</CardTitle>
            </CardHeader>
            <CardContent>
              {feedback ? (
                <p className="leading-relaxed">{feedback.summary}</p>
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

        {/* 強み・改善点 */}
        <TabsContent value="points">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">強み</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 text-green-600">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">改善点</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 text-orange-600">-</span>
                      {imp}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
