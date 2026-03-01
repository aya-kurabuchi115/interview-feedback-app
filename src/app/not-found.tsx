import Link from "next/link";
import { FileQuestion, Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 px-4 py-24">
      <div className="rounded-full bg-muted p-6">
        <FileQuestion className="h-16 w-16 text-muted-foreground" />
      </div>

      <div className="text-center">
        <h1 className="text-6xl font-bold tracking-tight">404</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          ページが見つかりません
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          お探しのページは移動または削除された可能性があります。
        </p>
      </div>

      <div className="flex gap-4">
        <Button size="lg" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            ホームに戻る
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            ダッシュボード
          </Link>
        </Button>
      </div>
    </div>
  );
}
