# EstadioPortal → features/stadium Decomposition (Issue #507)

**Date:** 2026-06-10
**Priority:** P0
**Owner:** opencode (FCC)
**GitHub Issue:** #507 ([OPENCODE] [P0] #370 EstadioPortal → features/stadium (9 comps + 5 hooks))
**Labels:** agent:opencode, priority:P0, area:webapp, status:ready

---

## Objective

Implement the modular `features/stadium/` architecture as specified in GitHub Issue #507. Decompose the monolithic `EstadioPortal` + `FixturesPanel` + `LiveEventFeed` (currently in `goalchain_webapp/src/ui/`) into a clean feature-based architecture with 9 components + 5 hooks + shared types.

---

## Current State (Legacy Files to Replace)

| File | Lines | Description |
|------|-------|-------------|
| `goalchain_webapp/src/ui/EstadioPortal.tsx` | 58 | Main entry with 3 tabs (fixtures/commentator/feed) |
| `goalchain_webapp/src/ui/FixturesPanel.tsx` | 418 | Fixture list, filters, betting UI, toasts, claim/refund |
| `goalchain_webapp/src/ui/LiveEventFeed.tsx` | 141 | On-chain event feed + oracle log stream |
| `goalchain_webapp/src/ui/App.tsx` | lines 13, 68, 130 | Imports `EstadioPortal` for `/estadio` route |

---

## Target Architecture (Create All New)

```
goalchain_webapp/src/features/stadium/
├── components/
│   ├── StadiumPortal.tsx          # Main entry (replaces EstadioPortal)
│   ├── FixturesPanel.tsx          # Fixture list + filters (extracted from legacy)
│   ├── LiveEventFeed.tsx          # Real-time match events (extracted from legacy)
│   ├── MatchCard.tsx              # Individual fixture card (from FixturesPanel internals)
│   ├── EventTimeline.tsx          # Goal/card/VAR timeline (new - from LiveEventFeed events)
│   ├── OddsDisplay.tsx            # Live odds from oracle (new - placeholder for oracle integration)
│   ├── StadiumHeader.tsx          # League/date navigation (from EstadioPortal header)
│   ├── EmptyState.tsx             # No fixtures state (new)
│   └── LoadingSkeleton.tsx        # Loading states (new)
├── hooks/
│   ├── useFixtures.ts             # Fetch + filter fixtures (from FixturesPanel logic)
│   ├── useLiveEvents.ts           # WebSocket/polling for events (from LiveEventFeed logic)
│   ├── useOdds.ts                 # Live odds from oracle (new - mock for now)
│   ├── useFixtureResolution.ts    # Resolution status (new)
│   └── useStadiumFilters.ts       # Filter state management (from FixturesPanel)
├── types.ts                       # Shared types (Fixture, Event, Odds, Bet, FilterState)
└── index.ts                       # Public exports
```

---

## Detailed Implementation Requirements

### 1. Types (`types.ts`)

- Export `FixtureView`, `UserBetView`, `FixtureStatus`, `PredictionSide` from `goalchainClient` (re-export)
- Define new types:
  - `Event` (id, type: `'GOAL'|'BET'|'RESOLVE'|'CARD'|'VAR'|'SUB'`, message, timestamp, fixtureId)
  - `Odds` (fixtureId, homeOdds, drawOdds, awayOdds, lastUpdated)
  - `FilterState` (group: string, status: string[], search: string)
  - `StadiumTab` type: `'fixtures' | 'commentator' | 'feed'`

### 2. Hooks (each in its own file, fully typed)

**`useFixtures.ts`**
- Encapsulate `fetchFixtures` + `fetchUserBets` logic from FixturesPanel
- Return: `{ fixtures, userBets, loading, error, refresh }`
- Accept `connection` and `wallet` as params (from wallet adapter context)

**`useLiveEvents.ts`**
- Poll `fetchFixtures` every 15s (same as LiveEventFeed)
- Transform fixtures → `Event[]` with proper typing
- Support WebSocket upgrade later (future-proof interface)
- Return: `{ events, loading, error }`

**`useOdds.ts`**
- Mock implementation for now (returns static odds per fixture)
- Interface ready for oracle integration
- Return: `{ odds: Record<string, Odds>, loading }`

**`useFixtureResolution.ts`**
- Track fixture resolution status (pending/confirmed/failed)
- Subscribe to on-chain changes (polling for now)

**`useStadiumFilters.ts`**
- Manage filter state: group, status array, search query
- Provide `filteredFixtures(fixtures)` selector
- Persist to localStorage (optional)

### 3. Components (fully typed, i18n-ready, glassmorphic/UI consistent)

**`StadiumPortal.tsx`** — Main entry
- Replaces `EstadioPortal`
- Three tabs: Fixtures / Commentator / Feed
- Uses `StadiumHeader`, `FixturesPanel`, `LiveEventFeed`, `AICommentator` (existing)
- State: `activeTab` (from `useStadiumFilters` or local state)

**`StadiumHeader.tsx`**
- Extract header from `EstadioPortal`: badge, title, subtitle, tabs navigation
- Glassmorphic styling (match existing `portal-header glass-card`, `portal-tabs`)
- Props: `activeTab`, `onTabChange`, `tabs` array

**`FixturesPanel.tsx`** — Refactored from legacy
- Use `useFixtures`, `useStadiumFilters`
- Render `MatchCard` for each fixture
- Filter bar (group tabs) delegated to `useStadiumFilters`
- Toast system extracted to separate hook or kept internal

