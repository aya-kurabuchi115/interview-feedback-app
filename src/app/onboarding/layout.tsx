import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "初期設定",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
