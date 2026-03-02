"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BarChart3,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Mic,
  Monitor,
  Moon,
  MessageSquare,
  Sun,
  TrendingUp,
  User,
  CreditCard,
  BookOpen,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ShortcutHelpDialog } from "@/components/shortcut-help-dialog";

/**
 * コマンドパレット + グローバルキーボードショートカット。
 * layout.tsx に配置してアプリ全体で使用する。
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  const handleNavigate = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router]
  );

  const handleCommandPalette = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleShortcutHelp = useCallback(() => {
    setHelpOpen(true);
  }, []);

  useKeyboardShortcuts({
    onCommandPalette: handleCommandPalette,
    onShortcutHelp: handleShortcutHelp,
    onNavigate: handleNavigate,
  });

  // Mac / Windows の修飾キー表示を切り替え
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(navigator.platform?.toLowerCase().includes("mac") ?? false);
  }, []);
  const modKey = isMac ? "\u2318" : "Ctrl";

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="コマンドパレット"
        description="ページや操作をファジー検索..."
      >
        <CommandInput placeholder="ページや操作を検索..." />
        <CommandList>
          <CommandEmpty>結果が見つかりません</CommandEmpty>

          {/* ナビゲーション */}
          <CommandGroup heading="ナビゲーション">
            <CommandItem onSelect={() => handleNavigate("/interview/new")}>
              <Mic className="mr-2 h-4 w-4" />
              面接を記録する
              <CommandShortcut>N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate("/mock-interview")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              AI模擬面接
              <CommandShortcut>M</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate("/es-review")}>
              <FileText className="mr-2 h-4 w-4" />
              ES添削
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate("/questions")}>
              <BookOpen className="mr-2 h-4 w-4" />
              質問集
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate("/dashboard")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              ダッシュボード
              <CommandShortcut>D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate("/dashboard/growth")}>
              <TrendingUp className="mr-2 h-4 w-4" />
              成長記録
              <CommandShortcut>G</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate("/personality")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              16パーソナリティ診断
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              プロフィール
            </CommandItem>
            <CommandItem onSelect={() => handleNavigate("/pricing")}>
              <CreditCard className="mr-2 h-4 w-4" />
              料金プラン
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* テーマ切替 */}
          <CommandGroup heading="テーマ">
            <CommandItem
              onSelect={() => {
                setTheme("light");
                setOpen(false);
              }}
            >
              <Sun className="mr-2 h-4 w-4" />
              ライトモード
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setTheme("dark");
                setOpen(false);
              }}
            >
              <Moon className="mr-2 h-4 w-4" />
              ダークモード
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setTheme("system");
                setOpen(false);
              }}
            >
              <Monitor className="mr-2 h-4 w-4" />
              システムに合わせる
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* ヘルプ */}
          <CommandGroup heading="ヘルプ">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                // 少し遅延を入れてダイアログの切り替えを滑らかにする
                setTimeout(() => setHelpOpen(true), 150);
              }}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              ショートカット一覧
              <CommandShortcut>?</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>

        {/* フッター: ショートカットヒント */}
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <span>
            <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">
              {modKey}
            </kbd>{" "}
            +{" "}
            <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">
              K
            </kbd>{" "}
            で開閉
          </span>
          <span>
            <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">
              Esc
            </kbd>{" "}
            で閉じる
          </span>
        </div>
      </CommandDialog>

      <ShortcutHelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
