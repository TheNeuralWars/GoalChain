# OA Proposal — Issue #342

## Title
[OPENCODE] Webapp: Decompose EstadioPortal+FixturesPanel+LiveEventFeed → features/stadium (6 components + 3 hooks)

## Source
GitHub issue #342

## Objective
## Objective
Decompose EstadioPortal + FixturesPanel + LiveEventFeed into features/stadium/:

## Scope
Create `src/features/stadium/` with:

**Components:**
1. `LiveEventFeed.tsx` - Real-time event stream (goals, bets, resolves), animated entries
2. `FixturesPanel.tsx` - Upcoming/live/completed tabs, fixture cards with markets
3. `MatchCard.tsx` - Teams, score, minute, period, market ticker, bet button
4. `ScoreBug.tsx` - Large score display, possession, shots, xG
5. `EventBadge.tsx` - GOAL/BET/RESOLVE variants, neon colors, pulse animation
6. `MarketTicker.tsx` - Live odds, volume, price movement sparkline

**Hooks:**
7. `useFixtures.ts` - Fetch fixtures, filter by status, live updates
8. `useLiveEvents.ts` - WebSocket event stream, deduplication, history
9. `useMarkets.ts` - Market data per fixture, odds calculation

**Composition:**
10. `types.ts` - Fixture, LiveEvent, Market, Score, Odds
11. `constants.ts` - Event types, period labels (ENGLISH ONLY: "HT", "FT", "LIVE", "UPCOMING")
12. `index.ts` - Barrel export
13. `EstadioPortal.tsx` - Composed page component

## English-Only Enforcement
- "HALF TIME", "FULL TIME", "LIVE", "UPCOMING", "COMPLETED"
- "GOAL", "BET PLACED", "MARKET RESOLVED"
- "HOME", "AWAY", "DRAW"
- "ODDS", "VOLUME", "PRICE CHANGE"

## Acceptance Criteria
- Each file < 200 lines
- Real-time feed with smooth animations
- Fixture cards link to trading terminal
- Mobile: feed full-width, fixtures accordion

## Skill Hint
Apply frontend-design skill (no generic AI UI).

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #342
