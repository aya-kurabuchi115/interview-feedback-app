import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * プロフィール設定ページのスケルトンスクリーン
 * 実際のレイアウトに近い形状でローディング状態を表示する
 */
export default function ProfileLoading() {
  return (
    <div
      role="status"
      aria-label="読み込み中"
      className="container mx-auto max-w-2xl px-4 py-8"
    >
      {/* ヘッダー */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </div>

      {/* 基本情報カード */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-1 h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* フルネーム */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          {/* 大学名 */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          {/* 学部・学科 */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          {/* 卒業予定年・月 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 就活情報カード */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-1 h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 就活状況 */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          {/* 志望業界 */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-16 rounded-full" />
              ))}
            </div>
          </div>
          {/* 志望職種 */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 希望条件カード */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-1 h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-14 rounded-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* パーソナリティタイプカード */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-1 h-4 w-80 max-w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <Skeleton className="h-16 w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* 通知設定カード */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-1 h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <Skeleton className="h-11 w-32 rounded-md" />
      </div>

      <span className="sr-only">読み込み中</span>
    </div>
  );
}
