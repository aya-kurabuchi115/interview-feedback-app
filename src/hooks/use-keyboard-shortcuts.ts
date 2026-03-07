"use client";

import { useEffect, useCallback } from "react";

/**
 * テキスト入力中かどうかを判定するヘルパー。
 * input / textarea / contentEditable 要素にフォーカスがある場合は true。
 */
function isInputActive(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tagName = el.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea") return true;
  if ((el as HTMLElement).isContentEditable) return true;
  // cmdk の入力欄もテキスト入力とみなす
  if (el.getAttribute("cmdk-input") !== null) return true;
  return false;
}

interface KeyboardShortcutHandlers {
  onCommandPalette: () => void;
  onShortcutHelp: () => void;
  onNavigate: (path: string) => void;
}

/**
 * グローバルキーボードショートカットを登録するフック。
 *
 * - Ctrl/Cmd + K: コマンドパレット
 * - ?: ショートカットヘルプ
 * - N: 新規面接記録
 * - M: 模擬面接
 * - D: ダッシュボード
 * - G: 成長記録
 * - Escape: モーダル/ポップオーバーを閉じる（ブラウザデフォルト動作に委譲）
 */
export function useKeyboardShortcuts({
  onCommandPalette,
  onShortcutHelp,
  onNavigate,
}: KeyboardShortcutHandlers) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: コマンドパレット（入力中でも有効）
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onCommandPalette();
        return;
      }

      // テキスト入力中は以下のショートカットを無効化
      if (isInputActive()) return;

      // Shift は不要な単キーショートカット
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "?":
          e.preventDefault();
          onShortcutHelp();
          break;
        case "n":
        case "N":
          e.preventDefault();
          onNavigate("/mock-interview");
          break;
        case "m":
        case "M":
          e.preventDefault();
          onNavigate("/mock-interview");
          break;
        case "d":
        case "D":
          e.preventDefault();
          onNavigate("/dashboard");
          break;
        case "g":
        case "G":
          e.preventDefault();
          onNavigate("/dashboard/growth");
          break;
      }
    },
    [onCommandPalette, onShortcutHelp, onNavigate]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
