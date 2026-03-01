import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  /** 前月比などの変化量（%）。正なら上昇、負なら下降、0 or undefined なら変化なし */
  trend?: number;
  /** トレンドの補足テキスト（例: "前月比"） */
  trendLabel?: string;
}

export function StatsCard({ label, value, trend, trendLabel }: StatsCardProps) {
  const trendDirection =
    trend === undefined || trend === 0
      ? "neutral"
      : trend > 0
        ? "up"
        : "down";

  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trendDirection === "up" && "text-green-600",
              trendDirection === "down" && "text-red-600",
              trendDirection === "neutral" && "text-muted-foreground"
            )}
          >
            {trendDirection === "up" && <TrendingUp className="h-3 w-3" />}
            {trendDirection === "down" && <TrendingDown className="h-3 w-3" />}
            {trendDirection === "neutral" && <Minus className="h-3 w-3" />}
            <span>
              {trendDirection === "up" ? "+" : ""}
              {trend.toFixed(1)}%
            </span>
            {trendLabel && (
              <span className="text-muted-foreground">{trendLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
