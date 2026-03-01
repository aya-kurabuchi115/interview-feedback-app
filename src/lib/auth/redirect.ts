import { redirect } from "next/navigation";
import { headers } from "next/headers";

/**
 * セッション切れ時にログインページへリダイレクトする。
 * expired=true パラメータとリダイレクト先を含めることで、
 * ログインページでセッション切れバナーを表示し、
 * 再ログイン後に元のページへ戻れるようにする。
 *
 * SSR (Server Component) 用。
 */
export async function redirectToLogin() {
  let currentPath = "";
  try {
    const headersList = await headers();
    // Next.js が設定する x-url / x-invoke-path / referer 等からパスを取得
    const url = headersList.get("x-url") || headersList.get("x-invoke-path") || headersList.get("referer") || "";
    if (url) {
      const parsed = new URL(url, "http://localhost");
      currentPath = parsed.pathname + parsed.search;
    }
  } catch {
    // ヘッダー取得に失敗してもリダイレクトは実行する
  }

  if (currentPath && currentPath !== "/login") {
    redirect(`/login?expired=true&redirect=${encodeURIComponent(currentPath)}`);
  }

  redirect("/login?expired=true");
}
