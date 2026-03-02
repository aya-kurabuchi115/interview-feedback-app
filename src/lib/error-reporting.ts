import * as Sentry from "@sentry/nextjs";

/**
 * エラー報告ヘルパー
 *
 * Issue #219: Sentry 統合強化
 * - カスタムコンテキスト（ユーザーID・プラン・機能領域）の付与
 * - 全 API ルートのエラーを統一的に Sentry に報告
 * - 一貫したエラーID生成
 */

// ============================================================
// 機能領域タグ
// ============================================================

export type FeatureArea =
  | "interview"
  | "analyze"
  | "es-review"
  | "mock-interview"
  | "personality"
  | "share"
  | "subscription"
  | "stripe"
  | "auth"
  | "profile"
  | "onboarding"
  | "export"
  | "tags"
  | "questions";

// ============================================================
// エラーID生成
// ============================================================

/**
 * 一意のエラーIDを生成する。
 * ユーザーに表示してサポート問い合わせ時に利用する。
 */
export function generateErrorId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ERR-${timestamp}-${random}`.toUpperCase();
}

// ============================================================
// Sentry ユーザーコンテキスト設定
// ============================================================

/**
 * Sentry にユーザーコンテキストを設定する。
 * 認証後に呼び出し、以降のイベントにユーザー情報を付与する。
 *
 * PII（メール等）は送信しない（sentry.*.config.ts の beforeSend で除去済み）。
 */
export function setSentryUserContext(params: {
  userId: string;
  plan?: string;
}): void {
  Sentry.setUser({ id: params.userId });
  if (params.plan) {
    Sentry.setTag("user_plan", params.plan);
  }
}

/**
 * Sentry のユーザーコンテキストをクリアする（ログアウト時）。
 */
export function clearSentryUserContext(): void {
  Sentry.setUser(null);
}

// ============================================================
// API エラー報告
// ============================================================

export interface ReportApiErrorOptions {
  /** API ルートのパス (例: "/api/analyze") */
  apiRoute: string;
  /** 機能領域タグ */
  featureArea: FeatureArea;
  /** ユーザーID（認証済みの場合） */
  userId?: string;
  /** ユーザーのプラン */
  plan?: string;
  /** 追加のコンテキスト情報 */
  extra?: Record<string, unknown>;
}

/**
 * API ルートのエラーを Sentry に統一的に報告する。
 *
 * 使い方:
 * ```ts
 * catch (error) {
 *   const errorId = reportApiError(error, {
 *     apiRoute: "/api/analyze",
 *     featureArea: "analyze",
 *     userId: user?.id,
 *     plan: subscription.plan,
 *     extra: { interview_id: interviewId },
 *   });
 *   return serverError(`エラーが発生しました（ID: ${errorId}）`);
 * }
 * ```
 *
 * @returns 生成されたエラーID
 */
export function reportApiError(
  error: unknown,
  options: ReportApiErrorOptions
): string {
  const errorId = generateErrorId();
  const errorMessage =
    error instanceof Error ? error.message : String(error);

  // コンソールにもログを出力（開発時のデバッグ用）
  console.error(
    `[${options.apiRoute}] Error (${errorId}):`,
    errorMessage
  );

  Sentry.withScope((scope) => {
    // タグ
    scope.setTag("api_route", options.apiRoute);
    scope.setTag("feature_area", options.featureArea);
    scope.setTag("error_id", errorId);

    if (options.plan) {
      scope.setTag("user_plan", options.plan);
    }

    // ユーザーコンテキスト
    if (options.userId) {
      scope.setUser({ id: options.userId });
    }

    // 追加情報
    scope.setContext("error_details", {
      error_id: errorId,
      api_route: options.apiRoute,
      feature_area: options.featureArea,
      ...options.extra,
    });

    // エラーを報告
    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureException(new Error(errorMessage));
    }
  });

  return errorId;
}

// ============================================================
// クライアントサイドのエラー報告
// ============================================================

export interface ReportClientErrorOptions {
  /** 機能領域タグ */
  featureArea: FeatureArea;
  /** コンポーネント名 */
  componentName?: string;
  /** 追加のコンテキスト情報 */
  extra?: Record<string, unknown>;
}

/**
 * クライアントサイドのエラーを Sentry に報告する。
 * error.tsx 等のエラーバウンダリで使用する。
 *
 * @returns 生成されたエラーID
 */
export function reportClientError(
  error: Error & { digest?: string },
  options: ReportClientErrorOptions
): string {
  const errorId = generateErrorId();

  Sentry.withScope((scope) => {
    scope.setTag("feature_area", options.featureArea);
    scope.setTag("error_id", errorId);
    scope.setTag("error_boundary", "true");

    if (options.componentName) {
      scope.setTag("component", options.componentName);
    }

    if (error.digest) {
      scope.setTag("error_digest", error.digest);
    }

    scope.setContext("error_details", {
      error_id: errorId,
      digest: error.digest,
      ...options.extra,
    });

    Sentry.captureException(error);
  });

  return errorId;
}
