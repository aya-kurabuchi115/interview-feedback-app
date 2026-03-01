import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MAX_NOTES_LENGTH } from "@/lib/constants";
import { unauthorized, badRequest, serverError } from "@/lib/api/error-response";

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
    if (!user) return unauthorized();

    const body = await request.json();
    const { notes } = body as { notes: string };

    if (typeof notes !== "string")
      return badRequest("メモは文字列で指定してください");
    if (notes.length > MAX_NOTES_LENGTH)
      return badRequest(
        "メモは" + MAX_NOTES_LENGTH + "文字以内で入力してください"
      );

    const { error } = await supabase
      .from("interviews")
      .update({ notes: notes || null } as never)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error)
      return serverError(
        "メモの保存中にこちらの問題でエラーが発生しました。しばらくしてから再度お試しください。"
      );

    return NextResponse.json({ success: true });
  } catch {
    return serverError(
      "メモの保存中にこちらの問題でエラーが発生しました。しばらくしてから再度お試しください。"
    );
  }
}
