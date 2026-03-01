"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, X, CheckCircle, AlertCircle } from "lucide-react";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// ============================================================
// 選択肢定義
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

const WORK_LOCATIONS = [
  "北海道",
  "東北",
  "関東",
  "中部",
  "関西",
  "中国",
  "四国",
  "九州",
  "海外",
] as const;

// 卒業年の選択肢を生成
function getGraduationYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear - 1; y <= currentYear + 6; y++) {
    years.push(y);
  }
  return years;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

// ============================================================
// コンポーネント
// ============================================================

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // 二重送信防止用 ref
  const savingRef = useRef(false);

  // フォームステート
  const [displayName, setDisplayName] = useState("");
  const [university, setUniversity] = useState("");
  const [faculty, setFaculty] = useState("");
  const [graduationYear, setGraduationYear] = useState<number | "">("");
  const [graduationMonth, setGraduationMonth] = useState<number | "">("");
  const [targetIndustry, setTargetIndustry] = useState<string[]>([]);
  const [targetJobType, setTargetJobType] = useState<string[]>([]);
  const [jobHuntingStatus, setJobHuntingStatus] = useState("not_started");
  const [preferredWorkLocation, setPreferredWorkLocation] = useState<string[]>(
    []
  );

  // トースト自動非表示
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // プロフィール取得
  const fetchProfile = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/profile");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch profile");
      }

      const { profile } = (await res.json()) as { profile: Profile | null };
      if (profile) {
        setDisplayName(profile.display_name ?? "");
        setUniversity(profile.university ?? "");
        setFaculty(profile.faculty ?? "");
        setGraduationYear(profile.graduation_year ?? "");
        setGraduationMonth(profile.graduation_month ?? "");
        setTargetIndustry(profile.target_industry ?? []);
        setTargetJobType(profile.target_job_type ?? []);
        setJobHuntingStatus(profile.job_hunting_status ?? "not_started");
        setPreferredWorkLocation(profile.preferred_work_location ?? []);
      }
    } catch {
      setToast({ type: "error", message: "プロフィールの読み込みに失敗しました" });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

  // 保存（二重送信防止付き）
  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (savingRef.current) return;

    // バリデーション
    if (displayName.trim().length > 0 && displayName.trim().length > 30) {
      setToast({ type: "error", message: "表示名は1~30文字で入力してください" });
      return;
    }
    if (targetIndustry.length > 5) {
      setToast({ type: "error", message: "志望業界は最大5つまで選択できます" });
      return;
    }
    if (targetJobType.length > 5) {
      setToast({ type: "error", message: "志望職種は最大5つまで選択できます" });
      return;
    }

    savingRef.current = true;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName.trim() || null,
          university: university.trim() || null,
          faculty: faculty.trim() || null,
          graduation_year: graduationYear || null,
          graduation_month: graduationMonth || null,
          target_industry: targetIndustry,
          target_job_type: targetJobType,
          job_hunting_status: jobHuntingStatus,
          preferred_work_location: preferredWorkLocation,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "保存に失敗しました");
      }

      setToast({ type: "success", message: "プロフィールを保存しました" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "保存に失敗しました";
      setToast({ type: "error", message });
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">プロフィール設定</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          プロフィール情報を入力すると、AIフィードバックがあなたの状況に合わせてパーソナライズされます。
        </p>
      </div>

      {/* トースト通知 */}
      {toast && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-lg border p-4 ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
          role="alert"
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span className="text-sm">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-auto"
            aria-label="通知を閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>
              あなたの基本的な情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">フルネーム</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="山田 太郎"
                maxLength={30}
                aria-describedby="displayName-hint"
              />
              <p id="displayName-hint" className="text-xs text-muted-foreground">
                1~30文字
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="graduationYear">卒業予定年</Label>
                <select
                  id="graduationYear"
                  value={graduationYear}
                  onChange={(e) =>
                    setGraduationYear(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  aria-label="卒業予定年"
                >
                  <option value="">選択してください</option>
                  {getGraduationYears().map((y) => (
                    <option key={y} value={y}>
                      {y}年
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduationMonth">卒業予定月</Label>
                <select
                  id="graduationMonth"
                  value={graduationMonth}
                  onChange={(e) =>
                    setGraduationMonth(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  aria-label="卒業予定月"
                >
                  <option value="">選択してください</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}月
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 就活情報 */}
        <Card>
          <CardHeader>
            <CardTitle>就活情報</CardTitle>
            <CardDescription>
              現在の就活状況と志望先を教えてください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
              {targetIndustry.length >= 5 && (
                <p className="text-xs text-destructive">
                  最大5つまで選択できます
                </p>
              )}
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
              {targetJobType.length >= 5 && (
                <p className="text-xs text-destructive">
                  最大5つまで選択できます
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 希望条件 */}
        <Card>
          <CardHeader>
            <CardTitle>希望条件</CardTitle>
            <CardDescription>希望する勤務地を選択してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>希望勤務地</Label>
              <div className="flex flex-wrap gap-2">
                {WORK_LOCATIONS.map((location) => {
                  const selected = preferredWorkLocation.includes(location);
                  return (
                    <button
                      key={location}
                      type="button"
                      onClick={() =>
                        toggleSelection(
                          preferredWorkLocation,
                          setPreferredWorkLocation,
                          location,
                          9
                        )
                      }
                      aria-pressed={selected}
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-accent"
                      }`}
                    >
                      {location}
                      {selected && <X className="ml-1 h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 選択中の項目表示 */}
            {(targetIndustry.length > 0 ||
              targetJobType.length > 0 ||
              preferredWorkLocation.length > 0) && (
              <div className="rounded-lg border border-dashed p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  選択中の項目
                </p>
                <div className="space-y-2">
                  {targetIndustry.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        業界:
                      </span>
                      {targetIndustry.map((v) => (
                        <Badge key={v} variant="secondary">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {targetJobType.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        職種:
                      </span>
                      {targetJobType.map((v) => (
                        <Badge key={v} variant="secondary">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {preferredWorkLocation.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        勤務地:
                      </span>
                      {preferredWorkLocation.map((v) => (
                        <Badge key={v} variant="secondary">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 保存ボタン */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? "保存中..." : "保存する"}
          </Button>
        </div>
      </form>
    </div>
  );
}
