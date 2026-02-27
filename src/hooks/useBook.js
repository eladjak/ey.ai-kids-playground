import { useState, useEffect } from 'react';
import { Book } from '@/entities/Book';
import { Page } from '@/entities/Page';

/**
 * Hook to load a book and its pages with caching.
 *
 * @param {string} bookId - The book ID to load
 * @returns {{ book: Object|null, pages: Array, isLoading: boolean, error: string|null, refresh: Function }}
 */
export function useBook(bookId) {
  const [book, setBook] = useState(null);
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(!!bookId);
  const [error, setError] = useState(null);

  const loadBook = async () => {
    if (!bookId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [bookData, pagesData] = await Promise.all([
        Book.get(bookId),
        Page.filter({ book_id: bookId }, 'page_number'),
      ]);
      setBook(bookData);
      setPages(pagesData);
    } catch (err) {
      setError(err?.message || 'Failed to load book');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBook();
  }, [bookId]);

  return { book, pages, isLoading, error, refresh: loadBook };
}
