import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { unauthorized, badRequest, notFound, serverError } from "@/lib/api/error-response";

/**
 * POST /api/interviews/retry
 * エラー状態の面接を uploaded に戻すリトライ用エンドポイント
 * クライアントから直接 status を更新させず、サーバーサイドで遷移を制御
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { interview_id: string };
    const interviewId = body.interview_id;

    if (!interviewId) {
      return NextResponse.json(
        { error: "interview_id is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized();
    }

    // 面接データを取得（所有権チェック + ステータス確認）
    const { data: interview, error: fetchError } = await supabase
      .from("interviews")
      .select("id, status, user_id")
      .eq("id", interviewId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !interview) {
      return NextResponse.json(
        { error: "面接データが見つかりません" },
        { status: 404 }
      );
    }

    const currentStatus = (interview as Record<string, unknown>).status as string;

    // error 状態からのリトライのみ許可
    if (currentStatus !== "error") {
      return NextResponse.json(
        { error: "リトライはエラー状態の面接のみ可能です" },
        { status: 400 }
      );
    }

    // ステータスを uploaded に戻す
    const { error: updateError } = await supabase
      .from("interviews")
      .update({ status: "uploaded" } as never)
      .eq("id", interviewId)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "ステータスの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[retry] Error:", error);
    return NextResponse.json(
      { error: "リトライ処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
