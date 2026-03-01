import Link from "next/link";
import { ArrowLeft, TrendingUp, Plus, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { redirectToLogin } from "@/lib/auth/redirect";
import { StatsCard } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryScores } from "@/types/database";
import type { Json } from "@/types/database";

import { CATEGORY_LABELS } from "@/lib/constants";

// 面接カテゴリの日本語ラベル
const INTERVIEW_CATEGORY_LABELS: Record<string, string> = {
  arubaito: "アルバイト",
  intern: "インターン",
  new_grad: "新卒",
  other: "その他",
};

export const metadata = {
  title: "成長記録 | InterviewCoach",
};

export default async function GrowthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await redirectToLogin();
    return null;
  }

  // 面接データ + フィードバックを取得（completed のみ、自分のデータのみ）
  const { data: interviews } = await supabase
    .from("interviews")
    .select("id, title, company_name_snapshot, interview_category, interview_date, created_at, status")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: true });

  const interviewList = (interviews ?? []) as {
    id: string;
    title: string;
    company_name_snapshot: string;
    interview_category: string;
    interview_date: string | null;
    created_at: string;
    status: string;
  }[];
  const interviewIds = interviewList.map((i) => i.id);

  // フィードバックを一括取得
  // 面接IDが0件の場合はクエリをスキップし、空配列として扱う
  // Defence-in-Depth: RLS に加えアプリケーション層でも user_id フィルタ
  const { data: feedbacks } = interviewIds.length > 0
    ? await supabase
        .from("feedbacks")
        .select("interview_id, overall_score, category_scores, filler_words, created_at")
        .in("interview_id", interviewIds)
        .eq("user_id", user.id)
    : { data: null };

  const feedbackList = (feedbacks ?? []) as {
    interview_id: string;
    overall_score: number;
    category_scores: CategoryScores | null;
    filler_words: Json;
    created_at: string;
  }[];

  // interview_id → feedback のマップ
  const feedbackMap = new Map(
    feedbackList.map((f) => [f.interview_id, f])
  );

  // ---------- 統計計算 ----------

  const totalInterviews = interviewList.length;
  const scores = feedbackList.map((f) => f.overall_score);
  const avgScore =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;

  // 前月比: 今月の平均スコア vs 先月の平均スコア
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthScores = feedbackList
    .filter((f) => new Date(f.created_at) >= thisMonthStart)
    .map((f) => f.overall_score);
  const lastMonthScores = feedbackList
    .filter(
      (f) =>
        new Date(f.created_at) >= lastMonthStart &&
        new Date(f.created_at) < thisMonthStart
    )
    .map((f) => f.overall_score);

  const thisMonthAvg =
    thisMonthScores.length > 0
      ? thisMonthScores.reduce((a, b) => a + b, 0) / thisMonthScores.length
      : null;
  const lastMonthAvg =
    lastMonthScores.length > 0
      ? lastMonthScores.reduce((a, b) => a + b, 0) / lastMonthScores.length
      : null;

  const monthOverMonthChange =
    thisMonthAvg !== null && lastMonthAvg !== null && lastMonthAvg > 0
      ? ((thisMonthAvg - lastMonthAvg) / lastMonthAvg) * 100
      : undefined;

  // ---------- カテゴリ別平均スコア ----------

  const categoryTotals: Record<string, { sum: number; count: number }> = {};
  for (const f of feedbackList) {
    const cs = f.category_scores;
    if (!cs) continue;
    for (const [key, val] of Object.entries(cs)) {
      if (typeof val !== "number") continue;
      if (!categoryTotals[key]) {
        categoryTotals[key] = { sum: 0, count: 0 };
      }
      categoryTotals[key].sum += val;
      categoryTotals[key].count += 1;
    }
  }

  const categoryAverages = Object.entries(categoryTotals)
    .map(([key, { sum, count }]) => ({
      key,
      label: CATEGORY_LABELS[key] ?? key,
      avg: Math.round((sum / count) * 10) / 10,
      count,
    }))
    .sort((a, b) => b.avg - a.avg);

  // ---------- 企業別平均スコア ----------

  const companyScores: Record<string, { sum: number; count: number }> = {};
  for (const interview of interviewList) {
    const fb = feedbackMap.get(interview.id);
    if (!fb) continue;
    const company = interview.company_name_snapshot || "不明";
    if (!companyScores[company]) {
      companyScores[company] = { sum: 0, count: 0 };
    }
    companyScores[company].sum += fb.overall_score;
    companyScores[company].count += 1;
  }

  const companyAverages = Object.entries(companyScores)
    .map(([name, { sum, count }]) => ({
      name,
      avg: Math.round((sum / count) * 10) / 10,
      count,
    }))
    .sort((a, b) => b.avg - a.avg);

  // ---------- 直近10件のスコア推移 ----------

  const recentFeedbacks = [...feedbackList]
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .slice(-10);

  const recentScores = recentFeedbacks.map((f) => {
    const interview = interviewList.find((i) => i.id === f.interview_id);
    return {
      score: f.overall_score,
      date: new Date(f.created_at).toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
      }),
      title: interview?.title ?? "",
    };
  });

  // ---------- フィラー率推移（直近10件） ----------

  /** filler_words カラムからフィラー率を安全に取得する */
  function extractFillerRate(fw: Json): number | null {
    if (fw && typeof fw === "object" && !Array.isArray(fw)) {
      const obj = fw as Record<string, Json | undefined>;
      if (typeof obj.filler_rate === "number") return obj.filler_rate;
    }
    // 旧形式（配列）の場合はフィラー率が不明なので null
    return null;
  }

  function extractFillerTotalCount(fw: Json): number {
    if (fw && typeof fw === "object" && !Array.isArray(fw)) {
      const obj = fw as Record<string, Json | undefined>;
      if (typeof obj.total_count === "number") return obj.total_count;
    }
    if (Array.isArray(fw)) {
      let total = 0;
      for (const item of fw) {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          const d = item as Record<string, Json | undefined>;
          if (typeof d.count === "number") total += d.count;
        }
      }
      return total;
    }
    return 0;
  }

  const recentFillerData = recentFeedbacks.map((f) => {
    const interview = interviewList.find((i) => i.id === f.interview_id);
    return {
      fillerRate: extractFillerRate(f.filler_words),
      fillerCount: extractFillerTotalCount(f.filler_words),
      date: new Date(f.created_at).toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
      }),
      title: interview?.title ?? "",
    };
  });

  // フィラー率の平均
  const fillerRatesWithData = feedbackList
    .map((f) => extractFillerRate(f.filler_words))
    .filter((r): r is number => r !== null);
  const avgFillerRate =
    fillerRatesWithData.length > 0
      ? Math.round(
          (fillerRatesWithData.reduce((a, b) => a + b, 0) / fillerRatesWithData.length) * 10
        ) / 10
      : null;

  const barMaxScore = 100;

  // 空状態チェック
  if (totalInterviews === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            ダッシュボードに戻る
          </Link>
        </div>
        <h1 className="text-2xl font-bold">成長記録</h1>
        <EmptyState
          icon={TrendingUp}
          title="成長を記録していきましょう！"
          description="面接を記録してフィードバックを受けると、ここにスコア推移や分析結果が表示されます。まず1回面接を登録してみましょう。"
          primaryAction={{
            label: "面接を記録する",
            href: "/interview/new",
            icon: Plus,
          }}
          secondaryActions={[
            {
              label: "AI模擬面接を試す",
              href: "/mock-interview",
              icon: MessageSquare,
            },
          ]}
          className="mt-8"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ナビゲーション */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          ダッシュボードに戻る
        </Link>
      </div>

      <h1 className="text-2xl font-bold">成長記録</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        面接フィードバックをもとにした成長の可視化
      </p>

      {/* 統計サマリ */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="総面接数" value={totalInterviews} />
        <StatsCard
          label="平均スコア"
          value={avgScore}
          trend={monthOverMonthChange}
          trendLabel="前月比"
        />
        <StatsCard label="最高スコア" value={maxScore} />
        <StatsCard
          label="今月の面接数"
          value={thisMonthScores.length}
        />
      </div>

      {/* 直近10件のスコア推移 (CSS バーチャート) */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>スコア推移（直近10件）</CardTitle>
        </CardHeader>
        <CardContent>
          {recentScores.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              フィードバックデータが蓄積されると、ここにスコア推移が表示されます。
            </p>
          ) : (
            <div className="space-y-3">
              {recentScores.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs text-muted-foreground text-right">
                    {item.date}
                  </span>
                  <div className="relative flex-1 h-7 rounded bg-muted overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded bg-primary transition-all"
                      style={{
                        width: `${Math.max((item.score / barMaxScore) * 100, 2)}%`,
                      }}
                    />
                    <span className="relative z-10 flex h-full items-center px-2 text-xs font-medium">
                      {item.score}点
                      {item.title && (
                        <span className="ml-2 truncate text-muted-foreground">
                          {item.title}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* カテゴリ別平均スコア */}
        <Card>
          <CardHeader>
            <CardTitle>カテゴリ別平均スコア</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryAverages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                カテゴリ別スコアのデータがまだありません。
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium">カテゴリ</th>
                      <th className="pb-2 font-medium text-right">平均スコア</th>
                      <th className="pb-2 font-medium text-right">件数</th>
                      <th className="pb-2 font-medium w-1/3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryAverages.map((cat) => (
                      <tr key={cat.key} className="border-b last:border-0">
                        <td className="py-2">{cat.label}</td>
                        <td className="py-2 text-right font-mono">
                          {cat.avg}
                        </td>
                        <td className="py-2 text-right text-muted-foreground">
                          {cat.count}
                        </td>
                        <td className="py-2 pl-4">
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: `${Math.max(cat.avg, 2)}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 企業別平均スコア */}
        <Card>
          <CardHeader>
            <CardTitle>企業別平均スコア</CardTitle>
          </CardHeader>
          <CardContent>
            {companyAverages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                企業別スコアのデータがまだありません。
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium">企業名</th>
                      <th className="pb-2 font-medium text-right">平均スコア</th>
                      <th className="pb-2 font-medium text-right">面接数</th>
                      <th className="pb-2 font-medium w-1/3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyAverages.map((company) => (
                      <tr
                        key={company.name}
                        className="border-b last:border-0"
                      >
                        <td className="py-2">{company.name}</td>
                        <td className="py-2 text-right font-mono">
                          {company.avg}
                        </td>
                        <td className="py-2 text-right text-muted-foreground">
                          {company.count}
                        </td>
                        <td className="py-2 pl-4">
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: `${Math.max(company.avg, 2)}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* フィラー率推移 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>フィラー率の推移（直近10件）</CardTitle>
          {avgFillerRate !== null && (
            <p className="text-sm text-muted-foreground">
              平均フィラー率: {avgFillerRate}%
              {avgFillerRate <= 2
                ? " — 少なめで好印象です"
                : avgFillerRate <= 5
                  ? " — 標準的な範囲です"
                  : " — やや多め。意識的に間を置きましょう"}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {recentFillerData.every((d) => d.fillerRate === null) ? (
            <p className="text-sm text-muted-foreground">
              フィラー分析データが蓄積されると、ここにフィラー率の推移が表示されます。
            </p>
          ) : (
            <div className="space-y-3">
              {recentFillerData.map((item, i) => {
                const rate = item.fillerRate ?? 0;
                // フィラー率のバー表示（最大10%で100%幅）
                const barWidth = Math.min(Math.max((rate / 10) * 100, 2), 100);
                const barColor =
                  rate <= 2
                    ? "bg-green-400 dark:bg-green-500"
                    : rate <= 5
                      ? "bg-yellow-400 dark:bg-yellow-500"
                      : "bg-red-400 dark:bg-red-500";
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-xs text-muted-foreground text-right">
                      {item.date}
                    </span>
                    <div className="relative flex-1 h-7 rounded bg-muted overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded ${barColor} transition-all`}
                        style={{ width: `${barWidth}%` }}
                      />
                      <span className="relative z-10 flex h-full items-center px-2 text-xs font-medium">
                        {item.fillerRate !== null ? `${item.fillerRate}%` : "—"}
                        <span className="ml-1 text-muted-foreground">
                          ({item.fillerCount}回)
                        </span>
                        {item.title && (
                          <span className="ml-2 truncate text-muted-foreground">
                            {item.title}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 面接カテゴリ別の件数内訳 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>面接カテゴリ別の件数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(
              interviewList.reduce<Record<string, number>>((acc, i) => {
                const cat = i.interview_category || "other";
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
              }, {})
            ).map(([cat, count]) => (
              <div
                key={cat}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="text-sm font-medium">
                  {INTERVIEW_CATEGORY_LABELS[cat] ?? cat}
                </span>
                <span className="text-lg font-bold">{count}件</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
