"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { InterviewCategory } from "@/types/database";
import { TagBadge } from "@/components/tag-badge";

/** フィルタで使用するカテゴリ定義 */
const CATEGORIES: { value: InterviewCategory | "all"; label: string }[] = [
  { value: "all", label: "全て" },
  { value: "arubaito", label: "アルバイト" },
  { value: "intern", label: "インターン" },
  { value: "new_grad", label: "新卒" },
  { value: "other", label: "その他" },
];

/** ソートオプション */
const SORT_OPTIONS = [
  { value: "date_desc", label: "新しい順" },
  { value: "date_asc", label: "古い順" },
  { value: "score_desc", label: "スコア高い順" },
  { value: "score_asc", label: "スコア低い順" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

interface TagData {
  id: string;
  name: string;
  color: string;
}

interface InterviewFilterProps {
  currentCategory: InterviewCategory | "all";
  currentSort: SortOption;
  totalCount: number;
  tags?: TagData[];
  currentTag?: string;
}

export function InterviewFilter({
  currentCategory,
  currentSort,
  totalCount,
  tags = [],
  currentTag = "",
}: InterviewFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === "" || value === "all" || (key === "sort" && value === "date_desc")) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      }
      return newParams.toString();
    },
    [searchParams]
  );

  const handleCategoryChange = (category: InterviewCategory | "all") => {
    const qs = createQueryString({ category });
    router.push(qs ? `/dashboard?${qs}` : "/dashboard");
  };

  const handleTagChange = (tagId: string) => {
    const newTag = currentTag === tagId ? "" : tagId;
    const qs = createQueryString({ tag: newTag });
    router.push(qs ? `/dashboard?${qs}` : "/dashboard");
  };

  const handleSortChange = (sort: SortOption) => {
    const qs = createQueryString({ sort });
    router.push(qs ? `/dashboard?${qs}` : "/dashboard");
  };

  return (
    <div className="space-y-4">
      {/* カテゴリフィルタ */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground mr-1">
          カテゴリ:
        </span>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={currentCategory === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* タグフィルタ */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-1">
            タグ:
          </span>
          <button
            type="button"
            onClick={() => handleTagChange("")}
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
              !currentTag
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            全て
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleTagChange(tag.id)}
              className={`transition-opacity ${
                currentTag && currentTag !== tag.id
                  ? "opacity-50 hover:opacity-80"
                  : ""
              }`}
            >
              <TagBadge name={tag.name} color={tag.color} />
            </button>
          ))}
        </div>
      )}

      {/* ソート・件数 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {totalCount}件の面接履歴
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            並び替え:
          </span>
          {SORT_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={currentSort === opt.value ? "secondary" : "ghost"}
              size="xs"
              onClick={() => handleSortChange(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
