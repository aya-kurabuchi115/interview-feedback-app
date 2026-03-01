import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * ES添削ページのスケルトンスクリーン
 * 実際のフォームレイアウトに近い形状でローディング状態を表示する
 */
export default function ESReviewLoading() {
  return (
    <div
      role="status"
      aria-label="読み込み中"
      className="container mx-auto max-w-2xl px-4 py-8"
    >
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>

      <div className="space-y-6">
        {/* ESの設問 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full rounded-md" />
          {/* 質問例ボタン */}
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-7 rounded-full"
                style={{ width: `${80 + i * 20}px` }}
              />
            ))}
          </div>
        </div>

        {/* ESの回答 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-[250px] w-full rounded-md" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-1.5 w-24 rounded-full" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 添削ボタン */}
        <Skeleton className="h-11 w-full rounded-md" />
      </div>

      <span className="sr-only">読み込み中</span>
    </div>
  );
}
