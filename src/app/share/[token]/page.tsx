/**
 * /share/[token] - 共有結果表示ページ（Server Component）
 * Issue #78: 面接結果の共有機能
 *
 * - 認証不要
 * - OGP メタデータ動的生成
 * - スコア・フィードバック概要を表示
 * - 文字起こし・個人情報は非表示（プライバシー保護）
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { CategoryScores } from "@/types/database";
import { CATEGORY_LABELS } from "@/lib/constants";

// ============================================================
// 型定義
// ============================================================

interface SharedPageProps {
  params: Promise<{ token: string }>;
}

interface SharedInterview {
  title: string;
  company_name_snapshot: string;
  interview_category: string;
  interview_round: string | null;
  interview_date: string | null;
  created_at: string;
}

interface SharedFeedback {
  overall_score: number;
  summary: string;
  good_points: unknown;
  improvement_points: unknown;
  strengths: unknown;
  improvements: unknown;
  overall_comment: string | null;
  category_scores: CategoryScores;
}

// ============================================================
// データ取得関数
// ============================================================

/** shared_results のクエリ結果型 */
interface ShareRow {
  id: string;
  interview_id: string;
  is_active: boolean;
  expires_at: string | null;
}

async function getSharedData(token: string) {
  const supabase = await createClient();

  // 共有リンクを取得
  // shared_results は新設テーブルのため as never でキャスト
  const { data: shareRaw } = await supabase
    .from("shared_results" as never)
    .select("id, interview_id, is_active, expires_at")
    .eq("share_token" as never, token)
    .eq("is_active" as never, true)
    .maybeSingle();

  const shareData = shareRaw as ShareRow | null;

  if (!shareData) return null;

  // 有効期限チェック
  if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
    return null;
  }

  // 面接データ取得（文字起こし・個人情報は除外）
  const { data: interviewRaw } = await supabase
    .from("interviews")
    .select(
      "title, company_name_snapshot, interview_category, interview_round, interview_date, created_at"
    )
    .eq("id", shareData.interview_id)
    .single();

  const interview = interviewRaw as SharedInterview | null;

  if (!interview) return null;

  // フィードバック取得
  const { data: feedbackRaw } = await supabase
    .from("feedbacks")
    .select(
      "overall_score, summary, good_points, improvement_points, strengths, improvements, overall_comment, category_scores"
    )
    .eq("interview_id", shareData.interview_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    interview,
    feedback: feedbackRaw as SharedFeedback | null,
    expiresAt: shareData.expires_at,
  };
}

// ============================================================
// OGP メタデータ動的生成
// ============================================================

export async function generateMetadata({
  params,
}: SharedPageProps): Promise<Metadata> {
  const { token } = await params;
  const data = await getSharedData(token);

  if (!data) {
    return {
      title: "共有リンクが見つかりません",
      description: "このリンクは無効、または期限切れです。",
    };
  }

  const { interview, feedback } = data;
  const scoreText = feedback
    ? `総合スコア ${feedback.overall_score}点`
    : "フィードバック生成中";
  const title = `${interview.title} - ${scoreText}`;
  const description = feedback
    ? `${interview.company_name_snapshot}の面接結果 | ${scoreText} | InterviewCoach で AI 面接フィードバックを受けよう`
    : `${interview.company_name_snapshot}の面接結果 | InterviewCoach`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | InterviewCoach`,
      description,
      type: "article",
      locale: "ja_JP",
      siteName: "InterviewCoach",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | InterviewCoach`,
      description,
    },
  };
}

// ============================================================
// ヘルパーコンポーネント
// ============================================================

