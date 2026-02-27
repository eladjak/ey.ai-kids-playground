import { useState, useCallback } from 'react';
import { tryRequest, getRateLimitMessage } from '@/utils/rateLimiter';

/**
 * Hook that wraps AI integration calls (InvokeLLM, GenerateImage) with:
 * - Loading state management
 * - Error state management
 * - Client-side rate limiting via rateLimiter.js
 *
 * @param {Function} aiFn - The AI integration function (e.g., InvokeLLM, GenerateImage)
 * @param {Object} options
 * @param {string} options.integrationName - Name for rate limiting (default: "default")
 * @param {boolean} options.isRTL - Whether to show Hebrew error messages
 * @returns {{ execute: Function, data: any, isLoading: boolean, error: string|null, reset: Function }}
 */
export function useAICall(aiFn, { integrationName = 'default', isRTL = false } = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    // Check rate limit before calling
    const rateCheck = tryRequest(integrationName);
    if (!rateCheck.allowed) {
      const message = getRateLimitMessage(rateCheck.retryAfterMs, isRTL);
      setError(message);
      return { ok: false, error: message };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiFn(...args);
      setData(result);
      return { ok: true, data: result };
    } catch (err) {
      const message = err?.message || 'AI call failed';
      setError(message);
      return { ok: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [aiFn, integrationName, isRTL]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { execute, data, isLoading, error, reset };
}
