/**
 * POST /api/share/revoke
 * 共有リンクを無効化する（認証必須・所有権チェック）
 *
 * Issue #78: 面接結果の共有機能
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { unauthorized, badRequest, notFound, forbidden, serverError } from "@/lib/api/error-response";
import { reportApiError } from "@/lib/error-reporting";

/** 共有リンクの型 */
interface SharedResultRow {
  id: string;
  user_id: string;
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { shareToken } = body as { shareToken?: string };

    if (!shareToken) {
      return NextResponse.json(
        { error: "shareToken は必須です" },
        { status: 400 }
      );
    }

    // Defense-in-Depth: 共有リンクがログインユーザーのものか検証
    // shared_results は新設テーブルのため as never でキャスト
    const { data: shareRaw, error: fetchError } = await supabase
      .from("shared_results" as never)
      .select("id, user_id")
      .eq("share_token" as never, shareToken)
      .single();

    const shareData = shareRaw as SharedResultRow | null;

    if (fetchError || !shareData) {
      return NextResponse.json(
        { error: "共有リンクが見つかりません" },
        { status: 404 }
      );
    }

    if (shareData.user_id !== user.id) {
      return NextResponse.json(
        { error: "この共有リンクを無効化する権限がありません" },
        { status: 403 }
      );
    }

    // 共有リンクを無効化
    const { error: updateError } = await supabase
      .from("shared_results" as never)
      .update({ is_active: false } as never)
      .eq("id" as never, shareData.id)
      .eq("user_id" as never, user.id);

    if (updateError) {
      console.error("共有リンク無効化エラー:", updateError);
      return NextResponse.json(
        { error: "共有リンクの無効化に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    reportApiError(error, {
      apiRoute: "/api/share/revoke",
      featureArea: "share",
    });
    return NextResponse.json(
      { error: "共有リンクの無効化に失敗しました" },
      { status: 500 }
    );
  }
}
