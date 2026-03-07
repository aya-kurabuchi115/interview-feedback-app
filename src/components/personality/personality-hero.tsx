"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PERSONALITY_DATA,
  isValidPersonalityType,
  getGroupForType,
  type PersonalityType,
} from "@/lib/personality/types";

export function PersonalityHero() {
  const [personalityType, setPersonalityType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const { profile } = await res.json();
        if (profile?.personality_type && isValidPersonalityType(profile.personality_type)) {
          setPersonalityType(profile.personality_type.toUpperCase());
        }
      } catch {
        // 未ログインなど — 通常の表示にフォールバック
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 診断済みの場合
  if (!loading && personalityType && isValidPersonalityType(personalityType)) {
    const pInfo = PERSONALITY_DATA[personalityType as PersonalityType];
    const gInfo = getGroupForType(personalityType as PersonalityType);

    return (
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          🧠 16パーソナリティ診断
        </h1>

        <div className="mt-6 inline-flex flex-col items-center rounded-2xl border p-6" style={{ borderColor: `${pInfo.color}40`, backgroundColor: pInfo.colorLight }}>
          <p className="text-sm text-muted-foreground">あなたの診断結果</p>
          <div className="mt-2 text-5xl">{pInfo.animalEmoji}</div>
          <div className="mt-3 flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-sm font-bold text-white"
              style={{ backgroundColor: pInfo.color }}
            >
              {pInfo.type}
            </span>
            <span className="text-lg font-bold">{pInfo.name}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {gInfo.name}グループ / {pInfo.tagline}
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/personality/${personalityType.toLowerCase()}`}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            詳しい結果を見る
          </Link>
          <Link
            href="/personality/diagnosis"
            className="inline-flex h-10 items-center justify-center rounded-lg border bg-background px-6 text-sm font-medium transition-colors hover:bg-accent"
          >
            もう一度診断する
          </Link>
        </div>
      </div>
    );
  }

  // 未診断 or 未ログインの場合（既存と同じ）
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        🧠 16パーソナリティ診断
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        あなたの性格タイプを知って、面接力をアップしよう！
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        16タイプそれぞれの面接での強み・弱みと、ピッタリの業界を紹介します
      </p>

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/personality/diagnosis"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          無料で診断してみる
        </Link>
        <span className="text-xs text-muted-foreground">
          ※ 詳しい診断にはアカウント登録が必要です
        </span>
      </div>

      {/* ローディング中は何も表示しない（チラつき防止） */}
      {loading && <div className="mt-6 h-10" />}
    </div>
  );
}
