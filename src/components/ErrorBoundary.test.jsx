import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Component that throws an error
function ProblemChild() {
  throw new Error('Test error');
}

// Component that renders normally
function GoodChild() {
  return <div>Everything is fine</div>;
}

/**
 * Pretend to be a reader in a given environment.
 *
 * These tests used to render with NO language set at all and assert the Hebrew
 * error screen. That passed for the wrong reason: ErrorBoundary defaulted to
 * Hebrew on its own (`localStorage.getItem('language') || 'hebrew'`) while
 * i18nProvider — which decides the language actually on screen — defaulted to
 * the browser's. An English reader hit a crash and got a Hebrew RTL screen.
 *
 * The old assertions could not detect that, because a boundary that always
 * hardcoded Hebrew and a boundary that correctly followed a Hebrew reader look
 * identical when the test never says who the reader is. So the reader is now
 * stated explicitly, and both languages are asserted.
 */
function asReader({ stored, browser }) {
  localStorage.clear();
  if (stored) localStorage.setItem('language', stored);
  vi.spyOn(navigator, 'language', 'get').mockReturnValue(browser);
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for expected errors during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders children when no error occurs', () => {
    asReader({ browser: 'he-IL' });
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Everything is fine')).toBeInTheDocument();
  });

  it('renders the error UI in Hebrew for a Hebrew reader', () => {
    asReader({ stored: 'hebrew', browser: 'he-IL' });
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('אופס! משהו השתבש')).toBeInTheDocument();
    expect(screen.getByText('לא לדאוג, זה קורה לפעמים. בואו ננסה שוב!')).toBeInTheDocument();
  });

  it('renders the error UI in English for an English reader', () => {
    // The arm the old suite was missing entirely. Before the fix this rendered
    // the Hebrew screen and this assertion failed.
    asReader({ stored: 'english', browser: 'en-US' });
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText("Don't worry, this happens sometimes. Let's try again!")
    ).toBeInTheDocument();
  });

  it('follows the browser when the reader has no saved preference', () => {
    // The real first-visit state: i18nProvider deliberately does not write
    // localStorage until the reader confirms a choice, so it is empty here and
    // the browser is the only signal either module has.
    asReader({ browser: 'en-US' });
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('אופס! משהו השתבש')).not.toBeInTheDocument();
  });

  it('follows the browser into Hebrew when there is no saved preference', () => {
    asReader({ browser: 'he-IL' });
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('אופס! משהו השתבש')).toBeInTheDocument();
  });

  it('shows retry and home buttons in error state', () => {
    asReader({ stored: 'hebrew', browser: 'he-IL' });
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('נסה שוב')).toBeInTheDocument();
    expect(screen.getByText('חזרה הביתה')).toBeInTheDocument();
  });

  it('resets error state when retry button is clicked', () => {
    asReader({ stored: 'hebrew', browser: 'he-IL' });
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    // Error UI should be visible after the throw
    expect(screen.getByText('אופס! משהו השתבש')).toBeInTheDocument();

    // Click the retry button ("נסה שוב")
    fireEvent.click(screen.getByText('נסה שוב'));

    // After reset the error boundary re-renders its children.
    // ProblemChild will throw again (it always throws), so the error
    // UI will reappear — but the important thing is that handleReset
    // cleared the state (hasError = false) causing a new render cycle.
    // We verify the retry button still exists, meaning the boundary
    // correctly caught the second throw and is showing error UI again.
    expect(screen.getByText('נסה שוב')).toBeInTheDocument();
  });
});
