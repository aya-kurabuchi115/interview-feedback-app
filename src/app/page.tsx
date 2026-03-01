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
  UserPlus,
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
  title: "InterviewCoach - 面接練習を録音するだけ。AIが即座に分析・フィードバック",
  description:
    "面接練習を録音するだけで、回答内容・話し方をAIが即座に分析。スコア表示と成長トラッキングで、確実に面接力を伸ばせる就活支援アプリ。無料プランあり。",
  openGraph: {
    title: "InterviewCoach - 面接練習を録音するだけ。AIが即座に分析・フィードバック",
    description:
      "面接練習を録音するだけで、回答内容・話し方をAIが即座に分析。スコア表示と成長トラッキングで、確実に面接力を伸ばせる就活支援アプリ。無料プランあり。",
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
        "InterviewCoachは、面接練習の録音をAIが多角的に分析し、回答内容・話し方の両面から具体的なフィードバックを提供する就活支援アプリです。スコア表示・成長トラッキング・16パーソナリティ連動分析・模擬面接・ES添削・質問データベースなど、面接対策に必要な機能を網羅。26卒・27卒の就活を成功に導きます。",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: [
        {
          "@type": "Offer",
          name: "無料プラン",
          price: "0",
          priceCurrency: "JPY",
          description: "月3回まで面接分析、AIフィードバック、スコア表示",
        },
        {
          "@type": "Offer",
          name: "Pro プラン",
          price: "980",
          priceCurrency: "JPY",
          description:
            "月30回の面接分析、成長トラッキング、模擬面接、ES添削、パーソナライズ分析",
        },
        {
          "@type": "Offer",
          name: "Premium プラン",
          price: "1980",
          priceCurrency: "JPY",
          description:
            "回数無制限の面接分析、全機能フルアクセス、パーソナリティ連動の詳細分析",
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
            26卒・27卒の面接対策に
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            面接、もう一人で
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              悩まない。
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            録音するだけで、プロ級のフィードバック。
            <br className="hidden sm:block" />
            回答内容・話し方・あなたの強みまで、まるごと分析。
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="w-full text-base px-8 py-6 sm:w-auto"
            >
              <Link href="/signup">
                無料ではじめる
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full text-base px-8 py-6 sm:w-auto"
            >
              <Link href="#how-it-works">3分でわかる使い方</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section id="features" className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              選ばれる理由
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              面接対策に必要なすべてが、ここに。
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {/* AI分析 */}
            <Card className="relative overflow-hidden border-2 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="size-6 text-primary" />
                </div>
                <CardTitle className="text-xl">
                  録音するだけ。あとはAIにおまかせ。
                </CardTitle>
                <CardDescription className="text-base">
                  面接練習を録音するだけで、回答の論理性・具体性から、話すスピード・フィラーワードまで多角的に分析。「何がダメだったのか分からない」をなくします。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 成長トラッキング */}
            <Card className="relative overflow-hidden border-2 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="size-6 text-primary" />
                </div>
                <CardTitle className="text-xl">
                  スコアで見える、自分の成長。
                </CardTitle>
                <CardDescription className="text-base">
                  面接ごとにスコアを算出し、推移をグラフで可視化。どの項目が伸びていて、どこを重点的に練習すべきか、一目でわかります。
                </CardDescription>
              </CardHeader>
            </Card>

            {/* パーソナライズ */}
            <Card className="relative overflow-hidden border-2 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="size-6 text-primary" />
                </div>
                <CardTitle className="text-xl">
                  パーソナリティに合った面接戦略。
                </CardTitle>
                <CardDescription className="text-base">
                  16パーソナリティ診断をもとに、あなたの強み・弱みに合った回答スタイルを提案。「自分らしい受け答え」で面接官の印象に残る面接を。
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section id="how-it-works" className="bg-muted/50 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              はじめ方はかんたん
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              登録から最初のフィードバックまで、たった5分。
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {/* ステップ1 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <div className="mt-2 flex size-12 items-center justify-center">
                <UserPlus className="size-6 text-primary" />
              </div>
              <h3 className="mt-2 text-lg font-semibold">無料登録する</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                メールアドレスだけで30秒で完了。クレジットカードは不要です。
              </p>
            </div>

            {/* ステップ2 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <div className="mt-2 flex size-12 items-center justify-center">
                <Mic className="size-6 text-primary" />
              </div>
              <h3 className="mt-2 text-lg font-semibold">面接練習を録音する</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                ブラウザ上でそのまま録音。模擬面接モードならAIが面接官役も担当します。
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
                フィードバックを受け取る
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                回答内容・話し方を総合分析した結果と、次に何を改善すべきかの具体的なアドバイスが届きます。
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
              あなたに合ったプランを
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              無料プランだけでも、面接力は変わります。
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {/* 無料プラン */}
            <Card className="flex flex-col border-2">
              <CardHeader>
                <CardTitle className="text-2xl">無料プラン</CardTitle>
                <CardDescription className="text-base">
                  まずは試してみたい方へ
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
                    <span className="text-sm">AIフィードバック</span>
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
                      模擬面接・ES添削
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
                  <Link href="/signup">無料ではじめる</Link>
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
                  本選考に向けて本気で準備したい方へ
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
                      月30回の面接分析
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-primary" />
                    <span className="text-sm">成長トラッキング</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-primary" />
                    <span className="text-sm">模擬面接（AI面接官）</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-primary" />
                    <span className="text-sm">ES添削</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-primary" />
                    <span className="text-sm">パーソナリティ連動分析</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" asChild>
                  <Link href="/pricing">Pro ではじめる</Link>
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
            次の面接、自信を持って臨もう。
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            今日の練習が、明日の内定につながる。まずは無料プランで、あなたの面接力を確かめてみてください。
          </p>
          <div className="mt-10">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-base px-8 py-6"
            >
              <Link href="/signup">
                無料ではじめる
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
