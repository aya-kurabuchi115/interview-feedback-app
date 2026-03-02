"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ShortcutHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutEntry {
  keys: string[];
  description: string;
}

const shortcuts: { group: string; items: ShortcutEntry[] }[] = [
  {
    group: "一般",
    items: [
      { keys: ["Ctrl", "K"], description: "コマンドパレットを開く" },
      { keys: ["?"], description: "ショートカット一覧を表示" },
      { keys: ["Esc"], description: "モーダルを閉じる" },
    ],
  },
  {
    group: "ナビゲーション",
    items: [
      { keys: ["N"], description: "面接を記録する" },
      { keys: ["M"], description: "AI模擬面接" },
      { keys: ["D"], description: "ダッシュボード" },
      { keys: ["G"], description: "成長記録" },
    ],
  },
];

/**
 * ショートカット一覧ヘルプダイアログ。
 * `?` キーまたはコマンドパレットから開く。
 */
export function ShortcutHelpDialog({
  open,
  onOpenChange,
}: ShortcutHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>キーボードショートカット</DialogTitle>
          <DialogDescription>
            テキスト入力中は単キーショートカットは無効になります
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {shortcuts.map((section) => (
            <div key={section.group}>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                {section.group}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div
                    key={item.description}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, i) => (
                        <span key={i}>
                          {i > 0 && (
                            <span className="mx-0.5 text-xs text-muted-foreground">
                              +
                            </span>
                          )}
                          <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border bg-muted px-1.5 text-xs font-medium">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
