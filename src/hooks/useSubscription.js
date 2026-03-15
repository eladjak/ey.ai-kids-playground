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

      if (error) throw error;
      setPlan(data?.plan || 'free');
    } catch {
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
