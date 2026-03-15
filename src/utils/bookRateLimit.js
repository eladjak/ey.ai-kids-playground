/**
 * Client-side rate limiting for book creation.
 * Enforces parental control daily limits and tracks creation history.
 */

const DAILY_LIMIT_DEFAULT = 5;
const STORAGE_KEY = 'book_creation_log';

/**
 * Check whether the current user is allowed to create another book today.
 *
 * @param {string} userEmail - The logged-in user's email address
 * @returns {{ allowed: boolean, remaining: number, limit: number, used: number }}
 */
export function canCreateBook(userEmail) {
  if (!userEmail) {
    return { allowed: false, remaining: 0, limit: DAILY_LIMIT_DEFAULT, used: 0 };
  }

  let log = [];
  try {
    log = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    log = [];
  }

  const today = new Date().toDateString();
  const todayCreations = log.filter(
    (entry) => entry.email === userEmail && entry.date === today
  );

  // Read parental control limit
  let limit = DAILY_LIMIT_DEFAULT;
  try {
    const controls = JSON.parse(localStorage.getItem('parentalControls') || '{}');
    if (typeof controls.maxDailyBooks === 'number' && controls.maxDailyBooks > 0) {
      limit = controls.maxDailyBooks;
    }
  } catch {
    // use default
  }

  const used = todayCreations.length;
  return {
    allowed: used < limit,
    remaining: Math.max(0, limit - used),
    limit,
    used,
  };
}

/**
 * Record a successful book creation for the given user.
 * Automatically prunes entries older than 30 days.
 *
 * @param {string} userEmail - The logged-in user's email address
 */
export function recordBookCreation(userEmail) {
  if (!userEmail) return;

  let log = [];
  try {
    log = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    log = [];
  }

  log.push({
    email: userEmail,
    date: new Date().toDateString(),
    timestamp: Date.now(),
  });

  // Prune entries older than 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const cleaned = log.filter((e) => e.timestamp > thirtyDaysAgo);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Convenience alias — returns the same object as canCreateBook.
 *
 * @param {string} userEmail
 * @returns {{ allowed: boolean, remaining: number, limit: number, used: number }}
 */
export function getRemainingBooks(userEmail) {
  return canCreateBook(userEmail);
}
