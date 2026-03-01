import { NextResponse } from "next/server";

/**
 * 統一エラーレスポンスフォーマット
 * Issue #179: API エラーレスポンスの統一・ユーザーフレンドリー化
 *
 * 全 API Route で共通のエラー形式を使用する:
 *   { error: string, code: string, action?: string }
 *
 * - 400系: ユーザー側の入力に問題があるトーン
 * - 500系: サーバー側の問題であるトーン（「こちらの問題で」）
 * - 内部エラー (stack trace, DB error) は絶対にクライアントへ返さない
 */

/** ステータスコードごとのデフォルト action テキスト */
function getDefaultAction(status: number): string {
  if (status === 401) return "ログインし直してください";
  if (status === 403) return "アクセス権限を確認してください";
  if (status === 404) return "URLやIDが正しいか確認してください";
  if (status === 409) return "内容を確認して再度お試しください";
  if (status === 410) return "新しいリンクを発行してください";
  if (status === 429) return "しばらく待ってから再度お試しください";
  if (status >= 500)
    return "しばらくしてから再度お試しください。問題が続く場合はお問い合わせください";
  // 400 系のデフォルト
  return "入力内容を確認して再度お試しください";
}

/** ベースとなるエラーレスポンス生成関数 */
export function apiError(
  message: string,
  code: string,
  status: number,
  action?: string
) {
  return NextResponse.json(
    {
      error: message,
      code,
      action: action ?? getDefaultAction(status),
    },
    { status }
  );
}

// ---------------------------------------------------------------
// 400 系
// ---------------------------------------------------------------

/** 400 Bad Request */
export function badRequest(message: string, action?: string) {
  return apiError(message, "bad_request", 400, action);
}

/** 401 Unauthorized */
export function unauthorized(
  message = "認証が必要です。ログインしてからお試しください。"
) {
  return apiError(message, "unauthorized", 401);
}

/** 403 Forbidden */
export function forbidden(message: string, action?: string) {
  return apiError(message, "forbidden", 403, action);
}

/** 404 Not Found */
export function notFound(message: string) {
  return apiError(message, "not_found", 404);
}

/** 409 Conflict */
export function conflict(message: string) {
  return apiError(message, "conflict", 409);
}

/** 410 Gone */
export function gone(message: string) {
  return apiError(message, "gone", 410);
}

// ---------------------------------------------------------------
// 500 系
// ---------------------------------------------------------------

/** 500 Internal Server Error（クライアントにはユーザーフレンドリーなメッセージのみ返す） */
export function serverError(
  message = "こちらの問題でエラーが発生しました。しばらくしてから再度お試しください。"
) {
  return apiError(message, "server_error", 500);
}

/**
 * 500 Internal Server Error（ロギング付き）
 * - `internalError` はサーバーログにのみ出力し、クライアントには返さない
 */
export function serverErrorWithLog(
  userMessage: string,
  internalError: unknown,
  context?: string
) {
  const details =
    internalError instanceof Error ? internalError.message : String(internalError);
  console.error(
    `[serverError]${context ? ` ${context}:` : ""} ${details}`
  );
  return serverError(userMessage);
}
