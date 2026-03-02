import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { unauthorized, badRequest, serverError } from "@/lib/api/error-response";
import { reportApiError } from "@/lib/error-reporting";

type Interview = Database["public"]["Tables"]["interviews"]["Row"];
type Feedback = Database["public"]["Tables"]["feedbacks"]["Row"];

/** カテゴリの日本語ラベル */
const CATEGORY_MAP: Record<string, string> = {
  arubaito: "アルバイト",
  intern: "インターン",
  new_grad: "新卒",
  other: "その他",
};

/** ラウンドの日本語ラベル */
const ROUND_MAP: Record<string, string> = {
  first: "一次",
  second: "二次",
  third: "三次",
  final: "最終",
  gd: "GD",
  case: "ケース",
  other: "その他",
};

/** CSV 用に値をエスケープする（CSV インジェクション対策 + ダブルクォートエスケープ） */
function escapeCsvValue(value: string): string {
  let escaped = value;

  // CSV インジェクション対策: 数式として解釈される文字で始まる場合はシングルクォートを付与
  if (/^[=+\-@\t\r]/.test(escaped)) {
    escaped = "'" + escaped;
  }

  // ダブルクォートのエスケープ・カンマ・改行を含む場合はダブルクォートで囲む
  if (
    escaped.includes(",") ||
    escaped.includes('"') ||
    escaped.includes("\n") ||
    escaped.includes("\r")
  ) {
    escaped = '"' + escaped.replace(/"/g, '""') + '"';
  }

  return escaped;
}

/** ISO 8601 日付形式の検証（YYYY-MM-DD） */
function isValidDateString(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
}

/** 最大エクスポート件数 */
const MAX_EXPORT_ROWS = 100;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // 日付範囲パラメータの取得・バリデーション
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (from && !isValidDateString(from)) {
      return NextResponse.json(
        { error: "開始日の形式が不正です（YYYY-MM-DD）" },
        { status: 400 }
      );
    }

    if (to && !isValidDateString(to)) {
      return NextResponse.json(
        { error: "終了日の形式が不正です（YYYY-MM-DD）" },
        { status: 400 }
      );
    }

    if (from && to && from > to) {
      return NextResponse.json(
        { error: "開始日は終了日より前に設定してください" },
        { status: 400 }
      );
    }

    // 面接データ取得（user_id でフィルタ、最大100件）
    let query = supabase
      .from("interviews")
      .select("*")
      .eq("user_id", user.id);

    if (from) {
      query = query.gte("interview_date", from);
    }
    if (to) {
      query = query.lte("interview_date", to);
    }

    const { data: interviewsData, error: interviewsError } = await query
      .order("interview_date", { ascending: false, nullsFirst: false })
      .limit(MAX_EXPORT_ROWS);

    if (interviewsError) {
      return NextResponse.json(
        { error: "面接データの取得に失敗しました" },
        { status: 500 }
      );
    }

    const interviews = (interviewsData ?? []) as Interview[];

    // フィードバック取得
    const interviewIds = interviews.map((i) => i.id);
    const feedbackMap = new Map<string, Feedback>();

    if (interviewIds.length > 0) {
      const { data: feedbacksData } = await supabase
        .from("feedbacks")
        .select("*")
        .in("interview_id", interviewIds)
        .order("created_at", { ascending: false });

      const feedbacks = (feedbacksData ?? []) as Feedback[];

      // 各面接の最新フィードバックをマッピング
      for (const fb of feedbacks) {
        if (!feedbackMap.has(fb.interview_id)) {
          feedbackMap.set(fb.interview_id, fb);
        }
      }
    }

    // CSV ヘッダー
    const headers = [
      "面接日",
      "企業名",
      "カテゴリ",
      "ラウンド",
      "総合スコア",
      "サマリー",
      "作成日",
    ];

    // CSV 行の生成
    const rows = interviews.map((interview) => {
      const feedback = feedbackMap.get(interview.id);

      const interviewDate = interview.interview_date
        ? new Date(interview.interview_date).toLocaleDateString("ja-JP")
        : "";

      const category =
        CATEGORY_MAP[interview.interview_category] ||
        interview.interview_category;

      const round = interview.interview_round
        ? ROUND_MAP[interview.interview_round] || interview.interview_round
        : "";

      const overallScore =
        feedback?.overall_score != null
          ? String(feedback.overall_score)
          : "";

      const summary = feedback?.summary ?? "";

      const createdAt = new Date(interview.created_at).toLocaleDateString(
        "ja-JP"
      );

      return [
        interviewDate,
        interview.company_name_snapshot,
        category,
        round,
        overallScore,
        summary,
        createdAt,
      ]
        .map(escapeCsvValue)
        .join(",");
    });

    // BOM + CSV コンテンツ
    const BOM = "\uFEFF";
    const csvContent =
      BOM + headers.map(escapeCsvValue).join(",") + "\n" + rows.join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="interview-history.csv"',
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    reportApiError(error, {
      apiRoute: "/api/export/csv",
      featureArea: "export",
    });
    return NextResponse.json(
      { error: "エクスポート中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
