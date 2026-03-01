import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

/** バリデーション: 表示名は1~50文字 */
function validateDisplayName(name: unknown): string | null {
  if (name === null || name === undefined || name === "") return null;
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 50) return null;
  return trimmed;
}

/** バリデーション: テキストフィールド (最大100文字) */
function validateText(value: unknown, maxLength = 100): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > maxLength) return null;
  return trimmed;
}

/** バリデーション: 配列フィールド (最大5件) */
function validateArray(value: unknown, maxItems = 5): string[] {
  if (!Array.isArray(value)) return [];
  const filtered = value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  );
  return filtered.slice(0, maxItems);
}

const VALID_JOB_HUNTING_STATUSES = [
  "not_started",
  "preparing",
  "active",
  "offered",
  "decided",
  "other",
] as const;

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
 * PUT /api/onboarding
 * オンボーディングデータの保存
 * - 認証チェック
 * - プロフィール upsert
 * - onboarding_completed = true にセット
 * - Cookie にフラグをセット
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

    // スキップの場合: onboarding_completed のみセット
    if (body.skip === true) {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          } as never,
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Onboarding skip error:", JSON.stringify(error));
        return NextResponse.json(
          { error: "サーバーとの通信に失敗しました。時間を置いて再度お試しください。", detail: error.message },
          { status: 500 }
        );
      }

      // Cookie にオンボーディング完了フラグをセット
      const cookieStore = await cookies();
      cookieStore.set("onboarding_completed", "true", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });

      return NextResponse.json({ success: true });
    }

    // 通常のオンボーディングデータ保存
    const displayName = validateDisplayName(body.display_name);
    if (
      body.display_name !== undefined &&
      body.display_name !== null &&
      body.display_name !== "" &&
      !displayName
    ) {
      return NextResponse.json(
        { error: "表示名は1~50文字で入力してください" },
        { status: 400 }
      );
    }

    const university = validateText(body.university, 100);
    const faculty = validateText(body.faculty, 100);
    const targetIndustry = validateArray(body.target_industry, 5);
    const targetJobType = validateArray(body.target_job_type, 5);
    const jobHuntingStatus = validateJobHuntingStatus(body.job_hunting_status);

    const profileData: ProfileInsert = {
      user_id: user.id,
      display_name: displayName,
      university,
      faculty,
      target_industry: targetIndustry,
      target_job_type: targetJobType,
      job_hunting_status: jobHuntingStatus,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(profileData as never, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Onboarding upsert error:", JSON.stringify(error));
      return NextResponse.json(
        { error: "サーバーとの通信に失敗しました。時間を置いて再度お試しください。", detail: error.message },
        { status: 500 }
      );
    }

    // Cookie にオンボーディング完了フラグをセット
    const cookieStore = await cookies();
    cookieStore.set("onboarding_completed", "true", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });

    return NextResponse.json({ profile: data });
  } catch (err) {
    console.error("Onboarding unexpected error:", err);
    return NextResponse.json(
      { error: "サーバーとの通信に失敗しました。時間を置いて再度お試しください。" },
      { status: 500 }
    );
  }
}
