import React, { useState, useCallback } from 'react';
import { apiBaseUrl } from '../lib/opsClient';

interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  routePlan: string[];
}

interface QuoteResponse {
  success: boolean;
  quote?: JupiterQuote;
  error?: string;
}

/**
 * Fetch with timeout using AbortController (browser-compatible).
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = 10000, signal, ...fetchOptions } = options;

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
 * Retry wrapper with exponential backoff (browser-compatible).
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: { maxRetries: number; baseDelayMs: number; maxDelayMs: number } = {
    maxRetries: 3,
    baseDelayMs: 500,
    maxDelayMs: 5000,
  }
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt === options.maxRetries) {
        break;
      }

      // Only retry on network errors or timeout
      if (error instanceof Error) {
        const isTimeout = error.message.includes('timeout');
        const isNetworkError = error.message.includes('Failed to fetch') || error.message.includes('NetworkError');
        if (!isTimeout && !isNetworkError) {
          throw error;
        }
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        options.baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
        options.maxDelayMs
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export function JupiterQuoteWidget() {
  const API_BASE = apiBaseUrl();

  const [inputMint, setInputMint] = useState('So11111111111111111111111111111111111111112'); // SOL
  const [outputMint, setOutputMint] = useState('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC
  const [amount, setAmount] = useState('1000000000'); // 1 SOL
  const [slippageBps, setSlippageBps] = useState('50');

  const [quote, setQuote] = useState<JupiterQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    setError(null);
    setQuote(null);

    try {
      const res = await retryWithBackoff(
        () => fetchWithTimeout(`${API_BASE}/api/solana/jupiter/quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inputMint,
            outputMint,
            amount: Number(amount),
            slippageBps: Number(slippageBps),
          }),
          timeoutMs: 10000,
        }),
        {
          maxRetries: 3,
          baseDelayMs: 500,
          maxDelayMs: 5000,
        }
      );

      const data: QuoteResponse = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to fetch quote');
        return;
      }

      if (data.quote) {
        setQuote(data.quote);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, inputMint, outputMint, amount, slippageBps]);

  return (
    <div className="p-6 max-w-xl border rounded-xl bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Jupiter Quote (Solana)</h2>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Input Mint</label>
          <input
            type="text"
            value={inputMint}
            onChange={(e) => setInputMint(e.target.value)}
            className="w-full border px-3 py-2 rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Output Mint</label>
          <input
            type="text"
            value={outputMint}
            onChange={(e) => setOutputMint(e.target.value)}
            className="w-full border px-3 py-2 rounded-md text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border px-3 py-2 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slippage (bps)</label>
            <input
              type="text"
              value={slippageBps}
              onChange={(e) => setSlippageBps(e.target.value)}
              className="w-full border px-3 py-2 rounded-md text-sm"
            />
          </div>
        </div>

        <button
          onClick={fetchQuote}
          disabled={loading}
          className="mt-2 bg-black text-white py-2.5 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? 'Fetching quote...' : 'Get Quote'}
        </button>
      </div>

      {error && (
        <div className="text-red-600 text-sm mb-4">
          Error: {error}
        </div>
      )}

      {quote && (
        <div className="bg-neutral-50 p-4 rounded-lg text-sm">
          <h3 className="font-medium mb-2">Quote Result</h3>
          <pre className="text-xs overflow-x-auto bg-white p-3 rounded border">
            {JSON.stringify(quote, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}