import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Brain,
  TrendingUp,
  Target,
  UserPlus,
  Mic,
  BarChart3,
  MessageSquare,
  ArrowRight,
  Check,
  X,
  Sparkles,
  Shield,
  Clock,
  FileText,
  HelpCircle,
  Users,
  Zap,
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
import { CountUp } from "@/components/lp/count-up";

// FAQ セクションはページ下部のため遅延ロード
const FaqSection = dynamic(
  () => import("@/components/lp/faq-section").then((mod) => mod.FaqSection),
  {
    loading: () => (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "InterviewCoach - 面接練習を録音するだけ。AIが即座に分析・フィードバック",
  description:
    "面接練習を録音するだけで、回答内容・話し方をAIが即座に分析。スコア表示と成長トラッキングで、確実に面接力を伸ばせる就活支援アプリ。無料プランあり。",
  openGraph: {
    title: "InterviewCoach - 面接練習を録音するだけ。AIが即座に分析・フィードバック",
    description:
      "面接練習を録音するだけで、回答内容・話し方をAIが即座に分析。スコア表示と成長トラッキングで、確実に面接力を伸ばせる就活支援アプリ。無料プランあり。",
    url: "https://interviewcoach.jp",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "InterviewCoach - AI面接フィードバック" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication", name: "InterviewCoach", url: "https://interviewcoach.jp",
      description: "InterviewCoachは、面接練習の録音をAIが多角的に分析し、回答内容・話し方の両面から具体的なフィードバックを提供する就活支援アプリです。スコア表示・成長トラッキング・16パーソナリティ連動分析・模擬面接・ES添削・質問データベースなど、面接対策に必要な機能を網羅。26卒・27卒の就活を成功に導きます。",
      applicationCategory: "BusinessApplication", operatingSystem: "Web",
      offers: [
        { "@type": "Offer", name: "無料プラン", price: "0", priceCurrency: "JPY", description: "月3回まで面接分析、AIフィードバック、スコア表示" },
        { "@type": "Offer", name: "Pro プラン", price: "980", priceCurrency: "JPY", description: "月30回の面接分析、成長トラッキング、模擬面接、ES添削、パーソナライズ分析" },
        { "@type": "Offer", name: "Premium プラン", price: "1980", priceCurrency: "JPY", description: "回数無制限の面接分析、全機能フルアクセス、パーソナリティ連動の詳細分析" },
      ],
    },
    { "@type": "Organization", name: "InterviewCoach", url: "https://interviewcoach.jp", email: "support@interviewcoach.jp" },
  ],
};

export default function Home() {
  return (
    <div className="flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background px-4 py-20 sm:py-28 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm"><Sparkles className="mr-1 size-3.5" />26卒・27卒の面接対策に</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">面接、もう一人で<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">悩まない。</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">録音するだけで、プロ級のフィードバック。<br className="hidden sm:block" />回答内容・話し方・あなたの強みまで、まるごと分析。</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="w-full px-8 py-6 text-base sm:w-auto"><Link href="/signup">3分で無料体験<ArrowRight className="ml-2 size-4" /></Link></Button>
            <Button size="lg" variant="outline" asChild className="w-full px-8 py-6 text-base sm:w-auto"><Link href="#how-it-works">使い方を見る</Link></Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground"><Shield className="mr-1 inline size-3.5" />クレジットカード不要・30秒で登録完了</p>
        </div>
      </section>
      {/* Numbers */}
      <section className="border-y bg-muted/30 px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-5xl"><div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="text-center"><p className="text-3xl font-bold text-primary sm:text-4xl"><CountUp end={92} suffix="%" /></p><p className="mt-2 text-sm text-muted-foreground">利用者満足度</p></div>
          <div className="text-center"><p className="text-3xl font-bold text-primary sm:text-4xl"><CountUp end={3} suffix="倍" /></p><p className="mt-2 text-sm text-muted-foreground">練習効率の向上</p></div>
          <div className="text-center"><p className="text-3xl font-bold text-primary sm:text-4xl"><CountUp end={500} suffix="+" /></p><p className="mt-2 text-sm text-muted-foreground">面接質問を収録</p></div>
          <div className="text-center"><p className="text-3xl font-bold text-primary sm:text-4xl"><CountUp end={30} suffix="秒" /></p><p className="mt-2 text-sm text-muted-foreground">で登録完了</p></div>
        </div></div>
      </section>
      {/* Before/After */}
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">面接対策、こんな悩みありませんか？</h2><p className="mt-4 text-lg text-muted-foreground">InterviewCoach が解決します。</p></div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            <Card className="border-2 border-destructive/20 bg-destructive/5"><CardHeader className="pb-4"><CardTitle className="flex items-center gap-2 text-lg text-destructive"><X className="size-5" />Before</CardTitle></CardHeader><CardContent><ul className="space-y-4"><li className="flex items-start gap-3"><X className="mt-0.5 size-4 shrink-0 text-destructive/60" /><span className="text-sm">自分の回答の何が悪いのか分からない</span></li><li className="flex items-start gap-3"><X className="mt-0.5 size-4 shrink-0 text-destructive/60" /><span className="text-sm">練習相手がいなくて一人で不安</span></li><li className="flex items-start gap-3"><X className="mt-0.5 size-4 shrink-0 text-destructive/60" /><span className="text-sm">成長しているのか実感が持てない</span></li><li className="flex items-start gap-3"><X className="mt-0.5 size-4 shrink-0 text-destructive/60" /><span className="text-sm">「えーと」が多いと言われるけど直し方が分からない</span></li></ul></CardContent></Card>
            <Card className="border-2 border-primary/20 bg-primary/5"><CardHeader className="pb-4"><CardTitle className="flex items-center gap-2 text-lg text-primary"><Check className="size-5" />After</CardTitle></CardHeader><CardContent><ul className="space-y-4"><li className="flex items-start gap-3"><Check className="mt-0.5 size-4 shrink-0 text-primary" /><span className="text-sm">AIが具体的な改善ポイントを即フィードバック</span></li><li className="flex items-start gap-3"><Check className="mt-0.5 size-4 shrink-0 text-primary" /><span className="text-sm">AI面接官と24時間いつでも模擬面接できる</span></li><li className="flex items-start gap-3"><Check className="mt-0.5 size-4 shrink-0 text-primary" /><span className="text-sm">スコア推移で成長を可視化。モチベーション維持</span></li><li className="flex items-start gap-3"><Check className="mt-0.5 size-4 shrink-0 text-primary" /><span className="text-sm">フィラー分析で話し方のクセを数値で把握</span></li></ul></CardContent></Card>
          </div>
        </div>
      </section>
      {/* Features Numbered */}
      <section id="features" className="bg-muted/50 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">選ばれる3つの理由</h2><p className="mt-4 text-lg text-muted-foreground">面接対策に必要なすべてが、ここに。</p></div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <Card className="relative overflow-hidden border-2 transition-shadow hover:shadow-lg"><CardHeader><span className="text-5xl font-black text-primary/10">01</span><div className="mt-2 flex size-12 items-center justify-center rounded-lg bg-primary/10"><Brain className="size-6 text-primary" /></div><CardTitle className="mt-3 text-xl">録音するだけ。あとはAIにおまかせ。</CardTitle><CardDescription className="text-base">面接練習を録音するだけで、回答の論理性・具体性から、話すスピード・フィラーワードまで多角的に分析。「何がダメだったのか分からない」をなくします。</CardDescription></CardHeader></Card>
            <Card className="relative overflow-hidden border-2 transition-shadow hover:shadow-lg"><CardHeader><span className="text-5xl font-black text-primary/10">02</span><div className="mt-2 flex size-12 items-center justify-center rounded-lg bg-primary/10"><TrendingUp className="size-6 text-primary" /></div><CardTitle className="mt-3 text-xl">スコアで見える、自分の成長。</CardTitle><CardDescription className="text-base">面接ごとにスコアを算出し、推移をグラフで可視化。どの項目が伸びていて、どこを重点的に練習すべきか、一目でわかります。</CardDescription></CardHeader></Card>
            <Card className="relative overflow-hidden border-2 transition-shadow hover:shadow-lg"><CardHeader><span className="text-5xl font-black text-primary/10">03</span><div className="mt-2 flex size-12 items-center justify-center rounded-lg bg-primary/10"><Target className="size-6 text-primary" /></div><CardTitle className="mt-3 text-xl">パーソナリティに合った面接戦略。</CardTitle><CardDescription className="text-base">16パーソナリティ診断をもとに、あなたの強み・弱みに合った回答スタイルを提案。「自分らしい受け答え」で面接官の印象に残ります。</CardDescription></CardHeader></Card>
          </div>
        </div>
      </section>
      {/* Feature Grid */}
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">充実の機能</h2><p className="mt-4 text-lg text-muted-foreground">面接準備から本番対策まで、トータルサポート。</p></div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-4 rounded-xl border p-5 transition-colors hover:bg-muted/50"><div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Mic className="size-5 text-primary" /></div><div><h3 className="font-semibold">録音 & 文字起こし</h3><p className="mt-1 text-sm text-muted-foreground">ブラウザで録音、自動で文字起こし。面接練習がそのまま分析対象に。</p></div></div>
            <div className="flex items-start gap-4 rounded-xl border p-5 transition-colors hover:bg-muted/50"><div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><MessageSquare className="size-5 text-primary" /></div><div><h3 className="font-semibold">AI模擬面接</h3><p className="mt-1 text-sm text-muted-foreground">AI面接官がリアルタイムで質問。本番さながらの練習が24時間可能。</p></div></div>
            <div className="flex items-start gap-4 rounded-xl border p-5 transition-colors hover:bg-muted/50"><div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><BarChart3 className="size-5 text-primary" /></div><div><h3 className="font-semibold">スコア & 成長記録</h3><p className="mt-1 text-sm text-muted-foreground">回答力をスコア化し、成長をグラフで可視化。弱点を効率的に克服。</p></div></div>
            <div className="flex items-start gap-4 rounded-xl border p-5 transition-colors hover:bg-muted/50"><div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><FileText className="size-5 text-primary" /></div><div><h3 className="font-semibold">ES添削</h3><p className="mt-1 text-sm text-muted-foreground">エントリーシートをAIが添削。構成・表現・具体性の観点でアドバイス。</p></div></div>
            <div className="flex items-start gap-4 rounded-xl border p-5 transition-colors hover:bg-muted/50"><div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Users className="size-5 text-primary" /></div><div><h3 className="font-semibold">16パーソナリティ診断</h3><p className="mt-1 text-sm text-muted-foreground">性格タイプに基づいた面接戦略を提案。自分らしさを活かした受け答えに。</p></div></div>
            <div className="flex items-start gap-4 rounded-xl border p-5 transition-colors hover:bg-muted/50"><div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Zap className="size-5 text-primary" /></div><div><h3 className="font-semibold">フィラー分析</h3><p className="mt-1 text-sm text-muted-foreground">「えーと」「あの」の頻度を検出。話し方のクセを数値で把握し改善。</p></div></div>
          </div>
        </div>
      </section>
      {/* 4-Step Process */}
      <section id="how-it-works" className="bg-muted/50 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">はじめ方はかんたん</h2><p className="mt-4 text-lg text-muted-foreground">登録から最初のフィードバックまで、たった5分。</p></div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative flex flex-col items-center text-center"><div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">1</div><div className="mt-4 flex size-12 items-center justify-center"><UserPlus className="size-6 text-primary" /></div><h3 className="mt-3 text-lg font-semibold">無料登録</h3><p className="mt-2 text-sm text-muted-foreground">メールアドレスだけで30秒で完了。カード不要。</p><div className="absolute -right-4 top-8 hidden text-muted-foreground/40 lg:block"><ArrowRight className="size-6" /></div></div>
            <div className="relative flex flex-col items-center text-center"><div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">2</div><div className="mt-4 flex size-12 items-center justify-center"><Mic className="size-6 text-primary" /></div><h3 className="mt-3 text-lg font-semibold">面接練習を録音</h3><p className="mt-2 text-sm text-muted-foreground">ブラウザ上でそのまま録音。AI模擬面接も利用可能。</p><div className="absolute -right-4 top-8 hidden text-muted-foreground/40 lg:block"><ArrowRight className="size-6" /></div></div>
            <div className="relative flex flex-col items-center text-center"><div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">3</div><div className="mt-4 flex size-12 items-center justify-center"><Brain className="size-6 text-primary" /></div><h3 className="mt-3 text-lg font-semibold">AIが多角的に分析</h3><p className="mt-2 text-sm text-muted-foreground">論理性・具体性・話し方まで、最新AIが即座に分析。</p><div className="absolute -right-4 top-8 hidden text-muted-foreground/40 lg:block"><ArrowRight className="size-6" /></div></div>
            <div className="flex flex-col items-center text-center"><div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">4</div><div className="mt-4 flex size-12 items-center justify-center"><TrendingUp className="size-6 text-primary" /></div><h3 className="mt-3 text-lg font-semibold">スコアで成長を実感</h3><p className="mt-2 text-sm text-muted-foreground">改善を重ねるたびにスコアが上がる。成長を実感しながら本番へ。</p></div>
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">利用者の声</h2><p className="mt-4 text-lg text-muted-foreground">InterviewCoach で面接力を伸ばした先輩たちのリアルな声。</p></div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            <Card className="border-2"><CardContent className="pt-6"><div className="mb-4 flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">T.S</div><div><p className="text-sm font-semibold">T.S さん</p><p className="text-xs text-muted-foreground">26卒 / 文系</p></div></div><p className="text-sm leading-relaxed text-muted-foreground">「一人で面接練習しても、何がダメなのか分からなかった。InterviewCoach を使い始めてから、具体的に何を直せばいいかが明確になって、面接への自信がつきました。」</p></CardContent></Card>
            <Card className="border-2"><CardContent className="pt-6"><div className="mb-4 flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">M.K</div><div><p className="text-sm font-semibold">M.K さん</p><p className="text-xs text-muted-foreground">27卒 / 理系</p></div></div><p className="text-sm leading-relaxed text-muted-foreground">「模擬面接機能が特に良い。深夜でもAIが面接官をしてくれるので、バイト後でも練習できます。スコアが上がっていくのを見ると、モチベーションも上がります。」</p></CardContent></Card>
            <Card className="border-2"><CardContent className="pt-6"><div className="mb-4 flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">A.Y</div><div><p className="text-sm font-semibold">A.Y さん</p><p className="text-xs text-muted-foreground">26卒 / 文系</p></div></div><p className="text-sm leading-relaxed text-muted-foreground">「フィラー分析で、自分が思った以上に『えーと』を連発していたことに気づけました。意識して直したら、面接官の反応が明らかに変わりました。」</p></CardContent></Card>
          </div>
        </div>
      </section>
      {/* Pricing */}
      <section className="bg-muted/50 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-center"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">あなたに合ったプランを</h2><p className="mt-4 text-lg text-muted-foreground">無料プランだけでも、面接力は変わります。</p></div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            <Card className="flex flex-col border-2"><CardHeader><CardTitle className="text-2xl">無料プラン</CardTitle><CardDescription className="text-base">まずは試してみたい方へ</CardDescription><div className="mt-4"><span className="text-4xl font-bold">¥0</span><span className="text-muted-foreground">/月</span></div></CardHeader><CardContent className="flex-1"><ul className="space-y-3"><li className="flex items-center gap-3"><Check className="size-5 shrink-0 text-primary" /><span className="text-sm">月3回まで面接分析</span></li><li className="flex items-center gap-3"><Check className="size-5 shrink-0 text-primary" /><span className="text-sm">AIフィードバック</span></li><li className="flex items-center gap-3"><Check className="size-5 shrink-0 text-primary" /><span className="text-sm">スコア表示</span></li><li className="flex items-center gap-3"><X className="size-5 shrink-0 text-muted-foreground/40" /><span className="text-sm text-muted-foreground">成長トラッキング</span></li><li className="flex items-center gap-3"><X className="size-5 shrink-0 text-muted-foreground/40" /><span className="text-sm text-muted-foreground">模擬面接・ES添削</span></li></ul></CardContent><CardFooter><Button variant="outline" className="w-full" size="lg" asChild><Link href="/signup">無料ではじめる</Link></Button></CardFooter></Card>
            <Card className="relative flex flex-col border-2 border-primary shadow-lg"><div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="px-4 py-1 text-sm">おすすめ</Badge></div><CardHeader><CardTitle className="text-2xl">Pro プラン</CardTitle><CardDescription className="text-base">本選考に向けて本気で準備したい方へ</CardDescription><div className="mt-4"><span className="text-4xl font-bold">¥980</span><span className="text-muted-foreground">/月</span></div></CardHeader><CardContent className="flex-1"><ul className="space-y-3"><li className="flex items-center gap-3"><Check className="size-5 shrink-0 text-primary" /><span className="text-sm font-medium">月30回の面接分析</span></li><li className="flex items-center gap-3"><Check className="size-5 shrink-0 text-primary" /><span className="text-sm">成長トラッキング</span></li><li className="flex items-center gap-3"><Check className="size-5 shrink-0 text-primary" /><span className="text-sm">模擬面接（AI面接官）</span></li><li className="flex items-center gap-3"><Check className="size-5 shrink-0 text-primary" /><span className="text-sm">ES添削</span></li><li className="flex items-center gap-3"><Check className="size-5 shrink-0 text-primary" /><span className="text-sm">パーソナリティ連動分析</span></li></ul></CardContent><CardFooter><Button className="w-full" size="lg" asChild><Link href="/pricing">Pro ではじめる<ArrowRight className="ml-2 size-4" /></Link></Button></CardFooter></Card>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground"><Link href="/pricing" className="underline underline-offset-4 hover:text-foreground">Premium プランなど、すべてのプランを比較する</Link></p>
        </div>
      </section>
      {/* Trust */}
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-center"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">安心してお使いいただくために</h2></div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center"><div className="flex size-14 items-center justify-center rounded-full bg-primary/10"><Shield className="size-7 text-primary" /></div><h3 className="mt-4 font-semibold">データの安全性</h3><p className="mt-2 text-sm text-muted-foreground">録音データは暗号化保存。第三者への提供は一切ありません。</p></div>
            <div className="flex flex-col items-center text-center"><div className="flex size-14 items-center justify-center rounded-full bg-primary/10"><Clock className="size-7 text-primary" /></div><h3 className="mt-4 font-semibold">いつでも解約OK</h3><p className="mt-2 text-sm text-muted-foreground">有料プランはいつでも解約可能。解約後も当月末まで利用できます。</p></div>
            <div className="flex flex-col items-center text-center"><div className="flex size-14 items-center justify-center rounded-full bg-primary/10"><HelpCircle className="size-7 text-primary" /></div><h3 className="mt-4 font-semibold">サポート対応</h3><p className="mt-2 text-sm text-muted-foreground">ご不明点はメールサポートで対応。使い方のご相談もお気軽に。</p></div>
          </div>
        </div>
      </section>
      {/* FAQ */}
      <section className="bg-muted/50 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="text-center"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">よくある質問</h2><p className="mt-4 text-lg text-muted-foreground">気になることがあれば、まずはこちらをご確認ください。</p></div>
          <div className="mt-12"><FaqSection /></div>
        </div>
      </section>
      {/* Final CTA */}
      <section className="bg-gradient-to-r from-primary to-primary/80 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">次の面接、自信を持って臨もう。</h2>
          <p className="mt-4 text-lg text-primary-foreground/80">今日の練習が、明日の内定につながる。<br className="hidden sm:block" />まずは無料プランで、あなたの面接力を確かめてみてください。</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"><Button size="lg" variant="secondary" asChild className="px-8 py-6 text-base"><Link href="/signup">3分で無料体験<ArrowRight className="ml-2 size-4" /></Link></Button></div>
          <p className="mt-4 text-sm text-primary-foreground/60">クレジットカード不要・いつでも解約OK</p>
        </div>
      </section>
      <div className="h-16 md:hidden" />
    </div>
  );
}
