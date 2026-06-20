# OA Proposal — Issue #777

## Title
AI-AUDIT: Implement RPC Retries, Priority Fee Caching & Network Timeouts

## Source
GitHub issue #777

## Objective
### Goal
Make network and RPC calls highly resilient to congestion and rate limits.

### Checklist
- ✅ Implement `AbortController` and request timeouts on all `fetch` calls (Helius and Jupiter APIs).
- ✅ Add a structured retry wrapper with exponential backoff around `sendAndConfirmTransaction` and RPC calls.
- ✅ Add priority fee estimation caching (10-second TTL) inside `priorityFees.ts`.

## Implementation Summary

### 1. Created Shared Retry/Timeout Utility (`goalchain-sdk/src/utils/retry.ts`)
Exported from SDK (`goalchain-sdk/src/index.ts`) for use across all packages.

**Key exports:**
- `fetchWithTimeout(url, options, timeoutMs)` - wraps fetch with AbortController timeout
- `retryWithBackoff(fn, options)` - generic exponential backoff retry wrapper with jitter
- `retryRpcCall(fn, options)` - specialized for Solana RPC calls (3 retries, 500ms base delay, 5s max)
- `retrySendAndConfirm(fn, options)` - specialized for `sendAndConfirmTransaction` (3 retries, 1s base delay, 10s max)
- `isRetryableError(error)` - determines if error should trigger retry
- `createFetchWithDefaultTimeout(defaultTimeoutMs)` - factory for pre-configured fetch

### 2. Updated `priorityFees.ts` (`goalchain_oracle/src/priorityFees.ts`)
- **10-second TTL cache** using `Map<string, CacheEntry>` with automatic expiration
- **Helius RPC call** now uses `fetchWithTimeout` with 5-second timeout
- **Cache key** generated from sorted account keys for consistent lookups
- Added `clearPriorityFeeCache()` for testing

### 3. Updated `vault_crank.ts` (`goalchain_oracle/src/vault_crank.ts`)
- **Jupiter Quote API** call wrapped with `fetchWithTimeout` (10s timeout)
- **Jupiter Swap API** call wrapped with `fetchWithTimeout` (10s timeout)
- **`sendAndConfirmTransaction`** wrapped with `retrySendAndConfirm` (3 retries, exponential backoff)
- Added retry logging to notes for observability
- Added `@goalchain/sdk` as file dependency

### 4. Updated API Jupiter Endpoint (`goalchain_api/src/index.ts`)
- **Jupiter Quote endpoint** now uses `fetchWithTimeout` + `retryWithBackoff` (10s timeout, 3 retries)
- **All `program.account.*.fetch` RPC calls** wrapped with `retryRpcCall` (4 locations):
  - `globalConfig.fetch` (2 locations: `/api/economy/metrics` and `/api/economy/config`)
  - `builderFund.fetch` (1 location: `/api/ops/status`)
  - `builderContributorEpoch.fetch` (1 location: `/api/ops/status`)

### 5. Updated Webapp Jupiter Widget (`goalchain_webapp/src/components/JupiterQuoteWidget.tsx`)
- Added browser-compatible `fetchWithTimeout` with AbortController (10s timeout)
- Added browser-compatible `retryWithBackoff` with exponential backoff (3 retries)
- Integrated into `fetchQuote` handler with proper error handling
- Uses `useCallback` for stable function reference

## Files Modified
| File | Changes |
|------|---------|
| `goalchain-sdk/src/utils/retry.ts` | New: retry/timeout utilities |
| `goalchain-sdk/src/index.ts` | Export retry utilities |
| `goalchain_oracle/src/priorityFees.ts` | Add 10s TTL cache + fetchWithTimeout for Helius |
| `goalchain_oracle/src/vault_crank.ts` | fetchWithTimeout for Jupiter APIs + retrySendAndConfirm for transactions |
| `goalchain_oracle/package.json` | Add @goalchain/sdk file dependency |
| `goalchain_api/src/index.ts` | fetchWithTimeout + retry for Jupiter endpoint; retryRpcCall for all program.account.fetch calls |
| `goalchain_webapp/src/components/JupiterQuoteWidget.tsx` | Browser-native fetchWithTimeout + retryWithBackoff |

## Verification
All packages pass lint and build:
```bash
# SDK
cd goalchain-sdk && npm run lint && npm run build  # ✅

# Oracle
cd goalchain_oracle && npm run lint && npm run build  # ✅

# API
cd goalchain_api && npm run lint && npm run build  # ✅

# Webapp
cd goalchain_webapp && npm run build  # ✅
```

## Risk / Rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-777` and close draft PR.

## Residual Risks
1. **Cache invalidation**: Priority fee cache uses simple TTL; under rapid network changes, stale cache could return suboptimal fees. Mitigation: 10s TTL is conservative.
2. **Retry storms**: Exponential backoff with jitter prevents thundering herd, but under sustained RPC degradation, retries could add latency. Max 3 retries limits exposure.
3. **AbortController cleanup**: All timeouts properly clear `timeoutId` in `finally` blocks to prevent leaks.
4. **Type assertions**: API uses `as any` for retryRpcCall returns due to generic inference limitations in Anchor types. Runtime behavior unchanged.
5. **Webapp duplication**: Browser-compatible retry/timeout functions duplicated in widget (not shared from SDK due to Vite/Node module boundary). Consider extracting to shared webapp utility if reused.

## Next Steps
- Open draft PR against `main` with branch `exp/opencode-issue-777`
- Antigravity to review and merge after verification