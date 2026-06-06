# OA Proposal — Issue #364

## Title
[OPENCODE] [OPENCODE] Webapp: Decompose TradingTerminal → features/trading (6 components + 4 hooks)

## Source
GitHub issue #364

## Objective
## Objective
## Objective
Decompose monolithic TradingTerminal.tsx (722 lines) into modular feature architecture.

## Scope
Create goalchain_webapp/src/features/trading/:

### Components (src/features/trading/components/):
1. **TerminalHeader.tsx** — Title, SimulationBadge, tab selector (Manual/Vibe)
2. **TerminalTabs.tsx** — Tab navigation component (reusable)
3. **PriceChart.tsx** — SVG line/area chart extracted from inline SVG
   - Props: points, activeColor, activeGlow, latestPrice, priceChange
   - Glowing dot animation, gridlines, gradient fill
4. **ManualControls.tsx** — Pair select, position (Long/Short), leverage, execute button
5. **VibeBotsPanel.tsx** — Toro/Oso bot cards with balance, PnL, toggle, status
6. **BotLogs.tsx** — Log list with timestamp, bot name, type, PnL, sentiment

### Hooks (src/features/trading/hooks/):
1. **usePriceHistory.ts** — Simulated price feed (random walk), returns priceHistory array
2. **useVibeBots.ts** — Toro/Oso state machine (enabled, balance, totalProfit, activePosition)
3. **useSentiment.ts** — Event-driven sentiment (0-100), listens to goalchain-event
4. **useBotLogs.ts** — Log management (add, clear, max 50)

### Shared:
- **src/features/trading/types.ts** — BotState, BotLog, PredictionSide, PricePoint
- **src/features/trading/constants.ts** — DEFAULT_PAIRS, LEVERAGE_OPTIONS
- **src/features/trading/index.ts** — Barrel export

### Migration:
- Original TradingTerminal.tsx → thin wrapper composing new components
- All inline styles → design token CSS classes
- Spanish strings → i18n keys (en.json)

## Acceptance Criteria
- Feature module builds independently
- Wrapper maintains identical UX
- No inline styles in new components
- All hooks testable in isolation
- Build passes
- Spanish strings removed (replaced with i18n)

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-364` and close draft PR.
