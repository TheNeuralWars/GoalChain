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
/**
 * Determines if an error is retryable.
 */
export declare function isRetryableError(error: unknown): boolean;
/**
 * Generic retry wrapper with exponential backoff and jitter.
 */
export declare function retryWithBackoff<T>(fn: () => Promise<T>, options?: Partial<RetryOptions>): Promise<T>;
/**
 * Fetch with timeout using AbortController.
 */
export declare function fetchWithTimeout(url: string | URL | Request, options?: RequestInit & FetchTimeoutOptions): Promise<Response>;
/**
 * Creates a fetch function with default timeout.
 */
export declare function createFetchWithDefaultTimeout(defaultTimeoutMs?: number): (url: string | URL | Request, options?: RequestInit) => Promise<Response>;
/**
 * Retry wrapper specifically for Solana RPC calls.
 */
export declare function retryRpcCall<T>(fn: () => Promise<T>, options?: Partial<RetryOptions>): Promise<T>;
/**
 * Retry wrapper specifically for sendAndConfirmTransaction.
 */
export declare function retrySendAndConfirm<T>(fn: () => Promise<T>, options?: Partial<RetryOptions>): Promise<T>;
