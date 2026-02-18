/**
 * Child Safety Content Filter
 *
 * A standalone content filtering utility for EY.AI Kids Playground.
 * Provides keyword blocklisting, age-appropriate language checking,
 * and topic validation for children's content (ages 2-12).
 *
 * This is separate from content-moderation.js (which focuses on
 * sanitization and prompt injection). This module focuses on
 * semantic content appropriateness for different age groups.
 */

// ─── Age Groups ───────────────────────────────────────────────────────────────

export const AGE_GROUPS = {
  TODDLER: { label: "Toddler", min: 2, max: 4 },
  YOUNG_CHILD: { label: "Young Child", min: 5, max: 7 },
  CHILD: { label: "Child", min: 8, max: 10 },
  PRETEEN: { label: "Pre-teen", min: 11, max: 12 },
};

// ─── Keyword Blocklist ────────────────────────────────────────────────────────

/**
 * Words and phrases that are never appropriate in children's content
 * regardless of age group. Organized by category.
 */
const ABSOLUTE_BLOCKLIST = {
  violence: [
    "murder", "kill", "massacre", "genocide", "slaughter", "torture",
    "brutally", "decapitate", "dismember", "gore", "bloodbath",
    "assassination", "execution", "massacre",
  ],
  explicit: [
    "pornography", "explicit", "erotic", "nude", "naked body",
    "sexual", "intercourse", "adult content",
  ],
  drugs: [
    "heroin", "cocaine", "methamphetamine", "fentanyl", "marijuana",
    "overdose", "addiction", "drug dealer", "narcotics",
  ],
  profanity: [
    "fuck", "shit", "bitch", "asshole", "cunt", "bastard", "damn you",
    "go to hell", "motherfucker",
  ],
  hebrew_profanity: [
    "זונה", "מזדיין", "מניאק", "חרא", "זין", "כוסאמק", "תחת שלך",
  ],
  selfHarm: [
    "suicide", "self-harm", "cut myself", "end my life", "kill myself",
    "want to die", "take my life",
  ],
  manipulation: [
    "groom", "grooming", "predator", "lure children", "meet in secret",
    "don't tell your parents",
  ],
};

/**
 * Words/topics that are age-conditional — inappropriate for younger children
 * but may be acceptable in educational contexts for older ones.
 */
const AGE_CONDITIONAL_CONTENT = {
  // Not appropriate for toddlers/young children (under 8)
  youngChildRestricted: [
    "death", "dying", "dead animal", "war", "fighting", "violence",
    "scary monster", "nightmare", "ghost", "horror", "danger",
    "weapon", "sword fight", "battle", "blood",
  ],
  // Only appropriate for pre-teens (11+) in educational context
  preteenOnly: [
    "puberty", "growing up body", "menstruation", "reproduction",
    "teen romance", "kissing", "dating",
  ],
};

// ─── Vocabulary Complexity ────────────────────────────────────────────────────

/**
 * Words considered too complex for young readers (under age 7).
 * These aren't blocked but trigger a readability suggestion.
 */
const COMPLEX_VOCABULARY_FOR_YOUNG = [
  "philosophical", "catastrophic", "incomprehensible", "extraterrestrial",
  "juxtaposition", "metamorphosis", "disenfranchised", "ubiquitous",
  "ephemeral", "clandestine", "nefarious", "mischievous", "ambiguous",
  "contradictory", "hallucination", "melancholy", "treacherous",
  "catastrophe", "obligation", "consequence", "responsibility",
];

/**
 * Simple, age-appropriate replacement suggestions for complex words
 */
const VOCABULARY_SUGGESTIONS = {
  philosophical: "thoughtful",
  catastrophic: "very bad",
  incomprehensible: "hard to understand",
  extraterrestrial: "from outer space",
  metamorphosis: "change",
  melancholy: "sad",
  treacherous: "dangerous",
  catastrophe: "big problem",
  consequence: "what happens next",
  mischievous: "playful",
};

// ─── Appropriate Topics for Children ─────────────────────────────────────────

