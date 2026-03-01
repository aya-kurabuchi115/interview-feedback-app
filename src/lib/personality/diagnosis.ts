// ============================================================
// 16パーソナリティ簡易診断テスト（10問）
// ============================================================

import type { PersonalityType } from "./types";

/** 判定軸 */
export type Axis = "EI" | "SN" | "TF" | "JP";

/** 選択肢 */
export interface DiagnosisOption {
  label: string;
  /** 各軸のどちら側に加点するか (例: "E" or "I") */
  value: string;
}

/** 質問 */
export interface DiagnosisQuestion {
  id: number;
  axis: Axis;
  question: string;
  optionA: DiagnosisOption;
  optionB: DiagnosisOption;
}

/** 診断結果 */
export interface DiagnosisResult {
  type: PersonalityType;
  scores: Record<string, number>;
}

// ============================================================
// 質問データ（10問 = 各軸2~3問）
// ============================================================

export const DIAGNOSIS_QUESTIONS: DiagnosisQuestion[] = [
  // E/I 軸 (3問)
  {
    id: 1,
    axis: "EI",
    question: "グループワークの後、あなたはどう感じますか？",
    optionA: { label: "エネルギーが湧いてきて、もっと話したい", value: "E" },
    optionB: { label: "疲れるので、一人の時間が欲しくなる", value: "I" },
  },
  {
    id: 2,
    axis: "EI",
    question: "新しい環境で人と出会うとき、あなたは？",
    optionA: { label: "自分から積極的に話しかける", value: "E" },
    optionB: { label: "相手から話しかけてくれるのを待つ", value: "I" },
  },
  {
    id: 3,
    axis: "EI",
    question: "アイデアを思いついたとき、まず何をしますか？",
    optionA: { label: "すぐに誰かに話して反応を見たい", value: "E" },
    optionB: { label: "まず自分の中でじっくり考えを整理する", value: "I" },
  },

  // S/N 軸 (2問)
  {
    id: 4,
    axis: "SN",
    question: "情報を集めるとき、あなたが重視するのは？",
    optionA: { label: "具体的な事実やデータ", value: "S" },
    optionB: { label: "全体のパターンや可能性", value: "N" },
  },
  {
    id: 5,
    axis: "SN",
    question: "説明を受けるとき、どちらが分かりやすいですか？",
    optionA: { label: "ステップごとの具体的な手順", value: "S" },
    optionB: { label: "全体像やコンセプトの説明", value: "N" },
  },

  // T/F 軸 (3問)
  {
    id: 6,
    axis: "TF",
    question: "友人が悩みを相談してきたとき、あなたは？",
    optionA: { label: "論理的に解決策を提案する", value: "T" },
    optionB: { label: "まず気持ちに寄り添い、共感する", value: "F" },
  },
  {
    id: 7,
    axis: "TF",
    question: "チームで意見が対立したとき、あなたが重視するのは？",
    optionA: { label: "論理的に正しい方を選ぶべき", value: "T" },
    optionB: { label: "メンバーの感情や関係性を大切にしたい", value: "F" },
  },

  // J/P 軸 (2問)
  {
    id: 8,
    axis: "JP",
    question: "旅行の計画を立てるとき、あなたは？",
    optionA: { label: "事前にスケジュールをしっかり決める", value: "J" },
    optionB: { label: "大まかに決めて、現地で臨機応変に楽しむ", value: "P" },
  },
  {
    id: 9,
    axis: "JP",
    question: "課題やレポートの締め切りに対して、あなたは？",
    optionA: { label: "計画的に進めて、余裕を持って提出する", value: "J" },
    optionB: { label: "締め切りが近づいてから集中して取り組む", value: "P" },
  },
  {
    id: 10,
    axis: "JP",
    question: "予定外の出来事が起きたとき、あなたは？",
    optionA: { label: "計画が乱れてストレスを感じる", value: "J" },
    optionB: { label: "新しい展開にワクワクする", value: "P" },
  },
];

// ============================================================
// 診断ロジック
// ============================================================

/**
 * 回答一覧からパーソナリティタイプを算出する。
 * @param answers - 各質問IDに対する回答値 (例: { 1: "E", 2: "I", ... })
 * @returns 診断結果
 */
export function calculatePersonalityType(
  answers: Record<number, string>
): DiagnosisResult {
  const scores: Record<string, number> = {
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0,
  };

  for (const q of DIAGNOSIS_QUESTIONS) {
    const answer = answers[q.id];
    if (answer && scores[answer] !== undefined) {
      scores[answer]++;
    }
  }

  // 各軸で多い方を採用（同点は先頭文字を採用）
  const ei = scores.E >= scores.I ? "E" : "I";
  const sn = scores.S >= scores.N ? "S" : "N";
  const tf = scores.T >= scores.F ? "T" : "F";
  const jp = scores.J >= scores.P ? "J" : "P";

  const type = `${ei}${sn}${tf}${jp}` as PersonalityType;

  return { type, scores };
}
