import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** EmptyState のバリアント */
export type EmptyStateVariant = "empty" | "no-results";

export interface EmptyStateAction {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export interface EmptyStateProps {
  /** メインアイコン（Lucide） */
  icon: LucideIcon;
  /** タイトルテキスト */
  title: string;
  /** 説明文 */
  description: string;
  /** プライマリCTAボタン */
  primaryAction: EmptyStateAction;
  /** セカンダリCTAボタン（1〜2個） */
  secondaryActions?: EmptyStateAction[];
  /** バリアント: "empty"（データ0件）/ "no-results"（フィルタ結果0件） */
  variant?: EmptyStateVariant;
  /** 追加の className */
  className?: string;
}

/**
 * 空状態（Empty State）の統一デザインコンポーネント
 *
 * データが0件の場合に、ガイダンスメッセージとCTAを表示する。
 * フィルタ適用で結果0件の場合は variant="no-results" を使用。
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryActions,
  variant = "empty",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed p-12 text-center",
        "animate-in fade-in duration-500",
        className,
      )}
    >
      {/* アイコン — 穏やかなフェードイン */}
      <div className="animate-in fade-in zoom-in-50 duration-700 delay-150">
        <Icon
          className={cn(
            "mx-auto h-16 w-16",
            variant === "no-results"
              ? "text-muted-foreground/40"
              : "text-primary/60",
          )}
          strokeWidth={1.5}
        />
      </div>

      {/* タイトル */}
      <h2 className="mt-5 text-lg font-semibold">{title}</h2>

      {/* 説明 */}
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>

      {/* アクションボタン群 */}
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {/* プライマリ CTA */}
        <Button asChild>
          <Link href={primaryAction.href}>
            {primaryAction.icon && (
              <primaryAction.icon className="mr-2 h-4 w-4" />
            )}
            {primaryAction.label}
          </Link>
        </Button>

        {/* セカンダリ CTA */}
        {secondaryActions?.map((action) => (
          <Button key={action.href} variant="outline" asChild>
            <Link href={action.href}>
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              {action.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
