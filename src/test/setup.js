import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock fetch globally to prevent jsdom/undici errors in Node 22+
// This catches any leaked network requests from Base44 SDK initialization
const mockFetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers(),
  })
);
vi.stubGlobal('fetch', mockFetch);

// Suppress unhandled rejections from undici in jsdom environment
// (Known Node 22+ compat issue: UND_ERR_INVALID_ARG)
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('UND_ERR_INVALID_ARG')
  ) {
    return; // suppress known jsdom/undici noise
  }
  originalConsoleError.call(console, ...args);
};
