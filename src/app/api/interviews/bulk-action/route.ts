import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { unauthorized, badRequest, serverError } from "@/lib/api/error-response";

/** 許可されるアクション種別 */
const VALID_ACTIONS = ["archive", "unarchive", "soft_delete", "permanent_delete"] as const;
type BulkAction = (typeof VALID_ACTIONS)[number];

/** リクエストボディ型 */
interface BulkActionRequest {
  ids: string[];
  action: BulkAction;
}

/** 一括操作の上限 */
const MAX_BATCH_SIZE = 50;

/**
 * POST /api/interviews/bulk-action
 *
 * 面接データの一括アーカイブ / アーカイブ解除 / ソフトデリート / 完全削除
 * RLS + user_id 検証で他ユーザーのデータは操作不可
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized();
    }

    const body = (await request.json()) as BulkActionRequest;
    const { ids, action } = body;

    // --- バリデーション ---
    if (!Array.isArray(ids) || ids.length === 0) {
      return badRequest("対象の面接を選択してください。");
    }

    if (ids.length > MAX_BATCH_SIZE) {
      return badRequest(`一度に操作できるのは${MAX_BATCH_SIZE}件までです。`);
    }

    // UUID バリデーション
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!ids.every((id) => typeof id === "string" && uuidRegex.test(id))) {
      return badRequest("無効なIDが含まれています。");
    }

    if (!VALID_ACTIONS.includes(action as BulkAction)) {
      return badRequest("無効なアクションです。");
    }

    const now = new Date().toISOString();

    switch (action) {
      case "archive": {
        const { error, count } = await supabase
          .from("interviews")
          .update({ archived_at: now } as never)
          .in("id", ids)
          .eq("user_id", user.id)
          .is("deleted_at", null);

        if (error) {
          console.error("[bulk-action] archive error:", error.message);
          return serverError("アーカイブに失敗しました。");
        }

        return NextResponse.json({ success: true, action, affected: count ?? ids.length });
      }

      case "unarchive": {
        const { error, count } = await supabase
          .from("interviews")
          .update({ archived_at: null } as never)
          .in("id", ids)
          .eq("user_id", user.id)
          .is("deleted_at", null);

        if (error) {
          console.error("[bulk-action] unarchive error:", error.message);
          return serverError("アーカイブ解除に失敗しました。");
        }

        return NextResponse.json({ success: true, action, affected: count ?? ids.length });
      }

      case "soft_delete": {
        const { error, count } = await supabase
          .from("interviews")
          .update({ deleted_at: now } as never)
          .in("id", ids)
          .eq("user_id", user.id)
          .is("deleted_at", null);

        if (error) {
          console.error("[bulk-action] soft_delete error:", error.message);
          return serverError("削除に失敗しました。");
        }

        return NextResponse.json({ success: true, action, affected: count ?? ids.length });
      }

      case "permanent_delete": {
        // 完全削除: 関連テーブル(feedbacks, transcripts, interview_tags, shared_results)は CASCADE で削除される想定
        // RLS で user_id 検証
        const { error, count } = await supabase
          .from("interviews")
          .delete()
          .in("id", ids)
          .eq("user_id", user.id);

        if (error) {
          console.error("[bulk-action] permanent_delete error:", error.message);
          return serverError("完全削除に失敗しました。");
        }

        return NextResponse.json({ success: true, action, affected: count ?? ids.length });
      }

      default:
        return badRequest("無効なアクションです。");
    }
  } catch (error) {
    console.error("[bulk-action] unexpected error:", error);
    return serverError();
  }
}
