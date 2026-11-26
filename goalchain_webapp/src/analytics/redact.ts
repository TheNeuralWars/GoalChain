/**
 * PII scrubbing applied to every outgoing PostHog event (before_send).
 *
 * GoalChain never needs a full wallet address in analytics, but they leak in
 * through autocapture element text, URLs and error messages. Solana addresses
 * are base58 strings of 32–44 chars; EVM addresses are 0x + 40 hex.
 */

export const REDACTED_WALLET = '[wallet]';

const SOLANA_ADDRESS = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;
const EVM_ADDRESS = /\b0x[a-fA-F0-9]{40}\b/g;
const EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

/** Keys PostHog uses for session-replay payloads: masked at record time, too big to walk. */
const SKIP_KEYS = new Set(['$snapshot_data', '$snapshot_items']);

const MAX_DEPTH = 6;

export function redactString(value: string): string {
  if (value.length < 32 && !value.includes('@')) return value;
  return value
    .replace(EVM_ADDRESS, REDACTED_WALLET)
    .replace(SOLANA_ADDRESS, (m) => (looksLikeBase58Address(m) ? REDACTED_WALLET : m))
    .replace(EMAIL, '[email]');
}

/**
 * A pure-letter 32+ char run is almost always a word/slug, not an address.
 * Real base58 keys mix digits with upper and lower case.
 */
function looksLikeBase58Address(s: string): boolean {
  return /[0-9]/.test(s) && /[A-Z]/.test(s) && /[a-z]/.test(s);
}

/** Deep-redacts strings inside plain objects/arrays. Returns a new value. */
export function redactDeep<T>(value: T, depth = 0): T {
  if (typeof value === 'string') return redactString(value) as unknown as T;
  if (value === null || typeof value !== 'object' || depth > MAX_DEPTH) return value;
  if (Array.isArray(value)) return value.map((v) => redactDeep(v, depth + 1)) as unknown as T;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = SKIP_KEYS.has(k) ? v : redactDeep(v, depth + 1);
  }
  return out as T;
}
