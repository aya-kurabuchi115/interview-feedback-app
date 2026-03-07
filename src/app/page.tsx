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
    "InterviewCoach - 面接の答え合わせ、始めよう。",
  description:
    "\"なんとなく不安\"を\"具体的な自信\"に。回答内容・話し方・論理構成をAIが分析し、改善アクションを提示。スコアで成長を実感できる就活支援アプリ。無料プランあり。",
  openGraph: {
    title:
      "InterviewCoach - 面接の答え合わせ、始めよう。",
    description:
      "\"なんとなく不安\"を\"具体的な自信\"に。回答内容・話し方・論理構成をAIが分析し、改善アクションを提示。スコアで成長を実感できる就活支援アプリ。無料プランあり。",
    url: "https://interview-ai-coach.com",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "InterviewCoach - AI面接フィードバック",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "InterviewCoach",
      url: "https://interview-ai-coach.com",
      description:
        "InterviewCoachは、面接練習の録音をAIが多角的に分析し、回答内容・話し方の両面から具体的なフィードバックを提供する就活支援アプリです。",
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
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${C.navyDark} 0%, ${C.navy} 50%, #2d5a8e 100%)` }}
      >
        <div className="relative mx-auto flex max-w-[1120px] items-center px-4 py-20 sm:px-6 sm:py-24 lg:px-12 lg:py-28">
          {/* テキスト: 左 60% */}
          <div className="relative z-10 max-w-[560px]">
            <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
              面接の答え合わせ、
              <br />
              始めよう。
            </h1>
            <p className="mt-6 text-base leading-relaxed text-gray-200 sm:text-lg">
              &quot;なんとなく不安&quot;を、&quot;具体的な自信&quot;に。
              <br className="hidden sm:inline" />
              回答内容・話し方・論理構成をAIが分析し、改善アクションを提示。
              <br className="hidden sm:inline" />
              いつでもどこでも練習できます。
            </p>
            <div className="mt-8">
              <Link
                href="/signup"
                className="inline-block rounded-lg px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: C.orange }}
              >
                無料で面接練習を始める
              </Link>
              <p className="mt-3 text-sm text-muted-foreground/50">
                登録は30秒。クレジットカード不要。
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {["AI多角分析", "就活・転職対応", "月3回無料"].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-background/15 px-3 py-1.5 text-sm text-white backdrop-blur-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* 人物画像: 右下ビタ付け */}
        <img
          src="/images/hero-person.png"
          alt="面接に自信を持つビジネスパーソン"
          className="pointer-events-none absolute bottom-0 right-[8%] hidden max-h-full w-auto object-contain object-bottom lg:block xl:right-[12%]"
        />
      </section>

      {/* ========== NUMBERS ========== */}
      <section
        className="border-y border-border px-4 py-14 sm:py-16"
      >
        <div className="mx-auto grid max-w-[1120px] grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { end: 92, suffix: "%", label: "利用者満足度" },
            { end: 3, suffix: "倍", label: "練習効率の向上" },
            { end: 500, suffix: "+", label: "面接質問を収録" },
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

      {/* ========== PAIN POINTS ========== */}
      <section className="bg-background px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            こんな悩み、ありませんか？
          </h2>
          <p className="mt-4 text-center text-lg text-muted-foreground">
            面接は就活・転職の最大の関門。でも効果的な対策方法がない。
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                title: "面接練習の相手がいない",
                desc: "キャリアセンターは予約が取れない。友人相手だと恥ずかしい。一人で練習しても客観的な評価が分からない。",
              },
              {
                icon: <HelpCircle className="h-8 w-8" />,
                title: "何がダメか分からない",
                desc: "面接に落ちても理由が分からない。「もっと具体的に」と言われても、何をどう変えればいいのか不明。",
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "練習しても上達を感じない",
                desc: "面接対策本を読んでも本番で活かせない。やみくもに練習しても効果が見えず、不安が増すばかり。",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-background p-6 text-center shadow-sm lg:p-8"
              >
                <div
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: C.sectionBg, color: C.navy }}
                >
                  {item.icon}
                </div>
                <h3 className="mb-3 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== BEFORE / AFTER ========== */}
      <section className="px-4 py-20 sm:py-28" style={{ backgroundColor: C.sectionBg }}>
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            InterviewCoach が解決します
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6 lg:p-8">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-red-600">
                <X className="h-5 w-5" />
                Before
              </h3>
              <ul className="space-y-4">
                {[
                  "自分の回答の何が悪いのか分からない",
                  "練習相手がいなくて一人で不安",
                  "成長しているのか実感が持てない",
                  "「えーと」が多いと言われるけど直し方が分からない",
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <span className="text-sm text-muted-foreground">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-xl border-2 p-6 lg:p-8"
              style={{
                borderColor: `${C.navy}30`,
                backgroundColor: `${C.navy}05`,
              }}
            >
              <h3
                className="mb-4 flex items-center gap-2 text-lg font-bold"
                style={{ color: C.navy }}
              >
                <Check className="h-5 w-5" />
                After
              </h3>
              <ul className="space-y-4">
                {[
                  "AIが具体的な改善ポイントを即フィードバック",
                  "AI面接官と24時間いつでも模擬面接できる",
                  "スコア推移で成長を可視化。モチベーション維持",
                  "フィラー分析で話し方のクセを数値で把握",
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: C.navy }}
                    />
                    <span className="text-sm text-muted-foreground">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 3 REASONS ========== */}
      <section className="bg-background px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            選ばれる3つの理由
          </h2>
          <p className="mt-4 text-center text-lg text-muted-foreground">
            面接対策に必要なすべてが、ここに。
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
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
              <div
                key={item.num}
                className="relative overflow-hidden rounded-xl border-2 border-border p-6 transition-shadow hover:shadow-lg"
              >
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
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURE GRID ========== */}
      <section
        className="px-4 py-20 sm:py-28"
        style={{ backgroundColor: C.sectionBg }}
      >
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            充実の機能
          </h2>
          <p className="mt-4 text-center text-lg text-muted-foreground">
            面接準備から本番対策まで、トータルサポート。
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-xl border border-border bg-background p-5 shadow-sm transition-colors hover:bg-muted"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: C.navy }}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="bg-background px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            はじめ方はかんたん
          </h2>
          <p className="mt-4 text-center text-lg text-muted-foreground">
            登録から最初のフィードバックまで、たった5分。
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
              <div
                key={item.step}
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
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section
        className="px-4 py-20 sm:py-28"
        style={{ backgroundColor: C.sectionBg }}
      >
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            利用者の声
          </h2>
          <p className="mt-4 text-center text-lg text-muted-foreground">
            InterviewCoach で面接力を伸ばした先輩たちのリアルな声。
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              {
                initials: "T.S",
                name: "T.S さん",
                label: "26卒 / 文系",
                text: "一人で面接練習しても、何がダメなのか分からなかった。InterviewCoach を使い始めてから、具体的に何を直せばいいかが明確になって、面接への自信がつきました。",
              },
              {
                initials: "M.K",
                name: "M.K さん",
                label: "27卒 / 理系",
                text: "模擬面接機能が特に良い。深夜でもAIが面接官をしてくれるので、バイト後でも練習できます。スコアが上がっていくのを見ると、モチベーションも上がります。",
              },
              {
                initials: "A.Y",
                name: "A.Y さん",
                label: "26卒 / 文系",
                text: "フィラー分析で、自分が思った以上に「えーと」を連発していたことに気づけました。意識して直したら、面接官の反応が明らかに変わりました。",
              },
            ].map((item) => (
              <div
                key={item.initials}
                className="rounded-xl border border-border bg-background p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: C.navy }}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{item.text}&rdquo;
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
      <section
        className="px-4 py-20 sm:py-28"
        style={{
          background: `linear-gradient(to right, ${C.navy}, ${C.navyDark})`,
        }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            次の面接、自信を持って臨もう。
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
      </section>

      <div className="h-16 md:hidden" />
    </div>
  );
}
