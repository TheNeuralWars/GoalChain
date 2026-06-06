# OA Proposal — Issue #339

## Title
[OPENCODE] Webapp: Decompose SquadGallery → features/squad (6 components + 3 hooks)

## Source
GitHub issue #339

## Objective
## Objective
Decompose SquadGallery into features/squad/:

## Scope
Create `src/features/squad/` with:

**Components:**
1. `PlayerCard.tsx` - Image, name, rarity badge, stats, synergy indicators, click → modal
2. `PlayerGrid.tsx` - Responsive grid (5 cols → 1 col), virtualized for 50+ players
3. `FilterBar.tsx` - Search, rarity filter, country filter, club filter, sort select
4. `RarityBadge.tsx` - Gold/Silver/Bronze variants with shimmer animation
5. `StatsPanel.tsx` - ATK/DEF/SPD/HYP bars, stamina, yield multiplier
6. `SynergyIndicator.tsx` - Country/club progress rings, bonus percentages

**Hooks:**
7. `usePlayers.ts` - Fetch players.json, filter/sort memoization
8. `useFilters.ts` - Filter state, URL sync, persistence
9. `useSynergy.ts` - Calculate country/club synergy bonuses

**Composition:**
10. `types.ts` - Player, Rarity, Stats, Synergy, FilterState
11. `constants.ts` - Rarity colors, stat labels (ENGLISH ONLY)
12. `index.ts` - Barrel export
13. `SquadGallery.tsx` - Composed page component

## Acceptance Criteria
- Each file < 200 lines
- Virtualized grid (react-window) for performance
- Filter URL sync for shareable links
- Rarity badge animations (gold shimmer)
- Mobile: single column, bottom sheet filters

## Skill Hint
Apply frontend-design skill (no generic AI UI).

## Owner
opencode

## Priority
P0

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #339
