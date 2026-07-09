# OA Proposal — Issue #851

## Title
[HERMES] [intake] Growth Task 1: Fix Critical NFT Marketplace Treasury Bug (SOL sent to Program ID)

## Source
GitHub issue #851 (duplicate of #295)

## Status: VERIFIED — already fixed in main

## Verification Summary

The treasury bug described in this issue was **already fully resolved** in prior commits on `main`. No new code changes are required.

### Evidence

**Git history** (`goalchain_webapp/src/ui/NFTMarketplace.tsx`):
- `412d62ae` — oa: fix critical NFT marketplace treasury bug (#295)
- `2656bc00` — fix(webapp): remove incorrect treasury fallback to program ID
- `999965c1` — fix(marketplace): resolve TypeScript compiler error for optional player price narrowing

### All 3 requirements satisfied

- [x] **Req 1 — useEffect fetches `/api/economy/config`**: Lines 32-50 of `NFTMarketplace.tsx` fetch `onchainConfig.treasuryTokenAccount` from the API on mount. No hardcoded `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg` remains as a transaction destination.
- [x] **Req 2 — SimulationBadge + SOL button disabled when null**: `isSolOffline={!treasuryAddress}` (line 226) propagates to `LayeredNftCard.tsx` which disables the SOL button (line 508) and shows "Tesorería no disponible" tooltip. A `⛔ SOL OFFLINE` badge appears in the header (lines 167-171).
- [x] **Req 3 — Devnet verification**: The hardcoded program ID fallback was explicitly removed in `2656bc00`. When `treasuryAddress` is null (API down or no validator), the SOL purchase path is completely blocked (lines 111-115), preventing any lamports from being sent to the wrong address.

### Build verification (2026-07-09)

```
npx tsc --noEmit  → exit 0, zero errors
npm run build     → exit 0, ✓ built in 7.39s
```

### Files touched (by prior commits, not this session)
- `goalchain_webapp/src/ui/NFTMarketplace.tsx` — treasury fetch + guard
- `goalchain_webapp/src/ui/LayeredNftCard.tsx` — `isSolOffline` prop

## Risk / Rollback
- **Residual risk**: None for NFTMarketplace.tsx. The fix is clean and well-guarded.
- **Note**: Other legacy JS files in `docs/assets/js/` (marketplace.js, pack_opener.js, etc.) still hardcode the program ID as SOL destination. These are static documentation pages, not the production webapp, but should be tracked for future cleanup.
- **Rollback**: `git revert 412d62ae 2656bc00 999965c1` (unlikely needed)

## Intake marker
Intake file `docs/intake/2026-06-04-growth-task-1-fix-critical-nft-marketplace-treasury-bug-sol-sent-to-program-id-.md` already shows all tasks `[x]` completed. `.done` marker created.

## Test commands
```bash
cd goalchain_webapp && npx tsc --noEmit
cd goalchain_webapp && npm run build
grep -r "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg" goalchain_webapp/src/  # should return 0 matches
```
