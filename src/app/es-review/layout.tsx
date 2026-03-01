import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ES添削",
  description:
    "AIがエントリーシート（ES）の回答を添削。構成、具体性、説得力、文法の4つの観点で詳細なフィードバックと改善提案を提供します。",
};

export default function ESReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
