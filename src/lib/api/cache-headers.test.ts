import { describe, it, expect } from "vitest";
import {
  CACHE_PRIVATE_SHORT,
  CACHE_PRIVATE_MEDIUM,
  CACHE_PRIVATE_NO_STORE,
  CACHE_PUBLIC_MEDIUM,
  CACHE_PUBLIC_LONG,
} from "./cache-headers";

describe("cache-headers", () => {
  // ── private プリセット ──────────────────────────
  describe("CACHE_PRIVATE_SHORT", () => {
    it("private かつ max-age=60 を含む", () => {
      const cc = (CACHE_PRIVATE_SHORT as Record<string, string>)[
        "Cache-Control"
      ];
      expect(cc).toContain("private");
      expect(cc).toContain("max-age=60");
    });

    it("stale-while-revalidate を含む", () => {
      const cc = (CACHE_PRIVATE_SHORT as Record<string, string>)[
        "Cache-Control"
      ];
      expect(cc).toContain("stale-while-revalidate=120");
    });

    it("public や s-maxage を含まない", () => {
      const cc = (CACHE_PRIVATE_SHORT as Record<string, string>)[
        "Cache-Control"
      ];
      expect(cc).not.toContain("public");
      expect(cc).not.toContain("s-maxage");
    });
  });

  describe("CACHE_PRIVATE_MEDIUM", () => {
    it("private かつ max-age=300 を含む", () => {
      const cc = (CACHE_PRIVATE_MEDIUM as Record<string, string>)[
        "Cache-Control"
      ];
      expect(cc).toContain("private");
      expect(cc).toContain("max-age=300");
    });
  });

  describe("CACHE_PRIVATE_NO_STORE", () => {
    it("no-store と must-revalidate を含む", () => {
      const cc = (CACHE_PRIVATE_NO_STORE as Record<string, string>)[
        "Cache-Control"
      ];
      expect(cc).toContain("no-store");
      expect(cc).toContain("must-revalidate");
    });

    it("public を含まない", () => {
      const cc = (CACHE_PRIVATE_NO_STORE as Record<string, string>)[
        "Cache-Control"
      ];
      expect(cc).not.toContain("public");
    });
  });

  // ── public プリセット ──────────────────────────
  describe("CACHE_PUBLIC_MEDIUM", () => {
    it("public かつ s-maxage=300 を含む", () => {
      const cc = (CACHE_PUBLIC_MEDIUM as Record<string, string>)[
        "Cache-Control"
      ];
      expect(cc).toContain("public");
      expect(cc).toContain("s-maxage=300");
    });

    it("private を含まない", () => {
      const cc = (CACHE_PUBLIC_MEDIUM as Record<string, string>)[
        "Cache-Control"
      ];
      expect(cc).not.toContain("private");
    });
  });

  describe("CACHE_PUBLIC_LONG", () => {
    it("public かつ s-maxage=3600 を含む", () => {
      const cc = (CACHE_PUBLIC_LONG as Record<string, string>)[
        "Cache-Control"
      ];
      expect(cc).toContain("public");
      expect(cc).toContain("s-maxage=3600");
    });
  });

  // ── セキュリティルール ──────────────────────────
  describe("セキュリティ: private プリセットは public/s-maxage を含まない", () => {
    it.each([
      ["CACHE_PRIVATE_SHORT", CACHE_PRIVATE_SHORT],
      ["CACHE_PRIVATE_MEDIUM", CACHE_PRIVATE_MEDIUM],
      ["CACHE_PRIVATE_NO_STORE", CACHE_PRIVATE_NO_STORE],
    ])("%s は public, s-maxage を含まない", (_name, preset) => {
      const cc = (preset as Record<string, string>)["Cache-Control"];
      expect(cc).not.toContain("public");
      expect(cc).not.toContain("s-maxage");
    });
  });
});
