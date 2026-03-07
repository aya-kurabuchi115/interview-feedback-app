import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

interface Props {
  userId: string;
}

export async function MockInterviewHistory({ userId }: Props) {
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("mock_interviews")
    .select("id, company_name, category, round, difficulty, status, feedback_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!sessions || sessions.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-dashed p-8 text-center">
        <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-muted-foreground">まだ面接練習の記録がありません</p>
        <Link
          href="/mock-interview"
          className="mt-3 inline-block text-sm font-medium text-primary underline underline-offset-4"
        >
          最初のAI面接を始める
        </Link>
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    general: "総合",
    technical: "技術",
    behavioral: "行動",
    case: "ケース",
  };

  const roundLabels: Record<string, string> = {
    first: "一次面接",
    second: "二次面接",
    final: "最終面接",
  };

  return (
    <div className="mt-4 space-y-3">
      {sessions.map((session) => (
        <Link
          key={session.id}
          href={
            session.status === "completed" || session.status === "analyzing"
              ? `/mock-interview/${session.id}/result`
              : `/mock-interview/${session.id}/chat`
          }
          className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">
                {session.company_name || "企業未指定"} — {roundLabels[session.round] || session.round}
              </p>
              <p className="text-sm text-muted-foreground">
                {categoryLabels[session.category] || session.category}
                {" · "}
                {new Date(session.created_at).toLocaleDateString("ja-JP")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-sm ${
              session.status === "completed" && session.feedback_id
                ? "text-green-600 dark:text-green-400"
                : session.status === "completed" && !session.feedback_id
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-muted-foreground"
            }`}>
              {session.status === "in_progress"
                ? "面接中"
                : session.status === "completed" && session.feedback_id
                  ? "分析済み"
                  : session.status === "completed" && !session.feedback_id
                    ? "分析中"
                    : session.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
