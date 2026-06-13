# OA Proposal — Issue #735

## Title
[P0] Webapp: Decompose EstadioPortal+FixturesPanel+LiveEventFeed → features/estadio-portal (9 components + 5 hooks)

## Source
GitHub issue #735

## Objective
## P0 — Webapp Architecture: Decompose EstadioPortal + FixturesPanel + LiveEventFeed → features/estadio-portal

**Objective:** Break 3 monolithic components (1,103 lines total) into modular feature architecture with 9 components + 5 hooks + types barrel.

**Current state:**
- `EstadioPortal.tsx` (63 lines) — thin wrapper
- `FixturesPanel.tsx` (333 lines) — fixture cards, bet forms, claim/refund actions
- `LiveEventFeed.tsx` (107 lines) — on-chain event polling

**Target structure:**
```
goalchain_webapp/src/features/estadio-portal/
├── components/
│   ├── EstadioHeader.tsx       # Badge, title, subtitle
│   ├── EstadioTabs.tsx         # 3 tabs: Fixtures/Commentator/Feed
│   ├── MatchTabs.tsx           # Lazy-loaded panels
│   ├── FixtureCard.tsx         # Single fixture: teams, status, pools, user bet
│   ├── BetForm.tsx             # Amount, A/Draw/B buttons, submitting state
│   ├── ClaimRefundActions.tsx  # Claim winnings, Refund bet
│   ├── ToastContainer.tsx      # Fixed bottom-right toast stack
│   ├── FeedHeader.tsx          # "On-Chain Live Feed", pulse dot
│   └── EventList.tsx           # Event items with type badge (GOAL/BET/RESOLVE)
├── hooks/
│   ├── useFixtures.ts          # fetchFixtures, refresh interval, errors
│   ├── useUserBets.ts          # fetchUserBets for wallet
│   ├── useFixtureActions.ts    # placeBet, claimPayout, refundBet
│   ├── useOnChainFeed.ts       # fetchFixtures → transform, 15s interval
│   └── useTabState.ts          # activeSubTab state
├── types.ts                    # Fixture, UserBet, Event, TabConfig
└── index.ts                    # Barrel export
```

**Migration:**
- Original 3 files → thin wrappers importing from feature
- Spanish strings → i18n keys (errors, toasts, empty states, tab labels)
- Inline styles → design tokens
- Lazy loading preserved

**Acceptance criteria:**
- Feature module builds independently

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-735` and close draft PR.
