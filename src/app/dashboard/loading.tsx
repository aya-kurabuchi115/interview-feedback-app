import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-[180px] animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-[160px] animate-pulse rounded-md bg-muted" />
        </div>
      </div>

      {/* フィルタ */}
      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>
      </div>

      {/* カード一覧 */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="mt-2 flex gap-1.5">
                <div className="h-5 w-16 rounded-full bg-muted" />
                <div className="h-5 w-12 rounded-full bg-muted" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-16 rounded bg-muted" />
                  <div className="h-3 w-10 rounded bg-muted" />
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
