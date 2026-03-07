import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reportApiError } from "@/lib/error-reporting";

const VALID_CATEGORIES = ["bug", "feature", "question", "billing", "other"] as const;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { name, email, category, message } = body as {
      name: string;
      email: string;
      category: string;
      message: string;
    };

    // バリデーション
    const errors: string[] = [];
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      errors.push("お名前を入力してください");
    } else if (name.trim().length > 100) {
      errors.push("お名前は100文字以内で入力してください");
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("有効なメールアドレスを入力してください");
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      errors.push("お問い合わせ内容を入力してください");
    } else if (message.trim().length > 2000) {
      errors.push("お問い合わせ内容は2000文字以内で入力してください");
    }

    const validCategory = VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])
      ? category
      : "other";

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join("\n"), errors },
        { status: 400 }
      );
    }

    // ログインユーザーの場合は user_id を紐付け
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("contact_requests")
      .insert({
        user_id: user?.id ?? null,
        name: name.trim(),
        email: email.trim(),
        category: validCategory,
        message: message.trim(),
      } as never);

    if (error) {
      console.error("Contact request insert error:", error);
      return NextResponse.json(
        { error: "送信に失敗しました。時間を置いて再度お試しください。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    reportApiError(error, {
      apiRoute: "/api/contact",
      featureArea: "contact",
    });
    return NextResponse.json(
      { error: "送信に失敗しました。時間を置いて再度お試しください。" },
      { status: 500 }
    );
  }
}
