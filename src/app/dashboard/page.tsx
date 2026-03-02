import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportButtons } from "@/components/export-buttons";
import { createClient } from "@/lib/supabase/server";
import { redirectToLogin } from "@/lib/auth/redirect";
import { getRemainingUsage } from "@/lib/subscription";
import type { InterviewCategory } from "@/types/database";
import type { SortOption } from "@/components/interview-filter";
import { InterviewListSection } from "@/components/dashboard/interview-list-section";
import { InterviewListSkeleton } from "@/components/dashboard/interview-list-skeleton";
import { UsageNudgeBanner } from "@/components/dashboard/usage-nudge-banner";
import { PracticeReminderBanner } from "@/components/dashboard/practice-reminder-banner";
import { WeeklySummarySection } from "@/components/dashboard/weekly-summary-section";
import { WeeklySummarySkeleton } from "@/components/dashboard/weekly-summary-skeleton";
import { GettingStartedChecklist } from "@/components/dashboard/getting-started-checklist";
import { OnboardingTour } from "@/components/dashboard/onboarding-tour";
import { t } from "@/lib/i18n";

/** ダッシュボードは常に最新データを表示（キャッシュ不可） */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: t("metadata.dashboardTitle"),
  robots: { index: false, follow: false },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 認証チェック（Promise.all の前に実行）
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await redirectToLogin();
    return null;
  }

  // --- URL パラメータ取得 ---
  const params = await searchParams;
  const categoryParam = (params.category as string) || "all";
  const sortParam = (params.sort as string) || "date_desc";
  const tagParam = (params.tag as string) || "";
  const tabParam = (params.tab as string) || "active";

  const currentCategory = [
    "arubaito",
    "intern",
    "new_grad",
    "other",
    "all",
  ].includes(categoryParam)
    ? (categoryParam as InterviewCategory | "all")
    : "all";

  const currentSort = [
    "date_desc",
    "date_asc",
    "score_desc",
    "score_asc",
  ].includes(sortParam)
    ? (sortParam as SortOption)
    : "date_desc";

  const currentTab = tabParam === "archived" ? "archived" : "active" as const;

  // 利用状況を取得（ナッジバナー用）
  const usage = await getRemainingUsage(user.id);

  // --- はじめてガイド: サーバー側で完了状態を検出 ---
  const serverCompletedItems: string[] = [];
  try {
    // プロフィール設定済みチェック（display_name が設定されているか）
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, personality_type")
      .eq("user_id", user.id)
      .single();
    if (profile?.display_name) {
      serverCompletedItems.push("profile");
    }
    // パーソナリティ診断済みチェック
    if (profile?.personality_type) {
      serverCompletedItems.push("personality");
    }

    // 面接分析済みチェック（1件以上の面接レコードがあるか）
    const { count: interviewCount } = await supabase
      .from("interviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (interviewCount && interviewCount > 0) {
      serverCompletedItems.push("interview");
    }

    // 模擬面接体験済みチェック
    const { count: mockCount } = await supabase
      .from("mock_interviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (mockCount && mockCount > 0) {
      serverCompletedItems.push("mock");
    }

    // ES添削利用済みチェック
    const { count: esCount } = await supabase
      .from("es_reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (esCount && esCount > 0) {
      serverCompletedItems.push("es");
    }
  } catch {
    // チェックリスト用データ取得エラーは無視（ガイドは表示するがサーバー側完了状態なし）
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* オンボーディングツアー（初回訪問時のみ表示） */}
      <OnboardingTour />

      {/* 練習リマインダーバナー */}
      <PracticeReminderBanner />

      {/* 利用上限ナッジバナー（Free プラン & 残り1回以下のみ表示） */}
      <UsageNudgeBanner
        plan={usage.plan}
        remaining={usage.remaining}
        limit={usage.limit}
        used={usage.used}
      />

      {/* ヘッダー（即座に表示） */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
        <div className="flex items-center gap-2">
          <Suspense
            fallback={
              <div className="h-9 w-[180px] animate-pulse rounded-md bg-muted" />
            }
          >
            <ExportButtons variant="dropdown" />
          </Suspense>
          <Button variant="outline" asChild>
            <Link href="/mock-interview">
              <MessageSquare className="mr-2 h-4 w-4" />
              {t("dashboard.mockInterview")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/interview/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("dashboard.newInterview")}
            </Link>
          </Button>
        </div>
      </div>

      {/* はじめてガイド（チェックリスト） */}
      <GettingStartedChecklist serverCompletedItems={serverCompletedItems} />

      {/* 週次進捗サマリー（Suspense 境界でストリーミング） */}
      <Suspense fallback={<WeeklySummarySkeleton />}>
        <WeeklySummarySection userId={user.id} />
      </Suspense>

      {/* 面接一覧（Suspense 境界でストリーミング） */}
      <Suspense fallback={<InterviewListSkeleton />}>
        <InterviewListSection
          userId={user.id}
          currentCategory={currentCategory}
          currentSort={currentSort}
          tagParam={tagParam}
          currentTab={currentTab}
        />
      </Suspense>
    </div>
  );
}
