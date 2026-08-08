/**
 * One place where "which language?" is decided.
 *
 * Written 2026-08-09 after a Hebrew reader was served an English book. That was
 * not one bad line — it was a shape. Across this app several modules each
 * answered "which language?" on their own, from different inputs, with
 * different fallbacks, and nothing forced them to agree:
 *
 *   i18nProvider.getInitialLanguage()  localStorage -> 'english'
 *   seo.js updateMeta()/resetMeta()    localStorage -> 'hebrew'
 *   ErrorBoundary.render()             localStorage -> 'hebrew'
 *   BookWizard / BookCreation /        profile -> localStorage -> 'english'
 *   StoryIdeas                         (the UI language never consulted)
 *
 * The defaults disagree, and on a first visit localStorage is deliberately
 * empty — i18nProvider does not write it until the reader confirms a choice.
 * So for every first-time visitor each of these modules guessed separately.
 *
 * Two distinct questions live here, and conflating them is what caused the
 * original bug:
 *
 *   DISPLAY language  — what the reader is reading right now (chrome, meta
 *                       tags, an error screen). Follows the browser.
 *   CONTENT language  — what the AI writes the book in. Follows an explicit
 *                       preference first, and only then what they are reading.
 *
 * They are usually equal, and a caller must still be able to hold them apart:
 * writing an English book while reading a Hebrew UI is a supported thing to
 * want. The rule is that each caller states which one it means.
 */

export const SUPPORTED_LANGUAGES = ['english', 'hebrew', 'yiddish'];

/** Canonical name -> BCP-47-ish code used for `lang`/`dir` and `Intl`. */
export const LANGUAGE_CODES = {
  english: 'en',
  hebrew: 'he',
  yiddish: 'yi',
};

export const RTL_LANGUAGES = ['hebrew', 'yiddish'];

/** The last-resort answer when nothing at all is known. */
export const DEFAULT_LANGUAGE = 'english';

/**
 * Accept a value only if it is a language this app actually has translations
 * for. Anything else — undefined, '', 'fr', a typo, a number — becomes null so
 * that a `||` chain moves on to the next source instead of propagating junk.
 *
 * @param {unknown} value
 * @returns {string|null}
 */
export function normalizeLanguage(value) {
  if (typeof value !== 'string') return null;
  const candidate = value.trim().toLowerCase();
  return SUPPORTED_LANGUAGES.includes(candidate) ? candidate : null;
}

/**
 * Map a browser language tag (`navigator.language`) onto a supported language.
 * Mirrors i18nProvider.detectBrowserLanguage so the two cannot drift.
 *
 * @param {string} [navigatorLanguage]
 * @returns {string|null} null when the browser asks for something we lack
 */
export function detectLanguageFromBrowser(navigatorLanguage) {
  if (typeof navigatorLanguage !== 'string') return null;
  const tag = navigatorLanguage.trim().toLowerCase();
  // Yiddish is checked first: 'yi' and 'he' are distinct prefixes, but being
  // explicit about order keeps this readable as the list grows.
  if (tag.startsWith('yi')) return 'yiddish';
  if (tag.startsWith('he') || tag.startsWith('iw')) return 'hebrew'; // 'iw' is the legacy Hebrew tag
  if (tag.startsWith('en')) return 'english';
  return null;
}

/**
 * DISPLAY language — what the reader is currently reading.
 *
 * Order: an explicit saved choice, then what their browser asks for, then
 * English. This is i18nProvider's own order, expressed once so that modules
 * outside React (seo.js, ErrorBoundary) reach the same answer instead of
 * defaulting to Hebrew on their own.
 *
 * @param {object} [sources]
 * @param {string} [sources.storedLanguage]     localStorage 'language'
 * @param {string} [sources.navigatorLanguage]  navigator.language
 * @returns {string} always a supported language
 */
export function resolveDisplayLanguage({ storedLanguage, navigatorLanguage } = {}) {
  return (
    normalizeLanguage(storedLanguage) ||
    detectLanguageFromBrowser(navigatorLanguage) ||
    DEFAULT_LANGUAGE
  );
}

/**
 * Read the display language straight from the browser. For callers that have
 * no React context to draw on. Safe where `localStorage` throws (SSR, tests,
 * hardened privacy modes) — it falls through rather than taking the page down.
 *
 * @returns {string}
 */
export function readDisplayLanguageFromEnvironment() {
  let storedLanguage;
  try {
    storedLanguage =
      typeof localStorage !== 'undefined' ? localStorage.getItem('language') : undefined;
  } catch {
    storedLanguage = undefined;
  }

  const navigatorLanguage =
    typeof navigator !== 'undefined' ? navigator.language || navigator.userLanguage : undefined;

  return resolveDisplayLanguage({ storedLanguage, navigatorLanguage });
}

/**
 * CONTENT language — what the AI writes the book in.
 *
 * Order: the saved profile preference, then localStorage, then the language
 * they are actually reading, then English. An explicit preference still wins,
 * so deliberately writing in another language keeps working; the change is
 * that "no preference" now means "the language in front of them" rather than
 * "English".
 *
 * @param {object} [sources]
 * @param {string} [sources.profileLanguage]  the user's saved profile language
 * @param {string} [sources.storedLanguage]   localStorage 'language'
 * @param {string} [sources.uiLanguage]       the language currently rendered
 * @returns {string} always a supported language
 */
export function resolveContentLanguage({ profileLanguage, storedLanguage, uiLanguage } = {}) {
  return (
    normalizeLanguage(profileLanguage) ||
    normalizeLanguage(storedLanguage) ||
    normalizeLanguage(uiLanguage) ||
    DEFAULT_LANGUAGE
  );
}

/**
 * Pick a topic card's label in a NAMED language rather than in whatever the UI
 * happens to be showing.
 *
 * This exists because of the sentence that gave the whole bug away:
 *
 *   A story about קסמים who discovers a secret library under the sea
 *
 * The frame and the twist were chosen by the book's content language; the
 * topic label came from the UI translation function. Two sources, one
 * sentence, and they disagreed. Any string that will be handed to the AI has
 * to be built entirely in the content language.
 *
 * @param {object} topic  a TOPIC_CARDS entry carrying `en` / `he` / `yi`
 * @param {string} language  canonical content language
 * @returns {string}
 */
export function topicLabelIn(topic, language) {
  if (!topic) return '';
  const resolved = normalizeLanguage(language) || DEFAULT_LANGUAGE;
  const code = LANGUAGE_CODES[resolved];
  return topic[code] || topic.en || '';
}

/**
 * @param {string} language
 * @returns {boolean}
 */
export function isRTLLanguage(language) {
  return RTL_LANGUAGES.includes(normalizeLanguage(language) || DEFAULT_LANGUAGE);
}
