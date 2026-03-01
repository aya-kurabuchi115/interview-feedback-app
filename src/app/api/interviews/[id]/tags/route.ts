import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MAX_TAGS_PER_INTERVIEW } from "@/lib/constants";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    const { data: interview } = await supabase
      .from("interviews")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (!interview)
      return NextResponse.json({ error: "面接が見つかりません" }, { status: 404 });

    const { data, error } = await supabase
      .from("interview_tags")
      .select("tag_id, tags(id, name, color, created_at)")
      .eq("interview_id", id);
    if (error)
      return NextResponse.json(
        { error: "タグの取得に失敗しました" },
        { status: 500 }
      );

    const tags = ((data ?? []) as never[])
      .map((row: Record<string, unknown>) => {
        const tag = row.tags;
        if (!tag || Array.isArray(tag)) return null;
        return tag;
      })
      .filter(Boolean);

    return NextResponse.json({ tags });
  } catch {
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    const { data: interview } = await supabase
      .from("interviews")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (!interview)
      return NextResponse.json({ error: "面接が見つかりません" }, { status: 404 });

    const body = await request.json();
    const { tag_ids } = body as { tag_ids: string[] };
    if (!Array.isArray(tag_ids))
      return NextResponse.json(
        { error: "tag_ids は配列で指定してください" },
        { status: 400 }
      );
    if (tag_ids.length > MAX_TAGS_PER_INTERVIEW)
      return NextResponse.json(
        { error: "タグは最大" + MAX_TAGS_PER_INTERVIEW + "個までです" },
        { status: 400 }
      );

    const { error: deleteError } = await supabase
      .from("interview_tags")
      .delete()
      .eq("interview_id", id);
    if (deleteError)
      return NextResponse.json(
        { error: "タグの更新に失敗しました" },
        { status: 500 }
      );

    if (tag_ids.length > 0) {
      const rows = tag_ids.map((tag_id) => ({ interview_id: id, tag_id }));
      const { error: insertError } = await supabase
        .from("interview_tags")
        .insert(rows as never);
      if (insertError)
        return NextResponse.json(
          { error: "タグの追加に失敗しました" },
          { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}
