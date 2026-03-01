/**
 * 認証エラーコード → 日本語メッセージのマッピング
 *
 * XSS 対策: login ページでは error パラメータの値を直接表示せず、
 * このマッピングテーブルに存在するコードのみ対応するメッセージを返す。
 * 不明なコードは汎用メッセージに置換される。
 */

export interface AuthErrorInfo {
  message: string;
  action?: {
    label: string;
    href: string;
  };
}

export const AUTH_ERROR_MESSAGES: Record<string, AuthErrorInfo> = {
  auth_error: {
    message: "認証処理中にエラーが発生しました。もう一度お試しください。",
  },
  config_error: {
    message:
      "サーバーの設定に問題があります。管理者にお問い合わせください。",
  },
  email_expired: {
    message:
      "確認リンクの有効期限が切れています。再度サインアップしてください。",
    action: { label: "サインアップ", href: "/signup" },
  },
  code_used: {
    message: "このリンクは既に使用済みです。ログインしてください。",
  },
  recovery_expired: {
    message:
      "パスワードリセットリンクの有効期限が切れています。再度リセットをリクエストしてください。",
    action: { label: "パスワードリセット", href: "/reset-password" },
  },
  email_confirm_failed: {
    message: "メール確認に失敗しました。もう一度お試しください。",
    action: { label: "サインアップ", href: "/signup" },
  },
};

export const DEFAULT_ERROR: AuthErrorInfo = {
  message: "認証処理中にエラーが発生しました。もう一度お試しください。",
};

/**
 * エラーコードから AuthErrorInfo を取得する。
 * マッピングに存在しないコードは DEFAULT_ERROR を返す（XSS 対策）。
 */
export function getAuthErrorInfo(code: string | null): AuthErrorInfo | null {
  if (!code) return null;
  return AUTH_ERROR_MESSAGES[code] ?? DEFAULT_ERROR;
}
