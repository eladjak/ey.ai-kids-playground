import { describe, it, expect } from 'vitest';
import {
  normalizeLanguage,
  detectLanguageFromBrowser,
  resolveDisplayLanguage,
  resolveContentLanguage,
  topicLabelIn,
  isRTLLanguage,
} from './languageResolution';

/**
 * Every block below pairs the new behaviour with the exact expression it
 * replaced, run on the same input. A test that only exercises the new code
 * cannot tell you whether the old code was already fine.
 */

// ---------------------------------------------------------------------------
// The old expressions, copied verbatim from the files they came from, so the
// "before" arm is the real thing and not a paraphrase of it.
// ---------------------------------------------------------------------------

/** src/lib/seo.js:128 and :183, src/components/ErrorBoundary.jsx:53 */
const OLD_displayLanguage = (storedLanguage) => storedLanguage || 'hebrew';

/** src/pages/BookCreation.jsx:70 */
const OLD_bookCreationLanguage = (storedLanguage) => storedLanguage || 'english';

/** src/pages/StoryIdeas.jsx:93 — and BookWizard.jsx before the 9.8 fix */
const OLD_storyIdeasLanguage = (profileLanguage, storedLanguage) =>
  profileLanguage || storedLanguage || 'english';

/** src/components/wizard/TopicStep.jsx:234 — label chosen by the UI, not content */
const OLD_topicLabel = (topic, uiTranslate) => uiTranslate('topicNames.' + topic.id) || topic.en;

describe('normalizeLanguage', () => {
  it('accepts the three supported languages', () => {
    expect(normalizeLanguage('hebrew')).toBe('hebrew');
    expect(normalizeLanguage('english')).toBe('english');
    expect(normalizeLanguage('yiddish')).toBe('yiddish');
  });

  it('rejects unsupported or malformed values so a || chain moves on', () => {
    expect(normalizeLanguage('french')).toBeNull();
    expect(normalizeLanguage('')).toBeNull();
    expect(normalizeLanguage(undefined)).toBeNull();
    expect(normalizeLanguage(null)).toBeNull();
    expect(normalizeLanguage(42)).toBeNull();
  });

  it('tolerates casing and stray whitespace from stored values', () => {
    expect(normalizeLanguage(' Hebrew ')).toBe('hebrew');
  });

  it('BOTH ARMS: a junk stored value used to be trusted verbatim', () => {
    // The old chains were bare `||`, so any truthy string survived — including
    // one with no translations behind it, which then failed downstream.
    expect(OLD_bookCreationLanguage('klingon')).toBe('klingon');
    expect(resolveContentLanguage({ storedLanguage: 'klingon' })).toBe('english');
  });
});

describe('detectLanguageFromBrowser', () => {
  it('maps browser tags onto supported languages', () => {
    expect(detectLanguageFromBrowser('he-IL')).toBe('hebrew');
    expect(detectLanguageFromBrowser('en-US')).toBe('english');
    expect(detectLanguageFromBrowser('yi')).toBe('yiddish');
  });

  it('handles the legacy Hebrew tag "iw" that older browsers still send', () => {
    expect(detectLanguageFromBrowser('iw-IL')).toBe('hebrew');
  });

  it('returns null for languages we have no translations for', () => {
    expect(detectLanguageFromBrowser('fr-FR')).toBeNull();
    expect(detectLanguageFromBrowser(undefined)).toBeNull();
  });
});

describe('resolveDisplayLanguage — the seo.js / ErrorBoundary disagreement', () => {
  it('BOTH ARMS: an English first-time visitor used to get a Hebrew page title', () => {
    // The real first-visit state: i18nProvider deliberately does NOT write
    // localStorage until the reader confirms a choice, so it is empty here.
    const storedLanguage = null;
    const navigatorLanguage = 'en-US';

    // Before: seo.js and ErrorBoundary defaulted to Hebrew on their own, while
    // i18nProvider was rendering the UI in English. document.title and the
    // og: tags came out Hebrew for a reader seeing an English page.
    expect(OLD_displayLanguage(storedLanguage)).toBe('hebrew');

    // After: the same answer the UI reached.
    expect(resolveDisplayLanguage({ storedLanguage, navigatorLanguage })).toBe('english');
  });

  it('BOTH ARMS: agreement was luck, not design, for a Hebrew visitor', () => {
    // Same empty localStorage, different browser. Here the old default
    // happened to be right — which is why the bug survived: it was correct for
    // the most common visitor and silently wrong for everyone else.
    const storedLanguage = null;
    expect(OLD_displayLanguage(storedLanguage)).toBe('hebrew');
    expect(resolveDisplayLanguage({ storedLanguage, navigatorLanguage: 'he-IL' })).toBe('hebrew');
  });

  it('an explicit saved choice still wins over the browser', () => {
    expect(
      resolveDisplayLanguage({ storedLanguage: 'english', navigatorLanguage: 'he-IL' })
    ).toBe('english');
  });

  it('falls back to English when nothing is known at all', () => {
    expect(resolveDisplayLanguage({})).toBe('english');
    expect(resolveDisplayLanguage()).toBe('english');
  });

  it('a browser we do not translate for lands on English, not Hebrew', () => {
    expect(OLD_displayLanguage(null)).toBe('hebrew');
    expect(resolveDisplayLanguage({ navigatorLanguage: 'fr-FR' })).toBe('english');
  });
});

