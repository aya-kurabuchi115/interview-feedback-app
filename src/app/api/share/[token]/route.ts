/**
 * GET /api/share/[token]
 * 共有トークンで面接結果データを取得する（認証不要）
 *
 * Issue #78: 面接結果の共有機能
 * プライバシー保護: 文字起こし・個人情報は返さない
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CategoryScores } from "@/types/database";
import { badRequest, notFound, gone, serverError } from "@/lib/api/error-response";
import { reportApiError } from "@/lib/error-reporting";

interface SharedResult {
  id: string;
  interview_id: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface SharedInterview {
  id: string;
  title: string;
  company_name_snapshot: string;
  interview_category: string;
  interview_round: string | null;
  interview_date: string | null;
  status: string;
  created_at: string;
}

interface SharedFeedback {
  overall_score: number;
  summary: string | null;
  good_points: unknown;
  improvement_points: unknown;
  strengths: unknown;
  improvements: unknown;
  overall_comment: string | null;
  category_scores: unknown;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "トークンが必要です" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 共有リンクを取得（RLS で is_active = true かつ期限内のみ返る）
    const { data: shareRaw, error: shareError } = await supabase
      .from("shared_results" as never)
      .select("id, interview_id, is_active, expires_at, created_at")
      .eq("share_token", token)
      .eq("is_active", true)
      .maybeSingle();

    const shareData = shareRaw as SharedResult | null;

    if (shareError || !shareData) {
      return NextResponse.json(
        { error: "共有リンクが見つかりません、または無効です" },
        { status: 404 }
      );
    }

    // 有効期限チェック（アプリ層での二重チェック）
    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "この共有リンクは期限切れです" },
        { status: 410 }
      );
    }

    // 面接データ取得（プライバシー保護: transcript は除外）
    const { data: interviewRaw } = await supabase
      .from("interviews")
      .select(
        "id, title, company_name_snapshot, interview_category, interview_round, interview_date, status, created_at"
      )
      .eq("id", shareData.interview_id)
      .single();

    const interview = interviewRaw as SharedInterview | null;

    if (!interview) {
      return NextResponse.json(
        { error: "面接データが見つかりません" },
        { status: 404 }
      );
    }

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

    const feedback = feedbackRaw as SharedFeedback | null;

    return NextResponse.json({
      interview: {
        title: interview.title,
        companyName: interview.company_name_snapshot,
        category: interview.interview_category,
        round: interview.interview_round,
        date: interview.interview_date,
        createdAt: interview.created_at,
      },
      feedback: feedback
        ? {
            overallScore: feedback.overall_score,
            summary: feedback.summary,
            goodPoints: feedback.good_points,
            improvementPoints: feedback.improvement_points,
            strengths: feedback.strengths,
            improvements: feedback.improvements,
            overallComment: feedback.overall_comment,
            categoryScores: feedback.category_scores as CategoryScores,
          }
        : null,
      expiresAt: shareData.expires_at,
    });
  } catch (error) {
    reportApiError(error, {
      apiRoute: "/api/share/[token]",
      featureArea: "share",
    });
    return NextResponse.json(
      { error: "共有データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
