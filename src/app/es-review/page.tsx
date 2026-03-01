"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// --- 定数 ---
const MAX_QUESTION_LENGTH = 500;
const MAX_ANSWER_LENGTH = 2000;
const MIN_ANSWER_LENGTH = 50;
const RECOMMENDED_MAX = 400;
const DRAFT_STORAGE_KEY = "es-review-draft";

/** 下書きデータ */
interface DraftData {
  question: string;
  answer: string;
}

const QUESTION_EXAMPLES = [
  "学生時代に力を入れたことは何ですか？",
  "あなたの強みと弱みを教えてください。",
  "志望動機を教えてください。",
  "困難を乗り越えた経験を教えてください。",
  "チームで成果を出した経験を教えてください。",
];

export default function ESReviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  // 認証チェック
  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
      if (!user) {
        router.push(`/login?expired=true&redirect=${encodeURIComponent("/es-review")}`);
      }
    };
    getUser();
  }, [router]);

  // 下書き復元
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const draft: DraftData = JSON.parse(saved);
        if (draft.question) setQuestion(draft.question);
        if (draft.answer) setAnswer(draft.answer);
      }
    } catch {
      // ignore
    }
  }, []);

  // 下書き保存
  useEffect(() => {
    const draft: DraftData = { question, answer };
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // ignore
    }
  }, [question, answer]);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const trimmedQuestion = question.trim();
    const trimmedAnswer = answer.trim();

    if (!trimmedQuestion) {
      newErrors.question = "設問を入力してください";
    } else if (trimmedQuestion.length > MAX_QUESTION_LENGTH) {
      newErrors.question = `設問は${MAX_QUESTION_LENGTH}文字以内で入力してください`;
    }

    if (!trimmedAnswer) {
      newErrors.answer = "回答を入力してください";
    } else if (trimmedAnswer.length < MIN_ANSWER_LENGTH) {
      newErrors.answer = `回答は${MIN_ANSWER_LENGTH}文字以上入力してください（現在: ${trimmedAnswer.length}文字）`;
    } else if (trimmedAnswer.length > MAX_ANSWER_LENGTH) {
      newErrors.answer = `回答は${MAX_ANSWER_LENGTH}文字以内で入力してください（現在: ${trimmedAnswer.length}文字）`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch("/api/es-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "USAGE_LIMIT_EXCEEDED") {
          setErrors({
            submit: data.error,
            upgrade: data.upgrade_url || "/pricing",
          });
        } else {
          setErrors({ submit: data.error || "添削に失敗しました" });
        }
        return;
      }

      // 下書きをクリア
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);

      // 結果ページに遷移
      router.push(`/es-review/${data.review_id}`);
    } catch {
      setErrors({
        submit:
          "ネットワークエラーが発生しました。接続を確認してもう一度お試しください。",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const answerCharCount = answer.trim().length;

  if (authLoading) {
    return (
      <div
        role="status"
        aria-label="読み込み中"
        className="container mx-auto max-w-2xl px-4 py-8"
      >
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="space-y-6">
          {/* ESの設問 */}
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-7 animate-pulse rounded-full bg-muted"
                  style={{ width: `${80 + i * 20}px` }}
                />
              ))}
            </div>
          </div>
          {/* ESの回答 */}
          <div className="rounded-lg border bg-card p-6">
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-[250px] w-full animate-pulse rounded-md bg-muted" />
          </div>
          {/* 添削ボタン */}
          <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
        </div>
        <span className="sr-only">読み込み中</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ES添削</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AIがエントリーシートの回答を添削し、改善提案を行います
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/es-review/history">
            <FileText className="mr-2 h-4 w-4" />
            添削履歴
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 送信エラー */}
        {errors.submit && (
          <div
            role="alert"
            className="rounded-md bg-destructive/10 p-4 text-sm text-destructive"
          >
            {errors.submit}
            {errors.upgrade && (
              <div className="mt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={errors.upgrade}>プランをアップグレード</Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ESの設問 */}
        <div className="space-y-2">
          <Label htmlFor="es-question">
            ESの設問 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="es-question"
            placeholder="例: 学生時代に力を入れたことは何ですか？"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              clearError("question");
            }}
            maxLength={MAX_QUESTION_LENGTH}
            autoComplete="off"
            aria-invalid={!!errors.question}
            aria-describedby={errors.question ? "question-error" : undefined}
          />
          {errors.question && (
            <p id="question-error" className="text-sm text-destructive">
              {errors.question}
            </p>
          )}
          {/* 質問例 */}
          <div className="flex flex-wrap gap-1.5">
            {QUESTION_EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                onClick={() => {
                  setQuestion(ex);
                  clearError("question");
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* ESの回答 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              ESの回答 <span className="text-destructive">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                id="es-answer"
                placeholder="あなたのES回答をここに入力してください..."
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  clearError("answer");
                }}
                rows={12}
                className="min-h-[250px] resize-y"
                autoComplete="off"
                aria-invalid={!!errors.answer}
                aria-describedby="answer-count answer-error"
              />
              <div className="flex items-center justify-between">
                <p
                  id="answer-count"
                  className={`text-xs ${
                    answerCharCount > MAX_ANSWER_LENGTH
                      ? "text-destructive"
                      : answerCharCount > RECOMMENDED_MAX
                        ? "text-amber-600"
                        : answerCharCount > 0 && answerCharCount < MIN_ANSWER_LENGTH
                          ? "text-amber-600"
                          : "text-muted-foreground"
                  }`}
                >
                  {answerCharCount.toLocaleString()} 文字
                  {answerCharCount > RECOMMENDED_MAX && answerCharCount <= MAX_ANSWER_LENGTH && (
                    <span className="ml-1">
                      （推奨: {RECOMMENDED_MAX}文字以内）
                    </span>
                  )}
                  {answerCharCount > 0 && answerCharCount < MIN_ANSWER_LENGTH && (
                    <span className="ml-1">（最低{MIN_ANSWER_LENGTH}文字）</span>
                  )}
                </p>
                {/* プログレスバー */}
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        answerCharCount > MAX_ANSWER_LENGTH
                          ? "bg-destructive"
                          : answerCharCount > RECOMMENDED_MAX
                            ? "bg-amber-500"
                            : "bg-primary"
                      }`}
                      style={{
                        width: `${Math.min(100, (answerCharCount / RECOMMENDED_MAX) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {RECOMMENDED_MAX}
                  </span>
                </div>
              </div>
              {errors.answer && (
                <p id="answer-error" className="text-sm text-destructive">
                  {errors.answer}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 添削ボタン */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              添削中...（30秒ほどかかります）
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              添削してもらう
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
