/**
 * /share/[token]/opengraph-image
 * Issue #195: OGP 画像動的生成
 *
 * next/og の ImageResponse を使って 1200x630 の OGP 画像を生成する。
 * - スコア（大きな数字）
 * - カテゴリ別スコアバー
 * - InterviewCoach ブランド
 * - 個人情報（企業名等）は含めない
 */
import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import type { CategoryScores } from "@/types/database";
import { CATEGORY_LABELS } from "@/lib/constants";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// ============================================================
// データ取得
// ============================================================

interface ShareRow {
  id: string;
  interview_id: string;
  is_active: boolean;
  expires_at: string | null;
}

interface FeedbackRow {
  overall_score: number;
  category_scores: CategoryScores;
}

interface InterviewRow {
  interview_category: string;
}

async function getShareOgData(token: string) {
  const supabase = await createClient();

  const { data: shareRaw } = await supabase
    .from("shared_results" as never)
    .select("id, interview_id, is_active, expires_at")
    .eq("share_token" as never, token)
    .eq("is_active" as never, true)
    .maybeSingle();

  const shareData = shareRaw as ShareRow | null;

  if (!shareData) return null;

  if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
    return null;
  }

  const { data: feedbackRaw } = await supabase
    .from("feedbacks")
    .select("overall_score, category_scores")
    .eq("interview_id", shareData.interview_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: interviewRaw } = await supabase
    .from("interviews")
    .select("interview_category")
    .eq("id", shareData.interview_id)
    .single();

  return {
    feedback: feedbackRaw as FeedbackRow | null,
    interview: interviewRaw as InterviewRow | null,
  };
}

// ============================================================
// カテゴリ日本語変換
// ============================================================

function formatCategory(category: string): string {
  const map: Record<string, string> = {
    arubaito: "アルバイト面接",
    intern: "インターン面接",
    new_grad: "新卒面接",
    other: "面接練習",
  };
  return map[category] || "面接練習";
}

// ============================================================
// スコア色
// ============================================================

function getScoreColor(score: number): string {
  if (score >= 80) return "#16a34a"; // green-600
  if (score >= 60) return "#ca8a04"; // yellow-600
  return "#dc2626"; // red-600
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return "#22c55e"; // green-500
  if (score >= 60) return "#eab308"; // yellow-500
  return "#ef4444"; // red-500
}

// ============================================================
// 画像生成
// ============================================================

export default async function OgImage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getShareOgData(token);

  // データが取れない場合のフォールバック
  if (!data || !data.feedback) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
            color: "white",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 700 }}>InterviewCoach</div>
          <div style={{ fontSize: 24, marginTop: 16, opacity: 0.8 }}>
            AI 面接フィードバック
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const { feedback, interview } = data;
  const score = feedback.overall_score;
  const categoryScores = feedback.category_scores;
  const categoryLabel = interview
    ? formatCategory(interview.interview_category)
    : "面接練習";

  const categoryEntries = categoryScores
    ? Object.entries(categoryScores).filter(
        (entry): entry is [string, number] => typeof entry[1] === "number"
      )
    : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
          color: "white",
          padding: "48px 56px",
        }}
      >
        {/* 左側: スコアとブランド */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "50%",
            paddingRight: 40,
          }}
        >
          {/* カテゴリラベル */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                background: "rgba(59, 130, 246, 0.3)",
                borderRadius: 20,
                padding: "6px 20px",
                fontSize: 20,
                color: "#93c5fd",
              }}
            >
              {categoryLabel}
            </div>
          </div>

          {/* スコア */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 22,
                color: "#94a3b8",
                marginBottom: 8,
              }}
            >
              総合スコア
            </div>
            <div
              style={{
                fontSize: 160,
                fontWeight: 800,
                color: getScoreColor(score),
                lineHeight: 1,
              }}
            >
              {score}
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#64748b",
                marginTop: 4,
              }}
            >
              / 100
            </div>
            {/* スコアバー */}
            <div
              style={{
                display: "flex",
                width: 320,
                height: 16,
                borderRadius: 8,
                background: "rgba(255,255,255,0.1)",
                marginTop: 16,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${score}%`,
                  height: "100%",
                  borderRadius: 8,
                  background: getScoreBarColor(score),
                }}
              />
            </div>
          </div>

          {/* ブランド */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              IC
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                InterviewCoach
              </div>
              <div style={{ fontSize: 14, color: "#64748b" }}>
                AI 面接フィードバック
              </div>
            </div>
          </div>
        </div>

        {/* 右側: カテゴリ別スコア */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "50%",
            paddingLeft: 40,
            borderLeft: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 28,
              color: "#cbd5e1",
            }}
          >
            カテゴリ別スコア
          </div>
          {categoryEntries.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              {categoryEntries.map(([key, value]) => {
                const label = CATEGORY_LABELS[key] || key;
                return (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 18,
                      }}
                    >
                      <span style={{ color: "#e2e8f0" }}>{label}</span>
                      <span
                        style={{
                          color: getScoreColor(value),
                          fontWeight: 700,
                        }}
                      >
                        {value}点
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        width: "100%",
                        height: 12,
                        borderRadius: 6,
                        background: "rgba(255,255,255,0.1)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${value}%`,
                          height: "100%",
                          borderRadius: 6,
                          background: getScoreBarColor(value),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 18, color: "#64748b" }}>
              カテゴリ別スコアはありません
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
