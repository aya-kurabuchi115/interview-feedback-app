import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirectToLogin } from "@/lib/auth/redirect";
import { GrowthContent } from "@/components/dashboard/growth-content";
import { GrowthStatsSkeleton } from "@/components/dashboard/growth-skeleton";

export const metadata = {
  title: "成長記録 | Menpass",
};

export default async function GrowthPage() {
  // 認証チェック（Suspense の前に実行）
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await redirectToLogin();
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ナビゲーション（即座に表示） */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          ダッシュボードに戻る
        </Link>
      </div>

      <h1 className="text-2xl font-bold">成長記録</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        面接フィードバックをもとにした成長の可視化
      </p>

      {/* データ依存セクション（Suspense 境界でストリーミング） */}
      <Suspense fallback={<GrowthStatsSkeleton />}>
        <GrowthContent userId={user.id} />
      </Suspense>
    </div>
  );
}
