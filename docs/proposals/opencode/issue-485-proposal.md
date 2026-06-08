# OA Proposal — Issue #485

## Title
[OPENCODE] [IMPL] #370 EstadioPortal → features/stadium (9 comps + 5 hooks)

## Source
GitHub issue #485

## Objective
## Objective
## Task: Decompose EstadioPortal → features/stadium (Issue #370 → PR #404)

**Priority:** P0
**Branch:** exp/opencode-issue-370
**PR Target:** #404 (already approved)
**Depends on:** #409 (shell), #331 (SDK types), #405 (shared hooks/utils)

### Context
Approved with global vision: "Features Stadium: 9 comps + 5 hooks = campo de juego vivo: fixture→live→post-match en un flujo único, inmersivo. Composición sobre herencia → comparte hooks/utils con trading"

### Implementation Required
**New structure:** `goalchain_webapp/src/features/stadium/`

**Components (9):**
1. **`FixtureCard.tsx`** — Pre-match fixture (teams, time, pool size, primary markets)
2. **`LiveEventFeed.tsx`** — Real-time match events (goals, cards, subs, VAR, xG timeline)
3. **`LiveMarketCard.tsx`** — Live market with dynamic odds (sparklines, momentum indicator)
4. **`MatchTimeline.tsx`** — Visual timeline (minute markers, events, odds snapshots)
5. **`Scoreboard.tsx`** — Header: score, minute, possession, shots, xG, HT/FT status
6. **`PlayerPerformance.tsx`** — Live player stats (rating, heatmap, actions, market links)
7. **`PoolTracker.tsx`** — Pool status (total, participants, my position, projected payout)
8. **`PostMatchSummary.tsx`** — Results, settled markets, claimable winnings, highlights
9. **`EstadioPortal.tsx`** — Main view: routes to PreMatch/Live/PostMatch via PlayNav tabs

**Hooks (5) in `features/stadium/hooks/`:**
1. **`useFixture(fixtureId)`** — Fetches fixture + markets + pool, real-time updates
2. **`useLiveEvents(fixtureId)`** — WebSocket stream of match events (oracle → WebSocket)
3. **`useLiveMarkets(fixtureId)`** — Subscribes to live market odds updates
4. **`usePoolTracker(fixtureId)`** — Tracks pool state, calculates projected payouts
5. **`usePlayerPerformance(fixtureId)`** — Aggregates player stats + market values

**Shared with trading (from #405):**
- `hooks/useWebSocket.ts`
- `hooks/useDebounce.ts`
- `utils/format.ts`
- `utils/calculations.ts`

**Types from `@goalchain/sdk`:**
- `Fixture`, `LiveEvent`, `LiveMarket`, `Pool`, `PlayerStats`, `MarketSnapshot`

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-485` and close draft PR.
