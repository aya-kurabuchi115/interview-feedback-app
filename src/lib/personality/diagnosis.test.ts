import { describe, it, expect } from "vitest";
import {
  DIAGNOSIS_QUESTIONS,
  calculatePersonalityType,
  type DiagnosisQuestion,
} from "./diagnosis";

describe("personality/diagnosis", () => {
  // ============================================================
  // 質問データのテスト
  // ============================================================

  describe("DIAGNOSIS_QUESTIONS", () => {
    it("質問が10問ある", () => {
      expect(DIAGNOSIS_QUESTIONS).toHaveLength(10);
    });

    it("各質問に必要なプロパティが存在する", () => {
      for (const q of DIAGNOSIS_QUESTIONS) {
        expect(q.id).toBeTypeOf("number");
        expect(q.axis).toMatch(/^(EI|SN|TF|JP)$/);
        expect(q.question).toBeTruthy();
        expect(q.optionA.label).toBeTruthy();
        expect(q.optionA.value).toBeTruthy();
        expect(q.optionB.label).toBeTruthy();
        expect(q.optionB.value).toBeTruthy();
      }
    });

    it("質問IDが1から10まで連番である", () => {
      const ids = DIAGNOSIS_QUESTIONS.map((q) => q.id);
      expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("4つの軸すべてがカバーされている", () => {
      const axes = new Set(DIAGNOSIS_QUESTIONS.map((q) => q.axis));
      expect(axes).toEqual(new Set(["EI", "SN", "TF", "JP"]));
    });

    it("E/I軸が3問、S/N軸が2問、T/F軸が2問、J/P軸が3問ある", () => {
      const axisCounts = DIAGNOSIS_QUESTIONS.reduce(
        (acc, q) => {
          acc[q.axis] = (acc[q.axis] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      expect(axisCounts.EI).toBe(3);
      expect(axisCounts.SN).toBe(2);
      expect(axisCounts.TF).toBe(2);
      expect(axisCounts.JP).toBe(3);
    });
  });

  // ============================================================
  // calculatePersonalityType のテスト
  // ============================================================

  describe("calculatePersonalityType", () => {
    it("全て A を選んだ場合 ESTJ になる", () => {
      // optionA の値: E, E, E, S, S, T, T, J, J, J
      const answers: Record<number, string> = {};
      for (const q of DIAGNOSIS_QUESTIONS) {
        answers[q.id] = q.optionA.value;
      }
      const result = calculatePersonalityType(answers);
      expect(result.type).toBe("ESTJ");
    });

    it("全て B を選んだ場合 INFP になる", () => {
      // optionB の値: I, I, I, N, N, F, F, P, P, P
      const answers: Record<number, string> = {};
      for (const q of DIAGNOSIS_QUESTIONS) {
        answers[q.id] = q.optionB.value;
      }
      const result = calculatePersonalityType(answers);
      expect(result.type).toBe("INFP");
    });

    it("I, N, T, J を選ぶと INTJ になる", () => {
      // E/I軸(3問) → I を選択, S/N軸(2問) → N を選択,
      // T/F軸(2問) → T を選択, J/P軸(3問) → J を選択
      const answers: Record<number, string> = {};
      for (const q of DIAGNOSIS_QUESTIONS) {
        switch (q.axis) {
          case "EI":
            answers[q.id] = "I";
            break;
          case "SN":
            answers[q.id] = "N";
            break;
          case "TF":
            answers[q.id] = "T";
            break;
          case "JP":
            answers[q.id] = "J";
            break;
        }
      }
      const result = calculatePersonalityType(answers);
      expect(result.type).toBe("INTJ");
    });

    it("E, S, F, P を選ぶと ESFP になる", () => {
      const answers: Record<number, string> = {};
      for (const q of DIAGNOSIS_QUESTIONS) {
        switch (q.axis) {
          case "EI":
            answers[q.id] = "E";
            break;
          case "SN":
            answers[q.id] = "S";
            break;
          case "TF":
            answers[q.id] = "F";
            break;
          case "JP":
            answers[q.id] = "P";
            break;
        }
      }
      const result = calculatePersonalityType(answers);
      expect(result.type).toBe("ESFP");
    });

    it("E, N, F, J を選ぶと ENFJ になる", () => {
      const answers: Record<number, string> = {};
      for (const q of DIAGNOSIS_QUESTIONS) {
        switch (q.axis) {
          case "EI":
            answers[q.id] = "E";
            break;
          case "SN":
            answers[q.id] = "N";
            break;
          case "TF":
            answers[q.id] = "F";
            break;
          case "JP":
            answers[q.id] = "J";
            break;
        }
      }
      const result = calculatePersonalityType(answers);
      expect(result.type).toBe("ENFJ");
    });

    it("同点の場合は先頭文字が採用される（E >= I なら E）", () => {
      // EI軸: 3問中 E=1, I=2 → I / 全てIを1, Eを2,3 にすると E=2, I=1 → E
      // ここではスコアが同点のケースを作る
      // EI軸3問: 1問E, 2問I → I が勝つ (E=1 < I=2) → I
      // でも同点テストが必要なので、別の軸で同点を作る
      // SN軸2問: 1問S, 1問N → S=1, N=1 → 同点 → S（>= で先頭文字）
      const answers: Record<number, string> = {};
      for (const q of DIAGNOSIS_QUESTIONS) {
        switch (q.axis) {
          case "EI":
            answers[q.id] = "E"; // 3問全てE → E
            break;
          case "SN":
            // 2問: 1問目S, 2問目N → 同点 → S
            if (q.id === 4) answers[q.id] = "S";
            if (q.id === 5) answers[q.id] = "N";
            break;
          case "TF":
            // 2問: 1問目T, 2問目F → 同点 → T
            if (q.id === 6) answers[q.id] = "T";
            if (q.id === 7) answers[q.id] = "F";
            break;
          case "JP":
            answers[q.id] = "J"; // 3問全てJ → J
            break;
        }
      }
      const result = calculatePersonalityType(answers);
      // E(3) >= I(0) → E, S(1) >= N(1) → S, T(1) >= F(1) → T, J(3) >= P(0) → J
      expect(result.type).toBe("ESTJ");
    });

    it("スコアが正しく集計される", () => {
      const answers: Record<number, string> = {};
      for (const q of DIAGNOSIS_QUESTIONS) {
        answers[q.id] = q.optionA.value;
      }
      const result = calculatePersonalityType(answers);
      // optionA: E(3問), S(2問), T(2問), J(3問)
      expect(result.scores.E).toBe(3);
      expect(result.scores.I).toBe(0);
      expect(result.scores.S).toBe(2);
      expect(result.scores.N).toBe(0);
      expect(result.scores.T).toBe(2);
      expect(result.scores.F).toBe(0);
      expect(result.scores.J).toBe(3);
      expect(result.scores.P).toBe(0);
    });

    it("空の回答でもエラーにならない（デフォルトは ESTJ）", () => {
      const result = calculatePersonalityType({});
      // 全スコア0 → >= で先頭文字を採用: E, S, T, J
      expect(result.type).toBe("ESTJ");
      expect(result.scores.E).toBe(0);
      expect(result.scores.I).toBe(0);
    });

    it("一部だけ回答した場合でもエラーにならない", () => {
      const answers: Record<number, string> = { 1: "E", 4: "N" };
      const result = calculatePersonalityType(answers);
      expect(result.type).toBeTruthy();
      expect(result.scores.E).toBe(1);
      expect(result.scores.N).toBe(1);
    });

    it("無効な回答値は無視される", () => {
      const answers: Record<number, string> = { 1: "X", 2: "E" };
      const result = calculatePersonalityType(answers);
      // "X" は scores に存在しないので無視される
      expect(result.scores.E).toBe(1);
    });
  });
});
