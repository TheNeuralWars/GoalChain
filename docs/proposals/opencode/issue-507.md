# Issue #507: [OPENCODE] [P0] #370 EstadioPortal → features/stadium (9 comps + 5 hooks)

## Source
Local queue (autonomous FIFO mode)

## Objective
# [OPENCODE] [P0] #370 EstadioPortal → features/stadium (9 components + 5 hooks)

## Priority: P0 (webapp refactor for stadium feature)
## Labels: agent:opencode, priority:P0, area:webapp, status:ready

## Objective
Decompose monolithic `EstadioPortal` + `FixturesPanel` + `LiveEventFeed` into modular `features/stadium/` architecture.

## Current State
- Legacy components in `goalchain_webapp/src/components/` or `pages/`
- Tightly coupled, hard to test, duplicate logic

## Target Architecture
```
goalchain_webapp/src/features/stadium/
├── components/
│   ├── StadiumPortal.tsx          # Main entry (replaces EstadioPortal)
│   ├── FixturesPanel.tsx          # Fixture list + filters
│   ├── LiveEventFeed.tsx          # Real-time match events
│   ├── MatchCard.tsx              # Individual fixture card
│   ├── EventTimeline.tsx          # Goal/card/var timeline
│   ├── OddsDisplay.tsx            # Live odds from oracle
│   ├── StadiumHeader.tsx          # League/date navigation
│   ├── EmptyState.tsx             # No fixtures state
│   └── LoadingSkeleton.tsx        # Loading states
├── hooks/
│   ├── useFixtures.ts             # Fetch + filter fixtures
│   ├── useLiveEvents.ts           # WebSocket/polling for events
│   ├── useOdds.ts                 # Live odds from oracle
│   ├── useFixtureResolution.ts    # Resolution status
│   └── useStadiumFilters.ts       # Filter state management
├── types.ts                       # Shared types (Fixture, Event, Odds)
└── index.ts                       # Public exports
```

## Files to Create/Modify
- New: All files under `features/stadium/`
- Delete: Legacy `EstadioPortal.tsx`, `FixturesPanel.tsx`, `LiveEventFeed.tsx`
- Update: Imports in `AppShell`, `DashboardGrid`, routing

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
- Rollback: revert branch `exp/opencode-issue-507`.
