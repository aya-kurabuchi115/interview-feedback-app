import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "InterviewCoach - AI面接フィードバック";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 50%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 背景装飾 */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* ロゴ・サービス名 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            IC
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-1px",
            }}
          >
            InterviewCoach
          </span>
        </div>

        {/* キャッチコピー */}
        <div
          style={{
            fontSize: "28px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span style={{ marginBottom: "8px" }}>
            AI面接フィードバックで、就活を成功に導く
          </span>
        </div>

        {/* 特徴タグ */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
          }}
        >
          {["AI分析", "成長トラッキング", "パーソナライズ"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "10px 24px",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.3)",
                color: "#cbd5e1",
                fontSize: "18px",
                background: "rgba(255,255,255,0.05)",
                display: "flex",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* フッター */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            fontSize: "16px",
            color: "#64748b",
            display: "flex",
          }}
        >
          interview-ai-coach.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
