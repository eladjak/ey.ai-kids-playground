/**
 * useFollow — hook for following / unfollowing another user.
 *
 * Integration notes:
 *   - Mount FollowButton (src/components/social/FollowButton.jsx) on:
 *       • Profile page: to allow viewing another user's profile and following them
 *       • CommunityPost: to follow the book's author inline
 *   - After a successful follow, a "new_follower" Notification is created
 *     for the followed user (fire-and-forget).
 *
 * @param {string} targetEmail — email of the user to follow/unfollow
 * @returns {{
 *   isFollowing: boolean,
 *   followerCount: number,
 *   followingCount: number,
 *   toggleFollow: () => Promise<void>,
 *   isLoading: boolean
 * }}
 */
import { useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { Follow } from '@/entities/Follow';
import { User } from '@/entities/User';
import { Notification } from '@/entities/Notification';
import { trackEvent } from '@/lib/analytics';

export default function useFollow(targetEmail) {
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

  // Fetch current user's follow relationship to targetEmail
  const { data: followData, isPending: followPending, refetch: refetchFollow } = useQuery(
    {
      queryKey: ['follow', targetEmail],
      queryFn: async () => {
        if (!targetEmail) return { existingFollow: null, followerCount: 0, followingCount: 0 };
        const user = await User.me();
        if (!user?.email) return { existingFollow: null, followerCount: 0, followingCount: 0 };

        // Run all three queries in parallel for efficiency
        const [myFollows, followers, following] = await Promise.all([
          // Does the current user already follow targetEmail?
          Follow.filter({ follower_email: user.email, following_email: targetEmail }),
          // How many people follow targetEmail?
          Follow.filter({ following_email: targetEmail }),
          // How many people does targetEmail follow?
          Follow.filter({ follower_email: targetEmail }),
        ]);

        return {
          currentUserEmail: user.email,
          existingFollow: myFollows.length > 0 ? myFollows[0] : null,
          followerCount: followers.length,
          followingCount: following.length,
        };
      },
      enabled: !!targetEmail,
      staleTime: 30 * 1000, // 30 seconds
      retry: false,
    },
    queryClient
  );

  const { mutateAsync: doToggle, isPending: mutating } = useMutation(
    {
      mutationFn: async () => {
        if (!targetEmail) return;

        const user = await User.me();
        if (!user?.email) throw new Error('Authentication required');

        const existingFollow = followData?.existingFollow;

        if (existingFollow) {
          // Unfollow: delete the existing record
          await Follow.delete(existingFollow.id);
        } else {
          // Follow: create new record
          await Follow.create({
            follower_email: user.email,
            following_email: targetEmail,
            created_date: new Date().toISOString(),
          });

          // Notify the followed user (fire-and-forget)
          Notification.create({
            user_email: targetEmail,
            type: 'new_follower',
            title: 'You have a new follower!',
            message: `${user.full_name || 'Someone'} started following you`,
            link: '/Profile',
            read: false,
          }).catch(() => {}); // never let notification failure block the follow action
        }
      },
      onSuccess: () => {
        // Invalidate so the query refetches fresh counts + relationship
        queryClient.invalidateQueries({ queryKey: ['follow', targetEmail] });
        refetchFollow();
      },
    },
    queryClient
  );

  const toggleFollow = useCallback(async () => {
    await doToggle();
    trackEvent('follow_toggled', { action: followData?.existingFollow ? 'unfollow' : 'follow' });
  }, [doToggle, targetEmail, followData?.existingFollow]);

  return {
    isFollowing: !!(followData?.existingFollow),
    followerCount: followData?.followerCount ?? 0,
    followingCount: followData?.followingCount ?? 0,
    toggleFollow,
    isLoading: followPending || mutating,
  };
}

export { useFollow };
