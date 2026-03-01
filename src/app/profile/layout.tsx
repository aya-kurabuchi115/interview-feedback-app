import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プロフィール設定",
  description:
    "プロフィール情報を入力して、AIフィードバックをパーソナライズしましょう。",
  robots: { index: false, follow: false },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
