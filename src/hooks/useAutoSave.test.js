import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadAutoSaved } from "./useAutoSave";

describe("loadAutoSaved", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null data when key is empty", () => {
    const result = loadAutoSaved("");
    expect(result.data).toBeNull();
    expect(result.timestamp).toBeNull();
  });

  it("returns null data when key is null", () => {
    const result = loadAutoSaved(null);
    expect(result.data).toBeNull();
    expect(result.timestamp).toBeNull();
  });

  it("returns null data when nothing is saved", () => {
    const result = loadAutoSaved("nonexistent_key");
    expect(result.data).toBeNull();
    expect(result.timestamp).toBeNull();
  });

  it("returns saved data when present in localStorage", () => {
    const testData = { currentPageText: "Hello world", textStyles: { fontSize: 20 } };
    const timestamp = "2026-02-15T12:00:00.000Z";
    localStorage.setItem(
      "ey_autosave_test_key",
      JSON.stringify({ data: testData, timestamp })
    );

    const result = loadAutoSaved("test_key");
    expect(result.data).toEqual(testData);
    expect(result.timestamp).toBe(timestamp);
  });

  it("returns null for corrupted JSON in localStorage", () => {
    localStorage.setItem("ey_autosave_corrupted", "not valid json{{{");
    const result = loadAutoSaved("corrupted");
    expect(result.data).toBeNull();
    expect(result.timestamp).toBeNull();
  });

  it("handles missing data field in stored object", () => {
    localStorage.setItem(
      "ey_autosave_partial",
      JSON.stringify({ timestamp: "2026-02-15T12:00:00.000Z" })
    );
    const result = loadAutoSaved("partial");
    expect(result.data).toBeNull();
    expect(result.timestamp).toBe("2026-02-15T12:00:00.000Z");
  });

  it("handles missing timestamp field in stored object", () => {
    localStorage.setItem(
      "ey_autosave_no_ts",
      JSON.stringify({ data: { foo: "bar" } })
    );
    const result = loadAutoSaved("no_ts");
    expect(result.data).toEqual({ foo: "bar" });
    expect(result.timestamp).toBeNull();
  });
});

describe("book-translations", () => {
  it("can import getBookTranslation", async () => {
    const { getBookTranslation } = await import("@/utils/book-translations");
    expect(typeof getBookTranslation).toBe("function");
  });

  it("returns Hebrew translation for hebrew language", async () => {
    const { getBookTranslation } = await import("@/utils/book-translations");
    const t = getBookTranslation("hebrew");
    expect(t("book.backToLibrary")).toBe("חזרה לספרייה");
  });

  it("returns English translation for english language", async () => {
    const { getBookTranslation } = await import("@/utils/book-translations");
    const t = getBookTranslation("english");
    expect(t("book.backToLibrary")).toBe("Back to Library");
  });

  it("falls back to English for unknown language", async () => {
    const { getBookTranslation } = await import("@/utils/book-translations");
    const t = getBookTranslation("french");
    expect(t("book.backToLibrary")).toBe("Back to Library");
  });

  it("replaces template params correctly", async () => {
    const { getBookTranslation } = await import("@/utils/book-translations");
    const t = getBookTranslation("english");
    expect(t("book.pageOf", { current: 3, total: 10 })).toBe("Page 3 of 10");
  });

  it("returns key for unknown translation key", async () => {
    const { getBookTranslation } = await import("@/utils/book-translations");
    const t = getBookTranslation("english");
    expect(t("book.nonexistent.key")).toBe("book.nonexistent.key");
  });

  it("translateGenre returns Hebrew for known genre", async () => {
    const { translateGenre } = await import("@/utils/book-translations");
    expect(translateGenre("adventure")).toBe("הרפתקאות");
    expect(translateGenre("fairy_tale")).toBe("אגדה");
  });

  it("translateGenre formats unknown genres", async () => {
    const { translateGenre } = await import("@/utils/book-translations");
    expect(translateGenre("some_unknown_genre")).toBe("some unknown genre");
  });

  it("translateArtStyle returns Hebrew for known style", async () => {
    const { translateArtStyle } = await import("@/utils/book-translations");
    expect(translateArtStyle("disney")).toBe("דיסני");
    expect(translateArtStyle("watercolor")).toBe("צבעי מים");
  });

  it("translateArtStyle formats unknown styles", async () => {
    const { translateArtStyle } = await import("@/utils/book-translations");
    expect(translateArtStyle("unknown_style")).toBe("unknown style");
  });
});
