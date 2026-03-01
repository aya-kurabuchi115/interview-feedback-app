"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type {
  MockInterviewCategory,
  MockInterviewRound,
  MockInterviewDifficulty,
} from "@/types/database";
import { PERSONALITY_DATA, isValidPersonalityType } from "@/lib/personality/types";
import type { PersonalityType } from "@/lib/personality/types";

// --- 定数 ---
const MAX_COMPANY_NAME_LENGTH = 100;

const INDUSTRY_OPTIONS = [
  { value: "IT・通信", label: "IT・通信" },
  { value: "メーカー", label: "メーカー" },
  { value: "商社", label: "商社" },
  { value: "金融", label: "金融" },
  { value: "コンサルティング", label: "コンサルティング" },
  { value: "広告・メディア", label: "広告・メディア" },
  { value: "不動産・建設", label: "不動産・建設" },
  { value: "インフラ・エネルギー", label: "インフラ・エネルギー" },
  { value: "人材", label: "人材" },
  { value: "小売・流通", label: "小売・流通" },
  { value: "食品", label: "食品" },
  { value: "医療・製薬", label: "医療・製薬" },
  { value: "教育", label: "教育" },
  { value: "官公庁・公社", label: "官公庁・公社" },
  { value: "その他", label: "その他" },
] as const;

const CATEGORY_OPTIONS: { value: MockInterviewCategory; label: string; description: string }[] = [
  { value: "general", label: "人物面接（総合）", description: "志望動機・自己PRなど一般的な質問" },
  { value: "behavioral", label: "行動面接", description: "過去の経験・行動を深掘りする面接" },
  { value: "technical", label: "技術面接", description: "専門知識やスキルを問う面接" },
  { value: "case", label: "ケース面接", description: "ビジネスケースの解決力を問う面接" },
];

const ROUND_OPTIONS: { value: MockInterviewRound; label: string }[] = [
  { value: "first", label: "一次面接" },
  { value: "second", label: "二次面接" },
  { value: "third", label: "三次面接" },
  { value: "final", label: "最終面接" },
];

const DURATION_OPTIONS = [
  { value: 10, label: "10分（短め）" },
  { value: 15, label: "15分（標準）" },
  { value: 20, label: "20分（やや長め）" },
  { value: 30, label: "30分（じっくり）" },
] as const;

const DIFFICULTY_OPTIONS: { value: MockInterviewDifficulty; label: string; description: string }[] = [
  { value: "easy", label: "やさしい", description: "基本的な質問中心。面接練習の初回におすすめ" },
  { value: "normal", label: "標準", description: "一般的な面接レベル。深掘り質問あり" },
  { value: "hard", label: "厳しい", description: "圧迫気味。鋭い深掘りで本番さながらの面接" },
];

interface SetupFormProps {
  defaultIndustry: string;
  personalityType: string | null;
}

export function SetupForm({ defaultIndustry, personalityType }: SetupFormProps) {
  // フォーム状態
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState(defaultIndustry);
  const [category, setCategory] = useState<MockInterviewCategory>("general");
  const [round, setRound] = useState<MockInterviewRound>("first");
  const [duration, setDuration] = useState(15);
  const [difficulty, setDifficulty] = useState<MockInterviewDifficulty>("normal");

  // 企業名サジェスト
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // UI状態
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- 企業名サジェスト ---
  const fetchCompanySuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 1) {
      setCompanySuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const supabase = createClient();
      const escaped = query.replace(/[%_\\]/g, "\\$&");
      const { data } = await supabase
        .from("companies")
        .select("name")
        .ilike("name", `%${escaped}%`)
        .limit(5);

      const companies = data as { name: string }[] | null;
      if (companies && companies.length > 0) {
        setCompanySuggestions(companies.map((c) => c.name));
        setShowSuggestions(true);
      } else {
        setCompanySuggestions([]);
        setShowSuggestions(false);
      }
    } catch {
      // サジェスト取得失敗は無視
    }
  }, []);

  const handleCompanyNameChange = (value: string) => {
    setCompanyName(value);
    setError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchCompanySuggestions(value);
    }, 300);
  };

  const selectSuggestion = (name: string) => {
    setCompanyName(name);
    setShowSuggestions(false);
  };

  // --- 送信 ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName.trim() || null,
          industry: industry || null,
          category,
          round,
          duration_minutes: duration,
          difficulty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "面接の開始に失敗しました");
        return;
      }

      router.push(`/mock-interview/${data.id}/chat`);
    } catch {
      setError(
        "ネットワークエラーが発生しました。接続を確認してもう一度お試しください。"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* エラー表示 */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-md bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* 企業名 */}
      <div className="space-y-2">
        <Label htmlFor="company-name">企業名（任意）</Label>
        <p className="text-xs text-muted-foreground">
          企業名を入力すると、その企業に合わせた質問が生成されます
        </p>
        <div className="relative">
          <Input
            id="company-name"
            placeholder="例: 株式会社サンプル"
            value={companyName}
            onChange={(e) => handleCompanyNameChange(e.target.value)}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            maxLength={MAX_COMPANY_NAME_LENGTH}
            autoComplete="organization"
          />
          {showSuggestions && companySuggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
              {companySuggestions.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                    onMouseDown={() => selectSuggestion(name)}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 業界 */}
      <div className="space-y-2">
        <Label htmlFor="industry">業界（任意）</Label>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger id="industry" className="w-full">
            <SelectValue placeholder="業界を選択" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 面接カテゴリ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">面接タイプ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCategory(opt.value)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  category === opt.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium text-sm">{opt.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {opt.description}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ラウンド */}
      <div className="space-y-2">
        <Label htmlFor="round">面接ラウンド</Label>
        <Select
          value={round}
          onValueChange={(v) => setRound(v as MockInterviewRound)}
        >
          <SelectTrigger id="round" className="w-full">
            <SelectValue placeholder="ラウンドを選択" />
          </SelectTrigger>
          <SelectContent>
            {ROUND_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 面接時間 */}
      <div className="space-y-2">
        <Label htmlFor="duration">面接時間</Label>
        <Select
          value={String(duration)}
          onValueChange={(v) => setDuration(Number(v))}
        >
          <SelectTrigger id="duration" className="w-full">
            <SelectValue placeholder="時間を選択" />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 難易度 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">難易度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDifficulty(opt.value)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  difficulty === opt.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium text-sm">{opt.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {opt.description}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* パーソナリティタイプ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            パーソナリティタイプ
          </CardTitle>
        </CardHeader>
        <CardContent>
          {personalityType && isValidPersonalityType(personalityType) ? (() => {
            const pData = PERSONALITY_DATA[personalityType.toUpperCase() as PersonalityType];
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{pData.animalEmoji}</span>
                  <span className="font-medium">{pData.type} - {pData.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  あなたのパーソナリティに基づいた面接練習ができます。フィードバックにタイプ固有のアドバイスが含まれます。
                </p>
                <p className="text-xs text-muted-foreground">
                  面接での強み: {pData.interviewStrengths.join("、")}
                </p>
              </div>
            );
          })() : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                パーソナリティタイプを設定すると、あなたに合ったフィードバックが得られます。
              </p>
              <Link
                href="/personality"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <Sparkles className="h-3.5 w-3.5" />
                パーソナリティ診断を受ける
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 送信ボタン */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            面接を準備中...
          </>
        ) : (
          <>
            <MessageSquare className="mr-2 h-5 w-5" />
            面接を始める
          </>
        )}
      </Button>
    </form>
  );
}
