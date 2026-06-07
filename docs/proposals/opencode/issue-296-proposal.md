# OA Proposal — Issue #296

## Title
[OPENCODE] Task 2 - English Localization of Webapp UI (Campaign ↔ Product Mismatch)

## Source
GitHub issue #296

## Objective
## Objective
Commit `93558e18` explicitly states "launch Degen Preseason campaign, update X/Discord links to English" — but the webapp itself remains fully Spanish. `goalchain_webapp/src/ui/NFTMarketplace.tsx` alone ships 6 hardcoded Spanish strings (`"COMPRAR EN CASH"`, `"COMPRAR CON SOL"`, `"PROCESANDO..."`, `"No hay cartas listadas..."`, `"¡ÉXITO! Has adquirido..."`, `"La transacción fue cancelada o falló."`). `DashboardGrid.tsx`, `DashboardHub.tsx`, `AICoach.tsx`, `AICommentator.tsx`, `ClassicHub.tsx`, `ClubPortal.tsx`, `CreateUser.tsx`, `EstadioPortal.tsx`, `SwarmVaults.tsx` all show the same pattern. English-speaking users clicking the X/Discord campaign link bounce immediately on a Spanish UI. Action: (1) wire `goalchain_webapp` to consume the existing `i18n_reference.js` strings already defined in `docs/assets/js/i18n.js` (which has a complete `en` block at line 507), (2) add an `EN | ES` toggle to `App.tsx` persisted in `localStorage`, (3) ship the English version first since that is the active campaign language.

---
**Canonical specification file:** [2026-06-04-growth-task-2-english-localization-of-webapp-ui-campaign-product-mismatch-.md](file:///home/ubuntu/hermes/workspace/GoalChain/docs/intake/2026-06-04-growth-task-2-english-localization-of-webapp-ui-campaign-product-mismatch-.md)
Please execute the implementation following the steps outlined in this intake brief.

## Owner
opencode

## Priority
P0

## Context
Requested by Nico via Manager (hermes-ceo profile). Keep scope tight and aligned with GoalChain orchestration rules.

## Required output
- Proposed file list
- Risks/regressions + rollback
- Exact test commands

## Workflow
- One implementer only
- Branch naming:
  - cursor: `feat/*` or `fix/*`
  - antigravity: `exp/antigravity-*`
  - opencode: `exp/opencode-*`
  - grok: `exp/grok-*`
- Draft PR for Antigravity/Nico review — no direct merge to `main` unless `cambio urgente`

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-296` and close draft PR.
