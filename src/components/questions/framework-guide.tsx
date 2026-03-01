"use client";

import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STAR_STEPS = [
  {
    label: "Situation",
    title: "状況",
    description: "いつ・どこで・どんな状況だったかを簡潔に説明します。",
    template: "私は大学○年生の時、○○で○○という状況に直面しました。",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    label: "Task",
    title: "課題",
    description: "その状況で自分に求められた役割・課題を明確にします。",
    template: "そこで私は○○という課題に取り組む必要がありました。",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  {
    label: "Action",
    title: "行動",
    description:
      "課題に対して自分がどのような行動を取ったかを具体的に説明します。",
    template: "具体的には、○○を行い、○○に取り組みました。",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  },
  {
    label: "Result",
    title: "結果",
    description: "行動の結果どうなったか、数字や評価を交えて伝えます。",
    template: "その結果、○○を達成し、○○という成果を得ることができました。",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  },
];

const PREP_STEPS = [
  {
    label: "Point",
    title: "結論",
    description: "まず結論を最初に述べます。面接官に要点を明確に伝えます。",
    template: "私の強みは○○です。",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
  {
    label: "Reason",
    title: "理由",
    description: "結論の根拠となる理由を説明します。",
    template: "なぜなら、○○という経験を通じて培ったからです。",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    label: "Example",
    title: "具体例",
    description:
      "理由を裏付ける具体的なエピソードを挙げます。数字や事実を含めると説得力が増します。",
    template: "例えば、○○の場面で○○を行い、○○という結果を出しました。",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  {
    label: "Point",
    title: "結論（再提示）",
    description: "最後に結論を繰り返し、入社後の活かし方に繋げます。",
    template:
      "この○○という強みを活かして、御社でも○○に貢献したいと考えています。",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
];

interface FrameworkStepProps {
  step: {
    label: string;
    title: string;
    description: string;
    template: string;
    color: string;
  };
  index: number;
}

function FrameworkStep({ step, index }: FrameworkStepProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step.color}`}
        >
          {index + 1}
        </span>
        {index < 3 && (
          <div className="mt-1 h-full w-0.5 bg-border" />
        )}
      </div>
      <div className="pb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-sm font-semibold">{step.label}</span>
          <span className="text-xs text-muted-foreground">({step.title})</span>
        </div>
        <p className="mb-2 text-sm text-muted-foreground">{step.description}</p>
        <div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 px-3 py-2">
          <p className="text-xs italic text-muted-foreground">
            {step.template}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FrameworkGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          回答フレームワーク
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="star">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="star" className="flex-1">
              STAR法
            </TabsTrigger>
            <TabsTrigger value="prep" className="flex-1">
              PREP法
            </TabsTrigger>
          </TabsList>
          <TabsContent value="star">
            <div className="mb-3">
              <p className="text-sm text-muted-foreground">
                経験・エピソードを構造的に伝えるフレームワークです。ガクチカや自己PRに最適です。
              </p>
            </div>
            <div className="mt-4">
              {STAR_STEPS.map((step, index) => (
                <FrameworkStep key={step.label + index} step={step} index={index} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="prep">
            <div className="mb-3">
              <p className="text-sm text-muted-foreground">
                結論ファーストで論理的に伝えるフレームワークです。志望動機や長所短所の質問に最適です。
              </p>
            </div>
            <div className="mt-4">
              {PREP_STEPS.map((step, index) => (
                <FrameworkStep key={step.label + index} step={step} index={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
