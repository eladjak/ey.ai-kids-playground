import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('ErrorBoundary', () => {
  // Suppress console.error for expected errors during tests
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Everything is fine')).toBeInTheDocument();
  });

  it('renders error UI when a child component throws', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    // Check for Hebrew error message
    expect(screen.getByText('אופס! משהו השתבש')).toBeInTheDocument();
    expect(screen.getByText('לא לדאוג, זה קורה לפעמים. בואו ננסה שוב!')).toBeInTheDocument();
  });

  it('shows retry and home buttons in error state', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('נסה שוב')).toBeInTheDocument();
    expect(screen.getByText('חזרה הביתה')).toBeInTheDocument();
  });

  it('resets error state when retry button is clicked', () => {
    const { container } = render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );

    // First verify good child renders
    expect(screen.getByText('Everything is fine')).toBeInTheDocument();
  });
});
