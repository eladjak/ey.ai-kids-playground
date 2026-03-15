/**
 * localStorage Cleanup Utility
 *
 * Prunes expired or stale data from localStorage to prevent unbounded growth.
 * Safe to call on every app startup — skips keys it doesn't own.
 */

/**
 * Remove stale auto-save entries (older than 7 days),
 * trim the error log to entries from the last 7 days,
 * and let bookRateLimit handle its own 30-day window.
 */
export function cleanupStorage() {
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  // --- Clean old autosave data (older than 7 days) ---
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('ey_autosave_')) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return;
          const data = JSON.parse(raw);
          if (data?.timestamp && now - data.timestamp > sevenDays) {
            localStorage.removeItem(key);
          }
        } catch {
          // Unparseable entry — remove it
          localStorage.removeItem(key);
        }
      }
    });
  } catch {
    // Ignore iteration errors (e.g. Safari private-mode quirks)
  }

  // --- Trim error log to last 7 days ---
  try {
    const raw = localStorage.getItem('error_log');
    if (raw) {
      const errorLog = JSON.parse(raw);
      const recent = errorLog.filter(
        (e) => typeof e.timestamp === 'number' && now - e.timestamp < sevenDays
      );
      if (recent.length !== errorLog.length) {
        localStorage.setItem('error_log', JSON.stringify(recent));
      }
    }
  } catch {
    try {
      localStorage.removeItem('error_log');
    } catch {
      // Ignore
    }
  }

  // Note: book_creation_log pruning is handled inside recordBookCreation()
  //       (entries older than 30 days are removed on each write).
}
