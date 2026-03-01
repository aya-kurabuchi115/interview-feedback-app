"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Loader2, Save, X, CheckCircle, AlertCircle, Bell, BellOff } from "lucide-react";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationEnabled,
  setNotificationEnabled as setNotificationEnabledStorage,
} from "@/lib/notifications";
import {
  PERSONALITY_TYPES,
  PERSONALITY_DATA,
  getGroupForType,
  isValidPersonalityType,
  type PersonalityType,
} from "@/lib/personality/types";
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
  const [personalityType, setPersonalityType] = useState<string>("");

  // 通知設定
  const [notificationSupported, setNotificationSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | null>(null);
  const [notificationEnabled, setNotificationEnabledState] = useState(true);

  // 通知状態の初期化
  useEffect(() => {
    const supported = isNotificationSupported();
    setNotificationSupported(supported);
    if (supported) {
      setNotificationPermission(getNotificationPermission());
      setNotificationEnabledState(isNotificationEnabled());
    }
  }, []);

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
        setPersonalityType(profile.personality_type ?? "");
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

  // フィールドごとのバリデーションエラー
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // クライアントサイドバリデーション
  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    const trimmedName = displayName.trim();
    if (trimmedName.length === 0) {
      errors.displayName = "フルネームを入力してください（1〜30文字）";
    } else if (trimmedName.length > 30) {
      errors.displayName = "フルネームは30文字以内で入力してください";
    }
    if (university.trim().length > 100) {
      errors.university = "大学名は100文字以内で入力してください";
    }
    if (faculty.trim().length > 100) {
      errors.faculty = "学部・学科は100文字以内で入力してください";
    }
    if (targetIndustry.length > 5) {
      errors.targetIndustry = "志望業界は最大5つまで選択できます";
    }
    if (targetJobType.length > 5) {
      errors.targetJobType = "志望職種は最大5つまで選択できます";
    }
    return errors;
  };

  // 保存（二重送信防止付き）
  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (savingRef.current) return;

    // クライアントバリデーション
    const errors = validateForm();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors);
      setToast({
        type: "error",
        message: `入力内容を確認してください:\n${errorMessages.join("\n")}`,
      });
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
          personality_type: personalityType || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.error || "サーバーとの通信に失敗しました。時間を置いて再度お試しください。"
        );
      }

      setToast({ type: "success", message: "プロフィールを保存しました" });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "サーバーとの通信に失敗しました。時間を置いて再度お試しください。";
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
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          }`}
          role="alert"
          aria-live="assertive"
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span className="text-sm whitespace-pre-line">{toast.message}</span>
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
              あなたの基本的な情報を入力してください（<span className="text-destructive">*</span>は必須項目）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">
                フルネーム<span className="text-destructive">*</span>
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (fieldErrors.displayName) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.displayName;
                      return next;
                    });
                  }
                }}
                placeholder="山田 太郎"
                maxLength={30}
                autoComplete="name"
                aria-describedby="displayName-hint"
                aria-invalid={!!fieldErrors.displayName}
                aria-errormessage={fieldErrors.displayName ? "displayName-error" : undefined}
                required
              />
              {fieldErrors.displayName ? (
                <p id="displayName-error" className="text-xs text-destructive" role="alert">
                  {fieldErrors.displayName}
                </p>
              ) : (
                <p id="displayName-hint" className="text-xs text-muted-foreground">
                  1〜30文字（必須）
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">
                大学名<span className="ml-1 text-xs text-muted-foreground">（任意）</span>
              </Label>
              <Input
                id="university"
                value={university}
                onChange={(e) => {
                  setUniversity(e.target.value);
                  if (fieldErrors.university) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.university;
                      return next;
                    });
                  }
                }}
                placeholder="東京大学"
                maxLength={100}
                autoComplete="organization"
                aria-invalid={!!fieldErrors.university}
              />
              {fieldErrors.university && (
                <p className="text-xs text-destructive" role="alert">
                  {fieldErrors.university}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty">
                学部・学科<span className="ml-1 text-xs text-muted-foreground">（任意）</span>
              </Label>
              <Input
                id="faculty"
                value={faculty}
                onChange={(e) => {
                  setFaculty(e.target.value);
                  if (fieldErrors.faculty) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.faculty;
                      return next;
                    });
                  }
                }}
                placeholder="工学部 情報工学科"
                maxLength={100}
                autoComplete="off"
                aria-invalid={!!fieldErrors.faculty}
              />
              {fieldErrors.faculty && (
                <p className="text-xs text-destructive" role="alert">
                  {fieldErrors.faculty}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="graduationYear">
                  卒業予定年<span className="ml-1 text-xs text-muted-foreground">（任意）</span>
                </Label>
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
                <Label htmlFor="graduationMonth">
                  卒業予定月<span className="ml-1 text-xs text-muted-foreground">（任意）</span>
                </Label>
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
              <Label htmlFor="jobHuntingStatus">
                就活状況<span className="ml-1 text-xs text-muted-foreground">（任意）</span>
              </Label>
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
                志望業界<span className="ml-1 text-xs text-muted-foreground">（任意・最大5つ）</span>
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
                志望職種<span className="ml-1 text-xs text-muted-foreground">（任意・最大5つ）</span>
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
              <Label>
                希望勤務地<span className="ml-1 text-xs text-muted-foreground">（任意）</span>
              </Label>
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

        {/* パーソナリティタイプ */}
        <Card
          style={
            personalityType && isValidPersonalityType(personalityType)
              ? { borderColor: `${PERSONALITY_DATA[personalityType as PersonalityType].color}40` }
              : undefined
          }
        >
          <CardHeader>
            <CardTitle>パーソナリティタイプ</CardTitle>
            <CardDescription>
              16パーソナリティタイプを設定すると、AIフィードバックがより的確になります
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 設定済みの場合: タイプ表示 */}
            {personalityType && isValidPersonalityType(personalityType) && (() => {
              const pInfo = PERSONALITY_DATA[personalityType as PersonalityType];
              const gInfo = getGroupForType(personalityType as PersonalityType);
              return (
                <div
                  className="flex items-center gap-4 rounded-lg p-4"
                  style={{ backgroundColor: pInfo.colorLight }}
                >
                  <div className="text-4xl">{pInfo.animalEmoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                        style={{ backgroundColor: pInfo.color }}
                      >
                        {pInfo.type}
                      </span>
                      <span className="text-sm font-bold">{pInfo.name}</span>
                      <span className="text-xs text-muted-foreground">{pInfo.nameEn}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {gInfo.name}グループ / {pInfo.tagline}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* 手動選択ドロップダウン */}
            <div className="space-y-2">
              <Label htmlFor="personalityType">
                タイプを手動で選択<span className="ml-1 text-xs text-muted-foreground">（任意・既に自分のタイプを知っている方）</span>
              </Label>
              <select
                id="personalityType"
                value={personalityType}
                onChange={(e) => setPersonalityType(e.target.value)}
                autoComplete="off"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                aria-label="パーソナリティタイプ"
              >
                <option value="">未設定</option>
                {PERSONALITY_TYPES.map((t) => {
                  const info = PERSONALITY_DATA[t];
                  return (
                    <option key={t} value={t}>
                      {info.animalEmoji} {t} - {info.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 診断リンク */}
            <div className="rounded-lg border border-dashed p-4 text-center">
              <p className="text-sm text-muted-foreground">
                自分のタイプが分からない方は
              </p>
              <Link
                href="/personality/diagnosis"
                className="mt-2 inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                簡易診断テスト（10問・約2分）を受ける →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 通知設定 */}
        <Card>
          <CardHeader>
            <CardTitle>通知設定</CardTitle>
            <CardDescription>
              分析完了時の通知方法を設定してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationSupported ? (
              <>
                {/* ブラウザ通知の許可状態 */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    {notificationEnabled && notificationPermission === "granted" ? (
                      <Bell className="h-5 w-5 text-primary" />
                    ) : (
                      <BellOff className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">ブラウザ通知</p>
                      <p className="text-xs text-muted-foreground">
                        {notificationPermission === "granted"
                          ? "分析完了時にブラウザ通知を送信します"
                          : notificationPermission === "denied"
                            ? "ブラウザの設定で通知がブロックされています"
                            : "通知許可が必要です"}
                      </p>
                    </div>
                  </div>
                  <div>
                    {notificationPermission === "granted" ? (
                      <button
                        type="button"
                        onClick={() => {
                          const next = !notificationEnabled;
                          setNotificationEnabledState(next);
                          setNotificationEnabledStorage(next);
                        }}
                        role="switch"
                        aria-checked={notificationEnabled}
                        aria-label="ブラウザ通知の切り替え"
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          notificationEnabled ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                            notificationEnabled
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    ) : notificationPermission === "denied" ? (
                      <span className="text-xs text-muted-foreground">
                        ブロック中
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const perm = await requestNotificationPermission();
                          setNotificationPermission(perm);
                          if (perm === "granted") {
                            setNotificationEnabledState(true);
                            setNotificationEnabledStorage(true);
                          }
                        }}
                      >
                        許可する
                      </Button>
                    )}
                  </div>
                </div>

                {/* アプリ内通知（常に有効） */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">アプリ内通知</p>
                      <p className="text-xs text-muted-foreground">
                        ブラウザ通知が利用できない場合のフォールバック
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-primary">
                    常にON
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                お使いのブラウザはブラウザ通知に対応していません。分析完了時はアプリ内で通知されます。
              </p>
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
