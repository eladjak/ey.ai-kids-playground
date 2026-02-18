/**
 * Client-side rate limiter for AI integration calls.
 * Limits to MAX_REQUESTS per WINDOW_MS (default: 5 requests per 60 seconds).
 * Shows a friendly Hebrew "please wait" message when rate limit is exceeded.
 */

const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

// Store timestamps of recent requests, keyed by integration name
const requestTimestamps = {};

/**
 * Get the rate limiter state for a given integration.
 * @param {string} integrationName - Name of the integration (e.g., "InvokeLLM", "GenerateImage")
 * @returns {{ timestamps: number[], count: number }}
 */
function getState(integrationName) {
  if (!requestTimestamps[integrationName]) {
    requestTimestamps[integrationName] = [];
  }
  return { timestamps: requestTimestamps[integrationName] };
}

/**
 * Remove expired timestamps outside the current window.
 * @param {number[]} timestamps
 * @param {number} now
 * @returns {number[]}
 */
function pruneExpired(timestamps, now) {
  return timestamps.filter((ts) => now - ts < WINDOW_MS);
}

/**
 * Check if a request is allowed under the rate limit.
 * Does NOT record the request - call recordRequest() after the check if proceeding.
 * @param {string} integrationName - Name of the integration
 * @returns {{ allowed: boolean, retryAfterMs: number, message: string, messageHe: string }}
 */
export function checkRateLimit(integrationName = "default") {
  const now = Date.now();
  const { timestamps } = getState(integrationName);
  const active = pruneExpired(timestamps, now);
  requestTimestamps[integrationName] = active;

  if (active.length >= MAX_REQUESTS) {
    const oldestInWindow = active[0];
    const retryAfterMs = WINDOW_MS - (now - oldestInWindow);
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);

    return {
      allowed: false,
      retryAfterMs,
      message: `Too many requests. Please wait ${retryAfterSec} seconds before trying again.`,
      messageHe: `יותר מדי בקשות! אנא המתינו ${retryAfterSec} שניות ונסו שוב`,
    };
  }

  return {
    allowed: true,
    retryAfterMs: 0,
    message: "",
    messageHe: "",
  };
}

/**
 * Record a request timestamp for rate limiting.
 * Call this AFTER checkRateLimit() confirms the request is allowed.
 * @param {string} integrationName - Name of the integration
 */
export function recordRequest(integrationName = "default") {
  const now = Date.now();
  const { timestamps } = getState(integrationName);
  const active = pruneExpired(timestamps, now);
  active.push(now);
  requestTimestamps[integrationName] = active;
}

/**
 * Combined check + record. Returns the rate limit result.
 * If allowed, automatically records the request.
 * @param {string} integrationName - Name of the integration
 * @returns {{ allowed: boolean, retryAfterMs: number, message: string, messageHe: string }}
 */
export function tryRequest(integrationName = "default") {
  const result = checkRateLimit(integrationName);
  if (result.allowed) {
    recordRequest(integrationName);
  }
  return result;
}

/**
 * Get the number of remaining requests in the current window.
 * @param {string} integrationName - Name of the integration
 * @returns {number}
 */
export function remainingRequests(integrationName = "default") {
  const now = Date.now();
  const { timestamps } = getState(integrationName);
  const active = pruneExpired(timestamps, now);
  return Math.max(0, MAX_REQUESTS - active.length);
}

/**
 * Reset the rate limiter for a given integration (useful for testing).
 * @param {string} integrationName - Name of the integration. If omitted, resets all.
 */
export function resetRateLimiter(integrationName) {
  if (integrationName) {
    requestTimestamps[integrationName] = [];
  } else {
    Object.keys(requestTimestamps).forEach((key) => {
      requestTimestamps[key] = [];
    });
  }
}

/**
 * Get the friendly Hebrew message for the rate limit error.
 * Designed for toast/notification display in the UI.
 * @param {number} retryAfterMs - Milliseconds until the user can retry
 * @param {boolean} isRTL - Whether to return Hebrew (true) or English (false)
 * @returns {string}
 */
export function getRateLimitMessage(retryAfterMs, isRTL = true) {
  const seconds = Math.ceil(retryAfterMs / 1000);
  if (isRTL) {
    return `יותר מדי בקשות! אנא המתינו ${seconds} שניות ונסו שוב`;
  }
  return `Too many requests. Please wait ${seconds} seconds before trying again.`;
}

// Export constants for testing
export const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS,
  WINDOW_MS,
};
