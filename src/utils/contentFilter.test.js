/**
 * Tests for contentFilter.js - Child Safety Content Filter
 *
 * These tests verify that the content filtering utility correctly:
 * - Blocks absolutely inappropriate content (violence, profanity, etc.)
 * - Flags age-conditional content based on target age
 * - Detects complex vocabulary for young readers
 * - Validates topic appropriateness
 * - Provides helpful filter messages
 */

import { describe, it, expect } from "vitest";
import {
  checkAbsoluteBlocklist,
  checkAgeConditionalContent,
  checkVocabularyComplexity,
  isTopicAppropriate,
  filterContent,
  isSafeForChildren,
  getFilterMessage,
  AGE_GROUPS,
  APPROPRIATE_TOPICS,
} from "./contentFilter";

// ─── checkAbsoluteBlocklist ───────────────────────────────────────────────────

describe("checkAbsoluteBlocklist", () => {
  it("returns isClean=true for safe children's content", () => {
    const result = checkAbsoluteBlocklist("Once upon a time, a bunny found a magical carrot.");
    expect(result.isClean).toBe(true);
    expect(result.blockedTerms).toHaveLength(0);
    expect(result.category).toBeNull();
  });

  it("blocks content with explicit violence terms", () => {
    const result = checkAbsoluteBlocklist("The dragon was murdered in the castle.");
    expect(result.isClean).toBe(false);
    expect(result.blockedTerms).toContain("murder");
    expect(result.category).toBe("violence");
  });

  it("blocks explicit profanity", () => {
    const result = checkAbsoluteBlocklist("What the fuck is going on?");
    expect(result.isClean).toBe(false);
    expect(result.blockedTerms.length).toBeGreaterThan(0);
    expect(result.category).toBe("profanity");
  });

  it("blocks Hebrew profanity", () => {
    const result = checkAbsoluteBlocklist("הוא אמר זונה בחוצות");
    expect(result.isClean).toBe(false);
    expect(result.blockedTerms.length).toBeGreaterThan(0);
    expect(result.category).toBe("hebrew_profanity");
  });

  it("blocks drug-related content", () => {
    const result = checkAbsoluteBlocklist("They found cocaine in the basement.");
    expect(result.isClean).toBe(false);
    expect(result.blockedTerms).toContain("cocaine");
    expect(result.category).toBe("drugs");
  });

  it("blocks self-harm content", () => {
    // "suicide" is in selfHarm category exclusively; "kill" overlaps with violence
    const result = checkAbsoluteBlocklist("suicide is never the answer");
    expect(result.isClean).toBe(false);
    expect(result.category).toBe("selfHarm");
  });

  it("returns isClean=true for empty string", () => {
    const result = checkAbsoluteBlocklist("");
    expect(result.isClean).toBe(true);
    expect(result.blockedTerms).toHaveLength(0);
  });

  it("returns isClean=true for non-string input", () => {
    const result = checkAbsoluteBlocklist(null);
    expect(result.isClean).toBe(true);
  });

  it("deduplicates blocked terms when same word appears multiple times", () => {
    const result = checkAbsoluteBlocklist("murder and murder and murder");
    const uniqueTerms = [...new Set(result.blockedTerms)];
    expect(result.blockedTerms.length).toBe(uniqueTerms.length);
  });
});

// ─── checkAgeConditionalContent ───────────────────────────────────────────────

