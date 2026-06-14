**GoalChain Platform — Comprehensive Code Audit Report**

**Principal Staff Engineer Review**  
**Audit Date:** 2025-04-05  
**Scope:** SDK (`goalchain-sdk`), Express REST API (`goalchain_api`), Oracle Service (`goalchain_oracle`) including priority fee estimation and vault staking mechanics.

---

### Table of Contents

1. Executive Summary
2. Architecture Consistency & Integration
3. Robustness & Error Handling
4. Transaction Optimizations & Performance Risks
5. Security & Standards Compliance
6. Actionable Recommendations Checklist
7. Appendix: Specific Code Observations

---

### 1. Executive Summary

The GoalChain platform demonstrates an ambitious on-chain sports prediction and economy system built on Solana using Anchor. The three components (SDK, API, Oracle) are conceptually aligned but exhibit **loose coupling**, inconsistent error resilience, and several production-readiness gaps in the Oracle’s transaction and automation paths.

The most critical areas requiring immediate attention are:
- Transaction execution reliability in `vault_crank.ts`
- Lack of connection pooling / retry logic
- Partial compliance with production security practices around key management and RPC calls
- Several unhandled edge cases in the economy health endpoints

Overall risk rating: **Medium-High** for mainnet deployment.

---

### 2. Architecture Consistency & Integration

**Findings**

- **SDK** (`goalchain-sdk/src/index.ts`) is intentionally minimal and correct. It exports `PROGRAM_ID`, the IDL, and a well-organized `SEEDS` constant map. This is a solid foundation.
- **API** (`goalchain_api/src/index.ts`) correctly uses a read-only `AnchorProvider` (empty signer) and re-uses the SDK’s `idl` and `PROGRAM_ID`. The economy metrics and health endpoints are self-contained and do not require write access.
- **Oracle** (`goalchain_oracle/src/index.ts`) directly instantiates `OracleService` and performs both on-chain writes and off-chain automation (video pipeline). It does not consume the SDK package; instead it duplicates some constants (e.g., `PROGRAM_ID` fallback).

**Integration Gaps**
- No shared client or transaction builder library between Oracle and API.
- Oracle hardcodes several PDAs and seeds instead of importing `SEEDS` from the SDK.
- The API’s `program.account.globalConfig.fetch` call assumes a specific account structure that may drift from the actual IDL without compile-time checks.

**Verdict:** Architecture is conceptually consistent but lacks a shared client layer, increasing maintenance burden and risk of divergence.

---

### 3. Robustness & Error Handling

**Express API Endpoints**

- File-based data loading (`ECONOMIC_CANONICAL_CONFIG.json`, `burn_tracker.json`, CSV) uses `fs.existsSync` + synchronous reads without try/catch in several paths.
- `buildEconomyMetricsPayload` can return `NaN` or `Infinity` values when `emissions7d === 0` (division by zero in `emitBurnRatio7d`).
- No rate limiting or request validation on the economy endpoints.
- `healthAlertState` is in-memory only — restarts lose alert history.

**Oracle Service**

- Video pipeline (`triggerVideoAlert`) implements timeout and cleanup, which is good. However, `runWithTimeout` does not propagate errors to the caller in a structured way.
- `runMatchSimulation` contains multiple sequential `await new Promise(r => setTimeout(r, ...))` calls with no cancellation token or graceful shutdown handling.
- `OracleService` (not fully shown but referenced) is assumed to handle retries; none are visible in the provided Oracle entrypoint or `vault_crank.ts`.

**Conclusion:** Error handling is defensive in the video path but insufficient in data-loading and transaction paths.

---

### 4. Transaction Optimizations & Performance Risks

**priorityFees.ts**

- Correct dual-path strategy (Helius → native `getRecentPrioritizationFees` → fallback).
- Uses 75th percentile — reasonable.
- **Risks:**
  - `fetch` call to Helius has no timeout or abort controller.
  - No caching of fee estimates (every transaction may trigger an RPC call).
  - Minimum fallback of 10,000 micro-lamports is hardcoded and may become insufficient during congestion.

**vault_crank.ts**

