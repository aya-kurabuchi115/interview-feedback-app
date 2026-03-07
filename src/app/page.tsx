/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Check,
  X,
  Shield,
  Clock,
  HelpCircle,
  Mic,
  Brain,
  BarChart3,
  MessageSquare,
  FileText,
  Users,
  Zap,
  TrendingUp,
  Target,
  ChevronDown,
} from "lucide-react";
import { CountUp } from "@/components/lp/count-up";
import { ScrollFadeIn, StaggerChildren, StaggerItem } from "@/components/scroll-fade-in";

const FaqSection = dynamic(
  () => import("@/components/lp/faq-section").then((mod) => mod.FaqSection),
  {
    loading: () => (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-14 w-full animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title:
    "Menpass - 面接の答え合わせ、始めよう。",
  description:
    "\"なんとなく不安\"を\"具体的な自信\"に。回答内容・話し方・論理構成をAIが分析し、改善アクションを提示。スコアで成長を実感できる就活支援アプリ。無料プランあり。",
  openGraph: {
    title:
      "Menpass - 面接の答え合わせ、始めよう。",
    description:
      "\"なんとなく不安\"を\"具体的な自信\"に。回答内容・話し方・論理構成をAIが分析し、改善アクションを提示。スコアで成長を実感できる就活支援アプリ。無料プランあり。",
    url: "https://menpass.jp",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Menpass - AI面接フィードバック",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Menpass",
      url: "https://menpass.jp",
      description:
        "Menpassは、面接練習の録音をAIが多角的に分析し、回答内容・話し方の両面から具体的なフィードバックを提供する就活支援アプリです。",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: [
        {
          "@type": "Offer",
          name: "無料プラン",
          price: "0",
          priceCurrency: "JPY",
        },
        {
          "@type": "Offer",
          name: "Pro プラン",
          price: "980",
          priceCurrency: "JPY",
        },
        {
          "@type": "Offer",
          name: "Premium プラン",
          price: "1980",
          priceCurrency: "JPY",
        },
      ],
    },
  ],
};

// ============================================================
// カラーパレット（ネイビー × オレンジ）
// ============================================================
const C = {
  navy: "var(--brand-navy)",
  navyDark: "var(--brand-navy-dark)",
  orange: "var(--brand-orange)",
  orangeDark: "#EA580C",
  sectionBg: "var(--lp-section-bg)",
  navyLight: "rgba(30, 58, 95, 0.06)",
} as const;

export default function Home() {
  return (
    <div className="flex flex-col font-sans text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden">
        {/* 背景画像: 面接風景（青系ブラー） */}
        <img
          src="/images/hero-bg.png"
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-sm"
        />
        {/* ネイビー系オーバーレイ */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(17, 34, 64, 0.75)' }} />
        {/* 人物画像: 右側に大きく（背景の上、オーバーレイの上） */}
        <img
          src="/images/hero-person.png"
          alt="面接に自信を持つビジネスパーソン"
          className="pointer-events-none absolute bottom-0 right-[5%] z-[1] hidden h-[105%] w-auto max-w-none object-cover object-top lg:block xl:right-[8%]"
        />

        <div className="relative z-10 mx-auto max-w-screen-2xl px-6 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20 xl:px-20">
          <div className="max-w-[640px]">
            {/* メインコピー */}
            <p className="text-lg font-medium tracking-wide text-gray-300 sm:text-xl">
              声に出して練習する、AI面接コーチ
            </p>
            <h1 className="mt-4 font-black leading-[1.05] text-white">
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.5rem]">
                面接の
              </span>
              <span
                className="mt-2 inline-block px-3 py-1 text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.5rem]"
                style={{ backgroundColor: C.orange }}
              >
                答え合わせ
              </span>
              <span className="mt-1 block text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.5rem]">
                始めよう。
              </span>
            </h1>

            {/* サブコピー */}
            <p className="mt-8 text-base leading-relaxed text-gray-300 sm:text-lg lg:text-xl">
              実際に声に出して面接を練習。AIが回答内容・話し方・
              <br className="hidden sm:inline" />
              論理構成を分析し、具体的な改善アクションを提示します。
            </p>

            {/* CTA */}
            <div className="mt-10">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-3 rounded-full px-10 py-5 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
                style={{ backgroundColor: C.orange }}
              >
                無料で面接練習を始める
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <p className="mt-3 text-sm text-gray-400">
                30秒で登録完了 / クレジットカード不要
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========== NUMBERS ========== */}
      <section
        className="border-y border-border px-4 py-14 sm:py-16"
      >
        <div className="mx-auto grid max-w-[1120px] grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { end: 92, suffix: "%", label: "利用者満足度" },
            { end: 3, suffix: "倍", label: "練習効率の向上" },
            { end: 90, suffix: "+", label: "面接質問を収録" },
            { end: 30, suffix: "秒", label: "で登録完了" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p
                className="text-3xl font-bold sm:text-4xl"
                style={{ color: C.navy }}
              >
                <CountUp end={item.end} suffix={item.suffix} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== KEY MESSAGE (Speak風) ========== */}
      <section className="bg-background px-4 py-24 sm:py-32">
        <ScrollFadeIn>
          <div className="mx-auto max-w-[900px] text-center">
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              面接を突破するには
              <br />
              <span style={{ color: C.orange }}>声に出して練習すること</span>が
              <br />
              重要です
            </h2>
            <p className="mx-auto mt-8 max-w-[640px] text-base leading-relaxed text-muted-foreground sm:text-lg">
              面接対策本を読むだけでは本番で力を発揮できません。
              Menpass は、実際に声に出して回答を練習し、
              AIからリアルタイムでフィードバックを受けることで
              面接力を確実に伸ばします。
            </p>
          </div>
        </ScrollFadeIn>
      </section>

      {/* ========== PAIN → SOLUTION ========== */}
      <section className="px-4 py-20 sm:py-28" style={{ backgroundColor: C.sectionBg }}>
        <div className="mx-auto max-w-[1120px]">
          <ScrollFadeIn>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              こんな悩み、ありませんか？
            </h2>
          </ScrollFadeIn>
          <StaggerChildren className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8" stagger={0.15}>
            {[
              {
                icon: <Users className="h-8 w-8" />,
                title: "練習相手がいない",
                desc: "キャリアセンターは予約が取れない。友人相手だと恥ずかしい。",
                solution: "AI面接官が24時間いつでも対応",
              },
              {
                icon: <HelpCircle className="h-8 w-8" />,
                title: "何がダメか分からない",
                desc: "面接に落ちても理由が分からない。どう直せばいいのか不明。",
                solution: "AIが具体的な改善アクションを提示",
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "上達を感じられない",
                desc: "やみくもに練習しても効果が見えず、不安が増すばかり。",
                solution: "スコア推移で成長を可視化",
              },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <div className="h-full rounded-xl border border-border bg-background p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md lg:p-8">
                  <div
                    className="mb-5 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${C.navy}10`, color: C.navy }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold" style={{ color: C.orange }}>
                    <Check className="h-4 w-4" />
                    {item.solution}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ========== Menpass でできること (Speak風 機能カード) ========== */}
      <section className="bg-background px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-[1120px]">
          <ScrollFadeIn>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Menpass でできること
            </h2>
            <p className="mx-auto mt-4 max-w-[560px] text-center text-lg text-muted-foreground">
              24時間いつでも、あなただけのAI面接コーチが対応します。
            </p>
          </ScrollFadeIn>
          <StaggerChildren className="mt-14 grid gap-6 md:grid-cols-3" stagger={0.15}>
            {[
              {
                emoji: "🎤",
                title: "AI模擬面接",
                desc: "実際に声に出して回答。AI面接官が本番さながらの質問を投げかけ、リアルタイムで深掘りします。",
                bg: "bg-blue-50 dark:bg-blue-950/30",
              },
              {
                emoji: "📊",
                title: "多角的フィードバック",
                desc: "回答内容・論理構成・話し方をAIが分析。具体的な改善アクションで、何をどう直せばいいかが明確に。",
                bg: "bg-orange-50 dark:bg-orange-950/30",
              },
              {
                emoji: "📈",
                title: "成長の可視化",
                desc: "練習ごとのスコア推移を記録。フィラー回数や回答時間の変化をグラフで確認でき、成長を実感できます。",
                bg: "bg-green-50 dark:bg-green-950/30",
              },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <div className={`rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${item.bg}`}>
                  <span className="text-4xl">{item.emoji}</span>
                  <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ========== 3 REASONS ========== */}
      <section className="bg-background px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-[1120px]">
          <ScrollFadeIn>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              選ばれる3つの理由
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground">
              面接対策に必要なすべてが、ここに。
            </p>
          </ScrollFadeIn>
          <StaggerChildren className="mt-16 grid gap-8 sm:grid-cols-3" stagger={0.15}>
            {[
              {
                num: "01",
                icon: <Brain className="h-6 w-6" />,
                title: "録音するだけ。あとはAIにおまかせ。",
                desc: "面接練習を録音するだけで、回答の論理性・具体性から、話すスピード・フィラーワードまで多角的に分析。",
              },
              {
                num: "02",
                icon: <BarChart3 className="h-6 w-6" />,
                title: "スコアで見える、自分の成長。",
                desc: "面接ごとにスコアを算出し、推移をグラフで可視化。どこを重点的に練習すべきか、一目でわかります。",
              },
              {
                num: "03",
                icon: <Target className="h-6 w-6" />,
                title: "パーソナリティに合った面接戦略。",
                desc: "16パーソナリティ診断をもとに、あなたの強み・弱みに合った回答スタイルを提案。",
              },
            ].map((item) => (
              <StaggerItem key={item.num}>
                <div className="relative overflow-hidden rounded-xl border-2 border-border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <span
                    className="text-5xl font-black"
                    style={{ color: `${C.navy}10` }}
                  >
                    {item.num}
                  </span>
                  <div
                    className="mt-2 flex h-12 w-12 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: C.navy }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="mt-3 text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ========== FEATURE GRID ========== */}
      <section
        className="px-4 py-20 sm:py-28"
        style={{ backgroundColor: C.sectionBg }}
      >
        <div className="mx-auto max-w-[1120px]">
          <ScrollFadeIn>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              充実の機能
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground">
              面接準備から本番対策まで、トータルサポート。
            </p>
          </ScrollFadeIn>
          <StaggerChildren className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {[
              {
                icon: <Mic className="h-5 w-5" />,
                title: "録音 & 文字起こし",
                desc: "ブラウザで録音、自動で文字起こし。面接練習がそのまま分析対象に。",
              },
              {
                icon: <MessageSquare className="h-5 w-5" />,
                title: "AI模擬面接",
                desc: "AI面接官がリアルタイムで質問。本番さながらの練習が24時間可能。",
              },
              {
                icon: <BarChart3 className="h-5 w-5" />,
                title: "スコア & 成長記録",
                desc: "回答力をスコア化し、成長をグラフで可視化。弱点を効率的に克服。",
              },
              {
                icon: <FileText className="h-5 w-5" />,
                title: "ES添削",
                desc: "エントリーシートをAIが添削。構成・表現・具体性の観点でアドバイス。",
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: "16パーソナリティ診断",
                desc: "性格タイプに基づいた面接戦略を提案。自分らしさを活かした受け答えに。",
              },
              {
                icon: <Zap className="h-5 w-5" />,
                title: "フィラー分析",
                desc: "「えーと」「あの」の頻度を検出。話し方のクセを数値で把握し改善。",
              },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <div
                  className="group flex items-start gap-4 rounded-xl border border-border bg-background p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: C.navy }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="bg-background px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-[1120px]">
          <ScrollFadeIn>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              はじめ方はかんたん
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground">
              登録から最初のフィードバックまで、たった5分。
            </p>
          </ScrollFadeIn>
          <StaggerChildren className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4" stagger={0.12}>
            {[
              {
                step: 1,
                icon: <Users className="h-6 w-6" />,
                title: "無料登録",
                desc: "メールアドレスだけで30秒で完了。カード不要。",
              },
              {
                step: 2,
                icon: <Mic className="h-6 w-6" />,
                title: "面接練習を録音",
                desc: "ブラウザ上でそのまま録音。AI模擬面接も利用可能。",
              },
              {
                step: 3,
                icon: <Brain className="h-6 w-6" />,
                title: "AIが多角的に分析",
                desc: "論理性・具体性・話し方まで、最新AIが即座に分析。",
              },
              {
                step: 4,
                icon: <TrendingUp className="h-6 w-6" />,
                title: "スコアで成長を実感",
                desc: "改善を重ねるたびにスコアが上がる。成長を実感。",
              },
            ].map((item, i) => (
              <StaggerItem key={item.step}>
                <div
                  className="relative flex flex-col items-center text-center"
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
                    style={{ backgroundColor: C.navy }}
                  >
                    {item.step}
                  </div>
                  <div
                    className="mt-4 flex h-12 w-12 items-center justify-center"
                    style={{ color: C.navy }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                  {i < 3 && (
                    <div className="absolute -right-4 top-8 hidden text-muted-foreground/50 lg:block">
                      <ArrowRight className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section
        className="px-4 py-20 sm:py-28"
        style={{ backgroundColor: C.sectionBg }}
      >
        <div className="mx-auto max-w-[1120px]">
          <ScrollFadeIn>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              多くの就活生が
              <br className="sm:hidden" />
              Menpass で自信をつけています
            </h2>
          </ScrollFadeIn>

          {/* 実績数値 */}
          <div className="mt-10 flex items-center justify-center gap-8 sm:gap-16">
            <div className="text-center">
              <p className="text-4xl font-black sm:text-5xl" style={{ color: C.navy }}>4.8</p>
              <p className="mt-1 text-sm text-muted-foreground">平均評価</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-4xl font-black sm:text-5xl" style={{ color: C.navy }}>92<span className="text-3xl">%</span></p>
              <p className="mt-1 text-sm text-muted-foreground">利用者満足度</p>
            </div>
          </div>

          {/* レビューカード */}
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              {
                name: "T.S さん",
                label: "26卒 / 文系",
                title: "何を直せばいいか明確になった",
                text: "一人で面接練習しても、何がダメなのか分からなかった。Menpass を使い始めてから、具体的に何を直せばいいかが明確になって、面接への自信がつきました。",
                date: "2026年2月",
              },
              {
                name: "M.K さん",
                label: "27卒 / 理系",
                title: "深夜でも練習できるのが最高",
                text: "模擬面接機能が特に良い。深夜でもAIが面接官をしてくれるので、バイト後でも練習できます。スコアが上がっていくのを見ると、モチベーションも上がります。",
                date: "2026年2月",
              },
              {
                name: "A.Y さん",
                label: "26卒 / 文系",
                title: "面接官の反応が明らかに変わった",
                text: "フィラー分析で、自分が思った以上に「えーと」を連発していたことに気づけました。意識して直したら、面接官の反応が明らかに変わりました。",
                date: "2026年1月",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-border bg-background p-6 shadow-sm"
              >
                {/* 星評価 */}
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{item.name} {item.date}</p>

                {/* レビュー本文 */}
                <p className="mt-4 text-sm font-bold">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section className="bg-background px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            あなたに合ったプランを
          </h2>
          <p className="mt-4 text-center text-lg text-muted-foreground">
            無料プランだけでも、面接力は変わります。
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {/* Free */}
            <div className="flex flex-col rounded-xl border-2 border-border bg-background p-6 lg:p-8">
              <h3 className="text-2xl font-bold">無料プラン</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                まずは試してみたい方へ
              </p>
              <div className="mt-4">
                <span className="text-4xl font-bold">¥0</span>
                <span className="text-muted-foreground">/月</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {[
                  { text: "月3回まで面接分析", ok: true },
                  { text: "AIフィードバック", ok: true },
                  { text: "スコア表示", ok: true },
                  { text: "成長トラッキング", ok: false },
                  { text: "模擬面接・ES添削", ok: false },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3">
                    {item.ok ? (
                      <Check
                        className="h-5 w-5 shrink-0"
                        style={{ color: C.navy }}
                      />
                    ) : (
                      <X className="h-5 w-5 shrink-0 text-muted-foreground/50" />
                    )}
                    <span
                      className={`text-sm ${item.ok ? "" : "text-muted-foreground/70"}`}
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-6 block rounded-lg border-2 px-6 py-3 text-center font-semibold transition-colors hover:bg-muted"
                style={{ borderColor: C.navy, color: C.navy }}
              >
                無料ではじめる
              </Link>
            </div>
            {/* Pro */}
            <div
              className="relative flex flex-col rounded-xl border-2 p-6 shadow-lg lg:p-8"
              style={{ borderColor: C.navy }}
            >
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-semibold text-white"
                style={{ backgroundColor: C.orange }}
              >
                おすすめ
              </div>
              <h3 className="text-2xl font-bold">Pro プラン</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                本選考に向けて本気で準備したい方へ
              </p>
              <div className="mt-4">
                <span className="text-4xl font-bold">¥980</span>
                <span className="text-muted-foreground">/月</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {[
                  "月30回の面接分析",
                  "成長トラッキング",
                  "模擬面接（AI面接官）",
                  "ES添削",
                  "パーソナリティ連動分析",
                ].map((text) => (
                  <li key={text} className="flex items-center gap-3">
                    <Check
                      className="h-5 w-5 shrink-0"
                      style={{ color: C.navy }}
                    />
                    <span className="text-sm">{text}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="mt-6 flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-center font-semibold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: C.navy }}
              >
                Pro ではじめる
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              href="/pricing"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Premium プランなど、すべてのプランを比較する
            </Link>
          </p>
        </div>
      </section>

      {/* ========== TRUST ========== */}
      <section
        className="px-4 py-20 sm:py-28"
        style={{ backgroundColor: C.sectionBg }}
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            安心してお使いいただくために
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: <Shield className="h-7 w-7" />,
                title: "データの安全性",
                desc: "録音データは暗号化保存。第三者への提供は一切ありません。",
              },
              {
                icon: <Clock className="h-7 w-7" />,
                title: "いつでも解約OK",
                desc: "有料プランはいつでも解約可能。解約後も当月末まで利用できます。",
              },
              {
                icon: <HelpCircle className="h-7 w-7" />,
                title: "サポート対応",
                desc: "ご不明点はメールサポートで対応。使い方のご相談もお気軽に。",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: C.navy }}
                >
                  {item.icon}
                </div>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section className="bg-background px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            よくある質問
          </h2>
          <p className="mt-4 text-center text-lg text-muted-foreground">
            気になることがあれば、まずはこちらをご確認ください。
          </p>
          <div className="mt-12">
            <FaqSection />
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        {/* 背景画像（ブラー + ネイビーオーバーレイ） */}
        <img
          src="/images/cta-bg.png"
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-sm"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(17, 34, 64, 0.75)' }} />
        <ScrollFadeIn className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            さっそく無料体験を始めましょう
          </h2>
          <p className="mt-4 text-lg text-blue-200">
            今日の練習が、明日の内定につながる。
            <br className="hidden sm:block" />
            まずは無料プランで、あなたの面接力を確かめてみてください。
          </p>
          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-block rounded-lg px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: C.orange }}
            >
              3分で無料体験
              <ArrowRight className="ml-2 inline h-5 w-5" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-blue-300">
            クレジットカード不要・いつでも解約OK
          </p>
        </div>
        </ScrollFadeIn>
      </section>

      <div className="h-16 md:hidden" />
    </div>
  );
}
