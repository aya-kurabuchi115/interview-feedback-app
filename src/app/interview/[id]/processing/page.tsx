"use client";

import { useEffect, useState, useRef, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Upload,
  FileText,
  Brain,
  PartyPopper,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { sendAnalysisCompleteNotification } from "@/lib/notifications";

// 通知プロンプトは処理中のみ表示されるため遅延ロード
const NotificationPrompt = dynamic(
  () =>
    import("@/components/notification-prompt").then(
      (mod) => mod.NotificationPrompt
    ),
  { ssr: false }
);
import type { Database } from "@/types/supabase";

type InterviewStatus =
  Database["public"]["Tables"]["interviews"]["Row"]["status"];

interface Step {
  label: string;
  status: InterviewStatus;
  icon: React.ReactNode;
  estimatedTime: string;
}

const STEPS: Step[] = [
  {
    label: "アップロード完了",
    status: "uploaded",
    icon: <Upload className="h-5 w-5" />,
    estimatedTime: "完了済み",
  },
  {
    label: "文字起こし中...",
    status: "transcribing",
    icon: <FileText className="h-5 w-5" />,
    estimatedTime: "約1~3分",
  },
  {
    label: "AI分析中...",
    status: "analyzing",
    icon: <Brain className="h-5 w-5" />,
    estimatedTime: "約1~2分",
  },
  {
    label: "完了",
    status: "completed",
    icon: <PartyPopper className="h-5 w-5" />,
    estimatedTime: "まもなく結果を表示",
  },
];

const STATUS_ORDER: InterviewStatus[] = [
  "uploaded",
  "transcribing",
  "analyzing",
  "completed",
];

function getStepIndex(status: InterviewStatus): number {
  const index = STATUS_ORDER.indexOf(status);
  return index === -1 ? 0 : index;
}

const POLL_INTERVAL = 5000;

export default function ProcessingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [currentStatus, setCurrentStatus] =
    useState<InterviewStatus>("uploaded");
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const analyzeCalledRef = useRef(false);
  const notifiedRef = useRef(false);

  // AI分析 API を呼び出す関数
  const triggerAnalysis = useCallback(async () => {
    if (analyzeCalledRef.current) return;
    analyzeCalledRef.current = true;
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interview_id: id }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.code === "RATE_LIMIT_EXCEEDED") {
          setIsError(true);
          setErrorMessage(data.error);
          setIsAnalyzing(false);
          return;
        }
        throw new Error(data.error || "分析に失敗しました");
      }
    } catch (error) {
      console.error("[processing] analyze error:", error);
      analyzeCalledRef.current = false;
    }
    setIsAnalyzing(false);
  }, [id]);

  // ステータスポーリング & 分析トリガー
  useEffect(() => {
    const supabase = createClient();
    let timeoutId: ReturnType<typeof setTimeout>;
    let cancelled = false;

    async function fetchStatus() {
      if (cancelled) return;

      try {
        // 注: user_id による明示的フィルタは追加していない。
        // Supabase RLS ポリシーにより、認証ユーザーは自分の interviews のみ取得可能。
        const { data, error } = await supabase
          .from("interviews")
          .select("status")
          .eq("id", id)
          .single();

        if (error) {
          setIsError(true);
          setErrorMessage("ステータスの取得に失敗しました");
          setIsLoading(false);
          return;
        }

        if (!data) {
          setIsError(true);
          setErrorMessage("面接データが見つかりません");
          setIsLoading(false);
          return;
        }

        const status = (data as Record<string, unknown>)
          .status as InterviewStatus;
        setCurrentStatus(status);
        setIsLoading(false);

        if (status === "error") {
          setIsError(true);
          setErrorMessage(
            "処理中にエラーが発生しました。もう一度お試しください。"
          );
          return;
        }

        if (status === "completed") {
          // ブラウザ通知を送信（1回のみ）
          if (!notifiedRef.current) {
            notifiedRef.current = true;
            const sent = sendAnalysisCompleteNotification(id, (url) => {
              router.push(url);
            });
            // ブラウザ通知が送信できなかった場合、アプリ内トーストでフォールバック
            if (!sent) {
              setToastMessage("分析が完了しました！結果ページに移動します...");
            }
          }
          setTimeout(() => {
            router.push(`/interview/${id}/result`);
          }, 2000);
          return;
        }

        // uploaded 状態の場合、AI分析を自動開始
        if (status === "uploaded" && !analyzeCalledRef.current) {
          triggerAnalysis();
        }

        if (!cancelled) {
          timeoutId = setTimeout(fetchStatus, POLL_INTERVAL);
        }
      } catch {
        setIsError(true);
        setErrorMessage("通信エラーが発生しました");
        setIsLoading(false);
      }
    }

    fetchStatus();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [id, router, triggerAnalysis]);

  const handleRetry = async () => {
    setIsError(false);
    setErrorMessage(null);
    setIsLoading(true);
    analyzeCalledRef.current = false;

    try {
      const res = await fetch("/api/interviews/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interview_id: id }),
      });

      if (!res.ok) {
        const data = await res.json();
        setIsError(true);
        setErrorMessage(data.error || "リトライに失敗しました");
        setIsLoading(false);
        return;
      }

      setCurrentStatus("uploaded");
      setIsLoading(false);
    } catch {
      setIsError(true);
      setErrorMessage("リトライに失敗しました");
      setIsLoading(false);
    }
  };

  const currentStepIndex = getStepIndex(currentStatus);
  // isAnalyzing を参照して lint の未使用警告を防ぐ
  const headerTitle = isAnalyzing
    ? "AIがフィードバックを生成しています..."
    : "面接データを処理しています";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-center">処理ステータス</h1>

      {/* アプリ内トースト通知（ブラウザ通知のフォールバック） */}
      {toastMessage && (
        <div
          className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
          role="alert"
        >
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-center">
            {headerTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-destructive text-center">
                {errorMessage}
              </p>
              <div className="flex gap-3">
                <Button onClick={handleRetry} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  リトライ
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                >
                  ダッシュボードに戻る
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.status} className="flex items-start gap-4">
                    {/* ステップインジケーター */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                          isCompleted
                            ? "border-primary bg-primary text-primary-foreground"
                            : isCurrent
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-muted-foreground/30 bg-background text-muted-foreground/50"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : isCurrent ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </div>
                      {/* コネクターライン */}
                      {index < STEPS.length - 1 && (
                        <div
                          className={`w-0.5 h-8 transition-colors ${
                            isCompleted
                              ? "bg-primary"
                              : "bg-muted-foreground/20"
                          }`}
                        />
                      )}
                    </div>

                    {/* ステップ情報 */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-2 pt-2">
                        <span
                          className={`${
                            isCompleted || isCurrent
                              ? "text-foreground"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          {step.icon}
                        </span>
                        <p
                          className={`text-sm font-medium ${
                            isCompleted
                              ? "text-foreground"
                              : isCurrent
                                ? "text-foreground"
                                : "text-muted-foreground/50"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                      <p
                        className={`mt-1 text-xs ${
                          isCurrent
                            ? "text-muted-foreground"
                            : "text-muted-foreground/50"
                        }`}
                      >
                        {isCompleted
                          ? "完了"
                          : isCurrent
                            ? `推定待ち時間: ${step.estimatedTime}`
                            : step.estimatedTime}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        5秒ごとに自動更新されます。このページを閉じても処理は続行されます。
      </p>

      {/* 通知許可リクエスト（処理中のみ表示） */}
      {!isError && !isLoading && currentStatus !== "completed" && (
        <NotificationPrompt />
      )}
    </div>
  );
}
