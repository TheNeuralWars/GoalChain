# OA Proposal — Issue #341

## Title
[OPENCODE] Webapp: Decompose DeFiPortal+SwarmVaults → features/defi (4 components + 3 hooks)

## Source
GitHub issue #341

## Objective
## Objective
Decompose DeFiPortal + SwarmVaults into features/defi/:

## Scope
Create `src/features/defi/` with:

**Components:**
1. `VaultCard.tsx` - Name, APY, TVL, strategy tags, deposit/withdraw actions, risk badge
2. `VaultGrid.tsx` - Filterable grid (Stable, Yield, Alpha), sort by APY/TVL
3. `StakePanel.tsx` - Amount input, max button, approval + stake tx, unstake cooldown
4. `YieldBreakdown.tsx` - Base yield, strategy yield, boost, fees, net APY visualization

**Hooks:**
5. `useVaults.ts` - Fetch vault data, APY calculation, TVL formatting
6. `useStaking.ts` - Stake/unstake transactions, cooldown tracking
7. `useJupiter.ts` - Quote widget integration, swap execution

**Composition:**
8. `types.ts` - Vault, Strategy, StakePosition, YieldBreakdown
9. `constants.ts` - Risk levels, strategy categories (ENGLISH ONLY)
10. `index.ts` - Barrel export
11. `DeFiPortal.tsx` - Composed page component
12. `SwarmVaults.tsx` - Legacy alias re-export

## Acceptance Criteria
- Each file < 200 lines
- JupiterQuoteWidget integrated as ui/Chart wrapper
- Real-time APY updates
- Mobile: vault cards stacked, stake panel full-width

## Skill Hint
Apply frontend-design skill (no generic AI UI).

## Owner
opencode

## Priority
P0

## Context

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #341
