import { describe, it, expect } from "vitest";
import {
  PERSONALITY_TYPES,
  PERSONALITY_DATA,
  PERSONALITY_GROUPS,
  isValidPersonalityType,
  getGroupForType,
  getAllGroups,
} from "./types";

describe("personality/types", () => {
  it("16タイプが定義されている", () => {
    expect(PERSONALITY_TYPES).toHaveLength(16);
  });

  it("全16タイプの詳細データが存在する", () => {
    for (const type of PERSONALITY_TYPES) {
      expect(PERSONALITY_DATA[type]).toBeDefined();
      expect(PERSONALITY_DATA[type].type).toBe(type);
      expect(PERSONALITY_DATA[type].name).toBeTruthy();
      expect(PERSONALITY_DATA[type].animal).toBeTruthy();
      expect(PERSONALITY_DATA[type].color).toMatch(/^#/);
    }
  });

  it("4つのグループが定義されている", () => {
    expect(Object.keys(PERSONALITY_GROUPS)).toHaveLength(4);
  });

  it("各グループに4タイプが所属する", () => {
    for (const group of Object.values(PERSONALITY_GROUPS)) {
      expect(group.types).toHaveLength(4);
    }
  });

  it("全タイプがいずれかのグループに所属する", () => {
    const allTypesInGroups = Object.values(PERSONALITY_GROUPS).flatMap(
      (g) => g.types
    );
    expect(allTypesInGroups.sort()).toEqual([...PERSONALITY_TYPES].sort());
  });

  describe("isValidPersonalityType", () => {
    it("有効なタイプを判定できる", () => {
      expect(isValidPersonalityType("INTJ")).toBe(true);
      expect(isValidPersonalityType("intj")).toBe(true);
      expect(isValidPersonalityType("ESFP")).toBe(true);
    });

    it("無効なタイプを判定できる", () => {
      expect(isValidPersonalityType("XXXX")).toBe(false);
      expect(isValidPersonalityType("")).toBe(false);
    });
  });

  describe("getGroupForType", () => {
    it("INTJ は分析家グループ", () => {
      expect(getGroupForType("INTJ").id).toBe("analyst");
    });

    it("INFP は外交官グループ", () => {
      expect(getGroupForType("INFP").id).toBe("diplomat");
    });

    it("ISTJ は番人グループ", () => {
      expect(getGroupForType("ISTJ").id).toBe("sentinel");
    });

    it("ESTP は探検家グループ", () => {
      expect(getGroupForType("ESTP").id).toBe("explorer");
    });
  });

  describe("getAllGroups", () => {
    it("4グループを返す", () => {
      expect(getAllGroups()).toHaveLength(4);
    });
  });
});
