"use client";

import { X } from "lucide-react";
import { getTagColorConfig } from "@/lib/constants";

interface TagBadgeProps {
  name: string;
  color: string;
  removable?: boolean;
  onRemove?: () => void;
}

export function TagBadge({ name, color, removable = false, onRemove }: TagBadgeProps) {
  const colorConfig = getTagColorConfig(color);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colorConfig.bg} ${colorConfig.text}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${colorConfig.dot}`} />
      {name}
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label={`タグ「${name}」を削除`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
