import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Database } from "@/types/supabase";

type Interview = Database["public"]["Tables"]["interviews"]["Row"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("interviews")
    .select("*")
    .order("created_at", { ascending: false });

  const interviews = (data ?? []) as Interview[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <Button asChild>
          <Link href="/interview/new">
            <Plus className="mr-2 h-4 w-4" />
            新しい面接を始める
          </Link>
        </Button>
      </div>

      <div className="mt-8">
        {interviews.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">
              まだ面接セッションがありません
            </p>
            <Button className="mt-4" asChild>
              <Link href="/interview/new">
                <Plus className="mr-2 h-4 w-4" />
                新しい面接を始める
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {interviews.map((interview) => (
              <Link
                key={interview.id}
                href={`/interview/${interview.id}`}
                className="rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <h3 className="font-semibold">{interview.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(interview.created_at).toLocaleDateString("ja-JP")}
                </p>
                <span className="mt-2 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                  {interview.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
