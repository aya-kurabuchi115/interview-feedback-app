// 面接質問データベースの型定義

export type Industry =
  | "IT"
  | "金融"
  | "コンサル"
  | "メーカー"
  | "商社"
  | "広告"
  | "人材"
  | "不動産"
  | "公務員"
  | "その他";

export type Round = "1次" | "2次" | "最終" | "GD" | "ケース";

export type QuestionType =
  | "自己PR"
  | "志望動機"
  | "ガクチカ"
  | "逆質問"
  | "長所短所"
  | "キャリア"
  | "業界理解"
  | "その他";

export type Difficulty = "easy" | "normal" | "hard";

export interface Question {
  id: string; // "q001" 形式
  question: string;
  industry: Industry[];
  round: Round[];
  type: QuestionType;
  difficulty: Difficulty;
  tips: string[]; // 回答のポイント
  exampleAnswer: string; // 模範解答
  keywords: string[]; // SEO キーワード
}

export const INDUSTRIES: Industry[] = [
  "IT",
  "金融",
  "コンサル",
  "メーカー",
  "商社",
  "広告",
  "人材",
  "不動産",
  "公務員",
  "その他",
];

export const ROUNDS: Round[] = ["1次", "2次", "最終", "GD", "ケース"];

export const QUESTION_TYPES: QuestionType[] = [
  "自己PR",
  "志望動機",
  "ガクチカ",
  "逆質問",
  "長所短所",
  "キャリア",
  "業界理解",
  "その他",
];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "基本",
  normal: "標準",
  hard: "応用",
};
