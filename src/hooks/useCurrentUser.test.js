import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";

// Mock AuthContext — useCurrentUser now wraps useAuth()
const mockAuthValue = {
  user: { email: "test@test.com", full_name: "Test User" },
  isLoadingAuth: false,
  isAuthenticated: true,
  navigateToLogin: vi.fn(),
  logout: vi.fn(),
  checkAppState: vi.fn(),
};

vi.mock("@/lib/AuthContext", () => ({
  useAuth: vi.fn(() => mockAuthValue),
  AuthProvider: ({ children }) => children,
  FallbackAuthProvider: ({ children }) => children,
}));

import { useCurrentUser } from "./useCurrentUser";
import { useAuth } from "@/lib/AuthContext";

describe("useCurrentUser hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(mockAuthValue);
  });

  it("returns user data from auth context", () => {
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current.user).toBeTruthy();
    expect(result.current.user.email).toBe("test@test.com");
    expect(result.current.user.full_name).toBe("Test User");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("returns null user when not authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...mockAuthValue,
      user: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useCurrentUser());
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("returns loading state when auth is loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...mockAuthValue,
      isLoadingAuth: true,
    });

    const { result } = renderHook(() => useCurrentUser());
    expect(result.current.isLoading).toBe(true);
  });

  it("has a refresh function", () => {
    const { result } = renderHook(() => useCurrentUser());
    expect(typeof result.current.refresh).toBe("function");
  });
});
