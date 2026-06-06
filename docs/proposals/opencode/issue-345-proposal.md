# OA Proposal — Issue #345

## Title
[OPENCODE] Webapp: Decompose Profile → features/profile (5 components + 3 hooks)

## Source
GitHub issue #345

## Objective
## Objective
Decompose Profile into features/profile/:

## Scope
Create `src/features/profile/` with:

**Components:**
1. `ProfileHeader.tsx` - Avatar, username, wallet, tier badge, stats summary
2. `StatsDashboard.tsx` - PnL, Win Rate, Volume, Yield, Best Trade, Streak
3. `ActivityFeed.tsx` - Paginated transactions (Trade, Bet, Mint, Stake, Claim)
4. `AchievementsGrid.tsx` - Badge grid, progress rings, locked/unlocked states
5. `SettingsPanel.tsx` - Tabs: General, Notifications, Security, Display, Danger Zone

**Hooks:**
6. `useProfile.ts` - User data, tier calculation, avatar
7. `useActivity.ts` - Transaction history, filters, pagination
8. `useAchievements.ts` - Achievement definitions, progress, unlock logic

**Composition:**
9. `types.ts` - UserProfile, Stats, ActivityItem, Achievement, Settings
10. `constants.ts` - Tier thresholds, achievement definitions (ENGLISH ONLY)
11. `index.ts` - Barrel export
12. `Profile.tsx` - Composed page component

## English-Only Enforcement
- "PRO", "ELITE", "LEGEND", "ARCHITECT" tiers
- "TOTAL PNL", "WIN RATE", "VOLUME", "YIELD EARNED"
- "BEST TRADE", "CURRENT STREAK"
- "ACHIEVEMENTS UNLOCKED", "PROGRESS"

## Acceptance Criteria
- Each file < 200 lines
- Activity feed infinite scroll
- Achievement progress animated
- Mobile: stacked sections, settings in modal

## Skill Hint
Apply frontend-design skill (no generic AI UI).

## Owner

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #345
