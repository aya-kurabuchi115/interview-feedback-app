import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * プラン管理ページのスケルトンスクリーン
 * 実際のレイアウトに近い形状でローディング状態を表示する
 */
export default function BillingLoading() {
  return (
    <div role="status" aria-label="読み込み中" className="px-4 py-16">
      <div className="mx-auto max-w-2xl">
        {/* ヘッダー */}
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-2 h-5 w-72 max-w-full" />

        <div className="mt-8 space-y-6">
          {/* 現在のプランカード */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              <Skeleton className="mt-1 h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-1 h-4 w-32" />
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Skeleton className="h-10 w-32 rounded-md" />
              <Skeleton className="h-10 w-44 rounded-md" />
            </CardFooter>
          </Card>

          {/* 利用状況カード */}
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-36" />
              <Skeleton className="mt-1 h-4 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <span className="sr-only">読み込み中</span>
    </div>
  );
}
