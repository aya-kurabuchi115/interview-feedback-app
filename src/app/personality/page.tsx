import type { Metadata } from "next";
import Link from "next/link";
import { PersonalityCard } from "@/components/personality/personality-card";
import { PersonalityHero } from "@/components/personality/personality-hero";
import {
  PERSONALITY_DATA,
  PERSONALITY_GROUPS,
  type PersonalityGroup,
} from "@/lib/personality/types";

/** ISR: 24時間ごとに再検証（静的コンテンツ） */
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "16パーソナリティ診断",
  description:
    "16パーソナリティタイプから自分の面接スタイルを知ろう！各タイプの特徴・面接での強み弱み・相性の良い業界を解説。就活に役立つ自己分析ツール。",
  openGraph: {
    title: "16パーソナリティ診断 | InterviewCoach",
    description:
      "16パーソナリティタイプから自分の面接スタイルを知ろう！各タイプの特徴と面接戦略を解説。",
  },
};

const GROUP_ORDER: PersonalityGroup[] = [
  "analyst",
  "diplomat",
  "sentinel",
  "explorer",
];

export default function PersonalityPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* ヒーローセクション（診断済みなら結果表示） */}
      <PersonalityHero />

      {/* グループ別タイプ一覧 */}
      <div className="mt-16 space-y-16">
        {GROUP_ORDER.map((groupId) => {
          const group = PERSONALITY_GROUPS[groupId];
          const types = group.types.map((t) => PERSONALITY_DATA[t]);

          return (
            <section key={groupId} id={groupId}>
              {/* グループヘッダー */}
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="h-1 w-8 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <div>
                  <h2 className="text-xl font-bold" style={{ color: group.color }}>
                    {group.name}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {group.nameEn}
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                </div>
              </div>

              {/* タイプカード */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {types.map((p) => (
                  <PersonalityCard key={p.type} personality={p} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA セクション */}
      <div className="mt-20 rounded-2xl bg-gradient-to-r from-purple-50 via-green-50 to-blue-50 p-8 text-center dark:from-purple-950/20 dark:via-green-950/20 dark:to-blue-950/20">
        <h2 className="text-2xl font-bold">
          自分のタイプを知ろう
        </h2>
        <p className="mt-2 text-muted-foreground">
          性格タイプに合わせた面接アドバイスで、自分らしい面接対策を始めよう
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/personality/diagnosis"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            診断する
          </Link>
        </div>
      </div>
    </div>
  );
}