function parseStringArray(data: unknown): string[] {
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is string => typeof item === "string");
}

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
      <div className="h-3 w-48 rounded-full bg-muted">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${
            score >= 80
              ? "bg-green-500"
              : score >= 60
                ? "bg-yellow-500"
                : "bg-red-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function CategoryScoreBar({ label, score }: { label: string; score: number }) {
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

function formatCategory(category: string): string {
  const map: Record<string, string> = {
    arubaito: "アルバイト",
    intern: "インターン",
    new_grad: "新卒",
    other: "その他",
  };
  return map[category] || category;
}

function formatRound(round: string | null): string {
  if (!round) return "";
  const map: Record<string, string> = {
    first: "1次面接",
    second: "2次面接",
    third: "3次面接",
    final: "最終面接",
    gd: "GD",
    case: "ケース面接",
    other: "その他",
  };
  return map[round] || round;
}

// ============================================================
// メインコンポーネント
// ============================================================

export default async function SharedResultPage({ params }: SharedPageProps) {
  const { token } = await params;
  const data = await getSharedData(token);

  if (!data) {
    notFound();
  }

  const { interview, feedback, expiresAt } = data;

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

  const displayGoodPoints = goodPoints.length > 0 ? goodPoints : strengths;
  const displayImprovementPoints =
    improvementPoints.length > 0 ? improvementPoints : improvements;

  const categoryScores = feedback?.category_scores;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          共有された面接結果
        </div>
        <h1 className="text-2xl font-bold md:text-3xl">{interview.title}</h1>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
          <span>{interview.company_name_snapshot}</span>
          {interview.interview_category && (
            <>
              <span aria-hidden>|</span>
              <span>{formatCategory(interview.interview_category)}</span>
            </>
          )}
          {interview.interview_round && (
            <>
              <span aria-hidden>|</span>
              <span>{formatRound(interview.interview_round)}</span>
            </>
          )}
          {interview.interview_date && (
            <>
              <span aria-hidden>|</span>
              <span>
                {new Date(interview.interview_date).toLocaleDateString("ja-JP")}
              </span>
            </>
          )}
        </div>
        {expiresAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            この共有リンクの有効期限:{" "}
            {new Date(expiresAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </div>

      {/* フィードバック未生成 */}
      {!feedback && (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            フィードバックはまだ生成されていません
          </p>
        </div>
      )}

      {/* スコア & カテゴリ別スコア */}
      {feedback && (
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex flex-col items-center">
              <ScoreDisplay score={feedback.overall_score} />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">カテゴリ別スコア</h2>
            {categoryScores && Object.keys(categoryScores).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(categoryScores).map(([key, value]) => {
                  if (typeof value !== "number") return null;
                  const label = CATEGORY_LABELS[key] || key;
                  return (
                    <CategoryScoreBar key={key} label={label} score={value} />
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                カテゴリ別スコアはありません
              </p>
            )}
          </div>
        </div>
      )}

      {/* 良い点 & 改善点 */}
      {feedback && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              良い点
            </h2>
            {displayGoodPoints.length === 0 ? (
              <p className="text-sm text-muted-foreground">データがありません</p>
            ) : (
              <ul className="space-y-3">
                {displayGoodPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-orange-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              改善点
            </h2>
            {displayImprovementPoints.length === 0 ? (
              <p className="text-sm text-muted-foreground">データがありません</p>
            ) : (
              <ul className="space-y-3">
                {displayImprovementPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 要約 & 総合コメント */}
      {feedback && (
        <div className="mb-6 space-y-4">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-3 text-lg font-semibold">面接の要約</h2>
            <p className="leading-relaxed whitespace-pre-wrap text-sm">
              {feedback.summary}
            </p>
          </div>

          {feedback.overall_comment && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-3 text-lg font-semibold">詳細フィードバック</h2>
              <p className="leading-relaxed whitespace-pre-wrap text-sm">
                {feedback.overall_comment}
              </p>
            </div>
          )}
        </div>
      )}

      {/* プライバシー通知 */}
      <div className="mb-8 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        <p>
          プライバシー保護のため、面接の文字起こしや個人情報は共有されていません。
        </p>
      </div>

      {/* CTA */}
      <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-purple-50 p-8 text-center dark:from-blue-950/20 dark:to-purple-950/20">
        <h2 className="mb-2 text-xl font-bold">
          InterviewCoach で面接対策を始めよう
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          AI が面接練習を分析し、回答内容・話し方の両面からフィードバックを自動生成します。
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          無料で始める
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
