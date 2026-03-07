import { createClient } from "@/lib/supabase/server";

/**
 * ユーザー行動ログを記録する
 * API ルート内から呼び出す。失敗してもエラーを投げない（ベストエフォート）
 */
export async function logActivity({
  userId,
  action,
  resourceType,
  resourceId,
  metadata,
  request,
}: {
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  request?: Request;
}) {
  try {
    const supabase = await createClient();

    const userAgent = request?.headers.get("user-agent") ?? null;
    const forwardedFor = request?.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0].trim() ?? null;

    await supabase.from("user_activity_log").insert({
      user_id: userId,
      action,
      resource_type: resourceType ?? null,
      resource_id: resourceId ?? null,
      metadata: metadata ?? {},
      user_agent: userAgent,
      ip_address: ipAddress,
    } as never);
  } catch {
    // ログ記録失敗はサイレントに無視（本体処理を妨げない）
  }
}
