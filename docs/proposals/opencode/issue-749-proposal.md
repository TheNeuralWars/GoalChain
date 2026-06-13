# OA Proposal — Issue #749

## Title
[OPENCODE] [OPENCODE] [P0] #272 Mundial 2026 — Play devnet MVP (bet + claim flow)

## Source
GitHub issue #749

## Objective
## Objective
Implement complete bet + claim flow on devnet for play.goalchain.fun:

## Scope (End-to-End)
| Layer | Tasks |
|-------|-------|
| **Program** | place_bet, resolve_market, claim_winnings instructions working on devnet |
| **Oracle** | Fixture resolution → market resolution → Jito bundle settlement (MEV-protected) |
| **Webapp** | Play page: fixture list, bet slip, claim UI, simulation badges, wallet integration |
| **SDK** | Type-safe client for all 3 instructions + PDA derivations |
| **API** | /api/fixtures/live, /api/markets/:id, /api/claims endpoints |

## Current State
- Program: Betting instructions exist (#324 done), vault crank blocked (#411 done)
- Oracle: Priority Fees v2 (#486), MEV settlement (#472), JitoSOL yield (#474) — marked done
- Webapp: Layout/shell (#363), TradingTerminal decompose (#364), EstadioPortal decompose (#370) — in progress
- SDK: Needs IDL sync (#331 blocked)

## Required Implementation
### 1. Program (devnet deployment)
- Deploy program to devnet with current IDL
- Verify place_bet, resolve_market, claim_winnings work end-to-end
- Anchor test suite passes

### 2. Oracle (devnet runner)
- Configure oracle for devnet RPC + Jito Block Engine testnet
- Run settlement cron that: resolves fixture → builds Jito bundle → submits
- Priority Fees v2 health monitoring active

### 3. Webapp (Play page)
- FixturesPanel: Live fixtures from API with bet buttons
- BetSlip: Amount input, odds display, simulation badge (devnet)
- ClaimUI: List claimable markets, one-click claim with Jito bundle
- Simulation badges: Show SIMULATION on devnet, LIVE on mainnet
- Wallet adapters: Phantom, Solflare, Backpack

### 4. SDK + API
- Sync IDL from devnet program
- Generate types, publish to local registry
- API endpoints for fixtures, markets, claims

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #749
