"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

/**
 * ルートレイアウトのエラーバウンダリ。
 * レイアウト自体がクラッシュした場合のフォールバックUI。
 *
 * 注意: global-error.tsx は独自の <html>/<body> を定義する必要がある。
 * Tailwind CSS やコンポーネントライブラリが読み込めない可能性があるため、
 * インラインスタイルのみを使用する。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorId, setErrorId] = useState("");

  useEffect(() => {
    // エラーIDを生成
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const id = `ERR-${timestamp}-${random}`.toUpperCase();
    setErrorId(id);

    // Sentry に報告
    Sentry.withScope((scope) => {
      scope.setTag("error_boundary", "global");
      scope.setTag("error_id", id);
      if (error.digest) {
        scope.setTag("error_digest", error.digest);
      }
      scope.setContext("error_details", {
        error_id: id,
        digest: error.digest,
        component: "GlobalErrorBoundary",
      });
      Sentry.captureException(error);
    });
  }, [error]);

  return (
    <html lang="ja">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            backgroundColor: "#fafafa",
            color: "#1a1a1a",
          }}
        >
          {/* アイコン */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
              fontSize: "2rem",
            }}
          >
            !
          </div>

          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "0.75rem",
            }}
          >
            予期しないエラーが発生しました
          </h1>

          <p
            style={{
              color: "#666",
              marginBottom: "0.5rem",
              textAlign: "center",
              maxWidth: "480px",
              lineHeight: "1.6",
            }}
          >
            申し訳ございません。ページの読み込み中に重大なエラーが発生しました。
            ページを再読み込みするか、ホームに戻ってください。
          </p>

          {/* エラーID */}
          {errorId && (
            <div
              style={{
                marginTop: "1rem",
                marginBottom: "1.5rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#f3f4f6",
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  marginRight: "0.5rem",
                }}
              >
                エラーID:
              </span>
              <code
                style={{
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  fontWeight: 600,
                }}
              >
                {errorId}
              </code>
            </div>
          )}

          {/* アクションボタン */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button
              onClick={reset}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              もう一度試す
            </button>
            <a
              href="/"
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#fff",
                color: "#000",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              ホームに戻る
            </a>
          </div>

          {/* サポート案内 */}
          <div
            style={{
              marginTop: "2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                color: "#9ca3af",
                marginBottom: "0.5rem",
              }}
            >
              問題が解決しない場合は、エラーIDを添えてお問い合わせください。
            </p>
            <a
              href="mailto:support@menpass.jp"
              style={{
                fontSize: "0.8rem",
                color: "#2563eb",
                textDecoration: "none",
              }}
            >
              support@menpass.jp
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
