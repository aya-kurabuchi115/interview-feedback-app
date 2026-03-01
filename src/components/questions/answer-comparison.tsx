"use client";

import { useState, useEffect, useCallback } from "react";
import { PenLine, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

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
    if (answer.length === 0) return;

    const timer = setTimeout(() => {
      saveToStorage(answer);
    }, 500);

    return () => clearTimeout(timer);
  }, [answer, saveToStorage]);

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
