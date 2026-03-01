import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MAX_NOTES_LENGTH } from "@/lib/constants";

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
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );

    const body = await request.json();
    const { notes } = body as { notes: string };

    if (typeof notes !== "string")
      return NextResponse.json(
        { error: "メモは文字列で指定してください" },
        { status: 400 }
      );
    if (notes.length > MAX_NOTES_LENGTH)
      return NextResponse.json(
        {
          error:
            "メモは" + MAX_NOTES_LENGTH + "文字以内で入力してください",
        },
        { status: 400 }
      );

    const { error } = await supabase
      .from("interviews")
      .update({ notes: notes || null } as never)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error)
      return NextResponse.json(
        { error: "メモの保存に失敗しました" },
        { status: 500 }
      );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}