**`MatchCard.tsx`** — Individual fixture card
- Extract from `FixturesPanel` lines 254-392
- Props: `fixture`, `userBet`, `onBet`, `onClaim`, `onRefund`, `expanded`, `onToggleExpand`, `submittingFor`
- All betting logic (amount input, buttons) here

**`LiveEventFeed.tsx`** — Refactored from legacy
- Use `useLiveEvents`, `useOdds`
- Display events + Oracle Log Stream
- Props: optional `fixtureId` to filter events

**`EventTimeline.tsx`** — New component
- Timeline view of events (goals, cards, VAR, subs)
- Group by minute, visual timeline
- Reusable for match detail views

**`OddsDisplay.tsx`** — New component
- Display live odds from `useOdds`
- Visual: home/draw/away with color coding
- Loading skeleton

**`EmptyState.tsx`** — New component
- Friendly illustration + message when no fixtures
- Props: `message`, `actionButton` (optional)

**`LoadingSkeleton.tsx`** — New component
- Skeleton loaders matching card/feed shapes
- Shimmer animation

### 4. Integration Updates

- `goalchain_webapp/src/ui/App.tsx`: Replace `EstadioPortal` import with `StadiumPortal` from `features/stadium`
- Delete legacy files: `EstadioPortal.tsx`, `FixturesPanel.tsx`, `LiveEventFeed.tsx` from `src/ui/`
- Update any other imports (check `DashboardGrid`, `PlayLayout` if they reference these)

### 5. Styling & Consistency

- Use existing CSS classes: `play-page`, `play-page--portal`, `glass-card`, `portal-header`, `portal-tabs`, `portal-tab-btn`, `portal-tab-btn--active`, `portal-content-wrapper`, `portal-fade-in`
- Maintain exact visual parity with current EstadioPortal
- Use `useTranslation` for all user-facing strings (add new keys to `translations.ts` + locale JSONs as needed)
- Glassmorphic design system consistent with rest of webapp

---

## Verification Commands (Must Pass)

```bash
cd /home/ubuntu/hermes/workspace/GoalChain/goalchain_webapp
npm run typecheck
npm run lint
npm run build
```

---

## Acceptance Criteria

- [ ] All 9 components + 5 hooks + types.ts + index.ts created under `features/stadium/`
- [ ] Legacy files deleted from `src/ui/`
- [ ] App.tsx imports updated, `/estadio` route works identically
- [ ] TypeScript strict mode passes (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Components are reusable (no hardcoded dependencies on specific parents)
- [ ] i18n keys added for any new user-facing strings
- [ ] Visual parity verified (manual check)

---

## Skill Hints

- Follow gstack plan-eng-review before coding
- Apply frontend-design skill for webapp tasks (no generic AI UI)

---

## Owner & Priority

- **Owner:** opencode (FCC)
- **Priority:** P0 (webapp refactor for stadium feature)
- **Branch:** exp/opencode-issue-507

---

## Risk Mitigation

- Work in a fresh branch, don't touch main
- Keep legacy files until new ones are verified
- Test each hook independently
- Ensure wallet adapter context works in new hook signatures

---

## Blocker

**GitHub CLI authentication failing** — token stored in config files is truncated (`gho_Pw...GjEm`). Cannot create the FCC tracking issue via `create-task.sh`. The GitHub issue #507 already exists with `agent:opencode` label and may be picked up by FCC directly. If not, a valid GH_TOKEN is needed to create the FCC task issue.

---

## Reference Files (Current State)

<details>
<summary>EstadioPortal.tsx (58 lines)</summary>

```tsx
import React, { useState } from 'react';
import { FixturesPanel } from './FixturesPanel';
import { AICommentator } from './AICommentator';
import { LiveEventFeed } from './LiveEventFeed';

export function EstadioPortal() {
  const [activeSubTab, setActiveSubTab] = useState<'fixtures' | 'commentator' | 'feed'>('fixtures');
  // ... tabs config + render
}
```

</details>

<details>
<summary>FixturesPanel.tsx (418 lines)</summary>

```tsx
// Key logic to extract:
// - fetchFixtures + fetchUserBets (lines 46-63)
// - bet/claim/refund handlers (lines 78-152)
// - filter state + filteredFixtures (lines 38, 156-160)
// - MatchCard inline render (lines 254-392)
// - Toast system (lines 18-44, 165-208)
```

</details>

<details>
<summary>LiveEventFeed.tsx (141 lines)</summary>

```tsx
// Key logic to extract:
// - Polling fetchFixtures every 15s (lines 19-50)
// - Transform fixtures → Event[] (lines 23-34)
// - Oracle log stream (lines 52-69)
// - Render events + logs (lines 71-140)
```

</details>

<details>
<summary>App.tsx imports (lines 13, 68, 130)</summary>

```tsx
import { EstadioPortal } from './EstadioPortal';
// ...
<Route path="/estadio" element={<PlayPage ...><EstadioPortal /></PlayPage>} />
```

</details>

---

## Next Steps

1. Resolve GitHub auth (get valid GH_TOKEN)
2. Run `bash /home/ubuntu/hermes/scripts/create-task.sh opencode P0 "[P0] EstadioPortal → features/stadium (9 comps + 5 hooks)" "<this prompt>"`
3. FCC picks up, creates `exp/opencode-issue-507` branch, implements
4. FCC opens draft PR
5. Antigravity/Nico review → merge