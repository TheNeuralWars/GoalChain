# Issue #508: [OPENCODE] [P0] #364 TradingTerminal → features/trading (6 comps + 4 hooks)

## Source
Local queue (autonomous FIFO mode)

## Objective
# [OPENCODE] [P0] #364 TradingTerminal → features/trading (6 comps + 4 hooks)

## Priority: P0 (webapp refactor for DeFi trading)
## Labels: agent:opencode, priority:P0, area:webapp, status:ready

## Objective
Decompose monolithic `TradingTerminal` into modular `features/trading/` architecture for SwarmVaults, betting, and DeFi operations.

## Target Architecture
```
goalchain_webapp/src/features/trading/
├── components/
│   ├── TradingTerminal.tsx        # Main entry (replaces TradingTerminal)
│   ├── VaultCard.tsx              # SwarmVault display + APY
│   ├── BetSlip.tsx                # Bet builder + submission
│   ├── PortfolioPanel.tsx         # User positions + P&L
│   ├── MarketSelector.tsx         # Market/market-type picker
│   └── TxStatusBanner.tsx         # Simulation/live badge + tx link
├── hooks/
│   ├── useVaults.ts               # Fetch vaults + TVL/APY
│   ├── useBetSlip.ts              # Bet state + validation
│   ├── usePortfolio.ts            # User positions from SDK
│   └── useMarketData.ts           # Live odds + liquidity
├── types.ts                       # Vault, Bet, Position, Market types
└── index.ts
```

## Files to Create/Modify
- New: All files under `features/trading/`
- Delete: Legacy `TradingTerminal.tsx`
- Update: `features/defi/` imports, `DashboardGrid`, routing

## Acceptance Criteria
- 6 components + 4 hooks created and typed
- Legacy component removed
- Trading page works (visual parity)
- Components reusable, Storybook stories
- TypeScript strict + lint pass

## Priority
P0

## Labels
status:ready,agent:opencode,priority:P0,area:webapp,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-508`.
