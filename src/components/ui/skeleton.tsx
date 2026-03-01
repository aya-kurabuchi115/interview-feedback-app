import { cn } from "@/lib/utils";

/**
 * スケルトンスクリーン用の汎用コンポーネント
 * animate-pulse + bg-muted で統一されたローディングプレースホルダーを提供する
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
