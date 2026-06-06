# OA Proposal — Issue #347

## Title
[OPENCODE] Webapp: Compose page routes (Dashboard, Play, Stadium, Club, DeFi, NFTs, Squad, Ops, Profile, Onboarding)

## Source
GitHub issue #347

## Objective
## Objective
Compose all page routes in goalchain_webapp/src/pages/ using feature modules:

## Scope
Create `src/pages/` with page components that compose feature modules:

1. `Dashboard.tsx` - Hero stats, alpha cards, vault summary, recent activity, quick actions
2. `Play.tsx` - Tabs: Manual Trading (features/trading), Vibe Bots, Coach (features/coach), Commentator (features/commentator)
3. `Stadium.tsx` - features/stadium.EstadioPortal
4. `Club.tsx` - features/club.ClubPortal
5. `DeFi.tsx` - features/defi.DeFiPortal
6. `NFTs.tsx` - features/nft.NFTMarketplace
7. `Squad.tsx` - features/squad.SquadGallery
8. `Ops.tsx` - features/ops.OpsPortal
9. `Profile.tsx` - features/profile.Profile
10. `Onboarding.tsx` - features/onboarding.OnboardingFlow (guarded)

**Router Integration:**
11. `AppRoutes.tsx` - Route definitions, auth guards, onboarding guard, layouts
12. `routeGuards.ts` - requireAuth, requireOnboarding, requireClubRole
13. `index.ts` - Barrel export

## Acceptance Criteria
- Each page < 150 lines (just composition)
- All imports from feature barrels only
- React Router v6 lazy loading (Suspense + ErrorBoundary)
- Mobile: all pages work in single column
- Onboarding gate redirects incomplete users

## Skill Hint
Apply frontend-design skill (no generic AI UI).

## Owner
opencode

## Priority
P0

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #347
