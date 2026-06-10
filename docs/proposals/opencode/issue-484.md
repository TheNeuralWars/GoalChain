# Issue #484: [OPENCODE] [IMPL] #364 TradingTerminal → features/trading (6 comps + 4 hooks)

## Source
Local queue (autonomous FIFO mode)

## Objective
## Objective
## Task: Decompose TradingTerminal → features/trading (Issue #364 → PR #405)

**Priority:** P0
**Branch:** exp/opencode-issue-364
**PR Target:** #405 (already approved)
**Depends on:** #409 (shell), #331 (SDK types)

### Context
Approved with global vision: "Features Trading: 6 comps + 4 hooks = terminal de apuestas/playing que se siente nativa, no web2. Composición sobre herencia → Features trading/stadium comparten hooks/utils, no duplican lógica"

### Implementation Required
**New structure:** `goalchain_webapp/src/features/trading/`

**Components (6):**
1. **`MarketCard.tsx`** — Single market display (odds, volume, liquidity, sparkline)
2. **`BetSlip.tsx`** — Persistent slide-over panel (selected bets, stake input, potential payout, place bet CTA)
3. **`OrderBook.tsx`** — Depth chart (bids/asks, spread, mid-price, cumulative volume)
4. **`PositionManager.tsx`** — Open positions (P&L, exit options, partial close)
5. **`MarketFilters.tsx`** — Filter by sport, league, market type, time, odds range
6. **`TradingTerminal.tsx`** — Main view composing above (grid: filters + markets + orderbook + bets slip)

**Hooks (4) in `features/trading/hooks/`:**
1. **`useMarkets(filters)`** — Fetches + caches markets via SDK, real-time updates via WebSocket
2. **`useBetSlip()`** — Manages bet slip state (add/remove/update stake), persists to localStorage
3. **`useOrderBook(marketId)`** — Subscribes to order book stream, maintains local depth snapshot
4. **`usePositions()`** — Fetches user positions, calculates real-time P&L, handles exit transactions

**Shared Utils (trading + stadium):**
- `hooks/useWebSocket.ts` — Generic WebSocket hook with reconnection
- `hooks/useDebounce.ts` — Debounced values for filters/search
- `utils/format.ts` — Format odds, currency, percentages, timestamps
- `utils/calculations.ts` — Implied probability, Kelly criterion, P&L math

**Types from `@goalchain/sdk`:**
- `Market`, `OrderBookSnapshot`, `Bet`, `Position`, `OddsFormat`

### Acceptance Criteria
- [ ] All 6 components + 4 hooks created and exported
- [ ] `TradingTerminal` renders as drop-in replacement for old monolith

## Priority
P0

## Labels
status:ready,source:manager,agent:opencode,priority:P0,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-484`.
