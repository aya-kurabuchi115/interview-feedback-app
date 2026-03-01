import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database, CategoryScores } from "@/types/database";
import { CATEGORY_LABELS } from "@/lib/constants";
import { unauthorized, badRequest, notFound, serverError } from "@/lib/api/error-response";

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

/** ISO 8601 日付形式の検証（YYYY-MM-DD） */
function isValidDateString(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
}

/** 最大エクスポート件数 */
const MAX_EXPORT_ROWS = 100;

/** スコアに応じた色クラスを返す */
function scoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#ca8a04";
  return "#dc2626";
}

/** JSON 配列から string[] を安全にパースする */
function parseStringArray(data: unknown): string[] {
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is string => typeof item === "string");
}

/** 単一面接のレポート HTML を生成 */
function renderSingleReport(
  interview: Interview,
  feedback: Feedback | null
): string {
  const interviewDate = interview.interview_date
    ? new Date(interview.interview_date).toLocaleDateString("ja-JP")
    : "未設定";

  const category =
    CATEGORY_MAP[interview.interview_category] ||
    interview.interview_category;

  const round = interview.interview_round
    ? ROUND_MAP[interview.interview_round] || interview.interview_round
    : "";

  const goodPoints = feedback
    ? parseStringArray(feedback.good_points)
    : [];
  const improvementPoints = feedback
    ? parseStringArray(feedback.improvement_points)
    : [];
  const strengths = feedback ? parseStringArray(feedback.strengths) : [];
  const improvements = feedback
    ? parseStringArray(feedback.improvements)
    : [];

  // good_points が空の場合は strengths にフォールバック
  const displayGoodPoints =
    goodPoints.length > 0 ? goodPoints : strengths;
  const displayImprovementPoints =
    improvementPoints.length > 0 ? improvementPoints : improvements;

  // カテゴリ別スコア
  const categoryScores = (feedback?.category_scores ?? {}) as CategoryScores;
  const categoryScoreEntries = Object.entries(categoryScores).filter(
    ([, v]) => typeof v === "number"
  ) as [string, number][];

  return `
    <div class="report">
      <h2>${escapeHtml(interview.company_name_snapshot)} - ${escapeHtml(interview.title)}</h2>
      <div class="meta">
        <span>面接日: ${escapeHtml(interviewDate)}</span>
        <span>カテゴリ: ${escapeHtml(category)}</span>
        ${round ? `<span>ラウンド: ${escapeHtml(round)}</span>` : ""}
      </div>

      ${
        feedback
          ? `
        <div class="score-section">
          <div class="overall-score">
            <div class="score-label">総合スコア</div>
            <div class="score-value" style="color: ${scoreColor(feedback.overall_score)}">
              ${feedback.overall_score}<span class="score-max"> / 100</span>
            </div>
          </div>

          ${
            categoryScoreEntries.length > 0
              ? `
            <div class="category-scores">
              <h3>カテゴリ別スコア</h3>
              ${categoryScoreEntries
                .map(
                  ([key, value]) => `
                <div class="category-score-row">
                  <span class="category-label">${escapeHtml(CATEGORY_LABELS[key] || key)}</span>
                  <div class="score-bar-container">
                    <div class="score-bar" style="width: ${value}%; background-color: ${scoreColor(value)}"></div>
                  </div>
                  <span class="category-value">${value}点</span>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
        </div>

        <div class="summary-section">
          <h3>要約</h3>
          <p>${escapeHtml(feedback.summary)}</p>
        </div>

        ${
          displayGoodPoints.length > 0
            ? `
          <div class="points-section good">
            <h3>良い点</h3>
            <ul>
              ${displayGoodPoints.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
            </ul>
          </div>
        `
            : ""
        }

        ${
          displayImprovementPoints.length > 0
            ? `
          <div class="points-section improvement">
            <h3>改善点</h3>
            <ul>
              ${displayImprovementPoints.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
            </ul>
          </div>
        `
            : ""
        }

        ${
          feedback.overall_comment
            ? `
          <div class="comment-section">
            <h3>詳細フィードバック</h3>
            <p>${escapeHtml(feedback.overall_comment)}</p>
          </div>
        `
            : ""
        }
      `
          : `
        <div class="no-feedback">
          <p>フィードバックはまだ生成されていません</p>
        </div>
      `
      }
    </div>
  `;
}

/** HTML エスケープ */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

    // クエリパラメータ: 特定の面接 ID（任意）、日付範囲（任意）
    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get("id");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // 日付バリデーション
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

    let interviews: Interview[] = [];
    const feedbackMap = new Map<string, Feedback>();

    if (interviewId) {
      // 特定の面接を取得
      const { data: interviewData, error: interviewError } = await supabase
        .from("interviews")
        .select("*")
        .eq("id", interviewId)
        .eq("user_id", user.id)
        .single();

      if (interviewError || !interviewData) {
        return NextResponse.json(
          { error: "面接データが見つかりません" },
          { status: 404 }
        );
      }

      interviews = [interviewData as Interview];
    } else {
      // 全件取得（最大100件）、日付範囲フィルタ対応
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

      interviews = (interviewsData ?? []) as Interview[];
    }

    // フィードバック取得
    const interviewIds = interviews.map((i) => i.id);
    if (interviewIds.length > 0) {
      const { data: feedbacksData } = await supabase
        .from("feedbacks")
        .select("*")
        .in("interview_id", interviewIds)
        .order("created_at", { ascending: false });

      const feedbacks = (feedbacksData ?? []) as Feedback[];

      for (const fb of feedbacks) {
        if (!feedbackMap.has(fb.interview_id)) {
          feedbackMap.set(fb.interview_id, fb);
        }
      }
    }

    // 印刷用 HTML 生成
    const title = interviewId
      ? `面接レポート - ${interviews[0]?.company_name_snapshot ?? ""}`
      : "面接履歴レポート";

    const reportDate = new Date().toLocaleDateString("ja-JP");

    const reportsHtml = interviews
      .map((interview) => {
        const feedback = feedbackMap.get(interview.id) ?? null;
        return renderSingleReport(interview, feedback);
      })
      .join('<div class="page-break"></div>');

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
      padding: 24px;
      background: #fff;
    }

    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e5e7eb;
    }

    .header h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .header .date {
      font-size: 14px;
      color: #6b7280;
    }

    .report {
      margin-bottom: 32px;
      padding: 24px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .report h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #111827;
    }

    .meta {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f3f4f6;
    }

    .score-section {
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }

    .overall-score {
      text-align: center;
      padding: 16px 32px;
      background: #f9fafb;
      border-radius: 8px;
      min-width: 160px;
    }

    .score-label {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .score-value {
      font-size: 48px;
      font-weight: 700;
    }

    .score-max {
      font-size: 16px;
      color: #9ca3af;
      font-weight: 400;
    }

    .category-scores {
      flex: 1;
      min-width: 280px;
    }

    .category-scores h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .category-score-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .category-label {
      font-size: 14px;
      min-width: 120px;
    }

    .score-bar-container {
      flex: 1;
      height: 12px;
      background: #f3f4f6;
      border-radius: 6px;
      overflow: hidden;
    }

    .score-bar {
      height: 100%;
      border-radius: 6px;
      transition: width 0.3s;
    }

    .category-value {
      font-size: 14px;
      color: #6b7280;
      min-width: 40px;
      text-align: right;
    }

    .summary-section,
    .comment-section {
      margin-bottom: 20px;
    }

    .summary-section h3,
    .comment-section h3,
    .points-section h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #f3f4f6;
    }

    .summary-section p,
    .comment-section p {
      font-size: 14px;
      white-space: pre-wrap;
    }

    .points-section {
      margin-bottom: 20px;
    }

    .points-section.good h3 {
      color: #16a34a;
    }

    .points-section.improvement h3 {
      color: #ea580c;
    }

    .points-section ul {
      list-style: none;
      padding: 0;
    }

    .points-section ul li {
      font-size: 14px;
      padding: 6px 0 6px 20px;
      position: relative;
    }

    .points-section.good ul li::before {
      content: "\\2713";
      position: absolute;
      left: 0;
      color: #16a34a;
      font-weight: bold;
    }

    .points-section.improvement ul li::before {
      content: "\\25B2";
      position: absolute;
      left: 0;
      color: #ea580c;
      font-size: 12px;
    }

    .no-feedback {
      padding: 24px;
      text-align: center;
      color: #9ca3af;
      background: #f9fafb;
      border-radius: 8px;
    }

    .page-break {
      page-break-after: always;
      height: 0;
      margin: 0;
      padding: 0;
    }

    .print-button-container {
      text-align: center;
      margin-bottom: 24px;
    }

    .print-button {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      font-weight: 500;
    }

    .print-button:hover {
      background: #1d4ed8;
    }

    .footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #9ca3af;
    }

    @media print {
      body {
        padding: 0;
      }

      .print-button-container {
        display: none !important;
      }

      .report {
        border: none;
        padding: 0;
        margin-bottom: 0;
      }

      .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
      }
    }
  </style>
</head>
<body>
  <div class="print-button-container">
    <button class="print-button" onclick="window.print()">
      PDF として保存 / 印刷
    </button>
  </div>

  <div class="header">
    <h1>${escapeHtml(title)}</h1>
    <p class="date">出力日: ${escapeHtml(reportDate)}</p>
  </div>

  ${reportsHtml}

  <div class="footer">
    <p>Interview Feedback App - ${escapeHtml(reportDate)}</p>
  </div>

  <script>
    // ページ読み込み後に印刷ダイアログを自動で表示
    window.addEventListener("load", function() {
      // 少し遅延させてレンダリング完了を待つ
      setTimeout(function() {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "エクスポート中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
