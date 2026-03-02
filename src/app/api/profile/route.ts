import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { PERSONALITY_TYPES } from "@/lib/personality/types";
import { unauthorized, badRequest, serverError } from "@/lib/api/error-response";
import { reportApiError } from "@/lib/error-reporting";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

/** バリデーション: 表示名は1~30文字 */
function validateDisplayName(name: unknown): { value: string | null; error?: string } {
  if (typeof name !== "string" || name.trim().length === 0) {
    return { value: null, error: "フルネームを入力してください（1〜30文字）" };
  }
  const trimmed = name.trim();
  if (trimmed.length > 30) {
    return { value: null, error: "フルネームは30文字以内で入力してください" };
  }
  return { value: trimmed };
}

/** バリデーション: テキストフィールド (最大100文字) */
function validateText(value: unknown, fieldName: string, maxLength = 100): { value: string | null; error?: string } {
  if (value === null || value === undefined || value === "") return { value: null };
  if (typeof value !== "string") return { value: null };
  const trimmed = value.trim();
  if (trimmed.length === 0) return { value: null };
  if (trimmed.length > maxLength) {
    return { value: null, error: `${fieldName}は${maxLength}文字以内で入力してください` };
  }
  return { value: trimmed };
}

/** バリデーション: 配列フィールド (最大5件) */
function validateArray(value: unknown, maxItems = 5): string[] {
  if (!Array.isArray(value)) return [];
  const filtered = value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  );
  return filtered.slice(0, maxItems);
}

/** バリデーション: 卒業年 */
function validateGraduationYear(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (isNaN(num)) return null;
  const currentYear = new Date().getFullYear();
  if (num < currentYear - 5 || num > currentYear + 6) return null;
  return num;
}

/** バリデーション: 卒業月 */
function validateGraduationMonth(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (isNaN(num) || num < 1 || num > 12) return null;
  return num;
}

const VALID_JOB_HUNTING_STATUSES = [
  "not_started",
  "preparing",
  "active",
  "offered",
  "decided",
  "other",
] as const;

/** バリデーション: パーソナリティタイプ (16タイプのみ or null) */
function validatePersonalityType(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return null;
  const upper = value.toUpperCase();
  if (PERSONALITY_TYPES.includes(upper as (typeof PERSONALITY_TYPES)[number])) {
    return upper;
  }
  return null;
}

/** バリデーション: 就活ステータス */
function validateJobHuntingStatus(
  value: unknown
): Database["public"]["Enums"]["job_hunting_status"] {
  if (
    typeof value === "string" &&
    VALID_JOB_HUNTING_STATUSES.includes(
      value as (typeof VALID_JOB_HUNTING_STATUSES)[number]
    )
  ) {
    return value as Database["public"]["Enums"]["job_hunting_status"];
  }
  return "not_started";
}

/**
 * GET /api/profile
 * 現在のユーザーのプロフィール情報を取得する
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = row not found
      return NextResponse.json(
        { error: "プロフィールの取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: data ?? null });
  } catch (error) {
    reportApiError(error, {
      apiRoute: "/api/profile",
      featureArea: "profile",
    });
    return NextResponse.json(
      { error: "サーバーとの通信に失敗しました。時間を置いて再度お試しください。" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * プロフィール情報を作成・更新する (upsert)
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();

    // バリデーション（エラーを収集して一括返却）
    const errors: string[] = [];

    const displayNameResult = validateDisplayName(body.display_name);
    if (displayNameResult.error) errors.push(displayNameResult.error);

    const universityResult = validateText(body.university, "大学名", 100);
    if (universityResult.error) errors.push(universityResult.error);

    const facultyResult = validateText(body.faculty, "学部・学科", 100);
    if (facultyResult.error) errors.push(facultyResult.error);

    const graduationYear = validateGraduationYear(body.graduation_year);
    const graduationMonth = validateGraduationMonth(body.graduation_month);
    const targetIndustry = validateArray(body.target_industry, 5);
    const targetJobType = validateArray(body.target_job_type, 5);
    const jobHuntingStatus = validateJobHuntingStatus(body.job_hunting_status);
    const preferredWorkLocation = validateArray(
      body.preferred_work_location,
      11
    );

    // personality_type が送られてきた場合のみバリデーション＆セット
    const personalityType = body.personality_type !== undefined
      ? validatePersonalityType(body.personality_type)
      : undefined;

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join("\n"), errors },
        { status: 400 }
      );
    }

    const profileData: ProfileInsert = {
      user_id: user.id,
      display_name: displayNameResult.value,
      university: universityResult.value,
      faculty: facultyResult.value,
      graduation_year: graduationYear,
      graduation_month: graduationMonth,
      target_industry: targetIndustry,
      target_job_type: targetJobType,
      job_hunting_status: jobHuntingStatus,
      preferred_work_location: preferredWorkLocation,
      ...(body.personality_type !== undefined && { personality_type: personalityType }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(profileData as never, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Profile upsert error:", error);
      return NextResponse.json(
        { error: "サーバーとの通信に失敗しました。時間を置いて再度お試しください。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    reportApiError(error, {
      apiRoute: "/api/profile",
      featureArea: "profile",
    });
    return NextResponse.json(
      { error: "サーバーとの通信に失敗しました。時間を置いて再度お試しください。" },
      { status: 500 }
    );
  }
}
