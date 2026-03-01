import Link from "next/link";
import { Calendar, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type {
  InterviewCategory,
  InterviewRound,
  InterviewStatus,
} from "@/types/database";

// ============================================================
// カテゴリ表示設定
// ============================================================

const CATEGORY_CONFIG: Record<
  InterviewCategory,
  { label: string; className: string }
> = {
  arubaito: {
    label: "アルバイト",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  intern: {
    label: "インターン",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  new_grad: {
    label: "新卒",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  other: {
    label: "その他",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
};

const ROUND_LABELS: Record<InterviewRound, string> = {
  first: "一次面接",
  second: "二次面接",
  third: "三次面接",
  final: "最終面接",
  gd: "GD",
  case: "ケース",
  other: "その他",
};

const STATUS_CONFIG: Record<
  InterviewStatus,
  { label: string; className: string }
> = {
  uploaded: {
    label: "アップロード済",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  transcribing: {
    label: "文字起こし中",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
  analyzing: {
    label: "分析中",
    className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  },
  completed: {
    label: "完了",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  error: {
    label: "エラー",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
};

// ============================================================
// スコアの色
// ============================================================

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

// ============================================================
// Props
// ============================================================

export interface InterviewCardProps {
  id: string;
  companyName: string;
  category: InterviewCategory;
  round: InterviewRound | null;
  interviewDate: string | null;
  overallScore: number | null;
  status: InterviewStatus;
}

// ============================================================
// Component
// ============================================================

export function InterviewCard({
  id,
  companyName,
  category,
  round,
  interviewDate,
  overallScore,
  status,
}: InterviewCardProps) {
  const catConfig = CATEGORY_CONFIG[category];
  const statusConfig = STATUS_CONFIG[status];

  return (
    <Link
      href={`/interview/${id}/result`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <Card className="transition-shadow duration-200 group-hover:shadow-md h-full">
        <CardHeader className="pb-2">
          {/* 企業名 */}
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{companyName || "企業名なし"}</span>
          </CardTitle>

          {/* バッジ群 */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <Badge variant="outline" className={catConfig.className}>
              {catConfig.label}
            </Badge>
            {category === "new_grad" && round && (
              <Badge variant="secondary">{ROUND_LABELS[round]}</Badge>
            )}
            <Badge variant="outline" className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* 面接日 */}
          {interviewDate && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={interviewDate}>
                {new Date(interviewDate).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          )}

          {/* 総合スコア */}
          {overallScore !== null ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  総合スコア
                </span>
                <span className={`text-sm font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}
                  <span className="text-xs font-normal text-muted-foreground">
                    /100
                  </span>
                </span>
              </div>
              <Progress value={overallScore} className="h-1.5" />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              スコア未算出
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
