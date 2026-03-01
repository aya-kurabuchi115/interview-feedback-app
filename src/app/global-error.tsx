"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
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
            fontFamily: "sans-serif",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            予期しないエラーが発生しました
          </h1>
          <p style={{ marginTop: "1rem", color: "#666" }}>
            申し訳ございません。ページの読み込み中にエラーが発生しました。
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            もう一度試す
          </button>
        </div>
      </body>
    </html>
  );
}
