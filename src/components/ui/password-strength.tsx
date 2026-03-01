"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

interface StrengthCriteria {
  label: string;
  met: boolean;
}

type StrengthLevel = 0 | 1 | 2 | 3;

interface StrengthInfo {
  level: StrengthLevel;
  label: string;
  color: string;
  barColor: string;
}

function evaluateCriteria(password: string): StrengthCriteria[] {
  return [
    { label: "8文字以上", met: password.length >= 8 },
    { label: "英大文字を含む", met: /[A-Z]/.test(password) },
    { label: "英小文字を含む", met: /[a-z]/.test(password) },
    { label: "数字を含む", met: /[0-9]/.test(password) },
    { label: "記号を含む", met: /[^A-Za-z0-9]/.test(password) },
  ];
}

function calculateStrength(password: string): StrengthInfo {
  if (password.length === 0) {
    return { level: 0, label: "", color: "", barColor: "bg-muted" };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isLong = password.length >= 12;

  // 強い: 大文字+小文字+数字+記号 かつ 12文字以上
  if (hasLower && hasUpper && hasDigit && hasSymbol && isLong) {
    return {
      level: 3,
      label: "非常に強い",
      color: "text-green-600 dark:text-green-400",
      barColor: "bg-green-500",
    };
  }

  // 普通〜強い: 複数の文字種の組み合わせ
  const typesCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  if (typesCount >= 3 && password.length >= 8) {
    return {
      level: 2,
      label: "強い",
      color: "text-yellow-600 dark:text-yellow-400",
      barColor: "bg-yellow-500",
    };
  }

  if (typesCount >= 2 && password.length >= 8) {
    return {
      level: 1,
      label: "普通",
      color: "text-orange-600 dark:text-orange-400",
      barColor: "bg-orange-500",
    };
  }

  // 弱い: 8文字未満 or 1種類のみ
  return {
    level: 0,
    label: "弱い",
    color: "text-red-600 dark:text-red-400",
    barColor: "bg-red-500",
  };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const criteria = useMemo(() => evaluateCriteria(password), [password]);
  const strength = useMemo(() => calculateStrength(password), [password]);

  if (password.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* 強度バー */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">パスワード強度</span>
          <span
            className={cn("text-xs font-medium", strength.color)}
            aria-live="polite"
            role="status"
          >
            {strength.label}
          </span>
        </div>
        <div className="flex gap-1" role="progressbar" aria-valuenow={strength.level} aria-valuemin={0} aria-valuemax={3} aria-label={`パスワード強度: ${strength.label}`}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i <= strength.level && password.length > 0
                  ? strength.barColor
                  : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* チェックリスト */}
      <ul className="space-y-1" aria-label="パスワード条件">
        {criteria.map((criterion) => (
          <li
            key={criterion.label}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              criterion.met
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground"
            )}
          >
            {criterion.met ? (
              <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
            ) : (
              <X className="h-3 w-3 shrink-0" aria-hidden="true" />
            )}
            <span>{criterion.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
