/**
 * POST /api/share
 * 共有リンクを作成する（認証必須・面接所有権チェック）
 *
 * Issue #78: 面接結果の共有機能
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** デフォルトの有効期限: 7日間 */
const DEFAULT_EXPIRY_DAYS = 7;

/** 既存共有リンクの型 */
interface ExistingShare {
  id: string;
  share_token: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

/** 作成結果の型 */
interface ShareInsertResult {
  share_token: string;
  expires_at: string | null;
  created_at: string;
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
    const { interviewId, expiryDays } = body as {
      interviewId?: string;
      expiryDays?: number;
    };

    if (!interviewId) {
      return NextResponse.json(
        { error: "interviewId は必須です" },
        { status: 400 }
      );
    }

    // Defense-in-Depth: 面接がログインユーザーのものか検証
    const { data: interview, error: interviewError } = await supabase
      .from("interviews")
      .select("id, user_id")
      .eq("id", interviewId)
      .eq("user_id", user.id)
      .single();

    if (interviewError || !interview) {
      return NextResponse.json(
        { error: "面接が見つかりません" },
        { status: 404 }
      );
    }

    // 既にアクティブな共有リンクがあるか確認
    // shared_results は新設テーブルのため as never でキャスト
    const { data: existingRaw } = await supabase
      .from("shared_results" as never)
      .select("id, share_token, is_active, expires_at, created_at")
      .eq("interview_id" as never, interviewId)
      .eq("user_id" as never, user.id)
      .eq("is_active" as never, true)
      .maybeSingle();

    const existing = existingRaw as ExistingShare | null;

    if (existing) {
      // 既存のアクティブな共有リンクがある場合、期限切れでなければそれを返す
      const isExpired =
        existing.expires_at && new Date(existing.expires_at) < new Date();
      if (!isExpired) {
        return NextResponse.json({
          shareToken: existing.share_token,
          expiresAt: existing.expires_at,
          createdAt: existing.created_at,
          isNew: false,
        });
      }
      // 期限切れの場合は無効化して新しく作成
      await supabase
        .from("shared_results" as never)
        .update({ is_active: false } as never)
        .eq("id" as never, existing.id);
    }

    // 共有トークン生成（crypto.randomUUID は URL-safe）
    const shareToken = crypto.randomUUID();

    // 有効期限を計算
    const days = expiryDays ?? DEFAULT_EXPIRY_DAYS;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    // 共有リンクを作成
    const { data: resultRaw, error: insertError } = await supabase
      .from("shared_results" as never)
      .insert({
        interview_id: interviewId,
        user_id: user.id,
        share_token: shareToken,
        is_active: true,
        expires_at: expiresAt.toISOString(),
      } as never)
      .select("share_token, expires_at, created_at")
      .single();

    const shareResult = resultRaw as ShareInsertResult | null;

    if (insertError || !shareResult) {
      console.error("共有リンク作成エラー:", insertError);
      return NextResponse.json(
        { error: "共有リンクの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      shareToken: shareResult.share_token,
      expiresAt: shareResult.expires_at,
      createdAt: shareResult.created_at,
      isNew: true,
    });
  } catch (error) {
    console.error("共有リンク作成エラー:", error);
    return NextResponse.json(
      { error: "共有リンクの作成に失敗しました" },
      { status: 500 }
    );
  }
}
