# OA Proposal — Issue #506

## Title
[OPENCODE] [P0] #416 Merge Mundial MVP PR — claim UI, simulation badges, oracle hooks

## Source
Local queue (autonomous mode)

## Objective
# [OPENCODE] [P0] #416 Merge Mundial MVP PR — claim UI, simulation badges, oracle hooks

## Priority: P0 (integration merge gate)
## Labels: agent:opencode, priority:P0, area:webapp, area:oracle, status:ready, mundial-mvp

## Objective
Create and merge the **Mundial MVP integration PR** that combines:
1. **Claim UI** — user-facing claim flow for settled markets
2. **Simulation badges** — devnet vs mainnet indicators across Play page
3. **Oracle hooks** — React hooks for settlement status, claimable markets, fixture resolution

## Components to Integrate
| Component | Location | Status |
|-----------|----------|--------|
| `ClaimDashboard` | `features/play/ClaimDashboard.tsx` | New |
| `SimulationBadge` | `components/ui/SimulationBadge.tsx` | New |
| `useSettlementStatus` | `hooks/oracle/useSettlementStatus.ts` | New |
| `useClaimableMarkets` | `hooks/oracle/useClaimableMarkets.ts` | New |
| `useFixtureResolution` | `hooks/oracle/useFixtureResolution.ts` | New |
| `BetSlip` updates | `features/play/BetSlip.tsx` | Update |

## Integration Points
- **SDK**: `claimWinnings`, `getClaimableMarkets`, `getMarketStatus`
- **API**: `/api/claims`, `/api/markets/:id/settlement`, `/api/fixtures/:id/resolution`
- **Oracle**: Settlement event stream (WebSocket or polling)

## Files to Create/Modify
- `goalchain_webapp/src/features/play/` — new feature folder
- `goalchain_webapp/src/hooks/oracle/` — new hooks
- `goalchain_webapp/src/components/ui/SimulationBadge.tsx`
- `goalchain_sdk/src/client/` — claim + settlement methods
- `goalchain_api/src/routes/claims.ts`, `settlement.ts`

## Verification
```bash
cd goalchain_webapp && npm run typecheck && npm run build
# Test locally with devnet oracle + program
```

## Acceptance Criteria

## Priority
P0

## Labels
status:ready,agent:opencode,priority:P0,mundial-mvp,area:oracle,area:webapp,

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft for review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-506`.
