import { describe, it, expect } from 'vitest';
import { createPageUrl } from './index.ts';

describe('createPageUrl', () => {
  it('converts page name to lowercase URL path', () => {
    expect(createPageUrl('Home')).toBe('/home');
  });

  it('replaces spaces with hyphens', () => {
    expect(createPageUrl('Story Ideas')).toBe('/story-ideas');
  });

  it('handles multiple spaces', () => {
    expect(createPageUrl('My Book View')).toBe('/my-book-view');
  });

  it('handles already lowercase names', () => {
    expect(createPageUrl('library')).toBe('/library');
  });

  it('adds leading slash', () => {
    const result = createPageUrl('characters');
    expect(result.startsWith('/')).toBe(true);
  });
});
