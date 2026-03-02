"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import { t } from "@/lib/i18n";

// ============================================================
// ツアーステップ定義
// ============================================================

interface TourStep {
  titleKey: string;
  descriptionKey: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    titleKey: "onboarding.tourWelcome",
    descriptionKey: "onboarding.tourWelcomeDesc",
  },
  {
    titleKey: "onboarding.tourDashboard",
    descriptionKey: "onboarding.tourDashboardDesc",
  },
  {
    titleKey: "onboarding.tourNewInterview",
    descriptionKey: "onboarding.tourNewInterviewDesc",
  },
  {
    titleKey: "onboarding.tourMockInterview",
    descriptionKey: "onboarding.tourMockInterviewDesc",
  },
];

const STORAGE_KEY = "interviewcoach_tour_completed";

// ============================================================
// コンポーネント
// ============================================================

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const completed = localStorage.getItem(STORAGE_KEY);
      if (!completed) {
        setIsOpen(true);
      }
    } catch {
      // localStorage アクセスエラーは無視
    }
    setMounted(true);
  }, []);

  // ツアー完了
  const completeTour = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // 無視
    }
  }, []);

  // 次のステップ
  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeTour();
    }
  }, [currentStep, completeTour]);

  // 前のステップ
  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Esc キーで閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        completeTour();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, completeTour]);

  if (!mounted || !isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="オンボーディングツアー"
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="relative pb-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-8 w-8"
            onClick={completeTour}
            aria-label={t("common.close")}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="pr-8 text-lg">
            {t(step.titleKey as Parameters<typeof t>[0])}
          </CardTitle>
          <CardDescription className="text-sm">
            {t(step.descriptionKey as Parameters<typeof t>[0])}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ステップインジケーター（ドット） */}
          <div className="flex items-center justify-center gap-2">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === currentStep
                    ? "bg-primary"
                    : i < currentStep
                      ? "bg-primary/40"
                      : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* ステップ番号表示 */}
          <p className="text-center text-xs text-muted-foreground">
            {t("onboarding.tourStepOf")
              .replace("{current}", String(currentStep + 1))
              .replace("{total}", String(TOUR_STEPS.length))}
          </p>

          {/* ナビゲーションボタン */}
          <div className="flex items-center justify-between">
            <div>
              {currentStep > 0 ? (
                <Button variant="outline" size="sm" onClick={handlePrev}>
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  {t("onboarding.tourPrev")}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={completeTour}
                  className="text-muted-foreground"
                >
                  {t("onboarding.tourSkip")}
                </Button>
              )}
            </div>
            <Button size="sm" onClick={handleNext}>
              {isLast ? t("onboarding.tourFinish") : t("onboarding.tourNext")}
              {!isLast && <ArrowRight className="ml-1 h-3 w-3" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
