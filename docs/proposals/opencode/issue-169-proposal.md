# OA Proposal — Issue #169

## Title
[OPENCODE] [DRAFT] Completar PR #33 - Video alerts (flags off)

## Source
GitHub issue #169

## Objective
## Objective
Completar y dejar listo para merge el PR #33 (Video alerts con flags off). Revisar rama, verificar funcionamiento con flags OFF, resolver revisiones y aplicar gstack review pass. META: Stack bloqueante #32 → #33 → #34.

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
- Rollback: revert main commit linked to issue #169
