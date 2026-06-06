# OA Proposal — Issue #336

## Title
[OPENCODE] Webapp: Decompose TradingTerminal → features/trading (6 components + 4 hooks)

## Source
GitHub issue #336

## Objective
## Objective
Decompose the 722-line TradingTerminal monolith into features/trading/:

## Scope
Create `src/features/trading/` with:

**Components:**
1. `PriceChart.tsx` - SVG real-time chart with gradient area, glowing dot, gridlines, trend indicator
2. `OrderPanel.tsx` - Pair select, position (Long/Short), leverage slider, execute button
3. `VibeBotsPanel.tsx` - Toro/Oso bot cards, enable toggles, balance, total profit, sentiment gauge
4. `BotLogs.tsx` - Transaction log table (type, pair, price, leverage, PnL, sentiment, timestamp)
5. `MarketSelector.tsx` - Reusable pair dropdown with oracle price preview
6. `PositionCard.tsx` - Active position display: entry, current, unrealized PnL, TP/SL levels

**Hooks:**
7. `usePriceFeed.ts` - Price history state, real-time updates, trend calculation, SVG point mapping
8. `useVibeBots.ts` - Toro/Oso state machines, open/close logic, sentiment integration
9. `useOrders.ts` - Manual order execution, validation, toast feedback
10. `useMarketData.ts` - Pair metadata, oracle prices, 24h change

**Composition:**
11. `types.ts` - BotState, BotLog, MarketPair, Position, PricePoint
12. `constants.ts` - Default pairs, leverage limits, TP/SL percentages (ENGLISH ONLY)
13. `index.ts` - Barrel export
14. `TradingTerminal.tsx` - Composed page component assembling all above

## English-Only Enforcement
- All UI strings in constants.ts in English
- Speculate

## Owner
opencode

## Priority
P0

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Required output

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #336
