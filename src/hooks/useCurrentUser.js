import { useAuth } from '@/lib/AuthContext';

/**
 * Hook to get the current authenticated user data.
 * Wraps useAuth() to provide a consistent API for components.
 *
 * @returns {{ user: Object|null, isLoading: boolean, error: string|null, refresh: Function }}
 */
export function useCurrentUser() {
  const { user, isLoadingAuth } = useAuth();

  return {
    user: user ?? null,
    isLoading: isLoadingAuth,
    error: null,
    refresh: () => Promise.resolve(),
  };
}

export default useCurrentUser;
