# OA Proposal: Issue #12 — [OPENCODE] [P0] #412 EconomyConfigBanner reads wrong fields from /api/economy/config

**Worker:** kappa (partition 9)
**Owner:** opencode
**Priority:** P0
**Mode:** Normal mode: committed locally to branch, validated and merged locally by reviewer.

## Issue Body
# [OPENCODE] [P0] #412 EconomyConfigBanner reads wrong fields from /api/economy/config

## Priority: P0 (webapp bug blocking correct UI)
## Labels: agent:opencode, priority:P0, area:webapp, status:ready

## Problem
The `EconomyConfigBanner` component in the webapp reads incorrect fields from the `/api/economy/config` endpoint, showing stale/wrong data.

## Current State
- API endpoint: `/api/economy/config` returns canonical config from `docs/ECONOMIC_CANONICAL_CONFIG.json`
- Component: Likely in `goalchain_webapp/src/features/` or `components/`
- Fields returned vs fields expected are misaligned

## Required Fix
1. **Find** the `EconomyConfigBanner` component
2. **Check** the actual API response shape from `/api/economy/config`
3. **Fix** the field mapping in the component to match actual response
4. **Verify** the banner displays correct values (mint/burn ratios, vault crank params, priority fees, etc.)

## Files to Check/Modify
- `goalchain_webapp/src/**/EconomyConfigBanner.tsx` (or similar)
- `goalchain_api/src/routes/economy.ts` — confirm response shape
- `docs/ECONOMIC_CANONICAL_CONFIG.json` — canonical source

## Verification Commands
```bash
# Check API response
curl http://localhost:3001/api/economy/config | jq .

# Run webapp typecheck
cd goalchain_webapp && npm run typecheck 2>&1
```

## Acceptance Criteria
- EconomyConfigBanner displays correct live values from API
- No TypeScript errors in webapp
- Fields match `ECONOMIC_CANONICAL_CONFIG.json` canonical config

## Notes
- This is a read-only UI fix — no backend changes needed unless API shape is wrong
- Use SDK types where possible (`goalchain-sdk` types)
