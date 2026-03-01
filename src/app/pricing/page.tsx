import { redirect } from "next/navigation";
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

export const metadata = { title: "料金プラン | InterviewCoach" };

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未ログインでも料金ページは閲覧可能
  let currentPlan: string | null = null;
  if (user) {
    const sub = await getUserSubscription(user.id);
    currentPlan = sub.plan;
  }

  const isPro = currentPlan === "pro" || currentPlan === "enterprise";

  return (
    <div className="px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">料金プラン</h1>
          <p className="mt-4 text-lg text-muted-foreground">まずは無料プランでお試しください</p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {/* 無料プラン */}
          <Card className="flex flex-col border-2">
            <CardHeader>
              <CardTitle className="text-2xl">{PLANS.free.name}</CardTitle>
              <CardDescription className="text-base">まずは気軽に試したい方へ</CardDescription>
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
                <li className="flex items-center gap-3">
                  <X className="size-5 shrink-0 text-muted-foreground/40" />
                  <span className="text-sm text-muted-foreground">成長トラッキング</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="size-5 shrink-0 text-muted-foreground/40" />
                  <span className="text-sm text-muted-foreground">パーソナライズ分析</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {currentPlan === "free" ? (
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

          {/* Pro プラン */}
          <Card className="relative flex flex-col border-2 border-primary shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="px-4 py-1 text-sm">おすすめ</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{PLANS.pro.name}</CardTitle>
              <CardDescription className="text-base">本気で面接対策したい方へ</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">¥{PLANS.pro.priceMonthly.toLocaleString()}</span>
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
              </ul>
            </CardContent>
            <CardFooter>
              {isPro ? (
                <Badge variant="secondary" className="w-full justify-center py-2 text-sm">
                  現在のプラン
                </Badge>
              ) : user ? (
                <UpgradeButton />
              ) : (
                <Button className="w-full" size="lg" asChild>
                  <Link href="/signup">Pro で始める</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
