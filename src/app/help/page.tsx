import type { Metadata } from "next";
import Link from "next/link";
import {
  HelpCircle,
  MessageSquare,
  FileText,
  CreditCard,
  User,
  Mic,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "ヘルプ | InterviewCoach",
  robots: { index: false, follow: false },
};

const FAQ_ITEMS = [
  {
    question: "模擬面接はどのように行われますか？",
    answer:
      "AI面接官がリアルタイムで質問を出します。音声またはテキストで回答すると、AIが内容を分析し、論理性・具体性・表現力・印象の4つの観点でフィードバックを提供します。",
  },
  {
    question: "ES添削ではどんなフィードバックがもらえますか？",
    answer:
      "構成・具体性・説得力・文法の4つのカテゴリで100点満点のスコア評価を行います。具体的な改善提案、Before/Afterの修正例、AIによる書き直し例も提供されます。Premiumプランでは過去の面接履歴も踏まえたアドバイスが受けられます。",
  },
  {
    question: "無料プランと有料プランの違いは？",
    answer:
      "無料プランでは模擬面接が月3回ご利用いただけます。Proプラン（月額¥980）では月30回、Premiumプラン（月額¥1,980）では無制限で利用可能です。さらにPremiumではAI質問集やES添削（面接履歴活用）もご利用いただけます。",
  },
  {
    question: "プランの変更やキャンセルはできますか？",
    answer:
      "はい、いつでも変更・キャンセル可能です。設定画面の「プラン管理」から手続きできます。キャンセルしても、現在の課金期間の終了日まではご利用いただけます。",
  },
  {
    question: "16パーソナリティ診断とは？",
    answer:
      "MBTI（16タイプ分類）をベースにした性格診断です。診断結果は面接のフィードバックやES添削にも活用され、あなたのタイプに合わせたアドバイスが提供されます。",
  },
  {
    question: "アカウントを削除したいです",
    answer:
      "プロフィール画面下部の「アカウント削除」から手続きできます。削除すると、面接記録・ESデータなどすべてのデータが完全に削除され、復元できません。",
  },
];

const GUIDE_SECTIONS = [
  {
    icon: Mic,
    title: "模擬面接の使い方",
    description: "ダッシュボードの「AI模擬面接を始める」から開始。業界・面接ラウンド・難易度を選んで練習できます。",
    href: "/mock-interview",
  },
  {
    icon: FileText,
    title: "ES添削の使い方",
    description: "設問と回答を入力するだけで、AIが4つの観点から添削。改善例や書き直し例も提供します。",
    href: "/es-review",
  },
  {
    icon: User,
    title: "パーソナリティ診断",
    description: "簡単な質問に答えるだけで、あなたの16タイプを診断。面接での強み・弱みも分析します。",
    href: "/personality",
  },
  {
    icon: CreditCard,
    title: "プラン・お支払い",
    description: "プランの確認・変更・キャンセルは設定画面から。クレジットカードで安全にお支払いいただけます。",
    href: "/settings/billing",
  },
];

export default function HelpPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <HelpCircle className="size-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            ヘルプセンター
          </h1>
        </div>
        <p className="text-muted-foreground">
          InterviewCoach の使い方やよくある質問をまとめています
        </p>
      </div>

      {/* ガイドセクション */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">使い方ガイド</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {GUIDE_SECTIONS.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex items-start gap-3 p-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: "var(--brand-navy)" }}
                  >
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{section.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">よくある質問</h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-start gap-2 text-sm">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  {item.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* お問い合わせ */}
      <section>
        <Card className="card-accent-top">
          <CardContent className="flex flex-col items-center gap-4 py-8 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <h2 className="font-semibold">解決しませんでしたか？</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                お気軽にお問い合わせください。不具合報告や機能リクエストも受け付けています。
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/contact">
                <Mail className="mr-2 h-4 w-4" />
                お問い合わせ
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
