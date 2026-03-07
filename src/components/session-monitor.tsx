"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * グローバルにマウントし、Supabase Auth の状態変更を監視するコンポーネント。
 *
 * - SIGNED_OUT イベントを検知してセッション切れ通知付きでログインページにリダイレクト
 * - 複数タブ間のログアウト同期にも対応
 * - フォーム入力中の未保存データ警告を beforeunload で実施
 */
export function SessionMonitor() {
  const isRedirecting = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // SIGNED_OUT イベントでリダイレクト
      // ただし、ログインページにいる場合はリダイレクトしない
      if (event === "SIGNED_OUT" && !isRedirecting.current) {
        const currentPath = window.location.pathname;
        // ログインページ・サインアップページ・公開ページではリダイレクト不要
        const publicPaths = ["/login", "/signup", "/reset-password", "/", "/legal", "/personality", "/questions"];
        const isPublicPage = publicPaths.some(
          (path) => currentPath === path || currentPath.startsWith(path + "/")
        );

        if (!isPublicPage) {
          isRedirecting.current = true;
          const redirectPath = currentPath + window.location.search;
          window.location.href = `/login?expired=true&redirect=${encodeURIComponent(redirectPath)}`;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
