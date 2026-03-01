import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プロフィール設定 | InterviewCoach",
  description:
    "プロフィール情報を入力して、AIフィードバックをパーソナライズしましょう。",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
