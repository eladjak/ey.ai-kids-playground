import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  playSound,
  calculateStars,
  calculateXP,
  pickRandom,
  shuffle,
  HEBREW_LETTERS,
  COLORS_DATA,
  GAME_PHASES,
  DIFFICULTY_LEVELS,
} from "./gameUtils";

// ---- playSound ----
describe("playSound", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("dispatches a custom event with the sound name", () => {
    const handler = vi.fn();
    window.addEventListener("game-sound", handler);

    playSound("correct");

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0];
    expect(event.detail).toEqual({ sound: "correct" });

    window.removeEventListener("game-sound", handler);
  });

  it("dispatches events for different sound names", () => {
    const events = [];
    const handler = (e) => events.push(e.detail.sound);
    window.addEventListener("game-sound", handler);

    playSound("wrong");
    playSound("levelUp");
    playSound("gameStart");

    expect(events).toEqual(["wrong", "levelUp", "gameStart"]);

    window.removeEventListener("game-sound", handler);
  });
});

// ---- calculateStars ----
describe("calculateStars", () => {
  it("returns 3 stars for 90%+ correct", () => {
    expect(calculateStars(9, 10)).toBe(3);
    expect(calculateStars(10, 10)).toBe(3);
    expect(calculateStars(5, 5)).toBe(3);
  });

  it("returns 2 stars for 60-89% correct", () => {
    expect(calculateStars(6, 10)).toBe(2);
    expect(calculateStars(7, 10)).toBe(2);
    expect(calculateStars(8, 10)).toBe(2);
  });

  it("returns 1 star for below 60% correct", () => {
    expect(calculateStars(0, 10)).toBe(1);
    expect(calculateStars(3, 10)).toBe(1);
    expect(calculateStars(5, 10)).toBe(1);
  });

  it("returns 1 star when total is 0 (participation)", () => {
    expect(calculateStars(0, 0)).toBe(1);
  });
});

// ---- calculateXP ----
describe("calculateXP", () => {
  it("returns 10 XP per correct answer", () => {
    expect(calculateXP(1)).toBe(10);
    expect(calculateXP(5)).toBe(50);
    expect(calculateXP(10)).toBe(100);
  });

  it("adds streak bonus (5 per streak)", () => {
    expect(calculateXP(5, 3)).toBe(65); // 50 + 15
    expect(calculateXP(10, 5)).toBe(125); // 100 + 25
  });

  it("returns 0 for 0 correct and 0 streak", () => {
    expect(calculateXP(0, 0)).toBe(0);
  });
});

// ---- pickRandom ----
describe("pickRandom", () => {
  it("returns an element from the array", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = pickRandom(arr);
    expect(arr).toContain(result);
  });

  it("works with single-element arrays", () => {
    expect(pickRandom(["only"])).toBe("only");
  });
});

// ---- shuffle ----
describe("shuffle", () => {
  it("returns an array with the same elements", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result).toHaveLength(arr.length);
    expect(result.sort()).toEqual(arr.sort());
  });

  it("does not mutate the original array", () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    shuffle(arr);
    expect(arr).toEqual(original);
  });

  it("returns a new array instance", () => {
    const arr = [1, 2, 3];
    const result = shuffle(arr);
    expect(result).not.toBe(arr);
  });
});

// ---- Data Constants ----
describe("HEBREW_LETTERS", () => {
  it("has 22 letters (full Hebrew alphabet)", () => {
    expect(HEBREW_LETTERS).toHaveLength(22);
  });

  it("each letter has letter, name, and transliteration", () => {
    for (const entry of HEBREW_LETTERS) {
      expect(entry).toHaveProperty("letter");
      expect(entry).toHaveProperty("name");
      expect(entry).toHaveProperty("transliteration");
      expect(typeof entry.letter).toBe("string");
      expect(typeof entry.name).toBe("string");
      expect(typeof entry.transliteration).toBe("string");
    }
  });

  it("starts with Alef and ends with Tav", () => {
    expect(HEBREW_LETTERS[0].letter).toBe("א");
    expect(HEBREW_LETTERS[21].letter).toBe("ת");
  });
});

describe("COLORS_DATA", () => {
  it("has at least 10 colors", () => {
    expect(COLORS_DATA.length).toBeGreaterThanOrEqual(10);
  });

  it("each color has name, hex, and english properties", () => {
    for (const color of COLORS_DATA) {
      expect(color).toHaveProperty("name");
      expect(color).toHaveProperty("hex");
      expect(color).toHaveProperty("english");
      expect(color.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

// ---- Game State Constants ----
describe("GAME_PHASES", () => {
  it("has MENU, PLAYING, and RESULT phases", () => {
    expect(GAME_PHASES.MENU).toBe("menu");
    expect(GAME_PHASES.PLAYING).toBe("playing");
    expect(GAME_PHASES.RESULT).toBe("result");
  });
});

describe("DIFFICULTY_LEVELS", () => {
  it("has EASY, MEDIUM, and HARD levels", () => {
    expect(DIFFICULTY_LEVELS.EASY).toBeDefined();
    expect(DIFFICULTY_LEVELS.MEDIUM).toBeDefined();
    expect(DIFFICULTY_LEVELS.HARD).toBeDefined();
  });

  it("each level has label, value, rounds, and timeLimit", () => {
    for (const level of Object.values(DIFFICULTY_LEVELS)) {
      expect(level).toHaveProperty("label");
      expect(level).toHaveProperty("value");
      expect(level).toHaveProperty("rounds");
      expect(level).toHaveProperty("timeLimit");
      expect(typeof level.rounds).toBe("number");
      expect(typeof level.timeLimit).toBe("number");
    }
  });

  it("EASY has no time limit", () => {
    expect(DIFFICULTY_LEVELS.EASY.timeLimit).toBe(0);
  });

  it("HARD has more rounds than EASY", () => {
    expect(DIFFICULTY_LEVELS.HARD.rounds).toBeGreaterThan(
      DIFFICULTY_LEVELS.EASY.rounds
    );
  });
});
