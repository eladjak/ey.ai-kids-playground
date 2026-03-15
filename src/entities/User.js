/**
 * User entity — Clerk-backed auth bridge.
 *
 * Provides the same imperative API that the app already uses:
 *   User.me()               → returns the current authenticated user
 *   User.updateMyUserData() → persists custom fields to Clerk unsafeMetadata
 *   User.logout()           → clears local state (actual sign-out handled by Clerk)
 *
 * AuthContext calls User._setClerkUser(clerkUser) whenever the Clerk user
 * changes, keeping this module in sync without requiring React hooks.
 */

let _currentUser = null;
let _clerkUserInstance = null;

/**
 * Maps a Clerk UserResource to the flat user shape the rest of the app expects.
 * Custom fields (xp, streak_days, language, display_name, avatar_url, …) are
 * stored in Clerk's unsafeMetadata and spread onto the returned object.
 */
function mapClerkUser(clerkUser) {
  if (!clerkUser) return null;

  const meta = { ...(clerkUser.unsafeMetadata || {}) };
  // These must always come from the Clerk core user, never from metadata.
  delete meta.id;
  delete meta.email;
  delete meta.created_date;

  return {
    id: clerkUser.id,
    email:
      clerkUser.primaryEmailAddress?.emailAddress ||
      clerkUser.emailAddresses?.[0]?.emailAddress,
    full_name: clerkUser.fullName,
    name: clerkUser.fullName,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    avatar_url: clerkUser.imageUrl,
    created_date:
      clerkUser.createdAt?.toISOString?.() || new Date().toISOString(),
    // Spread custom metadata — may override avatar_url, display_name, role, etc.
    ...meta,
  };
}

export const User = {
  /**
   * Called by AuthContext when the Clerk user state changes.
   * @param {import('@clerk/clerk-react').UserResource | null} clerkUser
   */
  _setClerkUser(clerkUser) {
    _clerkUserInstance = clerkUser || null;
    _currentUser = mapClerkUser(clerkUser);
  },

  /**
   * Returns the current authenticated user.
   * Throws if the user is not signed in (same behaviour as Base44's auth.me).
   */
  async me() {
    if (!_currentUser) throw new Error('Not authenticated');
    return _currentUser;
  },

  /**
   * Persists arbitrary key/value pairs into the user's Clerk unsafeMetadata
   * and returns the updated (mapped) user object.
   */
  async updateMyUserData(data) {
    if (!_clerkUserInstance) throw new Error('Not authenticated');

    const existing = _clerkUserInstance.unsafeMetadata || {};
    const updatedUser = await _clerkUserInstance.update({
      unsafeMetadata: { ...existing, ...data },
    });

    _clerkUserInstance = updatedUser;
    _currentUser = mapClerkUser(updatedUser);
    return _currentUser;
  },

  /**
   * Clears local cached state. Actual sign-out is handled by Clerk.
   */
  logout() {
    _currentUser = null;
    _clerkUserInstance = null;
  },
};
