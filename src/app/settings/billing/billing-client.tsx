"use client";
import { useState } from "react";
import Link from "next/link";
import { CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/database";

interface BillingClientProps {
  plan: SubscriptionPlan; status: SubscriptionStatus; planName: string; priceMonthly: number;
  currentPeriodEnd: string | null; cancelAt: string | null; canceledAt: string | null;
  hasStripeCustomer: boolean; usageUsed: number; usageLimit: number | null; usageRemaining: number | null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

function getStatusBadge(status: SubscriptionStatus) {
  const variants: Record<SubscriptionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: "有効", variant: "default" }, trialing: { label: "トライアル", variant: "secondary" },
    past_due: { label: "支払い遅延", variant: "destructive" }, canceled: { label: "キャンセル済み", variant: "outline" },
    unpaid: { label: "未払い", variant: "destructive" }, incomplete: { label: "未完了", variant: "outline" },
    incomplete_expired: { label: "期限切れ", variant: "destructive" }, paused: { label: "一時停止", variant: "outline" },
  };
  const config = variants[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/** アップグレードの案内文を返す */
function getUpgradeMessage(plan: SubscriptionPlan): string {
  if (plan === "free") {
    return "上位プランにアップグレードすると、より多くの分析をご利用いただけます。";
  }
  if (plan === "pro") {
    return "Premium プランにアップグレードすると無制限でご利用いただけます。";
  }
  return "";
}

export function BillingClient({ plan, status, planName, priceMonthly, currentPeriodEnd, cancelAt, canceledAt, hasStripeCustomer, usageUsed, usageLimit, usageRemaining }: BillingClientProps) {
  const [portalLoading, setPortalLoading] = useState(false);
  const handleOpenPortal = async () => {
    try {
      setPortalLoading(true);
      const response = await fetch("/api/stripe/portal", { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ポータルの表示に失敗しました");
      if (data.url) window.location.href = data.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : "ポータルの表示に失敗しました");
    } finally {
      setPortalLoading(false);
    }
  };

  const isCanceled = !!canceledAt || !!cancelAt;
  const usagePercent = usageLimit !== null ? Math.min(100, (usageUsed / usageLimit) * 100) : 0;
  const canUpgrade = plan === "free" || plan === "pro";

  return (
    <div className="mt-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">現在のプラン</CardTitle>
            {getStatusBadge(status)}
          </div>
          <CardDescription>{planName} - ¥{priceMonthly.toLocaleString()}/月</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPeriodEnd && (
            <div>
              <p className="text-sm text-muted-foreground">{isCanceled ? "プラン終了日" : "次回請求日"}</p>
              <p className="text-sm font-medium">{formatDate(currentPeriodEnd)}</p>
            </div>
          )}
          {isCanceled && cancelAt && (
            <div className="rounded-md bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">このプランは {formatDate(cancelAt)} にキャンセルされます。</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-3">
          {canUpgrade ? (
            <Button asChild><Link href="/pricing">アップグレード</Link></Button>
          ) : null}
          {hasStripeCustomer ? (
            <Button variant="outline" onClick={handleOpenPortal} disabled={portalLoading}>
              <CreditCard className="mr-2 size-4" />
              {portalLoading ? "読み込み中..." : "支払い・プラン管理"}
              <ExternalLink className="ml-2 size-3" />
            </Button>
          ) : null}
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">今月の利用状況</CardTitle>
          <CardDescription>{usageLimit !== null ? `月間 ${usageLimit} 回まで利用可能` : "無制限"}</CardDescription>
        </CardHeader>
        <CardContent>
          {usageLimit !== null ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>{usageUsed} / {usageLimit} 回使用</span>
                <span className="text-muted-foreground">残り {usageRemaining} 回</span>
              </div>
              <Progress value={usagePercent} className="h-2" />
              {usageRemaining === 0 && (
                <p className="text-sm text-destructive" role="alert" aria-live="assertive">
                  今月の利用回数に達しました。
                  <Link href="/pricing" className="ml-1 font-medium underline underline-offset-4">
                    {getUpgradeMessage(plan) ? "上位プランにアップグレード" : "プランを確認"}
                  </Link>
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">今月 {usageUsed} 回使用しました（無制限）</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
