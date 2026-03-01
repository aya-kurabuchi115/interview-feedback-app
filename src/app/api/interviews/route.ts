import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  InterviewCategory,
  InterviewRound,
} from "@/types/database";

/** バリデーション定数 */
const VALID_CATEGORIES: InterviewCategory[] = [
  "arubaito",
  "intern",
  "new_grad",
  "other",
];
const VALID_ROUNDS: InterviewRound[] = [
  "first",
  "second",
  "third",
  "final",
  "gd",
  "case",
  "other",
];

const MIN_TRANSCRIPT_LENGTH = 100;
const MAX_TRANSCRIPT_LENGTH = 50_000;
const MAX_COMPANY_NAME_LENGTH = 100;

export async function POST(request: Request) {
  try {
    // 認証チェック
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // リクエストボディの取得
    const body = await request.json();
    const {
      company_name,
      interview_category,
      interview_round,
      interview_date,
      transcript,
    } = body as {
      company_name: string;
      interview_category: InterviewCategory;
      interview_round: InterviewRound | null;
      interview_date: string | null;
      transcript: string;
    };

    // --- バリデーション ---

    // 企業名
    if (!company_name || typeof company_name !== "string") {
      return NextResponse.json(
        { error: "企業名は必須です" },
        { status: 400 }
      );
    }
    const trimmedCompanyName = company_name.trim();
    if (
      trimmedCompanyName.length < 1 ||
      trimmedCompanyName.length > MAX_COMPANY_NAME_LENGTH
    ) {
      return NextResponse.json(
        { error: `企業名は1〜${MAX_COMPANY_NAME_LENGTH}文字で入力してください` },
        { status: 400 }
      );
    }

    // 面接カテゴリ
    if (!interview_category || !VALID_CATEGORIES.includes(interview_category)) {
      return NextResponse.json(
        { error: "有効な面接カテゴリを選択してください" },
        { status: 400 }
      );
    }

    // 面接ラウンド（新卒の場合のみ必須）
    if (interview_category === "new_grad") {
      if (!interview_round || !VALID_ROUNDS.includes(interview_round)) {
        return NextResponse.json(
          { error: "新卒面接の場合、面接ラウンドを選択してください" },
          { status: 400 }
        );
      }
    }

    // 面接日（未来の日付チェック）
    if (interview_date) {
      const dateObj = new Date(interview_date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json(
          { error: "有効な日付を入力してください" },
          { status: 400 }
        );
      }
      if (dateObj > today) {
        return NextResponse.json(
          { error: "面接日は今日以前の日付を指定してください" },
          { status: 400 }
        );
      }
    }

    // 音声スクリプト
    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "音声スクリプトは必須です" },
        { status: 400 }
      );
    }
    const trimmedTranscript = transcript.trim();
    if (trimmedTranscript.length < MIN_TRANSCRIPT_LENGTH) {
      return NextResponse.json(
        {
          error: `音声スクリプトは${MIN_TRANSCRIPT_LENGTH}文字以上入力してください（現在: ${trimmedTranscript.length}文字）`,
        },
        { status: 400 }
      );
    }
    if (trimmedTranscript.length > MAX_TRANSCRIPT_LENGTH) {
      return NextResponse.json(
        {
          error: `音声スクリプトは${MAX_TRANSCRIPT_LENGTH.toLocaleString()}文字以内で入力してください（現在: ${trimmedTranscript.length.toLocaleString()}文字）`,
        },
        { status: 400 }
      );
    }

    // --- 企業の upsert ---
    const normalizedName = trimmedCompanyName
      .toLowerCase()
      .replace(/[\s\u3000]+/g, "")
      .replace(/[（）()]/g, "");

    // 既存の企業を検索
    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id")
      .eq("normalized_name", normalizedName)
      .single();

    let companyId: string;

    const existingRecord = existingCompany as { id: string } | null;

    if (existingRecord) {
      companyId = existingRecord.id;
    } else {
      const { data: newCompany, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: trimmedCompanyName,
          normalized_name: normalizedName,
        } as never)
        .select("id")
        .single();

      const newRecord = newCompany as { id: string } | null;

      if (companyError || !newRecord) {
        return NextResponse.json(
          { error: "企業情報の保存に失敗しました" },
          { status: 500 }
        );
      }
      companyId = newRecord.id;
    }

    // --- 面接レコードの作成 ---
    const interviewId = crypto.randomUUID();
    const title = `${trimmedCompanyName} - ${getCategoryLabel(interview_category)}${
      interview_round ? ` (${getRoundLabel(interview_round)})` : ""
    }`;

    const { error: interviewError } = await supabase
      .from("interviews")
      .insert({
        id: interviewId,
        user_id: user.id,
        title,
        company_id: companyId,
        company_name_snapshot: trimmedCompanyName,
        interview_category,
        interview_round:
          interview_category === "new_grad" ? interview_round : null,
        interview_date: interview_date || null,
        transcript: trimmedTranscript,
        transcript_char_count: trimmedTranscript.length,
        status: "uploaded",
      } as never);

    if (interviewError) {
      return NextResponse.json(
        { error: "面接データの保存に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      interview_id: interviewId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "予期しないエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** カテゴリのラベル変換 */
function getCategoryLabel(category: InterviewCategory): string {
  const labels: Record<InterviewCategory, string> = {
    arubaito: "アルバイト面接",
    intern: "インターン面接",
    new_grad: "新卒面接",
    other: "その他面接",
  };
  return labels[category];
}

/** ラウンドのラベル変換 */
function getRoundLabel(round: InterviewRound): string {
  const labels: Record<InterviewRound, string> = {
    first: "一次面接",
    second: "二次面接",
    third: "三次面接",
    final: "最終面接",
    gd: "GD",
    case: "ケース面接",
    other: "その他",
  };
  return labels[round];
}
