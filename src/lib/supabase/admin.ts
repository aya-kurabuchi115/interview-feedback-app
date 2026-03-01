import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY が設定されていません");
  return key;
}

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL が設定されていません");
  return url;
}

/**
 * Service role を使用する Supabase クライアント。
 * RLS をバイパスするため、Stripe Webhook などサーバーサイドの特権操作にのみ使用すること。
 */
export function createAdminClient() {
  return createClient<Database>(getSupabaseUrl(), getServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
