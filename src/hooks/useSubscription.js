import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * Hook to check the current user's subscription plan from Supabase.
 * Returns { plan, isLoading, isPremium, isFamily, refetch }
 */
export default function useSubscription() {
  const { user } = useCurrentUser();
  const [plan, setPlan] = useState('free');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlan = async () => {
    if (!user?.email) {
      setPlan('free');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_email', user.email)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        // Table may not exist yet — log warning and fall back to free plan
        console.warn('[useSubscription] Could not query subscriptions table:', error.message);
        setPlan('free');
        return;
      }
      setPlan(data?.plan || 'free');
    } catch (err) {
      console.warn('[useSubscription] Unexpected error, defaulting to free plan:', err);
      setPlan('free');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [user?.email]);

  return {
    plan,
    isLoading,
    isPremium: plan === 'premium' || plan === 'family',
    isFamily: plan === 'family',
    isFree: plan === 'free',
    refetch: fetchPlan,
  };
}
