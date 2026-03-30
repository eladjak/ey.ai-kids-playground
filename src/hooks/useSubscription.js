import { useRef } from 'react';
import { useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * Hook to check the current user's subscription plan from Supabase.
 * Uses React Query for caching & stale-while-revalidate.
 *
 * Returns { plan, isLoading, isPremium, isFamily, isFree, isLite, refetch }
 */
export default function useSubscription() {
  const { user } = useCurrentUser();
  const email = user?.email;

  // Use global QueryClient when available; fall back for test environments.
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

  const { data: plan = 'free', isPending, refetch } = useQuery(
    {
      queryKey: ['subscription', email],
      queryFn: async () => {
        if (!email) return 'free';

        const { data, error } = await supabase
          .from('subscriptions')
          .select('plan, status')
          .eq('user_email', email)
          .eq('status', 'active')
          .maybeSingle();

        if (error) {
          // Table may not exist yet — fall back to free plan
          if (import.meta.env.DEV) {
            console.warn('[useSubscription] Could not query subscriptions table:', error.message);
          }
          return 'free';
        }
        return data?.plan || 'free';
      },
      enabled: !!email,
      staleTime: 5 * 60 * 1000,   // 5 minutes — subscription rarely changes mid-session
      gcTime: 10 * 60 * 1000,     // 10 minutes garbage collection
      retry: false,
      placeholderData: 'free',
    },
    queryClient,
  );

  return {
    plan,
    isLoading: isPending,
    isLite: plan === 'lite',
    isPremium: plan === 'premium' || plan === 'family',
    isFamily: plan === 'family',
    isFree: plan === 'free',
    refetch,
  };
}
