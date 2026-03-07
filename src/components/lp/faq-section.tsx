"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "本当に無料で使えますか？",
    answer:
      "はい、無料プランは月3回までの面接分析が可能で、クレジットカードの登録も不要です。まずは無料プランでお試しいただき、必要に応じて有料プランにアップグレードできます。",
  },
  {
    question: "録音データは安全に管理されますか？",
    answer:
      "録音データはすべて暗号化されて保存されます。第三者への提供や広告利用は一切行いません。また、いつでもご自身のデータを削除できます。プライバシーポリシーで詳細をご確認ください。",
  },
  {
    question: "AIのフィードバックはどれくらい正確ですか？",
    answer:
      "最新のAI技術を活用し、回答の論理性・具体性・話し方・フィラーワードなど多角的に分析します。人間のキャリアアドバイザーと同等以上の観点でフィードバックを提供しますが、最終的な判断はご自身でお願いいたします。",
  },
  {
    question: "スマートフォンでも使えますか？",
    answer:
      "はい、ブラウザベースのアプリなのでスマートフォンやタブレットからもご利用いただけます。アプリのインストールは不要で、Safari や Chrome から直接アクセスできます。",
  },
  {
    question: "模擬面接機能とは何ですか？",
    answer:
      "AIが面接官役として質問を出題し、リアルタイムで面接練習ができる機能です。業界・職種に合わせた質問が出題され、回答後にすぐフィードバックを受け取れます。Pro プラン以上でご利用いただけます。",
  },
  {
    question: "解約はいつでもできますか？",
    answer:
      "はい、有料プランはいつでも解約可能です。解約後も、当月の残り期間は引き続きご利用いただけます。解約手続きはプラン管理ページから簡単に行えます。",
  },
];

export function FaqSection() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`faq-${index}`}>
          <AccordionTrigger className="text-left text-base font-semibold">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground leading-relaxed">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