- Extremely complex control flow mixing dry-run/execute, dynamic imports, Jupiter swaps, and multiple fallback paths.
- On mainnet it attempts real Jupiter swaps but falls back to a trivial `SystemProgram.transfer` to the system program (effectively burning SOL instead of buying & burning GCH).
- Keypair loading logic writes to disk only in dry-run; in execute mode it can generate transient keypairs when the file is missing — dangerous on mainnet.
- No use of `getPriorityFeeInstructions` in the Jupiter path; only used in the fallback transaction.
- `sendAndConfirmTransaction` is used without custom retry logic or preflight simulation in all branches.

**Performance Risk Rating:** High for the vault crank under mainnet load.

---

### 5. Security & Standards Compliance

**English Max Law (User-facing Output)**
- All console output, error messages, and logs are in English. No Spanish strings detected. **Compliant**.

**Credential & Secret Exposure**
- No hardcoded private keys or API secrets in source.
- Reliance on environment variables is correct.
- However, `vault_crank.ts` silently generates a transient `Keypair` when the keypair file is missing and proceeds with execution logic — this is a latent security risk.

**Web3 / Solana Specific Risks**
- Use of `connection` objects without explicit resource management (acceptable in short-lived processes but risky in long-running daemons).
- No transaction simulation (`simulateTransaction`) before submission in critical paths.
- Jupiter swap path does not verify the returned transaction or use versioned transactions.
- `skipPreflight: false` is set in one place but not consistently.

**Memory / Connection Leaks**
- No evidence of unbounded connection growth in the provided code, but the Oracle daemon runs indefinitely without connection recycling.

---

### 6. Actionable Recommendations Checklist

**High Priority (Must fix before mainnet)**

- [ ] Extract a shared `@goalchain/client` package containing `OracleService`, transaction builders, and PDA helpers so both API and Oracle consume the same logic.
- [ ] Add structured retry + exponential backoff wrapper around all `sendAndConfirmTransaction` and RPC calls (use `@solana/web3.js` `sendAndConfirmTransaction` with custom `confirmTransaction` or a library such as `solana-retries`).
- [ ] Implement request timeouts and `AbortController` on all `fetch` calls (Helius priority fees, Jupiter API).
- [ ] Replace the current vault crank mainnet execution path with a proper Jupiter swap + token burn instruction using the official SDK. Remove the `SystemProgram.transfer` fallback to the system program.
- [ ] Add input validation and sanitization on all Express endpoints (especially economy snapshot ingestion).
- [ ] Store `healthAlertState` in Redis or a persistent store instead of in-memory.

**Medium Priority**

- [ ] Add compute unit and priority fee caching (5–15 second TTL) in `priorityFees.ts`.
- [ ] Enforce minimum priority fee floor via environment variable instead of hardcoded 10,000 micro-lamports.
- [ ] Add transaction simulation (`simulateTransaction`) before every mainnet submission.
- [ ] Introduce graceful shutdown handlers (`SIGTERM`/`SIGINT`) in the Oracle daemon.
- [ ] Add unit tests for `parseCsv`, `num`, `buildEconomyMetricsPayload`, and `computeMintGateFromRows`.

**Low Priority / Polish**

- [ ] Standardize logging with a structured logger (pino/winston) instead of `console.log`.
- [ ] Add Prometheus/OpenTelemetry metrics for economy health checks and transaction success rates.
- [ ] Document all environment variables in a `.env.example` file with descriptions and safe defaults.

---

### 7. Appendix: Specific Code Observations

- `vault_crank.ts:217` — Fallback mint resolution to WSOL on failure is dangerous and should be removed or made extremely explicit.
- `priorityFees.ts:48` — 75th percentile selection can return `undefined` if the array is empty after filtering (minor).
- `goalchain_api/src/index.ts:312` — `computeMintGateFromRows` is truncated in the provided source; ensure it handles empty `selected` arrays gracefully (already partially addressed in the visible code).

**End of Report**

This audit provides a clear, prioritized path to production readiness. All high-priority items should be resolved and re-audited before any mainnet deployment involving real value.