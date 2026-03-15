import { useRef, useState, useEffect } from 'react';
import { useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import { Book } from '@/entities/Book';
import { Page } from '@/entities/Page';

/**
 * Hook to load a book and its pages with React Query caching.
 * Provides automatic deduplication, stale-while-revalidate, and background refresh.
 *
 * @param {string} bookId - The book ID to load
 * @returns {{ book: Object|null, pages: Array, isLoading: boolean, error: string|null, refresh: Function }}
 */
export function useBook(bookId) {
  // Use the global QueryClient from the provider when available;
  // fall back to a per-instance client for test environments.
  const fallbackRef = useRef(null);
  let queryClient;
  try {
    queryClient = useQueryClient();
  } catch {
    if (!fallbackRef.current) {
      fallbackRef.current = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    }
    queryClient = fallbackRef.current;
  }

  const { data, isPending, error: rqError, refetch } = useQuery(
    {
      queryKey: ['book', bookId],
      queryFn: async () => {
        const [bookData, pagesData] = await Promise.all([
          Book.get(bookId),
          Page.filter({ book_id: bookId }, 'page_number'),
        ]);
        return { book: bookData, pages: pagesData };
      },
      enabled: !!bookId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      retry: false,
    },
    queryClient
  );

  // Local error string, kept in sync with React Query's error via useEffect
  // so that act()-wrapped calls can observe error changes synchronously.
  const [error, setError] = useState(null);
  useEffect(() => {
    setError(rqError ? (rqError.message || 'Failed to load book') : null);
  }, [rqError]);

  return {
    book: data?.book ?? null,
    pages: data?.pages ?? [],
    isLoading: !!bookId && isPending,
    error,
    refresh: refetch,
  };
}

export default useBook;
