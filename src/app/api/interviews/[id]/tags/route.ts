import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MAX_TAGS_PER_INTERVIEW } from "@/lib/constants";
import { unauthorized, badRequest, notFound, serverError } from "@/lib/api/error-response";
import { reportApiError } from "@/lib/error-reporting";

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
    if (!user) return unauthorized();

    const { data: interview } = await supabase
      .from("interviews")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (!interview) return notFound("面接が見つかりません");

    const { data, error } = await supabase
      .from("interview_tags")
      .select("tag_id, tags(id, name, color, created_at)")
      .eq("interview_id", id);
    if (error)
      return serverError(
        "タグの取得中にこちらの問題でエラーが発生しました。しばらくしてから再度お試しください。"
      );

    const tags = ((data ?? []) as never[])
      .map((row: Record<string, unknown>) => {
        const tag = row.tags;
        if (!tag || Array.isArray(tag)) return null;
        return tag;
      })
      .filter(Boolean);

    return NextResponse.json({ tags });
  } catch (error) {
    reportApiError(error, {
      apiRoute: "/api/interviews/[id]/tags",
      featureArea: "tags",
    });
    return serverError(
      "タグの取得中にこちらの問題でエラーが発生しました。しばらくしてから再度お試しください。"
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
    if (!user) return unauthorized();

    const { data: interview } = await supabase
      .from("interviews")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (!interview) return notFound("面接が見つかりません");

    const body = await request.json();
    const { tag_ids } = body as { tag_ids: string[] };
    if (!Array.isArray(tag_ids))
      return badRequest("tag_ids は配列で指定してください");
    if (tag_ids.length > MAX_TAGS_PER_INTERVIEW)
      return badRequest("タグは最大" + MAX_TAGS_PER_INTERVIEW + "個までです");

    const { error: deleteError } = await supabase
      .from("interview_tags")
      .delete()
      .eq("interview_id", id);
    if (deleteError)
      return serverError(
        "タグの更新中にこちらの問題でエラーが発生しました。しばらくしてから再度お試しください。"
      );

    if (tag_ids.length > 0) {
      const rows = tag_ids.map((tag_id) => ({ interview_id: id, tag_id }));
      const { error: insertError } = await supabase
        .from("interview_tags")
        .insert(rows as never);
      if (insertError)
        return serverError(
          "タグの追加中にこちらの問題でエラーが発生しました。しばらくしてから再度お試しください。"
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    reportApiError(error, {
      apiRoute: "/api/interviews/[id]/tags",
      featureArea: "tags",
    });
    return serverError(
      "タグの更新中にこちらの問題でエラーが発生しました。しばらくしてから再度お試しください。"
    );
  }
}
