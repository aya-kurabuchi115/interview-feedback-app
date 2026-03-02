import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TAG_COLORS } from "@/lib/constants";
import { unauthorized, badRequest, conflict, serverError } from "@/lib/api/error-response";
import { reportApiError } from "@/lib/error-reporting";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error)
      return serverError(
        "タグの取得中にこちらの問題でエラーが発生しました。しばらくしてから再度お試しください。"
      );

    return NextResponse.json(
      { tags: data ?? [] },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    reportApiError(error, {
      apiRoute: "/api/tags",
      featureArea: "tags",
    });
    return serverError(
      "タグの取得中にこちらの問題でエラーが発生しました。しばらくしてから再度お試しください。"
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const { name, color } = body as { name: string; color?: string };

    if (!name || typeof name !== "string")
      return badRequest("タグ名は必須です");

    const trimmedName = name.trim();
    if (trimmedName.length === 0 || trimmedName.length > 50)
      return badRequest("タグ名は1～50文字で入力してください");

    const validColors = TAG_COLORS.map((c) => c.value);
    const tagColor =
      color && validColors.includes(color as (typeof validColors)[number])
        ? color
        : "blue";

    const { data, error } = await supabase
      .from("tags")
      .insert({
        user_id: user.id,
        name: trimmedName,
        color: tagColor,
      } as never)
      .select()
      .single();

    if (error) {
      if (error.code === "23505")
        return conflict("同じ名前のタグが既に存在します");
      return serverError(
        "タグの作成中にこちらの問題でエラーが発生しました。しばらくしてから再度お試しください。"
      );
    }

    return NextResponse.json({ tag: data }, { status: 201 });
  } catch (error) {
    reportApiError(error, {
      apiRoute: "/api/tags",
      featureArea: "tags",
    });
    return serverError(
      "タグの作成中にこちらの問題でエラーが発生しました。しばらくしてから再度お試しください。"
    );
  }
}
