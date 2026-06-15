/**
 * Retry and timeout utilities for resilient network/RPC calls.
 */

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableStatusCodes?: number[];
  onRetry?: (attempt: number, error: Error) => void;
}

export interface FetchTimeoutOptions {
  timeoutMs?: number;
  signal?: AbortSignal | null;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Determines if an error is retryable.
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    // Network errors (e.g., connection refused, DNS failure)
    return true;
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    // Aborted requests are not retryable (intentional cancellation)
    return false;
  }
  if (error instanceof Response) {
    return DEFAULT_RETRY_OPTIONS.retryableStatusCodes!.includes(error.status);
  }
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    return DEFAULT_RETRY_OPTIONS.retryableStatusCodes!.includes(status);
  }
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    // Retry on common network error codes
    return ['ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'ENETUNREACH', 'EAI_AGAIN'].includes(code);
  }
  return false;
}

/**
 * Sleep utility for backoff delays.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generic retry wrapper with exponential backoff and jitter.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt === opts.maxRetries) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        opts.baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
        opts.maxDelayMs
      );

      opts.onRetry?.(attempt + 1, error instanceof Error ? error : new Error(String(error)));

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Fetch with timeout using AbortController.
 */
export async function fetchWithTimeout(
  url: string | URL | Request,
  options: RequestInit & FetchTimeoutOptions = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // If an external signal is provided, abort when it aborts
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Creates a fetch function with default timeout.
 */
export function createFetchWithDefaultTimeout(defaultTimeoutMs: number = DEFAULT_TIMEOUT_MS) {
  return (url: string | URL | Request, options: RequestInit = {}) =>
    fetchWithTimeout(url, { ...options, timeoutMs: defaultTimeoutMs });
}

/**
 * Retry wrapper specifically for Solana RPC calls.
 */
export async function retryRpcCall<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  return retryWithBackoff(fn, {
    ...DEFAULT_RETRY_OPTIONS,
    maxRetries: 3,
    baseDelayMs: 500,
    maxDelayMs: 5000,
    ...options,
  });
}

/**
 * Retry wrapper specifically for sendAndConfirmTransaction.
 */
export async function retrySendAndConfirm<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  return retryWithBackoff(fn, {
    ...DEFAULT_RETRY_OPTIONS,
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    ...options,
  });
}