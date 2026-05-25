# OA Proposal — Issue #96

## Title
[OPENCODE] FCC: Simulation badges on mock webapp surfaces

## Source
GitHub issue #96

## Objective
## Batch
FCC batch 2/5

## Objective
Mark mock/simulated UI clearly so play.goalchain.fun users are not misled.

## Allowed files
- `goalchain_webapp/src/ui/TradingTerminal.tsx`
- `goalchain_webapp/src/ui/SwarmVaults.tsx`
- `goalchain_webapp/src/ui/DashboardGrid.tsx` (X-Scout mock feed section only)
- `goalchain_webapp/src/index.css` (minimal badge styles)

## Requirements
- Apply **frontend-design** skill — visible badges: "SIMULATION" / "DEVNET MOCK" (English per public UI policy).
- TradingTerminal: reinforce existing MOCK FEED label if present.
- SwarmVaults: badge on simulated vault/logs/deposit flows.
- DashboardGrid: label mock research feed as mock/demo.

## Forbidden
- goalchain_program, goalchain_api new endpoints, on-chain wiring

## Verification
```bash
cd goalchain_webapp && npm run build
```

## Workflow
- Draft PR only; reference CLAUDE.md + META rules

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-96` and close draft PR.
