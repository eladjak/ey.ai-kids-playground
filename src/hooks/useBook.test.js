import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock secureEntity to pass through in tests
vi.mock("@/lib/secureEntity", () => ({
  createSecureEntity: (entity) => entity,
}));

vi.mock("@/entities/Book", () => ({
  Book: {
    get: vi.fn().mockResolvedValue({ id: "book-1", title: "Test Book" }),
  },
}));

vi.mock("@/entities/Page", () => ({
  Page: {
    filter: vi.fn().mockResolvedValue([
      { id: "page-1", page_number: 1, text: "Page 1" },
      { id: "page-2", page_number: 2, text: "Page 2" },
    ]),
  },
}));

import { useBook } from "./useBook";
import { Book } from "@/entities/Book";
import { Page } from "@/entities/Page";

describe("useBook hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Book.get).mockResolvedValue({ id: "book-1", title: "Test Book" });
    vi.mocked(Page.filter).mockResolvedValue([
      { id: "page-1", page_number: 1, text: "Page 1" },
      { id: "page-2", page_number: 2, text: "Page 2" },
    ]);
  });

  it("returns initial loading state when bookId is provided", () => {
    const { result } = renderHook(() => useBook("book-1"));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.book).toBeNull();
    expect(result.current.pages).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it("returns book and pages after successful load", async () => {
    const { result } = renderHook(() => useBook("book-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.book).toBeTruthy();
    expect(result.current.book.id).toBe("book-1");
    expect(result.current.book.title).toBe("Test Book");
    expect(result.current.pages).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("handles error when book load fails", async () => {
    vi.mocked(Book.get).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useBook("book-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Network error");
    expect(result.current.book).toBeNull();
  });

  it("returns empty state when no bookId is provided", () => {
    const { result } = renderHook(() => useBook(null));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.book).toBeNull();
    expect(result.current.pages).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it("pages are loaded with correct book_id filter", async () => {
    const { result } = renderHook(() => useBook("book-42"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(Page.filter).toHaveBeenCalledWith({ book_id: "book-42" }, "page_number");
  });

  it("loading state is false after error", async () => {
    vi.mocked(Book.get).mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHook(() => useBook("book-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it("refresh function triggers reload", async () => {
    const { result } = renderHook(() => useBook("book-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const callCountBefore = vi.mocked(Book.get).mock.calls.length;

    await act(async () => {
      await result.current.refresh();
    });

    expect(vi.mocked(Book.get).mock.calls.length).toBeGreaterThan(callCountBefore);
  });
});
