"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PenLine, Save, RotateCcw, Lock, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

const MAX_LENGTH = 5000;

interface AnswerComparisonProps {
  questionId: string;
}

function getStorageKey(questionId: string) {
  return `answer-${questionId}`;
}

export function AnswerComparison({ questionId }: AnswerComparisonProps) {
  const [answer, setAnswer] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isOverLimit, setIsOverLimit] = useState(false);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  // プランチェック
  useEffect(() => {
    const checkPlan = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsPremium(false);
          return;
        }
        const res = await fetch("/api/subscription");
        if (res.ok) {
          const data = await res.json();
          const plan = data.subscription?.plan ?? "free";
          setIsPremium(plan === "premium" || plan === "enterprise");
        } else {
          setIsPremium(false);
        }
      } catch {
        setIsPremium(false);
      }
    };
    checkPlan();
  }, []);

  // localStorage から復元
  useEffect(() => {
    try {
      const stored = localStorage.getItem(getStorageKey(questionId));
      if (stored) {
        const parsed = JSON.parse(stored) as {
          text: string;
          savedAt: string;
        };
        setAnswer(parsed.text);
        setSavedAt(parsed.savedAt);
      }
    } catch {
      // localStorage が使えない場合は無視
    }
  }, [questionId]);

  // 自動保存（入力から500ms後）
  const saveToStorage = useCallback(
    (text: string) => {
      try {
        const now = new Date().toLocaleString("ja-JP");
        localStorage.setItem(
          getStorageKey(questionId),
          JSON.stringify({ text, savedAt: now })
        );
        setSavedAt(now);
      } catch {
        // localStorage が使えない場合は無視
      }
    },
    [questionId]
  );

  useEffect(() => {
    if (answer.length === 0 || !isPremium) return;

    const timer = setTimeout(() => {
      saveToStorage(answer);
    }, 500);

    return () => clearTimeout(timer);
  }, [answer, saveToStorage, isPremium]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setIsOverLimit(value.length > MAX_LENGTH);
    if (value.length <= MAX_LENGTH) {
      setAnswer(value);
    }
  };

  const handleClear = () => {
    setAnswer("");
    setSavedAt(null);
    try {
      localStorage.removeItem(getStorageKey(questionId));
    } catch {
      // localStorage が使えない場合は無視
    }
  };

  const handleSave = () => {
    saveToStorage(answer);
  };

  // ローディング中
  if (isPremium === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLine className="size-5 text-primary" />
            自分の回答を書いてみよう
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[160px] animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    );
  }

  // 非Premiumユーザー: ロック表示
  if (!isPremium) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLine className="size-5 text-primary" />
            自分の回答を書いてみよう
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            模範解答を参考に、自分の経験に基づいた回答を作成しましょう。
          </p>
          <div className="relative">
            <Textarea
              placeholder="ここに自分の回答を入力してください..."
              className="min-h-[160px] resize-y opacity-50"
              disabled
              aria-label="自分の回答"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <Lock className="mr-1 size-4" />
              保存
            </Button>
            <Button variant="ghost" size="sm" disabled>
              <RotateCcw className="mr-1 size-4" />
              クリア
            </Button>
          </div>
          <div className="mt-4 rounded-lg border border-[var(--brand-orange)]/30 bg-[var(--brand-orange)]/5 p-4 text-center">
            <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-orange)] px-3 py-1 text-xs font-semibold text-white">
              <Crown className="h-3.5 w-3.5" />
              Premium 限定機能
            </div>
            <p className="text-xs text-muted-foreground">
              回答の保存機能は Premium プランでご利用いただけます
            </p>
            <Button asChild size="sm" className="mt-2 bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange)]/90">
              <Link href="/pricing">
                <Sparkles className="mr-2 h-4 w-4" />
                Premium にアップグレード
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Premiumユーザー: 通常表示
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenLine className="size-5 text-primary" />
          自分の回答を書いてみよう
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-muted-foreground">
          模範解答を参考に、自分の経験に基づいた回答を作成しましょう。入力内容はブラウザに自動保存されます。
        </p>
        <Textarea
          placeholder="ここに自分の回答を入力してください..."
          value={answer}
          onChange={handleChange}
          className="min-h-[160px] resize-y"
          aria-label="自分の回答"
          aria-invalid={isOverLimit}
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs ${
                answer.length > MAX_LENGTH * 0.9
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {answer.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}文字
            </span>
            {isOverLimit && (
              <span className="text-xs text-destructive">
                文字数制限を超えています
              </span>
            )}
          </div>
          {savedAt && (
            <span className="text-xs text-muted-foreground">
              保存済み: {savedAt}
            </span>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={answer.length === 0}
          >
            <Save className="mr-1 size-4" />
            保存
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={answer.length === 0}
          >
            <RotateCcw className="mr-1 size-4" />
            クリア
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
