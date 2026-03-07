"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  DIAGNOSIS_QUESTIONS,
  calculatePersonalityType,
} from "@/lib/personality/diagnosis";
import {
  PERSONALITY_DATA,
  getGroupForType,
} from "@/lib/personality/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle, RotateCcw, Lock } from "lucide-react";

type Phase = "intro" | "questions" | "result";

export function DiagnosisClient() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const totalQuestions = DIAGNOSIS_QUESTIONS.length;
  const currentQuestion = DIAGNOSIS_QUESTIONS[currentIndex];
  const progress = phase === "questions"
    ? Math.round(((currentIndex) / totalQuestions) * 100)
    : phase === "result"
      ? 100
      : 0;

  const result =
    phase === "result" ? calculatePersonalityType(answers) : null;
  const personalityInfo =
    result ? PERSONALITY_DATA[result.type] : null;
  const groupInfo =
    result ? getGroupForType(result.type) : null;

  // 結果フェーズに入ったらログイン状態をチェック
  useEffect(() => {
    if (phase === "result") {
      fetch("/api/auth/status")
        .then((res) => res.json())
        .then((data) => setIsLoggedIn(!!data.user))
        .catch(() => setIsLoggedIn(false));
    }
  }, [phase]);

  // 結果を sessionStorage に保存（ログイン後に戻ってきた時用）
  useEffect(() => {
    if (phase === "result" && result) {
      sessionStorage.setItem("diagnosis_result_type", result.type);
    }
  }, [phase, result]);

  // ページ読み込み時に sessionStorage から結果を復元
  useEffect(() => {
    const savedType = sessionStorage.getItem("diagnosis_result_type");
    if (savedType && phase === "intro" && Object.keys(answers).length === 0) {
      // ログイン後に戻ってきたケース: 保存済み結果から復元
      const validType = Object.keys(PERSONALITY_DATA).find(
        (t) => t === savedType
      );
      if (validType) {
        // answers を空にしたまま result フェーズに遷移するため、
        // calculatePersonalityType を使わず直接型を設定
        setPhase("result");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 回答を選択
  const handleAnswer = useCallback(
    (value: string) => {
      const questionId = currentQuestion.id;
      setAnswers((prev) => ({ ...prev, [questionId]: value }));

      // 最後の質問なら結果表示へ
      if (currentIndex === totalQuestions - 1) {
        setPhase("result");
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [currentIndex, currentQuestion, totalQuestions]
  );

  // 前の質問に戻る
  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // 結果を保存
  const handleSave = useCallback(async () => {
    if (!result || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personality_type: result.type }),
      });
      if (res.ok) {
        setSaved(true);
        sessionStorage.removeItem("diagnosis_result_type");
      }
    } catch {
      // 静かに失敗
    } finally {
      setSaving(false);
    }
  }, [result, saving]);

  // やり直し
  const handleRetry = useCallback(() => {
    setPhase("intro");
    setCurrentIndex(0);
    setAnswers({});
    setSaved(false);
    setIsLoggedIn(null);
    sessionStorage.removeItem("diagnosis_result_type");
  }, []);

  // sessionStorage から復元した結果型を取得
  const getResultType = () => {
    if (result) return result.type;
    const savedType = sessionStorage.getItem("diagnosis_result_type");
    return savedType || null;
  };

  const resultType = phase === "result" ? getResultType() : null;
  const resultPersonalityInfo = resultType ? PERSONALITY_DATA[resultType as keyof typeof PERSONALITY_DATA] : null;
  const resultGroupInfo = resultType ? getGroupForType(resultType as keyof typeof PERSONALITY_DATA) : null;

  // ── イントロ画面 ──
  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">パーソナリティ診断テスト</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            10問の簡単な質問であなたの性格タイプを診断します
          </p>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                この診断テストでは、4つの軸をもとにあなたの性格タイプを判定します。
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li><strong>E/I</strong> - 外向型 / 内向型</li>
                <li><strong>S/N</strong> - 感覚型 / 直感型</li>
                <li><strong>T/F</strong> - 思考型 / 感情型</li>
                <li><strong>J/P</strong> - 判断型 / 知覚型</li>
              </ul>
              <p>
                直感で回答してください。正解・不正解はありません。
              </p>
              <p className="text-xs">
                所要時間: 約2分 / 全{totalQuestions}問
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => setPhase("questions")}
          >
            診断を始める
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── 質問画面 ──
  if (phase === "questions" && currentQuestion) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">パーソナリティ診断テスト</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Q{currentIndex + 1} / {totalQuestions}
          </p>
        </div>

        {/* プログレスバー */}
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              type="button"
              onClick={() => handleAnswer(currentQuestion.optionA.value)}
              className="w-full rounded-lg border-2 border-border p-4 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5"
            >
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                A
              </span>
              {currentQuestion.optionA.label}
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(currentQuestion.optionB.value)}
              className="w-full rounded-lg border-2 border-border p-4 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5"
            >
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                B
              </span>
              {currentQuestion.optionB.label}
            </button>
          </CardContent>
        </Card>

        {currentIndex > 0 && (
          <div className="flex justify-start">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              前の質問に戻る
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ── 結果画面 ──
  if (phase === "result" && resultPersonalityInfo && resultGroupInfo) {
    const showFullResult = isLoggedIn === true;
    const isCheckingAuth = isLoggedIn === null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">診断結果</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            あなたのパーソナリティタイプが判明しました
          </p>
        </div>

        {/* プログレスバー (100%) */}
        <div className="h-2 w-full rounded-full bg-muted">
          <div className="h-2 w-full rounded-full bg-primary" />
        </div>

        {/* 結果カード */}
        <Card
          className="overflow-hidden"
          style={{ borderColor: `${resultPersonalityInfo.color}40` }}
        >
          <div
            className="p-6 text-center"
            style={{ backgroundColor: resultPersonalityInfo.colorLight }}
          >
            <div className="mb-3 text-5xl">
              {resultPersonalityInfo.animalEmoji}
            </div>
            <span
              className="inline-block rounded-full px-4 py-1 text-sm font-bold text-white"
              style={{ backgroundColor: resultPersonalityInfo.color }}
            >
              {resultPersonalityInfo.type}
            </span>
            <h2 className="mt-2 text-xl font-bold">
              {resultPersonalityInfo.name}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {resultPersonalityInfo.nameEn}
              </span>
            </h2>
            <p className="mt-1 text-sm" style={{ color: resultGroupInfo.color }}>
              {resultGroupInfo.name}グループ
            </p>
          </div>

          <CardContent className="space-y-4 pt-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {resultPersonalityInfo.tagline}
            </p>

            {showFullResult ? (
              <>
                <p className="text-sm leading-relaxed">
                  {resultPersonalityInfo.description}
                </p>

                {/* 面接での強み */}
                <div>
                  <h3 className="mb-2 text-sm font-bold text-green-700 dark:text-green-400">
                    面接での強み
                  </h3>
                  <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
                    {resultPersonalityInfo.interviewStrengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* 面接での課題 */}
                <div>
                  <h3 className="mb-2 text-sm font-bold text-orange-700 dark:text-orange-400">
                    面接での課題
                  </h3>
                  <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
                    {resultPersonalityInfo.interviewWeaknesses.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>

                {/* アドバイス */}
                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: `${resultPersonalityInfo.color}10` }}
                >
                  <h3 className="mb-1 text-sm font-bold">面接アドバイス</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {resultPersonalityInfo.adviceTip}
                  </p>
                </div>
              </>
            ) : (
              /* 未ログイン: ぼかし表示 */
              <div className="relative">
                <div className="pointer-events-none select-none blur-md" aria-hidden="true">
                  <p className="text-sm leading-relaxed">
                    {resultPersonalityInfo.description}
                  </p>
                  <div className="mt-4">
                    <h3 className="mb-2 text-sm font-bold text-green-700">面接での強み</h3>
                    <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
                      {resultPersonalityInfo.interviewStrengths.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <h3 className="mb-2 text-sm font-bold text-orange-700">面接での課題</h3>
                    <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
                      {resultPersonalityInfo.interviewWeaknesses.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {!isCheckingAuth && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Lock className="mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="mb-4 text-center text-sm font-medium">
                      無料アカウントを作成すると
                      <br />
                      詳細な診断結果をすべて見られます
                    </p>
                    <Button asChild size="lg">
                      <Link href={`/signup?redirect=/personality/diagnosis`}>
                        アカウント登録して結果を見る
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">
                      登録は30秒。無料です。
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* アクションボタン */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {showFullResult && (
            <>
              {!saved ? (
                <Button onClick={handleSave} disabled={saving} size="lg">
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  {saving ? "保存中..." : "プロフィールに保存する"}
                </Button>
              ) : (
                <Button disabled size="lg" variant="outline" className="text-green-600 border-green-300">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  保存しました
                </Button>
              )}
            </>
          )}

          <Button variant="outline" size="lg" onClick={handleRetry}>
            <RotateCcw className="mr-2 h-4 w-4" />
            もう一度診断する
          </Button>
        </div>

        {/* リンク */}
        {showFullResult && (
          <div className="flex flex-col items-center gap-2 text-sm">
            <Link
              href={`/personality/${resultPersonalityInfo.type.toLowerCase()}`}
              className="text-primary hover:underline"
            >
              {resultPersonalityInfo.type} の詳細ページを見る
            </Link>
            <Link
              href="/profile"
              className="text-muted-foreground hover:underline"
            >
              プロフィール設定に戻る
            </Link>
          </div>
        )}
      </div>
    );
  }

  return null;
}
