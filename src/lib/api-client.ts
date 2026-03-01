"use client";

/**
 * 401 レスポンス時にセッション切れを検知し、
 * ログインページへリダイレクトする共通 fetch ラッパー。
 *
 * 連続リダイレクト防止のため、一度リダイレクト処理が走ったら
 * 以降のリクエストではリダイレクトしない。
 */

let isRedirecting = false;

/**
 * セッション切れリダイレクトを実行する。
 * 連続呼び出しを防止し、1回のみリダイレクトする。
 */
function handleSessionExpired(): void {
  if (isRedirecting) return;
  isRedirecting = true;

  const currentPath = window.location.pathname + window.location.search;
  const loginUrl = `/login?expired=true&redirect=${encodeURIComponent(currentPath)}`;
  window.location.href = loginUrl;
}

/**
 * 認証付き fetch ラッパー。
 * 401 レスポンス時に自動的にセッション切れ処理を行う。
 *
 * @param input - fetch の第1引数（URL or Request）
 * @param init - fetch の第2引数（RequestInit）
 * @returns fetch の Response
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, init);

  if (response.status === 401) {
    handleSessionExpired();
  }

  return response;
}

/**
 * リダイレクト状態をリセットする（テスト用）。
 */
export function resetRedirectState(): void {
  isRedirecting = false;
}
