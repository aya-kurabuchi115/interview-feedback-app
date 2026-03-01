"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, ChevronRight, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Question, Industry, Round, QuestionType, Difficulty } from "@/lib/questions/types";
import {
  INDUSTRIES,
  ROUNDS,
  QUESTION_TYPES,
  DIFFICULTY_LABELS,
} from "@/lib/questions/types";

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "bg-green-100 text-green-800",
  normal: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

interface QuestionFilterProps {
  questions: Question[];
}

export function QuestionFilter({ questions }: QuestionFilterProps) {
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | "">("");
  const [selectedRound, setSelectedRound] = useState<Round | "">("");
  const [selectedType, setSelectedType] = useState<QuestionType | "">("");

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (selectedIndustry && !q.industry.includes(selectedIndustry)) return false;
      if (selectedRound && !q.round.includes(selectedRound)) return false;
      if (selectedType && q.type !== selectedType) return false;
      if (search && !q.question.includes(search)) return false;
      return true;
    });
  }, [questions, search, selectedIndustry, selectedRound, selectedType]);

  const hasFilters = search || selectedIndustry || selectedRound || selectedType;

  const clearFilters = () => {
    setSearch("");
    setSelectedIndustry("");
    setSelectedRound("");
    setSelectedType("");
  };

  return (
    <div className="space-y-6">
      {/* 検索・フィルタ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="size-5" />
            絞り込み検索
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* テキスト検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="質問を検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 業界フィルタ */}
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">業界</p>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((industry) => (
                <button
                  key={industry}
                  onClick={() =>
                    setSelectedIndustry(selectedIndustry === industry ? "" : industry)
                  }
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    selectedIndustry === industry
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          {/* ラウンドフィルタ */}
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">面接ラウンド</p>
            <div className="flex flex-wrap gap-2">
              {ROUNDS.map((round) => (
                <button
                  key={round}
                  onClick={() =>
                    setSelectedRound(selectedRound === round ? "" : round)
                  }
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    selectedRound === round
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {round}
                </button>
              ))}
            </div>
          </div>

          {/* タイプフィルタ */}
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">質問タイプ</p>
            <div className="flex flex-wrap gap-2">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setSelectedType(selectedType === type ? "" : type)
                  }
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    selectedType === type
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              フィルタをクリア
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 結果件数 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} 件の質問が見つかりました
        </p>
      </div>

      {/* 質問一覧 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((q) => (
          <Link key={q.id} href={`/questions/${q.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex h-full flex-col pt-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {q.type}
                  </Badge>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[q.difficulty]}`}
                  >
                    {DIFFICULTY_LABELS[q.difficulty]}
                  </span>
                </div>
                <h3 className="mb-3 flex-1 text-sm font-medium leading-relaxed">
                  {q.question}
                </h3>
                <div className="mt-auto flex flex-wrap gap-1">
                  {q.round.map((r) => (
                    <span
                      key={r}
                      className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {r}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <BookOpen className="size-3" />
                    回答ポイント {q.tips.length} 件
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            条件に一致する質問が見つかりませんでした
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            フィルタ条件を変更してお試しください
          </p>
        </div>
      )}
    </div>
  );
}
