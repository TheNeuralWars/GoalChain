# OA Proposal — Issue #371

## Title
[OPENCODE] [OPENCODE] Webapp: Compose page routes (Dashboard, Play, Stadium, Club, DeFi, NFTs, Squad, Ops, Profile, Onboarding)

## Source
GitHub issue #371

## Objective
## Objective
## Objective
Compose all page routes using modular feature components and layout shell.

## Scope
Update goalchain_webapp/src/:

### Routes to Compose (App.tsx):
1. **Dashboard** ("/") — DashboardGrid with: EconomyConfigBanner, XScout panel, Wallet connect, Quick actions
2. **Play** ("/play") — PlayLayout + PlayNav, child routes:
   - /play/inicio — DashboardHub (existing)
   - /play/estadio — EstadioPortal (feature wrapper)
   - /play/defi — DeFiPortal (feature wrapper)
   - /play/club — ClubPortal (feature wrapper)
   - /play/ops — OpsPortal (existing AlphaPanel + new OpsStatusPanel)
3. **Stadium** ("/stadium") — Alias to /play/estadio
4. **Club** ("/club") — Alias to /play/club
5. **DeFi** ("/defi") — Alias to /play/defi
6. **NFTs** ("/nfts") — NFTMarketplace standalone + SquadGallery
7. **Squad** ("/squad") — SquadGallery standalone
8. **Ops** ("/ops") — OpsStatusPanel + AlphaPanel
9. **Profile** ("/profile") — UserProfile + CreateUser
10. **Onboarding** ("/onboarding") — OnboardingFlow (new, #346)

### Navigation:
- Update PlayNav.tsx tabs to match routes
- Sidebar (desktop) + PlayNav (mobile) consistent
- Active route highlighting

### Router Setup:
- React Router v6
- Nested routes for /play/*
- Lazy load feature modules
- Error boundary per route

### Migration:
- Remove direct imports from src/ui/ in favor of feature indexes
- Update all imports in App.tsx, main.tsx
- Delete legacy src/ui/ files after verification

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-371` and close draft PR.
