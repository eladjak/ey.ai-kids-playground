import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock secureEntity to pass through in tests
vi.mock("@/lib/secureEntity", () => ({
  createSecureEntity: (entity) => entity,
}));

vi.mock("@/entities/User", () => ({
  User: {
    me: vi.fn().mockResolvedValue({ email: "test@test.com", xp: 0, streak_days: 0 }),
    updateMyUserData: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/entities/Book", () => ({
  Book: { filter: vi.fn().mockResolvedValue([]) },
}));

vi.mock("@/entities/UserBadge", () => ({
  UserBadge: { filter: vi.fn().mockResolvedValue([]), create: vi.fn().mockResolvedValue({}) },
}));

import useGamification, {
  XP_EVENTS,
  LEVEL_THRESHOLDS,
  BADGE_DEFINITIONS,
  getLevelFromXP,
  getNextLevelXP,
} from "./useGamification";
import { User } from "@/entities/User";
import { Book } from "@/entities/Book";
import { UserBadge } from "@/entities/UserBadge";

// === XP_EVENTS CONSTANT TESTS ===
describe("XP_EVENTS", () => {
  it("has all expected event keys", () => {
    expect(XP_EVENTS).toHaveProperty("book_created");
    expect(XP_EVENTS).toHaveProperty("page_edited");
    expect(XP_EVENTS).toHaveProperty("character_created");
    expect(XP_EVENTS).toHaveProperty("community_share");
    expect(XP_EVENTS).toHaveProperty("streak_day");
    expect(XP_EVENTS).toHaveProperty("book_completed");
    expect(XP_EVENTS).toHaveProperty("first_login");
  });

  it("all event values are positive numbers", () => {
    for (const [, value] of Object.entries(XP_EVENTS)) {
      expect(typeof value).toBe("number");
      expect(value).toBeGreaterThan(0);
    }
  });
});

// === LEVEL_THRESHOLDS CONSTANT TESTS ===
describe("LEVEL_THRESHOLDS", () => {
  it("is sorted ascending", () => {
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      expect(LEVEL_THRESHOLDS[i]).toBeGreaterThan(LEVEL_THRESHOLDS[i - 1]);
    }
  });

  it("starts at 0", () => {
    expect(LEVEL_THRESHOLDS[0]).toBe(0);
  });
});

// === BADGE_DEFINITIONS CONSTANT TESTS ===
describe("BADGE_DEFINITIONS", () => {
  it("has exactly 8 badges", () => {
    expect(Object.keys(BADGE_DEFINITIONS).length).toBe(8);
  });

  it("each badge has all required fields", () => {
    const requiredFields = ["id", "nameEn", "nameHe", "check", "progress", "maxProgress", "xpReward"];
    for (const badge of Object.values(BADGE_DEFINITIONS)) {
      for (const field of requiredFields) {
        expect(badge).toHaveProperty(field);
      }
    }
  });

  it("all check functions are functions", () => {
    for (const badge of Object.values(BADGE_DEFINITIONS)) {
      expect(typeof badge.check).toBe("function");
    }
  });

  it("all progress functions are functions", () => {
    for (const badge of Object.values(BADGE_DEFINITIONS)) {
      expect(typeof badge.progress).toBe("function");
    }
  });

  it("all xpReward values are positive numbers", () => {
    for (const badge of Object.values(BADGE_DEFINITIONS)) {
      expect(typeof badge.xpReward).toBe("number");
      expect(badge.xpReward).toBeGreaterThan(0);
    }
  });
});

// === getLevelFromXP TESTS ===
describe("getLevelFromXP", () => {
  it("returns 0 for 0 XP", () => {
    expect(getLevelFromXP(0)).toBe(0);
  });

  it("returns 1 for 200 XP (threshold)", () => {
    expect(getLevelFromXP(200)).toBe(1);
  });

  it("returns 2 for 500 XP (threshold)", () => {
    expect(getLevelFromXP(500)).toBe(2);
  });

  it("returns 2 for 999 XP (just below next threshold)", () => {
    expect(getLevelFromXP(999)).toBe(2);
  });

  it("returns 3 for 1000 XP (threshold)", () => {
    expect(getLevelFromXP(1000)).toBe(3);
  });
});

// === getNextLevelXP TESTS ===
describe("getNextLevelXP", () => {
  it("returns 200 for level 0 (next level is 1)", () => {
    expect(getNextLevelXP(0)).toBe(200);
  });

  it("returns 500 for level 1 (next level is 2)", () => {
    expect(getNextLevelXP(1)).toBe(500);
  });
});