describe('resolveContentLanguage — the BookCreation / StoryIdeas fallback', () => {
  it('BOTH ARMS: a Hebrew reader with no preference used to get an English book', () => {
    const sources = { profileLanguage: null, storedLanguage: null, uiLanguage: 'hebrew' };

    // Before: neither page consulted the language being read.
    expect(OLD_bookCreationLanguage(sources.storedLanguage)).toBe('english');
    expect(OLD_storyIdeasLanguage(sources.profileLanguage, sources.storedLanguage)).toBe('english');

    // After.
    expect(resolveContentLanguage(sources)).toBe('hebrew');
  });

  it('an explicit English preference survives a Hebrew UI', () => {
    // The supported combination the fix must not break.
    expect(
      resolveContentLanguage({ storedLanguage: 'english', uiLanguage: 'hebrew' })
    ).toBe('english');
  });

  it('the profile preference outranks every other source', () => {
    expect(
      resolveContentLanguage({
        profileLanguage: 'yiddish',
        storedLanguage: 'english',
        uiLanguage: 'hebrew',
      })
    ).toBe('yiddish');
  });

  it('still lands on English when nothing is known', () => {
    expect(resolveContentLanguage({})).toBe('english');
    expect(resolveContentLanguage()).toBe('english');
  });
});

describe('topicLabelIn — the sentence that gave the bug away', () => {
  const magicTopic = { id: 'magic', en: 'Magic', he: 'קסמים', yi: 'כישוף' };

  // The UI translation function, standing in for useI18n().t on a Hebrew UI.
  const hebrewUiTranslate = (key) => ({ 'topicNames.magic': 'קסמים' })[key];

  it('BOTH ARMS: reproduces `A story about קסמים ...` and then fixes it', () => {
    // The reader is reading a Hebrew UI but has explicitly chosen to write the
    // BOOK in English — a combination the app supports and the 9.8 BookWizard
    // fix deliberately preserves.
    const contentLanguage = 'english';

    // Before: the label came from the UI, the frame from the content language.
    const oldLabel = OLD_topicLabel(magicTopic, hebrewUiTranslate);
    const oldSentence = `A story about ${oldLabel.toLowerCase()} who discovers a secret library under the sea`;
    expect(oldLabel).toBe('קסמים');
    expect(oldSentence).toBe(
      'A story about קסמים who discovers a secret library under the sea'
    );

    // After: the label is chosen in the same language as the frame.
    const newLabel = topicLabelIn(magicTopic, contentLanguage);
    const newSentence = `A story about ${newLabel.toLowerCase()} who discovers a secret library under the sea`;
    expect(newLabel).toBe('Magic');
    expect(newSentence).toBe(
      'A story about magic who discovers a secret library under the sea'
    );
    expect(newSentence).not.toMatch(/[֐-׿]/); // no Hebrew left in an English sentence
  });

  it('the mirror case: an English UI writing a Hebrew book stays Hebrew', () => {
    const englishUiTranslate = (key) => ({ 'topicNames.magic': 'Magic' })[key];

    // Before: a Hebrew sentence frame with an English word wedged inside it.
    const oldLabel = OLD_topicLabel(magicTopic, englishUiTranslate);
    expect(`סיפור על ${oldLabel} שמגלה ספרייה סודית מתחת לים`).toBe(
      'סיפור על Magic שמגלה ספרייה סודית מתחת לים'
    );

    // After.
    const newLabel = topicLabelIn(magicTopic, 'hebrew');
    expect(newLabel).toBe('קסמים');
    expect(`סיפור על ${newLabel} שמגלה ספרייה סודית מתחת לים`).toBe(
      'סיפור על קסמים שמגלה ספרייה סודית מתחת לים'
    );
  });

  it('falls back to the English label when a translation is missing', () => {
    expect(topicLabelIn({ id: 'x', en: 'Only English' }, 'yiddish')).toBe('Only English');
  });

  it('does not throw on a missing topic', () => {
    expect(topicLabelIn(undefined, 'hebrew')).toBe('');
  });
});

describe('isRTLLanguage', () => {
  it('classifies the three languages', () => {
    expect(isRTLLanguage('hebrew')).toBe(true);
    expect(isRTLLanguage('yiddish')).toBe(true);
    expect(isRTLLanguage('english')).toBe(false);
  });

  it('treats an unknown language as LTR rather than throwing', () => {
    expect(isRTLLanguage('klingon')).toBe(false);
  });
});
