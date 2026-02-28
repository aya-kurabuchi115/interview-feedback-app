import Link from "next/link";
import { Mic, BarChart3, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-12 px-4 py-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          InterviewCoach
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          面接練習を録音し、AIが回答内容と話し方を分析してフィードバックを生成します
        </p>
      </div>

      <div className="grid max-w-3xl gap-8 sm:grid-cols-3">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Mic className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">録音</h3>
          <p className="text-sm text-muted-foreground">
            ブラウザで面接練習を録音
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">文字起こし</h3>
          <p className="text-sm text-muted-foreground">
            話者分離付きで自動文字起こし
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">AI分析</h3>
          <p className="text-sm text-muted-foreground">
            スコアと改善提案を自動生成
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button size="lg" asChild>
          <Link href="/signup">無料で始める</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/login">ログイン</Link>
        </Button>
      </div>
    </div>
  );
}
