"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Loader2,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { MockInterviewMessage } from "@/types/database";
import { recordPracticeActivity } from "@/lib/reminder";

// ============================================================
// 定数
// ============================================================

/** respond API が返す最大質問数 */
const MAX_QUESTIONS = 12;

/** 回答文の最大長 */
const MAX_ANSWER_LENGTH = 5000;

// ============================================================
// カテゴリ・難易度のラベル
// ============================================================

const CATEGORY_LABELS: Record<string, string> = {
  general: "人物面接（総合）",
  behavioral: "行動面接",
  technical: "技術面接",
  case: "ケース面接",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "やさしい",
  normal: "標準",
  hard: "厳しい",
};

// ============================================================
// Props
// ============================================================

interface ChatInterfaceProps {
  interviewId: string;
  initialMessages: MockInterviewMessage[];
  durationMinutes: number;
  startedAt: string;
  totalQuestions: number;
  category: string;
  companyName: string | null;
  difficulty: string;
}

// ============================================================
// Component
// ============================================================

export function ChatInterface({
  interviewId,
  initialMessages,
  durationMinutes,
  startedAt,
  totalQuestions: initialTotalQuestions,
  category,
  companyName,
  difficulty,
}: ChatInterfaceProps) {
  const router = useRouter();

  // メッセージ状態
  const [messages, setMessages] =
    useState<MockInterviewMessage[]>(initialMessages);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(initialTotalQuestions);

  // 面接完了状態
  const [isComplete, setIsComplete] = useState(false);

  // タイマー
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    const startTime = new Date(startedAt).getTime();
    const endTime = startTime + durationMinutes * 60 * 1000;
    const remaining = Math.max(
      0,
      Math.floor((endTime - Date.now()) / 1000)
    );
    return remaining;
  });
  const [isTimeUp, setIsTimeUp] = useState(false);

  // 確認ダイアログ
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // タイピングインジケーター
  const [isTyping, setIsTyping] = useState(false);

  // Ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // 最終利用日の記録
  // ============================================================

  useEffect(() => {
    recordPracticeActivity();
  }, []);

  // ============================================================
  // 自動スクロール
  // ============================================================

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // ============================================================
  // タイマー
  // ============================================================

  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isComplete]);

  // ============================================================
  // 確認ダイアログ: Esc キー対応
  // ============================================================

  useEffect(() => {
    if (!showEndConfirm) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowEndConfirm(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showEndConfirm]);

  // ダイアログ表示時にフォーカストラップ
  useEffect(() => {
    if (showEndConfirm && dialogRef.current) {
      const firstButton = dialogRef.current.querySelector("button");
      firstButton?.focus();
    }
  }, [showEndConfirm]);

  // ============================================================
  // 回答送信
  // ============================================================

  const handleSend = async () => {
    const answer = currentAnswer.trim();
    if (!answer || sending || isComplete) return;

    setSending(true);
    setError(null);
    setIsTyping(true);

    // ユーザーのメッセージを即座に表示
    const userMessage: MockInterviewMessage = {
      role: "user",
      content: answer,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentAnswer("");

    // textarea の高さをリセット
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch(
        `/api/mock-interview/${interviewId}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "送信に失敗しました");
        // ユーザーメッセージを取り消す
        setMessages((prev) => prev.slice(0, -1));
        setCurrentAnswer(answer);
        setIsTyping(false);
        setSending(false);
        return;
      }

      // 面接官の応答をメッセージに追加
      const interviewerMessage: MockInterviewMessage = {
        role: "interviewer",
        content: data.question,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, interviewerMessage]);
      setTotalQuestions(data.questionNumber);

      if (data.isComplete) {
        setIsComplete(true);
      }
    } catch {
      setError(
        "ネットワークエラーが発生しました。接続を確認してもう一度お試しください。"
      );
      // ユーザーメッセージを取り消す
      setMessages((prev) => prev.slice(0, -1));
      setCurrentAnswer(answer);
    } finally {
      setIsTyping(false);
      setSending(false);
    }
  };

  // ============================================================
  // 面接終了処理
  // ============================================================

  const handleEndInterview = async () => {
    setShowEndConfirm(false);
    setSending(true);
    setError(null);

    try {
      // 「面接を辞退します」を送って面接を完了にする
      const res = await fetch(
        `/api/mock-interview/${interviewId}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answer: "面接を終了させてください。ありがとうございました。",
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const interviewerMessage: MockInterviewMessage = {
          role: "interviewer",
          content: data.question,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, interviewerMessage]);
      }

      setIsComplete(true);
    } catch {
      setError("面接終了処理に失敗しました。");
    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // キーボードハンドラ
  // ============================================================

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enter: 改行（デフォルト動作）
    // Enter のみ: 送信
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ============================================================
  // ヘルパー関数
  // ============================================================

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const progressPercentage = Math.min(
    (totalQuestions / MAX_QUESTIONS) * 100,
    100
  );

  const isTimeLow = remainingSeconds < 60 && remainingSeconds > 0;

  // ============================================================
  // レンダリング
  // ============================================================

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* ヘッダーバー */}
      <div className="border-b bg-background px-4 py-3">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            {/* 面接情報 */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 flex-shrink-0 text-primary" />
                <h1 className="truncate text-sm font-semibold">
                  {companyName
                    ? `${companyName} - ${CATEGORY_LABELS[category] ?? category}`
                    : CATEGORY_LABELS[category] ?? category}
                </h1>
                <span className="flex-shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {DIFFICULTY_LABELS[difficulty] ?? difficulty}
                </span>
              </div>

              {/* 進捗バー */}
              <div className="mt-2 flex items-center gap-2">
                <span className="flex-shrink-0 text-xs text-muted-foreground">
                  質問 {totalQuestions}/{MAX_QUESTIONS}
                </span>
                <Progress
                  value={progressPercentage}
                  className="h-1.5 flex-1"
                  aria-label={`面接進捗: ${totalQuestions}/${MAX_QUESTIONS}問`}
                />
              </div>
            </div>

            {/* 残り時間 & 終了ボタン */}
            <div className="flex flex-shrink-0 items-center gap-3">
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  isTimeUp
                    ? "text-destructive"
                    : isTimeLow
                      ? "text-orange-500"
                      : "text-muted-foreground"
                }`}
                aria-label={`残り時間: ${formatTime(remainingSeconds)}`}
                role="timer"
              >
                <Clock className="h-4 w-4" />
                <span>{formatTime(remainingSeconds)}</span>
              </div>

              {!isComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEndConfirm(true)}
                  disabled={sending}
                  aria-label="面接を終了する"
                >
                  <span className="hidden sm:inline">面接を終了</span>
                  <span className="sm:hidden">終了</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* メッセージエリア */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6"
        role="log"
        aria-label="面接チャット"
        aria-live="polite"
      >
        <div className="container mx-auto max-w-3xl space-y-4">
          {messages.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {/* 話者ラベル */}
                <div
                  className={`mb-1 text-xs font-medium ${
                    msg.role === "user"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {msg.role === "interviewer" ? "面接官" : "あなた"}
                </div>
                {/* メッセージ本文 */}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {/* タイピングインジケーター */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-4 py-3">
                <div className="mb-1 text-xs font-medium text-muted-foreground">
                  面接官
                </div>
                <div
                  className="flex items-center gap-1"
                  aria-label="面接官が入力中"
                >
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* 時間切れ通知 */}
          {isTimeUp && !isComplete && (
            <div className="flex justify-center">
              <div className="rounded-lg bg-orange-50 px-4 py-2 text-sm text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                <Clock className="mr-1 inline-block h-4 w-4" />
                設定時間を超過しました。回答を送信して面接を完了させましょう。
              </div>
            </div>
          )}

          {/* 面接完了表示 */}
          {isComplete && (
            <div className="mt-6 rounded-lg border bg-card p-6 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-3 text-lg font-semibold">
                面接が終了しました
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                お疲れさまでした。フィードバックを確認しましょう。
              </p>
              <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button asChild>
                  <a href={`/mock-interview/${interviewId}/result`}>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    フィードバックを見る
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/mock-interview">
                    <Plus className="mr-2 h-4 w-4" />
                    新しい面接を始める
                  </a>
                </Button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="border-t bg-destructive/5 px-4 py-2">
          <div className="container mx-auto max-w-3xl">
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-xs underline hover:no-underline"
                aria-label="エラーを閉じる"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 入力エリア */}
      {!isComplete && (
        <div className="border-t bg-background px-4 py-3">
          <div className="container mx-auto max-w-3xl">
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  autoComplete="off"
                  value={currentAnswer}
                  onChange={(e) => {
                    setCurrentAnswer(e.target.value);
                    // 自動リサイズ
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="回答を入力してください（Shift+Enter で改行）"
                  disabled={sending}
                  maxLength={MAX_ANSWER_LENGTH}
                  rows={1}
                  className="w-full resize-none rounded-xl border bg-background px-4 py-3 pr-12 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="面接回答入力"
                />
                {currentAnswer.length > MAX_ANSWER_LENGTH * 0.8 && (
                  <span className="absolute bottom-1 right-14 text-xs text-muted-foreground">
                    {currentAnswer.length}/{MAX_ANSWER_LENGTH}
                  </span>
                )}
              </div>
              <Button
                onClick={handleSend}
                disabled={!currentAnswer.trim() || sending}
                size="icon"
                className="h-11 w-11 flex-shrink-0 rounded-xl"
                aria-label="回答を送信"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter で送信 / Shift+Enter で改行
            </p>
          </div>
        </div>
      )}

      {/* 終了確認ダイアログ */}
      {showEndConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEndConfirm(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="面接終了の確認"
        >
          <div
            ref={dialogRef}
            className="mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-lg"
          >
            <h2 className="text-lg font-semibold">面接を終了しますか？</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              面接を途中で終了すると、これまでの会話内容をもとにフィードバックが生成されます。
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEndConfirm(false)}
              >
                キャンセル
              </Button>
              <Button
                variant="destructive"
                onClick={handleEndInterview}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    終了中...
                  </>
                ) : (
                  "面接を終了する"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