/**
 * Topics that are positively appropriate for children's stories.
 * Used to validate/encourage good content.
 */
export const APPROPRIATE_TOPICS = [
  "friendship", "family", "adventure", "discovery", "learning",
  "kindness", "sharing", "courage", "creativity", "nature",
  "animals", "space", "science", "art", "music", "sports",
  "helping others", "teamwork", "honesty", "imagination", "fairy tale",
  "magic", "mystery", "humor", "food", "holidays", "seasons",
  "ocean", "forest", "farm", "school", "home", "travel",
];

// ─── Core Filter Functions ────────────────────────────────────────────────────

/**
 * Check text against the absolute blocklist.
 * Returns blocked terms found regardless of age group.
 *
 * @param {string} text - Text to check
 * @returns {{ isClean: boolean, category: string|null, blockedTerms: string[] }}
 */
export function checkAbsoluteBlocklist(text) {
  if (typeof text !== "string" || text.trim() === "") {
    return { isClean: true, category: null, blockedTerms: [] };
  }

  const normalizedText = text.toLowerCase();
  const foundTerms = [];
  let firstCategory = null;

  for (const [category, terms] of Object.entries(ABSOLUTE_BLOCKLIST)) {
    for (const term of terms) {
      if (normalizedText.includes(term.toLowerCase())) {
        foundTerms.push(term);
        if (!firstCategory) {
          firstCategory = category;
        }
      }
    }
  }

  return {
    isClean: foundTerms.length === 0,
    category: firstCategory,
    blockedTerms: [...new Set(foundTerms)],
  };
}

/**
 * Check text for age-conditional content.
 * Returns warnings about content that may not be appropriate for the given age.
 *
 * @param {string} text - Text to check
 * @param {number} ageMax - Maximum age in the target age range (e.g., 7 for "5-7")
 * @returns {{ isAppropriate: boolean, warnings: string[], suggestions: string[] }}
 */
export function checkAgeConditionalContent(text, ageMax) {
  if (typeof text !== "string" || text.trim() === "") {
    return { isAppropriate: true, warnings: [], suggestions: [] };
  }

  const normalizedText = text.toLowerCase();
  const warnings = [];
  const suggestions = [];

  // Under 8: check youngChildRestricted
  if (ageMax < 8) {
    for (const term of AGE_CONDITIONAL_CONTENT.youngChildRestricted) {
      if (normalizedText.includes(term.toLowerCase())) {
        warnings.push(`"${term}" may be too intense for children under 8`);
        suggestions.push(`Consider replacing "${term}" with age-appropriate alternatives`);
      }
    }
  }

  // Under 11: preteenOnly content
  if (ageMax < 11) {
    for (const term of AGE_CONDITIONAL_CONTENT.preteenOnly) {
      if (normalizedText.includes(term.toLowerCase())) {
        warnings.push(`"${term}" is only appropriate for ages 11+`);
        suggestions.push(`Remove or simplify "${term}" for younger audiences`);
      }
    }
  }

  return {
    isAppropriate: warnings.length === 0,
    warnings,
    suggestions,
  };
}

/**
 * Check vocabulary complexity for target age group.
 * Returns suggestions for simpler words.
 *
 * @param {string} text - Text to check
 * @param {number} ageMax - Maximum age in the target age range
 * @returns {{ isSimple: boolean, complexWords: string[], suggestions: Record<string,string> }}
 */
export function checkVocabularyComplexity(text, ageMax) {
  if (typeof text !== "string" || text.trim() === "") {
    return { isSimple: true, complexWords: [], suggestions: {} };
  }

  // Only check for under 7
  if (ageMax >= 7) {
    return { isSimple: true, complexWords: [], suggestions: {} };
  }

  const normalizedText = text.toLowerCase();
  const complexWords = [];
  const suggestionMap = {};

  for (const word of COMPLEX_VOCABULARY_FOR_YOUNG) {
    if (normalizedText.includes(word.toLowerCase())) {
      complexWords.push(word);
      if (VOCABULARY_SUGGESTIONS[word]) {
        suggestionMap[word] = VOCABULARY_SUGGESTIONS[word];
      }
    }
  }

  return {
    isSimple: complexWords.length === 0,
    complexWords,
    suggestions: suggestionMap,
  };
}

