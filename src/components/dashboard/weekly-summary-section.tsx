import {
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  BarChart3,
  Calendar,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getRemainingUsage } from "@/lib/subscription";
import { cn } from "@/lib/utils";

interface WeeklySummarySectionProps {
  userId: string;
}

/**
 * 週次進捗サマリーの async Server Component
 * ダッシュボード上部に配置し、Suspense 境界内でデータ取得 + レンダリングを行う
 */
export async function WeeklySummarySection({
  userId,
}: WeeklySummarySectionProps) {
  const supabase = await createClient();

  // ---------- 期間の計算 ----------
  const now = new Date();
  // 今週の月曜日を起点にする
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - mondayOffset);
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const thisWeekStartISO = thisWeekStart.toISOString();
  const lastWeekStartISO = lastWeekStart.toISOString();
  const thisWeekEndISO = now.toISOString();

  // ---------- データ取得（並列） ----------
  const [thisWeekResult, lastWeekResult, streakResult, usageResult] =
    await Promise.all([
      // 今週のフィードバック
      supabase
        .from("feedbacks")
        .select("overall_score, created_at")
        .eq("user_id", userId)
        .gte("created_at", thisWeekStartISO)
        .lte("created_at", thisWeekEndISO),
      // 先週のフィードバック
      supabase
        .from("feedbacks")
        .select("overall_score, created_at")
        .eq("user_id", userId)
        .gte("created_at", lastWeekStartISO)
        .lt("created_at", thisWeekStartISO),
      // ストリーク計算用: 直近30日のフィードバック日
      supabase
        .from("feedbacks")
        .select("created_at")
        .eq("user_id", userId)
        .gte(
          "created_at",
          new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 30
          ).toISOString()
        )
        .order("created_at", { ascending: false }),
      // 残り利用回数
      getRemainingUsage(userId),
    ]);

  const thisWeekFeedbacks = (thisWeekResult.data ?? []) as {
    overall_score: number;
    created_at: string;
  }[];
  const lastWeekFeedbacks = (lastWeekResult.data ?? []) as {
    overall_score: number;
    created_at: string;
  }[];
  const streakFeedbacks = (streakResult.data ?? []) as {
    created_at: string;
  }[];

  // ---------- 今週の分析回数 ----------
  const thisWeekCount = thisWeekFeedbacks.length;
  const lastWeekCount = lastWeekFeedbacks.length;
  const countDiff = thisWeekCount - lastWeekCount;

  // ---------- 今週の平均スコア ----------
  const thisWeekScores = thisWeekFeedbacks.map((f) => f.overall_score);
  const lastWeekScores = lastWeekFeedbacks.map((f) => f.overall_score);

  const thisWeekAvg =
    thisWeekScores.length > 0
      ? Math.round(
          (thisWeekScores.reduce((a, b) => a + b, 0) / thisWeekScores.length) *
            10
        ) / 10
      : null;
  const lastWeekAvg =
    lastWeekScores.length > 0
      ? Math.round(
          (lastWeekScores.reduce((a, b) => a + b, 0) / lastWeekScores.length) *
            10
        ) / 10
      : null;

  const scoreDiff =
    thisWeekAvg !== null && lastWeekAvg !== null
      ? Math.round((thisWeekAvg - lastWeekAvg) * 10) / 10
      : null;

  // ---------- 連続利用日数（ストリーク） ----------
  const streak = calculateStreak(streakFeedbacks, now);

  // ---------- 残り利用回数 ----------
  const remainingText =
    usageResult.remaining !== null
      ? `${usageResult.remaining}回`
      : "無制限";

  // ---------- モチベーションメッセージ ----------
  const motivationMessage = getMotivationMessage(
    thisWeekCount,
    scoreDiff,
    streak
  );

  return (
    <div className="mt-6 space-y-3">
      {/* サマリーカードグリッド */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* 今週の分析回数 */}
        <Card className="py-4">
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" />
              今週の分析回数
            </div>
            <p className="text-2xl font-bold">{thisWeekCount}回</p>
            {lastWeekCount > 0 || countDiff !== 0 ? (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  countDiff > 0 && "text-green-600",
                  countDiff < 0 && "text-red-600",
                  countDiff === 0 && "text-muted-foreground"
                )}
              >
                {countDiff > 0 && <TrendingUp className="h-3 w-3" />}
                {countDiff < 0 && <TrendingDown className="h-3 w-3" />}
                {countDiff === 0 && <Minus className="h-3 w-3" />}
                <span>
                  {countDiff > 0 ? "+" : ""}
                  {countDiff}回
                </span>
                <span className="text-muted-foreground">前週比</span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* 今週の平均スコア */}
        <Card className="py-4">
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              今週の平均スコア
            </div>
            <p className="text-2xl font-bold">
              {thisWeekAvg !== null ? thisWeekAvg : "--"}
            </p>
            {scoreDiff !== null ? (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  scoreDiff > 0 && "text-green-600",
                  scoreDiff < 0 && "text-red-600",
                  scoreDiff === 0 && "text-muted-foreground"
                )}
              >
                {scoreDiff > 0 && <TrendingUp className="h-3 w-3" />}
                {scoreDiff < 0 && <TrendingDown className="h-3 w-3" />}
                {scoreDiff === 0 && <Minus className="h-3 w-3" />}
                <span>
                  {scoreDiff > 0 ? "+" : ""}
                  {scoreDiff}点
                </span>
                <span className="text-muted-foreground">前週比</span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* 連続利用日数 */}
        <Card className="py-4">
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Flame className="h-3.5 w-3.5" />
              連続利用日数
            </div>
            <p className="text-2xl font-bold">
              {streak}日
            </p>
            {streak >= 3 && (
              <p className="text-xs font-medium text-orange-500">
                ストリーク継続中
              </p>
            )}
          </CardContent>
        </Card>

        {/* 今月の残り回数 */}
        <Card className="py-4">
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              今月の残り回数
            </div>
            <p className="text-2xl font-bold">{remainingText}</p>
            <p className="text-xs text-muted-foreground">
              {usageResult.plan === "free"
                ? "無料プラン"
                : usageResult.plan === "pro"
                  ? "Pro プラン"
                  : "Premium プラン"}
              （{usageResult.used}回使用済み）
            </p>
          </CardContent>
        </Card>
      </div>

      {/* モチベーションメッセージ */}
      {motivationMessage && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-3">
            <Calendar className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm font-medium">{motivationMessage}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * 連続利用日数（ストリーク）を計算する
 * 今日から遡って連続して利用があった日数を返す
 */
function calculateStreak(
  feedbacks: { created_at: string }[],
  now: Date
): number {
  if (feedbacks.length === 0) return 0;

  // フィードバックの日付を一意なローカル日付文字列のセットにする
  const dateSet = new Set<string>();
  for (const f of feedbacks) {
    const d = new Date(f.created_at);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    dateSet.add(dateStr);
  }

  // 今日から遡って連続日数をカウント
  let streak = 0;
  const checkDate = new Date(now);

  // 今日にデータがなければ昨日から開始
  const todayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
  if (!dateSet.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  for (let i = 0; i < 31; i++) {
    const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
    if (dateSet.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * 状況に応じたモチベーションメッセージを返す
 */
function getMotivationMessage(
  thisWeekCount: number,
  scoreDiff: number | null,
  streak: number
): string | null {
  // ストリーク優先
  if (streak >= 7) {
    return `${streak}日連続で練習中！素晴らしい継続力です。この調子で頑張りましょう！`;
  }
  if (streak >= 3) {
    return `${streak}日連続で練習中！着実に力がついています。`;
  }

  // スコア向上
  if (scoreDiff !== null && scoreDiff > 0) {
    return `先週より${scoreDiff}点アップ！この調子で頑張りましょう。`;
  }

  // 未利用
  if (thisWeekCount === 0) {
    return "今週はまだ面接練習をしていません。1回の練習が大きな差を生みます。";
  }

  // スコア下降
  if (scoreDiff !== null && scoreDiff < 0) {
    return "スコアが少し下がりましたが、練習を続けることが大切です。次こそベストを出しましょう！";
  }

  return null;
}
