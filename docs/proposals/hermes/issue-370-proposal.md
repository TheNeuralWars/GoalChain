# OA Proposal — Issue #370

## Title
[OPENCODE] [OPENCODE] Webapp: Decompose EstadioPortal+FixturesPanel+LiveEventFeed -> features/stadium (9 components + 5 hooks)

## Source
GitHub issue #370

## Objective
## Objective
## Objective
Decompose EstadioPortal.tsx (63 lines) + FixturesPanel.tsx (333 lines) + LiveEventFeed.tsx (107 lines) into modular stadium feature.

## Scope
Create goalchain_webapp/src/features/estadio-portal/:

### Components (Estadio Portal):
1. EstadioHeader.tsx — Badge "ESTADIO PORTAL", title "El Corazón del Juego", subtitle
2. EstadioTabs.tsx — 3 tabs: Fixtures (Partidos y Apuestas), Commentator (Cronista IA), Feed (Eventos en Vivo)
3. MatchTabs.tsx — Lazy-loaded panels for each tab

### Components (Fixtures Panel):
4. FixtureCard.tsx — Single fixture: teams, status, pools, user bet display
5. BetForm.tsx — Amount input, A/Draw/B buttons, submitting state
6. ClaimRefundActions.tsx — Claim winnings, Refund bet buttons
7. ToastContainer.tsx — Fixed bottom-right toast stack (success/error/warn)

### Components (Live Feed):
8. FeedHeader.tsx — Title "On-Chain Live Feed (Helius)", pulse dot
9. EventList.tsx — Event items with type badge (GOAL/BET/RESOLVE), message, time

### Hooks:
1. useFixtures.ts — fetchFixtures, refresh interval, error handling
2. useUserBets.ts — fetchUserBets for wallet
3. useFixtureActions.ts — placeBet, claimPayout, refundBet (goalchainClient)
4. useOnChainFeed.ts — fetchFixtures -> transform to events, 15s interval
5. useTabState.ts — activeSubTab (fixtures/commentator/feed)

### Shared:
- src/features/estadio-portal/types.ts — Fixture, UserBet, Event, TabConfig
- src/features/estadio-portal/index.ts — Barrel export

### Migration:
- Original 3 files -> thin wrappers
- Spanish strings -> i18n keys (errors, toasts, empty states, tab labels)
- Inline styles -> design tokens
- Lazy loading preserved

## Acceptance Criteria

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #370
