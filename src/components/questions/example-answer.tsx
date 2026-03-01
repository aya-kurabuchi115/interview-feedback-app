"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExampleAnswerProps {
  exampleAnswer: string;
}

export function ExampleAnswer({ exampleAnswer }: ExampleAnswerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasAnswer = exampleAnswer && exampleAnswer.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          模範解答
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasAnswer ? (
          <>
            <Button
              variant="outline"
              className="mb-4 w-full justify-between"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
            >
              <span>{isOpen ? "模範解答を閉じる" : "模範解答を見る"}</span>
              {isOpen ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>
            {isOpen && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm leading-relaxed">{exampleAnswer}</p>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  ※
                  模範解答はあくまで参考例です。自分の経験に基づいたオリジナルの回答を作成しましょう。
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              模範解答は準備中です
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
