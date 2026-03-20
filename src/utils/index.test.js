import { describe, it, expect } from 'vitest';
import { createPageUrl } from './index.ts';

describe('createPageUrl', () => {
  it('maps Home to root path', () => {
    expect(createPageUrl('Home')).toBe('/');
  });

  it('replaces spaces with hyphens preserving case', () => {
    expect(createPageUrl('Story Ideas')).toBe('/Story-Ideas');
  });

  it('handles multiple spaces', () => {
    expect(createPageUrl('My Book View')).toBe('/My-Book-View');
  });

  it('handles already lowercase names', () => {
    expect(createPageUrl('library')).toBe('/library');
  });

  it('adds leading slash', () => {
    const result = createPageUrl('characters');
    expect(result.startsWith('/')).toBe(true);
  });
});
