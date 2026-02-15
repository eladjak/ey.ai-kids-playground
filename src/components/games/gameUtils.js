/**
 * Shared utilities for educational mini-games.
 * Handles scoring, sound effect placeholders, confetti, and game state management.
 */

// ---- Sound Effects (Placeholders) ----
// These functions are stubs that log to the game event system.
// Replace with actual audio playback when sound assets are available.

const SOUND_EFFECTS = {
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  levelUp: "/sounds/level-up.mp3",
  gameStart: "/sounds/game-start.mp3",
  gameOver: "/sounds/game-over.mp3",
  click: "/sounds/click.mp3",
  star: "/sounds/star.mp3",
};

/**
 * Play a sound effect (placeholder - no-op until audio files are added).
 * @param {"correct"|"wrong"|"levelUp"|"gameStart"|"gameOver"|"click"|"star"} soundName
 */
export function playSound(soundName) {
  // Placeholder: when real sound files exist at the paths above,
  // uncomment the following:
  //
  // const audio = new Audio(SOUND_EFFECTS[soundName]);
  // audio.volume = 0.5;
  // audio.play().catch(() => {});

  // For now, dispatch a custom event so dev tools can observe sound triggers
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("game-sound", { detail: { sound: soundName } })
    );
  }
}

// ---- Scoring ----

/**
 * Calculate stars earned based on score percentage.
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total number of questions
 * @returns {1|2|3} Stars earned (always at least 1 for participation)
 */
export function calculateStars(correct, total) {
  if (total === 0) return 1;
  const pct = correct / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.6) return 2;
  return 1;
}

/**
 * Calculate XP earned from a game round.
 * @param {number} correct - Number of correct answers
 * @param {number} streakBonus - Consecutive correct answers bonus
 * @returns {number} Total XP earned
 */
export function calculateXP(correct, streakBonus = 0) {
  const baseXP = correct * 10;
  const bonus = streakBonus * 5;
  return baseXP + bonus;
}

// ---- Random Helpers ----

/**
 * Pick a random element from an array.
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Shuffle an array (Fisher-Yates) without mutating the original.
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ---- Hebrew Letters Data ----

export const HEBREW_LETTERS = [
  { letter: "א", name: "אָלֶף", transliteration: "Alef" },
  { letter: "ב", name: "בֵּית", transliteration: "Bet" },
  { letter: "ג", name: "גִּימֶל", transliteration: "Gimel" },
  { letter: "ד", name: "דָּלֶת", transliteration: "Dalet" },
  { letter: "ה", name: "הֵא", transliteration: "He" },
  { letter: "ו", name: "וָו", transliteration: "Vav" },
  { letter: "ז", name: "זַיִן", transliteration: "Zayin" },
  { letter: "ח", name: "חֵית", transliteration: "Chet" },
  { letter: "ט", name: "טֵית", transliteration: "Tet" },
  { letter: "י", name: "יוֹד", transliteration: "Yod" },
  { letter: "כ", name: "כַּף", transliteration: "Kaf" },
  { letter: "ל", name: "לָמֶד", transliteration: "Lamed" },
  { letter: "מ", name: "מֵם", transliteration: "Mem" },
  { letter: "נ", name: "נוּן", transliteration: "Nun" },
  { letter: "ס", name: "סָמֶך", transliteration: "Samekh" },
  { letter: "ע", name: "עַיִן", transliteration: "Ayin" },
  { letter: "פ", name: "פֵּא", transliteration: "Pe" },
  { letter: "צ", name: "צָדִי", transliteration: "Tsadi" },
  { letter: "ק", name: "קוֹף", transliteration: "Qof" },
  { letter: "ר", name: "רֵישׁ", transliteration: "Resh" },
  { letter: "ש", name: "שִׁין", transliteration: "Shin" },
  { letter: "ת", name: "תָּו", transliteration: "Tav" },
];

// ---- Colors Data (Hebrew) ----

export const COLORS_DATA = [
  { name: "אדום", hex: "#EF4444", english: "Red" },
  { name: "כחול", hex: "#3B82F6", english: "Blue" },
  { name: "ירוק", hex: "#22C55E", english: "Green" },
  { name: "צהוב", hex: "#EAB308", english: "Yellow" },
  { name: "כתום", hex: "#F97316", english: "Orange" },
  { name: "סגול", hex: "#A855F7", english: "Purple" },
  { name: "ורוד", hex: "#EC4899", english: "Pink" },
  { name: "חום", hex: "#92400E", english: "Brown" },
  { name: "שחור", hex: "#1F2937", english: "Black" },
  { name: "לבן", hex: "#F9FAFB", english: "White" },
  { name: "תכלת", hex: "#06B6D4", english: "Cyan" },
  { name: "זהב", hex: "#D97706", english: "Gold" },
];

// ---- Game State Constants ----

export const GAME_PHASES = {
  MENU: "menu",
  PLAYING: "playing",
  RESULT: "result",
};

export const DIFFICULTY_LEVELS = {
  EASY: { label: "קל", value: "easy", rounds: 5, timeLimit: 0 },
  MEDIUM: { label: "בינוני", value: "medium", rounds: 8, timeLimit: 15 },
  HARD: { label: "מאתגר", value: "hard", rounds: 10, timeLimit: 10 },
};
