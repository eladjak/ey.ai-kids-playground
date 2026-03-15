/**
 * Analytics wrapper for Umami (cookieless, COPPA-safe).
 *
 * Umami is loaded via a script tag in index.html and exposes
 * `window.umami` when ready. This module wraps that global so the
 * rest of the codebase never touches `window.umami` directly.
 *
 * COPPA NOTE: Never send children's names or email addresses to analytics.
 * All `identifyUser` calls strip PII and only forward an anonymous user ID.
 *
 * API surface (unchanged from previous PostHog shim):
 *   trackEvent(name, properties)
 *   trackPageView(pageName)
 *   identifyUser(user)
 */

/**
 * Track a named event with optional properties.
 *
 * @param {string} name - Event name (e.g. "book_created")
 * @param {Record<string, unknown>} properties - Arbitrary properties.
 *   Do NOT include PII (email, full name, etc.).
 */
export function trackEvent(name, properties = {}) {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(name, properties);
  } else if (import.meta.env.DEV) {
    console.debug('[analytics] event:', name, properties);
  }
}

/**
 * Track a page view.
 *
 * Umami tracks page views automatically via its script tag, but this
 * function allows explicit tracking for client-side route changes.
 *
 * @param {string} pageName - Route or page name (e.g. "Library")
 */
export function trackPageView(pageName) {
  if (typeof window !== 'undefined' && window.umami) {
    // Umami's `track` can accept a URL-like page name as an event name.
    // Using a namespaced event keeps it distinct from user-triggered events.
    window.umami.track('pageview', { page: pageName });
  } else if (import.meta.env.DEV) {
    console.debug('[analytics] pageview:', pageName);
  }
}

/**
 * Associate the current user with future analytics events.
 *
 * Umami does not natively support user identification; we emit an
 * 'identify' event instead so the user-ID can be correlated server-side
 * if needed.
 *
 * COPPA: Only the anonymous user ID is forwarded — never email or name.
 *
 * @param {{ id?: string, email?: string, name?: string }} user
 */
export function identifyUser(user) {
  if (!user || !user.id) return;

  // COPPA compliance: only send the opaque user ID, never PII
  const payload = { user_id: user.id };

  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track('identify', payload);
  } else if (import.meta.env.DEV) {
    console.debug('[analytics] identify:', payload);
  }
}
