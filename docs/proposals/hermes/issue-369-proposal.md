# OA Proposal — Issue #369

## Title
[OPENCODE] [OPENCODE] Webapp: Decompose ClubPortal -> features/club (5 components + 3 hooks)

## Source
GitHub issue #369

## Objective
## Objective
## Objective
Decompose monolithic ClubPortal.tsx (113 lines) into modular feature architecture.

## Scope
Create goalchain_webapp/src/features/club-portal/:

### Components:
1. ClubHeader.tsx — Badge "CLUB PORTAL", SimulationBadge, title "My Club & Manager", honesty note, subtitle
2. ClubTabs.tsx — 4 tabs: Squad (Mi Plantilla), Market (Mercado Fichajes), Coach (Asistente IA), Profile (Perfil Manager)
3. TabContent.tsx — Lazy-loaded tab panels with Suspense fallback
4. ProfileGate.tsx — hasAccount check -> UserProfile OR registration wrapper (promo + CreateUser)
5. RegistrationPromo.tsx — Join CTA, CreateUser form

### Hooks:
1. useAccount.ts — localStorage check for goalchain_user, username, storage event listener
2. useTabState.ts — activeSubTab state, setter, tab config
3. useProfile.ts — hasAccount, username, refresh on storage event

### Shared:
- src/features/club-portal/types.ts — TabConfig, UserAccount
- src/features/club-portal/index.ts — Barrel export

### Migration:
- Original ClubPortal.tsx -> thin wrapper
- Spanish strings -> i18n keys (honesty note, subtitle, tabs, registration promo)
- Inline styles -> design tokens (glass-card, portal-tabs, portal-tab-btn)
- Lazy loading preserved for sub-components

## Acceptance Criteria
- Feature module builds independently
- Wrapper maintains identical UX
- All 6 Spanish strings replaced with i18n
- Account detection + storage sync works
- Lazy loading works for Squad/Market/Coach/Profile
- Build passes

## Skill Hint
Apply frontend-design skill. Follow gstack plan-eng-review.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-369` and close draft PR.
