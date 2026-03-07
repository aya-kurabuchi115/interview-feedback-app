import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  PERSONALITY_DATA,
  PERSONALITY_TYPES,
  isValidPersonalityType,
  getGroupForType,
  type PersonalityType,
} from "@/lib/personality/types";
import { ShareButtons } from "@/components/personality/share-buttons";
import {
  CheckCircle2,
  AlertTriangle,
  Building2,
  Briefcase,
  MessageCircle,
  Lightbulb,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

/** ISR: 24時間ごとに再検証（静的コンテンツ） */
export const revalidate = 86400;

// ============================================================
// 静的パラメータ生成（全16タイプ）
// ============================================================

export function generateStaticParams() {
  return PERSONALITY_TYPES.map((type) => ({
    type: type.toLowerCase(),
  }));
}

// ============================================================
// メタデータ
// ============================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type: rawType } = await params;
  const typeUpper = rawType.toUpperCase();

  if (!isValidPersonalityType(typeUpper)) {
    return { title: "タイプが見つかりません" };
  }

  const p = PERSONALITY_DATA[typeUpper as PersonalityType];
  const title = `${p.type}（${p.name}）の面接戦略`;
  const description = `${p.type}タイプ「${p.name}」の特徴・面接の強み弱み・相性の良い業界を解説。${p.tagline}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Menpass`,
      description,
    },
  };
}

// ============================================================
// ページコンポーネント
// ============================================================

export default async function PersonalityTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: rawType } = await params;
  const typeUpper = rawType.toUpperCase();

  if (!isValidPersonalityType(typeUpper)) {
    notFound();
  }

  const p = PERSONALITY_DATA[typeUpper as PersonalityType];
  const group = getGroupForType(typeUpper as PersonalityType);

  // 同グループの他タイプ
  const otherTypes = group.types
    .filter((t) => t !== p.type)
    .map((t) => PERSONALITY_DATA[t]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくず */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/personality" className="hover:text-foreground transition-colors">
          <ArrowLeft className="mr-1 inline h-4 w-4" />
          16パーソナリティ一覧
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-foreground">{p.type}</span>
      </nav>

      {/* ヒーロー */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 md:p-12"
        style={{ backgroundColor: p.colorLight }}
      >
        <div className="flex flex-col items-center gap-8 md:flex-row">
          {/* キャラクター */}
          <div className="flex-shrink-0">
            <div
              className="flex h-48 w-48 items-center justify-center rounded-full shadow-lg md:h-56 md:w-56"
              style={{ backgroundColor: "white" }}
            >
              <Image
                src={`/images/personality/${p.type.toLowerCase()}.png`}
                alt={`${p.name}のキャラクター`}
                width={180}
                height={180}
                priority
              />
            </div>
          </div>

          {/* 基本情報 */}
          <div className="text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <span
                className="rounded-full px-4 py-1 text-sm font-bold text-white"
                style={{ backgroundColor: group.color }}
              >
                {group.name}
              </span>
              <span
                className="rounded-full px-4 py-1 text-sm font-bold text-white"
                style={{ backgroundColor: p.color }}
              >
                {p.type}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold md:text-4xl">
              {p.name}
              <span className="ml-2 text-lg font-normal text-muted-foreground">
                {p.nameEn}
              </span>
            </h1>

            <p className="mt-2 text-lg font-medium" style={{ color: p.color }}>
              {p.animalEmoji} {p.animal} — {p.tagline}
            </p>

            <p className="mt-4 max-w-lg text-muted-foreground leading-relaxed">
              {p.description}
            </p>

            {/* SNS シェア */}
            <div className="mt-6">
              <ShareButtons type={p.type} name={p.name} />
            </div>
          </div>
        </div>
      </div>

      {/* 詳細セクション */}
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {/* 性格の強み */}
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            性格の強み
          </h2>
          <ul className="mt-4 space-y-2">
            {p.strengths.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {s}
              </li>
            ))}
          </ul>
        </section>

        {/* 性格の弱み */}
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            気をつけたいポイント
          </h2>
          <ul className="mt-4 space-y-2">
            {p.weaknesses.map((w) => (
              <li key={w} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {w}
              </li>
            ))}
          </ul>
        </section>

        {/* 面接での強み */}
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            面接での強み
          </h2>
          <ul className="mt-4 space-y-2">
            {p.interviewStrengths.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {s}
              </li>
            ))}
          </ul>
        </section>

        {/* 面接での弱み */}
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            面接で気をつけること
          </h2>
          <ul className="mt-4 space-y-2">
            {p.interviewWeaknesses.map((w) => (
              <li key={w} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                {w}
              </li>
            ))}
          </ul>
        </section>

        {/* 相性の良い業界 */}
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Building2 className="h-5 w-5 text-purple-500" />
            相性の良い業界
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {p.compatibleIndustries.map((i) => (
              <span
                key={i}
                className="rounded-full border px-3 py-1 text-sm"
                style={{ borderColor: `${p.color}50`, color: p.color }}
              >
                {i}
              </span>
            ))}
          </div>
        </section>

        {/* 相性の良い企業文化 */}
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Briefcase className="h-5 w-5 text-indigo-500" />
            フィットする企業文化
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {p.compatibleCultures.map((c) => (
              <span
                key={c}
                className="rounded-full border px-3 py-1 text-sm"
                style={{ borderColor: `${p.color}50`, color: p.color }}
              >
                {c}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* 話し方の特徴 & アドバイス */}
      <div className="mt-8 rounded-2xl border-2 bg-card p-6 md:p-8" style={{ borderColor: `${p.color}30` }}>
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Lightbulb className="h-5 w-5" style={{ color: p.color }} />
          面接コーチからのアドバイス
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground">
              💬 あなたの話し方の特徴
            </h3>
            <p className="mt-1 text-sm leading-relaxed">{p.talkStyle}</p>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: `${p.color}10` }}
          >
            <h3 className="text-sm font-semibold" style={{ color: p.color }}>
              ✨ ワンポイントアドバイス
            </h3>
            <p className="mt-1 text-sm leading-relaxed">{p.adviceTip}</p>
          </div>
        </div>
      </div>

      {/* 同グループの他タイプ */}
      <div className="mt-12">
        <h2 className="text-xl font-bold">
          同じ「{group.name}」グループのタイプ
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {otherTypes.map((ot) => (
            <Link
              key={ot.type}
              href={`/personality/${ot.type.toLowerCase()}`}
              className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: ot.colorLight }}
              >
                <Image
                  src={`/images/personality/${ot.type.toLowerCase()}.png`}
                  alt={ot.name}
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <p className="text-sm font-bold">
                  {ot.type}（{ot.name}）
                </p>
                <p className="text-xs text-muted-foreground">{ot.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        className="mt-12 rounded-2xl p-8 text-center"
        style={{ backgroundColor: p.colorLight }}
      >
        <h2 className="text-2xl font-bold">
          {p.type}タイプの面接力を高めよう
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          あなたのタイプに合わせた AI フィードバックで、面接対策を始めませんか？
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center justify-center rounded-lg px-8 text-sm font-medium text-white shadow-lg transition-all hover:opacity-90"
            style={{ backgroundColor: p.color }}
          >
            無料で始める
          </Link>
          <Link
            href="/personality"
            className="inline-flex h-11 items-center justify-center rounded-lg border bg-background px-8 text-sm font-medium transition-colors hover:bg-accent"
          >
            全タイプを見る
          </Link>
        </div>
      </div>
    </div>
  );
}
