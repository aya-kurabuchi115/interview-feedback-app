import { describe, it, expect } from "vitest";
import { questions } from "./data";
import type { Question, Industry, Round, QuestionType, Difficulty } from "./types";
import { INDUSTRIES, ROUNDS, QUESTION_TYPES } from "./types";

const VALID_DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard"];

describe("questions/data", () => {
  describe("データ量", () => {
    it("質問が1件以上存在する", () => {
      expect(questions.length).toBeGreaterThan(0);
    });

    it("50問以上の質問が含まれている", () => {
      expect(questions.length).toBeGreaterThanOrEqual(50);
    });
  });

  describe("ID の一意性", () => {
    it("すべての質問 ID が一意である", () => {
      const ids = questions.map((q) => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("ID は 'q' + 3桁の数字形式（q001, q002, ...）である", () => {
      for (const q of questions) {
        expect(q.id).toMatch(/^q\d{3}$/);
      }
    });
  });

  describe("必須フィールドの存在", () => {
    it("すべての質問に question テキストが存在する", () => {
      for (const q of questions) {
        expect(q.question).toBeTruthy();
        expect(typeof q.question).toBe("string");
        expect(q.question.trim().length).toBeGreaterThan(0);
      }
    });

    it("すべての質問に industry 配列が存在し、空でない", () => {
      for (const q of questions) {
        expect(Array.isArray(q.industry)).toBe(true);
        expect(q.industry.length).toBeGreaterThan(0);
      }
    });

    it("すべての質問に round 配列が存在し、空でない", () => {
      for (const q of questions) {
        expect(Array.isArray(q.round)).toBe(true);
        expect(q.round.length).toBeGreaterThan(0);
      }
    });

    it("すべての質問に type が存在する", () => {
      for (const q of questions) {
        expect(q.type).toBeTruthy();
      }
    });

    it("すべての質問に difficulty が存在する", () => {
      for (const q of questions) {
        expect(q.difficulty).toBeTruthy();
      }
    });

    it("すべての質問に tips 配列が存在し、1件以上ある", () => {
      for (const q of questions) {
        expect(Array.isArray(q.tips)).toBe(true);
        expect(q.tips.length).toBeGreaterThan(0);
      }
    });

    it("すべての質問に exampleAnswer が存在する", () => {
      for (const q of questions) {
        expect(q.exampleAnswer).toBeTruthy();
        expect(q.exampleAnswer.trim().length).toBeGreaterThan(0);
      }
    });

    it("すべての質問に keywords 配列が存在し、1件以上ある", () => {
      for (const q of questions) {
        expect(Array.isArray(q.keywords)).toBe(true);
        expect(q.keywords.length).toBeGreaterThan(0);
      }
    });
  });

  describe("値の妥当性", () => {
    it("industry の値は全て定義された Industry 型に含まれる", () => {
      for (const q of questions) {
        for (const ind of q.industry) {
          expect(INDUSTRIES).toContain(ind);
        }
      }
    });

    it("round の値は全て定義された Round 型に含まれる", () => {
      for (const q of questions) {
        for (const r of q.round) {
          expect(ROUNDS).toContain(r);
        }
      }
    });

    it("type の値は全て定義された QuestionType 型に含まれる", () => {
      for (const q of questions) {
        expect(QUESTION_TYPES).toContain(q.type);
      }
    });

    it("difficulty の値は easy/normal/hard のいずれかである", () => {
      for (const q of questions) {
        expect(VALID_DIFFICULTIES).toContain(q.difficulty);
      }
    });
  });

  describe("カテゴリの網羅性", () => {
    it("すべての QuestionType に対して少なくとも1問が存在する", () => {
      for (const type of QUESTION_TYPES) {
        const found = questions.filter((q) => q.type === type);
        expect(found.length).toBeGreaterThan(0);
      }
    });

    it("すべての Difficulty レベルに対して少なくとも1問が存在する", () => {
      for (const diff of VALID_DIFFICULTIES) {
        const found = questions.filter((q) => q.difficulty === diff);
        expect(found.length).toBeGreaterThan(0);
      }
    });
  });

  describe("データ品質", () => {
    it("模範解答は50文字以上である", () => {
      for (const q of questions) {
        expect(q.exampleAnswer.length).toBeGreaterThanOrEqual(50);
      }
    });

    it("質問テキストは末尾が '？' または '?' で終わるか、句点で終わる", () => {
      for (const q of questions) {
        const lastChar = q.question.slice(-1);
        const validEndings = ["？", "?", "。", "」", "）", ")"];
        expect(validEndings).toContain(lastChar);
      }
    });
  });
});
