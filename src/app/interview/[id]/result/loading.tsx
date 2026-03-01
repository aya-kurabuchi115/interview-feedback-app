import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ResultLoading() {
  return (
    <div role="status" aria-label="読み込み中" className="container mx-auto max-w-4xl px-4 py-8 animate-pulse">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-9 w-48 rounded-md bg-muted" />
        <div className="h-8 flex-1 rounded bg-muted" />
        <div className="h-9 w-[140px] rounded-md bg-muted" />
      </div>

      {/* タグ・メモセクション */}
      <Card className="mb-6">
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-8 w-full rounded bg-muted" />
          </div>
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-24 w-full rounded bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* スコア & カテゴリ別スコア */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col items-center py-6">
            <div className="flex flex-col items-center gap-3 rounded-xl p-8">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-20 w-24 rounded bg-muted" />
              <div className="h-3 w-12 rounded bg-muted" />
              <div className="h-2 w-48 rounded-full bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-6 w-40 rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="h-4 w-10 rounded bg-muted" />
                </div>
                <div className="h-3 w-full rounded-full bg-muted" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 良い点 & 改善点 */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-24 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-4 w-full rounded bg-muted" />
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
