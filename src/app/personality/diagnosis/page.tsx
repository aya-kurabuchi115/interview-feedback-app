import type { Metadata } from "next";
import dynamic from "next/dynamic";

// 診断クライアントは重いインタラクティブコンポーネントのため遅延ロード
const DiagnosisClient = dynamic(
  () => import("./diagnosis-client").then((mod) => mod.DiagnosisClient),
  {
    loading: () => (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "パーソナリティ診断テスト | InterviewCoach",
  description:
    "10問の簡単なテストであなたの16パーソナリティタイプを診断。面接での強み・弱みを把握して就活に活かそう。",
};

/**
 * パーソナリティ診断ページ (Server Component)
 * - 認証不要: 誰でも診断可能
 * - 結果表示時にログイン状態をチェック（Client側）
 */
export default function DiagnosisPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <DiagnosisClient />
    </div>
  );
}
