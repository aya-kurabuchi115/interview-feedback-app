import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * 成長記録ページのスケルトン表示
 * Suspense の fallback として使用
 */
export function GrowthStatsSkeleton() {
  return (
    <>
      {/* 統計サマリ */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="py-4">
            <CardContent className="flex flex-col gap-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* スコア推移 */}
      <Card className="mt-8">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-16 h-4" />
                <Skeleton className="flex-1 h-7 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* カテゴリ別 + 企業別 */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="flex-1 h-2 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* フィラー率推移 */}
      <Card className="mt-8">
        <CardHeader>
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-16 h-4" />
                <Skeleton className="flex-1 h-7 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* カテゴリ別件数 */}
      <Card className="mt-8">
        <CardHeader>
          <Skeleton className="h-6 w-44" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-10" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
