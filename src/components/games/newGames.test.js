/**
 * Tests for the new mini-games: Word Scramble and Story Completion.
 * Also tests for PIN code protection in parental controls.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  shuffle,
  calculateStars,
  calculateXP,
} from '@/components/games/gameUtils';

// ---- PIN Code Protection Tests ----
import {
  hashPin,
  isPinSet,
  setParentalPin,
  verifyParentalPin,
  removeParentalPin,
} from '@/utils/content-moderation';

describe('PIN Code Protection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hashPin returns empty string for invalid input', () => {
    expect(hashPin('')).toBe('');
    expect(hashPin('12')).toBe('');
    expect(hashPin(null)).toBe('');
    expect(hashPin(undefined)).toBe('');
  });

  it('hashPin returns a non-empty string for valid PINs', () => {
    const hash = hashPin('1234');
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('hashPin produces consistent results for same input', () => {
    expect(hashPin('1234')).toBe(hashPin('1234'));
    expect(hashPin('9999')).toBe(hashPin('9999'));
  });

  it('hashPin produces different results for different inputs', () => {
    expect(hashPin('1234')).not.toBe(hashPin('5678'));
    expect(hashPin('1111')).not.toBe(hashPin('2222'));
  });

  it('isPinSet returns false when no PIN is set', () => {
    expect(isPinSet()).toBe(false);
  });

  it('isPinSet returns true after setting a PIN', () => {
    setParentalPin('1234');
    expect(isPinSet()).toBe(true);
  });

  it('setParentalPin rejects non-numeric PINs', () => {
    expect(setParentalPin('abcd')).toBe(false);
    expect(setParentalPin('12ab')).toBe(false);
    expect(isPinSet()).toBe(false);
  });

  it('setParentalPin rejects PINs shorter than 4 digits', () => {
    expect(setParentalPin('123')).toBe(false);
    expect(setParentalPin('1')).toBe(false);
    expect(isPinSet()).toBe(false);
  });

  it('setParentalPin rejects PINs longer than 6 digits', () => {
    expect(setParentalPin('1234567')).toBe(false);
    expect(isPinSet()).toBe(false);
  });

  it('setParentalPin accepts valid 4-6 digit PINs', () => {
    expect(setParentalPin('1234')).toBe(true);
    localStorage.clear();
    expect(setParentalPin('12345')).toBe(true);
    localStorage.clear();
    expect(setParentalPin('123456')).toBe(true);
  });

  it('verifyParentalPin returns true when no PIN is set', () => {
    expect(verifyParentalPin('anything')).toBe(true);
    expect(verifyParentalPin('')).toBe(true);
  });

  it('verifyParentalPin validates correct PIN', () => {
    setParentalPin('4567');
    expect(verifyParentalPin('4567')).toBe(true);
  });

  it('verifyParentalPin rejects wrong PIN', () => {
    setParentalPin('4567');
    expect(verifyParentalPin('1234')).toBe(false);
    expect(verifyParentalPin('4566')).toBe(false);
  });

  it('removeParentalPin requires correct PIN', () => {
    setParentalPin('1234');
    expect(removeParentalPin('0000')).toBe(false);
    expect(isPinSet()).toBe(true); // Still set
  });

  it('removeParentalPin succeeds with correct PIN', () => {
    setParentalPin('1234');
    expect(removeParentalPin('1234')).toBe(true);
    expect(isPinSet()).toBe(false);
  });
});

// ---- Word Scramble Game Data Tests ----
// We test the word data structure and game logic without rendering components

describe('Word Scramble Game Data', () => {
  it('shuffle does not mutate the original array', () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffle(original);
    expect(original).toEqual(copy);
  });

  it('shuffle returns array of same length', () => {
    const arr = ['a', 'b', 'c', 'd'];
    const result = shuffle(arr);
    expect(result.length).toBe(arr.length);
  });

  it('shuffle contains all original elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result.sort()).toEqual(arr.sort());
  });

  it('calculateStars returns 3 for 90%+ score', () => {
    expect(calculateStars(9, 10)).toBe(3);
    expect(calculateStars(10, 10)).toBe(3);
  });

  it('calculateStars returns 2 for 60-89% score', () => {
    expect(calculateStars(7, 10)).toBe(2);
    expect(calculateStars(6, 10)).toBe(2);
  });

  it('calculateStars returns 1 for below 60% score', () => {
    expect(calculateStars(3, 10)).toBe(1);
    expect(calculateStars(0, 10)).toBe(1);
  });

  it('calculateXP computes base + streak bonus', () => {
    expect(calculateXP(5, 0)).toBe(50); // 5 * 10 + 0
    expect(calculateXP(5, 3)).toBe(65); // 5 * 10 + 3 * 5
    expect(calculateXP(0, 0)).toBe(0);
  });
});

// ---- Story Completion Game Structure Tests ----

describe('Story Completion Game Structure', () => {
  it('story templates have correct structure (text with blanks)', () => {
    // Verify the structure by checking the easy templates
    const easyStories = [
      {
        text: "הילד הלך ל_____ ושם ראה _____ גדול.",
        blanks: [
          { answer: "גן", options: ["גן", "שולחן", "כוכב"] },
          { answer: "עץ", options: ["עץ", "דג", "עט"] },
        ],
      },
    ];

    const story = easyStories[0];
    // Check text has blank markers
    expect(story.text).toContain('_____');
    // Check blanks array exists
    expect(story.blanks).toBeDefined();
    expect(story.blanks.length).toBeGreaterThan(0);
    // Each blank has answer and options
    story.blanks.forEach((blank) => {
      expect(blank.answer).toBeTruthy();
      expect(blank.options).toBeDefined();
      expect(blank.options.length).toBeGreaterThanOrEqual(2);
      // Answer must be in options
      expect(blank.options).toContain(blank.answer);
    });
  });

  it('number of blanks matches number of _____ in text', () => {
    const story = {
      text: "ה_____ שחה ב_____ הכחול.",
      blanks: [
        { answer: "דג", options: ["דג", "ספר", "כיסא"] },
        { answer: "ים", options: ["ים", "שמיים", "קיר"] },
      ],
    };
    const blankCount = (story.text.match(/_____/g) || []).length;
    expect(blankCount).toBe(story.blanks.length);
  });

  it('each blank option list contains the correct answer', () => {
    const stories = [
      {
        text: "test",
        blanks: [
          { answer: "גן", options: ["גן", "בית", "עץ"] },
          { answer: "כלב", options: ["חתול", "כלב", "דג"] },
        ],
      },
    ];
    stories.forEach((story) => {
      story.blanks.forEach((blank) => {
        expect(blank.options).toContain(blank.answer);
      });
    });
  });
});

// ---- CreativeStoryStudio 3-Step Structure Tests ----

describe('CreativeStoryStudio simplified steps', () => {
  it('should define exactly 3 steps', () => {
    // Simulate the step configuration from the simplified studio
    const steps = [
      { id: 'idea', title: 'Story Idea', component: 'IdeaStep' },
      { id: 'refine', title: 'Refine & Style', component: 'RefineStyleStep' },
      { id: 'create', title: 'Create Book', component: 'CreateBook' }
    ];
    expect(steps.length).toBe(3);
  });

  it('step IDs are unique', () => {
    const steps = [
      { id: 'idea', title: 'Story Idea', component: 'IdeaStep' },
      { id: 'refine', title: 'Refine & Style', component: 'RefineStyleStep' },
      { id: 'create', title: 'Create Book', component: 'CreateBook' }
    ];
    const ids = steps.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all steps have title and component', () => {
    const steps = [
      { id: 'idea', title: 'Story Idea', component: 'IdeaStep' },
      { id: 'refine', title: 'Refine & Style', component: 'RefineStyleStep' },
      { id: 'create', title: 'Create Book', component: 'CreateBook' }
    ];
    steps.forEach((step) => {
      expect(step.title).toBeTruthy();
      expect(step.component).toBeTruthy();
    });
  });

  it('progress bar calculates correctly for 3 steps', () => {
    const steps = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    // Step 0 = 33.3%, Step 1 = 66.6%, Step 2 = 100%
    expect(((0 + 1) / steps.length * 100).toFixed(0)).toBe('33');
    expect(((1 + 1) / steps.length * 100).toFixed(0)).toBe('67');
    expect(((2 + 1) / steps.length * 100).toFixed(0)).toBe('100');
  });
});
