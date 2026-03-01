import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TAG_COLORS } from "@/lib/constants";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );

    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error)
      return NextResponse.json(
        { error: "タグの取得に失敗しました" },
        { status: 500 }
      );

    return NextResponse.json({ tags: data ?? [] });
  } catch {
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );

    const body = await request.json();
    const { name, color } = body as { name: string; color?: string };

    if (!name || typeof name !== "string")
      return NextResponse.json(
        { error: "タグ名は必須です" },
        { status: 400 }
      );

    const trimmedName = name.trim();
    if (trimmedName.length === 0 || trimmedName.length > 50)
      return NextResponse.json(
        { error: "タグ名は1～50文字で入力してください" },
        { status: 400 }
      );

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
        return NextResponse.json(
          { error: "同じ名前のタグが既に存在します" },
          { status: 409 }
        );
      return NextResponse.json(
        { error: "タグの作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ tag: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}
