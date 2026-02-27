import { useState, useEffect, useCallback } from 'react';
import { User } from '@/entities/User';

/**
 * Hook to get the current authenticated user data.
 * Caches user data in state and provides a refresh function.
 * Replaces scattered User.me() calls throughout the app.
 *
 * @returns {{ user: Object|null, isLoading: boolean, error: string|null, refresh: Function }}
 */
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = await User.me();
      setUser(userData);
    } catch (err) {
      setError(err?.message || 'Failed to load user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return { user, isLoading, error, refresh: loadUser };
}
