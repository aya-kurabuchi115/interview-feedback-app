import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MessageSquare, FileText, User, BookOpen, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirectToLogin } from "@/lib/auth/redirect";
import { getRemainingUsageByFeature } from "@/lib/subscription";
import { UsageNudgeBanner } from "@/components/dashboard/usage-nudge-banner";
import { MockInterviewHistory } from "@/components/dashboard/mock-interview-history";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ダッシュボード | InterviewCoach",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await redirectToLogin();
    return null;
  }

  const usage = await getRemainingUsageByFeature(user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <UsageNudgeBanner
        plan={usage.plan}
        mockInterview={usage.mockInterview}
        esReview={usage.esReview}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
      </div>

      {/* メインCTA */}
      <div className="mt-4 rounded-xl p-6 text-white" style={{ background: "linear-gradient(135deg, var(--brand-navy-dark) 0%, var(--brand-navy) 100%)" }}>
        <h2 className="text-lg font-bold">面接練習を始めよう</h2>
        <p className="mt-1 text-sm text-blue-200">AI面接官がリアルタイムで質問。本番さながらの練習ができます。</p>
        <Button asChild size="lg" className="mt-4 bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange)]/90">
          <Link href="/mock-interview">
            <MessageSquare className="mr-2 h-5 w-5" />
            AI模擬面接を始める
          </Link>
        </Button>
      </div>

      {/* クイックアクション */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link
          href="/questions"
          className="card-accent-top relative flex items-center gap-4 rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          {usage.plan !== "premium" && usage.plan !== "enterprise" && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[var(--brand-orange)] px-2 py-0.5 text-[10px] font-bold text-white">
              <Crown className="h-3 w-3" />
              Premium
            </div>
          )}
          <div className="flex h-12 w-12 items-center justify-center rounded-lg text-white" style={{ backgroundColor: "var(--brand-navy)" }}>
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">AI質問集</p>
            <p className="text-sm text-muted-foreground">面接質問を確認</p>
          </div>
        </Link>
        <Link
          href="/es-review"
          className="card-accent-top relative flex items-center gap-4 rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          {usage.plan !== "premium" && usage.plan !== "enterprise" && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[var(--brand-orange)] px-2 py-0.5 text-[10px] font-bold text-white">
              <Crown className="h-3 w-3" />
              Premium
            </div>
          )}
          <div className="flex h-12 w-12 items-center justify-center rounded-lg text-white" style={{ backgroundColor: "var(--brand-navy)" }}>
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">ES添削</p>
            <p className="text-sm text-muted-foreground">AIがESを添削</p>
          </div>
        </Link>
        <Link
          href="/personality"
          className="card-accent-top flex items-center gap-4 rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg text-white" style={{ backgroundColor: "var(--brand-navy)" }}>
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">パーソナリティ診断</p>
            <p className="text-sm text-muted-foreground">16タイプ診断</p>
          </div>
        </Link>
      </div>

      {/* 利用状況 */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card-accent-top rounded-xl border p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">模擬面接</h2>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold">{usage.mockInterview.used}</span>
            <span className="text-muted-foreground">
              / {usage.mockInterview.limit === null ? "無制限" : `${usage.mockInterview.limit}回`}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            今月の模擬面接回数（{usage.plan} プラン）
          </p>
        </div>
        <div className="card-accent-top rounded-xl border p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">ES添削</h2>
          </div>
          {usage.esReview.limit === 0 ? (
            <div className="mt-3">
              <span className="text-sm font-medium text-muted-foreground">Premium 限定</span>
            </div>
          ) : (
            <>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{usage.esReview.used}</span>
                <span className="text-muted-foreground">
                  / {usage.esReview.limit === null ? "無制限" : `${usage.esReview.limit}回`}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                今月のES添削回数（{usage.plan} プラン）
              </p>
            </>
          )}
        </div>
      </div>

      {/* AI面接の履歴 */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">面接練習の履歴</h2>
        <Suspense
          fallback={
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          }
        >
          <MockInterviewHistory userId={user.id} />
        </Suspense>
      </div>
    </div>
  );
}
