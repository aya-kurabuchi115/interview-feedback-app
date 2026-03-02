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
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Mic,
  FileText,
  Brain,
  MessageSquare,
  Star,
} from "lucide-react";
import { t } from "@/lib/i18n";

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

const TOTAL_STEPS = 4;

const STEP_LABELS = [
  t("onboarding.stepBasicInfo"),
  t("onboarding.stepPreferences"),
  t("onboarding.stepGoal"),
  t("onboarding.stepComplete"),
];

// ============================================================
// 目的選択の定義
// ============================================================

type GoalType = "interview" | "es" | "self_analysis" | "mock";

interface GoalOption {
  id: GoalType;
  labelKey: string;
  descKey: string;
  icon: React.ElementType;
}

const GOALS: GoalOption[] = [
  {
    id: "interview",
    labelKey: "onboarding.goalInterview",
    descKey: "onboarding.goalInterviewDesc",
    icon: Mic,
  },
  {
    id: "es",
    labelKey: "onboarding.goalES",
    descKey: "onboarding.goalESDesc",
    icon: FileText,
  },
  {
    id: "self_analysis",
    labelKey: "onboarding.goalSelfAnalysis",
    descKey: "onboarding.goalSelfAnalysisDesc",
    icon: Brain,
  },
  {
    id: "mock",
    labelKey: "onboarding.goalMock",
    descKey: "onboarding.goalMockDesc",
    icon: MessageSquare,
  },
];

// ============================================================
// 機能カードの定義
// ============================================================

interface FeatureCard {
  id: string;
  titleKey: string;
  descKey: string;
  href: string;
  icon: React.ElementType;
  recommendedFor: GoalType[];
}

const FEATURES: FeatureCard[] = [
  {
    id: "interview",
    titleKey: "onboarding.featureInterview",
    descKey: "onboarding.featureInterviewDesc",
    href: "/interview/new",
    icon: Mic,
    recommendedFor: ["interview"],
  },
  {
    id: "mock",
    titleKey: "onboarding.featureMock",
    descKey: "onboarding.featureMockDesc",
    href: "/mock-interview",
    icon: MessageSquare,
    recommendedFor: ["mock", "interview"],
  },
  {
    id: "es",
    titleKey: "onboarding.featureES",
    descKey: "onboarding.featureESDesc",
    href: "/es-review",
    icon: FileText,
    recommendedFor: ["es"],
  },
  {
    id: "personality",
    titleKey: "onboarding.featurePersonality",
    descKey: "onboarding.featurePersonalityDesc",
    href: "/personality",
    icon: Brain,
    recommendedFor: ["self_analysis"],
  },
];

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

  // ステップ3: 目的選択
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);

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

      setCurrentStep(4);
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
      setError("");
      setCurrentStep(3);
    } else if (currentStep === 3) {
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

  // 機能カードをソート（選択した目的に関連するものを先頭に）
  const sortedFeatures = [...FEATURES].sort((a, b) => {
    const aRecommended = selectedGoal
      ? a.recommendedFor.includes(selectedGoal)
      : false;
    const bRecommended = selectedGoal
      ? b.recommendedFor.includes(selectedGoal)
      : false;
    if (aRecommended && !bRecommended) return -1;
    if (!aRecommended && bRecommended) return 1;
    return 0;
  });

  const progressValue = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="space-y-6">
      {/* プログレスバー */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((label, i) => {
            const step = i + 1;
            return (
              <div
                key={i}
                className={`text-xs font-medium ${
                  step === currentStep
                    ? "text-primary"
                    : step < currentStep
                      ? "text-primary/60"
                      : "text-muted-foreground"
                }`}
              >
                {label}
              </div>
            );
          })}
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* エラー表示 */}
      {error && (
        <div
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      {/* ステップ1: 基本情報 */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("onboarding.stepBasicInfo")}</CardTitle>
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
            <CardTitle>{t("onboarding.stepPreferences")}</CardTitle>
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

      {/* ステップ3: 目的選択 */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("onboarding.goalTitle")}</CardTitle>
            <CardDescription>
              {t("onboarding.goalDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {GOALS.map((goal) => {
                const Icon = goal.icon;
                const selected = selectedGoal === goal.id;
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
                      selected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/40 hover:bg-accent/50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {t(goal.labelKey as Parameters<typeof t>[0])}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t(goal.descKey as Parameters<typeof t>[0])}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ステップ4: 完了 */}
      {currentStep === 4 && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">
              {t("onboarding.completeTitle")}
            </CardTitle>
            <CardDescription>
              {t("onboarding.completeDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 機能カード（選択した目的に関連するものを優先表示） */}
            <div className="grid gap-3 sm:grid-cols-2">
              {sortedFeatures.map((feature) => {
                const Icon = feature.icon;
                const isRecommended =
                  selectedGoal &&
                  feature.recommendedFor.includes(selectedGoal);
                return (
                  <Link
                    key={feature.id}
                    href={feature.href}
                    className="group relative flex items-start gap-3 rounded-lg border p-4 transition-all hover:border-primary/40 hover:bg-accent/50"
                  >
                    {isRecommended && (
                      <span className="absolute -top-2 right-2 inline-flex items-center gap-0.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                        <Star className="h-2.5 w-2.5" />
                        {t("onboarding.recommendedForYou")}
                      </span>
                    )}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {t(feature.titleKey as Parameters<typeof t>[0])}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t(feature.descKey as Parameters<typeof t>[0])}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* ダッシュボードへのリンク */}
            <div className="flex flex-col items-center gap-4">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  {t("onboarding.goToDashboard")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                {t("onboarding.profileEditHint")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ナビゲーションボタン */}
      {currentStep < 4 && (
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={saving}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("common.back")}
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
              {t("onboarding.tourSkip")}
            </Button>
            <Button onClick={handleNext} disabled={saving}>
              {saving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {currentStep === 3
                ? t("onboarding.stepComplete")
                : t("common.next")}
              {!saving && currentStep < 3 && (
                <ArrowRight className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
