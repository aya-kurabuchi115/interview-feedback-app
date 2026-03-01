/**
 * 共有ボタン — Client Component
 * Issue #78: 面接結果の共有機能
 *
 * - 「共有リンクを作成」ボタン
 * - リンク作成後: コピーボタン + X/Twitter・LINE 共有ボタン
 * - 共有リンク無効化ボタン
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

// ============================================================
// 型定義
// ============================================================

interface ShareButtonProps {
  interviewId: string;
}

interface ShareState {
  shareToken: string | null;
  expiresAt: string | null;
  loading: boolean;
  error: string | null;
  copied: boolean;
  revoking: boolean;
}

// ============================================================
// コンポーネント
// ============================================================

export function ShareButton({ interviewId }: ShareButtonProps) {
  const [state, setState] = useState<ShareState>({
    shareToken: null,
    expiresAt: null,
    loading: false,
    error: null,
    copied: false,
    revoking: false,
  });

  // コピー済み状態を一定時間後にリセット
  useEffect(() => {
    if (state.copied) {
      const timer = setTimeout(
        () => setState((prev) => ({ ...prev, copied: false })),
        2000
      );
      return () => clearTimeout(timer);
    }
  }, [state.copied]);

  // エラー表示を一定時間後にリセット
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(
        () => setState((prev) => ({ ...prev, error: null })),
        5000
      );
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  /** 共有リンクを作成 */
  const handleCreateShare = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "共有リンクの作成に失敗しました");
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        shareToken: data.shareToken,
        expiresAt: data.expiresAt,
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : "共有リンクの作成に失敗しました",
      }));
    }
  }, [interviewId]);

  /** クリップボードにコピー */
  const handleCopy = useCallback(async () => {
    if (!state.shareToken) return;

    const shareUrl = `${window.location.origin}/share/${state.shareToken}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setState((prev) => ({ ...prev, copied: true }));
    } catch {
      // フォールバック: textarea を使ったコピー
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setState((prev) => ({ ...prev, copied: true }));
    }
  }, [state.shareToken]);

  /** X/Twitter で共有 */
  const handleTwitterShare = useCallback(() => {
    if (!state.shareToken) return;

    const shareUrl = `${window.location.origin}/share/${state.shareToken}`;
    const text = "面接練習の結果をシェア！InterviewCoach で AI 面接対策";
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  }, [state.shareToken]);

  /** LINE で共有 */
  const handleLineShare = useCallback(() => {
    if (!state.shareToken) return;

    const shareUrl = `${window.location.origin}/share/${state.shareToken}`;
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(lineUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  }, [state.shareToken]);

  /** 共有リンクを無効化 */
  const handleRevoke = useCallback(async () => {
    if (!state.shareToken) return;

    setState((prev) => ({ ...prev, revoking: true, error: null }));

    try {
      const response = await fetch("/api/share/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareToken: state.shareToken }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "共有リンクの無効化に失敗しました");
      }

      setState((prev) => ({
        ...prev,
        shareToken: null,
        expiresAt: null,
        revoking: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        revoking: false,
        error:
          err instanceof Error
            ? err.message
            : "共有リンクの無効化に失敗しました",
      }));
    }
  }, [state.shareToken]);

  // ============================================================
  // リンク未作成状態
  // ============================================================

  if (!state.shareToken) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateShare}
          disabled={state.loading}
        >
          {state.loading ? (
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          )}
          共有リンクを作成
        </Button>
        {state.error && (
          <div className="absolute top-full left-0 z-50 mt-2 w-max max-w-xs rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {state.error}
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // リンク作成済み状態
  // ============================================================

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/share/${state.shareToken}`;

  return (
    <div className="relative">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
        {/* 共有 URL 表示 */}
        <div className="flex items-center gap-2">
          <div className="flex-1 truncate rounded-md border bg-muted px-3 py-2 text-xs text-muted-foreground">
            {shareUrl}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="shrink-0"
          >
            {state.copied ? (
              <>
                <svg
                  className="mr-1 h-4 w-4 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                コピー済み
              </>
            ) : (
              <>
                <svg
                  className="mr-1 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                コピー
              </>
            )}
          </Button>
        </div>

        {/* SNS 共有ボタン */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTwitterShare}
            className="flex-1"
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X で共有
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLineShare}
            className="flex-1"
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            LINE で共有
          </Button>
        </div>

        {/* 有効期限と無効化ボタン */}
        <div className="flex items-center justify-between border-t pt-3">
          {state.expiresAt && (
            <p className="text-xs text-muted-foreground">
              有効期限:{" "}
              {new Date(state.expiresAt).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRevoke}
            disabled={state.revoking}
            className="ml-auto text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
          >
            {state.revoking ? (
              <svg
                className="mr-1 h-3 w-3 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="mr-1 h-3 w-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            )}
            共有を取り消す
          </Button>
        </div>
      </div>

      {state.error && (
        <div className="absolute top-full left-0 z-50 mt-2 w-max max-w-xs rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {state.error}
        </div>
      )}
    </div>
  );
}
