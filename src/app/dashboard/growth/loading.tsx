import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function GrowthLoading() {
  return (
    <div role="status" aria-label="読み込み中" className="container mx-auto px-4 py-8 animate-pulse">
      {/* ナビゲーション */}
      <div className="mb-6">
        <div className="h-4 w-40 rounded bg-muted" />
      </div>

      <div className="h-8 w-32 rounded bg-muted" />
      <div className="mt-1 h-4 w-64 rounded bg-muted" />

      {/* 統計サマリ */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="py-4">
            <CardContent className="flex flex-col gap-1">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-8 w-16 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* スコア推移 */}
      <Card className="mt-8">
        <CardHeader>
          <div className="h-6 w-48 rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-16 rounded bg-muted" />
                <div className="h-7 flex-1 rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* カテゴリ別・企業別 */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-40 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-6 w-full rounded bg-muted" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <span className="sr-only">読み込み中</span>
    </div>
  );
}