// === BADGE CHECK FUNCTIONS ===
describe("Badge check functions", () => {
  describe("first_book", () => {
    it("returns false when totalBooks is 0", () => {
      expect(BADGE_DEFINITIONS.first_book.check({ totalBooks: 0 })).toBe(false);
    });

    it("returns true when totalBooks is 1", () => {
      expect(BADGE_DEFINITIONS.first_book.check({ totalBooks: 1 })).toBe(true);
    });
  });

  describe("storyteller", () => {
    it("returns false when totalBooks is 4", () => {
      expect(BADGE_DEFINITIONS.storyteller.check({ totalBooks: 4 })).toBe(false);
    });

    it("returns true when totalBooks is 5", () => {
      expect(BADGE_DEFINITIONS.storyteller.check({ totalBooks: 5 })).toBe(true);
    });
  });

  describe("streak_master", () => {
    it("returns false when streakDays is 6", () => {
      expect(BADGE_DEFINITIONS.streak_master.check({ streakDays: 6 })).toBe(false);
    });

    it("returns true when streakDays is 7", () => {
      expect(BADGE_DEFINITIONS.streak_master.check({ streakDays: 7 })).toBe(true);
    });
  });

  describe("genre_explorer", () => {
    it("returns false when uniqueGenres is 2", () => {
      expect(BADGE_DEFINITIONS.genre_explorer.check({ uniqueGenres: 2 })).toBe(false);
    });

    it("returns true when uniqueGenres is 3", () => {
      expect(BADGE_DEFINITIONS.genre_explorer.check({ uniqueGenres: 3 })).toBe(true);
    });
  });

  describe("multilingual", () => {
    it("returns false when uniqueLanguages is 1", () => {
      expect(BADGE_DEFINITIONS.multilingual.check({ uniqueLanguages: 1 })).toBe(false);
    });

    it("returns true when uniqueLanguages is 2", () => {
      expect(BADGE_DEFINITIONS.multilingual.check({ uniqueLanguages: 2 })).toBe(true);
    });
  });
});

// === BADGE PROGRESS FUNCTIONS ===
describe("Badge progress functions", () => {
  it("first_book progress is capped at maxProgress (1)", () => {
    expect(BADGE_DEFINITIONS.first_book.progress({ totalBooks: 5 })).toBe(1);
  });

  it("storyteller progress returns totalBooks when under max", () => {
    expect(BADGE_DEFINITIONS.storyteller.progress({ totalBooks: 3 })).toBe(3);
  });

  it("character_creator progress is capped at 5", () => {
    expect(BADGE_DEFINITIONS.character_creator.progress({ totalCharacters: 10 })).toBe(5);
  });
});

// === HOOK RENDERING TESTS ===
describe("useGamification hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Prevent the streak-update effect from triggering awardXP (which queues
    // a celebration and makes pendingCelebrations non-empty in tests). By
    // marking today as already processed, the effect short-circuits early.
    localStorage.setItem(
      "streak_last_active_test@test.com",
      new Date().toDateString()
    );

    vi.mocked(User.me).mockResolvedValue({ email: "test@test.com", xp: 0, streak_days: 0 });
    vi.mocked(User.updateMyUserData).mockResolvedValue({});
    vi.mocked(Book.filter).mockResolvedValue([]);
    vi.mocked(UserBadge.filter).mockResolvedValue([]);
    vi.mocked(UserBadge.create).mockResolvedValue({});
  });

  it("has isLoading true initially", () => {
    const { result } = renderHook(() => useGamification());
    expect(result.current.isLoading).toBe(true);
  });

  it("returns xp, level, streakDays, badges array after loading", async () => {
    const { result } = renderHook(() => useGamification());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(typeof result.current.xp).toBe("number");
    expect(typeof result.current.level).toBe("number");
    expect(typeof result.current.streakDays).toBe("number");
    expect(Array.isArray(result.current.badges)).toBe(true);
  });

  it("returns 8 badges after loading", async () => {
    const { result } = renderHook(() => useGamification());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.badges.length).toBe(8);
  });

  it("pendingCelebrations starts empty", async () => {
    const { result } = renderHook(() => useGamification());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.pendingCelebrations).toHaveLength(0);
  });

  it("progressPercent is between 0 and 100", async () => {
    const { result } = renderHook(() => useGamification());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.progressPercent).toBeGreaterThanOrEqual(0);
    expect(result.current.progressPercent).toBeLessThanOrEqual(100);
  });

  it("awardXP increments xp and returns correct result", async () => {
    const { result } = renderHook(() => useGamification());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const initialXP = result.current.xp;
    let awardResult;
    await act(async () => {
      awardResult = await result.current.awardXP("book_created");
    });

    expect(awardResult.xpGained).toBe(XP_EVENTS.book_created);
    expect(awardResult.newXP).toBe(initialXP + XP_EVENTS.book_created);
    expect(result.current.xp).toBe(initialXP + XP_EVENTS.book_created);
  });

  it("awardXP returns xpGained: 0 for unknown event", async () => {
    const { result } = renderHook(() => useGamification());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let awardResult;
    await act(async () => {
      awardResult = await result.current.awardXP("unknown_event_xyz");
    });
    expect(awardResult.xpGained).toBe(0);
  });

  it("exposes XP_EVENTS, LEVEL_THRESHOLDS, BADGE_DEFINITIONS constants", async () => {
    const { result } = renderHook(() => useGamification());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.XP_EVENTS).toBeDefined();
    expect(result.current.LEVEL_THRESHOLDS).toBeDefined();
    expect(result.current.BADGE_DEFINITIONS).toBeDefined();
  });
});