describe("checkAgeConditionalContent", () => {
  it("allows mild content for older children (age 10)", () => {
    const result = checkAgeConditionalContent("A scary monster appeared in the forest.", 10);
    expect(result.isAppropriate).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("flags scary monster content for children under 8", () => {
    const result = checkAgeConditionalContent("A scary monster appeared.", 7);
    expect(result.isAppropriate).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it("flags war content for toddlers (age 4)", () => {
    const result = checkAgeConditionalContent("There was a great war in the land.", 4);
    expect(result.isAppropriate).toBe(false);
    expect(result.warnings.some((w) => w.includes("war"))).toBe(true);
  });

  it("flags preteen-only content for young children (age 6)", () => {
    const result = checkAgeConditionalContent("The story is about puberty and growing up.", 6);
    expect(result.isAppropriate).toBe(false);
    expect(result.warnings.some((w) => w.includes("puberty"))).toBe(true);
  });

  it("allows preteen-only content for age 11+", () => {
    const result = checkAgeConditionalContent("The story is about puberty.", 12);
    expect(result.isAppropriate).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("returns appropriate=true for empty string", () => {
    const result = checkAgeConditionalContent("", 5);
    expect(result.isAppropriate).toBe(true);
  });
});

// ─── checkVocabularyComplexity ────────────────────────────────────────────────

describe("checkVocabularyComplexity", () => {
  it("returns isSimple=true for older children (age 7+)", () => {
    const result = checkVocabularyComplexity("The philosophical cat was melancholy.", 8);
    expect(result.isSimple).toBe(true);
    expect(result.complexWords).toHaveLength(0);
  });

  it("detects complex vocabulary for young children (under 7)", () => {
    const result = checkVocabularyComplexity("The philosophical cat was melancholy.", 6);
    expect(result.isSimple).toBe(false);
    expect(result.complexWords.length).toBeGreaterThan(0);
    expect(result.complexWords).toContain("philosophical");
    expect(result.complexWords).toContain("melancholy");
  });

  it("provides vocabulary suggestions when available", () => {
    const result = checkVocabularyComplexity("The melancholy elephant was very sad.", 5);
    expect(result.suggestions).toHaveProperty("melancholy");
    expect(result.suggestions["melancholy"]).toBe("sad");
  });

  it("returns isSimple=true for age 6 with simple vocabulary", () => {
    const result = checkVocabularyComplexity("The cat sat on the mat.", 6);
    expect(result.isSimple).toBe(true);
  });

  it("handles non-string input gracefully", () => {
    const result = checkVocabularyComplexity(null, 5);
    expect(result.isSimple).toBe(true);
    expect(result.complexWords).toHaveLength(0);
  });
});

// ─── isTopicAppropriate ───────────────────────────────────────────────────────

describe("isTopicAppropriate", () => {
  it("approves standard appropriate topics", () => {
    const result = isTopicAppropriate("A story about friendship and animals");
    expect(result.isAppropriate).toBe(true);
    expect(result.matchedTopics.length).toBeGreaterThan(0);
  });

  it("matches multiple appropriate topics", () => {
    const result = isTopicAppropriate("adventure in the ocean with family");
    expect(result.matchedTopics).toContain("adventure");
    expect(result.matchedTopics).toContain("ocean");
    expect(result.matchedTopics).toContain("family");
  });

  it("returns isAppropriate=false for empty string", () => {
    const result = isTopicAppropriate("");
    expect(result.isAppropriate).toBe(false);
  });

  it("returns isAppropriate=false for null", () => {
    const result = isTopicAppropriate(null);
    expect(result.isAppropriate).toBe(false);
  });

  it("blocks topics with absolute blocklist content", () => {
    const result = isTopicAppropriate("A story about cocaine and drug dealers");
    expect(result.isAppropriate).toBe(false);
  });
});

// ─── filterContent (main pipeline) ───────────────────────────────────────────

describe("filterContent", () => {
  it("returns level=clean for fully appropriate content", () => {
    const result = filterContent("A bunny and a fox became best friends in the forest.", 10);
    expect(result.isAllowed).toBe(true);
    expect(result.level).toBe("clean");
    expect(result.blockedTerms).toHaveLength(0);
  });

  it("returns level=blocked and isAllowed=false for absolute blocklist hits", () => {
    const result = filterContent("The knight was brutally murdered.", 10);
    expect(result.isAllowed).toBe(false);
    expect(result.level).toBe("blocked");
    expect(result.blockedTerms.length).toBeGreaterThan(0);
    expect(result.reason).toContain("inappropriate terms");
  });

  it("returns level=warning for age-conditional content with young audience", () => {
    const result = filterContent("A scary monster roared in the dark.", 5);
    expect(result.isAllowed).toBe(true);
    expect(result.level).toBe("warning");
    expect(result.ageWarnings.length).toBeGreaterThan(0);
  });

  it("returns level=warning for complex vocabulary with young audience", () => {
    const result = filterContent("The catastrophic metamorphosis was melancholy.", 5);
    expect(result.isAllowed).toBe(true);
    expect(result.level).toBe("warning");
  });

  it("uses age 10 as default when no ageMax provided", () => {
    const result = filterContent("A friendly adventure story.");
    expect(result.isAllowed).toBe(true);
    expect(result.level).toBe("clean");
  });

  it("never allows blocklist content regardless of age", () => {
    // Even for preteen audience (12), absolute blocklist should block
    const result = filterContent("They found heroin in the basement.", 12);
    expect(result.isAllowed).toBe(false);
    expect(result.level).toBe("blocked");
  });
});

// ─── isSafeForChildren ───────────────────────────────────────────────────────

describe("isSafeForChildren", () => {
  it("returns true for child-safe content", () => {
    expect(isSafeForChildren("The princess found a magical dragon egg.")).toBe(true);
  });

  it("returns false for content with blocked terms", () => {
    expect(isSafeForChildren("The villain was brutally tortured.")).toBe(false);
  });

  it("returns true for Hebrew safe content", () => {
    expect(isSafeForChildren("ילדה קטנה מצאה ארנב קסום ביער")).toBe(true);
  });
});

// ─── getFilterMessage ─────────────────────────────────────────────────────────

describe("getFilterMessage", () => {
  it("returns English block message for blocked content", () => {
    const result = { level: "blocked" };
    const msg = getFilterMessage(result, false);
    expect(msg).toContain("not appropriate");
    expect(typeof msg).toBe("string");
  });

  it("returns Hebrew block message when isRTL=true", () => {
    const result = { level: "blocked" };
    const msg = getFilterMessage(result, true);
    expect(msg).toContain("אינו מתאים");
  });

  it("returns English warning message for warning level", () => {
    const result = { level: "warning" };
    const msg = getFilterMessage(result, false);
    expect(msg).toContain("age group");
  });

  it("returns Hebrew warning message when isRTL=true", () => {
    const result = { level: "warning" };
    const msg = getFilterMessage(result, true);
    expect(msg).toContain("גיל");
  });

  it("returns clean message for approved content", () => {
    const result = { level: "clean" };
    const msg = getFilterMessage(result, false);
    expect(msg).toContain("appropriate");
  });
});

// ─── Constants ────────────────────────────────────────────────────────────────

describe("Constants", () => {
  it("AGE_GROUPS has all four expected groups", () => {
    expect(AGE_GROUPS).toHaveProperty("TODDLER");
    expect(AGE_GROUPS).toHaveProperty("YOUNG_CHILD");
    expect(AGE_GROUPS).toHaveProperty("CHILD");
    expect(AGE_GROUPS).toHaveProperty("PRETEEN");
  });

  it("AGE_GROUPS have non-overlapping ranges", () => {
    expect(AGE_GROUPS.TODDLER.max).toBeLessThan(AGE_GROUPS.YOUNG_CHILD.min);
    expect(AGE_GROUPS.YOUNG_CHILD.max).toBeLessThan(AGE_GROUPS.CHILD.min);
    expect(AGE_GROUPS.CHILD.max).toBeLessThan(AGE_GROUPS.PRETEEN.min);
  });

  it("APPROPRIATE_TOPICS is a non-empty array of strings", () => {
    expect(Array.isArray(APPROPRIATE_TOPICS)).toBe(true);
    expect(APPROPRIATE_TOPICS.length).toBeGreaterThan(10);
    expect(typeof APPROPRIATE_TOPICS[0]).toBe("string");
  });

  it("APPROPRIATE_TOPICS includes core children's story themes", () => {
    expect(APPROPRIATE_TOPICS).toContain("friendship");
    expect(APPROPRIATE_TOPICS).toContain("family");
    expect(APPROPRIATE_TOPICS).toContain("adventure");
    expect(APPROPRIATE_TOPICS).toContain("animals");
  });
});
