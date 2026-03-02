import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { unauthorized, badRequest, serverError } from "@/lib/api/error-response";
import { reportApiError } from "@/lib/error-reporting";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized();
    }

    // パスワード確認（セキュリティ対策）
    const body = await request.json();
    const { password } = body as { password: string };

    if (!password || typeof password !== "string") {
      return badRequest("パスワードを入力してください");
    }

    // パスワード検証: 現在のメールアドレスで再ログインを試みる
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "パスワードが正しくありません" },
        { status: 400 }
      );
    }

    // Admin クライアントでユーザーを削除
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return serverError(
        "サーバー設定にエラーがあります。管理者にお問い合わせください。"
      );
    }

    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey);

    // ユーザー削除（CASCADE で関連データも削除）
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      throw new Error(`User deletion failed: ${deleteError.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    reportApiError(error, {
      apiRoute: "/api/profile/delete",
      featureArea: "profile",
    });
    return serverError(
      "アカウントの削除に失敗しました。しばらくしてから再度お試しください。"
    );
  }
}
