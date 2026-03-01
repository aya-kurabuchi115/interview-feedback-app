"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle, ArrowRight, ArrowLeft, X } from "lucide-react";

// ============================================================
// 選択肢定義（プロフィールページと同じ定数）
// ============================================================

const INDUSTRIES = [
  "IT",
  "金融",
  "商社",
  "メーカー",
  "コンサル",
  "広告",
  "不動産",
  "公務員",
  "その他",
] as const;

const JOB_TYPES = [
  "エンジニア",
  "営業",
  "企画",
  "マーケティング",
  "事務",
  "研究",
  "デザイン",
  "その他",
] as const;

const JOB_HUNTING_STATUSES = [
  { value: "not_started", label: "未開始" },
  { value: "preparing", label: "就活準備中" },
  { value: "active", label: "エントリー・選考中" },
  { value: "offered", label: "内定あり" },
  { value: "decided", label: "就活終了" },
  { value: "other", label: "その他" },
] as const;

const TOTAL_STEPS = 3;

// ============================================================
// コンポーネント
// ============================================================

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const savingRef = useRef(false);

  // ステップ1: 基本情報
  const [displayName, setDisplayName] = useState("");
  const [university, setUniversity] = useState("");
  const [faculty, setFaculty] = useState("");

  // ステップ2: 志望情報
  const [targetIndustry, setTargetIndustry] = useState<string[]>([]);
  const [targetJobType, setTargetJobType] = useState<string[]>([]);
  const [jobHuntingStatus, setJobHuntingStatus] = useState("not_started");

  // 複数選択トグル
  const toggleSelection = (
    current: string[],
    setter: (v: string[]) => void,
    value: string,
    maxItems: number
  ) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else if (current.length < maxItems) {
      setter([...current, value]);
    }
  };

  // API にデータを保存
  const saveOnboarding = async (skipData: boolean) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError("");

    try {
      const body = skipData
        ? { skip: true }
        : {
            display_name: displayName.trim() || null,
            university: university.trim() || null,
            faculty: faculty.trim() || null,
            target_industry: targetIndustry,
            target_job_type: targetJobType,
            job_hunting_status: jobHuntingStatus,
          };

      const res = await fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "保存に失敗しました");
      }

      setCurrentStep(3);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "保存に失敗しました";
      setError(message);
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  };

  // 「次へ」ボタン
  const handleNext = () => {
    if (currentStep === 1) {
      if (displayName.trim().length > 0 && displayName.trim().length > 50) {
        setError("表示名は1~50文字で入力してください");
        return;
      }
      setError("");
      setCurrentStep(2);
    } else if (currentStep === 2) {
      saveOnboarding(false);
    }
  };

  // 「戻る」ボタン
  const handleBack = () => {
    if (currentStep > 1) {
      setError("");
      setCurrentStep(currentStep - 1);
    }
  };

  // 「スキップ」ボタン
  const handleSkip = () => {
    saveOnboarding(true);
  };

  return (
    <div className="space-y-6">
      {/* ステップインジケーター */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === currentStep
                  ? "bg-primary text-primary-foreground"
                  : step < currentStep
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step < currentStep ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                step
              )}
            </div>
            {step < TOTAL_STEPS && (
              <div
                className={`h-0.5 w-8 ${
                  step < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">
        ステップ {currentStep} / {TOTAL_STEPS}
      </p>

      {/* エラー表示 */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ステップ1: 基本情報 */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>
              あなたの基本的な情報を教えてください。後からプロフィールページで変更できます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="山田 太郎"
                maxLength={50}
                aria-describedby="displayName-hint"
              />
              <p
                id="displayName-hint"
                className="text-xs text-muted-foreground"
              >
                1~50文字（任意）
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">大学名</Label>
              <Input
                id="university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="東京大学"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty">学部・学科</Label>
              <Input
                id="faculty"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="工学部 情報工学科"
                maxLength={100}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ステップ2: 志望情報 */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>志望情報</CardTitle>
            <CardDescription>
              志望する業界・職種・就活状況を選択してください。AIフィードバックのパーソナライズに活用されます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>
                志望業界
                <span className="ml-2 text-xs text-muted-foreground">
                  (最大5つ)
                </span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((industry) => {
                  const selected = targetIndustry.includes(industry);
                  return (
                    <button
                      key={industry}
                      type="button"
                      onClick={() =>
                        toggleSelection(
                          targetIndustry,
                          setTargetIndustry,
                          industry,
                          5
                        )
                      }
                      aria-pressed={selected}
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-accent"
                      }`}
                    >
                      {industry}
                      {selected && <X className="ml-1 h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                志望職種
                <span className="ml-2 text-xs text-muted-foreground">
                  (最大5つ)
                </span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map((jobType) => {
                  const selected = targetJobType.includes(jobType);
                  return (
                    <button
                      key={jobType}
                      type="button"
                      onClick={() =>
                        toggleSelection(
                          targetJobType,
                          setTargetJobType,
                          jobType,
                          5
                        )
                      }
                      aria-pressed={selected}
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-accent"
                      }`}
                    >
                      {jobType}
                      {selected && <X className="ml-1 h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobHuntingStatus">就活状況</Label>
              <select
                id="jobHuntingStatus"
                value={jobHuntingStatus}
                onChange={(e) => setJobHuntingStatus(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                aria-label="就活状況"
              >
                {JOB_HUNTING_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ステップ3: 完了 */}
      {currentStep === 3 && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">セットアップ完了！</CardTitle>
            <CardDescription>
              プロフィールの設定が完了しました。さっそく面接練習を始めましょう。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">
                ダッシュボードへ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              プロフィールは
              <Link
                href="/profile"
                className="text-primary hover:underline"
              >
                プロフィールページ
              </Link>
              からいつでも変更できます。
            </p>
          </CardContent>
        </Card>
      )}

      {/* ナビゲーションボタン */}
      {currentStep < 3 && (
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={saving}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={saving}
            >
              {saving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              スキップ
            </Button>
            <Button onClick={handleNext} disabled={saving}>
              {saving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {currentStep === 2 ? "完了" : "次へ"}
              {!saving && currentStep < 2 && (
                <ArrowRight className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
