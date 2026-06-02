# OA Proposal — Issue #263

## Title
[ANTIGRAVITY] Finish all OpenCode issues (deliverables) — Antigravity hands-free

## Source
GitHub issue #263

## Objective
## Objective
**Sí conviene terminar el trabajo de los issues antes de un merge masivo a ciegas.** Hands-free: auditar cada issue `status:done` + `agent:opencode`, completar lo que falte, dejar cada issue con **PR lista para merge** (o merged), luego integrar a `main` en orden seguro.

---
**Canonical specification file:** [2026-05-27-finish-all-opencode-issues-antigravity.md](file:///home/goalchain/hermes/workspace/GoalChain/docs/intake/2026-05-27-finish-all-opencode-issues-antigravity.md)
Please execute the implementation following the steps outlined in this intake brief.

## Owner
antigravity

## Priority
P1

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
- Rollback: revert main commit linked to issue #263
