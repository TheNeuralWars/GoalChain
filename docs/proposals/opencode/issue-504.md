# Issue #504: [OPENCODE] [P0] #272 Mundial 2026 — Play devnet MVP (bet + claim flow)

## Source
Local queue (autonomous FIFO mode)

## Objective
# [OPENCODE] [P0] #272 Mundial 2026 — Play devnet MVP (bet + claim flow)

## Priority: P0 (core MVP deliverable)
## Labels: agent:opencode, priority:P0, area:webapp, area:oracle, area:program, status:ready, mundial-mvp

## Objective
Implement complete **bet + claim flow on devnet** for `play.goalchain.fun`:
1. User connects wallet (Phantom/Solflare)
2. User places bet on a live fixture (devnet)
3. Oracle resolves fixture → triggers settlement
4. User claims winnings
5. All transactions use Priority Fees v2 + Jito bundle failover

## Scope (End-to-End)
| Layer | Tasks |
|-------|-------|
| **Program** | `place_bet`, `resolve_market`, `claim_winnings` instructions working on devnet |
| **Oracle** | Fixture resolution → market resolution → Jito bundle settlement (MEV-protected) |
| **Webapp** | Play page: fixture list, bet slip, claim UI, simulation badges, wallet integration |
| **SDK** | Type-safe client for all 3 instructions + PDA derivations |
| **API** | `/api/fixtures/live`, `/api/markets/:id`, `/api/claims` endpoints |

## Current State
- Program: Betting instructions exist (#324 done), vault crank blocked (#411 done)
- Oracle: Priority Fees v2 (#486), MEV settlement (#472), JitoSOL yield (#474) — marked done
- Webapp: Layout/shell (#363), TradingTerminal decompose (#364), EstadioPortal decompose (#370) — in progress
- SDK: Needs IDL sync (#331 blocked)

## Required Implementation
### 1. Program (devnet deployment)
- Deploy program to devnet with current IDL
- Verify `place_bet`, `resolve_market`, `claim_winnings` work end-to-end
- Anchor test suite passes (#502)

### 2. Oracle (devnet runner)
- Configure oracle for devnet RPC + Jito Block Engine testnet
- Run settlement cron that: resolves fixture → builds Jito bundle → submits
- Priority Fees v2 health monitoring active

### 3. Webapp (Play page)

## Priority
P0

## Labels
status:ready,agent:opencode,priority:P0,mundial-mvp,area:oracle,area:webapp,area:program,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-504`.
