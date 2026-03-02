/**
 * API レスポンス用キャッシュヘッダー定数
 *
 * Issue #227: APIレスポンスキャッシュ戦略
 *
 * セキュリティルール:
 * - ユーザー固有データは必ず `private` を使用（CDN キャッシュ不可）
 * - 公開データのみ `public` + `s-maxage` で CDN キャッシュ可
 * - 機密データ（エクスポート等）は `no-store` で一切キャッシュ不可
 */

/** private 短期キャッシュ（60秒 + SWR 120秒）— サブスクリプション情報、タグ一覧等 */
export const CACHE_PRIVATE_SHORT: HeadersInit = {
  "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
};

/** private 中期キャッシュ（5分 + SWR 10分）— プロフィール情報等 */
export const CACHE_PRIVATE_MEDIUM: HeadersInit = {
  "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
};

/** private キャッシュ禁止 — エクスポート（CSV/PDF）等の機密データ */
export const CACHE_PRIVATE_NO_STORE: HeadersInit = {
  "Cache-Control": "private, no-cache, no-store, must-revalidate",
};

/** public 中期キャッシュ（5分 + CDN 5分 + SWR 10分）— 共有結果等の公開データ */
export const CACHE_PUBLIC_MEDIUM: HeadersInit = {
  "Cache-Control":
    "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
};

/** public 長期キャッシュ（1時間 + CDN 1時間 + SWR 24時間）— 静的マスターデータ等 */
export const CACHE_PUBLIC_LONG: HeadersInit = {
  "Cache-Control":
    "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
};
