"use client";

import { useState, useCallback, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Trash2,
  Search,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { InterviewCard } from "@/components/interview-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type {
  InterviewCategory,
  InterviewRound,
  InterviewStatus,
} from "@/types/database";

// ============================================================
// 型定義
// ============================================================

interface TagData {
  id: string;
  name: string;
  color: string;
}

export interface InterviewItem {
  id: string;
  companyName: string;
  category: InterviewCategory;
  round: InterviewRound | null;
  interviewDate: string | null;
  overallScore: number | null;
  status: InterviewStatus;
  tags: TagData[];
}

type BulkAction = "archive" | "unarchive" | "soft_delete" | "permanent_delete";

interface InterviewListClientProps {
  interviews: InterviewItem[];
  /** "active" | "archived" 現在のタブ */
  currentTab: "active" | "archived";
}

// ============================================================
// Component
// ============================================================

export function InterviewListClient({
  interviews,
  currentTab,
}: InterviewListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // --- 検索 ---
  const [searchQuery, setSearchQuery] = useState("");

  // --- 一括選択 ---
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // --- 確認ダイアログ ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- 検索フィルタリング ---
  const filteredInterviews = useMemo(() => {
    if (!searchQuery.trim()) return interviews;
    const query = searchQuery.trim().toLowerCase();
    return interviews.filter(
      (iv) =>
        iv.companyName.toLowerCase().includes(query) ||
        iv.tags.some((t) => t.name.toLowerCase().includes(query))
    );
  }, [interviews, searchQuery]);

  // --- 選択ハンドラ ---
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredInterviews.map((iv) => iv.id)));
  }, [filteredInterviews]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => {
      if (prev) {
        // 選択モード解除時にクリア
        setSelectedIds(new Set());
      }
      return !prev;
    });
  }, []);

  // --- 一括操作 ---
  const requestBulkAction = useCallback((action: BulkAction) => {
    setPendingAction(action);
    setDialogOpen(true);
  }, []);

  const executeBulkAction = useCallback(async () => {
    if (!pendingAction || selectedIds.size === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/interviews/bulk-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action: pendingAction,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "操作に失敗しました");
      }

      // 成功: 選択解除 + ページ更新
      setSelectedIds(new Set());
      setSelectionMode(false);
      setDialogOpen(false);
      setPendingAction(null);

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("[bulk-action]", error);
      alert(error instanceof Error ? error.message : "操作に失敗しました");
    } finally {
      setIsProcessing(false);
    }
  }, [pendingAction, selectedIds, router]);

  // --- 個別操作 ---
  const handleSingleAction = useCallback(
    async (id: string, action: BulkAction) => {
      setSelectedIds(new Set([id]));
      setPendingAction(action);
      setDialogOpen(true);
    },
    []
  );

  // --- 検索クエリのURL反映（debounce不要: ローカルフィルタのみ） ---
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      // 検索時に選択もクリア
      setSelectedIds(new Set());
    },
    []
  );

  // --- タブ切替 ---
  const handleTabChange = useCallback(
    (tab: "active" | "archived") => {
      const newParams = new URLSearchParams(searchParams.toString());
      if (tab === "archived") {
        newParams.set("tab", "archived");
      } else {
        newParams.delete("tab");
      }
      setSelectedIds(new Set());
      setSelectionMode(false);
      setSearchQuery("");
      const qs = newParams.toString();
      router.push(qs ? `/dashboard?${qs}` : "/dashboard");
    },
    [searchParams, router]
  );

  // --- ダイアログ用テキスト ---
  const getDialogContent = useCallback(() => {
    const count = selectedIds.size;
    switch (pendingAction) {
      case "archive":
        return {
          title: `${count}件の面接をアーカイブ`,
          description:
            "選択した面接をアーカイブします。アーカイブ済みタブからいつでも復元できます。",
          actionLabel: "アーカイブする",
          destructive: false,
        };
      case "unarchive":
        return {
          title: `${count}件の面接をアーカイブ解除`,
          description: "選択した面接をアクティブに戻します。",
          actionLabel: "アーカイブ解除する",
          destructive: false,
        };
      case "soft_delete":
        return {
          title: `${count}件の面接を削除`,
          description:
            "選択した面接を削除します。削除後30日間は復元可能です。その後、完全に削除されます。",
          actionLabel: "削除する",
          destructive: true,
        };
      case "permanent_delete":
        return {
          title: `${count}件の面接を完全削除`,
          description:
            "選択した面接とすべての関連データ（フィードバック、文字起こし等）を完全に削除します。この操作は取り消せません。",
          actionLabel: "完全に削除する",
          destructive: true,
        };
      default:
        return {
          title: "",
          description: "",
          actionLabel: "",
          destructive: false,
        };
    }
  }, [pendingAction, selectedIds.size]);

  const dialogContent = getDialogContent();

  return (
    <div className="space-y-4">
      {/* タブ切替 + 検索バー */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* タブ */}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => handleTabChange("active")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              currentTab === "active"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            アクティブ
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("archived")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              currentTab === "archived"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            アーカイブ済み
          </button>
        </div>

        {/* 検索バー */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="企業名・タグで検索..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 一括操作バー */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={selectionMode ? "secondary" : "outline"}
          size="sm"
          onClick={toggleSelectionMode}
        >
          {selectionMode ? (
            <>
              <CheckSquare className="mr-1 h-4 w-4" />
              選択モード: ON
            </>
          ) : (
            <>
              <Square className="mr-1 h-4 w-4" />
              一括選択
            </>
          )}
        </Button>

        {selectionMode && (
          <>
            <Button variant="ghost" size="sm" onClick={selectAll}>
              全選択 ({filteredInterviews.length})
            </Button>
            {selectedIds.size > 0 && (
              <Button variant="ghost" size="sm" onClick={deselectAll}>
                選択解除
              </Button>
            )}

            <span className="text-sm text-muted-foreground">
              {selectedIds.size}件選択中
            </span>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                {currentTab === "active" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => requestBulkAction("archive")}
                    >
                      <Archive className="mr-1 h-4 w-4" />
                      アーカイブ
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => requestBulkAction("soft_delete")}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      削除
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => requestBulkAction("unarchive")}
                    >
                      <ArchiveRestore className="mr-1 h-4 w-4" />
                      アーカイブ解除
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => requestBulkAction("permanent_delete")}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      完全削除
                    </Button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 面接カード一覧 */}
      {filteredInterviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? `"${searchQuery}" に一致する面接が見つかりません`
              : currentTab === "archived"
              ? "アーカイブされた面接はありません"
              : "面接データがありません"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredInterviews.map((interview) => (
            <div key={interview.id} className="relative group">
              {/* 選択モード時のチェックボックス */}
              {selectionMode && (
                <div className="absolute top-3 left-3 z-10">
                  <Checkbox
                    checked={selectedIds.has(interview.id)}
                    onCheckedChange={() => toggleSelect(interview.id)}
                    aria-label={`${interview.companyName} を選択`}
                    className="bg-background"
                  />
                </div>
              )}

              {/* 個別アクションメニュー（非選択モード時） */}
              {!selectionMode && (
                <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {currentTab === "active" ? (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSingleAction(interview.id, "archive");
                        }}
                        className="rounded-md bg-background/80 backdrop-blur-sm p-1.5 text-muted-foreground hover:text-foreground hover:bg-background shadow-sm border"
                        title="アーカイブ"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSingleAction(interview.id, "soft_delete");
                        }}
                        className="rounded-md bg-background/80 backdrop-blur-sm p-1.5 text-muted-foreground hover:text-destructive hover:bg-background shadow-sm border"
                        title="削除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSingleAction(interview.id, "unarchive");
                        }}
                        className="rounded-md bg-background/80 backdrop-blur-sm p-1.5 text-muted-foreground hover:text-foreground hover:bg-background shadow-sm border"
                        title="アーカイブ解除"
                      >
                        <ArchiveRestore className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSingleAction(interview.id, "permanent_delete");
                        }}
                        className="rounded-md bg-background/80 backdrop-blur-sm p-1.5 text-muted-foreground hover:text-destructive hover:bg-background shadow-sm border"
                        title="完全削除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* 選択モード時のクリックで選択切替 */}
              {selectionMode ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleSelect(interview.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleSelect(interview.id);
                    }
                  }}
                  className={`cursor-pointer rounded-xl ring-2 transition-all ${
                    selectedIds.has(interview.id)
                      ? "ring-primary"
                      : "ring-transparent"
                  }`}
                >
                  <InterviewCard
                    id={interview.id}
                    companyName={interview.companyName}
                    category={interview.category}
                    round={interview.round}
                    interviewDate={interview.interviewDate}
                    overallScore={interview.overallScore}
                    status={interview.status}
                    tags={interview.tags}
                  />
                </div>
              ) : (
                <InterviewCard
                  id={interview.id}
                  companyName={interview.companyName}
                  category={interview.category}
                  round={interview.round}
                  interviewDate={interview.interviewDate}
                  overallScore={interview.overallScore}
                  status={interview.status}
                  tags={interview.tags}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* 確認ダイアログ */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isProcessing}
              onClick={() => {
                setPendingAction(null);
                // 個別操作で設定されたselectedIdsもクリア
                if (!selectionMode) {
                  setSelectedIds(new Set());
                }
              }}
            >
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulkAction}
              disabled={isProcessing}
              className={
                dialogContent.destructive
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : ""
              }
            >
              {isProcessing ? "処理中..." : dialogContent.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
