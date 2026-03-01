"use client";

import Link from "next/link";
import { ArrowRight, Zap, BarChart3, Brain, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SubscriptionPlan } from "@/types/database";

interface ProUpsellCardProps {
  plan: SubscriptionPlan;
}

/** Pro/Premium の特徴比較アイテム */
const UPGRADE_FEATURES = [
  {
    icon: BarChart3,
    label: "月30回まで分析",
    description: "Free の10倍。毎日の面接練習に",
  },
  {
    icon: Brain,
    label: "高精度 AI モデル",
    description: "Claude Sonnet によるより的確なフィードバック",
  },
  {
    icon: Zap,
    label: "成長トラッキング",
    description: "スコア推移をグラフで可視化",
  },
  {
    icon: Infinity,
    label: "パーソナライズ分析",
    description: "あなたの弱点に合わせたアドバイス",
  },
];

/**
 * 分析結果ページ下部に表示する Pro プランアップセルカード。
 * Free プランユーザーにのみ表示する。
 */
export function ProUpsellCard({ plan }: ProUpsellCardProps) {
  // Free プラン以外は表示しない
  if (plan !== "free") return null;

  return (
    <Card className="mt-8 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-900 dark:from-blue-950/30 dark:to-indigo-950/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Zap className="h-5 w-5" />
          Pro プランでさらに詳細な分析を
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {UPGRADE_FEATURES.map((feature) => (
            <div key={feature.label} className="flex items-start gap-2">
              <feature.icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {feature.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button size="sm" asChild>
            <Link href="/pricing">
              料金プランを見る
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <span className="text-xs text-muted-foreground">
            月額 ¥980 から
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
