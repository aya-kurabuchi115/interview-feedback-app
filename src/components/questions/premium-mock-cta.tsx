"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mic, Lock, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export function PremiumMockCta() {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPlan = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsPremium(false);
          return;
        }
        const res = await fetch("/api/subscription");
        if (res.ok) {
          const data = await res.json();
          const plan = data.subscription?.plan ?? "free";
          setIsPremium(plan === "premium" || plan === "enterprise");
        } else {
          setIsPremium(false);
        }
      } catch {
        setIsPremium(false);
      }
    };
    checkPlan();
  }, []);

  if (isPremium === null) {
    return (
      <Card className="border-primary">
        <CardContent className="flex flex-col items-center gap-4 py-8 sm:flex-row sm:justify-between">
          <div>
            <div className="h-5 w-48 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-11 w-36 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (isPremium) {
    return (
      <Card className="border-primary">
        <CardContent className="flex flex-col items-center gap-4 py-8 sm:flex-row sm:justify-between">
          <div>
            <h3 className="font-semibold">この質問で模擬面接を練習する</h3>
            <p className="text-sm text-muted-foreground">
              AIと一緒に面接練習をして、フィードバックを受けましょう
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/mock-interview">
              <Mic className="mr-2 size-4" />
              模擬面接を始める
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary">
      <CardContent className="flex flex-col items-center gap-4 py-8">
        <div className="text-center">
          <h3 className="font-semibold">この質問で模擬面接を練習する</h3>
          <p className="text-sm text-muted-foreground">
            AIと一緒に面接練習をして、フィードバックを受けましょう
          </p>
        </div>
        <Button size="lg" disabled>
          <Lock className="mr-2 size-4" />
          模擬面接を始める
        </Button>
        <div className="rounded-lg border border-[var(--brand-orange)]/30 bg-[var(--brand-orange)]/5 px-4 py-3 text-center">
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-orange)] px-3 py-1 text-xs font-semibold text-white">
            <Crown className="h-3.5 w-3.5" />
            Premium 限定機能
          </div>
          <p className="text-xs text-muted-foreground">
            質問集からの模擬面接は Premium プランでご利用いただけます
          </p>
          <Button asChild size="sm" className="mt-2 bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange)]/90">
            <Link href="/pricing">
              <Sparkles className="mr-2 h-4 w-4" />
              Premium にアップグレード
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
