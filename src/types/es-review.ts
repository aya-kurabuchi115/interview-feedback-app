/**
 * ES添削フィードバックの型定義
 * Issue #133
 */

/** カテゴリ別評価 */
export interface ESCategoryScore {
  score: number;
  comment: string;
}

/** 改善提案（Before/After） */
export interface ESSuggestion {
  original: string;
  improved: string;
  reason: string;
}

/** ES添削フィードバック全体 */
export interface ESFeedback {
  overall_score: number; // 0-100
  categories: {
    structure: ESCategoryScore;
    specificity: ESCategoryScore;
    persuasiveness: ESCategoryScore;
    grammar: ESCategoryScore;
  };
  good_points: string[];
  improvement_points: string[];
  suggestions: ESSuggestion[];
  rewritten_answer: string;
  personality_advice?: string;
}

/** ES添削 API リクエスト */
export interface ESReviewRequest {
  question: string;
  answer: string;
}

/** ES添削 API レスポンス */
export interface ESReviewResponse {
  success: boolean;
  review_id: string;
  feedback: ESFeedback;
  warning?: string;
}

/** ES添削エラーレスポンス */
export interface ESReviewErrorResponse {
  error: string;
  code?: string;
  upgrade_url?: string;
}

/** ES添削履歴アイテム */
export interface ESReviewHistoryItem {
  id: string;
  question: string;
  answer: string;
  char_count: number;
  score: number | null;
  status: string;
  created_at: string;
}
