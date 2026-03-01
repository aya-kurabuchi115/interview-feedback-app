import type { Metadata } from "next";
import Link from "next/link";
import {
  Brain,
  TrendingUp,
  Target,
  Mic,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "InterviewCoach - AI面接フィードバック",
  description:
    "面接練習の録音をAIが分析し、回答内容・話し方の両面からフィードバックを自動生成。新卒就活を成功に導くAI面接コーチ。",
  openGraph: {
    title: "InterviewCoach - AI面接フィードバック",
    description:
      "面接練習の録音をAIが分析し、回答内容・話し方の両面からフィードバックを自動生成。新卒就活を成功に導くAI面接コーチ。",
    url: "https://interviewcoach.jp",
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
      url: "https://interviewcoach.jp",
      description:
        "面接練習の録音をAIが分析し、回答内容・話し方の両面からフィードバックを自動生成。新卒就活を成功に導くAI面接コーチ。",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: [
        {
          "@type": "Offer",
          name: "無料プラン",
          price: "0",
          priceCurrency: "JPY",
          description: "月3回まで面接分析、基本的なAIフィードバック、スコア表示",
        },
        {
          "@type": "Offer",
          name: "Pro プラン",
          price: "980",
          priceCurrency: "JPY",
          description:
            "無制限の面接分析、詳細なAIフィードバック、成長トラッキング、パーソナライズ分析",
        },
      ],
    },
    {
      "@type": "Organization",
      name: "InterviewCoach",
      url: "https://interviewcoach.jp",
      email: "support@interviewcoach.jp",
    },
  ],
};

export default function Home() {
  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background px-4 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            <Sparkles className="mr-1 size-3.5" />
            新卒就活を成功に導く AI 面接コーチ
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            面接、もう一人で
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              悩まない。
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            AIがあなたの面接を分析し、良かった点・改善点を即座にフィードバック。
            <br className="hidden sm:block" />
            新卒就活を成功に導きます。
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="w-full text-base px-8 py-6 sm:w-auto"
            >
              <Link href="/signup">
                無料で始める
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full text-base px-8 py-6 sm:w-auto"
            >
              <Link href="#features">詳しく見る</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section id="features" className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              3つの強みで面接力を伸ばす
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              AIの力で、面接対策を効率的かつ効果的に
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {/* AI分析 */}
            <Card className="relative overflow-hidden border-2 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="size-6 text-primary" />
                </div>
                <CardTitle className="text-xl">AI分析</CardTitle>
                <CardDescription className="text-base">
                  面接の文字起こしをAIが分析し、良い点・改善点を即座にフィードバック。的確なアドバイスで面接力を向上させます。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 成長トラッキング */}
            <Card className="relative overflow-hidden border-2 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="size-6 text-primary" />
                </div>
                <CardTitle className="text-xl">成長トラッキング</CardTitle>
                <CardDescription className="text-base">
                  面接ごとのスコア推移を可視化。自分の弱点を把握し、効率的に克服できます。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* パーソナライズ */}
            <Card className="relative overflow-hidden border-2 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="size-6 text-primary" />
                </div>
                <CardTitle className="text-xl">パーソナライズ</CardTitle>
                <CardDescription className="text-base">
                  志望業界・面接タイプに応じた的確なアドバイス。あなたに合った対策を提案します。
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="bg-muted/50 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              かんたん3ステップ
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              すぐに始められて、すぐに効果を実感
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {/* ステップ1 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <div className="mt-2 flex size-12 items-center justify-center">
                <Mic className="size-6 text-primary" />
              </div>
              <h3 className="mt-2 text-lg font-semibold">面接を記録</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                ブラウザ上で面接練習を録音。特別な機器は不要です。
              </p>
            </div>

            {/* ステップ2 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <div className="mt-2 flex size-12 items-center justify-center">
                <Brain className="size-6 text-primary" />
              </div>
              <h3 className="mt-2 text-lg font-semibold">AIが分析</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                文字起こしと話者分離を行い、AIが回答内容・話し方を総合的に分析します。
              </p>
            </div>

            {/* ステップ3 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <div className="mt-2 flex size-12 items-center justify-center">
                <CheckCircle className="size-6 text-primary" />
              </div>
              <h3 className="mt-2 text-lg font-semibold">
                フィードバックで改善
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                具体的な改善ポイントを確認し、次の面接に活かしましょう。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 料金プランセクション */}
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              料金プラン
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              まずは無料プランでお試しください
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {/* 無料プラン */}
            <Card className="flex flex-col border-2">
              <CardHeader>
                <CardTitle className="text-2xl">無料プラン</CardTitle>
                <CardDescription className="text-base">
                  まずは気軽に試したい方へ
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">¥0</span>
                  <span className="text-muted-foreground">/月</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-primary" />
                    <span className="text-sm">月3回まで面接分析</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-primary" />
                    <span className="text-sm">基本的なAIフィードバック</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-primary" />
                    <span className="text-sm">スコア表示</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="size-5 shrink-0 text-muted-foreground/40" />
                    <span className="text-sm text-muted-foreground">
                      成長トラッキング
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="size-5 shrink-0 text-muted-foreground/40" />
                    <span className="text-sm text-muted-foreground">
                      パーソナライズ分析
                    </span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  asChild
                >
                  <Link href="/signup">無料で始める</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Proプラン */}
            <Card className="relative flex flex-col border-2 border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="px-4 py-1 text-sm">おすすめ</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro プラン</CardTitle>
                <CardDescription className="text-base">
                  本気で面接対策したい方へ
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">¥980</span>
                  <span className="text-muted-foreground">/月</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-primary" />
                    <span className="text-sm font-medium">
                      無制限の面接分析
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-primary" />
                    <span className="text-sm">詳細なAIフィードバック</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-primary" />
                    <span className="text-sm">スコア表示</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-primary" />
                    <span className="text-sm">成長トラッキング</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-primary" />
                    <span className="text-sm">パーソナライズ分析</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" asChild>
                  <Link href="/pricing">Pro で始める</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="bg-gradient-to-r from-primary to-primary/80 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            今すぐ始めよう
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            まずは無料プランで試してみましょう。登録は30秒で完了します。
          </p>
          <div className="mt-10">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-base px-8 py-6"
            >
              <Link href="/signup">
                無料で始める
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