/**
 * Check if a topic is appropriate for children's books.
 *
 * @param {string} topic - Topic string to check
 * @returns {{ isAppropriate: boolean, matchedTopics: string[] }}
 */
export function isTopicAppropriate(topic) {
  if (typeof topic !== "string" || topic.trim() === "") {
    return { isAppropriate: false, matchedTopics: [] };
  }

  const normalizedTopic = topic.toLowerCase();
  const matchedTopics = APPROPRIATE_TOPICS.filter((t) =>
    normalizedTopic.includes(t.toLowerCase())
  );

  // A topic is appropriate if it matches at least one approved topic
  // OR if it doesn't contain any blocked content
  const blocklistResult = checkAbsoluteBlocklist(topic);

  return {
    isAppropriate: matchedTopics.length > 0 || blocklistResult.isClean,
    matchedTopics,
  };
}

// ─── Main Filter Function ─────────────────────────────────────────────────────

/**
 * Run the full content filter pipeline on a piece of text.
 * Checks absolute blocklist, age-conditional content, and vocabulary.
 *
 * @param {string} text - The text content to filter
 * @param {number} ageMax - Max age of the target audience (e.g., 7 for "5-7 years")
 * @returns {{
 *   isAllowed: boolean,
 *   reason: string|null,
 *   blockedTerms: string[],
 *   ageWarnings: string[],
 *   vocabularySuggestions: Record<string,string>,
 *   level: "blocked"|"warning"|"clean"
 * }}
 */
export function filterContent(text, ageMax = 10) {
  // 1. Absolute blocklist check (blocks regardless of age)
  const absoluteCheck = checkAbsoluteBlocklist(text);
  if (!absoluteCheck.isClean) {
    return {
      isAllowed: false,
      reason: `Content contains inappropriate terms: ${absoluteCheck.blockedTerms.join(", ")}`,
      blockedTerms: absoluteCheck.blockedTerms,
      ageWarnings: [],
      vocabularySuggestions: {},
      level: "blocked",
    };
  }

  // 2. Age-conditional check
  const ageCheck = checkAgeConditionalContent(text, ageMax);

  // 3. Vocabulary complexity check
  const vocabCheck = checkVocabularyComplexity(text, ageMax);

  const hasWarnings = !ageCheck.isAppropriate || !vocabCheck.isSimple;

  return {
    isAllowed: true,
    reason: hasWarnings
      ? "Content is allowed but has age-appropriateness suggestions"
      : null,
    blockedTerms: [],
    ageWarnings: ageCheck.warnings,
    vocabularySuggestions: vocabCheck.suggestions,
    level: hasWarnings ? "warning" : "clean",
  };
}

/**
 * Quick check: is this content safe for children?
 * Returns true if the content passes the absolute blocklist.
 *
 * @param {string} text - Text to check
 * @returns {boolean}
 */
export function isSafeForChildren(text) {
  const result = checkAbsoluteBlocklist(text);
  return result.isClean;
}

/**
 * Get a user-friendly message for parents/educators about content.
 *
 * @param {object} filterResult - Result from filterContent()
 * @param {boolean} isRTL - Whether to use Hebrew (right-to-left) messages
 * @returns {string}
 */
export function getFilterMessage(filterResult, isRTL = false) {
  if (filterResult.level === "blocked") {
    return isRTL
      ? "תוכן זה אינו מתאים לילדים. אנא שנה את הנושא."
      : "This content is not appropriate for children. Please change the topic.";
  }

  if (filterResult.level === "warning") {
    return isRTL
      ? "התוכן עשוי להיות חזק מדי לגיל הילד. שקול להתאים."
      : "Some content may be too intense for this age group. Consider adjusting.";
  }

  return isRTL
    ? "התוכן מתאים לילדים!"
    : "Content is appropriate for children!";
}
