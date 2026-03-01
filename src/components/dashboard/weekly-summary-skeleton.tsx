import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * 週次進捗サマリーのスケルトン表示
 * Suspense の fallback として使用
 */
export function WeeklySummarySkeleton() {
  return (
    <div className="mt-6 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="py-4">
            <CardContent className="flex flex-col gap-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-3 py-3">
          <Skeleton className="h-5 w-5 shrink-0 rounded" />
          <Skeleton className="h-4 w-64" />
        </CardContent>
      </Card>
    </div>
  );
}
