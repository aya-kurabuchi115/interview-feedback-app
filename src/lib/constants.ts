/**
 * analyze API labels
 */
export const CATEGORY_LABELS: Record<string, string> = {
  communication: "コミュニケーション",
  content: "回答内容",
  manner: "マナー",
  logic: "論理性",
};

export const TAG_COLORS = [
  { value: "blue", label: "ブルー", bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-800 dark:text-blue-200", dot: "bg-blue-500" },
  { value: "green", label: "グリーン", bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-800 dark:text-green-200", dot: "bg-green-500" },
  { value: "purple", label: "パープル", bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-800 dark:text-purple-200", dot: "bg-purple-500" },
  { value: "orange", label: "オレンジ", bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-800 dark:text-orange-200", dot: "bg-orange-500" },
  { value: "pink", label: "ピンク", bg: "bg-pink-100 dark:bg-pink-900/40", text: "text-pink-800 dark:text-pink-200", dot: "bg-pink-500" },
  { value: "cyan", label: "シアン", bg: "bg-cyan-100 dark:bg-cyan-900/40", text: "text-cyan-800 dark:text-cyan-200", dot: "bg-cyan-500" },
] as const;

export type TagColor = (typeof TAG_COLORS)[number]["value"];

export function getTagColorConfig(color: string) {
  return TAG_COLORS.find((c) => c.value === color) ?? TAG_COLORS[0];
}

export const PRESET_TAGS = [
  "1次面接", "2次面接", "最終面接", "GD", "ケース面接", "オンライン", "対面",
] as const;

export const MAX_TAGS_PER_INTERVIEW = 10;
export const MAX_NOTES_LENGTH = 1000;
