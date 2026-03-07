import Link from "next/link";
import { Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { PLANS } from "@/lib/stripe/config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradeButton } from "./upgrade-button";
import type { SubscriptionPlan } from "@/types/database";

export const metadata = { title: "料金プラン | Menpass" };

/** Free プランで利用不可の機能一覧 */
const FREE_EXCLUDED_FEATURES = [
  "成長トラッキング",
  "パーソナライズ分析",
  "AI 模擬面接",
  "優先処理",
];

/** Pro プランで利用不可の機能一覧 */
const PRO_EXCLUDED_FEATURES = [
  "AI 模擬面接（無制限）",
  "優先処理",
];

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未ログインでも料金ページは閲覧可能
  let currentPlan: SubscriptionPlan | null = null;
  if (user) {
    const sub = await getUserSubscription(user.id);
    currentPlan = sub.plan;
  }

  /** 指定プランが現在のプランか */
  function isCurrentPlan(plan: string): boolean {
    return currentPlan === plan;
  }

  /** 指定プラン以上か（アップグレード不要か） */
  function isAtLeast(plan: SubscriptionPlan): boolean {
    const order: SubscriptionPlan[] = ["free", "pro", "premium", "enterprise"];
    if (!currentPlan) return false;
    return order.indexOf(currentPlan) >= order.indexOf(plan);
  }

  return (
    <div className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">料金プラン</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            まずは無料プランでお試しください
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {/* ============================================================ */}
          {/* 無料プラン */}
          {/* ============================================================ */}
          <Card className="flex flex-col border-2">
            <CardHeader>
              <CardTitle className="text-2xl">{PLANS.free.name}</CardTitle>
              <CardDescription className="text-base">
                {PLANS.free.description}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">¥0</span>
                <span className="text-muted-foreground">/月</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {PLANS.free.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-primary" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
                {FREE_EXCLUDED_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <X className="size-5 shrink-0 text-muted-foreground/40" />
                    <span className="text-sm text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isCurrentPlan("free") ? (
                <Badge variant="secondary" className="w-full justify-center py-2 text-sm">
                  現在のプラン
                </Badge>
              ) : !user ? (
                <Button variant="outline" className="w-full" size="lg" asChild>
                  <Link href="/signup">無料で始める</Link>
                </Button>
              ) : null}
            </CardFooter>
          </Card>

          {/* ============================================================ */}
          {/* Pro プラン */}
          {/* ============================================================ */}
          <Card className="relative flex flex-col border-2 border-primary shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="px-4 py-1 text-sm">{PLANS.pro.badge}</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{PLANS.pro.name}</CardTitle>
              <CardDescription className="text-base">
                {PLANS.pro.description}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ¥{PLANS.pro.priceMonthly.toLocaleString()}
                </span>
                <span className="text-muted-foreground">/月</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {PLANS.pro.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-primary" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
                {PRO_EXCLUDED_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <X className="size-5 shrink-0 text-muted-foreground/40" />
                    <span className="text-sm text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isCurrentPlan("pro") ? (
                <Badge variant="secondary" className="w-full justify-center py-2 text-sm">
                  現在のプラン
                </Badge>
              ) : isAtLeast("pro") ? null : user ? (
                <UpgradeButton planKey="pro" label="Pro にアップグレード" />
              ) : (
                <Button className="w-full" size="lg" asChild>
                  <Link href="/signup">Pro で始める</Link>
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* ============================================================ */}
          {/* Premium プラン */}
          {/* ============================================================ */}
          <Card className="relative flex flex-col border-2 border-violet-500/50 shadow-md">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="secondary" className="bg-violet-100 px-4 py-1 text-sm text-violet-700">
                {PLANS.premium.badge}
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{PLANS.premium.name}</CardTitle>
              <CardDescription className="text-base">
                {PLANS.premium.description}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ¥{PLANS.premium.priceMonthly.toLocaleString()}
                </span>
                <span className="text-muted-foreground">/月</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {PLANS.premium.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-violet-600" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isCurrentPlan("premium") || isCurrentPlan("enterprise") ? (
                <Badge variant="secondary" className="w-full justify-center py-2 text-sm">
                  現在のプラン
                </Badge>
              ) : user ? (
                <UpgradeButton planKey="premium" label="Premium にアップグレード" variant="violet" />
              ) : (
                <Button className="w-full bg-violet-600 hover:bg-violet-700" size="lg" asChild>
                  <Link href="/signup">Premium で始める</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
