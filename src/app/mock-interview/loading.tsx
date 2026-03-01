import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * AI模擬面接セットアップページのスケルトンスクリーン
 * 実際のフォームレイアウトに近い形状でローディング状態を表示する
 */
export default function MockInterviewLoading() {
  return (
    <div
      role="status"
      aria-label="読み込み中"
      className="container mx-auto max-w-2xl px-4 py-8"
    >
      {/* ヘッダー */}
      <Skeleton className="mb-2 h-8 w-40" />
      <Skeleton className="mb-6 h-4 w-96 max-w-full" />

      <div className="space-y-6">
        {/* 企業名 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-72 max-w-full" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* 業界 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* 面接タイプ */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-2 h-3 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 面接ラウンド */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* 面接時間 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* 難易度 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-16" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="mt-2 h-3 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* パーソナリティタイプ */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-72 max-w-full" />
            <Skeleton className="mt-2 h-4 w-40" />
          </CardContent>
        </Card>

        {/* 送信ボタン */}
        <Skeleton className="h-11 w-full rounded-md" />
      </div>

      <span className="sr-only">読み込み中</span>
    </div>
  );
}
