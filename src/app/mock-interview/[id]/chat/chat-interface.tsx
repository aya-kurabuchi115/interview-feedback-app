"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Loader2,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  Mic,
  Square,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { MockInterviewMessage } from "@/types/database";
import { recordPracticeActivity } from "@/lib/reminder";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import type { RecordingState } from "@/hooks/use-audio-recorder";
import { AudioWaveform } from "@/components/audio-waveform";

// ============================================================
// 定数
// ============================================================

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
  // サーバー側で completed 確認済みかどうか
  const [serverCompleted, setServerCompleted] = useState(false);

  // フィードバック生成状態
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [feedbackReady, setFeedbackReady] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // 音声録音
  const {
    state: recordingState,
    startRecording,
    stopRecording,
    error: recordingError,
    clearError: clearRecordingError,
    duration: recordingDuration,
    stream: audioStream,
  } = useAudioRecorder();
  const [transcribing, setTranscribing] = useState(false);

  // 質問数上限（duration_minutes フィールドを質問数として使用）
  const maxQuestions = durationMinutes || 5;

  // 確認ダイアログ
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // タイピングインジケーター
  const [isTyping, setIsTyping] = useState(false);

  // Ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // 面接完了時に自動でフィードバック生成
  // ============================================================

  useEffect(() => {
    if (!serverCompleted || generatingFeedback || feedbackReady || feedbackError) return;

    const generateFeedback = async () => {
      setGeneratingFeedback(true);
      try {
        const res = await fetch(
          `/api/mock-interview/${interviewId}/feedback`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await res.json();
        if (!res.ok) {
          // 409 = 既に生成済み
          if (res.status === 409) {
            setFeedbackReady(true);
          } else {
            setFeedbackError(data.error || "フィードバック生成に失敗しました");
          }
          return;
        }
        setFeedbackReady(true);
      } catch {
        setFeedbackError("フィードバック生成中にエラーが発生しました。結果画面から再試行できます。");
      } finally {
        setGeneratingFeedback(false);
      }
    };

    generateFeedback();
  }, [serverCompleted, generatingFeedback, feedbackReady, feedbackError, interviewId]);

  // ============================================================
  // 録音エラーの同期
  // ============================================================

  useEffect(() => {
    if (recordingError) {
      setError(recordingError);
      clearRecordingError();
    }
  }, [recordingError, clearRecordingError]);

  // ============================================================
  // 音声入力ハンドラ
  // ============================================================

  const handleMicToggle = async () => {
    if (recordingState === "recording") {
      // 録音停止 → 文字起こし
      const blob = await stopRecording();
      if (!blob) return;

      setTranscribing(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        const res = await fetch("/api/stt", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "音声の文字起こしに失敗しました");
          return;
        }

        if (data.text) {
          setCurrentAnswer((prev) =>
            prev ? `${prev}\n${data.text}` : data.text
          );
          // textarea の高さを更新
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.style.height = "auto";
              textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 400)}px`;
            }
          }, 0);
        }
      } catch {
        setError("音声の文字起こしに失敗しました。接続を確認してください。");
      } finally {
        setTranscribing(false);
      }
    } else {
      // 録音開始
      await startRecording();
    }
  };

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
        setServerCompleted(true);
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
            forceEnd: true,
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
        // respond API が完了を返した場合
        setServerCompleted(true);
      } else {
        // エラーでも面接は終了扱いにしてフィードバック画面へ遷移可能にする
        setServerCompleted(true);
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

  const progressPercentage = Math.min(
    (totalQuestions / maxQuestions) * 100,
    100
  );

  const isNearEnd = totalQuestions >= maxQuestions - 1;

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
                <span className={`flex-shrink-0 text-xs ${isNearEnd ? "font-medium text-orange-500" : "text-muted-foreground"}`}>
                  <HelpCircle className="mr-0.5 inline h-3 w-3" />
                  {totalQuestions}/{maxQuestions}問
                </span>
                <Progress
                  value={progressPercentage}
                  className="h-1.5 flex-1"
                  aria-label={`面接進捗: ${totalQuestions}/${maxQuestions}問`}
                />
              </div>
            </div>

            {/* 終了ボタン */}
            <div className="flex flex-shrink-0 items-center gap-3">
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

          {/* 時間切れ通知は自動終了に置き換えたため不要 */}

          {/* 面接完了表示 */}
          {isComplete && (
            <div className="mt-6 rounded-lg border bg-card p-6 text-center">
              {generatingFeedback ? (
                <>
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                  <h2 className="mt-3 text-lg font-semibold">
                    面接結果を生成中...
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    AIが面接内容を分析しています。1〜2分ほどお待ちください。
                  </p>
                  <div className="mt-4">
                    <Progress value={undefined} className="h-2 w-48 mx-auto animate-pulse" />
                  </div>
                </>
              ) : feedbackError ? (
                <>
                  <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                  <h2 className="mt-3 text-lg font-semibold">
                    面接が終了しました
                  </h2>
                  <p className="mt-2 text-sm text-destructive">
                    {feedbackError}
                  </p>
                  <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <Button asChild>
                      <a href={`/mock-interview/${interviewId}/result`}>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        結果画面で再試行
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/mock-interview">
                        <Plus className="mr-2 h-4 w-4" />
                        新しい面接を始める
                      </a>
                    </Button>
                  </div>
                </>
              ) : feedbackReady ? (
                <>
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <h2 className="mt-3 text-lg font-semibold">
                    フィードバックが完成しました
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    お疲れさまでした。結果を確認しましょう。
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
                </>
              ) : (
                <>
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
                  <h2 className="mt-3 text-lg font-semibold">
                    面接を終了しています...
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    しばらくお待ちください
                  </p>
                </>
              )}
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
            {/* 録音中インジケーター + 波形 */}
            {recordingState === "recording" && (
              <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3 flex-shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    録音中 {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, "0")}
                  </span>
                  <span className="ml-auto text-xs text-red-500 dark:text-red-400">
                    タップで停止
                  </span>
                </div>
                <div className="mt-2 h-10 w-full overflow-hidden rounded">
                  <AudioWaveform stream={audioStream} />
                </div>
              </div>
            )}

            {/* 文字起こし中インジケーター */}
            {transcribing && (
              <div className="mb-2 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-950">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  音声を文字起こし中...
                </span>
              </div>
            )}

            <div className="flex items-end gap-2">
              {/* マイクボタン */}
              <Button
                onClick={handleMicToggle}
                disabled={sending || transcribing || isComplete}
                size="icon"
                variant={recordingState === "recording" ? "destructive" : "outline"}
                className="h-11 w-11 flex-shrink-0 rounded-xl"
                aria-label={recordingState === "recording" ? "録音を停止" : "音声で回答"}
              >
                {transcribing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : recordingState === "recording" ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>

              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  autoComplete="off"
                  value={currentAnswer}
                  onChange={(e) => {
                    setCurrentAnswer(e.target.value);
                    // 自動リサイズ
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 400)}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="回答を入力、またはマイクで話してください"
                  disabled={sending || recordingState === "recording"}
                  maxLength={MAX_ANSWER_LENGTH}
                  rows={2}
                  className="w-full resize-y rounded-xl border bg-background px-4 py-3 pr-12 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 min-h-[2.75rem] max-h-[400px]"
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
                disabled={!currentAnswer.trim() || sending || recordingState === "recording"}
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
              Enter で送信 / Shift+Enter で改行 / マイクで音声入力
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
