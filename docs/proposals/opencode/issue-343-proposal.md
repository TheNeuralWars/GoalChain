# OA Proposal — Issue #343

## Title
[OPENCODE] Webapp: Decompose ClubPortal → features/club (5 components + 3 hooks)

## Source
GitHub issue #343

## Objective
## Objective
Decompose ClubPortal into features/club/:

## Scope
Create `src/features/club/` with:

**Components:**
1. `ClubOverview.tsx` - Name, logo, stadium, league, treasury, member count
2. `TreasuryPanel.tsx` - Balance, income/expense, transactions, multisig actions
3. `RosterManager.tsx` - Starters/bench, drag-drop formation, synergy display
4. `JerseySelector.tsx` - Jersey gallery, equip/unequip, synergy preview
5. `StadiumUpgrade.tsx` - Upgrade tree, costs, benefits, queue

**Hooks:**
6. `useClub.ts` - Club data, permissions, settings
7. `useTreasury.ts` - Treasury operations, multi-sig workflow
8. `useRoster.ts` - Roster state, formation validation, synergy calc

**Composition:**
9. `types.ts` - Club, Treasury, RosterSlot, Jersey, StadiumLevel
10. `constants.ts` - Formation templates, upgrade costs (ENGLISH ONLY)
11. `index.ts` - Barrel export
12. `ClubPortal.tsx` - Composed page component

## Acceptance Criteria
- Each file < 200 lines
- Drag-drop roster (dnd-kit)
- Multi-sig treasury actions
- Mobile: tabs for overview/roster/treasury/stadium

## Skill Hint
Apply frontend-design skill (no generic AI UI).

## Owner
opencode

## Priority
P0

## Context

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #343
