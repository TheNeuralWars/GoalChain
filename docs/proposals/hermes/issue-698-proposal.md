# OA Proposal — Issue #698

## Title
[OPENCODE] [GROWTH-TASK-2] English Localization of Webapp UI (Campaign-Product Mismatch)

## Source
GitHub issue #698

## Objective
## Objective
English localization of webapp UI - campaign is English but webapp is fully Spanish.

## Scope
1. Wire goalchain_webapp to consume existing i18n_reference.js from docs/assets/js/i18n.js (has complete en block at line 507)
2. Add EN | ES toggle to App.tsx persisted in localStorage
3. Ship English version first (active campaign language)

## Acceptance Criteria
- All Spanish strings in NFTMarketplace.tsx, DashboardGrid.tsx, DashboardHub.tsx, AICoach.tsx, AICommentator.tsx, ClassicHub.tsx, ClubPortal.tsx, CreateUser.tsx, EstadioPortal.tsx, SwarmVaults.tsx replaced with i18n
- EN/ES toggle in App.tsx persisted in localStorage
- English is default language
- TypeScript build passes

## Skill Hint
Apply frontend-design skill. Follow gstack review pass before opening draft PR.

## Owner
opencode

## Priority
P0

## Context
Growth Task 2. Campaign is English but webapp is fully Spanish. 6+ hardcoded Spanish strings in NFTMarketplace.tsx alone.

## Required Output
- Proposed file list
- Risks/regressions + rollback
- Exact test commands

## Workflow
- One implementer only
- Branch naming: exp/opencode-issue-XXX
- Draft PR for Antigravity/Nico review

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-698` and close draft PR.
