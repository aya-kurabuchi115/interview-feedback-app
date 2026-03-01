"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagBadge } from "@/components/tag-badge";
import {
  TAG_COLORS,
  PRESET_TAGS,
  MAX_TAGS_PER_INTERVIEW,
  getTagColorConfig,
} from "@/lib/constants";

interface TagData {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

interface TagSelectorProps {
  interviewId: string;
  initialTags?: TagData[];
}

export function TagSelector({ interviewId, initialTags = [] }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<TagData[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("blue");
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedTagIds(new Set(initialTags.map((t) => t.id)));
  }, [initialTags]);

  const fetchAllTags = useCallback(async () => {
    try {
      const res = await fetch("/api/tags");
      if (res.ok) {
        const data = await res.json();
        setAllTags(data.tags);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchAllTags();
  }, [fetchAllTags]);

  const saveTagSelection = useCallback(
    async (newSelectedIds: Set<string>) => {
      setIsSaving(true);
      try {
        await fetch(`/api/interviews/${interviewId}/tags`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tag_ids: Array.from(newSelectedIds) }),
        });
      } catch {
        /* ignore */
      } finally {
        setIsSaving(false);
      }
    },
    [interviewId]
  );

  const toggleTag = useCallback(
    (tagId: string) => {
      setSelectedTagIds((prev) => {
        const next = new Set(prev);
        if (next.has(tagId)) {
          next.delete(tagId);
        } else {
          if (next.size >= MAX_TAGS_PER_INTERVIEW) return prev;
          next.add(tagId);
        }
        saveTagSelection(next);
        return next;
      });
    },
    [saveTagSelection]
  );

  const removeTag = useCallback(
    (tagId: string) => {
      setSelectedTagIds((prev) => {
        const next = new Set(prev);
        next.delete(tagId);
        saveTagSelection(next);
        return next;
      });
    },
    [saveTagSelection]
  );

  const createTag = useCallback(
    async (name: string, color: string) => {
      setIsCreating(true);
      try {
        const res = await fetch("/api/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, color }),
        });
        if (res.ok) {
          const data = await res.json();
          const newTag = data.tag as TagData;
          setAllTags((prev) => [...prev, newTag]);
          setSelectedTagIds((prev) => {
            if (prev.size >= MAX_TAGS_PER_INTERVIEW) return prev;
            const next = new Set(prev);
            next.add(newTag.id);
            saveTagSelection(next);
            return next;
          });
          setNewTagName("");
          setShowCreateForm(false);
        } else if (res.status === 409) {
          const existing = allTags.find((t) => t.name === name.trim());
          if (existing) toggleTag(existing.id);
        }
      } catch {
        /* ignore */
      } finally {
        setIsCreating(false);
      }
    },
    [allTags, saveTagSelection, toggleTag]
  );

  const addPresetTag = useCallback(
    (presetName: string) => {
      const existing = allTags.find((t) => t.name === presetName);
      if (existing) {
        if (!selectedTagIds.has(existing.id)) toggleTag(existing.id);
      } else {
        const ci = Math.floor(Math.random() * TAG_COLORS.length);
        createTag(presetName, TAG_COLORS[ci].value);
      }
    },
    [allTags, selectedTagIds, toggleTag, createTag]
  );

  const selectedTags = allTags.filter((t) => selectedTagIds.has(t.id));
  const unselectedTags = allTags.filter((t) => !selectedTagIds.has(t.id));
  const unusedPresets = PRESET_TAGS.filter(
    (p) => !allTags.some((t) => t.name === p)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium text-muted-foreground shrink-0">
          タグ
        </span>
        {isSaving && (
          <span className="text-xs text-muted-foreground">保存中...</span>
        )}
      </div>

      {selectedTags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              color={tag.color}
              removable
              onRemove={() => removeTag(tag.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          タグが設定されていません
        </p>
      )}

      {unselectedTags.length > 0 &&
        selectedTagIds.size < MAX_TAGS_PER_INTERVIEW && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">
              既存タグから追加:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {unselectedTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 transition-colors ${getTagColorConfig(tag.color).bg} ${getTagColorConfig(tag.color).text} opacity-60 hover:opacity-100`}
                >
                  <Plus className="h-3 w-3" />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

      {unusedPresets.length > 0 &&
        selectedTagIds.size < MAX_TAGS_PER_INTERVIEW && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">プリセット:</p>
            <div className="flex flex-wrap gap-1.5">
              {unusedPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addPresetTag(preset)}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

      {selectedTagIds.size < MAX_TAGS_PER_INTERVIEW && (
        <>
          {!showCreateForm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              カスタムタグを作成
            </Button>
          ) : (
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <Input
                placeholder="タグ名を入力..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                maxLength={50}
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTagName.trim())
                    createTag(newTagName.trim(), newTagColor);
                }}
              />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground mr-1">色:</span>
                {TAG_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setNewTagColor(c.value)}
                    className={`h-5 w-5 rounded-full ${c.dot} transition-all ${
                      newTagColor === c.value
                        ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
                        : "opacity-50 hover:opacity-100"
                    }`}
                    aria-label={c.label}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={!newTagName.trim() || isCreating}
                  onClick={() => createTag(newTagName.trim(), newTagColor)}
                >
                  {isCreating ? "作成中..." : "作成"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewTagName("");
                  }}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedTagIds.size >= MAX_TAGS_PER_INTERVIEW && (
        <p className="text-xs text-muted-foreground">
          タグは最大{MAX_TAGS_PER_INTERVIEW}個まで追加できます
        </p>
      )}
    </div>
  );
}
